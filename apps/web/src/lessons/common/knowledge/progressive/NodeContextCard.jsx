import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import NodeContextBody from './NodeContextBody';
import AddToNotebookButton from '../../../../features/practice/notebook/AddToNotebookButton';
import { IS_RTL } from '../../../../locale.js';
import { kindStyle } from './nodeKinds';
import { contextOf } from './graphModel';

/**
 * Le contexte d'un nœud : COURT, et au mot près celui de la leçon (le graphe
 * pointe vers content/*.js ; un nœud `notebook` sans `context` montre le
 * résumé de son item — graphModel `contextOf`). La carte sert à VOIR les
 * liens ; le texte long reste dans l'onglet « عرض كامل » et dans le محور.
 *
 * Les relations sont aussi écrites en toutes lettres ici : c'est ce que lit
 * un lecteur d'écran, pour qui le dessin des flèches n'existe pas, et c'est
 * une navigation au doigt d'un nœud voisin à l'autre sur mobile.
 */
export default function NodeContextCard({
  node, state, relations, titleOf, stateOf, item, lessonId, lockedInfo, onClose, onNavigate, reduce, variant,
}) {
  const { t } = useTranslation('lesson');
  const style = kindStyle(node.kind);
  const locked = state === 'locked';
  const Arrow = IS_RTL ? ArrowLeft : ArrowRight;
  const headingId = `kg-context-${node.id}`;
  const { Icon } = style;

  return (
    <motion.section
      key={node.id}
      role="region"
      aria-labelledby={headingId}
      data-kg-context={node.id}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.12 } }}
      transition={{ duration: reduce ? 0 : 0.22 }}
      className={[
        'rounded-2xl border border-slate-200 bg-white p-4 space-y-3',
        variant === 'sheet' ? 'shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.25)]' : 'shadow-sm',
      ].join(' ')}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            {locked
              ? <Lock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              : <span className={`inline-flex items-center justify-center w-5 h-5 rounded-md ${style.badge}`}><Icon className="w-3 h-3" aria-hidden="true" /></span>}
            <span className="text-[11px] font-bold text-slate-500">
              {t(`map.progressive.kinds.${node.kind}`)} · {t(`map.progressive.states.${state}`)}
            </span>
          </div>
          <h3 id={headingId} className="text-base font-bold text-slate-900 leading-snug">
            {locked ? t('map.progressive.lockedTitle') : node.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          data-kg-close="true"
          className="shrink-0 inline-flex items-center justify-center w-11 h-11 -m-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-label={t('map.progressive.close')}
          title={t('map.progressive.close')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {locked ? (
        <p className="text-sm text-slate-600 leading-relaxed">
          {lockedInfo ? t('map.progressive.lockedAfter', lockedInfo) : t('map.progressive.lockedTitle')}
        </p>
      ) : (
        <NodeContextBody context={contextOf(node, item)} compact />
      )}

      {relations.length > 0 && (
        // Dans le panneau du bas (mobile, tiroir étroit), les relations se
        // replient : le dessin les montre déjà, et le panneau ne doit pas
        // recouvrir ce que l'élève vient de révéler.
        <details className="pt-2 border-t border-slate-100 group/rel" open={variant !== 'sheet'} data-kg-relations-box="true">
          <summary className="min-h-[44px] flex items-center gap-1 cursor-pointer list-none text-[11px] font-bold text-slate-400 hover:text-slate-600 [&::-webkit-details-marker]:hidden">
            <span>{t('map.progressive.relations')}</span>
            <span className="font-mono">{relations.length}</span>
            <span className="ms-auto transition-transform group-open/rel:rotate-180" aria-hidden="true">▾</span>
          </summary>
          <ul className="space-y-1" data-kg-relations="true">
            {relations.map(({ edge, other, outgoing }) => {
              const otherLocked = stateOf(other) === 'locked';
              const otherTitle = otherLocked ? t('map.progressive.lockedTitle') : titleOf(other);
              const from = outgoing ? node.title : otherTitle;
              const to = outgoing ? otherTitle : node.title;
              return (
                <li key={`${edge.from}-${edge.to}`}>
                  <button
                    type="button"
                    onClick={() => onNavigate(other)}
                    data-kg-relation={other}
                    className="w-full min-h-[44px] flex flex-wrap items-center gap-1.5 rounded-xl px-2 py-1.5 text-start text-xs text-slate-600 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    <span className={outgoing ? 'font-semibold text-slate-500' : 'font-bold text-slate-900'}>{from}</span>
                    <Arrow className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
                    {edge.label && !otherLocked && (
                      <>
                        <span className="rounded-full border border-slate-200 px-1.5 text-[11px] font-bold text-slate-600">{edge.label}</span>
                        <Arrow className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
                      </>
                    )}
                    <span className={outgoing ? 'font-bold text-slate-900' : 'font-semibold text-slate-500'}>{to}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </details>
      )}

      {!locked && node.notebook && item && (
        <div data-km-noprint="true">
          <AddToNotebookButton item={item} lessonCode={lessonId} categoryLabel={t(`map.progressive.kinds.${node.kind}`)} />
        </div>
      )}
    </motion.section>
  );
}
