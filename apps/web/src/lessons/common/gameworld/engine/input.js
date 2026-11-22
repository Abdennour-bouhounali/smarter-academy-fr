/**
 * Game input: keyboard (arrows / ZQSD / WASD, Space, E / Enter) and touch (a virtual stick and buttons driven by the HUD).
 * `axis()` is the move vector; `take(name)` reads then clears a one-shot press ('jump', 'act', 'left', 'right').
 */
const MOVE = {
  ArrowUp: [0, 1],
  KeyW: [0, 1],
  KeyZ: [0, 1],
  ArrowDown: [0, -1],
  KeyS: [0, -1],
  ArrowLeft: [-1, 0],
  KeyA: [-1, 0],
  KeyQ: [-1, 0],
  ArrowRight: [1, 0],
  KeyD: [1, 0],
};

export class GameInput {
  constructor() {
    this.down = new Set();
    this.pressed = new Set();
    this.stick = { x: 0, y: 0 };
    this.enabled = true;
    this.onDown = (e) => {
      if (!this.enabled) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (tag === 'BUTTON' && e.code !== 'KeyE')) {
        if (tag !== 'BUTTON') return;
      }
      if (MOVE[e.code] || e.code === 'Space' || e.code === 'KeyE' || e.code === 'Enter') {
        if (tag === 'BUTTON' && (e.code === 'Space' || e.code === 'Enter')) return;
        e.preventDefault();
      }
      if (e.repeat) return;
      this.down.add(e.code);
      if (e.code === 'Space') this.pressed.add('jump');
      if (e.code === 'KeyE' || e.code === 'Enter') this.pressed.add('act');
      if (MOVE[e.code]?.[0] === -1) this.pressed.add('left');
      if (MOVE[e.code]?.[0] === 1) this.pressed.add('right');
    };
    this.onUp = (e) => this.down.delete(e.code);
    this.onBlur = () => this.down.clear();
    window.addEventListener('keydown', this.onDown);
    window.addEventListener('keyup', this.onUp);
    window.addEventListener('blur', this.onBlur);
  }

  axis() {
    let x = this.stick.x;
    let y = this.stick.y;
    for (const code of this.down) {
      const m = MOVE[code];
      if (m) {
        x += m[0];
        y += m[1];
      }
    }
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    return { x, y };
  }

  setStick(x, y) {
    this.stick.x = x;
    this.stick.y = y;
  }
  press(name) {
    this.pressed.add(name);
  }
  take(name) {
    const had = this.pressed.has(name);
    this.pressed.delete(name);
    return had;
  }
  clear() {
    this.pressed.clear();
    this.down.clear();
    this.stick.x = 0;
    this.stick.y = 0;
  }

  dispose() {
    window.removeEventListener('keydown', this.onDown);
    window.removeEventListener('keyup', this.onUp);
    window.removeEventListener('blur', this.onBlur);
  }
}
