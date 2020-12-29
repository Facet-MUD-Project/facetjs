import assume from 'assume';
import Container from '../../../src/lib/base/container';
import Room from '../../../src/lib/base/room';
import { CannotContain, AlreadyContains, CannotRelease } from '../../../src/lib/base/exceptions';

describe('Container', function () {
  let container: Container;

  beforeEach(function () {
    container = new Container();
  });

  it('has no contents by default', function () {
    assume(container.contents).eqls([]);
  });

  it('has no content weight by default', function () {
    assume(container.contentWeight).equals(0.0);
  });

  it('can hold infinite weight by default', function () {
    assume(container.maxContentWeight).is.not.finite();
  });

  it('can hold an infinite number of items by default', function () {
    assume(container.maxContentCount).is.not.finite();
  });

  it('will let items be added to it', function () {
    const other = new Container();
    container.addObject(other);
    assume(container.contains(other)).is.true();
  });

  it('content weight grows based on contents', function () {
    const other1 = new Container(), other2 = new Container();
    other1.weight = 15;
    other2.weight = 27;
    container.addObject(other1);
    container.addObject(other2);
    assume(container.contentWeight).equals(42);
  });

  it('cannot contain more than max number of items', function () {
    const other1 = new Container(), other2 = new Container();
    container.maxContentCount = 1;
    container.addObject(other1);
    assume(() => container.addObject(other2)).throws(CannotContain);
  });

  it('cannot contain more than its max weight', function () {
    const other = new Container();
    container.maxContentWeight = 1.0;
    other.weight = 42;
    assume(() => container.addObject(other)).throws(CannotContain);
  });

  it('cannot add an object which it already contains', function () {
    const other = new Container();
    container.addObject(other);
    assume(() => container.addObject(other)).throws(AlreadyContains);
  });

  it('cannot contain an object which does not allow itself to be contained', function () {
    const room = new Room();
    assume(() => container.addObject(room)).throws(CannotContain);
  });

  it('cannot release objects which it does not contain', function () {
    const other = new Container();
    assume(container.canRelease(other)).is.false();
  });

  it('can release objects which it does contain', function () {
    const other = new Container();
    container.addObject(other);
    assume(container.canRelease(other)).is.true();
  });

  it('will let items be removed from it', function () {
    const other = new Container();
    container.addObject(other).removeObject(other);
    assume(container.contents).to.be.empty();
  });

  it('errors when removing an object which it cannot release', function () {
    const other = new Container();
    assume(() => container.removeObject(other)).to.throw(CannotRelease);
  });
});
