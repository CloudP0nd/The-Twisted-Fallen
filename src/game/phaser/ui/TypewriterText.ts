// ============================================================
// TWISTED LOVES - Typewriter Text Effect
// Phaser-based typewriter text that reveals characters one by
// one, matching Undertale's dialogue style (~33ms per char).
//
// KEY BEHAVIOR: When typing finishes, the text stays on screen
// until explicitly advanced. This matches Undertale's dialogue
// system where the player must press Z to advance.
// ============================================================

import Phaser from 'phaser';
import { TEXT } from '../../constants';

export class TypewriterText {
  private scene: Phaser.Scene;
  private textObject: Phaser.GameObjects.Text;
  private fullText: string = '';
  private charIndex: number = 0;
  private speed: number = TEXT.speed;
  private timerEvent?: Phaser.Time.TimerEvent;
  private onComplete?: () => void;
  private onCharReveal?: () => void;

  /** Whether all characters have been revealed (but player hasn't advanced yet) */
  private _typingComplete: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, maxWidth: number = 540) {
    this.scene = scene;
    this.textObject = scene.add.text(x, y, '', {
      fontFamily: '"DotumChe", "Courier New", monospace',
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: maxWidth },
      lineSpacing: 4,
    });
    this.textObject.setOrigin(0, 0);
  }

  /** Start the typewriter effect with the given text */
  start(text: string, onComplete?: () => void, onCharReveal?: () => void): void {
    // Stop any existing typewriter
    this.stop();

    this.fullText = text;
    this.charIndex = 0;
    this._typingComplete = false;
    this.onComplete = onComplete;
    this.onCharReveal = onCharReveal;
    this.textObject.setText('');

    if (text.length === 0) {
      // Empty text — complete immediately
      this._typingComplete = true;
      return;
    }

    this.timerEvent = this.scene.time.addEvent({
      delay: this.speed,
      callback: this.addChar,
      callbackScope: this,
      loop: true,
    });
  }

  /** Add one character (called by timer) */
  private addChar(): void {
    this.charIndex++;
    this.textObject.setText(this.fullText.substring(0, this.charIndex));

    // Callback for sound effects per character
    this.onCharReveal?.();

    if (this.charIndex >= this.fullText.length) {
      // Stop the timer but do NOT call onComplete yet.
      // In Undertale, text stays on screen until the player presses Z.
      this.stop();
      this._typingComplete = true;
    }
  }

  /**
   * Advance the dialogue. Call this when the player presses Z.
   * - If text is still typing: skip to end (reveal all characters)
   * - If text is fully displayed: trigger onComplete callback
   */
  advance(): void {
    if (this.isTyping) {
      // Skip to the end of the text
      this.stop();
      this.charIndex = this.fullText.length;
      this.textObject.setText(this.fullText);
      this._typingComplete = true;
    } else if (this._typingComplete) {
      // Text is fully displayed — advance to next dialogue
      this._typingComplete = false;
      this.onComplete?.();
    }
  }

  /** Check if text is still being typed (characters still revealing) */
  get isTyping(): boolean {
    return !this._typingComplete && this.charIndex < this.fullText.length;
  }

  /** Check if typing is complete and waiting for player input */
  get isWaitingForAdvance(): boolean {
    return this._typingComplete;
  }

  /** Stop the timer without triggering onComplete */
  stop(): void {
    if (this.timerEvent) {
      this.timerEvent.destroy();
      this.timerEvent = undefined;
    }
  }

  /** Get the underlying Text game object for direct manipulation */
  getTextObject(): Phaser.GameObjects.Text {
    return this.textObject;
  }

  /** Set text position */
  setPosition(x: number, y: number): void {
    this.textObject.setPosition(x, y);
  }

  /** Set text visibility */
  setVisible(visible: boolean): void {
    this.textObject.setVisible(visible);
  }

  /** Clear and reset the text */
  clear(): void {
    this.stop();
    this.fullText = '';
    this.charIndex = 0;
    this._typingComplete = false;
    this.textObject.setText('');
  }

  /** Destroy the text object and clean up */
  destroy(): void {
    this.stop();
    this.textObject.destroy();
  }
}
