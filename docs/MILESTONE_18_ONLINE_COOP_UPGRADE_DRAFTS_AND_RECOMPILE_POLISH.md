# Milestone 18: Online Co-op Upgrade Drafts and Recompile Ally Polish

## Goal

Make online co-op progression feel like a party-owned system instead of a single-client proof hook.

## Implemented Scope

- Online upgrade progression now uses a server-authored co-op vote policy:
  - shared party XP still opens one shared emergency patch draft;
  - each active, non-downed player can vote for one draft card;
  - the server records per-player votes, vote counts, required votes, eligible voters, and the current leading card;
  - the draft resolves only after the required eligible voters have voted;
  - ties resolve deterministically by authored card order.
- The online HUD now renders a three-card patch draft:
  - visible card names, sources, descriptions, vote counts, leading card highlight, and local vote marker;
  - player strip shows ally patch votes while a draft is open;
  - right HUD shows draft vote progress.
- Recompile Ally state is now explicit in server snapshots:
  - revive radius;
  - required revive seconds;
  - active/downed-player list;
  - nearest ally, distance, in-range flag, progress, and percent.
- The online arena render now labels downed allies with `RECOMPILE ALLY` / `RECOMPILING` progress text and colored revive rings.
- `render_game_to_text()` now exposes:
  - `online.upgradeDraft`;
  - `online.recompile`;
  - `level.recompile`.
- Completion summaries preserve the chosen shared upgrade and revived-player count.

## Runtime Defaults

Online co-op is still entered from the main menu with `C`.

Controls during active online runs:

- `1` / `2` / `3`: vote for a server patch draft card when a draft is open.
- Hold near a downed ally to Recompile Ally.
- `R`: reconnect.
- `Esc`: leave online co-op.

## Proof Expectations

Milestone 18 adds:

- `npm run proof:milestone18-coop-progression`

The proof verifies:

- two clients launch an online active run;
- shared XP opens a server-authored co-op patch draft;
- one player vote appears on both clients without applying the patch;
- the second required vote resolves the draft and advances party level;
- Recompile Ally exposes server telemetry while a player is downed;
- revive completion increments revived-player state;
- run completion summary includes the co-op voted upgrade and revive count.

## Remaining Risks

- Upgrade drafts are still plain JSON snapshots rather than Schema-backed collections.
- Reconnect-to-existing-slot is still not solved; reconnect creates a fresh room client.
- The online progression rule is shared-party prototype policy, not the final long-term answer for individual, shared, or hybrid builds.
- The Recompile Ally visual polish is functional and readable, but still needs final production animation/audio.
- Proof controls for forced XP/down/complete still exist behind `?proofOnlineFlow=1`; they should eventually become cleaner dev harness hooks.

## Next Recommended Milestone

Milestone 19 should likely be `Online Reconnect Identity and Schema Collections`.

Priority:

- reconnect to existing player slot/session state;
- migrate party/progression/recompile payloads to Schema-backed collections where useful;
- preserve Milestone 15 server combat authority and Milestone 18 co-op draft/revive proofs;
- start hardening leave/rejoin behavior during lobby, active combat, upgrade draft, downed, and completed phases.
