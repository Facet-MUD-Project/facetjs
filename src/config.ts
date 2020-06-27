import * as fs from 'fs';
import * as path from 'path';

export default class Config {
  private static instance: Config;
  // All options with their default values
  server_address: string = '::';
  server_port: number = 8000;
  asset_directory: string;
  save_directory: string = './save';
  player_save_directory: string = './save/players';
  // Used for crypto functions like salting player passwords
  secret_key: string = 'CHANGE_ME';
  auth_hash_iterations: number = 100000;

  private constructor() {
    this.loadConfig();
  }

  static getInstance(): Config {
    if (!Config.instance) Config.instance = new Config();
    return Config.instance;
  }

  loadConfig() {
    this.server_address = process.env.FACET_MUD_ADDRESS || this.server_address;
    this.server_port = parseInt(process.env.FACET_MUD_PORT) || this.server_port;
    this.asset_directory = process.env.FACET_ASSET_DIR || this.asset_directory;
    this.save_directory = this.resolveFsPath(process.env.FACET_SAVE_DIR || this.save_directory);
    this.player_save_directory = this.resolveFsPath(process.env.FACET_PLAYER_SAVE_DIR || this.player_save_directory);
    this.secret_key = process.env.SECRET_KEY || this.secret_key;
    this.auth_hash_iterations = parseInt(process.env.AUTH_HASH_ITERATIONS) || this.auth_hash_iterations;
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
