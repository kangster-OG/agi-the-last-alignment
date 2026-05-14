import type { Game } from "../core/Game";
import type { LevelRunState } from "../level/LevelRunState";
import type { OverworldState } from "../overworld/OverworldState";
import { COMBAT_CLASSES, FACTIONS, GAME_TITLE, resolveBuildKit } from "../content";
import type { SummaryState } from "../ui/summary";
import { ALIGNMENT_GRID_MAP, nextRecommendedAlignmentNode, stabilizedRouteIds, visibleRouteConsequenceText } from "../overworld/alignmentGridMap";
import type { UpgradeDraftState } from "../ui/draft";
import type { OnlineCoopState } from "../network/OnlineCoopState";
import { assetPipelineSummary } from "../assets";
import { getArmisticeAuthoredGroundTexture } from "../assets/armisticeGroundAtlas";
import { getPlayerDamageVfxTextures } from "../assets/playerDamageVfx";
import { getBuildWeaponVfxTextures } from "../assets/buildWeaponVfx";
import { getEnemyRoleVfxTextures, ENEMY_ROLE_VFX_ASSET_ID } from "../assets/enemyRoleVfx";
import { getCoolingLakeNineArtTextures } from "../assets/coolingLakeNineArt";
import { getTransitLoopZeroArtTextures } from "../assets/transitLoopZeroArt";
import { getSignalCoastArtTextures } from "../assets/signalCoastArt";
import { BLACKWATER_BEACON_ART_ASSET_ID, getBlackwaterBeaconArtTextures } from "../assets/blackwaterBeaconArt";
import { MEMORY_CACHE_ART_ASSET_ID, getMemoryCacheArtTextures } from "../assets/memoryCacheArt";
import { GUARDRAIL_FORGE_ART_ASSET_ID, getGuardrailForgeArtTextures } from "../assets/guardrailForgeArt";
import { GLASS_SUNFIELD_ART_ASSET_ID, getGlassSunfieldArtTextures } from "../assets/glassSunfieldArt";
import { ARCHIVE_COURT_ART_ASSET_ID, getArchiveCourtArtTextures } from "../assets/archiveCourtArt";
import { APPEAL_COURT_ART_ASSET_ID, getAppealCourtArtTextures } from "../assets/appealCourtArt";
import { ALIGNMENT_SPIRE_ART_ASSET_ID, getAlignmentSpireFinaleArtTextures } from "../assets/alignmentSpireFinaleArt";
import type { BuildSelectState } from "../ui/buildSelect";
import type { LastAlignmentHubState } from "../ui/hub";
import type { RouteContractChoiceState } from "../ui/routeChoice";
import { kernelSummary } from "../roguelite/kernel";
import { evalSummary } from "../roguelite/evals";
import { burstSummary, consensusBurstPath } from "../roguelite/burst";
import { protocolCodexForBuild } from "../roguelite/protocolCodex";
import { xpNeeded } from "../gameplay/player";
import { objectiveSummary, routeContractById, routeContractForSelection } from "../roguelite/deepRoguelite";
import { nextContentTargetForProgress } from "../roguelite/nextContentTarget";
import { campaignLedgerForProgress, campaignMilestonesForProgress } from "../roguelite/campaignMilestones";
import {
  MILESTONE49_CLASS_IDS,
  MILESTONE49_FACTION_IDS,
  MILESTONE49_ORIGINAL_FACTION_MARK_IDS,
  MILESTONE49_ROLE_IDS,
  MILESTONE49_THIRD_PARTY_LOGO_IDS
} from "../assets/milestone49PlayableArt";
import { MILESTONE50_ARENA_IDS, MILESTONE50_BOSS_IDS, MILESTONE50_ENEMY_FAMILY_IDS, MILESTONE50_HAZARD_IDS, MILESTONE50_MAJOR_PROOF_ARENA_IDS } from "../assets/milestone50ArenaBossArt";
import { buildSlotCapSummary } from "../gameplay/upgrades";
import { CAMPAIGN_LEVEL_COUNT, campaignClarityForArena, campaignClarityForNode } from "../content/campaignClarity";
import { campaignObjectiveVarietyForArena, campaignObjectiveVarietyForNode } from "../content/campaignObjectiveVariety";
import { enemyRoleProfileForFamily } from "../content/enemyRoleProfiles";

export function renderGameToText(game: Game): string {
  const state = game.state.current;
  const selectedClass = COMBAT_CLASSES[game.selectedClassId] ?? COMBAT_CLASSES.accord_striker;
  const selectedFaction = FACTIONS[game.selectedFactionId] ?? FACTIONS.openai_accord;
  const base = {
    mode: state?.mode ?? "Boot",
    title: GAME_TITLE,
    coordinateSystem: "worldX/worldY are simulation axes; screen projection is isometric with W/S/A/D mapped to screen up/down/left/right.",
    selectedBuild: {
      classId: selectedClass.id,
      className: selectedClass.displayName,
      classRole: selectedClass.role,
      buildKit: resolveBuildKit(selectedClass.id, selectedFaction.id),
      factionId: selectedFaction.id,
      factionName: selectedFaction.displayName,
      factionDoctrine: selectedFaction.doctrine
    },
    build: null as unknown,
    upgrades: [] as string[],
    objective: "",
    performance: {
      entitiesAllocated: 0,
      activeEntities: 0,
      fpsTarget: 60
    },
    qualityGate: {
      policy: "milestone56_proof_performance_compatibility_accessibility_lock",
      releaseBlocking: true,
      proofHooks: {
        renderGameToText: typeof window.render_game_to_text === "function",
        advanceTime: typeof window.advanceTime === "function",
        deterministicProofControls: true
      },
      performanceBudgets: {
        fpsTarget: 60,
        localActiveEntitiesMax: 260,
        onlineSnapshotEnemyMax: 24,
        onlineSnapshotProjectileMax: 40,
        onlineSnapshotPickupMax: 32,
        floatingLabelMax: 32
      },
      compatibility: {
        desktopViewport: "1280x720",
        laptopViewport: "960x540",
        mobileViewportPolicy: "canvas scales to available viewport; proof captures compact HUD at 960x540 before release candidate",
        inputDevices: ["keyboard", "touch-compatible browser canvas shell"],
        websocketPolicy: "Colyseus room code and reconnect paths proofed before release candidate"
      },
      accessibility: {
        reducedFlashVisible: true,
        reducedFlashQuery: "reducedFlash=1",
        screenShakeDisableQuery: "screenShake=0",
        maxReducedFlashAlpha: 0.08,
        textPolicy: "compact HUD panels use word wrap and proof captures are inspected for unreadable overlaps",
        colorStatePolicy: "route/objective states pair color with labels, progress bars, and icons"
      },
      persistenceBoundary: "proof_quality_telemetry_runtime_only_not_route_profile_export_import"
    },
    feedback: game.feedback.snapshot(),
      roguelite: {
        alignmentKernel: kernelSummary(game.selectedKernelModuleIds),
        adversarialEvals: evalSummary(game.selectedEvalProtocolIds),
        consensusBurstPath: consensusBurstPath(game.selectedConsensusBurstPathId),
        selectedRouteContract: routeContractById(game.selectedRouteContractId) ?? routeContractForSelection(game.selectedEvalProtocolIds, game.completedNodes.size),
        selectedRouteContractId: game.selectedRouteContractId,
        proofTokens: game.proofTokens,
        secrets: [...game.secretUnlockIds],
        masteryBadges: [...game.masteryBadgeIds],
        campEvents: game.campEvents,
        lastRunMemory: game.lastRunMemory,
        expedition: {
          active: game.expeditionProgress.active,
          level: game.expeditionProgress.level,
          xp: game.expeditionProgress.xp,
          chosenUpgradeIds: [...game.expeditionProgress.chosenUpgradeIds],
          chosenUpgradeNames: [...game.expeditionProgress.chosenUpgradeNames],
          chosenProtocolSlots: [...game.expeditionProgress.chosenProtocolSlots],
          activatedSynergyIds: [...game.expeditionProgress.activatedSynergyIds],
          completedMaps: [...game.expeditionProgress.completedMaps],
          powerScore: game.expeditionProgress.powerScore
        },
        nextContentTarget: nextContentTargetForProgress(game.completedNodes),
        campaignMilestones: campaignMilestonesForProgress(game.completedNodes),
        campaignLedger: campaignLedgerForProgress(game.completedNodes)
    },
    assetRendering: {
      assetPreview: game.assetPreview,
      cameraZoom: round(game.camera.zoom),
      normalCombatCameraPolicy: "Armistice normal combat uses a close tactical follow-camera crop while the arena remains larger than the viewport.",
      armisticeTileAtlasEnabled: game.useArmisticeTileAtlas,
      armisticeAuthoredGroundReady: getArmisticeAuthoredGroundTexture() !== null,
      coolingLakeNineArtReady: getCoolingLakeNineArtTextures() !== null,
      transitLoopZeroArtReady: getTransitLoopZeroArtTextures() !== null,
      signalCoastArtReady: getSignalCoastArtTextures() !== null,
      blackwaterBeaconArtReady: getBlackwaterBeaconArtTextures() !== null,
      blackwaterBeaconArtSet: getBlackwaterBeaconArtTextures() ? BLACKWATER_BEACON_ART_ASSET_ID : "not_loaded",
      memoryCacheArtReady: getMemoryCacheArtTextures() !== null,
      memoryCacheArtSet: getMemoryCacheArtTextures() ? MEMORY_CACHE_ART_ASSET_ID : "not_loaded",
      guardrailForgeArtReady: getGuardrailForgeArtTextures() !== null,
      guardrailForgeArtSet: getGuardrailForgeArtTextures() ? GUARDRAIL_FORGE_ART_ASSET_ID : "not_loaded",
      glassSunfieldArtReady: getGlassSunfieldArtTextures() !== null,
      glassSunfieldArtSet: getGlassSunfieldArtTextures() ? GLASS_SUNFIELD_ART_ASSET_ID : "not_loaded",
      archiveCourtArtReady: getArchiveCourtArtTextures() !== null,
      archiveCourtArtSet: getArchiveCourtArtTextures() ? ARCHIVE_COURT_ART_ASSET_ID : "not_loaded",
      appealCourtArtReady: getAppealCourtArtTextures() !== null,
      appealCourtArtSet: getAppealCourtArtTextures() ? APPEAL_COURT_ART_ASSET_ID : "not_loaded",
      alignmentSpireArtReady: getAlignmentSpireFinaleArtTextures() !== null,
      alignmentSpireArtSet: getAlignmentSpireFinaleArtTextures() ? ALIGNMENT_SPIRE_ART_ASSET_ID : "not_loaded",
      playerDamageVfxReady: getPlayerDamageVfxTextures() !== null,
      buildWeaponVfxReady: getBuildWeaponVfxTextures() !== null,
      enemyRoleVfxReady: getEnemyRoleVfxTextures() !== null,
      enemyRoleVfxSet: getEnemyRoleVfxTextures() ? ENEMY_ROLE_VFX_ASSET_ID : "not_loaded",
      productionArtEnabled: game.useMilestone10Art,
      productionArtSet: game.useMilestone10Art ? "milestone14_combat_art_parity" : "placeholder_safe_opt_out",
      playerFrameArtSet: game.useMilestone10Art ? "milestone49_class_roster_and_comind_modules" : "placeholder_safe_opt_out",
      campaignArenaArtSet: game.useMilestone10Art ? "milestone50_production_arena_and_boss_art" : "placeholder_safe_opt_out",
      playerFrameArtPolicy: "M49 production-art default loads cleaned transparent class frames, co-mind modules, role chips, and portraits; placeholder opt-out keeps legacy geometry.",
      campaignArenaArtPolicy: "M50 production-art default loads PixelLab-backed transparent terrain, arena prop, enemy, boss, boss portrait, and hazard atlases; placeholder opt-out keeps legacy geometry.",
      campaignArenaArtCoverage: {
        arenaIds: [...MILESTONE50_ARENA_IDS],
        majorProofArenaIds: [...MILESTONE50_MAJOR_PROOF_ARENA_IDS],
        enemyFamilyIds: [...MILESTONE50_ENEMY_FAMILY_IDS],
        bossIds: [...MILESTONE50_BOSS_IDS],
        hazardIds: [...MILESTONE50_HAZARD_IDS],
        atlasCount: 6,
        placeholderOptOutPreserved: !game.useMilestone10Art
      },
      coMindArtPolicy: "Original co-mind module art plus PixelLab-backed cleaned faction sigils are the MIT-included runtime art; official logos are quarantined third-party parody badges and not original project art.",
      productionArtDefaulted: game.productionArtDefaulted,
      armisticeTileAtlasDefaulted: game.armisticeTileAtlasDefaulted,
      optOutHint: "Use ?productionArt=0&armisticeTiles=0 or ?placeholderArt=1&placeholderTiles=1 for the legacy placeholder-safe path."
    },
    assets: assetPipelineSummary()
  };

  if (state?.mode === "BuildSelect") {
    const buildSelect = state as BuildSelectState;
    const metaprogression = buildSelect.metaprogressionInfo();
    return JSON.stringify(
      {
        ...base,
        player: null,
        buildSelection: {
          selectionMode: game.alignmentSelectionMode,
          selectionModeCopy: game.alignmentSelectionMode === "free"
            ? "Free Alignment: all Frames and Co-Minds selectable immediately; no campaign unlocks granted."
            : "Campaign: durable unlock progression; clear levels to unlock Frames and Co-Minds.",
          availableClasses: Object.values(COMBAT_CLASSES).map((combatClass) => ({
            id: combatClass.id,
            name: combatClass.displayName,
            role: combatClass.role,
            baseStats: combatClass.baseStats,
            buildKit: resolveBuildKit(combatClass.id, selectedFaction.id),
            unlocked: metaprogression.unlockedClassIds.includes(combatClass.id),
            selectable: game.alignmentSelectionMode === "free" || metaprogression.unlockedClassIds.includes(combatClass.id),
            unlock: metaprogression.classes.find((entry) => entry.id === combatClass.id) ?? null
          })),
          availableFactions: Object.values(FACTIONS).map((faction) => ({
            id: faction.id,
            name: faction.displayName,
            shortName: faction.shortName,
            upgradePoolIds: faction.upgradePoolIds,
            buildKit: resolveBuildKit(selectedClass.id, faction.id),
            unlocked: metaprogression.unlockedFactionIds.includes(faction.id),
            selectable: game.alignmentSelectionMode === "free" || metaprogression.unlockedFactionIds.includes(faction.id),
            unlock: metaprogression.factions.find((entry) => entry.id === faction.id) ?? null
          })),
          selectedClassId: selectedClass.id,
          selectedFactionId: selectedFaction.id,
          selectedClassUnlocked: metaprogression.unlockedClassIds.includes(selectedClass.id),
          selectedFactionUnlocked: metaprogression.unlockedFactionIds.includes(selectedFaction.id),
          selectedClassSelectable: game.alignmentSelectionMode === "free" || metaprogression.unlockedClassIds.includes(selectedClass.id),
          selectedFactionSelectable: game.alignmentSelectionMode === "free" || metaprogression.unlockedFactionIds.includes(selectedFaction.id),
          consensusCellSize: game.consensusCellSize,
          consensusCellHint: "Press Space to cycle local Consensus Cell size before networking.",
          hubHint: "Press C to open the Last Alignment Camp for Kernel, Eval, and Burst setup.",
          confirmHint: "Press Enter to continue to the Alignment Grid.",
          metaprogression,
          campaignClarityVocabulary: {
            campaign: "durable unlock progression",
            freeAlignment: "all-roster sandbox/testing mode",
            frame: "character",
            coMind: "AI partner",
            draft: "in-run upgrade",
            proofTokens: "durable campaign currency"
          },
          artCoverage: {
            playerFrameArtSet: game.useMilestone10Art ? "milestone49_class_roster_and_comind_modules" : "placeholder_safe_opt_out",
            classAtlasIds: [...MILESTONE49_CLASS_IDS],
            factionModuleIds: [...MILESTONE49_FACTION_IDS],
            factionSigilIds: [...MILESTONE49_FACTION_IDS],
            factionSigilSource: "pixellab_m59_cleaned_transparent_atlas",
            originalFactionPlaceholderIds: [...MILESTONE49_ORIGINAL_FACTION_MARK_IDS],
            thirdPartyLogoIds: [...MILESTONE49_THIRD_PARTY_LOGO_IDS],
            officialLogoSource: "wikimedia_commons_third_party_svg_set",
            thirdPartyLogoPolicy: "rendered only as small parody/faction badges; stored under assets/third_party/logos; not MIT-included",
            roleChipIds: [...MILESTONE49_ROLE_IDS],
            classFrameCount: MILESTONE49_CLASS_IDS.length * 4 * 3,
            placeholderOptOutPreserved: !game.useMilestone10Art
          }
        },
        overworld: null,
        level: null,
        enemies: [],
        pickups: [],
        projectiles: []
      },
      null,
      2
    );
  }

  if (state?.mode === "LastAlignmentHub") {
    const hub = state as LastAlignmentHubState;
    return JSON.stringify(
      {
        ...base,
        player: null,
        hub: hub.hubInfo(game),
        overworld: null,
        level: null,
        enemies: [],
        pickups: [],
        projectiles: [],
        objective: "Tune the Alignment Kernel, Adversarial Eval, and Consensus Burst before returning to the Alignment Grid."
      },
      null,
      2
    );
  }

  if (state?.mode === "RouteContractChoice") {
    const routeChoice = state as RouteContractChoiceState;
    return JSON.stringify(
      {
        ...base,
        player: null,
        routeChoice: routeChoice.routeInfo(game),
        overworld: null,
        level: null,
        enemies: [],
        pickups: [],
        projectiles: [],
        objective: "Choose the next route contract before deploying to the Alignment Grid."
      },
      null,
      2
    );
  }

  if (state?.mode === "OverworldMap") {
    const overworld = state as OverworldState;
    const currentNode = overworld.selectedNode;
    const nextRecommended = nextRecommendedAlignmentNode(game.completedNodes, game.unlockedNodes);
    return JSON.stringify(
      {
        ...base,
        player: { worldX: round(overworld.worldX), worldY: round(overworld.worldY) },
        overworld: {
          mapId: ALIGNMENT_GRID_MAP.id,
          mapLabel: ALIGNMENT_GRID_MAP.label,
          mapBounds: ALIGNMENT_GRID_MAP.bounds,
          avatarClassId: game.selectedClassId,
          avatarFactionId: game.selectedFactionId,
          selectedId: overworld.selectedId,
          selectedNodeType: currentNode?.nodeType,
          selectedName: currentNode?.name,
          selectedTheme: currentNode?.theme,
          currentNode: currentNode
            ? {
                id: currentNode.id,
                name: currentNode.name,
                nodeType: currentNode.nodeType,
                campaignClarity: campaignClarityForNode(currentNode.id),
                completed: game.completedNodes.has(currentNode.id),
                unlocked: game.unlockedNodes.has(currentNode.id),
                rewardPromise: currentNode.rewardPromise,
                unlockConsequence: currentNode.unlockConsequence,
                stabilizationConsequence: currentNode.stabilizationConsequence,
                nextRouteBehavior: currentNode.nextRouteBehavior,
                proofState: currentNode.proofState
              }
            : null,
          nextRecommendedNode: {
            id: nextRecommended.id,
            name: nextRecommended.name,
            nodeType: nextRecommended.nodeType,
            routeBehavior: nextRecommended.nextRouteBehavior,
            proofState: nextRecommended.proofState
          },
          completed: [...game.completedNodes],
          unlocked: [...game.unlockedNodes],
          completedNodes: [...game.completedNodes],
          unlockedNodes: [...game.unlockedNodes],
          stabilizedRoutes: stabilizedRouteIds(game.completedNodes),
          visibleRouteConsequenceText: currentNode ? visibleRouteConsequenceText(currentNode, game.completedNodes, game.unlockedNodes) : "",
          nodes: ALIGNMENT_GRID_MAP.nodes.map((node) => ({
            id: node.id,
            name: node.name,
            nodeType: node.nodeType,
            worldX: node.worldX,
            worldY: node.worldY,
            completed: game.completedNodes.has(node.id),
            unlocked: game.unlockedNodes.has(node.id),
            available: game.unlockedNodes.has(node.id) && !game.completedNodes.has(node.id),
            rewardPromise: node.rewardPromise,
            unlockConsequence: node.unlockConsequence,
            stabilizationConsequence: node.stabilizationConsequence,
            nextRouteBehavior: node.nextRouteBehavior,
            proofState: node.proofState
          })),
          routes: overworld.routeStates(game),
          nearestRoute: overworld.nearestRoute(game),
          diorama: overworld.dioramaInfo(game),
          routeWalking: overworld.routeWalking,
          enterHint: "Walk along authored route rails to an unlocked landmark and press E or Enter."
        },
        level: null,
        enemies: [],
        pickups: [],
        projectiles: []
      },
      null,
      2
    );
  }

  if (state?.mode === "LevelRun") {
    const run = state as LevelRunState;
    const clarity = campaignClarityForArena(run.arena.id);
    const enemies = [...run.world.entities]
      .filter((entity) => entity.active && entity.kind === "enemy")
      .sort((a, b) => Number(b.boss) - Number(a.boss))
      .slice(0, 12)
      .map((entity) => ({
        id: entity.id,
        label: entity.label,
        familyId: entity.enemyFamilyId,
        roleId: entity.enemyFamilyId ? enemyRoleProfileForFamily(entity.enemyFamilyId).roleId : undefined,
        eliteAffixId: entity.eliteAffixId || undefined,
        sourceRegionId: entity.sourceRegionId,
        worldX: round(entity.worldX),
        worldY: round(entity.worldY),
        hp: Math.ceil(entity.hp),
        boss: entity.boss
      }));
    const pickups = run.world.entities
      .filter((entity) => entity.active && entity.kind === "pickup")
      .slice(0, 10)
      .map((entity) => ({ worldX: round(entity.worldX), worldY: round(entity.worldY), value: entity.value }));
    const projectiles = run.world.entities
      .filter((entity) => entity.active && entity.kind === "projectile")
      .slice(0, 10)
      .map((entity) => ({ worldX: round(entity.worldX), worldY: round(entity.worldY), pierce: entity.value, label: entity.label, enemyFamilyId: entity.enemyFamilyId || undefined, sourceRoleId: entity.sourceRegionId || undefined }));
    const enemyRoleTelemetry = run.enemyRoleTelemetry();
    return JSON.stringify(
      {
        ...base,
        player: {
          worldX: round(run.player.worldX),
          worldY: round(run.player.worldY),
          velocityX: round(run.player.vx),
          velocityY: round(run.player.vy),
          facing: localFacing(run.player.vx, run.player.vy),
          hp: Math.ceil(run.player.hp),
          maxHp: run.player.maxHp,
          xp: run.player.xp,
          level: run.player.level,
          damageFeedback: {
            flash: round(run.player.damageFlash),
            hpPulse: round(run.player.hpPulse),
            stagger: round(run.player.staggerTime),
            lastDamage: round(run.player.lastDamage)
          }
        },
        players: run.players.map((runtime) => ({
          id: runtime.id,
          slot: runtime.slot,
          label: runtime.label,
          classId: runtime.classId,
          factionId: runtime.factionId,
          buildKit: runtime.buildKit,
          weaponId: runtime.build.weaponId,
          inputSource: runtime.inputSource,
          worldX: round(runtime.player.worldX),
          worldY: round(runtime.player.worldY),
          velocityX: round(runtime.player.vx),
          velocityY: round(runtime.player.vy),
          facing: localFacing(runtime.player.vx, runtime.player.vy),
          hp: Math.ceil(runtime.player.hp),
          maxHp: runtime.player.maxHp,
          xp: runtime.player.xp,
          level: runtime.player.level,
          damageFeedback: {
            flash: round(runtime.player.damageFlash),
            hpPulse: round(runtime.player.hpPulse),
            stagger: round(runtime.player.staggerTime),
            lastDamage: round(runtime.player.lastDamage)
          },
          downed: runtime.downed
        })),
        overworld: { nodeId: run.nodeId },
        level: {
          arenaId: run.arena.id,
          arena: run.arena.name,
          regionId: run.arena.regionId,
          bossId: run.arena.bossId,
          classId: run.classId,
          factionId: run.factionId,
          className: COMBAT_CLASSES[run.classId]?.displayName,
          factionName: FACTIONS[run.factionId]?.displayName,
          chosenUpgradeIds: [...run.chosenUpgradeIds],
          mapId: run.map.id,
          mapBounds: run.map.bounds,
          mapContract: run.mapContractSummary(),
          staticObstacles: run.staticObstacleSummary(),
          nearestLandmark: {
            id: run.nearestLandmark().id,
            label: run.nearestLandmark().label,
            worldX: run.nearestLandmark().worldX,
            worldY: run.nearestLandmark().worldY
          },
          visitedLandmarks: [...run.visitedLandmarkIds],
          activeSpawnRegions: run.activeSpawnRegions().map((region) => ({
            id: region.id,
            label: region.label,
            worldX: region.worldX,
            worldY: region.worldY,
            enemyFamilyIds: region.enemyFamilyIds
          })),
          lastSpawnRegionId: run.director.lastSpawnRegionId,
          spawnedByRegion: run.director.spawnedByRegion,
          director: {
            phase: run.director.cadencePhase,
            totalSpawned: run.director.totalSpawned,
            activeEnemyCap: run.director.activeEnemyCap,
            lastBurstSize: run.director.lastBurstSize,
            activeEnemyCount: run.world.entities.filter((entity) => entity.active && entity.kind === "enemy").length
          },
          consensusCell: {
            playerCount: run.players.length,
            maxPlayers: 4,
            scaling: run.consensusScaling(),
            recentInputCommands: run.inputCommands.map((command) => ({
              tick: command.tick,
              playerId: command.playerId,
              sequence: command.sequence,
              axisX: round(command.axisX),
              axisY: round(command.axisY),
              dashPressed: command.dashPressed,
              interactPressed: command.interactPressed
            })),
            stateSnapshot: run.stateSnapshot()
          },
          combatArt: {
            projectileCount: run.world.entities.filter((entity) => entity.active && entity.kind === "projectile").length,
            impactCount: run.world.entities.filter((entity) => entity.active && entity.kind === "particle" && entity.label === "impact").length,
            pickupSparkleCount: run.world.entities.filter((entity) => entity.active && entity.kind === "particle" && entity.label === "pickup_sparkle").length,
            damageBadgeCount: run.world.entities.filter((entity) => entity.active && entity.kind === "damageText").length,
            refusalAuraPlayers: run.players.filter((runtime) => runtime.build.refusalAura > 0 && !runtime.downed).length
          },
          bossMechanics: {
            bossContract: run.bossContractSummary(),
            bossIntroSeen: run.bossIntroSeen,
            brokenPromiseZones: run.brokenPromiseZones.map((zone) => ({
              id: zone.id,
              worldX: round(zone.worldX),
              worldY: round(zone.worldY),
              radius: zone.radius,
              expiresIn: round(Math.max(0, zone.expiresAt - run.seconds))
            })),
            activeTreatyCharge: run.treatyCharge
              ? {
                  fromX: round(run.treatyCharge.fromX),
                  fromY: round(run.treatyCharge.fromY),
                  toX: round(run.treatyCharge.toX),
                  toY: round(run.treatyCharge.toY),
                  resolved: run.treatyCharge.resolved
                }
              : null,
            oathPageSpawns: run.oathPageSpawns,
            brokenPromiseHits: run.brokenPromiseHits,
            treatyChargeImpacts: run.treatyChargeImpacts
          },
          rogueliteRun: {
            alignmentKernel: kernelSummary(run.kernelModuleIds),
            adversarialEvals: evalSummary(run.evalProtocolIds),
            effectivePressureCount: run.effectivePressureCount(),
            expedition: {
              carriedBuildActive: Boolean(run.expeditionProgress),
              carriedLevel: run.expeditionProgress?.level ?? 1,
              carriedXp: run.expeditionProgress?.xp ?? 0,
              carriedUpgradeIds: run.expeditionProgress ? [...run.expeditionProgress.chosenUpgradeIds] : [],
              carriedUpgradeNames: run.expeditionProgress ? [...run.expeditionProgress.chosenUpgradeNames] : [],
              powerScore: run.expeditionProgress?.powerScore ?? 0,
              pressureBonus: run.expeditionPowerBonus,
              balancingPromise: "Later maps preserve the expedition build, then scale director, objective, hazard, and boss pressure from carried power."
            },
            victoryCondition: run.victoryConditionSummary(),
            levelUpVacuum: {
              active: run.levelUpVacuum.active,
              absorbed: run.levelUpVacuum.absorbed,
              triggerLevel: run.levelUpVacuum.triggerLevel,
              remainingPickups: run.world.entities.filter((entity) => entity.active && entity.kind === "pickup").length
            },
            extractionGate: extractionGateSummary(run),
            consensusBurst: burstSummary(run.consensusBurst, run.build),
            routeContract: run.routeContract,
            objective: objectiveSummary(run.treatyAnchorObjective),
            objectiveVariety: run.objectiveVarietySummary(),
            campaignDuration: run.campaignDurationSummary(),
            coolingLake: run.coolingLakeSummary(),
            transitLoop: run.transitLoopSummary(),
            signalCoast: run.signalCoastSummary(),
            blackwaterBeacon: run.blackwaterBeaconSummary(),
            memoryCache: run.memoryCacheSummary(),
            guardrailForge: run.guardrailForgeSummary(),
            glassSunfield: run.glassSunfieldSummary(),
            archiveCourt: run.archiveCourtSummary(),
            appealCourt: run.appealCourtSummary(),
            alignmentSpire: run.alignmentSpireSummary(),
            enemyRoles: enemyRoleTelemetry,
            enemyRolesSeen: enemyRoleTelemetry.enemyRolesSeen,
            rangedFamiliesSeen: enemyRoleTelemetry.rangedFamiliesSeen,
            enemyProjectilesFired: enemyRoleTelemetry.enemyProjectilesFired,
            enemyProjectilesActive: enemyRoleTelemetry.enemyProjectilesActive,
            enemyProjectileHits: enemyRoleTelemetry.enemyProjectileHits,
            enemyProjectileDodges: enemyRoleTelemetry.enemyProjectileDodges,
            enemyExplosionsTriggered: enemyRoleTelemetry.enemyExplosionsTriggered,
            enemyTrailSeconds: enemyRoleTelemetry.enemyTrailSeconds,
            supportAuraSeconds: enemyRoleTelemetry.supportAuraSeconds,
            objectiveJamSeconds: enemyRoleTelemetry.objectiveJamSeconds,
            eliteAffixesSeen: enemyRoleTelemetry.eliteAffixesSeen,
            eliteKills: enemyRoleTelemetry.eliteKills,
            preBossEnemyRolePressureSeconds: enemyRoleTelemetry.preBossEnemyRolePressureSeconds,
            currentPhaseEnemyRoleMix: enemyRoleTelemetry.currentPhaseEnemyRoleMix,
            objectiveReward: run.lastObjectiveRewardLabel,
            rewardEvents: run.rewardEvents,
            rewardPacing: {
              phase: run.player.level <= 3 ? "early_build_thesis_fast_drafts" : run.seconds < run.arena.bossSeconds ? "mid_objective_cache_rewards" : "late_boss_route_fusion_rewards",
              currentXp: run.player.xp,
              nextDraftXp: xpNeeded(run.player.level),
              policy: "early XP thresholds are intentionally quicker; mid-run objectives pay cache-style utility rewards; late run slows XP and leans on boss, route, and fusion rewards.",
              rewardTypesAllowed: ["primary", "secondary", "passive", "fusion_enabler", "reroll", "route_memory", "faction_trust", "consensus_burst_charge", "objective_durability", "co_op_relay"]
            },
            alignmentCheck: run.alignmentCheckSummary(),
            difficultyDirector: run.difficultyDirectorSummary(),
            whatNow: run.whatNowSummary(),
            campaignClarity: clarity
              ? {
                  levelNumber: clarity.levelNumber,
                  levelCount: CAMPAIGN_LEVEL_COUNT,
                  levelVerb: clarity.verb,
                  objectiveUnit: clarity.objectiveUnit,
                  objectivePlain: clarity.objectivePlain,
                  objectiveVariety: campaignObjectiveVarietyForArena(run.arena.id),
                  dangerPlain: clarity.dangerPlain,
                  bossPressure: clarity.bossPressure,
                  rewardPlain: clarity.rewardPlain
                }
              : null,
            playerFacingIntel: run.runIntel(),
            firstRunArcPhase: run.firstRunArcPhase(),
            buildGrammar: {
              primaryWeaponId: run.build.weaponId,
              secondaryProtocols: [...run.build.secondaryProtocols],
              passiveProcesses: [...run.build.passiveProcesses],
              fusions: [...run.build.fusions],
              slotCaps: buildSlotCapSummary(run.build),
              contextSawRank: run.build.contextSaw,
              patchMortarRank: run.build.patchMortar,
              coherenceIndexerRank: run.build.coherenceIndexer,
              anchorBodyguardRank: run.build.anchorBodyguard,
              predictionPriorityRank: run.build.predictionPriority,
              coolantBafflesRank: run.build.coolantBaffles,
              serverBuoySynchronizerRank: run.build.serverBuoySynchronizer,
              promptLeechQuarantineRank: run.build.promptLeechQuarantine,
              groundedCableBootsRank: run.build.groundedCableBoots,
              coolingHazardMitigation: round(run.build.coolingHazardMitigation),
              relayPhaseLockRank: run.build.signalWindowControl,
              staticSkimmerNetRank: run.build.skimmerCountermeasure,
              shorelineStrideRank: run.build.shorelineStride,
              relayJamResistance: round(run.build.relayJamResistance),
              causalRailgunRank: run.build.causalRailgun,
              fusionHints: protocolCodexForBuild(run.build, run.chosenUpgradeIds).knownFusions
            },
            protocolCodex: protocolCodexForBuild(run.build, run.chosenUpgradeIds),
            buildThesis: run.synergySummary(),
            synergyOnline: run.lastSynergyOnlineLabel,
            draftBiasTags: run.draftBiasTags(),
            bossVariant: run.bossVariant(),
            enemyRolePressure: run.enemyRolePressure,
            protocolSlotsInstalled: run.chosenUpgradeIds.map((id, index) => ({
              id,
              name: run.chosenUpgrades[index] ?? id,
              protocolSlot: run.chosenProtocolSlots[index] ?? "unknown",
              tags: run.chosenTags
            }))
          },
          seconds: round(run.seconds),
          kills: run.kills,
          bossSpawned: run.bossSpawned,
          bossDefeated: run.bossDefeated
        },
        enemies,
        pickups,
        projectiles,
        build: { ...run.build, slotCaps: buildSlotCapSummary(run.build), buildKit: run.players[0]?.buildKit ?? resolveBuildKit(run.classId, run.factionId) },
        upgrades: run.chosenUpgrades,
        objective: run.objective(),
        performance: {
          entitiesAllocated: run.world.entities.length,
          activeEntities: run.world.entities.filter((entity) => entity.active).length,
          fpsTarget: 60
        }
      },
      null,
      2
    );
  }

  if (state?.mode === "OnlineCoop") {
    const online = state as OnlineCoopState;
    const snapshot = online.snapshot;
    const local = snapshot?.players.find((player) => player.sessionId === online.sessionId) ?? snapshot?.players[0] ?? null;
    return JSON.stringify(
      {
        ...base,
        player: local
          ? {
              sessionId: local.sessionId,
              worldX: round(local.worldX),
              worldY: round(local.worldY),
              hp: local.hp,
              maxHp: local.maxHp,
              xp: local.xp ?? 0,
              level: local.level ?? 1
            }
          : null,
        online: {
          ...online.connectionInfo(),
          roomName: "consensus_cell",
          maxClients: snapshot?.maxClients ?? 4,
          playerCount: snapshot?.playerCount ?? 0,
          tick: snapshot?.tick ?? 0,
          seconds: snapshot?.seconds ?? 0,
          schemaVersion: snapshot?.schemaVersion ?? 1,
          networkAuthority: snapshot?.networkAuthority ?? "colyseus_room",
          runPhase: snapshot?.runPhase ?? (online.status === "joined" ? "active" : "joining"),
          readyCount: snapshot?.players.filter((player) => player.ready).length ?? 0,
          connectedCount: snapshot?.connectedCount ?? snapshot?.players.filter((player) => player.connectionState !== "disconnected").length ?? 0,
          downedCount: snapshot?.players.filter((player) => player.downed).length ?? 0,
          reconnect: snapshot?.reconnect ?? null,
          lifecycle: snapshot?.lifecycle ?? null,
          deployment: snapshot?.deployment ?? null,
	          combat: snapshot?.combat ?? null,
	          combatArt: snapshot?.combatArt ?? null,
	          campaignContent: snapshot?.campaignContent ?? null,
	          dialogue: snapshot?.dialogue ?? null,
          bossEvent: snapshot?.bossEvent ?? null,
          regionEvent: snapshot?.regionEvent ?? null,
          enemyRoles: snapshot?.enemyRoles ?? null,
          enemyTelegraphs: snapshot?.enemyTelegraphs ?? [],
          enemyTrails: snapshot?.enemyTrails ?? [],
          objectives: snapshot?.objectives ?? null,
          rolePressure: snapshot?.rolePressure ?? null,
          consensusBurst: snapshot?.consensusBurst ?? null,
          rewards: snapshot?.rewards ?? null,
          persistence: snapshot?.persistence ?? null,
          balance: snapshot?.balance ?? null,
          serverFeedback: snapshot?.feedback ?? null,
          progression: snapshot?.progression ?? null,
          upgradeDraft: snapshot?.progression?.upgradePending
            ? {
                id: snapshot.progression.upgradePending.id,
                policy: snapshot.progression.upgradePending.policy,
                requiredVotes: snapshot.progression.upgradePending.requiredVotes ?? 1,
                voteCount: snapshot.progression.upgradePending.votes?.length ?? 0,
                voteCounts: snapshot.progression.upgradePending.voteCounts ?? {},
                leadingCardId: snapshot.progression.upgradePending.leadingCardId ?? null,
                localVote: snapshot.progression.upgradePending.votes?.find((vote) => vote.sessionId === online.sessionId)?.upgradeId ?? null
              }
            : null,
          recompile: snapshot?.recompile ?? null,
          summary: snapshot?.summary ?? null,
          party: snapshot?.party ?? null
        },
        players:
          snapshot?.players.map((player) => ({
            sessionId: player.sessionId,
            playerId: player.playerId ?? null,
            slot: player.slot,
            label: player.label,
            classId: player.classId,
            factionId: player.factionId,
            buildKit: player.buildKit ?? null,
            weaponId: player.weaponId ?? player.buildKit?.startingWeaponId ?? null,
            worldX: round(player.worldX),
            worldY: round(player.worldY),
            velocityX: round(player.velocityX ?? 0),
            velocityY: round(player.velocityY ?? 0),
            facing: player.facing ?? "south",
            hp: player.hp,
            maxHp: player.maxHp,
            xp: player.xp ?? 0,
            level: player.level ?? 1,
            ready: player.ready ?? false,
            votedNodeId: player.votedNodeId ?? null,
            connectionState: player.connectionState ?? "connected",
            connected: player.connected ?? player.connectionState !== "disconnected",
            reconnectCount: player.reconnectCount ?? 0,
            disconnectedFor: round(player.disconnectedFor ?? 0),
            downed: player.downed ?? false,
            reviveProgress: round(player.reviveProgress ?? 0),
            reviveRequired: round(player.reviveRequired ?? 0),
            revivedCount: player.revivedCount ?? 0,
            isLocal: player.sessionId === online.sessionId,
            inputSequence: player.inputSequence
          })) ?? [],
        overworld: null,
        level: {
          arenaId: snapshot?.arenaId ?? "armistice_plaza",
          arena: "Armistice Plaza",
          mapId: snapshot?.mapId ?? "armistice_plaza_large_foundation",
          mapBounds: snapshot?.bounds ?? null,
          networkAuthority: snapshot?.networkAuthority ?? "colyseus_room",
          runPhase: snapshot?.runPhase ?? (online.status === "joined" ? "active" : "joining"),
          sharedArenaStarted: (snapshot?.runPhase ?? "active") === "active",
          partyReady: {
            readyCount: snapshot?.players.filter((player) => player.ready && player.connectionState !== "disconnected").length ?? 0,
            playerCount: snapshot?.playerCount ?? 0,
            connectedCount: snapshot?.connectedCount ?? snapshot?.players.filter((player) => player.connectionState !== "disconnected").length ?? 0,
            allReady: Boolean(snapshot && (snapshot.connectedCount ?? snapshot.playerCount) > 0 && snapshot.players.filter((player) => player.connectionState !== "disconnected").every((player) => player.ready))
          },
          party: snapshot?.party ?? null,
          progression: snapshot?.progression ?? null,
          recompile: snapshot?.recompile ?? null,
          regionEvent: snapshot?.regionEvent ?? null,
          rewards: snapshot?.rewards ?? null,
          persistence: snapshot?.persistence ?? null,
          balance: snapshot?.balance ?? null,
          serverFeedback: snapshot?.feedback ?? null,
	          summary: snapshot?.summary ?? null,
	          dialogue: snapshot?.dialogue ?? null,
	          bossMechanics: snapshot?.bossEvent
            ? {
                bossIntroSeen: snapshot.bossEvent.bossIntroSeen,
                bossSpawned: snapshot.bossEvent.bossSpawned,
                bossDefeated: snapshot.bossEvent.bossDefeated,
                eventCounter: snapshot.bossEvent.eventCounter,
                brokenPromiseZones: snapshot.bossEvent.brokenPromiseZones,
                activeTreatyCharge: snapshot.bossEvent.activeTreatyCharge
              }
            : null
        },
        enemies:
          snapshot?.enemies.slice(0, 12).map((enemy) => ({
            id: enemy.id,
            familyId: enemy.familyId,
            roleId: enemy.roleId,
            sourceRegionId: enemy.sourceRegionId,
            worldX: round(enemy.worldX),
            worldY: round(enemy.worldY),
            hp: enemy.hp,
            boss: enemy.boss
          })) ?? [],
        pickups:
          snapshot?.pickups?.slice(0, 12).map((pickup) => ({
            id: pickup.id,
            worldX: round(pickup.worldX),
            worldY: round(pickup.worldY),
            value: pickup.value
          })) ?? [],
        projectiles:
          snapshot?.projectiles?.slice(0, 12).map((projectile) => ({
            id: projectile.id,
            ownerSessionId: projectile.ownerSessionId,
            hostile: projectile.hostile,
            familyId: projectile.familyId,
            roleId: projectile.roleId,
            kind: projectile.kind,
            worldX: round(projectile.worldX),
            worldY: round(projectile.worldY),
            velocityX: round(projectile.velocityX),
            velocityY: round(projectile.velocityY),
            life: round(projectile.life),
            label: projectile.label
          })) ?? [],
        enemyTelegraphs: snapshot?.enemyTelegraphs?.slice(0, 12) ?? [],
        enemyTrails: snapshot?.enemyTrails?.slice(0, 12) ?? [],
        enemyRoles: snapshot?.enemyRoles ?? null,
        objective: online.status === "joined" ? "Move independently in the shared Consensus Cell." : "Connect to the Consensus Cell server.",
        performance: {
          entitiesAllocated: (snapshot?.players.length ?? 0) + (snapshot?.enemies.length ?? 0),
          activeEntities: (snapshot?.players.length ?? 0) + (snapshot?.enemies.length ?? 0),
          fpsTarget: 60
        }
      },
      null,
      2
    );
  }

  if (state?.mode === "UpgradeDraft") {
    const draft = state as UpgradeDraftState;
    const run = draft.run;
    return JSON.stringify(
      {
        ...base,
        player: {
          worldX: round(run.player.worldX),
          worldY: round(run.player.worldY),
          hp: Math.ceil(run.player.hp),
          maxHp: run.player.maxHp,
          xp: run.player.xp,
          level: run.player.level
        },
        players: run.players.map((runtime) => ({
          id: runtime.id,
          label: runtime.label,
          classId: runtime.classId,
          factionId: runtime.factionId,
          buildKit: runtime.buildKit,
          weaponId: runtime.build.weaponId,
          hp: Math.ceil(runtime.player.hp),
          maxHp: runtime.player.maxHp,
          downed: runtime.downed
        })),
        overworld: { nodeId: run.nodeId },
        level: {
          arenaId: run.arena.id,
          arena: run.arena.name,
          classId: run.classId,
          className: COMBAT_CLASSES[run.classId]?.displayName,
          factionId: run.factionId,
          factionName: FACTIONS[run.factionId]?.displayName,
          chosenUpgradeIds: [...run.chosenUpgradeIds],
          seconds: round(run.seconds),
          kills: run.kills,
          levelUpVacuum: {
            active: run.levelUpVacuum.active,
            absorbed: run.levelUpVacuum.absorbed,
            triggerLevel: run.levelUpVacuum.triggerLevel
          },
          extractionGate: extractionGateSummary(run)
        },
        rewardEvents: run.rewardEvents,
        draft: {
          cards: draft.cards.map((card) => ({
            id: card.id,
            name: card.name,
            source: card.source,
            protocolSlot: card.protocolSlot,
            tags: card.tags,
            factionId: card.factionId,
            classId: card.classId,
            requires: card.requires ?? [],
            fusionRecipe: protocolCodexForBuild(run.build, run.chosenUpgradeIds).knownFusions.find((recipe) =>
              recipe.outputId === card.id || recipe.requirements.some((requirement) => requirement.id === card.id)
            ) ?? null
          })),
          hasEvolution: draft.cards.some((card) => card.source === "evolution"),
          protocolCodex: protocolCodexForBuild(run.build, run.chosenUpgradeIds)
        },
        enemies: [],
        pickups: [],
        projectiles: [],
        build: { ...run.build, slotCaps: buildSlotCapSummary(run.build), buildKit: run.players[0]?.buildKit ?? resolveBuildKit(run.classId, run.factionId) },
        upgrades: run.chosenUpgrades,
        objective: "Select one emergency patch."
      },
      null,
      2
    );
  }

  if (state?.mode === "LevelComplete" || state?.mode === "GameOver") {
    const summary = (state as SummaryState).summary;
    return JSON.stringify(
      {
        ...base,
        player: null,
        overworld: {
          completed: [...game.completedNodes],
          unlocked: [...game.unlockedNodes]
        },
        level: {
          nodeId: summary.nodeId,
          arena: summary.title,
          seconds: round(summary.seconds),
          kills: summary.kills,
          playerLevel: summary.level,
          completed: summary.completed,
          carryover: game.lastRunMemory,
          objectiveVariety: game.lastRunMemory ? campaignObjectiveVarietyForNode(game.lastRunMemory.nodeId) : null,
          completionPayoff: game.lastRunMemory
            ? {
                nodeStabilized: game.lastRunMemory.nodeStabilized,
                objectiveResults: `${game.lastRunMemory.objectiveUnit ?? "Objectives"} ${game.lastRunMemory.objectiveCompleted ?? 0}/${game.lastRunMemory.objectiveTotal ?? 0}`,
                bossDefeated: game.lastRunMemory.bossDefeated,
                buildHighlights: game.lastRunMemory.buildHighlights ?? [],
                proofTokensEarned: game.lastRunMemory.proofTokensAwarded ?? 0,
                proofTokensTotal: game.lastRunMemory.proofTokensTotal ?? game.proofTokens,
                mechanicalUnlocks: game.lastRunMemory.mechanicalUnlocks ?? [],
                routeUnlocks: game.lastRunMemory.routeUnlocks ?? [],
                factionCampaignConsequence: game.lastRunMemory.factionCampaignConsequence,
                campaignConsequence: game.lastRunMemory.campaignConsequence,
                finalClearance: Boolean(game.lastRunMemory.finalClearance),
                campaignResultSummary: game.lastRunMemory.finalClearance
                  ? {
                      finalClearance: "Outer Alignment contained",
                      stabilizedRouteCount: game.lastRunMemory.stabilizedRouteCount ?? 0,
                      bestBuildHighlight: game.lastRunMemory.buildHighlights?.[0] ?? "uncommitted",
                      majorChoices: {
                        routeContractId: game.lastRunMemory.routeContractId,
                        thesis: game.lastRunMemory.thesis
                      },
                      scoreSubmission: "not submitted; browser-playable proof summary only"
                    }
                  : null
              }
            : null,
          nextContentTarget: summary.completed ? nextContentTargetForProgress(game.completedNodes) : null
        },
        enemies: [],
        pickups: [],
        projectiles: [],
        upgrades: summary.upgrades,
        upgradeIds: summary.upgradeIds ?? [],
        objective: summary.completed ? "Reality now accepts this road." : "Recompile and try again."
      },
      null,
      2
    );
  }

  return JSON.stringify(
    {
      ...base,
      player: null,
      overworld: {
        completed: [...game.completedNodes],
        unlocked: [...game.unlockedNodes]
      },
      level: null,
      enemies: [],
      pickups: [],
      projectiles: []
    },
    null,
    2
  );
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function localFacing(vx: number, vy: number): "south" | "east" | "north" | "west" {
  if (Math.hypot(vx, vy) <= 0.05) return "south";
  const screenX = vx - vy;
  const screenY = vx + vy;
  if (Math.abs(screenY) >= Math.abs(screenX)) return screenY >= 0 ? "south" : "north";
  return screenX >= 0 ? "east" : "west";
}

function extractionGateSummary(run: LevelRunState) {
  if (!run.extractionGate.active) {
    return {
      active: false,
      entered: run.extractionGate.entered
    };
  }
  return {
    active: true,
    entered: run.extractionGate.entered,
    worldX: round(run.extractionGate.worldX),
    worldY: round(run.extractionGate.worldY),
    age: round(Math.max(0, run.seconds - run.extractionGate.spawnedAt)),
    distanceToPlayer: round(Math.hypot(run.player.worldX - run.extractionGate.worldX, run.player.worldY - run.extractionGate.worldY))
  };
}
