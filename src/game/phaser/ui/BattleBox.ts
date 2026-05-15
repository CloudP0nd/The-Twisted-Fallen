// ============================================================
// TWISTED LOVES - Battle Box
// The white-bordered rectangle where battle action takes place.
// In Undertale, this box contains dialogue text and the SOUL
// dodge area. It can resize during attack phases.
// ============================================================

import Phaser from 'phaser';
import { BATTLE_BOX, COLORS } from '../../constants';

export class BattleBox {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;

  // Current box dimensions
  private x: number = BATTLE_BOX.defaultX;
  private y: number = BATTLE_BOX.defaultY;
  private width: number = BATTLE_BOX.defaultWidth;
  private height: number = BATTLE_BOX.defaultHeight;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.draw();
  }

  /** Draw the battle box (black fill + white border) */
  private draw(): void {
    this.graphics.clear();

    // Black fill
    this.graphics.fillStyle(0x000000, 1);
    this.graphics.fillRect(this.x, this.y, this.width, this.height);

    // White border
    this.graphics.lineStyle(BATTLE_BOX.borderWidth, 0xffffff, 1);
    this.graphics.strokeRect(this.x, this.y, this.width, this.height);
  }

  /** Animate the battle box to new dimensions (Undertale shrinks/expands the box) */
  animateTo(
    x: number,
    y: number,
    width: number,
    height: number,
    duration: number = 300,
  ): void {
    this.scene.tweens.add({
      targets: this,
      x,
      y,
      width,
      height,
      duration,
      ease: 'Power2',
      onUpdate: () => this.draw(),
    });
  }

  /** Reset to default dimensions */
  reset(): void {
    this.x = BATTLE_BOX.defaultX;
    this.y = BATTLE_BOX.defaultY;
    this.width = BATTLE_BOX.defaultWidth;
    this.height = BATTLE_BOX.defaultHeight;
    this.draw();
  }

  /** Get current bounds (for SOUL clamping) */
  getBounds(): { x: number; y: number; width: number; height: number } {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  /** Set box dimensions immediately (no animation) */
  setBounds(x: number, y: number, width: number, height: number): void {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.draw();
  }

  /** Get the inner text area starting position */
  getTextPosition(): { x: number; y: number } {
    return {
      x: this.x + 20,
      y: this.y + 24,
    };
  }

  /** Set depth of the graphics object */
  setDepth(depth: number): void {
    this.graphics.setDepth(depth);
  }

  /** Set visibility of the battle box */
  setVisible(visible: boolean): void {
    this.graphics.setVisible(visible);
  }

  /** Destroy the graphics object */
  destroy(): void {
    this.graphics.destroy();
  }
}
