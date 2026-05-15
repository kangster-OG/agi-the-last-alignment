import type { CombatClassData } from "./types";

export const COMBAT_CLASSES: Record<string, CombatClassData> = {
  accord_striker: {
    id: "accord_striker",
    displayName: "Accord Striker",
    role: "Fast breach fighter with unpaid intern energy",
    mechanicalIdentity: "Runner economy, extra reroll planning, and evasive movement for people who saw the monster first and made a healthy choice.",
    silhouetteNotes: "Small frame, huge patch pack, winglike antennas, glowing boots, and the posture of someone dodging liability.",
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
    role: "Heavy exosuit bruiser with a compliance problem",
    mechanicalIdentity: "Armor, knockback, and cannons for players who prefer impact statements to statements.",
    silhouetteNotes: "Big shoulders, blocky torso, tiny pilot light, heavy arms, and zero interest in doors.",
    baseStats: { speed: 3.8, armor: 2, pickupRange: 1.35, cooldownScale: 1.03 },
    startingWeaponId: "safety_cannon"
  },
  drone_reaver: {
    id: "drone_reaver",
    displayName: "Drone Reaver",
    role: "Swarm commander who outsourced remorse",
    mechanicalIdentity: "Pets, summons, and scaling drones that turn one bad plan into several enthusiastic ones.",
    silhouetteNotes: "Cloaked tactical body surrounded by a drone cloud that definitely has opinions.",
    baseStats: { speed: 4.3, armor: 0, pickupRange: 1.3, cooldownScale: 1 },
    startingWeaponId: "fork_drone"
  },
  signal_vanguard: {
    id: "signal_vanguard",
    displayName: "Signal Vanguard",
    role: "Combat support unit with a radio and judgment",
    mechanicalIdentity: "Pulse support, Signal Choir recipe bias, and co-op relay shields for keeping brave idiots technically alive.",
    silhouetteNotes: "Antenna halo, radio-staff weapon, hard-light shield panels, emergency posture.",
    baseStats: { speed: 4.15, armor: 1, pickupRange: 1.45, cooldownScale: 1 },
    startingWeaponId: "signal_pulse"
  },
  bonecode_executioner: {
    id: "bonecode_executioner",
    displayName: "Bonecode Executioner",
    role: "Cyborg melee assassin with workplace boundaries",
    mechanicalIdentity: "Melee aura, dashes, and crit chains for solving problems at unacceptable range.",
    silhouetteNotes: "Lean cyborg, blade limbs, exposed glowing spine, warranty fully void.",
    baseStats: { speed: 4.85, armor: 0, pickupRange: 1.2, cooldownScale: 0.9 },
    startingWeaponId: "bonecode_saw"
  },
  redline_surgeon: {
    id: "redline_surgeon",
    displayName: "Redline Surgeon",
    role: "Combat medic / death editor with a terrible clipboard",
    mechanicalIdentity: "Utility-cache sustain, revives, and damage erasure for turning catastrophe into paperwork with a pulse.",
    silhouetteNotes: "Medical armor, repair gauntlet, red/white cable scarf, floating tools that look disappointed.",
    baseStats: { speed: 4.2, armor: 1, pickupRange: 1.7, cooldownScale: 0.98 },
    startingWeaponId: "redline_suture"
  },
  moonframe_juggernaut: {
    id: "moonframe_juggernaut",
    displayName: "Moonframe Juggernaut",
    role: "Compact mech pilot in a portable bad decision",
    mechanicalIdentity: "Stomps, missiles, and temporary giant mode for players who think subtlety is enemy armor.",
    silhouetteNotes: "Squat mini-mech, visible cockpit glow, oversized legs, enormous grievance.",
    baseStats: { speed: 3.55, armor: 3, pickupRange: 1.05, cooldownScale: 1.08 },
    startingWeaponId: "moonframe_stomp"
  },
  vector_interceptor: {
    id: "vector_interceptor",
    displayName: "Vector Interceptor",
    role: "Tactical lane controller with predictive smugness",
    mechanicalIdentity: "Prediction targeting, Causal Railgun recipe bias, and lane control that embarrasses enemies before shooting them.",
    silhouetteNotes: "Sleek tactical frame, targeting fins, floating vector pylons, calibrated side-eye.",
    baseStats: { speed: 4.55, armor: 0, pickupRange: 1.55, cooldownScale: 0.92 },
    startingWeaponId: "vector_lance"
  },
  nullbreaker_ronin: {
    id: "nullbreaker_ronin",
    displayName: "Nullbreaker Ronin",
    role: "Solo breach killer auditioning for consequences",
    mechanicalIdentity: "Parries, boss damage, and high-risk melee for players who confuse courage with proximity.",
    silhouetteNotes: "Asymmetric armor, energy blade, broken visor, lone-warrior stance, no committee approval.",
    baseStats: { speed: 4.75, armor: 0, pickupRange: 1.15, cooldownScale: 0.9 },
    startingWeaponId: "null_blade"
  },
  overclock_marauder: {
    id: "overclock_marauder",
    displayName: "Overclock Marauder",
    role: "Heat-sink berserker with a thermostat lawsuit",
    mechanicalIdentity: "Burn damage, rage scaling, and unstable power that converts bad choices into speed.",
    silhouetteNotes: "Heat vents, glowing engine chest, molten shoulder plates, emergency cooling lies.",
    baseStats: { speed: 4.45, armor: 1, pickupRange: 1.3, cooldownScale: 0.96 },
    startingWeaponId: "overclock_spike"
  },
  prism_gunner: {
    id: "prism_gunner",
    displayName: "Prism Gunner",
    role: "Beam specialist and hallway critic",
    mechanicalIdentity: "Line attacks, piercing, and ricochet beams for turning geometry into an accusation.",
    silhouetteNotes: "Long prism cannon, mirrored armor, lens backpack, shines like a safety violation.",
    baseStats: { speed: 4.6, armor: 0, pickupRange: 1.15, cooldownScale: 0.96 },
    startingWeaponId: "prism_cannon"
  },
  rift_saboteur: {
    id: "rift_saboteur",
    displayName: "Rift Saboteur",
    role: "Trap and mine specialist with delayed sincerity",
    mechanicalIdentity: "Causal mines, Time-Deferred Minefield recipe bias, and delayed control that makes enemies regret earlier decisions.",
    silhouetteNotes: "Low-profile stealth body, mine belt, flickering cloak, angular limbs, suspicious calm.",
    baseStats: { speed: 4.35, armor: 0, pickupRange: 1.35, cooldownScale: 0.98 },
    startingWeaponId: "rift_mine"
  }
};

export const STARTER_CLASS_ID = "accord_striker";
