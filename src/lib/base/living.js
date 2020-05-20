const Container = require('./container');

/**
 * A class representing a living being
 *
 * @augments Container
 * @property {number} level - The experience level of this living being
 */
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
