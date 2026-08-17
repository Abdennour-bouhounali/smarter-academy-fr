import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import NumberLine from '../../../../../common/components/NumberLine';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, NumberField } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { formatDec, parseDec, decEquals } from '../components/decimalUtils';

/* ─── Étape 1 & 2 : de quel entier est-on le plus proche ? ───────── */
const ARRONDIS = [
  {
    value: 1.98,
    context: '🧴 Une bouteille contient 1,98 L',
    explain:
      "1,98 est à seulement 0,02 de 2, mais à 0,98 de 1. Il est donc bien plus proche de 2 : on dit que 1,98 L, c'est « presque 2 litres ».",
  },
  {
    value: 5.82,
    context: '📏 Une planche mesure 5,82 m',
    explain: '5,82 dépasse la moitié de l\'intervalle (5,5) : il est plus proche de 6 que de 5.',
  },
  {
    value: 3.4,
    context: '⚖️ Un colis pèse 3,4 kg',
    explain: "3,4 n'atteint pas la moitié de l'intervalle (3,5) : il reste plus proche de 3.",
  },
  {
    value: 12.05,
    context: '⏱️ Une course a duré 12,05 minutes',
    explain: '12,05 est tout près de 12 : seulement 5 centièmes au-dessus.',
  },
];

function ArrondiItem({ item, index, total, solved, onSolved }) {
  const low = Math.floor(item.value);
  const high = low + 1;
  const correct = Math.round(item.value) === low ? 0 : 1;
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-3 border-t border-slate-100 pt-5 first:border-0 first:pt-0">
      <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
        Situation {index + 1} / {total}
      </div>
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-800">{item.context}</p>
        <NumberLine
          min={low}
          max={high}
          step={0.1}
          labelEvery={5}
          height={150}
          format={(v) => formatDec(v)}
          markers={[{ value: item.value, label: formatDec(item.value), color: '#7c3aed' }]}
          ariaLabel={`${formatDec(item.value)} placé entre ${low} et ${high}`}
        />
      </div>

      <p className="text-sm font-semibold text-slate-700">
        De quel nombre entier {formatDec(item.value)} est-il le plus proche ?
      </p>
      <ChoiceGrid
        options={[String(low), String(high)]}
        selected={pick}
        onSelect={setPick}
        revealed={revealed}
        correctIndex={correct}
        cols={2}
      />
      {!revealed && (
        <ValidateButton
          onClick={() => {
            setRevealed(true);
            if (pick === correct) onSolved?.();
          }}
          disabled={pick === null}
        >
          Valider
        </ValidateButton>
      )}
      {revealed && (
        <Feedback tone={pick === correct ? 'ok' : 'ko'}>
          {item.explain}
          {!solved && pick !== correct && (
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

/* ─── Étape 3 : estimer puis calculer ────────────────────────────── */
const ESTIMATIONS = [
  {
    calcul: '19,8 + 5,1',
    estimation: 25,
    exact: 24.9,
    estimOptions: ['15', '25', '70', '250'],
    estimCorrect: 1,
    explainEstim: '19,8 est presque 20 et 5,1 est presque 5. On attend donc un résultat proche de 20 + 5 = 25.',
    explainExact: "Le résultat exact est 24,9 : très proche de l'estimation 25. L'estimation a bien joué son rôle de vérification.",
  },
  {
    calcul: '4,95 + 3,02',
    estimation: 8,
    exact: 7.97,
    estimOptions: ['5', '8', '12', '80'],
    estimCorrect: 1,
    explainEstim: '4,95 ≈ 5 et 3,02 ≈ 3, donc on attend environ 5 + 3 = 8.',
    explainExact: "Résultat exact : 7,97. L'estimation 8 était excellente.",
  },
];

function EstimationItem({ item, index, total, solved, onSolved }) {
  const [phase, setPhase] = useState(0); // 0 = estimer, 1 = calculer
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [val, setVal] = useState('');
  const [fb, setFb] = useState(null);

  const checkExact = () => {
    const n = parseDec(val);
    if (!Number.isNaN(n) && decEquals(n, item.exact)) {
      setFb('ok');
      onSolved?.();
    } else {
      setFb('ko');
    }
  };

  return (
    <div className="space-y-3 border-t border-slate-100 pt-5 first:border-0 first:pt-0">
      <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
        Calcul {index + 1} / {total}
      </div>
      <div className="bg-slate-900 rounded-xl py-4 text-center">
        <div className="font-mono font-extrabold text-2xl sm:text-3xl text-white tabular-nums">
          {item.calcul} = ?
        </div>
      </div>

      {/* 1. Estimer AVANT de calculer */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          <span className="inline-block px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-mono text-[10px] font-bold mr-2">
            ÉTAPE 1
          </span>
          Sans calculer : quel résultat attends-tu, à peu près ?
        </p>
        <ChoiceGrid
          options={item.estimOptions}
          selected={pick}
          onSelect={setPick}
          revealed={revealed}
          correctIndex={item.estimCorrect}
          cols={4}
        />
        {!revealed && (
          <ValidateButton
            onClick={() => {
              setRevealed(true);
              if (pick === item.estimCorrect) setPhase(1);
            }}
            disabled={pick === null}
          >
            Valider mon estimation
          </ValidateButton>
        )}
        {revealed && (
          <Feedback tone={pick === item.estimCorrect ? 'ok' : 'ko'}>
            {item.explainEstim}
            {pick !== item.estimCorrect && (
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

      {/* 2. Calculer exactement */}
      {phase === 1 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2">
          <p className="text-sm font-semibold text-slate-700">
            <span className="inline-block px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-mono text-[10px] font-bold mr-2">
              ÉTAPE 2
            </span>
            Maintenant, donne le résultat exact.
          </p>
          {solved ? (
            <Feedback tone="ok">
              <strong className="font-mono">{formatDec(item.exact)}</strong> — {item.explainExact}
            </Feedback>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <NumberField
                  value={val}
                  onChange={(v) => {
                    setVal(v);
                    setFb(null);
                  }}
                  onEnter={checkExact}
                  ariaLabel={`Résultat de ${item.calcul}`}
                  width="w-32"
                  size="sm"
                />
                <ValidateButton onClick={checkExact} disabled={!val}>
                  OK
                </ValidateButton>
              </div>
              {fb === 'ko' && (
                <Feedback tone="hint">
                  Aligne les virgules et additionne colonne par colonne. Ton résultat doit rester proche de{' '}
                  <strong>{item.estimation}</strong> — sinon, c'est qu'il y a une erreur.
                </Feedback>
              )}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}

/* ─── Étape 4 : ce résultat est-il raisonnable ? ─────────────────── */
const RAISONNABLE = [
  {
    situation: 'Un élève achète un cahier à 2,50 € et un stylo à 3,75 €. Il annonce : « J\'ai payé 62,50 € ».',
    options: ['Raisonnable', 'Absurde : on attend environ 6 €'],
    correct: 1,
    explain:
      '2,50 € ≈ 2,50 et 3,75 € ≈ 4 : on attend environ 6 €. Un total de 62,50 € est dix fois trop grand — la virgule a sûrement été mal placée. Le vrai total est 6,25 €.',
  },
  {
    situation: 'Une piscine mesure 24,8 m de long. Un élève annonce : « Elle fait environ 25 m ».',
    options: ['Raisonnable', 'Absurde'],
    correct: 0,
    explain: "24,8 est très proche de 25 : l'ordre de grandeur annoncé est parfaitement correct.",
  },
  {
    situation: 'Un sac de farine pèse 1,5 kg. Un élève annonce : « Trois sacs pèsent environ 45 kg ».',
    options: ['Raisonnable', 'Absurde : on attend environ 4,5 kg'],
    correct: 1,
    explain:
      '1,5 kg ≈ 1,5, donc trois sacs pèsent environ 3 × 1,5 = 4,5 kg. Annoncer 45 kg, c\'est dix fois trop : encore une virgule oubliée.',
  },
];

export default function Module09OrdreGrandeur() {
  const navLinks = getNavLinks(9);
  const [arrondis, setArrondis] = useState([]);
  const [estims, setEstims] = useState([]);
  const [raisons, setRaisons] = useState([]);

  const s1 = arrondis.length === ARRONDIS.length;
  const s2 = estims.length === ESTIMATIONS.length;
  const s3 = raisons.length === RAISONNABLE.length;
  const allDone = s1 && s2 && s3;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Ordre de grandeur et estimation"
      moduleSubtitle="Savoir dire « à peu près » avant de calculer — et repérer les résultats absurdes."
      moduleNumber={9}
      estimatedTime="10 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="🎯 Estimation" title="Un bon mathématicien sait d'abord si le résultat est plausible.">
          <p>
            Estimer, ce n'est pas être approximatif : c'est se donner un <strong className="text-white">repère
            </strong> pour vérifier ensuite qu'un résultat exact est cohérent.
          </p>
        </MissionBrief>

        {/* Étape 1 */}
        <StepCard
          num={1}
          title="De quel entier est-on le plus proche ?"
          subtitle="La droite graduée rend la réponse évidente."
          done={s1}
        >
          <div className="space-y-4">
            {ARRONDIS.map((item, i) =>
              i === 0 || arrondis.includes(i - 1) ? (
                <ArrondiItem
                  key={item.value}
                  item={item}
                  index={i}
                  total={ARRONDIS.length}
                  solved={arrondis.includes(i)}
                  onSolved={() => setArrondis((d) => (d.includes(i) ? d : [...d, i]))}
                />
              ) : null
            )}
            {s1 && (
              <Feedback tone="info">
                Le repère utile : la <strong>moitié de l'intervalle</strong>. Au-dessus, on est plus proche de
                l'entier du haut ; en dessous, de celui du bas.
              </Feedback>
            )}
          </div>
        </StepCard>

        {/* Étape 2 */}
        <StepCard
          num={2}
          title="Estimer d'abord, calculer ensuite"
          subtitle="L'estimation sert de garde-fou : si le résultat exact s'en éloigne beaucoup, c'est qu'il y a une erreur."
          done={s2}
          locked={!s1}
        >
          <div className="space-y-4">
            {ESTIMATIONS.map((item, i) =>
              i === 0 || estims.includes(i - 1) ? (
                <EstimationItem
                  key={item.calcul}
                  item={item}
                  index={i}
                  total={ESTIMATIONS.length}
                  solved={estims.includes(i)}
                  onSolved={() => setEstims((d) => (d.includes(i) ? d : [...d, i]))}
                />
              ) : null
            )}
          </div>
        </StepCard>

        {/* Étape 3 */}
        <StepCard
          num={3}
          title="Ce résultat est-il raisonnable ?"
          subtitle="Trois annonces d'élèves. À toi de jouer au détective."
          done={s3}
          locked={!s2}
        >
          <div className="space-y-4">
            {RAISONNABLE.map((item, i) => (
              <RaisonnableItem
                key={item.situation}
                item={item}
                solved={raisons.includes(i)}
                onSolved={() => setRaisons((d) => (d.includes(i) ? d : [...d, i]))}
              />
            ))}
            {s3 && (
              <Feedback tone="info">
                Retiens ce réflexe : <strong>j'estime, je calcule, je compare</strong>. Une virgule mal placée se
                repère immédiatement quand on connaît l'ordre de grandeur attendu.
              </Feedback>
            )}
          </div>
        </StepCard>
      </div>
    </ModuleLayout>
  );
}

/* ─── Détecteur de résultat absurde ──────────────────────────────── */
function RaisonnableItem({ item, solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="border-2 border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
      <div className="flex items-start gap-2">
        <Scale className="w-4 h-4 mt-0.5 shrink-0 text-purple-500" aria-hidden="true" />
        <p className="text-sm text-slate-800">{item.situation}</p>
      </div>
      <ChoiceGrid
        options={item.options}
        selected={pick}
        onSelect={setPick}
        revealed={revealed}
        correctIndex={item.correct}
        cols={2}
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
        <Feedback tone={pick === item.correct ? 'ok' : 'ko'}>
          {item.explain}
          {!solved && pick !== item.correct && (
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
