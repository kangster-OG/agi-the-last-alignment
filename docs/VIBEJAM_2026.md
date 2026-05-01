# Cursor Vibe Jam 2026 Submission Context

Source snapshot: May 1, 2026.

Primary source: https://vibej.am/2026/

Related public source pages:

- Press release: https://vibej.am/2026/press
- Required widget script: https://vibej.am/2026/widget.js
- Optional portal sample: https://vibej.am/2026/portal/sample.js
- Submission form link from the site: https://forms.gle/ via the `SUBMIT NOW` / `Submit Your Game` links on the jam page. The Google Form required sign-in/cookie access when fetched by Codex on May 1, 2026, so this repo records only the public site guidance and the public form link status.

This document is submission/compliance context only. It does not change the game direction for `AGI: The Last Alignment`, which remains a free browser-playable 2D isometric pixel-art horde-survival roguelite using Vite, TypeScript, PixiJS, and Colyseus.

## Jam Summary

Cursor Vibe Jam 2026 is a browser-game competition organized by Pieter Levels / `@levelsio` where 90% or more of the code must be written by AI. The 2026 jam runs from April 1, 2026 to May 1, 2026 at 13:37 UTC.

The public prize pool listed on the site is $40,000 total:

- Gold: $25,000
- Silver: $10,000
- Bronze: $5,000

The site also describes Most Popular sub-prizes for games built with sponsor tools. Sponsors shown on the public page include Cursor, Bolt.new, Glif, and Tripo AI.

## Hard Rules

These rules are listed on the public Vibe Jam 2026 page and press release:

- Anyone can enter with their game.
- One entry per person.
- At least 90% of the code must be written by AI.
- Only new games created during the jam period are accepted. Do not submit games that existed before April 1, 2026.
- The game must be playable on the web, free-to-play, and accessible without login or signup.
- A dedicated domain or subdomain is preferred.
- The required Vibe Jam widget script must be added to the game's HTML before submission. Games without it are disqualified according to the public rules.
- The game should load almost instantly. The site explicitly says no loading screens and no heavy downloads. Asking for a username is allowed, but the preference is immediate play.
- The deadline is May 1, 2026 at 13:37 UTC.

## Allowed And Preferred

- Multiplayer games are preferred, but not required.
- Any engine is allowed. Three.js is recommended by the jam site, but not required. This means the existing Vite + TypeScript + PixiJS stack is compatible with the written rules as long as the final game is browser-playable, free, and fast-loading.
- Existing libraries and frameworks may be used, but the game itself must be new during the jam period.

## Required Widget

The required entrant widget is:

```html
<script async src="https://vibej.am/2026/widget.js"></script>
```

The Vibe Jam site says this widget is used to track entrants and popularity-related stats. The public widget script adds a bottom-right Vibe Jam 2026 badge linking to `https://vibej.am/` and sends a heartbeat approximately every 60 seconds only after real user input while the document is visible.

Submission checklist impact for this repo:

- Before submitting, add the widget script to `index.html` or the deployed HTML template.
- Host the game on one stable domain or subdomain so the widget can associate play stats with a single game URL.
- Keep the game playable without login or signup.
- Keep production-art defaults and placeholder opt-outs, but ensure the submitted default path is the polished production-art path.

## Optional Portals

The Vibe Jam portal system is optional and separate from the required widget. It acts like a webring between submitted games.

Public portal redirect target:

```text
https://vibej.am/portal/2026
```

If implemented, the game can send query parameters that the portal redirector forwards to the next game:

- `username`
- `color`, either a hex color or a simple color name such as `red`, `green`, or `yellow`
- `speed`
- `ref`, the URL or host of the game the player came from

Optional extra parameters listed by the site:

- `avatar_url`
- `team`
- `hp`, with the public docs noting a 1..100 range
- `speed_x`
- `speed_y`
- `speed_z`
- `rotation_x`
- `rotation_y`
- `rotation_z`

The portal redirector always adds `portal=true`. Games should treat every parameter except `portal` as optional and should not rely on any of them being present.

If this repo later implements portals in PixiJS:

- Add an exit portal in-game that redirects to `https://vibej.am/portal/2026`.
- When receiving `?portal=true&ref=...`, spawn the player out of a return/start portal quickly, without a start screen.
- If the player walks into the return portal, send them back to the `ref` target and preserve the forwarded query parameters.
- Sanitize and validate `ref` before redirecting. Only allow `http:` or `https:` targets, and avoid using query parameters for local/export-code persistence or live run authority.
- Do not import live objectives, combat state, selected build kits, cooldowns, pets, role-pressure state, Recompile state, dialogue state, route UI focus state, or authority state from portal query parameters. Portal params are transient arrival flavor only.

The public portal sample is written for Three.js. A PixiJS implementation should use this repo's existing input/state-machine/rendering patterns rather than copying the Three.js sample directly.

## Submission Notes

The public Vibe Jam page says entrants can submit before the deadline and keep working until the deadline. The public submission link goes to a Google Form. Codex could reach the form shell on May 1, 2026, but the form required Google sign-in/cookie access in this environment, so field-level submission requirements are not recorded here.

Before final submission, manually open the submission form in a browser with the user's Google account available and confirm any fields not visible from the public site.

## Account Authorization Boundary

The user authorized Codex on May 1, 2026 to use a locally authenticated browser session for Vibe Jam submission preparation on their behalf.

Safety boundaries:

- Do not store Google, GitHub, hosting, or Vibe Jam credentials in the repo.
- Do not ask the user to paste passwords, recovery codes, or two-factor codes into repo files or chat.
- The user should complete Google sign-in, two-factor prompts, CAPTCHA, cookie consent, or account-security prompts directly in the browser window.
- A persistent local browser profile may be used for Vibe Jam submission preparation, but it must remain local machine state and must not be committed.
- Codex may use the authenticated browser session to inspect and fill the Vibe Jam submission form up to the final submit action.
- Clicking the final contest submission button still requires explicit final authorization from the user in the active thread, unless the user later provides a separate, unambiguous final-submit instruction.

Local setup note:

- On May 1, 2026, the user completed Google sign-in in regular Google Chrome using a dedicated local profile under `.codex-local/`. Codex verified via macOS Chrome automation that the profile could reach the `Cursor Vibe Jam 2026` Google Form URL instead of the Google sign-in page.
- `.codex-local/` is ignored by git and must remain uncommitted.

## Fit With This Project

`AGI: The Last Alignment` already aligns with several public jam preferences:

- browser-playable;
- free-to-play intent;
- no account requirement in the current prototype;
- online Colyseus co-op exists, while multiplayer is preferred but not required;
- deterministic proof hooks and production-art defaults support a stable web submission.

Remaining Vibe Jam-specific submission work, when the user decides to submit:

- deploy to one stable public domain or subdomain;
- add the required Vibe Jam 2026 widget script to submitted HTML;
- ensure the default load path is fast and does not present a heavy loading screen;
- verify the deployed build runs without login/signup;
- manually complete the Google Form;
- optionally implement PixiJS-native Vibe Jam portals if desired.
