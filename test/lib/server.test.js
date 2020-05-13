const assume = require('assume');
const Server = require('../../src/lib/server');
const sinon = require('sinon');

class FakePlayer {
  sendData() {}
  disconnect() {}
}

describe('Server', () => {
  let server;

  beforeEach(() => {
    server = new Server();
  });

  it('sends data to all players on broadcast', () => {
    server._players = [new FakePlayer(), new FakePlayer(), new FakePlayer()];
    server._players.forEach((player) => sinon.spy(player, 'sendData'));
    server.broadcast('Foo bar!');
    server._players.forEach((player) => {
      assume(player.sendData.calledOnce).is.true();
      assume(player.sendData.firstCall.args[0]).equals('Foo bar!');
    });
  });

  it('disconnects all players on shutdown', async () => {
    server._server = { close: () => null };
    server._players = [new FakePlayer(), new FakePlayer(), new FakePlayer()];
    server._players.forEach((player) => sinon.spy(player, 'disconnect'));
    await server.shutdown();
    server._players.forEach((player) => {
      assume(player.disconnect.calledOnce).is.true();
    });
  });
});
