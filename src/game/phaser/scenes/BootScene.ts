// ============================================================
// TWISTED LOVES - Boot Scene
// Initial scene that generates all CanvasTextures from
// PixelGrid data and creates the SOUL texture.
// Transitions to BattleScene once all assets are ready.
// ============================================================

import Phaser from 'phaser';
import { createTextureFromPixelGrid, createSoulTexture } from '../data/TextureGenerator';
import { FRISK_SPRITE } from '../../sprites/frisk';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Display loading text
    const loadingText = this.add.text(320, 240, 'Loading...', {
      fontFamily: '"DotumChe", "Courier New", monospace',
      fontSize: '20px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5, 0.5);
  }

  create(): void {
    // --- Generate CanvasTextures from PixelGrid data ---

    // Generate Frisk part textures (pixelSize=3 for enemy display)
    for (const part of FRISK_SPRITE.parts) {
      const textureKey = `${FRISK_SPRITE.id}_${part.id}`;
      // Check if texture already exists to avoid key collision
      if (!this.textures.exists(textureKey)) {
        createTextureFromPixelGrid(this, textureKey, part.pixels, 3);
      }
    }

    // Generate SOUL texture (heart shape)
    if (!this.textures.exists('soul')) {
      createSoulTexture(this, 'soul', 16, '#ff0000');
    }

    // Generate small SOUL for menu indicator
    if (!this.textures.exists('soul_small')) {
      createSoulTexture(this, 'soul_small', 10, '#ff0000');
    }

    // Transition to BattleScene
    this.scene.start('BattleScene');
  }
}
