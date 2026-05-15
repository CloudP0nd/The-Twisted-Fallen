// ============================================================
// TWISTED LOVES - SOUL Controller
// Manages the player's SOUL (red heart) movement in battle box
// ============================================================

import { SoulState, InputState, Direction } from '../types';
import { SOUL, BATTLE_BOX } from '../constants';

export class SoulController {
  private state: SoulState;
  private box = { ...BATTLE_BOX, x: BATTLE_BOX.defaultX, y: BATTLE_BOX.defaultY, width: BATTLE_BOX.defaultWidth, height: BATTLE_BOX.defaultHeight };

  constructor() {
    this.state = {
      x: this.box.x + this.box.width / 2,
      y: this.box.y + this.box.height / 2,
      speed: SOUL.speed,
      active: false,
    };
  }

  getState(): SoulState {
    return { ...this.state };
  }

  setActive(active: boolean): void {
    this.state.active = active;
  }

  isActive(): boolean {
    return this.state.active;
  }

  /** Center the SOUL in the battle box */
  reset(): void {
    this.state.x = this.box.x + this.box.width / 2;
    this.state.y = this.box.y + this.box.height / 2;
  }

  /** Update battle box bounds (can change during attacks) */
  setBox(box: { x: number; y: number; width: number; height: number }): void {
    this.box = box;
  }

  resetBox(): void {
    this.box = {
      x: BATTLE_BOX.defaultX,
      y: BATTLE_BOX.defaultY,
      width: BATTLE_BOX.defaultWidth,
      height: BATTLE_BOX.defaultHeight,
    };
  }

  /** Update SOUL position based on input */
  update(input: InputState): void {
    if (!this.state.active) return;

    let dx = 0;
    let dy = 0;

    if (input.directions.has('left')) dx -= 1;
    if (input.directions.has('right')) dx += 1;
    if (input.directions.has('up')) dy -= 1;
    if (input.directions.has('down')) dy += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const factor = 0.707; // ~1/sqrt(2)
      dx *= factor;
      dy *= factor;
    }

    this.state.x += dx * this.state.speed;
    this.state.y += dy * this.state.speed;

    // Clamp to battle box
    const halfSize = SOUL.size / 2;
    this.state.x = Math.max(
      this.box.x + BATTLE_BOX.borderWidth + halfSize,
      Math.min(this.box.x + this.box.width - BATTLE_BOX.borderWidth - halfSize, this.state.x),
    );
    this.state.y = Math.max(
      this.box.y + BATTLE_BOX.borderWidth + halfSize,
      Math.min(this.box.y + this.box.height - BATTLE_BOX.borderWidth - halfSize, this.state.y),
    );
  }

  /** Render the SOUL (heart shape) */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.state.active) return;

    const x = this.state.x;
    const y = this.state.y;
    const s = SOUL.size / 2;

    ctx.fillStyle = SOUL.color;

    // Draw heart shape using two circles + triangle
    ctx.beginPath();
    // Left bump
    ctx.arc(x - s * 0.35, y - s * 0.15, s * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    // Right bump
    ctx.arc(x + s * 0.35, y - s * 0.15, s * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    // Bottom point
    ctx.moveTo(x - s * 0.8, y - s * 0.05);
    ctx.lineTo(x + s * 0.8, y - s * 0.05);
    ctx.lineTo(x, y + s * 0.9);
    ctx.closePath();
    ctx.fill();
  }
}
