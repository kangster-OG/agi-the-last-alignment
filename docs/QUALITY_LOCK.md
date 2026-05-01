# M56 Quality Lock

Milestone 56 establishes the pre-release technical gate for proof, performance, compatibility, and accessibility.

## Runtime Contract

`window.render_game_to_text()` exposes:

- `qualityGate.policy`: `milestone56_proof_performance_compatibility_accessibility_lock`
- deterministic proof hook visibility for `render_game_to_text` and `advanceTime`
- local active entity budget: `260`
- online snapshot caps: enemies `24`, projectiles `40`, pickups `32`
- reduced-flash query contract: `?reducedFlash=1&screenShake=0`
- persistence boundary: runtime quality telemetry is not part of route-profile export/import

## Required Proofs

```bash
npm run proof:campaign-full
npm run proof:milestone56-quality-lock
```

`proof:campaign-full` starts from a clean online profile and completes every supported campaign node through `alignment_spire_finale`.

`proof:milestone56-quality-lock` checks:

- compact 960x540 viewport readability captures;
- reduced-flash/no-shake proof visibility;
- long-session local active-entity budget;
- online room/deployment robustness telemetry retention;
- route-profile-only export/import boundaries.

## Release Gate

Before M57 release candidate packaging, rerun the M56 proofs together with build, asset validation, smoke, and the newest milestone proofs. Do not proceed if the campaign proof, long-session budget, or accessibility visibility checks fail.

