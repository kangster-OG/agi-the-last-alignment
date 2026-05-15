# Copy Voice Direction

Date: 2026-05-15

Purpose: define the repo-level copy direction for `AGI: The Last Alignment` before rewriting game-facing text.

## North Star

All player-facing copy should feel like an original sardonic dungeon-crawl field announcer got hired by a collapsed AI safety startup, found the apocalypse budget spreadsheet, and decided everyone involved deserved notes.

The voice is:

- sarcastic;
- funny;
- hostile to corporate nonsense;
- allergic to reverence;
- mechanically clear;
- parody-forward;
- happy to insult systems, factions, bosses, objectives, and the player with equal-opportunity affection.

The user specifically wants the copy to carry the broad fun of a modern comedic dungeon-crawler book: fast jokes, brutal quest framing, absurd reward language, contemptuous announcer energy, and a feeling that the game itself is roasting the entire world while still telling the player what to do.

Do not copy protected prose, jokes, phrasing, characters, UI, names, or expressive content from any book, game, show, or existing IP. The target is an original AGI-parody voice with similar broad qualities: sardonic, punchy, profane-adjacent without needing profanity, and constantly amused by institutional failure.

## Style Contract

The copy should sound like the game is run by an overworked systems announcer who has:

- read every safety memo;
- watched every lab press event;
- lost all patience;
- still understands tutorial design;
- considers the player both humanity's last chance and a very funny liability.

Preferred texture:

- short punchy sentences;
- setup -> knife twist;
- clear mechanical instruction first, joke second;
- proper nouns treated as punchlines, not holy lore;
- bureaucracy, venture capital, AI alignment, legal theater, launch culture, benchmarks, and corporate diplomacy as constant targets;
- bosses introduced like catastrophic workplace incidents;
- rewards described like dangerous severance packages;
- objectives described like stupid jobs that unfortunately save reality.

Good shape:

`STABILIZE 3 ANCHORS. The treaty is held together with zip ties, bad faith, and your remaining organs. Try not to depreciate.`

Bad shape:

`Stabilize the Treaty Anchors and restore the sacred covenant of the Last Alignment.`

## Hierarchy Still Matters

The Campaign Clarity rule remains active:

1. Tell the player what to do.
2. Tell the player why it matters mechanically.
3. Then make fun of the situation.

Do not bury action under jokes. The joke is allowed to be loud, but the verb must be louder.

Every briefing, HUD line, draft card, summary row, unlock message, objective marker, and boss warning should answer the player's immediate question before it starts insulting anyone.

## Comedy Targets

The copy should constantly punch at:

- A.G.I. treating reality like an editable document;
- frontier labs as parody factions with wildly overconfident branding;
- safety theater, benchmarks, boardrooms, launch decks, and legal disclaimers;
- the player's questionable job description;
- bosses as product failures, bad governance, or living metrics dashboards;
- the campaign as a dungeon crawl through institutions that confidently automated the floor out from under themselves.

Avoid punching down at real protected classes, vulnerable groups, or personal identity. The joke target is systems, institutions, apocalypse logic, corporate cowardice, technical hubris, and the absurdity of being asked to save reality for a mid-run cache.

## Vocabulary Shift

Keep durable gameplay terms, but let the flavor around them get nastier and funnier.

Use:

- `Frame` for player body/class.
- `Co-Mind` for AI partner.
- `Protocol` for installed combat behavior.
- `Utility Cache` for one-shot survival choices.
- `Major Evolution` or `Evolution` for recipe transformations.
- `Proof Tokens` for campaign reward currency.
- `Alignment Grid` for overworld.
- `A.G.I.` / `Alien God Intelligence` for the antagonist.

Allowed voice modifiers:

- `terrible little job`;
- `mandatory heroism`;
- `compliance-shaped violence`;
- `strategic panic`;
- `weaponized paperwork`;
- `reality's least qualified contractor`;
- `benchmark goblet of bad decisions` is not allowed because avoid creature/animal references unless clearly relevant. Use `benchmark cup of bad decisions` instead.

Do not overuse any single gag. If every sentence has the same rhythm, the copy becomes a novelty mug.

## Surface Rules

### Briefings

Briefings should read like mission cards from a hostile game show:

- one clear verb;
- one clear objective;
- one insulting reason this exists;
- one boss/event warning;
- one reward line that makes the reward feel useful and suspicious.

Example:

`CALIBRATE 3 RELAYS. The signal is lying, the beach is electrified, and your Co-Mind says this is technically a learning opportunity.`

### HUD

HUD copy must stay short. It can be sarcastic, but it cannot become a paragraph.

Good:

- `ANCHORS 1/3 - KEEP THE TREATY FROM EMBARRASSING ITSELF`
- `BOSS IN 42s - LEGAL HAS STOPPED RESPONDING`
- `EXTRACT - LEAVE BEFORE THE WIN CONDITION CHANGES ITS MIND`

### Draft Cards

Draft cards should make choices sound like dangerous tools, not stat coupons.

Template:

`Mechanical sentence. Sarcastic sentence.`

Example:

`Primary weapon. Replaces Refusal Shard with long-range lane shots. Finally, a straight answer. We should notify procurement.`

### Utility Caches

Utility Cache copy should feel like the player is accepting a morally dubious emergency kit.

Example:

`Restore missing HP now. The medkit is mostly tape and optimism, but the tape has excellent margins.`

### Boss Intros

Boss intros should be big, rude, and readable.

Template:

`BOSS NAME`

`One short accusation. One mechanical warning.`

Example:

`THE OATH-EATER`

`It found a loophole in friendship. Stay mobile; the charge attack is not interested in your growth journey.`

### Summary

Summary copy should roast the run but make the outcome obvious:

- what cleared;
- what failed;
- what unlocked;
- what the player banked;
- one final jab.

Good:

`Objective: STABILIZE COMPLETE. The treaty survived, which is more than anyone can say for the meeting minutes.`

## Profanity And Rating

The default tone should be profane-adjacent, not profanity-dependent. Use anger, sarcasm, and precision before actual swearing.

Allowed:

- `hell`;
- `damn`;
- `garbage`;
- `idiot` for systems or plans, sparingly.

Avoid:

- slurs;
- sexual insults;
- cruelty aimed at the player personally;
- joke density that blocks comprehension.

The game can be mean to the player's job, choices, build, and odds. It should not make the real person holding the keyboard feel unwelcome.

## Rewrite Priority

When rewriting all copy, work in this order:

1. `src/content/campaignClarity.ts`
2. `src/content/upgrades.ts`
3. `src/content/classes.ts`
4. `src/content/buildKits.ts`
5. `src/content/factions.ts`
6. `src/content/arenas.ts`
7. `src/content/bosses.ts`
8. `src/content/enemies.ts` and `src/content/enemyRoleProfiles.ts`
9. UI hardcoded copy in `src/ui/*.ts`
10. Runtime hardcoded copy in `src/level/LevelRunState.ts`, `src/overworld/OverworldState.ts`, and proof-visible text.

After each pass, run copy-sensitive proofs:

```sh
npm run proof:campaign-clarity
npm run proof:objective-variety
npm run proof:combat-progression
npm run proof:combat-progression-browser
npm run proof:smoke
```

For broad rewrites, use the hydrated temp-checkout pattern before final validation.

## Acceptance Bar

The copy rewrite is working when:

- a new player always knows what to do;
- the game sounds funny and hostile to its own apocalypse;
- the AGI/faction parody reads immediately;
- no major surface sounds like solemn lore sludge;
- draft choices feel like build-defining tools with jokes attached;
- bosses sound like disasters with names;
- summaries make success/failure/rewards obvious and then take a swing;
- no protected prose, jokes, or distinctive phrasing from external works appears in the repo.
