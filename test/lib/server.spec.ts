// @ts-nocheck

import assume from 'assume';
import Game from '../../src/lib/game';
import Player from '../../src/lib/base/player';
import Server from '../../src/lib/server';
import sinon from 'sinon';

describe('Server', () => {
  let server: Server;

  before(() => {
    sinon.stub(console, 'debug');
    sinon.stub(console, 'error');
  });

  after(() => {
    console.debug.restore();
    console.error.restore();
  });

  beforeEach(() => {
    server = new Server({ port: 0 });
    server._game = Game.getInstance();
  });

  it('disconnects all players on shutdown', async () => {
    server._server = { close: () => null };
    server._game._players = [new Player(), new Player(), new Player()];
    server._game._players.forEach(
      (player) => {
        sinon.stub(player, 'disconnect');
        sinon.stub(player, 'remoteAddress').get(() => '127.0.0.1');
      }
    );
    sinon.stub(server._game, 'gameLoop');
    await server.shutdown();
    server._game._players.forEach((player) => {
      assume(player.disconnect.calledOnce).is.true();
    });
  });

  it('binds to all interfaces by default', () => {
    const server2 = new Server();
    assume(server2.address).equals('::');
  });

  it('binds to port 8000 by default', () => {
    const server2 = new Server();
    assume(server2.port).equals(8000);
  });
});
