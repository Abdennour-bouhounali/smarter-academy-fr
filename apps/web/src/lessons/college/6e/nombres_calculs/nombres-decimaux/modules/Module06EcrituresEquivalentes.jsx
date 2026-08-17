import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RepresentationPanel from '../components/RepresentationPanel';
import UnitGrid from '../components/UnitGrid';
import { formatDec } from '../components/decimalUtils';

/* ─── Étape 2 : traduire en fraction décimale ────────────────────── */
const TRADUCTIONS = [
  {
    value: 0.7,
    options: ['7/10', '7/100', '70/10', '7/1000'],
    correct: 0,
    explain: '0,7 se lit « 7 dixièmes » : le 7 est à la première position après la virgule, donc 7/10.',
  },
  {
    value: 1.25,
    options: ['125/10', '125/100', '1250/100', '25/100'],
    correct: 1,
    explain:
      "1,25 se lit « 125 centièmes » : 1 unité vaut 100 centièmes, plus 25 centièmes, soit 125/100. La dernière position après la virgule (les centièmes) donne le dénominateur.",
  },
  {
    value: 3.08,
    options: ['38/100', '308/100', '308/10', '3080/100'],
    correct: 1,
    explain:
      "3,08 = 3 unités (300 centièmes) + 0 dixième + 8 centièmes = 308 centièmes, soit 308/100. Attention : le 0 compte, on n'écrit pas 38/100 !",
  },
  {
    value: 12.305,
    options: ['12305/100', '12305/1000', '1235/1000', '12305/10000'],
    correct: 1,
    explain:
      'La dernière position occupée est celle des millièmes : le dénominateur est donc 1 000. 12,305 = 12305/1000.',
  },
];

/* ─── Étape 3 : les zéros inutiles… et les autres ────────────────── */
const REFERENCE = 3.5;
const CANDIDATS = [
  { text: '3,50', value: 3.5, why: 'Un zéro ajouté à la fin : 5 dixièmes = 50 centièmes, la quantité est identique.' },
  { text: '3,500', value: 3.5, why: '5 dixièmes = 500 millièmes : toujours la même quantité.' },
  { text: '3,05', value: 3.05, why: "Ici le zéro est JUSTE APRÈS la virgule : il pousse le 5 aux centièmes. 3,05 est bien plus petit que 3,5." },
  { text: '3,5', value: 3.5, why: "C'est le nombre de départ." },
  { text: '0,35', value: 0.35, why: 'Tous les chiffres ont changé de colonne : 0,35 vaut moins d\'une unité.' },
];

function ZeroHunt({ solved, onSolved }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  const allAnswered = Object.keys(answers).length === CANDIDATS.length;
  const allRight = CANDIDATS.every((c, i) => answers[i] === (c.value === REFERENCE));

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Pour chaque écriture, dis si elle représente la même quantité que{' '}
        <strong className="font-mono">3,5</strong>.
      </p>

      <div className="space-y-2">
        {CANDIDATS.map((c, i) => {
          const expected = c.value === REFERENCE;
          const given = answers[i];
          const isWrong = checked && given !== undefined && given !== expected;
          const isRight = checked && given === expected;

          return (
            <div
              key={c.text}
              className={`rounded-xl border-2 px-3 py-2.5 space-y-1.5 ${
                isRight ? 'border-emerald-300 bg-emerald-50' : isWrong ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="font-mono font-extrabold text-lg text-slate-800 tabular-nums">{c.text}</span>
                <div className="flex gap-1.5 shrink-0">
                  {[
                    { val: true, label: '= 3,5', Icon: Check },
                    { val: false, label: '≠ 3,5', Icon: X },
                  ].map(({ val, label, Icon }) => (
                    <button
                      key={label}
                      type="button"
                      disabled={solved}
                      onClick={() => {
                        setChecked(false);
                        setAnswers((a) => ({ ...a, [i]: val }));
                      }}
                      aria-pressed={given === val}
                      className={`px-3 py-2 rounded-lg border-2 font-mono text-xs font-bold min-h-[40px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        given === val
                          ? val
                            ? 'bg-emerald-600 border-emerald-700 text-white'
                            : 'bg-rose-600 border-rose-700 text-white'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                      }`}
                    >
                      <Icon className="inline w-3 h-3 mr-1" aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {checked && <p className="text-xs text-slate-600">{c.why}</p>}
            </div>
          );
        })}
      </div>

      {!solved && (
        <ValidateButton
          onClick={() => {
            setChecked(true);
            if (allRight) onSolved?.();
          }}
          disabled={!allAnswered}
        >
          Vérifier mes réponses
        </ValidateButton>
      )}

      {checked && !allRight && (
        <Feedback tone="ko">
          Certaines réponses sont à revoir. Le test infaillible : dans quelle colonne se trouve chaque chiffre ?
        </Feedback>
      )}

      {solved && (
        <Feedback tone="ok">
          <strong>3,5 = 3,50 = 3,500</strong> — les zéros ajoutés à la fin ne changent rien. En revanche{' '}
          <strong>3,5 ≠ 3,05</strong> et <strong>3,5 ≠ 0,35</strong> : dès qu'un chiffre change de colonne, la
          quantité change. Plus de chiffres ne veut donc pas dire plus grand !
        </Feedback>
      )}
    </div>
  );
}

export default function Module06EcrituresEquivalentes() {
  const navLinks = getNavLinks(6);
  const [explored, setExplored] = useState(false);
  const [trads, setTrads] = useState([]);
  const [zeroDone, setZeroDone] = useState(false);

  const s1 = explored;
  const s2 = trads.length === TRADUCTIONS.length;
  const s3 = zeroDone;
  const allDone = s1 && s2 && s3;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Des écritures équivalentes"
      moduleSubtitle="Un même nombre, plusieurs habits — et des zéros qui ne se valent pas tous."
      moduleNumber={6}
      estimatedTime="12 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="🔄 Machine à traduire" title="Le même nombre, vu de cinq façons différentes.">
          <p>
            Ce ne sont pas cinq nombres, ni cinq exercices : c'est <strong className="text-white">un seul
            objet</strong> qui change de représentation. Observe-les ensemble.
          </p>
        </MissionBrief>

        {/* Étape 1 */}
        <StepCard num={1} title="La machine à traduire : 2,4" done={s1}>
          <div className="space-y-4">
            <RepresentationPanel
              value={2.4}
              views={['quantite', 'virgule', 'fraction', 'decomposition', 'positions', 'droite']}
              mode="grid"
              den={10}
            />
            {!s1 && (
              <ValidateButton onClick={() => setExplored(true)} tone="indigo">
                J'ai observé les cinq représentations
              </ValidateButton>
            )}
            {s1 && (
              <Feedback tone="info">
                Retiens le chemin :{' '}
                <MathText>{'$2 + \\frac{4}{10} = \\frac{24}{10} = 2{,}4$'}</MathText> — et sur la droite graduée,
                c'est la 4<sup>e</sup> graduation après 2.
              </Feedback>
            )}
          </div>
        </StepCard>

        {/* Étape 2 */}
        <StepCard
          num={2}
          title="À toi de traduire"
          subtitle="Pour chaque écriture à virgule, retrouve la fraction décimale correspondante."
          done={s2}
          locked={!s1}
        >
          <div className="space-y-8">
            {TRADUCTIONS.map((item, i) =>
              i === 0 || trads.includes(i - 1) ? (
                <TraductionItem
                  key={item.value}
                  item={item}
                  index={i}
                  total={TRADUCTIONS.length}
                  solved={trads.includes(i)}
                  onSolved={() => setTrads((d) => (d.includes(i) ? d : [...d, i]))}
                />
              ) : null
            )}
          </div>
        </StepCard>

        {/* Étape 3 */}
        <StepCard
          num={3}
          title="Le mystère des zéros"
          subtitle="Certains zéros ne changent rien. D'autres changent tout."
          done={s3}
          locked={!s2}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: '3,5', parts: 10, shaded: 5, tone: 'emerald', sub: '5 dixièmes' },
                { label: '3,50', parts: 100, shaded: 50, tone: 'emerald', sub: '50 centièmes' },
                { label: '3,05', parts: 100, shaded: 5, tone: 'rose', sub: '5 centièmes' },
              ].map((x) => (
                <div key={x.label} className="border-2 border-slate-200 rounded-2xl p-3 bg-white space-y-2">
                  <div className="text-center font-mono font-extrabold text-xl text-slate-800">{x.label}</div>
                  <UnitGrid parts={x.parts} shaded={x.shaded} tone={x.tone} showCount={false} size="sm" />
                  <p className="text-[11px] text-center font-mono text-slate-500">{x.sub}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 text-center">
              On ne montre ici que la partie après la virgule (les 3 unités entières sont identiques).
            </p>

            <ZeroHunt solved={zeroDone} onSolved={() => setZeroDone(true)} />
          </div>
        </StepCard>
      </div>
    </ModuleLayout>
  );
}

/* ─── Un item de traduction ──────────────────────────────────────── */
function TraductionItem({ item, index, total, solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const renderFraction = (o) => {
    const [n, d] = o.split('/');
    return <MathText>{`$\\frac{${n}}{${d}}$`}</MathText>;
  };

  return (
    <div className="space-y-3 border-t border-slate-100 pt-5 first:border-0 first:pt-0">
      <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
        Traduction {index + 1} / {total}
      </div>
      <div className="bg-slate-900 rounded-xl py-4 text-center">
        <div className="font-mono font-extrabold text-3xl text-white tabular-nums">{formatDec(item.value)}</div>
      </div>
      <p className="text-sm font-semibold text-slate-700">Quelle est sa fraction décimale ?</p>
      <ChoiceGrid
        options={item.options}
        selected={pick}
        onSelect={setPick}
        revealed={revealed}
        correctIndex={item.correct}
        cols={4}
        renderOption={renderFraction}
      />
      {!revealed && (
        <ValidateButton
          onClick={() => {
            setRevealed(true);
            if (pick === item.correct) onSolved?.();
          }}
          disabled={pick === null}
        >
          Valider
        </ValidateButton>
      )}
      {revealed && (
        <>
          <Feedback tone={pick === item.correct ? 'ok' : 'ko'}>
            {item.explain}
            {pick !== item.correct && (
              <>
                {' '}
                <button
                  type="button"
                  onClick={() => {
                    setRevealed(false);
                    setPick(null);
                  }}
                  className="underline font-semibold"
                >
                  Réessayer
                </button>
              </>
            )}
          </Feedback>
          {solved && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <RepresentationPanel
                value={item.value}
                views={['virgule', 'fraction', 'decomposition']}
                mode="grid"
              />
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
