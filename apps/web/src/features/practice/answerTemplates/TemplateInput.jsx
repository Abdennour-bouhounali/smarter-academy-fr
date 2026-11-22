import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RichText from '../RichText';
import { templateValue } from './templateFor';

/**
 * « الإجابة تُكتب في شكلها » — la saisie d'une réponse dessinée comme la mathématique qu'elle
 * complète (EXERCISE_CONTRACT.md § « قوالب الإجابة »). Le modèle vient de `templateFor(question)` ;
 * l'élève ne tape QUE l'inconnue : unités, « x = », « % », barres de fraction et formes sont imprimées.
 *
 * La formule est LTR et isolée dans la page arabe ; les cases sont de vrais <input> (pas de clavier
 * flottant : le pavé numérique du système suffit, la fraction a deux cases). `onChange({ value })`
 * envoie ce que lit AnswerEvaluator, `null` tant que c'est incomplet.
 *
 * Facultatifs (2026-11-10, les étapes saisies des leçons — NumericQuestion `template`) : `onEnter()` — Entrée dans une case valide ;
 * `ariaLabel` — le nom accessible de la case de valeur (la consigne de l'étape) à la place du libellé générique du modèle.
 */
const BOX = 'rounded-xl border-2 border-indigo-300 bg-white px-2 py-1 text-center text-2xl font-black text-slate-900 outline-none focus:border-nav-accent focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50';
const MATH = 'text-2xl text-blue-950';

const spaceThousands = (digits) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export default function TemplateInput({ template, question, onChange, disabled = false, onEnter, ariaLabel }) {
  const { t } = useTranslation('student');
  const [boxes, setBoxes] = useState({ value: '', num: '', den: '', negative: false });

  const update = (patch) => {
    const next = { ...boxes, ...patch };
    setBoxes(next);
    const v = templateValue(template, next);
    onChange(v === null ? null : { value: v });
  };

  /** Une case : nettoie la frappe selon le genre (chiffres, virgule, signe). */
  const box = ({ field = 'value', label, width = 'w-28', kind = template.kind, signed = false, raised = false }) => {
    const sanitize = (raw) => {
      let s = String(raw);
      if (kind === 'natural' || kind === 'digit') return spaceThousands(s.replace(/\D/g, ''));
      s = s.replace('.', ',').replace(/[^\d,\-−]/g, '');
      if (!signed) s = s.replace(/[-−]/g, '');
      return s.replace(/(?!^)[-−]/g, '');
    };
    return (
      <input
        key={field}
        dir="ltr"
        type="text"
        inputMode={kind === 'natural' ? 'numeric' : 'decimal'}
        autoComplete="off"
        aria-label={field === 'value' && ariaLabel ? ariaLabel : label}
        disabled={disabled}
        value={boxes[field]}
        onChange={(e) => update({ [field]: sanitize(e.target.value) })}
        onKeyDown={onEnter ? (e) => { if (e.key === 'Enter') onEnter(); } : undefined}
        className={`${BOX} ${width} ${raised ? 'w-16 -translate-y-3 py-0 text-lg' : ''}`}
        data-template-box={field}
      />
    );
  };

  const signToggle = () => (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={boxes.negative}
      aria-label={t('practice.template.sign')}
      onClick={() => update({ negative: !boxes.negative })}
      className="h-11 w-11 shrink-0 rounded-xl border-2 border-indigo-300 bg-nav-accent-soft text-2xl font-black text-indigo-900 disabled:opacity-50"
      data-template-sign
    >
      {boxes.negative ? '−' : '+'}
    </button>
  );

  const math = (latex) => (latex ? <span className={MATH}><RichText>{`$${latex}$`}</RichText></span> : null);
  const row = (children) => (
    // Une formule ne se coupe JAMAIS sur deux lignes (règle du propriétaire) : la ligne du modèle ne
    // passe pas à la ligne ; si elle dépasse, elle défile dans SA boîte.
    <div dir="ltr" className="flex max-w-full flex-nowrap items-center gap-2 overflow-x-auto py-1" style={{ unicodeBidi: 'isolate' }} data-template={template.kind}>
      {children}
    </div>
  );

  switch (template.kind) {
    case 'gap':
      return (
        <div className="space-y-3">
          {template.before && <p className="text-xl font-bold leading-relaxed text-slate-900"><RichText>{template.before}</RichText></p>}
          {row(<>{math(template.pre)}{box({ label: t('practice.template.gap'), width: 'w-28', signed: template.signed, raised: template.raised })}{math(template.post)}</>)}
          {template.after && <p className="text-lg text-slate-800"><RichText>{template.after}</RichText></p>}
        </div>
      );
    case 'form':
      return row(<>{template.subject && math(`${template.subject} =`)}{math(template.pre)}{box({ label: template.letter, signed: true })}{math(template.post)}</>);
    case 'fraction':
      return (
        <div className="flex flex-col items-start gap-2">
          {row(
            <>
              {signToggle()}
              <span className="inline-flex flex-col items-center gap-1.5">
                {box({ field: 'num', label: t('practice.template.numerator'), width: 'w-24' })}
                <span className="block h-[3px] w-28 rounded bg-blue-950" aria-hidden="true" />
                {box({ field: 'den', label: t('practice.template.denominator'), width: 'w-24' })}
              </span>
            </>,
          )}
          <span className="text-sm text-slate-600">{template.irreducible ? t('practice.template.irreducible') : t('practice.template.wholeOk')}</span>
        </div>
      );
    case 'percent':
      return row(<>{box({ label: t('practice.template.percent'), signed: false })}<span className="text-2xl font-black text-blue-950">%</span></>);
    case 'quantity':
      return row(<>{box({ label: t('practice.template.quantity'), width: 'w-40', signed: template.signed })}<span className="rounded-full bg-slate-100 px-3 py-1 text-lg font-black text-slate-700">{template.unit}</span></>);
    case 'solution':
      return row(<>{math(`${template.letter} =`)}{box({ label: template.letter, signed: true })}</>);
    case 'digit':
      return (
        <div dir="ltr" role="radiogroup" aria-label={t('practice.template.digit')} className="flex flex-wrap gap-2" data-template="digit">
          {Array.from({ length: 10 }, (_, d) => String(d)).map((d) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={boxes.value === d}
              disabled={disabled}
              onClick={() => update({ value: d })}
              className={`h-14 w-14 rounded-xl border-2 text-2xl font-black ${boxes.value === d ? 'border-nav-accent bg-nav-accent text-white' : 'border-indigo-300 bg-white text-slate-900'}`}
            >
              {d}
            </button>
          ))}
        </div>
      );
    case 'natural':
      return row(box({ label: t('practice.template.natural'), width: 'w-48', kind: 'natural' }));
    case 'signed':
      return row(<>{signToggle()}{box({ label: t('practice.template.signed') })}</>);
    default:
      return row(box({ label: question?.answerFormat ? question.answerFormat.replace(/\$/g, '') : t('practice.template.decimal'), width: 'w-40', signed: template.signed }));
  }
}
