/**
 * Enum for types of object classes
 */
export enum ObjectType {
  UNDEFINED = 'do_not_use',
  ROOM = 'room',
  NPC = 'npc',
  ITEM = 'item',
  PLAYER = 'player'
}

/**
 * Enum for the state of the main game engine
 */
export enum GameState {
  STARTING = 1,
  RUNNING = 2,
  SHUTTING_DOWN = 3,
  SHUTDOWN = 4
}
