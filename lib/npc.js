const Living = require('./living');
const ObjectType = require('./enums');

class NPC extends Living {
  constructor() {
    super();
    this._objectType = ObjectType.NPC;
  }
}

module.exports = NPC;
