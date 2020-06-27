import BaseObject from './base-object';
import { AlreadyContains, CannotContain, CannotRelease } from './exceptions';

/**
 * A class representing a container, which can hold things
 */
export default class Container extends BaseObject {
  protected _contents: Set<BaseObject> = new Set([]);
  public maxContentCount: number = Infinity;
  public maxContentWeight: number = Infinity;

  get contents(): Array<BaseObject> {
    return [...this._contents];
  }

  get contentWeight(): number {
    return this.contents.reduce((total, item) => total + item.weight, 0.0);
  }

  get weight(): number {
    return this._weight + this.contentWeight;
  }

  set weight(weight) {
    super.weight = weight;
  }

  /**
   * Check whether this contains another object
   */
  contains(obj: BaseObject): boolean {
    return this._contents.has(obj);
  }

  /**
   * Check whether obj can be put inside this container
   */
  canContain(obj: BaseObject): boolean {
    if (this._contents.size >= this.maxContentCount) {
      throw new CannotContain(`${this} already contains its maximum number of objects.`);
    }
    if (this.contentWeight + obj.weight > this.maxContentWeight) {
      throw new CannotContain(`${obj} is too heavy for ${this}.`);
    }
    return obj.canBeContained();
  }

  /**
   * Check whether an object can be removed from this container
   */
  canRelease(obj: BaseObject): boolean {
    return this.contains(obj);
  }

  /**
   * Add an object to this container
   */
  addObject(obj: BaseObject): Container {
    if (this.canContain(obj)) {
      if (this.contains(obj)) {
        throw new AlreadyContains(`${this} already contains ${obj}.`);
      }
      this._contents.add(obj);
      return this;
    }
    throw new CannotContain(`${this} cannot contain ${obj}.`);
  }

  /**
   * Remove an object from this container
   */
  removeObject(obj: BaseObject): Container {
    if (this.canRelease(obj)) {
      this._contents.delete(obj);
      return this;
    }
    throw new CannotRelease(`${this} cannot release ${obj}.`);
  }
}
