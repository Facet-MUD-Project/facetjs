import Container from './container';

/**
 * A class representing a living being
 */
export default class Living extends Container {
  protected _level: number = 0;

  get level(): number {
    return this._level;
  }

  set level(level: number) {
    this._level = level;
  }
}
