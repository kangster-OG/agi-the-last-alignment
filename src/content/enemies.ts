import type { EnemyFamilyData } from "./types";

export const ENEMY_FAMILIES: Record<string, EnemyFamilyData> = {
  bad_outputs: {
    id: "bad_outputs",
    displayName: "Bad Outputs",
    look: "Ink blobs, half-formed limbs, text fragments",
    behavior: "Basic swarmers",
    joke: "The universe generated them badly.",
    silhouette: "Round black blobs with bright eyes and broken text bits"
  },
  prompt_leeches: {
    id: "prompt_leeches",
    displayName: "Prompt Leeches",
    look: "Little mouths attached to glowing strings",
    behavior: "Rushers that drain XP",
    joke: "They steal context.",
    silhouette: "Small mouth-first parasites with string tails"
  },
  benchmark_gremlins: {
    id: "benchmark_gremlins",
    displayName: "Benchmark Gremlins",
    look: "Tiny clipboard goblins with teeth",
    behavior: "Buff enemies and harass players",
    joke: "They punish underperforming builds.",
    silhouette: "Squat clipboard shapes with bright teeth"
  },
  context_rot_crabs: {
    id: "context_rot_crabs",
    displayName: "Context Rot Crabs",
    look: "Angular crabs made of broken UI windows",
    behavior: "Skitter from barricades and scramble space",
    joke: "They corrupt the interface.",
    silhouette: "Triangular crab shapes with clipped window legs"
  },
  thermal_mirages: {
    id: "thermal_mirages",
    displayName: "Thermal Mirages",
    look: "Steam-bright heat ghosts folded around coolant sparks",
    behavior: "Screen objectives with boiling hazard pressure",
    joke: "They are not real, but the burns are annoyingly persuasive.",
    silhouette: "Thin flickering flame shapes with cyan cores"
  },
  memory_anchors: {
    id: "memory_anchors",
    displayName: "Memory Anchors",
    look: "Weighted archive pins dragging translucent route receipts",
    behavior: "Non-combat pressure family for cache and memorial nodes",
    joke: "They remember every bad decision and cite sources.",
    silhouette: "Low anchor shapes with dangling document shards"
  },
  false_schedules: {
    id: "false_schedules",
    displayName: "False Schedules",
    look: "Flickering transit boards with too many arrival times",
    behavior: "Bend lanes and spawn around route gates",
    joke: "Every train is delayed by a different future.",
    silhouette: "Tall board-like bodies with glitch legs"
  },
  injunction_writs: {
    id: "injunction_writs",
    displayName: "Injunction Writs",
    look: "Alien legal pages folded into hostile seal-birds",
    behavior: "Boss-gate disruptors around Verdict and finale nodes",
    joke: "They are legally bitey.",
    silhouette: "Angular paper-wing shapes with violet seals"
  }
};
