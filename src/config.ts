import * as fs from 'fs';
import * as path from 'path';

export default class Config {
  private static instance: Config;
  // All options with their default values
  serverAddress = '::';
  serverPort = 8000;
  assetDirectory: string;
  saveDirectory = './save';
  playerSaveDirectory = './save/players';
  // Used for crypto functions like salting player passwords
  secretKey = 'CHANGE_ME';
  authHashIterations = 100000;

  private constructor() {
    this.loadConfig();
  }

  static getInstance(): Config {
    if (!Config.instance) Config.instance = new Config();
    return Config.instance;
  }

  loadConfig(): Config {
    this.serverAddress = process.env.FACET_MUD_ADDRESS || this.serverAddress;
    this.serverPort = parseInt(process.env.FACET_MUD_PORT, 10) || this.serverPort;
    this.assetDirectory = process.env.FACET_ASSET_DIR || this.assetDirectory;
    this.saveDirectory = this.resolveFsPath(process.env.FACET_SAVE_DIR || this.saveDirectory);
    this.playerSaveDirectory = this.resolveFsPath(process.env.FACET_PLAYER_SAVE_DIR || this.playerSaveDirectory);
    this.secretKey = process.env.SECRET_KEY || this.secretKey;
    this.authHashIterations = parseInt(process.env.AUTH_HASH_ITERATIONS, 10) || this.authHashIterations;
    return this;
  }

  resolveFsPath(dirpath: string): string {
    dirpath = path.resolve(path.join(dirpath));
    if (!fs.existsSync(dirpath)) fs.mkdirSync(dirpath, { recursive: true });
    else {
      const stats = fs.lstatSync(dirpath);
      if (!stats.isDirectory()) throw new Error(`${dirpath} exists and is not a directory.`);
    }
    return dirpath;
  }
}
