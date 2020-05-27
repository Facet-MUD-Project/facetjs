const { GameState } = require('./base/enums');

/**
 * A class representing the game loop and player queue
 *
 * @property {Array<Player>} players All currently connected players
 */
class Game {
  constructor() {
    this._players = [];
    this._state = GameState.RUNNING;
  }

  addPlayer(player) {
    this._players.push(player);
    return this;
  }

  get players() {
    return this._players;
  }

  async gameLoop() {
    this.players.forEach((player) => {
      player.inputBuffer.forEach((msg) => this.broadcast(msg));
      player.flushOutput();
    });
    if (this._state === GameState.RUNNING) setTimeout(() => this.gameLoop());
    else if (this._state === GameState.SHUTTING_DOWN) this._state = GameState.SHUTDOWN;
  }

  async broadcast(msg) {
    console.debug('[debug] Broadcasting message: ' + msg.trim());
    await Promise.all(
      this.players.map(async (player) => player.sendData(msg))
    );
  }

  shutdown() {
    this._state = GameState.SHUTTING_DOWN;
  }

  get state() {
    return this._state;
  }
}

module.exports = Game;
