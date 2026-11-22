import { forwardRef, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import MathText from '../../components/MathText';
import { kindStyle } from './nodeKinds';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Une NOTATION ne se tronque pas : « 11 × 13 + 0 » sans « 143 = » serait une
 * égalité fausse. Si elle déborde du couloir (mobile étroit), on la réduit
 * juste assez pour qu'elle tienne, ancrée au bord de début de lecture.
 * Un sous-titre en arabe, lui, peut s'arrêter sur « … » : c'est du texte.
 */
function FittedMath({ children, width }) {
  const outer = useRef(null);
  const inner = useRef(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const o = outer.current; const i = inner.current;
    if (!o || !i) return;
    const natural = i.scrollWidth;
    setScale(natural > o.clientWidth ? Math.max(0.7, o.clientWidth / natural) : 1);
  }, [children, width]);
  return (
    <span ref={outer} className="block overflow-hidden" data-kg-math-scale={scale.toFixed(2)}>
      <span
        ref={inner}
        className="inline-block whitespace-nowrap ltr:origin-left rtl:origin-right"
        style={scale < 1 ? { transform: `scale(${scale})` } : undefined}
      >
        <MathText>{children}</MathText>
      </span>
    </span>
  );
}

/**
 * Un nœud de la carte : un OBJET de connaissance (type, titre, notation),
 * pas un bouton générique. Quatre états visibles :
 *
 *   available   blanc, bordure de sa couleur, halo lent + « اكتشف » ;
 *   discovered  teinté, coche discrète ;
 *   locked      fantôme en pointillés — ni titre ni contenu (aucune fuite
 *               d'une connaissance que l'élève n'a pas encore rencontrée) ;
 *   selected    anneau + léger agrandissement (s'ajoute aux trois autres).
 *
 * `delay` : le temps que met l'arête à se dessiner avant que le nœud entre
 * (clic → parent → relation → enfant). Nul en mouvement réduit.
 */
const GraphNode = forwardRef(function GraphNode(
  { node, box, state, selected, dimmed, isRoot, isStart, isNext = false, isNew, lockedModule, delay, scrollMarginBottom = 16, reduce, onActivate, onKeyNav },
  ref,
) {
  const { t } = useTranslation('lesson');
  const style = kindStyle(node.kind);
  const locked = state === 'locked';
  const kindLabel = t(`map.progressive.kinds.${node.kind}`);
  const stateLabel = t(`map.progressive.states.${state}`);
  const title = locked ? t('map.progressive.lockedTitle') : node.title;
  const { Icon } = style;
  const guide = style.family === 'guide';

  return (
    <motion.button
      ref={ref}
      type="button"
      data-kg-node={node.id}
      data-kg-state={state}
      data-kg-kind={node.kind}
      data-kg-selected={selected ? 'true' : undefined}
      aria-pressed={selected}
      aria-label={t('map.progressive.nodeAria', { kind: kindLabel, title, state: stateLabel })}
      onClick={() => onActivate(node.id)}
      onKeyDown={(e) => onKeyNav(e, node.id)}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: -10 }}
      animate={{ opacity: dimmed ? 0.45 : 1, scale: selected && !reduce ? 1.03 : 1, y: 0 }}
      exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
      transition={reduce ? { duration: 0 } : { delay, duration: 0.36, ease: EASE }}
      style={{ position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, scrollMarginTop: 64, scrollMarginBottom }}
      data-kg-family={style.family}
      className={[
        'group rounded-2xl px-3 py-1.5 text-start flex flex-col justify-center',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-slate-400',
        'transition-[box-shadow,background-color] duration-200',
        locked
          ? 'border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 cursor-help'
          // GUIDE : un accompagnement, pas une connaissance — fond teinté,
          // trait fin, filet de début épais. Le cœur mathématique garde le
          // trait plein et le fond blanc : c'est lui qui domine la carte.
          : guide
            ? `border border-s-4 ${style.border} ${style.tint} hover:shadow-md`
            : state === 'discovered'
              ? `border-2 ${style.border} ${style.tint} hover:shadow-md`
              : `border-2 ${style.border} bg-white shadow-sm hover:shadow-md`,
        selected ? `ring-2 ring-offset-2 ${locked ? 'ring-slate-300' : style.ring} shadow-lg` : '',
      ].join(' ')}
    >
      {/* LE PROCHAIN PAS — un anneau qui jaillit du nœud et s'efface, en
          boucle : « clique ici ensuite ». Un seul nœud à la fois le porte,
          toujours dans la couleur d'accent (indigo) quel que soit son type :
          le signal veut dire la même chose partout. Anneau CREUX : il ne
          teinte jamais le contenu du nœud. Mouvement réduit : anneau fixe. */}
      {isNext && state === 'available' && (
        <motion.span
          aria-hidden="true"
          data-kg-next-flash="true"
          className="pointer-events-none absolute -inset-1 rounded-[20px] border-[3px] border-indigo-500"
          initial={{ opacity: 0, scale: 1 }}
          animate={reduce ? { opacity: 0.7, scale: 1 } : { opacity: [0.9, 0], scale: [1, 1.12] }}
          transition={reduce ? { duration: 0 } : { duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: delay + 0.45, repeatDelay: 0.35 }}
        />
      )}
      {/* LE DOIGT (propriétaire, 2026-11-08) : sur la PREMIÈRE carte, tant que rien n'est découvert, une main 👆 monte et
          descend AU-DESSUS de la carte en la pointant (👇, propriétaire : « depuis le haut de la carte ») — « touche ici pour voir l'explication » sans une phrase de plus. Elle part au premier toucher
          (isStart devient faux) ; mouvement réduit : la main reste immobile. */}
      {isRoot && isStart && state === 'available' && (
        <motion.span
          aria-hidden="true"
          data-kg-start-finger="true"
          className="pointer-events-none absolute bottom-full left-1/2 z-10 -ms-5 mb-1 select-none text-4xl leading-none drop-shadow-md"
          initial={{ opacity: 0, y: -6 }}
          animate={reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: [-6, 6, -6] }}
          transition={reduce ? { duration: 0 } : { opacity: { duration: 0.3, delay: delay + 0.5 }, y: { duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.5 } }}
        >
          👇
        </motion.span>
      )}
      {/* Halo des nœuds à découvrir : il dit « par ici » sans rien écrire. */}
      {state === 'available' && !selected && (
        <motion.span
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-1.5 rounded-[20px] border-2 ${style.halo}`}
          initial={{ opacity: 0.8 }}
          animate={reduce ? { opacity: 0.6 } : { opacity: [0.85, 0.15, 0.85] }}
          transition={reduce ? { duration: 0 } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.4 }}
        />
      )}
      {state === 'available' && (
        <span
          aria-hidden="true"
          className={`absolute -top-2.5 end-3 rounded-full px-2 py-px text-[11px] font-bold text-white shadow-sm ${style.chip}`}
        >
          {isRoot && isStart ? t('map.progressive.startHere') : isNext ? t('map.progressive.nextStep') : t('map.progressive.explore_cta')}
        </span>
      )}

      <span className="flex items-center gap-1.5 min-w-0 h-5">
        {locked
          ? <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          : <span className={`inline-flex items-center justify-center w-5 h-5 rounded-md shrink-0 ${style.badge}`}><Icon className="w-3 h-3" aria-hidden="true" /></span>}
        <span className={`text-[11px] font-bold truncate ${locked ? '' : 'text-slate-500'}`}>
          {locked ? t('map.progressive.lockedShort', { module: lockedModule ?? '' }) : kindLabel}
        </span>
        {state === 'discovered' && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />}
        {isNew && !locked && (
          <span className="ms-auto shrink-0 w-2 h-2 rounded-full bg-indigo-500" aria-hidden="true" data-kg-new="true" />
        )}
      </span>
      <span className={`block ${guide && !locked ? 'text-[13px] font-semibold' : 'text-sm font-bold'} leading-6 truncate ${locked ? 'text-slate-400' : 'text-slate-900'}`}>
        {title}
      </span>
      {!locked && node.subtitle && (
        <span className="block text-xs text-slate-600 leading-6 [&_.katex]:!text-[1em]" data-kg-subtitle="true">
          {node.subtitle.includes('$')
            ? <FittedMath width={box.w}>{node.subtitle}</FittedMath>
            : <span className="block truncate">{node.subtitle}</span>}
        </span>
      )}
    </motion.button>
  );
});

export default GraphNode;
