import Player from '../base/player';
import { InputHandler } from '../interfaces';

export default class PlayerCreation implements InputHandler {
  private static instance: PlayerCreation;
  // This can be used for temporary storage of data during creation
  private static playerData: Record<string, unknown> = {};

  private constructor() { }  // eslint-disable-line

  static getInstance(): PlayerCreation {
    if (!PlayerCreation.instance) PlayerCreation.instance = new PlayerCreation();
    return PlayerCreation.instance;
  }

  handleInput(player: Player, data: string): void {
    player.sendData(data);
  }

  private handlePassword(player: Player, data: string): void {
    data = data.replace(/\r?\n|\r/g, '');
    if (data.length < 8) {  // FIXME: We should do a bit more checking than this
      player.sendData("That password doesn't look too terribly secure.\r\nCare to try another? ");
    } else {
      player.password = data;
      player.sendData("Great! Now that we've got that out of the way, how would you like others to see your name? ");
      player.sendData(`Enter here, or press enter to accept default [${player.username}]: `);
      player.setEcho(false);
    }
  }
}
