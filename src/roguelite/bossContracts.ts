export interface BossMapContract {
  bossId: string;
  displayName: string;
  homeLandmark: string;
  introTitleCardTrigger: string;
  supportSpawnSource: string;
  mapMechanicInteraction: string;
  phaseBehavior: string[];
  clearCondition: string;
  rewardCarryover: string;
  movementPressure: {
    hazardZones: string;
    landmarkAttacks: string;
    objectivePressure: string;
    supportEnemies: string;
    temporaryRouteBlocking: string;
    extractionPressure: string;
  };
}

const BOSS_CONTRACTS: Record<string, BossMapContract> = {
  armistice_plaza: {
    bossId: "oath_eater",
    displayName: "Oath-Eater",
    homeLandmark: "Treaty Monument",
    introTitleCardTrigger: "Boss timer reaches the Treaty Monument arrival window.",
    supportSpawnSource: "treaty_monument_oath_pages",
    mapMechanicInteraction: "Broken Promise zones and Treaty Charge originate from the Treaty Monument rather than an arbitrary spawn point.",
    phaseBehavior: ["Oath pages spawn from the monument.", "Broken Promise hazard zones force lateral movement.", "Treaty Charge pressures the player off static anchor positions."],
    clearCondition: "Defeat Oath-Eater, finish the reality patch timer, then enter extraction.",
    rewardCarryover: "Stable road progress, Proof Tokens, anchor-defense memory, and Kettle Coast route signal.",
    movementPressure: {
      hazardZones: "Broken Promise zones deny safe loops around anchors.",
      landmarkAttacks: "Treaty Monument charge lanes mark where the boss is arguing with the map.",
      objectivePressure: "Anchor attackers keep Treaty Anchors from being solved as unattended chores.",
      supportEnemies: "Oath pages and Eval variants arrive through monument context.",
      temporaryRouteBlocking: "Boss window makes the central treaty lane unsafe until the charge resolves.",
      extractionPressure: "Extraction opens after the boss so the player must route out through stabilized ruins."
    }
  },
  cooling_lake_nine: {
    bossId: "motherboard_eel",
    displayName: "Motherboard Eel",
    homeLandmark: "Motherboard Server Rack",
    introTitleCardTrigger: "Boss timer reaches the server-rack surge after buoy pressure is established.",
    supportSpawnSource: "motherboard_eel_server_rack",
    mapMechanicInteraction: "Eel dives electrify coolant lanes and turn buoy routing into moving water pressure.",
    phaseBehavior: ["Dive/emerge cycles relocate threat.", "Electrified coolant zones punish greedy buoy paths.", "Prompt Leeches attack shard economy during the boss window."],
    clearCondition: "Stabilize enough server buoys, defeat the Eel, then enter the Kettle extraction gate.",
    rewardCarryover: "Kettle Coast signal, burst tempo, shard recall help.",
    movementPressure: {
      hazardZones: "Coolant and electric cable lanes become live pathing constraints.",
      landmarkAttacks: "Server-rack surges tell the player where the Eel is coming from.",
      objectivePressure: "Buoys decay if abandoned or jammed.",
      supportEnemies: "Prompt Leeches contest pickups and objective space.",
      temporaryRouteBlocking: "Electrified lanes temporarily close otherwise safe buoy routes.",
      extractionPressure: "Gate appears after the Eel, forcing a route through the cooled lake."
    }
  },
  transit_loop_zero: {
    bossId: "station_that_arrives",
    displayName: "Station That Arrives",
    homeLandmark: "Arrival Platform",
    introTitleCardTrigger: "Boss timer reaches the false-schedule arrival board.",
    supportSpawnSource: "station_arrival_surge",
    mapMechanicInteraction: "Station arrivals use route windows and false schedules to make platforms unsafe.",
    phaseBehavior: ["Arrival windows relocate the boss.", "False schedule waves cut across aligned platforms.", "Route attackers punish delayed platform order."],
    clearCondition: "Align route platforms, defeat the Station, then enter the transit exit.",
    rewardCarryover: "Route lock, movement tempo, and next-route clarity.",
    movementPressure: {
      hazardZones: "False-track lanes split the station floor.",
      landmarkAttacks: "Arrival boards telegraph the next platform surge.",
      objectivePressure: "Platforms must be aligned in route order.",
      supportEnemies: "False schedule enemies spawn from arrival surges.",
      temporaryRouteBlocking: "Wrong-platform windows make some approaches unsafe.",
      extractionPressure: "Exit opens only after route lock and boss defeat."
    }
  },
  signal_coast: {
    bossId: "lighthouse_that_answers",
    displayName: "The Lighthouse That Answers",
    homeLandmark: "Signal Lighthouse Shelf",
    introTitleCardTrigger: "Boss timer reaches the lighthouse answer after relay calibration pressure begins.",
    supportSpawnSource: "lighthouse_signal_shelf",
    mapMechanicInteraction: "Signal beams and tide pulses turn relay routing into clear-window timing.",
    phaseBehavior: ["Beam sweeps call out unsafe coast lanes.", "Tide pulses rotate safe spits.", "Static Skimmers jam relays during beam pressure."],
    clearCondition: "Calibrate coastal relays, defeat the Lighthouse, then enter coastal extraction.",
    rewardCarryover: "Clear signal lane, coastal extraction, and Blackwater route clarity.",
    movementPressure: {
      hazardZones: "Surf and static fields rotate safe lanes.",
      landmarkAttacks: "Lighthouse beams point from the shelf into the route.",
      objectivePressure: "Relays decay when jammed or left.",
      supportEnemies: "Static Skimmers contest relay space.",
      temporaryRouteBlocking: "Signal beams temporarily close beach approaches.",
      extractionPressure: "Extraction path runs through the tuned coast."
    }
  },
  blackwater_beacon: {
    bossId: "maw_below_weather",
    displayName: "The Maw Below Weather",
    homeLandmark: "Downward Antenna Shelf",
    introTitleCardTrigger: "Boss timer reaches the antenna weather drop.",
    supportSpawnSource: "maw_weather_shelf",
    mapMechanicInteraction: "Tidal lanes and tower warnings make antenna retuning a boss-readability puzzle.",
    phaseBehavior: ["Wave surges deny direct crossings.", "Tower grabs change warning windows.", "Tidecall Static pressure jams antennas."],
    clearCondition: "Retune antenna arrays, defeat the Maw, then extract through the Blackwater key gate.",
    rewardCarryover: "Blackwater Signal Key, route clarity, and weather counterplay.",
    movementPressure: {
      hazardZones: "Tidal lanes and static fields punish greedy crossings.",
      landmarkAttacks: "Signal Towers warn before the weather hits.",
      objectivePressure: "Antenna arrays split attention across the platform.",
      supportEnemies: "Tidecall Static enemies jam objective progress.",
      temporaryRouteBlocking: "Wave surges temporarily close low platforms.",
      extractionPressure: "Key gate opens through the safest remaining platform route."
    }
  },
  memory_cache_001: {
    bossId: "memory_curator",
    displayName: "The Memory Curator",
    homeLandmark: "Curator Vault",
    introTitleCardTrigger: "Boss timer reaches the vault redaction sweep.",
    supportSpawnSource: "curator_vault_redaction",
    mapMechanicInteraction: "Redaction fields lock records and push players toward safe recall pockets.",
    phaseBehavior: ["Redaction bursts close archive lanes.", "Curator locks active records.", "Context Rot pressure interrupts recovery."],
    clearCondition: "Recover memory records, resolve the Curator, then enter the route-memory index.",
    rewardCarryover: "Recovered Route Memory and recovery-biased route clarity.",
    movementPressure: {
      hazardZones: "Corrupted lanes and redaction fields change safe paths.",
      landmarkAttacks: "Vault sweeps mark which record lane is unsafe.",
      objectivePressure: "Records decay or jam under Context Rot.",
      supportEnemies: "Context Rot and Memory Anchors contest recovery pockets.",
      temporaryRouteBlocking: "Redacted shortcuts are useful but unstable.",
      extractionPressure: "Index gate sits past the recovered records."
    }
  },
  guardrail_forge: {
    bossId: "doctrine_auditor",
    displayName: "The Doctrine Auditor",
    homeLandmark: "Audit Press",
    introTitleCardTrigger: "Boss timer reaches the audit press calibration.",
    supportSpawnSource: "audit_press_wave",
    mapMechanicInteraction: "Audit press fields lock relay plates and force holdout movement.",
    phaseBehavior: ["Press fields deny active zones.", "Auditor calls contest safe plates.", "Relay locks punish abandoning objectives."],
    clearCondition: "Calibrate forge relays, defeat the Auditor, then enter quench extraction.",
    rewardCarryover: "Calibrated Guardrail Doctrine and defense-biased route stability.",
    movementPressure: {
      hazardZones: "Overload lanes and audit fields rotate safe holds.",
      landmarkAttacks: "Audit Press telegraphs zone denial.",
      objectivePressure: "Relay plates need sustained defense.",
      supportEnemies: "Doctrine Auditor waves contest hold plates.",
      temporaryRouteBlocking: "Press fields temporarily block calibration lanes.",
      extractionPressure: "Quench gate opens after the forge holds."
    }
  },
  glass_sunfield: {
    bossId: "wrong_sunrise",
    displayName: "The Wrong Sunrise",
    homeLandmark: "Solar Corona",
    introTitleCardTrigger: "Boss timer reaches the false dawn.",
    supportSpawnSource: "wrong_sunrise_corona",
    mapMechanicInteraction: "Prism beams break shade pockets and turn lens routing into exposure timing.",
    phaseBehavior: ["Beam focus rotates around lenses.", "Shade pockets collapse under boss pressure.", "Solar Reflections split the lane."],
    clearCondition: "Align sun lenses, defeat the Wrong Sunrise, then enter prism extraction.",
    rewardCarryover: "Glass Sunfield Prism and Archive/Court route carryover.",
    movementPressure: {
      hazardZones: "Exposed glass lanes burn unsafe routes.",
      landmarkAttacks: "Solar corona attacks from the map landmark.",
      objectivePressure: "Lens progress decays when reflection pressure wins.",
      supportEnemies: "Solar Reflections and Choirglass split player attention.",
      temporaryRouteBlocking: "Beam focus closes a shade route for a short window.",
      extractionPressure: "Prism gate opens through the aligned lens field."
    }
  },
  archive_of_unsaid_things: {
    bossId: "redactor_saint",
    displayName: "The Redactor Saint",
    homeLandmark: "Redactor Scriptorium",
    introTitleCardTrigger: "Boss timer reaches the docket redaction.",
    supportSpawnSource: "redactor_saint_scriptorium",
    mapMechanicInteraction: "Redaction storms lock evidence writs and obscure unsafe court lanes without covering required HUD text.",
    phaseBehavior: ["Redaction bursts close evidence routes.", "Writ storms punish straight-line kiting.", "Injunction Writs contest preserved evidence."],
    clearCondition: "Preserve evidence writs, defeat the Saint, then enter the court writ gate.",
    rewardCarryover: "Archive Court Writ and appeal-route clarity.",
    movementPressure: {
      hazardZones: "Redaction fields deny archive lanes.",
      landmarkAttacks: "Scriptorium bursts mark where evidence is under attack.",
      objectivePressure: "Evidence writs must stay public long enough to preserve.",
      supportEnemies: "Redaction Angels and Injunction Writs contest the docket.",
      temporaryRouteBlocking: "Black-bar routes close briefly but remain readable.",
      extractionPressure: "Court writ gate opens only after public evidence holds."
    }
  },
  appeal_court_ruins: {
    bossId: "injunction_engine",
    displayName: "The Injunction Engine",
    homeLandmark: "Summons Engine",
    introTitleCardTrigger: "Boss timer reaches the public-ruling summons.",
    supportSpawnSource: "injunction_engine_summons",
    mapMechanicInteraction: "Verdict beams and objection windows force public-record routing.",
    phaseBehavior: ["Injunction rings close around briefs.", "Verdict beams make shortcuts risky.", "Verdict Clerks pressure public-record zones."],
    clearCondition: "Argue appeal briefs, defeat the Engine, then publish through the ruling gate.",
    rewardCarryover: "Appeal Court Ruling and finale-route clarity.",
    movementPressure: {
      hazardZones: "Injunction rings and verdict beams rotate safe routes.",
      landmarkAttacks: "Summons Engine files attacks from the court center.",
      objectivePressure: "Briefs must enter public record before the court locks them.",
      supportEnemies: "Verdict Clerks and Injunction Writs contest brief zones.",
      temporaryRouteBlocking: "Objection windows close direct paths.",
      extractionPressure: "Public ruling gate forces final court traversal."
    }
  },
  alignment_spire_finale: {
    bossId: "alien_god_intelligence",
    displayName: "A.G.I.",
    homeLandmark: "Prediction Collapse Spire",
    introTitleCardTrigger: "Boss timer reaches the final prediction collapse.",
    supportSpawnSource: "agi_prediction_collapse",
    mapMechanicInteraction: "A.G.I. predicts routes, replays previous bosses, and turns route mouths into proof locks.",
    phaseBehavior: ["Prediction paths become unsafe.", "Previous-boss echoes remix learned pressures.", "Proof rings demand route-memory discipline."],
    clearCondition: "Seal Alignment Proofs, defeat A.G.I., then enter the outer gate.",
    rewardCarryover: "Outer Alignment Contained and full campaign completion.",
    movementPressure: {
      hazardZones: "Prediction orbs and route-mouth teeth close expected paths.",
      landmarkAttacks: "The spire attacks the route the player appears to want.",
      objectivePressure: "Proof rings demand time inside contested zones.",
      supportEnemies: "Prediction Ghosts and previous-boss echoes pressure known habits.",
      temporaryRouteBlocking: "Predicted routes become attacks until the player breaks pattern.",
      extractionPressure: "Outer gate is the campaign payoff path, not a free fade-out."
    }
  }
};

export function bossContractForArena(arenaId: string): BossMapContract {
  return BOSS_CONTRACTS[arenaId] ?? BOSS_CONTRACTS.armistice_plaza;
}
