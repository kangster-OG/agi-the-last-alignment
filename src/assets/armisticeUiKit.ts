import { Assets, Rectangle, Texture } from "pixi.js";

import armisticeUiKitUrl from "../../assets/ui/armistice_field_terminal_ui_v1.png";

export const ARMISTICE_UI_KIT_ASSET_IDS = {
  atlas: "ui.armistice_field_terminal.runtime_atlas_v1"
} as const;

export const ARMISTICE_UI_KIT_ASSET_URLS = {
  atlas: armisticeUiKitUrl
} as const;

export type ArmisticeUiKitTextureKey =
  | "panel"
  | "chip"
  | "meter"
  | "pickup"
  | "card"
  | "route"
  | "summary"
  | "warning"
  | "anchorBadge"
  | "synergyBadge"
  | "connectorTeal"
  | "connectorAmber"
  | "connectorViolet"
  | "connectorRed"
  | "button"
  | "screen"
  | "tokenProof"
  | "tokenAnchor"
  | "tokenShard"
  | "tokenPatch"
  | "tokenDraft"
  | "tokenData"
  | "tokenSupply"
  | "tokenCredits"
  | "microTeal"
  | "microAmber"
  | "microRed"
  | "microViolet";

export type ArmisticeUiKitTextures = Record<ArmisticeUiKitTextureKey, Texture>;

const FRAMES: Record<ArmisticeUiKitTextureKey, Rectangle> = {
  panel: new Rectangle(0, 0, 704, 320),
  chip: new Rectangle(704, 0, 512, 112),
  meter: new Rectangle(1216, 0, 320, 80),
  pickup: new Rectangle(0, 320, 768, 128),
  card: new Rectangle(768, 320, 256, 360),
  route: new Rectangle(1024, 320, 512, 360),
  summary: new Rectangle(0, 704, 704, 320),
  warning: new Rectangle(704, 704, 288, 96),
  anchorBadge: new Rectangle(992, 704, 288, 96),
  synergyBadge: new Rectangle(1280, 704, 288, 96),
  connectorTeal: new Rectangle(704, 832, 512, 40),
  connectorAmber: new Rectangle(704, 872, 512, 40),
  connectorViolet: new Rectangle(704, 912, 512, 40),
  connectorRed: new Rectangle(704, 952, 512, 40),
  button: new Rectangle(1216, 832, 384, 80),
  screen: new Rectangle(1216, 912, 384, 192),
  tokenProof: new Rectangle(0, 1040, 64, 64),
  tokenAnchor: new Rectangle(64, 1040, 64, 64),
  tokenShard: new Rectangle(128, 1040, 64, 64),
  tokenPatch: new Rectangle(192, 1040, 64, 64),
  tokenDraft: new Rectangle(256, 1040, 64, 64),
  tokenData: new Rectangle(320, 1040, 64, 64),
  tokenSupply: new Rectangle(384, 1040, 64, 64),
  tokenCredits: new Rectangle(448, 1040, 64, 64),
  microTeal: new Rectangle(512, 1040, 96, 20),
  microAmber: new Rectangle(512, 1064, 96, 20),
  microRed: new Rectangle(512, 1088, 96, 20),
  microViolet: new Rectangle(512, 1112, 96, 20)
};

let uiKitPromise: Promise<ArmisticeUiKitTextures> | null = null;
let uiKitTextures: ArmisticeUiKitTextures | null = null;

export function getArmisticeUiKitTextures(): ArmisticeUiKitTextures | null {
  return uiKitTextures;
}

export function loadArmisticeUiKit(): Promise<ArmisticeUiKitTextures> {
  uiKitPromise ??= Assets.load<Texture>(ARMISTICE_UI_KIT_ASSET_URLS.atlas).then((atlas) => {
    uiKitTextures = Object.fromEntries(
      Object.entries(FRAMES).map(([key, frame]) => [
        key,
        new Texture({
          source: atlas.source,
          frame
        })
      ])
    ) as ArmisticeUiKitTextures;
    return uiKitTextures;
  });
  return uiKitPromise;
}
