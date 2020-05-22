const ObjectType = {
  UNDEFINED: 'do_not_use',
  ROOM: 'room',
  NPC: 'npc',
  ITEM: 'item',
  PLAYER: 'player'
};

const GameState = {
  STARTING: 1,
  RUNNING: 2,
  SHUTTING_DOWN: 3,
  SHUTDOWN: 4
};

module.exports = { ObjectType, GameState };
