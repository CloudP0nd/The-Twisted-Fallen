// ============================================================
// TWISTED LOVES - Game Engine Type Definitions
// ============================================================

// --- Pixel Art & Sprite Types ---

/** A single pixel: hex color string or null (transparent) */
export type Pixel = string | null;

/** 2D grid of pixels representing a sprite part */
export type PixelGrid = Pixel[][];

/** Anchor point for attaching sprite parts together */
export interface Anchor {
  x: number;
  y: number;
}

/** A single modular sprite part (e.g. head, arm, body) */
export interface SpritePart {
  id: string;
  pixels: PixelGrid;
  /** Offset from the sprite's origin point */
  offset: Anchor;
  /** Anchor point where child parts attach */
  anchor?: Anchor;
}

/** A single animation frame: maps part IDs to their offsets for that frame */
export interface AnimationFrame {
  /** Duration of this frame in milliseconds */
  duration: number;
  /** Per-part offset overrides for this frame (relative to base offset) */
  partOffsets: Record<string, Anchor>;
}

/** A named animation sequence */
export interface Animation {
  id: string;
  frames: AnimationFrame[];
  loop: boolean;
}

/** Complete modular sprite definition */
export interface ModularSpriteDef {
  id: string;
  parts: SpritePart[];
  animations: Animation[];
}

// --- Battle System Types ---

export type BattlePhase =
  | 'intro'          // Battle start text
  | 'player_menu'    // Player selecting FIGHT/ACT/ITEM/MERCY
  | 'player_action'  // Player performing selected action
  | 'enemy_dialogue' // Enemy speaks
  | 'enemy_attack'   // Enemy attacks, SOUL dodge phase
  | 'battle_end';    // Battle resolved

export type MenuCommand = 'FIGHT' | 'ACT' | 'ITEM' | 'MERCY';

export interface BattleState {
  phase: BattlePhase;
  turn: number;
  playerHP: number;
  playerMaxHP: number;
  playerLV: number;
  playerName: string;
  selectedMenu: MenuCommand;
  menuIndex: number;
  submenuIndex: number;
  enemyHP: number;
  enemyMaxHP: number;
  enemyName: string;
  dialogueText: string;
  dialogueCharIndex: number;
  /** Battle box dimensions & position (can change during attacks) */
  battleBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// --- SOUL Types ---

export interface SoulState {
  x: number;
  y: number;
  speed: number;
  /** Whether SOUL is currently controllable */
  active: boolean;
}

// --- Input Types ---

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface InputState {
  directions: Set<Direction>;
  confirm: boolean;
  cancel: boolean;
}

// --- Game Config ---

export interface GameConfig {
  /** Logical resolution width */
  width: number;
  /** Logical resolution height */
  height: number;
  /** Target FPS */
  targetFPS: number;
}
