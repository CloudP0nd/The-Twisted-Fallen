// ============================================================
// TWISTED LOVES - Main Game Class
// Ties together engine, sprite, and battle systems
// ============================================================

import { GameLoop } from './engine/GameLoop';
import { InputManager } from './engine/InputManager';
import { ModularSprite } from './sprite/ModularSprite';
import { SoulController } from './battle/SoulController';
import { BattleManager } from './battle/BattleManager';
import { FRISK_SPRITE } from './sprites/frisk';
import { DEFAULT_CONFIG, COLORS, BATTLE_BOX } from './constants';
import { BattlePhase } from './types';

export class Game {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private loop: GameLoop;
  private input: InputManager;
  private soul: SoulController;
  private battle: BattleManager;
  private frisk: ModularSprite;

  // Enemy display position
  private enemyX = 320;
  private enemyY = 140;

  // Frisk position (shown during menu/overworld)
  private friskX = 100;
  private friskY = 350;

  constructor() {
    this.input = new InputManager();
    this.soul = new SoulController();
    this.battle = new BattleManager('Dummy', 30, 30);
    this.frisk = new ModularSprite(FRISK_SPRITE, 2);
    this.loop = new GameLoop(
      DEFAULT_CONFIG.targetFPS,
      this.update.bind(this),
      this.render.bind(this),
    );
  }

  /** Initialize the game with a canvas element */
  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    // Set logical resolution
    canvas.width = DEFAULT_CONFIG.width;
    canvas.height = DEFAULT_CONFIG.height;

    // Disable image smoothing for crisp pixel art
    this.ctx.imageSmoothingEnabled = false;

    // Attach input
    this.input.attach();

    // Start with idle animation for Frisk
    this.frisk.playAnimation('idle');

    // Begin the battle
    this.battle.startBattle('* Dummy blocks the way!');

    // Start the game loop
    this.loop.start();
  }

  /** Clean up resources */
  destroy(): void {
    this.loop.stop();
    this.input.detach();
  }

  // --- Private Methods ---

  private update(dt: number): void {
    const input = this.input.getState();
    const justConfirm = this.input.wasJustPressed('confirm');
    const justCancel = this.input.wasJustPressed('cancel');
    const phase = this.battle.getState().phase;

    // Update battle manager
    this.battle.update(dt);

    // Update Frisk animation
    this.frisk.update(dt);

    // Phase-specific input handling
    switch (phase) {
      case 'intro':
      case 'enemy_dialogue':
        this.battle.handleDialogueInput(justConfirm);
        break;

      case 'player_menu':
        this.battle.handleMenuInput(
          this.input.wasJustPressed('left'),
          this.input.wasJustPressed('right'),
          justConfirm,
        );
        this.soul.setActive(false);
        break;

      case 'enemy_attack':
        this.soul.setActive(true);
        this.soul.update(input);
        break;

      case 'player_action':
        this.battle.handleDialogueInput(justConfirm);
        break;

      case 'battle_end':
        this.soul.setActive(false);
        break;
    }

    this.input.endFrame();
  }

  private render(): void {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;

    // Clear to black (Undertale's background)
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(0, 0, DEFAULT_CONFIG.width, DEFAULT_CONFIG.height);

    const phase = this.battle.getState().phase;

    // Render enemy sprite (above battle box)
    this.renderEnemy(ctx);

    // Render battle UI (box, text, menus, HP)
    this.battle.render(ctx, this.soul.isActive());

    // Render SOUL when active (enemy attack phase)
    if (this.soul.isActive()) {
      this.soul.render(ctx);
    }

    // Render Frisk when in menu or dialogue
    if (phase === 'player_menu' || phase === 'intro' || phase === 'enemy_dialogue') {
      this.frisk.render(ctx, this.friskX, this.friskY);
    }

    // Phase indicator (debug - remove in production)
    this.renderPhaseIndicator(ctx);
  }

  private renderEnemy(ctx: CanvasRenderingContext2D): void {
    // Render a Training Dummy enemy (Undertale-style)
    // The Dummy is a humanoid cotton dummy on a stick
    const x = this.enemyX;
    const y = this.enemyY;

    // Stick/pole
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - 3, y + 20, 6, 40);

    // Base
    ctx.fillStyle = '#654321';
    ctx.fillRect(x - 15, y + 55, 30, 6);

    // Body (cotton sack)
    ctx.fillStyle = '#D2B48C';
    ctx.fillRect(x - 20, y - 20, 40, 42);

    // Body outline
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 20, y - 20, 40, 42);

    // Head (cotton ball)
    ctx.fillStyle = '#D2B48C';
    ctx.beginPath();
    ctx.arc(x, y - 32, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eyes (X marks - stitched)
    ctx.strokeStyle = '#4A4A4A';
    ctx.lineWidth = 2;
    // Left eye X
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 38);
    ctx.lineTo(x - 4, y - 32);
    ctx.moveTo(x - 4, y - 38);
    ctx.lineTo(x - 10, y - 32);
    ctx.stroke();
    // Right eye X
    ctx.beginPath();
    ctx.moveTo(x + 4, y - 38);
    ctx.lineTo(x + 10, y - 32);
    ctx.moveTo(x + 10, y - 38);
    ctx.lineTo(x + 4, y - 32);
    ctx.stroke();

    // Mouth (stitched line)
    ctx.beginPath();
    ctx.moveTo(x - 6, y - 24);
    ctx.lineTo(x + 6, y - 24);
    ctx.stroke();

    // Arms (stubby cotton arms)
    ctx.fillStyle = '#D2B48C';
    ctx.fillRect(x - 30, y - 14, 12, 8);
    ctx.fillRect(x + 18, y - 14, 12, 8);
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 30, y - 14, 12, 8);
    ctx.strokeRect(x + 18, y - 14, 12, 8);

    // Stitch lines on body
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 20, y - 4);
    ctx.lineTo(x + 20, y - 4);
    ctx.moveTo(x - 20, y + 8);
    ctx.lineTo(x + 20, y + 8);
    ctx.stroke();
  }

  private renderPhaseIndicator(ctx: CanvasRenderingContext2D): void {
    const state = this.battle.getState();
    ctx.fillStyle = COLORS.darkGray;
    ctx.font = '10px monospace';
    ctx.fillText(
      `Phase: ${state.phase} | Turn: ${state.turn} | Z=Confirm X=Cancel | Arrows=Move`,
      10,
      DEFAULT_CONFIG.height - 8,
    );
  }
}
