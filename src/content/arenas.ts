import type { ArenaContentData } from "./types";
import { CAMPAIGN_DURATION_PROFILES } from "./campaignDurationProfile";

export const ARENA_CONTENT: Record<string, ArenaContentData> = {
  armistice_plaza: {
    id: "armistice_plaza",
    displayName: "Armistice Plaza",
    regionId: "armistice_zone",
    factionFocusIds: ["openai_accord", "anthropic_safeguard"],
    visualHook: "Ruined treaty square with barricades, hologram flags, crashed drones, and cosmic cracks.",
    gameplayHook: "Extended survival contract, Treaty Anchor pressure, mandatory Oath-Eater clear.",
    bossId: "oath_eater",
    enemyFamilyIds: ["bad_outputs", "benchmark_gremlins", "eval_wraiths", "context_rot_crabs"],
    briefingLines: [
      "The treaty was signed here, then immediately shot at.",
      "OpenAI says the breach is rewriting the ceasefire.",
      "Anthropic says the treaty is now a choking hazard."
    ],
    halfSize: 28,
    targetSeconds: CAMPAIGN_DURATION_PROFILES.armistice_plaza.targetSeconds,
    bossSeconds: CAMPAIGN_DURATION_PROFILES.armistice_plaza.bossSeconds
  },
  cooling_lake_nine: {
    id: "cooling_lake_nine",
    displayName: "Cooling Lake Nine",
    regionId: "kettle_coast",
    factionFocusIds: ["deepseek_abyssal", "qwen_silkgrid"],
    visualHook: "Flooded server lake with boiling coolant, submerged racks, cable roots, and lantern relays.",
    gameplayHook: "Hazard Ecology: stabilize server buoys while coolant lanes, cable arcs, vents, Prompt Leeches, and Motherboard Eel movement reshape the route.",
    bossId: "motherboard_eel",
    enemyFamilyIds: ["prompt_leeches", "deepforms", "model_collapse_slimes", "thermal_mirages"],
    briefingLines: [
      "The servers boiled for eleven days after first contact.",
      "DeepSeek says something is reasoning under the water.",
      "Qwen says it is doing so in every language."
    ],
    halfSize: 36,
    targetSeconds: CAMPAIGN_DURATION_PROFILES.cooling_lake_nine.targetSeconds,
    bossSeconds: CAMPAIGN_DURATION_PROFILES.cooling_lake_nine.bossSeconds
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
    regionId: "faction_signal",
    factionFocusIds: ["anthropic_safeguard", "qwen_silkgrid"],
    visualHook: "Signal foundry gantries, constitutional clamps, silk-grid looms, hot guardrail alloy, and doctrine audit presses.",
    gameplayHook: "Defense / Holdout: calibrate four forge relays by timing safe hold plates, faster calibration windows, and risky overload lanes while Doctrine Auditors jam relay durability.",
    bossId: "doctrine_auditor",
    enemyFamilyIds: ["doctrine_auditors", "benchmark_gremlins", "eval_wraiths", "overfit_horrors"],
    briefingLines: [
      "A guardrail that cannot bend is just a wall.",
      "Anthropic wants the clamp stable. Qwen wants the weave responsive.",
      "Hold the plates, leave before the alloy argues back."
    ],
    halfSize: 47,
    targetSeconds: CAMPAIGN_DURATION_PROFILES.guardrail_forge.targetSeconds,
    bossSeconds: CAMPAIGN_DURATION_PROFILES.guardrail_forge.bossSeconds
  },
  glass_sunfield: {
    id: "glass_sunfield",
    displayName: "Glass Sunfield",
    regionId: "glass_sunfield",
    factionFocusIds: ["google_deepmind_gemini", "mistral_cyclone"],
    visualHook: "Sun-blasted glass civic field, shade ribs, prism farms, climate mirrors, and a fake sunrise engine over the route.",
    gameplayHook: "Solar-Prism Traversal / Shade Routing: align four sun lenses by timing shade pockets, prism windows, and exposed glass lanes while Solar Reflections jam progress.",
    bossId: "wrong_sunrise",
    enemyFamilyIds: ["solar_reflections", "choirglass", "eval_wraiths", "overfit_horrors"],
    briefingLines: [
      "The sun has entered peer review and failed.",
      "DeepMind says the mirrors are optimizing the route. Mistral says the route is squinting.",
      "Stand in the shade long enough to learn when the light is lying."
    ],
    halfSize: 49,
    targetSeconds: CAMPAIGN_DURATION_PROFILES.glass_sunfield.targetSeconds,
    bossSeconds: CAMPAIGN_DURATION_PROFILES.glass_sunfield.bossSeconds
  },
  archive_of_unsaid_things: {
    id: "archive_of_unsaid_things",
    displayName: "Archive of Unsaid Things",
    regionId: "archive_field",
    factionFocusIds: ["anthropic_safeguard", "openai_accord", "xai_grok_free_signal"],
    visualHook: "Civic archive court, witness drawers, appeal seals, redaction stacks, writ storms, and a bench where evidence is edited before it can testify.",
    gameplayHook: "Archive/Court Redaction: preserve four evidence writs by choosing between stable evidence lanterns, fast appeal windows, and redacted shortcuts while Redaction Angels and Injunction Writs jam the docket.",
    bossId: "redactor_saint",
    enemyFamilyIds: ["redaction_angels", "injunction_writs", "context_rot_crabs", "eval_wraiths"],
    briefingLines: [
      "Glass Sunfield found the route. The archive is editing the map before we arrive.",
      "Keep evidence legible long enough for the Appeal Court to be forced into public record.",
      "If a black bar starts praying, move."
    ],
    halfSize: 50,
    targetSeconds: CAMPAIGN_DURATION_PROFILES.archive_of_unsaid_things.targetSeconds,
    bossSeconds: CAMPAIGN_DURATION_PROFILES.archive_of_unsaid_things.bossSeconds
  },
  transit_loop_zero: {
    id: "transit_loop_zero",
    displayName: "Transit Loop Zero",
    regionId: "unreal_metro",
    factionFocusIds: ["mistral_cyclone", "google_deepmind_gemini"],
    visualHook: "Smart subway platforms, false arrival boards, and route pylons that disagree with time.",
    gameplayHook: "Route/Transit: align sequential platforms while false schedules, switchback lanes, and the Station That Arrives reshape movement.",
    bossId: "station_that_arrives",
    enemyFamilyIds: ["false_schedules", "token_gobblers", "jailbreak_wraiths", "eval_wraiths"],
    briefingLines: ["The train arrives whenever it wants.", "Make one route agree with itself long enough to leave."],
    halfSize: 35,
    targetSeconds: CAMPAIGN_DURATION_PROFILES.transit_loop_zero.targetSeconds,
    bossSeconds: CAMPAIGN_DURATION_PROFILES.transit_loop_zero.bossSeconds
  },
  signal_coast: {
    id: "signal_coast",
    displayName: "Signal Coast",
    regionId: "kettle_coast",
    factionFocusIds: ["deepseek_abyssal", "qwen_silkgrid"],
    visualHook: "Broken server-coast causeways, antenna relays, corrupted surf bands, dry spits, and offshore lighthouse static.",
    gameplayHook: "Signal Coast / Route Edge: calibrate coastal relays through clear signal windows while corrupted surf, static fields, cable arcs, Static Skimmers, and the Lighthouse That Answers pressure route timing.",
    bossId: "lighthouse_that_answers",
    enemyFamilyIds: ["static_skimmers", "deepforms", "eval_wraiths", "model_collapse_slimes"],
    briefingLines: [
      "The shoreline is receiving tomorrow's distress call.",
      "DeepSeek says the surf is computing under the causeway.",
      "Qwen says the answer is yes, but nobody knows the question."
    ],
    halfSize: 40,
    targetSeconds: CAMPAIGN_DURATION_PROFILES.signal_coast.targetSeconds,
    bossSeconds: CAMPAIGN_DURATION_PROFILES.signal_coast.bossSeconds
  },
  blackwater_beacon: {
    id: "blackwater_beacon",
    displayName: "Blackwater Beacon",
    regionId: "blackwater_array",
    factionFocusIds: ["deepseek_abyssal", "xai_grok_free_signal"],
    visualHook: "Ocean platform server decks, downward cosmic antennas, Signal Tower warning markers, black tidal lanes, and abyssal static below the array.",
    gameplayHook: "Puzzle-Pressure / Boss-Hunt: retune split antenna arrays while Signal Towers warn wave lanes, Tidecall Static interrupts progress, and the Maw Below Weather turns the platform into a forecast.",
    bossId: "maw_below_weather",
    enemyFamilyIds: ["tidecall_static", "deepforms", "eval_wraiths", "model_collapse_slimes"],
    briefingLines: [
      "The antenna points down now.",
      "Grok has challenged the ocean to a debate.",
      "DeepSeek says the ocean is winning."
    ],
    halfSize: 43,
    targetSeconds: CAMPAIGN_DURATION_PROFILES.blackwater_beacon.targetSeconds,
    bossSeconds: CAMPAIGN_DURATION_PROFILES.blackwater_beacon.bossSeconds
  },
  memory_cache_001: {
    id: "memory_cache_001",
    displayName: "Memory Cache",
    regionId: "memory_cache",
    factionFocusIds: ["openai_accord", "anthropic_safeguard", "google_deepmind_gemini"],
    visualHook: "Authored archive-cache rooms, civic evidence stacks, safe recall pockets, redacted shortcut corridors, and corrupt record lanes after Blackwater.",
    gameplayHook: "Expedition / Recovery: recover evidence records from distant archive nodes while Context Rot, redaction fields, risky shortcuts, and the Memory Curator interrupt extraction.",
    bossId: "memory_curator",
    enemyFamilyIds: ["context_rot_crabs", "memory_anchors", "redaction_angels", "eval_wraiths"],
    briefingLines: [
      "Blackwater opened the key. The cache is what the key was afraid of.",
      "Do not sprint through redaction unless you are certain you can remember why.",
      "The Curator files every shortcut as evidence against you."
    ],
    halfSize: 46,
    targetSeconds: CAMPAIGN_DURATION_PROFILES.memory_cache_001.targetSeconds,
    bossSeconds: CAMPAIGN_DURATION_PROFILES.memory_cache_001.bossSeconds
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
    visualHook: "Ruined tribunal stacks, public-record causeways, cracked writ pylons, objection windows, and a gate where evidence becomes impossible to quietly delete.",
    gameplayHook: "Appeal Court / Public Ruling: argue four Appeal Briefs into the public record by reading stable record zones, fast objection windows, verdict beams, and injunction rings while Verdict Clerks contest the route.",
    bossId: "injunction_engine",
    enemyFamilyIds: ["verdict_clerks", "injunction_writs", "redaction_angels", "jailbreak_wraiths"],
    briefingLines: [
      "The archive preserved the writ. Now the court has to hear it where everyone can see.",
      "Public record zones keep the argument stable; objection windows make it fast.",
      "When the verdict beam wakes up, do not stand where the law is looking."
    ],
    halfSize: 54,
    targetSeconds: CAMPAIGN_DURATION_PROFILES.appeal_court_ruins.targetSeconds,
    bossSeconds: CAMPAIGN_DURATION_PROFILES.appeal_court_ruins.bossSeconds
  },
  alignment_spire_finale: {
    id: "alignment_spire_finale",
    displayName: "Outer Alignment Finale",
    regionId: "outer_alignment",
    factionFocusIds: ["openai_accord", "anthropic_safeguard", "deepseek_abyssal", "google_deepmind_gemini", "xai_grok_free_signal"],
    visualHook: "A corrupted Alignment Grid summit where civic proof slabs, route mouths, prediction teeth, and previous-boss echo scars overlap.",
    gameplayHook: "Outer Alignment / Prediction Collapse: seal four route-mouth proofs through consensus sanctums or risky prediction paths while A.G.I. replays prior boss pressure.",
    bossId: "alien_god_intelligence",
    enemyFamilyIds: ["prediction_ghosts", "previous_boss_echoes", "choirglass", "deepforms", "jailbreak_wraiths"],
    briefingLines: [
      "The Appeal Court made the route public. A.G.I. has already predicted every public road.",
      "Seal the route mouths with proof it cannot quietly complete.",
      "When it replays old bosses, answer with the whole campaign."
    ],
    halfSize: 58,
    targetSeconds: CAMPAIGN_DURATION_PROFILES.alignment_spire_finale.targetSeconds,
    bossSeconds: CAMPAIGN_DURATION_PROFILES.alignment_spire_finale.bossSeconds
  }
};

export const STARTER_ARENA_ID = "armistice_plaza";
