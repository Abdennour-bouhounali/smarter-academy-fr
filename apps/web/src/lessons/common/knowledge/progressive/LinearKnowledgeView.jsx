import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { Lock, Printer } from 'lucide-react';
import ConceptVisual from '../ConceptVisual';
import { useLessonKnowledge } from '../KnowledgeProvider';
import { allKnowledge } from '../knowledgeState';
import MathText from '../../components/MathText';
import { linearEntries } from './graphModel';
import { kindStyle } from './nodeKinds';
import NodeContextBody from './NodeContextBody';
import MathLabel from '../../components/MathLabel';

/**
 * « المعارف مفصّلة » de la carte PROGRESSIVE —
 * docs/architecture/KNOWLEDGE_MAP.md « Progressive map — implementation ».
 *
 * La carte (« الخريطة ») répond à « comment ces connaissances sont-elles
 * liées ? » ; cette vue répond à « si je lis tout, par où commencer, et
 * ensuite ? ». Donc UNE colonne, de haut en bas, chaque étape NUMÉROTÉE dans
 * l'ordre de linearEntries (la carte parcourue en profondeur : chaque aide
 * juste après ce qu'elle éclaire, un rappel juste avant), la première
 * marquée « ابدأ من هنا ». Pas de graphe ici : un filet vertical discret
 * relie les numéros, le numéro fait l'essentiel du travail.
 *
 * Deux sortes d'étape, un seul rendu piloté par le TYPE du nœud :
 *   connaissance  le contenu de la vue habituelle, sans retouche : titre,
 *                 résumé, visuel, corps (le texte du manuel) ;
 *   aide          (خطأ شائع, تحقّق, تذكّر, انتبه, خلاصة) son `context`,
 *                 dans une carte teintée au filet de début — la même
 *                 grammaire visuelle que sur la carte.
 *
 * `variant="print"` : le même document pour la feuille A4 (monté dans
 * `.sa-print-view`, sans animation ni commande), à la place de la vue
 * imprimée par strates.
 */
export default function LinearKnowledgeView({ graph, items, variant = 'screen', printTitle, printSubject }) {
  const { t } = useTranslation('lesson');
  const reduce = useReducedMotion();
  const { knowledge } = useLessonKnowledge();
  const print = variant === 'print';
  const ordered = linearEntries(graph, items);
  // Ce qui reste à venir : les mêmes étapes, calculées sur TOUTE la leçon.
  const total = knowledge ? linearEntries(graph, allKnowledge(knowledge)).length : ordered.length;
  const lockedCount = Math.max(0, total - ordered.length);

  return (
    <div
      // Pleine largeur (règle du propriétaire : pas de colonne centrée
      // étroite) — mais toujours UNE seule colonne, de haut en bas.
      // Le souffle vient du padding, pas d'une largeur bridée.
      className={print ? 'font-sans text-[#172033] mx-auto w-full max-w-[210mm]' : 'w-full px-1 py-2 sm:px-6 sm:py-4 lg:px-10 lg:py-6'}
      data-kg-linear={variant}
    >
      {print ? (
        <div className="flex justify-between items-end border-b border-[#DCE3EF] pb-2 mb-6 print-avoid-break-after">
          <div>
            <div className="text-[20pt] font-black text-[#172554] leading-none mb-1">{printTitle || t('map.printTitleFallback')}</div>
            <div className="text-[10pt] font-bold text-[#6D3FE7]">{t('map.progressive.tabDetails')}</div>
          </div>
          <div className="text-end">
            <div className="text-[9pt] font-bold text-[#172033]">SMARTER ACADEMY</div>
            <div className="text-[8pt] text-[#667085]">{printSubject || t('map.printSubjectFallback')}</div>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-start gap-3 mb-8 sm:mb-10">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-8">{t('map.progressive.tabDetails')}</h2>
            <p className="text-xs text-slate-500 leading-relaxed" data-kg-linear-lead="true">
              {t('map.progressive.linear.lead', { last: ordered.length })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            data-km-noprint="true"
            className="shrink-0 min-h-[44px] inline-flex items-center gap-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:border-slate-400 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            {t('map.printMyMap')}
          </button>
        </div>
      )}

      <ol className="list-none p-0 m-0" aria-label={t('map.progressive.linear.listLabel')}>
        {ordered.map((entry, i) => {
          const { item, node } = entry;
          const kind = entry.kind ?? 'concept';
          const style = kindStyle(kind);
          const guide = style.family === 'guide';
          const first = i === 0;
          const last = i === ordered.length - 1 && lockedCount === 0;
          const { Icon } = style;
          const title = item ? item.title : node.title;
          return (
            <motion.li
              key={entry.key}
              className={`relative flex ${print ? 'gap-3 print-card pb-5' : 'gap-2.5 sm:gap-5 lg:gap-6 pb-6 sm:pb-8'} last:pb-0`}
              data-kg-linear-item={entry.key}
              data-kg-linear-kind={kind}
              data-kg-linear-index={i + 1}
              data-km-item={item ? item.id : undefined}
              initial={print || reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i, 6) * 0.05 }}
              style={{ breakInside: 'avoid' }}
            >
              {/* Le numéro, et le filet qui mène au suivant. */}
              {/* Le numéro s'aligne sur le HAUT de la carte (pt) ; le filet
                  traverse l'espace jusqu'au numéro suivant (-mb = pb + pt − 8). */}
              <div className={`relative flex flex-col items-center shrink-0 w-10 ${print ? '' : 'pt-4 sm:pt-5'}`} aria-hidden="true">
                <span
                  className={[
                    'w-10 h-10 rounded-full grid place-items-center text-base font-bold border-2',
                    first ? `${style.chip} border-transparent text-white shadow-sm` : `${style.border} bg-white text-slate-800`,
                  ].join(' ')}
                  data-kg-linear-number={i + 1}
                >
                  {i + 1}
                </span>
                {!last && <span className={`flex-1 w-0.5 mt-2 rounded-full bg-slate-200 ${print ? '-mb-3' : '-mb-8 sm:-mb-11'}`} />}
              </div>

              <article
                className={[
                  'min-w-0 flex-1',
                  print
                    ? 'pt-1'
                    // Une AIDE : carte teintée, filet de début épais (comme sur
                    // la carte). Une CONNAISSANCE : carte blanche, ombre douce.
                    : guide
                      ? `rounded-3xl border border-s-4 ${style.border} ${style.tint} px-4 py-4 sm:px-8 sm:py-5`
                      : `rounded-3xl border bg-white px-4 py-4 sm:px-8 sm:py-6 shadow-sm shadow-slate-900/5 ${first ? style.border : 'border-slate-200'}`,
                ].join(' ')}
                aria-labelledby={`kg-linear-${entry.key}`}
              >
                <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                  {first && (
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white ${style.chip}`} data-kg-linear-start="true">
                      {t('map.progressive.linear.start')}
                    </span>
                  )}
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-md ${style.badge}`}>
                    <Icon className="w-3 h-3" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">{t(`map.progressive.kinds.${kind}`)}</span>
                  {item?.isNew && !print && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${style.badge}`}>{t('map.new')}</span>
                  )}
                </div>
                <h3
                  id={`kg-linear-${entry.key}`}
                  className={`${guide ? 'text-base' : 'text-base sm:text-lg'} font-bold text-slate-900 leading-8`}
                >
                  <span className="sr-only">{t('map.progressive.linear.itemNumber', { n: i + 1 })} — </span>
                  {title}
                </h3>
                {item ? (
                  <>
                    {item.summary && <p className="text-sm text-slate-600 leading-relaxed mt-0.5"><MathLabel><MathLabel>{item.summary}</MathLabel></MathLabel></p>}
                    {item.visual && (
                      <div className="mt-3">
                        <ConceptVisual size={item.visualSize} context={print ? 'print' : 'drawer'}>{item.visual}</ConceptVisual>
                      </div>
                    )}
                    <div
                      className={[
                        'text-sm text-slate-700 leading-relaxed',
                        print ? 'mt-3 sa-print-body' : 'mt-4 rounded-2xl bg-slate-50 px-3 py-3 sm:px-6 sm:py-4',
                      ].join(' ')}
                    >
                      {item.body}
                    </div>
                  </>
                ) : (
                  <>
                    {node.subtitle && (
                      <p className="text-sm text-slate-600 leading-relaxed mt-0.5"><MathText>{node.subtitle}</MathText></p>
                    )}
                    <div className={print ? 'mt-2 sa-print-body' : 'mt-3'}>
                      <NodeContextBody context={node.context} />
                    </div>
                  </>
                )}
              </article>
            </motion.li>
          );
        })}

        {lockedCount > 0 && (
          <li className="relative flex gap-3 sm:gap-4" data-kg-linear-locked={lockedCount}>
            <div className="shrink-0 w-10 flex justify-center" aria-hidden="true">
              <span className="w-10 h-10 rounded-full grid place-items-center border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
            </div>
            <p className="pt-2.5 text-sm text-slate-500 leading-relaxed">
              {t('map.progressive.linear.locked', { count: lockedCount })}
            </p>
          </li>
        )}
      </ol>
    </div>
  );
}
