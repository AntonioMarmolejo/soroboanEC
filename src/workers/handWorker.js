// Web Worker — corre MediaPipe en hilo separado para no bloquear React
import { Hands } from '@mediapipe/hands';
import { MEDIAPIPE_CONFIG } from '../constants/mediapipe.js';

let hands = null;

async function initHands() {
    hands = new Hands({
        locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions(MEDIAPIPE_CONFIG);

    hands.onResults((results) => {
        // Enviamos los resultados de vuelta al hilo principal
        self.postMessage({
            type: 'RESULTS',
            payload: {
                multiHandLandmarks: results.multiHandLandmarks ?? [],
                multiHandWorldLandmarks: results.multiHandWorldLandmarks ?? [],
                multiHandedness: results.multiHandedness ?? [],
            },
        });
    });

    await hands.initialize();
    self.postMessage({ type: 'READY' });
}

// Escuchar mensajes del hilo principal
self.addEventListener('message', async (e) => {
    const { type, payload } = e.data;

    if (type === 'INIT') {
        await initHands();
        return;
    }

    if (type === 'DETECT' && hands) {
        // payload.imageBitmap viene del canvas del video
        await hands.send({ image: payload.imageBitmap });
        payload.imageBitmap.close(); // liberar memoria
    }
});