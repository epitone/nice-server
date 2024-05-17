import { WebNiceCryptoTokenRepositoryDto } from './dto/NiceApiRepositoryDto';

export interface NiceApiRepository {
  getNiceAccessToken();
  getNiceCryptoToken(
    reqDtim: string,
    currentTimestamp: number,
    reqNo: string,
  ): Promise<WebNiceCryptoTokenRepositoryDto>;
}
