import manifestJson from "../../assets/asset_manifest.json";
import type { AssetCategory, AssetManifest, AssetManifestEntry, AssetStatus } from "./types";

export const assetManifest = manifestJson as AssetManifest;

export const ASSET_MANIFEST_VERSION = assetManifest.manifestVersion;

const assetsById = new Map(assetManifest.assets.map((asset) => [asset.id, asset]));

export function getAssetById(id: string): AssetManifestEntry | undefined {
  return assetsById.get(id);
}

export function requireAssetById(id: string): AssetManifestEntry {
  const asset = getAssetById(id);
  if (!asset) {
    throw new Error(`Unknown asset id: ${id}`);
  }
  return asset;
}

export function getAssetsByCategory(category: AssetCategory): AssetManifestEntry[] {
  return assetManifest.assets.filter((asset) => asset.category === category);
}

export function getAssetsByStatus(status: AssetStatus): AssetManifestEntry[] {
  return assetManifest.assets.filter((asset) => asset.status === status);
}

export function resolveAssetPath(id: string): string | null {
  const asset = requireAssetById(id);
  return asset.status === "planned" ? null : asset.sourcePath;
}

export function isRuntimeReadyAsset(id: string | null | undefined): boolean {
  if (!id) return false;
  const asset = getAssetById(id);
  return Boolean(asset && (asset.status === "cleaned" || asset.status === "production") && asset.sourcePath);
}

export function assetPipelineSummary() {
  const countsByStatus = assetManifest.assets.reduce<Record<string, number>>((counts, asset) => {
    counts[asset.status] = (counts[asset.status] ?? 0) + 1;
    return counts;
  }, {});

  return {
    manifestVersion: assetManifest.manifestVersion,
    totalAssets: assetManifest.assets.length,
    countsByStatus,
    placeholderMode: true,
    thirdPartyLogosTracked: getAssetsByCategory("third_party_logo").length,
    productionAssets: getAssetsByStatus("production").length
  };
}
