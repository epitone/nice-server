import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import {
  NiceCryptoTokenApiReqQueryDto,
  NiceCryptoTokenApiRes,
} from './dto/NiceCryptoTokenApiDto';
import { NiceCallbackApiReqQueryDto } from './dto/NiceCallbackApiDto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/token')
  async encryptData(): Promise<any> {
    const data = await this.appService.getNiceAccessToken();
    return data;
  }

  @Get('/crypto/token')
  async getCryptoToken(
    @Query() queryDto: NiceCryptoTokenApiReqQueryDto,
  ): Promise<NiceCryptoTokenApiRes> {
    console.log(queryDto);
    const data = await this.appService.getNiceCryptoToken(queryDto.returnUrl);
    return data;
  }

  @Get('/callback')
  async getCallback(
    @Query() queryDto: NiceCallbackApiReqQueryDto,
  ): Promise<string> {
    const data = await this.appService.getCallback(queryDto);
    return data;
  }
}
