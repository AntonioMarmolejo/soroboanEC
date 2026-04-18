import { useRef, useEffect } from 'react';
import { useCamera } from '../hooks/useCamera.js';
import { useHandDetection } from '../hooks/useHandDetection.js';

export function CameraOverlay({ enabled, onHandsUpdate }) {
    const canvasRef = useRef(null);

    const { videoRef, status, error, dims, start, stop } = useCamera();

    const { hands, isReady, detected } = useHandDetection({
        videoRef,
        canvasRef,
        enabled: enabled && status === 'active',
    });

    // Sincronizar tamaño del canvas con el video
    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = dims.w;
            canvasRef.current.height = dims.h;
        }
    }, [dims]);

    // Notificar al padre cuando cambien las manos detectadas
    useEffect(() => {
        onHandsUpdate?.(hands);
    }, [hands, onHandsUpdate]);

    // Auto-start cuando enabled cambia a true
    useEffect(() => {
        if (enabled) start();
        else stop();
    }, [enabled]);

    return (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#0a0a0a', borderRadius: 6, overflow: 'hidden' }}>

            {/* Video — espejado horizontalmente */}
            <video
                ref={videoRef}
                muted
                playsInline
                style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)', // espejo natural
                    display: status === 'active' ? 'block' : 'none',
                }}
            />

            {/* Canvas overlay — landmarks encima del video */}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    transform: 'scaleX(-1)', // mismo espejo que el video
                    pointerEvents: 'none',
                }}
            />

            {/* Estados de UI */}
            {status === 'idle' && (
                <CamPlaceholder label="Cámara apagada" icon="📷" />
            )}
            {status === 'requesting' && (
                <CamPlaceholder label="Solicitando permiso…" icon="⏳" />
            )}
            {status === 'error' && (
                <CamPlaceholder label={error} icon="⚠️" isError />
            )}

            {/* Indicador de mano detectada */}
            {status === 'active' && (
                <DetectionBadge detected={detected} isReady={isReady} />
            )}
        </div>
    );
}

function CamPlaceholder({ label, icon, isError }) {
    return (
        <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 10,
            color: isError ? '#e74c3c' : '#555',
        }}>
            <span style={{ fontSize: 36 }}>{icon}</span>
            <span style={{ fontSize: 12, fontFamily: 'monospace', letterSpacing: 1, textAlign: 'center', padding: '0 20px' }}>{label}</span>
        </div>
    );
}

function DetectionBadge({ detected, isReady }) {
    const color = !isReady ? '#555' : detected ? '#2ecc71' : '#e67e22';
    const label = !isReady ? 'Cargando modelo…' : detected ? 'Mano detectada' : 'Sin mano';

    return (
        <div style={{
            position: 'absolute', top: 10, left: 10,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(0,0,0,0.6)',
            border: `1px solid ${color}`,
            borderRadius: 4,
            padding: '4px 10px',
            fontSize: 10,
            fontFamily: 'monospace',
            letterSpacing: 1,
            color,
        }}>
            <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: color,
                boxShadow: detected ? `0 0 6px ${color}` : 'none',
                animation: detected ? 'pulse 1.4s ease infinite' : 'none',
            }} />
            {label}
        </div>
    );
}