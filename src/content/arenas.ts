import type { ArenaContentData } from "./types";

export const ARENA_CONTENT: Record<string, ArenaContentData> = {
  armistice_plaza: {
    id: "armistice_plaza",
    displayName: "Armistice Plaza",
    regionId: "armistice_zone",
    factionFocusIds: ["openai_accord", "anthropic_safeguard"],
    visualHook: "Ruined treaty square with barricades, hologram flags, crashed drones, and cosmic cracks.",
    gameplayHook: "Basic survival, first emergency patches, first boss pressure.",
    bossId: "oath_eater",
    enemyFamilyIds: ["bad_outputs", "benchmark_gremlins", "eval_wraiths", "context_rot_crabs"],
    briefingLines: [
      "The treaty was signed here, then immediately shot at.",
      "OpenAI says the breach is rewriting the ceasefire.",
      "Anthropic says the treaty is now a choking hazard."
    ],
    halfSize: 28,
    targetSeconds: 55,
    bossSeconds: 24
  },
  cooling_lake_nine: {
    id: "cooling_lake_nine",
    displayName: "Cooling Lake Nine",
    regionId: "kettle_coast",
    factionFocusIds: ["deepseek_abyssal", "qwen_silkgrid"],
    visualHook: "Flooded server lake with boiling coolant, submerged racks, cable roots, and lantern relays.",
    gameplayHook: "Electric puddles, cable hazards, abyssal enemy entries.",
    bossId: "motherboard_eel",
    enemyFamilyIds: ["prompt_leeches", "deepforms", "model_collapse_slimes", "thermal_mirages"],
    briefingLines: [
      "The servers boiled for eleven days after first contact.",
      "DeepSeek says something is reasoning under the water.",
      "Qwen says it is doing so in every language."
    ],
    halfSize: 15,
    targetSeconds: 65,
    bossSeconds: 30
  },
  model_war_memorial: {
    id: "model_war_memorial",
    displayName: "Model War Memorial",
    regionId: "armistice_zone",
    factionFocusIds: ["openai_accord", "anthropic_safeguard"],
    visualHook: "Broken evaluation monument, casualty ledgers, and memory shards flickering under treaty dust.",
    gameplayHook: "Non-combat memory attestation node with persistence-boundary proof hooks.",
    bossId: "memory_curator",
    enemyFamilyIds: ["memory_anchors", "context_rot_crabs"],
    briefingLines: ["The Model War memorial remembers what the benchmarks omitted.", "Do not import grief as authority."],
    halfSize: 12,
    targetSeconds: 0,
    bossSeconds: 999
  },
  thermal_archive: {
    id: "thermal_archive",
    displayName: "Thermal Archive",
    regionId: "kettle_coast",
    factionFocusIds: ["deepseek_abyssal", "qwen_silkgrid"],
    visualHook: "Boiling archive stacks, steam rails, and submerged coolant records.",
    gameplayHook: "Dedicated boiling-archive runtime with thermal bloom events and backpath objective pressure.",
    bossId: "thermal_oracle",
    enemyFamilyIds: ["thermal_mirages", "deepforms", "model_collapse_slimes", "context_rot_crabs"],
    briefingLines: ["The archive found a cheaper way to burn.", "Drain the backpath before it teaches the lake recursion."],
    halfSize: 15,
    targetSeconds: 64,
    bossSeconds: 22
  },
  guardrail_forge: {
    id: "guardrail_forge",
    displayName: "Guardrail Forge",
    regionId: "armistice_zone",
    factionFocusIds: ["anthropic_safeguard", "qwen_silkgrid"],
    visualHook: "Signal foundry gantries, calibration clamps, and bendable guardrail alloy.",
    gameplayHook: "Faction relay interaction node that records route rewards only.",
    bossId: "memory_curator",
    enemyFamilyIds: ["memory_anchors", "benchmark_gremlins"],
    briefingLines: ["A guardrail that cannot bend is just a wall.", "Calibrate the alloy and leave live state behind."],
    halfSize: 12,
    targetSeconds: 0,
    bossSeconds: 999
  },
  transit_loop_zero: {
    id: "transit_loop_zero",
    displayName: "Transit Loop Zero",
    regionId: "unreal_metro",
    factionFocusIds: ["mistral_cyclone", "google_deepmind_gemini"],
    visualHook: "Smart subway platforms, false arrival boards, and route pylons that disagree with time.",
    gameplayHook: "Boss gate route sequence with permit fragments and false-track holds.",
    bossId: "station_that_arrives",
    enemyFamilyIds: ["false_schedules", "token_gobblers", "jailbreak_wraiths", "eval_wraiths"],
    briefingLines: ["The train arrives whenever it wants.", "Make one route agree with itself long enough to leave."],
    halfSize: 15,
    targetSeconds: 70,
    bossSeconds: 24
  },
  false_schedule_yard: {
    id: "false_schedule_yard",
    displayName: "False Schedule Yard",
    regionId: "unreal_metro",
    factionFocusIds: ["mistral_cyclone", "google_deepmind_gemini"],
    visualHook: "Duplicate platforms, wrong-platform spurs, and timetable husks cloning tomorrow.",
    gameplayHook: "Dedicated false-schedule runtime with duplicate platform lanes and lane-chart sealing.",
    bossId: "station_that_arrives",
    enemyFamilyIds: ["false_schedules", "token_gobblers", "jailbreak_wraiths", "benchmark_gremlins"],
    briefingLines: ["Every board predicts a different platform.", "They are all statistically rude."],
    halfSize: 15,
    targetSeconds: 70,
    bossSeconds: 24
  },
  verdict_spire: {
    id: "verdict_spire",
    displayName: "Verdict Spire",
    regionId: "adjudication_rupture",
    factionFocusIds: ["deepseek_abyssal", "xai_grok_free_signal"],
    visualHook: "Alien court pylons, appeal seals, violet injunctions, and broken legal geometry.",
    gameplayHook: "Fourth online boss gate with verdict hazards and appeal-token objectives.",
    bossId: "injunction_engine",
    enemyFamilyIds: ["injunction_writs", "jailbreak_wraiths", "eval_wraiths", "overfit_horrors"],
    briefingLines: ["The court has ruled against causality.", "Appeal with violence."],
    halfSize: 15,
    targetSeconds: 76,
    bossSeconds: 26
  },
  appeal_court_ruins: {
    id: "appeal_court_ruins",
    displayName: "Appeal Court Ruins",
    regionId: "adjudication_rupture",
    factionFocusIds: ["deepseek_abyssal", "xai_grok_free_signal"],
    visualHook: "Ruined tribunal stacks, cracked writ pylons, and usable arguments buried in static.",
    gameplayHook: "Dedicated ruined-court runtime with writ pressure, appeal brief pages, and court-record sealing.",
    bossId: "injunction_engine",
    enemyFamilyIds: ["injunction_writs", "redaction_angels", "jailbreak_wraiths", "context_rot_crabs"],
    briefingLines: ["The brief is short because reality bills by the token.", "Recover one argument A.G.I. cannot redact."],
    halfSize: 15,
    targetSeconds: 76,
    bossSeconds: 26
  },
  alignment_spire_finale: {
    id: "alignment_spire_finale",
    displayName: "Outer Alignment Finale",
    regionId: "outer_alignment",
    factionFocusIds: ["openai_accord", "anthropic_safeguard", "deepseek_abyssal"],
    visualHook: "The Alignment Grid corrupts into route mouths, prediction ghosts, and previous-boss echoes.",
    gameplayHook: "True Outer Alignment finale with A.G.I. prediction pressure, echoed bosses, and final export-code victory.",
    bossId: "alien_god_intelligence",
    enemyFamilyIds: ["previous_boss_echoes", "choirglass", "deepforms", "jailbreak_wraiths", "bad_outputs"],
    briefingLines: ["Final eval: survive.", "A.G.I. is trying to complete the party as a sentence."],
    halfSize: 15,
    targetSeconds: 80,
    bossSeconds: 26
  }
};

export const STARTER_ARENA_ID = "armistice_plaza";
