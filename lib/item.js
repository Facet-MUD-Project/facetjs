const Container = require("./container");
const ObjectType = require("./enums");

class Item extends Container {
  constructor() {
    super();
    this._objectType = ObjectType.ITEM;
    this._isContainer = false;
  }

  get contentWeight() {
    if (this._isContainer) {
      return super.contentWeight;
    }
    return undefined;
  }

  canContain(obj) {
    if (this._isContainer) {
      return super.canContain(obj);
    }
    return false;
  }

  get contents() {
    if (this._isContainer) {
      return super.contents;
    }
    return undefined;
  }
}

module.exports = Item;
