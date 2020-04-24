const assume = require("assume");
const Container = require("../../lib/container");

describe("Container", () => {
  it("has no contents by default", () => {
    let container = new Container();
    assume(container.contents).eqls([]);
  });

  it("has no content weight by default", () => {
    let container = new Container();
    assume(container.contentWeight).equals(0.0);
  });

  it("can hold infinite weight by default", () => {
    let container = new Container();
    assume(container.maxContentWeight).is.not.finite();
  });

  it("can hold an infinite number of items by default", () => {
    let container = new Container();
    assume(container.maxContentCount).is.not.finite();
  });

  it("will let items be added to it", () => {
    let container = new Container(),
        other = new Container();
    container.addObject(other);
    assume(container.contains(other)).is.true();
  });

  it("content weight grows based on contents", () => {
    let container = new Container(),
        other1 = new Container(),
        other2 = new Container();
    other1.weight = 15;
    other2.weight = 27;
    container.addObject(other1).addObject(other2);
    assume(container.contentWeight).equals(42);
  });
})
