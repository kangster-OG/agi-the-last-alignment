# Difficulty and Map Scaling Contract

This document locks the post-Armistice difficulty direction. Armistice Plaza is no longer a simple timer-survival prototype; it is the first reference contract for how levels should scale across the full game.

## Armistice Baseline

Armistice Plaza is the reference difficulty baseline for future full levels:

- the run has a meaningful minimum duration, currently 120 seconds;
- the boss arrives during the run, not only after everything else is over;
- victory requires the contract timer and the boss clear;
- kills alone cannot bypass the boss;
- optional objectives add rewards and pressure, but they do not replace the core clear;
- early drafts establish a build quickly enough to be fun;
- late drafts slow down so power spikes feel earned;
- route contracts and Eval Protocols can make the same map meaningfully harder without changing autocombat.

Future levels should not be balanced as "survive until timer expires." They should be balanced as contracts with a finish condition, a pressure curve, and a proof of mastery.

## Difficulty Layers

Use layered difficulty instead of a flat Easy/Normal/Hard stat ladder.

### Baseline Contract

The default campaign version of a map. It should teach the map's identity, prove its main objective, and feel fair without requiring perfect build RNG.

Baseline Contract tuning owns:

- minimum run duration;
- first boss/event timing;
- clear condition;
- baseline enemy families;
- first three draft timings;
- basic objective reward;
- summary/camp carryover promise.

### Eval Pressure

Adversarial Eval Protocols change what the run tests. They should alter behavior, pacing, or risk patterns before they inflate raw stats.

Good Eval Pressure examples:

- more objective attackers;
- boss variants;
- smaller context window or pickup range pressure;
- new spawn-region emphasis;
- altered draft bias;
- harsher route consequences;
- extra proof-token rewards for clears.

### Route Risk

Route contracts are pre-run strategic risk/reward. They should make the same map feel meaningfully different while preserving the map's core identity.

Good Route Risk examples:

- safer stabilization route with modest rewards;
- Faction Relay route with higher enemy pressure and better proof-token rewards;
- Resource Cache route with richer economy and pickup risk;
- Unverified Shortcut with shorter path, sharper hazards, and secret pressure.

### World Tier

Campaign progression scaling. Later regions should add new demands rather than merely multiplying health bars.

World Tier should scale:

- enemy family complexity;
- number of simultaneous pressure sources;
- objective complexity;
- hazard density;
- boss phase count;
- recovery scarcity;
- how punishing it is to ignore optional objectives.

### Mastery Variant

Post-clear or high-risk versions of maps. These are for badges, secrets, harder routes, challenge clears, and long-term roguelite depth.

Mastery Variants may change:

- clear timer;
- boss phase order;
- available drafts;
- healing/shard economy;
- hazard uptime;
- optional objective count;
- route memory consequences.

## Difficulty Levers

Rotate difficulty levers so the game does not go stale. A level should usually emphasize two or three levers, not all of them at once.

### Density Pressure

More enemies, faster spawns, larger bursts, and higher caps. This is the simplest horde-survival lever and should be used carefully so it does not flatten map identity.

### Spatial Pressure

The map changes where it is safe to stand. Use hazards, closing lanes, corrupted ground, boss zones, safe islands, and moving routes.

Best for Hazard Ecology, Route / Transit, Boss-Hunt, and Puzzle-Pressure maps.

### Objective Pressure

The player must split attention between survival and a goal: repair anchors, hold relays, carry memory, extract records, protect systems, or choose which route asset to abandon.

Best for Defense / Holdout, Expedition / Recovery, Faction Relay, and Open Survival District maps.

### Boss Pressure

The boss is a mid-run actor, a route consequence, a final proof of mastery, or all three. Bosses should gain identity through mechanics and presentation, not only health.

Boss Pressure can scale through:

- earlier arrival;
- stronger HP under route/eval pressure;
- new hazard patterns;
- objective attacks;
- phase gates;
- map corruption;
- adds tied to boss landmarks.

### Draft Pressure

The upgrade economy changes how quickly the build comes online. Early drafts should start the build; later drafts should not arrive so fast that they erase the difficulty curve.

Draft Pressure can scale through:

- slower late XP requirements;
- route-biased draft tags;
- fewer safe pickup windows;
- higher value for synergy thresholds;
- Eval protocols that change draft priorities.

### Economy Pressure

Shards, pickups, proof tokens, healing, burst charge, and objective rewards become harder to secure.

Good Economy Pressure examples:

- pickup-range tax enemies;
- dangerous pickup clusters;
- optional objectives rewarding burst or repair power instead of XP;
- route rewards that trade safety for future power.

### Information Pressure

The player makes decisions with partial or adversarial information. This is especially on-theme for AGI.

Good Information Pressure examples:

- route previews with hidden consequences;
- fake safe paths;
- Eval warnings that are accurate but incomplete;
- boss tells that become clearer after mastery;
- camp memory explaining why the last run changed.

### Time Pressure

Use time as a contract, not just a countdown. The player may need to stabilize enough before the boss, extract before collapse, or survive until an external system locks.

Good Time Pressure examples:

- pre-boss prep window;
- escape window after objective completion;
- boss rage timer;
- timed route gates;
- optional anchor before pressure spike.

### Co-op Pressure

The game should eventually support 1-4 players. Co-op pressure should work solo through Co-Mind support and scale naturally with real players later.

Good Co-op Pressure examples:

- split holds;
- revive windows;
- simultaneous anchors;
- rescue clauses;
- lane defense roles;
- objective carry/protect pairing.

### Route Memory Pressure

The campaign remembers what the player stabilized, ignored, exploited, or failed.

Good Route Memory Pressure examples:

- ignored anchors destabilize future route choices;
- clean clears open safer roads;
- risky Eval clears unlock stronger rewards;
- repeated failures create camp advice or alternate contracts;
- mastery variants unlock after route memory proves competence.

## Map-Style Difficulty Emphasis

Each map kind should rotate its primary difficulty emphasis:

| Map kind | Primary pressure | Secondary pressure | Typical proof of mastery |
|---|---|---|---|
| Open Survival District | Density + Objective | Boss + Route Risk | Clear timer and boss while stabilizing optional objectives |
| Hazard Ecology | Spatial | Economy + Boss | Navigate unsafe terrain while keeping enough build momentum |
| Route / Transit | Time + Spatial | Information + Density | Make route decisions under pressure and reach/hold the correct lane |
| Signal Coast / Route Edge | Spatial + Time | Objective + Boss | Cross tide/static lanes during clear signal windows while relay progress stays defended |
| Blackwater Beacon / Split-Pressure | Objective + Boss | Spatial + Time | Retune split antenna arrays while reading tidal lanes, Signal Tower warnings, Tidecall Static, and Maw pressure |
| Guardrail Forge / Defense-Holdout | Objective | Density + Co-op | Calibrate forge relays through hold/leave timing, safe hold plates, overload lanes, and Doctrine Auditor interference |
| Glass Sunfield / Solar-Prism Shade Routing | Spatial + Time | Objective + Boss | Align sun lenses while reading shade pockets, exposed glass lanes, Solar Reflection pressure, and Wrong Sunrise beams |
| Defense / Holdout | Objective | Density + Co-op | Protect a system through waves and boss interference |
| Expedition / Recovery | Objective + Information | Economy + Time | Recover/carry enough records and extract under escalating danger |
| Boss-Hunt | Boss + Information | Spatial + Objective | Flush out, weaken, and defeat a boss through map actions |
| Puzzle-Pressure | Spatial + Objective | Time + Density | Solve a combat-readable map problem while surviving interruption |
| Micro-Run Challenge | Time + Route Risk | Any one sharp modifier | Complete a short high-risk contract for secrets or shortcuts |

## Implementation Rules

- Do not make later maps harder only by raising enemy HP.
- Do not solve larger maps by zooming the camera out.
- Keep autocombat intact; difficulty comes from movement, objectives, route choice, draft pressure, boss mechanics, and map pressure.
- Each new map should declare its difficulty layers and top pressure levers before runtime work starts.
- Each new map proof should validate its identity through telemetry and screenshots.
- Production art for new maps must wait until gameplay identity is worth preserving, then follow the Armistice accepted art baseline and asset-source rules.

## Signal Coast Lock

Signal Coast's lock pass keeps expedition persistence meaningful without treating expedition power as uncapped extra players in the horde director. Expedition power still scales objective, hazard, and Lighthouse pressure, but Signal director population uses a capped contribution so the close-camera route remains survivable.

Signal-specific pressure levers now have counterplay:

- clear signal windows: faster relay progress and modest Burst tempo;
- Static Skimmers: relay jammers, tuned to pressure rather than erase progress;
- relay decay: present when the player leaves or lets jammers sit, but low enough for route decisions to matter;
- Lighthouse: boss/event pressure through sweeps, tide pulses, and limited skimmer waves;
- route-edge passives: Relay Phase Lock, Static Skimmer Net, Shoreline Stride, and Lighthouse Countertone.

## Blackwater Beacon Lock

Blackwater Beacon starts from the latest Signal-strength expedition state rather than a plausible hand seed. The current proof seed restores LV10, 915 XP, nine carried patches, completed maps through `signal_coast`, Signal Relays 3/3 carryover, and expedition power 21.18 before launching Blackwater through the real route/overworld flow.

Blackwater-specific tuning keeps the carried build powerful without making the fourth level free:

- arena target: 148 seconds;
- Maw Below Weather spawn: 42 seconds;
- Maw HP base: 4600 before expedition scaling;
- objective pressure: three split antenna arrays with progress/decay, Tidecall Static interruption, Signal Tower warning windows, and Blackwater Signal Key extraction;
- hazard pressure: tidal lanes, static fields, antenna beams, and Maw wave/static calls stay telemetry-visible in the close camera.

Current audited proof summaries:

| Map | Time | Objective | Level | Patches | Power |
|---|---:|---|---:|---:|---:|
| Armistice Plaza | 181s | Treaty Anchors 1/3 | 7 | 6 | 14.62 |
| Cooling Lake Nine | 132s | Server Buoys 2/3 | 7 | 6 | 13.17 |
| Transit Loop Zero | 95s | Route Platforms 3/3 | 9 | 8 | 18.61 |
| Signal Coast | 140s | Signal Relays 3/3 | 10 | 9 | 21.18 |
| Blackwater Beacon | 149s | Antenna Arrays 3/3 | 11 | 10 | 23.75 |

Reading: the carried post-Signal build enters Blackwater with enough power to survive and clear, but the map asks for route decisions and split attention instead of raw enemy HP inflation. If future playtests feel too lethal, tune Blackwater hazard cadence, Tidecall jam count, and Maw call frequency before touching camera zoom or removing expedition persistence.

## Memory Cache Lock

Memory Cache starts from Blackwater's actual carryover, not from a fresh build or a plausible hand seed. The proof seed matches the latest `docs/proof/blackwater-beacon-graybox/11-summary-carryover.json` shape:

Post-Blackwater entry shape:

- LV 11;
- 10 carried patches;
- expedition power 23.75;
- completed maps through `blackwater_beacon`;
- Blackwater Signal Key secret/reward available;
- Act 01 ledger complete.

Memory Cache-specific tuning keeps that build powerful while still making the fifth level ask a new question:

- arena target: 156 seconds before recovery/extraction tail;
- objective pressure: four Memory Records in separate evidence rooms, progress decay when left or corrupted, and Memory Anchor jams;
- route pressure: safe recall pockets are slower but preserve progress, while redacted shortcuts are faster and invite corruption/Context Rot pressure;
- boss/event pressure: Memory Curator redaction locks, Context Rot calls, and Curator vault recovery;
- hazard pressure: corrupted archive lanes, redaction fields, risky shortcut zones, and extraction index pressure remain telemetry-visible in the close camera.

Current audited proof summaries:

| Map | Time | Objective | Level | Patches | Power |
|---|---:|---|---:|---:|---:|
| Armistice Plaza | 181s | Treaty Anchors 1/3 | 7 | 6 | 14.62 |
| Cooling Lake Nine | 132s | Server Buoys 2/3 | 7 | 6 | 13.17 |
| Transit Loop Zero | 95s | Route Platforms 3/3 | 9 | 8 | 18.61 |
| Signal Coast | 140s | Signal Relays 3/3 | 10 | 9 | 21.18 |
| Blackwater Beacon | 149s | Antenna Arrays 3/3 | 11 | 10 | 23.75 |
| Memory Cache | 166s | Memory Records 4/4 | 12 | 11 | 26.32 |

Reading: the carried post-Blackwater build enters Memory Cache strong and clears without unavoidable death, but the map spends that power through route choice, corruption management, evidence recovery, Curator pressure, and extraction risk. If future playtests feel too lethal, tune Context Rot interruption, Memory Anchor jam rate, redaction field uptime, or Curator call cadence before touching camera zoom or deleting expedition persistence.

## Post-Memory Level Scaling

Guardrail Forge was balanced from Memory Cache's actual carryover, not from a fresh build or a plausible hand seed. If Memory Cache proof output changes later, use the latest `docs/proof/memory-cache-recovery/11-summary-carryover.json` or rerun `npm run proof:memory-cache-recovery` before retuning Guardrail.

For this Faction Relay / Guardrail Forge branch, difficulty answers that power through hold/leave timing, doctrine-specific waves, relay durability, calibration choices, and build-bias rewards. It should not reuse Memory Cache evidence recovery or Blackwater split-pressure under different labels.

## Guardrail Forge Lock

Guardrail Forge starts from Memory Cache's actual carryover, not from a fresh build or a plausible hand seed. The proof seed matches the latest `docs/proof/memory-cache-recovery/11-summary-carryover.json` shape:

Post-Memory entry shape:

- LV 12;
- 11 carried patches;
- two activated synergies;
- expedition power 26.32;
- completed maps through `memory_cache_001`;
- Recovered Route Memory secret/reward available.

Guardrail Forge-specific tuning keeps that build powerful while still making the sixth level ask a new question:

- clear target: about 160 seconds with extraction tail;
- objective pressure: four Forge Relays that reward safe hold plates, decay when abandoned, and jam under Doctrine Auditor pressure;
- route pressure: safe hold plates mitigate pressure, calibration windows accelerate progress, and overload lanes punish greedy pathing without making recovery impossible;
- boss/event pressure: Doctrine Auditor drones plus a large Doctrine Auditor audit-press scaffold that stays readable before extraction;
- hazard pressure: overload lanes, doctrine jams, audit press locks, and quench extraction pressure remain telemetry-visible in the close camera.

Current audited proof summaries:

| Map | Time | Objective | Level | Patches | Power |
|---|---:|---|---:|---:|---:|
| Armistice Plaza | 181s | Treaty Anchors 1/3 | 7 | 6 | 14.62 |
| Cooling Lake Nine | 132s | Server Buoys 2/3 | 7 | 6 | 13.17 |
| Transit Loop Zero | 95s | Route Platforms 3/3 | 9 | 8 | 18.61 |
| Signal Coast | 140s | Signal Relays 3/3 | 10 | 9 | 21.18 |
| Blackwater Beacon | 149s | Antenna Arrays 3/3 | 11 | 10 | 23.75 |
| Memory Cache | 166s | Memory Records 4/4 | 12 | 11 | 26.32 |
| Guardrail Forge | 160s | Forge Relays 4/4 | 13 | 12 | 28.89 |

Reading: the carried post-Memory build enters Guardrail Forge strong and clears without unavoidable death, but the map spends that power through hold/leave timing, overload routing, relay jams, faction pressure, Doctrine Auditor boss pressure, and quench extraction. If future playtests feel too lethal, tune Doctrine Auditor jam cadence, overload damage, boss call frequency, or relay decay before touching camera zoom or deleting expedition persistence.

## Glass Sunfield Lock

Glass Sunfield starts from Guardrail Forge's actual carryover, not from a fresh build or a plausible hand seed. The proof seed matches the latest `docs/proof/faction-relay-holdout/11-summary-carryover.json` shape:

Post-Guardrail entry shape:

- LV 13;
- 12 carried patches;
- two activated synergies;
- expedition power 28.89;
- completed maps through `guardrail_forge`;
- Calibrated Guardrail Doctrine secret/reward available.

Glass Sunfield-specific tuning keeps that build powerful while still making the seventh level ask a new question:

- clear target: about 180 seconds with prism-gate extraction tail;
- objective pressure: four Sun Lenses that reward shade routing, lens timing, and movement through exposed glass lanes;
- route pressure: shade pockets are safer but slower, exposed mirror lanes are faster but build exposure and invite Solar Reflection/Choirglass pressure;
- boss/event pressure: Wrong Sunrise beams and reflection calls stay readable long enough for proof captures before extraction;
- hazard pressure: exposed glass burn, reflection jam pulses, prism windows, and prism-gate pressure remain telemetry-visible in the close camera.

Current audited proof summaries:

| Map | Time | Objective | Level | Patches | Power |
|---|---:|---|---:|---:|---:|
| Armistice Plaza | 181s | Treaty Anchors 1/3 | 7 | 6 | 14.62 |
| Cooling Lake Nine | 132s | Server Buoys 2/3 | 7 | 6 | 13.17 |
| Transit Loop Zero | 95s | Route Platforms 3/3 | 9 | 8 | 18.61 |
| Signal Coast | 140s | Signal Relays 3/3 | 10 | 9 | 21.18 |
| Blackwater Beacon | 149s | Antenna Arrays 3/3 | 11 | 10 | 23.75 |
| Memory Cache | 166s | Memory Records 4/4 | 12 | 11 | 26.32 |
| Guardrail Forge | 160s | Forge Relays 4/4 | 13 | 12 | 28.89 |
| Glass Sunfield | 182s | Sun Lenses 4/4 | 13 | 12 | 29.74 |

Reading: the carried post-Guardrail build enters Glass Sunfield strong and clears without unavoidable death, but the map spends that power through route exposure, shade-pocket decisions, lens timing, reflection pressure, Wrong Sunrise boss pressure, and prism extraction. If future playtests feel too lethal, tune exposure damage, Solar Reflection jam cadence, Choirglass spawn cadence, Wrong Sunrise beam frequency, or lens decay before touching camera zoom or deleting expedition persistence.

## Post-Glass Level Scaling

Archive/Court was balanced from Glass Sunfield's actual carryover, not from a fresh build or a plausible hand seed. If Glass proof output changes later, use the latest `docs/proof/glass-sunfield-prism/12-summary-carryover.json` or rerun `npm run proof:glass-sunfield-prism` before retuning Archive/Court.

For Archive/Court, difficulty should answer that power through redaction-safe evidence routing, court-writ pressure, appeal pages, witness/seal props, Redaction Angel / Injunction Writ pressure, and Redactor Saint or Injunction Engine event pressure. It should not reuse Glass shade/exposure routing, Guardrail relay hold timing, or Memory evidence recovery under different labels.

## Archive/Court Lock

Archive of Unsaid Things starts from Glass Sunfield's actual carryover. The proof seed matches the latest `docs/proof/glass-sunfield-prism/12-summary-carryover.json` shape:

Post-Glass entry shape:

- LV 13;
- XP 1774;
- 12 carried patches;
- two activated synergies;
- expedition power 29.74;
- completed maps through `glass_sunfield`;
- Glass Sunfield Prism secret/reward available.

Archive/Court-specific tuning keeps that build powerful while still making the eighth level ask a new question:

- clear target: about 190-200 seconds with court writ gate extraction tail;
- objective pressure: four Evidence Writs that reward safe evidence routing, appeal-window timing, and redaction-aware movement;
- route pressure: appeal windows and safer paths are readable but contested, while redaction fields and writ storms punish greedy shortcuts without making recovery impossible;
- boss/event pressure: Redaction Angel / Injunction Writ pressure plus a large Redactor Saint scaffold that remains live and readable in proof capture before extraction;
- hazard pressure: redaction seconds, writ storm seconds, appeal window timing, and court gate pressure remain telemetry-visible in the close camera.

Current audited proof summaries:

| Map | Time | Objective | Level | Patches | Power |
|---|---:|---|---:|---:|---:|
| Armistice Plaza | 181s | Treaty Anchors 1/3 | 7 | 6 | 14.62 |
| Cooling Lake Nine | 132s | Server Buoys 2/3 | 7 | 6 | 13.17 |
| Transit Loop Zero | 95s | Route Platforms 3/3 | 9 | 8 | 18.61 |
| Signal Coast | 140s | Signal Relays 3/3 | 10 | 9 | 21.18 |
| Blackwater Beacon | 149s | Antenna Arrays 3/3 | 11 | 10 | 23.75 |
| Memory Cache | 166s | Memory Records 4/4 | 12 | 11 | 26.32 |
| Guardrail Forge | 160s | Forge Relays 4/4 | 13 | 12 | 28.89 |
| Glass Sunfield | 182s | Sun Lenses 4/4 | 13 | 12 | 29.74 |
| Archive of Unsaid Things | 198s | Evidence Writs 4/4 | 14 | 13 | 32.31 |

Reading: the carried post-Glass build enters Archive/Court strong and clears without unavoidable death, but the map spends that power through redaction fields, appeal-window timing, writ-storm pressure, Redaction Angel / Injunction Writ interruption, Redactor Saint calls, and court writ gate extraction. If future playtests feel too lethal, tune redaction field damage, writ storm cadence, Redaction Angel spawns, Redactor Saint call frequency, or evidence writ decay before touching camera zoom or deleting expedition persistence.

## Post-Archive Level Scaling

Appeal Court Ruins was balanced from Archive/Court's actual carryover, not from a fresh build or a plausible hand seed. If Archive/Court proof output changes later, use the latest `docs/proof/archive-court-redaction/12-summary-carryover.json` or rerun `npm run proof:archive-court-redaction` before retuning Appeal Court.

For Appeal Court Ruins, difficulty should answer that power through public-ruling route pressure, appeal argument objectives, court visibility risk, preserved-evidence advantages, verdict pressure families, and a boss/event that makes the Archive Court Writ matter. It should not reuse Archive evidence preservation, Glass shade routing, Guardrail relay hold timing, or Memory record recovery under different labels.

Serial `/goal` workflow result:

- the remaining full-game levels were finished one at a time;
- each level was seeded from the previous level's latest real proof summary;
- gameplay graybox/proof/tuning came before source art;
- every new production-art lock used ChatGPT Images plus PixelLab source contribution;
- full regression, progress/current-state/map-difficulty docs, manifest, provenance, source READMEs, and proof artifacts should stay updated for any future regression fix or release-candidate polish.

## Appeal Court Ruins Lock

Appeal Court Ruins starts from Archive/Court's actual carryover. The proof seed matches the latest `docs/proof/archive-court-redaction/12-summary-carryover.json` shape:

Post-Archive entry shape:

- LV 14;
- XP 1513;
- 13 carried patches;
- two activated synergies;
- expedition power 32.31;
- completed maps through `archive_of_unsaid_things`;
- Archive Court Writ secret/reward available.

Appeal Court-specific tuning keeps that build powerful while still making the ninth level ask a new question:

- clear target: about 190 seconds with public-ruling gate extraction tail;
- objective pressure: four Appeal Briefs that reward public-record routing, objection-window timing, and refusing verdict-beam shortcuts at the wrong moment;
- route pressure: public-record zones are safer but slower, while verdict beams and injunction rings contest greedy lines without making recovery impossible;
- boss/event pressure: Verdict Clerk / Injunction Writ pressure plus a large Injunction Engine scaffold that remains live and readable in proof capture before extraction;
- hazard pressure: verdict beam seconds, objection window seconds, injunction ring seconds, and ruling gate pressure remain telemetry-visible in the close camera.

Current audited proof summaries:

| Map | Time | Objective | Level | Patches | Power |
|---|---:|---|---:|---:|---:|
| Armistice Plaza | 181s | Treaty Anchors 1/3 | 7 | 6 | 14.62 |
| Cooling Lake Nine | 132s | Server Buoys 2/3 | 7 | 6 | 13.17 |
| Transit Loop Zero | 95s | Route Platforms 3/3 | 9 | 8 | 18.61 |
| Signal Coast | 140s | Signal Relays 3/3 | 10 | 9 | 21.18 |
| Blackwater Beacon | 149s | Antenna Arrays 3/3 | 11 | 10 | 23.75 |
| Memory Cache | 166s | Memory Records 4/4 | 12 | 11 | 26.32 |
| Guardrail Forge | 160s | Forge Relays 4/4 | 13 | 12 | 28.89 |
| Glass Sunfield | 182s | Sun Lenses 4/4 | 13 | 12 | 29.74 |
| Archive of Unsaid Things | 198s | Evidence Writs 4/4 | 14 | 13 | 32.31 |
| Appeal Court Ruins | 190s | Appeal Briefs 4/4 | 15 | 14 | 36.03 |

Reading: the carried post-Archive build enters Appeal Court strong and clears without unavoidable death, but the map spends that power through public-record route timing, verdict beams, objection windows, injunction rings, Verdict Clerk / Injunction Writ interruption, Injunction Engine calls, and public-ruling gate extraction. If future playtests feel too lethal, tune verdict beam damage, injunction ring cadence, Verdict Clerk spawns, Injunction Engine call frequency, or Appeal Brief decay before touching camera zoom or deleting expedition persistence.

## Post-Appeal Finale Scaling

The final authored local full-game level was balanced from Appeal Court Ruins' actual carryover, not from a fresh build or plausible hand seed. If Appeal Court proof output changes later, use the latest `docs/proof/appeal-court-ruins/12-summary-carryover.json` or rerun `npm run proof:appeal-court-ruins` before retuning the finale seed.

For `alignment_spire_finale`, difficulty should answer that power through final route synthesis, public-ruling/Archive carryover, multi-zone AGI pressure, final boss readability, and extraction/ending state proof. It should not reuse Appeal's public brief loop, Archive evidence preservation, Glass shade routing, Guardrail relay hold timing, or Memory record recovery under different labels.

## Outer Alignment Finale Lock

Outer Alignment Finale starts from Appeal Court Ruins' actual carryover. The proof seed matches the latest `docs/proof/appeal-court-ruins/12-summary-carryover.json` shape:

Post-Appeal entry shape:

- LV 15;
- XP 786;
- 14 carried patches;
- three activated synergies;
- expedition power 36.03;
- completed maps through `appeal_court_ruins`;
- Appeal Court Ruling secret/reward available;
- 12 Proof Tokens.

Outer Alignment-specific tuning keeps that build powerful while still making the finale ask its own question:

- clear target: about 300-315 seconds with final outer-gate extraction tail;
- objective pressure: four Alignment Proofs that reward final route synthesis, proof-ring timing, and crossing route-mouth hazards at the right moment;
- route pressure: proof-ring spaces and safer lanes are readable but contested, while prediction-orb clusters and route-mouth collapses punish greedy shortcuts without making recovery impossible;
- boss/event pressure: Prediction Ghosts, previous-boss echoes, and A.G.I. calls stay live and readable before the finale extraction;
- hazard pressure: route-mouth collapse seconds, prediction-orb hazard hits, proof-ring state, previous-boss echo pressure, and outer-gate pressure remain telemetry-visible in the close camera.

Current audited proof summaries:

| Map | Time | Objective | Level | Patches | Power |
|---|---:|---|---:|---:|---:|
| Armistice Plaza | 181s | Treaty Anchors 1/3 | 7 | 6 | 14.62 |
| Cooling Lake Nine | 132s | Server Buoys 2/3 | 7 | 6 | 13.17 |
| Transit Loop Zero | 95s | Route Platforms 3/3 | 9 | 8 | 18.61 |
| Signal Coast | 140s | Signal Relays 3/3 | 10 | 9 | 21.18 |
| Blackwater Beacon | 149s | Antenna Arrays 3/3 | 11 | 10 | 23.75 |
| Memory Cache | 166s | Memory Records 4/4 | 12 | 11 | 26.32 |
| Guardrail Forge | 160s | Forge Relays 4/4 | 13 | 12 | 28.89 |
| Glass Sunfield | 182s | Sun Lenses 4/4 | 13 | 12 | 29.74 |
| Archive of Unsaid Things | 198s | Evidence Writs 4/4 | 14 | 13 | 32.31 |
| Appeal Court Ruins | 190s | Appeal Briefs 4/4 | 15 | 14 | 36.03 |
| Outer Alignment Finale | 312s | Alignment Proofs 4/4 | 16 | 15 | 39.75 |

Reading: the carried post-Appeal build enters the finale very strong and clears without unavoidable death, but the map spends that power through route-mouth navigation, proof-ring commitments, prediction-orb pressure, previous-boss echoes, A.G.I. boss pressure, and outer-gate extraction. If future playtests feel too lethal, tune prediction-orb damage, route-mouth collapse cadence, previous-boss echo count, or A.G.I. call frequency before touching camera zoom or deleting expedition persistence.
