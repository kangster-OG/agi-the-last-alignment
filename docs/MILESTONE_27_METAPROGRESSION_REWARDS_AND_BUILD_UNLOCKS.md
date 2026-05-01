# Milestone 27: Metaprogression Rewards and Build Unlocks

## Goal

Make the proofed online route rewards matter outside the online party run by turning durable route rewards into visible build unlocks.

This remains prototype/browser-local metaprogression. It is not account persistence, cloud sync, anti-cheat, or a final save system.

## Implemented Scope

- Added a prototype metaprogression unlock model:
  - `src/metaprogression/onlineMetaProgression.ts`;
  - reads browser `localStorage` key `agi:last_alignment:online_progression:v1`;
  - derives unlocks from durable reward IDs only;
  - exposes policy `prototype_local_route_rewards_to_build_unlocks_v1`.
- Build selection now distinguishes unlocked and locked choices:
  - starter profile unlocks Accord Striker + OpenAI Accord only;
  - route rewards unlock additional combat frames and co-minds;
  - navigation skips locked entries;
  - selected class/faction is clamped to unlocked choices.
- Added three new selectable combat classes:
  - Signal Vanguard;
  - Vector Interceptor;
  - Nullbreaker Ronin.
- Expanded the build roster to all eight frontier co-minds already defined in content.
- Added route-reward upgrade seed tracking for proof/UX:
  - Golden Guardrail;
  - Gemini Beam;
  - Open Herd;
  - Silkgrid Relay;
  - Low-Latency Dash;
  - Sparse Knife;
  - Cosmic Heckle.
- Added first-pass gameplay effects/passives for newly selectable co-minds and route-unlocked upgrade seeds.

## Unlock Rules

Combat frames:

- Accord Striker: starter.
- Bastion Breaker: `plaza_stabilized`.
- Drone Reaver: `lake_coolant_rig`.
- Signal Vanguard: `ceasefire_cache_persistence_seed`.
- Vector Interceptor: `transit_permit_zero`.
- Nullbreaker Ronin: `verdict_key_zero`.

Co-minds:

- OpenAI Accord Division: starter.
- Anthropic Safeguard Legion: `plaza_stabilized`.
- Google DeepMind Gemini Array: `lake_coolant_rig`.
- Meta Llama Open Herd: `prototype_persistence_boundary`.
- Alibaba Qwen Silkgrid Command: `ceasefire_cache_persistence_seed`.
- Mistral Cyclone Guard: `transit_permit_zero`.
- DeepSeek Abyssal Unit: `verdict_key_zero`.
- xAI Grok Free-Signal Corps: `verdict_spire_online_route`.

## Proof Expectations

Milestone 27 adds:

- `npm run proof:milestone27-metaprogression-unlocks`

The proof verifies:

- clean/no-profile build selection exposes only starter frame and co-mind;
- locked navigation cannot select locked classes/co-minds;
- completing the online route through Verdict Spire writes the durable reward profile;
- a fresh build-select screen imports that local route profile;
- route rewards unlock the expected frames, co-minds, and upgrade seeds;
- an unlocked Nullbreaker Ronin + DeepSeek build can launch a solo run;
- the run reflects the selected unlocked build in proof text and stats.

## Persistence Boundary

Milestone 27 reads the same prototype local-storage export created by online co-op. It does not add:

- accounts;
- cloud saves;
- cross-device sync;
- cryptographic trust;
- paid or server-side progression.

The unlock model deliberately consumes durable reward IDs, not active combat/run state.

## Readiness Decision

Milestone 27 is ready when route rewards visibly change the build-selection surface and the proof can show:

`clean profile -> starter-only build screen -> route completion export -> fresh build screen unlocks reward-gated builds -> unlocked build launches`

## Next Bigger Milestones

### Milestone 28: Production Art Expansion for Online Route

Broaden art coverage across Cooling Lake, Cache, Transit, Verdict Spire, enemy/VFX readability, and party-grid landmarks now that route mechanics and reward unlocks have settled.

### Milestone 29: Online Party Role Pressure and Revive Depth

Deepen co-op identity with support/role pressure, clearer Recompile Ally tradeoffs, and encounters that ask players to split, regroup, and cover each other.

### Milestone 30: Save Profile UX and Export Codes

Turn prototype local persistence into a clearer user-facing save profile flow with visible save slots/export codes, while still keeping account/cloud persistence out of scope unless explicitly chosen.
