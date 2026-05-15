'use client';

import { useEffect, useRef } from 'react';
import { PhaserGame } from '@/game/phaser/PhaserGame';

export default function GameContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<PhaserGame | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const phaserGame = new PhaserGame();
    phaserGame.create(containerRef.current);
    gameRef.current = phaserGame;

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        border: '3px solid #fff',
        boxShadow: '0 0 20px rgba(255,255,255,0.1)',
        width: '640px',
        height: '480px',
        imageRendering: 'pixelated',
      }}
    />
  );
}
