import './GestureFeedback.css';

const COLS = 8;

const PLACE_LABELS = Array.from({ length: COLS }, (_, i) => {
  const v = Math.pow(10, COLS - 1 - i);
  if (v >= 1e12) return '1T';
  if (v >= 1e9)  return (v / 1e9) + 'B';
  if (v >= 1e6)  return (v / 1e6) + 'M';
  if (v >= 1e3)  return (v / 1e3) + 'K';
  return String(v);
});

export function GestureFeedback({ gesture }) {
  const { type, col } = gesture;

  return (
    <div style={s.wrap}>

      {/* Fila de columnas — resalta la activa */}
      <div style={s.colGrid}>
        {Array.from({ length: COLS }, (_, i) => (
          <div key={i} style={i === col ? { ...s.cell, ...s.cellOn } : s.cell}>
            <span style={s.colNum}>{COLS - i}</span>
            <span style={i === col ? { ...s.colPlace, color: '#e8720c' } : s.colPlace}>
              {PLACE_LABELS[i]}
            </span>
          </div>
        ))}
      </div>

      {/* Badge de gesto */}
      <div style={s.badge}>
        {type === 'idle' && (
          <span style={s.idle}>— sin gesto detectado —</span>
        )}
        {type === 'pinch' && col >= 0 && (
          <span style={s.pinch}>
            ✌ PELLIZCO
            <span style={s.sep}>·</span>
            col {COLS - col}
            <span style={s.sep}>·</span>
            ×{PLACE_LABELS[col]}
            <span style={s.hint}> desliza ↑↓ para mover cuenta</span>
          </span>
        )}
        {type === 'palm' && (
          <span style={s.palm}>
            ✋ PALMA ABIERTA
            <span style={s.sep}>·</span>
            mantén para resetear…
            <span style={s.palmDots} />
          </span>
        )}
      </div>

    </div>
  );
}

const s = {
  wrap: {
    width: '100%',
    maxWidth: 1000,
    margin: '0 auto',
    padding: '8px 24px 10px',
    background: '#080808',
    borderTop: '1px solid #181818',
    borderBottom: '1px solid #181818',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    boxSizing: 'border-box',
  },
  colGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(13, 1fr)',
    gap: 2,
  },
  cell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3px 0',
    borderRadius: 2,
    transition: 'background 0.12s',
  },
  cellOn: {
    background: 'rgba(232,114,12,0.12)',
  },
  colNum: {
    fontSize: 10,
    fontFamily: 'JetBrains Mono, monospace',
    fontWeight: 700,
    color: '#333',
    lineHeight: 1,
    transition: 'color 0.12s',
  },
  colPlace: {
    fontSize: 7,
    fontFamily: 'JetBrains Mono, monospace',
    color: '#252525',
    letterSpacing: 0,
    lineHeight: 1.4,
    transition: 'color 0.12s',
  },
  badge: {
    height: 16,
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 9,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
  },
  idle:  { color: '#252525' },
  pinch: { color: '#e8720c', display: 'flex', alignItems: 'center', gap: 4 },
  palm:  { color: '#00e5ff', display: 'flex', alignItems: 'center', gap: 4 },
  sep:   { color: '#333', margin: '0 2px' },
  hint:  { color: '#3a3a3a', letterSpacing: '0.5px', textTransform: 'none', fontSize: 8 },
  // Puntos animados para indicar "esperando"
  palmDots: {
    display: 'inline-block',
    width: 20,
    height: 8,
    background: `
      radial-gradient(circle, #00e5ff 1.5px, transparent 1.5px) 0 50%,
      radial-gradient(circle, #00e5ff 1.5px, transparent 1.5px) 7px 50%,
      radial-gradient(circle, #00e5ff 1.5px, transparent 1.5px) 14px 50%
    `,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '4px 4px, 4px 4px, 4px 4px',
    animation: 'srPalmPulse 0.8s ease-in-out infinite',
  },
};
