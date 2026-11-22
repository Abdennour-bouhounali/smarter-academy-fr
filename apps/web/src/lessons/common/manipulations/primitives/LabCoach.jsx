import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Hand, MousePointerClick, Lightbulb, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { placeBubble, readLearned, writeLearned, readOff, writeOff } from './labCoach';
import { useInMissionPlayer } from '../../mission/missionPlayerContext';

/**
 * LabCoach — l'ONBOARDING d'un labo (2026-10-14, PROTOTYPE sur `rank-exchange`, activé par la prop `coach`).
 *
 * L'élève ne devrait jamais se demander « comment ça marche ? » ni « que dois-je faire ? ». Le guide montre, À CHAQUE
 * INSTANT, le bouton ou le geste dont la main a besoin : un anneau qui pulse autour de l'élément et une petite bulle d'UNE
 * phrase juste dessous (ou dessus), jamais sur lui. Il montre le geste, jamais la règle (« discover, don't be told »).
 *
 *  - CONTEXTUEL : l'étape vient du labo (`step = { id, target, gesture }`, calculée par une fonction pure — pour
 *    `rank-exchange` : `logic/rankExchange.js › coachOf`) ; `target` est un sélecteur du contrat DOM du labo.
 *  - DISCRET : une étape déjà réussie (ou « فهمت ») n'est plus montrée ; l'élève qui revient ne revoit rien.
 *  - MASQUABLE : « فهمت » (cette astuce), « إيقاف الإرشاد » (tout, mémorisé), Échap ; un interrupteur toujours visible
 *    (« إخفاء الإرشاد » / « أرِني ماذا أفعل ») le remet. Mémoire : `localStorage` sous try/catch (`labCoach.js`).
 *  - TOUJOURS VUE : sur un téléphone le labo est plus haut que l'écran ; si l'élément montré est hors écran, la bulle se colle
 *    au bord visible le plus proche (`placeBubble({ view })`, `data-edge`), sa flèche pointe vers lui, et elle suit le défilement.
 *  - SANS GÊNE : l'anneau et le cadre ne captent aucun pointeur (le doigt traverse), la bulle ne couvre jamais l'élément,
 *    aucune capture de focus, `prefers-reduced-motion` coupe la pulsation.
 *
 * Usage : `const coach = useLabCoach({ lab: 'rank-exchange', step, text, labels })` puis rendre `coach.toggle` (dans le
 * flux, sous la consigne) et `coach.overlay` (dans un conteneur POSITIONNÉ qui enveloppe la scène).
 *
 * Contrat DOM : [data-lab-coach-toggle][data-state=on|off], [data-lab-coach][data-step=<id>], [data-lab-coach-ring][data-lab-coach-target=<sélecteur>],
 * [data-lab-coach-ok], [data-lab-coach-stop].
 *
 * LECTEUR DE MISSION (propriétaire, 2026-11-09) : dans le lecteur, le guide prend le dessin du lecteur — une bulle plus large, texte plus grand
 * et plus gras, bouton « فهمت » épais (ombre portée, comme les cartes de prédiction), icône ambre — et son interrupteur est une pastille
 * « 💡 المرشد » bien visible à côté de la ligne du but (`toggleIcon`), dans TOUS les labos des leçons converties. Hors lecteur : inchangé.
 *
 * @param {{lab:string, step:null|{id:string,target:string,gesture?:string,prefer?:'above'|'below',noFlip?:boolean}, text:string, labels:{hide:string,show:string,ok:string,stop:string}}} p
 */
export function useLabCoach({ lab, step, text, labels }) {
  const { t } = useTranslation('lesson');
  const [enabled, setEnabled] = useState(() => !readOff(lab));
  const [learned, setLearned] = useState(() => readLearned(lab));
  const prev = useRef(null);
  const learn = useCallback((id) => {
    setLearned((l) => {
      if (l.includes(id)) return l;
      const next = [...l, id];
      writeLearned(lab, next);
      return next;
    });
  }, [lab]);

  // Quand l'étape change, l'élève a fait (ou dépassé) la précédente : elle est apprise.
  const id = step?.id ?? null;
  useEffect(() => {
    if (prev.current && prev.current !== id) learn(prev.current);
    prev.current = id;
  }, [id, learn]);

  const visible = Boolean(enabled && step && text && !learned.includes(step.id));
  const stop = useCallback(() => { setEnabled(false); writeOff(lab, true); }, [lab]);
  const resume = useCallback(() => {
    writeOff(lab, false);
    setEnabled(true);
    if (step) setLearned((l) => { const next = l.filter((x) => x !== step.id); writeLearned(lab, next); return next; });
  }, [lab, step]);

  const toggle = (
    <button type="button" onClick={visible ? stop : resume} data-lab-coach-toggle data-state={visible ? 'on' : 'off'}
      aria-pressed={visible}
      className="inline-flex min-h-[40px] items-center gap-1.5 self-start rounded-full border border-indigo-200 bg-white/80 px-3 text-xs font-extrabold text-indigo-800 shadow-sm transition-colors hover:bg-indigo-50 outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 motion-reduce:transition-none">
      <Lightbulb className={`h-4 w-4 ${visible ? 'text-amber-500' : 'text-indigo-500'}`} aria-hidden="true" />
      {visible ? labels.hide : labels.show}
    </button>
  );
  // la version du LECTEUR (à côté de la ligne du but) : une pastille « 💡 المرشد » bien visible, allumée quand le guide parle (2026-11-09 ;
  // avant : un « ؟ » rond que les élèves ne voyaient pas)
  const toggleIcon = (
    <button type="button" onClick={visible ? stop : resume} data-lab-coach-toggle data-state={visible ? 'on' : 'off'}
      aria-pressed={visible} aria-label={visible ? labels.hide : labels.show} title={visible ? labels.hide : labels.show}
      className={`inline-flex min-h-[48px] shrink-0 items-center gap-1.5 rounded-2xl border-2 px-3 text-base font-black outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 active:translate-y-0.5 ${visible ? 'border-amber-400 bg-amber-100 text-amber-900 shadow-[0_3px_0_0_#FBBF24]' : 'border-indigo-200 bg-white text-indigo-800 shadow-[0_3px_0_0_#C7D2FE] hover:bg-indigo-50'}`}>
      <Lightbulb className={`h-5 w-5 ${visible ? 'text-amber-500' : 'text-indigo-500'}`} aria-hidden="true" />
      {t('manipulation.coachGuide')}
    </button>
  );
  const overlay = <CoachOverlay visible={visible} step={step} text={text} labels={labels} onOk={() => step && learn(step.id)} onStop={stop} />;
  return { toggle, toggleIcon, overlay, visible };
}

const BUBBLE_W = 272;
/** Dans le lecteur de mission, la bulle est plus large : texte plus grand, gros bouton. */
const BUBBLE_W_GAME = 336;
/** Ce que l'écran cache en haut (en-tête) et en bas (barre de navigation mobile) : la bulle reste entre les deux. */
const VIEW_TOP = 64;
const VIEW_BOTTOM = 76;
/** Sous `lg`, la colonne flottante de la leçon (كرّاسي / بطاقتي) monte au-dessus de la barre : la bulle collée au bord la laisse libre. */
const VIEW_BOTTOM_NARROW = 212;

function CoachOverlay({ visible, step, text, labels, onOk, onStop }) {
  const game = useInMissionPlayer();
  const wrapRef = useRef(null);
  const bubbleRef = useRef(null);
  const [geo, setGeo] = useState(null);

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap || !visible || !step) { setGeo((g) => (g === null ? g : null)); return; }
    const host = wrap.parentElement;
    const el = host?.querySelector(step.target);
    if (!el) { setGeo((g) => (g === null ? g : null)); return; }
    const w = wrap.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) { setGeo((g) => (g === null ? g : null)); return; }
    // L'ÉCHELLE de la couche (2026-11-09) : le lecteur de mission ajuste son contenu par `zoom` CSS (FitToArea — agrandi sur un grand écran,
    // réduit sur un petit) ; getBoundingClientRect donne des pixels d'ÉCRAN, alors que left / top / width de l'anneau et de la bulle sont
    // des pixels de la couche, eux-mêmes zoomés. Sans cette division, l'anneau était agrandi et décalé (zoomé deux fois).
    const scale = wrap.offsetWidth > 0 ? w.width / wrap.offsetWidth : 1;
    const z = Number.isFinite(scale) && scale > 0 ? scale : 1;
    const box = { w: w.width / z, h: w.height / z };
    const target = { x: (r.left - w.left) / z, y: (r.top - w.top) / z, w: r.width / z, h: r.height / z };
    const bw = Math.min(game ? BUBBLE_W_GAME : BUBBLE_W, Math.max(200, box.w - 12));
    const bh = bubbleRef.current?.offsetHeight || 104;
    const bandTop = VIEW_TOP;
    const bandBottom = window.innerHeight - (window.innerWidth < 1024 ? VIEW_BOTTOM_NARROW : VIEW_BOTTOM);
    // un labo ENTIÈREMENT hors écran (il y en a plusieurs dans une page) ne colle pas de bulle au bord de l'écran : il n'est pas regardé
    const onScreen = w.bottom > bandTop && w.top < bandBottom;
    const view = onScreen ? { top: (bandTop - w.top) / z, bottom: (bandBottom - w.top) / z } : null;
    const place = placeBubble({ target, box, bubble: { w: bw, h: bh }, view, prefer: step.prefer, noFlip: step.noFlip });
    const next = { target, bw, ...place };
    setGeo((g) => (g && Object.keys(next).every((k) => JSON.stringify(g[k]) === JSON.stringify(next[k])) ? g : next));
  }, [visible, step, game]);

  // mesure à chaque rendu (le tableau bouge quand un nombre change), puis après les animations d'entrée
  useLayoutEffect(() => { measure(); });
  useEffect(() => {
    if (!visible) return undefined;
    const t = setTimeout(measure, 380);
    const onResize = () => measure();
    // défiler déplace la bande visible : la bulle collée au bord suit l'écran (une mesure par image)
    let raf = 0;
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; measure(); }); };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    const ro = typeof ResizeObserver !== 'undefined' && wrapRef.current ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(wrapRef.current);
    return () => { clearTimeout(t); if (raf) cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); window.removeEventListener('scroll', onScroll, true); ro?.disconnect(); };
  }, [visible, step?.id, measure]);

  const Icon = step?.gesture === 'tap' ? MousePointerClick : Hand;
  const t = geo?.target;
  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 z-30" data-lab-coach-layer aria-live="polite">
      {visible && geo && (
        <>
          <span data-lab-coach-ring data-lab-coach-target={step.target} aria-hidden="true"
            className={`absolute rounded-2xl border-[3px] motion-safe:animate-pulse ${game ? 'border-amber-400 bg-amber-300/10 shadow-[0_0_0_7px_rgba(251,191,36,0.25)]' : 'border-indigo-500 bg-indigo-400/10 shadow-[0_0_0_6px_rgba(99,102,241,0.18)]'}`}
            style={{ left: t.x - 5, top: t.y - 5, width: t.w + 10, height: t.h + 10 }} />
          <div ref={bubbleRef} role="status" data-lab-coach data-step={step.id} data-edge={geo.edge ? 'true' : undefined} data-coach-look={game ? 'game' : 'page'} dir="rtl"
            onKeyDown={(e) => { if (e.key === 'Escape') onStop(); }}
            className={game
              ? 'pointer-events-auto absolute rounded-[1.5rem] border-[3px] border-indigo-500 bg-white p-4 shadow-[0_20px_40px_-14px_rgba(49,46,129,0.6)] ring-4 ring-indigo-100'
              : 'pointer-events-auto absolute rounded-2xl border-2 border-indigo-500 bg-white p-2.5 shadow-[0_16px_34px_-12px_rgba(49,46,129,0.55)]'}
            style={{ left: geo.left, top: geo.top, width: geo.bw }}>
            <span aria-hidden="true" className={`absolute rotate-45 border-indigo-500 bg-white ${game ? 'h-4 w-4' : 'h-3 w-3'}`}
              style={{ left: geo.arrow - (game ? 8 : 6), ...(geo.side === 'below'
                ? { top: game ? -10 : -7, borderTopWidth: game ? 3 : 2, borderLeftWidth: game ? 3 : 2 }
                : { bottom: game ? -10 : -7, borderBottomWidth: game ? 3 : 2, borderRightWidth: game ? 3 : 2 }) }} />
            <div className={`flex items-start ${game ? 'gap-3' : 'gap-2'}`}>
              <span aria-hidden="true" className={`mt-0.5 flex shrink-0 items-center justify-center rounded-full ${game ? 'h-11 w-11 bg-amber-400 text-amber-950 shadow-[0_3px_0_0_#D97706]' : 'h-8 w-8 bg-indigo-600 text-white'}`}>
                <Icon className={game ? 'h-5 w-5' : 'h-4 w-4'} strokeWidth={2.6} />
              </span>
              <p className={`min-w-0 flex-1 leading-snug text-indigo-950 ${game ? 'text-lg font-black' : 'text-[15px] font-extrabold'}`}>{text}</p>
            </div>
            <div className={`flex items-center justify-between gap-2 ${game ? 'mt-3' : 'mt-2'}`}>
              <button type="button" onClick={onOk} data-lab-coach-ok
                className={game
                  ? 'inline-flex min-h-[48px] items-center gap-1.5 rounded-2xl bg-indigo-600 px-5 text-base font-black text-white shadow-[0_4px_0_0_#3730A3] outline-none hover:bg-indigo-700 focus-visible:ring-4 focus-visible:ring-indigo-300 active:translate-y-0.5'
                  : 'inline-flex min-h-[40px] items-center gap-1 rounded-full bg-indigo-600 px-3.5 text-sm font-black text-white outline-none hover:bg-indigo-700 focus-visible:ring-4 focus-visible:ring-indigo-300'}>
                <Check className={game ? 'h-5 w-5' : 'h-4 w-4'} strokeWidth={3} aria-hidden="true" /> {labels.ok}
              </button>
              <button type="button" onClick={onStop} data-lab-coach-stop
                className={`inline-flex min-h-[40px] items-center gap-1 rounded-full px-2.5 font-bold text-slate-500 outline-none hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-4 focus-visible:ring-indigo-300 ${game ? 'text-sm' : 'text-xs'}`}>
                <X className="h-3.5 w-3.5" aria-hidden="true" /> {labels.stop}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
