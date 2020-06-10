import Container from "./container";
import { ObjectType } from "./enums";

/**
 * A class representing a room in the game
 */
export default class Room extends Container {
  protected _objectType: ObjectType = ObjectType.ROOM;

  canBeContained(): boolean {
    return false;
  }
}
