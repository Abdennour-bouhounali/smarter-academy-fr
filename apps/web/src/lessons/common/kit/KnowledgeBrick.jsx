import React, { useEffect } from 'react';
import { MoreToggle } from '../components/StudentFocus';
import { useTranslation } from 'react-i18next';
import { Feedback } from '../components/LessonUI';
import { CATEGORIES, useLessonKnowledge } from '../knowledge';
import ConceptVisual from '../knowledge/ConceptVisual';
import AddToNotebookButton from '../../../features/practice/notebook/AddToNotebookButton';
import { bidi } from '../../../utils/bidi';
import MathLabel from '../components/MathLabel';
import { usePredictGate, PredictPanel, PredictionEcho } from './PredictRule';

/**
 * KnowledgeBrick — pose UNE connaissance à l'instant où l'élève en a besoin.
 *
 * C'est la position d'enseignement du contrat « connaissances avant la
 * demande » (docs/architecture/KNOWLEDGE_DEPENDENCY.md) : ce qu'une question
 * exige doit avoir été établi par une brique placée AVANT elle, ou déclaré
 * dans le `priorKnowledge` de la leçon. Un `explain`, une `correction` ou un
 * `footer` renforcent une notion ; ils ne l'établissent jamais, puisque
 * l'élève ne les lit qu'après avoir répondu (ou tout terminé).
 *
 * SOURCE UNIQUE. Le texte de la connaissance vit dans le `knowledge.jsx` de la
 * leçon — la brique ne fait que le rendre, par son `id`. Rien n'est écrit deux
 * fois : la carte et la brique montrent le même item, et l'enrichir se fait à
 * un seul endroit (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * SÉQUENCE. sens (titre + résumé) → représentation (visual) → exemple et lien
 * avec ce qu'on sait déjà (body) → essai immédiat (children). Court : la
 * réparation n'est pas « ajouter de la théorie », c'est mettre la bonne
 * connaissance au bon moment.
 *
 * Au montage, la connaissance entre dans la carte (`unlockItem`) : l'élève
 * voit sa carte grandir au moment où il apprend, pas à la fin du module.
 *
 * « أتوقّع القاعدة » (2026-10-06, toutes les leçons) : une connaissance NOUVELLE
 * que l'élève peut conclure (concepts, règles, méthodes, à retenir, formules —
 * pas le vocabulaire) n'est montrée qu'après qu'il l'a écrite avec ses mots
 * (PredictRule.jsx, predictRule.js). Jusque-là : ni titre, ni `lead`, ni corps
 * — ils la diraient — et la carte ne la reçoit qu'à la révélation. Sa
 * prédiction reste ensuite affichée au-dessus de la règle. Jamais pour un
 * enseignant, un rappel, une règle déjà acquise ou déjà prédite.
 *
 * @param {string} id            id de l'item dans LESSON_KNOWLEDGE (clé de l'audit)
 * @param {string[]} [establishes] ids de concepts rendus disponibles pour `requires` (défaut : [id])
 * @param {'new'|'rappel'|'enrichment'} [variant]
 * @param {React.ReactNode} [lead] une phrase reliant l'item au geste qui vient d'être fait
 * @param {boolean} [unlock=true] faire entrer l'item dans la carte au montage
 * @param {boolean} [compact=false] masquer le visuel (étapes denses)
 * @param {React.ReactNode} [children] l'essai immédiat : une petite question, une manipulation
 * @param {boolean} [predict] forcer (true) ou supprimer (false) « أتوقّع القاعدة » pour cette brique
 * @param {string} [predictPrompt] la question qui fait conclure la règle (défaut : `item.predictPrompt`, puis générique)
 *
 * TAILLE DU VISUEL. Elle vient de l'item (`visualSize`), pas de la brique :
 * une même connaissance se lit pareil dans la brique et dans la carte.
 * Voir ConceptVisual — 'sm' | 'md' (défaut) | 'lg' | 'full'.
 */
export default function KnowledgeBrick({
  id,
  // establishes : lu par scripts/audit-knowledge-dependencies.mjs
  variant = 'new',
  lead,
  unlock = true,
  compact = false,
  predict,
  predictPrompt,
  children,
}) {
  const { t } = useTranslation('lesson');
  const { getItem, unlockItem, lessonId } = useLessonKnowledge();
  const item = getItem(id);
  const { gated, saved, reveal } = usePredictGate({
    id, itemType: item?.type, itemPredict: item?.predict, brickPredict: predict, variant, ready: Boolean(item),
    itemTitle: item?.title, itemRule: item?.summary,
  });

  // La carte ne reçoit la connaissance qu'une fois montrée (après la prédiction).
  useEffect(() => {
    if (unlock && item && !gated) unlockItem(id);
  }, [id, unlock, unlockItem, item, gated]);

  if (!item) {
    // Une brique sans item est une erreur d'auteur : l'audit la signale
    // (E_BRICK_ITEM_MISSING) et le développement la rend visible.
    if (import.meta.env?.DEV) {
      return (
        <Feedback tone="ko">
          <strong>KnowledgeBrick</strong> : aucun item « {String(id)} » dans knowledge.jsx.
        </Feedback>
      );
    }
    return children ?? null;
  }

  if (gated) {
    // La palette ne propose que les symboles de CETTE règle.
    return <PredictPanel prompt={predictPrompt ?? item.predictPrompt} onReveal={reveal} symbolsFrom={[item.title, item.summary, item.body]} data-predict-for={id} data-knowledge-brick-pending={id} />;
  }

  const style = VARIANTS[variant] ?? VARIANTS.new;
  const category = CATEGORIES.find((c) => c.id === item.type);
  const titleId = `kb-${id}-title`;

  const accent = ACCENT[category?.color] ?? ACCENT.indigo;

  return (
    <section
      data-knowledge-brick={id}
      data-knowledge-item={id}
      data-knowledge-variant={variant}
      aria-labelledby={titleId}
      className={`relative overflow-hidden rounded-2xl ${style.box}`}
    >
      {/* Le liseré de catégorie : la seule couleur de la carte. */}
      {style.accent && <span aria-hidden="true" className={`absolute inset-y-0 start-0 w-[3px] ${accent}`} />}

      <div className={`p-5 space-y-3 ${style.accent ? 'ps-6' : ''}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={`text-[11px] font-mono font-bold uppercase tracking-[0.14em] ${style.tag}`}>
            <span aria-hidden="true">{style.emoji}</span> {t(style.labelKey)}
            {category && <span> · {t(category.labelKey)}</span>}
          </p>
          {/* Le pont EXPLICITE vers le cahier : la connaissance n'y entre que
              si l'élève le demande, comme point de départ de SA note. La
              carte, elle, ne bouge pas. */}
          <AddToNotebookButton item={item} lessonCode={lessonId} categoryLabel={category ? t(category.labelKey) : null} />
        </div>

        {/* Ce que l'élève avait conclu, à comparer avec la règle. */}
        {variant === 'new' && <PredictionEcho id={id} text={saved} />}

        {lead && <p className={`text-sm leading-relaxed ${style.lead}`}>{lead}</p>}

        <div className="space-y-1.5">
          <h4 id={titleId} className={`font-space font-bold text-lg leading-snug ${bidi(style.title)}`}><MathLabel>{item.title}</MathLabel></h4>
          {item.summary && <p className="text-sm leading-relaxed text-slate-600"><MathLabel>{item.summary}</MathLabel></p>}
        </div>

        {!compact && item.visual && (
          <ConceptVisual size={item.visualSize} context="brick">
            {item.visual}
          </ConceptVisual>
        )}

        {/* Regard « focus » : titre, résumé et dessin ; le corps et l'essai à un geste (« المزيد »). */}
        <MoreToggle>
          <div className="space-y-3">
            <div className={style.body}>{item.body}</div>

            {children && (
              <div data-knowledge-brick-tryit className={`rounded-xl p-3.5 ${style.tryit}`}>
                {children}
              </div>
            )}
          </div>
        </MoreToggle>
      </div>
    </section>
  );
}

/**
 * Trois lectures, trois rôles — obtenues par la HIÉRARCHIE, pas par le poids.
 *
 * La brique « Nouveau » était un pavé sombre portant deux encarts blancs : le
 * bloc le plus lourd de la page, alors que tout ce qui l'entoure (Feedback,
 * StepCard, cartes de MathText) est clair. Elle attirait l'œil par contraste
 * brut et empilait trois niveaux d'encadrés.
 *
 * Elle est maintenant claire comme le reste. Ce qui la distingue :
 *  - un LISERÉ vertical à la couleur de la catégorie (concepts, règles,
 *    méthodes…), seule touche colorée de la carte ;
 *  - une étiquette « 🔑 Nouveau » discrète ;
 *  - un titre en neutre sombre, jamais coloré ;
 *  - un corps posé à même la carte, sans encadré blanc supplémentaire — seul
 *    l'essai immédiat garde un fond propre, parce qu'il change de registre
 *    (on ne lit plus, on répond).
 *
 * `rappel` est plus discret encore, `enrichment` s'annonce en pointillés.
 */
const VARIANTS = {
  new: {
    emoji: '🔑', labelKey: 'brick.new',
    box: 'border border-slate-200 bg-white shadow-sm',
    tag: 'text-slate-400', lead: 'text-slate-500',
    title: 'text-slate-900',
    body: 'text-slate-700 text-sm space-y-2',
    tryit: 'bg-slate-50 border border-slate-200 text-slate-800',
    accent: true,
  },
  rappel: {
    emoji: '↺', labelKey: 'brick.reminder',
    box: 'border border-slate-200 bg-slate-50/70',
    tag: 'text-slate-400', lead: 'text-slate-500',
    title: 'text-slate-800',
    body: 'text-slate-700 text-sm space-y-2',
    tryit: 'bg-white border border-slate-200 text-slate-800',
    accent: false,
  },
  enrichment: {
    emoji: '✦', labelKey: 'brick.goFurther',
    box: 'border border-dashed border-violet-200 bg-violet-50/40',
    tag: 'text-violet-400', lead: 'text-violet-700',
    title: 'text-slate-900',
    body: 'text-slate-700 text-sm space-y-2',
    tryit: 'bg-white border border-violet-200 text-slate-800',
    accent: false,
  },
};

/**
 * Le liseré de catégorie — la couleur ne décore pas, elle DIT de quelle sorte
 * de connaissance il s'agit. Mêmes familles que CATEGORIES et que la carte, en
 * version calme : une barre de 3 px, et rien d'autre.
 */
const ACCENT = {
  blue: 'bg-blue-400',
  orange: 'bg-amber-400',
  green: 'bg-emerald-400',
  purple: 'bg-violet-400',
  red: 'bg-rose-400',
  indigo: 'bg-indigo-400',
};
