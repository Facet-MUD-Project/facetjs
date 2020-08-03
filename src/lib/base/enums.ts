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
  STARTING,
  RUNNING,
  SHUTTING_DOWN,
  SHUTDOWN
}

/**
 * Enum for what the player is currently doing and how to handle their input
 */
export enum PlayerGameplayState {
  LOGIN,
  CREATION,
  PLAYING,
  DISCONNECT
}
