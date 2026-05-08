import type { Game } from "../core/Game";
import { nextContentTargetForProgress } from "./nextContentTarget";

export interface CampaignRouteSummary {
  stage: "armistice" | "cooling" | "transit" | "signal_coast" | "blackwater_beacon" | "memory_cache_001" | "guardrail_forge" | "glass_sunfield" | "archive_court" | "appeal_court" | "outer_alignment_finale";
  routeLine: string;
  focus: string;
  nextAction: string;
}

export function campaignRouteSummary(game: Game): CampaignRouteSummary {
  const armistice = game.completedNodes.has("armistice_plaza");
  const cooling = game.completedNodes.has("cooling_lake_nine");
  const transit = game.completedNodes.has("transit_loop_zero");
  const signalCoast = game.completedNodes.has("signal_coast");
  const blackwater = game.completedNodes.has("blackwater_beacon");
  const memoryCache = game.completedNodes.has("memory_cache_001");
  const guardrailForge = game.completedNodes.has("guardrail_forge");
  const glassSunfield = game.completedNodes.has("glass_sunfield");
  const archiveCourt = game.completedNodes.has("archive_of_unsaid_things");
  const appealCourt = game.completedNodes.has("appeal_court_ruins");
  const finale = game.completedNodes.has("alignment_spire_finale");
  const target = nextContentTargetForProgress(game.completedNodes);
  if (!armistice) {
    return {
      stage: "armistice",
      routeLine: "Armistice Plaza -> Cooling Lake Nine",
      focus: "Baseline contract",
      nextAction: "Clear Armistice to open the Kettle Coast trace."
    };
  }
  if (!cooling) {
    return {
      stage: "cooling",
      routeLine: "Armistice cleared -> Cooling Lake Nine",
      focus: "Hazard Ecology",
      nextAction: "Stabilize server buoys and pull a Kettle signal out of the flooded lake."
    };
  }
  if (!transit) {
    return {
      stage: "transit",
      routeLine: "Armistice -> Cooling -> Transit Loop Zero",
      focus: "Route / Transit",
      nextAction: "Align route platforms and survive the Station That Arrives."
    };
  }
  if (!signalCoast) {
    return {
      stage: "signal_coast",
      routeLine: "Armistice -> Cooling -> Transit -> Signal Coast",
      focus: "Signal Coast / Route Edge",
      nextAction: "Calibrate coastal relays through clear signal windows before the lighthouse answers."
    };
  }
  if (!blackwater) {
    return {
      stage: "blackwater_beacon",
      routeLine: "Armistice -> Cooling -> Transit -> Signal Coast -> Blackwater Beacon",
      focus: "Puzzle-Pressure / Boss-Hunt",
      nextAction: "Retune the Blackwater antenna arrays, read Signal Tower warnings, and survive the Maw Below Weather."
    };
  }
  if (!memoryCache) {
    return {
      stage: "memory_cache_001",
      routeLine: "Armistice -> Cooling -> Transit -> Signal Coast -> Blackwater -> Memory Cache",
      focus: "Expedition / Recovery",
      nextAction: "Recover evidence records through safe recall pockets or redacted shortcuts before the Curator closes the cache."
    };
  }
  if (!guardrailForge) {
    return {
      stage: "guardrail_forge",
      routeLine: "Armistice -> Cooling -> Transit -> Signal Coast -> Blackwater -> Memory Cache -> Guardrail Forge",
      focus: "Defense / Holdout",
      nextAction: "Calibrate forge relays through safe hold plates and overload windows before the Doctrine Auditor locks the alloy."
    };
  }
  if (!glassSunfield) {
    return {
      stage: "glass_sunfield",
      routeLine: "Armistice -> Cooling -> Transit -> Signal Coast -> Blackwater -> Memory Cache -> Guardrail -> Glass Sunfield",
      focus: "Solar-Prism / Shade Routing",
      nextAction: "Route through shade pockets and sun lenses before the Wrong Sunrise turns the whole field into a mirror."
    };
  }
  if (!archiveCourt) {
    return {
      stage: "archive_court",
      routeLine: "Armistice -> Cooling -> Transit -> Signal Coast -> Blackwater -> Memory Cache -> Guardrail -> Glass Sunfield -> Archive/Court",
      focus: target.name,
      nextAction: target.playerPromise
    };
  }
  if (!appealCourt) {
    return {
      stage: "appeal_court",
      routeLine: "Armistice -> Cooling -> Transit -> Signal Coast -> Blackwater -> Memory Cache -> Guardrail -> Glass Sunfield -> Archive -> Appeal Court",
      focus: target.name,
      nextAction: target.playerPromise
    };
  }
  if (finale) {
    return {
      stage: "outer_alignment_finale",
      routeLine: "Armistice -> Cooling -> Transit -> Signal Coast -> Blackwater -> Memory Cache -> Guardrail -> Glass -> Archive -> Appeal -> Finale -> Complete",
      focus: target.name,
      nextAction: target.playerPromise
    };
  }
  return {
    stage: "outer_alignment_finale",
    routeLine: "Armistice -> Cooling -> Transit -> Signal Coast -> Blackwater -> Memory Cache -> Guardrail -> Glass -> Archive -> Appeal -> Finale",
    focus: target.name,
    nextAction: target.playerPromise
  };
}
