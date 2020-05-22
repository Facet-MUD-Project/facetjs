const Living = require('./living');
const { ObjectType } = require('./enums');

class Player extends Living {
  constructor(socket = null) {
    super();
    this._socket = socket;
    this._input_buffer = [];
    this._output_buffer = [];
    this._objectType = ObjectType.PLAYER;
  }

  async sendData(data) {
    this._output_buffer.push(data);
  }

  get inputBuffer() {
    const buff = [...this._input_buffer];
    this._input_buffer = [];
    return buff;
  }

  get remoteAddress() {
    const address = this._socket.address();
    return `${address.address}:${address.port}`;
  }

  receiveData(data) {
    console.debug('[debug] Received data from ' + this.remoteAddress + ': ' + data.trim());
    this._input_buffer.push(data);
  }

  flushOutput() {
    while (this._output_buffer.length > 0) {
      this._socket.write(this._output_buffer.shift());
    }
  }

  async save() {}

  async disconnect() {
    await this._socket.end();
  }
}

module.exports = Player;
