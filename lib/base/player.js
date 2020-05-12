const Living = require('./living');

class Player extends Living {
  constructor(socket = null) {
    super();
    this._socket = socket;
  }

  async sendData(data) {
    this._socket.write(data);
  }
}

module.exports = Player;
