import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PartitionShape from '../components/PartitionShape';
import { texFrac } from '../components/fractionUtils';

/* ─── Étape 1 & 2 : construire quatre fractions ──────────────────── */
const CONSTRUCTIONS = [
  { den: 2, num: 1, shape: 'bar', tone: 'sky' },
  { den: 3, num: 2, shape: 'circle', tone: 'violet' },
  { den: 4, num: 3, shape: 'bar', tone: 'amber' },
  { den: 10, num: 7, shape: 'bar', tone: 'emerald' },
];

const DEN_OPTIONS = [2, 3, 4, 5, 6, 8, 10];

function Construction({ item, solved, onSolved }) {
  const [den, setDen] = useState(null);
  const [cells, setCells] = useState([]);
  const [checkedDen, setCheckedDen] = useState(false);

  const denOk = den === item.den;
  const numOk = cells.length === item.num;

  const toggle = (i) => {
    if (solved || !denOk) return;
    setCells((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].sort((a, b) => a - b)));
  };

  const pickDen = (d) => {
    if (solved) return;
    setDen(d);
    setCells([]);
    setCheckedDen(true);
  };

  return (
    <div className="space-y-4">
      {/* Étape A : choisir le nombre de parts égales */}
      <div>
        <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
          1. Choisis le nombre de parts égales
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DEN_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => pickDen(d)}
              disabled={solved}
              aria-pressed={den === d}
              className={`w-11 h-11 rounded-xl border-2 font-mono font-bold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                den === d
                  ? 'bg-slate-800 border-slate-900 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Étape B : prendre des parts */}
      {den !== null && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            2. Tape sur les parts que tu prends
          </div>
          <PartitionShape shape={item.shape} parts={den} cells={cells} onToggle={toggle} tone={item.tone} size="md" />
          <p className="text-center text-sm font-mono text-slate-500">
            {cells.length} part{cells.length > 1 ? 's' : ''} prise{cells.length > 1 ? 's' : ''} sur {den}
          </p>
        </motion.div>
      )}

      {checkedDen && !denOk && (
        <Feedback tone="hint">Essaie un autre nombre de parts égales — regarde bien l'objectif ci-dessous.</Feedback>
      )}

      {!solved && (
        <div className="text-center">
          <ValidateButton
            onClick={() => onSolved?.()}
            disabled={!denOk || !numOk}
          >
            Valider ma fraction
          </ValidateButton>
        </div>
      )}

      {solved && (
        <Feedback tone="ok">
          <MathText>{`$${texFrac(item.num, item.den)}$`}</MathText> : {item.num} part{item.num > 1 ? 's' : ''}{' '}
          prise{item.num > 1 ? 's' : ''} sur {item.den} parts égales.
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 3 : pourquoi des parts égales ? ──────────────────────── */
const EQUAL_CASES = [
  {
    id: 'a',
    weights: null, // parts égales
    shaded: 1,
    parts: 4,
    valid: true,
  },
  {
    id: 'b',
    weights: [1, 1, 1, 5],
    shaded: 1,
    parts: 4,
    valid: false,
  },
  {
    id: 'c',
    weights: [2, 1, 1, 2],
    shaded: 2,
    parts: 4,
    valid: false,
  },
];

function EqualPartsQuiz({ solved, onSolved }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  const allAnswered = Object.keys(answers).length === EQUAL_CASES.length;
  const allRight = EQUAL_CASES.every((c, i) => answers[i] === c.valid);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Sur chaque figure, une partie est coloriée. Peut-on dire qu'elle représente{' '}
        <MathText>{'$\\frac{1}{4}$'}</MathText> (ou <MathText>{'$\\frac{2}{4}$'}</MathText> pour la dernière) ?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {EQUAL_CASES.map((c, i) => {
          const given = answers[i];
          const isRight = checked && given === c.valid;
          const isWrong = checked && given !== undefined && given !== c.valid;

          return (
            <div
              key={c.id}
              className={`rounded-2xl border-2 p-3 space-y-2 ${
                isRight ? 'border-emerald-300 bg-emerald-50' : isWrong ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'
              }`}
            >
              <PartitionShape
                shape="bar"
                parts={c.parts}
                weights={c.weights}
                shaded={c.shaded}
                tone={c.valid ? 'emerald' : 'rose'}
                size="sm"
              />
              <div className="flex gap-1.5">
                {[
                  { val: true, label: 'Valide', Icon: Check },
                  { val: false, label: 'Non valide', Icon: X },
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
                    className={`flex-1 px-2 py-2 rounded-lg border-2 font-mono text-[11px] font-bold transition-all min-h-[36px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
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
          );
        })}
      </div>

      {!solved && (
        <div className="text-center">
          <ValidateButton
            onClick={() => {
              setChecked(true);
              if (allRight) onSolved?.();
            }}
            disabled={!allAnswered}
          >
            Vérifier mes réponses
          </ValidateButton>
        </div>
      )}

      {checked && !allRight && (
        <Feedback tone="ko">
          Regarde bien la TAILLE des parts, pas seulement leur nombre : {EQUAL_CASES.length} figures ont 4 parts,
          mais toutes ne sont pas coupées également.
        </Feedback>
      )}

      {solved && (
        <Feedback tone="ok">
          Seule la figure A a des parts <strong>de même taille</strong> : c'est la seule où l'on peut dire
          « 1/4 ». Une fraction décrivant une part d'un tout exige des <strong>parts égales</strong> — sinon le
          nombre de parts ne veut plus rien dire.
        </Feedback>
      )}
    </div>
  );
}

export default function Module02Construire() {
  const navLinks = getNavLinks(2);
  const [done, setDone] = useState([]);
  const [equalDone, setEqualDone] = useState(false);

  const s1 = done.length === CONSTRUCTIONS.length;
  const s2 = equalDone;
  const allDone = s1 && s2;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Construire une fraction"
      moduleSubtitle="Partage une unité, prends des parts, observe la fraction apparaître."
      moduleNumber={2}
      estimatedTime="10 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="🧱 Atelier" title="Une fraction se construit en deux temps.">
          <p>
            D'abord tu choisis en combien de parts égales tu coupes l'unité. Ensuite tu prends un certain nombre
            de ces parts. La fraction n'apparaît qu'à la fin — comme conclusion de ton geste.
          </p>
        </MissionBrief>

        {/* Étape 1 */}
        <StepCard num={1} title="Construis quatre fractions" done={s1}>
          <div className="space-y-8">
            {CONSTRUCTIONS.map((item, i) =>
              i === 0 || done.includes(i - 1) ? (
                <div key={`${item.den}-${item.num}`} className="space-y-3 border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                  <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Construction {i + 1} / {CONSTRUCTIONS.length} — objectif :{' '}
                    <span className="text-slate-600">
                      prends {item.num} part{item.num > 1 ? 's' : ''} sur {item.den}
                    </span>
                  </div>
                  <Construction
                    item={item}
                    solved={done.includes(i)}
                    onSolved={() => setDone((d) => (d.includes(i) ? d : [...d, i]))}
                  />
                </div>
              ) : null
            )}
          </div>
        </StepCard>

        {/* Étape 2 */}
        <StepCard
          num={2}
          title="Un piège à éviter : les parts doivent être égales"
          subtitle="Trois figures, une seule respecte vraiment la règle."
          done={s2}
          locked={!s1}
        >
          <EqualPartsQuiz solved={equalDone} onSolved={() => setEqualDone(true)} />
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
