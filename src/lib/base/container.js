const BaseObject = require('./base-object');
const { AlreadyContains, CannotContain, CannotRelease } = require('./exceptions');


/**
 * A class representing a container, which can hold things
 *
 * @augments BaseObject
 * @property {Array<BaseObject>} contents - All objects inside this container
 * @property {number} contentWeight - The weight of all this container's contents combined
 * @property {number} weight - The total weight of this container, including its contents
 */
class Container extends BaseObject {
  constructor() {
    super();
    this._contents = new Set([]);
    this.maxContentCount = Infinity;
    this.maxContentWeight = Infinity;
  }

  get contents() {
    return [...this._contents];
  }

  get contentWeight() {
    return this.contents.reduce((total, item) => total + item.weight, 0.0);
  }

  get weight() {
    return this._weight + this.contentWeight;
  }

  set weight(weight) {
    super.weight = weight;
  }

  /**
   * Check whether this contains another object
   *
   * @param {BaseObject} obj - The object to look for in this container
   * @returns {boolean} Whether the object is in this container
   */
  contains(obj) {
    return this._contents.has(obj);
  }

  /**
   * Check whether obj can be put inside this container
   *
   * @param {BaseObject} obj - The object to check
   * @returns {boolean} Whether the object can be put inside this container
   * @throws {CannotContain} If the maximum content count is exceeded
   * @throws {CannotContain} If the maximum content weight is exceeded
   */
  canContain(obj) {
    if (this._contents.length >= this.maxContentCount) {
      throw new CannotContain(`${this} already contains its maximum number of objects.`);
    }
    if (this.contentWeight + obj.weight > this.maxContentWeight) {
      throw new CannotContain(`${obj} is too heavy for ${this}.`);
    }
    return obj.canBeContained();
  }

  /**
   * Check whether an object can be removed from this container
   *
   * @param {BaseObject} obj - The object to check
   * @returns {boolean} Whether the object can be removed from this container
   */
  canRelease(obj) {
    return this.contains(obj);
  }

  /**
   * Add an object to this container
   *
   * @param {BaseObject} obj - The object to add
   * @returns {Container} This container
   * @throws {AlreadyContains} If the object is already in this container
   */
  addObject(obj) {
    if (this.canContain(obj)) {
      if (this.contains(obj)) {
        throw new AlreadyContains(`${this} already contains ${obj}.`);
      }
      this._contents.add(obj);
      return this;
    }
    throw new Error(`${this} cannot contain ${obj}.`);
  }

  /**
   * Remove an object from this container
   *
   * @param {BaseObject} obj - The object to remove
   * @returns {Container} This container
   * @throws {CannotRelease} If the object cannot be released
   */
  removeObject(obj) {
    if (this.canRelease(obj)) {
      this._contents.delete(obj);
      return this;
    }
    throw new CannotRelease(`${this} cannot release ${obj}.`);
  }
}

module.exports = Container;
