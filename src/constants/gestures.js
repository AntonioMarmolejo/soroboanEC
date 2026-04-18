// Umbrales del clasificador de gestos — ajustar para calibrar sensibilidad

export const PINCH_ON_DIST      = 0.07;   // distancia normalizada 3D para activar pellizco
export const PINCH_OFF_DIST     = 0.09;   // histéresis: distancia para soltar pellizco
export const SWIPE_STEP_Y       = 0.07;   // delta Y mínimo por paso (~34px a 480p)
export const COL_COOLDOWN_MS    = 360;    // ms entre pasos en la misma columna
export const GLOBAL_COOLDOWN_MS = 80;     // ms mínimo entre cualquier acción
export const PALM_FRAMES        = 26;     // frames consecutivos de palma → reset
export const PALM_EXTEND_Y      = 0.04;   // margen mínimo tip.y < mcp.y - margen

// Mapeo de coordenadas de mano → columna del ábaco
// (derivado de PAD_X=8 sobre un canvas de ~640px)
export const COL_MAP_PAD        = 0.012;  // fracción normalizada del padding lateral
export const COL_MAP_W          = 0.976;  // fracción normalizada del ancho útil
