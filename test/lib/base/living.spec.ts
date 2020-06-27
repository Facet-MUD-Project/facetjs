import assume from 'assume';
import Living from '../../../src/lib/base/living';

describe('Living Objects', () => {
  let living: Living;

  beforeEach(() => {
    living = new Living();
  });

  it('level accessors work', () => {
    living.level = 42;
    assume(living.level).equals(42);
  });
});
