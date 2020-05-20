const ObjectType = require('./enums');

/**
 * A class representing the most basic properties of any in-game object
 *
 * @property {ObjectType} objectType - What type of object this is
 * @property {string} shortDescription - The short description (name) of this object
 * @property {string} longDescription - The long desctiption of this object
 * @property {number} weight - The weight of this object
 */
class BaseObject {
  constructor() {
    this._objectType = ObjectType.UNDEFINED;
    this._shortDescription = 'Unknown';
    this._longDescription = 'Indescribable';
    this._weight = 0.0;
  }

  toString() {
    return this._shortDescription;
  }

  get objectType() {
    return this._objectType;
  }

  /**
   * Determine whether this object can be placed in a container
   *
   * @returns {boolean} Whether or not it can be contained
   */
  canBeContained() {
    return true;
  }

  set shortDescription(desc) {
    this._shortDescription = desc;
    return this;
  }

  get shortDescription() {
    return this._shortDescription;
  }

  set longDescription(desc) {
    this._longDescription = desc;
    return this;
  }

  get longDescription() {
    return this._longDescription;
  }

  set weight(weight) {
    this._weight = weight;
    return this;
  }

  get weight() {
    return this._weight;
  }
}

module.exports = BaseObject;
