const Container = require('./container');
const { ObjectType } = require('./enums');

/**
 * A class representing a room in the game
 *
 * @augments Container
 */
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
