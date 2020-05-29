import Player from "./base/player";
import { GameState } from "./base/enums";

/**
 * A class representing the game loop and player queue
 */
export default class Game {
  private _players: Array<Player> = [];
  private _state: GameState = GameState.RUNNING;

  addPlayer(player: Player): Game {
    this._players.push(player);
    return this;
  }

  get players(): Array<Player> {
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

  async broadcast(msg: string) {
    console.debug('[debug] Broadcasting message: ' + msg.trim());
    await Promise.all(
      this.players.map(async (player) => player.sendData(msg))
    );
  }

  shutdown() {
    this._state = GameState.SHUTTING_DOWN;
  }

  get state(): GameState {
    return this._state;
  }
}
