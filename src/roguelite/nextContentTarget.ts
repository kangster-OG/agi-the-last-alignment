export interface NextContentTarget {
  id: string;
  name: string;
  arenaId: string;
  regionId: string;
  status: "baseline_contract" | "production_art_ready";
  baselineReferenceArenaId: string;
  targetLoop: string[];
  artBaselineRules: string[];
  proofGate: string[];
  playerPromise: string;
}

export const COOLING_LAKE_CONTENT_TARGET: NextContentTarget = {
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

export const TRANSIT_LOOP_CONTENT_TARGET: NextContentTarget = {
  id: "transit_loop_zero_route_contract",
  name: "Transit Loop Zero",
  arenaId: "transit_loop_zero",
  regionId: "unreal_metro",
  status: "baseline_contract",
  baselineReferenceArenaId: "cooling_lake_nine",
  targetLoop: [
    "route/transit map kind",
    "sequential platform alignment",
    "false schedule lane pressure",
    "Station That Arrives boss/event scaffold",
    "clear reward that opens later route gates"
  ],
  artBaselineRules: [
    "large readable platform chunks",
    "route rails and arrival boards grounded into the same map material",
    "false-track pressure readable without production placeholders",
    "large station/boss silhouette sourced before production lock",
    "close tactical camera proof"
  ],
  proofGate: [
    "Cooling Lake carryover names the Kettle/Transit route implication",
    "Alignment Grid unlocks Transit after Cooling rather than only through proof seed",
    "runtime proof shows platform alignment, false schedule pressure, Station scaffold, and summary carryover"
  ],
  playerPromise: "Next node target: a route/transit map where the level is about making the road agree with itself under pressure."
};

export const SIGNAL_COAST_CONTENT_TARGET: NextContentTarget = {
  id: "signal_coast_route_edge_contract",
  name: "Signal Coast",
  arenaId: "signal_coast",
  regionId: "kettle_coast",
  status: "baseline_contract",
  baselineReferenceArenaId: "transit_loop_zero",
  targetLoop: [
    "route-edge coastal map kind",
    "signal relay calibration",
    "clear signal windows versus corrupted surf crossings",
    "Static Skimmer relay-jam pressure",
    "Lighthouse That Answers boss/event scaffold"
  ],
  artBaselineRules: [
    "large readable shoreline/causeway chunks before production lock",
    "relay pads and cable pylons grounded into map material",
    "tide/static/cable hazards readable from the close tactical camera",
    "headline enemy and lighthouse boss sourced before production lock",
    "graybox proof must not use production-art shortcuts"
  ],
  proofGate: [
    "Transit carryover names Signal Coast as the next route implication",
    "Alignment Grid unlocks Signal Coast after Transit",
    "runtime proof shows relay calibration, tide/static pressure, Static Skimmers, Lighthouse event, extraction, and expedition carryover"
  ],
  playerPromise: "Next node target: a hostile signal shoreline where timing the tide window matters as much as horde survival."
};

export const BLACKWATER_BEACON_CONTENT_TARGET: NextContentTarget = {
  id: "blackwater_beacon_split_pressure_contract",
  name: "Blackwater Beacon",
  arenaId: "blackwater_beacon",
  regionId: "blackwater_array",
  status: "baseline_contract",
  baselineReferenceArenaId: "signal_coast",
  targetLoop: [
    "ocean-platform server decks",
    "split antenna retuning under Tidecall pressure",
    "Signal Tower warning/readability windows",
    "tidal lane crossings and static interruption",
    "Maw Below Weather boss/event scaffold",
    "Blackwater Signal Key expedition reward"
  ],
  artBaselineRules: [
    "large ocean-platform/deck chunks before production lock",
    "downward antenna props and Signal Tower warning markers grounded into Blackwater material",
    "tidal/static hazards readable from the close tactical camera",
    "Tidecall Static and Maw Below Weather sourced before production lock",
    "ChatGPT Images and PixelLab must both contribute before Blackwater art can be marked complete"
  ],
  proofGate: [
    "Signal Coast carryover names Blackwater as the next route implication",
    "Alignment Grid unlocks both Blackwater Beacon and Verdict Spire after Signal Coast",
    "runtime proof shows antenna split-pressure, Tidecall Static, tidal lanes, Maw Below Weather, extraction, and expedition carryover"
  ],
  playerPromise: "Next node target: an ocean antenna platform where the road opens only if the signal and tide stop disagreeing."
};

export const PRODUCTION_ART_SOURCE_TARGET: NextContentTarget = {
  id: "cooling_transit_signal_blackwater_production_art_source_pass",
  name: "Act 01 Playtest",
  arenaId: "production_art_source_pass",
  regionId: "art_pipeline",
  status: "production_art_ready",
  baselineReferenceArenaId: "armistice_plaza",
  targetLoop: [
    "source-backed runtime art for Cooling Lake Nine",
    "source-backed runtime art for Transit Loop Zero",
    "source-backed runtime art for Signal Coast",
    "source-backed runtime art for Blackwater Beacon",
    "route/collision/gameplay proofs kept green after art replacement",
    "human taste/playtest approval before the next authored campaign branch",
    "close-camera proof against accepted Armistice fidelity"
  ],
  artBaselineRules: [
    "ChatGPT Images, PixelLab, Aseprite, Pixelorama, or explicit art-source tool first",
    "no Pixi Graphics/SVG/CSS/procedural production art shortcuts",
    "Cooling, Transit, Signal Coast, and Blackwater Beacon art must preserve their proven map-kind readability",
    "Blackwater production-art lock requires both ChatGPT Images/imagegen and PixelLab-generated runtime source",
    "proof screenshots must show the same objective and hazard/route states after art replacement"
  ],
  proofGate: [
    "Cooling graybox and systems proofs remain green",
    "Transit route graybox proof remains green",
    "Signal Coast graybox proof remains green",
    "Blackwater Beacon proof remains green",
    "production art default uses source-backed assets without placeholder projectile/peer/icon regressions"
  ],
  playerPromise: "Source-art lock complete."
};

export const MEMORY_CACHE_CONTENT_TARGET: NextContentTarget = {
  id: "memory_cache_recovery_contract",
  name: "Memory Cache",
  arenaId: "memory_cache_001",
  regionId: "memory_cache",
  status: "baseline_contract",
  baselineReferenceArenaId: "blackwater_beacon",
  targetLoop: [
    "expedition/recovery map kind",
    "recover memory records from distant evidence rooms",
    "safe recall pockets versus risky redacted shortcut corridors",
    "Context Rot pressure that interrupts recovery progress",
    "Memory Curator redaction scaffold",
    "Recovered Route Memory secret and carryover"
  ],
  artBaselineRules: [
    "large authored archive-cache ground chunks before production lock",
    "evidence nodes and memory shard props grounded into archive material",
    "corruption/recovery VFX readable from the close tactical camera",
    "Context Rot and Memory Curator sourced before production lock",
    "ChatGPT Images and PixelLab must both contribute before Memory Cache art can be marked complete"
  ],
  proofGate: [
    "Blackwater carryover names Memory Cache as the next route implication",
    "Alignment Grid unlocks Memory Cache after Blackwater while preserving older online cache schema",
    "runtime proof shows record recovery, corruption shortcuts, Context Rot, Memory Curator, extraction, and expedition carryover"
  ],
  playerPromise: "Next node target: a recovery expedition where the route opens only if the team can prove what the cache remembers."
};

export const GUARDRAIL_FORGE_CONTENT_TARGET: NextContentTarget = {
  id: "guardrail_forge_holdout_contract",
  name: "Guardrail Forge",
  arenaId: "guardrail_forge",
  regionId: "faction_signal",
  status: "baseline_contract",
  baselineReferenceArenaId: "memory_cache_001",
  targetLoop: [
    "defense/holdout map kind",
    "four guardrail relay calibrations with hold/leave timing",
    "safe hold plates versus risky overload and calibration windows",
    "Doctrine Auditor relay-jam pressure",
    "Doctrine Auditor boss/event scaffold",
    "Calibrated Guardrail Doctrine secret and carryover"
  ],
  artBaselineRules: [
    "large authored signal-foundry ground chunks before production lock",
    "relay plates, clamps, silk-grid looms, and audit presses grounded into forge material",
    "overload/static/hold VFX readable from the close tactical camera",
    "Doctrine Auditor pressure family and boss sourced before production lock",
    "ChatGPT Images and PixelLab must both contribute before Guardrail Forge art can be marked complete"
  ],
  proofGate: [
    "Memory Cache carryover names Guardrail Forge as the next route implication",
    "Alignment Grid launches Guardrail Forge as its own arena after Memory Cache",
    "runtime proof shows relay holdout, overload/hold pressure, Doctrine Auditors, boss scaffold, extraction, and expedition carryover"
  ],
  playerPromise: "Next node target: a faction signal foundry where safety doctrine must hold under pressure without becoming a brittle wall."
};

export const GLASS_SUNFIELD_CONTENT_TARGET: NextContentTarget = {
  id: "glass_sunfield_prism_contract",
  name: "Glass Sunfield",
  arenaId: "glass_sunfield",
  regionId: "glass_sunfield",
  status: "baseline_contract",
  baselineReferenceArenaId: "guardrail_forge",
  targetLoop: [
    "solar-prism traversal map kind",
    "shade pocket routing versus exposed glassfield lanes",
    "sun lens objective timing under reflection pressure",
    "Solar Reflection and Choirglass enemy pressure",
    "Wrong Sunrise boss/event scaffold",
    "Glass Sunfield Prism secret and finale-route carryover"
  ],
  artBaselineRules: [
    "large authored glass-and-civic solar ground chunks before production lock",
    "lens pylons, shade ribs, and prism gates grounded into sunfield material",
    "solar beam/reflection/shade VFX readable from the close tactical camera",
    "Solar Reflection pressure family and Wrong Sunrise boss sourced before production lock",
    "ChatGPT Images and PixelLab must both contribute before Glass Sunfield art can be marked complete"
  ],
  proofGate: [
    "Guardrail Forge carryover names Glass Sunfield as the next route implication",
    "Alignment Grid launches Glass Sunfield after Calibrated Guardrail Doctrine",
    "runtime proof shows prism timing, shade routing, reflection pressure, Wrong Sunrise, extraction, and expedition carryover"
  ],
  playerPromise: "Next node target: a sun-blasted glassfield where the safest route is the one that knows when to stand in the shade."
};

export const ARCHIVE_COURT_CONTENT_TARGET: NextContentTarget = {
  id: "archive_court_redaction_contract",
  name: "Archive/Court Branch",
  arenaId: "archive_of_unsaid_things",
  regionId: "archive_field",
  status: "baseline_contract",
  baselineReferenceArenaId: "glass_sunfield",
  targetLoop: [
    "archive/court pressure map kind",
    "redaction-safe evidence routing",
    "appeal pages and court-writ pressure",
    "Redactor Saint or Injunction Engine event scaffold",
    "Archive/Court secret and finale-route carryover"
  ],
  artBaselineRules: [
    "large authored archive/court chunks before production lock",
    "redaction stacks, appeal seals, and witness props grounded into civic archive material",
    "redaction/writ hazards readable from the close tactical camera",
    "Archive/Court pressure family and boss sourced before production lock",
    "ChatGPT Images and PixelLab must both contribute before Archive/Court art can be marked complete"
  ],
  proofGate: [
    "Glass Sunfield carryover names Archive/Court as the next route implication",
    "Alignment Grid launches Archive/Court after Glass while preserving older Verdict routes",
    "runtime proof shows redaction/court pressure, boss scaffold, extraction, and expedition carryover"
  ],
  playerPromise: "Next node target: the Archive/Court branch, where evidence has to survive being edited by the enemy."
};

export const APPEAL_COURT_CONTENT_TARGET: NextContentTarget = {
  id: "appeal_court_ruins_contract",
  name: "Appeal Court Ruins",
  arenaId: "appeal_court_ruins",
  regionId: "adjudication_rupture",
  status: "baseline_contract",
  baselineReferenceArenaId: "archive_of_unsaid_things",
  targetLoop: [
    "ruined-court escalation map kind",
    "appeal brief page recovery",
    "injunction writ pressure and court-record sealing",
    "Injunction Engine event scaffold",
    "Appeal Court secret and finale-route carryover"
  ],
  artBaselineRules: [
    "large authored ruined tribunal chunks before production lock",
    "appeal seals, writ pylons, and argument props grounded into court material",
    "injunction/verdict hazards readable from the close tactical camera",
    "Appeal Court pressure family and boss sourced before production lock",
    "ChatGPT Images and PixelLab must both contribute before Appeal Court art can be marked complete"
  ],
  proofGate: [
    "Archive/Court carryover names Appeal Court as the next route implication",
    "Alignment Grid launches Appeal Court after Archive while preserving older Verdict routes",
    "runtime proof shows court pressure, boss scaffold, extraction, and expedition carryover"
  ],
  playerPromise: "Next node target: the Appeal Court Ruins, where preserved evidence becomes an argument A.G.I. cannot quietly delete."
};

export const OUTER_ALIGNMENT_FINALE_CONTENT_TARGET: NextContentTarget = {
  id: "outer_alignment_finale_contract",
  name: "Outer Alignment Finale",
  arenaId: "alignment_spire_finale",
  regionId: "outer_alignment",
  status: "baseline_contract",
  baselineReferenceArenaId: "appeal_court_ruins",
  targetLoop: [
    "Outer Alignment finale map kind",
    "final route proof across prior campaign lessons",
    "previous-boss echo pressure",
    "A.G.I. prediction boss/event scaffold",
    "Alignment Spire capstone and full-campaign completion"
  ],
  artBaselineRules: [
    "large authored outer-alignment chunks before production lock",
    "finale route mouths, prediction ghosts, and boss-echo props grounded into one material system",
    "prediction and echo hazards readable from the close tactical camera",
    "A.G.I. finale boss sourced before production lock",
    "ChatGPT Images and PixelLab must both contribute before finale art can be marked complete"
  ],
  proofGate: [
    "Appeal Court carryover names the public ruling as the finale route key",
    "Alignment Grid launches the finale after Appeal Court while preserving older online finale schema",
    "runtime proof shows prior-lesson pressure, A.G.I. scaffold, extraction/finale clear, and full-campaign carryover"
  ],
  playerPromise: "Next node target: the Outer Alignment finale, where the public ruling becomes the route A.G.I. cannot predict quietly."
};

export const FULL_CAMPAIGN_COMPLETE_TARGET: NextContentTarget = {
  id: "full_campaign_complete_contract",
  name: "Full Campaign Complete",
  arenaId: "campaign_complete",
  regionId: "outer_alignment",
  status: "production_art_ready",
  baselineReferenceArenaId: "alignment_spire_finale",
  targetLoop: [
    "complete local campaign chain",
    "finale carryover summary",
    "production-art defaults remain source-backed",
    "human taste/playtest approval"
  ],
  artBaselineRules: [
    "all local campaign maps use source-backed runtime art by default",
    "placeholder/debug opt-outs remain explicit and proof-visible",
    "finale screenshots and source contact sheets remain the art-complete gate"
  ],
  proofGate: [
    "Alignment Spire finale proof reaches summary/carryover",
    "full campaign proof reaches finale completion",
    "campaign ledger records every authored map kind through Outer Alignment",
    "final regression suite remains green"
  ],
  playerPromise: "Full local campaign complete. Remaining work is final human taste/playtest approval and any release-candidate polish."
};

export const NEXT_CONTENT_TARGET = COOLING_LAKE_CONTENT_TARGET;

export function nextContentTargetForProgress(completedNodes: ReadonlySet<string>): NextContentTarget {
  if (completedNodes.has("alignment_spire_finale")) return FULL_CAMPAIGN_COMPLETE_TARGET;
  if (completedNodes.has("appeal_court_ruins")) return OUTER_ALIGNMENT_FINALE_CONTENT_TARGET;
  if (completedNodes.has("archive_of_unsaid_things")) return APPEAL_COURT_CONTENT_TARGET;
  if (completedNodes.has("glass_sunfield")) return ARCHIVE_COURT_CONTENT_TARGET;
  if (completedNodes.has("guardrail_forge")) return GLASS_SUNFIELD_CONTENT_TARGET;
  if (completedNodes.has("memory_cache_001")) return GUARDRAIL_FORGE_CONTENT_TARGET;
  if (completedNodes.has("blackwater_beacon")) return MEMORY_CACHE_CONTENT_TARGET;
  if (completedNodes.has("signal_coast")) return BLACKWATER_BEACON_CONTENT_TARGET;
  if (completedNodes.has("transit_loop_zero")) return SIGNAL_COAST_CONTENT_TARGET;
  if (completedNodes.has("cooling_lake_nine")) return TRANSIT_LOOP_CONTENT_TARGET;
  return COOLING_LAKE_CONTENT_TARGET;
}
