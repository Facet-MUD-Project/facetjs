import * as crypto from 'crypto';
import Config from '../../config';


export function checkPassword(password: string, encoded: string, salt: string = null): boolean {
  return makePassword(password, salt) === encoded;
}

export function makePassword(password: string, salt: string = null) {
  const config = Config.getInstance();
  if (salt === null) {
    salt = config.secret_key;
  }
  const hashed = crypto.pbkdf2Sync(
    password, salt, config.auth_hash_iterations, 64, 'sha512'
  );
  return hashed.toString('hex');
}
