// ============================================================
// TWISTED LOVES - SOUL Sprite Controller
// Manages the player's SOUL (red heart) movement within the
// battle box during the enemy attack phase.
// Uses Phaser's built-in keyboard input and sprite system.
// ============================================================

import Phaser from 'phaser';
import { SOUL, BATTLE_BOX } from '../../constants';

export class SoulSprite {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Sprite;
  private active: boolean = false;

  // Movement
  private speed: number = SOUL.speed;
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  private boxBounds: { x: number; y: number; width: number; height: number } = {
    x: BATTLE_BOX.defaultX,
    y: BATTLE_BOX.defaultY,
    width: BATTLE_BOX.defaultWidth,
    height: BATTLE_BOX.defaultHeight,
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Create SOUL sprite at center of battle box
    this.sprite = scene.add.sprite(
      BATTLE_BOX.defaultX + BATTLE_BOX.defaultWidth / 2,
      BATTLE_BOX.defaultY + BATTLE_BOX.defaultHeight / 2,
      'soul',
    );
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setVisible(false);
    this.sprite.setDepth(100); // SOUL always on top

    // Set up keyboard input
    this.cursorKeys = scene.input.keyboard.createCursorKeys();
  }

  /** Set whether the SOUL is active (visible and controllable) */
  setActive(active: boolean): void {
    this.active = active;
    this.sprite.setVisible(active);
    if (active) {
      // Reset to center of battle box
      this.sprite.setPosition(
        this.boxBounds.x + this.boxBounds.width / 2,
        this.boxBounds.y + this.boxBounds.height / 2,
      );
    }
  }

  /** Check if SOUL is currently active */
  isActive(): boolean {
    return this.active;
  }

  /** Update SOUL position based on keyboard input */
  update(): void {
    if (!this.active) return;

    let dx = 0;
    let dy = 0;

    if (this.cursorKeys.left.isDown) dx -= 1;
    if (this.cursorKeys.right.isDown) dx += 1;
    if (this.cursorKeys.up.isDown) dy -= 1;
    if (this.cursorKeys.down.isDown) dy += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const factor = 0.707; // ~1/sqrt(2)
      dx *= factor;
      dy *= factor;
    }

    this.sprite.x += dx * this.speed;
    this.sprite.y += dy * this.speed;

    // Clamp to battle box boundaries
    const halfSize = SOUL.size / 2;
    this.sprite.x = Phaser.Math.Clamp(
      this.sprite.x,
      this.boxBounds.x + BATTLE_BOX.borderWidth + halfSize,
      this.boxBounds.x + this.boxBounds.width - BATTLE_BOX.borderWidth - halfSize,
    );
    this.sprite.y = Phaser.Math.Clamp(
      this.sprite.y,
      this.boxBounds.y + BATTLE_BOX.borderWidth + halfSize,
      this.boxBounds.y + this.boxBounds.height - BATTLE_BOX.borderWidth - halfSize,
    );
  }

  /** Update battle box bounds for SOUL clamping */
  setBoxBounds(bounds: { x: number; y: number; width: number; height: number }): void {
    this.boxBounds = bounds;
  }

  /** Reset to default battle box bounds */
  resetBoxBounds(): void {
    this.boxBounds = {
      x: BATTLE_BOX.defaultX,
      y: BATTLE_BOX.defaultY,
      width: BATTLE_BOX.defaultWidth,
      height: BATTLE_BOX.defaultHeight,
    };
  }

  /** Get SOUL position (for collision detection) */
  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /** Set SOUL speed */
  setSpeed(speed: number): void {
    this.speed = speed;
  }

  /** Destroy the sprite */
  destroy(): void {
    this.sprite.destroy();
  }
}
