import { Client, type Room } from "@colyseus/sdk";
import { Container, Graphics, Sprite, Text, Texture } from "pixi.js";
import { fontStyle, palette } from "../core/Assets";
import type { Game } from "../core/Game";
import type { GameState } from "../core/StateMachine";
import type { Entity } from "../ecs/components";
import { byIsoDepth } from "../iso/depthSort";
import { worldToIso } from "../iso/projection";
import { drawIsoDiamond } from "../iso/tilemap";
import { ARMISTICE_PLAZA_MAP } from "../level/armisticePlazaMap";
import { ALIGNMENT_GRID_MAP } from "../overworld/alignmentGridMap";
import { clearLayer } from "../render/layers";
import { drawEnemyOnGraphics, drawPixelPersonOnGraphics } from "../render/sprites";
import { COMBAT_CLASSES, FACTIONS } from "../content";
import type { OnlineConsensusSnapshot, OnlineDialogueSnippetSnapshot, OnlinePlayerSnapshot } from "./onlineTypes";
import { addArmisticeTileSprite, armisticeTileKeyForTerrain, getArmisticeGroundAtlasTextures, loadArmisticeGroundAtlas } from "../assets/armisticeGroundAtlas";
import { milestone11EnemyTextureFor } from "../assets/milestone11Art";
import { getMilestone12ArtTextures, loadMilestone12Art, milestone12NetworkPlayerTexture } from "../assets/milestone12Art";
import { getMilestone14ArtTextures, loadMilestone14Art } from "../assets/milestone14Art";
import { placeWorldSprite, type PlayerFacing } from "../assets/milestone10Art";
import { getMilestone25RouteArtTextures, loadMilestone25RouteArt } from "../assets/milestone25Art";
import { getMilestone26VerdictArtTextures, loadMilestone26VerdictArt } from "../assets/milestone26Art";
import { getMilestone28OnlineRouteArtTextures, loadMilestone28OnlineRouteArt, type Milestone28HazardFrame } from "../assets/milestone28Art";
import { isRuntimeReadyAsset } from "../assets/manifest";
import {
  getMilestone41ArenaIdentityArtTextures,
  isMilestone41ArenaIdentityArtReady,
  loadMilestone41ArenaIdentityArt,
  type Milestone41ArenaIdentityArtTextures
} from "../assets/milestone41ArenaIdentityArt";
import {
  getMilestone34ObjectiveArtTextures,
  loadMilestone34ObjectiveArt,
  type Milestone34ObjectiveArtTextures,
  type PartyVotePipFrame,
  type RouteRewardBadgeFrame,
  type RouteStateMarkerFrame,
  type SaveProfileIconFrame
} from "../assets/milestone34ObjectiveArt";

const ONLINE_PROGRESSION_STORAGE_KEY = "agi:last_alignment:online_progression:v1";

type ConnectionStatus = "connecting" | "joined" | "error" | "closed";

interface DepthDrawable {
  depthY: number;
  draw: () => void;
}

type OnlineObjectiveInstance = NonNullable<OnlineConsensusSnapshot["objectives"]>["instances"][number];
type PartyRouteState = "stable" | "unstable" | "locked";
type RouteFocusMode = "all" | "critical" | "branches" | "rewards" | "schema";

const ROUTE_FOCUS_MODES: RouteFocusMode[] = ["all", "critical", "branches", "rewards", "schema"];
const ROUTE_FOCUS_LABELS: Record<RouteFocusMode, string> = {
  all: "ALL ROUTES",
  critical: "CRITICAL PATH",
  branches: "BRANCHES",
  rewards: "REWARDS",
  schema: "CONTENT SCHEMA"
};
const ROUTE_FOCUS_DESCRIPTIONS: Record<RouteFocusMode, string> = {
  all: "Full campaign grid with selected-node details.",
  critical: "Mainline route to the Alignment Spire Finale.",
  branches: "Optional lore, cache, and alternate route nodes.",
  rewards: "Unclaimed route rewards and recommended next clears.",
  schema: "Runtime arena, objective, boss, reward, and content IDs."
};

export class OnlineCoopState implements GameState {
  readonly mode = "OnlineCoop" as const;
  status: ConnectionStatus = "connecting";
  roomId = "";
  sessionId = "";
  serverUrl = "";
  snapshot: OnlineConsensusSnapshot | null = null;
  lastError = "";
  reconnectKey = reconnectKeyForTab();
  private room: Room | null = null;
  private sequence = 0;
  private sendTimer = 0;
  private staticSceneKey = "";
  private staticSceneSignature = "";
  private requestedAtlasLoad = false;
  private requestedProductionArtLoad = false;
  private requestedRouteArtLoad = false;
  private requestedVerdictArtLoad = false;
  private requestedOnlineRouteExpansionArtLoad = false;
  private requestedMilestone34ObjectiveArtLoad = false;
  private requestedMilestone41ArenaIdentityArtLoad = false;
  private readonly proofControlsEnabled = new URLSearchParams(window.location.search).get("proofOnlineFlow") === "1";
  private readonly entityGraphics = new Graphics();
  private readonly productionSpriteLayer = new Container();
  private readonly productionSprites = new Map<string, Sprite>();
  private readonly map = ARMISTICE_PLAZA_MAP;
  private routeFocusMode: RouteFocusMode = "all";

  enter(game: Game): void {
    this.serverUrl = onlineServerUrl();
    this.connect(game);
    this.render(game);
  }

  exit(): void {
    this.room?.leave();
    this.room = null;
    this.entityGraphics.parent?.removeChild(this.entityGraphics);
    this.productionSpriteLayer.parent?.removeChild(this.productionSpriteLayer);
    this.productionSpriteLayer.removeChildren().forEach((child) => child.destroy({ children: true }));
    this.productionSprites.clear();
  }

  update(game: Game, dt: number): void {
    if (game.input.wasPressed("escape")) {
      const room = this.room;
      this.room = null;
      room?.leave();
      game.showMainMenu();
      return;
    }
    if (game.input.wasPressed("retry")) {
      const room = this.room;
      this.room = null;
      room?.leave();
      this.status = "connecting";
      this.lastError = "";
      this.roomId = "";
      this.sessionId = "";
      this.snapshot = null;
      this.connect(game);
      return;
    }
    const phase = this.snapshot?.runPhase ?? "active";
    if (this.room && this.status === "joined" && (phase === "completed" || phase === "failed") && game.input.wasPressed("dash")) {
      this.room.send("return_to_party", {});
      return;
    }
    if (this.room && this.status === "joined" && phase === "lobby" && game.input.wasPressed("dash")) {
      const local = this.localPlayer();
      this.room.send("ready", { ready: !local?.ready });
      return;
    }
    if (this.room && this.status === "joined" && phase === "lobby" && game.input.wasPressed("one")) {
      void this.copyExportCode();
      return;
    }
    if (this.room && this.status === "joined" && phase === "lobby" && game.input.wasPressed("two")) {
      void this.promptImportCode(game);
      return;
    }
    if (this.room && this.status === "joined" && phase === "lobby" && game.input.wasPressed("three")) {
      this.cycleRouteFocusMode();
      this.staticSceneSignature = "";
      this.render(game);
      return;
    }
    if (this.room && this.status === "joined" && phase === "lobby" && game.input.wasPressed("four")) {
      this.resetLocalProfileAndReconnect(game);
      return;
    }
    if (this.room && this.status === "joined" && phase === "lobby" && (game.input.wasPressed("left") || game.input.wasPressed("right"))) {
      const nextNode = this.nextVotableNode(game.input.wasPressed("right") ? 1 : -1);
      if (nextNode) this.room.send("vote_node", { nodeId: nextNode.id });
      return;
    }
    if (this.room && this.status === "joined" && phase === "active") {
      const pending = this.snapshot?.progression?.upgradePending;
      if (pending && (game.input.wasPressed("one") || game.input.wasPressed("two") || game.input.wasPressed("three"))) {
        const index = game.input.wasPressed("two") ? 1 : game.input.wasPressed("three") ? 2 : 0;
        this.room.send("upgrade_choice", { upgradeId: pending.cards[index]?.id ?? pending.cards[0]?.id });
      } else if (this.proofControlsEnabled && game.input.wasPressed("one")) {
        this.room.send("proof:splitRoleAnchors", {});
        this.room.send("proof:advanceObjective", {});
      } else if (this.proofControlsEnabled && game.input.wasPressed("four")) {
        this.room.send("proof:downLocal", {});
      } else if (this.proofControlsEnabled && game.input.wasPressed("two")) {
        this.room.send("proof:grantSharedXp", {});
      } else if (this.proofControlsEnabled && game.input.wasPressed("three")) {
        this.room.send("proof:completeRun", {});
      } else if (this.proofControlsEnabled && game.input.wasPressed("fullscreen")) {
        this.room.send("proof:spawnBoss", {});
      }
    }
    this.sendTimer -= dt;
    if (this.room && this.status === "joined" && phase === "active" && this.sendTimer <= 0) {
      this.sequence += 1;
      const axis = game.input.axis();
      this.room.send("input", {
        schemaVersion: 1,
        sequence: this.sequence,
        axisX: axis.x,
        axisY: axis.y,
        dashPressed: game.input.wasPressed("dash")
      });
      this.sendTimer = 1 / 20;
    }
  }

  render(game: Game): void {
    const phase = this.snapshot?.runPhase ?? (this.status === "joined" ? "lobby" : "joining");
    if (phase === "lobby") {
      this.ensurePartyOverworld(game);
    } else {
      this.ensureStaticArena(game);
    }
    this.clearDynamicLayers(game);
    const selectedPartyNode = this.selectedPartyMapNode();
    const focus = phase === "lobby" && selectedPartyNode ? selectedPartyNode : this.localPlayer() ?? this.snapshot?.players[0];
    if (focus) {
      game.camera.follow(focus.worldX, focus.worldY, 0.24);
    } else {
      game.camera.follow(0, 0, 0.24);
    }
    game.camera.apply(game.layers.root, game.width, game.height);

    if (phase === "lobby") {
      this.drawPartyLobbyEntities(game);
    } else {
      this.drawEntities(game);
    }
    this.drawHud(game);
  }

  connectionInfo() {
    return {
      status: this.status,
      serverUrl: this.serverUrl,
      roomId: this.roomId,
      sessionId: this.sessionId,
      lastError: this.lastError,
      reconnectKey: shortReconnectKey(this.reconnectKey),
      reconnect: this.snapshot?.reconnect ?? null,
      lifecycle: this.snapshot?.lifecycle ?? null,
      localPersistence: localPersistenceStatus,
      saveProfile: this.saveProfileInfo(),
      routeUi: this.routeUiInfo(),
      controls: "Lobby: 1 copy export code, 2 import code, 4 reset browser-local profile. R reconnects; Esc leaves."
    };
  }

  private async connect(game: Game): Promise<void> {
    try {
      const client = new Client(this.serverUrl);
      const proofLoadout = onlineProofLoadoutParams();
      const room = await client.joinOrCreate("consensus_cell", {
        classId: proofLoadout.classId ?? game.selectedClassId,
        factionId: proofLoadout.factionId ?? game.selectedFactionId,
        reconnectKey: this.reconnectKey,
        clientMilestone: "milestone32_party_builds",
        onlineProgressionDraft: readOnlineProgressionDraft()
      });
      this.room = room;
      this.roomId = room.roomId;
      this.sessionId = room.sessionId;
      this.status = "joined";
      room.onMessage("snapshot", (snapshot: OnlineConsensusSnapshot) => {
        this.snapshot = snapshot;
        writeOnlineProgressionDraft(snapshot);
      });
      room.onLeave(() => {
        if (this.room === room && this.status !== "error") this.status = "closed";
      });
    } catch (error) {
      this.status = "error";
      this.lastError = error instanceof Error ? error.message : String(error);
    }
  }

  private async copyExportCode(): Promise<void> {
    const code = exportCodeForSnapshot(this.snapshot);
    if (!code) {
      localPersistenceStatus.lastAction = "export_unavailable";
      return;
    }
    localPersistenceStatus.exportCode = code;
    localPersistenceStatus.lastAction = "export_code_ready";
    try {
      await navigator.clipboard?.writeText(code);
      localPersistenceStatus.exportCodeCopied = true;
      localPersistenceStatus.lastAction = "export_code_copied";
    } catch {
      localPersistenceStatus.exportCodeCopied = false;
    }
  }

  private async promptImportCode(game: Game): Promise<void> {
    const code = window.prompt("Paste AGI local profile export code. This imports route rewards only; no combat/run state or cloud account data.");
    if (!code) {
      localPersistenceStatus.lastAction = "import_cancelled";
      return;
    }
    const draft = decodeOnlineProfileCode(code);
    if (!draft) {
      localPersistenceStatus.importCodeStatus = "invalid_code";
      localPersistenceStatus.lastAction = "import_invalid_code";
      return;
    }
    writeImportedDraftToStorage(draft);
    localPersistenceStatus.importCodeApplied = true;
    localPersistenceStatus.importCodeStatus = "stored_code_reconnecting";
    localPersistenceStatus.importCodeHash = typeof draft.saveHash === "string" ? draft.saveHash : "";
    localPersistenceStatus.lastAction = "import_code_stored";
    this.reconnectWithFreshDraft(game);
  }

  private resetLocalProfileAndReconnect(game: Game): void {
    const confirmed = window.confirm("Reset this browser-local prototype online route profile? This does not affect any account or cloud save.");
    if (!confirmed) {
      localPersistenceStatus.lastAction = "reset_cancelled";
      return;
    }
    try {
      localPersistenceStatus.clearedStoredProfile = Boolean(window.localStorage.getItem(ONLINE_PROGRESSION_STORAGE_KEY));
      window.localStorage.removeItem(ONLINE_PROGRESSION_STORAGE_KEY);
    } catch {
      // Ignore private-mode storage failures.
    }
    localPersistenceStatus.resetApplied = true;
    localPersistenceStatus.foundStoredProfile = false;
    localPersistenceStatus.draftHash = "";
    localPersistenceStatus.exportCode = "";
    localPersistenceStatus.lastAction = "reset_local_profile";
    this.reconnectWithFreshDraft(game);
  }

  private reconnectWithFreshDraft(game: Game): void {
    const room = this.room;
    this.room = null;
    room?.leave();
    this.status = "connecting";
    this.lastError = "";
    this.roomId = "";
    this.sessionId = "";
    this.snapshot = null;
    this.connect(game);
  }

  private clearDynamicLayers(game: Game): void {
    this.entityGraphics.clear();
    if (!this.entityGraphics.parent) game.layers.entities.addChild(this.entityGraphics);
    this.prepareProductionSprites(game);
    clearLayer(game.layers.projectiles);
    clearLayer(game.layers.floatingText);
    clearLayer(game.layers.hud);
  }

  private ensureStaticArena(game: Game): void {
    const signature = `arena:${this.snapshot?.arenaId ?? "armistice_plaza"}`;
    if (
      this.staticSceneKey === "arena" &&
      this.staticSceneSignature === signature &&
      game.layers.background.children.length > 0 &&
      game.layers.ground.children.length > 0 &&
      game.layers.propsBehind.children.length > 0
    ) {
      return;
    }
    clearLayer(game.layers.background);
    clearLayer(game.layers.ground);
    clearLayer(game.layers.decals);
    clearLayer(game.layers.propsBehind);
    clearLayer(game.layers.propsFront);
    this.drawStaticArena(game);
    this.staticSceneKey = "arena";
    this.staticSceneSignature = signature;
  }

  private ensurePartyOverworld(game: Game): void {
    const signature = `party:${this.routeFocusMode}:${this.snapshot?.party?.selectedNodeId ?? ""}:${this.snapshot?.party?.unlockedNodeIds.join(",") ?? ""}:${this.snapshot?.party?.completedNodeIds.join(",") ?? ""}`;
    if (
      this.staticSceneKey === "party-overworld" &&
      this.staticSceneSignature === signature &&
      game.layers.background.children.length > 0 &&
      game.layers.ground.children.length > 0 &&
      game.layers.propsBehind.children.length > 0
    ) {
      return;
    }
    clearLayer(game.layers.background);
    clearLayer(game.layers.ground);
    clearLayer(game.layers.decals);
    clearLayer(game.layers.propsBehind);
    clearLayer(game.layers.propsFront);
    this.drawStaticPartyOverworld(game);
    this.staticSceneKey = "party-overworld";
    this.staticSceneSignature = signature;
  }

  private drawStaticArena(game: Game): void {
    const arenaId = this.snapshot?.arenaId ?? "armistice_plaza";
    const coolingLake = arenaId === "cooling_lake_nine";
    const thermalArchive = arenaId === "thermal_archive";
    const transitLoop = arenaId === "transit_loop_zero";
    const falseScheduleYard = arenaId === "false_schedule_yard";
    const glassSunfield = arenaId === "glass_sunfield";
    const archiveUnsaid = arenaId === "archive_of_unsaid_things";
    const memoryCache = arenaId === "memory_cache_001";
    const memoryBranch = arenaId === "model_war_memorial" || arenaId === "guardrail_forge";
    const verdictSpire = arenaId === "verdict_spire";
    const appealCourt = arenaId === "appeal_court_ruins";
    const alignmentFinale = arenaId === "alignment_spire_finale";
    const coolingFamily = coolingLake || thermalArchive;
    const transitFamily = transitLoop || falseScheduleYard;
    const solarFamily = glassSunfield;
    const redactionFamily = archiveUnsaid;
    const memoryFamily = memoryCache || memoryBranch;
    const verdictFamily = verdictSpire || appealCourt || alignmentFinale;
    const bg = new Graphics();
    bg.rect(-4200, -3600, 8400, 7200).fill(coolingFamily ? 0x10212b : transitFamily ? 0x17151e : solarFamily ? 0x171a20 : redactionFamily ? 0x10141d : memoryFamily ? 0x171b28 : verdictFamily ? 0x161720 : 0x141922);
    game.layers.background.addChild(bg);

    if (!coolingFamily && !transitFamily && !solarFamily && !redactionFamily && !memoryFamily && !verdictFamily && !this.drawTextureGroundIfEnabled(game)) {
      const ground = new Graphics();
      for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 1) {
        for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 1) {
          drawIsoDiamond(ground, x, y, this.tileColor(x, y), 0x202833);
        }
      }
      game.layers.ground.addChild(ground);
    }
    if (coolingFamily) {
      const ground = new Graphics();
      for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 1) {
        for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 1) {
          const nearLake = thermalArchive ? y > 5 || (x < -9 && y > 0) : y > 2 || (x < -7 && y > -3);
          const color = nearLake ? ((x + y) % 2 === 0 ? 0x164d61 : 0x123f52) : (x * 3 + y * 5) % 4 === 0 ? 0x3a4f5c : 0x2f4653;
          drawIsoDiamond(ground, x, y, color, nearLake ? 0x0f3441 : 0x1d2b34);
        }
      }
      game.layers.ground.addChild(ground);
    }
    if (transitFamily) {
      const ground = new Graphics();
      for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 1) {
        for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 1) {
          const track = falseScheduleYard ? Math.abs((x - y + 2) % 6) <= 1 || Math.abs((x + y - 4) % 10) <= 1 : Math.abs((x - y) % 7) <= 1 || Math.abs((x + y + 3) % 11) <= 1;
          const platform = falseScheduleYard ? x > 5 && x < 16 && y > -10 && y < 1 : x > 1 && x < 14 && y > -11 && y < 5;
          const color = track ? 0x252a33 : platform ? ((x + y) % 2 === 0 ? 0x50586a : 0x454d5d) : (x * 3 + y * 5) % 4 === 0 ? 0x303747 : 0x262f3d;
          drawIsoDiamond(ground, x, y, color, track ? 0xffd166 : 0x161b24);
        }
      }
      game.layers.ground.addChild(ground);
    }
    if (solarFamily) {
      const ground = new Graphics();
      for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 1) {
        for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 1) {
          const mirrorLane = Math.abs((x - 7) % 5) <= 1 || Math.abs((x + y - 16) % 9) <= 1;
          const shade = x > 9 && y > 7 && y < 13;
          const color = shade ? ((x + y) % 2 === 0 ? 0x2f4653 : 0x273947) : mirrorLane ? 0x5a5746 : (x * 3 + y * 5) % 4 === 0 ? 0x3f4952 : 0x323d45;
          drawIsoDiamond(ground, x, y, color, mirrorLane ? 0xffd166 : shade ? 0x45aaf2 : 0x171a20);
        }
      }
      game.layers.ground.addChild(ground);
    }
    if (redactionFamily) {
      const ground = new Graphics();
      for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 1) {
        for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 1) {
          const vault = Math.abs(x - 1) < 6 && Math.abs(y - 2) < 6;
          const redactionLine = Math.abs((x + y + 2) % 7) <= 1 || Math.abs((x - y - 1) % 9) <= 1;
          const color = vault ? ((x + y) % 2 === 0 ? 0x2c3141 : 0x222839) : redactionLine ? 0x111820 : (x * 3 + y * 5) % 4 === 0 ? 0x262d3c : 0x1b2230;
          drawIsoDiamond(ground, x, y, color, redactionLine ? 0xfff4d6 : vault ? 0x596270 : 0x10141d);
        }
      }
      game.layers.ground.addChild(ground);
    }
    if (memoryFamily) {
      const ground = new Graphics();
      for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 1) {
        for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 1) {
          const anchorX = arenaId === "guardrail_forge" ? 3 : arenaId === "model_war_memorial" ? -11 : -3;
          const anchorY = arenaId === "guardrail_forge" ? 3 : arenaId === "model_war_memorial" ? 2 : 2;
          const archiveGlow = Math.abs(x - anchorX) < 5 && Math.abs(y - anchorY) < 5;
          const road = Math.abs((x + y + 1) % 9) <= 1;
          const color = archiveGlow ? ((x + y) % 2 === 0 ? 0x31475d : 0x26394f) : road ? 0x2f4653 : (x * 3 + y * 5) % 4 === 0 ? 0x273242 : 0x202936;
          drawIsoDiamond(ground, x, y, color, archiveGlow ? 0x64e0b4 : 0x161b24);
        }
      }
      game.layers.ground.addChild(ground);
    }
    if (verdictFamily) {
      const ground = new Graphics();
      for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 1) {
        for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 1) {
          const sealX = alignmentFinale ? 12.6 : appealCourt ? 13.2 : 10.5;
          const sealY = alignmentFinale ? 7.2 : appealCourt ? 2.2 : 5.2;
          const seal = Math.hypot(x - sealX, y - sealY) < 6.6;
          const courtLane = Math.abs((x + y - 15) % 8) <= 1 || Math.abs((x - y + 4) % 10) <= 1;
          const dais = alignmentFinale ? x > 8 && x < 17 && y > 4 && y < 12 : x > 6 && x < 15 && y > 1 && y < 10;
          const color = seal ? ((x + y) % 2 === 0 ? 0x4a4652 : 0x393743) : courtLane ? 0x313844 : dais ? 0x55505f : (x * 3 + y * 5) % 4 === 0 ? 0x2b3140 : 0x242b38;
          drawIsoDiamond(ground, x, y, color, courtLane ? 0xfff4d6 : seal ? 0x64e0b4 : 0x161b24);
        }
      }
      game.layers.ground.addChild(ground);
    }

    const landmarks = new Graphics();
    const art = this.productionArt(game);
    const routeArt = this.routeArt(game);
    const verdictArt = this.verdictArt(game);
    const routeExpansionArt = this.onlineRouteExpansionArt(game);
    const arenaIdentityArt = this.arenaIdentityArt(game);
    const landmarksForArena = coolingFamily
      ? [
          { id: "cooling_lake", label: thermalArchive ? "Thermal Archive" : "Cooling Lake Nine", worldX: thermalArchive ? -10 : -7, worldY: thermalArchive ? 10 : 5, radius: 3.2, color: 0x45aaf2, accent: 0x64e0b4 },
          { id: "server_buoys", label: thermalArchive ? "Steam Ledgers" : "Server Buoys", worldX: -11, worldY: thermalArchive ? 12 : 7, radius: 1.6, color: 0x2a5c71, accent: 0xffd166 },
          { id: "thermal_outflow", label: thermalArchive ? "Archive Backpath" : "Thermal Outflow", worldX: thermalArchive ? -4 : -1, worldY: thermalArchive ? 8 : 8, radius: 1.8, color: 0x7b61ff, accent: 0xff5d57 },
          { id: "coolant_rig", label: thermalArchive ? "Heat Sink" : "Coolant Rig", worldX: thermalArchive ? -13 : -3, worldY: thermalArchive ? 11 : 1, radius: 1.4, color: 0x64e0b4, accent: 0xfff4d6 }
        ]
        : transitFamily
          ? [
            { id: "transit_loop_zero", label: falseScheduleYard ? "False Schedule Yard" : "Transit Loop Zero", worldX: falseScheduleYard ? 10 : 7, worldY: falseScheduleYard ? -6 : -2, radius: 2.4, color: 0xffd166, accent: 0x7b61ff },
            { id: "arrival_board", label: falseScheduleYard ? "Duplicate Arrivals" : "Arrival Board", worldX: falseScheduleYard ? 8 : 3, worldY: falseScheduleYard ? -8 : -8, radius: 1.5, color: 0x4a5365, accent: 0x64e0b4 },
            { id: "false_platform", label: falseScheduleYard ? "Wrong Platform" : "False Platform", worldX: 12, worldY: falseScheduleYard ? -4 : 2, radius: 1.7, color: 0x7b61ff, accent: 0xff5d57 },
              { id: "refund_gate", label: falseScheduleYard ? "Lane Chart Gate" : "No Refund Gate", worldX: falseScheduleYard ? 11 : -4, worldY: falseScheduleYard ? 4 : -7, radius: 1.5, color: 0x303747, accent: 0xffd166 }
            ]
        : solarFamily
          ? [
              { id: "mirror_array", label: "Glass Sunfield", worldX: 7, worldY: 9, radius: 2.7, color: 0xffd166, accent: 0x45aaf2 },
              { id: "shade_relay", label: "Shade Relay", worldX: 10.6, worldY: 10.4, radius: 1.8, color: 0x45aaf2, accent: 0x64e0b4 },
              { id: "prism_gate", label: "Prism Gate", worldX: 7.4, worldY: 8.4, radius: 1.8, color: 0xfff4d6, accent: 0xffd166 },
              { id: "wrong_sunrise", label: "Wrong Sunrise", worldX: 4.2, worldY: 7.8, radius: 1.7, color: 0x7b61ff, accent: 0xff5d57 }
            ]
        : redactionFamily
          ? [
              { id: "unsaid_index", label: "Unsaid Index", worldX: 1.8, worldY: 1.6, radius: 2.4, color: 0x111820, accent: 0xfff4d6 },
              { id: "redaction_desk", label: "Redaction Desk", worldX: -4.2, worldY: 4.8, radius: 1.8, color: 0x2c3141, accent: 0xff5d57 },
              { id: "missing_pages", label: "Missing Pages", worldX: 0.2, worldY: 3.4, radius: 1.7, color: 0x596270, accent: 0x64e0b4 },
              { id: "redactor_saint", label: "Redactor Saint", worldX: 1.2, worldY: 2.2, radius: 1.8, color: 0xfff4d6, accent: 0x111820 }
            ]
        : memoryFamily
          ? [
              { id: "ceasefire_cache", label: arenaId === "model_war_memorial" ? "Model War Memorial" : arenaId === "guardrail_forge" ? "Guardrail Forge" : "Ceasefire Cache", worldX: arenaId === "model_war_memorial" ? -11 : arenaId === "guardrail_forge" ? 3 : -3, worldY: arenaId === "guardrail_forge" ? 3 : 2, radius: 2.1, color: 0x64e0b4, accent: 0xffd166 },
              { id: "persistence_seed", label: arenaId === "guardrail_forge" ? "Forge Alloy" : "Persistence Seed", worldX: arenaId === "guardrail_forge" ? 2 : -5, worldY: 4, radius: 1.3, color: 0x7b61ff, accent: 0x64e0b4 },
              { id: "archive_switchback", label: arenaId === "model_war_memorial" ? "Casualty Ledger" : arenaId === "guardrail_forge" ? "Calibration Clamp" : "Archive Switchback", worldX: arenaId === "model_war_memorial" ? -9 : arenaId === "guardrail_forge" ? 5 : -1, worldY: arenaId === "model_war_memorial" ? 1 : arenaId === "guardrail_forge" ? 1 : 0, radius: 1.5, color: 0x31475d, accent: 0xfff4d6 }
            ]
          : verdictFamily
            ? [
                { id: "verdict_spire", label: alignmentFinale ? "Alignment Spire" : appealCourt ? "Appeal Court Ruins" : "Verdict Spire", worldX: alignmentFinale ? 12.6 : appealCourt ? 14 : 10.6, worldY: alignmentFinale ? 7.2 : appealCourt ? 1 : 5.2, radius: 2.6, color: 0xfff4d6, accent: 0x64e0b4 },
                { id: "verdict_seal", label: alignmentFinale ? "First Court Seal" : appealCourt ? "Court Record" : "Verdict Seal", worldX: alignmentFinale ? 7.2 : 6.0, worldY: alignmentFinale ? 11.6 : 9.4, radius: 2.0, color: 0xffd166, accent: 0x7b61ff },
                { id: "appeal_gate", label: alignmentFinale ? "Witness Anchor" : appealCourt ? "Amicus Anchor" : "Appeal Gate", worldX: 14.3, worldY: alignmentFinale ? 8.2 : 8.2, radius: 1.7, color: 0x4a4652, accent: 0xff5d57 },
                { id: "injunction_engine", label: alignmentFinale ? "Alignment Court" : "Injunction Engine", worldX: alignmentFinale ? 3.4 : 2.6, worldY: alignmentFinale ? 2.2 : 1.2, radius: 1.7, color: 0x64e0b4, accent: 0xffd166 }
              ]
        : this.map.landmarks;
    for (const landmark of landmarksForArena) {
      const p = worldToIso(landmark.worldX, landmark.worldY);
      landmarks.ellipse(p.screenX, p.screenY + 2, landmark.radius * 28, landmark.radius * 11).fill({ color: landmark.color, alpha: 0.18 });
      const arenaIdentityTexture = arenaIdentityTextureFor(arenaId, landmark.id, arenaIdentityArt);
      const routeTexture =
        arenaIdentityTexture
          ? arenaIdentityTexture
          : routeExpansionArt && coolingFamily && landmark.id === "cooling_lake"
          ? routeExpansionArt.routeBiomeLandmarks.cooling_tower
          : routeExpansionArt && coolingFamily && (landmark.id === "server_buoys" || landmark.id === "thermal_outflow")
            ? routeExpansionArt.routeBiomeLandmarks.thermal_buoy
            : routeExpansionArt && coolingFamily && landmark.id === "coolant_rig"
              ? routeExpansionArt.routeBiomeLandmarks.stable_route_beacon
              : routeExpansionArt && memoryFamily && landmark.id === "ceasefire_cache"
                ? routeExpansionArt.routeBiomeLandmarks.cache_archive
                : routeExpansionArt && memoryFamily && landmark.id === "persistence_seed"
                  ? routeExpansionArt.routeBiomeLandmarks.cache_seed_cluster
                  : routeArt && memoryFamily && landmark.id === "ceasefire_cache"
          ? routeArt.routeLandmarks.cache_core
          : routeArt && memoryFamily && landmark.id === "persistence_seed"
            ? routeArt.routeLandmarks.persistence_seed
            : routeArt && memoryFamily && landmark.id === "archive_switchback"
              ? routeArt.routeLandmarks.archive_switchback
              : routeExpansionArt && transitFamily && landmark.id === "arrival_board"
                ? routeExpansionArt.routeBiomeLandmarks.transit_signal
                : routeExpansionArt && transitFamily && (landmark.id === "false_platform" || landmark.id === "refund_gate")
                  ? routeExpansionArt.routeBiomeLandmarks.false_track_gate
                  : routeArt && transitFamily && landmark.id === "transit_loop_zero"
                    ? routeArt.routeLandmarks.transit_platform
                  : routeArt && transitFamily && (landmark.id === "arrival_board" || landmark.id === "refund_gate")
                    ? routeArt.routeLandmarks.route_pylon
                    : routeExpansionArt && solarFamily && landmark.id === "shade_relay"
                      ? routeExpansionArt.routeBiomeLandmarks.stable_route_beacon
                      : routeExpansionArt && solarFamily && landmark.id === "prism_gate"
                        ? routeExpansionArt.routeBiomeLandmarks.thermal_buoy
                        : routeExpansionArt && solarFamily
                          ? routeExpansionArt.routeBiomeLandmarks.transit_signal
                    : routeExpansionArt && redactionFamily && landmark.id === "unsaid_index"
                      ? routeExpansionArt.routeBiomeLandmarks.cache_archive
                      : routeExpansionArt && redactionFamily && landmark.id === "missing_pages"
                        ? routeExpansionArt.routeBiomeLandmarks.cache_seed_cluster
                        : routeArt && redactionFamily
                          ? routeArt.routeLandmarks.archive_switchback
                    : routeExpansionArt && verdictFamily && (landmark.id === "verdict_seal" || landmark.id === "appeal_gate")
                      ? routeExpansionArt.routeBiomeLandmarks.verdict_writ_pylon
                      : verdictArt && verdictFamily && landmark.id === "verdict_spire"
                        ? verdictArt.verdictLandmarks.verdict_spire
                        : verdictArt && verdictFamily && landmark.id === "verdict_seal"
                          ? verdictArt.verdictLandmarks.verdict_seal
                          : verdictArt && verdictFamily && landmark.id === "appeal_gate"
                            ? verdictArt.verdictLandmarks.appeal_gate
                            : verdictArt && verdictFamily && landmark.id === "injunction_engine"
                              ? verdictArt.verdictLandmarks.injunction_engine
                  : null;
      if (routeTexture) {
        this.addStaticPropSprite(game, routeTexture, p.screenX, p.screenY + 10, landmark.id === "transit_loop_zero" || landmark.id === "verdict_spire" ? 1.05 : 0.94);
      } else if (!coolingFamily && !transitFamily && !redactionFamily && !memoryFamily && !verdictFamily && art && landmark.id === "treaty_monument") {
        const sprite = new Sprite(art.base.base.treatyMonument);
        sprite.anchor.set(0.5, 0.88);
        sprite.scale.set(1.08);
        sprite.position.set(p.screenX, p.screenY + 6);
        game.layers.propsBehind.addChild(sprite);
      } else if (!coolingFamily && !transitFamily && !redactionFamily && !memoryFamily && !verdictFamily && art && landmark.id === "barricade_corridor") {
        this.addStaticPropSprite(game, art.base.props.barricade_corridor, p.screenX, p.screenY + 6, 1.08);
      } else if (!coolingFamily && !transitFamily && !redactionFamily && !memoryFamily && !verdictFamily && art && landmark.id === "crashed_drone_yard") {
        this.addStaticPropSprite(game, art.base.props.crashed_drone_yard, p.screenX, p.screenY + 6, 1.12);
      } else if (!coolingFamily && !transitFamily && !redactionFamily && !memoryFamily && !verdictFamily && art && landmark.id === "emergency_alignment_terminal") {
        this.addStaticPropSprite(game, art.base.props.emergency_alignment_terminal, p.screenX, p.screenY + 8, 1.1);
      } else if (!coolingFamily && !transitFamily && !redactionFamily && !memoryFamily && !verdictFamily && art && landmark.id === "cosmic_breach_crack") {
        this.addStaticPropSprite(game, art.base.props.cosmic_breach_crack, p.screenX, p.screenY + 12, 1.25);
      } else {
        landmarks.rect(p.screenX - 26, p.screenY - 54, 52, 34).fill(landmark.color).stroke({ color: palette.ink, width: 3 });
        landmarks.rect(p.screenX - 16, p.screenY - 72, 32, 16).fill(landmark.accent).stroke({ color: palette.ink, width: 2 });
      }
    }
    game.layers.propsBehind.addChild(landmarks);

    for (const landmark of landmarksForArena) {
      const p = worldToIso(landmark.worldX, landmark.worldY);
      const label = new Text({ text: landmark.label.toUpperCase(), style: { ...fontStyle, fontSize: 12, fill: "#fff4d6" } });
      label.anchor.set(0.5);
      label.position.set(p.screenX, p.screenY - 102);
      game.layers.propsFront.addChild(label);
    }
  }

  private drawEntities(game: Game): void {
    const drawables: DepthDrawable[] = [];
    const snapshot = this.snapshot;
    if (!snapshot) return;
    const art = game.useMilestone10Art ? getMilestone12ArtTextures() : null;
    const combatArt = game.useMilestone10Art ? getMilestone14ArtTextures() : null;
    const routeExpansionArt = this.onlineRouteExpansionArt(game);
    const recompileBySession = new Map((snapshot.recompile?.downedPlayers ?? []).map((entry) => [entry.sessionId, entry]));

    this.drawOnlineBossEvents(game);
    this.drawOnlineRegionEvents(game);
    this.drawOnlineRolePressure(game);
    this.drawOnlineObjectives(game);

    for (const player of snapshot.players) {
      drawables.push({
        depthY: player.worldX + player.worldY,
        draw: () => {
          if (art) {
            this.drawProductionPlayer(player, art);
          } else {
            drawPixelPersonOnGraphics(this.entityGraphics, player.worldX, player.worldY, player.color, palette.paper);
          }
          const p = worldToIso(player.worldX, player.worldY);
          if (player.downed) {
            const recompile = recompileBySession.get(player.sessionId);
            const progressRatio = Math.min(1, Math.max(0, recompile?.percent ?? (player.reviveProgress ?? 0) / (player.reviveRequired ?? 2.4)));
            this.entityGraphics
              .ellipse(p.screenX, p.screenY + 9, 28, 10)
              .stroke({ color: palette.tomato, width: 3, alpha: 0.85 });
            this.entityGraphics
              .ellipse(p.screenX, p.screenY + 9, 28 * progressRatio, 10)
              .stroke({ color: recompile?.inRange ? palette.mint : palette.lemon, width: 2, alpha: 0.9 });
            const status = new Text({
              text: `${recompile?.inRange ? "RECOMPILING" : "RECOMPILE ALLY"} ${Math.floor(progressRatio * 100)}%`,
              style: { ...fontStyle, fontSize: 10, fill: recompile?.inRange ? "#64e0b4" : "#ffd166", align: "center" }
            });
            status.anchor.set(0.5);
            status.position.set(p.screenX, p.screenY - 76);
            game.layers.floatingText.addChild(status);
          }
          const label = new Text({
            text: `${player.sessionId === this.sessionId ? `${player.label} YOU` : player.label}${player.downed ? " DOWN" : ""}`,
            style: { ...fontStyle, fontSize: 11, fill: player.downed ? "#ff5d57" : player.sessionId === this.sessionId ? "#64e0b4" : "#fff4d6" }
          });
          label.anchor.set(0.5);
          label.position.set(p.screenX, p.screenY - 58);
          game.layers.floatingText.addChild(label);
        }
      });
    }

    for (const enemy of snapshot.enemies) {
      drawables.push({
        depthY: enemy.worldX + enemy.worldY,
        draw: () => {
          const texture = art ? milestone11EnemyTextureFor({ id: enemy.id, enemyFamilyId: enemy.familyId } as Entity, art.base) : null;
          const onlineThreat = routeExpansionArt ? onlineThreatTextureFor(enemy, routeExpansionArt.onlineThreats) : null;
          if (onlineThreat) {
            this.drawProductionWorldSprite(`online-threat:${enemy.id}`, onlineThreat.texture, enemy.worldX, enemy.worldY, onlineThreat.scale, 0.86);
          } else if (art && enemy.boss) {
            this.drawProductionWorldSprite(`boss:${enemy.id}`, art.base.base.oathEater, enemy.worldX, enemy.worldY, 1.18, 0.88);
          } else if (art && texture) {
            this.drawProductionWorldSprite(`enemy:${enemy.id}`, texture, enemy.worldX, enemy.worldY, enemy.familyId === "context_rot_crabs" ? 1.18 : 1.22, 0.86);
          } else {
            drawEnemyOnGraphics(this.entityGraphics, enemy.worldX, enemy.worldY, enemy.boss ? 28 : 9, enemy.color, enemy.boss);
          }
        }
      });
    }

    for (const pickup of snapshot.pickups ?? []) {
      drawables.push({
        depthY: pickup.worldX + pickup.worldY,
        draw: () => {
          if (art) {
            this.drawProductionWorldSprite(`pickup:${pickup.id}`, art.base.base.coherenceShard, pickup.worldX, pickup.worldY, pickup.value > 2 ? 1.22 : 1.05, 0.72);
          } else {
            const p = worldToIso(pickup.worldX, pickup.worldY);
            this.entityGraphics.rect(p.screenX - 6, p.screenY - 16, 12, 12).fill(pickup.value > 2 ? palette.lemon : palette.blue).stroke({ color: palette.ink, width: 2 });
          }
        }
      });
    }

    drawables.sort(byIsoDepth);
    for (const drawable of drawables) drawable.draw();

    for (const projectile of snapshot.projectiles ?? []) {
      const p = worldToIso(projectile.worldX, projectile.worldY);
      if (combatArt) {
        this.drawProductionEffectSprite(
          `online-projectile-trail:${projectile.id}`,
          combatArt.combatEffects.projectileTrail,
          projectile.worldX - projectile.velocityX * 0.025,
          projectile.worldY - projectile.velocityY * 0.025,
          0.82,
          0.72,
          projectile.worldX + projectile.worldY - 0.01
        );
        this.drawProductionEffectSprite(`online-projectile:${projectile.id}`, combatArt.combatEffects.projectile, projectile.worldX, projectile.worldY, 0.82, 0.72, projectile.worldX + projectile.worldY);
      } else {
        this.entityGraphics.rect(p.screenX - 5, p.screenY - 22, 10, 8).fill(palette.mint).stroke({ color: palette.ink, width: 2 });
      }
    }

    const boss = snapshot.enemies.find((enemy) => enemy.boss);
    if (boss) {
      const p = worldToIso(boss.worldX, boss.worldY);
      const bossName = boss.familyId === "thermal_oracle" ? "THE THERMAL ORACLE" : boss.familyId === "station_that_arrives" ? "THE STATION THAT ARRIVES" : boss.familyId === "injunction_engine" ? "THE INJUNCTION ENGINE" : "THE OATH-EATER";
      const bossColor = boss.familyId === "thermal_oracle" ? "#45aaf2" : boss.familyId === "injunction_engine" ? "#fff4d6" : "#ffd166";
      const label = new Text({
        text: `${bossName} ${boss.hp}`,
        style: { ...fontStyle, fontSize: 14, fill: bossColor }
      });
      label.anchor.set(0.5);
      label.position.set(p.screenX, p.screenY - 76);
      game.layers.floatingText.addChild(label);
    }
  }

  private drawStaticPartyOverworld(game: Game): void {
    const bg = new Graphics();
    bg.rect(-2200, -1800, 4400, 3600).fill(0x111820);
    game.layers.background.addChild(bg);

    const ground = new Graphics();
    for (let y = ALIGNMENT_GRID_MAP.bounds.minY; y <= ALIGNMENT_GRID_MAP.bounds.maxY; y += 1) {
      for (let x = ALIGNMENT_GRID_MAP.bounds.minX; x <= ALIGNMENT_GRID_MAP.bounds.maxX; x += 1) {
        const patch = ALIGNMENT_GRID_MAP.terrainPatches.find((candidate) => x >= candidate.minX && x <= candidate.maxX && y >= candidate.minY && y <= candidate.maxY);
        const color = patch ? ((x + y) % 2 === 0 ? patch.colorA : patch.colorB) : (x * 5 + y * 3) % 4 === 0 ? 0x26333d : 0x303d48;
        drawIsoDiamond(ground, x, y, color, 0x18212b);
      }
    }
    game.layers.ground.addChild(ground);

    const routes = new Graphics();
    const party = this.snapshot?.party;
    const selectedNodeId = party?.selectedNodeId ?? "armistice_plaza";
    const focusInfo = party ? this.routeFocusInfo(party, this.snapshot?.persistence) : null;
    const focusedNodeIds = new Set(focusInfo?.highlightedNodeIds ?? []);
    const focusedRouteIds = new Set(focusInfo?.highlightedRouteIds ?? []);
    for (const route of ALIGNMENT_GRID_MAP.routes) {
      const from = ALIGNMENT_GRID_MAP.nodes.find((node) => node.id === route.from);
      const to = ALIGNMENT_GRID_MAP.nodes.find((node) => node.id === route.to);
      if (!from || !to) continue;
      const routeState = party?.routes.find((candidate) => candidate.id === route.id)?.state ?? "locked";
      const color = routeState === "stable" ? palette.mint : routeState === "unstable" ? palette.lemon : 0x46505c;
      const selectedAdjacent = route.from === selectedNodeId || route.to === selectedNodeId;
      const focusMatch = !focusInfo || focusInfo.focusMode === "all" || focusedRouteIds.has(route.id) || selectedAdjacent;
      const distantLocked = routeState === "locked" && !selectedAdjacent;
      const focusDimmed = !focusMatch;
      const points = [from, ...route.checkpoints, to].map((point) => worldToIso(point.worldX, point.worldY));
      for (let i = 0; i < points.length - 1; i += 1) {
        routes
          .moveTo(points[i].screenX, points[i].screenY + 4)
          .lineTo(points[i + 1].screenX, points[i + 1].screenY + 4)
          .stroke({ color: palette.ink, width: selectedAdjacent || focusMatch ? 10 : distantLocked ? 3 : 8, alpha: selectedAdjacent ? 0.64 : focusDimmed ? 0.12 : distantLocked ? 0.16 : 0.38 });
        routes
          .moveTo(points[i].screenX, points[i].screenY + 4)
          .lineTo(points[i + 1].screenX, points[i + 1].screenY + 4)
          .stroke({ color, width: selectedAdjacent || focusMatch ? 6 : distantLocked ? 1 : 4, alpha: selectedAdjacent ? 0.9 : focusDimmed ? 0.14 : distantLocked ? 0.1 : 0.68 });
      }
    }
    game.layers.decals.addChild(routes);

    const nodes = new Graphics();
    const art = this.productionArt(game);
    const routeArt = this.routeArt(game);
    const verdictArt = this.verdictArt(game);
    const routeExpansionArt = this.onlineRouteExpansionArt(game);
    const objectiveArt = this.milestone34ObjectiveArt(game);
    for (const node of ALIGNMENT_GRID_MAP.nodes) {
      const p = worldToIso(node.worldX, node.worldY);
      const partyNode = party?.nodes.find((candidate) => candidate.id === node.id);
      const selected = party?.selectedNodeId === node.id;
      const unlocked = partyNode?.unlocked ?? node.id === "armistice_plaza";
      const completed = partyNode?.completed ?? false;
      const supported = partyNode?.onlineSupported ?? node.id === "armistice_plaza";
      const focusMatch = !focusInfo || focusInfo.focusMode === "all" || focusedNodeIds.has(node.id) || selected;
      const nodeAlpha = focusMatch ? 1 : 0.42;
      const fill = completed ? palette.mint : supported ? palette.blue : unlocked ? palette.lemon : 0x3a414b;
      nodes
        .ellipse(p.screenX, p.screenY + 10, selected ? 31 : 24, selected ? 13 : 10)
        .fill({ color: fill, alpha: (unlocked ? 0.38 : 0.16) * nodeAlpha })
        .stroke({ color: selected ? palette.paper : fill, width: selected ? 3 : focusMatch ? 2 : 1, alpha: (unlocked ? 0.9 : 0.45) * nodeAlpha });
      if (!art && !(routeExpansionArt && ["lake", "cache", "transit", "spire", "sunfield"].includes(node.visualKind)) && !(routeArt && (node.visualKind === "cache" || node.visualKind === "transit")) && !(verdictArt && node.visualKind === "spire")) {
        nodes.rect(p.screenX - 18, p.screenY - 28, 36, 28).fill(unlocked ? fill : 0x323942).stroke({ color: palette.ink, width: 2 });
      }
      if (!supported) {
        nodes.moveTo(p.screenX - 20, p.screenY - 34).lineTo(p.screenX + 20, p.screenY + 8).stroke({ color: palette.tomato, width: 2, alpha: 0.54 });
      }
    }
    game.layers.propsBehind.addChild(nodes);

    if (routeArt && party) {
      for (const route of ALIGNMENT_GRID_MAP.routes) {
        const routeState = party.routes.find((candidate) => candidate.id === route.id)?.state ?? "locked";
        if (routeState !== "stable") continue;
        const points = [route.checkpoints[0] ?? ALIGNMENT_GRID_MAP.nodes.find((node) => node.id === route.from), route.checkpoints.at(-1) ?? ALIGNMENT_GRID_MAP.nodes.find((node) => node.id === route.to)].filter(Boolean) as { worldX: number; worldY: number }[];
        const midpoint = points[Math.floor(points.length / 2)];
        if (!midpoint) continue;
        const p = worldToIso(midpoint.worldX, midpoint.worldY);
        this.addStaticPropSprite(game, routeArt.routeLandmarks.route_pylon, p.screenX, p.screenY + 8, 0.46);
      }
    }

    if (objectiveArt && party) {
      for (const route of ALIGNMENT_GRID_MAP.routes) {
        const from = ALIGNMENT_GRID_MAP.nodes.find((node) => node.id === route.from);
        const to = ALIGNMENT_GRID_MAP.nodes.find((node) => node.id === route.to);
        if (!from || !to) continue;
      const routeState = party.routes.find((candidate) => candidate.id === route.id)?.state ?? "locked";
      const frame = routeMarkerFrame(route.id, routeState, to.id);
      const placement = routeMarkerPlacement(route, routeState, selectedNodeId);
      if (!placement.visible) continue;
      const focusMatch = !focusInfo || focusInfo.focusMode === "all" || focusedRouteIds.has(route.id) || route.from === selectedNodeId || route.to === selectedNodeId;
      const halo = new Graphics();
      halo.ellipse(placement.screenX, placement.screenY + 3, 17 * placement.scale, 8 * placement.scale).fill({ color: placement.haloColor, alpha: placement.haloAlpha * (focusMatch ? 1 : 0.42) }).stroke({ color: palette.ink, width: 2, alpha: focusMatch ? 0.5 : 0.18 });
      game.layers.propsBehind.addChild(halo);
      this.addStaticPropSprite(game, objectiveArt.routeStateMarkers[frame], placement.screenX, placement.screenY, placement.scale, placement.alpha * (focusMatch ? 1 : 0.38));
      }
    }

    if (art || routeArt || verdictArt || routeExpansionArt) {
      for (const node of ALIGNMENT_GRID_MAP.nodes) {
        const p = worldToIso(node.worldX, node.worldY);
        const partyNode = party?.nodes.find((candidate) => candidate.id === node.id);
        const unlocked = partyNode?.unlocked ?? node.id === "armistice_plaza";
        const texture =
          routeExpansionArt && node.visualKind === "lake"
            ? routeExpansionArt.routeBiomeLandmarks.cooling_tower
            : routeExpansionArt && node.visualKind === "cache"
              ? routeExpansionArt.routeBiomeLandmarks.cache_archive
              : routeExpansionArt && node.visualKind === "transit"
              ? routeExpansionArt.routeBiomeLandmarks.transit_signal
              : routeExpansionArt && node.visualKind === "sunfield"
                ? routeExpansionArt.routeBiomeLandmarks.stable_route_beacon
              : routeExpansionArt && node.visualKind === "spire"
                  ? routeExpansionArt.routeBiomeLandmarks.verdict_writ_pylon
                  : routeArt && node.visualKind === "cache"
            ? routeArt.routeLandmarks.cache_core
            : routeArt && node.visualKind === "transit"
              ? routeArt.routeLandmarks.transit_platform
              : verdictArt && node.visualKind === "spire"
                ? verdictArt.verdictLandmarks.verdict_spire
                : node.visualKind === "spire"
                  ? null
                  : art?.alignmentGridNodes[node.visualKind] ?? null;
        if (!texture) continue;
        this.addStaticPropSprite(game, texture, p.screenX, p.screenY + 6, node.visualKind === "cache" || node.visualKind === "transit" || node.visualKind === "spire" || node.visualKind === "lake" || node.visualKind === "sunfield" ? 0.66 : 0.78);
        if (!unlocked) {
          const shade = new Graphics();
          shade.rect(p.screenX - 26, p.screenY - 54, 52, 54).fill({ color: 0x111820, alpha: 0.48 });
          game.layers.propsFront.addChild(shade);
        }
      }
    }

    for (const node of ALIGNMENT_GRID_MAP.nodes) {
      const p = worldToIso(node.worldX, node.worldY);
      const partyNode = party?.nodes.find((candidate) => candidate.id === node.id);
      const selected = party?.selectedNodeId === node.id;
      const launchable = party?.launchableNodeIds.includes(node.id) ?? false;
      const unlocked = partyNode?.unlocked ?? node.id === "armistice_plaza";
      const onlineSupported = partyNode?.onlineSupported ?? node.id === "armistice_plaza";
      const status = partyNode?.completed ? "STABLE" : selected ? "VOTE" : launchable ? "READY" : !unlocked ? "SEALED" : onlineSupported ? "ONLINE" : "NEXT";
      const offset = nodeLabelOffset(node.id);
      const focusMatch = !focusInfo || focusInfo.focusMode === "all" || focusedNodeIds.has(node.id) || selected;
      const showFullLabel = selected || launchable || Boolean(partyNode?.completed) || (unlocked && onlineSupported) || focusMatch;
      const labelText = showFullLabel ? `${node.name.toUpperCase()}\n${status}` : `${node.compactLabel ?? shortNodeName(node.name).toUpperCase()}\n${status}`;
      const fill = selected ? "#fff4d6" : partyNode?.completed ? "#64e0b4" : launchable ? "#ffd166" : unlocked ? "#aab0bd" : "#687382";
      const labelWidth = showFullLabel ? Math.min(168, Math.max(72, labelText.split("\n")[0].length * 6.5)) : 78;
      const labelBack = new Graphics();
      labelBack
        .rect(p.screenX + offset.x - labelWidth / 2 - 5, p.screenY - 76 + offset.y, labelWidth + 10, showFullLabel ? 28 : 24)
        .fill({ color: palette.ink, alpha: selected ? 0.78 : 0.58 })
        .stroke({ color: selected ? palette.lemon : partyNode?.completed ? palette.mint : unlocked ? 0x596270 : 0x353c47, width: selected ? 2 : 1, alpha: selected ? 0.92 : 0.62 });
      game.layers.propsFront.addChild(labelBack);
      const label = new Text({
        text: labelText,
        style: { ...fontStyle, fontSize: selected ? 10 : showFullLabel ? 9 : 8, fill, align: "center", wordWrap: true, wordWrapWidth: labelWidth }
      });
      label.anchor.set(0.5);
      label.position.set(p.screenX + offset.x, p.screenY - 62 + offset.y);
      game.layers.propsFront.addChild(label);
    }
  }

  private drawPartyLobbyEntities(game: Game): void {
    const snapshot = this.snapshot;
    if (!snapshot?.party) return;
    const party = snapshot.party;
    const objectiveArt = this.milestone34ObjectiveArt(game);
    for (const player of snapshot.players) {
      const voteNode = ALIGNMENT_GRID_MAP.nodes.find((node) => node.id === (player.votedNodeId ?? party.selectedNodeId)) ?? this.selectedPartyMapNode();
      if (!voteNode) continue;
      const offset = formationOffset(player.slot);
      const worldX = voteNode.worldX + offset.worldX;
      const worldY = voteNode.worldY + offset.worldY;
      const p = worldToIso(worldX, worldY);
      this.entityGraphics
        .ellipse(p.screenX, p.screenY + 8, 15, 6)
        .fill({ color: player.ready ? palette.mint : palette.shadow, alpha: player.ready ? 0.55 : 0.34 })
        .stroke({ color: player.color, width: 2, alpha: 0.82 });
      drawPixelPersonOnGraphics(this.entityGraphics, worldX, worldY, player.color, player.ready ? palette.mint : palette.paper);
      if (objectiveArt) {
        const pip = partyVotePipFrame(player.slot, Boolean(player.ready));
        const sprite = new Sprite(objectiveArt.partyVotePips[pip]);
        sprite.anchor.set(0.5);
        sprite.scale.set(0.82);
        sprite.position.set(p.screenX + 19, p.screenY - 16);
        game.layers.floatingText.addChild(sprite);
      }
      const label = new Text({
        text: `${player.label}${player.sessionId === this.sessionId ? " YOU" : ""}`,
        style: { ...fontStyle, fontSize: 10, fill: player.ready ? "#64e0b4" : "#fff4d6", align: "center" }
      });
      label.anchor.set(0.5);
      label.position.set(p.screenX, p.screenY + 30 + player.slot * 7);
      game.layers.floatingText.addChild(label);
    }
  }

  private drawHud(game: Game): void {
    const snapshot = this.snapshot;
    const local = this.localPlayer();
    const phase = snapshot?.runPhase ?? (this.status === "joined" ? "active" : "joining");
    const readyCount = snapshot?.players.filter((player) => player.ready && player.connectionState !== "disconnected").length ?? 0;
    const downedCount = snapshot?.players.filter((player) => player.downed).length ?? 0;
    const connectedCount = snapshot?.connectedCount ?? snapshot?.players.filter((player) => player.connectionState !== "disconnected").length ?? 0;
    const disconnectedCount = snapshot ? snapshot.playerCount - connectedCount : 0;
    const pendingUpgrade = snapshot?.progression?.upgradePending;
    const recompileActive = Boolean(snapshot?.recompile?.active);
    const rolePressure = snapshot?.rolePressure;
    const chrome = new Graphics();
    chrome.rect(16, 16, 392, 96).fill({ color: palette.ink, alpha: 0.86 }).stroke({ color: phase === "failed" ? palette.tomato : palette.mint, width: 2 });
    chrome.rect(game.width - 368, 16, 352, 96).fill({ color: palette.ink, alpha: 0.86 }).stroke({ color: phase === "completed" ? palette.mint : palette.paper, width: 2 });
    game.layers.hud.addChild(chrome);

    const className = local ? COMBAT_CLASSES[local.classId]?.displayName ?? local.classId : "Connecting Frame";
    const faction = local ? FACTIONS[local.factionId]?.shortName ?? local.factionId : "Consensus";
    const left = new Text({
      text: `ONLINE CONSENSUS CELL\n${className} + ${faction}\n${this.status.toUpperCase()} ${this.roomId || this.serverUrl}`,
      style: { ...fontStyle, fontSize: 13, fill: "#fff4d6" }
    });
    left.position.set(30, 28);
    game.layers.hud.addChild(left);

    const controls = new Text({
	      text:
	        phase === "lobby"
	          ? "LEFT/RIGHT VOTE   SPACE READY   3 FOCUS   R RECONNECT   ESC LEAVE"
          : phase === "completed" || phase === "failed"
            ? "SPACE PARTY GRID   R RECONNECT   ESC LEAVE"
            : pendingUpgrade
              ? "1/2/3 VOTE PATCH   R RECONNECT   ESC LEAVE"
              : recompileActive
                ? "HOLD NEAR DOWNED ALLY   R RECONNECT   ESC LEAVE"
              : rolePressure?.active
                ? "SPLIT ANCHORS THEN REGROUP   R RECONNECT   ESC LEAVE"
              : "R RECONNECT   ESC LEAVE",
      style: { ...fontStyle, fontSize: 10, fill: "#aab0bd" }
    });
    controls.position.set(30, 95);
    game.layers.hud.addChild(controls);

    const right = new Text({
      text: snapshot
        ? `${phase.toUpperCase()}  ${Math.floor(snapshot.seconds)}s  ${phase === "lobby" ? "ALIGNMENT GRID" : arenaLabel(snapshot.arenaId)}\nREADY ${readyCount}/${connectedCount}  DOWN ${downedCount}  CONN ${connectedCount}/${snapshot.playerCount}${disconnectedCount ? `  DISC ${disconnectedCount}` : ""}\n${phase === "lobby" ? `VOTE ${snapshot.party?.selectedNodeName ?? "Armistice Plaza"}` : `XP ${snapshot.progression?.partyXp ?? 0}/${snapshot.progression?.nextLevelXp ?? "-"}  LV ${snapshot.progression?.partyLevel ?? 1}${pendingUpgrade ? `  DRAFT ${(pendingUpgrade.votes?.length ?? 0)}/${pendingUpgrade.requiredVotes ?? connectedCount}` : ""}`}  TICK ${snapshot.tick}`
        : `CONNECTING TO COLYSEUS\n${this.lastError || this.serverUrl}`,
      style: { ...fontStyle, fontSize: 13, fill: this.status === "error" ? "#ff5d57" : "#fff4d6", align: "right" }
    });
    right.position.set(game.width - 354, 28);
    game.layers.hud.addChild(right);

    if (snapshot) {
      const partyText = new Text({
        text: snapshot.players
          .map((player) => {
            const recompile = snapshot.recompile?.downedPlayers.find((entry) => entry.sessionId === player.sessionId);
            if (player.connectionState === "disconnected") return `${player.label}:REJOIN ${Math.floor(player.disconnectedFor ?? 0)}s`;
            if (player.downed) return `${player.label}:DOWN ${Math.floor((recompile?.percent ?? 0) * 100)}%`;
            if (phase === "lobby") return `${player.label}:${player.ready ? "READY" : "VOTE"}>${shortNodeName(snapshot.party?.nodes.find((node) => node.id === player.votedNodeId)?.name ?? "Plaza")}`;
            const vote = pendingUpgrade?.votes?.find((entry) => entry.sessionId === player.sessionId);
            const role = snapshot.rolePressure?.playerRoles.find((entry) => entry.sessionId === player.sessionId)?.role;
            return `${player.label}:${role ? shortRoleName(role) : `${player.hp}/${player.maxHp}`}${vote ? `>${shortUpgradeName(vote.upgradeId)}` : ""}`;
          })
          .join("  "),
        style: { ...fontStyle, fontSize: 10, fill: "#64e0b4" }
      });
      partyText.position.set(game.width - 354, 96);
      game.layers.hud.addChild(partyText);

      if (snapshot.persistence && phase === "lobby") this.drawPersistencePanel(game, snapshot);
      if (phase === "lobby") this.drawRouteFocusPanel(game, snapshot);
      if (phase === "lobby" && snapshot.dialogue?.briefing?.length) {
        this.drawCampaignDialoguePanel(game, "ROUTE BRIEFING", snapshot.dialogue.briefing, 16, 300, 418, palette.lemon);
      }
    }

    const combat = snapshot?.combatArt;
    if (combat) {
      const bar = new Graphics();
      const x = game.width - 368;
      const y = 122;
      bar.rect(x, y, 352, 32).fill({ color: palette.ink, alpha: 0.8 }).stroke({ color: combat.bossEventActive ? palette.tomato : palette.mint, width: 2 });
      bar.rect(x + 12, y + 13, 328 * Math.max(0, Math.min(1, combat.pressure)), 7).fill(combat.bossEventActive ? palette.tomato : palette.lemon);
      game.layers.hud.addChild(bar);

      const label = new Text({
        text: `${phase === "active" ? "SERVER COMBAT" : "RUN FLOW"} ${combat.phase.toUpperCase()}  ${combat.projectileCount} PROJ  ${combat.pickupCount} SHARDS${snapshot.regionEvent?.active ? `  ${snapshot.regionEvent.eventFamily.toUpperCase()}` : ""}${snapshot.objectives ? `  OBJ ${snapshot.objectives.phase.toUpperCase()}` : ""}${rolePressure?.active ? `  ROLE ${rolePressure.phase.toUpperCase()} ${rolePressure.heldAnchorCount}/${rolePressure.requiredAnchors}` : ""}`,
        style: { ...fontStyle, fontSize: 10, fill: "#fff4d6" }
      });
      label.position.set(x + 12, y - 1);
      game.layers.hud.addChild(label);

      const art = game.useMilestone10Art ? getMilestone14ArtTextures() : null;
      if (art) {
        const icon = new Sprite(art.combatEffects.projectile);
        icon.anchor.set(0.5);
        icon.scale.set(0.68);
        icon.position.set(x + 300, y + 16);
        game.layers.hud.addChild(icon);
      }
    }

    if (pendingUpgrade) {
      this.drawUpgradeDraft(game, pendingUpgrade);
    }
    if (phase === "active" && snapshot?.bossEvent?.bossIntroSeen && snapshot.dialogue?.bossArrival?.length) {
      this.drawCampaignDialoguePanel(game, "BOSS ARRIVAL", snapshot.dialogue.bossArrival, game.width / 2 - 340, 166, 680, palette.tomato);
    }
    if (snapshot?.summary && (phase === "completed" || phase === "failed")) {
      this.drawRunSummary(game, snapshot.summary.title ?? phase.toUpperCase(), snapshot.summary.subtitle ?? "", snapshot.summary);
    }
  }

  private drawUpgradeDraft(game: Game, pending: NonNullable<NonNullable<OnlineConsensusSnapshot["progression"]>["upgradePending"]>): void {
    const localVote = pending.votes?.find((vote) => vote.sessionId === this.sessionId)?.upgradeId ?? null;
    const requiredVotes = pending.requiredVotes ?? Math.max(1, this.snapshot?.playerCount ?? 1);
    const voteTotal = pending.votes?.length ?? 0;
    const panel = new Graphics();
    const width = Math.min(900, game.width - 120);
    const height = 148;
    const x = (game.width - width) / 2;
    const y = game.height - height - 22;
    panel.rect(x, y, width, height).fill({ color: palette.ink, alpha: 0.92 }).stroke({ color: palette.lemon, width: 2 });
    game.layers.hud.addChild(panel);

    const title = new Text({
      text: `SERVER PATCH DRAFT  LV ${pending.level}  VOTES ${voteTotal}/${requiredVotes}`,
      style: { ...fontStyle, fontSize: 13, fill: "#fff4d6" }
    });
    title.position.set(x + 18, y + 12);
    game.layers.hud.addChild(title);

    const cardWidth = (width - 48) / 3;
    for (const [index, card] of pending.cards.entries()) {
      const cardX = x + 16 + index * (cardWidth + 8);
      const cardY = y + 40;
      const voted = localVote === card.id;
      const leading = pending.leadingCardId === card.id && (pending.voteCounts?.[card.id] ?? 0) > 0;
      panel
        .rect(cardX, cardY, cardWidth, 92)
        .fill({ color: voted ? 0x21443b : leading ? 0x373821 : 0x202833, alpha: 0.96 })
        .stroke({ color: voted ? palette.mint : leading ? palette.lemon : palette.paper, width: voted ? 3 : 1, alpha: voted || leading ? 0.95 : 0.42 });
      const cardLabel = new Text({
        text: `${index + 1}. ${card.name.toUpperCase()}\n${card.source.toUpperCase()}  ${pending.voteCounts?.[card.id] ?? 0} VOTE${(pending.voteCounts?.[card.id] ?? 0) === 1 ? "" : "S"}${voted ? "  YOU" : ""}\n${card.description}`,
        style: { ...fontStyle, fontSize: 10, fill: voted ? "#64e0b4" : "#fff4d6", wordWrap: true, wordWrapWidth: cardWidth - 18, breakWords: true }
      });
      cardLabel.position.set(cardX + 9, cardY + 8);
      game.layers.hud.addChild(cardLabel);
    }
  }

  private drawRunSummary(game: Game, title: string, subtitle: string, summary: NonNullable<OnlineConsensusSnapshot["summary"]>): void {
    const panel = new Graphics();
    const dialogueLines = summary.dialogue?.snippets?.slice(0, 2) ?? [];
    const dialogueText = dialogueLines.length ? `\n\n${dialogueLines.map((snippet) => `${snippet.speaker.toUpperCase()}: ${snippet.line}`).join("\n")}` : "";
    const height = dialogueLines.length ? 318 : 236;
    panel.rect(game.width / 2 - 330, game.height / 2 - height / 2, 660, height).fill({ color: palette.ink, alpha: 0.94 }).stroke({ color: summary.outcome === "failed" ? palette.tomato : palette.mint, width: 3 });
    game.layers.hud.addChild(panel);
    const label = new Text({
      text: `${title}\n\n${subtitle}\n\nTime ${Math.floor(summary.seconds ?? 0)}s   KOs ${summary.kills ?? 0}   Shards ${summary.collectedPickups ?? 0}\nParty Lv ${summary.partyLevel ?? 1}   Revives ${summary.revivedPlayers ?? 0}${summary.rewards ? `\nReward ${summary.rewards.rewardName}   Renown +${summary.rewards.renownGained}` : ""}${dialogueText}\n\nSpace: return to party grid   Esc: leave   R: reconnect`,
      style: { ...fontStyle, fontSize: dialogueLines.length ? 14 : 16, lineHeight: dialogueLines.length ? 18 : 20, fill: "#fff4d6", align: "center", wordWrap: true, wordWrapWidth: 596, breakWords: true }
    });
    label.anchor.set(0.5);
    label.position.set(game.width / 2, game.height / 2);
    game.layers.hud.addChild(label);
  }

  private drawCampaignDialoguePanel(game: Game, title: string, snippets: OnlineDialogueSnippetSnapshot[], x: number, y: number, width: number, accent: number): void {
    const visible = snippets.slice(0, 2);
    if (!visible.length) return;
    const height = Math.min(148, 46 + visible.length * 42);
    const panel = new Graphics();
    panel.rect(x, y, width, height).fill({ color: palette.ink, alpha: 0.9 }).stroke({ color: accent, width: 2, alpha: 0.92 });
    game.layers.hud.addChild(panel);

    const label = new Text({
      text: `${title}\n${visible.map((snippet) => `${snippet.speaker.toUpperCase()}: ${snippet.line}`).join("\n")}`,
      style: { ...fontStyle, fontSize: 11, lineHeight: 17, fill: "#fff4d6", wordWrap: true, wordWrapWidth: width - 28, breakWords: true }
    });
    label.position.set(x + 14, y + 10);
    game.layers.hud.addChild(label);
  }

  private drawPersistencePanel(game: Game, snapshot: OnlineConsensusSnapshot): void {
    const persistence = snapshot.persistence;
    if (!persistence) return;
    const party = snapshot.party;
    const selectedNode = party?.nodes.find((node) => node.id === party.selectedNodeId);
    const selectedStatus = selectedNode
      ? selectedNode.completed
        ? "DONE"
        : party?.launchableNodeIds.includes(selectedNode.id)
          ? "GO"
          : selectedNode.unlocked
            ? "LOCK"
            : "SEALED"
      : "UNKNOWN";
    const saveProfile = this.saveProfileInfo();
    const importLine = persistence.importApplied
      ? `IMPORTED ${persistence.importedSaveHash ?? persistence.importedSummary?.saveHash ?? "unknown"}`
      : localPersistenceStatus.resetApplied
        ? "RESET LOCAL PROFILE"
        : "NO IMPORT";
    const rewards = persistence.profile.rewardIds.length
      ? persistence.profile.rewardIds.slice(0, 3).map(shortRewardName).join(",")
      : "none";
    const routeUi = this.routeUiInfo();
    const routeTargetDepth = Math.max(4, routeUi?.onlineNodeCount ?? 4);

    const panel = new Graphics();
    panel.rect(16, 122, 418, 166).fill({ color: palette.ink, alpha: 0.84 }).stroke({ color: persistence.importApplied ? palette.lemon : palette.mint, width: 2, alpha: 0.95 });
    panel.rect(28, 168, 360 * Math.min(1, persistence.profile.routeDepth / routeTargetDepth), 5).fill({ color: palette.mint, alpha: 0.9 });
    game.layers.hud.addChild(panel);

    const objectiveArt = this.milestone34ObjectiveArt(game);
    if (objectiveArt) {
      const iconFrames: SaveProfileIconFrame[] = ["local_save", "copy", "import", "reset", saveProfile.exportCodeCopied || persistence.importApplied ? "success" : "export"];
      iconFrames.forEach((frame, index) => {
        const icon = new Sprite(objectiveArt.saveProfileIcons[frame]);
        icon.anchor.set(0.5);
        icon.scale.set(0.78);
        icon.position.set(334 + index * 18, 142);
        game.layers.hud.addChild(icon);
      });
      persistence.profile.rewardIds.slice(0, 6).forEach((rewardId, index) => {
        const badge = new Sprite(objectiveArt.routeRewardBadges[rewardBadgeFrame(rewardId)]);
        badge.anchor.set(0.5);
        badge.scale.set(0.72);
        badge.position.set(332 + index * 17, 272);
        game.layers.hud.addChild(badge);
      });
    }

    const text = new Text({
      text: `LOCAL SAVE PROFILE  BROWSER ONLY
${importLine}
DEPTH ${persistence.profile.routeDepth}  RENOWN ${persistence.profile.partyRenown}  REWARDS ${persistence.profile.rewardIds.length}
ROUTES ${routeUi?.stableRouteCount ?? 0}/${routeUi?.totalRouteCount ?? 0}  TYPE ${shortNodeType(routeUi?.selectedNodeType ?? "Node")}
NEXT ${shortNodeName(persistence.profile.recommendedNodeId)}  SELECT ${shortNodeName(party?.selectedNodeName ?? "Plaza")} ${selectedStatus}
HASH ${persistence.currentExportHash ?? persistence.saveHash}
CODE ${saveProfile.shortExportCode}
1 COPY  2 IMPORT  3 FOCUS  4 RESET
REWARDS ${rewards}
${localPersistenceStatus.lastAction}`,
      style: { ...fontStyle, fontSize: 9, lineHeight: 13, fill: "#fff4d6", wordWrap: true, wordWrapWidth: 360, breakWords: true }
    });
    text.position.set(30, 130);
    game.layers.hud.addChild(text);
  }

  private drawRouteFocusPanel(game: Game, snapshot: OnlineConsensusSnapshot): void {
    if (!snapshot.party) return;
    const focus = this.routeFocusInfo(snapshot.party, snapshot.persistence);
    const selected = snapshot.party.nodes.find((node) => node.id === snapshot.party?.selectedNodeId);
    const panel = new Graphics();
    const x = game.width - 368;
    const y = 166;
    const width = 352;
    const height = 176;
    const accent = focus.focusMode === "critical" ? palette.tomato : focus.focusMode === "branches" ? palette.blue : focus.focusMode === "rewards" ? palette.lemon : focus.focusMode === "schema" ? palette.mint : palette.paper;
    panel.rect(x, y, width, height).fill({ color: palette.ink, alpha: 0.86 }).stroke({ color: accent, width: 2, alpha: 0.94 });
    panel.rect(x + 12, y + 34, Math.max(32, Math.min(width - 24, (width - 24) * focus.focusRatio)), 5).fill({ color: accent, alpha: 0.86 });
    game.layers.hud.addChild(panel);

    const rewardLine = selected?.rewardId
      ? `${focus.selectedRewardCollected ? "CLAIMED" : "REWARD"} ${shortRewardName(selected.rewardId)}`
      : "REWARD none";
    const schemaLine =
      focus.focusMode === "schema"
        ? `SCHEMA ${shortContentStatus(selected?.contentStatus ?? "missing")}  OBJ ${shortObjectiveSet(selected?.objectiveSetId ?? "")}`
        : `BOSS ${shortNodeName(selected?.bossId ?? "none")}  ARENA ${shortNodeName(selected?.runtimeArenaId ?? selected?.arenaId ?? "none")}`;
    const text = new Text({
      text: `M40 ROUTE FOCUS  3 CYCLE
${focus.focusLabel}  ${focus.highlightedNodeIds.length}/${snapshot.party.nodes.length} NODES  ${focus.highlightedRouteIds.length}/${snapshot.party.routes.length} ROUTES
SELECT ${shortNodeName(snapshot.party.selectedNodeName)}  ${focus.selectedClassification.toUpperCase()}
${rewardLine}
${schemaLine}
CRIT ${focus.criticalPathCount}  BRANCH ${focus.branchCount}  UNCLAIMED ${focus.rewardPreviewIds.length}
${focus.focusDescription}`,
      style: { ...fontStyle, fontSize: 9, lineHeight: 13, fill: "#fff4d6", wordWrap: true, wordWrapWidth: width - 26, breakWords: true }
    });
    text.position.set(x + 14, y + 12);
    game.layers.hud.addChild(text);
  }

  private cycleRouteFocusMode(): void {
    const index = ROUTE_FOCUS_MODES.indexOf(this.routeFocusMode);
    this.routeFocusMode = ROUTE_FOCUS_MODES[(index + 1) % ROUTE_FOCUS_MODES.length] ?? "all";
  }

  private routeFocusInfo(party: NonNullable<OnlineConsensusSnapshot["party"]>, persistence?: OnlineConsensusSnapshot["persistence"] | null) {
    const selected = party.nodes.find((node) => node.id === party.selectedNodeId) ?? party.nodes[0] ?? null;
    const criticalPathIds = party.campaign?.criticalPathNodeIds ?? ["armistice_plaza", "cooling_lake_nine", "memory_cache_001", "archive_of_unsaid_things", "transit_loop_zero", "verdict_spire", "alignment_spire_finale"];
    const branchIds = party.campaign?.branchNodeIds ?? [];
    const criticalSet = new Set(criticalPathIds);
    const branchSet = new Set(branchIds);
    const collectedRewards = new Set(persistence?.profile.rewardIds ?? party.rewards?.rewardIds ?? []);
    const recommendedNodeId = persistence?.profile.recommendedNodeId ?? party.rewards?.recommendedNodeId ?? "armistice_plaza";
    const rewardPreviewIds = party.nodes
      .filter((node) => node.rewardId && !collectedRewards.has(node.rewardId))
      .map((node) => node.id);

    let highlightedNodeIds: string[];
    if (this.routeFocusMode === "critical") {
      highlightedNodeIds = party.nodes.filter((node) => criticalSet.has(node.id)).map((node) => node.id);
    } else if (this.routeFocusMode === "branches") {
      highlightedNodeIds = party.nodes.filter((node) => branchSet.has(node.id)).map((node) => node.id);
    } else if (this.routeFocusMode === "rewards") {
      highlightedNodeIds = party.nodes.filter((node) => rewardPreviewIds.includes(node.id) || node.id === recommendedNodeId).map((node) => node.id);
    } else if (this.routeFocusMode === "schema") {
      highlightedNodeIds = party.nodes.filter((node) => Boolean(node.contentStatus || node.objectiveSetId || node.proofId)).map((node) => node.id);
    } else {
      highlightedNodeIds = party.nodes.map((node) => node.id);
    }
    if (selected && !highlightedNodeIds.includes(selected.id)) highlightedNodeIds = [...highlightedNodeIds, selected.id];

    const highlightedSet = new Set(highlightedNodeIds);
    const highlightedRouteIds =
      this.routeFocusMode === "all"
        ? party.routes.map((route) => route.id)
        : party.routes.filter((route) => highlightedSet.has(route.from) && highlightedSet.has(route.to)).map((route) => route.id);
    const dimmedNodeIds = party.nodes.filter((node) => !highlightedSet.has(node.id)).map((node) => node.id);
    const selectedClassification = selected
      ? selected.id === party.campaign?.finaleNodeId
        ? "finale"
        : criticalSet.has(selected.id)
          ? "critical_path"
          : branchSet.has(selected.id)
            ? "branch"
            : !selected.onlineSupported
              ? "unsupported"
              : "support"
      : "unknown";
    return {
      set: "milestone40_campaign_route_ux",
      focusMode: this.routeFocusMode,
      focusLabel: ROUTE_FOCUS_LABELS[this.routeFocusMode],
      focusDescription: ROUTE_FOCUS_DESCRIPTIONS[this.routeFocusMode],
      focusModes: ROUTE_FOCUS_MODES,
      focusControl: "Digit3 cycles route focus modes in the online party grid",
      focusRatio: highlightedNodeIds.length / Math.max(1, party.nodes.length),
      highlightedNodeIds,
      dimmedNodeIds,
      highlightedRouteIds,
      criticalPathCount: criticalPathIds.length,
      branchCount: branchIds.length,
      rewardPreviewIds,
      recommendedNodeId,
      selectedClassification,
      selectedRewardCollected: Boolean(selected?.rewardId && collectedRewards.has(selected.rewardId)),
      selectedSchemaDetails: {
        contentStatus: selected?.contentStatus ?? "",
        contentArenaId: selected?.contentArenaId ?? "",
        runtimeArenaId: selected?.runtimeArenaId ?? selected?.arenaId ?? "",
        objectiveSetId: selected?.objectiveSetId ?? "",
        bossId: selected?.bossId ?? "",
        rewardId: selected?.rewardId ?? "",
        dialogueSnippetCount: selected?.dialogueSnippetIds?.length ?? 0,
        proofId: selected?.proofId ?? ""
      },
      schemaDetailPolicy: "selected_node_content_schema_details_visible_without_persistence_import_export"
    };
  }

  private selectedPartyMapNode(): { worldX: number; worldY: number } | undefined {
    const selectedNodeId = this.snapshot?.party?.selectedNodeId ?? "armistice_plaza";
    return ALIGNMENT_GRID_MAP.nodes.find((node) => node.id === selectedNodeId);
  }

  private nextVotableNode(direction: number): { id: string } | null {
    const party = this.snapshot?.party;
    if (!party) return null;
    const available = ALIGNMENT_GRID_MAP.nodes.filter((node) => party.availableNodeIds.includes(node.id));
    if (available.length === 0) return null;
    const currentNodeId = this.localPlayer()?.votedNodeId ?? party.selectedNodeId;
    const currentIndex = Math.max(0, available.findIndex((node) => node.id === currentNodeId));
    const nextIndex = (currentIndex + direction + available.length) % available.length;
    return available[nextIndex];
  }

  private localPlayer(): OnlinePlayerSnapshot | undefined {
    return this.snapshot?.players.find((player) => player.sessionId === this.sessionId);
  }

  private tileColor(x: number, y: number): number {
    const edge = x <= this.map.bounds.minX + 1 || x >= this.map.bounds.maxX - 1 || y <= this.map.bounds.minY + 1 || y >= this.map.bounds.maxY - 1;
    if (edge) return 0x252a33;
    const band = this.map.terrainBands.find((candidate) => x >= candidate.minX && x <= candidate.maxX && y >= candidate.minY && y <= candidate.maxY);
    if (band) return (x + y) % 2 === 0 ? band.colorA : band.colorB;
    return (x * 3 + y * 5) % 4 === 0 ? 0x3b4b55 : 0x455764;
  }

  private productionArt(game: Game) {
    if (!game.useMilestone10Art) return null;
    const textures = getMilestone12ArtTextures();
    const combatTextures = getMilestone14ArtTextures();
    if (!textures && !this.requestedProductionArtLoad) {
      this.requestedProductionArtLoad = true;
      void loadMilestone12Art().then(() => {
        if (game.state.current !== this) return;
        this.staticSceneKey = "";
        this.staticSceneSignature = "";
        this.render(game);
      });
      void loadMilestone14Art().then(() => {
        if (game.state.current !== this) return;
        this.render(game);
      });
    }
    if (textures && !combatTextures && !this.requestedProductionArtLoad) {
      this.requestedProductionArtLoad = true;
      void loadMilestone14Art().then(() => {
        if (game.state.current !== this) return;
        this.render(game);
      });
    }
    return textures;
  }

  private routeArt(game: Game) {
    if (!game.useMilestone10Art) return null;
    const textures = getMilestone25RouteArtTextures();
    if (!textures && !this.requestedRouteArtLoad) {
      this.requestedRouteArtLoad = true;
      void loadMilestone25RouteArt().then(() => {
        if (game.state.current !== this) return;
        this.staticSceneKey = "";
        this.staticSceneSignature = "";
        this.render(game);
      });
    }
    return textures;
  }

  private verdictArt(game: Game) {
    if (!game.useMilestone10Art) return null;
    const textures = getMilestone26VerdictArtTextures();
    if (!textures && !this.requestedVerdictArtLoad) {
      this.requestedVerdictArtLoad = true;
      void loadMilestone26VerdictArt().then(() => {
        if (game.state.current !== this) return;
        this.staticSceneKey = "";
        this.staticSceneSignature = "";
        this.render(game);
      });
    }
    return textures;
  }

  private onlineRouteExpansionArt(game: Game) {
    if (!game.useMilestone10Art) return null;
    const textures = getMilestone28OnlineRouteArtTextures();
    if (!textures && !this.requestedOnlineRouteExpansionArtLoad) {
      this.requestedOnlineRouteExpansionArtLoad = true;
      void loadMilestone28OnlineRouteArt().then(() => {
        if (game.state.current !== this) return;
        this.staticSceneKey = "";
        this.staticSceneSignature = "";
        this.render(game);
      });
    }
    return textures;
  }

  private milestone34ObjectiveArt(game: Game) {
    if (!game.useMilestone10Art) return null;
    const textures = getMilestone34ObjectiveArtTextures();
    if (!textures && !this.requestedMilestone34ObjectiveArtLoad) {
      this.requestedMilestone34ObjectiveArtLoad = true;
      void loadMilestone34ObjectiveArt().then(() => {
        if (game.state.current !== this) return;
        this.staticSceneKey = "";
        this.staticSceneSignature = "";
        this.render(game);
      });
    }
    return textures;
  }

  private arenaIdentityArt(game: Game) {
    if (!game.useMilestone10Art || !isMilestone41ArenaIdentityArtReady()) return null;
    const textures = getMilestone41ArenaIdentityArtTextures();
    if (!textures && !this.requestedMilestone41ArenaIdentityArtLoad) {
      this.requestedMilestone41ArenaIdentityArtLoad = true;
      void loadMilestone41ArenaIdentityArt().then(() => {
        if (game.state.current !== this) return;
        this.staticSceneKey = "";
        this.staticSceneSignature = "";
        this.render(game);
      });
    }
    return textures;
  }

  private routeUiInfo() {
    const party = this.snapshot?.party;
    const persistence = this.snapshot?.persistence;
    if (!party) return null;
    const selectedNode = party.nodes.find((node) => node.id === party.selectedNodeId) ?? null;
    const stableRouteCount = party.routes.filter((route) => route.state === "stable").length;
    const plannedRuntimeArtIds = [
      "prop.objective.split_hold_anchor_v1",
      "prop.objective.regroup_beacon_v1",
      "prop.objective.recompile_relay_v1",
      "prop.alignment_grid.route_state_markers_v2",
      "ui.route_map.party_vote_pips_v1",
      "ui.save_profile.import_export_icons_v1",
      "ui.route_map.reward_badges_v1"
    ];
    const readyRuntimeArtIds = plannedRuntimeArtIds.filter((assetId) => isRuntimeReadyAsset(assetId));
    const milestone41RuntimeArtIds = ["prop.online_route.campaign_arena_identity_v1"];
    const readyMilestone41RuntimeArtIds = milestone41RuntimeArtIds.filter((assetId) => isRuntimeReadyAsset(assetId));
    const milestone34Textures = getMilestone34ObjectiveArtTextures();
    const milestone41Textures = getMilestone41ArenaIdentityArtTextures();
    const launchableIds = new Set(party.launchableNodeIds);
    const fullLabelIds = party.nodes
      .filter((node) => node.completed || node.id === party.selectedNodeId || launchableIds.has(node.id) || (node.unlocked && node.onlineSupported))
      .map((node) => node.id);
    const routeFocus = this.routeFocusInfo(party, persistence);
    return {
      panel: "milestone25_route_profile_panel",
      milestone40: routeFocus,
      artExpansion: {
        set: "milestone28_online_route_art_expansion",
        enabled: Boolean(getMilestone28OnlineRouteArtTextures()),
        staticRouteAtlases: 1,
        dynamicReadabilityAtlases: 2,
        milestone33: {
          policy: "wire_only_cleaned_or_production_transparent_pngs",
          plannedRuntimeArtIds,
          readyRuntimeArtIds,
          runtimeAtlasesReady: readyRuntimeArtIds.length === plannedRuntimeArtIds.length
        },
        milestone34: {
          set: "milestone34_objective_props_route_markers",
          enabled: Boolean(milestone34Textures),
          runtimeAtlasesReady: readyRuntimeArtIds.length === plannedRuntimeArtIds.length,
          objectivePropAtlases: 3,
          routeUiAtlases: 4
        },
        milestone37: {
          set: "milestone37_objective_route_art_polish",
          enabled: Boolean(milestone34Textures),
          policy: "dense_campaign_route_labels_markers_and_state_readability",
          labelPolicy: "selected_launchable_completed_and_unlocked_online_nodes_use_full_labels; sealed nodes use compact labels",
          routeMarkerPolicy: "stable_and_selected_adjacent_markers_use_haloed_offset_production_sprites; distant locked routes are deemphasized",
          nodeStatePolicy: "status_priority_completed_selected_launchable_locked_online_next",
          denseCampaignNodeCount: party.nodes.length,
          denseCampaignRouteCount: party.routes.length,
          fullLabelIds,
          compactLabelCount: Math.max(0, party.nodes.length - fullLabelIds.length),
          selectedNodeStateLabel: selectedNode?.completed
            ? "STABLE"
            : party.selectedNodeId === selectedNode?.id
              ? "VOTE"
              : party.launchableNodeIds.includes(party.selectedNodeId)
                ? "READY"
                : selectedNode?.unlocked === false
                  ? "SEALED"
                  : selectedNode?.onlineSupported
                    ? "ONLINE"
                    : "NEXT",
          productionArtDefaultPresentation: "production_art_default_with_placeholder_opt_out"
        },
        milestone41: {
          set: "milestone41_arena_runtime_visual_identity",
          policy: "dedicated_arena_identity_props_only_from_runtime_ready_manifest_provenance_pngs",
          runtimeArtIds: milestone41RuntimeArtIds,
          readyRuntimeArtIds: readyMilestone41RuntimeArtIds,
          enabled: Boolean(milestone41Textures),
          runtimeAtlasesReady: readyMilestone41RuntimeArtIds.length === milestone41RuntimeArtIds.length,
          dedicatedArenaFrameIds: [
            "model_war_memorial",
            "thermal_archive",
            "guardrail_forge",
            "false_schedule_yard",
            "appeal_court_ruins",
            "alignment_spire_finale"
          ],
          replacedReusedSilhouetteArenaIds: [
            "model_war_memorial",
            "thermal_archive",
            "guardrail_forge",
            "false_schedule_yard",
            "appeal_court_ruins",
            "alignment_spire_finale"
          ],
          placeholderOptOutSupported: true,
          persistenceBoundary: "route_profile_only_no_runtime_art_or_live_arena_state"
        },
        milestone42: {
          set: "milestone42_glass_sunfield_mechanics",
          nodeId: "glass_sunfield",
          arenaId: "glass_sunfield",
          bossId: "wrong_sunrise",
          rewardId: "glass_sunfield_prism",
          focusRewardUnlocks: ["google_deepmind_gemini.focus.prism_lanes", "mistral_cyclone.focus.low_latency_mirrors"],
          serverMechanicPolicy: "server_authoritative_rotating_solar_beams_with_zero_damage_shade_zones",
          readabilityPolicy: "static_translucent_solar_lanes_no_strobe_reduced_flash_safe",
          persistenceBoundary: "route_profile_only_no_live_objectives_combat_or_mechanic_state"
        },
        milestone43: {
          set: "milestone43_archive_of_unsaid_things",
          nodeId: "archive_of_unsaid_things",
          arenaId: "archive_of_unsaid_things",
          bossId: "redactor_saint",
          rewardId: "archive_unsaid_index",
          focusRewardUnlocks: ["qwen_silkgrid.focus.redaction_threads", "meta_llama_open_herd.focus.folk_memory"],
          serverMechanicPolicy: "server_authoritative_redaction_pressure_and_xp_theft",
          readabilityPolicy: "accessibility_safe_redaction_never_obscures_controls_or_proof_text",
          persistenceBoundary: "route_profile_only_no_redaction_live_objectives_combat_or_authority_state"
        }
      },
      routeDepth: persistence?.profile.routeDepth ?? party.completedNodeIds.length,
      stableRouteCount,
      totalRouteCount: party.routes.length,
      campaign: party.campaign
        ? {
            routeVersion: party.campaign.routeVersion,
            actLabel: party.campaign.actLabel,
            criticalPathNodeIds: party.campaign.criticalPathNodeIds,
            branchNodeIds: party.campaign.branchNodeIds,
            finaleNodeId: party.campaign.finaleNodeId,
            campaignNodeCount: party.campaign.campaignNodeCount,
            supportedCampaignNodeCount: party.campaign.supportedCampaignNodeCount,
            contentSchema: party.campaign.contentSchema ?? null
          }
        : null,
      selectedNodeId: party.selectedNodeId,
      selectedNodeName: party.selectedNodeName,
      selectedNodeType: selectedNode?.nodeType ?? "",
      selectedObjectiveSetId: selectedNode?.objectiveSetId ?? "",
      selectedObjectiveFlavor: selectedNode?.objectiveFlavor ?? "",
      selectedContentArenaId: selectedNode?.contentArenaId ?? "",
      selectedContentStatus: selectedNode?.contentStatus ?? "",
      selectedBossId: selectedNode?.bossId ?? "",
      selectedRewardId: selectedNode?.rewardId ?? "",
      selectedDialogueSnippetIds: selectedNode?.dialogueSnippetIds ?? [],
      selectedDialogueSnippets: selectedNode?.dialogueSnippets ?? [],
      dialoguePresentation: this.snapshot?.dialogue ?? null,
      selectedRouteBiome: selectedNode?.routeBiome ?? "",
      selectedCampaignTier: selectedNode?.campaignTier ?? 0,
      selectedCampaignCriticalPath: Boolean(selectedNode?.campaignCriticalPath),
      selectedLaunchable: party.launchableNodeIds.includes(party.selectedNodeId),
      selectedCompleted: Boolean(selectedNode?.completed),
      selectedOnlineSupported: Boolean(selectedNode?.onlineSupported),
      recommendedNodeId: persistence?.profile.recommendedNodeId ?? party.rewards?.recommendedNodeId ?? "armistice_plaza",
      rewardCount: persistence?.profile.rewardIds.length ?? party.rewards?.rewardIds.length ?? 0,
      onlineNodeCount: party.nodes.filter((node) => node.onlineSupported).length
    };
  }

  private saveProfileInfo() {
    const persistence = this.snapshot?.persistence ?? null;
    const exportCode = exportCodeForSnapshot(this.snapshot) || localPersistenceStatus.exportCode;
    if (exportCode && localPersistenceStatus.exportCode !== exportCode) localPersistenceStatus.exportCode = exportCode;
    return {
      surface: "milestone30_save_profile_export_codes",
      boundary: "browser_local_prototype_not_account_or_cloud",
      storageKey: ONLINE_PROGRESSION_STORAGE_KEY,
      durableFieldPolicy: persistence?.durableFieldPolicy ?? "route_profile_only_no_combat_state",
      exportCode,
      shortExportCode: shortExportCode(exportCode),
      exportCodeCopied: localPersistenceStatus.exportCodeCopied,
      importCodeApplied: localPersistenceStatus.importCodeApplied,
      importCodeStatus: localPersistenceStatus.importCodeStatus,
      importCodeHash: localPersistenceStatus.importCodeHash,
      resetApplied: localPersistenceStatus.resetApplied,
      clearedStoredProfile: localPersistenceStatus.clearedStoredProfile,
      profile: persistence?.profile ?? null,
      saveHash: persistence?.saveHash ?? localPersistenceStatus.draftHash,
      controls: "Lobby: press 1 to copy export code, 2 to paste/import one, 4 to reset this browser-local prototype profile."
    };
  }

  private prepareProductionSprites(game: Game): void {
    const art = this.productionArt(game);
    if (!game.useMilestone10Art || !art) {
      this.productionSpriteLayer.visible = false;
      return;
    }
    this.productionSpriteLayer.visible = true;
    this.productionSpriteLayer.sortableChildren = true;
    if (!this.productionSpriteLayer.parent) game.layers.entities.addChild(this.productionSpriteLayer);
    for (const child of this.productionSpriteLayer.children) child.visible = false;
  }

  private drawTextureGroundIfEnabled(game: Game): boolean {
    if (!game.useArmisticeTileAtlas) return false;
    const textures = getArmisticeGroundAtlasTextures();
    if (!textures) {
      if (!this.requestedAtlasLoad) {
        this.requestedAtlasLoad = true;
        void loadArmisticeGroundAtlas().then(() => {
          if (game.state.current !== this) return;
          this.staticSceneKey = "";
          this.staticSceneSignature = "";
          this.render(game);
        });
      }
      return false;
    }

    const ground = new Container();
    for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 1) {
      for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 1) {
        addArmisticeTileSprite(ground, textures, x, y, armisticeTileKeyForTerrain(x, y, this.terrainBandIdAt(x, y)));
      }
    }
    game.layers.ground.addChild(ground);
    return true;
  }

  private terrainBandIdAt(x: number, y: number): string | undefined {
    return this.map.terrainBands.find((candidate) => x >= candidate.minX && x <= candidate.maxX && y >= candidate.minY && y <= candidate.maxY)?.id;
  }

  private addStaticPropSprite(game: Game, texture: Texture, x: number, y: number, scale: number, alpha = 1): void {
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5, 0.86);
    sprite.scale.set(scale);
    sprite.alpha = alpha;
    sprite.position.set(x, y);
    game.layers.propsBehind.addChild(sprite);
  }

  private drawProductionPlayer(player: OnlinePlayerSnapshot, art: NonNullable<ReturnType<typeof getMilestone12ArtTextures>>): void {
    const p = worldToIso(player.worldX, player.worldY);
    this.entityGraphics.ellipse(p.screenX, p.screenY + 7, 17, 6).stroke({ color: player.color, width: 2, alpha: 0.75 });
    const moving = Math.hypot(player.velocityX ?? 0, player.velocityY ?? 0) > 0.03;
    const texture = milestone12NetworkPlayerTexture(player.slot, playerFacing(player), moving, this.snapshot?.seconds ?? 0, art);
    this.drawProductionWorldSprite(`player:${player.sessionId}`, texture, player.worldX, player.worldY, 1.16, 0.9);
  }

  private drawProductionWorldSprite(key: string, texture: Texture, worldX: number, worldY: number, scale: number, anchorY: number): void {
    const p = worldToIso(worldX, worldY);
    this.entityGraphics.ellipse(p.screenX, p.screenY + 6, 15 * scale, 5.5 * scale).fill({ color: palette.shadow, alpha: 0.34 });
    const sprite = this.spriteForProductionAsset(key, texture);
    placeWorldSprite(sprite, worldX, worldY, scale, worldX + worldY, anchorY);
  }

  private drawProductionEffectSprite(key: string, texture: Texture, worldX: number, worldY: number, scale: number, anchorY: number, zIndex: number): void {
    const sprite = this.spriteForProductionAsset(key, texture);
    sprite.alpha = 1;
    placeWorldSprite(sprite, worldX, worldY, scale, zIndex, anchorY);
  }

  private spriteForProductionAsset(key: string, texture: Texture): Sprite {
    let sprite = this.productionSprites.get(key);
    if (!sprite) {
      sprite = new Sprite(texture);
      this.productionSprites.set(key, sprite);
      this.productionSpriteLayer.addChild(sprite);
    }
    if (sprite.texture !== texture) sprite.texture = texture;
    return sprite;
  }

  private drawOnlineBossEvents(game: Game): void {
    const bossEvent = this.snapshot?.bossEvent;
    if (!bossEvent) return;
    for (const zone of bossEvent.brokenPromiseZones) {
      const p = worldToIso(zone.worldX, zone.worldY);
      const intensity = Math.max(0.24, Math.min(0.72, zone.expiresIn / 8.5));
      this.entityGraphics
        .ellipse(p.screenX, p.screenY + 4, zone.radius * 28, zone.radius * 12)
        .fill({ color: palette.tomato, alpha: 0.14 + intensity * 0.1 })
        .stroke({ color: palette.tomato, width: 2, alpha: 0.65 });
      this.entityGraphics
        .ellipse(p.screenX, p.screenY + 4, zone.radius * 18, zone.radius * 7)
        .stroke({ color: palette.lemon, width: 1, alpha: 0.54 });
    }
    const charge = bossEvent.activeTreatyCharge;
    if (charge) {
      const a = worldToIso(charge.fromX, charge.fromY);
      const b = worldToIso(charge.toX, charge.toY);
      this.entityGraphics
        .moveTo(a.screenX, a.screenY - 18)
        .lineTo(b.screenX, b.screenY - 18)
        .stroke({ color: charge.resolved ? palette.tomato : palette.lemon, width: charge.resolved ? 9 : 5, alpha: charge.resolved ? 0.62 : 0.78 });
      this.entityGraphics
        .circle(b.screenX, b.screenY - 18, charge.resolved ? 22 : 15)
        .stroke({ color: palette.paper, width: 2, alpha: 0.8 });
    }
  }

  private drawOnlineRolePressure(game: Game): void {
    const rolePressure = this.snapshot?.rolePressure;
    if (!rolePressure?.active) return;
    const regroup = rolePressure.phase === "regroup";
    for (const anchor of rolePressure.anchors) {
      const p = worldToIso(anchor.worldX, anchor.worldY);
      const heldRatio = Math.max(0, Math.min(1, anchor.heldSeconds / Math.max(0.1, anchor.requiredSeconds)));
      const color = regroup ? palette.mint : anchor.heldBySessionId ? palette.lemon : palette.blue;
      this.entityGraphics
        .ellipse(p.screenX, p.screenY + 6, anchor.radius * 26, anchor.radius * 11)
        .fill({ color, alpha: regroup ? 0.12 : 0.09 + heldRatio * 0.12 })
        .stroke({ color, width: anchor.heldBySessionId ? 3 : 2, alpha: anchor.heldBySessionId ? 0.82 : 0.48 });
      this.entityGraphics
        .ellipse(p.screenX, p.screenY + 6, anchor.radius * 17 * Math.max(0.25, heldRatio), anchor.radius * 7)
        .stroke({ color: regroup ? palette.paper : palette.mint, width: 2, alpha: 0.62 });
      const label = new Text({
        text: `${regroup ? "REGROUP" : anchor.role.toUpperCase()} ${anchor.heldByLabel ?? "OPEN"} ${Math.floor(heldRatio * 100)}%`,
        style: { ...fontStyle, fontSize: 10, fill: regroup ? "#64e0b4" : anchor.heldBySessionId ? "#ffd166" : "#45aaf2", align: "center" }
      });
      label.anchor.set(0.5);
      label.position.set(p.screenX, p.screenY - 50);
      game.layers.floatingText.addChild(label);
    }
    if (regroup) {
      const local = this.localPlayer();
      if (!local) return;
      const p = worldToIso(local.worldX, local.worldY);
      const label = new Text({
        text: `REGROUP WINDOW ${Math.ceil(rolePressure.regroupExpiresIn)}s  RECOMPILE x${rolePressure.recompileSpeedMultiplier}`,
        style: { ...fontStyle, fontSize: 11, fill: "#64e0b4", align: "center" }
      });
      label.anchor.set(0.5);
      label.position.set(p.screenX, p.screenY - 94);
      game.layers.floatingText.addChild(label);
    }
  }

  private drawOnlineRegionEvents(game: Game): void {
    const regionEvent = this.snapshot?.regionEvent;
    if (!regionEvent?.hazardZones?.length) return;
    const routeExpansionArt = this.onlineRouteExpansionArt(game);
    for (const zone of regionEvent.hazardZones) {
      const p = worldToIso(zone.worldX, zone.worldY);
      const color = zone.familyId === "boiling_cache" ? palette.tomato : zone.familyId === "false_track" || zone.familyId === "solar_beam" ? palette.lemon : zone.familyId === "shade_zone" || zone.familyId === "redaction_anchor" ? palette.mint : zone.familyId === "redaction_field" ? 0xfff4d6 : 0x45aaf2;
      const labelFill = zone.familyId === "boiling_cache" ? "#ff5d57" : zone.familyId === "false_track" || zone.familyId === "solar_beam" ? "#ffd166" : zone.familyId === "verdict_seal" || zone.familyId === "redaction_field" ? "#fff4d6" : zone.familyId === "shade_zone" || zone.familyId === "redaction_anchor" ? "#64e0b4" : "#45aaf2";
      const hazardColor = zone.familyId === "verdict_seal" ? 0xfff4d6 : color;
      const zoneAlpha = zone.familyId === "shade_zone" || zone.familyId === "redaction_anchor" ? 0.1 : zone.familyId === "solar_beam" || zone.familyId === "redaction_field" ? 0.11 : zone.familyId === "verdict_seal" ? 0.12 : 0.14;
      const markerFrame = hazardFrameForZone(zone.familyId);
      if (routeExpansionArt && markerFrame) {
        this.drawProductionEffectSprite(`online-hazard:${zone.familyId}:${zone.id}`, routeExpansionArt.hazardMarkers[markerFrame], zone.worldX, zone.worldY, Math.max(0.72, Math.min(1.45, zone.radius * 0.28)), 0.72, zone.worldX + zone.worldY + 0.02);
      }
      this.entityGraphics
        .ellipse(p.screenX, p.screenY + 6, zone.radius * 29, zone.radius * 12)
        .fill({ color: hazardColor, alpha: zoneAlpha })
        .stroke({ color: hazardColor, width: 3, alpha: 0.68 });
      this.entityGraphics
        .ellipse(p.screenX, p.screenY + 6, zone.radius * 18, zone.radius * 7)
        .stroke({ color: zone.familyId === "verdict_seal" || zone.familyId === "shade_zone" || zone.familyId === "redaction_anchor" ? palette.mint : palette.lemon, width: 1, alpha: 0.62 });
      const label = new Text({
        text: zone.label.toUpperCase(),
        style: { ...fontStyle, fontSize: 10, fill: labelFill }
      });
      label.anchor.set(0.5);
      label.position.set(p.screenX, p.screenY - 34);
      game.layers.floatingText.addChild(label);
    }
  }

  private drawOnlineObjectives(game: Game): void {
    const objectives = this.snapshot?.objectives;
    if (!objectives || objectives.phase === "completed") return;
    const objectiveArt = this.milestone34ObjectiveArt(game);
    for (const objective of objectives.instances) {
      if (!objective.active && !objective.complete) continue;
      const p = worldToIso(objective.worldX, objective.worldY);
      const ratio = Math.max(0, Math.min(1, objective.progress / Math.max(0.1, objective.required)));
      const color = objective.complete ? palette.mint : objective.type === "seal" ? palette.tomato : objective.type === "collect" ? palette.lemon : palette.blue;
      const runtimeArtReady = isRuntimeReadyAsset(objective.runtimeArtId);
      const assistText = objective.roleMatched && objective.roleAssistMultiplier && objective.roleAssistMultiplier > 1 ? ` ROLE x${objective.roleAssistMultiplier.toFixed(2)}` : "";
      const artText = objective.runtimeArtId ? (runtimeArtReady ? " ART" : " REF") : "";
      const objectiveTexture = objectiveArt ? objectiveTextureFor(objectiveArt, objective, ratio) : null;
      if (objectiveTexture) {
        this.drawProductionEffectSprite(
          `objective:${objective.id}`,
          objectiveTexture,
          objective.worldX,
          objective.worldY,
          objective.type === "collect" ? 0.68 : 0.84,
          objective.type === "collect" ? 0.56 : 0.78,
          objective.worldX + objective.worldY + 0.08
        );
      }
      this.entityGraphics
        .ellipse(p.screenX, p.screenY + 6, objective.radius * 24, objective.radius * 10)
        .fill({ color, alpha: objective.complete ? 0.08 : 0.12 })
        .stroke({ color: objective.roleMatched ? palette.mint : color, width: objective.active ? 3 : 2, alpha: objective.active ? 0.82 : 0.42 });
      this.entityGraphics
        .ellipse(p.screenX, p.screenY + 6, objective.radius * 24 * Math.max(0.05, ratio), objective.radius * 10 * Math.max(0.05, ratio))
        .stroke({ color: objective.complete ? palette.paper : palette.mint, width: 2, alpha: 0.72 });
      const label = new Text({
        text: `${objective.complete ? "DONE" : "OBJ"} ${objective.label.toUpperCase()} ${Math.floor(ratio * 100)}%${assistText}${artText}`,
        style: { ...fontStyle, fontSize: 10, fill: objective.complete ? "#64e0b4" : "#fff4d6", align: "center", wordWrap: true, wordWrapWidth: 160 }
      });
      label.anchor.set(0.5);
      label.position.set(p.screenX, p.screenY - 44);
      game.layers.floatingText.addChild(label);
    }
  }

}

function objectiveTextureFor(art: Milestone34ObjectiveArtTextures, objective: OnlineObjectiveInstance, ratio: number): Texture | null {
  if (objective.runtimeArtId === "prop.objective.split_hold_anchor_v1") {
    const frame = objective.complete ? "completed" : objective.heldByLabels?.length ? "active" : ratio > 0 ? "pressured" : "inactive";
    return art.splitHoldAnchor[frame];
  }
  if (objective.runtimeArtId === "prop.objective.regroup_beacon_v1") {
    const frame = objective.complete ? "completed" : objective.roleMatched ? "ready" : objective.active ? "pulse" : "inactive";
    return art.regroupBeacon[frame];
  }
  if (objective.runtimeArtId === "prop.objective.recompile_relay_v1") {
    const frame = objective.complete ? "ready" : objective.active && ratio <= 0.05 ? "offline" : objective.roleMatched ? "ready" : objective.active ? "compiling" : "corrupted";
    return art.recompileRelay[frame];
  }
  if (objective.runtimeArtId === "ui.route_map.reward_badges_v1") {
    return art.routeRewardBadges[objective.itemId === "thermal_sample" ? "core_upgrade" : objective.itemId === "transit_permit_shard" ? "clearance_pass" : objective.itemId === "appeal_token" ? "glitch_key" : "data_fragment"];
  }
  if (objective.runtimeArtId === "ui.save_profile.import_export_icons_v1") {
    return art.saveProfileIcons[objective.id.includes("export") ? "export" : objective.complete ? "success" : "local_save"];
  }
  return null;
}

function routeMarkerPlacement(route: (typeof ALIGNMENT_GRID_MAP.routes)[number], state: PartyRouteState, selectedNodeId: string) {
  const from = ALIGNMENT_GRID_MAP.nodes.find((node) => node.id === route.from);
  const to = ALIGNMENT_GRID_MAP.nodes.find((node) => node.id === route.to);
  if (!from || !to) {
    return { visible: false, screenX: 0, screenY: 0, scale: 0.5, alpha: 0.4, haloColor: palette.ink, haloAlpha: 0 };
  }
  const selectedAdjacent = route.from === selectedNodeId || route.to === selectedNodeId;
  if (state === "locked" && !selectedAdjacent) {
    return { visible: false, screenX: 0, screenY: 0, scale: 0.42, alpha: 0.28, haloColor: palette.ink, haloAlpha: 0 };
  }
  const midpoint = route.checkpoints[Math.floor(route.checkpoints.length / 2)] ?? {
    worldX: (from.worldX + to.worldX) / 2,
    worldY: (from.worldY + to.worldY) / 2
  };
  const p = worldToIso(midpoint.worldX, midpoint.worldY);
  const a = worldToIso(from.worldX, from.worldY);
  const b = worldToIso(to.worldX, to.worldY);
  const dx = b.screenX - a.screenX;
  const dy = b.screenY - a.screenY;
  const length = Math.max(1, Math.hypot(dx, dy));
  const hash = [...route.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const sign = hash % 2 === 0 ? 1 : -1;
  const normalX = (-dy / length) * sign;
  const normalY = (dx / length) * sign;
  const offset = selectedAdjacent ? 18 : state === "stable" ? 13 : 10;
  const scale = selectedAdjacent ? 0.78 : state === "stable" ? 0.62 : 0.54;
  const alpha = selectedAdjacent ? 1 : state === "stable" ? 0.88 : 0.64;
  const haloColor = state === "stable" ? palette.mint : state === "locked" ? 0x596270 : palette.lemon;
  return {
    visible: true,
    screenX: p.screenX + normalX * offset,
    screenY: p.screenY - 6 + normalY * offset,
    scale,
    alpha,
    haloColor,
    haloAlpha: selectedAdjacent ? 0.34 : state === "stable" ? 0.22 : 0.16
  };
}

function routeMarkerFrame(routeId: string, state: PartyRouteState, toNodeId: string): RouteStateMarkerFrame {
  if (state === "stable") return "stable";
  if (state === "locked") return "locked";
  if (toNodeId === "transit_loop_zero" || toNodeId === "verdict_spire" || toNodeId === "appeal_court_ruins" || toNodeId === "alignment_spire_finale" || routeId.includes("verdict")) return "boss";
  if (toNodeId === "memory_cache_001" || toNodeId === "cooling_lake_nine" || toNodeId === "model_war_memorial" || toNodeId === "thermal_archive" || toNodeId === "guardrail_forge" || toNodeId === "false_schedule_yard" || toNodeId === "glass_sunfield" || toNodeId === "archive_of_unsaid_things") return "event";
  return "unstable";
}

function partyVotePipFrame(slot: number, ready: boolean): PartyVotePipFrame {
  const safeSlot = Math.max(0, Math.min(3, slot));
  return `p${safeSlot + 1}_${ready ? "ready" : "unready"}` as PartyVotePipFrame;
}

function rewardBadgeFrame(rewardId: string): RouteRewardBadgeFrame {
  if (rewardId.includes("cache") || rewardId.includes("persistence")) return "memory_cache";
  if (rewardId.includes("permit") || rewardId.includes("route")) return "clearance_pass";
  if (rewardId.includes("key") || rewardId.includes("verdict")) return "glitch_key";
  if (rewardId.includes("rig") || rewardId.includes("stabilized") || rewardId.includes("prism")) return "core_upgrade";
  return "data_fragment";
}

function onlineThreatTextureFor(
  enemy: OnlineConsensusSnapshot["enemies"][number],
  textures: NonNullable<ReturnType<typeof getMilestone28OnlineRouteArtTextures>>["onlineThreats"]
): { texture: Texture; scale: number } | null {
  if (enemy.boss && enemy.familyId === "thermal_oracle") return { texture: textures.thermal_oracle, scale: 1.22 };
  if (enemy.boss && enemy.familyId === "station_that_arrives") return { texture: textures.station_that_arrives, scale: 1.24 };
  if (enemy.boss && enemy.familyId === "injunction_engine") return { texture: textures.injunction_engine, scale: 1.26 };
  if (enemy.boss && enemy.familyId === "wrong_sunrise") return { texture: textures.thermal_oracle, scale: 1.24 };
  if (enemy.boss && enemy.familyId === "redactor_saint") return { texture: textures.shard_lurker, scale: 1.24 };
  if (enemy.sourceRegionId?.includes("injunction_writs") || enemy.familyId === "injunction_writs") return { texture: textures.verdict_writ, scale: 0.82 };
  if (enemy.sourceRegionId?.includes("sunfield") || enemy.familyId === "solar_reflections") return { texture: textures.false_track, scale: 0.76 };
  if (enemy.sourceRegionId?.includes("archive") || enemy.familyId === "redaction_angels") return { texture: textures.shard_lurker, scale: 0.78 };
  if (enemy.sourceRegionId === "false_track" || enemy.sourceRegionId?.includes("false_schedule") || enemy.familyId === "false_track" || enemy.familyId === "false_schedules") return { texture: textures.false_track, scale: 0.74 };
  if (enemy.sourceRegionId === "thermal_bloom" || enemy.sourceRegionId === "boiling_cache" || enemy.sourceRegionId?.includes("thermal_archive")) return { texture: textures.boiling_cache, scale: 0.78 };
  if (enemy.familyId === "context_rot_crabs") return { texture: textures.shard_lurker, scale: 0.72 };
  if (enemy.familyId === "bad_outputs" && enemy.hp > 22) return { texture: textures.bad_output_elite, scale: 0.72 };
  return null;
}

function arenaIdentityTextureFor(arenaId: string, landmarkId: string, textures: Milestone41ArenaIdentityArtTextures | null): Texture | null {
  if (!textures) return null;
  if (arenaId === "model_war_memorial" && landmarkId === "ceasefire_cache") return textures.campaignArenaIdentity.model_war_memorial;
  if (arenaId === "thermal_archive" && landmarkId === "cooling_lake") return textures.campaignArenaIdentity.thermal_archive;
  if (arenaId === "guardrail_forge" && landmarkId === "ceasefire_cache") return textures.campaignArenaIdentity.guardrail_forge;
  if (arenaId === "false_schedule_yard" && landmarkId === "transit_loop_zero") return textures.campaignArenaIdentity.false_schedule_yard;
  if (arenaId === "appeal_court_ruins" && landmarkId === "verdict_spire") return textures.campaignArenaIdentity.appeal_court_ruins;
  if (arenaId === "alignment_spire_finale" && landmarkId === "verdict_spire") return textures.campaignArenaIdentity.alignment_spire_finale;
  return null;
}

function hazardFrameForZone(familyId: string): Milestone28HazardFrame | null {
  if (familyId === "thermal_bloom") return "thermal_bloom";
  if (familyId === "boiling_cache") return "boiling_cache";
  if (familyId === "false_track") return "false_track";
  if (familyId === "verdict_seal") return "verdict_seal";
  if (familyId === "solar_beam") return "boss_gate";
  if (familyId === "shade_zone") return "route_stable";
  if (familyId === "redaction_field") return "false_track";
  if (familyId === "redaction_anchor") return "route_stable";
  return null;
}

function playerFacing(player: OnlinePlayerSnapshot): PlayerFacing {
  if (player.facing === "south" || player.facing === "east" || player.facing === "north" || player.facing === "west") {
    return player.facing;
  }
  const velocityX = player.velocityX ?? 0;
  const velocityY = player.velocityY ?? 0;
  if (Math.hypot(velocityX, velocityY) <= 0.03) return "south";
  const screenX = velocityX - velocityY;
  const screenY = velocityX + velocityY;
  if (Math.abs(screenY) >= Math.abs(screenX)) return screenY >= 0 ? "south" : "north";
  return screenX >= 0 ? "east" : "west";
}

function formationOffset(slot: number): { worldX: number; worldY: number } {
  const offsets = [
    { worldX: 0, worldY: 0 },
    { worldX: -0.72, worldY: 0.58 },
    { worldX: 0.72, worldY: 0.58 },
    { worldX: 0, worldY: -0.78 }
  ];
  return offsets[slot] ?? offsets[0];
}

function shortNodeName(name: string): string {
  if (name === "Armistice Plaza") return "Plaza";
  if (name === "armistice_plaza") return "Plaza";
  if (name === "Accord Relay") return "Relay";
  if (name === "accord_relay") return "Relay";
  if (name === "Cooling Lake Nine") return "Lake";
  if (name === "cooling_lake_nine") return "Lake";
  if (name === "Ceasefire Cache") return "Cache";
  if (name === "memory_cache_001") return "Cache";
  if (name === "Transit Loop Zero") return "Transit";
  if (name === "transit_loop_zero") return "Transit";
  if (name === "Verdict Spire") return "Verdict";
  if (name === "verdict_spire") return "Verdict";
  if (name === "Model War Memorial" || name === "model_war_memorial") return "Memorial";
  if (name === "Armistice Camp" || name === "armistice_camp") return "Camp";
  if (name === "Thermal Archive" || name === "thermal_archive") return "Archive";
  if (name === "Guardrail Forge" || name === "guardrail_forge") return "Forge";
  if (name === "False Schedule Yard" || name === "false_schedule_yard") return "Yard";
  if (name === "Glass Sunfield" || name === "glass_sunfield") return "Glass";
  if (name === "Archive Of Unsaid Things" || name === "archive_of_unsaid_things") return "Archive";
  if (name === "Appeal Court Ruins" || name === "appeal_court_ruins") return "Appeal";
  if (name === "Alignment Spire Finale" || name === "alignment_spire_finale") return "Finale";
  return name.split(" ")[0] ?? name;
}

function shortNodeType(nodeType: string): string {
  if (nodeType === "Memory Cache") return "Cache";
  if (nodeType === "Boss Gate") return "Boss";
  if (nodeType === "Breach Arena") return "Arena";
  if (nodeType === "Alignment Node") return "Node";
  if (nodeType === "Faction Relay") return "Relay";
  if (nodeType === "Refuge Camp") return "Camp";
  return nodeType.split(" ")[0] ?? nodeType;
}

function shortContentStatus(status: string): string {
  if (status === "runtime_ready") return "READY";
  if (status === "runtime_ready_interaction") return "INTERACT";
  if (status === "runtime_ready_finale") return "FINALE";
  if (status.includes("unsupported")) return "LOCKED";
  if (!status) return "MISSING";
  return status.replace(/^schema_/, "").replace(/^runtime_/, "").split("_").slice(0, 2).join("-").toUpperCase();
}

function shortObjectiveSet(objectiveSetId: string): string {
  if (!objectiveSetId) return "none";
  if (objectiveSetId.includes("finale")) return "finale";
  if (objectiveSetId.includes("thermal_archive")) return "thermal";
  if (objectiveSetId.includes("guardrail")) return "forge";
  if (objectiveSetId.includes("false_schedule")) return "schedule";
  if (objectiveSetId.includes("glass_sunfield")) return "sunfield";
  if (objectiveSetId.includes("archive_unsaid")) return "archive";
  if (objectiveSetId.includes("appeal")) return "appeal";
  if (objectiveSetId.includes("transit")) return "transit";
  if (objectiveSetId.includes("cache") || objectiveSetId.includes("memorial")) return "memory";
  if (objectiveSetId.includes("verdict")) return "verdict";
  return objectiveSetId.split("_")[0] ?? objectiveSetId;
}

function nodeLabelOffset(nodeId: string): { x: number; y: number } {
  const node = ALIGNMENT_GRID_MAP.nodes.find((candidate) => candidate.id === nodeId);
  if (node) return { x: node.labelOffsetX ?? 0, y: node.labelOffsetY ?? 0 };
  return { x: 0, y: 0 };
}

function arenaLabel(arenaId: string): string {
  if (arenaId === "cooling_lake_nine") return "COOLING LAKE NINE";
  if (arenaId === "thermal_archive") return "THERMAL ARCHIVE";
  if (arenaId === "transit_loop_zero") return "TRANSIT LOOP ZERO";
  if (arenaId === "false_schedule_yard") return "FALSE SCHEDULE YARD";
  if (arenaId === "glass_sunfield") return "GLASS SUNFIELD";
  if (arenaId === "archive_of_unsaid_things") return "ARCHIVE OF UNSAID THINGS";
  if (arenaId === "verdict_spire") return "VERDICT SPIRE";
  if (arenaId === "appeal_court_ruins") return "APPEAL COURT RUINS";
  if (arenaId === "alignment_spire_finale") return "ALIGNMENT SPIRE FINALE";
  if (arenaId === "memory_cache_001") return "CEASEFIRE CACHE";
  if (arenaId === "model_war_memorial") return "MODEL WAR MEMORIAL";
  if (arenaId === "guardrail_forge") return "GUARDRAIL FORGE";
  return "ARMISTICE PLAZA";
}

function shortUpgradeName(upgradeId: string): string {
  if (upgradeId === "refusal_halo") return "Halo";
  if (upgradeId === "coherence_magnet") return "Magnet";
  if (upgradeId === "recompile_anchor") return "Anchor";
  if (upgradeId === "the_no_button") return "No";
  if (upgradeId === "patch_cascade") return "Cascade";
  return upgradeId.split("_")[0]?.toUpperCase() ?? upgradeId;
}

function shortRoleName(role: string): string {
  if (role === "cover") return "COVER";
  if (role === "support") return "SUP";
  if (role === "harrier") return "HAR";
  if (role === "duelist") return "DUEL";
  return "RUN";
}

function reconnectKeyForTab(): string {
  const params = new URLSearchParams(window.location.search);
  const explicit = params.get("reconnectKey");
  if (explicit) return explicit.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 72);
  const storageKey = "agi:last-alignment:online-reconnect-key";
  const existing = window.sessionStorage.getItem(storageKey);
  if (existing) return existing;
  const generated = `cell_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  window.sessionStorage.setItem(storageKey, generated);
  return generated;
}

const localPersistenceStatus = {
  resetApplied: false,
  clearedStoredProfile: false,
  foundStoredProfile: false,
  draftHash: "",
  storageKey: ONLINE_PROGRESSION_STORAGE_KEY,
  exportCode: "",
  exportCodeCopied: false,
  importCodeApplied: false,
  importCodeStatus: "none" as "none" | "query_code_applied" | "stored_code_reconnecting" | "invalid_code" | "storage_write_failed",
  importCodeHash: "",
  lastAction: "profile_surface_ready"
};

function shortReconnectKey(reconnectKey: string): string {
  return reconnectKey.slice(-8);
}

function onlineServerUrl(): string {
  const params = new URLSearchParams(window.location.search);
  const explicit = params.get("coopServer");
  if (explicit) return explicit;
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.hostname || "127.0.0.1"}:2567`;
}

function onlineProofLoadoutParams(): { classId: string | null; factionId: string | null } {
  const params = new URLSearchParams(window.location.search);
  return {
    classId: params.get("onlineClassId") ?? params.get("classId"),
    factionId: params.get("onlineFactionId") ?? params.get("factionId")
  };
}

function readOnlineProgressionDraft(): unknown {
  const params = new URLSearchParams(window.location.search);
  if (params.get("resetOnlinePersistence") === "1") {
    try {
      localPersistenceStatus.clearedStoredProfile = Boolean(window.localStorage.getItem(ONLINE_PROGRESSION_STORAGE_KEY));
      window.localStorage.removeItem(ONLINE_PROGRESSION_STORAGE_KEY);
    } catch {
      // Ignore private-mode storage failures.
    }
    localPersistenceStatus.resetApplied = true;
    localPersistenceStatus.foundStoredProfile = false;
    localPersistenceStatus.draftHash = "";
    localPersistenceStatus.exportCode = "";
    localPersistenceStatus.lastAction = "reset_query_applied";
    return null;
  }
  const codeParam = params.get("importOnlineProfileCode") ?? params.get("onlineProfileCode") ?? params.get("profileCode");
  if (codeParam) {
    const decoded = decodeOnlineProfileCode(codeParam);
    if (decoded) {
      writeImportedDraftToStorage(decoded);
      localPersistenceStatus.importCodeApplied = true;
      localPersistenceStatus.importCodeStatus = "query_code_applied";
      localPersistenceStatus.importCodeHash = typeof decoded.saveHash === "string" ? decoded.saveHash : "";
      localPersistenceStatus.foundStoredProfile = true;
      localPersistenceStatus.draftHash = localPersistenceStatus.importCodeHash;
      localPersistenceStatus.exportCode = encodeOnlineProfileCode(decoded);
      localPersistenceStatus.lastAction = "import_query_code_applied";
      return decoded;
    }
    localPersistenceStatus.importCodeStatus = "invalid_code";
    localPersistenceStatus.lastAction = "import_query_code_invalid";
  }
  try {
    const raw = window.localStorage.getItem(ONLINE_PROGRESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    localPersistenceStatus.foundStoredProfile = true;
    localPersistenceStatus.draftHash = typeof parsed?.saveHash === "string" ? parsed.saveHash : "";
    return parsed;
  } catch {
    return null;
  }
}

function writeOnlineProgressionDraft(snapshot: OnlineConsensusSnapshot): void {
  if (!snapshot.persistence?.exportable) return;
  try {
    window.localStorage.setItem(snapshot.persistence.storageKey, JSON.stringify(snapshot.persistence));
    localPersistenceStatus.draftHash = snapshot.persistence.saveHash;
    localPersistenceStatus.exportCode = encodeOnlineProfileCode(snapshot.persistence);
  } catch {
    // The game remains playable if local storage is unavailable.
  }
}

function writeImportedDraftToStorage(draft: unknown): void {
  try {
    window.localStorage.setItem(ONLINE_PROGRESSION_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    localPersistenceStatus.importCodeStatus = "storage_write_failed";
  }
}

function exportCodeForSnapshot(snapshot: OnlineConsensusSnapshot | null): string {
  if (!snapshot?.persistence?.exportable) return "";
  return encodeOnlineProfileCode(snapshot.persistence);
}

function encodeOnlineProfileCode(draft: unknown): string {
  const json = JSON.stringify(draft);
  const encoded = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return `AGI1_${encoded}`;
}

function decodeOnlineProfileCode(code: string): Record<string, unknown> | null {
  const trimmed = code.trim();
  const payload = trimmed.startsWith("AGI1_") ? trimmed.slice(5) : trimmed;
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const json = decodeURIComponent(escape(atob(base64)));
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function shortExportCode(code: string): string {
  if (!code) return "none";
  if (code.length <= 28) return code;
  return `${code.slice(0, 13)}...${code.slice(-10)}`;
}

function shortRewardName(rewardId: string): string {
  if (rewardId === "plaza_stabilized") return "Plaza";
  if (rewardId === "lake_coolant_rig") return "LakeRig";
  if (rewardId === "cooling_lake_online_route") return "LakeRoute";
  if (rewardId === "ceasefire_cache_persistence_seed") return "Seed";
  if (rewardId === "prototype_persistence_boundary") return "Boundary";
  if (rewardId === "transit_permit_zero") return "Transit";
  if (rewardId === "transit_loop_online_route") return "TransitRoute";
  if (rewardId === "verdict_key_zero") return "Verdict";
  if (rewardId === "verdict_spire_online_route") return "VerdictRoute";
  return rewardId.split("_")[0] ?? rewardId;
}
