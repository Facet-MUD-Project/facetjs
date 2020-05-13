const assume = require('assume');
const Player = require('../../../src/lib/base/player');
const sinon = require('sinon');

describe('Player', () => {
  let player;

  beforeEach(() => {
    player = new Player({ write: (x) => x, end: () => null });
  });

  it('writes to its own socket when sending data', () => {
    sinon.spy(player._socket, 'write');
    player.sendData('foo!');
    assume(player._socket.write.calledOnce).is.true();
    assume(player._socket.write.firstCall.args[0]).equals('foo!');
  });

  it('calls end on its socket when disconnecting', () => {
    sinon.spy(player._socket, 'end');
    player.disconnect();
    assume(player._socket.end.calledOnce).is.true();
  });
});
