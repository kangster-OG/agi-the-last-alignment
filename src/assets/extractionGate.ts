import { Assets, Rectangle, Texture } from "pixi.js";

import extractionGateSheetUrl from "../../assets/props/armistice_plaza/extraction_gate_sheet.png";

export const EXTRACTION_GATE_ASSET_ID = "prop.armistice_plaza.extraction_gate.production_sheet_v1";
export const EXTRACTION_GATE_ASSET_URL = extractionGateSheetUrl;

export type ExtractionGateFrame = "closed" | "opening" | "active";

export interface ExtractionGateTextures {
  frames: Record<ExtractionGateFrame, Texture>;
}

const FRAME_SIZE = 256;
const FRAME_ORDER: ExtractionGateFrame[] = ["closed", "opening", "active"];

let extractionGatePromise: Promise<ExtractionGateTextures> | null = null;
let extractionGateTextures: ExtractionGateTextures | null = null;

export function getExtractionGateTextures(): ExtractionGateTextures | null {
  return extractionGateTextures;
}

export function loadExtractionGateTextures(): Promise<ExtractionGateTextures> {
  extractionGatePromise ??= Assets.load<Texture>(EXTRACTION_GATE_ASSET_URL).then((sheet) => {
    const frames = {} as Record<ExtractionGateFrame, Texture>;
    FRAME_ORDER.forEach((key, index) => {
      frames[key] = new Texture({
        source: sheet.source,
        frame: new Rectangle(index * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE)
      });
    });
    extractionGateTextures = { frames };
    return extractionGateTextures;
  });
  return extractionGatePromise;
}

