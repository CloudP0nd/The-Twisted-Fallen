'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Game } from '@/game/Game';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create and initialize game
    const game = new Game();
    game.init(canvas);
    gameRef.current = game;
  }, []);

  useEffect(() => {
    initGame();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, [initGame]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#000',
        padding: '1rem',
      }}
    >
      {/* Title */}
      <h1
        style={{
          color: '#ff0000',
          fontFamily: '"DotumChe", "Courier New", monospace',
          fontSize: '1.5rem',
          marginBottom: '0.5rem',
          letterSpacing: '0.2em',
          textShadow: '0 0 10px rgba(255,0,0,0.5)',
        }}
      >
        UNDERTALE: TWISTED LOVES
      </h1>

      {/* Game Canvas Container */}
      <div
        style={{
          position: 'relative',
          border: '3px solid #fff',
          boxShadow: '0 0 20px rgba(255,255,255,0.1)',
          imageRendering: 'pixelated',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '640px',
            height: '480px',
            imageRendering: 'pixelated',
          }}
        />
      </div>

      {/* Controls hint */}
      <div
        style={{
          color: '#808080',
          fontFamily: '"DotumChe", "Courier New", monospace',
          fontSize: '0.75rem',
          marginTop: '1rem',
          textAlign: 'center',
          lineHeight: '1.6',
        }}
      >
        <span style={{ color: '#ffff00' }}>Z</span> / Enter: Confirm &nbsp;&nbsp;
        <span style={{ color: '#ffff00' }}>X</span> / Shift: Cancel &nbsp;&nbsp;
        <span style={{ color: '#ffff00' }}>Arrow Keys</span>: Move
      </div>
    </div>
  );
}
