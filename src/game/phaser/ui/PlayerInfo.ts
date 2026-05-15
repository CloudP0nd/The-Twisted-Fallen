// ============================================================
// TWISTED LOVES - Player Info Display
// Shows the player's name, LV, and HP bar at the bottom
// of the battle screen (Undertale-style HUD)
// ============================================================

import Phaser from 'phaser';
import { MENU, HP_BAR, COLORS, PLAYER_DEFAULTS } from '../../constants';

export class PlayerInfo {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;

  // Text elements
  private nameText: Phaser.GameObjects.Text;
  private lvText: Phaser.GameObjects.Text;
  private hpLabel: Phaser.GameObjects.Text;
  private hpNumbers: Phaser.GameObjects.Text;

  // State
  private playerHP: number;
  private playerMaxHP: number;
  private playerLV: number;
  private playerName: string;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.playerHP = PLAYER_DEFAULTS.hp;
    this.playerMaxHP = PLAYER_DEFAULTS.maxHP;
    this.playerLV = PLAYER_DEFAULTS.lv;
    this.playerName = PLAYER_DEFAULTS.name;

    const y = MENU.infoY;
    const fontConfig = {
      fontFamily: '"DotumChe", "Courier New", monospace',
      fontSize: '14px',
      color: '#ffffff',
    };

    // Player name
    this.nameText = scene.add.text(42, y, this.playerName, fontConfig);
    this.nameText.setOrigin(0, 1);

    // LV
    this.lvText = scene.add.text(120, y, `LV ${this.playerLV}`, fontConfig);
    this.lvText.setOrigin(0, 1);

    // HP label
    this.hpLabel = scene.add.text(200, y, 'HP', fontConfig);
    this.hpLabel.setOrigin(0, 1);

    // HP numbers
    this.hpNumbers = scene.add.text(0, y, '', fontConfig);
    this.hpNumbers.setOrigin(0, 1);

    this.drawHPBar();
  }

  /** Draw the HP bar */
  private drawHPBar(): void {
    const y = MENU.infoY;
    const barX = 228;
    const barY = y - 12;

    this.graphics.clear();

    // Background (red when damaged)
    this.graphics.fillStyle(0xff0000, 1);
    this.graphics.fillRect(barX, barY, HP_BAR.width, HP_BAR.height);

    // Fill (green when healthy, yellow when low)
    const hpRatio = this.playerHP / this.playerMaxHP;
    const fillColor = hpRatio > 0.3 ? 0x00ff00 : 0xffff00;
    this.graphics.fillStyle(fillColor, 1);
    this.graphics.fillRect(barX, barY, HP_BAR.width * hpRatio, HP_BAR.height);

    // HP numbers
    this.hpNumbers.setText(`${this.playerHP} / ${this.playerMaxHP}`);
    this.hpNumbers.setPosition(barX + HP_BAR.width + 8, y);
  }

  /** Set HP and update the bar */
  setHP(hp: number): void {
    this.playerHP = Math.max(0, Math.min(hp, this.playerMaxHP));
    this.drawHPBar();
  }

  /** Get current HP */
  getHP(): number {
    return this.playerHP;
  }

  /** Set max HP */
  setMaxHP(maxHP: number): void {
    this.playerMaxHP = maxHP;
    this.drawHPBar();
  }

  /** Damage the player */
  damage(amount: number): void {
    this.setHP(this.playerHP - amount);
  }

  /** Set player name */
  setName(name: string): void {
    this.playerName = name;
    this.nameText.setText(name);
  }

  /** Set LV */
  setLV(lv: number): void {
    this.playerLV = lv;
    this.lvText.setText(`LV ${lv}`);
  }

  /** Set visibility */
  setVisible(visible: boolean): void {
    this.graphics.setVisible(visible);
    this.nameText.setVisible(visible);
    this.lvText.setVisible(visible);
    this.hpLabel.setVisible(visible);
    this.hpNumbers.setVisible(visible);
  }

  /** Destroy all elements */
  destroy(): void {
    this.graphics.destroy();
    this.nameText.destroy();
    this.lvText.destroy();
    this.hpLabel.destroy();
    this.hpNumbers.destroy();
  }
}
