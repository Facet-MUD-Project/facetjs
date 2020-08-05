import * as fs from 'fs';
import * as path from 'path';
import { GameState, PlayerGameplayState } from './base/enums';
import Player from './base/player';
import { PlayerLoginState } from './auth/enums';

/**
 * A class representing the game loop and player queue
 */
export default class Game {
  public motd: string = null;
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

  removePlayer(player: Player): Game {
    if (this._players.includes(player)) {
      this._players.splice(this._players.indexOf(player), 1);
    }
    return this;
  }

  getPlayer(username: string): Player | undefined {
    return (this.players.filter(
      p => p.loginState === PlayerLoginState.LOGGED_IN && p.username === username
    ))[0];
  }

  playerLoggedIn(player: Player): boolean {
    return this.getPlayer(player.username) !== undefined;
  }

  get players(): Array<Player> { return this._players; }

  async gameLoop(): Promise<void> {
    this.players.forEach((player) => {
      player.inputBuffer.forEach(
        (msg) => player.inputHandler.handleInput(player, msg));
      player.flushOutput();
      if (player.gameplayState === PlayerGameplayState.DISCONNECT) {
        player.disconnect(true);
        this.removePlayer(player);
      }
    });
    if (this._state === GameState.RUNNING)
      setTimeout(() => this.gameLoop());
    else if (this._state === GameState.SHUTTING_DOWN)
      this._state = GameState.SHUTDOWN;
  }

  async broadcast(msg: string): Promise<void> {
    console.debug('[debug] Broadcasting message: ' + msg.trim());
    await Promise.all(this.players.map(async (player) => player.sendData(msg)));
  }

  /**
   * Read the MOTD file from disk and store it in a local property
   */
  readMOTD(): void {
    fs.readFile(
      path.join(__dirname, '..', 'MOTD'), (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        this.motd = data.toString();
      });
  }

  async startUp(): Promise<void> {
    this.readMOTD();
    this._state = GameState.RUNNING;
    this.gameLoop();
  }

  shutdown(): void { this._state = GameState.SHUTTING_DOWN; }

  get state(): GameState { return this._state; }
}
