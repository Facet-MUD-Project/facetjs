import Player from '../base/player';
import { InputHandler } from '../interfaces';
import { PlayerCreationState } from './enums';
import { checkPassword } from './passwords';

export default class PlayerCreation implements InputHandler {
  private static instance: PlayerCreation;

  private constructor() { }  // eslint-disable-line

  static getInstance(): PlayerCreation {
    if (!PlayerCreation.instance) PlayerCreation.instance = new PlayerCreation();
    return PlayerCreation.instance;
  }

  handleInput(player: Player, data: string): void {
    data = data.replace(/\r?\n|\r/g, '');
    switch (player.creationState) {
      case PlayerCreationState.PASSWORD:
        this.handlePassword(player, data);
        break;
      case PlayerCreationState.PASSWORD_VERIFY:
        this.handlePasswordVerify(player, data);
        break;
      case PlayerCreationState.DISPLAY_NAME:
        this.handleDisplayName(player, data);
        break;
      default:
        throw new Error('Unexpected player creation state.');
    }
  }

  private handlePassword(player: Player, data: string): void {
    if (data.length < 8) {  // FIXME: We should do a bit more checking than this
      player.sendData("\r\nThat password doesn't look too terribly secure.\r\nCare to try another? ");
      player.setEcho(false);
    } else {
      player.password = data;
      player.creationState = PlayerCreationState.PASSWORD_VERIFY;
      player.sendData('\r\nPerfect! Now, can you type that for me again to confirm? ');
      player.setEcho(false);
    }
  }

  private handlePasswordVerify(player: Player, data: string): void {
    if (checkPassword(data, <string>player.playerData.password)) {
      player.creationState = PlayerCreationState.DISPLAY_NAME;
      player.sendData("\r\nGreat! Now that we've got that out of the way, how would you like others to see your name?\r\n");
      player.sendData(`Enter here, or press enter to accept default [${player.username}]: `);
      player.setEcho(true);
    } else {
      player.creationState = PlayerCreationState.PASSWORD;
      player.sendData("\r\nUnfortunately, those did not match. Let's try that again.\r\n");
      player.sendData('What would you like for a password? ');
      player.setEcho(false);
    }
  }

  private handleDisplayName(player: Player, data: string): void {
    if (data.trim() === '') data = player.username;
    player.sendData(`Great! Other players will see you as ${data} now.\r\n`);
    player.displayName = data;
    this.finishCreation(player);
  }

  private finishCreation(player: Player): void {
    player.sendData('Enjoy the game!\r\n');
    player.creationState = PlayerCreationState.DONE;
    player.creationTime = new Date().getTime();
    player.login();
  }
}
