import { Socket } from 'net';
import Living from "./living";
import { ObjectType } from './enums';

/**
 * A class representing a player character
 */
export default class Player extends Living {
  private _socket: Socket = null;
  private _input_buffer: Array<string> = [];
  private _output_buffer: Array<string> = [];
  protected _objectType: ObjectType = ObjectType.PLAYER;

  constructor(socket: Socket = null) {
    super();
    this._socket = socket;
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
