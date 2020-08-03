import Player from '../base/player';
import { checkPassword } from './passwords';
import { InputHandler } from '../interfaces';
import { PlayerLoginState } from './enums';
import { PlayerGameplayState } from '../base/enums';
import Game from '../game';

export default class Login implements InputHandler {
  private static instance: Login;

  private constructor() { }  // eslint-disable-line

  static getInstance(): Login {
    if (!Login.instance) Login.instance = new Login();
    return Login.instance;
  }

  handleInput(player: Player, data: string): void {
    switch (player.loginState) {
      case PlayerLoginState.USERNAME:
        this.handleUsername(player, data);
        break;
      case PlayerLoginState.PASSWORD:
        this.handlePassword(player, data);
        break;
      case PlayerLoginState.LOGIN_CONFLICT:
        this.handleLoginConflict(player, data);
        break;
      default:
        throw new Error('Unexpected player login state.');
    }
  }

  private handleUsername(player: Player, data: string): void {
    data = data.trim().toLowerCase();
    player.username = data;
    if (!player.exists()) {
      player.loginState = PlayerLoginState.CREATION;
      player.gameplayState = PlayerGameplayState.CREATION;
      player.sendData("Haven't seen you around here before.\r\n");
      player.sendData('What would you like for a password? ');
      player.setEcho(false);
    } else {
      player.loginState = PlayerLoginState.PASSWORD;
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
      const game = Game.getInstance();
      if (!game.playerConnected(player)) {
        player.sendData(`\r\nWelcome, ${player}!\r\n`);
        player.setEcho(true);
        player.loginState = PlayerLoginState.LOGGED_IN;
        player.gameplayState = PlayerGameplayState.PLAYING;
      } else {
        player.loginState = PlayerLoginState.LOGIN_CONFLICT;
        player.setEcho(true);
        player.sendData("\r\nUh oh. It looks like you're already connected.\r\n");
        player.sendData('Would you like to take over that connection? [y/N] ');
      }
    } else {
      player.sendData("\r\nWell that's just not right. Care to try again? ");
      player.setEcho(false);
    }
  }

  private handleLoginConflict(player: Player, data: string): void {
    data = data.toLocaleLowerCase().trim();
    const game = Game.getInstance();
    if (data === 'n' || data === '') {
      player.sendData('Okay then. Goodbye!\r\n');
      player.disconnect();
    } else if (data === 'y') {
      player.sendData('Please stand by. Transferring connection!\r\n');
      const existing = game.getPlayer(player.username);
      if (existing !== undefined) {
        existing.sendData('Your connection has been taken over! Goodbye!\r\n');
        existing.save();
        existing.disconnect();
      }
      player.loginState = PlayerLoginState.LOGGED_IN;
      player.gameplayState = PlayerGameplayState.PLAYING;
    } else {
      player.sendData("Wait, what? I don't understand that.\r\n");
      player.sendData('Would you like to take over the other connection? [y/N] ');
    }
  }
}
