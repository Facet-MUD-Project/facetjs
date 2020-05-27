const fs = require('fs');
const net = require('net');
const path = require('path');
const Game = require('./game');
const Player = require('./base/player');

/**
 * The socket server used to accept user connections and handle data I/O
 *
 * @property {string} address - The IP address to which the server is bound
 * @property {number} port - The port number for the server
 * @property {?string} motd - The MOTD, announced on player connect
 * @property {Array<Player>} _players - All connected players
 */
class Server {
  constructor({ address = '::', port = 8000 } = {}) {
    this.address = address;
    this.port = port;
    this._server = null;
    this.motd = null;
    this._players = [];
  }

  /**
   * Read the MOTD file from disk and store it in a local property
   */
  readMOTD() {
    fs.readFile(path.join(__dirname, '..', 'MOTD'), (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      this.motd = data;
    });
  }

  /**
   * Create and start the TCP server on the configured address/port
   */
  async startServer() {
    this.readMOTD();
    this._server = net.createServer((conn) => this.onConnect(conn));
    this._server.listen(this.port, this.address);
    this._game = new Game();
    setTimeout(() => this._game.gameLoop());
    console.info('[info] Server started on ' + this.address + ':' + this.port);
  }

  /**
   * Handle a new connection to the server
   *
   * @param {net.Socket} conn - A new TCP connection
   */
  async onConnect(conn) {
    console.debug('[debug] Incoming connection from ' + conn.remoteAddress);
    conn.setEncoding('utf-8');
    const player = new Player(conn);
    conn.on('data', (data) => player.receiveData(data));
    await player.sendData(this.motd);
    await this.broadcast('A new player has entered the game!\r\n');
    this._players.push(player);
  }

  /**
   * Broadcast a message to all connected players
   *
   * @param {string} msg - The message to be broadcast
   */
  async broadcast(msg) {
    console.debug('[debug] Broadcasting message: ' + msg.trim());
    await Promise.all(
      this._players.map(async (player) => player.sendData(msg))
    );
  }

  /**
   * Shut down the server, first informing and disconnecting all players
   */
  async shutdown() {
    console.info('[info] Shutting down server...');
    this._game.broadcast('The server is being shut down! Goodbye.\r\n');
    this._game.shutdown();
    this._game.gameLoop();
    await Promise.all(
      this._game.players.map(async (player) => player.disconnect())
    );
    this._server.close();
  }
}

module.exports = Server;
