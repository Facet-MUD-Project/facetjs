const ObjectType = require('./enums');

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

  canBeContained() {
    return true;
  }

  set shortDescription(desc) {
    this._shortDescription = desc;
  }

  get shortDescription() {
    return this._shortDescription;
  }

  set longDescription(desc) {
    this._longDescription = desc;
  }

  get longDescription() {
    return this._longDescription;
  }

  get weight() {
    return this._weight;
  }

  set weight(weight) {
    this._weight = weight;
  }
}

module.exports = BaseObject;
