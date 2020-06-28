import * as fs from 'fs';
import * as toml from '@iarna/toml';
import Player from "../base/player";
import Config from '../../config';
import { checkPassword } from './passwords';
import { InputHandler } from '../interfaces';

export default class Login implements InputHandler {
  private static instance: Login;

  private constructor() {}

  static getInstance(): Login {
    if (!Login.instance) Login.instance = new Login();
    return Login.instance;
  }

  handleInput(player: Player, data: string) {
    if (player.username === null) {
      data = data.trim().toLowerCase();
      player.username = data;
      if (!player.exists()) {
        player.sendData("Haven't seen you around here before.\n");
        player.sendData('What would you like for a password? ');
      }
      else {
        player.sendData('Welcome back!\nWhat... is your password? ');
      }
    }
    else {
      const player_data = player.loadData().playerData;
      console.debug('[debug] Loaded player data ', player_data);
      // Trim the trailing newline
      data = data.replace(/\r?\n|\r/g, "");
      if (checkPassword(data, player_data['password'])) {
        player.password = data;
        player.sendData(`Welcome, ${player}!\n`);
      }
      else {
        player.sendData("Well that's just not right. Care to try again? ");
      }
    }
  }
}
