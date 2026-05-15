// ============================================================
// TWISTED LOVES - Texture Generator
// Converts PixelGrid data to Phaser CanvasTexture for
// pixel-perfect rendering with the Phaser engine
// ============================================================

import Phaser from 'phaser';
import { PixelGrid } from '../../types';

/**
 * Generate a Phaser CanvasTexture from a PixelGrid definition.
 * Each pixel in the grid becomes a pixelSize×pixelSize block in the texture,
 * preserving the pixel art aesthetic when rendered at any scale.
 *
 * @param scene    - The Phaser.Scene that owns the texture manager
 * @param key      - Unique texture key for lookup in the TextureManager
 * @param grid     - 2D pixel grid (hex color string or null for transparent)
 * @param pixelSize - Scale factor per logical pixel (e.g. 3 = each pixel → 3×3 block)
 */
export function createTextureFromPixelGrid(
  scene: Phaser.Scene,
  key: string,
  grid: PixelGrid,
  pixelSize: number = 1,
): Phaser.Textures.CanvasTexture {
  const width = (grid[0]?.length ?? 0) * pixelSize;
  const height = grid.length * pixelSize;

  const canvasTexture = scene.textures.createCanvas(key, width, height);
  const ctx = canvasTexture.getContext();

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const pixel = grid[row][col];
      if (pixel !== null) {
        ctx.fillStyle = pixel;
        ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
      }
    }
  }

  // Must call refresh() after drawing to update the WebGL texture
  canvasTexture.refresh();
  return canvasTexture;
}

/**
 * Generate a heart-shaped texture for the SOUL sprite.
 * Creates a small CanvasTexture with the classic Undertale heart shape.
 *
 * @param scene  - The Phaser.Scene
 * @param key    - Texture key (default: 'soul')
 * @param size   - Overall size of the heart in pixels
 * @param color  - Fill color as hex string
 */
export function createSoulTexture(
  scene: Phaser.Scene,
  key: string = 'soul',
  size: number = 16,
  color: string = '#ff0000',
): Phaser.Textures.CanvasTexture {
  const canvasTexture = scene.textures.createCanvas(key, size, size);
  const ctx = canvasTexture.getContext();

  ctx.fillStyle = color;
  const s = size / 2;

  // Left bump of heart
  ctx.beginPath();
  ctx.arc(s - s * 0.35, s - s * 0.15, s * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Right bump of heart
  ctx.beginPath();
  ctx.arc(s + s * 0.35, s - s * 0.15, s * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Bottom triangle
  ctx.beginPath();
  ctx.moveTo(s - s * 0.8, s - s * 0.05);
  ctx.lineTo(s + s * 0.8, s - s * 0.05);
  ctx.lineTo(s, s + s * 0.9);
  ctx.closePath();
  ctx.fill();

  canvasTexture.refresh();
  return canvasTexture;
}
