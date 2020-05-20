const Living = require('./living');

/**
 * A class representing a player character
 *
 * @augments Living
 */
class Player extends Living {
  constructor(socket = null) {
    super();
    this._socket = socket;
  }

  /**
   * Send some data to the player
   *
   * @param {string} data - The data to be sent
   */
  async sendData(data) {
    this._socket.write(data);
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

module.exports = Player;
