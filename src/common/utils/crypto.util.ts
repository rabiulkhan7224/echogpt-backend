import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
const ALGO = 'aes-256-gcm';
const IV_LEN = 12;

export interface EncryptedPayload {
  encrypted: string;
  iv: string;
  tag: string;
}

export class CryptoUtil {
  constructor(private readonly keyHex: string) {
    if (!/^[0-9a-fA-F]{64}$/.test(keyHex)) {
      throw new Error('ENCRYPTION_KEY must be 32-byte hex (64 chars)');
    }
  }

  private get key(): Buffer {
    return Buffer.from(this.keyHex, 'hex');
  }

  encrypt(plain: string): EncryptedPayload {
    const iv = randomBytes(IV_LEN);
    const cipher = createCipheriv(ALGO, this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plain, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return {
      encrypted: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
    };
  }

  decrypt(payload: EncryptedPayload): string {
    const decipher = createDecipheriv(
      ALGO,
      this.key,
      Buffer.from(payload.iv, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(payload.encrypted, 'base64')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }

  mask(plain: string): string {
    if (plain.length <= 8) return '****';
    return `${plain.slice(0, 4)}****${plain.slice(-4)}`;
  }
}
