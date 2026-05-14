import { Graphics, Sprite, Text, Texture } from "pixi.js";
import { fontStyle } from "../core/Assets";
import type { Player } from "../ecs/components";
import { xpNeeded } from "../gameplay/player";
import { BUILD_SLOT_CAPS, type BuildSlotKind, type BuildStats } from "../gameplay/upgrades";
import { getBuildWeaponVfxTextures, type BuildWeaponVfxFrame } from "../assets/buildWeaponVfx";
import { getMilestone14ArtTextures } from "../assets/milestone14Art";
import { drawFieldPanel, drawStatusRail, fieldKit, fieldText, type FieldPanelTone } from "./fieldKit";

export interface RogueliteHudIntel {
  routeName: string;
  routeEffect: string;
  evalName: string;
  evalEffect: string;
  anchors: { completed: number; total: number };
  objectiveLabel?: string;
  objectiveVerb?: string;
  objectivePlain?: string;
  objectiveStyle?: string;
  objectiveMechanic?: string;
  dangerPlain?: string;
  bossPressure?: string;
  rewardPlain?: string;
  objectiveReward: string;
  synergyOnline: string;
  thesisName: string;
  fusionProgress: string;
  alignmentCheckLine: string;
  nextActionLine: string;
  phase: string;
}

export function drawHud(
  layer: import("pixi.js").Container,
  width: number,
  height: number,
  player: Player,
  seconds: number,
  kills: number,
  build: BuildStats,
  objective: string,
  debugHud = false,
  consensusBurst?: { pathName: string; charge: number; maxCharge: number; ready: boolean; activations: number },
  rogueliteIntel?: RogueliteHudIntel,
  hpPulse = 0
): void {
  const leftWidth = debugHud ? 300 : 224;
  const rightWidth = debugHud ? 278 : 226;
  const leftHeight = debugHud ? 78 : 94;
  const rightHeight = debugHud ? 78 : 94;
  const hpPunch = Math.min(1, hpPulse / 0.42);
  drawFieldPanel(layer, 16, 16, leftWidth, leftHeight, { tone: hpPunch > 0 ? "red" : "teal", alpha: (debugHud ? 0.96 : 0.76) + hpPunch * 0.12 });
  drawStatusRail(layer, 30, debugHud ? 30 : 48, debugHud ? 190 : 136, debugHud ? 10 : 7, player.hp / player.maxHp, "red");
  drawStatusRail(layer, 30, debugHud ? 50 : 62, debugHud ? 190 : 136, debugHud ? 8 : 5, player.xp / xpNeeded(player.level), "blue");
  drawFieldPanel(layer, width - rightWidth - 16, 16, rightWidth, rightHeight, { tone: "amber", alpha: debugHud ? 0.96 : 0.76 });
  if (consensusBurst && debugHud) {
    const burstWidth = 278;
    const burstX = width - burstWidth - 16;
    const burstY = 102;
    drawFieldPanel(layer, burstX, burstY, burstWidth, 44, { tone: consensusBurst.ready ? "amber" : "teal", alpha: 0.95 });
    drawStatusRail(layer, burstX + 12, burstY + 25, burstWidth - 24, 7, consensusBurst.charge / consensusBurst.maxCharge, consensusBurst.ready ? "amber" : "teal");
  }

  if (!debugHud) {
    const accent = new Graphics();
    accent.rect(30, 84, 44, 3).fill({ color: fieldKit.teal, alpha: 0.78 });
    if (hpPunch > 0) {
      accent.rect(26, 28, leftWidth - 20, 2).fill({ color: fieldKit.red, alpha: 0.35 + hpPunch * 0.42 });
      accent.rect(27, 73, 52 + hpPunch * 28, 4).fill({ color: fieldKit.amber, alpha: 0.22 + hpPunch * 0.35 });
    }
    accent.rect(width - rightWidth, 84, 44, 3).fill({ color: consensusBurst?.ready ? fieldKit.amber : fieldKit.teal, alpha: 0.78 });
    layer.addChild(accent);
    addHudMicroLabel(layer, "HP", 30, 37, "left");
    addHudMicroLabel(layer, "XP", 30, 51, "left");
    addHudMicroLabel(layer, "BURST", width - rightWidth + 12, 47, "left");
  }

  const left = new Text({
    text: debugHud ? `HP ${Math.ceil(player.hp)}/${player.maxHp}  LV ${player.level}\nSHARDS ${player.xp}/${xpNeeded(player.level)}  KOs ${kills}` : `LV ${player.level}  KO ${kills}`,
    style: { ...fontStyle, fontSize: debugHud ? 14 : 10, fill: fieldKit.text, stroke: { color: "#030609", width: 3 } }
  });
  left.position.set(debugHud ? 230 : 136, debugHud ? 28 : 24);
  if (!debugHud) left.anchor.set(1, 0);
  layer.addChild(left);

  if (hpPunch > 0) {
    const hpTick = new Text({
      text: `-${Math.ceil(player.lastDamage)}`,
      style: { ...fontStyle, fontSize: debugHud ? 13 : 10, fill: "#ff8a82", stroke: { color: "#030609", width: 3 } }
    });
    hpTick.anchor.set(1, 0);
    hpTick.alpha = Math.min(1, 0.35 + hpPunch);
    hpTick.position.set(debugHud ? 286 : 210, debugHud ? 52 : 66);
    layer.addChild(hpTick);
  }

  const right = new Text({
    text: debugHud ? `${Math.floor(seconds)}s  ${objective}\nDMG ${build.weaponDamage}  CD ${build.weaponCooldown.toFixed(2)}  PIERCE ${build.projectilePierce}` : `${Math.floor(seconds)}s  ${compactObjective(objective)}`,
    style: { ...fontStyle, fontSize: debugHud ? 14 : 10, align: "right", fill: fieldKit.text, stroke: { color: "#030609", width: 3 } }
  });
  right.anchor.set(1, 0);
  right.position.set(width - 28, debugHud ? 29 : 23);
  layer.addChild(right);

  if (consensusBurst && debugHud) {
    const burst = new Text({
      text: debugHud
        ? `BURST ${consensusBurst.pathName.toUpperCase()} ${consensusBurst.charge}/${consensusBurst.maxCharge}  FIRED ${consensusBurst.activations}`
        : `BURST ${consensusBurst.ready ? "READY" : consensusBurst.charge}`,
      style: { ...fontStyle, fontSize: debugHud ? 11 : 8, align: "right", fill: consensusBurst.ready ? fieldKit.amberLight : fieldKit.textSoft, stroke: { color: "#030609", width: 3 } }
    });
    burst.anchor.set(1, 0);
    burst.position.set(width - 28, debugHud ? 108 : 61);
    layer.addChild(burst);
  }

  if (rogueliteIntel && !debugHud) {
    const objectiveLabel = rogueliteIntel.objectiveLabel ?? "ANCHOR";
    const stripWidth = 430;
    const stripX = Math.max(leftWidth + 34, width / 2 - stripWidth / 2);
    drawFieldPanel(layer, stripX, 16, stripWidth, 70, { tone: "teal", alpha: 0.78 });
    const objectiveStrip = new Text({
      text: `${objectiveLabel} ${rogueliteIntel.anchors.completed}/${rogueliteIntel.anchors.total}\n${compactGuidance(rogueliteIntel.nextActionLine)}\nWATCH ${compactThreat(rogueliteIntel.dangerPlain, rogueliteIntel.bossPressure)} // EARN ${compactReward(rogueliteIntel.rewardPlain)}`,
      style: { ...fontStyle, fontSize: 9, fill: fieldKit.text, stroke: { color: "#030609", width: 3 }, align: "center", wordWrap: true, wordWrapWidth: stripWidth - 24, lineHeight: 12 }
    });
    objectiveStrip.anchor.set(0.5, 0);
    objectiveStrip.position.set(stripX + stripWidth / 2, 25);
    layer.addChild(objectiveStrip);

    const info = new Text({
      text: `ROUTE ${compactRoute(rogueliteIntel.routeName)}${rogueliteIntel.alignmentCheckLine ? `     ${rogueliteIntel.alignmentCheckLine}` : ""}`,
      style: { ...fontStyle, fontSize: 9, fill: fieldKit.textSoft, stroke: { color: "#030609", width: 2 } }
    });
    info.position.set(30, 76);
    layer.addChild(info);
  }

  if (consensusBurst && !debugHud) {
    drawStatusRail(layer, width - rightWidth + 12, 62, rightWidth - 40, 5, consensusBurst.charge / consensusBurst.maxCharge, consensusBurst.ready ? "amber" : "teal");
    const burst = new Text({
      text: `BURST ${consensusBurst.ready ? "READY" : consensusBurst.charge}`,
      style: { ...fontStyle, fontSize: 8, align: "right", fill: consensusBurst.ready ? fieldKit.amberLight : fieldKit.textSoft, stroke: { color: "#030609", width: 3 } }
    });
    burst.anchor.set(1, 0);
    burst.position.set(width - 28, 74);
    layer.addChild(burst);
  }

  if (rogueliteIntel && debugHud) {
    const objectiveLabel = rogueliteIntel.objectiveLabel ?? "ANCHORS";
    const panelWidth = 440;
    const x = 16;
    const y = 108;
    const h = 118;
    drawFieldPanel(layer, x, y, panelWidth, h, { tone: rogueliteIntel.synergyOnline ? "amber" : "teal", alpha: debugHud ? 0.96 : 0.72 });
    drawStatusRail(layer, x + 10, y + h - 8, panelWidth - 20, 3, rogueliteIntel.anchors.completed / Math.max(1, rogueliteIntel.anchors.total), "teal");

    const compactReward = rogueliteIntel.objectiveReward ? ` + ${rogueliteIntel.objectiveReward}` : "";
    const text = fieldText(
      `${rogueliteIntel.phase}\nROUTE ${rogueliteIntel.routeName}: ${rogueliteIntel.routeEffect}\nEVAL ${rogueliteIntel.evalName}: ${rogueliteIntel.evalEffect}\n${objectiveLabel} ${rogueliteIntel.anchors.completed}/${rogueliteIntel.anchors.total}${compactReward}\nSTYLE ${rogueliteIntel.objectiveStyle ?? "Objective"}: ${rogueliteIntel.objectiveMechanic ?? rogueliteIntel.objectivePlain ?? "survive, complete, extract"}\nTHESIS ${rogueliteIntel.thesisName}${rogueliteIntel.synergyOnline ? ` // ${rogueliteIntel.synergyOnline}` : ""}\nFUSION ${rogueliteIntel.fusionProgress}${rogueliteIntel.alignmentCheckLine ? `\n${rogueliteIntel.alignmentCheckLine}` : `\nNEXT ${rogueliteIntel.nextActionLine}`}`,
      x + 12,
      y + 7,
      { size: 10, width: panelWidth - 24, fill: fieldKit.text, lineHeight: 13 }
    );
    layer.addChild(text);
  }

  drawCurrentBuildPanel(layer, width, height, build, debugHud, rogueliteIntel?.fusionProgress);
}

function compactObjective(objective: string): string {
  const buoys = objective.match(/stabilize buoys (\d+)\/(\d+).*eel in (\d+)s/i);
  if (buoys) return `B ${buoys[1]}/${buoys[2]}  EEL ${buoys[3]}s`;
  const anchors = objective.match(/optional anchors (\d+)\/(\d+).*AGI pressure in (\d+)s/i);
  if (anchors) return `A ${anchors[1]}/${anchors[2]}  AGI ${anchors[3]}s`;
  const agi = objective.match(/AGI pressure in (\d+)s/i);
  if (agi) return `AGI ${agi[1]}s`;
  const boss = objective.match(/(?:stop|break) (.+)$/i);
  if (boss) return `BOSS`;
  const survive = objective.match(/(?:survive|hold reality) (\d+)s/i);
  if (survive) return `EXTRACT ${survive[1]}s`;
  return objective.length > 18 ? `${objective.slice(0, 16)}...` : objective;
}

function compactRoute(routeName: string): string {
  if (/faction/i.test(routeName)) return "RELAY";
  if (/stabil/i.test(routeName)) return "STABLE";
  if (/shortcut/i.test(routeName)) return "SHORTCUT";
  if (/cache/i.test(routeName)) return "CACHE";
  return routeName.toUpperCase().slice(0, 8);
}

function compactGuidance(line: string): string {
  if (/extraction/i.test(line)) return "EXTRACT";
  if (/alignment check/i.test(line)) return "CHECK";
  if (/break/i.test(line)) return "BOSS";
  if (/lure|surge/i.test(line)) return "LURE HAZARD";
  if (/ride|route window/i.test(line)) return "RIDE WINDOW";
  if (/clear signal|signal window/i.test(line)) return "SIGNAL WINDOW";
  if (/hunt|tower warning|Maw/i.test(line)) return "BOSS GATE";
  if (/recover|carry|preserve/i.test(line)) return "CARRY";
  if (/calibration|overload/i.test(line)) return "HOLD WINDOW";
  if (/shade|prism|reflection/i.test(line)) return "PRISM";
  if (/replay|route rule|A\.G\.I/i.test(line)) return "REMIX";
  const match = line.match(/Move to ([^.]+)/i);
  if (match) return `GO ${match[1].slice(0, 10).toUpperCase()}`;
  return line.toUpperCase().slice(0, 14);
}

function compactThreat(dangerPlain = "", bossPressure = ""): string {
  const source = `${dangerPlain} ${bossPressure}`.toLowerCase();
  const tags: string[] = [];
  if (/horde|attacker/.test(source)) tags.push("HORDE");
  if (/broken promise|zone/.test(source)) tags.push("ZONES");
  if (/coolant|cable|vent|electric/.test(source)) tags.push("LANES");
  if (/false schedule|switchback/.test(source)) tags.push("FALSE ROUTES");
  if (/tidal|surf|wave|static/.test(source)) tags.push("SIGNAL");
  if (/context|redaction|curator/.test(source)) tags.push("REDACTION");
  if (/overload|auditor|guardrail/.test(source)) tags.push("AUDIT");
  if (/exposure|reflection|choirglass|sunrise/.test(source)) tags.push("LIGHT");
  if (/writ|docket|saint/.test(source)) tags.push("WRITS");
  if (/verdict|injunction|clerk/.test(source)) tags.push("VERDICT");
  if (/prediction|route mouth|echo|a\.g\.i/.test(source)) tags.push("PREDICTION");
  const unique = [...new Set(tags)];
  return unique.length ? unique.slice(0, 2).join("+") : "BOSS+MAP";
}

function compactReward(rewardPlain = ""): string {
  const source = rewardPlain.toLowerCase();
  const tags: string[] = [];
  if (/proof token/.test(source)) tags.push("TOKENS");
  if (/bastion|drone|vector|rift|signal vanguard|moonframe|prism|redline|bonecode|nullbreaker|overclock/.test(source)) tags.push("FRAME");
  if (/anthropic|deepmind|mistral|deepseek|qwen|meta|xai/.test(source)) tags.push("CO-MIND");
  if (/cooling|transit|signal coast|blackwater|memory|guardrail|glass|archive|appeal|finale|completion/.test(source)) tags.push("NEXT");
  const unique = [...new Set(tags)];
  return unique.length ? unique.slice(0, 3).join("+") : "NEXT";
}

function addHudMicroLabel(layer: import("pixi.js").Container, text: string, x: number, y: number, align: "left" | "right"): void {
  const label = new Text({
    text,
    style: { ...fontStyle, fontSize: 8, fill: fieldKit.textSoft, stroke: { color: "#030609", width: 2 }, align }
  });
  if (align === "right") label.anchor.set(1, 0);
  label.position.set(x, y);
  layer.addChild(label);
}

interface BuildHudEntry {
  id: string;
  label: string;
  slot: BuildSlotKind;
  rank?: number;
  frame?: BuildWeaponVfxFrame;
  fallbackTexture?: Texture;
}

function drawCurrentBuildPanel(layer: import("pixi.js").Container, width: number, height: number, build: BuildStats, debugHud: boolean, fusionProgress = ""): void {
  const panelWidth = debugHud ? 520 : 472;
  const panelHeight = debugHud ? 104 : 88;
  const x = Math.max(16, width / 2 - panelWidth / 2);
  const y = height - panelHeight - 18;
  drawFieldPanel(layer, x, y, panelWidth, panelHeight, { tone: build.fusions.length > 0 ? "amber" : "teal", alpha: debugHud ? 0.92 : 0.72, signalTabs: true });

  const title = new Text({
    text: "CURRENT BUILD",
    style: { ...fontStyle, fontSize: 9, fill: fieldKit.textSoft, stroke: { color: "#030609", width: 2 } }
  });
  title.position.set(x + 12, y + 8);
  layer.addChild(title);
  const primary = currentPrimaryEntry(build);
  drawBuildChip(layer, primary, x + 12, y + 24, 126, "teal", `${BUILD_SLOT_CAPS.primary}/${BUILD_SLOT_CAPS.primary}`);
  drawSlotGroup(layer, "SEC", secondaryEntries(build), BUILD_SLOT_CAPS.secondary, x + 148, y + 24, 128, "blue");
  drawSlotGroup(layer, "PASS", passiveEntries(build), BUILD_SLOT_CAPS.passive, x + 284, y + 24, 118, "violet");
  drawSlotGroup(layer, "FUSE", fusionEntries(build), BUILD_SLOT_CAPS.fusion, x + 410, y + 24, 50, build.fusions.length > 0 ? "amber" : "neutral", compactFusionSlotLabel(fusionProgress));
}

function compactFusionSlotLabel(progress: string): string | undefined {
  if (!progress) return undefined;
  const upper = progress.toUpperCase();
  const fraction = upper.match(/\b\d+\/\d+\b/)?.[0] ?? "";
  if (upper.includes("ONLINE:")) {
    if (upper.includes("CAUSAL RAILGUN")) return "RAIL ON";
    if (upper.includes("CATHEDRAL")) return "NO ON";
    return "FUS ON";
  }
  if (upper.includes("AVAILABLE")) {
    if (upper.includes("CAUSAL RAILGUN")) return "RAIL RDY";
    if (upper.includes("CATHEDRAL")) return "NO RDY";
  }
  if (upper.includes("CAUSAL RAILGUN")) return `RAIL ${fraction || "0/2"}`;
  if (upper.includes("CATHEDRAL")) return `NO ${fraction || "0/2"}`;
  return "FUSE";
}

function drawSlotGroup(layer: import("pixi.js").Container, label: string, entries: BuildHudEntry[], cap: number, x: number, y: number, width: number, tone: FieldPanelTone, headerOverride?: string): void {
  const header = new Text({
    text: headerOverride ?? `${label} ${entries.length}/${cap}`,
    style: { ...fontStyle, fontSize: 8, fill: fieldKit.textSoft, stroke: { color: "#030609", width: 2 } }
  });
  header.position.set(x, y - 16);
  layer.addChild(header);

  const chipWidth = label === "PASS" ? 26 : label === "FUSE" ? 42 : 58;
  for (let index = 0; index < cap; index += 1) {
    const entry = entries[index];
    const chipX = x + index * (chipWidth + 5);
    if (entry) {
      drawBuildChip(layer, entry, chipX, y, chipWidth, tone, entry.rank && entry.rank > 1 ? `R${entry.rank}` : "");
    } else {
      drawEmptySlot(layer, chipX, y, chipWidth, tone);
    }
  }
}

function drawBuildChip(layer: import("pixi.js").Container, entry: BuildHudEntry, x: number, y: number, width: number, tone: FieldPanelTone, suffix: string): void {
  drawFieldPanel(layer, x, y, width, 42, { tone, alpha: 0.82, signalTabs: false });
  const texture = iconTexture(entry);
  if (texture) {
    const icon = new Sprite(texture);
    icon.anchor.set(0.5);
    icon.scale.set(entry.slot === "primary" ? 0.24 : entry.slot === "fusion" ? 0.22 : 0.2);
    icon.position.set(x + 19, y + 22);
    layer.addChild(icon);
  } else {
    const dot = new Graphics();
    dot.circle(x + 19, y + 22, 6).fill({ color: fieldKit.teal, alpha: 0.82 });
    layer.addChild(dot);
  }

  if (width >= 54) {
    const label = new Text({
      text: `${entry.label}${suffix ? ` ${suffix}` : ""}`,
      style: { ...fontStyle, fontSize: width > 90 ? 8 : 7, fill: fieldKit.text, stroke: { color: "#030609", width: 2 }, wordWrap: true, wordWrapWidth: width - 38, lineHeight: 9 }
    });
    label.position.set(x + 34, y + 12);
    layer.addChild(label);
  } else if (suffix) {
    const rank = new Text({
      text: suffix,
      style: { ...fontStyle, fontSize: 7, fill: fieldKit.text, stroke: { color: "#030609", width: 2 } }
    });
    rank.anchor.set(0.5);
    rank.position.set(x + width - 9, y + 33);
    layer.addChild(rank);
  }
}

function drawEmptySlot(layer: import("pixi.js").Container, x: number, y: number, width: number, tone: FieldPanelTone): void {
  drawFieldPanel(layer, x, y, width, 42, { tone, alpha: 0.34, signalTabs: false });
  const g = new Graphics();
  g.rect(x + 9, y + 18, Math.max(10, width - 18), 2).fill({ color: fieldKit.textSoft, alpha: 0.22 });
  layer.addChild(g);
}

function currentPrimaryEntry(build: BuildStats): BuildHudEntry {
  if (build.weaponId === "vector_lance") return { id: "vector_lance", label: build.causalRailgun > 0 ? "CAUSAL RAIL" : "VECTOR", slot: "primary", rank: 1 + build.causalRailgun, frame: build.causalRailgun > 0 ? "causalRailgunProjectile" : "vectorProjectile" };
  if (build.weaponId === "signal_pulse") return { id: "signal_pulse", label: "SIGNAL", slot: "primary", frame: "signalBurst" };
  return { id: "refusal_shard", label: "REFUSAL", slot: "primary", fallbackTexture: getMilestone14ArtTextures()?.combatEffects.projectile };
}

function secondaryEntries(build: BuildStats): BuildHudEntry[] {
  return build.secondaryProtocols.map((id) => {
    if (id === "context_saw") return { id, label: "SAW", slot: "secondary", rank: build.contextSaw, frame: "contextSaw" };
    if (id === "patch_mortar") return { id, label: "MORTAR", slot: "secondary", rank: build.patchMortar, frame: "patchMortarArc" };
    return { id, label: shortBuildLabel(id), slot: "secondary" };
  });
}

function passiveEntries(build: BuildStats): BuildHudEntry[] {
  return build.passiveProcesses.map((id) => {
    if (id === "coherence_indexer") return { id, label: "IDX", slot: "passive", rank: build.coherenceIndexer, frame: "coherenceIndexerIcon" };
    if (id === "anchor_bodyguard") return { id, label: "GUARD", slot: "passive", rank: build.anchorBodyguard, frame: "anchorBodyguardIcon" };
    if (id === "prediction_priority") return { id, label: "PRED", slot: "passive", rank: build.predictionPriority, frame: "predictionPriorityIcon" };
    return { id, label: shortBuildLabel(id), slot: "passive" };
  });
}

function fusionEntries(build: BuildStats): BuildHudEntry[] {
  return build.fusions.map((id) => {
    if (id === "causal_railgun") return { id, label: "RAIL", slot: "fusion", rank: build.causalRailgun, frame: "causalRailgunIcon" };
    if (id === "cathedral_of_no") return { id, label: "NO", slot: "fusion", fallbackTexture: getMilestone14ArtTextures()?.combatEffects.refusalAura };
    return { id, label: shortBuildLabel(id), slot: "fusion" };
  });
}

function iconTexture(entry: BuildHudEntry): Texture | undefined {
  const buildArt = getBuildWeaponVfxTextures();
  if (entry.frame && buildArt?.frames[entry.frame]) return buildArt.frames[entry.frame];
  return entry.fallbackTexture;
}

function shortBuildLabel(id: string): string {
  return id
    .split("_")
    .map((part) => part.slice(0, 3).toUpperCase())
    .join("");
}
