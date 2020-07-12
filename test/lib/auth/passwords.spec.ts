import Config from '../../../src/config';
import { makePassword, checkPassword } from '../../../src/lib/auth/passwords';
import assume from 'assume';
import mockedEnv from 'mocked-env';

describe('Passwords', () => {
  let config: Config, restore;
  /**
   * This is the result of a call to pbkdf2Sync with:
   *   password: super_secret_password
   *   salt: this_is_my_salt
   *   iterations: 100,000
   *   key length: 64
   *   digest algorithm: sha512
   */
  const saltedPassword = '5e9fcfd9910423912540cda961793794dca41c926cbd6e577b43a2b80cb81978ab880a17ff50711eff7b0718457692c72d4c5f713d073e16ad9a99ab3bde0ef6',
    /**
     * This is the result of a call to pbkdf2Sync with:
     *   password: super_secret_password
     *   salt: foobar
     *   iterations: 100,000
     *   key length: 64
     *   digest algorithm: sha512
     */
    configPassword = 'e03adccfbb7e566092830e1a9973848a1cdd10acc50948d48677a6572c86f35e8fefe9b4a586b6d17ef15c4cfcfcd6d357bac1e844d95f4807c05b8e6e6f43c0';

  before(() => {
    restore = mockedEnv({
      AUTH_HASH_ITERATIONS: '100000',
      SECRET_KEY: 'foobar'
    });
    config = Config.getInstance();
    config.loadConfig();
  });

  it('are generated with specified salt', () => {
    const actual = makePassword('super_secret_password', 'this_is_my_salt');
    assume(actual).equals(saltedPassword);
  });

  it('are checked against the specified salt', () => {
    assume(
      checkPassword(
        'super_secret_password', saltedPassword, 'this_is_my_salt'
      )
    ).is.true();
  });

  it('are generated with the configured salt if not specified', () => {
    const actual = makePassword('super_secret_password');
    assume(actual).equals(configPassword);
  });

  it('are checked against the configured salt if not specified', () => {
    assume(checkPassword('super_secret_password', configPassword)).is.true();
  });

  after(() => {
    restore();
  });
});
