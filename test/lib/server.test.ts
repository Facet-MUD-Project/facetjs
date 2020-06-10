import assume from 'assume';
import FakePlayer from './stubs';
import Game from '../../src/lib/game';
import Server from '../../src/lib/server';
import sinon from 'sinon';

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
    server._game._players.forEach((player) => {
      assume(player.disconnect.calledOnce).is.true();
    });
  });
});
