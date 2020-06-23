import Config from "../../../src/config";
import Player from "../../../src/lib/base/player";
import Login from "../../../src/lib/auth/login";
import assume from "assume";
import mockedEnv from 'mocked-env';

describe('Login', () => {
  let config, logind, player, restore;

  before(() => {
    restore = mockedEnv({
      FACET_SAVE_DIR: './test/fixtures/save',
      FACET_PLAYER_SAVE_DIR: './test/fixtures/save/players'
    });
    config = Config.getInstance();
    config.loadConfig();
    logind = Login.getInstance();
  });

  beforeEach(() => {
    player = new Player();
  });

  it('is a singleton', () => {
    const logind2 = Login.getInstance();
    assume(logind).equals(logind2);
  });

  it('finds existing players', () => {
    player.username = 'zaphod';
    assume(logind.playerExists(player)).is.true();
  });

  it('does not find non-existing players', () => {
    player.username = 'ford';
    assume(logind.playerExists(player)).is.false();
  });

  it('does not find users when save file is not a file', () => {
    player.username = 'trillian';
    assume(logind.playerExists(player)).is.false();
  });

  it('can load players from their save files', () => {
    player.username = 'zaphod';
    const loaded = logind.loadPlayer(player);
    const assumed = {username: 'zaphod', display_name: 'Zaphod Beeblebrox', level: 42};
    assume(loaded).eqls(assumed);
  });

  after(() => {
    restore();
  })
})
