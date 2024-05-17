export class WebNiceCryptoTokenRepositoryDto {
  private readonly _siteCode: string;
  private readonly _tokenVal: string;
  private readonly _tokenVersionId: string;

  private constructor({
    siteCode,
    tokenVal,
    tokenVersionId,
  }: {
    siteCode: string;
    tokenVal: string;
    tokenVersionId: string;
  }) {
    this._siteCode = siteCode;
    this._tokenVal = tokenVal;
    this._tokenVersionId = tokenVersionId;
  }

  static of({
    siteCode,
    tokenVal,
    tokenVersionId,
  }: {
    siteCode: string;
    tokenVal: string;
    tokenVersionId: string;
  }) {
    return new WebNiceCryptoTokenRepositoryDto({
      siteCode,
      tokenVal,
      tokenVersionId,
    });
  }

  get siteCode() {
    return this._siteCode;
  }

  get tokenVal() {
    return this._tokenVal;
  }

  get tokenVersionId() {
    return this._tokenVersionId;
  }
}
