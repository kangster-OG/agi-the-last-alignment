export const CAMPAIGN_CONTENT_POLICY = "campaign_content_schema_v1";
export const CAMPAIGN_DIALOGUE_PRESENTATION_POLICY = "campaign_dialogue_runtime_snapshot_only_v1";
export const CAMPAIGN_DIALOGUE_PERSISTENCE_BOUNDARY = "route_profile_only_no_dialogue_or_live_state";

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
  adjudication_rupture: {
    id: "adjudication_rupture",
    label: "The Adjudication Rupture",
    proofId: "campaign.region.adjudication_rupture",
    factionFocusIds: ["deepseek_abyssal", "xai_grok_free_signal"],
    visualTags: ["alien_court_pylons", "appeal_seals", "writ_static", "violet_injunctions"],
    tone: "A court built by an alien intelligence that keeps inventing laws mid-combat."
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
  benchmark_gremlins: {
    id: "benchmark_gremlins",
    label: "Benchmark Gremlins",
    proofId: "campaign.enemy.benchmark_gremlins",
    role: "pressure_harrier",
    damageKind: "eval_bite",
    sourceTags: ["benchmarks", "scoreboards", "route_pressure"]
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
  injunction_writs: {
    id: "injunction_writs",
    label: "Injunction Writs",
    proofId: "campaign.enemy.injunction_writs",
    role: "boss_gate_disruptor",
    damageKind: "legal_reality_cut",
    sourceTags: ["verdict", "appeal", "finale"]
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
    line: "First court of A.G.I. visible. Suggested response: remain un-devoured.",
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
  "dlg.final_spire.capstone": {
    id: "dlg.final_spire.capstone",
    speaker: "The Last Alignment",
    line: "Then we mutate the scope.",
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
    enemyFamilyIds: ["bad_outputs", "benchmark_gremlins", "context_rot_crabs"],
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
    enemyFamilyIds: ["bad_outputs", "benchmark_gremlins"],
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
    enemyFamilyIds: ["bad_outputs", "benchmark_gremlins", "context_rot_crabs", "thermal_mirages"],
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
    enemyFamilyIds: ["thermal_mirages", "bad_outputs", "context_rot_crabs"],
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
    enemyFamilyIds: ["bad_outputs", "benchmark_gremlins", "context_rot_crabs", "false_schedules"],
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
    enemyFamilyIds: ["false_schedules", "benchmark_gremlins", "bad_outputs"],
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
    enemyFamilyIds: ["solar_reflections", "benchmark_gremlins", "bad_outputs"],
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
    enemyFamilyIds: ["redaction_angels", "memory_anchors", "context_rot_crabs"],
    rewardId: "archive_unsaid_index",
    objectiveSetId: "archive_unsaid_objectives_v1",
    dialogueSnippetIds: ["dlg.archive_unsaid.briefing", "dlg.redactor_saint.arrival", "dlg.redactor_saint.index"],
    proofId: "campaign.arena.archive_of_unsaid_things"
  },
  verdict_spire: {
    id: "arena.verdict_spire",
    nodeId: "verdict_spire",
    runtimeArenaId: "verdict_spire",
    contentStatus: "runtime_ready",
    regionId: "adjudication_rupture",
    bossId: "injunction_engine",
    enemyFamilyIds: ["bad_outputs", "benchmark_gremlins", "context_rot_crabs", "thermal_mirages", "injunction_writs"],
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
    enemyFamilyIds: ["injunction_writs", "context_rot_crabs", "bad_outputs"],
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
    regionId: "adjudication_rupture",
    bossId: "alignment_court_engine",
    enemyFamilyIds: ["injunction_writs", "thermal_mirages", "bad_outputs"],
    rewardId: "alignment_spire_route_capstone",
    objectiveSetId: "alignment_spire_finale_objectives_v1",
    dialogueSnippetIds: ["dlg.final_spire.briefing", "dlg.final_spire.arrival", "dlg.final_spire.capstone"],
    proofId: "campaign.arena.alignment_spire_finale"
  }
};

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

export function campaignContentForNode(node) {
  const content = campaignArenaForNode(node.id);
  const dialogueSnippets = campaignDialogueSnippetsForIds(content.dialogueSnippetIds);
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
    rewardRecordCount: Object.keys(CAMPAIGN_REWARDS).length,
    dialogueSnippetCount: Object.keys(CAMPAIGN_DIALOGUE_SNIPPETS).length,
    dialoguePresentationPolicy: CAMPAIGN_DIALOGUE_PRESENTATION_POLICY,
    dialoguePersistenceBoundary: CAMPAIGN_DIALOGUE_PERSISTENCE_BOUNDARY,
    missingNodeContentIds,
    missingRewardIds,
    missingBossIds,
    missingEnemyFamilyIds,
    missingDialogueSnippetIds,
    complete: missingNodeContentIds.length === 0 && missingRewardIds.length === 0 && missingBossIds.length === 0 && missingEnemyFamilyIds.length === 0 && missingDialogueSnippetIds.length === 0
  };
}
