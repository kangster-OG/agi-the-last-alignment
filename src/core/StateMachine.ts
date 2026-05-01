import type { Game } from "./Game";

export type GameMode =
  | "Boot"
  | "MainMenu"
  | "BuildSelect"
  | "OverworldMap"
  | "OnlineCoop"
  | "AssetPreview"
  | "ArenaBriefing"
  | "LevelRun"
  | "UpgradeDraft"
  | "LevelComplete"
  | "GameOver";

export interface GameState {
  readonly mode: GameMode;
  enter(game: Game): void;
  exit(game: Game): void;
  update(game: Game, dt: number): void;
  render(game: Game): void;
}

export class StateMachine {
  current: GameState | null = null;

  constructor(private readonly game: Game) {}

  set(next: GameState): void {
    this.current?.exit(this.game);
    this.current = next;
    next.enter(this.game);
    next.render(this.game);
  }

  update(dt: number): void {
    this.current?.update(this.game, dt);
  }

  render(): void {
    this.current?.render(this.game);
  }
}
