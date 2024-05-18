import { Controller, Get, Query, Session } from '@nestjs/common';
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
    @Session() session: Record<string, any>,
  ): Promise<NiceCryptoTokenApiRes> {
    const data = await this.appService.getNiceCryptoToken(
      queryDto.returnUrl,
      session,
    );
    return data;
  }

  @Get('/callback')
  async getCallback(
    @Query() queryDto: NiceCallbackApiReqQueryDto,
    @Session() session: Record<string, any>,
  ): Promise<string> {
    const data = await this.appService.getCallback(queryDto, session);
    return data;
  }
}
