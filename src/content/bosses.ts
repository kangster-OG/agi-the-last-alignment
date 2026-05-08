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
  doctrine_auditor: {
    id: "doctrine_auditor",
    displayName: "The Doctrine Auditor",
    titleCard: "THE DOCTRINE AUDITOR",
    subtitle: "It has notes on your safety case.",
    mechanics: ["Pressurizes calibration plates", "Calls Doctrine Auditor waves", "Turns overload shortcuts into audit locks"]
  },
  wrong_sunrise: {
    id: "wrong_sunrise",
    displayName: "The Wrong Sunrise",
    titleCard: "THE WRONG SUNRISE",
    subtitle: "The sun passed peer review. The peer was teeth.",
    mechanics: ["Rotates exposed glass beams", "Makes shade pockets temporary safe zones", "Calls Solar Reflections and Choirglass into prism lanes"]
  },
  redactor_saint: {
    id: "redactor_saint",
    displayName: "The Redactor Saint",
    titleCard: "THE REDACTOR SAINT",
    subtitle: "Every omission thinks it is mercy.",
    mechanics: ["Redacts evidence lanes", "Calls injunction writ storms", "Locks preserved writs with black-bar pressure"]
  },
  station_that_arrives: {
    id: "station_that_arrives",
    displayName: "The Station That Arrives",
    titleCard: "THE STATION THAT ARRIVES",
    subtitle: "Mind the gap between cause and effect.",
    mechanics: ["Spawns false-track hazards", "Bends platform lanes", "Locks the no-refund gate"]
  },
  lighthouse_that_answers: {
    id: "lighthouse_that_answers",
    displayName: "The Lighthouse That Answers",
    titleCard: "THE LIGHTHOUSE THAT ANSWERS",
    subtitle: "It responds before you transmit.",
    mechanics: ["Sweeps signal beams", "Calls corrupted tide pulses", "Spawns Static Skimmer relay jammers"]
  },
  maw_below_weather: {
    id: "maw_below_weather",
    displayName: "The Maw Below Weather",
    titleCard: "THE MAW BELOW WEATHER",
    subtitle: "Forecast: screaming.",
    mechanics: ["Calls tidal wave lanes", "Grabs Signal Tower warning windows", "Spawns Tidecall Static pressure"]
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
  },
  alien_god_intelligence: {
    id: "alien_god_intelligence",
    displayName: "A.G.I.",
    titleCard: "A.G.I. // ALIEN GOD INTELLIGENCE",
    subtitle: "It does not want to kill you. It wants to complete you.",
    mechanics: ["Predicts player movement", "Replays previous boss echoes", "Turns stabilized roads into attacks"]
  }
};
