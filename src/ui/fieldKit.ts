import { Container, Graphics, Text } from "pixi.js";
import { fontStyle } from "../core/Assets";

export const fieldKit = {
  ink: 0x0b1117,
  text: "#e7f4ef",
  textSoft: "#a9c4bf",
  textMuted: "#6f8985",
  panel: 0x111820,
  panelLift: 0x17222a,
  panelDeep: 0x090d12,
  line: 0x31454d,
  metal: 0x4a5d63,
  teal: 0x42d7c6,
  tealLight: 0x72eadc,
  amber: 0xf3b34f,
  amberLight: 0xffd37a,
  blue: 0x55a9e6,
  red: 0xe0524d,
  violet: 0x9d7add,
  shadow: 0x030609,
  backdrop: 0x0b1117,
  backdropBand: 0x111820
} as const;

export type FieldPanelTone = "neutral" | "teal" | "amber" | "red" | "violet" | "blue";

interface PanelOptions {
  title?: string;
  kicker?: string;
  tone?: FieldPanelTone;
  selected?: boolean;
  alpha?: number;
  headerHeight?: number;
  signalTabs?: boolean;
}

export function toneColor(tone: FieldPanelTone = "neutral"): number {
  if (tone === "teal") return fieldKit.teal;
  if (tone === "amber") return fieldKit.amber;
  if (tone === "red") return fieldKit.red;
  if (tone === "violet") return fieldKit.violet;
  if (tone === "blue") return fieldKit.blue;
  return fieldKit.metal;
}

export function drawFieldBackdrop(layer: Container, width: number, height: number, title?: string): void {
  const g = new Graphics();
  g.rect(0, 0, width, height).fill(fieldKit.backdrop);
  g.rect(0, 0, width, 92).fill({ color: fieldKit.backdropBand, alpha: 0.94 });
  g.rect(0, height - 72, width, 72).fill({ color: fieldKit.panelDeep, alpha: 0.92 });
  g.rect(0, 92, width, 1).fill({ color: fieldKit.line, alpha: 0.76 });
  g.rect(0, height - 73, width, 1).fill({ color: fieldKit.line, alpha: 0.62 });
  g.rect(24, 91, Math.min(260, width - 48), 2).fill({ color: fieldKit.teal, alpha: 0.82 });
  g.rect(width - Math.min(320, width - 48) - 24, height - 73, Math.min(320, width - 48), 2).fill({ color: fieldKit.amber, alpha: 0.66 });
  layer.addChild(g);

  if (title) {
    const label = new Text({
      text: title,
      style: { ...fontStyle, fontSize: 11, fill: fieldKit.textSoft, stroke: { color: "#030609", width: 3 }, letterSpacing: 1 }
    });
    label.position.set(24, 16);
    layer.addChild(label);
  }
}

export function drawFieldPanel(layer: Container, x: number, y: number, w: number, h: number, options: PanelOptions = {}): Graphics {
  const tone = toneColor(options.tone);
  const headerHeight = options.headerHeight ?? (options.title || options.kicker ? 40 : 0);
  const alpha = options.alpha ?? 0.9;
  const g = new Graphics();

  g.rect(x + 7, y + 8, w, h).fill({ color: fieldKit.shadow, alpha: Math.min(0.46, alpha * 0.36) });
  g.rect(x, y, w, h)
    .fill({ color: options.selected ? fieldKit.panelLift : fieldKit.panel, alpha })
    .stroke({ color: options.selected ? tone : fieldKit.line, width: options.selected ? 2 : 1, alpha: options.selected ? 0.95 : 0.72 });
  g.rect(x + 1, y + 1, w - 2, h - 2).stroke({ color: 0xffffff, width: 1, alpha: options.selected ? 0.08 : 0.045 });
  g.rect(x, y, 3, h).fill({ color: tone, alpha: options.selected ? 0.94 : 0.68 });
  g.rect(x + 12, y + h - 3, Math.max(46, w * 0.18), 3).fill({ color: tone, alpha: 0.7 });
  g.rect(x + w - Math.max(58, w * 0.2) - 12, y + 10, Math.max(58, w * 0.2), 2).fill({ color: tone, alpha: 0.52 });

  if (headerHeight > 0) {
    g.rect(x + 1, y + 1, w - 2, headerHeight).fill({ color: fieldKit.panelDeep, alpha: 0.58 });
    g.rect(x + 16, y + headerHeight - 5, Math.max(48, w * 0.24), 2).fill({ color: tone, alpha: 0.84 });
  }

  if (options.signalTabs) {
    const tabY = y + h - 16;
    const colors = [fieldKit.teal, fieldKit.amber, fieldKit.blue, fieldKit.violet, fieldKit.red];
    for (let i = 0; i < colors.length; i += 1) {
      g.rect(x + 18 + i * 18, tabY, 10, 3).fill({ color: colors[i], alpha: i === 0 || options.selected ? 0.82 : 0.34 });
    }
  }

  layer.addChild(g);
  drawPanelHeader(layer, x, y, w, headerHeight, options);
  return g;
}

export function drawStatusRail(layer: Container, x: number, y: number, w: number, h: number, progress: number, tone: FieldPanelTone = "teal"): void {
  const g = new Graphics();
  const color = toneColor(tone);
  const clamped = Math.min(1, Math.max(0, progress));
  g.rect(x, y, w, h).fill({ color: fieldKit.panelDeep, alpha: 0.9 }).stroke({ color: fieldKit.line, width: 1, alpha: 0.72 });
  g.rect(x + 2, y + 2, Math.max(0, (w - 4) * clamped), Math.max(0, h - 4)).fill({ color, alpha: 0.9 });
  g.rect(x + 2, y + 2, w - 4, 1).fill({ color: 0xffffff, alpha: 0.12 });
  layer.addChild(g);
}

export function drawToken(layer: Container, x: number, y: number, label: string, tone: FieldPanelTone = "teal", selected = false): void {
  const color = toneColor(tone);
  const g = new Graphics();
  g.rect(x + 3, y + 4, 38, 30).fill({ color: fieldKit.shadow, alpha: 0.34 });
  g.rect(x, y, 38, 30)
    .fill({ color: selected ? fieldKit.panelLift : fieldKit.panelDeep, alpha: 0.94 })
    .stroke({ color, width: selected ? 2 : 1, alpha: selected ? 0.95 : 0.72 });
  g.rect(x + 5, y + 5, 28, 3).fill({ color, alpha: 0.75 });
  layer.addChild(g);

  const text = new Text({
    text: label,
    style: { ...fontStyle, fontSize: 10, fill: fieldKit.text, stroke: { color: "#030609", width: 3 }, align: "center" }
  });
  text.anchor.set(0.5);
  text.position.set(x + 19, y + 18);
  layer.addChild(text);
}

function drawPanelHeader(layer: Container, x: number, y: number, w: number, headerHeight: number, options: PanelOptions): void {
  if (!options.title && !options.kicker) return;
  const header = new Text({
    text: [options.title, options.kicker].filter(Boolean).join("\n"),
    style: {
      ...fontStyle,
      fontSize: options.kicker ? 11 : 13,
      fill: fieldKit.text,
      stroke: { color: "#030609", width: 3 },
      align: "center",
      lineHeight: 16
    }
  });
  header.anchor.set(0.5);
  header.position.set(x + w / 2, y + Math.max(18, headerHeight / 2));
  layer.addChild(header);
}

export function drawSourceBadge(layer: Container, x: number, y: number, w: number, tone: FieldPanelTone, label: string): void {
  const color = toneColor(tone);
  const g = new Graphics();
  g.rect(x, y, w, 34).fill({ color: fieldKit.panelDeep, alpha: 0.92 }).stroke({ color, width: 1, alpha: 0.82 });
  g.rect(x + 8, y + 8, 18, 3).fill({ color, alpha: 0.84 });
  layer.addChild(g);

  const text = new Text({
    text: label,
    style: { ...fontStyle, fontSize: 11, fill: fieldKit.text, stroke: { color: "#030609", width: 3 }, align: "center" }
  });
  text.anchor.set(0.5);
  text.position.set(x + w / 2, y + 17);
  layer.addChild(text);
}

export function sourcePanelSprite(): null {
  return null;
}

export function fieldText(
  text: string,
  x: number,
  y: number,
  options: { size?: number; fill?: string; width?: number; align?: "left" | "center" | "right"; lineHeight?: number } = {}
): Text {
  const t = new Text({
    text,
    style: {
      ...fontStyle,
      fontSize: options.size ?? 12,
      fill: options.fill ?? fieldKit.text,
      stroke: { color: "#030609", width: options.size && options.size <= 10 ? 2 : 1 },
      align: options.align ?? "left",
      wordWrap: Boolean(options.width),
      wordWrapWidth: options.width,
      lineHeight: options.lineHeight
    }
  });
  t.position.set(x, y);
  return t;
}
