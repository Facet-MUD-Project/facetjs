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
  });

  it("contents are undefined by default", () => {
    let item = new Item();
    assume(item.contents).equals(undefined);
  });

  it("can contain things if it is a container", () => {
    let item = new Item();
    item._isContainer = true;
    assume(item.canContain(new Item())).is.true();
  });
});
