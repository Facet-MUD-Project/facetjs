const assume = require('assume');
const { ObjectType } = require('../../../src/lib/base/enums');
const Player = require('../../../src/lib/base/player');
const sinon = require('sinon');

describe('Player', () => {
  let player;

  beforeEach(() => {
    player = new Player({
      write: (x) => x,
      end: () => null,
      address: () => {
        return { address: '127.0.0.0', port: 8888 };
      }
    });
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
    sinon.spy(player._socket, 'end');
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
    sinon.spy(player._socket, 'write');
    player.flushOutput();
    assume(player._socket.write.callCount).equals(3);
    assume(player._socket.write.firstCall.args[0]).equals('foo!');
    assume(player._socket.write.secondCall.args[0]).equals('bar!');
    assume(player._socket.write.thirdCall.args[0]).equals('blah?');
  });
});
