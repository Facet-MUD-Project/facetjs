import assume from 'assume';
import mockedEnv from 'mocked-env';
import Config from '../src/config';

describe('Config', function () {
  let config: Config;

  before(function () {
    config = Config.getInstance();
  });

  it('is a singleton', function () {
    const config2 = Config.getInstance();
    assume(config).equals(config2);
  });

  it('loads environment variables on loadConfig', function () {
    const restore = mockedEnv({
      FACET_MUD_ADDRESS: '42.42.42.42',
      FACET_MUD_PORT: '4242'
    });
    config.loadConfig();
    assume(config.serverAddress).equals('42.42.42.42');
    assume(config.serverPort).equals(4242);
    restore();
  });
});
