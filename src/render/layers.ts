import { Container } from "pixi.js";

export interface RenderLayers {
  root: Container;
  background: Container;
  ground: Container;
  decals: Container;
  propsBehind: Container;
  entities: Container;
  propsFront: Container;
  projectiles: Container;
  floatingText: Container;
  hud: Container;
}

export function createLayers(stage: Container): RenderLayers {
  const root = new Container();
  const layers: RenderLayers = {
    root,
    background: new Container(),
    ground: new Container(),
    decals: new Container(),
    propsBehind: new Container(),
    entities: new Container(),
    propsFront: new Container(),
    projectiles: new Container(),
    floatingText: new Container(),
    hud: new Container()
  };

  root.addChild(
    layers.background,
    layers.ground,
    layers.decals,
    layers.propsBehind,
    layers.entities,
    layers.propsFront,
    layers.projectiles,
    layers.floatingText
  );
  stage.addChild(root, layers.hud);
  return layers;
}

export function clearLayer(layer: Container): void {
  layer.removeChildren().forEach((child) => child.destroy({ children: true }));
}

export function clearAllLayers(layers: RenderLayers): void {
  clearLayer(layers.background);
  clearLayer(layers.ground);
  clearLayer(layers.decals);
  clearLayer(layers.propsBehind);
  clearLayer(layers.entities);
  clearLayer(layers.propsFront);
  clearLayer(layers.projectiles);
  clearLayer(layers.floatingText);
  clearLayer(layers.hud);
}
