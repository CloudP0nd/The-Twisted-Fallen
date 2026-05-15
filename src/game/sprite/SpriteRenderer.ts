// ============================================================
// TWISTED LOVES - Sprite Renderer
// Renders pixel grids onto a canvas context
// ============================================================

import { PixelGrid, Pixel } from '../types';

export class SpriteRenderer {
  /**
   * Render a pixel grid onto the canvas at the specified position.
   * Each pixel in the grid maps to a `pixelSize x pixelSize` area on canvas.
   */
  static renderPixelGrid(
    ctx: CanvasRenderingContext2D,
    grid: PixelGrid,
    x: number,
    y: number,
    pixelSize: number = 2,
  ): void {
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const pixel: Pixel = grid[row][col];
        if (pixel !== null) {
          ctx.fillStyle = pixel;
          ctx.fillRect(
            x + col * pixelSize,
            y + row * pixelSize,
            pixelSize,
            pixelSize,
          );
        }
      }
    }
  }

  /**
   * Create an offscreen canvas with the sprite pre-rendered.
   * Useful for sprites that don't change every frame.
   */
  static createSpriteCanvas(
    grid: PixelGrid,
    pixelSize: number = 2,
  ): HTMLCanvasElement {
    const width = (grid[0]?.length ?? 0) * pixelSize;
    const height = grid.length * pixelSize;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d')!;
    this.renderPixelGrid(ctx, grid, 0, 0, pixelSize);

    return canvas;
  }
}
