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
import { PlayerGameplayState } from '../../../src/lib/base/enums';

describe('Login', function () {
  let config: Config, game: Game, logind: Login, player: Player, restore;

  before(function () {
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

  after(function () {
    restore();
    console.debug.restore();
    console.error.restore();
  });

  beforeEach(function () {
    player = new Player();
  });

  it('is a singleton', function () {
    const logind2 = Login.getInstance();
    assume(logind).equals(logind2);
  });

  describe('handleInput', function () {
    beforeEach(function () {
      player = new Player(new TelnetSocket(new Socket()));
      sinon.stub(player._socket, 'will').get(() => { return { echo: sinon.stub() }; });
      sinon.stub(player._socket, 'wont').get(() => { return { echo: sinon.stub() }; });
      sinon.stub(passwords, 'checkPassword').returns(true);
      sinon.stub(passwords, 'makePassword');
      sinon.stub(player, 'sendData');
      sinon.stub(player, 'disconnect');
    });

    afterEach(function () {
      passwords.checkPassword.restore();
      passwords.makePassword.restore();
    });

    it("sets a player's username first, if not set", function () {
      sinon.stub(player, 'exists');
      logind.handleInput(player, 'ford_prefect');
      assume(player.username).equals('ford_prefect');
    });

    it('asks the user to set a password if they are new', function () {
      sinon.stub(player, 'exists');
      logind.handleInput(player, 'ford_prefect');
      assume(
        player.sendData.secondCall.calledWithExactly(
          'What would you like for a password? '
        )
      ).is.true();
    });

    it('greets existing players and asks for a password', function () {
      sinon.stub(player, 'exists').returns(true);
      logind.handleInput(player, 'ford_prefect');
      assume(
        player.sendData.firstCall.calledWithExactly(
          'Welcome back!\r\nWhat... is your password? '
        )
      ).is.true();
    });

    it("checks the user's password if they exist", function () {
      logind.handleInput(player, 'zaphod');
      logind.handleInput(player, 'foobar');
      assume(passwords.checkPassword.calledOnce).is.true();
    });

    it('welcomes the player if their password is correct', function () {
      logind.handleInput(player, 'zaphod');
      logind.handleInput(player, 'foobar');
      assume(
        player.sendData.secondCall.calledWithExactly(
          '\r\nWelcome, Zaphod Beeblebrox!\r\n'
        )
      ).is.true();
    });

    it('re-asks for a password if it was incorrect', function () {
      passwords.checkPassword.returns(false);
      logind.handleInput(player, 'zaphod');
      logind.handleInput(player, 'foobar');
      assume(
        player.sendData.firstCall.calledWithExactly(
          "Well that's just not right. Care to try again? "
        )
      );
    });

    it("asks the player if the want to take over the connection if they're already connected", function () {
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

    it('disconnects the player if they decide not to take over their connection', function () {
      const player2 = new Player();
      game = Game.getInstance();
      player2.username = 'zaphod';
      player2.loginState = PlayerLoginState.LOGGED_IN;
      game.addPlayer(player2);
      logind.handleInput(player, 'zaphod');
      logind.handleInput(player, 'foobar');
      logind.handleInput(player, 'n');
      assume(player.disconnect.calledOnce).is.true();
      game.removePlayer(player2);
    });

    it('logs the player in if they decide to take over their connection', function () {
      const player2 = new Player();
      game = Game.getInstance();
      player2.username = 'zaphod';
      player2.loginState = PlayerLoginState.LOGGED_IN;
      sinon.stub(player2, 'save');
      game.addPlayer(player2);
      logind.handleInput(player, 'zaphod');
      logind.handleInput(player, 'foobar');
      logind.handleInput(player, 'y');
      assume(player.loggedIn).is.true();
      assume(player.gameplayState).equals(PlayerGameplayState.PLAYING);
      game.removePlayer(player2);
    });

    it('logs the other player out if they decide to take over their connection', function () {
      const player2 = new Player();
      game = Game.getInstance();
      player2.username = 'zaphod';
      player2.loginState = PlayerLoginState.LOGGED_IN;
      sinon.stub(player2, 'save');
      sinon.stub(player2, 'disconnect');
      game.addPlayer(player2);
      logind.handleInput(player, 'zaphod');
      logind.handleInput(player, 'foobar');
      logind.handleInput(player, 'y');
      assume(player2.save.calledOnce).is.true();
      assume(player2.disconnect.calledOnce).is.true();
      game.removePlayer(player2);
    });

    it('asks the player to try again when they respond nonsense to a connection conflict', function () {
      const player2 = new Player();
      game = Game.getInstance();
      player2.username = 'zaphod';
      player2.loginState = PlayerLoginState.LOGGED_IN;
      sinon.stub(player2, 'save');
      game.addPlayer(player2);
      logind.handleInput(player, 'zaphod');
      logind.handleInput(player, 'foobar');
      logind.handleInput(player, 'gobbledygook');
      assume(player.sendData.getCall(3).calledWithExactly("Wait, what? I don't understand that.\r\n")).is.true();
      assume(player.sendData.getCall(4).calledWithExactly('Would you like to take over the other connection? [y/N] ')).is.true();
      game.removePlayer(player2);
    });
  });
});
