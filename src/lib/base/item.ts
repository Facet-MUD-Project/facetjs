import Container from './container';
import { ObjectType } from './enums';
import BaseObject from './base-object';

/**
 * A class representing an item
 *
 * @augments Container
 */
export default class Item extends Container {
  protected _objectType: ObjectType = ObjectType.ITEM;
  protected _isContainer: boolean = false;

  get contentWeight(): number {
    if (this._isContainer) {
      return super.contentWeight;
    }
    return null;
  }

  canContain(obj: BaseObject): boolean {
    if (this._isContainer) {
      return super.canContain(obj);
    }
    return false;
  }

  get contents(): Array<BaseObject> | null {
    if (this._isContainer) {
      return super.contents;
    }
    return null;
  }
}
