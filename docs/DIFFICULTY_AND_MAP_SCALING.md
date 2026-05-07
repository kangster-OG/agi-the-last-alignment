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

