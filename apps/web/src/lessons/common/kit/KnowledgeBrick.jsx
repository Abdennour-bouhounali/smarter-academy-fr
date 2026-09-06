import React, { useEffect } from 'react';
import { Feedback } from '../components/LessonUI';
import { CATEGORIES, useLessonKnowledge } from '../knowledge';

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

  return (
    <section
      data-knowledge-brick={id}
      data-knowledge-item={id}
      data-knowledge-variant={variant}
      aria-labelledby={titleId}
      className={`rounded-2xl p-4 space-y-3 ${style.box}`}
    >
      <p className={`text-xs font-mono font-bold uppercase tracking-widest ${style.tag}`}>
        <span aria-hidden="true">{style.emoji}</span> {style.label}
        {category && <span className="opacity-70"> · {category.label}</span>}
      </p>

      {lead && <p className={`text-sm ${style.lead}`}>{lead}</p>}

      <h4 id={titleId} className={`font-space font-bold text-base ${style.title}`}>{item.title}</h4>
      {item.summary && <p className="text-sm leading-relaxed">{item.summary}</p>}

      {!compact && item.visual && (
        <div className="flex justify-center rounded-xl bg-white p-2 overflow-x-auto">{item.visual}</div>
      )}

      <div className={style.body}>{item.body}</div>

      {children && (
        <div data-knowledge-brick-tryit className={`rounded-xl p-3 ${style.tryit}`}>
          {children}
        </div>
      )}
    </section>
  );
}

/**
 * Trois lectures, trois rôles : une connaissance neuve s'impose (fond sombre,
 * comme les « 🔑 À retenir » déjà en place), un rappel se fait discret, un
 * enrichissement s'annonce comme facultatif — l'élève doit voir du premier
 * coup d'œil ce qu'il DOIT savoir et ce qui est en plus.
 */
const VARIANTS = {
  new: {
    emoji: '🔑', label: 'Nouveau',
    box: 'border-2 border-slate-900 bg-slate-900 text-white',
    tag: 'text-slate-300', lead: 'text-slate-300',
    // !text-white : la règle globale h1..h6 de index.css impose sinon un titre
    // sombre, invisible ici.
    title: '!text-white',
    body: 'rounded-xl bg-white text-slate-800 p-3 text-sm space-y-2',
    tryit: 'bg-white/95 text-slate-800',
  },
  rappel: {
    emoji: '↺', label: 'Rappel',
    box: 'border-2 border-slate-300 bg-slate-50 text-slate-800',
    tag: 'text-slate-500', lead: 'text-slate-600',
    title: 'text-slate-900',
    body: 'rounded-xl bg-white border border-slate-200 p-3 text-sm space-y-2',
    tryit: 'bg-white border border-slate-200',
  },
  enrichment: {
    emoji: '✦', label: 'Pour aller plus loin',
    box: 'border-2 border-dashed border-violet-300 bg-violet-50 text-slate-800',
    tag: 'text-violet-600', lead: 'text-violet-800',
    title: 'text-violet-900',
    body: 'rounded-xl bg-white border border-violet-200 p-3 text-sm space-y-2',
    tryit: 'bg-white border border-violet-200',
  },
};
