const assume = require('assume');
const Item = require('../../lib/item');

describe('Item', () => {
  let item;

  beforeEach(() => {
    item = new Item();
  });

  it('is not a container by default', () => {
    assume(item._isContainer).is.false();
  });

  it('contentWeight is undefined by default', () => {
    assume(item.contentWeight).equals(null);
  });

  it('cannot contain anything by default', () => {
    assume(item.canContain()).is.false();
  });

  it('contents are undefined by default', () => {
    assume(item.contents).equals(null);
  });

  it('can contain things if it is a container', () => {
    item._isContainer = true;
    assume(item.canContain(new Item())).is.true();
  });
});
