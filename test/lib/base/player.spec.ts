// @ts-nocheck

import assume from 'assume';
import mockedEnv from 'mocked-env';
import { Socket } from 'net';
import sinon from 'sinon';
import { TelnetSocket } from 'telnet-socket';

import PlayerCreation from '../../../src/lib/auth/creation';
import Login from '../../../src/lib/auth/login';
import { ObjectType, PlayerGameplayState } from '../../../src/lib/base/enums';
import Player from '../../../src/lib/base/player';
import { PlayerLoginState } from '../../../src/lib/auth/enums';

describe('Player', () => {
  let player: Player, restore;

  before(() => {
    restore = mockedEnv({
      FACET_SAVE_DIR: './test/fixtures/save',
      FACET_PLAYER_SAVE_DIR: './test/fixtures/save/players'
    });
    sinon.stub(console, 'debug');
    sinon.stub(console, 'error');
  });

  beforeEach(() => {
    player = new Player(new TelnetSocket(new Socket()));
  });

  after(() => {
    restore();
    console.debug.restore();
    console.error.restore();
  });

  it('has an object type of player', () => {
    assume(player._objectType).equals(ObjectType.PLAYER);
  });
  it('buffers output when sending data', () => {
    player.sendData('foo!');
    assume(player._outputBuffer).has.length(1);
    assume(player._outputBuffer).contains('foo!');
  });

  it('calls end on its socket when disconnecting', () => {
    sinon.stub(player._socket, 'end');
    player.disconnect();
    assume(player._socket.end.calledOnce).is.true();
  });

  it('empties the input buffer when retrieved', () => {
    player._inputBuffer = ['foo!'];
    const buffer = player.inputBuffer;
    assume(buffer).has.length(1);
    assume(buffer).contains('foo!');
    assume(player.inputBuffer).is.empty();
  });

  it('buffers input when receiving data', () => {
    player.receiveData('foo!');
    const buffer = player.inputBuffer;
    assume(buffer).has.length(1);
    assume(buffer).contains('foo!');
  });

  it('sends all output buffer items when flushed', () => {
    player.sendData('foo!');
    player.sendData('bar!');
    player.sendData('blah?');
    sinon.stub(player._socket, 'write');
    player.flushOutput();
    assume(player._socket.write.callCount).equals(3);
    assume(player._socket.write.firstCall.args[0]).equals('foo!');
    assume(player._socket.write.secondCall.args[0]).equals('bar!');
    assume(player._socket.write.thirdCall.args[0]).equals('blah?');
  });

  it('toString returns the display name when available', () => {
    player._playerData = { display_name: 'Ford Prefect' };
    assume(player.toString()).equals('Ford Prefect');
  });

  it('toString returns the username when the display name is not available', () => {
    player.username = 'ford_prefect';
    assume(player.toString()).equals('ford_prefect');
  });

  it('is not considered logged in by default', () => {
    assume(player.loggedIn).is.false();
  });

  it('can find existing players', () => {
    player.username = 'zaphod';
    assume(player.exists()).is.true();
  });

  it('does not find non-existing players', () => {
    player.username = 'ford';
    assume(player.exists()).is.false();
  });

  it('does not find users when save file is not a file', () => {
    player.username = 'trillian';
    assume(player.exists()).is.false();
  });

  it('can load save files', () => {
    player.username = 'zaphod';
    const loaded = player.loadData().playerData;
    const assumed = { username: 'zaphod', display_name: 'Zaphod Beeblebrox', level: 42 };
    assume(loaded).eqls(assumed);
  });

  it('is not logged in by default', () => {
    assume(player.loggedIn).is.false();
  });

  it('is logged in when gameplay state is playing', () => {
    player.gameplayState = PlayerGameplayState.PLAYING;
    assume(player.loggedIn).is.true();
  });

  it('is not logged in without a password', () => {
    player.username = 'ford_prefect';
    assume(player.loggedIn).is.false();
  });

  describe('inputHandler', () => {
    it('sends input to the login handler by default', () => {
      assume(player.inputHandler).equals(Login.getInstance());
    });

    it('sends input to the player creation daemon if their gameplay state is creation', () => {
      player.gameplayState = PlayerGameplayState.CREATION;
      assume(player.inputHandler).equals(PlayerCreation.getInstance());
    });
  });

  describe('login state', () => {
    it('is username by default', () => {
      assume(player.loginState).equals(PlayerLoginState.USERNAME);
    });
  });

  describe('gameplay state', () => {
    it('is login by default', () => {
      assume(player.gameplayState).equals(PlayerGameplayState.LOGIN);
    });
  });

  it("cannot have the username set once it's already been set", () => {
    player.username = 'ford_prefect';
    assume(() => { player.username = 'zaphod_beeblebrox'; }).throws(Error);
  });
});
