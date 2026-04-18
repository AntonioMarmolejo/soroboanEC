import { useEffect, useRef, useState, useCallback } from 'react';
import { HAND_CONNECTIONS } from '../constants/mediapipe.js';

const DETECT_INTERVAL_MS = 33; // ~30fps

export function useHandDetection({ videoRef, canvasRef, enabled }) {
    const workerRef = useRef(null);
    const rafRef = useRef(null);
    const lastDetectRef = useRef(0);

    const [hands, setHands] = useState([]);   // array de { landmarks, handedness }
    const [isReady, setIsReady] = useState(false);
    const [detected, setDetected] = useState(false);

    // Inicializar worker
    useEffect(() => {
        if (!enabled) return;

        const worker = new Worker(
            new URL('../workers/handWorker.js', import.meta.url),
            { type: 'module' }
        );

        worker.onmessage = (e) => {
            const { type, payload } = e.data;

            if (type === 'READY') {
                setIsReady(true);
                return;
            }

            if (type === 'RESULTS') {
                const { multiHandLandmarks, multiHandedness } = payload;
                const detected = multiHandLandmarks.length > 0;
                setDetected(detected);

                const parsed = multiHandLandmarks.map((lm, i) => ({
                    landmarks: lm,
                    handedness: multiHandedness[i]?.label ?? 'Unknown',
                    score: multiHandedness[i]?.score ?? 0,
                }));
                setHands(parsed);

                // Dibujar overlay en canvas
                if (canvasRef.current && detected) {
                    drawOverlay(canvasRef.current, parsed);
                } else if (canvasRef.current) {
                    clearCanvas(canvasRef.current);
                }
            }
        };

        worker.postMessage({ type: 'INIT' });
        workerRef.current = worker;

        return () => {
            cancelAnimationFrame(rafRef.current);
            worker.terminate();
            workerRef.current = null;
            setIsReady(false);
        };
    }, [enabled]);

    // Loop de detección
    useEffect(() => {
        if (!isReady || !enabled) return;

        const detect = async (ts) => {
            rafRef.current = requestAnimationFrame(detect);

            if (ts - lastDetectRef.current < DETECT_INTERVAL_MS) return;
            lastDetectRef.current = ts;

            const video = videoRef.current;
            if (!video || video.readyState < 2) return;

            try {
                const bitmap = await createImageBitmap(video);
                workerRef.current?.postMessage(
                    { type: 'DETECT', payload: { imageBitmap: bitmap } },
                    [bitmap] // transferable — zero-copy
                );
            } catch (_) {
                // frame drop silencioso
            }
        };

        rafRef.current = requestAnimationFrame(detect);
        return () => cancelAnimationFrame(rafRef.current);
    }, [isReady, enabled, videoRef]);

    return { hands, isReady, detected };
}

// ── Canvas helpers ──────────────────────────────────────

function clearCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawOverlay(canvas, hands) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    hands.forEach(({ landmarks, handedness }) => {
        const isRight = handedness === 'Right';
        const color = isRight ? '#00e5ff' : '#ff6b35';

        // Conexiones (esqueleto)
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.75;
        HAND_CONNECTIONS.forEach(([a, b]) => {
            const p1 = landmarks[a];
            const p2 = landmarks[b];
            ctx.beginPath();
            ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
            ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
            ctx.stroke();
        });

        // Puntos de landmark
        ctx.globalAlpha = 1;
        landmarks.forEach((pt, i) => {
            const x = pt.x * canvas.width;
            const y = pt.y * canvas.height;
            const r = i === 0 ? 6 : (i % 4 === 0 ? 5 : 3); // muñeca y tips más grandes

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = i % 4 === 0 ? '#ffffff' : color;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.fill();
            ctx.stroke();
        });

        // Etiqueta de mano
        const wrist = landmarks[0];
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.9;
        ctx.fillText(
            isRight ? 'R' : 'L',
            wrist.x * canvas.width + 10,
            wrist.y * canvas.height
        );
        ctx.globalAlpha = 1;
    });
}