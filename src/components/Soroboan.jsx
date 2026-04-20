import { useRef, useEffect } from 'react';
import './Soroboan.css';

// ── REDUCER (lógica pura, sin DOM) ──────────────────────────────────────────

const COLS = 8;

function mkState() {
  return { heaven: new Array(COLS).fill(false), earth: new Array(COLS).fill(0), history: [] };
}

function calcValue(s) {
  let t = 0;
  for (let c = 0; c < COLS; c++)
    t += ((s.heaven[c] ? 5 : 0) + s.earth[c]) * Math.pow(10, COLS - 1 - c);
  return t;
}

function calcDigits(s) {
  return Array.from({ length: COLS }, (_, c) => (s.heaven[c] ? 5 : 0) + s.earth[c]);
}

function reduce(state, action) {
  const s = { heaven: [...state.heaven], earth: [...state.earth], history: [...state.history] };
  const prev = calcValue(state);

  switch (action.type) {
    case 'TOGGLE_HEAVEN':
      s.heaven[action.col] = !s.heaven[action.col];
      break;
    case 'SET_EARTH':
      s.earth[action.col] = Math.max(0, Math.min(4, action.val));
      break;
    case 'INC': {
      const c = action.col;
      if (s.earth[c] < 4)     { s.earth[c]++; }
      else if (!s.heaven[c])  { s.heaven[c] = true; s.earth[c] = 0; }
      break;
    }
    case 'DEC': {
      const c = action.col;
      if (s.earth[c] > 0)    { s.earth[c]--; }
      else if (s.heaven[c])  { s.heaven[c] = false; s.earth[c] = 4; }
      break;
    }
    case 'SET_VAL': {
      const n = Math.max(0, Math.min(9999999999999, action.val));
      const str = Math.floor(n).toString().padStart(COLS, '0');
      for (let c = 0; c < COLS; c++) {
        const d = parseInt(str[c]);
        s.heaven[c] = d >= 5;
        s.earth[c]  = d >= 5 ? d - 5 : d;
      }
      break;
    }
    case 'RESET':
      s.heaven = new Array(COLS).fill(false);
      s.earth  = new Array(COLS).fill(0);
      break;
  }

  const curr = calcValue(s);
  if (curr !== prev || action.type === 'RESET')
    s.history.unshift({ val: curr, delta: curr - prev, label: action.label || action.type, ts: Date.now() });
  if (s.history.length > 60) s.history.length = 60;
  return s;
}

function fmt(n) { return n === 0 ? '0' : n.toLocaleString('es-ES'); }

// ── PALETAS DE COLOR ─────────────────────────────────────────────────────────

const PALETTES = {
  orange: {
    shadow:  'rgba(255,120,20,0.5)',
    glow:    'rgba(232,114,12,0.10)',
    glowTxt: 'rgba(232,114,12,0.55)',
    aHov:  ['#ffb040','#ff9020','#c05008','#803005'],
    aNorm: ['#f08020','#e06010','#c05008','#803005'],
    iHov:  ['#d06018','#a03c0a','#502005'],
    iNorm: ['#b04c10','#883008','#502005'],
    eqA:  'rgba(255,160,60,0.35)',
    eqI:  'rgba(180,80,20,0.2)',
    hlA:  'rgba(255,220,140,0.55)',
    hlI:  'rgba(200,120,60,0.3)',
    stAH: 'rgba(255,180,80,0.8)',
    stAN: 'rgba(200,100,20,0.6)',
    stI:  'rgba(100,40,10,0.5)',
  },
  blue: {
    shadow:  'rgba(60,140,255,0.5)',
    glow:    'rgba(40,120,232,0.10)',
    glowTxt: 'rgba(40,120,232,0.60)',
    aHov:  ['#60b0ff','#3090ff','#1060c0','#083080'],
    aNorm: ['#3090e0','#2070c0','#1050a0','#083080'],
    iHov:  ['#2878d0','#1a50a0','#082050'],
    iNorm: ['#1860b0','#103888','#082050'],
    eqA:  'rgba(100,180,255,0.35)',
    eqI:  'rgba(40,100,200,0.2)',
    hlA:  'rgba(180,220,255,0.55)',
    hlI:  'rgba(80,160,220,0.3)',
    stAH: 'rgba(140,200,255,0.8)',
    stAN: 'rgba(60,120,220,0.6)',
    stI:  'rgba(20,60,160,0.5)',
  },
  green: {
    shadow:  'rgba(40,200,100,0.5)',
    glow:    'rgba(20,180,80,0.10)',
    glowTxt: 'rgba(20,180,80,0.60)',
    aHov:  ['#50e090','#20c060','#10a040','#086030'],
    aNorm: ['#28d070','#18b858','#10a040','#086030'],
    iHov:  ['#20b050','#109838','#086030'],
    iNorm: ['#129040','#0a7830','#086030'],
    eqA:  'rgba(80,220,120,0.35)',
    eqI:  'rgba(20,140,60,0.2)',
    hlA:  'rgba(160,240,180,0.55)',
    hlI:  'rgba(40,180,80,0.3)',
    stAH: 'rgba(100,240,140,0.8)',
    stAN: 'rgba(30,160,70,0.6)',
    stI:  'rgba(10,80,40,0.5)',
  },
  purple: {
    shadow:  'rgba(160,80,240,0.5)',
    glow:    'rgba(140,60,220,0.10)',
    glowTxt: 'rgba(140,60,220,0.60)',
    aHov:  ['#d080ff','#b050f0','#8030c0','#501880'],
    aNorm: ['#b060e8','#9040d0','#7020a8','#501880'],
    iHov:  ['#a040d8','#7818a8','#401068'],
    iNorm: ['#8030b8','#601890','#401068'],
    eqA:  'rgba(200,120,255,0.35)',
    eqI:  'rgba(120,40,200,0.2)',
    hlA:  'rgba(220,180,255,0.55)',
    hlI:  'rgba(160,80,220,0.3)',
    stAH: 'rgba(220,160,255,0.8)',
    stAN: 'rgba(140,60,200,0.6)',
    stI:  'rgba(80,20,140,0.5)',
  },
};

// ── CANVAS ENGINE (manipulación directa del DOM para 60fps) ─────────────────

class SorobanEngine {
  constructor(canvas, els, options = {}) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.els     = els;
    this.state   = mkState();
    this.snaps   = [];
    this.hCol    = -1;
    this.hZone   = null;
    this.hBead   = -1;
    this.animY   = {};
    this.L       = {};
    this.lastT   = 0;
    this.fps     = 0;
    this._flashTO  = null;
    this._rafId    = null;
    this.gestureCol = -1;
    this._onResize = () => { this._resize(); this._initAnim(); };

    this.theme   = options.theme   || 'dark';
    this.palette = options.palette || PALETTES.orange;

    this._resize();
    this._bind();
    this._initAnim();
    this._rafId = requestAnimationFrame(t => this._loop(t));
    window.addEventListener('resize', this._onResize);
  }

  destroy() {
    cancelAnimationFrame(this._rafId);
    window.removeEventListener('resize', this._onResize);
    clearTimeout(this._flashTO);
  }

  setTheme(theme)     { this.theme   = theme; }
  setPalette(palette) { this.palette = palette; }

  // ── API PÚBLICA (gesture engine) ──────────────────────────────────────────

  setGestureCol(col) { this.gestureCol = col; }

  dispatch(action) {
    if (action.type === 'RESET' || action.type === 'SET_VAL') this._snap();
    this._do(action);
  }

  // ── LAYOUT ────────────────────────────────────────────────────────────────

  _resize() {
    const W       = this.canvas.parentElement.clientWidth;
    const PAD_X   = 8;
    const PAD_Y   = 12;
    const COL_W   = (W - PAD_X * 2) / COLS;
    const BW      = COL_W * 0.78;
    const BH      = BW * 0.72;
    const GAP     = BH * 0.12;
    const ROD_W   = Math.max(1.5, COL_W * 0.07);
    const BAR_H   = Math.max(5, BH * 0.3);
    const H_ZONE_H = BH + PAD_Y * 2.2;
    const E_ZONE_H = BH * 4 + GAP * 3 + PAD_Y * 2.2;
    const TOTAL_H  = H_ZONE_H + BAR_H + E_ZONE_H;

    this.canvas.width  = W;
    this.canvas.height = TOTAL_H;
    this.canvas.style.height = TOTAL_H + 'px';
    this.L = { W, PAD_X, PAD_Y, COL_W, BW, BH, GAP, ROD_W, BAR_H,
               H_ZONE_H, E_ZONE_H, TOTAL_H, barY: H_ZONE_H, earthTop: H_ZONE_H + BAR_H };
  }

  _colX(c) { return this.L.PAD_X + c * this.L.COL_W + this.L.COL_W / 2; }

  _targetY(col, zone, beadIdx) {
    const { BH, GAP, PAD_Y, barY, earthTop, E_ZONE_H } = this.L;
    const slot = BH + GAP;
    if (zone === 'heaven') {
      return this.state.heaven[col]
        ? barY - BH / 2 - 3
        : PAD_Y + BH / 2;
    }
    const eCount = this.state.earth[col];
    if (beadIdx < eCount) return earthTop + BH / 2 + 3 + beadIdx * slot;
    const fromBottom = 3 - beadIdx;
    return earthTop + E_ZONE_H - PAD_Y - BH / 2 - fromBottom * slot;
  }

  _initAnim() {
    for (let c = 0; c < COLS; c++) {
      const hy = this._targetY(c, 'heaven', 0);
      this.animY[`${c}_h`] = { cur: hy, tgt: hy };
      for (let b = 0; b < 4; b++) {
        const ey = this._targetY(c, 'earth', b);
        this.animY[`${c}_e_${b}`] = { cur: ey, tgt: ey };
      }
    }
  }

  _updateTargets() {
    for (let c = 0; c < COLS; c++) {
      this.animY[`${c}_h`].tgt = this._targetY(c, 'heaven', 0);
      for (let b = 0; b < 4; b++)
        this.animY[`${c}_e_${b}`].tgt = this._targetY(c, 'earth', b);
    }
  }

  _stepAnim() {
    const SPEED = 0.28;
    for (const key in this.animY) {
      const a = this.animY[key];
      a.cur += (a.tgt - a.cur) * SPEED;
      if (Math.abs(a.tgt - a.cur) < 0.3) a.cur = a.tgt;
    }
  }

  // ── DRAW ──────────────────────────────────────────────────────────────────

  _draw() {
    const { ctx, L } = this;
    const { W, TOTAL_H, PAD_X, COL_W, BW, BH, ROD_W, BAR_H, barY } = L;
    const dark = this.theme === 'dark';
    const p    = this.palette;

    // Fondo del canvas
    ctx.fillStyle = dark ? '#060606' : '#cdc9c0';
    ctx.fillRect(0, 0, W, TOTAL_H);

    // Lane separators
    for (let c = 0; c < COLS; c++) {
      const x = PAD_X + c * COL_W;
      ctx.fillStyle = c % 2 === 0
        ? (dark ? 'rgba(255,255,255,0.008)' : 'rgba(0,0,0,0.018)')
        : 'transparent';
      ctx.fillRect(x, 0, COL_W, TOTAL_H);
    }

    // Divider bar
    ctx.fillStyle = dark ? '#1a1a1a' : '#b0aca4';
    ctx.fillRect(PAD_X - 4, barY, W - PAD_X * 2 + 8, BAR_H);
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.35)';
    ctx.fillRect(PAD_X - 4, barY, W - PAD_X * 2 + 8, 1);
    ctx.fillStyle = dark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.12)';
    ctx.fillRect(PAD_X - 4, barY + BAR_H - 1, W - PAD_X * 2 + 8, 1);

    // Marcadores de columna
    [1, 3, 5].forEach(ci => {
      const mx = this._colX(ci) + COL_W / 2;
      const my = barY + BAR_H / 2;
      ctx.beginPath();
      ctx.arc(mx, my, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = dark ? '#050505' : '#8a8680';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx - 0.8, my - 0.8, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.fill();
    });

    // Varillas
    for (let c = 0; c < COLS; c++) {
      const x = this._colX(c);
      const isHov = c === this.hCol;

      const seg = (y1, y2, lc = 'round') => {
        ctx.lineCap = lc;
        ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
      };

      ctx.strokeStyle = isHov
        ? (dark ? '#ece8dc' : '#f5f0e8')
        : (dark ? '#d4d0c4' : '#e8e4d8');
      ctx.lineWidth = ROD_W;
      seg(4, barY); seg(barY + BAR_H, TOTAL_H - 4);

      ctx.save();
      ctx.translate(ROD_W * 0.3, 0);
      ctx.strokeStyle = dark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.20)';
      ctx.lineWidth   = ROD_W * 0.4;
      seg(4, barY, 'butt'); seg(barY + BAR_H, TOTAL_H - 4, 'butt');
      ctx.restore();

      ctx.save();
      ctx.translate(-ROD_W * 0.32, 0);
      ctx.strokeStyle = dark ? 'rgba(0,0,0,0.28)' : 'rgba(0,0,0,0.10)';
      ctx.lineWidth   = ROD_W * 0.3;
      seg(4, barY, 'butt'); seg(barY + BAR_H, TOTAL_H - 4, 'butt');
      ctx.restore();

      ctx.save();
      ctx.translate(-ROD_W * 0.1, 0);
      ctx.strokeStyle = isHov ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.30)';
      ctx.lineWidth   = ROD_W * 0.42;
      seg(4, barY, 'butt'); seg(barY + BAR_H, TOTAL_H - 4, 'butt');
      ctx.restore();

      ctx.save();
      ctx.translate(-ROD_W * 0.28, 0);
      ctx.strokeStyle = isHov ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.65)';
      ctx.lineWidth   = ROD_W * 0.10;
      seg(4, barY, 'butt'); seg(barY + BAR_H, TOTAL_H - 4, 'butt');
      ctx.restore();

      ctx.lineCap = 'round';
    }

    // Gesture column highlight
    if (this.gestureCol >= 0 && this.gestureCol < COLS) {
      const gx = PAD_X + this.gestureCol * COL_W;
      ctx.fillStyle = p.glow;
      ctx.fillRect(gx, 0, COL_W, TOTAL_H);
      ctx.font = '600 10px JetBrains Mono, monospace';
      ctx.fillStyle = p.glowTxt;
      ctx.textAlign = 'center';
      ctx.fillText(COLS - this.gestureCol, this._colX(this.gestureCol), 13);
      ctx.textAlign = 'left';
    }

    // Beads
    for (let c = 0; c < COLS; c++) {
      const x = this._colX(c);
      const isColHov = c === this.hCol;
      const hActive = this.state.heaven[c];
      const hy      = this.animY[`${c}_h`].cur;
      this._drawBiconeBead(x, hy, BW, BH, hActive, isColHov && this.hZone === 'heaven');
      const eCount = this.state.earth[c];
      for (let b = 0; b < 4; b++) {
        const ey = this.animY[`${c}_e_${b}`].cur;
        this._drawBiconeBead(x, ey, BW, BH, b < eCount, isColHov && this.hZone === 'earth' && this.hBead === b);
      }
    }
  }

  _drawBiconeBead(cx, cy, bw, bh, active, hovered) {
    const { ctx } = this;
    const p = this.palette;
    const hw = bw / 2, hh = bh / 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy - hh);
    ctx.bezierCurveTo(cx + hw * 0.6, cy - hh * 0.3, cx + hw, cy - hh * 0.1, cx + hw, cy);
    ctx.bezierCurveTo(cx + hw, cy + hh * 0.1, cx + hw * 0.6, cy + hh * 0.3, cx, cy + hh);
    ctx.bezierCurveTo(cx - hw * 0.6, cy + hh * 0.3, cx - hw, cy + hh * 0.1, cx - hw, cy);
    ctx.bezierCurveTo(cx - hw, cy - hh * 0.1, cx - hw * 0.6, cy - hh * 0.3, cx, cy - hh);
    ctx.closePath();

    const grad = ctx.createLinearGradient(cx - hw, cy - hh, cx + hw * 0.3, cy + hh);
    if (active) {
      const stops = hovered ? p.aHov : p.aNorm;
      grad.addColorStop(0,   stops[0]);
      grad.addColorStop(0.3, stops[1]);
      grad.addColorStop(0.6, stops[2]);
      grad.addColorStop(1,   stops[3]);
    } else {
      const stops = hovered ? p.iHov : p.iNorm;
      grad.addColorStop(0,   stops[0]);
      grad.addColorStop(0.4, stops[1]);
      grad.addColorStop(1,   stops[2]);
    }
    ctx.fillStyle = grad;
    ctx.shadowColor = p.shadow;
    ctx.shadowBlur  = active ? (hovered ? 14 : 6) : 0;
    ctx.fill();
    ctx.shadowBlur  = 0;

    ctx.strokeStyle = active
      ? (hovered ? p.stAH : p.stAN)
      : p.stI;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Equator seam
    ctx.beginPath();
    ctx.moveTo(cx - hw + 1, cy); ctx.lineTo(cx + hw - 1, cy);
    ctx.strokeStyle = active ? p.eqA : p.eqI;
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // Top highlight
    const hlGrad = ctx.createRadialGradient(cx - hw * 0.2, cy - hh * 0.35, 0, cx - hw * 0.2, cy - hh * 0.35, hw * 0.85);
    hlGrad.addColorStop(0, active ? p.hlA : p.hlI);
    hlGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.moveTo(cx, cy - hh);
    ctx.bezierCurveTo(cx + hw * 0.6, cy - hh * 0.3, cx + hw, cy - hh * 0.1, cx + hw, cy);
    ctx.bezierCurveTo(cx + hw, cy - hh * 0.1, cx + hw * 0.6, cy - hh * 0.3, cx, cy - hh);
    ctx.closePath();
    ctx.fillStyle = hlGrad;
    ctx.fill();

    // Bottom shadow
    const shGrad = ctx.createRadialGradient(cx, cy + hh * 0.5, 0, cx, cy + hh * 0.5, hw * 0.8);
    shGrad.addColorStop(0, 'rgba(0,0,0,0.35)');
    shGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.bezierCurveTo(cx + hw * 0.6, cy + hh * 0.3, cx + hw,       cy + hh * 0.1, cx + hw, cy);
    ctx.bezierCurveTo(cx + hw,       cy + hh * 0.1, cx + hw * 0.6, cy + hh * 0.3, cx,      cy + hh);
    ctx.bezierCurveTo(cx - hw * 0.6, cy + hh * 0.3, cx - hw,       cy + hh * 0.1, cx - hw, cy);
    ctx.fillStyle = shGrad;
    ctx.fill();
  }

  // ── LOOP ──────────────────────────────────────────────────────────────────

  _loop(t) {
    if (t - this.lastT >= 14) {
      this.fps = Math.round(1000 / Math.max(t - this.lastT, 1));
      this.lastT = t;
      this._updateTargets();
      this._stepAnim();
      this._draw();
      this._refreshUI(this.state, this.fps);
    }
    this._rafId = requestAnimationFrame(ts => this._loop(ts));
  }

  // ── HIT TEST ──────────────────────────────────────────────────────────────

  _hit(mx, my) {
    const { PAD_X, COL_W, BW, BH, W, TOTAL_H, barY } = this.L;
    if (mx < PAD_X || mx > W - PAD_X) return null;
    const col = Math.floor((mx - PAD_X) / COL_W);
    if (col < 0 || col >= COLS) return null;
    const cx = this._colX(col);
    const hy = this.animY[`${col}_h`].cur;
    if (Math.abs(mx - cx) < BW / 2 + 3 && Math.abs(my - hy) < BH / 2 + 3)
      return { col, zone: 'heaven', bead: 0 };
    for (let b = 0; b < 4; b++) {
      const ey = this.animY[`${col}_e_${b}`].cur;
      if (Math.abs(mx - cx) < BW / 2 + 3 && Math.abs(my - ey) < BH / 2 + 3)
        return { col, zone: 'earth', bead: b };
    }
    if (my > 0 && my < TOTAL_H)
      return { col, zone: my < barY ? 'heaven' : 'earth', bead: -1 };
    return null;
  }

  // ── EVENTS ────────────────────────────────────────────────────────────────

  _bind() {
    const cv = this.canvas;

    cv.addEventListener('mousemove', e => {
      const r  = cv.getBoundingClientRect();
      const mx = (e.clientX - r.left) * (cv.width / r.width);
      const my = (e.clientY - r.top)  * (cv.height / r.height);
      const h  = this._hit(mx, my);
      this.hCol = h ? h.col : -1; this.hZone = h ? h.zone : null; this.hBead = h ? h.bead : -1;
      cv.style.cursor = (h && h.bead >= 0) ? 'pointer' : (h ? 'ns-resize' : 'default');
      h ? this._showTip(e, h) : this._hideTip();
    });

    cv.addEventListener('mouseleave', () => {
      this.hCol = -1; this.hZone = null; this.hBead = -1; this._hideTip();
    });

    cv.addEventListener('click', e => {
      const r  = cv.getBoundingClientRect();
      const mx = (e.clientX - r.left) * (cv.width / r.width);
      const my = (e.clientY - r.top)  * (cv.height / r.height);
      const h  = this._hit(mx, my);
      if (!h || h.bead < 0) return;
      this._snap();
      if (h.zone === 'heaven') {
        this._do({ type: 'TOGGLE_HEAVEN', col: h.col, label: `Cielo col ${COLS - h.col}` });
      } else {
        const cur    = this.state.earth[h.col];
        const newVal = h.bead < cur ? h.bead : h.bead + 1;
        this._do({ type: 'SET_EARTH', col: h.col, val: newVal, label: `Tierra col ${COLS - h.col}` });
      }
    });

    cv.addEventListener('wheel', e => {
      e.preventDefault();
      const r  = cv.getBoundingClientRect();
      const mx = (e.clientX - r.left) * (cv.width / r.width);
      const my = (e.clientY - r.top)  * (cv.height / r.height);
      const h  = this._hit(mx, my);
      if (!h) return;
      this._snap();
      this._do(e.deltaY < 0
        ? { type: 'INC', col: h.col, label: `+1 col ${COLS - h.col}` }
        : { type: 'DEC', col: h.col, label: `-1 col ${COLS - h.col}` });
    }, { passive: false });
  }

  // ── STATE HELPERS ─────────────────────────────────────────────────────────

  _do(action) { this.state = reduce(this.state, action); this._flashVal(); }

  _snap() {
    this.snaps.push({ heaven: [...this.state.heaven], earth: [...this.state.earth], history: [...this.state.history] });
    if (this.snaps.length > 30) this.snaps.shift();
  }

  // ── DOM UPDATES (directo para 60fps) ──────────────────────────────────────

  _flashVal() {
    const el = this.els.valNumber;
    el.classList.add('flash');
    clearTimeout(this._flashTO);
    this._flashTO = setTimeout(() => el.classList.remove('flash'), 130);
  }

  _refreshUI(state, fps) {
    this.els.valNumber.textContent = fmt(calcValue(state));
    this.els.fps.textContent = fps + ' FPS';

    const dc     = this.els.valDigits;
    const digits = calcDigits(state);
    if (dc.children.length !== COLS) {
      dc.innerHTML = '';
      digits.forEach((_, i) => {
        const span = document.createElement('span');
        span.className = 'digit-cell';
        span.id = `sr-dc${i}`;
        dc.appendChild(span);
      });
    }
    digits.forEach((d, i) => {
      const el = dc.querySelector(`#sr-dc${i}`);
      if (el) { el.textContent = d; el.classList.toggle('on', d > 0); }
    });

    const hl = this.els.histList;
    if (!state.history.length) {
      hl.innerHTML = '<div class="history-empty">— vacío —</div>';
      return;
    }
    hl.innerHTML = state.history.slice(0, 18).map(h => {
      const delta = h.delta > 0 ? `+${fmt(h.delta)}` : h.delta < 0 ? fmt(h.delta) : '±0';
      const color = h.delta > 0 ? '#2ecc71' : h.delta < 0 ? '#e74c3c' : '#555';
      return `<div class="history-item">
        <span class="h-val">${fmt(h.val)}</span>
        <span class="h-delta" style="color:${color}">${delta}</span>
        <span class="h-action">${h.label}</span>
      </div>`;
    }).join('');
  }

  _showTip(e, h) {
    const col      = COLS - h.col;
    const place    = Math.pow(10, h.col === COLS - 1 ? 0 : COLS - 1 - h.col);
    const placeStr = place >= 1e12 ? '1T' : place >= 1e9 ? (place / 1e9) + 'B'
                   : place >= 1e6  ? (place / 1e6)  + 'M'
                   : place >= 1e3  ? (place / 1e3)  + 'K' : place;
    let txt = '';
    if (h.zone === 'heaven') {
      txt = `Cielo · Col ${col} (×${placeStr}) · ${this.state.heaven[h.col] ? 'Activa = 5' : 'Inactiva = 0'}`;
    } else if (h.bead >= 0) {
      txt = `Tierra ${h.bead + 1} · Col ${col} · ${h.bead < this.state.earth[h.col] ? 'Activa' : 'Inactiva'}`;
    } else {
      txt = `Col ${col} · Scroll para cambiar`;
    }
    const tip = this.els.tip;
    tip.textContent = txt;
    tip.style.left = (e.clientX + 14) + 'px';
    tip.style.top  = (e.clientY - 32) + 'px';
    tip.classList.add('show');
  }

  _hideTip() { this.els.tip.classList.remove('show'); }

  // ── API PÚBLICA ───────────────────────────────────────────────────────────

  resetAll()    { this._snap(); this._do({ type: 'RESET', label: 'Reset' }); }
  randomize()   { this._snap(); this._do({ type: 'SET_VAL', val: Math.floor(Math.random() * 9999999), label: 'Aleatorio' }); }
  undo()        { if (!this.snaps.length) return; this.state = this.snaps.pop(); this._flashVal(); }
  enterNumber() {
    const v = prompt('Ingresa un número (0 – 9,999,999,999,999):');
    if (v === null) return;
    const n = parseInt(v.replace(/\D/g, ''));
    if (isNaN(n)) return;
    this._snap();
    this._do({ type: 'SET_VAL', val: n, label: `Ingresado: ${n}` });
  }
}

// ── COMPONENTE REACT ─────────────────────────────────────────────────────────

const ACCENT_LABELS = { orange: 'Naranja', blue: 'Azul', green: 'Verde', purple: 'Morado' };

export function Soroboan({ onEngineReady, theme = 'dark', accent = 'orange', onThemeToggle, onAccentChange }) {
  const canvasRef    = useRef(null);
  const valNumberRef = useRef(null);
  const fpsRef       = useRef(null);
  const valDigitsRef = useRef(null);
  const histListRef  = useRef(null);
  const tipRef       = useRef(null);
  const srRef        = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const sr = new SorobanEngine(
      canvasRef.current,
      {
        valNumber: valNumberRef.current,
        fps:       fpsRef.current,
        valDigits: valDigitsRef.current,
        histList:  histListRef.current,
        tip:       tipRef.current,
      },
      { theme, palette: PALETTES[accent] }
    );
    srRef.current = sr;
    onEngineReady?.(sr);

    const onKey = e => {
      if (e.key === 'r' || e.key === 'R') sr.resetAll();
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); sr.undo(); }
      if (e.key === 'n' || e.key === 'N') sr.randomize();
    };
    window.addEventListener('keydown', onKey);

    let t2;
    const t1 = setTimeout(() => {
      sr._do({ type: 'SET_VAL', val: 7654321, label: 'Demo' });
      t2 = setTimeout(() => {
        sr._do({ type: 'RESET', label: 'Reset inicial' });
        sr.state.history = [];
      }, 1600);
    }, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('keydown', onKey);
      sr.destroy();
    };
  }, []);

  // Sincronizar tema y paleta cuando cambian las props
  useEffect(() => {
    srRef.current?.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    srRef.current?.setPalette(PALETTES[accent] || PALETTES.orange);
  }, [accent]);

  return (
    <div className="soroboan-root" data-theme={theme} data-accent={accent}>

      <div className="topbar">
        <div className="logo">
          <span className="logo-kanji">算盤</span>
          <span className="logo-sub">Soroban Virtual</span>
        </div>

        <div className="theme-controls">
          <button
            className="theme-toggle"
            onClick={onThemeToggle}
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? '☀' : '☽'}
          </button>
          <div className="accent-dots">
            {Object.keys(PALETTES).map(key => (
              <button
                key={key}
                className={`accent-dot accent-dot--${key}${accent === key ? ' active' : ''}`}
                onClick={() => onAccentChange?.(key)}
                title={ACCENT_LABELS[key]}
              />
            ))}
          </div>
        </div>

        <span className="badge">Fase 3 · Gesture Control</span>
      </div>

      <div className="layout">

        <div className="value-strip">
          <span className="val-label">Valor</span>
          <div className="val-number" ref={valNumberRef}>0</div>
          <div className="val-digits" ref={valDigitsRef}></div>
        </div>

        <div className="soroban-outer">
          <div className="bolt tl" /><div className="bolt tr" />
          <div className="bolt bl" /><div className="bolt br" />
          <div className="soroban-inner">
            <canvas ref={canvasRef} />
          </div>
        </div>

        <div className="controls-row">
          <button className="sr-btn danger"  onClick={() => srRef.current?.resetAll()}>⟳ Reset</button>
          <button className="sr-btn"         onClick={() => srRef.current?.undo()}>↩ Deshacer</button>
          <button className="sr-btn"         onClick={() => srRef.current?.randomize()}>⚄ Aleatorio</button>
          <button className="sr-btn"         onClick={() => srRef.current?.enterNumber()}>✎ Ingresar</button>
        </div>

        <div className="info-row">
          <div className="info-box">
            <div className="info-title">Historial</div>
            <div className="history-list" ref={histListRef}>
              <div className="history-empty">— vacío —</div>
            </div>
          </div>
          <div className="info-box">
            <div className="info-title">Leyenda · Cómo leer el soroban</div>
            <div className="legend-body">
              <span style={{ color: 'var(--orange)' }}>Cielo activa</span> = baja hacia la barra = vale <span style={{ color: 'var(--orange)' }}>5</span><br />
              <span style={{ color: 'var(--orange)' }}>Tierra activa</span> = sube hacia la barra = vale <span style={{ color: 'var(--orange)' }}>1</span> c/u<br />
              <span style={{ color: '#333' }}>Dígito</span> = cielo + tierra = 0 a 9<br /><br />
              <span style={{ color: '#333' }}>🖱 Click</span> en cuenta → moverla<br />
              <span style={{ color: '#333' }}>🖱 Scroll</span> sobre columna → +/−1<br />
              <span style={{ color: '#333' }}>⌨ R</span> reset · <span style={{ color: '#333' }}>Ctrl+Z</span> undo
            </div>
          </div>
        </div>

      </div>

      <footer className="soroban-footer">
        <span>SOROBAN VIRTUAL · FASE 1 v2 · FIEL AL ÁBACO FÍSICO</span>
        <span ref={fpsRef}>— FPS</span>
      </footer>

      <div className="sr-tooltip" ref={tipRef} />

    </div>
  );
}
