const Container = require("./container");

class Living extends Container {
  constructor() {
    super();
    this._level = 0;
  }

  get level() {
    return this._level;
  }

  set level(level) {
    this._level = level;
    return this;
  }
}

module.exports = Living;
