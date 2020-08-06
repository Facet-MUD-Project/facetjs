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
import Game from '../../../src/lib/game';
import { PlayerLoginState } from '../../../src/lib/auth/enums';

describe('Login', () => {
  let config: Config, game: Game, logind: Login, player: Player, restore;

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
      sinon.stub(passwords, 'checkPassword').returns(true);
      sinon.stub(passwords, 'makePassword');
      sinon.stub(player, 'sendData');
    });

    afterEach(() => {
      passwords.checkPassword.restore();
      passwords.makePassword.restore();
    });

    it("sets a player's username first, if not set", () => {
      sinon.stub(player, 'exists');
      logind.handleInput(player, 'ford_prefect');
      assume(player.username).equals('ford_prefect');
    });

    it('asks the user to set a password if they are new', () => {
      sinon.stub(player, 'exists');
      logind.handleInput(player, 'ford_prefect');
      assume(
        player.sendData.secondCall.calledWithExactly(
          'What would you like for a password? '
        )
      ).is.true();
    });

    it('greets existing players and asks for a password', () => {
      sinon.stub(player, 'exists').returns(true);
      logind.handleInput(player, 'ford_prefect');
      assume(
        player.sendData.firstCall.calledWithExactly(
          'Welcome back!\r\nWhat... is your password? '
        )
      ).is.true();
    });

    it("checks the user's password if they exist", () => {
      logind.handleInput(player, 'zaphod');
      logind.handleInput(player, 'foobar');
      assume(passwords.checkPassword.calledOnce).is.true();
    });

    it('welcomes the player if their password is correct', () => {
      logind.handleInput(player, 'zaphod');
      logind.handleInput(player, 'foobar');
      assume(
        player.sendData.secondCall.calledWithExactly(
          '\r\nWelcome, Zaphod Beeblebrox!\r\n'
        )
      ).is.true();
    });

    it('re-asks for a password if it was incorrect', () => {
      passwords.checkPassword.returns(false);
      logind.handleInput(player, 'zaphod');
      logind.handleInput(player, 'foobar');
      assume(
        player.sendData.firstCall.calledWithExactly(
          "Well that's just not right. Care to try again? "
        )
      );
    });

    it("asks the player if the want to take over the connection if they're already connected", () => {
      const player2 = new Player();
      game = Game.getInstance();
      player2.username = 'zaphod';
      player2.loginState = PlayerLoginState.LOGGED_IN;
      game.addPlayer(player2);
      logind.handleInput(player, 'zaphod');
      logind.handleInput(player, 'foobar');
      assume(player.sendData.secondCall.calledWithExactly("\r\nUh oh. It looks like you're already connected.\r\n")).is.true();
      assume(player.sendData.thirdCall.calledWithExactly('Would you like to take over that connection? [y/N] '));
      game.removePlayer(player2);
    });
  });
});
