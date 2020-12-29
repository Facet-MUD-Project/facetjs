import assume from 'assume';
import Living from '../../../src/lib/base/living';

describe('Living Objects', function () {
  let living: Living;

  beforeEach(function () {
    living = new Living();
  });

  it('level accessors work', function () {
    living.level = 42;
    assume(living.level).equals(42);
  });
});
