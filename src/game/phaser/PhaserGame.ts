// ============================================================
// TWISTED LOVES - Phaser Game Wrapper
// Manages Phaser.Game lifecycle within a React/Next.js app
// ============================================================

import Phaser from 'phaser';
import { phaserConfig } from './config';

/**
 * Wrapper class that creates and manages a Phaser.Game instance.
 * Designed to be used inside a React useEffect for proper lifecycle management.
 */
export class PhaserGame {
  private game: Phaser.Game | null = null;

  /**
   * Create and mount the Phaser game into the given parent element.
   * @param parent - DOM element to mount the game canvas into
   */
  create(parent: HTMLElement): Phaser.Game {
    if (this.game) {
      this.destroy();
    }

    this.game = new Phaser.Game({
      ...phaserConfig,
      parent,
    });

    return this.game;
  }

  /** Get the Phaser.Game instance (null if not created) */
  getGame(): Phaser.Game | null {
    return this.game;
  }

  /** Destroy the Phaser game and clean up resources */
  destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }

  /** Check if the game is running */
  isRunning(): boolean {
    return this.game !== null && this.game.isRunning;
  }
}
