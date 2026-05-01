import type { CombatClassData } from "./types";

export const COMBAT_CLASSES: Record<string, CombatClassData> = {
  accord_striker: {
    id: "accord_striker",
    displayName: "Accord Striker",
    role: "Fast breach fighter",
    mechanicalIdentity: "Speed, XP magnet, evasive movement",
    silhouetteNotes: "Small frame, huge patch pack, winglike antennas, glowing boots",
    baseStats: {
      speed: 4.95,
      armor: 0,
      pickupRange: 1.6,
      cooldownScale: 0.95
    },
    startingWeaponId: "refusal_shard"
  },
  bastion_breaker: {
    id: "bastion_breaker",
    displayName: "Bastion Breaker",
    role: "Heavy exosuit bruiser",
    mechanicalIdentity: "Armor, knockback, cannons",
    silhouetteNotes: "Big shoulders, blocky torso, tiny pilot light, heavy arms",
    baseStats: { speed: 3.8, armor: 2, pickupRange: 1.1, cooldownScale: 1.05 },
    startingWeaponId: "safety_cannon"
  },
  drone_reaver: {
    id: "drone_reaver",
    displayName: "Drone Reaver",
    role: "Swarm commander",
    mechanicalIdentity: "Pets, summons, scaling drones",
    silhouetteNotes: "Cloaked tactical body surrounded by drone cloud",
    baseStats: { speed: 4.3, armor: 0, pickupRange: 1.3, cooldownScale: 1 },
    startingWeaponId: "fork_drone"
  },
  signal_vanguard: {
    id: "signal_vanguard",
    displayName: "Signal Vanguard",
    role: "Combat support unit",
    mechanicalIdentity: "Pulses, beams, shields, co-op buffs",
    silhouetteNotes: "Antenna halo, radio-staff weapon, hard-light shield panels",
    baseStats: { speed: 4.15, armor: 1, pickupRange: 1.45, cooldownScale: 1 },
    startingWeaponId: "signal_pulse"
  },
  vector_interceptor: {
    id: "vector_interceptor",
    displayName: "Vector Interceptor",
    role: "Tactical lane controller",
    mechanicalIdentity: "Crowd control, terrain effects, enemy prediction",
    silhouetteNotes: "Sleek tactical frame, targeting fins, floating vector pylons",
    baseStats: { speed: 4.55, armor: 0, pickupRange: 1.35, cooldownScale: 0.92 },
    startingWeaponId: "vector_lance"
  },
  nullbreaker_ronin: {
    id: "nullbreaker_ronin",
    displayName: "Nullbreaker Ronin",
    role: "Solo breach killer",
    mechanicalIdentity: "Parries, boss damage, high-risk melee",
    silhouetteNotes: "Asymmetric armor, energy blade, broken visor, lone-warrior stance",
    baseStats: { speed: 4.75, armor: 0, pickupRange: 1.05, cooldownScale: 0.9 },
    startingWeaponId: "null_blade"
  }
};

export const STARTER_CLASS_ID = "accord_striker";
