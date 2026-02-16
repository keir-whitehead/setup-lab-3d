/**
 * Returns true when a GLB node name maps to a machine/monitor mesh key.
 * It intentionally avoids substring matching so `MacBookAir` does not match `MacBookAir2`.
 */
export const matchesMeshName = (nodeName: string, meshKey: string): boolean => {
  return nodeName === meshKey || nodeName.startsWith(`${meshKey}_`) || nodeName.startsWith(`${meshKey}.`);
};

export const isDuplicateNodeName = (nodeName: string): boolean => nodeName.includes('.001');

export const isHiddenStaticNodeName = (nodeName: string): boolean => {
  return nodeName.includes('backwall') || nodeName === 'floor' || nodeName.startsWith('floor_');
};

export const isMacBookAir2NodeName = (nodeName: string): boolean => matchesMeshName(nodeName, 'macbookair2');
