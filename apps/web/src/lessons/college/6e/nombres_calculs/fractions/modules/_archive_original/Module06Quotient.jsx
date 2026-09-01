import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PartitionShape from '../components/PartitionShape';

/* ─── Étape 1 : 3 pizzas pour 4 personnes ────────────────────────── */
function PartageQuotient({ solved, onSolved }) {
  const [picks, setPicks] = useState([null, null, null]);
  const allPicked = picks.every((p) => p !== null);

  const toggle = (pizzaIdx, cellIdx) => {
    if (solved) return;
    setPicks((prev) => {
      const next = [...prev];
      next[pizzaIdx] = next[pizzaIdx] === cellIdx ? null : cellIdx;
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        3 pizzas identiques sont partagées équitablement entre 4 personnes. Chaque pizza est déjà coupée en 4
        parts. Sur <strong>chacune des 3 pizzas</strong>, tape la part qui te revient.
      </p>

      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((p) => (
          <div key={p} className="space-y-1.5">
            <div className="text-[10px] font-mono text-slate-400 text-center uppercase">Pizza {p + 1}</div>
            <PartitionShape
              shape="circle"
              parts={4}
              cells={picks[p] === null ? [] : [picks[p]]}
              onToggle={(i) => toggle(p, i)}
              tone="rose"
              size="sm"
            />
          </div>
        ))}
      </div>

      <p className="text-center text-sm font-mono text-slate-500">
        {picks.filter((p) => p !== null).length} / 3 parts prises (une par pizza)
      </p>

      {!solved && (
        <div className="text-center">
          <ValidateButton onClick={() => allPicked && onSolved?.()} disabled={!allPicked} tone="amber">
            Valider ma part
          </ValidateButton>
        </div>
      )}

      {solved && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <Feedback tone="ok">
            Tu as reçu 1 part sur chacune des 3 pizzas : au total,{' '}
            <strong>3 quarts de pizza</strong>, soit <MathText>{'$\\frac{3}{4}$'}</MathText> de pizza.
          </Feedback>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
              Partager 3 pizzas entre 4 personnes
            </div>
            <div className="text-3xl font-mono font-extrabold text-amber-300">
              <MathText>{'$3 \\div 4 = \\frac{3}{4}$'}</MathText>
            </div>
            <p className="text-xs text-slate-400 pt-1">
              Une fraction, c'est aussi le résultat d'un partage : le numérateur compte ce qu'on partage, le
              dénominateur compte entre combien de personnes.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Étape 2 : le motif se répète ───────────────────────────────── */
const MOTIFS = [
  { a: 1, b: 2, tone: 'sky' },
  { a: 1, b: 3, tone: 'violet' },
  { a: 2, b: 3, tone: 'emerald' },
];

const MOTIF_Q = {
  q: 'En suivant le même principe, que vaut 2 ÷ 3 ?',
  options: ['2/3', '3/2', '1/3', '5'],
  correct: 0,
  explain: 'Partager 2 objets identiques entre 3 personnes : chacune reçoit 2/3. Donc 2 ÷ 3 = 2/3.',
};

function MotifRepete({ solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MOTIFS.map((m) => (
          <div key={`${m.a}-${m.b}`} className="border-2 border-slate-200 rounded-2xl p-3 bg-white flex items-center gap-3">
            <PartitionShape shape="bar" parts={m.b} shaded={m.a} tone={m.tone} size="sm" />
            <div className="text-lg shrink-0">
              <MathText>{`$${m.a} \\div ${m.b} = \\frac{${m.a}}{${m.b}}$`}</MathText>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm font-semibold text-slate-700">{MOTIF_Q.q}</p>
      <ChoiceGrid
        options={MOTIF_Q.options}
        selected={pick}
        onSelect={setPick}
        revealed={revealed}
        correctIndex={MOTIF_Q.correct}
        cols={4}
        renderOption={(o) => {
          if (!o.includes('/')) return o;
          const [n, d] = o.split('/');
          return <MathText>{`$\\frac{${n}}{${d}}$`}</MathText>;
        }}
      />
      {!revealed && (
        <div className="text-center">
          <ValidateButton
            onClick={() => {
              setRevealed(true);
              if (pick === MOTIF_Q.correct) onSolved?.();
            }}
            disabled={pick === null}
          >
            Valider
          </ValidateButton>
        </div>
      )}
      {revealed && (
        <Feedback tone={pick === MOTIF_Q.correct ? 'ok' : 'ko'}>
          {MOTIF_Q.explain}
          {pick !== MOTIF_Q.correct && (
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
      )}
    </div>
  );
}

/* ─── Étape 3 : partage ou regroupement ? ────────────────────────── */
const SITUATIONS = [
  {
    text: '12 crayons partagés équitablement entre 3 élèves : combien chacun reçoit-il ?',
    options: ['Partage (on distribue équitablement)', 'Regroupement (on compte des paquets)'],
    correct: 0,
    explain: 'On distribue 12 crayons ENTRE 3 personnes : chacune reçoit 4 crayons. C\'est un partage.',
  },
  {
    text: '12 crayons rangés par paquets de 3 : combien de paquets peut-on former ?',
    options: ['Partage (on distribue équitablement)', 'Regroupement (on compte des paquets)'],
    correct: 1,
    explain: 'On ne distribue à personne : on compte combien de paquets de 3 tiennent dans 12. C\'est un regroupement (12 ÷ 3 = 4 paquets).',
  },
];

function PartageOuRegroupement({ solved, onSolved }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const allAnswered = Object.keys(answers).length === SITUATIONS.length;
  const allRight = SITUATIONS.every((s, i) => answers[i] === s.correct);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Le signe ÷ cache deux situations différentes. Identifie laquelle est en jeu ici.
      </p>
      {SITUATIONS.map((s, i) => (
        <div key={s.text} className="space-y-2 border-t border-slate-100 pt-4 first:border-0 first:pt-0">
          <p className="text-sm font-semibold text-slate-700">{s.text}</p>
          <ChoiceGrid
            options={s.options}
            selected={answers[i] ?? null}
            onSelect={(idx) => {
              setChecked(false);
              setAnswers((a) => ({ ...a, [i]: idx }));
            }}
            revealed={checked}
            correctIndex={s.correct}
            cols={1}
          />
          {checked && <p className="text-xs text-slate-500">{s.explain}</p>}
        </div>
      ))}

      {!solved && (
        <div className="text-center">
          <ValidateButton
            onClick={() => {
              setChecked(true);
              if (allRight) onSolved?.();
            }}
            disabled={!allAnswered}
          >
            Vérifier
          </ValidateButton>
        </div>
      )}

      {solved && (
        <Feedback tone="info">
          Une fraction apparaît quand un <strong>partage</strong> ne tombe pas juste : 12 crayons entre 3 élèves
          donne 4 (entier), mais 3 pizzas entre 4 personnes donne 3/4 (fraction). Le regroupement, lui, ne produit
          jamais de fraction : on compte des paquets entiers.
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 4 : erreur à corriger ─────────────────────────────────── */
const ERREUR = {
  claim: '« 3/4 veut dire que je divise 3 objets en 4 groupes. »',
  options: [
    "C'est correct : diviser en groupes et partager, c'est pareil.",
    "C'est inexact : 3/4 vient du partage de 3 TOUT ENTIERS (3 pizzas) entre 4 personnes — on ne divise pas « 3 objets », on partage une quantité de 3 unités.",
  ],
  correct: 1,
  explain:
    "La nuance compte : on ne coupe pas « le nombre 3 » en 4 morceaux. On partage 3 unités identiques (3 pizzas entières) entre 4 personnes, et chaque personne reçoit 3/4 d'une pizza. Le résultat du partage EST la fraction — ce n'est pas un regroupement de 3 objets.",
};

function ErreurQuotient({ solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-4 border-2 border-amber-200 bg-amber-50/50 rounded-2xl p-4">
      <div className="text-[11px] font-mono font-bold text-amber-600 uppercase tracking-wider">
        Raisonnement d'élève à examiner
      </div>
      <p className="text-base font-semibold text-slate-800 italic">{ERREUR.claim}</p>
      <ChoiceGrid options={ERREUR.options} selected={pick} onSelect={setPick} revealed={revealed} correctIndex={ERREUR.correct} cols={1} />
      {!revealed && (
        <div className="text-center">
          <ValidateButton
            onClick={() => {
              setRevealed(true);
              if (pick === ERREUR.correct) onSolved?.();
            }}
            disabled={pick === null}
            tone="amber"
          >
            Valider
          </ValidateButton>
        </div>
      )}
      {revealed && (
        <Feedback tone={pick === ERREUR.correct ? 'ok' : 'ko'}>
          {ERREUR.explain}
          {pick !== ERREUR.correct && (
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
      )}
    </div>
  );
}

export default function Module06Quotient() {
  const navLinks = getNavLinks(6);
  const [s1done, setS1Done] = useState(false);
  const [s2done, setS2Done] = useState(false);
  const [s3done, setS3Done] = useState(false);
  const [s4done, setS4Done] = useState(false);

  const allDone = s1done && s2done && s3done && s4done;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Fraction et quotient"
      moduleSubtitle="3 pizzas, 4 personnes : pourquoi le partage lui-même produit une fraction."
      moduleNumber={6}
      estimatedTime="10 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="🍕 Partage" title="Une fraction peut être le RÉSULTAT d'un partage.">
          <Users className="w-5 h-5 text-amber-300 inline mr-1" aria-hidden="true" />
          <p className="inline">
            Tu connais déjà la division. Tu vas découvrir que, quand le partage ne tombe pas juste, son résultat
            est justement... une fraction.
          </p>
        </MissionBrief>

        <StepCard num={1} title="3 pizzas pour 4 personnes" done={s1done}>
          <PartageQuotient solved={s1done} onSolved={() => setS1Done(true)} />
        </StepCard>

        <StepCard num={2} title="Le même motif se répète" done={s2done} locked={!s1done}>
          <MotifRepete solved={s2done} onSolved={() => setS2Done(true)} />
        </StepCard>

        <StepCard num={3} title="Partage ou regroupement ?" done={s3done} locked={!s2done}>
          <PartageOuRegroupement solved={s3done} onSolved={() => setS3Done(true)} />
        </StepCard>

        <StepCard num={4} title="Corrige le raisonnement" done={s4done} locked={!s3done}>
          <ErreurQuotient solved={s4done} onSolved={() => setS4Done(true)} />
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
