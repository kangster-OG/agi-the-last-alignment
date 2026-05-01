import { Assets, Sprite, Texture } from "pixi.js";

import accordStrikerRawUrl from "../../assets/sprites/players/raw/accord_striker_pixellab_recovered_preview.png";
import accordStrikerTransparentSheetUrl from "../../assets/sprites/players/accord_striker_transparent_sheet.png";

export const ACCORD_STRIKER_RAW_PREVIEW_ID = "player.accord_striker.pixellab_recovered_preview_raw";
export const ACCORD_STRIKER_RAW_PREVIEW_URL = accordStrikerRawUrl;
export const ACCORD_STRIKER_TRANSPARENT_SHEET_ID = "player.accord_striker.transparent_sheet_v1";
export const ACCORD_STRIKER_TRANSPARENT_SHEET_URL = accordStrikerTransparentSheetUrl;

let rawPreviewPromise: Promise<Texture> | null = null;
let rawPreviewTexture: Texture | null = null;
let transparentSheetPromise: Promise<Texture> | null = null;
let transparentSheetTexture: Texture | null = null;

export function accordStrikerRawPreviewReady(): boolean {
  return rawPreviewTexture !== null;
}

export function getAccordStrikerRawPreviewTexture(): Texture | null {
  return rawPreviewTexture;
}

export function getAccordStrikerTransparentSheetTexture(): Texture | null {
  return transparentSheetTexture;
}

export function loadAccordStrikerRawPreview(): Promise<Texture> {
  rawPreviewPromise ??= Assets.load<Texture>(ACCORD_STRIKER_RAW_PREVIEW_URL).then((texture) => {
    rawPreviewTexture = texture;
    return texture;
  });
  return rawPreviewPromise;
}

export function loadAccordStrikerTransparentSheet(): Promise<Texture> {
  transparentSheetPromise ??= Assets.load<Texture>(ACCORD_STRIKER_TRANSPARENT_SHEET_URL).then((texture) => {
    transparentSheetTexture = texture;
    return texture;
  });
  return transparentSheetPromise;
}

export function addAccordStrikerPreviewSprite(parent: { addChild: (sprite: Sprite) => void }, texture: Texture, x: number, y: number, scale: number): Sprite {
  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5, 1);
  sprite.scale.set(scale);
  sprite.position.set(x, y);
  parent.addChild(sprite);
  return sprite;
}
