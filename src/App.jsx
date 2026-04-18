import { useState, useCallback, useEffect, useRef } from 'react';
import { Soroboan }        from './components/Soroboan.jsx';
import { CameraOverlay }   from './components/CameraOverlay.jsx';
import { HandDebugPanel }  from './components/HandDebugPanel.jsx';
import { GestureFeedback } from './components/GestureFeedback.jsx';
import { useGestureEngine } from './hooks/useGestureEngine.js';

export default function App() {
  const [camEnabled, setCamEnabled] = useState(false);
  const [hands, setHands]           = useState([]);

  const engineRef = useRef(null);

  const handleHandsUpdate  = useCallback((h) => setHands(h), []);
  const handleEngineReady  = useCallback((engine) => { engineRef.current = engine; }, []);
  const handleGestureAction = useCallback((action) => {
    engineRef.current?.dispatch(action);
  }, []);

  // Motor de gestos — clasifica manos y dispara acciones sobre el ábaco
  const gesture = useGestureEngine({ hands, onAction: handleGestureAction });

  // Sincronizar columna activa en el canvas del ábaco
  useEffect(() => {
    engineRef.current?.setGestureCol(gesture.col);
  }, [gesture.col]);

  return (
    <>
      <Soroboan onEngineReady={handleEngineReady} />

      {/* Feedback de gestos — visible siempre que la cámara esté activa */}
      {camEnabled && <GestureFeedback gesture={gesture} />}

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '16px 24px 32px', width: '100%', boxSizing: 'border-box' }}>

        <button
          onClick={() => setCamEnabled(v => !v)}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase',
            padding: '9px 18px', borderRadius: 3,
            border: '1px solid #2a2a2a', background: '#111',
            color: camEnabled ? '#e8720c' : '#555',
            borderColor: camEnabled ? '#a04e06' : '#2a2a2a',
            cursor: 'pointer', marginBottom: 16, transition: 'all 0.2s',
          }}
        >
          {camEnabled ? '⏹ Apagar cámara' : '📷 Activar cámara'}
        </button>

        {camEnabled && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <CameraOverlay enabled={camEnabled} onHandsUpdate={handleHandsUpdate} />
            <HandDebugPanel hands={hands} />
          </div>
        )}

      </div>
    </>
  );
}
