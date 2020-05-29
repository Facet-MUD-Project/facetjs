import assume from 'assume';
import Item from '../../../src/lib/base/item';

describe('Item', () => {
  let item: Item;

  beforeEach(() => {
    item = new Item();
  });

  it('is not a container by default', () => {
    assume((item as any)._isContainer).is.false();
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
    (item as any)._isContainer = true;
    assume(item.canContain(new Item())).is.true();
  });
});
