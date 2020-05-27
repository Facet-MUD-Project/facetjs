const fs = require('fs');
const net = require('net');
const path = require('path');
const Game = require('./game');
const Player = require('./base/player');

class Server {
  constructor({ address = '::', port = 8000 } = {}) {
    this.address = address;
    this.port = port;
    this._server = null;
    this.motd = null;
    this._players = [];
  }

  readMOTD() {
    fs.readFile(path.join(__dirname, '..', 'MOTD'), (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      this.motd = data;
    });
  }

  async startServer() {
    this.readMOTD();
    this._server = net.createServer((conn) => this.onConnect(conn));
    this._server.listen(this.port, this.address);
    this._game = new Game();
    setTimeout(() => this._game.gameLoop());
    console.info('[info] Server started on ' + this.address + ':' + this.port);
  }

  async onConnect(conn) {
    console.debug('[debug] Incoming connection from ' + conn.remoteAddress);
    conn.setEncoding('utf-8');
    const player = new Player(conn);
    conn.on('data', (data) => player.receiveData(data));
    await player.sendData(this.motd);
    await this._game.broadcast('A new player has entered the game!\r\n');
    this._game.addPlayer(player);
  }

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
