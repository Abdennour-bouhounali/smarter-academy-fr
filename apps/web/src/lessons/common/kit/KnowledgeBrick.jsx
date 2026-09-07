import React, { useEffect } from 'react';
import { Feedback } from '../components/LessonUI';
import { CATEGORIES, useLessonKnowledge } from '../knowledge';
import ConceptVisual from '../knowledge/ConceptVisual';

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
 * @param {string} id            id de l'item dans LESSON_KNOWLEDGE (clé de l'audit)
 * @param {string[]} [establishes] ids de concepts rendus disponibles pour `requires` (défaut : [id])
 * @param {'new'|'rappel'|'enrichment'} [variant]
 * @param {React.ReactNode} [lead] une phrase reliant l'item au geste qui vient d'être fait
 * @param {boolean} [unlock=true] faire entrer l'item dans la carte au montage
 * @param {boolean} [compact=false] masquer le visuel (étapes denses)
 * @param {React.ReactNode} [children] l'essai immédiat : une petite question, une manipulation
 *
 * TAILLE DU VISUEL. Elle vient de l'item (`visualSize`), pas de la brique :
 * une même connaissance se lit pareil dans la brique et dans la carte.
 * Voir ConceptVisual — 'sm' | 'md' (défaut) | 'lg' | 'full'.
 */
export default function KnowledgeBrick({
  id,
  establishes,          // lu par scripts/audit-knowledge-dependencies.mjs
  variant = 'new',
  lead,
  unlock = true,
  compact = false,
  children,
}) {
  const { getItem, unlockItem } = useLessonKnowledge();
  const item = getItem(id);

  useEffect(() => {
    if (unlock) unlockItem(id);
  }, [id, unlock, unlockItem]);

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
      {style.accent && <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-[3px] ${accent}`} />}

      <div className={`p-5 space-y-3 ${style.accent ? 'pl-6' : ''}`}>
        <p className={`text-[11px] font-mono font-bold uppercase tracking-[0.14em] ${style.tag}`}>
          <span aria-hidden="true">{style.emoji}</span> {style.label}
          {category && <span> · {category.label}</span>}
        </p>

        {lead && <p className={`text-sm leading-relaxed ${style.lead}`}>{lead}</p>}

        <div className="space-y-1.5">
          <h4 id={titleId} className={`font-space font-bold text-lg leading-snug ${style.title}`}>{item.title}</h4>
          {item.summary && <p className="text-sm leading-relaxed text-slate-600">{item.summary}</p>}
        </div>

        {!compact && item.visual && (
          <ConceptVisual size={item.visualSize} context="brick">
            {item.visual}
          </ConceptVisual>
        )}

        <div className={style.body}>{item.body}</div>

        {children && (
          <div data-knowledge-brick-tryit className={`rounded-xl p-3.5 ${style.tryit}`}>
            {children}
          </div>
        )}
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
    emoji: '🔑', label: 'Nouveau',
    box: 'border border-slate-200 bg-white shadow-sm',
    tag: 'text-slate-400', lead: 'text-slate-500',
    title: 'text-slate-900',
    body: 'text-slate-700 text-sm space-y-2',
    tryit: 'bg-slate-50 border border-slate-200 text-slate-800',
    accent: true,
  },
  rappel: {
    emoji: '↺', label: 'Rappel',
    box: 'border border-slate-200 bg-slate-50/70',
    tag: 'text-slate-400', lead: 'text-slate-500',
    title: 'text-slate-800',
    body: 'text-slate-700 text-sm space-y-2',
    tryit: 'bg-white border border-slate-200 text-slate-800',
    accent: false,
  },
  enrichment: {
    emoji: '✦', label: 'Pour aller plus loin',
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
