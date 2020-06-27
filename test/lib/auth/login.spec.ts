// @ts-nocheck

import Config from "../../../src/config";
import Player from "../../../src/lib/base/player";
import Login from "../../../src/lib/auth/login";
import assume from "assume";
import mockedEnv from 'mocked-env';
import sinon from 'sinon';

describe('Login', () => {
  let config: Config, logind: Login, player: Player, restore;

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
  });

  describe('handleInput', () => {
    let player;

    beforeEach(() => {
      player = new Player();
    });

    it("sets a player's username first, if not set", () => {
      sinon.stub(logind, 'playerExists');
      logind.handleInput(player, 'ford_prefect');
      assume(player.username).equals('ford_prefect');
      logind.playerExists.restore();
    });

    it('asks the user to set a password if they are new', () => {
      sinon.stub(logind, 'playerExists');
      sinon.stub(player, 'sendData');
      logind.handleInput(player, 'ford_prefect');
      assume(
        player.sendData.secondCall.calledWithExactly(
          'What would you like for a password? '
        )
      ).is.true();
      logind.playerExists.restore();
    });

    it('greets existing players and asks for a password', () => {
      sinon.stub(logind, 'playerExists').returns(true);
      sinon.stub(player, 'sendData');
      logind.handleInput(player, 'ford_prefect');
      assume(
        player.sendData.firstCall.calledWithExactly(
          'Welcome back!\nWhat... is your password? '
        )
      ).is.true();
      logind.playerExists.restore();
    });
  });
});
