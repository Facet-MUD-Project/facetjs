// @ts-nocheck

import assume from 'assume';
import { ObjectType } from '../../../src/lib/base/enums';
import Player from '../../../src/lib/base/player';
import sinon from 'sinon';
import { Socket } from 'net';
import Login from '../../../src/lib/auth/login';
import PlayerCreation from '../../../src/lib/auth/creation';

describe('Player', () => {
  let player: Player;

  beforeEach(() => {
    player = new Player(new Socket());
  });

  it('has an object type of player', () => {
    assume(player._objectType).equals(ObjectType.PLAYER);
  });
  it('buffers output when sending data', () => {
    player.sendData('foo!');
    assume(player._output_buffer).has.length(1);
    assume(player._output_buffer).contains('foo!');
  });

  it('calls end on its socket when disconnecting', () => {
    sinon.stub(player._socket, 'end');
    player.disconnect();
    assume(player._socket.end.calledOnce).is.true();
  });

  it('empties the input buffer when retrieved', () => {
    player._input_buffer = ['foo!'];
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
    player.playerData = {display_name: 'Ford Prefect'};
    assume(player.toString()).equals('Ford Prefect');
  });

  it('toString returns the username when the display name is not available', () => {
    player.username = 'ford_prefect';
    assume(player.toString()).equals('ford_prefect');
  });

  it('is not considered logged in by default', () => {
    assume(player.loggedIn).is.false();
  });

  it('is not logged in without a password', () => {
    player.username = 'ford_prefect';
    assume(player.loggedIn).is.false();
  });

  it('is not logged in without player data', () => {
    player.username = 'ford_prefect';
    player.password = 'z@p40d_b33bl3br0x';
    assume(player.loggedIn).is.false();
  });

  it('is logged in with username + password + player data', () => {
    player.username = 'ford_prefect';
    player.password = 'z@p40d_b33bl3br0x';
    player.playerData = {display_name: 'Ford Prefect'};
    assume(player.loggedIn).is.true();
  });

  describe('inputHandler', () => {
    it('sends input to the login handler by default', () => {
      assume(player.inputHandler).equals(Login.getInstance());
    });

    it('sends input to the player creation daemon if they are not logged in but have username / password', () => {
      player.username = 'ford_prefect';
      player.password = 'z@p40d_b33bl3br0x';
      assume(player.inputHandler).equals(PlayerCreation.getInstance());
    });
  });

  it("cannot have player data set once it's already set", () => {
    player.playerData = {display_name: 'Ford Prefect'};
    assume(() => player.playerData = {foo: 'bar'}).throws(Error);
  });

  it("cannot have the username set once it's already been set", () => {
    player.username = 'ford_prefect';
    assume(() => player.username = 'zaphod_beeblebrox').throws(Error);
  })
});
