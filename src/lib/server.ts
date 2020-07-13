
import* as net from 'net';
import{TelnetSocket} from 'telnet-socket';
import Game from './game';
import Player from './base/player';

/**
 * The socket server used to accept user connections and handle data I/O
 */
export default class Server {
 public  address: string;
 public  port: number;
 private  _server: net.Server = null;
 private  _game: Game = null;

  constructor({address = '::', port = 8000} = {}) {
    this.address = address;
    this.port = port;
  }

  /**
   * Create and start the TCP server on the configured address/port
   */
  async startServer(): Promise<void> {
    this._server = net.createServer((conn) => this.onConnect(conn));
    this._server.listen(this.port, this.address);
    this._game = Game.getInstance();
    await this._game.startUp();
    console.info('[info] Server started on ' + this.address + ':' + this.port);
  }

  /**
   * Handle a new connection to the server
   */
  async onConnect(conn: net.Socket): Promise<void> {
    console.debug('[debug] Incoming connection from ' + conn.remoteAddress);
    const telnetSocket = new TelnetSocket(conn);
    const player = new Player(telnetSocket);
    telnetSocket.on('data', (data: string) => player.receiveData(data.toString()));
    await player.sendData(this._game.motd);
    await player.sendData('What... is your name? ');
    await this._game.broadcast('A new player has entered the game!\r\n');
    this._game.addPlayer(player);
  }

  /**
   * Shut down the server, first informing and disconnecting all players
   */
  async shutdown(): Promise<void> {
    console.info('[info] Shutting down server...');
    this._game.broadcast('The server is being shut down! Goodbye.\r\n');
    this._game.shutdown();
    this._game.gameLoop();
    await Promise.all(
        this._game.players.map(async(player) => player.disconnect()));
    this._server.close();
  }
}
