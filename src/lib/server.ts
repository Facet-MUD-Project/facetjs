import * as fs from 'fs';
import * as net from 'net';
import * as path from 'path';
import Game from './game';
import Player from './base/player';

/**
 * The socket server used to accept user connections and handle data I/O
 */
export default class Server {
  public address: string;
  public port: number;
  public motd: string = null;;
  private _server: net.Server = null;
  private _game: Game = null;

  constructor({ address = '::', port = 8000 } = {}) {
    this.address = address;
    this.port = port;
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
      this.motd = data.toString();
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
   */
  async onConnect(conn: net.Socket) {
    console.debug('[debug] Incoming connection from ' + conn.remoteAddress);
    conn.setEncoding('utf-8');
    const player = new Player(conn);
    conn.on('data', (data: string) => player.receiveData(data));
    await player.sendData(this.motd);
    await player.sendData('What... is your name? ');
    await this._game.broadcast('A new player has entered the game!\r\n');
    this._game.addPlayer(player);
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
