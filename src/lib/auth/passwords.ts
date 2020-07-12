import * as crypto from 'crypto';
import Config from '../../config';


export function checkPassword(password: string, encoded: string, salt: string = null): boolean {
  return makePassword(password, salt) === encoded;
}

export function makePassword(password: string, salt: string = null): string {
  const config = Config.getInstance();
  if (salt === null) {
    salt = config.secretKey;
  }
  const hashed = crypto.pbkdf2Sync(
    password, salt, config.authHashIterations, 64, 'sha512'
  );
  return hashed.toString('hex');
}
