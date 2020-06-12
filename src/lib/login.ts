import * as crypto from 'crypto';
import * as fs from 'fs';
import * as toml from '@iarna/toml';
import Player from "./base/player";
import Config from '../config';

export default class Login {
  handleInput(player: Player, data: string) {
    if (player.username === null) {
      data = data.trim().toLowerCase();
      player.username = data;
      if (!this.playerExists(player)) {
        player.sendData("Haven't seen you around here before.\n");
        player.sendData('What would you like for a password? ');
      }
      else {
        player.sendData('Welcome back!\nWhat... is your password? ');
      }
    }
    else {
      const config = Config.getInstance();
      const player_data = this.loadPlayer(player);
      console.debug('[debug] Loaded player data ', player_data);
      // Trim the trailing newline
      data = data.replace(/\r?\n|\r/g, "");
      const hashed = crypto.pbkdf2Sync(data, config.secret_key, config.auth_hash_iterations, 64, 'sha512').toString('hex');
      if (hashed === player_data['password']) {
        player.password = hashed;
        player.sendData(`Welcome, ${player_data['display_name']}!\n`);
      }
      else {
        player.sendData("Well that's just not right. Care to try again? ");
      }
    }
  }

  playerExists(player: Player): boolean {
    const save_path = player.savePath;
    if (fs.existsSync(save_path)) {
      const stats = fs.lstatSync(save_path);
      if (!stats.isFile()) {
        console.error(`[error] Player save data exists, but is not a file?! (${save_path})`);
        return false;
      }
      try {
        fs.accessSync(save_path, fs.constants.W_OK);
      }
      catch (err) {
        console.error(`[error] Player save file exists, but is not writable. (${save_path})`);
        return false;
      }
      console.debug(`[debug] Found player save file: ${save_path}`);
      return true;
    }
    console.debug(`[debug] Player save file does not exist: ${save_path}`);
    return false;
  }

  loadPlayer(player: Player): Object {
    return toml.parse(fs.readFileSync(player.savePath).toString());
  }
}
