import { useEffect, useRef, useState } from 'react';
import { LANDMARK } from '../constants/mediapipe.js';
import {
  PINCH_ON_DIST, PINCH_OFF_DIST,
  SWIPE_STEP_Y, COL_COOLDOWN_MS, GLOBAL_COOLDOWN_MS,
  PALM_FRAMES, PALM_EXTEND_Y,
  COL_MAP_PAD, COL_MAP_W,
} from '../constants/gestures.js';

const COLS = 8;

// ── Helpers ────────────────────────────────────────────────────────────────

function getPinchDist(lm) {
  const t = lm[LANDMARK.THUMB_TIP];
  const i = lm[LANDMARK.INDEX_TIP];
  // Incluye Z con factor reducido (Z está en escala relativa)
  return Math.hypot(t.x - i.x, t.y - i.y, (t.z - i.z) * 0.3);
}

function isOpenPalm(lm) {
  // Cada dedo: punta visualmente por encima del MCP y del PIP
  // En coords MediaPipe: y=0 arriba, y=1 abajo → "arriba" = y menor
  const fingers = [
    [LANDMARK.INDEX_TIP,  LANDMARK.INDEX_MCP,  LANDMARK.INDEX_PIP],
    [LANDMARK.MIDDLE_TIP, LANDMARK.MIDDLE_MCP, LANDMARK.MIDDLE_PIP],
    [LANDMARK.RING_TIP,   LANDMARK.RING_MCP,   LANDMARK.RING_PIP],
    [LANDMARK.PINKY_TIP,  LANDMARK.PINKY_MCP,  LANDMARK.PINKY_PIP],
  ];
  return fingers.every(([tip, mcp, pip]) =>
    lm[tip].y < lm[mcp].y - PALM_EXTEND_Y && lm[tip].y < lm[pip].y
  );
}

function landmarkToCol(lm) {
  // Video está espejado en CSS (scaleX(-1)); MediaPipe da coords sin espejo.
  // Corrección: displayX = 1 - mediapipe_x
  const displayX = 1 - lm[LANDMARK.INDEX_TIP].x;
  const rel = (displayX - COL_MAP_PAD) / COL_MAP_W;
  return Math.max(0, Math.min(COLS - 1, Math.floor(rel * COLS)));
}

// ── Hook ───────────────────────────────────────────────────────────────────

/**
 * Clasifica gestos de mano en tiempo real y dispara acciones sobre el ábaco.
 *
 * @param {object[]} hands  — Array de manos detectadas por useHandDetection
 * @param {Function} onAction — Callback({ type, col, label }) cuando se activa una acción
 * @returns {{ type: string, col: number }} — Estado del gesto actual para el UI
 */
export function useGestureEngine({ hands, onAction }) {
  // Estado inter-frame: refs para no provocar re-renders innecesarios
  const isPinchedRef      = useRef(false);
  const pinchAnchorYRef   = useRef(0);
  const colCooldownRef    = useRef({});    // col → timestamp último disparo
  const globalCooldownRef = useRef(0);    // timestamp del último disparo (cualquier col)
  const palmCountRef      = useRef(0);    // frames consecutivos de palma abierta

  // Estado visible: sólo cambia cuando el tipo o columna activa cambia
  const gestureRef = useRef({ type: 'idle', col: -1 });
  const [gesture, setGesture] = useState({ type: 'idle', col: -1 });

  function updateGesture(next) {
    const prev = gestureRef.current;
    if (prev.type !== next.type || prev.col !== next.col) {
      gestureRef.current = next;
      setGesture(next);
    }
  }

  useEffect(() => {
    if (!hands.length) {
      isPinchedRef.current   = false;
      palmCountRef.current   = 0;
      updateGesture({ type: 'idle', col: -1 });
      return;
    }

    const { landmarks } = hands[0];
    const pinchDist = getPinchDist(landmarks);
    const col       = landmarkToCol(landmarks);
    const indexY    = landmarks[LANDMARK.INDEX_TIP].y;
    const palmOpen  = isOpenPalm(landmarks);

    // ── 1. Palma abierta (prioridad sobre pellizco) ───────────────────────
    if (palmOpen && !isPinchedRef.current) {
      palmCountRef.current++;
      updateGesture({ type: 'palm', col: -1 });

      if (palmCountRef.current >= PALM_FRAMES) {
        palmCountRef.current = 0;
        onAction({ type: 'RESET', label: 'Gesto: palma abierta' });
      }
      return;
    }
    palmCountRef.current = 0;

    // ── 2. Entrada al pellizco ────────────────────────────────────────────
    if (!isPinchedRef.current && pinchDist < PINCH_ON_DIST) {
      isPinchedRef.current = true;
      pinchAnchorYRef.current = indexY;
      updateGesture({ type: 'pinch', col });
      return;
    }

    // ── 3. Salida del pellizco (con histéresis para evitar flicker) ───────
    if (isPinchedRef.current && pinchDist > PINCH_OFF_DIST) {
      isPinchedRef.current = false;
      updateGesture({ type: 'idle', col: -1 });
      return;
    }

    // ── 4. Pellizco activo: detectar desliz vertical ──────────────────────
    if (isPinchedRef.current) {
      updateGesture({ type: 'pinch', col });

      const deltaY = indexY - pinchAnchorYRef.current;

      if (Math.abs(deltaY) >= SWIPE_STEP_Y) {
        const now      = Date.now();
        const colTs    = colCooldownRef.current[col] ?? 0;
        const globalTs = globalCooldownRef.current;

        if (now - colTs > COL_COOLDOWN_MS && now - globalTs > GLOBAL_COOLDOWN_MS) {
          // y decrece al subir la mano → INC; aumenta al bajar → DEC
          const type = deltaY < 0 ? 'INC' : 'DEC';
          colCooldownRef.current[col] = now;
          globalCooldownRef.current   = now;
          pinchAnchorYRef.current     = indexY; // reset anchor para swipe continuo
          onAction({ type, col, label: `Gesto ${type === 'INC' ? '↑' : '↓'} col ${COLS - col}` });
        } else {
          pinchAnchorYRef.current = indexY; // evitar acumulación en cooldown
        }
      }
      return;
    }

    // ── 5. Reposo ─────────────────────────────────────────────────────────
    updateGesture({ type: 'idle', col: -1 });
  }, [hands, onAction]);

  return gesture;
}
