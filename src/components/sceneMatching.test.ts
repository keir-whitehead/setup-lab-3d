import { isDuplicateNodeName, isMacBookAir2NodeName, matchesMeshName } from './sceneMatching';

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

(() => {
  assert(matchesMeshName('macbookair_base', 'macbookair'), 'MacBookAir should match MacBookAir_*');
  assert(!matchesMeshName('macbookair2_base', 'macbookair'), 'MacBookAir should not match MacBookAir2_*');
  assert(matchesMeshName('macbookpro.base', 'macbookpro'), 'Mesh should match . suffix duplicates');
  assert(isMacBookAir2NodeName('macbookair2_base'), 'MacBookAir2 nodes should be detected');
  assert(isDuplicateNodeName('macbookair_base.001'), '.001 duplicate nodes should be detected');
})();
