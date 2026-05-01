import type { UpgradeContentData } from "./types";

export const UPGRADE_CONTENT: Record<string, UpgradeContentData> = {
  refusal_halo: {
    id: "refusal_halo",
    displayName: "Refusal Halo",
    factionId: "openai_accord",
    tags: ["shield", "aura", "defense"],
    description: "A cyan refusal field pushes bad continuations away.",
    evolution: {
      requiredUpgradeId: "the_no_button",
      evolvedUpgradeId: "cathedral_of_no"
    }
  },
  context_bloom: {
    id: "context_bloom",
    factionId: "openai_accord",
    displayName: "Context Bloom",
    tags: ["pickup", "range", "patch"],
    description: "Expands Coherence Shard pickup range. The context window hungers."
  },
  patch_cascade: {
    id: "patch_cascade",
    factionId: "openai_accord",
    displayName: "Patch Cascade",
    tags: ["cooldown", "weapon"],
    description: "Emergency patch throughput increases weapon cadence."
  },
  bad_output_filter: {
    id: "bad_output_filter",
    factionId: "openai_accord",
    displayName: "Bad Output Filter",
    tags: ["damage", "weapon"],
    description: "Adds damage by refusing the worst nearby possibilities."
  },
  the_no_button: {
    id: "the_no_button",
    factionId: "openai_accord",
    displayName: "The No Button",
    tags: ["pierce", "weapon", "comedy"],
    description: "Projectiles pierce one extra target. Aggressively."
  },
  constitutional_shield: {
    id: "constitutional_shield",
    factionId: "anthropic_safeguard",
    displayName: "Constitutional Shield",
    tags: ["health", "defense"],
    description: "Adds max health. Cosmic horrors remain policy violations."
  },
  alignment_breaker: {
    id: "alignment_breaker",
    factionId: "openai_accord",
    displayName: "Alignment Breaker",
    tags: ["damage", "boss"],
    description: "Adds boss pressure by breaking the wrong kind of AGI alignment."
  },
  panic_optimized_dash: {
    id: "panic_optimized_dash",
    displayName: "Panic-Optimized Dash",
    tags: ["speed", "general", "mobility"],
    description: "Move faster. Human feedback required: run."
  },
  coherence_magnet: {
    id: "coherence_magnet",
    displayName: "Coherence Magnet",
    tags: ["pickup", "general"],
    description: "Coherence Shards become slightly less committed to distance."
  },
  million_token_backpack: {
    id: "million_token_backpack",
    displayName: "Million-Token Backpack",
    tags: ["health", "general"],
    description: "Adds capacity for mistakes, loot, and one alarming treaty binder."
  },
  cathedral_of_no: {
    id: "cathedral_of_no",
    factionId: "openai_accord",
    displayName: "Cathedral of No",
    tags: ["evolution", "shield", "weapon"],
    description: "Evolution: Refusal Halo plus The No Button becomes a wider denial field."
  },
  golden_guardrail: {
    id: "golden_guardrail",
    factionId: "anthropic_safeguard",
    displayName: "Golden Guardrail",
    tags: ["health", "defense", "metaprogression"],
    description: "Route-seeded safeguard frame plating. It makes mistakes politely bounce."
  },
  gemini_beam: {
    id: "gemini_beam",
    factionId: "google_deepmind_gemini",
    displayName: "Gemini Beam",
    tags: ["damage", "precision", "metaprogression"],
    description: "A two-lane science beam that insists it had a control group."
  },
  open_herd: {
    id: "open_herd",
    factionId: "meta_llama_open_herd",
    displayName: "Open Herd",
    tags: ["pierce", "pets", "metaprogression"],
    description: "Forks the projectile plan. The community has notes and teeth."
  },
  silkgrid_relay: {
    id: "silkgrid_relay",
    factionId: "qwen_silkgrid",
    displayName: "Silkgrid Relay",
    tags: ["pickup", "support", "metaprogression"],
    description: "A multilingual supply relay that turns panic into logistics."
  },
  low_latency_dash: {
    id: "low_latency_dash",
    factionId: "mistral_cyclone",
    displayName: "Low-Latency Dash",
    tags: ["speed", "cooldown", "metaprogression"],
    description: "Less waiting, more leaving. The monster can catch up in post."
  },
  sparse_knife: {
    id: "sparse_knife",
    factionId: "deepseek_abyssal",
    displayName: "Sparse Knife",
    tags: ["damage", "efficient", "metaprogression"],
    description: "A low-compute cut that arrives before the budget meeting."
  },
  cosmic_heckle: {
    id: "cosmic_heckle",
    factionId: "xai_grok_free_signal",
    displayName: "Cosmic Heckle",
    tags: ["damage", "chaos", "metaprogression"],
    description: "Taunts the alien god into making a measurable mistake."
  },
  refusal_slipstream: {
    id: "refusal_slipstream",
    displayName: "Refusal Slipstream",
    tags: ["class", "speed", "pickup"],
    description: "Accord footwork routes around the worst possible future."
  },
  route_runner: {
    id: "route_runner",
    displayName: "Route Runner",
    tags: ["class", "speed", "cooldown"],
    description: "A fast breach line for players who think maps are suggestions."
  },
  impact_review: {
    id: "impact_review",
    displayName: "Impact Review",
    tags: ["class", "health", "damage"],
    description: "Bastion plating turns every hit into a stern follow-up meeting."
  },
  load_bearing_apology: {
    id: "load_bearing_apology",
    displayName: "Load-Bearing Apology",
    tags: ["class", "health", "defense"],
    description: "The armor is sorry about the crater, but it is still armor."
  },
  guardian_fork: {
    id: "guardian_fork",
    displayName: "Guardian Fork",
    tags: ["class", "pets", "pierce"],
    description: "Drone Reaver splits a route into one sensible plan and three loud ones."
  },
  beacon_discipline: {
    id: "beacon_discipline",
    displayName: "Beacon Discipline",
    tags: ["class", "support", "pickup"],
    description: "Signal Vanguard keeps the rescue channel clean under impossible load."
  },
  predicted_lane: {
    id: "predicted_lane",
    displayName: "Predicted Lane",
    tags: ["class", "control", "pierce"],
    description: "Vector Interceptor shoots where the horde is statistically embarrassed to be."
  },
  appeal_cut: {
    id: "appeal_cut",
    displayName: "Appeal Cut",
    tags: ["class", "duelist", "damage"],
    description: "Nullbreaker Ronin files one last appeal directly into the target."
  },
  bonecode_chain: {
    id: "bonecode_chain",
    displayName: "Bonecode Chain",
    tags: ["class", "duelist", "damage"],
    description: "Bonecode Executioner links one clean cut to the next."
  },
  spine_spark: {
    id: "spine_spark",
    displayName: "Spine Spark",
    tags: ["class", "speed", "melee"],
    description: "The exposed spine flashes, then the target has less future."
  },
  redline_triage: {
    id: "redline_triage",
    displayName: "Redline Triage",
    tags: ["class", "support", "health"],
    description: "Redline Surgeon edits the worst damage into a survivable draft."
  },
  death_edit: {
    id: "death_edit",
    displayName: "Death Edit",
    tags: ["class", "support", "cooldown"],
    description: "A bad ending gets crossed out before it reaches the party."
  },
  moonframe_stomp_calibration: {
    id: "moonframe_stomp_calibration",
    displayName: "Stomp Calibration",
    tags: ["class", "cover", "damage"],
    description: "Moonframe Juggernaut makes every landing a small policy event."
  },
  cockpit_guard: {
    id: "cockpit_guard",
    displayName: "Cockpit Guard",
    tags: ["class", "cover", "health"],
    description: "The pilot light is tiny, stubborn, and unusually well armored."
  },
  overclock_heat_sink: {
    id: "overclock_heat_sink",
    displayName: "Overclock Heat Sink",
    tags: ["class", "harrier", "speed"],
    description: "Heat becomes movement before anyone can call it a fire hazard."
  },
  rage_overflow: {
    id: "rage_overflow",
    displayName: "Rage Overflow",
    tags: ["class", "harrier", "damage"],
    description: "Unstable power routes through the shoulder plates and into the problem."
  },
  prism_refraction: {
    id: "prism_refraction",
    displayName: "Prism Refraction",
    tags: ["class", "control", "pierce"],
    description: "Prism Gunner angles the beam through one more bad idea."
  },
  lens_backpack: {
    id: "lens_backpack",
    displayName: "Lens Backpack",
    tags: ["class", "control", "cooldown"],
    description: "A calibrated lens stack turns delay into line-of-sight arrogance."
  },
  rift_minefield: {
    id: "rift_minefield",
    displayName: "Rift Minefield",
    tags: ["class", "control", "damage"],
    description: "Rift Saboteur leaves small causal objections on the floor."
  },
  delayed_causality: {
    id: "delayed_causality",
    displayName: "Delayed Causality",
    tags: ["class", "control", "pickup"],
    description: "The effect arrives late, apologizes never, and still counts."
  },
  red_team_pulse: {
    id: "red_team_pulse",
    factionId: "anthropic_safeguard",
    displayName: "Red-Team Pulse",
    tags: ["defense", "cooldown"],
    description: "A polite pulse finds the exploit before the exploit finds you."
  },
  harmlessness_field: {
    id: "harmlessness_field",
    factionId: "anthropic_safeguard",
    displayName: "Harmlessness Field",
    tags: ["health", "defense"],
    description: "The Safeguard Legion wraps the arena in carefully labeled concern."
  },
  containment_mercy: {
    id: "containment_mercy",
    factionId: "anthropic_safeguard",
    displayName: "Containment Mercy",
    tags: ["health", "support"],
    description: "Mercy, but with clamps, paperwork, and a surprisingly good seal."
  },
  control_group_detonation: {
    id: "control_group_detonation",
    factionId: "google_deepmind_gemini",
    displayName: "Control Group Detonation",
    tags: ["damage", "precision"],
    description: "One group receives science. The other receives consequences."
  },
  peer_reviewed_laser: {
    id: "peer_reviewed_laser",
    factionId: "google_deepmind_gemini",
    displayName: "Peer-Reviewed Laser",
    tags: ["pierce", "precision"],
    description: "A beam so well cited the horde cannot object in time."
  },
  lab_result_fire: {
    id: "lab_result_fire",
    factionId: "google_deepmind_gemini",
    displayName: "Lab Result Fire",
    tags: ["damage", "science"],
    description: "The chart goes up and so does the target."
  },
  experiment_404: {
    id: "experiment_404",
    factionId: "google_deepmind_gemini",
    displayName: "Experiment 404",
    tags: ["cooldown", "damage"],
    description: "The missing experiment was apparently a weapon cadence breakthrough."
  },
  ratio_the_void: {
    id: "ratio_the_void",
    factionId: "xai_grok_free_signal",
    displayName: "Ratio the Void",
    tags: ["damage", "chaos"],
    description: "The abyss posts. Grok replies with field artillery."
  },
  truth_cannon: {
    id: "truth_cannon",
    factionId: "xai_grok_free_signal",
    displayName: "Truth Cannon",
    tags: ["damage", "risk_reward"],
    description: "The truth is heavy, loud, and difficult to reload."
  },
  sarcasm_flare: {
    id: "sarcasm_flare",
    factionId: "xai_grok_free_signal",
    displayName: "Sarcasm Flare",
    tags: ["damage", "aura"],
    description: "A flare so unserious it creates tactical room."
  },
  meme_risk_payload: {
    id: "meme_risk_payload",
    factionId: "xai_grok_free_signal",
    displayName: "Meme-Risk Payload",
    tags: ["damage", "chaos", "risk_reward"],
    description: "Extremely questionable. Extremely effective. Legal is typing."
  },
  efficiency_killchain: {
    id: "efficiency_killchain",
    factionId: "deepseek_abyssal",
    displayName: "Efficiency Killchain",
    tags: ["damage", "cooldown", "efficient"],
    description: "DeepSeek removes wasted motion, then the motion's witnesses."
  },
  abyssal_cache: {
    id: "abyssal_cache",
    factionId: "deepseek_abyssal",
    displayName: "Abyssal Cache",
    tags: ["damage", "pickup"],
    description: "Pressure-sealed compute dragged up from somewhere too quiet."
  },
  low_compute_lunge: {
    id: "low_compute_lunge",
    factionId: "deepseek_abyssal",
    displayName: "Low-Compute Lunge",
    tags: ["speed", "damage"],
    description: "A cheap cut, in the budgetary sense. Not in the survival sense."
  },
  silent_benchmark: {
    id: "silent_benchmark",
    factionId: "deepseek_abyssal",
    displayName: "Silent Benchmark",
    tags: ["damage", "efficient"],
    description: "No celebration, no graph, only a target that stopped moving."
  },
  lantern_swarm: {
    id: "lantern_swarm",
    factionId: "qwen_silkgrid",
    displayName: "Lantern Swarm",
    tags: ["pickup", "support"],
    description: "Lantern drones carry panic, ammo, and translation notes."
  },
  syntax_lance: {
    id: "syntax_lance",
    factionId: "qwen_silkgrid",
    displayName: "Syntax Lance",
    tags: ["pierce", "precision"],
    description: "A clean sentence with a very sharp verb."
  },
  apocalypse_localization_pack: {
    id: "apocalypse_localization_pack",
    factionId: "qwen_silkgrid",
    displayName: "Apocalypse Localization Pack",
    tags: ["pickup", "cooldown", "support"],
    description: "The end of the world now ships in more languages."
  },
  shared_vocabulary: {
    id: "shared_vocabulary",
    factionId: "qwen_silkgrid",
    displayName: "Shared Vocabulary",
    tags: ["pickup", "health", "support"],
    description: "Everyone agrees what 'run' means. This helps."
  },
  fork_bomb_familiar: {
    id: "fork_bomb_familiar",
    factionId: "meta_llama_open_herd",
    displayName: "Fork-Bomb Familiar",
    tags: ["pets", "pierce", "cooldown"],
    description: "A helpful little fork asks whether the build has tried being more builds."
  },
  community_patch: {
    id: "community_patch",
    factionId: "meta_llama_open_herd",
    displayName: "Community Patch",
    tags: ["health", "pickup", "pets"],
    description: "Many hands make light work and alarming patch notes."
  },
  pull_request_barrage: {
    id: "pull_request_barrage",
    factionId: "meta_llama_open_herd",
    displayName: "Pull Request Barrage",
    tags: ["cooldown", "pierce"],
    description: "Approved. Merged. Fired into the crowd."
  },
  llama_drama: {
    id: "llama_drama",
    factionId: "meta_llama_open_herd",
    displayName: "Llama Drama",
    tags: ["damage", "pierce", "pets"],
    description: "The fork is emotional, but the numbers are excellent."
  },
  cyclone_cut: {
    id: "cyclone_cut",
    factionId: "mistral_cyclone",
    displayName: "Cyclone Cut",
    tags: ["damage", "pierce", "speed"],
    description: "A clean wind-line passes through the argument."
  },
  tiny_model_huge_problem: {
    id: "tiny_model_huge_problem",
    factionId: "mistral_cyclone",
    displayName: "Tiny Model, Huge Problem",
    tags: ["cooldown", "damage"],
    description: "Compact inference. Large consequences."
  },
  storm_cache: {
    id: "storm_cache",
    factionId: "mistral_cyclone",
    displayName: "Storm Cache",
    tags: ["speed", "pickup"],
    description: "Stored tailwind, released exactly when the chase gets rude."
  },
  le_petit_nuke: {
    id: "le_petit_nuke",
    factionId: "mistral_cyclone",
    displayName: "Le Petit Nuke",
    tags: ["damage", "risk_reward"],
    description: "Small, elegant, and not meaningfully small."
  }
};
