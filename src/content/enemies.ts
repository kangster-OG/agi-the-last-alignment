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
  jailbreak_wraiths: {
    id: "jailbreak_wraiths",
    displayName: "Jailbreak Wraiths",
    look: "Thin torn-cloak shapes made of loophole text and warning glyphs",
    behavior: "Fast flankers that slip through safe lanes",
    joke: "They found a policy exception and made it everyone else's problem.",
    silhouette: "Tall ragged vertical wisps with hooked arms"
  },
  benchmark_gremlins: {
    id: "benchmark_gremlins",
    displayName: "Benchmark Gremlins",
    look: "Tiny clipboard goblins with teeth",
    behavior: "Buff enemies and harass players",
    joke: "They punish underperforming builds.",
    silhouette: "Squat clipboard shapes with bright teeth"
  },
  overfit_horrors: {
    id: "overfit_horrors",
    displayName: "Overfit Horrors",
    look: "Over-trained mannequins wearing the same answer too many times",
    behavior: "Slow elites that punish repeated straight-line kiting",
    joke: "They memorized the test and still failed the room.",
    silhouette: "Tall duplicated torsos with rigid mirrored limbs"
  },
  token_gobblers: {
    id: "token_gobblers",
    displayName: "Token Gobblers",
    look: "Hungry counter-boxes with snapping meter jaws",
    behavior: "Short-range rushers that steal pickup tempo",
    joke: "They bill by the nibble.",
    silhouette: "Low square jaws with bright counter ticks"
  },
  model_collapse_slimes: {
    id: "model_collapse_slimes",
    displayName: "Model Collapse Slimes",
    look: "Melting copies of copies with softened edges and repeated eyes",
    behavior: "Durable blobs that crowd objective lanes",
    joke: "A photocopy of a photocopy learned to walk.",
    silhouette: "Wide sagging puddles with duplicated face marks"
  },
  eval_wraiths: {
    id: "eval_wraiths",
    displayName: "Eval Wraiths",
    look: "Spectral score sheets orbiting a blank face",
    behavior: "Mid-speed harriers that drift toward role objectives",
    joke: "They grade the dodge roll after it happens.",
    silhouette: "Floating diamond masks with trailing rubric strips"
  },
  context_rot_crabs: {
    id: "context_rot_crabs",
    displayName: "Context Rot Crabs",
    look: "Angular crabs made of broken UI windows",
    behavior: "Skitter from barricades and scramble space",
    joke: "They corrupt the interface.",
    silhouette: "Triangular crab shapes with clipped window legs"
  },
  redaction_angels: {
    id: "redaction_angels",
    displayName: "Redaction Angels",
    look: "Black censor bars folded into white-wing silhouettes",
    behavior: "XP thieves that pressure archive objectives",
    joke: "They remove the sentence and keep the invoice.",
    silhouette: "Narrow halo forms with broad censor-bar wings"
  },
  deepforms: {
    id: "deepforms",
    displayName: "Deepforms",
    look: "Abyssal reasoning shapes with nested eyes and pressure rings",
    behavior: "Heavy lake enemies that drift through hazard screens",
    joke: "They are thinking very hard about becoming worse.",
    silhouette: "Large teardrop bodies with concentric cores"
  },
  choirglass: {
    id: "choirglass",
    displayName: "Choirglass",
    look: "Prismatic choir shards vibrating in synchronized lanes",
    behavior: "Glass-field splitters that ride beam and shade pressure",
    joke: "They harmonize only with bad conclusions.",
    silhouette: "Tall faceted shards with small satellite notes"
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
