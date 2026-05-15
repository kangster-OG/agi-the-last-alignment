# Enemy Mob Differentiation V1

Status: implemented as a first systemic pass on May 14, 2026.

## Goal

Enemy families should no longer feel like differently skinned contact chasers. The game remains a close-camera 2D isometric horde-survival roguelite first: enemies create movement, target-priority, route-pressure, objective, and dodging decisions without turning the screen into bullet hell.

## Role Taxonomy

`src/content/enemyRoleProfiles.ts` is the central source of truth. Every current enemy family has a profile with:

- family id, role id, readable role label, combat verb;
- movement and attack pattern;
- telegraph seconds and counterplay hint;
- intro arena and difficulty tier;
- objective, on-hit, and on-death effects;
- allowed elite affixes;
- proof counters.

V1 roles:

- `swarm_fodder`: mass bodies, low HP, build-fantasy feed.
- `rusher`: fragile fast pressure and pickup/objective disruption.
- `bruiser_blocker`: slow wide bodies that shape paths.
- `ranged_spitter`: slow aimed shots at the current player position.
- `ranged_lead_shooter`: shots aimed at player motion.
- `line_sniper`: telegraphed long-lane/censor-bar shots.
- `mortar_lobber`: delayed marked landing zones.
- `status_caster`: slow/static/redaction/burst or objective drain.
- `volatile_exploder`: contact/death explosion that can also damage enemies.
- `trail_layer`: short-lived corruption/static/redaction trail or puddle.
- `objective_jammer`: pressure on relays, records, proofs, plates, anchors, or carry lanes.
- `support_buffer`: shield/heal/haste/empower nearby enemies.
- `summoner_splitter`: adds, fragments, echoes, or split bodies.
- `elite_affixed`: modifier layer over a readable base role.

## V1 Runtime

The runtime now has shared hostile projectile and telegraph support in `src/level/LevelRunState.ts`.

- Enemy projectiles have source family/role telemetry, lifetime, collision with players, and a sparse active cap.
- Windups/telegraphs are rendered before shots.
- Hostile projectiles are skipped by the player projectile enemy-hit resolver.
- Trails, explosions, support auras, and elite markers are tracked as role effects.
- Player damage sources distinguish `enemy_projectile`, `enemy_explosion`, and `enemy_trail`.

Implemented V1 behaviors:

- `eval_wraiths`: slow aimed shooter.
- `static_skimmers`: light leading/static bolt shooter and objective pressure.
- `injunction_writs`, `verdict_clerks`, `solar_reflections`: late line/censor-bar shooters.
- `tidecall_static`: status/mortar pressure.
- `model_collapse_slimes` and `speculative_executors`: volatile explosions.
- `benchmark_gremlins` and `overfit_horrors`: support aura pressure.
- `context_rot_crabs` and `redaction_angels`: trail/status pressure.
- `memory_anchors`, `doctrine_auditors`, `static_skimmers`, `verdict_clerks`: objective-jammer pressure.
- `choirglass`, `memory_anchors`, `previous_boss_echoes`: splitter/summoner pressure.

## Campaign Escalation

Enemy complexity should ramp by role composition and timing, not raw HP/speed alone.

- Armistice: fodder/rusher/support foundation, with rare tutorial `eval_wraiths` ranged pressure after the objective loop is visible.
- Cooling: rusher pickup pressure, slow Deepform shots, and volatile luring near hazards/buoy routes.
- Transit: route-lane ranged pressure and blockers make static standing unsafe.
- Signal: `static_skimmers` are the first clear shooter/jammer pillar.
- Blackwater: Tidecall status/mortar pressure supports tower-warning and hazard-lure learning.
- Memory: Context Rot trails/status pressure and Memory Anchor jams pressure carry lanes without erasing them.
- Guardrail: Doctrine Auditor objective/status pressure pushes hold/leave rhythm.
- Glass: Solar Reflection/Choirglass ranged pressure supports prism/reflection counterplay.
- Archive: Redaction trails and Injunction line shots pressure evidence carry.
- Appeal: Verdict/appeal line pressure makes public windows feel timed.
- Finale: prediction ghosts and previous-boss echoes remix 3-4 learned rules before A.G.I.; do not spawn every role at once.

## Shooter Ladder

Shooting enemies are now a core pillar but must stay sparse and readable:

- clear windup/telegraph;
- source-backed projectile silhouettes;
- limited projectile counts;
- enough threat to force movement;
- no tiny full-screen spam under horde density;
- source/direction readable in close camera.

V1 includes aimed shots, leading shots, line/censor-bar shots, delayed mortar markers, status projectiles, and objective-targeting pressure. V2 can add shotgun cones, elite bullet variants, build-based reflection, and richer biome session tables.

## Elite Affixes

Elites are a lightweight modifier layer over base roles:

- `overclocked`: faster cadence, amber marker.
- `shielded`: temporary one-hit protection, blue/white marker.
- `redacted`: short redaction trail.
- `recursive`: splits into smaller weak versions.
- `volatile`: death explosion.
- `static`: brief slow or burst-charge drain.
- `commanding`: buffs nearby enemies until killed.

Early levels avoid frequent elites. Mid levels use one affix at a time at low frequency. Late levels can appear more often but should still be readable and sometimes drop existing rewards rather than new currencies.

## Source-Backed VFX

Enemy role VFX uses source-backed art:

- ChatGPT Images source board: `assets/concepts/chatgpt_refs/enemy_role_vfx_v1/`.
- PixelLab/source refinement provenance: `assets/concepts/pixellab_refs/enemy_role_vfx_v1/`.
- Runtime atlas: `assets/sprites/effects/enemy_role_vfx_v1.png`.
- Proof contact: `docs/proof/enemy-role-vfx-v1/enemy-role-vfx-v1-contact.png`.

The packer `scripts/assets/pack-enemy-role-vfx-v1.py` mechanically repacks approved source-backed effect cells only. It does not draw expressive production art with code.

## Telemetry And Proofs

`window.render_game_to_text()` exposes:

- `enemyRolesSeen`;
- `rangedFamiliesSeen`;
- `enemyProjectilesFired`;
- `enemyProjectilesActive`;
- `enemyProjectileHits`;
- `enemyProjectileDodges`;
- `enemyExplosionsTriggered`;
- `enemyTrailSeconds`;
- `supportAuraSeconds`;
- `objectiveJamSeconds`;
- `eliteAffixesSeen`;
- `eliteKills`;
- `preBossEnemyRolePressureSeconds`;
- `currentPhaseEnemyRoleMix`;
- active telegraph/trail/explosion counts.

`npm run proof:enemy-roles` runs `scripts/proof/enemy-role-static.mjs` and asserts profile completeness, campaign role coverage, shooter escalation by Signal, mid-campaign volatile/trail/support/jammer coverage, late ranged/objective/elite coverage, telemetry wiring, hostile projectile runtime wiring, and source-backed VFX loader registration.

Route proofs now include enemy-role assertions at the existing pre-boss pressure captures. These should stay focused on stable telemetry, not single-frame projectile timing.

## V2 Ideas

Do not implement these until V1 is stable in play:

- enemy weakpoints;
- directional shield enemies;
- grabbers/displacers;
- terrain builders;
- projectile reflection/counterplay builds;
- elite reward chests;
- biome-specific enemy spawn session tables;
- dynamic director choosing role pressure based on player build strength.
