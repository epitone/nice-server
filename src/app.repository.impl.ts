import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { NiceApiRepository } from './app.repository';
import { WebNiceCryptoTokenRepositoryDto } from './dto/NiceApiRepositoryDto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppRepository implements NiceApiRepository {
  constructor(private configService: ConfigService) {}

  async getNiceCryptoToken(
    reqDtim: string,
    currentTimestamp: number,
    reqNo: string,
  ): Promise<WebNiceCryptoTokenRepositoryDto> {
    const accessToken = this.configService.get<string>('NICE_ACCESS_TOKEN');
    const clientId = this.configService.get<string>('NICE_CLIENT_ID');
    const productId = this.configService.get<string>('NICE_PRODUCT_ID');

    const authorization = Buffer.from(
      accessToken + ':' + currentTimestamp + ':' + clientId,
    ).toString('base64');

    const response = await axios({
      method: 'POST',
      url: 'https://svc.niceapi.co.kr:22001/digital/niceid/api/v1.0/common/crypto/token',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${authorization}`,
        client_id: clientId,
        productID: productId,
      },
      data: {
        dataHeader: {
          CNTY_CD: 'ko', // 이용언어 : ko, en, cn
        },
        dataBody: {
          req_dtim: reqDtim, // 요청일시
          req_no: reqNo, // 요청고유번호
          enc_mode: '1', // 사용할 암복호화 구분 1 : AES128/CBC/PKCS7
        },
      },
    });
    const resData = response.data;

    // 사이트 코드, 서버 토큰 값, 서버 토큰 버전 반환
    return WebNiceCryptoTokenRepositoryDto.of({
      siteCode: resData.dataBody.site_code,
      tokenVal: resData.dataBody.token_val,
      tokenVersionId: resData.dataBody.token_version_id,
    });
  }

  async getNiceAccessToken() {
    try {
      const clientId = this.configService.get<string>('NICE_CLIENT_ID');
      const clientSecret = this.configService.get<string>('NICE_CLIENT_SECRET');
      const authorization = Buffer.from(clientId + ':' + clientSecret).toString(
        'base64',
      );
      const dataBody = {
        scope: 'default',
        grant_type: 'client_credentials',
      };

      const response = await axios({
        method: 'POST',
        url: 'https://svc.niceapi.co.kr:22001/digital/niceid/oauth/oauth/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${authorization}`,
        },
        data: dataBody,
      });
      const token = response.data.dataBody.access_token;
      return token;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
