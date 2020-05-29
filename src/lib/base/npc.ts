import Living from "./living";
import { ObjectType } from "./enums";

/**
 * A class representing a non-player character
 */
export default class NPC extends Living {
  protected _objectType: ObjectType = ObjectType.NPC;
}
