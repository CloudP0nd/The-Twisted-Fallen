// ============================================================
// TWISTED LOVES - Game Loop
// Manages requestAnimationFrame loop with fixed timestep
// ============================================================

export class GameLoop {
  private running = false;
  private lastTime = 0;
  private accumulator = 0;
  private readonly fixedDelta: number;
  private rafId: number | null = null;

  private updateFn: (dt: number) => void;
  private renderFn: () => void;

  constructor(
    targetFPS: number,
    update: (dt: number) => void,
    render: () => void,
  ) {
    this.fixedDelta = 1000 / targetFPS;
    this.updateFn = update;
    this.renderFn = render;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.tick(this.lastTime);
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  isRunning(): boolean {
    return this.running;
  }

  private tick = (currentTime: number): void => {
    if (!this.running) return;

    const elapsed = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Prevent spiral of death (e.g. tab was backgrounded)
    this.accumulator += Math.min(elapsed, this.fixedDelta * 5);

    // Fixed timestep updates
    while (this.accumulator >= this.fixedDelta) {
      this.updateFn(this.fixedDelta);
      this.accumulator -= this.fixedDelta;
    }

    // Render once per frame
    this.renderFn();

    this.rafId = requestAnimationFrame(this.tick);
  };
}
