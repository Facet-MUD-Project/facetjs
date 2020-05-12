const fs = require('fs');
const net = require('net');
const path = require('path');
const Player = require('./base/player');

class Server {
  constructor(address = '0.0.0.0', port = 8000) {
    this.address = address;
    this.port = port;
    this._server = null;
    this.motd = null;
    this._players = [];
  }

  async readMOTD() {
    fs.readFile(path.join(__dirname, '..', 'MOTD'), (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      this.motd = data;
    });
  }

  async startServer() {
    await this.readMOTD();
    this._server = net.createServer((conn) => this.onConnect(conn));
    this._server.listen(this.port, this.address);
    console.log('Server started on ' + this.address + ':' + this.port);
  }

  async onConnect(conn) {
    console.log('Incoming connection from ' + conn.remoteAddress);
    const player = new Player(conn);
    await player.sendData(this.motd);
    this._players.forEach((p) => p.sendData('A new player has entered the game!\r\n'));
    this._players.push(player);
  }
}

module.exports = Server;
