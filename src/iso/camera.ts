import type { Container } from "pixi.js";
import { worldToIso } from "./projection";

export class IsoCamera {
  worldX = 0;
  worldY = 0;
  zoom = 1;

  follow(worldX: number, worldY: number, smoothing = 0.12): void {
    this.worldX += (worldX - this.worldX) * smoothing;
    this.worldY += (worldY - this.worldY) * smoothing;
  }

  apply(container: Container, viewportWidth: number, viewportHeight: number): void {
    const center = worldToIso(this.worldX, this.worldY);
    container.scale.set(this.zoom);
    container.position.set(
      viewportWidth * 0.5 - center.screenX * this.zoom,
      viewportHeight * 0.46 - center.screenY * this.zoom
    );
  }
}
