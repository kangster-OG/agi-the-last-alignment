import type { Player } from "../ecs/components";
import { screenVectorToWorld } from "../iso/projection";
import type { Input } from "../core/Input";
import type { BuildStats } from "./upgrades";
import type { PlayerInputCommand } from "../sim/consensusCell";

export function createPlayer(): Player {
  return {
    worldX: 0,
    worldY: 0,
    vx: 0,
    vy: 0,
    radius: 0.42,
    hp: 100,
    maxHp: 100,
    speed: 4.85,
    dashCooldown: 0,
    dashTime: 0,
    xp: 0,
    level: 1,
    invuln: 0
  };
}

export function updatePlayer(player: Player, input: Input, build: BuildStats, dt: number): void {
  const axis = input.axis();
  updatePlayerFromCommand(
    player,
    {
      schemaVersion: 1,
      tick: 0,
      playerId: "p1",
      sequence: 0,
      axisX: axis.x,
      axisY: axis.y,
      dashPressed: input.wasPressed("dash"),
      interactPressed: input.wasPressed("interact")
    },
    build,
    dt
  );
}

export function updatePlayerFromCommand(player: Player, command: PlayerInputCommand, build: BuildStats, dt: number): void {
  const axis = { x: command.axisX, y: command.axisY };
  const world = screenVectorToWorld(axis.x, axis.y);
  let vx = world.worldX;
  let vy = world.worldY;
  const len = Math.hypot(vx, vy) || 1;
  vx /= len;
  vy /= len;

  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  player.invuln = Math.max(0, player.invuln - dt);
  if (command.dashPressed && player.dashCooldown <= 0) {
    player.dashTime = 0.16;
    player.dashCooldown = 1.2;
    player.invuln = Math.max(player.invuln, 0.22);
  }
  player.dashTime = Math.max(0, player.dashTime - dt);

  const dashMultiplier = player.dashTime > 0 ? 2.9 : 1;
  const speed = player.speed + build.moveSpeedBonus;
  player.vx = vx * speed * dashMultiplier;
  player.vy = vy * speed * dashMultiplier;
  if (axis.x === 0 && axis.y === 0) {
    player.vx = 0;
    player.vy = 0;
  }
  player.worldX += player.vx * dt;
  player.worldY += player.vy * dt;
}

export function xpNeeded(level: number): number {
  return 5 + level * 4;
}
