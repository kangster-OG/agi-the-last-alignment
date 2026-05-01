export class FixedTicker {
  private accumulator = 0;
  readonly fixedDt = 1 / 60;

  step(deltaSeconds: number, update: (dt: number) => void): void {
    this.accumulator += Math.min(deltaSeconds, 0.12);
    while (this.accumulator >= this.fixedDt) {
      update(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }
  }

  advance(ms: number, update: (dt: number) => void): void {
    const steps = Math.max(1, Math.round(ms / (1000 / 60)));
    for (let i = 0; i < steps; i += 1) {
      update(this.fixedDt);
    }
  }
}
