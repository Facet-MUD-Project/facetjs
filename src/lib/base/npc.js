const Living = require('./living');
const { ObjectType } = require('./enums');

/**
 * A class representing a non-player character
 *
 * @augments Living
 */
class NPC extends Living {
  constructor() {
    super();
    this._objectType = ObjectType.NPC;
  }
}

module.exports = NPC;
