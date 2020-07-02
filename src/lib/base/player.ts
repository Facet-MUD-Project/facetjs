import * as fs from 'fs';
import * as toml from '@iarna/toml';
import * as path from 'path';
import { TelnetSocket } from 'telnet-socket';

import Living from "./living";
import { ObjectType } from './enums';
import PlayerCreation from '../auth/creation';
import Login from '../auth/login';
import { makePassword } from '../auth/passwords';
import Game from '../game';
import { InputHandler } from '../interfaces';
import Config from '../../config';

/**
 * A class representing a player character
 */
export default class Player extends Living {
  protected _objectType: ObjectType = ObjectType.PLAYER;
  private _socket: TelnetSocket = null;
  private _input_buffer: Array<string> = [];
  private _output_buffer: Array<string> = [];
  private _username: string = null;
  private _password: string = null;  // This will be encrypted.
  private _playerData: Object = null;

  constructor(socket: TelnetSocket = null) {
    super();
    this._socket = socket;
  }

  toString(): string {
    return this.displayName;
  }

  get loggedIn(): boolean {
    return (this._username !== null && this._password !== null && this.playerData !== null);
  }

  get inputHandler(): InputHandler {
    if (!this.loggedIn) {
      if (this._username === null || this._password === null) {
        console.debug('[debug] Sending input to login daemon.');
        return Login.getInstance();
      }
      else {
        console.debug('[debug] Sending input to creation daemon.');
        return PlayerCreation.getInstance();
      }
    }
    else {
      return {handleInput: (player: Player, msg: string) => Game.getInstance().broadcast(msg)};
    }
  }

  setEcho(echo: boolean): void {
    console.debug('[debug] Setting echo to:', echo);
    echo ? this._socket.wont.echo() : this._socket.will.echo();
  }

  get playerData(): Object {
    return this._playerData;
  }

  loadData(): Player {
    this._playerData = toml.parse(fs.readFileSync(this.savePath).toString());
    return this;
  }

  set username(username: string) {
    if (this._username !== null) {
      throw new Error('Cannot set username after user is already logged in.');
    }
    else {
      this._username = username;
    }
  }

  get username(): string {
    return this._username;
  }

  get displayName(): string {
    return this.playerData ? this.playerData['display_name'] : this.username;
  }

  get savePath(): string {
    const config = Config.getInstance();
    return path.join(config.player_save_directory, this.username[0], `${this.username}.toml`);
  }

  set password(password: string) {
    this._password = makePassword(password);
  }

  /**
   * Send some data to the player
   */
  async sendData(data: string) {
    this._output_buffer.push(data);
  }

  get inputBuffer(): Array<string> {
    const buff = [...this._input_buffer];
    this._input_buffer = [];
    return buff;
  }

  get remoteAddress(): string {
    const address = this._socket.rawSocket.address();
    if (typeof address === 'string') return address;
    return `${address.address}:${address.port}`;
  }

  receiveData(data: string) {
    console.debug('[debug] Received data from ' + this.remoteAddress + ': ' + data.trim());
    this._input_buffer.push(data);
  }

  flushOutput() {
    while (this._output_buffer.length > 0) {
      this._socket.write(this._output_buffer.shift());
    }
  }

  exists(): boolean {
    const save_path = this.savePath;
    if (fs.existsSync(save_path)) {
      const stats = fs.lstatSync(save_path);
      if (!stats.isFile()) {
        console.error(`[error] Player save data exists, but is not a file?! (${save_path})`);
        return false;
      }
      try {
        fs.accessSync(save_path, fs.constants.W_OK);
      }
      catch (err) {
        console.error(`[error] Player save file exists, but is not writable. (${save_path})`);
        return false;
      }
      console.debug(`[debug] Found player save file: ${save_path}`);
      return true;
    }
    console.debug(`[debug] Player save file does not exist: ${save_path}`);
    return false;
  }

  /**
   * Save the player's state to a persistent data store
   */
  async save() {}

  /**
   * Disconnect the player from the game
   */
  async disconnect() {
    await this._socket.end();
  }
}
