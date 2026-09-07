import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MousePointerClick } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PlaceValueTable from '../components/PlaceValueTable';
import { Feedback, ChoiceGrid, XPBurst } from '../../../../../common/components/LessonUI';
import { formatFr, PLACE_SINGULAR } from '../components/numberUtils';

/**
 * Module 4 V2 — reconstruit sur le lesson kit. La chasse au chiffre (clic
 * dans le tableau de numération) et le quiz séquentiel 5 555 restent des
 * interactions maison ; les QCM passent en TapQuestion.
 */

const GRAND = 4582307;

const PLACE_VALUE = { M: 1000000, CM: 100000, DM: 10000, UM: 1000, C: 100, D: 10, U: 1 };

const CHASSES = [
  {
    digit: 8,
    key: 'DM',
    place: 'dizaines de milliers',
    options: ['8', '80', '8 000', '80 000'],
    correct: 3,
    explain:
      "Le 8 est à la position des dizaines de milliers. Il représente donc 8 dizaines de milliers, c'est-à-dire 80 000 — et non « 8 ».",
  },
  {
    digit: 3,
    key: 'C',
    place: 'centaines',
    options: ['3', '30', '300', '3 000'],
    correct: 2,
    explain: 'Le 3 est à la position des centaines : il représente 3 centaines, soit 300.',
  },
  {
    digit: 5,
    key: 'CM',
    place: 'centaines de milliers',
    options: ['5 000', '50 000', '500 000', '5 000 000'],
    correct: 2,
    explain:
      'Le 5 est à la position des centaines de milliers : il représente 5 centaines de milliers, soit 500 000.',
  },
];

function DigitHunt({ chasse, solved, onSolved }) {
  const [clicked, setClicked] = useState(null);

  const located = clicked === chasse.key;

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 sm:p-4">
        <PlaceValueTable
          value={GRAND}
          selectedKey={clicked}
          // RÈGLE PROJET (2026-09-06) : le tableau reste cliquable après la
          // validation — c'est là que l'élève va vérifier les autres colonnes.
          onDigitClick={(cell) => setClicked(cell.key)}
        />
      </div>

      {!clicked && (
        <div className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <MousePointerClick className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" aria-hidden="true" />
          <span>
            Clique sur le chiffre <strong className="font-mono text-base">{chasse.digit}</strong> dans le tableau.
          </span>
        </div>
      )}

      {clicked && !located && (
        <Feedback tone="hint">
          Ce n'est pas le bon chiffre : tu as sélectionné un{' '}
          <strong className="font-mono">{Math.floor(GRAND / (PLACE_VALUE[clicked] || 1)) % 10}</strong>. Le chiffre{' '}
          <strong className="font-mono">{chasse.digit}</strong> demandé est à la position des {chasse.place} —
          clique dessus, ou continue directement avec la question ci-dessous.
        </Feedback>
      )}

      {clicked && (
        <TapQuestion
          prompt={
            <>
              Que représente le chiffre <span className="font-mono text-base">{chasse.digit}</span> dans{' '}
              <span className="font-mono">{formatFr(GRAND)}</span> ?
            </>
          }
          options={chasse.options}
          correct={chasse.correct}
          cols={2}
          explain={chasse.explain}
          solved={solved}
          onAnswered={() => onSolved?.()}
        />
      )}
    </div>
  );
}

const CINQS = [
  { key: 'UM', label: 'milliers', options: ['5', '50', '500', '5 000'], correct: 3, value: 5000 },
  { key: 'C', label: 'centaines', options: ['5', '50', '500', '5 000'], correct: 2, value: 500 },
  { key: 'D', label: 'dizaines', options: ['5', '50', '500', '5 000'], correct: 1, value: 50 },
  { key: 'U', label: 'unités', options: ['5', '50', '500', '5 000'], correct: 0, value: 5 },
];

function CinqCinqCinqCinq({ done, onStepDone, react }) {
  const [idx, setIdx] = useState(0);
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [burst, setBurst] = useState(0);
  const current = CINQS[idx];
  const finished = done.length === CINQS.length;

  const validate = (i) => {
    setPick(i);
    setRevealed(true);
    const isCorrect = i === current.correct;
    const id = react(isCorrect);
    if (isCorrect) setBurst(id);
    onStepDone(idx);
    setTimeout(() => {
      if (idx < CINQS.length - 1) {
        setIdx((i2) => i2 + 1);
        setPick(null);
        setRevealed(false);
      }
    }, 1400);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 sm:p-4">
        <PlaceValueTable
          value={5555}
          highlightKeys={finished ? [] : [current.key]}
          showValues={finished}
        />
      </div>

      {!finished ? (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            {CINQS.map((c, i) => (
              <span
                key={c.key}
                className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full ${
                  done.includes(i)
                    ? 'bg-emerald-100 text-emerald-700'
                    : i === idx
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {done.includes(i) ? '✓ ' : ''}
                {c.label}
              </span>
            ))}
          </div>

          <p className="text-sm font-semibold text-slate-700">
            Le 5 surligné est à la position des <strong>{current.label}</strong>. Que représente-t-il ?
          </p>
          <div className="relative">
            <ChoiceGrid
              options={current.options}
              selected={pick}
              onSelect={validate}
              revealed={revealed}
              correctIndex={current.correct}
              cols={2}
            />
            <XPBurst amount={10} tick={burst} />
          </div>
          {revealed && (
            <Feedback tone={pick === current.correct ? 'ok' : 'ko'}>
              {pick === current.correct ? (
                <>
                  Oui : ce 5 vaut <strong className="font-mono">{formatFr(current.value)}</strong> car il occupe
                  la position des {current.label}.
                </>
              ) : (
                <>
                  Regarde la colonne surlignée : c'est celle des {current.label}. Un 5 placé là vaut{' '}
                  <strong className="font-mono">{formatFr(current.value)}</strong>, soit 5{' '}
                  {PLACE_SINGULAR[current.key]}s.
                </>
              )}
            </Feedback>
          )}
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <div className="font-mono text-4xl font-extrabold tabular-nums">5 555</div>
            <div className="text-slate-400">=</div>
            <div className="font-mono text-xl font-bold text-amber-300">5 000 + 500 + 50 + 5</div>
          </div>
          <div className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-2xl p-5 text-center">
            <div className="text-xs font-mono uppercase tracking-widest text-violet-200 mb-1">
              À retenir absolument
            </div>
            <div className="text-lg sm:text-xl font-space font-extrabold">
              Le chiffre n'est pas la valeur.
            </div>
            <p className="text-sm text-violet-100 mt-1">
              Quatre fois le même chiffre 5, quatre valeurs différentes. C'est la <strong>position</strong> qui
              décide.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

const DISTINCTION = [
  {
    q: 'Quel est le CHIFFRE des milliers de 12 450 ?',
    options: ['1', '2', '12', '450'],
    correct: 1,
    explain:
      "Le chiffre des milliers est celui qui occupe la colonne des milliers : c'est le 2. Un chiffre, c'est toujours un seul symbole entre 0 et 9.",
  },
  {
    q: 'Combien y a-t-il de milliers dans 12 450 ?',
    options: ['2', '12', '450', '12 450'],
    correct: 1,
    explain:
      "Il y a 12 milliers complets dans 12 450 (12 000), plus 450 en plus. Le NOMBRE de milliers compte tous les milliers du nombre, pas seulement le chiffre de la colonne.",
  },
];

export default function Module04ValeurPosition() {
  const [chassesDone, setChassesDone] = useState([]);
  const [cinqsDone, setCinqsDone] = useState([]);
  const [distDone, setDistDone] = useState([]);

  const s1 = chassesDone.length === CHASSES.length;
  const s2 = cinqsDone.length === CINQS.length;
  const s3 = distDone.length === DISTINCTION.length;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="La valeur de chaque chiffre"
      moduleSubtitle="Le même chiffre peut valoir 5, 50, 500 ou 5 000. Sa position décide de tout."
      estimatedTime="12 min"
      brief={{
        tag: '🎯 Cœur de la leçon',
        title: 'Un chiffre seul ne dit rien. Un chiffre placé dit tout.',
        tone: 'indigo',
        body: (
          <p>
            Dans ce module, tu vas manipuler le <strong>tableau de numération</strong> pour découvrir ce que
            représente vraiment chaque chiffre d'un grand nombre.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: `Chasse au chiffre dans ${formatFr(GRAND)}`,
          subtitle: "Localise le chiffre demandé, puis dis ce qu'il représente.",
          done: s1,
          content: (
            <div className="space-y-8">
              {CHASSES.map((chasse, i) =>
                i === 0 || chassesDone.includes(i - 1) ? (
                  <div key={chasse.digit} className="space-y-3">
                    <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Chasse {i + 1} / {CHASSES.length}
                    </div>
                    <DigitHunt
                      chasse={chasse}
                      solved={chassesDone.includes(i)}
                      onSolved={() => setChassesDone((d) => (d.includes(i) ? d : [...d, i]))}
                    />
                  </div>
                ) : null
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le nombre 5 555 : quatre chiffres identiques',
          subtitle: 'Quatre fois le chiffre 5 — mais représentent-ils la même chose ?',
          done: s2,
          content: (kit) => (
            <div className="space-y-5">
              <CinqCinqCinqCinq
                done={cinqsDone}
                onStepDone={(i) => setCinqsDone((d) => (d.includes(i) ? d : [...d, i]))}
                react={kit.react}
              />
              {/* Quatre 5, quatre valeurs : le constat vient d'être fait
                  colonne après colonne. C'est ici qu'on le nomme. */}
              {s2 && (
                <>
                  <KnowledgeBrick
                    id="valeur-position"
                    variant="new"
                    lead="Tu viens de donner quatre réponses différentes pour un seul et même chiffre."
                  />
                  <KnowledgeBrick id="mem-position-decide" variant="new" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Attention au piège : chiffre des milliers ≠ nombre de milliers',
          subtitle: 'Deux questions qui se ressemblent, deux réponses différentes.',
          done: s3,
          content: (
            <div className="space-y-4">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 sm:p-4">
                <PlaceValueTable value={12450} showValues />
              </div>
              {/* Deux questions vont se ressembler à un mot près : la
                  distinction doit être posée AVANT, jamais dans l'explain. */}
              <KnowledgeBrick
                id="chiffre-vs-nombre"
                variant="new"
                lead="Regarde la colonne des milliers du tableau, puis le nombre entier : ce ne sont pas les mêmes 12."
              />
              {DISTINCTION.map((d, i) => (
                <div key={d.q} className="border-t border-slate-100 pt-4">
                  <TapQuestion
                    prompt={d.q}
                    options={d.options}
                    correct={d.correct}
                    cols={2}
                    requires={['valeur-position', 'chiffre-vs-nombre']}
                    explain={d.explain}
                    solved={distDone.includes(i)}
                    onAnswered={() => setDistDone((prev) => (prev.includes(i) ? prev : [...prev, i]))}
                  />
                </div>
              ))}
              {s3 && (
                <Feedback tone="info">
                  Cette distinction reviendra dans les problèmes du module 10 : elle est sur ta carte.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> Tu sais ce que vaut chaque chiffre. Au module suivant, tu
          démontes le nombre en morceaux — puis tu le remontes.
        </KnowledgeSnapshot>
      }
    />
  );
}
