import cryptojs from 'crypto-js';

export default class CommonUtilis {
    private secretkey?: string;

    constructor() {
      this.secretkey = process.env.SECRET_KEY;

    }

    public encryptData(data: string) {
        if (!this.secretkey) {
          throw new Error("SECRET_KEY is not defined in environment variables");
        }

        return cryptojs.AES.encrypt(data, this.secretkey).toString();
    }

    public decryptData(encryptedData: string) {
        if (!this.secretkey) {
          return encryptedData;
        }

        const bytes = cryptojs.AES.decrypt(encryptedData, this.secretkey);
        const decryptedData = bytes.toString(cryptojs.enc.Utf8);
        return decryptedData || encryptedData;
    }
}
