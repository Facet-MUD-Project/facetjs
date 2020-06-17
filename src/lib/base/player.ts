import { Socket } from 'net';
import * as path from 'path';
import Living from "./living";
import { ObjectType } from './enums';
import Config from '../../config';
import { makePassword } from '../auth/passwords';

/**
 * A class representing a player character
 */
export default class Player extends Living {
  protected _objectType: ObjectType = ObjectType.PLAYER;
  private _socket: Socket = null;
  private _input_buffer: Array<string> = [];
  private _output_buffer: Array<string> = [];
  private _username: string = null;
  private _password: string = null;  // This will be encrypted.
  displayName: string = null;

  constructor(socket: Socket = null) {
    super();
    this._socket = socket;
  }

  get loggedIn(): boolean {
    return (this._username !== null && this._password !== null);
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
    const address = this._socket.address();
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
