const Living = require('./living');

class Player extends Living {
  constructor(socket = null) {
    super();
    this._socket = socket;
  }

  async sendData(data) {
    this._socket.write(data);
  }

  async save() {}

  async disconnect() {
    await this._socket.end();
  }
}

module.exports = Player;
