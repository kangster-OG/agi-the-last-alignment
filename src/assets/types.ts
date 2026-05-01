export type AssetStatus = "planned" | "concept" | "raw" | "cleaned" | "production" | "code_placeholder";

export type AssetCategory =
  | "concept_art"
  | "player_sprite"
  | "enemy_sprite"
  | "boss_sprite"
  | "pickup_sprite"
  | "map_tile"
  | "landmark_prop"
  | "overworld_landmark"
  | "ui"
  | "portrait"
  | "faction_logo_placeholder"
  | "third_party_logo";

export interface AssetDimensions {
  width: number;
  height: number;
}

export interface AssetAnimationMetadata {
  name: string;
  directions: number | null;
  framesPerDirection: number | null;
}

export interface AssetFrameMetadata {
  kind: "single" | "sheet" | "atlas";
  frameWidth: number | null;
  frameHeight: number | null;
  frameCount: number | null;
  animations: AssetAnimationMetadata[];
}

export interface AssetManifestEntry {
  id: string;
  category: AssetCategory;
  intendedUse: string;
  status: AssetStatus;
  sourcePath: string;
  dimensions: AssetDimensions | null;
  frames: AssetFrameMetadata | null;
  provenanceKey: string;
  licenseNote: string;
  mitIncluded: boolean;
  tags: string[];
  notes: string;
}

export interface AssetIdTaxonomy {
  concept: string;
  player: string;
  enemy: string;
  boss: string;
  pickup: string;
  tile: string;
  prop: string;
  ui: string;
  portrait: string;
  factionLogoPlaceholder: string;
  thirdPartyLogo: string;
}

export interface AssetManifest {
  manifestVersion: number;
  project: string;
  assetRoot: string;
  updated: string;
  idTaxonomy: AssetIdTaxonomy;
  assets: AssetManifestEntry[];
}
