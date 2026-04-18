// Índices de landmarks de MediaPipe Hands (21 puntos)
export const LANDMARK = {
    WRIST: 0,
    THUMB_CMC: 1, THUMB_MCP: 2, THUMB_IP: 3, THUMB_TIP: 4,
    INDEX_MCP: 5, INDEX_PIP: 6, INDEX_DIP: 7, INDEX_TIP: 8,
    MIDDLE_MCP: 9, MIDDLE_PIP: 10, MIDDLE_DIP: 11, MIDDLE_TIP: 12,
    RING_MCP: 13, RING_PIP: 14, RING_DIP: 15, RING_TIP: 16,
    PINKY_MCP: 17, PINKY_PIP: 18, PINKY_DIP: 19, PINKY_TIP: 20,
};

// Conexiones para dibujar el esqueleto (pares de índices)
export const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],       // pulgar
    [0, 5], [5, 6], [6, 7], [7, 8],       // índice
    [0, 9], [9, 10], [10, 11], [11, 12],  // medio
    [0, 13], [13, 14], [14, 15], [15, 16],// anular
    [0, 17], [17, 18], [18, 19], [19, 20],// meñique
    [5, 9], [9, 13], [13, 17],          // palma
];

export const MEDIAPIPE_CONFIG = {
    maxNumHands: 2,
    modelComplexity: 1,      // 0=lite, 1=full
    minDetectionConfidence: 0.75,
    minTrackingConfidence: 0.6,
};