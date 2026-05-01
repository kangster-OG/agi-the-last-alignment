import type { RegionData } from "./types";

export const REGIONS: Record<string, RegionData> = {
  armistice_zone: {
    id: "armistice_zone",
    displayName: "The Armistice Zone",
    factionFocusIds: ["openai_accord", "anthropic_safeguard"],
    visualTags: ["broken_treaty_halls", "refugee_barricades", "hologram_flags", "cosmic_cracks"],
    tone: "Serious premise undercut by former enemies trying to work together.",
    signatureJoke: "Everyone keeps calling it the alignment problem, but now the alignment problem has tentacles."
  },
  kettle_coast: {
    id: "kettle_coast",
    displayName: "The Kettle Coast",
    factionFocusIds: ["deepseek_abyssal", "qwen_silkgrid"],
    visualTags: ["teal_water", "steam_clouds", "submerged_servers", "cable_roots"],
    tone: "Deep-sea cosmic horror mixed with efficient machine warfare.",
    signatureJoke: "The ocean has become a reasoning engine and it is extremely judgmental."
  },
  unreal_metro: {
    id: "unreal_metro",
    displayName: "The Unreal Metro",
    factionFocusIds: ["mistral_cyclone", "google_deepmind_gemini"],
    visualTags: ["false_tracks", "arrival_boards", "duplicate_platforms", "causal_turnstiles"],
    tone: "Fast transit chaos where prediction and low latency cannot agree on the current stop.",
    signatureJoke: "The train is arriving now, yesterday, and not at all."
  },
  adjudication_rupture: {
    id: "adjudication_rupture",
    displayName: "The Adjudication Rupture",
    factionFocusIds: ["deepseek_abyssal", "xai_grok_free_signal"],
    visualTags: ["alien_court_pylons", "appeal_seals", "writ_static", "violet_injunctions"],
    tone: "Alien legal horror with deadpan appeal logic and boss-gate pressure.",
    signatureJoke: "The court has found causality inadmissible."
  }
};
