/**
 * Enum for where the player is in the login process
 */
export enum PlayerLoginState {
  USERNAME,
  PASSWORD,
  CREATION,
  LOGGED_IN
}

/**
 * Enum to track a user through the player creation process
 */
export enum PlayerCreationState {
  PASSWORD,
  PASSWORD_VERIFY,
  DISPLAY_NAME,
  DONE
}
