import { useId } from 'react';

/**
 * Le نشاط 1 en image — le manuel montre deux PHOTOS (un ballon de handball, une boule de pétanque « الكرة الحديدية ») ; la
 * plateforme les DESSINE coupées en deux pour que l'idée se VOIE : le ballon est une coque mince (creux : la كرة, une surface),
 * la boule est pleine jusqu'au centre (la جلّة, un solide). Le rayon r est le même pour les deux : seul l'intérieur change.
 * `decorative` : la vignette de la carte (aria-hidden) ; sinon une figure avec son aria-label arabe.
 */
export default function BallsCutaway({ decorative = false, labels = true, className = '' }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const a11y = decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': 'كرة يد مقطوعة نصفين: قشرة رقيقة وفراغ في الداخل (كرة)، وكرية حديدية مقطوعة نصفين: مملوءة حتى المركز (جلة)، ولهما نفس نصف القطر r' };
  const t = { style: { direction: 'ltr', unicodeBidi: 'isolate' } };
  return (
    <svg viewBox="0 0 320 170" className={`h-auto w-full ${className}`} {...a11y} data-balls-cutaway>
      <defs>
        <radialGradient id={`bcHand${uid}`} cx="35%" cy="30%" r="80%"><stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor="#f59e0b" /></radialGradient>
        <radialGradient id={`bcIron${uid}`} cx="35%" cy="30%" r="80%"><stop offset="0" stopColor="#e2e8f0" /><stop offset="0.6" stopColor="#94a3b8" /><stop offset="1" stopColor="#475569" /></radialGradient>
        <linearGradient id={`bcCut${uid}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#64748b" /><stop offset="1" stopColor="#334155" /></linearGradient>
      </defs>
      {/* le ballon de handball : la moitié arrière, puis la coupe (une couronne mince : creux) */}
      <g transform="translate(82 82)">
        <path d="M-58 0 A58 58 0 0 1 58 0 Z" fill={`url(#bcHand${uid})`} />
        <path d="M-40 -42 Q0 -20 40 -42 M-56 -14 Q0 8 56 -14" fill="none" stroke="#1d4ed8" strokeWidth="3" opacity="0.7" />
        <ellipse cx="0" cy="0" rx="58" ry="16" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
        <ellipse cx="0" cy="0" rx="52" ry="13.5" fill="#1e293b" />
        <circle cx="0" cy="0" r="2.5" fill="#f8fafc" />
        <line x1="0" y1="0" x2="52" y2="0" stroke="#f8fafc" strokeWidth="1.2" strokeDasharray="3 2" />
        {labels && <text x="26" y="-3" fontSize="11" fontWeight="700" fill="#f8fafc" textAnchor="middle" {...t}>r</text>}
        {labels && <text x="-6" y="3" fontSize="10" fontWeight="700" fill="#f8fafc" textAnchor="end" {...t}>O</text>}
        <path d="M-58 0 A58 30 0 0 0 58 0" fill="none" stroke="#b45309" strokeWidth="1" opacity="0.5" />
      </g>
      {/* la boule de pétanque : la coupe est PLEINE (un disque de fonte) */}
      <g transform="translate(238 82)">
        <path d="M-58 0 A58 58 0 0 1 58 0 Z" fill={`url(#bcIron${uid})`} />
        <path d="M-48 -30 Q0 -12 48 -30 M-56 -10 Q0 6 56 -10" fill="none" stroke="#334155" strokeWidth="1.6" opacity="0.6" />
        <ellipse cx="0" cy="0" rx="58" ry="16" fill={`url(#bcCut${uid})`} stroke="#1e293b" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="2.5" fill="#f8fafc" />
        <line x1="0" y1="0" x2="58" y2="0" stroke="#f8fafc" strokeWidth="1.2" strokeDasharray="3 2" />
        {labels && <text x="29" y="-3" fontSize="11" fontWeight="700" fill="#f8fafc" textAnchor="middle" {...t}>r</text>}
        {labels && <text x="-6" y="3" fontSize="10" fontWeight="700" fill="#f8fafc" textAnchor="end" {...t}>O</text>}
      </g>
      {labels && (
        <g fontSize="13" fontWeight="800" textAnchor="middle" direction="rtl">
          <text x="82" y="122" fill="#b45309">كرة اليد: جوفاء</text>
          <text x="82" y="140" fill="#475569" fontSize="11" fontWeight="600">نموذج للكرة</text>
          <text x="238" y="122" fill="#334155">الكرية الحديدية: مملوءة</text>
          <text x="238" y="140" fill="#475569" fontSize="11" fontWeight="600">نموذج للجلة</text>
        </g>
      )}
    </svg>
  );
}
