import './turnPhone.css';

/**
 * « أدِر هاتفك »: a page that needs the WIDTH of the screen (the game world of a lesson, the teacher's lesson file) shows
 * this while a phone is held upright; turning the phone removes it. The page stays mounted behind — nothing is lost.
 *   cover  true: the whole screen (the game) · false: the place of the page, under what is above it (the lesson file).
 */
export default function TurnPhone({ title, body, cover = true, ...rest }) {
  return (
    <div className={`sa-turn ${cover ? 'sa-turn--cover' : ''}`} role="alert" dir="rtl" {...rest}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <rect
          x="42"
          y="18"
          width="36"
          height="64"
          rx="7"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          opacity=".35"
        />
        <rect x="28" y="62" width="64" height="36" rx="7" fill="none" stroke="currentColor" strokeWidth="4" />
        <path d="M88 30 a26 26 0 0 1 14 24" fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
        <path d="M102 54 l-7 -5 M102 54 l4 -8" fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}
