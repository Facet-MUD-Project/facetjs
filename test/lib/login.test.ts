import Config from "../../src/config";
import Player from "../../src/lib/base/player";
import Login from "../../src/lib/login";
import assume from "assume";

describe('Login', () => {
  let config, logind, player;

  before(() => {
    process.env.FACET_SAVE_DIR = './test/fixtures/save';
    process.env.FACET_PLAYER_SAVE_DIR = './test/fixtures/save/players';
    config = Config.getInstance();
    logind = new Login();
  });

  beforeEach(() => {
    player = new Player();
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
})
