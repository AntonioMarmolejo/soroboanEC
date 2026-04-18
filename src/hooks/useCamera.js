import { useEffect, useRef, useState, useCallback } from 'react';

const CONSTRAINTS = {
    video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user',
        frameRate: { ideal: 30 },
    },
};

export function useCamera() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const [status, setStatus] = useState('idle'); // idle | requesting | active | error
    const [error, setError] = useState(null);
    const [dims, setDims] = useState({ w: 640, h: 480 });

    const start = useCallback(async () => {
        setStatus('requesting');
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia(CONSTRAINTS);
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setDims({
                    w: videoRef.current.videoWidth || 640,
                    h: videoRef.current.videoHeight || 480,
                });
            }
            setStatus('active');
        } catch (err) {
            const msg =
                err.name === 'NotAllowedError' ? 'Permiso de cámara denegado.' :
                    err.name === 'NotFoundError' ? 'No se encontró cámara.' :
                        err.name === 'NotReadableError' ? 'Cámara en uso por otra app.' :
                            `Error: ${err.message}`;
            setError(msg);
            setStatus('error');
        }
    }, []);

    const stop = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        setStatus('idle');
    }, []);

    // Limpiar al desmontar
    useEffect(() => () => stop(), [stop]);

    return { videoRef, status, error, dims, start, stop };
}