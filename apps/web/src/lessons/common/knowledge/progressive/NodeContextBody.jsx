import { useTranslation } from 'react-i18next';
import MathText from '../../components/MathText';

/**
 * Le CONTENU d'un nœud, tel que la leçon l'a écrit dans `context` — partagé
 * par le panneau de contexte de la carte et par la lecture linéaire
 * « المعارف مفصّلة ». Rien n'y dépend du type : il rend des champs.
 *
 *   text      le paragraphe principal
 *   formula   une égalité mise en valeur
 *   list      des lignes (exemples, formulations)
 *   parts     des blocs RÔLÉS — 'wrong' | 'why' | 'right' | 'example' —
 *             pour une erreur fréquente : ce qu'on fait, pourquoi c'est
 *             faux, ce qui est juste. Chaque rôle a son libellé (i18n) et
 *             son marqueur, jamais la couleur seule.
 *   note      une phrase de complément
 *
 * `compact` : interlignes serrés (panneau de la carte).
 */
const PART_STYLE = {
  wrong: { mark: '✗', box: 'border-red-200 bg-red-50/60', label: 'text-red-700' },
  why: { mark: '؟', box: 'border-slate-200 bg-white', label: 'text-slate-600' },
  right: { mark: '✓', box: 'border-emerald-200 bg-emerald-50/60', label: 'text-emerald-700' },
  example: { mark: '•', box: 'border-slate-200 bg-slate-50', label: 'text-slate-600' },
};

export default function NodeContextBody({ context, compact = false }) {
  const { t } = useTranslation('lesson');
  if (!context) return null;
  return (
    <div className={`${compact ? 'space-y-2' : 'space-y-3'} text-sm text-slate-700 leading-relaxed`} data-kg-context-body="true">
      {context.text && <p><MathText>{context.text}</MathText></p>}
      {context.formula && (
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-center"><MathText>{context.formula}</MathText></p>
      )}
      {context.list && (
        <ul className="list-disc ms-5 space-y-0.5 text-slate-600">
          {context.list.map((line) => <li key={line}><MathText>{line}</MathText></li>)}
        </ul>
      )}
      {context.parts && (
        <div className="space-y-1.5" data-kg-parts="true">
          {context.parts.map(({ role, text }) => {
            const s = PART_STYLE[role] ?? PART_STYLE.example;
            return (
              <div key={role + text} className={`rounded-xl border px-3 py-2 ${s.box}`} data-kg-part={role}>
                <div className={`text-[11px] font-bold mb-0.5 ${s.label}`}>
                  <span aria-hidden="true">{s.mark} </span>{t(`map.progressive.parts.${role}`)}
                </div>
                <div><MathText>{text}</MathText></div>
              </div>
            );
          })}
        </div>
      )}
      {context.note && <p className="text-slate-600"><MathText>{context.note}</MathText></p>}
    </div>
  );
}
