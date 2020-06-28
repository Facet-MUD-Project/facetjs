// @ts-nocheck

import assume from "assume";
import mockedEnv from 'mocked-env';
import sinon from 'sinon';

import Config from "../../../src/config";
import Player from "../../../src/lib/base/player";
import Login from "../../../src/lib/auth/login";
import * as passwords from "../../../src/lib/auth/passwords";

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

    it("checks the user's password if they exist", () => {
      sinon.stub(passwords, 'checkPassword').returns(true);
      player.username = 'zaphod';
      logind.handleInput(player, 'foobar');
      assume(passwords.checkPassword.calledOnce).is.true();
      passwords.checkPassword.restore();
    });

    it("welcomes the player if their password is correct", () => {
      sinon.stub(passwords, 'checkPassword').returns(true);
      sinon.stub(player, 'sendData');
      player.username = 'zaphod';
      logind.handleInput(player, 'foobar');
      assume(
        player.sendData.firstCall.calledWithExactly(
          'Welcome, Zaphod Beeblebrox!\n'
        )
      ).is.true();
      passwords.checkPassword.restore();
    });

    it("re-asks for a password if it was incorrect", () => {
      sinon.stub(passwords, 'checkPassword').returns(false);
      sinon.stub(player, 'sendData');
      player.username = 'zaphod';
      logind.handleInput(player, 'foobar');
      assume(
        player.sendData.firstCall.calledWithExactly(
          "Well that's just not right. Care to try again? "
        )
      );
      passwords.checkPassword.restore();
    });
  });
});