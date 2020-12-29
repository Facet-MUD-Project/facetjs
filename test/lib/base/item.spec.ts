import assume from 'assume';
import Item from '../../../src/lib/base/item';

describe('Item', function () {
  let item: Item;

  beforeEach(function () {
    item = new Item();
  });

  it('is not a container by default', function () {
    // @ts-ignore
    assume(item._isContainer).is.false();
  });

  it('contentWeight is undefined by default', function () {
    assume(item.contentWeight).equals(null);
  });

  it('cannot contain anything by default', function () {
    assume(item.canContain(new Item())).is.false();
  });

  it('contents are undefined by default', function () {
    assume(item.contents).equals(null);
  });

  it('can contain things if it is a container', function () {
    // @ts-ignore
    item._isContainer = true;
    assume(item.canContain(new Item())).is.true();
  });
});
