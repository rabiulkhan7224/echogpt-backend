import * as bcrypt from 'bcrypt';
const ROUNDS = 12;

export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, ROUNDS);

export const comparePassword = (
  plain: string,
  hash: string,
): Promise<boolean> => bcrypt.compare(plain, hash);

export const hashToken = (token: string): string =>
  require('crypto').createHash('sha256').update(token).digest('hex');
