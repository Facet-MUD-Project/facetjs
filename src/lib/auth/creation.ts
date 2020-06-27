import Player from "../base/player";
import { InputHandler } from "../interfaces";

export default class PlayerCreation implements InputHandler {
  private static instance: PlayerCreation;
  private static playerData: Object = {};

  private constructor() {}

  static getInstance(): PlayerCreation {
    if (!PlayerCreation.instance) PlayerCreation.instance = new PlayerCreation();
    return PlayerCreation.instance;
  }

  handleInput(player: Player, data: string) {}
}
