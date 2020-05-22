const assume = require('assume');
const FakePlayer = require('./stubs');
const Game = require('../../src/lib/game');
const Server = require('../../src/lib/server');
const sinon = require('sinon');

describe('Server', () => {
  let server;

  beforeEach(() => {
    server = new Server({ port: 0 });
    server._game = new Game();
  });

  it('disconnects all players on shutdown', async () => {
    server._server = { close: () => null };
    server._game._players = [new FakePlayer(), new FakePlayer(), new FakePlayer()];
    server._game._players.forEach((player) => sinon.spy(player, 'disconnect'));
    sinon.stub(server._game, 'gameLoop');
    await server.shutdown();
    server._players.forEach((player) => {
      assume(player.disconnect.calledOnce).is.true();
    });
  });
});
