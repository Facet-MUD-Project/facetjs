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

  after(() => {
    restore();
  });

  describe('handleInput', () => {
    let player;

    beforeEach(() => {
      player = new Player();
    });

    it("sets a player's username first, if not set", () => {
      sinon.stub(player, 'exists');
      logind.handleInput(player, 'ford_prefect');
      assume(player.username).equals('ford_prefect');
    });

    it('asks the user to set a password if they are new', () => {
      sinon.stub(player, 'exists');
      sinon.stub(player, 'sendData');
      logind.handleInput(player, 'ford_prefect');
      assume(
        player.sendData.secondCall.calledWithExactly(
          'What would you like for a password? '
        )
      ).is.true();
    });

    it('greets existing players and asks for a password', () => {
      sinon.stub(player, 'exists').returns(true);
      sinon.stub(player, 'sendData');
      logind.handleInput(player, 'ford_prefect');
      assume(
        player.sendData.firstCall.calledWithExactly(
          'Welcome back!\nWhat... is your password? '
        )
      ).is.true();
    });
  });
});
