# Signal Coast Direction V1

Date: 2026-05-07

Purpose: production-art direction source for Signal Coast / Kettle Coast after the graybox gameplay and code/balance lock. This folder is for review and approval only. These images are not wired into runtime, not packed into atlases, and not recorded as accepted production art.

## Source Direction Files

- `signal_coast_direction_board_v1.png`: first ChatGPT Images board. Useful for broad Signal Coast motifs, but it includes concept-board labels and leans more like a presentation board than a crop-ready prior-level source sheet.
- `signal_coast_prior_style_direction_board_v2.png`: refined ChatGPT Images board prompted to match the existing Armistice, Cooling, and Transit art language. This is the preferred approval candidate for the next source-art pass.

## Style Lock

Signal Coast production art should match the prior levels:

- close tactical 2:1 isometric pixel-art read;
- chunky, readable silhouettes;
- dense hand-authored material breakup;
- cracked civic/server floor plates in the Armistice V6/V7 spirit;
- flat isometric terrain chunks compatible with the accepted Cooling PixelLab V3 approach;
- rail/platform/cable material density compatible with Transit Loop Zero source boards;
- grounded props with contact shadows and no pasted-on square rugs;
- teal/cyan signal accents, amber relay/objective accents, red/violet corruption hazard accents;
- original AGI shoreline fiction, no brand logos, no copied game assets, no UI text.

## Direction Candidate Notes

`signal_coast_prior_style_direction_board_v2.png` is stronger because:

- it removes text labels from the source image;
- terrain chunks are more crop-friendly;
- causeways, relay pads, antenna/cable props, Static Skimmers, Lighthouse forms, and VFX motifs are separated enough for later PixelLab/Aseprite work;
- the central scene reads as a dense isometric shoreline without solving scale by zooming out.

Remaining approval questions before runtime art work:

- whether the boss should be lighthouse-tower dominant or more corrupted offshore machine/reef dominant;
- whether Static Skimmers should stay fish/shore-shark-like or become flatter signal-packet skimmers;
- whether the dry safe-spit material should use more sand/grass or stay mostly cracked server coast;
- whether Signal Coast terrain should be primarily gray server masonry or darker basalt/cable infrastructure.

## PixelLab Production Prompts

Use PixelLab after user approval. Keep prompts short and asset-specific. Generate on transparent or flat removable background where possible.

### Terrain Chunks

```text
2:1 isometric pixel art terrain chunks for a close tactical browser game camera, matching chunky dark server-coast masonry from prior levels. Broken cracked server floor plates, flooded coastal edges, cable trenches, safe dry spit tiles, corrupted surf edge, teal signal lights and amber hazard markings, no labels, no UI, no shadows outside the tile, crop-ready isolated chunks.
```

### Relay And Cable Props

```text
2:1 isometric pixel art props, close tactical game scale, grounded relay beacon pads, cable pylons, antenna wreck clusters, server rack debris, offshore signal buoy, dark metal with cyan signal glass and amber objective lights, strong silhouette, transparent or flat background, no labels, no logos, no UI.
```

### Static Skimmer Enemy Frames

```text
Pixel art enemy animation frames for a hostile signal shoreline, Static Skimmer relay jammer, fast low surf-skating silhouette, black metal shell, red corruption vents, cyan static wake, readable at close isometric camera scale, idle / rush / jam / recoil poses, transparent or flat background, no labels.
```

### Lighthouse That Answers Boss Frames

```text
Large 2:1 isometric pixel art boss/event frames for The Lighthouse That Answers, corrupted offshore signal lighthouse tower fused with server machinery and cable roots, cyan beacon core, red corrupted tide cracks, grounded base, no square rug, large padded frame, dormant / sweeping beam / overloading / damaged poses, transparent or flat background, no labels.
```

### Signal Coast VFX

```text
Pixel art VFX sprites for Signal Coast hazards and rewards, clear signal window pulse, relay calibration burst, corrupted tide crack, static field shimmer, cable arc strike, lighthouse beam sweep, Static Skimmer jam spark, cyan/amber/red channel separation, transparent or flat background, crop-ready frames, no text.
```

## Aseprite-Compatible Cleanup Checklist

- Remove generated board background and isolate each source asset.
- Preserve nearest-neighbor pixel edges; do not smooth-resample final sprites.
- Normalize isometric anchor points: props/bosses sit on their lowest contact base; enemies use belly/foot contact.
- Pad large boss frames generously so alpha never touches the atlas edge.
- Keep terrain chunks flat enough to tile/overlap without raised block-wall artifacts.
- Verify safe-spit, corrupted surf, static field, cable arc, relay objective, enemy, boss, pickup, player projectile, and extraction channels remain visually distinct in close-camera proof.
- Do not repair weak source art with Python/Pillow drawing. Regenerate in ChatGPT Images or PixelLab, or clean manually in Aseprite/Pixelorama.

## Runtime Status

Not runtime-wired. No manifest entries, provenance acceptance entries, packer, or runtime replacement should be added until the user approves the art direction.
