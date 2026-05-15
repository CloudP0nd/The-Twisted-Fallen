// ============================================================
// TWISTED LOVES - Menu Buttons
// FIGHT / ACT / ITEM / MERCY button row at the bottom of
// the battle screen. Navigated with Left/Right arrows,
// confirmed with Z. A SOUL indicator appears next to the
// currently selected button.
// ============================================================

import Phaser from 'phaser';
import { MENU, COLORS } from '../../constants';
import { MenuCommand } from '../../types';

export class MenuButtons {
  private scene: Phaser.Scene;
  private menuIndex: number = 0;
  private isActive: boolean = false;

  // Visual elements for each button
  private buttonBackgrounds: Phaser.GameObjects.Graphics[] = [];
  private buttonTexts: Phaser.GameObjects.Text[] = [];
  private soulIndicator: Phaser.GameObjects.Sprite;

  // Callback when a menu command is selected
  private onCommandSelect?: (command: MenuCommand) => void;

  constructor(scene: Phaser.Scene, onCommandSelect?: (command: MenuCommand) => void) {
    this.scene = scene;
    this.onCommandSelect = onCommandSelect;

    // Create SOUL indicator (small heart next to selected button)
    this.soulIndicator = scene.add.sprite(0, 0, 'soul_small');
    this.soulIndicator.setOrigin(0.5, 0.5);
    this.soulIndicator.setVisible(false);
    this.soulIndicator.setScale(0.6);

    // Create each menu button
    MENU.commands.forEach((cmd, i) => {
      const x = MENU.startX + i * (MENU.buttonWidth + MENU.buttonGap);
      const y = MENU.buttonsY;

      // Button background
      const bg = scene.add.graphics();
      this.buttonBackgrounds.push(bg);

      // Button text
      const text = scene.add.text(
        x + MENU.buttonWidth / 2,
        y + MENU.buttonHeight / 2,
        cmd,
        {
          fontFamily: '"DotumChe", "Courier New", monospace',
          fontSize: '13px',
          color: '#ffffff',
        },
      );
      text.setOrigin(0.5, 0.5);
      this.buttonTexts.push(text);
    });

    this.drawButtons();
  }

  /** Draw/redraw all button visuals */
  private drawButtons(): void {
    MENU.commands.forEach((cmd, i) => {
      const x = MENU.startX + i * (MENU.buttonWidth + MENU.buttonGap);
      const y = MENU.buttonsY;
      const isSelected = this.isActive && this.menuIndex === i;
      const bg = this.buttonBackgrounds[i];
      const text = this.buttonTexts[i];

      bg.clear();

      // Highlight background for selected button
      if (isSelected) {
        bg.fillStyle(0x404040, 1); // darkGray
        bg.fillRect(x - 2, y - 2, MENU.buttonWidth + 4, MENU.buttonHeight + 4);
      }

      // Button border
      const colorNum = parseInt(MENU.commandColors[i].replace('#', ''), 16);
      bg.lineStyle(isSelected ? 3 : 2, colorNum, 1);
      bg.strokeRect(x, y, MENU.buttonWidth, MENU.buttonHeight);

      // Text styling
      if (isSelected) {
        text.setColor(MENU.commandColors[i]);
        text.setFontSize('15px');
        text.setFontStyle('bold');
      } else {
        text.setColor('#ffffff');
        text.setFontSize('13px');
        text.setFontStyle('normal');
      }

      // Position SOUL indicator next to selected button
      if (isSelected) {
        this.soulIndicator.setPosition(x - 12, y + MENU.buttonHeight / 2);
        this.soulIndicator.setVisible(true);
      }
    });
  }

  /** Navigate left (just-pressed) */
  moveLeft(): void {
    if (!this.isActive) return;
    this.menuIndex = Math.max(0, this.menuIndex - 1);
    this.drawButtons();
  }

  /** Navigate right (just-pressed) */
  moveRight(): void {
    if (!this.isActive) return;
    this.menuIndex = Math.min(MENU.commands.length - 1, this.menuIndex + 1);
    this.drawButtons();
  }

  /** Confirm current selection */
  confirm(): void {
    if (!this.isActive) return;
    const command = MENU.commands[this.menuIndex] as MenuCommand;
    this.onCommandSelect?.(command);
  }

  /** Set whether the menu is currently active/navigable */
  setActive(active: boolean): void {
    this.isActive = active;
    this.soulIndicator.setVisible(active);
    this.drawButtons();
  }

  /** Get current menu index */
  getMenuIndex(): number {
    return this.menuIndex;
  }

  /** Get currently selected command */
  getSelectedCommand(): MenuCommand {
    return MENU.commands[this.menuIndex] as MenuCommand;
  }

  /** Reset to first button */
  reset(): void {
    this.menuIndex = 0;
    this.drawButtons();
  }

  /** Set visibility */
  setVisible(visible: boolean): void {
    this.buttonBackgrounds.forEach((bg) => bg.setVisible(visible));
    this.buttonTexts.forEach((text) => text.setVisible(visible));
    this.soulIndicator.setVisible(visible && this.isActive);
  }

  /** Destroy all visual elements */
  destroy(): void {
    this.buttonBackgrounds.forEach((bg) => bg.destroy());
    this.buttonTexts.forEach((text) => text.destroy());
    this.soulIndicator.destroy();
  }
}
