// @ts-nocheck

import assume from 'assume';
import Game from '../../src/lib/game';
import Player from '../../src/lib/base/player';
import Server from '../../src/lib/server';
import sinon from 'sinon';

describe('Server', function () {
  let server: Server;

  before(function () {
    sinon.stub(console, 'debug');
    sinon.stub(console, 'error');
  });

  after(function () {
    console.debug.restore();
    console.error.restore();
  });

  beforeEach(function () {
    server = new Server({ port: 0 });
    server._game = Game.getInstance();
    server._game._players = [];
  });

  describe('shutdown', function () {
    it('disconnects all players', async function () {
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
  });

  describe('closed connection', function () {
    it('announces that the player left', async function () {
      sinon.spy(server._game, 'broadcast');
      const player = new Player();
      player.displayName = 'Ford Prefect';
      server._game._players = [player];
      await server.onClose(player);
      assume(server._game.broadcast.firstCall.args[0]).equals('Ford Prefect has disconnected.\r\n');
    });

    it('removes the player from the game', async function () {
      const player = new Player();
      server._game.addPlayer(player);
      await server.onClose(player);
      assume(server._game.players).is.empty();
    });
  });

  it('binds to all interfaces by default', function () {
    const server2 = new Server();
    assume(server2.address).equals('::');
  });

  it('binds to port 8000 by default', function () {
    const server2 = new Server();
    assume(server2.port).equals(8000);
  });
});
