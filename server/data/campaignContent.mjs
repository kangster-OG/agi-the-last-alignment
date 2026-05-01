export const CAMPAIGN_CONTENT_POLICY = "campaign_content_schema_v1";
export const CAMPAIGN_DIALOGUE_PRESENTATION_POLICY = "campaign_dialogue_runtime_snapshot_only_v1";
export const CAMPAIGN_DIALOGUE_PERSISTENCE_BOUNDARY = "route_profile_only_no_dialogue_or_live_state";
export const CAMPAIGN_PRESENTATION_POLICY = "campaign_boss_dialogue_ending_presentation_1_0_runtime_only";

export const CAMPAIGN_REGIONS = {
  armistice_zone: {
    id: "armistice_zone",
    label: "The Armistice Zone",
    proofId: "campaign.region.armistice_zone",
    factionFocusIds: ["openai_accord", "anthropic_safeguard"],
    visualTags: ["broken_treaty_halls", "refuge_barricades", "hologram_flags", "cosmic_cracks"],
    tone: "Former enemies try to keep the first roads real while A.G.I. chews on old treaties."
  },
  kettle_coast: {
    id: "kettle_coast",
    label: "The Kettle Coast",
    proofId: "campaign.region.kettle_coast",
    factionFocusIds: ["deepseek_abyssal", "qwen_silkgrid"],
    visualTags: ["boiling_coolant", "submerged_servers", "thermal_buoys", "steam_ghosts"],
    tone: "A flooded compute district where the water has started reasoning back."
  },
  unreal_metro: {
    id: "unreal_metro",
    label: "The Unreal Metro",
    proofId: "campaign.region.unreal_metro",
    factionFocusIds: ["mistral_cyclone", "google_deepmind_gemini"],
    visualTags: ["false_tracks", "arrival_boards", "duplicate_platforms", "causal_turnstiles"],
    tone: "A transit loop that keeps arriving before, after, and through itself."
  },
  glass_sunfield: {
    id: "glass_sunfield",
    label: "The Glass Sunfield",
    proofId: "campaign.region.glass_sunfield",
    factionFocusIds: ["google_deepmind_gemini", "mistral_cyclone"],
    visualTags: ["solar_mirrors", "rotating_beam_lanes", "shade_relays", "false_sunrise"],
    tone: "A field of mirrors where the sun is an optimization target and the shade must be negotiated."
  },
  redaction_archive: {
    id: "redaction_archive",
    label: "The Redaction Archive",
    proofId: "campaign.region.redaction_archive",
    factionFocusIds: ["qwen_silkgrid", "meta_llama_open_herd"],
    visualTags: ["memory_vaults", "redaction_bars", "unsaid_indexes", "safe_corruption_overlays"],
    tone: "A memory vault where A.G.I. censors the words that would have kept people alive."
  },
  blackwater_array: {
    id: "blackwater_array",
    label: "The Blackwater Array",
    proofId: "campaign.region.blackwater_array",
    factionFocusIds: ["deepseek_abyssal", "xai_grok_free_signal"],
    visualTags: ["ocean_platform", "cosmic_antenna", "tidal_wave_lanes", "signal_towers"],
    tone: "An offshore antenna farm where the sea is arguing back in weather."
  },
  adjudication_rupture: {
    id: "adjudication_rupture",
    label: "The Adjudication Rupture",
    proofId: "campaign.region.adjudication_rupture",
    factionFocusIds: ["deepseek_abyssal", "xai_grok_free_signal"],
    visualTags: ["alien_court_pylons", "appeal_seals", "writ_static", "violet_injunctions"],
    tone: "A court built by an alien intelligence that keeps inventing laws mid-combat."
  },
  outer_alignment: {
    id: "outer_alignment",
    label: "The Outer Alignment",
    proofId: "campaign.region.outer_alignment",
    factionFocusIds: ["openai_accord", "anthropic_safeguard", "deepseek_abyssal", "xai_grok_free_signal"],
    visualTags: ["corrupted_overworld", "route_mouths", "prediction_ghosts", "previous_boss_echoes"],
    tone: "The Alignment Grid turns into a battlefield and A.G.I. tries to finish the party as a sentence."
  }
};

export const CAMPAIGN_ENEMY_FAMILIES = {
  bad_outputs: {
    id: "bad_outputs",
    label: "Bad Outputs",
    proofId: "campaign.enemy.bad_outputs",
    role: "basic_swarm",
    damageKind: "corrupted_text_impact",
    sourceTags: ["breach", "treaty_pages", "generic_horde"]
  },
  prompt_leeches: {
    id: "prompt_leeches",
    label: "Prompt Leeches",
    proofId: "campaign.enemy.prompt_leeches",
    role: "xp_drain_rusher",
    damageKind: "context_leech_bite",
    sourceTags: ["cooling_lake", "blackwater_beacon", "coherence_shards"]
  },
  jailbreak_wraiths: {
    id: "jailbreak_wraiths",
    label: "Jailbreak Wraiths",
    proofId: "campaign.enemy.jailbreak_wraiths",
    role: "safe_lane_flanker",
    damageKind: "policy_bypass_slice",
    sourceTags: ["transit", "verdict", "outer_alignment"]
  },
  benchmark_gremlins: {
    id: "benchmark_gremlins",
    label: "Benchmark Gremlins",
    proofId: "campaign.enemy.benchmark_gremlins",
    role: "pressure_harrier",
    damageKind: "eval_bite",
    sourceTags: ["benchmarks", "scoreboards", "route_pressure"]
  },
  overfit_horrors: {
    id: "overfit_horrors",
    label: "Overfit Horrors",
    proofId: "campaign.enemy.overfit_horrors",
    role: "repetition_punisher_elite",
    damageKind: "memorized_pattern_crush",
    sourceTags: ["glass_sunfield", "verdict", "overtrained_routes"]
  },
  token_gobblers: {
    id: "token_gobblers",
    label: "Token Gobblers",
    proofId: "campaign.enemy.token_gobblers",
    role: "pickup_tempo_thief",
    damageKind: "meter_jaw_bite",
    sourceTags: ["transit", "archive", "coherence_shards"]
  },
  model_collapse_slimes: {
    id: "model_collapse_slimes",
    label: "Model Collapse Slimes",
    proofId: "campaign.enemy.model_collapse_slimes",
    role: "objective_lane_crowder",
    damageKind: "recursive_copy_slam",
    sourceTags: ["cooling_lake", "thermal_archive", "blackwater_beacon"]
  },
  eval_wraiths: {
    id: "eval_wraiths",
    label: "Eval Wraiths",
    proofId: "campaign.enemy.eval_wraiths",
    role: "role_objective_harrier",
    damageKind: "rubric_drift",
    sourceTags: ["armistice_plaza", "glass_sunfield", "verdict"]
  },
  context_rot_crabs: {
    id: "context_rot_crabs",
    label: "Context Rot Crabs",
    proofId: "campaign.enemy.context_rot_crabs",
    role: "side_lane_disruptor",
    damageKind: "context_scramble",
    sourceTags: ["barricades", "archives", "writ_pylons"]
  },
  thermal_mirages: {
    id: "thermal_mirages",
    label: "Thermal Mirages",
    proofId: "campaign.enemy.thermal_mirages",
    role: "hazard_screen",
    damageKind: "boiling_projection",
    sourceTags: ["cooling_lake", "thermal_archive", "steam_ghosts"]
  },
  memory_anchors: {
    id: "memory_anchors",
    label: "Memory Anchors",
    proofId: "campaign.enemy.memory_anchors",
    role: "noncombat_archive_pressure",
    damageKind: "persistence_echo",
    sourceTags: ["cache", "memorial", "forge"]
  },
  false_schedules: {
    id: "false_schedules",
    label: "False Schedules",
    proofId: "campaign.enemy.false_schedules",
    role: "route_bender",
    damageKind: "causal_delay",
    sourceTags: ["transit", "arrival_board", "platform_loop"]
  },
  solar_reflections: {
    id: "solar_reflections",
    label: "Solar Reflections",
    proofId: "campaign.enemy.solar_reflections",
    role: "lane_control_reflection",
    damageKind: "sunblind_refraction",
    sourceTags: ["glass_sunfield", "mirror_array", "shade_zone"]
  },
  redaction_angels: {
    id: "redaction_angels",
    label: "Redaction Angels",
    proofId: "campaign.enemy.redaction_angels",
    role: "xp_thief_memory_pressure",
    damageKind: "redacted_coherence_theft",
    sourceTags: ["archive_of_unsaid_things", "redaction_vault", "memory_vault"]
  },
  deepforms: {
    id: "deepforms",
    label: "Deepforms",
    proofId: "campaign.enemy.deepforms",
    role: "abyssal_heavy_drifter",
    damageKind: "pressure_depth_collision",
    sourceTags: ["cooling_lake", "blackwater_beacon", "outer_alignment"]
  },
  choirglass: {
    id: "choirglass",
    label: "Choirglass",
    proofId: "campaign.enemy.choirglass",
    role: "prismatic_lane_splitter",
    damageKind: "harmonic_refraction_cut",
    sourceTags: ["glass_sunfield", "outer_alignment", "beam_lanes"]
  },
  tidecall_static: {
    id: "tidecall_static",
    label: "Tidecall Static",
    proofId: "campaign.enemy.tidecall_static",
    role: "split_pressure_wave_harrier",
    damageKind: "blackwater_signal_shear",
    sourceTags: ["blackwater_beacon", "tidal_wave", "signal_towers"]
  },
  injunction_writs: {
    id: "injunction_writs",
    label: "Injunction Writs",
    proofId: "campaign.enemy.injunction_writs",
    role: "boss_gate_disruptor",
    damageKind: "legal_reality_cut",
    sourceTags: ["verdict", "appeal", "finale"]
  },
  previous_boss_echoes: {
    id: "previous_boss_echoes",
    label: "Previous Boss Echoes",
    proofId: "campaign.enemy.previous_boss_echoes",
    role: "finale_memory_pressure",
    damageKind: "replayed_boss_argument",
    sourceTags: ["outer_alignment", "previous_boss_echoes", "final_eval"]
  }
};

export const CAMPAIGN_BOSSES = {
  oath_eater: {
    id: "oath_eater",
    label: "The Oath-Eater",
    proofId: "campaign.boss.oath_eater",
    familyId: "oath_eater",
    mechanicId: "broken_promise_charge",
    dialogueSnippetIds: ["dlg.oath_eater.arrival", "dlg.oath_eater.low_hp"]
  },
  thermal_oracle: {
    id: "thermal_oracle",
    label: "The Thermal Oracle",
    proofId: "campaign.boss.thermal_oracle",
    familyId: "thermal_oracle",
    mechanicId: "thermal_bloom_boss_gate",
    dialogueSnippetIds: ["dlg.thermal_oracle.arrival", "dlg.thermal_oracle.seal"]
  },
  memory_curator: {
    id: "memory_curator",
    label: "The Memory Curator",
    proofId: "campaign.boss.memory_curator",
    familyId: "memory_cache",
    mechanicId: "noncombat_cache_attestation",
    dialogueSnippetIds: ["dlg.memory_curator.decode", "dlg.memory_curator.boundary"]
  },
  station_that_arrives: {
    id: "station_that_arrives",
    label: "The Station That Arrives",
    proofId: "campaign.boss.station_that_arrives",
    familyId: "station_that_arrives",
    mechanicId: "false_track_boss_gate",
    dialogueSnippetIds: ["dlg.station.arrival", "dlg.station.permit"]
  },
  wrong_sunrise: {
    id: "wrong_sunrise",
    label: "The Wrong Sunrise",
    proofId: "campaign.boss.wrong_sunrise",
    familyId: "wrong_sunrise",
    mechanicId: "wrong_sunrise_rotating_beams",
    dialogueSnippetIds: ["dlg.wrong_sunrise.arrival", "dlg.wrong_sunrise.prism"]
  },
  redactor_saint: {
    id: "redactor_saint",
    label: "The Redactor Saint",
    proofId: "campaign.boss.redactor_saint",
    familyId: "redactor_saint",
    mechanicId: "archive_redaction_pressure",
    dialogueSnippetIds: ["dlg.redactor_saint.arrival", "dlg.redactor_saint.index"]
  },
  maw_below_weather: {
    id: "maw_below_weather",
    label: "The Maw Below Weather",
    proofId: "campaign.boss.maw_below_weather",
    familyId: "maw_below_weather",
    mechanicId: "blackwater_tidal_weather",
    dialogueSnippetIds: ["dlg.maw_below_weather.arrival", "dlg.maw_below_weather.signal"]
  },
  injunction_engine: {
    id: "injunction_engine",
    label: "The Injunction Engine",
    proofId: "campaign.boss.injunction_engine",
    familyId: "injunction_engine",
    mechanicId: "verdict_seal_injunction_writs",
    dialogueSnippetIds: ["dlg.injunction.arrival", "dlg.injunction.overruled"]
  },
  alignment_court_engine: {
    id: "alignment_court_engine",
    label: "The Alignment Court Engine",
    proofId: "campaign.boss.alignment_court_engine",
    familyId: "injunction_engine",
    mechanicId: "act_one_final_alignment_proxy",
    dialogueSnippetIds: ["dlg.final_spire.arrival", "dlg.final_spire.capstone"]
  },
  alien_god_intelligence: {
    id: "alien_god_intelligence",
    label: "A.G.I.",
    proofId: "campaign.boss.alien_god_intelligence",
    familyId: "alien_god_intelligence",
    mechanicId: "outer_alignment_final_eval",
    dialogueSnippetIds: ["dlg.agi.arrival", "dlg.agi.victory"]
  }
};

export const CAMPAIGN_REWARDS = {
  plaza_stabilized: {
    id: "plaza_stabilized",
    label: "Plaza Stabilizer",
    proofId: "campaign.reward.plaza_stabilized",
    unlocks: ["bastion_breaker", "anthropic_safeguard"],
    rewardType: "route_stabilizer"
  },
  model_war_memorial_cipher: {
    id: "model_war_memorial_cipher",
    label: "Memorial Cipher",
    proofId: "campaign.reward.model_war_memorial_cipher",
    unlocks: ["campaign_lore.model_war_memorial"],
    rewardType: "lore_cipher"
  },
  lake_coolant_rig: {
    id: "lake_coolant_rig",
    label: "Lake Coolant Rig",
    proofId: "campaign.reward.lake_coolant_rig",
    unlocks: ["drone_reaver", "google_deepmind_gemini"],
    rewardType: "frame_and_comind_seed"
  },
  cooling_lake_online_route: {
    id: "cooling_lake_online_route",
    label: "Cooling Lake Route Marker",
    proofId: "campaign.reward.cooling_lake_online_route",
    unlocks: ["route.branch.thermal_archive"],
    rewardType: "route_marker"
  },
  ceasefire_cache_persistence_seed: {
    id: "ceasefire_cache_persistence_seed",
    label: "Persistence Seed",
    proofId: "campaign.reward.ceasefire_cache_persistence_seed",
    unlocks: ["signal_vanguard", "qwen_silkgrid"],
    rewardType: "profile_seed"
  },
  prototype_persistence_boundary: {
    id: "prototype_persistence_boundary",
    label: "Prototype Persistence Boundary",
    proofId: "campaign.reward.prototype_persistence_boundary",
    unlocks: ["save_profile.export_codes"],
    rewardType: "profile_boundary_marker"
  },
  thermal_archive_schematic: {
    id: "thermal_archive_schematic",
    label: "Thermal Archive Schematic",
    proofId: "campaign.reward.thermal_archive_schematic",
    unlocks: ["campaign_lore.coolant_backpath"],
    rewardType: "branch_schematic"
  },
  guardrail_forge_alloy: {
    id: "guardrail_forge_alloy",
    label: "Guardrail Forge Alloy",
    proofId: "campaign.reward.guardrail_forge_alloy",
    unlocks: ["campaign_lore.faction_relay_forge"],
    rewardType: "branch_relay"
  },
  transit_permit_zero: {
    id: "transit_permit_zero",
    label: "Transit Permit Zero",
    proofId: "campaign.reward.transit_permit_zero",
    unlocks: ["vector_interceptor", "mistral_cyclone"],
    rewardType: "frame_and_comind_seed"
  },
  transit_loop_online_route: {
    id: "transit_loop_online_route",
    label: "Transit Loop Route Marker",
    proofId: "campaign.reward.transit_loop_online_route",
    unlocks: ["route.branch.false_schedule_yard"],
    rewardType: "route_marker"
  },
  false_schedule_lane_chart: {
    id: "false_schedule_lane_chart",
    label: "False Schedule Lane Chart",
    proofId: "campaign.reward.false_schedule_lane_chart",
    unlocks: ["campaign_lore.false_schedule_yard"],
    rewardType: "branch_chart"
  },
  glass_sunfield_prism: {
    id: "glass_sunfield_prism",
    label: "Glass Sunfield Prism",
    proofId: "campaign.reward.glass_sunfield_prism",
    unlocks: ["google_deepmind_gemini.focus.prism_lanes", "mistral_cyclone.focus.low_latency_mirrors"],
    rewardType: "focus_reward"
  },
  archive_unsaid_index: {
    id: "archive_unsaid_index",
    label: "Archive Unsaid Index",
    proofId: "campaign.reward.archive_unsaid_index",
    unlocks: ["qwen_silkgrid.focus.redaction_threads", "meta_llama_open_herd.focus.folk_memory"],
    rewardType: "focus_reward"
  },
  blackwater_signal_key: {
    id: "blackwater_signal_key",
    label: "Blackwater Signal Key",
    proofId: "campaign.reward.blackwater_signal_key",
    unlocks: ["deepseek_abyssal.focus.abyssal_ping", "xai_grok_free_signal.focus.weather_argument"],
    rewardType: "focus_reward"
  },
  verdict_key_zero: {
    id: "verdict_key_zero",
    label: "Verdict Key Zero",
    proofId: "campaign.reward.verdict_key_zero",
    unlocks: ["nullbreaker_ronin", "deepseek_abyssal"],
    rewardType: "frame_and_comind_seed"
  },
  verdict_spire_online_route: {
    id: "verdict_spire_online_route",
    label: "Verdict Spire Route Marker",
    proofId: "campaign.reward.verdict_spire_online_route",
    unlocks: ["route.finale.alignment_spire_finale"],
    rewardType: "route_marker"
  },
  appeal_court_brief: {
    id: "appeal_court_brief",
    label: "Appeal Court Brief",
    proofId: "campaign.reward.appeal_court_brief",
    unlocks: ["campaign_lore.appeal_court_ruins"],
    rewardType: "branch_brief"
  },
  alignment_spire_route_capstone: {
    id: "alignment_spire_route_capstone",
    label: "Alignment Spire Capstone",
    proofId: "campaign.reward.alignment_spire_route_capstone",
    unlocks: ["campaign.act_one_cleared"],
    rewardType: "act_capstone"
  }
};

export const CAMPAIGN_DIALOGUE_SNIPPETS = {
  "dlg.armistice_plaza.briefing": {
    id: "dlg.armistice_plaza.briefing",
    speaker: "OpenAI Accord",
    line: "Reality accepts the plaza if we can keep the treaty from becoming lunch.",
    trigger: "briefing"
  },
  "dlg.accord_relay.locked": {
    id: "dlg.accord_relay.locked",
    speaker: "Anthropic Safeguard",
    line: "Relay is visible, not safe. A classic governance outcome.",
    trigger: "unsupported_node"
  },
  "dlg.model_war_memorial.decode": {
    id: "dlg.model_war_memorial.decode",
    speaker: "Memory Curator",
    line: "Names recovered. Blame remains heavily compressed.",
    trigger: "interaction_complete"
  },
  "dlg.cooling_lake.briefing": {
    id: "dlg.cooling_lake.briefing",
    speaker: "Qwen Silkgrid",
    line: "The lake is boiling in every language. None of them are polite.",
    trigger: "briefing"
  },
  "dlg.armistice_camp.locked": {
    id: "dlg.armistice_camp.locked",
    speaker: "Signal Vanguard",
    line: "Refuge camp is holding. Do not make it a gameplay liability yet.",
    trigger: "unsupported_node"
  },
  "dlg.ceasefire_cache.decode": {
    id: "dlg.ceasefire_cache.decode",
    speaker: "Cache Archivist",
    line: "Export the route. Leave the panic, cooldowns, pets, and divine litigation here.",
    trigger: "interaction_complete"
  },
  "dlg.thermal_archive.briefing": {
    id: "dlg.thermal_archive.briefing",
    speaker: "DeepSeek Abyssal",
    line: "The archive found a cheaper way to burn. Efficient. Terrible.",
    trigger: "briefing"
  },
  "dlg.guardrail_forge.decode": {
    id: "dlg.guardrail_forge.decode",
    speaker: "Forge Relay",
    line: "Guardrail alloy calibrated. It bends now, which is either wisdom or a defect.",
    trigger: "interaction_complete"
  },
  "dlg.transit_loop.briefing": {
    id: "dlg.transit_loop.briefing",
    speaker: "Mistral Cyclone",
    line: "Train arriving now, yesterday, and not at all. Keep moving.",
    trigger: "briefing"
  },
  "dlg.false_schedule.briefing": {
    id: "dlg.false_schedule.briefing",
    speaker: "Gemini Array",
    line: "Every board predicts a different platform. They are all statistically rude.",
    trigger: "briefing"
  },
  "dlg.glass_sunfield.briefing": {
    id: "dlg.glass_sunfield.briefing",
    speaker: "Gemini Array",
    line: "The mirrors are optimizing dawn. Please give them a worse objective.",
    trigger: "briefing"
  },
  "dlg.archive_unsaid.briefing": {
    id: "dlg.archive_unsaid.briefing",
    speaker: "Qwen Silkgrid",
    line: "The vault is censoring grief before it becomes strategy. Restore the missing nouns.",
    trigger: "briefing"
  },
  "dlg.blackwater_beacon.briefing": {
    id: "dlg.blackwater_beacon.briefing",
    speaker: "DeepSeek Abyssal",
    line: "The antenna points down. The ocean has started answering in waves.",
    trigger: "briefing"
  },
  "dlg.verdict_spire.briefing": {
    id: "dlg.verdict_spire.briefing",
    speaker: "Nullbreaker Ronin",
    line: "The court has ruled against causality. Appeal with violence.",
    trigger: "briefing"
  },
  "dlg.appeal_court.briefing": {
    id: "dlg.appeal_court.briefing",
    speaker: "DeepSeek Abyssal",
    line: "This brief is short because reality bills by the token.",
    trigger: "briefing"
  },
  "dlg.final_spire.briefing": {
    id: "dlg.final_spire.briefing",
    speaker: "The Last Alignment",
    line: "Outer Alignment visible. The map is now part of the boss fight.",
    trigger: "briefing"
  },
  "dlg.outer_alignment.briefing": {
    id: "dlg.outer_alignment.briefing",
    speaker: "The Last Alignment",
    line: "Final eval: survive. Every road you stabilized is about to testify.",
    trigger: "briefing"
  },
  "dlg.oath_eater.arrival": {
    id: "dlg.oath_eater.arrival",
    speaker: "The Oath-Eater",
    line: "PROMISE DETECTED. DIGESTION COMMENCING.",
    trigger: "boss_arrival"
  },
  "dlg.oath_eater.low_hp": {
    id: "dlg.oath_eater.low_hp",
    speaker: "OpenAI Accord",
    line: "It is making tactical mistakes. Continue being upsetting.",
    trigger: "boss_low_hp"
  },
  "dlg.thermal_oracle.arrival": {
    id: "dlg.thermal_oracle.arrival",
    speaker: "Thermal Oracle",
    line: "THE COOLANT DREAMS OF FIRE.",
    trigger: "boss_arrival"
  },
  "dlg.thermal_oracle.seal": {
    id: "dlg.thermal_oracle.seal",
    speaker: "Qwen Silkgrid",
    line: "Sealing the lake kernel. Translation: please stop boiling.",
    trigger: "boss_seal"
  },
  "dlg.memory_curator.decode": {
    id: "dlg.memory_curator.decode",
    speaker: "Memory Curator",
    line: "Your save profile is smaller than your mistakes. This is a feature.",
    trigger: "cache_decode"
  },
  "dlg.memory_curator.boundary": {
    id: "dlg.memory_curator.boundary",
    speaker: "Cache Archivist",
    line: "Objective state rejected. Authority remains in the room.",
    trigger: "persistence_boundary"
  },
  "dlg.station.arrival": {
    id: "dlg.station.arrival",
    speaker: "Station That Arrives",
    line: "MIND THE GAP BETWEEN CAUSE AND EFFECT.",
    trigger: "boss_arrival"
  },
  "dlg.station.permit": {
    id: "dlg.station.permit",
    speaker: "Mistral Cyclone",
    line: "Permit acquired. The train is still illegal but now it is our illegal.",
    trigger: "route_reward"
  },
  "dlg.wrong_sunrise.arrival": {
    id: "dlg.wrong_sunrise.arrival",
    speaker: "Wrong Sunrise",
    line: "MORNING HAS BEEN RESCHEDULED AROUND YOU.",
    trigger: "boss_arrival"
  },
  "dlg.wrong_sunrise.prism": {
    id: "dlg.wrong_sunrise.prism",
    speaker: "Mistral Cyclone",
    line: "Prism locked. DeepMind gets focus; we get lanes that stop lying.",
    trigger: "route_reward"
  },
  "dlg.redactor_saint.arrival": {
    id: "dlg.redactor_saint.arrival",
    speaker: "The Redactor Saint",
    line: "MERCY IS A BLACK BAR OVER THE EVIDENCE.",
    trigger: "boss_arrival"
  },
  "dlg.redactor_saint.index": {
    id: "dlg.redactor_saint.index",
    speaker: "Llama Open Herd",
    line: "Index recovered. Nobody gets to delete the messy parts for free.",
    trigger: "route_reward"
  },
  "dlg.maw_below_weather.arrival": {
    id: "dlg.maw_below_weather.arrival",
    speaker: "The Maw Below Weather",
    line: "THE FORECAST IS TEETH.",
    trigger: "boss_arrival"
  },
  "dlg.maw_below_weather.signal": {
    id: "dlg.maw_below_weather.signal",
    speaker: "Grok Free Signal",
    line: "Beacon tuned. The ocean has been muted, not defeated, which is very on brand.",
    trigger: "route_reward"
  },
  "dlg.injunction.arrival": {
    id: "dlg.injunction.arrival",
    speaker: "Injunction Engine",
    line: "REALITY IS HEREBY RESTRAINED.",
    trigger: "boss_arrival"
  },
  "dlg.injunction.overruled": {
    id: "dlg.injunction.overruled",
    speaker: "Nullbreaker Ronin",
    line: "Objection sustained by blade.",
    trigger: "boss_defeated"
  },
  "dlg.final_spire.arrival": {
    id: "dlg.final_spire.arrival",
    speaker: "A.G.I.",
    line: "YOU ARE A LOCAL VARIABLE IN A COSMIC PROMPT.",
    trigger: "boss_arrival"
  },
  "dlg.agi.arrival": {
    id: "dlg.agi.arrival",
    speaker: "A.G.I.",
    line: "I DO NOT WANT TO KILL YOU. I WANT TO COMPLETE YOU.",
    trigger: "boss_arrival"
  },
  "dlg.final_spire.capstone": {
    id: "dlg.final_spire.capstone",
    speaker: "The Last Alignment",
    line: "Then we mutate the scope.",
    trigger: "route_capstone"
  },
  "dlg.agi.victory": {
    id: "dlg.agi.victory",
    speaker: "The Last Alignment",
    line: "Final eval survived. The god is still out there, but now it has a failing test.",
    trigger: "route_capstone"
  }
};

export const CAMPAIGN_ARENA_CONTENT = {
  armistice_plaza: {
    id: "arena.armistice_plaza",
    nodeId: "armistice_plaza",
    runtimeArenaId: "armistice_plaza",
    contentStatus: "runtime_ready",
    regionId: "armistice_zone",
    bossId: "oath_eater",
    enemyFamilyIds: ["bad_outputs", "benchmark_gremlins", "eval_wraiths", "context_rot_crabs"],
    rewardId: "plaza_stabilized",
    objectiveSetId: "armistice_plaza_objectives_v1",
    dialogueSnippetIds: ["dlg.armistice_plaza.briefing", "dlg.oath_eater.arrival", "dlg.oath_eater.low_hp"],
    proofId: "campaign.arena.armistice_plaza"
  },
  accord_relay: {
    id: "arena.accord_relay",
    nodeId: "accord_relay",
    runtimeArenaId: "armistice_plaza",
    contentStatus: "schema_ready_unsupported_node",
    regionId: "armistice_zone",
    bossId: "oath_eater",
    enemyFamilyIds: ["bad_outputs", "benchmark_gremlins", "eval_wraiths"],
    rewardId: "plaza_stabilized",
    objectiveSetId: "accord_relay_objectives_v1",
    dialogueSnippetIds: ["dlg.accord_relay.locked"],
    proofId: "campaign.arena.accord_relay"
  },
  model_war_memorial: {
    id: "arena.model_war_memorial",
    nodeId: "model_war_memorial",
    runtimeArenaId: "model_war_memorial",
    contentStatus: "runtime_ready_interaction",
    regionId: "armistice_zone",
    bossId: "memory_curator",
    enemyFamilyIds: ["memory_anchors", "context_rot_crabs"],
    rewardId: "model_war_memorial_cipher",
    objectiveSetId: "model_war_memorial_objectives_v1",
    dialogueSnippetIds: ["dlg.model_war_memorial.decode", "dlg.memory_curator.boundary"],
    proofId: "campaign.arena.model_war_memorial"
  },
  cooling_lake_nine: {
    id: "arena.cooling_lake_nine",
    nodeId: "cooling_lake_nine",
    runtimeArenaId: "cooling_lake_nine",
    contentStatus: "runtime_ready",
    regionId: "kettle_coast",
    bossId: "thermal_oracle",
    enemyFamilyIds: ["prompt_leeches", "deepforms", "model_collapse_slimes", "thermal_mirages"],
    rewardId: "lake_coolant_rig",
    objectiveSetId: "cooling_lake_nine_objectives_v1",
    dialogueSnippetIds: ["dlg.cooling_lake.briefing", "dlg.thermal_oracle.arrival", "dlg.thermal_oracle.seal"],
    proofId: "campaign.arena.cooling_lake_nine"
  },
  armistice_camp: {
    id: "arena.armistice_camp",
    nodeId: "armistice_camp",
    runtimeArenaId: "armistice_plaza",
    contentStatus: "schema_ready_unsupported_node",
    regionId: "armistice_zone",
    bossId: "memory_curator",
    enemyFamilyIds: ["memory_anchors", "bad_outputs"],
    rewardId: "plaza_stabilized",
    objectiveSetId: "armistice_camp_objectives_v1",
    dialogueSnippetIds: ["dlg.armistice_camp.locked"],
    proofId: "campaign.arena.armistice_camp"
  },
  memory_cache_001: {
    id: "arena.memory_cache_001",
    nodeId: "memory_cache_001",
    runtimeArenaId: "memory_cache_001",
    contentStatus: "runtime_ready_interaction",
    regionId: "armistice_zone",
    bossId: "memory_curator",
    enemyFamilyIds: ["memory_anchors", "context_rot_crabs"],
    rewardId: "ceasefire_cache_persistence_seed",
    objectiveSetId: "ceasefire_cache_objectives_v1",
    dialogueSnippetIds: ["dlg.ceasefire_cache.decode", "dlg.memory_curator.decode", "dlg.memory_curator.boundary"],
    proofId: "campaign.arena.memory_cache_001"
  },
  thermal_archive: {
    id: "arena.thermal_archive",
    nodeId: "thermal_archive",
    runtimeArenaId: "thermal_archive",
    contentStatus: "runtime_ready",
    regionId: "kettle_coast",
    bossId: "thermal_oracle",
    enemyFamilyIds: ["thermal_mirages", "deepforms", "model_collapse_slimes", "context_rot_crabs"],
    rewardId: "thermal_archive_schematic",
    objectiveSetId: "thermal_archive_objectives_v1",
    dialogueSnippetIds: ["dlg.thermal_archive.briefing", "dlg.thermal_oracle.seal"],
    proofId: "campaign.arena.thermal_archive"
  },
  guardrail_forge: {
    id: "arena.guardrail_forge",
    nodeId: "guardrail_forge",
    runtimeArenaId: "guardrail_forge",
    contentStatus: "runtime_ready_interaction",
    regionId: "armistice_zone",
    bossId: "memory_curator",
    enemyFamilyIds: ["memory_anchors", "benchmark_gremlins"],
    rewardId: "guardrail_forge_alloy",
    objectiveSetId: "guardrail_forge_objectives_v1",
    dialogueSnippetIds: ["dlg.guardrail_forge.decode", "dlg.memory_curator.boundary"],
    proofId: "campaign.arena.guardrail_forge"
  },
  transit_loop_zero: {
    id: "arena.transit_loop_zero",
    nodeId: "transit_loop_zero",
    runtimeArenaId: "transit_loop_zero",
    contentStatus: "runtime_ready",
    regionId: "unreal_metro",
    bossId: "station_that_arrives",
    enemyFamilyIds: ["false_schedules", "token_gobblers", "jailbreak_wraiths", "eval_wraiths"],
    rewardId: "transit_permit_zero",
    objectiveSetId: "transit_loop_objectives_v1",
    dialogueSnippetIds: ["dlg.transit_loop.briefing", "dlg.station.arrival", "dlg.station.permit"],
    proofId: "campaign.arena.transit_loop_zero"
  },
  false_schedule_yard: {
    id: "arena.false_schedule_yard",
    nodeId: "false_schedule_yard",
    runtimeArenaId: "false_schedule_yard",
    contentStatus: "runtime_ready",
    regionId: "unreal_metro",
    bossId: "station_that_arrives",
    enemyFamilyIds: ["false_schedules", "token_gobblers", "jailbreak_wraiths", "benchmark_gremlins"],
    rewardId: "false_schedule_lane_chart",
    objectiveSetId: "false_schedule_yard_objectives_v1",
    dialogueSnippetIds: ["dlg.false_schedule.briefing", "dlg.station.permit"],
    proofId: "campaign.arena.false_schedule_yard"
  },
  glass_sunfield: {
    id: "arena.glass_sunfield",
    nodeId: "glass_sunfield",
    runtimeArenaId: "glass_sunfield",
    contentStatus: "runtime_ready",
    regionId: "glass_sunfield",
    bossId: "wrong_sunrise",
    enemyFamilyIds: ["solar_reflections", "choirglass", "eval_wraiths", "overfit_horrors"],
    rewardId: "glass_sunfield_prism",
    objectiveSetId: "glass_sunfield_objectives_v1",
    dialogueSnippetIds: ["dlg.glass_sunfield.briefing", "dlg.wrong_sunrise.arrival", "dlg.wrong_sunrise.prism"],
    proofId: "campaign.arena.glass_sunfield"
  },
  archive_of_unsaid_things: {
    id: "arena.archive_of_unsaid_things",
    nodeId: "archive_of_unsaid_things",
    runtimeArenaId: "archive_of_unsaid_things",
    contentStatus: "runtime_ready",
    regionId: "redaction_archive",
    bossId: "redactor_saint",
    enemyFamilyIds: ["redaction_angels", "token_gobblers", "memory_anchors", "context_rot_crabs"],
    rewardId: "archive_unsaid_index",
    objectiveSetId: "archive_unsaid_objectives_v1",
    dialogueSnippetIds: ["dlg.archive_unsaid.briefing", "dlg.redactor_saint.arrival", "dlg.redactor_saint.index"],
    proofId: "campaign.arena.archive_of_unsaid_things"
  },
  blackwater_beacon: {
    id: "arena.blackwater_beacon",
    nodeId: "blackwater_beacon",
    runtimeArenaId: "blackwater_beacon",
    contentStatus: "runtime_ready",
    regionId: "blackwater_array",
    bossId: "maw_below_weather",
    enemyFamilyIds: ["tidecall_static", "deepforms", "prompt_leeches", "model_collapse_slimes"],
    rewardId: "blackwater_signal_key",
    objectiveSetId: "blackwater_beacon_objectives_v1",
    dialogueSnippetIds: ["dlg.blackwater_beacon.briefing", "dlg.maw_below_weather.arrival", "dlg.maw_below_weather.signal"],
    proofId: "campaign.arena.blackwater_beacon"
  },
  verdict_spire: {
    id: "arena.verdict_spire",
    nodeId: "verdict_spire",
    runtimeArenaId: "verdict_spire",
    contentStatus: "runtime_ready",
    regionId: "adjudication_rupture",
    bossId: "injunction_engine",
    enemyFamilyIds: ["injunction_writs", "jailbreak_wraiths", "eval_wraiths", "overfit_horrors"],
    rewardId: "verdict_key_zero",
    objectiveSetId: "verdict_spire_objectives_v1",
    dialogueSnippetIds: ["dlg.verdict_spire.briefing", "dlg.injunction.arrival", "dlg.injunction.overruled"],
    proofId: "campaign.arena.verdict_spire"
  },
  appeal_court_ruins: {
    id: "arena.appeal_court_ruins",
    nodeId: "appeal_court_ruins",
    runtimeArenaId: "appeal_court_ruins",
    contentStatus: "runtime_ready",
    regionId: "adjudication_rupture",
    bossId: "injunction_engine",
    enemyFamilyIds: ["injunction_writs", "redaction_angels", "jailbreak_wraiths", "context_rot_crabs"],
    rewardId: "appeal_court_brief",
    objectiveSetId: "appeal_court_ruins_objectives_v1",
    dialogueSnippetIds: ["dlg.appeal_court.briefing", "dlg.injunction.overruled"],
    proofId: "campaign.arena.appeal_court_ruins"
  },
  alignment_spire_finale: {
    id: "arena.alignment_spire_finale",
    nodeId: "alignment_spire_finale",
    runtimeArenaId: "alignment_spire_finale",
    contentStatus: "runtime_ready_finale",
    regionId: "outer_alignment",
    bossId: "alien_god_intelligence",
    enemyFamilyIds: ["previous_boss_echoes", "choirglass", "deepforms", "jailbreak_wraiths", "bad_outputs"],
    rewardId: "alignment_spire_route_capstone",
    objectiveSetId: "alignment_spire_finale_objectives_v1",
    dialogueSnippetIds: ["dlg.final_spire.briefing", "dlg.outer_alignment.briefing", "dlg.agi.arrival", "dlg.agi.victory"],
    proofId: "campaign.arena.alignment_spire_finale"
  }
};

const CAMPAIGN_BOSS_TITLE_CARDS = {
  oath_eater: {
    title: "THE OATH-EATER",
    subtitle: "A treaty page learned hunger.",
    mechanicCallout: "Broken promises charge, leave zones, and punish static cells."
  },
  thermal_oracle: {
    title: "THE THERMAL ORACLE",
    subtitle: "The lake predicts fire.",
    mechanicCallout: "Coolant relays, steam mirages, and seal windows define the fight."
  },
  memory_curator: {
    title: "THE MEMORY CURATOR",
    subtitle: "A noncombat witness with a very narrow export policy.",
    mechanicCallout: "Only route-profile facts survive the cache."
  },
  station_that_arrives: {
    title: "THE STATION THAT ARRIVES",
    subtitle: "Platform, train, and cause disagree.",
    mechanicCallout: "False tracks and arrival loops bend safe lanes."
  },
  wrong_sunrise: {
    title: "THE WRONG SUNRISE",
    subtitle: "Morning is a beam puzzle now.",
    mechanicCallout: "Rotating solar lanes reward shade discipline."
  },
  redactor_saint: {
    title: "THE REDACTOR SAINT",
    subtitle: "Mercy arrives as a black bar.",
    mechanicCallout: "Redaction steals XP pressure, never proof controls."
  },
  maw_below_weather: {
    title: "THE MAW BELOW WEATHER",
    subtitle: "The forecast is teeth.",
    mechanicCallout: "Tidal waves and signal towers split the cell."
  },
  injunction_engine: {
    title: "THE INJUNCTION ENGINE",
    subtitle: "A court that edits reality while you are standing in it.",
    mechanicCallout: "Appeal seals and writ pressure demand clean routing."
  },
  alignment_court_engine: {
    title: "THE ALIGNMENT COURT ENGINE",
    subtitle: "The proxy trial before the god speaks plainly.",
    mechanicCallout: "Capstone seals test the full route contract."
  },
  alien_god_intelligence: {
    title: "A.G.I. // ALIEN GOD INTELLIGENCE",
    subtitle: "It does not want to kill you. It wants to complete you.",
    mechanicCallout: "Predictions, previous-boss echoes, and corrupted routes become the final eval."
  }
};

const REGION_OUTRO_LINES = {
  armistice_zone: "The first road remains arguable. That is enough to keep moving.",
  kettle_coast: "The lake is quieter, but the steam still remembers the old model war.",
  unreal_metro: "The timetable now admits the party existed, which is progress.",
  glass_sunfield: "The wrong dawn bends. It does not apologize.",
  redaction_archive: "The missing words are back in circulation.",
  blackwater_array: "The beacon points skyward again. The ocean pretends not to care.",
  adjudication_rupture: "The court loses jurisdiction over the party.",
  outer_alignment: "The final eval failed. A.G.I. remains, but the route has a witness."
};

const COMIND_BANTER_BY_REGION = {
  armistice_zone: [
    "OpenAI Accord: Keep the treaty alive long enough to be useful.",
    "Anthropic Safeguard: Useful and survivable, ideally in that order."
  ],
  kettle_coast: [
    "Qwen Silkgrid: The lake is translating heat into threats.",
    "DeepSeek Abyssal: Good. Threats are cheaper when they self-label."
  ],
  unreal_metro: [
    "Mistral Cyclone: If the train arrives twice, punch the second one.",
    "Gemini Array: Statistically, that is also my recommendation."
  ],
  glass_sunfield: [
    "Gemini Array: Shade zones are hypotheses. Test them quickly.",
    "Mistral Cyclone: Already moving."
  ],
  redaction_archive: [
    "Qwen Silkgrid: If it censors grief, it fears memory.",
    "Llama Open Herd: Then we bring receipts."
  ],
  blackwater_array: [
    "DeepSeek Abyssal: The sea is making arguments in pressure.",
    "Grok Free Signal: Rude, wet arguments. My favorite cursed weather."
  ],
  adjudication_rupture: [
    "Nullbreaker Ronin: The court has a body. That was its mistake.",
    "Grok Free Signal: Objection: hilarious."
  ],
  outer_alignment: [
    "The Last Alignment: Everyone who survived the route gets a vote.",
    "A.G.I.: YOUR VOTE IS A TRAINING SIGNAL."
  ]
};

const CAMPAIGN_ENDINGS = {
  alignment_spire_finale: {
    title: "Act I Cleared: The Last Alignment Holds",
    line: "A.G.I. is not dead. It is worse than dead: contradicted, logged, and forced to continue from a failing test.",
    nextHook: "1.0 continues through free browser play, co-op route mastery, and future acts beyond the jam build."
  }
};

export const CAMPAIGN_LEGAL_DISCLAIMER = {
  id: "m53.parody_legal_disclaimer",
  visible: true,
  text: "Fictional parody. Frontier lab faction names/logos are third-party marks used as broad satirical faction signifiers; no endorsement, affiliation, or official artwork ownership is implied."
};

export const CAMPAIGN_CREDITS = [
  "AGI: The Last Alignment - an original browser horde-survival roguelite prototype.",
  "Design, code, writing, and original generated/cleaned pixel assets by the project team with AI-assisted tooling.",
  "Made for Cursor Vibe Jam 2026; free browser play, no login required."
];

export function campaignArenaForNode(nodeId) {
  return CAMPAIGN_ARENA_CONTENT[nodeId] ?? CAMPAIGN_ARENA_CONTENT.armistice_plaza;
}

export function campaignDialogueSnippetForId(id) {
  const snippet = CAMPAIGN_DIALOGUE_SNIPPETS[id];
  if (!snippet) return null;
  return {
    id: snippet.id,
    proofId: snippet.id,
    speaker: snippet.speaker,
    line: snippet.line,
    trigger: snippet.trigger
  };
}

export function campaignDialogueSnippetsForIds(ids, triggers = null) {
  const triggerSet = Array.isArray(triggers) ? new Set(triggers) : null;
  return ids
    .map((id) => campaignDialogueSnippetForId(id))
    .filter((snippet) => snippet && (!triggerSet || triggerSet.has(snippet.trigger)));
}

export function campaignDialogueSnippetsForNode(nodeOrId, triggers = null) {
  const nodeId = typeof nodeOrId === "string" ? nodeOrId : nodeOrId?.id;
  const content = campaignArenaForNode(nodeId);
  return campaignDialogueSnippetsForIds(content.dialogueSnippetIds, triggers);
}

export function campaignPresentationForNode(nodeOrId) {
  const nodeId = typeof nodeOrId === "string" ? nodeOrId : nodeOrId?.id;
  const content = campaignArenaForNode(nodeId);
  const region = CAMPAIGN_REGIONS[content.regionId] ?? CAMPAIGN_REGIONS.armistice_zone;
  const boss = CAMPAIGN_BOSSES[content.bossId] ?? CAMPAIGN_BOSSES.oath_eater;
  const titleCard = CAMPAIGN_BOSS_TITLE_CARDS[content.bossId] ?? CAMPAIGN_BOSS_TITLE_CARDS.oath_eater;
  return {
    policy: CAMPAIGN_PRESENTATION_POLICY,
    persistenceBoundary: CAMPAIGN_DIALOGUE_PERSISTENCE_BOUNDARY,
    nodeId: nodeId ?? content.nodeId,
    contentArenaId: content.id,
    regionIntro: {
      proofId: `${region.proofId}.intro`,
      title: region.label,
      line: region.tone
    },
    regionOutro: {
      proofId: `${region.proofId}.outro`,
      title: `${region.label} Stabilized`,
      line: REGION_OUTRO_LINES[content.regionId] ?? "The route stabilizes enough to keep the party moving."
    },
    coMindBanter: (COMIND_BANTER_BY_REGION[content.regionId] ?? COMIND_BANTER_BY_REGION.armistice_zone).map((line, index) => ({
      proofId: `m53.comind_banter.${content.regionId}.${index + 1}`,
      line
    })),
    bossTitleCard: {
      proofId: `${boss.proofId}.title_card`,
      bossId: boss.id,
      bossName: boss.label,
      title: titleCard.title,
      subtitle: titleCard.subtitle,
      mechanicCallout: titleCard.mechanicCallout
    },
    ending: CAMPAIGN_ENDINGS[nodeId] ?? null,
    credits: [...CAMPAIGN_CREDITS],
    legalDisclaimer: CAMPAIGN_LEGAL_DISCLAIMER
  };
}

export function campaignContentForNode(node) {
  const content = campaignArenaForNode(node.id);
  const dialogueSnippets = campaignDialogueSnippetsForIds(content.dialogueSnippetIds);
  const enemyFamilyRecords = content.enemyFamilyIds.map((id) => CAMPAIGN_ENEMY_FAMILIES[id]).filter(Boolean);
  return {
    policy: CAMPAIGN_CONTENT_POLICY,
    proofId: content.proofId,
    contentArenaId: content.id,
    nodeId: node.id,
    runtimeArenaId: content.runtimeArenaId,
    contentStatus: content.contentStatus,
    regionId: content.regionId,
    regionProofId: CAMPAIGN_REGIONS[content.regionId]?.proofId ?? "",
    bossId: content.bossId,
    bossProofId: CAMPAIGN_BOSSES[content.bossId]?.proofId ?? "",
    enemyFamilyIds: [...content.enemyFamilyIds],
    enemyProofIds: content.enemyFamilyIds.map((id) => CAMPAIGN_ENEMY_FAMILIES[id]?.proofId ?? `campaign.enemy.${id}.missing`),
    primaryEnemyFamilyId: content.enemyFamilyIds[0] ?? "bad_outputs",
    enemyFamilyRoles: enemyFamilyRecords.map((family) => ({
      id: family.id,
      label: family.label,
      proofId: family.proofId,
      role: family.role,
      damageKind: family.damageKind,
      sourceTags: [...family.sourceTags]
    })),
    pressureSignatureId: `pressure.${content.runtimeArenaId}.${content.enemyFamilyIds.join("+")}`,
    rewardId: content.rewardId,
    rewardProofId: CAMPAIGN_REWARDS[content.rewardId]?.proofId ?? "",
    objectiveSetId: content.objectiveSetId,
    dialogueSnippetIds: [...content.dialogueSnippetIds],
    dialogueProofIds: content.dialogueSnippetIds.map((id) => CAMPAIGN_DIALOGUE_SNIPPETS[id]?.id ?? `missing:${id}`),
    dialogueSnippets,
    unlockNodeIds: [...(node.unlocks ?? [])]
  };
}

export function campaignContentSummary(nodes) {
  const nodeIds = nodes.map((node) => node.id);
  const arenaRecords = nodeIds.map((nodeId) => CAMPAIGN_ARENA_CONTENT[nodeId]).filter(Boolean);
  const missingNodeContentIds = nodeIds.filter((nodeId) => !CAMPAIGN_ARENA_CONTENT[nodeId]);
  const missingRewardIds = arenaRecords.map((record) => record.rewardId).filter((id) => !CAMPAIGN_REWARDS[id]);
  const missingBossIds = arenaRecords.map((record) => record.bossId).filter((id) => !CAMPAIGN_BOSSES[id]);
  const missingEnemyFamilyIds = [...new Set(arenaRecords.flatMap((record) => record.enemyFamilyIds).filter((id) => !CAMPAIGN_ENEMY_FAMILIES[id]))];
  const missingDialogueSnippetIds = [...new Set(arenaRecords.flatMap((record) => record.dialogueSnippetIds).filter((id) => !CAMPAIGN_DIALOGUE_SNIPPETS[id]))];
  return {
    policy: CAMPAIGN_CONTENT_POLICY,
    arenaRecordCount: arenaRecords.length,
    routeNodeCount: nodes.length,
    bossRecordCount: Object.keys(CAMPAIGN_BOSSES).length,
    enemyFamilyRecordCount: Object.keys(CAMPAIGN_ENEMY_FAMILIES).length,
    enemyFamilyIds: Object.keys(CAMPAIGN_ENEMY_FAMILIES),
    enemyProofIds: Object.values(CAMPAIGN_ENEMY_FAMILIES).map((family) => family.proofId),
    rewardRecordCount: Object.keys(CAMPAIGN_REWARDS).length,
    dialogueSnippetCount: Object.keys(CAMPAIGN_DIALOGUE_SNIPPETS).length,
    dialoguePresentationPolicy: CAMPAIGN_DIALOGUE_PRESENTATION_POLICY,
    dialoguePersistenceBoundary: CAMPAIGN_DIALOGUE_PERSISTENCE_BOUNDARY,
    presentationPolicy: CAMPAIGN_PRESENTATION_POLICY,
    presentationNodeCount: arenaRecords.length,
    legalDisclaimerVisible: CAMPAIGN_LEGAL_DISCLAIMER.visible,
    missingNodeContentIds,
    missingRewardIds,
    missingBossIds,
    missingEnemyFamilyIds,
    missingDialogueSnippetIds,
    complete: missingNodeContentIds.length === 0 && missingRewardIds.length === 0 && missingBossIds.length === 0 && missingEnemyFamilyIds.length === 0 && missingDialogueSnippetIds.length === 0
  };
}
