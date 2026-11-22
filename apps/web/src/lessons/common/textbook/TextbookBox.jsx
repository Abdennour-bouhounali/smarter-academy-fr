import { useTranslation } from 'react-i18next';
import MathText from '../components/MathText';
import SourceTag from './SourceTag';

/**
 * Les encadrés du manuel, avec leurs rôles : تعريف · خاصية · ملاحظة · مثال ·
 * طريقة · تمرين/حل. Les couleurs suivent celles du livre (définitions et
 * propriétés en mauve, méthodes en vert, exemples en marge) pour que l'élève
 * retrouve à l'écran ce qu'il voit en classe.
 *
 * `text` est une chaîne arabe pouvant contenir des `$…$` (MathText isole les
 * mathématiques en LTR). `lines` : plusieurs paragraphes.
 */
const KINDS = {
  definition: { key: 'textbook.definition', box: 'border-violet-300 bg-violet-50', tag: 'bg-violet-600' },
  property: { key: 'textbook.property', box: 'border-violet-300 bg-violet-50', tag: 'bg-violet-600' },
  results: { key: 'textbook.directResults', box: 'border-violet-300 bg-violet-50', tag: 'bg-violet-600' },
  remark: { key: 'textbook.remark', box: 'border-orange-200 bg-orange-50/60', tag: 'bg-orange-500' },
  example: { key: 'textbook.example', box: 'border-slate-200 bg-white', tag: 'bg-slate-500' },
  method: { key: 'textbook.method', box: 'border-emerald-400 bg-emerald-100/70', tag: 'bg-emerald-600' },
  exercise: { key: 'textbook.exercise', box: 'border-rose-200 bg-rose-50/60', tag: 'bg-rose-500' },
  solution: { key: 'textbook.solution', box: 'border-slate-300 bg-slate-50', tag: 'bg-slate-700' },
  situation: { key: 'textbook.situation', box: 'border-amber-300 bg-amber-50', tag: 'bg-amber-600' },
  conjecture: { key: 'textbook.conjecture', box: 'border-blue-300 bg-blue-50', tag: 'bg-blue-600' },
};

export default function TextbookBox({ kind = 'definition', title, text, lines, children, source, compact = false }) {
  const { t } = useTranslation('lesson');
  const k = KINDS[kind] ?? KINDS.definition;
  const paragraphs = lines ?? (text ? [text] : []);
  return (
    <div className={`relative rounded-2xl border-2 ${k.box} ${compact ? 'p-3' : 'p-4'} space-y-2`} data-textbook-box={kind}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold text-white ${k.tag}`}>{title ?? t(k.key)}</span>
        <SourceTag source={source} />
      </div>
      {paragraphs.map((p, i) => (
        <p key={i} className="leading-relaxed text-slate-800 text-base"><MathText>{p}</MathText></p>
      ))}
      {children}
    </div>
  );
}
