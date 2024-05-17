export class DecryptDataDto {
  public responseno: string;
  public birthdate: string;
  public gender: string;
  public receivedata: string;
  public di: string;
  public mobileno: string;
  public requestno: string;
  public nationalinfo: string;
  public authtype: string;
  public sitecode: string;
  public utf8_name: string;
  public enctime: string;
  public name: string;
  public resultcode: string;
}

export class NiceCallbackApiReqQueryDto {
  enc_data: string;
  integrity_value: string;
  token_version_id: string;
}
