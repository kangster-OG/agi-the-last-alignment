# Milestone 32 Implementation Plan: Build Kits

## Purpose

Turn the existing six Alignment Frames and eight frontier co-minds into implementation-ready build kits without changing persistence/export-code boundaries, server authority, route rewards, runtime combat code, or proof scripts in this planning pass.

This plan refines `docs/MILESTONE_32_CLASSES_COMINDS_AND_PARTY_BUILDS.md` into concrete data tables for a future implementation thread. It intentionally does not add every Creative Bible class. Milestone 32 should complete the currently defined frame/co-mind matrix first, then leave Redline Surgeon and Prism Gunner as follow-up expansion candidates.

## Existing Source Facts

- `src/content/classes.ts` already defines six selectable frame IDs and their `startingWeaponId` values.
- `src/content/factions.ts` already defines all eight co-mind IDs and intended upgrade pool IDs.
- `src/gameplay/upgrades.ts` already applies faction passives through stat hooks and realizes a limited subset of upgrade effects.
- `src/metaprogression/onlineMetaProgression.ts` already gates frames, co-minds, and upgrade seeds from durable route reward IDs.
- Local co-op already has 1-4 player runtime slots in `src/sim/consensusCell.ts`, but snapshots do not yet include kit telemetry.
- Online co-op already has server-authored role-pressure and Recompile Ally, but role labels are derived by helper logic and kit bonuses are not yet data-driven.
- Online persistence/export remains route/profile-only. Selected class/faction IDs and active run kit effects must remain transient selections, not imported durable authority.

## BuildKit Proof Shape

Recommended proof-visible shape for solo, local co-op, and online snapshots:

```ts
type BuildKitRole = "runner" | "cover" | "support" | "harrier" | "duelist";

interface BuildKitProof {
  schemaVersion: 1;
  classId: string;
  factionId: string;
  classRole: BuildKitRole;
  factionRoleBias: BuildKitRole[];
  resolvedRole: BuildKitRole;
  startingWeaponId: string;
  passiveIds: string[];
  partyAuraIds: string[];
  recompileModifiers: {
    radiusBonus: number;
    requiredSecondsScale: number;
    reviveHpBonus: number;
    postReviveSpeedSeconds: number;
    guardDamageReduction: number;
  };
  rolePressureAffinity: string[];
  synergyId: string | null;
  effectScopes: {
    solo: string[];
    localCoop: string[];
    online: string[];
  };
  hookStatus: Array<{
    id: string;
    kind: "weapon" | "passive" | "party_aura" | "upgrade" | "synergy";
    status: "present" | "new_needed";
  }>;
}
```

Implementation note: use `resolvedRole` for server-owned online role-pressure rules. Use `classRole` and `factionRoleBias` for UI/proof explanation.

## Frame Kit Table

| Frame ID | Role | Starting weapon ID | Frame passive IDs | Party aura IDs | Recompile modifier | Role-pressure affinities | Solo effect | Local co-op effect | Online effect |
|---|---|---|---|---|---|---|---|---|---|
| `accord_striker` | `runner` | `refusal_shard` | `passive.frame.accord_striker.shard_routing`, `passive.frame.accord_striker.scout_pickups` | none | `postReviveSpeedSeconds: 1.5` after reviving or being revived | `split_anchor`, `route_objective`, `pickup_economy`, `regroup_speed` | Fastest objective routing, strongest pickup economy, safest starter. | Scout/controller for remote objective anchors while simulated peers hold pressure. | Small split-anchor grace while moving above speed threshold; no direct revive stat bonus. |
| `bastion_breaker` | `cover` | `safety_cannon` | `passive.frame.bastion_breaker.anchor_plating`, `passive.frame.bastion_breaker.knockback_frame` | `aura.party.bastion_breaker.cover_shelter` | `reviveHpBonus: 0.1` as temporary HP when Bastion is reviver | `cover_anchor`, `hold_under_damage`, `knockback_control`, `objective_shelter` | Lower speed, stronger HP/armor margin, enemy displacement near objectives. | Peers near Bastion get a tiny shelter aura so simulated slots do not collapse instantly. | Preferred cover-anchor holder; reduced incoming damage while holding. |
| `drone_reaver` | `harrier` | `fork_drone` | `passive.frame.drone_reaver.autonomous_forks`, `passive.frame.drone_reaver.remote_tagging` | `aura.party.drone_reaver.guardian_fork` | `guardDamageReduction: 0.12` for reviver/downed ally while a guard drone is active | `remote_guard`, `harass`, `pet_screen`, `split_holder_support` | Off-angle drone coverage and swarm-edge denial. | Drones tag enemies threatening simulated peers and keep shared XP flowing. | Drone pings protect split holders and make remote pressure readable. |
| `signal_vanguard` | `support` | `signal_pulse` | `passive.frame.signal_vanguard.recompile_discipline`, `passive.frame.signal_vanguard.pulse_control` | `aura.party.signal_vanguard.recovery_pulse` | `radiusBonus: 0.25`, `requiredSecondsScale: 0.9` when Signal is reviver | `recompile`, `regroup_recovery`, `support_anchor`, `shield_pulse` | Safest objective-control frame with lower raw kill speed. | Nearby peers receive small periodic shield/recovery pulse. | Support anchors and Recompile Ally become more forgiving when Signal is nearby. |
| `vector_interceptor` | `runner` | `vector_lance` | `passive.frame.vector_interceptor.predicted_lane`, `passive.frame.vector_interceptor.pathing_vector` | none | no heal bonus; future pathing vector can improve ally routeing to downed player | `lane_control`, `split_anchor`, `objective_telemetry`, `mark_priority` | Strongest lane-clear frame for corridors and route objectives. | Prediction marks slow/soften enemies in peer lanes. | Reveals least-covered role-pressure anchor and marks boss-gate targets. |
| `nullbreaker_ronin` | `duelist` | `null_blade` | `passive.frame.nullbreaker_ronin.elite_pressure`, `passive.frame.nullbreaker_ronin.appeal_cut` | none | no baseline revive help; when revived gets short boss/elite damage window | `boss_gate`, `elite_disruptor`, `duel`, `high_risk` | Fastest elite/boss pressure, riskiest horde control. | Deletes priority threats around peers but cannot babysit the whole cell. | Bonus damage to boss-gate threats and high-value disruptors; weak support baseline. |

## Co-Mind Kit Table

| Co-mind ID | Role bias | Passive IDs | Party aura IDs | Recompile modifier | Role-pressure affinities | Solo effect | Local co-op effect | Online effect |
|---|---|---|---|---|---|---|---|---|
| `openai_accord` | `runner`, `support` | `passive.comind.openai.adaptive_patch`, `passive.comind.openai.context_window` | `aura.party.openai.draft_clarity` | none baseline; refusal upgrades may protect revivers | `pickup_economy`, `draft_reliability`, `refusal_shield`, `route_objective` | Reroll, pickup range, flexible refusal shielding. | Shared draft reliability keeps starter cells forgiving. | Adds party draft clarity/proof text only; no imported save authority. |
| `anthropic_safeguard` | `cover`, `support` | `passive.comind.anthropic.guardrail_plating`, `passive.comind.anthropic.containment_policy` | `aura.party.anthropic.containment_field` | `radiusBonus: 0.15`, `reviveHpBonus: 0.08` | `cover_anchor`, `recompile`, `containment`, `hold_under_damage` | Survivability and containment zones. | Boosts peer survival near the player. | Improves cover-anchor holding and Recompile Ally reliability. |
| `google_deepmind_gemini` | `runner`, `duelist` | `passive.comind.deepmind.precision_analysis`, `passive.comind.deepmind.boss_observation` | `aura.party.deepmind.target_mark` | no speed/heal bonus; reveals nearest safe path/ally in UI/proof | `lane_control`, `boss_analysis`, `mark_priority`, `objective_telemetry` | Beam damage, prediction marks, boss analysis. | Marked enemies take clearer shared damage. | Objective telemetry and boss-gate target marking. |
| `meta_llama_open_herd` | `harrier` | `passive.comind.llama.open_forking`, `passive.comind.llama.pet_scaling` | `aura.party.llama.fork_guard` | `guardDamageReduction: 0.1` while Guardian Fork is active | `remote_guard`, `pet_screen`, `harass`, `split_holder_support` | Pet/fork coverage and duplicate shots. | Drones defend simulated peers. | Remote split holders receive drone support while away from group. |
| `qwen_silkgrid` | `support`, `cover` | `passive.comind.qwen.supply_routing`, `passive.comind.qwen.translation_relay` | `aura.party.qwen.silkgrid_relay` | `radiusBonus: 0.2`; optional pathing/visibility bonus, not heal burst | `recompile`, `relay_anchor`, `pickup_economy`, `regroup_visibility` | Supply conversion and pickup routing. | Improves shared XP collection and peer recovery. | Relay anchors, regroup visibility, and party coordination. |
| `mistral_cyclone` | `runner` | `passive.comind.mistral.low_latency_motion`, `passive.comind.mistral.wind_trail` | none | reaches allies quickly through speed; no hold-time reduction | `split_anchor`, `regroup_speed`, `dash`, `pierce` | Speed, dash, piercing, low cooldown. | Fast rescue and objective traversal. | Fastest split/regroup role, fragile while holding cover alone. |
| `deepseek_abyssal` | `duelist` | `passive.comind.deepseek.efficient_cut`, `passive.comind.deepseek.low_resource_scaling` | none | no support baseline; revive can grant brief stealth/crit through upgrade | `boss_gate`, `elite_disruptor`, `chain_kill`, `efficient_damage` | Efficient damage, chain kills, elite deletion. | Priority-target cleanup. | Boss-gate and high-value disruptor pressure. |
| `xai_grok_free_signal` | `duelist`, `harrier` | `passive.comind.grok.unsafe_signal`, `passive.comind.grok.taunt_crit` | none baseline | no passive revive bonus; chaos revive must be opt-in through upgrades | `harass`, `taunt`, `crit_risk`, `pressure_bait` | High-risk crit/taunt burst. | Pulls enemy attention unpredictably; needs tuning guardrails. | Can bait pressure away from anchors, but effects must not grief allies. |

## Signature Synergy Table

These are named interactions for natural frame/co-mind pairings. Implement as proof-visible IDs first; add special mechanics only where the pair needs a small readable nudge.

| Synergy ID | Pair | Effect scope | Implementation-ready behavior |
|---|---|---|---|
| `synergy.emergency_patch_runner` | `accord_striker` + `openai_accord` | solo, local, online | Starts with `refusal_halo` draft priority and slightly stronger pickup economy proof tag. Online only reports role/objective affinity; no persistence import. |
| `synergy.low_latency_breach` | `accord_striker` + `mistral_cyclone` | solo, local, online | Dash/move-speed upgrades get priority; split-anchor runner bonus is active only while moving. |
| `synergy.constitutional_cover` | `bastion_breaker` + `anthropic_safeguard` | solo, local, online | Cover-anchor damage reduction and revive temporary HP stack within small caps. Candidate evolution name. |
| `synergy.supply_bulwark` | `bastion_breaker` + `qwen_silkgrid` | local, online | Shelter aura also improves pickup/relay visibility around objective anchors. |
| `synergy.fork_swarm` | `drone_reaver` + `meta_llama_open_herd` | solo, local, online | Drone/fork count and Guardian Fork proof tags activate. Candidate evolution name. |
| `synergy.observed_swarm` | `drone_reaver` + `google_deepmind_gemini` | local, online | Drone tags count as mark-priority targets for shared damage/telemetry. |
| `synergy.safe_recompile` | `signal_vanguard` + `anthropic_safeguard` | local, online | Recompile radius/time and revive HP modifiers stack within support cap. |
| `synergy.relay_medic` | `signal_vanguard` + `qwen_silkgrid` | local, online | Recompile visibility plus supply relay recovery; candidate evolution name. |
| `synergy.twin_lane_science` | `vector_interceptor` + `google_deepmind_gemini` | solo, local, online | Vector Lance marks first lane target; marked elites/boss-gates take small bonus damage. Candidate evolution name. |
| `synergy.fast_vector` | `vector_interceptor` + `mistral_cyclone` | solo, local, online | Low-latency lane control; lane weapon cooldown/movement affinity proof tag. |
| `synergy.one_optimized_cut` | `nullbreaker_ronin` + `deepseek_abyssal` | solo, local, online | Elite/boss-gate damage window after kill or revive; candidate evolution name. |
| `synergy.unsafe_duelist` | `nullbreaker_ronin` + `xai_grok_free_signal` | solo, online | Taunt/crit risk build; online taunt must target enemies, not manipulate ally state. |

Default fallback: if no signature pair matches, `synergyId` is `null`; build still receives frame and co-mind passives.

## Role Resolution Rules

Use deterministic role resolution so UI, local snapshots, and server snapshots agree:

1. Frame role is primary.
2. If co-mind role bias contains the frame role, use the frame role and add a `role_match` affinity.
3. If frame role is `runner` and co-mind bias contains `support`, keep `runner` but expose support auras/recompile modifiers separately.
4. If frame role is `duelist` and co-mind bias contains `support` or `cover`, keep `duelist`; support benefits should appear through passives, not role relabeling.
5. Only use co-mind bias as resolved role if a future frame has an undefined role. That should not happen for the six current frames.

## Recompile Modifier Caps

Keep Recompile Ally universal and server-authored. Kit modifiers should be small and additive before final caps:

| Modifier | Base | Recommended cap | Notes |
|---|---:|---:|---|
| `radiusBonus` | `0` | `0.35` | Add to existing server radius, after role-pressure regroup bonus is calculated. |
| `requiredSecondsScale` | `1` | `0.82` minimum | Multiplicative scale; never make Recompile instant. |
| `reviveHpBonus` | `0` | `0.18` | Temporary HP fraction of max HP. |
| `postReviveSpeedSeconds` | `0` | `2.0` | Runner/duelist mobility window only. |
| `guardDamageReduction` | `0` | `0.2` | Applies to reviver/downed guard context only. |

Milestone 29 regroup acceleration remains the main universal revive boost. Kits should make composition feel expressive, not mandatory.

## Upgrade Hooks Already Present

These IDs already have content and effect hooks in `src/gameplay/upgrades.ts`:

| ID | Status | Notes |
|---|---|---|
| `refusal_halo` | present | OpenAI shield/aura/max HP. |
| `context_bloom` | present | OpenAI pickup range. |
| `patch_cascade` | present | OpenAI cooldown. |
| `bad_output_filter` | present | OpenAI damage. |
| `the_no_button` | present | OpenAI pierce. |
| `alignment_breaker` | present | OpenAI damage/projectile speed. |
| `cathedral_of_no` | present | OpenAI evolution; requires `refusal_halo` + `the_no_button`. |
| `constitutional_shield` | present | Anthropic max HP/aura. |
| `golden_guardrail` | present | Anthropic route-seeded defense. |
| `panic_optimized_dash` | present | General/class speed. |
| `coherence_magnet` | present | General/class pickup range. |
| `million_token_backpack` | present | General HP. |
| `gemini_beam` | present | DeepMind damage/projectile speed. |
| `low_latency_dash` | present | Mistral speed/cooldown. |
| `open_herd` | present | Llama pierce/cooldown. |
| `silkgrid_relay` | present | Qwen pickup/HP. |
| `sparse_knife` | present | DeepSeek damage/projectile speed. |
| `cosmic_heckle` | present | Grok damage/speed. |

Faction passives already present as stat hooks in `applyFactionPassive()`:

| Faction ID | Present passive behavior |
|---|---|
| `openai_accord` | `draftRerolls +1`, pickup range. |
| `anthropic_safeguard` | max HP, refusal aura. |
| `google_deepmind_gemini` | weapon damage, projectile speed. |
| `mistral_cyclone` | move speed, weapon cooldown. |
| `meta_llama_open_herd` | projectile pierce, slightly slower cooldown. |
| `qwen_silkgrid` | pickup range, max HP. |
| `deepseek_abyssal` | weapon damage, weapon cooldown. |
| `xai_grok_free_signal` | weapon damage, max HP penalty. |

## New Upgrade/Passive IDs Needed

### Minimal New Upgrade Effects

These are already listed in `src/content/factions.ts` pools but do not currently have realized upgrade effects/content hooks. Add the smallest useful effect for Milestone 32 rather than full evolutions everywhere.

| ID | Owner | First-pass effect hook |
|---|---|---|
| `red_team_pulse` | Anthropic | Debuff pulse: reduce nearby enemy damage or speed briefly; proof as `containment_debuff`. |
| `harmlessness_field` | Anthropic | Anchor/nearby ally damage reduction aura. |
| `containment_mercy` | Anthropic | Recompile revive HP bonus or downed damage reduction. |
| `control_group_detonation` | DeepMind | Marked enemy death creates small controlled burst. |
| `peer_reviewed_laser` | DeepMind | Pierce/beam upgrade, especially for `vector_lance`. |
| `lab_result_fire` | DeepMind | Damage-over-time or boss-analysis damage bump. |
| `experiment_404` | DeepMind | Chance to delete/skip a minor enemy hit through prediction. |
| `fork_bomb_familiar` | Llama | Adds one drone/fork familiar or projectile clone. |
| `community_patch` | Llama | Shared small stat/aura bump for local/online party. |
| `pull_request_barrage` | Llama | Burst of forked projectiles after cooldown. |
| `llama_drama` | Llama | Unstable pet/duplicate burst; keep bounded for online. |
| `lantern_swarm` | Qwen | Supply lantern pickups or helper drones. |
| `syntax_lance` | Qwen | Line/pierce attack with multilingual flavor. |
| `shared_vocabulary` | Qwen | Recompile/ally recovery or regroup visibility hook. |
| `apocalypse_localization_pack` | Qwen | Converts pickups/objective items into small party benefits. |
| `cyclone_cut` | Mistral | Piercing wind slash/projectile. |
| `tiny_model_huge_problem` | Mistral | Compact damage/cooldown burst. |
| `storm_cache` | Mistral | Pickup grants short speed/cooldown window. |
| `le_petit_nuke` | Mistral | Rare compact burst; cap visuals/projectiles. |
| `efficiency_killchain` | DeepSeek | Chain-kill damage/cooldown refund. |
| `abyssal_cache` | DeepSeek | Low-resource pickup/damage scaling. |
| `low_compute_lunge` | DeepSeek | Dash/slash cooldown or melee reach. |
| `silent_benchmark` | DeepSeek | Crit/elite damage proof hook. |
| `ratio_the_void` | Grok | Taunt/crit reward after enemy focuses player. |
| `truth_cannon` | Grok | High damage shot with risk/cooldown. |
| `sarcasm_flare` | Grok | Taunt pulse that weakens affected enemies. |
| `meme_risk_payload` | Grok | Randomized but bounded buff/debuff payload. |

### Frame-Specific Upgrade IDs

Add one high-signal class upgrade per non-starter frame and two for Accord Striker only if they remain useful after existing general upgrades:

| ID | Frame | First-pass effect hook |
|---|---|---|
| `refusal_slipstream` | `accord_striker` | After shard pickup or dash, leave brief denial trail. |
| `route_runner` | `accord_striker` | Objective/split anchor fill bonus while moving above speed threshold. |
| `impact_review` | `bastion_breaker` | Cannon knockback and anchor displacement. |
| `load_bearing_apology` | `bastion_breaker` | Armor/attention draw while stationary near anchor. |
| `guardian_fork` | `drone_reaver` | Drone prioritizes enemies near downed allies or remote holders. |
| `beacon_discipline` | `signal_vanguard` | Regroup/recompile recovery pulse. |
| `predicted_lane` | `vector_interceptor` | First enemy in lance path is marked for bonus party damage. |
| `appeal_cut` | `nullbreaker_ronin` | Boss/elite hits refund slash/dash cooldown. |

### Party Aura IDs

Party auras should be data/proof IDs first, then selectively wired to runtime:

| ID | Owner | Scope |
|---|---|---|
| `aura.party.bastion_breaker.cover_shelter` | Bastion Breaker | local, online |
| `aura.party.drone_reaver.guardian_fork` | Drone Reaver | local, online |
| `aura.party.signal_vanguard.recovery_pulse` | Signal Vanguard | local, online |
| `aura.party.openai.draft_clarity` | OpenAI Accord | local, online lobby/proof |
| `aura.party.anthropic.containment_field` | Anthropic Safeguard | local, online |
| `aura.party.deepmind.target_mark` | DeepMind Gemini | local, online |
| `aura.party.llama.fork_guard` | Meta Llama | local, online |
| `aura.party.qwen.silkgrid_relay` | Qwen Silkgrid | local, online |

## Starting Weapon Implementation Notes

`startingWeaponId` values are already declared, but current local weapon code still fires a generic `refusal shard` projectile. Milestone 32 should add the minimum weapon switch that gives each frame a distinct proof-visible pattern:

| Weapon ID | Owner frame | Minimum behavior |
|---|---|---|
| `refusal_shard` | Accord Striker | Existing fast auto-projectile; keep as baseline. |
| `safety_cannon` | Bastion Breaker | Slower wider projectile/cone, higher damage, knockback tag. |
| `fork_drone` | Drone Reaver | Orbiting or autonomous shot source; cap drone count. |
| `signal_pulse` | Signal Vanguard | Radial or short lane pulse, mild debuff/support tag. |
| `vector_lance` | Vector Interceptor | Piercing line projectile with lane mark. |
| `null_blade` | Nullbreaker Ronin | Short arc/slash, high damage, small range. |

Online should mirror only safe server-authoritative parts first: cooldown, damage, pierce/shape tag, knockback/mark/recompile modifiers. Avoid client-owned pet damage or cosmetic-only state becoming authority.

## Persistence And Export-Code Boundary

Do not add any of the following to durable import/export payloads:

- selected `classId` or `factionId`;
- `buildKit`;
- active passives, auras, or synergy IDs;
- combat state, upgrade choices, draft votes, Recompile state, role-pressure state, weapon runtime, pet/drone state.

Allowed durable inputs remain:

- route reward IDs;
- completed/unlocked node IDs;
- party renown/route depth/profile hash;
- unlock rules derived from `src/metaprogression/onlineMetaProgression.ts`.

Build selection may read unlock state from route rewards. Runtime snapshots may expose selected kit facts for proof/UI. Import/export must not trust kit facts as durable authority.

## Suggested Implementation Order

1. Add `src/content/buildKits.ts` or equivalent data-only module with frame kit, co-mind kit, synergy, role resolution, and cap helpers.
2. Add `buildKit` to local proof text for build-select, solo run, and local Consensus Cell snapshots.
3. Add distinct local `startingWeaponId` behavior for the six current weapons with conservative projectile counts.
4. Add missing upgrade content/effects for one class upgrade and one co-mind upgrade per active kit.
5. Add online server-side kit resolution from selected class/faction IDs, then expose `buildKit` in online player snapshots.
6. Apply only narrow online kit modifiers: HP, cooldown, anchor fill bonus, Recompile radius/time, revive HP, and role labels.
7. Add focused Milestone 32 proof scripts after telemetry is stable.

## Suggested Proofs And Tests

- `npm run build`
- `npm run proof:smoke`
- `npm run proof:upgrades`
- `npm run proof:coop`
- `npm run proof:network`
- `npm run proof:milestone27-metaprogression-unlocks`
- `npm run proof:milestone29-role-pressure`
- new `npm run proof:milestone32-party-builds`

Milestone 32 proof assertions:

- clean profile exposes only `accord_striker` + `openai_accord`;
- route-reward profile unlocks the currently mapped six frames and eight co-minds;
- every frame reports distinct `startingWeaponId`, `classRole`, `resolvedRole`, and `buildKit`;
- every co-mind reports at least one `passiveId`, one role bias, and one upgrade hook;
- solo Nullbreaker Ronin + DeepSeek reports `resolvedRole: "duelist"`, `startingWeaponId: "null_blade"`, and `synergy.one_optimized_cut`;
- local 4-player Consensus Cell reports runner/cover/harrier/support kit spread;
- online two-player lobby and run snapshots report selected class/faction IDs, role labels, and `buildKit`;
- online role-pressure split still works with kit telemetry present;
- support/cover kit changes Recompile Ally telemetry in server-owned values;
- non-support party can still complete split-hold-regroup-recompile through universal Milestone 29 rules;
- persistence exports contain route/profile state only, not selected build kit authority;
- no browser console/page errors.

## Risks

- Kit bonuses could make role-pressure anchors trivial if anchor fill, damage reduction, and regroup bonuses stack too high.
- Pet/drone/fork builds can reintroduce render-performance pressure if each effect allocates Pixi objects per frame.
- Online client visuals must not become gameplay authority for drones, marks, taunts, or Recompile modifiers.
- Duelist and Grok chaos effects can feel like grief tools if taunts redirect pressure onto allies or objectives.
- Draft pools may look full in content but silently omit IDs until every listed ID has an effect hook in `makeUpgrade()`.
- Persistence/export boundaries are easy to blur if build selection convenience starts writing active kit facts into route profile payloads.

## Deferrals

- Redline Surgeon remains a future dedicated medic/death-editor frame after Signal Vanguard proves support and Recompile hooks.
- Prism Gunner remains a future beam specialist after Vector Interceptor proves lane weapons.
- Full Creative Bible class roster, matchmaking, accounts, anti-cheat, official logo import, and broad asset work are outside this milestone.
