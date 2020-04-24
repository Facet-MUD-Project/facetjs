const assume = require("assume");
const Item = require("../../lib/item");

describe('Item', () => {
  it('is not a container by default', () => {
    let item = new Item();
    assume(item._isContainer).is.false();
  });
  it('throws an error on contentWeight by default', () => {
    let item = new Item();
    assume(item.contentWeight).throws('is not a container');
  });
});
