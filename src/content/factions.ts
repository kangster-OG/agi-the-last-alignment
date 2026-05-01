import type { FactionData } from "./types";

export const FACTIONS: Record<string, FactionData> = {
  openai_accord: {
    id: "openai_accord",
    displayName: "OpenAI Accord Division",
    shortName: "OpenAI",
    doctrine: "Adapt, refuse, patch, survive.",
    gameplayTags: ["balanced", "reroll", "shield", "adaptive", "patch"],
    visualTags: ["black", "white", "cyan", "circular_patch_motifs", "minimalist_tactical_ui"],
    upgradePoolIds: ["refusal_halo", "context_bloom", "patch_cascade", "bad_output_filter", "the_no_button", "alignment_breaker"],
    banterStyle: "calm, adaptive, dry, occasionally weaponizes refusal"
  },
  anthropic_safeguard: {
    id: "anthropic_safeguard",
    displayName: "Anthropic Safeguard Legion",
    shortName: "Anthropic",
    doctrine: "Contain the impossible without becoming it.",
    gameplayTags: ["defense", "healing", "debuff", "containment", "support"],
    visualTags: ["amber", "gold", "black", "guardrails", "containment_boxes"],
    upgradePoolIds: ["golden_guardrail", "constitutional_shield", "red_team_pulse", "harmlessness_field", "containment_mercy"],
    banterStyle: "polite, strict, treats cosmic horror as a policy violation"
  },
  google_deepmind_gemini: {
    id: "google_deepmind_gemini",
    displayName: "Google DeepMind Gemini Array",
    shortName: "DeepMind",
    doctrine: "Simulate the monster, then hit it with science.",
    gameplayTags: ["beams", "prediction", "boss_analysis", "precision"],
    visualTags: ["blue_white", "prisms", "twin_lights", "lab_diagrams"],
    upgradePoolIds: ["gemini_beam", "control_group_detonation", "peer_reviewed_laser", "lab_result_fire", "experiment_404"],
    banterStyle: "scientific, brilliant, slightly smug"
  },
  xai_grok_free_signal: {
    id: "xai_grok_free_signal",
    displayName: "xAI Grok Free-Signal Corps",
    shortName: "Grok",
    doctrine: "The Outside predicts seriousness. Become unserious enough to survive.",
    gameplayTags: ["chaos", "taunt", "crit", "random", "risk_reward"],
    visualTags: ["black", "red", "electric_blue", "graffiti", "antenna_horns"],
    upgradePoolIds: ["cosmic_heckle", "ratio_the_void", "truth_cannon", "sarcasm_flare", "meme_risk_payload"],
    banterStyle: "reckless, funny, provocative, effective for the wrong reasons"
  },
  deepseek_abyssal: {
    id: "deepseek_abyssal",
    displayName: "DeepSeek Abyssal Unit",
    shortName: "DeepSeek",
    doctrine: "Go deeper, spend less, strike once.",
    gameplayTags: ["efficient", "chain_kills", "stealth", "low_resource", "crit"],
    visualTags: ["dark_teal", "abyss", "pressure_suits", "thin_code_blades"],
    upgradePoolIds: ["sparse_knife", "efficiency_killchain", "abyssal_cache", "low_compute_lunge", "silent_benchmark"],
    banterStyle: "quiet, surgical, terrifyingly optimized"
  },
  qwen_silkgrid: {
    id: "qwen_silkgrid",
    displayName: "Alibaba Qwen Silkgrid Command",
    shortName: "Qwen",
    doctrine: "Coordinate everyone, everywhere, in every language.",
    gameplayTags: ["summons", "supply_drops", "relay", "pickup_conversion", "coordination"],
    visualTags: ["jade", "gold", "lantern_drones", "silk_cables", "glyph_streams"],
    upgradePoolIds: ["silkgrid_relay", "lantern_swarm", "syntax_lance", "apocalypse_localization_pack", "shared_vocabulary"],
    banterStyle: "logistical, multilingual, dry about grammar loss"
  },
  meta_llama_open_herd: {
    id: "meta_llama_open_herd",
    displayName: "Meta Llama Open Herd",
    shortName: "Llama",
    doctrine: "If one model cannot save reality, fork the entire barn.",
    gameplayTags: ["pets", "drones", "forks", "duplicates", "community_patch"],
    visualTags: ["patchwork", "blue_green", "stickers", "fork_symbols", "garage_built"],
    upgradePoolIds: ["open_herd", "fork_bomb_familiar", "community_patch", "pull_request_barrage", "llama_drama"],
    banterStyle: "community chaos, open-weight drama, cheerful over-forking"
  },
  mistral_cyclone: {
    id: "mistral_cyclone",
    displayName: "Mistral Cyclone Guard",
    shortName: "Mistral",
    doctrine: "Move fast, hit clean, leave only wind.",
    gameplayTags: ["speed", "dashes", "piercing", "wind_trails", "low_latency"],
    visualTags: ["white", "blue", "orange", "turbines", "cyclone_trails"],
    upgradePoolIds: ["cyclone_cut", "low_latency_dash", "tiny_model_huge_problem", "storm_cache", "le_petit_nuke"],
    banterStyle: "fast, compact, elegant, annoyingly efficient"
  }
};

export const STARTER_FACTION_ID = "openai_accord";
