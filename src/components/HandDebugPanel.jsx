import { LANDMARK } from '../constants/mediapipe.js';

const FINGER_TIPS = [
    { name: 'Pulgar', idx: LANDMARK.THUMB_TIP },
    { name: 'Índice', idx: LANDMARK.INDEX_TIP },
    { name: 'Medio', idx: LANDMARK.MIDDLE_TIP },
    { name: 'Anular', idx: LANDMARK.RING_TIP },
    { name: 'Meñique', idx: LANDMARK.PINKY_TIP },
];

export function HandDebugPanel({ hands }) {
    if (!hands.length) {
        return (
            <div style={styles.panel}>
                <div style={styles.title}>Coordenadas de dedos</div>
                <div style={styles.empty}>— Sin manos detectadas —</div>
            </div>
        );
    }

    return (
        <div style={styles.panel}>
            <div style={styles.title}>Coordenadas de dedos</div>
            {hands.map((hand, hi) => (
                <div key={hi} style={{ marginBottom: 12 }}>
                    <div style={styles.handLabel}>
                        {hand.handedness === 'Right' ? '→ Mano derecha' : '← Mano izquierda'}
                        <span style={styles.score}>{(hand.score * 100).toFixed(0)}%</span>
                    </div>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Dedo</th>
                                <th style={styles.th}>X</th>
                                <th style={styles.th}>Y</th>
                                <th style={styles.th}>Z</th>
                            </tr>
                        </thead>
                        <tbody>
                            {FINGER_TIPS.map(({ name, idx }) => {
                                const pt = hand.landmarks[idx];
                                if (!pt) return null;
                                return (
                                    <tr key={idx}>
                                        <td style={styles.td}>{name}</td>
                                        <td style={{ ...styles.td, ...styles.coord }}>{pt.x.toFixed(3)}</td>
                                        <td style={{ ...styles.td, ...styles.coord }}>{pt.y.toFixed(3)}</td>
                                        <td style={{ ...styles.td, ...styles.coord, color: '#666' }}>{pt.z.toFixed(3)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}

const styles = {
    panel: {
        background: '#0e0e0e',
        border: '1px solid #1e1e1e',
        borderRadius: 4,
        overflow: 'hidden',
        fontFamily: 'JetBrains Mono, monospace',
    },
    title: {
        fontSize: 9, letterSpacing: 2, textTransform: 'uppercase',
        color: '#444', padding: '8px 14px', background: '#0a0a0a',
        borderBottom: '1px solid #1a1a1a',
    },
    empty: { padding: '20px 14px', color: '#2a2a2a', fontSize: 11, textAlign: 'center' },
    handLabel: {
        fontSize: 10, color: '#e8720c', padding: '8px 14px 4px',
        display: 'flex', justifyContent: 'space-between',
    },
    score: { color: '#555' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 11 },
    th: { padding: '4px 14px', color: '#333', textAlign: 'left', fontWeight: 400, borderBottom: '1px solid #1a1a1a' },
    td: { padding: '4px 14px', borderBottom: '1px solid #111', color: '#888' },
    coord: { color: '#e8720c', fontVariantNumeric: 'tabular-nums' },
};