// @ts-nocheck

import assume from 'assume';
import Game from '../../src/lib/game';
import { GameState } from '../../src/lib/base/enums';
import sinon from 'sinon';
import Player from '../../src/lib/base/player';

describe('Game', () => {
  let game: Game;

  beforeEach(() => {
    Game.instance = null;
    game = Game.getInstance();
  });

  it('is a singleton', () => {
    const game2 = Game.getInstance();
    assume(game).equals(game2);
  });

  it('sends data to all players on broadcast', () => {
    game._players = [new Player(), new Player(), new Player()];
    game.players.forEach(
      (player) => {
        sinon.stub(player, 'sendData');
        sinon.stub(player, 'remoteAddress').get(() => '127.0.0.1');
      }
    );
    game.broadcast('Foo bar!');
    game.players.forEach((player) => {
      assume(player.sendData.calledOnce).is.true();
      assume(player.sendData.firstCall.args[0]).equals('Foo bar!');
    });
  });

  it('defaults to starting state', () => {
    assume(game.state).equals(GameState.STARTING);
  });

  it('changes to running state after starting up', () => {
    sinon.stub(game, 'gameLoop');
    game.startUp();
    assume(game.state).equals(GameState.RUNNING);
    game.gameLoop.restore();
  });

  it('starts the game loop when starting up', () => {
    sinon.stub(game, 'gameLoop');
    game.startUp();
    assume(game.gameLoop.calledOnce).is.true();
    game.gameLoop.restore();
  });

  it('changes state to shutting down when shutdown is called', () => {
    game.shutdown();
    assume(game.state).equals(GameState.SHUTTING_DOWN);
  });

  it('adds to the player list when addPlayer is called', () => {
    const player1 = new Player();
    const player2 = new Player();
    game.addPlayer(player1);
    game.addPlayer(player2);
    assume(game.players).has.length(2);
    assume(game.players[0]).equals(player1);
    assume(game.players[1]).equals(player2);
  });

  it('sets state to shut down if it is shutting down', () => {
    game.shutdown();
    game.gameLoop();
    assume(game.state).equals(GameState.SHUTDOWN);
  });

  it('flushes all players output buffers during game loop', () => {
    game._players = [new Player(), new Player(), new Player()];
    game.players.forEach(
      (player) => {
        sinon.stub(player, 'remoteAddress').get(() => '127.0.0.1');
        sinon.stub(player, 'flushOutput');
      }
    );
    game.shutdown();
    game.gameLoop();
    game.players.forEach((player) => {
      assume(player.flushOutput.calledOnce).is.true();
    });
  });

  it("pushes buffered input through the player's input handler during game loop", () => {
    const handlers = [];
    game._players = [new Player(), new Player(), new Player()];
    game.players.forEach(
      (player) => {
        sinon.stub(player, 'remoteAddress').get(() => '127.0.0.1');
        sinon.stub(player, 'inputHandler').get(() => {
          const handler = sinon.stub();
          handlers.push(handler);
          return { handleInput: handler };
        });
        player.receiveData('foo');
      }
    );
    game.shutdown();
    game.gameLoop();
    handlers.forEach((handler) => {
      assume(handler.called).is.true();
    });
  });
});
