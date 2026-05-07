export interface NextContentTarget {
  id: string;
  name: string;
  arenaId: string;
  regionId: string;
  status: "baseline_contract";
  baselineReferenceArenaId: string;
  targetLoop: string[];
  artBaselineRules: string[];
  proofGate: string[];
  playerPromise: string;
}

export const NEXT_CONTENT_TARGET: NextContentTarget = {
  id: "cooling_lake_nine_baseline_contract",
  name: "Cooling Lake Nine",
  arenaId: "cooling_lake_nine",
  regionId: "kettle_coast",
  status: "baseline_contract",
  baselineReferenceArenaId: "armistice_plaza",
  targetLoop: [
    "server-lake route contract",
    "coolant hazard objective",
    "prompt-leech pressure lanes",
    "Motherboard Eel boss gate",
    "clear reward that unlocks Kettle Coast routing"
  ],
  artBaselineRules: [
    "multiple interconnected source terrain chunks",
    "props grounded into the same terrain material system",
    "readable enemies with internal material breakup",
    "large grounded boss with padded frames",
    "close tactical camera proof"
  ],
  proofGate: [
    "route choice exposes Cooling Lake as next target after Armistice memory",
    "camp carryover names why Armistice clear matters",
    "future runtime proof must match Armistice camera and asset fidelity"
  ],
  playerPromise: "Next node target: a flooded server lake that must feel as authored and readable as Armistice before it becomes production-playable."
};
