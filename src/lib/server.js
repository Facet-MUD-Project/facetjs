const fs = require('fs');
const net = require('net');
const path = require('path');
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
    console.info('[info] Server started on ' + this.address + ':' + this.port);
  }

  async onConnect(conn) {
    console.debug('[debug] Incoming connection from ' + conn.remoteAddress);
    const player = new Player(conn);
    await player.sendData(this.motd);
    await this.broadcast('A new player has entered the game!\r\n');
    this._players.push(player);
  }

  async broadcast(msg) {
    console.debug('[debug] Broadcasting message: ' + msg.trim());
    await Promise.all(
      this._players.map(async (player) => player.sendData(msg))
    );
  }

  async shutdown() {
    console.info('[info] Shutting down server...');
    await this.broadcast('The server is being shut down! Goodbye.\r\n');
    await Promise.all(
      this._players.map(async (player) => player.disconnect())
    );
    this._server.close();
  }
}

module.exports = Server;
