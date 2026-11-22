/**
 * The small pieces every screen of a game world shares: a formula, the toast, the robot's bubble, the touch stick, a
 * card over the world, three stars, a box for a number. They name no lesson and no world.
 */
import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { Star, X, Volume2, VolumeX } from 'lucide-react';
import { scopedStorage as storage } from '../../../../utils/storage';
import MathText from '../../components/MathText';
import { KT } from './text';
import Fit, { cardRoom } from './Fit';

export const M = ({ children }) => (
  <span dir="ltr" className="di-math">
    <MathText>{`$${children}$`}</MathText>
  </span>
);

export function Toast({ toast }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setOn(false), 3200);
    return () => clearTimeout(t);
  }, []);
  return on ? (
    <div className={`di-toast di-toast--${toast.tone}`}>
      {toast.tone === 'good' ? '★ ' : ''}
      {toast.text}
    </div>
  ) : null;
}

export function Say({ say }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setOn(false), say.hold * 1000);
    return () => clearTimeout(t);
  }, [say.hold]);
  if (!on) return null;
  return (
    <div className="di-say" role="status">
      <span className="di-say__face" aria-hidden="true">
        <i />
        <i />
      </span>
      <p>
        <MathText>{say.text}</MathText>
      </p>
    </div>
  );
}

export function Stick({ game }) {
  const base = useRef(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const move = (e) => {
    const r = base.current.getBoundingClientRect();
    let x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    let y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const l = Math.hypot(x, y);
    if (l > 1) {
      x /= l;
      y /= l;
    }
    setKnob({ x, y });
    game.input.setStick(x, -y);
  };
  const end = () => {
    setKnob({ x: 0, y: 0 });
    game.input.setStick(0, 0);
  };
  useEffect(() => () => game.input.setStick(0, 0), [game]);
  return (
    <div
      className="di-stick"
      ref={base}
      dir="ltr"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => {
        if (e.buttons || e.pointerType === 'touch') move(e);
      }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <span style={{ transform: `translate(${knob.x * 34}px, ${knob.y * 34}px)` }} />
    </div>
  );
}

/** Where « leave the game » goes: given by the shell, so that a dialog can draw the same ✕ as the top bar. */
export const ExitTo = createContext(null);

/** The ✕ that leaves the game, for every screen that covers the top bar: a dialog, the rule forge. */
export function ExitLink({ className = '' }) {
  const exit = useContext(ExitTo);
  if (!exit) return null;
  return (
    <Link to={exit.to} className={`di-icon ${className}`} aria-label={exit.label} title={exit.label} data-di-exit>
      <X size={20} />
    </Link>
  );
}

/**
 * The sound of the world, on or off: ONE button, in the top bar and in every screen that covers it (the rule forge).
 * The choice is kept for the next visit.
 */
export function SoundToggle({ game }) {
  const on = useSyncExternalStore(game.subscribe, () => game.getState().sound);
  const toggle = () => {
    game.setSound(!on);
    try {
      storage.setItem('smarter_world_sound', on ? '0' : '1');
    } catch {
      /* noop */
    }
  };
  return (
    <button
      type="button"
      className="di-icon"
      onClick={toggle}
      aria-label={KT.hud.sound}
      aria-pressed={on}
      title={KT.hud.sound}
      data-di-sound={on ? 'on' : 'off'}
    >
      {on ? <Volume2 size={19} /> : <VolumeX size={19} />}
    </button>
  );
}

/**
 * A dialog of the world. THE STUDENT CAN ALWAYS LEAVE (owner, 2026-11-17): the veil of a dialog covers the top bar and
 * its ✕, so the dialog draws that ✕ again, at the same place, over the veil.
 */
export function Card({ children, tone = '', wide = false }) {
  return (
    <div className="di-veil">
      <ExitLink className="di-veil__exit" />
      <div className={`di-card ${tone} ${wide ? 'di-card--wide' : ''}`} role="dialog" aria-modal="true">
        {/* the 12 px floor holds while a too-tall card shrinks to fit (GAME_WORLD.md « 12 px floor ») */}
        <Fit avail={cardRoom} floor={12}>
          {children}
        </Fit>
      </div>
    </div>
  );
}

export const Stars = ({ n, size = 16 }) => (
  <span className="di-stars3" dir="ltr">
    {[1, 2, 3].map((i) => (
      <Star key={i} size={size} className={i <= n ? 'is-on' : ''} />
    ))}
  </span>
);

export function Num({ value, onChange, w = 3, ...rest }) {
  return (
    <input
      className="di-num"
      dir="ltr"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      style={{ width: `${w + 1.2}ch` }}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, '').slice(0, w + 2))}
      {...rest}
    />
  );
}
