// @ts-nocheck

import assume from 'assume';
import mockedEnv from 'mocked-env';
import { Socket } from 'net';
import sinon from 'sinon';
import { TelnetSocket } from 'telnet-socket';

import Config from '../../../src/config';
import Player from '../../../src/lib/base/player';
import Login from '../../../src/lib/auth/login';
import * as passwords from '../../../src/lib/auth/passwords';

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
    sinon.stub(console, 'debug');
    sinon.stub(console, 'error');
  });

  after(() => {
    restore();
    console.debug.restore();
    console.error.restore();
  });

  beforeEach(() => {
    player = new Player();
  });

  it('is a singleton', () => {
    const logind2 = Login.getInstance();
    assume(logind).equals(logind2);
  });

  describe('handleInput', () => {
    beforeEach(() => {
      player = new Player(new TelnetSocket(new Socket()));
      sinon.stub(player._socket, 'will').get(() => { return { echo: sinon.stub() }; });
      sinon.stub(player._socket, 'wont').get(() => { return { echo: sinon.stub() }; });
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
          'Welcome back!\r\nWhat... is your password? '
        )
      ).is.true();
    });

    it("checks the user's password if they exist", () => {
      sinon.stub(passwords, 'checkPassword').returns(true);
      logind.handleInput(player, 'zaphod');
      logind.handleInput(player, 'foobar');
      assume(passwords.checkPassword.calledOnce).is.true();
      passwords.checkPassword.restore();
    });

    it('welcomes the player if their password is correct', () => {
      sinon.stub(passwords, 'checkPassword').returns(true);
      sinon.stub(player, 'sendData');
      logind.handleInput(player, 'zaphod');
      logind.handleInput(player, 'foobar');
      assume(
        player.sendData.secondCall.calledWithExactly(
          '\r\nWelcome, Zaphod Beeblebrox!\r\n'
        )
      ).is.true();
      passwords.checkPassword.restore();
    });

    it('re-asks for a password if it was incorrect', () => {
      sinon.stub(passwords, 'checkPassword').returns(false);
      sinon.stub(player, 'sendData');
      logind.handleInput(player, 'zaphod');
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
