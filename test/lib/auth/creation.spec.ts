import assume from 'assume';
import PlayerCreation from '../../../src/lib/auth/creation';

describe('Player Creation', () => {
  let creation;

  before(() => {
    creation = PlayerCreation.getInstance();
  });

  it('is a singleton', () => {
    const creation2 = PlayerCreation.getInstance();
    assume(creation).equals(creation2);
  });
})
