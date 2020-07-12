import assume from 'assume';
import Item from '../../../src/lib/base/item';

describe('Item', () => {
  let item: Item;

  beforeEach(() => {
    item = new Item();
  });

  it('is not a container by default', () => {
    // @ts-ignore
    assume(item._isContainer).is.false();
  });

  it('contentWeight is undefined by default', () => {
    assume(item.contentWeight).equals(null);
  });

  it('cannot contain anything by default', () => {
    assume(item.canContain(new Item())).is.false();
  });

  it('contents are undefined by default', () => {
    assume(item.contents).equals(null);
  });

  it('can contain things if it is a container', () => {
    // @ts-ignore
    item._isContainer = true;
    assume(item.canContain(new Item())).is.true();
  });
});
