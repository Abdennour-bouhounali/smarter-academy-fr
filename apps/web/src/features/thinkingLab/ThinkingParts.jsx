import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEffectsPreference } from '../../lessons/common/hooks/useEffectsPreference';
import { EffectsToggle } from '../../lessons/common/components/LessonUI';
import { LazyExamMathField } from '../practice/exam/math/lazy';
import { thinkingKeyboard } from '../practice/exam/math/examKeyboard';
import { loadFigure } from './figures';
import { mathRuns, phaseOf } from './thinkingModel';

/**
 * Les petites pièces partagées des trois écrans du labo des énigmes : le texte avec
 * ses îlots mathématiques, la figure (lot paresseux par nom), la saisie de la réponse,
 * la pastille de phase et l'interrupteur « Son » (éteint par défaut, la préférence de l'appareil).
 */

/** Un texte dont les formules restent d'un bloc, de gauche à droite (sauts de ligne gardés). */
export function MathRun({ text, className = '' }) {
  return (
    <span className={`whitespace-pre-line ${className}`}>
      {mathRuns(text).map((run, i) => (run.math
        // inline-block + bdi : une formule reste d'un bloc, isolée de l'algorithme bidirectionnel ;
        // si elle passe à la ligne, elle se coupe DANS sa boîte, de gauche à droite.
        ? <bdi key={i} dir="ltr" className="inline-block max-w-full font-inter font-semibold text-slate-900">{run.text}</bdi>
        : <span key={i}>{run.text}</span>))}
    </span>
  );
}

/** Une réponse attendue écrite pour l'œil : « x^2*(1+pi/3-sqrt(3)) » → « x²×(1+π/3−√(3)) ». */
export function prettyMath(raw) {
  return String(raw ?? '')
    .replace(/\^2(?![0-9])/g, '²')
    .replace(/\^3(?![0-9])/g, '³')
    .replace(/sqrt\((\d+)\)/g, '√$1')
    .replace(/sqrt/g, '√')
    .replace(/\bpi\b/g, 'π')
    .replace(/\*/g, '×')
    .replace(/-/g, '−');
}

/** Une réponse attendue écrite pour l'œil : le texte du choix, ou l'expression en Unicode. */
export function answerText(answer) {
  if (answer.check === 'choice') return answer.choices?.find((c) => c.id === answer.value)?.text ?? answer.value;
  return prettyMath(answer.value);
}

const FIGURE_CACHE = new Map();
/** Le composant paresseux d'une figure ; `withBase` : les couches données s'ajoutent à BASE_LAYERS. */
function lazyFigure(name, withBase) {
  const key = `${name}:${withBase}`;
  if (!FIGURE_CACHE.has(key)) {
    FIGURE_CACHE.set(key, lazy(() => loadFigure(name).then((mod) => ({
      default: withBase
        ? ({ layers, ...rest }) => <mod.default {...rest} layers={[...new Set([...mod.BASE_LAYERS, ...(layers ?? [])])]} />
        : mod.default,
    }))));
  }
  return FIGURE_CACHE.get(key);
}

/**
 * La figure d'un défi, dessinée en code. Les couches d'un pas de relecture s'AJOUTENT à celles de
 * l'énoncé (BASE_LAYERS) : le carré et ses arcs restent là quand on allume le triangle (THINKING_LAB.md §7).
 */
export function ChallengeFigure({ figure, layers = null, ariaLabel }) {
  const Figure = useMemo(() => (figure ? lazyFigure(figure.component, layers !== null) : null), [figure, layers]);
  if (!Figure) return null;
  return (
    <div className="flex justify-center rounded-2xl bg-white p-3 ring-1 ring-slate-200 [&>svg]:max-w-[340px] lg:[&>svg]:max-w-[420px]" data-figure-frame>
      <Suspense fallback={<div className="aspect-square w-full max-w-[340px] animate-pulse rounded-xl bg-slate-100 lg:max-w-[420px]" />}>
        <Figure {...(layers ? { layers } : {})} props={figure.props ?? {}} ariaLabel={ariaLabel} />
      </Suspense>
    </div>
  );
}

export function PhaseChip({ phase }) {
  const { t } = useTranslation('thinking');
  const p = phaseOf(phase);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-inter text-xs font-bold ring-1 ${p.tone}`} data-phase={phase}>
      <span dir="ltr" aria-hidden="true">{p.sign}</span>
      {t(`phases.${phase}`)}
    </span>
  );
}

/** Le même interrupteur « Son » que les labos (EffectsToggle de LessonUI) : une seule préférence d'appareil. */
export function SoundToggle() {
  const { enabled, toggle } = useEffectsPreference();
  return <EffectsToggle enabled={enabled} onToggle={toggle} />;
}

/**
 * La saisie d'une réponse : des choix (check `choice`) ou le champ MathLive avec le clavier du
 * « Le labo des énigmes » (π, √, puissances, fractions, et les variables du défi). La valeur rendue est
 * l'ascii-math que lit le juge du serveur.
 */
export function AnswerInput({ format, value, onChange, onEnter, disabled = false, ariaLabel }) {
  const { t } = useTranslation('thinking');
  const keyboard = useMemo(() => thinkingKeyboard(format?.vars ?? []), [format?.vars]);
  // Le champ garde SON LaTeX ; on ne remonte que l'ascii (ce que lit le juge). Une valeur remise
  // à vide par la page (après une réponse juste, un nouveau défi) vide aussi le champ.
  const [latex, setLatex] = useState('');
  useEffect(() => { if (!value) setLatex(''); }, [value]);
  if (format?.check === 'choice') {
    return (
      <fieldset className="space-y-2" disabled={disabled}>
        <legend className="sr-only">{t('workspace.choose')}</legend>
        {format.choices.map((c) => (
          <label key={c.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl px-4 py-3 ring-1 transition ${value === c.id ? 'bg-nav-accent-soft ring-2 ring-indigo-400' : 'bg-white ring-slate-200 hover:ring-slate-300'}`}>
            <input type="radio" name="tl-choice" value={c.id} checked={value === c.id} onChange={() => onChange(c.id)} className="mt-1 accent-indigo-600" />
            <span className="font-inter text-sm leading-7 text-slate-800"><MathRun text={c.text} /></span>
          </label>
        ))}
      </fieldset>
    );
  }
  return (
    <div className="space-y-1.5">
      <div dir="ltr" className="rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-300 focus-within:ring-2 focus-within:ring-indigo-400">
        <LazyExamMathField value={latex} onChange={(l, ascii) => { setLatex(l); onChange(ascii); }} onEnter={onEnter} disabled={disabled}
          ariaLabel={ariaLabel ?? t('workspace.answerLabel')} keyboard={keyboard} className="w-full text-xl" />
      </div>
      {format?.percent && <p className="font-inter text-xs text-slate-500">{t('workspace.percentHint')}</p>}
    </div>
  );
}
