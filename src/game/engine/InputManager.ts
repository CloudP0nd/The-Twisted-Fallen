// ============================================================
// TWISTED LOVES - Input Manager
// Handles keyboard input with state tracking
// ============================================================

import { InputState, Direction } from '../types';

export class InputManager {
  private state: InputState = {
    directions: new Set(),
    confirm: false,
    cancel: false,
  };

  // Track which actions were just pressed this frame
  private justPressedSet: Set<string> = new Set();
  private keyMap: Map<string, Direction | 'confirm' | 'cancel'> = new Map([
    ['ArrowUp', 'up'],
    ['ArrowDown', 'down'],
    ['ArrowLeft', 'left'],
    ['ArrowRight', 'right'],
    ['w', 'up'],
    ['s', 'down'],
    ['a', 'left'],
    ['d', 'right'],
    ['z', 'confirm'],
    ['Z', 'confirm'],
    ['Enter', 'confirm'],
    ['x', 'cancel'],
    ['X', 'cancel'],
    ['Shift', 'cancel'],
  ]);

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;

  constructor() {
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundKeyUp = this.onKeyUp.bind(this);
  }

  attach(): void {
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
  }

  detach(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
  }

  getState(): InputState {
    return this.state;
  }

  /** Check if an action was just pressed this frame */
  wasJustPressed(action: Direction | 'confirm' | 'cancel'): boolean {
    return this.justPressedSet.has(action);
  }

  /** Call at the end of each frame to clear per-frame state */
  endFrame(): void {
    this.justPressedSet.clear();
  }

  private onKeyDown(e: KeyboardEvent): void {
    const mapping = this.keyMap.get(e.key);
    if (!mapping) return;

    e.preventDefault();

    if (mapping === 'confirm' || mapping === 'cancel') {
      this.state[mapping] = true;
    } else {
      this.state.directions.add(mapping);
    }

    // Track just-pressed for all actions (directions too for menu nav)
    this.justPressedSet.add(mapping);
  }

  private onKeyUp(e: KeyboardEvent): void {
    const mapping = this.keyMap.get(e.key);
    if (!mapping) return;

    if (mapping === 'confirm' || mapping === 'cancel') {
      this.state[mapping] = false;
    } else {
      this.state.directions.delete(mapping);
    }
  }
}
