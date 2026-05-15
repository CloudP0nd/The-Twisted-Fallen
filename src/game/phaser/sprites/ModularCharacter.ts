// ============================================================
// TWISTED LOVES - Modular Character Sprite
// Phaser Container-based modular sprite system.
// Each character part (head, body, arms, legs) is an independent
// Sprite within a Container, enabling per-part animation via
// Tweens and individual sprite sheet animations.
// ============================================================

import Phaser from 'phaser';
import { ModularSpriteDef, SpritePart, Animation, AnimationFrame } from '../../types';
import { createTextureFromPixelGrid } from '../data/TextureGenerator';

/**
 * A modular character built from multiple sprite parts inside a Phaser Container.
 *
 * Advantages over the previous Canvas2D implementation:
 * - Each part is an independent Sprite → can have its own texture/animation
 * - Container propagates position/rotation/scale/alpha to all children
 * - Phaser Tweens provide smooth per-part offset animation
 * - Supports both sprite-sheet animation AND tween-based offset animation (hybrid)
 */
export class ModularCharacter extends Phaser.GameObjects.Container {
  private def: ModularSpriteDef;
  private pixelSize: number;
  private parts: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private baseOffsets: Map<string, { x: number; y: number }> = new Map();

  // Animation state
  private currentAnimation: Animation | null = null;
  private currentFrameIndex = 0;
  private frameTimer = 0;
  private activeTweens: Phaser.Tweens.Tween[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    def: ModularSpriteDef,
    pixelSize: number = 2,
  ) {
    super(scene, x, y);
    this.def = def;
    this.pixelSize = pixelSize;

    // Generate CanvasTextures for each part and create Sprites
    for (const part of def.parts) {
      this.createPart(part);
    }

    // Add this container to the scene
    scene.add.existing(this);
  }

  /** Create a sprite part and add it to the container */
  private createPart(part: SpritePart): void {
    const textureKey = `${this.def.id}_${part.id}`;

    // Create texture from pixel grid data only if it doesn't already exist
    // (BootScene may have already generated it)
    if (!this.scene.textures.exists(textureKey)) {
      createTextureFromPixelGrid(this.scene, textureKey, part.pixels, this.pixelSize);
    }

    // Create sprite at the part's offset position
    const sprite = this.scene.add.sprite(
      part.offset.x * this.pixelSize,
      part.offset.y * this.pixelSize,
      textureKey,
    );
    sprite.setOrigin(0, 0);

    // Store base offset for animation calculations
    this.baseOffsets.set(part.id, { x: part.offset.x * this.pixelSize, y: part.offset.y * this.pixelSize });

    // Add sprite to this container
    this.add(sprite);
    this.parts.set(part.id, sprite);
  }

  /** Get a specific part's Sprite for direct manipulation */
  getPart(id: string): Phaser.GameObjects.Sprite | undefined {
    return this.parts.get(id);
  }

  /** Get the sprite definition */
  getDefinition(): ModularSpriteDef {
    return this.def;
  }

  /**
   * Play an animation by ID.
   * Uses per-frame offset animation (Undertale-style part movement).
   */
  playAnimation(animationId: string): void {
    // Don't restart if already playing
    if (this.currentAnimation?.id === animationId) return;

    const anim = this.def.animations.find((a) => a.id === animationId);
    if (!anim) {
      console.warn(`Animation "${animationId}" not found on sprite "${this.def.id}"`);
      return;
    }

    // Stop any existing tweens for this character's parts
    this.stopAllTweens();

    this.currentAnimation = anim;
    this.currentFrameIndex = 0;
    this.frameTimer = 0;
    this.applyFrame(anim.frames[0]);
  }

  /** Stop current animation and return all parts to base pose */
  stopAnimation(): void {
    this.stopAllTweens();
    this.currentAnimation = null;
    this.currentFrameIndex = 0;
    this.frameTimer = 0;
    this.resetAllOffsets();
  }

  /** Update animation state — call each game tick with delta time in ms */
  updateAnimation(dt: number): void {
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

  /** Apply an animation frame — move parts to their offset positions */
  private applyFrame(frame: AnimationFrame): void {
    this.stopAllTweens();

    for (const part of this.def.parts) {
      const sprite = this.parts.get(part.id);
      const baseOff = this.baseOffsets.get(part.id);
      if (!sprite || !baseOff) continue;

      const frameOffset = frame.partOffsets[part.id];
      const targetX = baseOff.x + (frameOffset?.x ?? 0) * this.pixelSize;
      const targetY = baseOff.y + (frameOffset?.y ?? 0) * this.pixelSize;

      // Smooth tween to target position (quick, snappy for Undertale feel)
      const tween = this.scene.tweens.add({
        targets: sprite,
        x: targetX,
        y: targetY,
        duration: 50, // Quick snap — Undertale animations are crisp, not floaty
        ease: 'Linear',
      });
      this.activeTweens.push(tween);
    }
  }

  /** Reset all parts to their base offsets */
  private resetAllOffsets(): void {
    for (const part of this.def.parts) {
      const sprite = this.parts.get(part.id);
      const baseOff = this.baseOffsets.get(part.id);
      if (sprite && baseOff) {
        sprite.setPosition(baseOff.x, baseOff.y);
      }
    }
  }

  /** Stop all active tweens managed by this character */
  private stopAllTweens(): void {
    for (const tween of this.activeTweens) {
      if (tween.isActive()) {
        tween.stop();
      }
    }
    this.activeTweens = [];
  }

  /** Clean up resources when this character is destroyed */
  destroy(fromScene?: boolean): void {
    this.stopAllTweens();
    super.destroy(fromScene);
  }
}
