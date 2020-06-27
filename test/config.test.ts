import assume from 'assume';
import mockedEnv from 'mocked-env';
import Config from '../src/config';

describe('Config', () => {
  let config: Config;

  before(() => {
    config = Config.getInstance();
  });

  it('is a singleton', () => {
    const config2 = Config.getInstance();
    assume(config).equals(config2);
  });

  it('loads environment variables on loadConfig', () => {
    let restore = mockedEnv({
      FACET_MUD_ADDRESS: '42.42.42.42',
      FACET_MUD_PORT: '4242'
    });
    config.loadConfig();
    assume(config.server_address).equals('42.42.42.42');
    assume(config.server_port).equals(4242);
    restore();
  });
});
