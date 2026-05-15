// ============================================================
// TWISTED LOVES - Phaser Game Configuration
// Core Phaser 4 configuration for the game engine
// ============================================================

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { BattleScene } from './scenes/BattleScene';

/** Phaser game configuration — Undertale resolution 640×480 with pixel art mode */
export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,            // WebGL preferred, Canvas fallback
  width: 640,
  height: 480,
  pixelArt: true,               // NEAREST filter for crisp pixel art
  backgroundColor: '#000000',   // Undertale black background
  scale: {
    mode: Phaser.Scale.FIT,     // Fit within parent container
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, BattleScene],
};
