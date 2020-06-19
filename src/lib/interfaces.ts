import Player from "./base/player";

export interface InputHandler {
  handleInput(player: Player, data: string): void;
}
