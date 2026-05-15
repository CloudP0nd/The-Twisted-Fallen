// ============================================================
// TWISTED LOVES - Modular Sprite
// Composes multiple sprite parts into a single character
// ============================================================

import { ModularSpriteDef, SpritePart, Animation, AnimationFrame, Anchor } from '../types';
import { SpriteRenderer } from './SpriteRenderer';

export class ModularSprite {
  private def: ModularSpriteDef;
  private partCanvases: Map<string, HTMLCanvasElement> = new Map();
  private currentAnimation: Animation | null = null;
  private currentFrameIndex = 0;
  private frameTimer = 0;
  private pixelSize: number;

  /** Computed per-part offsets for the current animation frame */
  private computedOffsets: Map<string, Anchor> = new Map();

  constructor(def: ModularSpriteDef, pixelSize: number = 2) {
    this.def = def;
    this.pixelSize = pixelSize;

    // Pre-render each part to an offscreen canvas
    for (const part of def.parts) {
      this.partCanvases.set(
        part.id,
        SpriteRenderer.createSpriteCanvas(part.pixels, pixelSize),
      );
    }

    // Initialize computed offsets from base offsets
    this.resetOffsets();
  }

  /** Get the sprite definition */
  getDefinition(): ModularSpriteDef {
    return this.def;
  }

  /** Play an animation by ID */
  playAnimation(animationId: string): void {
    // Don't restart if already playing the same animation
    if (this.currentAnimation?.id === animationId) return;

    const anim = this.def.animations.find((a) => a.id === animationId);
    if (!anim) {
      console.warn(`Animation "${animationId}" not found on sprite "${this.def.id}"`);
      return;
    }

    this.currentAnimation = anim;
    this.currentFrameIndex = 0;
    this.frameTimer = 0;
    this.applyFrame(anim.frames[0]);
  }

  /** Stop current animation and return to base pose */
  stopAnimation(): void {
    this.currentAnimation = null;
    this.currentFrameIndex = 0;
    this.frameTimer = 0;
    this.resetOffsets();
  }

  /** Update animation state (call each game tick) */
  update(dt: number): void {
    if (!this.currentAnimation) return;

    this.frameTimer += dt;
    const currentFrame = this.currentAnimation.frames[this.currentFrameIndex];

    if (this.frameTimer >= currentFrame.duration) {
      this.frameTimer -= currentFrame.duration;
      this.currentFrameIndex++;

      // Handle animation end
      if (this.currentFrameIndex >= this.currentAnimation.frames.length) {
        if (this.currentAnimation.loop) {
          this.currentFrameIndex = 0;
        } else {
          this.stopAnimation();
          return;
        }
      }

      this.applyFrame(this.currentAnimation.frames[this.currentFrameIndex]);
    }
  }

  /**
   * Render the composed sprite at the given canvas position.
   * Parts are drawn in definition order (first part = background layer).
   */
  render(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    for (const part of this.def.parts) {
      const offset = this.computedOffsets.get(part.id) ?? part.offset;
      const partCanvas = this.partCanvases.get(part.id);
      if (!partCanvas) continue;

      ctx.drawImage(
        partCanvas,
        x + offset.x * this.pixelSize,
        y + offset.y * this.pixelSize,
      );
    }
  }

  /** Get the bounding box of the composed sprite */
  getBounds(): { width: number; height: number } {
    let maxX = 0;
    let maxY = 0;

    for (const part of this.def.parts) {
      const offset = this.computedOffsets.get(part.id) ?? part.offset;
      const partW = (part.pixels[0]?.length ?? 0);
      const partH = part.pixels.length;
      maxX = Math.max(maxX, offset.x + partW);
      maxY = Math.max(maxY, offset.y + partH);
    }

    return { width: maxX * this.pixelSize, height: maxY * this.pixelSize };
  }

  private applyFrame(frame: AnimationFrame): void {
    this.resetOffsets();
    for (const [partId, offset] of Object.entries(frame.partOffsets)) {
      const part = this.def.parts.find((p) => p.id === partId);
      if (part) {
        this.computedOffsets.set(partId, {
          x: part.offset.x + offset.x,
          y: part.offset.y + offset.y,
        });
      }
    }
  }

  private resetOffsets(): void {
    this.computedOffsets.clear();
    for (const part of this.def.parts) {
      this.computedOffsets.set(part.id, { ...part.offset });
    }
  }
}
