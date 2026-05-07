import type { Entity, EntityKind } from "./components";

function makeEntity(id: number): Entity {
  return {
    id,
    active: false,
    kind: "enemy",
    worldX: 0,
    worldY: 0,
    vx: 0,
    vy: 0,
    radius: 0.25,
    hp: 1,
    maxHp: 1,
    damage: 1,
    speed: 1,
    life: 0,
    maxLife: 0,
    value: 0,
    color: 0xffffff,
    boss: false,
    label: "",
    sourceRegionId: "",
    enemyFamilyId: ""
  };
}

export class World {
  private nextId = 1;
  readonly entities: Entity[] = [];

  spawn(kind: EntityKind): Entity {
    let entity = this.entities.find((candidate) => !candidate.active);
    if (!entity) {
      entity = makeEntity(this.nextId);
      this.nextId += 1;
      this.entities.push(entity);
    }
    entity.active = true;
    entity.kind = kind;
    entity.vx = 0;
    entity.vy = 0;
    entity.life = 0;
    entity.maxLife = 0;
    entity.value = 0;
    entity.boss = false;
    entity.label = "";
    entity.sourceRegionId = "";
    entity.enemyFamilyId = "";
    return entity;
  }

  active(kind?: EntityKind): Entity[] {
    return this.entities.filter((entity) => entity.active && (!kind || entity.kind === kind));
  }

  clear(): void {
    for (const entity of this.entities) {
      entity.active = false;
    }
  }
}
