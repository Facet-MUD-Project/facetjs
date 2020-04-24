const Container = require('./container');
const ObjectType = require('./enums');

class Room extends Container {
  constructor() {
    super();
    this._objectType = ObjectType.ROOM;
  }

  canBeContained() {
    return false;
  }
}

module.exports = Room;
