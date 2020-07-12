import { ObjectType } from './enums';

/**
 * A class representing the most basic properties of any in-game object
 */
export default class BaseObject {
  protected _objectType: ObjectType = ObjectType.UNDEFINED;
  protected _shortDescription = 'Unknown';
  protected _longDescription = 'Indescribable';
  protected _weight = 0.0;

  toString(): string {
    return this._shortDescription;
  }

  get objectType(): ObjectType {
    return this._objectType;
  }

  /**
   * Determine whether this object can be placed in a container
   */
  canBeContained(): boolean {
    return true;
  }

  set shortDescription(desc: string) {
    this._shortDescription = desc;
  }

  get shortDescription(): string {
    return this._shortDescription;
  }

  set longDescription(desc: string) {
    this._longDescription = desc;
  }

  get longDescription(): string {
    return this._longDescription;
  }

  set weight(weight: number) {
    this._weight = weight;
  }

  get weight(): number {
    return this._weight;
  }
}
