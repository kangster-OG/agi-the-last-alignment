export type EntityKind = "enemy" | "projectile" | "pickup" | "particle" | "damageText";

export interface Entity {
  id: number;
  active: boolean;
  kind: EntityKind;
  worldX: number;
  worldY: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  life: number;
  maxLife: number;
  value: number;
  color: number;
  boss: boolean;
  label: string;
  sourceRegionId: string;
  enemyFamilyId: string;
}

export interface Player {
  worldX: number;
  worldY: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  dashCooldown: number;
  dashTime: number;
  xp: number;
  level: number;
  invuln: number;
  damageFlash: number;
  hpPulse: number;
  staggerTime: number;
  lastDamage: number;
  damageFeedbackCooldown: number;
}
