# Appeal Court Ruins ChatGPT Images Source V1

Generated on 2026-05-08 after the Appeal Court graybox proof and post-Archive difficulty audit.

Accepted source boards:

- `appeal_court_terrain_chatgpt_v1.png`: dark isometric tribunal/server floor chunks, verdict lanes, public-record platforms, ruling gate pieces, and Injunction Engine dais material.
- `appeal_court_props_objectives_chatgpt_v1.png`: appeal podiums, exhibit tables, benches, ruling seals, writ pylons, court gates, and small public-record props.
- `appeal_court_actors_boss_chatgpt_v1.png`: Verdict Clerk frames, Appeal-specific Injunction Writ frames, and Injunction Engine boss/event frames.
- `appeal_court_vfx_chatgpt_v2.png`: clean no-label public-record rings, verdict beams, objection/injunction rings, ruling/extraction beams, shards, and reward bursts.

Rejected source:

- `REJECTED_appeal_court_vfx_labeled_chatgpt_v1.png` is preserved for provenance only. It contained baked labels in the sheet and is not packed into runtime art.

Runtime packing:

- Packed by `scripts/assets/pack-appeal-court-source-v1.py`.
- Code only chroma-keys, crops, trims alpha, pads, resizes, composes source chunks into authored ground, and packs atlases.
- No expressive terrain, props, enemies, boss, or VFX art is drawn with code.

Output proof:

- Runtime contact sheet: `assets/concepts/pixellab_refs/appeal_court_refinement_v1/appeal_court_runtime_contact_v1.png`.
- Gameplay proof: `docs/proof/appeal-court-ruins/`.
