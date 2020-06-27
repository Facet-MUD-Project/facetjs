// @ts-nocheck

import assume from 'assume';
import FakePlayer from './stubs';
import Game from '../../src/lib/game';
import { GameState } from '../../src/lib/base/enums';
import sinon from 'sinon';
import Player from '../../src/lib/base/player';

describe('Game', () => {
  let game: Game;

  beforeEach(() => {
    // @ts-ignore
    Game.instance = null;
    game = Game.getInstance();
  });

  it('is a singleton', () => {
    const game2 = Game.getInstance();
    assume(game).equals(game2);
  });

  it('sends data to all players on broadcast', () => {
    game._players = [new FakePlayer(), new FakePlayer(), new FakePlayer()];
    game.players.forEach((player) => sinon.spy(player, 'sendData'));
    game.broadcast('Foo bar!');
    game.players.forEach((player) => {
      assume(player.sendData.calledOnce).is.true();
      assume(player.sendData.firstCall.args[0]).equals('Foo bar!');
    });
  });

  it('defaults to running state', () => {
    assume(game.state).equals(GameState.RUNNING);
  });

  it('changes state to shutting down when shutdown is called', () => {
    game.shutdown();
    assume(game.state).equals(GameState.SHUTTING_DOWN);
  });

  it('adds to the player list when addPlayer is called', () => {
    const player1 = new FakePlayer();
    const player2 = new FakePlayer();
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
    game._players = [new FakePlayer(), new FakePlayer(), new FakePlayer()];
    game.players.forEach((player) => sinon.stub(player, 'flushOutput'));
    game.shutdown();
    game.gameLoop();
    game.players.forEach((player) => {
      assume(player.flushOutput.calledOnce).is.true();
    });
  });

  it("pushes buffered input through the player's input handler during game loop", () => {
    let handler = null, handlers = [];
    game._players = [new Player(), new Player(), new Player()];
    game.players.forEach(
      (player) => {
        sinon.stub(player, 'remoteAddress').get(() => '127.0.0.1');
        sinon.stub(player, 'inputHandler').get(() => {
          handler = sinon.stub();
          handlers.push(handler);
          return {handleInput: handler};
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
