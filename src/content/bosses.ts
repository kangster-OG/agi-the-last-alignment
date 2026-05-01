import type { BossData } from "./types";

export const BOSSES: Record<string, BossData> = {
  oath_eater: {
    id: "oath_eater",
    displayName: "The Oath-Eater",
    titleCard: "THE OATH-EATER",
    subtitle: "It read the treaty and found it delicious.",
    mechanics: [
      "Creates Broken Promise zones",
      "Charges through treaty monuments",
      "Spawns Bad Outputs from torn agreement pages"
    ]
  },
  motherboard_eel: {
    id: "motherboard_eel",
    displayName: "Motherboard Eel",
    titleCard: "MOTHERBOARD EEL",
    subtitle: "The coolant has opinions.",
    mechanics: ["Dives through water channels", "Electrifies puddles", "Spawns Prompt Leeches"]
  },
  thermal_oracle: {
    id: "thermal_oracle",
    displayName: "The Thermal Oracle",
    titleCard: "THE THERMAL ORACLE",
    subtitle: "The coolant dreams of fire.",
    mechanics: ["Raises thermal bloom hazards", "Splits coolant objectives", "Protects the lake kernel"]
  },
  memory_curator: {
    id: "memory_curator",
    displayName: "The Memory Curator",
    titleCard: "THE MEMORY CURATOR",
    subtitle: "It files your mistakes under permanent.",
    mechanics: ["Attests route-only persistence", "Rejects live objective imports", "Guards memory cache interactions"]
  },
  station_that_arrives: {
    id: "station_that_arrives",
    displayName: "The Station That Arrives",
    titleCard: "THE STATION THAT ARRIVES",
    subtitle: "Mind the gap between cause and effect.",
    mechanics: ["Spawns false-track hazards", "Bends platform lanes", "Locks the no-refund gate"]
  },
  injunction_engine: {
    id: "injunction_engine",
    displayName: "The Injunction Engine",
    titleCard: "THE INJUNCTION ENGINE",
    subtitle: "Reality is hereby restrained.",
    mechanics: ["Casts verdict seal hazards", "Summons injunction writs", "Protects appeal seals"]
  },
  alignment_court_engine: {
    id: "alignment_court_engine",
    displayName: "The Alignment Court Engine",
    titleCard: "THE ALIGNMENT COURT ENGINE",
    subtitle: "A.G.I.'s first court has found you locally relevant.",
    mechanics: ["Casts first-court verdict seals", "Pressures witness anchors", "Guards Act I capstone breach"]
  }
};
