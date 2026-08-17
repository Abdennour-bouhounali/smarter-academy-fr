import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, QuantityCard } from '../../../../../common/components/LessonUI';
import { formatFr, spellFr } from '../components/numberUtils';

/* ─── Étape 1 : six quantités réelles ────────────────────────────── */
const CARTES = [
  { id: 'ville', emoji: '🏙️', label: "Habitants d'une ville", value: 105300, unit: 'habitants' },
  { id: 'lune', emoji: '🌙', label: 'Distance Terre – Lune', value: 384400, unit: 'km' },
  { id: 'stade', emoji: '🏟️', label: 'Spectateurs du stade', value: 67500, unit: 'places' },
  { id: 'biblio', emoji: '📚', label: 'Livres de la bibliothèque', value: 12450, unit: 'livres' },
  { id: 'voiture', emoji: '🚗', label: "Prix d'une voiture", value: 18700, unit: '€' },
  { id: 'musee', emoji: '🏛️', label: 'Visiteurs du musée en un an', value: 305000, unit: 'visiteurs' },
];

const PLUS_GRAND = 'lune';

/* ─── Étape 2 : estimer avant de lire ────────────────────────────── */
const ESTIMATIONS = [
  {
    situation: "Le nombre d'élèves d'un collège",
    emoji: '🎒',
    options: ['65', '650', '65 000'],
    correct: 1,
    explain:
      "Un collège accueille quelques centaines d'élèves : environ 650. 65 serait une seule classe, et 65 000 dépasse la population de beaucoup de villes.",
  },
  {
    situation: "Le nombre d'habitants d'une grande ville",
    emoji: '🏙️',
    options: ['5 000', '50 000', '500 000'],
    correct: 2,
    explain:
      "Une grande ville compte des centaines de milliers d'habitants : de l'ordre de 500 000. 5 000 correspondrait à un village.",
  },
  {
    situation: "Le nombre de pages d'un roman",
    emoji: '📖',
    options: ['3', '350', '35 000'],
    correct: 1,
    explain: "Un roman fait quelques centaines de pages : de l'ordre de 350.",
  },
];

/* ─── Étape 3 : le nombre manquant ───────────────────────────────── */
const MANQUANT = {
  low: 2450,
  high: 18700,
  options: [1200, 9875, 25000, 18700],
  correct: 1,
  explain:
    "Il faut un nombre strictement compris entre 2 450 et 18 700. 1 200 est trop petit, 25 000 est trop grand, et 18 700 est déjà pris par le troisième village. Seul 9 875 convient.",
};

export default function Module09MondeReel() {
  const navLinks = getNavLinks(9);
  const [pickCarte, setPickCarte] = useState(null);
  const [carteRevealed, setCarteRevealed] = useState(false);
  const [estimDone, setEstimDone] = useState([]);
  const [manqPick, setManqPick] = useState(null);
  const [manqRevealed, setManqRevealed] = useState(false);

  const s1 = carteRevealed && pickCarte === PLUS_GRAND;
  const s2 = estimDone.length === ESTIMATIONS.length;
  const s3 = manqRevealed && manqPick === MANQUANT.correct;
  const allDone = s1 && s2 && s3;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Les nombres dans le monde réel"
      moduleSubtitle="Habitants, distances, spectateurs : à quoi sert vraiment de savoir lire un grand nombre ?"
      moduleNumber={9}
      estimatedTime="8 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="🌍 Contexte" title="Les grands nombres racontent le monde.">
          <p>
            Une population, une distance, un prix, un nombre de visiteurs : dans chaque cas, le nombre porte une
            information. Savoir le lire, c'est comprendre de quoi on parle.
          </p>
        </MissionBrief>

        {/* Étape 1 */}
        <StepCard num={1} title="Quel nombre représente la plus grande quantité ?" done={s1}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CARTES.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <QuantityCard
                    emoji={c.emoji}
                    label={c.label}
                    value={formatFr(c.value)}
                    unit={c.unit}
                    selected={pickCarte === c.id}
                    disabled={carteRevealed && s1}
                    onClick={() => {
                      if (s1) return;
                      setPickCarte(c.id);
                      setCarteRevealed(false);
                    }}
                    footer={
                      s1 ? (
                        <span className="font-mono">
                          {String(c.value).length} chiffres — {spellFr(c.value)}
                        </span>
                      ) : null
                    }
                  />
                </motion.div>
              ))}
            </div>

            {!s1 && (
              <ValidateButton onClick={() => setCarteRevealed(true)} disabled={!pickCarte}>
                Valider ma réponse
              </ValidateButton>
            )}

            {carteRevealed && (
              <Feedback tone={s1 ? 'ok' : 'ko'}>
                {s1 ? (
                  <>
                    Exact : la distance Terre – Lune, <strong className="font-mono">384 400 km</strong>, est la
                    plus grande quantité. Avec 105 300 et 305 000, elle fait partie des trois nombres à 6
                    chiffres. Face à 305 000, les centaines de milliers sont égales (3 = 3) : tout se joue aux
                    dizaines de milliers, <strong className="font-mono">8 contre 0</strong>.
                  </>
                ) : (
                  <>
                    Pas encore. Commence par repérer les nombres qui ont <strong>le plus de chiffres</strong> :
                    105 300, 384 400 et 305 000 en ont 6. Ensuite, compare-les position par position.
                  </>
                )}
              </Feedback>
            )}
          </div>
        </StepCard>

        {/* Étape 2 */}
        <StepCard
          num={2}
          title="Estime avant de lire la valeur exacte"
          subtitle="Dans la vie, on a souvent besoin d'un ordre de grandeur plutôt que du nombre exact."
          done={s2}
          locked={!s1}
        >
          <div className="space-y-5">
            {ESTIMATIONS.map((e, i) => (
              <EstimationItem
                key={e.situation}
                item={e}
                solved={estimDone.includes(i)}
                onSolved={() => setEstimDone((d) => (d.includes(i) ? d : [...d, i]))}
              />
            ))}
            {s2 && (
              <Feedback tone="info">
                Estimer, c'est choisir le bon <strong>ordre de grandeur</strong> : des dizaines, des centaines,
                des milliers ou des centaines de milliers. C'est exactement ce que t'indique le nombre de
                chiffres.
              </Feedback>
            )}
          </div>
        </StepCard>

        {/* Étape 3 */}
        <StepCard num={3} title="Quel nombre manque ?" done={s3} locked={!s2}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Trois villages sont classés du moins peuplé au plus peuplé. Le tableau du milieu a été effacé.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Village A', value: formatFr(MANQUANT.low) },
                { label: 'Village B', value: s3 ? formatFr(MANQUANT.options[MANQUANT.correct]) : '?' },
                { label: 'Village C', value: formatFr(MANQUANT.high) },
              ].map((v) => (
                <div
                  key={v.label}
                  className={`rounded-2xl border-2 p-3 text-center ${
                    v.value === '?' ? 'border-dashed border-amber-400 bg-amber-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="text-[10px] font-mono text-slate-500 uppercase">{v.label}</div>
                  <div className="font-mono font-extrabold text-base sm:text-xl text-slate-800 tabular-nums">
                    {v.value}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">habitants</div>
                </div>
              ))}
            </div>

            <p className="text-sm font-semibold text-slate-700">
              Quel nombre peut convenir pour le village B ?
            </p>
            <ChoiceGrid
              options={MANQUANT.options.map((o) => formatFr(o))}
              selected={manqPick}
              onSelect={setManqPick}
              revealed={manqRevealed}
              correctIndex={MANQUANT.correct}
              cols={2}
            />
            {!manqRevealed && (
              <ValidateButton onClick={() => setManqRevealed(true)} disabled={manqPick === null}>
                Valider
              </ValidateButton>
            )}
            {manqRevealed && (
              <Feedback tone={s3 ? 'ok' : 'ko'}>
                {MANQUANT.explain}
                {!s3 && (
                  <>
                    {' '}
                    <button
                      type="button"
                      onClick={() => {
                        setManqRevealed(false);
                        setManqPick(null);
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
        </StepCard>
      </div>
    </ModuleLayout>
  );
}

/* ─── Item d'estimation ──────────────────────────────────────────── */
function EstimationItem({ item, solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="border-2 border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">{item.emoji}</span>
        <span className="text-sm font-semibold text-slate-800">{item.situation}</span>
      </div>
      <p className="text-xs text-slate-500 flex items-center gap-1.5">
        <Eye className="w-3.5 h-3.5" aria-hidden="true" /> Quel ordre de grandeur te paraît réaliste ?
      </p>
      <ChoiceGrid
        options={item.options}
        selected={pick}
        onSelect={setPick}
        revealed={revealed}
        correctIndex={item.correct}
        cols={3}
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
