const assume = require("assume");
const Item = require("../../lib/item");

describe("Item", () => {
  it("is not a container by default", () => {
    let item = new Item();
    assume(item._isContainer).is.false();
  });

  it("contentWeight is undefined by default", () => {
    let item = new Item();
    assume(item.contentWeight).equals(undefined);
  });

  it("cannot contain anything by default", () => {
    let item = new Item();
    assume(item.canContain()).is.false();
  })
});
