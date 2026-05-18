// ============================================================
// TWISTED LOVES - Battle Scene
// Main battle scene implementing the 6-phase state machine:
//   intro → player_menu → player_action → enemy_dialogue
//   → enemy_attack → battle_end
//
// Uses Phaser 4's scene system, input, tweens, and timer events.
// All keyboard input uses keydown events for reliable detection.
// ============================================================

import Phaser from 'phaser';
import { BattlePhase, MenuCommand } from '../../types';
import { BATTLE_BOX, MENU, PLAYER_DEFAULTS, COLORS } from '../../constants';
import { ModularCharacter } from '../sprites/ModularCharacter';
import { TypewriterText } from '../ui/TypewriterText';
import { BattleBox } from '../ui/BattleBox';
import { MenuButtons } from '../ui/MenuButtons';
import { PlayerInfo } from '../ui/PlayerInfo';
import { SoulSprite } from '../ui/SoulSprite';
import { FRISK_SPRITE } from '../../sprites/frisk';

export class BattleScene extends Phaser.Scene {
  // --- Battle State ---
  private phase: BattlePhase = 'intro';
  private turn: number = 1;
  private enemyName: string = 'Frisk';
  private enemyHP: number = 50;
  private enemyMaxHP: number = 50;
  private attackTimer: number = 0;
  private attackDuration: number = 3000;

  // --- Game Objects ---
  private enemySprite!: ModularCharacter;
  private battleBox!: BattleBox;
  private typewriter!: TypewriterText;
  private menuButtons!: MenuButtons;
  private playerInfo!: PlayerInfo;
  private soul!: SoulSprite;
  private phaseText!: Phaser.GameObjects.Text;

  // --- Dialogue Queue ---
  private dialogueQueue: string[] = [];
  private dialogueCallback?: () => void;

  constructor() {
    super({ key: 'BattleScene' });
  }

  create(): void {
    // --- Create enemy Frisk sprite ---
    this.enemySprite = new ModularCharacter(this, 288, 80, FRISK_SPRITE, 3);
    this.enemySprite.playAnimation('idle');

    // --- Create battle box ---
    this.battleBox = new BattleBox(this);
    this.battleBox.setDepth(5);

    // --- Create typewriter text ---
    const textPos = this.battleBox.getTextPosition();
    this.typewriter = new TypewriterText(this, textPos.x, textPos.y, 540);
    this.typewriter.getTextObject().setDepth(10);

    // --- Create menu buttons ---
    this.menuButtons = new MenuButtons(this, (cmd) => this.executeMenuCommand(cmd));
    this.menuButtons.setActive(false);

    // --- Create player info ---
    this.playerInfo = new PlayerInfo(this);

    // --- Create SOUL ---
    this.soul = new SoulSprite(this);

    // --- Phase indicator (debug) ---
    this.phaseText = this.add.text(10, 472, '', {
      fontFamily: '"DotumChe", "Courier New", monospace',
      fontSize: '10px',
      color: '#404040',
    });
    this.phaseText.setOrigin(0, 1);

    // --- Set up keyboard input using keydown events (more reliable than JustDown) ---
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      this.handleKeyDown(event);
    });

    // --- Start the battle ---
    this.startBattle();
  }

  update(_time: number, delta: number): void {
    // Update enemy sprite animation
    this.enemySprite.updateAnimation(delta);

    // Update SOUL movement (uses cursorKeys.isDown for continuous movement)
    this.soul.update();

    // Handle attack phase timer
    if (this.phase === 'enemy_attack') {
      this.attackTimer += delta;
      if (this.attackTimer >= this.attackDuration) {
        this.onAttackComplete();
      }
    }

    // Update phase indicator
    this.phaseText.setText(
      `Phase: ${this.phase} | Turn: ${this.turn} | Z=Confirm X=Cancel | Arrows=Move`,
    );
  }

  // ==========================================
  // Input Handling
  // ==========================================

  /** Handle keydown events */
  private handleKeyDown(event: KeyboardEvent): void {
    switch (event.keyCode) {
      case Phaser.Input.Keyboard.KeyCodes.Z:
      case Phaser.Input.Keyboard.KeyCodes.ENTER:
        this.handleConfirmInput();
        break;

      case Phaser.Input.Keyboard.KeyCodes.X:
      case Phaser.Input.Keyboard.KeyCodes.SHIFT:
        this.handleCancelInput();
        break;

      case Phaser.Input.Keyboard.KeyCodes.LEFT:
        if (this.phase === 'player_menu') {
          this.menuButtons.moveLeft();
        }
        break;

      case Phaser.Input.Keyboard.KeyCodes.RIGHT:
        if (this.phase === 'player_menu') {
          this.menuButtons.moveRight();
        }
        break;
    }
  }

  /** Handle Z / Enter confirm input */
  private handleConfirmInput(): void {
    switch (this.phase) {
      case 'intro':
      case 'enemy_dialogue':
      case 'player_action':
      case 'battle_end':
        // Advance typewriter: skip if still typing, or trigger callback if waiting
        this.typewriter.advance();
        break;

      case 'player_menu':
        this.menuButtons.confirm();
        break;

      case 'enemy_attack':
        // No action during attack phase
        break;
    }
  }

  /** Handle X / Shift cancel input */
  private handleCancelInput(): void {
    // Cancel is currently a no-op in most phases
    // TODO: Implement back navigation in sub-menus
  }

  // ==========================================
  // Battle Flow
  // ==========================================

  /** Start the battle with intro text */
  private startBattle(): void {
    this.setPhase('intro');
    this.showDialogue('* Frisk stands before you.', () => {
      this.transitionToPlayerMenu();
    });
  }

  /** Set current battle phase */
  private setPhase(phase: BattlePhase): void {
    this.phase = phase;

    // Update UI visibility based on phase
    switch (phase) {
      case 'intro':
      case 'enemy_dialogue':
      case 'player_action':
      case 'battle_end':
        this.soul.setActive(false);
        this.menuButtons.setActive(false);
        break;

      case 'player_menu':
        this.soul.setActive(false);
        this.menuButtons.setActive(true);
        break;

      case 'enemy_attack':
        this.soul.setActive(true);
        this.menuButtons.setActive(false);
        break;
    }
  }

  /** Transition to player menu phase */
  private transitionToPlayerMenu(): void {
    this.setPhase('player_menu');
    this.menuButtons.reset();
    this.typewriter.clear();
  }

  /** Start enemy's turn (dialogue then attack) */
  private startEnemyTurn(): void {
    this.setPhase('enemy_dialogue');
    this.turn++;
    this.queueDialogue(
      [`${this.enemyName} attacks!`],
      () => {
        this.startAttackPhase();
      },
    );
  }

  /** Start the SOUL dodge phase */
  private startAttackPhase(): void {
    this.setPhase('enemy_attack');
    this.attackTimer = 0;
    this.typewriter.clear();
    this.soul.setActive(true);
  }

  /** Called when the attack phase timer completes */
  private onAttackComplete(): void {
    this.transitionToPlayerMenu();
  }

  // ==========================================
  // Dialogue System
  // ==========================================

  /** Show a single line of typewriter text */
  private showDialogue(text: string, onComplete?: () => void): void {
    const textPos = this.battleBox.getTextPosition();
    this.typewriter.setPosition(textPos.x, textPos.y);
    this.typewriter.start(text, onComplete);
  }

  /** Queue multiple dialogue lines to display sequentially */
  private queueDialogue(lines: string[], onComplete?: () => void): void {
    this.dialogueQueue = [...lines];
    this.dialogueCallback = onComplete;
    this.showNextDialogue();
  }

  /** Show the next dialogue in the queue */
  private showNextDialogue(): void {
    if (this.dialogueQueue.length === 0) {
      this.dialogueCallback?.();
      return;
    }
    const text = this.dialogueQueue.shift()!;
    this.showDialogue(text, () => this.showNextDialogue());
  }

  // ==========================================
  // Menu Command Execution
  // ==========================================

  /** Execute the selected menu command */
  private executeMenuCommand(command: MenuCommand): void {
    this.setPhase('player_action');

    switch (command) {
      case 'FIGHT':
        this.enemyHP = Math.max(0, this.enemyHP - 5);
        this.queueDialogue(
          [`You attacked ${this.enemyName}!`, `${this.enemyName} took 5 damage!`],
          () => {
            if (this.enemyHP <= 0) {
              this.setPhase('battle_end');
              this.showDialogue('You won!');
            } else {
              this.startEnemyTurn();
            }
          },
        );
        break;

      case 'ACT':
        this.queueDialogue(
          [`* You checked ${this.enemyName}.`, `* ATK 10  DEF 10\n* ${this.enemyName} - A determined human.`],
          () => this.startEnemyTurn(),
        );
        break;

      case 'ITEM':
        this.showDialogue('No items.', () => {
          this.transitionToPlayerMenu();
        });
        break;

      case 'MERCY':
        this.showDialogue('But nobody came.', () => {
          this.transitionToPlayerMenu();
        });
        break;
    }
  }
}
