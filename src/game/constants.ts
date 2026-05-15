// ============================================================
// TWISTED LOVES - Game Constants
// ============================================================

import { GameConfig } from './types';

/** Default game configuration (Undertale uses 640x480 internally) */
export const DEFAULT_CONFIG: GameConfig = {
  width: 640,
  height: 480,
  targetFPS: 30, // Undertale runs at 30 FPS
};

// --- Color Palette (Undertale-inspired) ---
export const COLORS = {
  black: '#000000',
  white: '#ffffff',
  red: '#ff0000',        // SOUL color (determination)
  orange: '#ff6600',     // FIGHT button
  yellow: '#ffff00',     // ACT button
  green: '#00ff00',      // ITEM button / HP
  purple: '#cc00ff',     // MERCY button
  gray: '#808080',
  darkGray: '#404040',
  lightGray: '#c0c0c0',
  friskSkin: '#ffcc99',
  friskHair: '#663300',
  friskShirtBlue: '#0000ff',
  friskShirtStripe: '#ff00ff',
  friskPants: '#993300',
  friskShoes: '#660000',
} as const;

// --- Battle Box Layout ---
export const BATTLE_BOX = {
  /** Default battle box position and size */
  defaultX: 32,
  defaultY: 250,
  defaultWidth: 576,
  defaultHeight: 140,
  borderWidth: 3,
} as const;

// --- Menu Layout ---
// Layout (bottom to top):
//   y=432-474: Menu buttons row
//   y=400-428: Player info row (name, LV, HP bar)
export const MENU = {
  infoY: 410,       // Player info row Y
  buttonsY: 440,   // Menu buttons row Y
  height: 40,
  buttonWidth: 110,
  buttonHeight: 36,
  buttonGap: 20,
  startX: 30,
  commands: ['FIGHT', 'ACT', 'ITEM', 'MERCY'] as const,
  commandColors: ['#ff6600', '#ffff00', '#00ff00', '#cc00ff'] as const,
} as const;

// --- HP Bar ---
export const HP_BAR = {
  width: 120,
  height: 16,
} as const;

// --- SOUL ---
export const SOUL = {
  size: 16,
  speed: 3,
  color: '#ff0000',
} as const;

// --- Text ---
export const TEXT = {
  speed: 33,       // ms per character (Undertale default ~30ms)
  font: '16px "DotumChe", "Courier New", monospace',
  color: '#ffffff',
  lineGap: 4,
} as const;

// --- Player Info ---
export const PLAYER_DEFAULTS = {
  name: 'CHARA',
  lv: 1,
  hp: 20,
  maxHP: 20,
} as const;
