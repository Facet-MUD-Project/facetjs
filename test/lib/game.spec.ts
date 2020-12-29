// @ts-nocheck

import assume from 'assume';
import Game from '../../src/lib/game';
import { GameState, PlayerGameplayState } from '../../src/lib/base/enums';
import sinon from 'sinon';
import Player from '../../src/lib/base/player';
import { PlayerLoginState } from '../../src/lib/auth/enums';
import { Socket } from 'net';

describe('Game', function () {
  let game: Game;

  before(function () {
    sinon.stub(console, 'debug');
    sinon.stub(console, 'error');
  });

  after(function () {
    console.debug.restore();
    console.error.restore();
  });

  beforeEach(function () {
    Game.instance = null;
    game = Game.getInstance();
  });

  it('is a singleton', function () {
    const game2 = Game.getInstance();
    assume(game).equals(game2);
  });

  it('sends data to all players on broadcast', function () {
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

  it('defaults to starting state', function () {
    assume(game.state).equals(GameState.STARTING);
  });

  describe('startup', function () {
    it('changes to running state', function () {
      sinon.stub(game, 'gameLoop');
      game.startUp();
      assume(game.state).equals(GameState.RUNNING);
      game.gameLoop.restore();
    });

    it('starts the game loop', function () {
      sinon.stub(game, 'gameLoop');
      game.startUp();
      assume(game.gameLoop.calledOnce).is.true();
      game.gameLoop.restore();
    });
  });

  describe('shutdown', function () {
    it('sets state to shutting down', function () {
      game.shutdown();
      assume(game.state).equals(GameState.SHUTTING_DOWN);
    });
    it('changes state to shut down', function () {
      game.shutdown();
      game.gameLoop();
      assume(game.state).equals(GameState.SHUTDOWN);
    });
  });

  describe('game loop', function () {
    it('flushes all players output buffers', function () {
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

    it("pushes buffered input through the player's input handler", function () {
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

    it('ends player sockets when their gameplay state is disconnect', function () {
      const player = new Player(new Socket());
      player.gameplayState = PlayerGameplayState.DISCONNECT;
      sinon.stub(player._socket, 'end');
      game.addPlayer(player);
      game.shutdown();
      game.gameLoop();
      assume(player._socket.end.calledOnce).is.true();
    });

    it('removes players from the game when their game state is disconnect', function () {
      const player = new Player(new Socket());
      player.gameplayState = PlayerGameplayState.DISCONNECT;
      sinon.stub(player._socket, 'end');
      game.addPlayer(player);
      game.shutdown();
      game.gameLoop();
      assume(game.players).is.empty();
    });
  });

  it('adds to the player list when addPlayer is called', function () {
    const player1 = new Player();
    const player2 = new Player();
    game.addPlayer(player1);
    game.addPlayer(player2);
    assume(game.players).has.length(2);
    assume(game.players[0]).equals(player1);
    assume(game.players[1]).equals(player2);
  });

  describe('removePlayer', function () {
    it('removes the player from the player list', function () {
      const player1 = new Player();
      const player2 = new Player();
      game.addPlayer(player1);
      game.addPlayer(player2);
      game.removePlayer(player1);
      assume(game.players).has.length(1);
      assume(game.players[0]).equals(player2);
      game.removePlayer(player2);
      assume(game.players).is.empty();
    });

    it("passes silently when the player isn't in the game", function () {
      game.addPlayer(new Player());
      game.removePlayer(new Player());
      assume(game.players).has.length(1);
    });
  });

  describe('playerLoggedIn', function () {
    let player1: Player, player2: Player;
    beforeEach(function () {
      player1 = new Player();
      player2 = new Player();
      player1.username = 'ford_prefect';
      player1.loginState = PlayerLoginState.LOGGED_IN;
      player2.username = 'ford_prefect';
      player1.loginState = PlayerLoginState.LOGGED_IN;
    });

    it('returns true when the player is already connected', function () {
      game.addPlayer(player1);
      assume(game.playerLoggedIn(player2)).is.true();
    });

    it('returns false when the player is not yet connected', function () {
      assume(game.playerLoggedIn(player1)).is.false();
    });
  });

  describe('getPlayer', function () {
    it('returns the requested player', function () {
      const player = new Player();
      player.username = 'ford_prefect';
      player.loginState = PlayerLoginState.LOGGED_IN;
      game.addPlayer(player);
      assume(game.getPlayer('ford_prefect')).equals(player);
    });

    it('returns undefined when the player is not found', function () {
      assume(game.getPlayer('ford_prefect')).equals(undefined);
    });
  });
});
