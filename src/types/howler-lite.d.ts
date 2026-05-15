declare module "howler" {
  export interface HowlOptions {
    src: string[];
    loop?: boolean;
    volume?: number;
    preload?: boolean;
    html5?: boolean;
  }

  export type HowlEventName = "end" | "load" | "loaderror" | "playerror" | string;

  export class Howl {
    constructor(options: HowlOptions);
    play(id?: number | string): number;
    stop(id?: number): this;
    unload(): this;
    loop(loop?: boolean, id?: number): boolean | this;
    volume(volume?: number, id?: number): number | this;
    fade(from: number, to: number, duration: number, id?: number): this;
    once(event: HowlEventName, callback: (...args: unknown[]) => void, id?: number): this;
  }

  export const Howler: {
    autoUnlock: boolean;
    usingWebAudio: boolean;
    volume(volume?: number): number | void;
    ctx?: AudioContext;
  };
}
