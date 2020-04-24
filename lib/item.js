const Container = require("./container");
const ObjectType = require("./enums");

class Item extends Container {
  constructor() {
    super();
    this._objectType = ObjectType.ITEM;
    this._isContainer = false;
  }

  get contentWeight() {
    if(this._isContainer) {
      return super.contentWeight;
    }
    throw new Error(`${this} is not a container.`);
  }

  canContain() {
    if(this._isContainer) {
      return super.canContain();
    }
    throw new Error(`{this} is not a container.`);
  }

  get contents() {
    if(this._isContainer) {
      return super.contents();
    }
    throw new Error(`{this} is not a container.`);
  }
}

module.exports = Item;
