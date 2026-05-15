'use client';

import dynamic from 'next/dynamic';

// Phaser accesses `window` on import, so we must disable SSR for the game component.
const GameContainer = dynamic(() => import('@/components/GameContainer'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '640px',
        height: '480px',
        border: '3px solid #fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: '"DotumChe", "Courier New", monospace',
        fontSize: '20px',
      }}
    >
      Loading...
    </div>
  ),
});

export default function Home() {
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

      {/* Phaser Game Container */}
      <GameContainer />

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
