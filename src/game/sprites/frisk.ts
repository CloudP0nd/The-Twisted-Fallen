// ============================================================
// TWISTED LOVES - Frisk Sprite Definition
// Modular pixel art for Frisk (Undertale protagonist)
//
// Each part is defined as a PixelGrid (2D array of hex colors).
// Parts are composed by ModularSprite using offset positions.
//
// Design note: Frisk is a small child (~32px tall at pixelSize=2)
// with brown hair, striped shirt (blue/magenta), and simple face.
// ============================================================

import { ModularSpriteDef } from '../types';
import { COLORS } from '../constants';

const C: Record<string, string | null> = {
  _: null,             // transparent
  S: COLORS.friskSkin, // skin
  H: COLORS.friskHair, // hair
  B: COLORS.friskShirtBlue,   // shirt blue
  M: COLORS.friskShirtStripe, // shirt magenta stripe
  P: COLORS.friskPants,       // pants
  O: COLORS.friskShoes,       // shoes
  W: COLORS.white,            // eye whites
  K: COLORS.black,            // eye dots
};

// --- HEAD (9x10 pixels) ---
// Frisk's head: brown hair on top, simple face with dot eyes
const HEAD: (string | null)[][] = [
  [C._, C._, C.H, C.H, C.H, C.H, C.H, C._, C._],
  [C._, C.H, C.H, C.H, C.H, C.H, C.H, C.H, C._],
  [C.H, C.H, C.H, C.H, C.H, C.H, C.H, C.H, C.H],
  [C.H, C.H, C.S, C.S, C.S, C.S, C.S, C.H, C.H],
  [C.H, C.S, C.S, C.S, C.S, C.S, C.S, C.S, C.H],
  [C._, C.S, C.K, C.S, C.S, C.S, C.K, C.S, C._],
  [C._, C.S, C.S, C.S, C.S, C.S, C.S, C.S, C._],
  [C._, C._, C.S, C.S, C.S, C.S, C.S, C._, C._],
  [C._, C._, C._, C.S, C.S, C.S, C._, C._, C._],
  [C._, C._, C._, C._, C._, C._, C._, C._, C._],
];

// --- BODY (9x8 pixels) ---
// Blue shirt with magenta stripe
const BODY: (string | null)[][] = [
  [C._, C._, C.S, C.S, C.S, C.S, C.S, C._, C._],
  [C._, C.S, C.B, C.B, C.B, C.B, C.B, C.S, C._],
  [C.S, C.B, C.B, C.B, C.B, C.B, C.B, C.B, C.S],
  [C._, C.B, C.B, C.B, C.B, C.B, C.B, C.B, C._],
  [C._, C.B, C.B, C.M, C.M, C.M, C.B, C.B, C._],
  [C._, C.B, C.B, C.M, C.M, C.M, C.B, C.B, C._],
  [C._, C._, C.B, C.B, C.B, C.B, C.B, C._, C._],
  [C._, C._, C.P, C.P, C.P, C.P, C.P, C._, C._],
];

// --- LEFT ARM (3x6 pixels) ---
const LEFT_ARM: (string | null)[][] = [
  [C._, C.S, C.S],
  [C.S, C.B, C.B],
  [C._, C.B, C.B],
  [C._, C.B, C.B],
  [C._, C.B, C.B],
  [C._, C.S, C._],
];

// --- RIGHT ARM (3x6 pixels) ---
const RIGHT_ARM: (string | null)[][] = [
  [C.S, C.S, C._],
  [C.B, C.B, C.S],
  [C.B, C.B, C._],
  [C.B, C.B, C._],
  [C.B, C.B, C._],
  [C._, C.S, C._],
];

// --- LEGS (7x5 pixels) ---
const LEGS: (string | null)[][] = [
  [C._, C.P, C._, C._, C.P, C._, C._],
  [C._, C.P, C._, C._, C.P, C._, C._],
  [C._, C.P, C._, C._, C.P, C._, C._],
  [C._, C.O, C._, C._, C.O, C._, C._],
  [C.O, C.O, C._, C._, C.O, C.O, C._],
];

// --- Build the sprite definition ---
export const FRISK_SPRITE: ModularSpriteDef = {
  id: 'frisk',
  parts: [
    {
      id: 'body',
      pixels: BODY,
      offset: { x: 0, y: 9 },  // Below head
    },
    {
      id: 'head',
      pixels: HEAD,
      offset: { x: 0, y: 0 },
    },
    {
      id: 'left_arm',
      pixels: LEFT_ARM,
      offset: { x: -3, y: 10 },  // Left of body
    },
    {
      id: 'right_arm',
      pixels: RIGHT_ARM,
      offset: { x: 9, y: 10 },  // Right of body
    },
    {
      id: 'legs',
      pixels: LEGS,
      offset: { x: 1, y: 17 },  // Below body
    },
  ],
  animations: [
    {
      id: 'idle',
      frames: [
        {
          duration: 400,
          partOffsets: {},
        },
        {
          duration: 400,
          partOffsets: {
            head: { x: 0, y: -1 },
          },
        },
      ],
      loop: true,
    },
    {
      id: 'walk_right',
      frames: [
        {
          duration: 200,
          partOffsets: {
            left_arm: { x: 0, y: -1 },
            right_arm: { x: 0, y: 1 },
            legs: { x: 0, y: 0 },
          },
        },
        {
          duration: 200,
          partOffsets: {
            left_arm: { x: 0, y: 1 },
            right_arm: { x: 0, y: -1 },
            legs: { x: 1, y: 0 },
          },
        },
      ],
      loop: true,
    },
    {
      id: 'walk_left',
      frames: [
        {
          duration: 200,
          partOffsets: {
            left_arm: { x: 0, y: 1 },
            right_arm: { x: 0, y: -1 },
            legs: { x: 0, y: 0 },
          },
        },
        {
          duration: 200,
          partOffsets: {
            left_arm: { x: 0, y: -1 },
            right_arm: { x: 0, y: 1 },
            legs: { x: -1, y: 0 },
          },
        },
      ],
      loop: true,
    },
    {
      id: 'hurt',
      frames: [
        {
          duration: 100,
          partOffsets: {
            head: { x: 1, y: -2 },
            body: { x: 1, y: 0 },
            left_arm: { x: 2, y: -2 },
            right_arm: { x: 2, y: -2 },
          },
        },
        {
          duration: 100,
          partOffsets: {
            head: { x: -1, y: 0 },
            body: { x: -1, y: 0 },
            left_arm: { x: -2, y: 0 },
            right_arm: { x: -2, y: 0 },
          },
        },
      ],
      loop: false,
    },
  ],
};
