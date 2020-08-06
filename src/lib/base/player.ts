import * as fs from 'fs';
import * as toml from '@iarna/toml';
import * as path from 'path';
import { TelnetSocket } from 'telnet-socket';

import Living from './living';
import { ObjectType, PlayerGameplayState } from './enums';
import PlayerCreation from '../auth/creation';
import Login from '../auth/login';
import { makePassword } from '../auth/passwords';
import Game from '../game';
import { InputHandler } from '../interfaces';
import Config from '../../config';
import { PlayerLoginState, PlayerCreationState } from '../auth/enums';

/**
 * A class representing a player character
 */
export default class Player extends Living {
  protected _objectType: ObjectType = ObjectType.PLAYER;
  private _socket: TelnetSocket = null;
  private _inputBuffer: Array<string> = [];
  private _outputBuffer: Array<string> = [];
  private _playerData: toml.JsonMap = {};

  loginState: PlayerLoginState = PlayerLoginState.USERNAME;
  gameplayState: PlayerGameplayState = PlayerGameplayState.LOGIN;

  constructor(socket: TelnetSocket = null) {
    super();
    this._socket = socket;
  }

  toString(): string {
    return this.displayName;
  }

  get loggedIn(): boolean {
    return this.gameplayState === PlayerGameplayState.PLAYING;
  }

  get inputHandler(): InputHandler {
    switch (this.gameplayState) {
      case PlayerGameplayState.LOGIN:
        console.debug('[debug] Sending input to the login daemon.');
        return Login.getInstance();
      case PlayerGameplayState.CREATION:
        console.debug('[debug] Sending input to the player creation daemon.');
        return PlayerCreation.getInstance();
      case PlayerGameplayState.PLAYING:  // Fall through to the default handler
      default:
        console.debug('[debug] Echoing player input.');
        return { handleInput: (player: Player, msg: string) => Game.getInstance().broadcast(msg) };
    }
  }

  setEcho(echo: boolean): void {
    console.debug('[debug] Setting echo to:', echo);
    echo ? this._socket.wont.echo() : this._socket.will.echo();
  }

  get playerData(): toml.JsonMap {
    return this._playerData;
  }

  loadData(): Player {
    this._playerData = toml.parse(fs.readFileSync(this.savePath).toString());
    return this;
  }

  set username(username: string) {
    if (this._playerData.username !== undefined) {
      throw new Error('Cannot set username after user is already logged in.');
    } else {
      this._playerData.username = username;
    }
  }

  get username(): string | undefined {
    return this._playerData ? this._playerData.username as string : undefined;
  }

  get displayName(): string {
    return this.playerData.display_name ? this.playerData.display_name as string : this.username;
  }

  set displayName(name: string) {
    this._playerData.display_name = name;
  }

  get creationState(): PlayerCreationState {
    if (this._playerData.creationState === undefined) {
      this._playerData.creationState = PlayerCreationState.PASSWORD;
    }
    return this._playerData.creationState as number;
  }

  set creationState(state: PlayerCreationState) {
    this._playerData.creationState = state;
  }

  get savePath(): string {
    const config = Config.getInstance();
    return path.join(config.playerSaveDirectory, this.username[0], `${this.username}.toml`);
  }

  set password(password: string) {
    this._playerData.password = makePassword(password);
  }

  /**
   * Send some data to the player
   * @param data - What to send to the player
   */
  async sendData(data: string): Promise<void> {
    this._outputBuffer.push(data);
  }

  get inputBuffer(): Array<string> {
    const buff = [...this._inputBuffer];
    this._inputBuffer = [];
    return buff;
  }

  get remoteAddress(): string {
    const address = this._socket.rawSocket.address();
    if (typeof address === 'string') return address;
    return `${address.address}:${address.port}`;
  }

  receiveData(data: string): void {
    console.debug('[debug] Received data from ' + this.remoteAddress + ': ' + data.trim());
    this._inputBuffer.push(data);
  }

  flushOutput(): void {
    while (this._outputBuffer.length > 0) {
      this._socket.write(this._outputBuffer.shift());
    }
  }

  exists(): boolean {
    const savePath = this.savePath;
    if (fs.existsSync(savePath)) {
      const stats = fs.lstatSync(savePath);
      if (!stats.isFile()) {
        console.error(`[error] Player save data exists, but is not a file?! (${savePath})`);
        return false;
      }
      try {
        fs.accessSync(savePath, fs.constants.W_OK);
      } catch (err) {
        console.error(`[error] Player save file exists, but is not writable. (${savePath})`);
        return false;
      }
      console.debug(`[debug] Found player save file: ${savePath}`);
      return true;
    }
    console.debug(`[debug] Player save file does not exist: ${savePath}`);
    return false;
  }

  /**
   * Save the player's state to a persistent data store
   */
  async save(): Promise<Player> {
    const savePath = this.savePath;
    if (!fs.existsSync(path.dirname(savePath))) {
      fs.mkdirSync(path.dirname(savePath), { recursive: true });
    }
    fs.writeFileSync(savePath, toml.stringify(this.playerData));
    return this;
  }

  /**
   * Disconnect the player from the game
   */
  async disconnect(final = false): Promise<void> {
    if (!final) this.gameplayState = PlayerGameplayState.DISCONNECT;
    else await this._socket.end();
  }
}
