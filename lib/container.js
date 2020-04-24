const BaseObject = require("./base-object");


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

  contains(obj) {
    return this._contents.has(obj);
  }

  canContain(obj) {
    if(this._contents.length >= this.maxContentCount) {
      throw new Error(`{this} already contains its maximum number of objects.`);
    }
    if(this.contentWeight + obj.weight > this.maxContentWeight) {
      throw new Error(`{obj} is too heavy for {this}.`);
    }
    return obj.canBeContained();
  }

  canRelease(obj) {
    return this.contains(obj);
  }

  addObject(obj) {
    if(this.canContain(obj)) {
      if(this.contains(obj)) {
        throw new Error(`{this} already contains {obj}.`);
      }
      this._contents.add(obj);
      return this;
    }
    throw new Error(`{this} cannot contain {obj}.`);
  }

  removeObject(obj) {
    if(this.canRelease(obj)) {
      this._contents.delete(obj);
      return this;
    }
    throw new Error(`{this} cannot release {obj}.`);
  }
}

module.exports = Container;
