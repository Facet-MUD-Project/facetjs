// @ts-nocheck

import assume from 'assume';
import { Socket } from 'net';
import sinon from 'sinon';
import { TelnetSocket } from 'telnet-socket';

import PlayerCreation from '../../../src/lib/auth/creation';
import Player from '../../../src/lib/base/player';
import { PlayerGameplayState } from '../../../src/lib/base/enums';
import { PlayerCreationState, PlayerLoginState } from '../../../src/lib/auth/enums';
import * as passwords from '../../../src/lib/auth/passwords';

describe('Player Creation', function () {
  let creation: PlayerCreation, player: Player;
  const goodPassword = 'Dnxq2_2!', badPassword = 'foo';

  before(function () {
    creation = PlayerCreation.getInstance();
    sinon.stub(console, 'debug');
    sinon.stub(console, 'error');
    sinon.stub(passwords, 'checkPassword').returns(true);
    sinon.stub(passwords, 'makePassword');
  });

  after(function () {
    console.debug.restore();
    console.error.restore();
    passwords.checkPassword.restore();
    passwords.makePassword.restore();
  });

  beforeEach(function () {
    player = new Player(new TelnetSocket(new Socket()));
    player.username = 'zaphod_beeblebrox';
    player.gameplayState = PlayerGameplayState.CREATION;
    sinon.stub(player, 'sendData');
    sinon.stub(player, 'save');
    sinon.stub(player._socket, 'will').get(() => { return { echo: sinon.stub() }; });
    sinon.stub(player._socket, 'wont').get(() => { return { echo: sinon.stub() }; });
  });

  it('is a singleton', function () {
    const creation2 = PlayerCreation.getInstance();
    assume(creation).equals(creation2);
  });

  describe('password input', function () {
    it('asks the player to verify their password', function () {
      creation.handleInput(player, goodPassword);
      assume(
        player.sendData.firstCall.calledWithExactly(
          '\r\nPerfect! Now, can you type that for me again to confirm? '
        )
      ).is.true();
    });

    it('bumps the player to the verify password step', function () {
      creation.handleInput(player, goodPassword);
      assume(player.creationState).equals(PlayerCreationState.PASSWORD_VERIFY);
    });

    it('rejects short passwords', function () {
      creation.handleInput(player, badPassword);
      assume(
        player.sendData.firstCall.calledWithExactly(
          "\r\nThat password doesn't look too terribly secure.\r\nCare to try another? "
        )
      ).is.true();
    });

    it('keeps the player at password input if the password was bad', function () {
      creation.handleInput(player, badPassword);
      assume(player.creationState).equals(PlayerCreationState.PASSWORD);
    });
  });

  describe('verify password', function () {
    it('asks the player for a display name if passwords match', function () {
      creation.handleInput(player, goodPassword);
      creation.handleInput(player, goodPassword);
      assume(
        player.sendData.secondCall.calledWithExactly(
          "\r\nGreat! Now that we've got that out of the way, how would you like others to see your name?\r\n"
        )
      ).is.true();
    });

    it('bumps the player to the display name step', function () {
      creation.handleInput(player, goodPassword);
      creation.handleInput(player, goodPassword);
      assume(player.creationState).equals(PlayerCreationState.DISPLAY_NAME);
    });

    it('rejects non-matching passwords', function () {
      passwords.checkPassword.returns(false);
      creation.handleInput(player, goodPassword);
      creation.handleInput(player, badPassword);
      assume(
        player.sendData.secondCall.calledWithExactly(
          "\r\nUnfortunately, those did not match. Let's try that again.\r\n"
        )
      ).is.true();
      passwords.checkPassword.returns(true);
    });

    it("resets the player to password input if the passwords didn't match", function () {
      passwords.checkPassword.returns(false);
      creation.handleInput(player, goodPassword);
      creation.handleInput(player, badPassword);
      assume(player.creationState).equals(PlayerCreationState.PASSWORD);
      passwords.checkPassword.returns(true);
    });
  });

  describe('display name', function () {
    it("confirms the player's display name", function () {
      creation.handleInput(player, goodPassword);
      creation.handleInput(player, goodPassword);
      creation.handleInput(player, 'Zaphod Beeblebrox');
      assume(player.sendData.getCall(4).calledWithExactly(
        'Great! Other players will see you as Zaphod Beeblebrox now.\r\n'
      ));
    });

    it("sets the player's display name as specified", function () {
      creation.handleInput(player, goodPassword);
      creation.handleInput(player, goodPassword);
      creation.handleInput(player, 'Zaphod Beeblebrox');
      assume(player.displayName).equals('Zaphod Beeblebrox');
    });

    it("users the player's username by default", function () {
      creation.handleInput(player, goodPassword);
      creation.handleInput(player, goodPassword);
      creation.handleInput(player, '');
      assume(player.displayName).equals('zaphod_beeblebrox');
    });
  });

  describe('finalizing', function () {
    it('welcomes the player', function () {
      creation.finishCreation(player);
      assume(player.sendData.firstCall.calledWithExactly('Enjoy the game!\r\n'));
    });

    it('sets the player to logged in', function () {
      creation.finishCreation(player);
      assume(player.loginState).equals(PlayerLoginState.LOGGED_IN);
    });

    it('sets the player to done with creation', function () {
      creation.finishCreation(player);
      assume(player.creationState).equals(PlayerCreationState.DONE);
    });

    it('sets the player to playing', function () {
      creation.finishCreation(player);
      assume(player.gameplayState).equals(PlayerGameplayState.PLAYING);
    });
  });
});
