import { GameState } from './base/enums';
import Player from './base/player';

/**
 * A class representing the game loop and player queue
 */
export default class Game {
  private static instance: Game;
  private _players: Array<Player> = [];
  private _state: GameState = GameState.STARTING;

  private constructor() { }  // eslint-disable-line

  static getInstance(): Game {
    if (!Game.instance) Game.instance = new Game();
    return Game.instance;
  }

  addPlayer(player: Player): Game {
    this._players.push(player);
    return this;
  }

  get players(): Array<Player> {
    return this._players;
  }

  async gameLoop(): Promise<void> {
    this.players.forEach((player) => {
      player.inputBuffer.forEach(
        (msg) => player.inputHandler.handleInput(player, msg)
      );
      player.flushOutput();
    });
    if (this._state === GameState.RUNNING) setTimeout(() => this.gameLoop());
    else if (this._state === GameState.SHUTTING_DOWN) this._state = GameState.SHUTDOWN;
  }

  async broadcast(msg: string): Promise<void> {
    console.debug('[debug] Broadcasting message: ' + msg.trim());
    await Promise.all(
      this.players.map(async (player) => player.sendData(msg))
    );
  }

  async startUp(): Promise<void> {
    this._state = GameState.RUNNING;
    this.gameLoop();
  }

  shutdown(): void {
    this._state = GameState.SHUTTING_DOWN;
  }

  get state(): GameState {
    return this._state;
  }
}
