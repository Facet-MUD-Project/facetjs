const assume = require('assume');
const Container = require('../../lib/container');

describe('Container', () => {
  let container;

  beforeEach(() => {
    container = new Container();
  });

  it('has no contents by default', () => {
    assume(container.contents).eqls([]);
  });

  it('has no content weight by default', () => {
    assume(container.contentWeight).equals(0.0);
  });

  it('can hold infinite weight by default', () => {
    assume(container.maxContentWeight).is.not.finite();
  });

  it('can hold an infinite number of items by default', () => {
    assume(container.maxContentCount).is.not.finite();
  });

  it('will let items be added to it', () => {
    const other = new Container();
    container.addObject(other);
    assume(container.contains(other)).is.true();
  });

  it('content weight grows based on contents', () => {
    const other1 = new Container(), other2 = new Container();
    other1.weight = 15;
    other2.weight = 27;
    container.addObject(other1).addObject(other2);
    assume(container.contentWeight).equals(42);
  });
});
