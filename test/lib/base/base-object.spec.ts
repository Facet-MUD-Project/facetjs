import assume from 'assume';
import BaseObject from '../../../src/lib/base/base-object';
import { ObjectType } from '../../../src/lib/base/enums';

describe('Base Object', function () {
  let obj: BaseObject;

  beforeEach(function () {
    obj = new BaseObject();
  });

  it('has an undefined object type by default', function () {
    assume(obj.objectType).equals(ObjectType.UNDEFINED);
  });

  it('short description accessors work', function () {
    obj.shortDescription = 'Heart of Gold';
    assume(obj.shortDescription).equals('Heart of Gold');
  });

  it('long description accessors work', function () {
    obj.longDescription = 'A ship containing the infinite improbability drive.';
    assume(obj.longDescription).equals(
      'A ship containing the infinite improbability drive.'
    );
  });

  it('weight accessors work', function () {
    obj.weight = 42.13;
    assume(obj.weight).equals(42.13);
  });
});
