import Player from '../base/player';
import { checkPassword } from './passwords';
import { InputHandler } from '../interfaces';

export default class Login implements InputHandler {
  private static instance: Login;

  private constructor() { }  // eslint-disable-line

  static getInstance(): Login {
    if (!Login.instance) Login.instance = new Login();
    return Login.instance;
  }

  handleInput(player: Player, data: string): void {
    if (player.username === null) {
      this.handleUsername(player, data);
    } else {
      this.handlePassword(player, data);
    }
  }

  private handleUsername(player: Player, data: string): void {
    data = data.trim().toLowerCase();
    player.username = data;
    if (!player.exists()) {
      player.sendData("Haven't seen you around here before.\r\n");
      player.sendData('What would you like for a password? ');
      player.setEcho(false);
    } else {
      player.sendData('Welcome back!\r\nWhat... is your password? ');
      player.setEcho(false);
    }
  }

  private handlePassword(player: Player, data: string): void {
    const playerData = player.loadData().playerData;
    console.debug('[debug] Loaded player data ', playerData);
    // Trim the trailing newline
    data = data.replace(/\r?\n|\r/g, '');
    if (checkPassword(data, <string>playerData.password)) {
      player.password = data;
      player.sendData(`\r\nWelcome, ${player}!\r\n`);
      player.setEcho(true);
    } else {
      player.sendData("\r\nWell that's just not right. Care to try again? ");
      player.setEcho(false);
    }
  }
}
