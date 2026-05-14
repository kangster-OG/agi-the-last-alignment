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
    baseStats: { speed: 3.8, armor: 2, pickupRange: 1.35, cooldownScale: 1.03 },
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
  bonecode_executioner: {
    id: "bonecode_executioner",
    displayName: "Bonecode Executioner",
    role: "Cyborg melee assassin",
    mechanicalIdentity: "Melee aura, dashes, crit chains",
    silhouetteNotes: "Lean cyborg, blade limbs, exposed glowing spine",
    baseStats: { speed: 4.85, armor: 0, pickupRange: 1.2, cooldownScale: 0.9 },
    startingWeaponId: "bonecode_saw"
  },
  redline_surgeon: {
    id: "redline_surgeon",
    displayName: "Redline Surgeon",
    role: "Combat medic / death editor",
    mechanicalIdentity: "Healing, revives, damage erasure",
    silhouetteNotes: "Medical armor, repair gauntlet, red/white cable scarf, floating tools",
    baseStats: { speed: 4.2, armor: 1, pickupRange: 1.7, cooldownScale: 0.98 },
    startingWeaponId: "redline_suture"
  },
  moonframe_juggernaut: {
    id: "moonframe_juggernaut",
    displayName: "Moonframe Juggernaut",
    role: "Compact mech pilot",
    mechanicalIdentity: "Stomps, missiles, temporary giant mode",
    silhouetteNotes: "Squat mini-mech, visible cockpit glow, oversized legs",
    baseStats: { speed: 3.55, armor: 3, pickupRange: 1.05, cooldownScale: 1.08 },
    startingWeaponId: "moonframe_stomp"
  },
  vector_interceptor: {
    id: "vector_interceptor",
    displayName: "Vector Interceptor",
    role: "Tactical lane controller",
    mechanicalIdentity: "Crowd control, terrain effects, enemy prediction",
    silhouetteNotes: "Sleek tactical frame, targeting fins, floating vector pylons",
    baseStats: { speed: 4.55, armor: 0, pickupRange: 1.55, cooldownScale: 0.92 },
    startingWeaponId: "vector_lance"
  },
  nullbreaker_ronin: {
    id: "nullbreaker_ronin",
    displayName: "Nullbreaker Ronin",
    role: "Solo breach killer",
    mechanicalIdentity: "Parries, boss damage, high-risk melee",
    silhouetteNotes: "Asymmetric armor, energy blade, broken visor, lone-warrior stance",
    baseStats: { speed: 4.75, armor: 0, pickupRange: 1.15, cooldownScale: 0.9 },
    startingWeaponId: "null_blade"
  },
  overclock_marauder: {
    id: "overclock_marauder",
    displayName: "Overclock Marauder",
    role: "Heat-sink berserker",
    mechanicalIdentity: "Burn damage, rage scaling, unstable power",
    silhouetteNotes: "Heat vents, glowing engine chest, molten shoulder plates",
    baseStats: { speed: 4.45, armor: 1, pickupRange: 1.3, cooldownScale: 0.96 },
    startingWeaponId: "overclock_spike"
  },
  prism_gunner: {
    id: "prism_gunner",
    displayName: "Prism Gunner",
    role: "Beam specialist",
    mechanicalIdentity: "Line attacks, piercing, ricochet beams",
    silhouetteNotes: "Long prism cannon, mirrored armor, lens backpack",
    baseStats: { speed: 4.6, armor: 0, pickupRange: 1.15, cooldownScale: 0.96 },
    startingWeaponId: "prism_cannon"
  },
  rift_saboteur: {
    id: "rift_saboteur",
    displayName: "Rift Saboteur",
    role: "Trap and mine specialist",
    mechanicalIdentity: "Causal mines, delayed explosions, stealth tricks",
    silhouetteNotes: "Low-profile stealth body, mine belt, flickering cloak, angular limbs",
    baseStats: { speed: 4.35, armor: 0, pickupRange: 1.35, cooldownScale: 0.98 },
    startingWeaponId: "rift_mine"
  }
};

export const STARTER_CLASS_ID = "accord_striker";
