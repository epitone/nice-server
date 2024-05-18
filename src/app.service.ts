import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  DecryptDataDto,
  NiceCallbackApiReqQueryDto,
} from './dto/NiceCallbackApiDto';
import uuid4 from 'uuid4';
import crypto from 'crypto';
import iconv from 'iconv-lite';
import { NiceCryptoTokenApiRes } from './dto/NiceCryptoTokenApiDto';
import { NiceApiRepository } from './app.repository';

@Injectable()
export class AppService {
  constructor(
    @Inject('niceApiRepository')
    private readonly appRepository: NiceApiRepository,
  ) {}

  async getNiceAccessToken() {
    try {
      const data = await this.appRepository.getNiceAccessToken();
      return data;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getNiceCryptoToken(returnUrl: string, session: Record<string, any>) {
    try {
      // 1. 암호화 토큰 요청
      const nowDate = new Date();
      // 요청일시(YYYYMMDDHH24MISS)
      const reqDtim = this.formatDate(nowDate);
      // 요청시간(초)
      const currentTimestamp = Math.floor(nowDate.getTime() / 1000);
      // 요청고유번호(30자리)

      const reqNo: string = uuid4().substring(0, 30);

      const cryptoTokenData = await this.appRepository.getNiceCryptoToken(
        reqDtim,
        currentTimestamp,
        reqNo,
      );

      // 2. 대칭키 생성
      const { key, iv, hmacKey } = this.generateSymmetricKey(
        reqDtim,
        reqNo,
        cryptoTokenData.tokenVal,
      );

      // 대칭키 세션 저장
      session.nice_key = {
        key: key,
        iv: iv,
      };

      console.log(session);
      // 3-1. 요청 데이터 암호화
      const requestno = reqNo; // 서비스 요청 고유 번호(*)
      const returnurl = returnUrl; // 인증결과를 받을 url(*)
      const sitecode = cryptoTokenData.siteCode; // 암호화토큰요청 API 응답 site_code(*)
      const authtype = ''; // 인증수단 고정(M:휴대폰인증,C:카드본인확인인증,X:인증서인증,U:공동인증서인증,F:금융인증서인증,S:PASS인증서인증)
      const mobileco = ''; // 이통사 우선 선택
      const bussinessno = ''; // 사업자번호(법인인증인증에 한함)
      const methodtype = 'get'; // 결과 url 전달 시 http method 타입
      const popupyn = 'Y'; //
      const receivedata = ''; // 인증 후 전달받을 데이터 세팅

      const reqData = {
        requestno: requestno,
        returnurl: returnurl,
        sitecode: sitecode,
        authtype: authtype,
        methodtype: methodtype,
        popupyn: popupyn,
        receivedata: receivedata,
      };

      const encData = this.encryptData(reqData, key, iv);

      // 3-2. Hmac 무결성 체크 값 생성
      const integrityValue = this.hmac256(encData, hmacKey);
      return NiceCryptoTokenApiRes.of(
        cryptoTokenData.tokenVersionId,
        encData,
        integrityValue,
      );
    } catch (error) {
      console.log(error);
    }
  }

  async getCallback(
    queryDto: NiceCallbackApiReqQueryDto,
    session: Record<string, any>,
  ): Promise<any> {
    try {
      const { key, iv }: { key: string; iv: string } = session.nice_key;
      const decData = this.decryptData(queryDto.enc_data, key, iv);
      return decData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  private formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const formattedDateTime = `${year}${month}${day}${hours}${minutes}${seconds}`;
    return formattedDateTime;
  }

  private generateSymmetricKey(
    reqDtim: string,
    reqNo: string,
    tokenVal: string,
  ) {
    const value = reqDtim.trim() + reqNo.trim() + tokenVal.trim();

    // SHA256 암호화 후 Base64 encoding
    const hash = crypto.createHash('sha256').update(value).digest('base64');

    return {
      key: hash.slice(0, 16), // 앞에서부터 16byte
      iv: hash.slice(-16), // 뒤에서부터 16byte
      hmacKey: hash.slice(0, 32), // 앞에서부터 32byte
    };
  }

  private encryptData(data, key, iv) {
    if (!data || !key || !iv) {
      throw new NotFoundException('Empty parameter');
    }

    const strData = JSON.stringify(data).trim();

    // AES128/CBC/PKCS7 암호화
    const cipher = crypto.createCipheriv(
      'aes-128-cbc',
      Buffer.from(key),
      Buffer.from(iv),
    );
    let encrypted = cipher.update(strData, 'utf-8', 'base64');
    encrypted += cipher.final('base64');

    return encrypted;
  }

  private hmac256(data, hmacKey) {
    if (!data || !hmacKey) {
      throw new NotFoundException('Empty parameter');
    }

    const hmac = crypto.createHmac('sha256', Buffer.from(hmacKey));
    hmac.update(Buffer.from(data));

    const integrityValue = hmac.digest().toString('base64');

    return integrityValue;
  }

  private decryptData(data: string, key: string, iv: string): DecryptDataDto {
    if (!data || !key || !iv) {
      throw new NotFoundException('Empty parameter');
    }

    const decipher = crypto.createDecipheriv(
      'aes-128-cbc',
      Buffer.from(key),
      Buffer.from(iv),
    );
    let decrypted = decipher.update(data, 'base64', 'binary');
    decrypted += decipher.final('binary');

    // 'binary'에서 'euc-kr'로 디코딩
    decrypted = iconv.decode(Buffer.from(decrypted, 'binary'), 'euc-kr');

    return JSON.parse(decrypted);
  }
}
