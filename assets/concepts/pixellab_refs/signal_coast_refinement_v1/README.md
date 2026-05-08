# Signal Coast PixelLab Refinement V1

Date: 2026-05-07

Purpose: preserve the authenticated PixelLab work done for Signal Coast after the user explicitly asked that the art pass use PixelLab, ChatGPT Images, and an Aseprite-compatible workflow.

## PixelLab Output

- `pixellab_signal_coast_gallery_after_terrain_save.png`: in-app browser capture after PixelLab generated and saved a Signal Coast terrain batch with tag `signal_coast_terrain_pixellab_v1`.

## Runtime Use

This PixelLab output is preserved as source/proof reference, not used directly in runtime V1.

Reason: the PixelLab browser session generated and saved the batch, but the export/download path did not expose clean local PNG/ZIP files during this pass. The visible PixelLab batch also did not beat the clean ChatGPT Images source boards enough to justify using a browser screenshot as the runtime art source.

Runtime Signal Coast V1 therefore uses:

- ChatGPT Images source boards under `assets/concepts/chatgpt_refs/signal_coast_source_v1/`;
- mechanical packing via `scripts/assets/pack-signal-coast-source-v1.py`;
- normal close-camera proof inspection through `npm run proof:kettle-coast-graybox`.

## Safety / Credentials

Codex did not handle PixelLab credentials, account secrets, billing, payment, or security prompts. The session was already authenticated in the in-app browser.

## Aseprite-Compatible Follow-Up

If a later pass can export the clean PixelLab batch, use Aseprite or Pixelorama to:

- keep only flat terrain decals that tile without raised-wall artifacts;
- enforce the Signal Coast palette against Armistice, Cooling, and Transit;
- normalize terrain anchors and crop padding;
- export transparent PNG sheets before mechanical atlas packing.
