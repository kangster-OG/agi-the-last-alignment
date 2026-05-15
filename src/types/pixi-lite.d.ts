export class Container {
  [key: string]: any;
  children: any[];
  constructor(...args: any[]);
  addChild<T extends any[]>(...children: T): T[number];
  removeChild<T extends any[]>(...children: T): T[number];
  removeChildren(): any[];
  destroy(...args: any[]): void;
}

export class Graphics extends Container {
  clear(): this;
  rect(...args: any[]): this;
  roundRect(...args: any[]): this;
  circle(...args: any[]): this;
  ellipse(...args: any[]): this;
  poly(...args: any[]): this;
  moveTo(...args: any[]): this;
  lineTo(...args: any[]): this;
  stroke(...args: any[]): this;
  fill(...args: any[]): this;
}

export class Sprite extends Container {
  static from(...args: any[]): Sprite;
  texture: Texture;
  anchor: { set: (...args: any[]) => void; x: number; y: number };
  scale: { set: (...args: any[]) => void; x: number; y: number };
  constructor(...args: any[]);
}

export class Text extends Container {
  text: string;
  style: any;
  anchor: { set: (...args: any[]) => void; x: number; y: number };
  constructor(...args: any[]);
}

export class Texture {
  static EMPTY: Texture;
  static WHITE: Texture;
  static from(...args: any[]): Texture;
  source: any;
  frame: Rectangle;
  orig: Rectangle;
  trim?: Rectangle;
  width: number;
  height: number;
  constructor(...args: any[]);
  destroy(...args: any[]): void;
}

export class Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  constructor(x?: number, y?: number, width?: number, height?: number);
}

export const Assets: {
  [key: string]: any;
  load<T = any>(...args: any[]): Promise<T>;
  add(...args: any[]): void;
  get<T = any>(...args: any[]): T;
};

export class Application {
  [key: string]: any;
  stage: Container;
  renderer: any;
  canvas: HTMLCanvasElement;
  ticker: { add(callback: (ticker: { deltaMS: number }) => void): void };
  constructor(...args: any[]);
  init(...args: any[]): Promise<void>;
  destroy(...args: any[]): void;
}
