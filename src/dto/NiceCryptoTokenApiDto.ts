export class NiceCryptoTokenApiReqQueryDto {
  returnUrl: string;
}

export class NiceCryptoTokenApiRes {
  private readonly _tokenVersionId: string;
  private readonly _encData: string;
  private readonly _integrityValue: string;

  private constructor(
    tokenVersionId: string,
    encData: string,
    integrityValue: string,
  ) {
    this._tokenVersionId = tokenVersionId;
    this._encData = encData;
    this._integrityValue = integrityValue;
  }

  static of(tokenVersionId: string, encData: string, integrityValue: string) {
    return new NiceCryptoTokenApiRes(tokenVersionId, encData, integrityValue);
  }

  get tokenVersionId() {
    return this._tokenVersionId;
  }

  get encData() {
    return this._encData;
  }

  get integrityValue() {
    return this._integrityValue;
  }
}
