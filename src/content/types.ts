export interface FactionData {
  id: string;
  displayName: string;
  shortName: string;
  doctrine: string;
  gameplayTags: string[];
  visualTags: string[];
  upgradePoolIds: string[];
  banterStyle: string;
}

export interface CombatClassData {
  id: string;
  displayName: string;
  role: string;
  mechanicalIdentity: string;
  silhouetteNotes: string;
  baseStats: {
    speed: number;
    armor: number;
    pickupRange: number;
    cooldownScale: number;
  };
  startingWeaponId: string;
}

export interface EnemyFamilyData {
  id: string;
  displayName: string;
  look: string;
  behavior: string;
  joke: string;
  silhouette: string;
}

export interface BossData {
  id: string;
  displayName: string;
  titleCard: string;
  subtitle: string;
  mechanics: string[];
}

export interface RegionData {
  id: string;
  displayName: string;
  factionFocusIds: string[];
  visualTags: string[];
  tone: string;
  signatureJoke: string;
}

export interface ArenaContentData {
  id: string;
  displayName: string;
  regionId: string;
  factionFocusIds: string[];
  visualHook: string;
  gameplayHook: string;
  bossId?: string;
  enemyFamilyIds: string[];
  briefingLines: string[];
  halfSize: number;
  targetSeconds: number;
  bossSeconds: number;
}

export interface UpgradeContentData {
  id: string;
  displayName: string;
  factionId?: string;
  tags: string[];
  description: string;
  evolution?: {
    requiredUpgradeId: string;
    evolvedUpgradeId: string;
  };
}
