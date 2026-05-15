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
import { DEFAULT_CONFIG, COLORS } from './constants';
import { BattlePhase } from './types';

export class Game {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private loop: GameLoop;
  private input: InputManager;
  private soul: SoulController;
  private battle: BattleManager;

  /** Frisk modular sprite — displayed as the enemy */
  private friskEnemy: ModularSprite;

  // Enemy Frisk display position (centered above battle box)
  private enemyX = 288;
  private enemyY = 80;

  constructor() {
    this.input = new InputManager();
    this.soul = new SoulController();
    this.battle = new BattleManager('Frisk', 50, 50);
    // pixelSize=3 for a larger enemy sprite (more imposing on screen)
    this.friskEnemy = new ModularSprite(FRISK_SPRITE, 3);
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

    // Start with idle animation for enemy Frisk
    this.friskEnemy.playAnimation('idle');

    // Begin the battle — Frisk is the enemy
    this.battle.startBattle('* Frisk stands before you.');

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
    const phase = this.battle.getState().phase;

    // Update battle manager
    this.battle.update(dt);

    // Update enemy Frisk animation
    this.friskEnemy.update(dt);

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
        // Switch enemy to walk animation during attack
        if (this.friskEnemy.getDefinition().id === 'frisk') {
          // Keep idle during attack for now; could change to attack anim later
        }
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

    // Render enemy Frisk sprite (above battle box)
    this.friskEnemy.render(ctx, this.enemyX, this.enemyY);

    // Render battle UI (box, text, menus, HP)
    this.battle.render(ctx, this.soul.isActive());

    // Render SOUL when active (enemy attack phase)
    if (this.soul.isActive()) {
      this.soul.render(ctx);
    }

    // Phase indicator (debug)
    this.renderPhaseIndicator(ctx);
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
