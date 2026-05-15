// ============================================================
// TWISTED LOVES - Battle Manager
// State machine for turn-based Undertale-style combat
// ============================================================

import { BattleState, BattlePhase, MenuCommand, InputState } from '../types';
import { BATTLE_BOX, MENU, PLAYER_DEFAULTS, TEXT, HP_BAR, COLORS } from '../constants';

export class BattleManager {
  private state: BattleState;
  private dialogueQueue: string[] = [];
  private onDialogueComplete?: () => void;
  private finalDialogueCallback?: () => void;
  private dialogueTimer = 0;
  private attackTimer = 0;
  private attackDuration = 0;
  private onAttackComplete?: () => void;

  constructor(enemyName: string = 'Dummy', enemyHP: number = 30, enemyMaxHP: number = 30) {
    this.state = {
      phase: 'intro',
      turn: 1,
      playerHP: PLAYER_DEFAULTS.hp,
      playerMaxHP: PLAYER_DEFAULTS.maxHP,
      playerLV: PLAYER_DEFAULTS.lv,
      playerName: PLAYER_DEFAULTS.name,
      selectedMenu: 'FIGHT',
      menuIndex: 0,
      submenuIndex: 0,
      enemyHP,
      enemyMaxHP,
      enemyName,
      dialogueText: '',
      dialogueCharIndex: 0,
      battleBox: {
        x: BATTLE_BOX.defaultX,
        y: BATTLE_BOX.defaultY,
        width: BATTLE_BOX.defaultWidth,
        height: BATTLE_BOX.defaultHeight,
      },
    };
  }

  getState(): BattleState {
    return { ...this.state };
  }

  /** Start the battle with intro text */
  startBattle(introText?: string): void {
    this.setPhase('intro');
    this.setDialogue(introText ?? `${this.state.enemyName} appeared!`, () => {
      this.transitionToPlayerMenu();
    });
  }

  /** Set current battle phase */
  setPhase(phase: BattlePhase): void {
    this.state.phase = phase;
  }

  /** Set dialogue text (starts typewriter effect) */
  setDialogue(text: string, onComplete?: () => void): void {
    this.state.dialogueText = text;
    this.state.dialogueCharIndex = 0;
    this.dialogueTimer = 0;
    this.onDialogueComplete = onComplete;
  }

  /** Queue multiple dialogue lines */
  queueDialogue(lines: string[], onComplete?: () => void): void {
    this.dialogueQueue = [...lines];
    this.finalDialogueCallback = onComplete;
    this.showNextDialogue();
  }

  private showNextDialogue(): void {
    if (this.dialogueQueue.length === 0) {
      this.finalDialogueCallback?.();
      return;
    }
    const text = this.dialogueQueue.shift()!;
    this.setDialogue(text, () => this.showNextDialogue());
  }

  /** Start enemy attack phase */
  startAttack(duration: number, onComplete: () => void): void {
    this.state.phase = 'enemy_attack';
    this.attackDuration = duration;
    this.attackTimer = 0;
    this.onAttackComplete = onComplete;
  }

  /** Handle player menu navigation */
  handleMenuInput(justLeft: boolean, justRight: boolean, justPressedConfirm: boolean): void {
    if (this.state.phase !== 'player_menu') return;

    // Navigate between FIGHT/ACT/ITEM/MERCY
    if (justLeft) {
      this.state.menuIndex = Math.max(0, this.state.menuIndex - 1);
    }
    if (justRight) {
      this.state.menuIndex = Math.min(MENU.commands.length - 1, this.state.menuIndex + 1);
    }
    this.state.selectedMenu = MENU.commands[this.state.menuIndex] as MenuCommand;

    if (justPressedConfirm) {
      this.executeMenuCommand(this.state.selectedMenu);
    }
  }

  /** Handle dialogue advancement */
  handleDialogueInput(justPressedConfirm: boolean): void {
    if (this.state.phase !== 'enemy_dialogue' && this.state.phase !== 'intro' && this.state.phase !== 'player_action' && this.state.phase !== 'battle_end') return;

    if (justPressedConfirm) {
      if (this.state.dialogueCharIndex < this.state.dialogueText.length) {
        // Skip to end of current text
        this.state.dialogueCharIndex = this.state.dialogueText.length;
      } else {
        // Advance to next dialogue or trigger callback
        this.onDialogueComplete?.();
      }
    }
  }

  /** Update battle state each tick */
  update(dt: number): void {
    // Update typewriter effect
    if (this.state.dialogueCharIndex < this.state.dialogueText.length) {
      this.dialogueTimer += dt;
      if (this.dialogueTimer >= TEXT.speed) {
        this.dialogueTimer -= TEXT.speed;
        this.state.dialogueCharIndex++;
      }
    }

    // Update attack timer
    if (this.state.phase === 'enemy_attack') {
      this.attackTimer += dt;
      if (this.attackTimer >= this.attackDuration) {
        this.onAttackComplete?.();
      }
    }
  }

  /** Damage the player */
  damagePlayer(amount: number): void {
    this.state.playerHP = Math.max(0, this.state.playerHP - amount);
  }

  /** Damage the enemy */
  damageEnemy(amount: number): void {
    this.state.enemyHP = Math.max(0, this.state.enemyHP - amount);
  }

  /** Transition to player menu after enemy action */
  transitionToPlayerMenu(): void {
    this.state.phase = 'player_menu';
    this.state.menuIndex = 0;
    this.state.selectedMenu = 'FIGHT';
    this.state.dialogueText = '';
    this.state.dialogueCharIndex = 0;
  }

  /** Get visible dialogue text (respecting typewriter progress) */
  getVisibleText(): string {
    return this.state.dialogueText.substring(0, this.state.dialogueCharIndex);
  }

  /** Render the full battle UI */
  render(ctx: CanvasRenderingContext2D, soulActive: boolean): void {
    this.renderBattleBox(ctx);
    this.renderDialogueText(ctx, soulActive);
    this.renderMenuButtons(ctx);
    this.renderPlayerInfo(ctx);
    this.renderHPBar(ctx);
  }

  private executeMenuCommand(command: MenuCommand): void {
    switch (command) {
      case 'FIGHT':
        this.state.phase = 'player_action';
        // TODO: Attack animation, then damage enemy
        // For now, auto-deal damage and transition
        this.damageEnemy(5);
        this.queueDialogue(
          [`You attacked ${this.state.enemyName}!`, `${this.state.enemyName} took 5 damage!`],
          () => {
            if (this.state.enemyHP <= 0) {
              this.state.phase = 'battle_end';
              this.setDialogue('You won!');
            } else {
              this.startEnemyTurn();
            }
          },
        );
        break;

      case 'ACT':
        this.state.phase = 'player_action';
        this.queueDialogue(
          [`You checked ${this.state.enemyName}.`, `ATK 0 DEF 0\n${this.state.enemyName} - Just a training dummy.`],
          () => this.startEnemyTurn(),
        );
        break;

      case 'ITEM':
        this.state.phase = 'player_action';
        // TODO: Item menu
        this.setDialogue('No items.', () => {
          this.transitionToPlayerMenu();
        });
        break;

      case 'MERCY':
        this.state.phase = 'player_action';
        // TODO: Spare/Flee logic
        this.setDialogue('But nobody came.', () => {
          this.transitionToPlayerMenu();
        });
        break;
    }
  }

  private startEnemyTurn(): void {
    this.state.phase = 'enemy_dialogue';
    this.state.turn++;
    this.queueDialogue(
      [`${this.state.enemyName} attacks!`],
      () => {
        // After dialogue, start attack phase
        this.startAttack(3000, () => {
          this.transitionToPlayerMenu();
        });
      },
    );
  }

  private renderBattleBox(ctx: CanvasRenderingContext2D): void {
    const box = this.state.battleBox;

    // Black fill
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(box.x, box.y, box.width, box.height);

    // White border
    ctx.strokeStyle = COLORS.white;
    ctx.lineWidth = BATTLE_BOX.borderWidth;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  }

  private renderDialogueText(ctx: CanvasRenderingContext2D, soulActive: boolean): void {
    if (soulActive) return; // Don't show text while SOUL is dodging

    const text = this.getVisibleText();
    if (!text) return;

    ctx.fillStyle = TEXT.color;
    ctx.font = TEXT.font;

    const lines = text.split('\n');
    const lineHeight = 20 + TEXT.lineGap;
    const startX = this.state.battleBox.x + 20;
    const startY = this.state.battleBox.y + 24;

    lines.forEach((line, i) => {
      ctx.fillText(line, startX, startY + i * lineHeight);
    });
  }

  private renderMenuButtons(ctx: CanvasRenderingContext2D): void {
    const isActive = this.state.phase === 'player_menu';

    MENU.commands.forEach((cmd, i) => {
      const x = MENU.startX + i * (MENU.buttonWidth + MENU.buttonGap);
      const y = MENU.buttonsY;
      const isSelected = isActive && this.state.menuIndex === i;

      // Button background (slight highlight when selected)
      if (isSelected) {
        ctx.fillStyle = COLORS.darkGray;
        ctx.fillRect(x - 2, y - 2, MENU.buttonWidth + 4, MENU.buttonHeight + 4);
      }

      // Button border
      ctx.strokeStyle = MENU.commandColors[i];
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeRect(x, y, MENU.buttonWidth, MENU.buttonHeight);

      // Button text
      ctx.fillStyle = isSelected ? MENU.commandColors[i] : COLORS.white;
      ctx.font = isSelected ? 'bold 15px "DotumChe", "Courier New", monospace' : '13px "DotumChe", "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cmd, x + MENU.buttonWidth / 2, y + MENU.buttonHeight / 2);

      // SOUL indicator next to selected button
      if (isSelected) {
        this.renderSmallSoul(ctx, x - 12, y + MENU.buttonHeight / 2);
      }
    });

    // Reset text alignment
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
  }

  private renderSmallSoul(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = COLORS.red;
    const s = 5;
    ctx.beginPath();
    ctx.arc(x - s * 0.35, y - s * 0.15, s * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + s * 0.35, y - s * 0.15, s * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - s * 0.8, y - s * 0.05);
    ctx.lineTo(x + s * 0.8, y - s * 0.05);
    ctx.lineTo(x, y + s * 0.9);
    ctx.closePath();
    ctx.fill();
  }

  private renderPlayerInfo(ctx: CanvasRenderingContext2D): void {
    const y = MENU.infoY;
    ctx.fillStyle = COLORS.white;
    ctx.font = '14px "DotumChe", "Courier New", monospace';

    // Player name
    ctx.fillText(this.state.playerName, 42, y);

    // LV
    ctx.fillText(`LV ${this.state.playerLV}`, 120, y);
  }

  private renderHPBar(ctx: CanvasRenderingContext2D): void {
    const y = MENU.infoY;
    const hpLabelX = 200;
    const barX = hpLabelX + 28;

    // HP label
    ctx.fillStyle = COLORS.white;
    ctx.font = '14px "DotumChe", "Courier New", monospace';
    ctx.fillText('HP', hpLabelX, y);

    // HP bar background (red when damaged)
    ctx.fillStyle = COLORS.red;
    ctx.fillRect(barX, y - 12, HP_BAR.width, HP_BAR.height);

    // HP bar fill
    const hpRatio = this.state.playerHP / this.state.playerMaxHP;
    ctx.fillStyle = hpRatio > 0.3 ? COLORS.green : COLORS.yellow;
    ctx.fillRect(barX, y - 12, HP_BAR.width * hpRatio, HP_BAR.height);

    // HP numbers
    ctx.fillStyle = COLORS.white;
    ctx.fillText(
      `${this.state.playerHP} / ${this.state.playerMaxHP}`,
      barX + HP_BAR.width + 8,
      y,
    );
  }
}
