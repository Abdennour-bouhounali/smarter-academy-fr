import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, Target, BookMarked, Zap, ArrowRight, FlaskConical } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import NumberLine from '../../../../../common/components/NumberLine';
import OrderingGame from '../../../../../common/components/OrderingGame';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { Feedback, ChoiceGrid, ValidateButton, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import DecimalPlaceTable from '../components/DecimalPlaceTable';
import RepresentationPanel from '../components/RepresentationPanel';
import { formatDec, texDec, decEquals } from '../components/decimalUtils';

/* ═══ LE LABORATOIRE — les mesures relevées ════════════════════════ */
const MESURES = [
  { id: 'masse', emoji: '⚖️', label: 'Masse du flacon', value: 0.75, unit: 'kg' },
  { id: 'volume', emoji: '🧪', label: 'Volume du bécher', value: 1.25, unit: 'L' },
  { id: 'longueur', emoji: '📏', label: 'Longueur du tube', value: 3.08, unit: 'm' },
  { id: 'epaisseur', emoji: '📐', label: 'Épaisseur de la plaque', value: 0.05, unit: 'm' },
  { id: 'duree', emoji: '⏱️', label: 'Durée de la réaction', value: 2.4, unit: 's' },
  { id: 'prix', emoji: '💶', label: 'Prix du matériel', value: 12.5, unit: '€' },
];

/* ═══ COMPÉTENCES SUIVIES ══════════════════════════════════════════ */
const SKILLS = {
  fractions: { label: 'Fractions décimales', module: 3 },
  virgule: { label: 'Écriture à virgule', module: 4 },
  position: { label: 'Valeur de position', module: 5 },
  comparaison: { label: 'Comparaison', module: 7 },
  rangement: { label: 'Rangement', module: 7 },
  droite: { label: 'Droite graduée', module: 8 },
  grandeur: { label: 'Ordre de grandeur', module: 9 },
  problemes: { label: 'Problèmes', module: 10 },
};

/* ═══ LES 8 ÉPREUVES ═══════════════════════════════════════════════ */
const EPREUVES = [
  {
    id: 'e1',
    skill: 'fractions',
    title: 'Épreuve 1',
    prompt: (
      <>
        Une étiquette abîmée indique la masse du flacon sous la forme{' '}
        <MathText>{'$\\frac{75}{100}$'}</MathText> kg. Quelle écriture à virgule correspond ?
      </>
    ),
    type: 'mcq',
    options: ['7,5 kg', '0,75 kg', '0,075 kg', '75 kg'],
    correct: 1,
    explain:
      '75 centièmes, cela ne fait pas une unité entière : 0 unité, 7 dixièmes et 5 centièmes → 0,75 kg.',
  },
  {
    id: 'e2',
    skill: 'virgule',
    title: 'Épreuve 2',
    prompt: (
      <>
        Le tube mesure <strong className="font-mono">3,08 m</strong>. Quelle est sa fraction décimale ?
      </>
    ),
    type: 'mcq',
    options: ['38/100', '308/100', '308/10', '3080/100'],
    correct: 1,
    fractionOptions: true,
    explain:
      '3,08 = 3 unités (300 centièmes) + 0 dixième + 8 centièmes = 308 centièmes, soit 308/100. Le zéro des dixièmes compte !',
  },
  {
    id: 'e3',
    skill: 'position',
    title: 'Épreuve 3',
    prompt: (
      <>
        Dans le volume <strong className="font-mono">1,25 L</strong>, que représente le chiffre{' '}
        <strong className="font-mono">5</strong> ?
      </>
    ),
    type: 'mcq',
    options: ['5 unités', '5 dixièmes', '5 centièmes', '5 millièmes'],
    correct: 2,
    table: 1.25,
    explain: 'Le 5 est à la deuxième position après la virgule : les centièmes. Il vaut 5 centièmes, soit 0,05.',
  },
  {
    id: 'e4',
    skill: 'comparaison',
    title: 'Épreuve 4',
    prompt: (
      <>
        Deux béchers portent les mentions <strong className="font-mono">0,7 L</strong> et{' '}
        <strong className="font-mono">0,68 L</strong>. Lequel contient le plus de liquide ?
      </>
    ),
    type: 'mcq',
    options: ['0,7 L', '0,68 L', 'Les deux contiennent la même quantité'],
    correct: 0,
    cols: 3,
    explain:
      "On aligne : 0,70 et 0,68. Or 70 centièmes > 68 centièmes, donc 0,7 > 0,68. Avoir plus de chiffres ne rend pas un nombre plus grand.",
  },
  {
    id: 'e5',
    skill: 'rangement',
    title: 'Épreuve 5',
    prompt: <>Range ces quatre relevés du plus petit au plus grand.</>,
    type: 'order',
    items: [
      { id: 'o1', value: 0.05, text: '0,05' },
      { id: 'o2', value: 0.5, text: '0,5' },
      { id: 'o3', value: 0.25, text: '0,25' },
      { id: 'o4', value: 0.75, text: '0,75' },
    ],
    explain: '0,05 < 0,25 < 0,5 < 0,75. En alignant : 0,05 / 0,25 / 0,50 / 0,75.',
  },
  {
    id: 'e6',
    skill: 'droite',
    title: 'Épreuve 6',
    prompt: (
      <>
        Place le volume du bécher, <strong className="font-mono">1,25 L</strong>, sur la droite graduée.
      </>
    ),
    type: 'place',
    min: 1,
    max: 1.5,
    step: 0.05,
    labelEvery: 2,
    target: 1.25,
    explain: "Le pas vaut 0,05. Depuis 1, il faut avancer de 5 graduations : 1 + 0,25 = 1,25.",
  },
  {
    id: 'e7',
    skill: 'grandeur',
    title: 'Épreuve 7',
    prompt: (
      <>
        Une pesée donne <strong className="font-mono">2,96 kg</strong>. Quel ordre de grandeur annonces-tu ?
      </>
    ),
    type: 'mcq',
    options: ['Environ 2 kg', 'Environ 3 kg', 'Environ 2,5 kg', 'Environ 30 kg'],
    correct: 1,
    explain: "2,96 n'est qu'à 0,04 de 3 : l'ordre de grandeur est 3 kg.",
  },
  {
    id: 'e8',
    skill: 'problemes',
    title: 'Épreuve 8',
    prompt: (
      <>
        Tu verses le flacon (<strong className="font-mono">0,75 L</strong>) et le bécher (
        <strong className="font-mono">1,25 L</strong>) dans un même récipient. Que peux-tu affirmer ?
      </>
    ),
    type: 'mcq',
    options: [
      'Le total dépasse 2 L',
      'Le total fait exactement 2 L',
      'Le total est inférieur à 2 L',
      'On ne peut pas le savoir',
    ],
    correct: 1,
    explain:
      '0,75 + 1,25 : les centièmes se complètent (75 + 25 = 100 centièmes = 1 unité). Le total fait exactement 2 L. Une estimation rapide le confirmait : environ 1 + 1 = 2.',
  },
];

/* ═══ Une épreuve ══════════════════════════════════════════════════ */
function Epreuve({ epreuve, index, solved, onSolved, onMiss }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [pos, setPos] = useState(epreuve.type === 'place' ? epreuve.min : null);
  const [checked, setChecked] = useState(false);

  const placeOk = epreuve.type === 'place' && decEquals(pos, epreuve.target);

  const renderFraction = (o) => {
    const [n, d] = o.split('/');
    return <MathText>{`$\\frac{${n}}{${d}}$`}</MathText>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-2 rounded-2xl p-5 space-y-4 ${
        solved ? 'border-emerald-300 bg-emerald-50/30' : 'border-amber-200 bg-amber-50/20'
      }`}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-space font-bold text-slate-800">{epreuve.title}</h3>
        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-800 text-white">
          {index + 1} / {EPREUVES.length}
        </span>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed">{epreuve.prompt}</p>

      {epreuve.table !== undefined && (
        <div className="bg-white border border-slate-200 rounded-xl p-2">
          <DecimalPlaceTable value={epreuve.table} intPlaces={1} decPlaces={2} compact />
        </div>
      )}

      {epreuve.type === 'mcq' && (
        <>
          <ChoiceGrid
            options={epreuve.options}
            selected={pick}
            onSelect={setPick}
            revealed={revealed}
            correctIndex={epreuve.correct}
            cols={epreuve.cols || 2}
            renderOption={epreuve.fractionOptions ? renderFraction : undefined}
          />
          {!revealed && (
            <ValidateButton
              onClick={() => {
                setRevealed(true);
                if (pick === epreuve.correct) onSolved();
                else onMiss();
              }}
              disabled={pick === null}
              tone="amber"
            >
              Valider
            </ValidateButton>
          )}
          {revealed && (
            <Feedback tone={pick === epreuve.correct ? 'ok' : 'ko'}>
              {epreuve.explain}
              {pick !== epreuve.correct && (
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
        </>
      )}

      {epreuve.type === 'order' && (
        <>
          <OrderingGame
            items={epreuve.items}
            direction="asc"
            solved={solved}
            onSolved={onSolved}
            onError={onMiss}
            format={(v) => formatDec(v)}
          />
          {solved && <Feedback tone="info">{epreuve.explain}</Feedback>}
        </>
      )}

      {epreuve.type === 'place' && (
        <>
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
            <NumberLine
              min={epreuve.min}
              max={epreuve.max}
              step={epreuve.step}
              labelEvery={epreuve.labelEvery}
              height={190}
              mode="place"
              value={pos}
              onChange={(v) => {
                if (solved) return;
                setPos(v);
                setChecked(false);
              }}
              snap={epreuve.step}
              format={(v) => formatDec(v)}
              revealValue={solved || checked}
              disabled={solved}
              ghost={solved || checked ? { value: epreuve.target, label: formatDec(epreuve.target) } : null}
              ariaLabel="Place 1,25 sur la droite graduée"
            />
          </div>
          {!solved && (
            <ValidateButton
              onClick={() => {
                setChecked(true);
                if (placeOk) onSolved();
                else onMiss();
              }}
              tone="amber"
            >
              Valider ma position
            </ValidateButton>
          )}
          {checked && (
            <Feedback tone={placeOk ? 'ok' : 'ko'}>
              {placeOk ? epreuve.explain : <>Tu as placé le curseur sur {formatDec(pos)}. {epreuve.explain}</>}
            </Feedback>
          )}
        </>
      )}
    </motion.div>
  );
}

/* ═══ PHASE 2 — Profil de maîtrise ═════════════════════════════════ */
function ProfilMaitrise({ scores }) {
  const META = {
    ok: { dot: '🟢', label: 'Très bien maîtrisé', tone: 'border-emerald-200 bg-emerald-50' },
    mid: { dot: '🟡', label: 'À renforcer', tone: 'border-amber-200 bg-amber-50' },
    low: { dot: '🔴', label: 'À retravailler', tone: 'border-rose-200 bg-rose-50' },
  };

  return (
    <div className="space-y-3">
      {Object.entries(SKILLS).map(([key, skill]) => {
        const misses = scores[key] ?? 0;
        const lvl = misses === 0 ? 'ok' : misses === 1 ? 'mid' : 'low';
        const meta = META[lvl];
        const target = LESSON_CONFIG.modules.find((m) => m.number === skill.module);

        return (
          <div
            key={key}
            className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 flex-wrap ${meta.tone}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg" aria-hidden="true">{meta.dot}</span>
              <div>
                <div className="font-space font-bold text-slate-800 text-sm">{skill.label}</div>
                <div className="text-xs text-slate-600">{meta.label}</div>
              </div>
            </div>
            {lvl !== 'ok' && target && (
              <Link
                to={target.path}
                className="text-xs font-mono font-bold px-3 py-2 rounded-lg bg-white border-2 border-slate-300 text-slate-700 hover:border-slate-500 transition-colors"
              >
                Revoir le module {skill.module} <ArrowRight className="inline w-3 h-3" aria-hidden="true" />
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══ PHASE 3 — Synthèse ═══════════════════════════════════════════ */
function Synthese() {
  return (
    <div className="space-y-5">
      <div className="bg-slate-900 text-white rounded-2xl p-6 text-center space-y-3">
        <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Le concept central</div>
        <div className="text-3xl sm:text-4xl font-space font-extrabold font-mono">3,75</div>
        <div className="text-slate-500 text-xl" aria-hidden="true">↓</div>
        <p className="text-sm text-slate-300">
          ce n'est pas « 3 virgule 75 » : c'est une <strong className="text-white">quantité</strong> — 3 unités
          entières et 75 centièmes d'unité.
        </p>
      </div>

      <RepresentationPanel
        value={3.75}
        views={['virgule', 'fraction', 'decomposition', 'positions', 'droite']}
        mode="grid"
        title="Les cinq visages de 3,75"
      />

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3">
        <h3 className="font-space font-bold text-slate-800 text-sm">Le tableau de numération</h3>
        <DecimalPlaceTable value={3.75} intPlaces={1} decPlaces={2} showValues />
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ['3 unités', '3'],
            ['7 dixièmes', '0,7'],
            ['5 centièmes', '0,05'],
          ].map(([a, b]) => (
            <div key={a} className="bg-slate-50 rounded-xl px-2 py-2 border border-slate-200">
              <div className="text-[11px] font-mono text-slate-500">{a}</div>
              <div className="font-mono font-bold text-slate-800">{b}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-2">
          <div className="font-space font-bold text-amber-900 text-sm">⚖️ Comparer</div>
          <ol className="text-xs text-amber-900 space-y-1 list-decimal list-inside">
            <li>Comparer d'abord les parties entières.</li>
            <li>En cas d'égalité, compléter avec des zéros pour avoir autant de décimales.</li>
            <li>Comparer ensuite de gauche à droite, et s'arrêter à la première différence.</li>
          </ol>
          <div className="bg-white rounded-xl px-3 py-2 text-center font-mono text-xs text-amber-900">
            3,75 vs 3,8 → 3,80 → <strong>3,75 &lt; 3,8</strong>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 space-y-2">
          <div className="font-space font-bold text-violet-900 text-sm">🎯 Estimer</div>
          <p className="text-xs text-violet-900">
            3,75 est au-delà de la moitié entre 3 et 4 : à l'unité près, <strong>3,75 ≈ 4</strong>. L'estimation
            sert à vérifier qu'un résultat est plausible.
          </p>
          <NumberLine
            min={3}
            max={4}
            step={0.1}
            labelEvery={5}
            height={120}
            format={(v) => formatDec(v)}
            markers={[{ value: 3.75, label: '3,75', color: '#7c3aed' }]}
            ariaLabel="3,75 entre 3 et 4"
          />
        </div>
      </div>

      <Feedback tone="info">
        Et les zéros ? <strong>3,5 = 3,50 = 3,500</strong> (zéros ajoutés à la fin), mais{' '}
        <strong>3,5 ≠ 3,05</strong> : un zéro juste après la virgule décale tous les chiffres.
      </Feedback>
    </div>
  );
}

/* ═══ PHASE 4 — Flash retour ═══════════════════════════════════════ */
const FLASH = [
  {
    q: 'Quelle est l\'écriture à virgule de 45/100 ?',
    options: ['4,5', '0,45', '0,045', '45,0'],
    correct: 1,
    explain: '45 centièmes = 0 unité, 4 dixièmes et 5 centièmes → 0,45.',
  },
  {
    q: 'Dans 5,08, que représente le chiffre 8 ?',
    options: ['8 unités', '8 dixièmes', '8 centièmes', '8 millièmes'],
    correct: 2,
    explain: 'Le 8 est à la deuxième position après la virgule : 8 centièmes, soit 0,08.',
  },
  {
    q: 'Quel nombre est le plus grand : 4,09 ou 4,9 ?',
    options: ['4,09', '4,9', 'Ils sont égaux'],
    correct: 1,
    cols: 3,
    explain: 'On aligne : 4,09 et 4,90. Or 9 centièmes < 90 centièmes, donc 4,09 < 4,9.',
  },
  {
    q: 'Sur une droite graduée de 0 à 1 partagée en 10 parts égales, où se trouve 0,6 ?',
    options: [
      'À la 6e graduation après 0',
      'À la 6e graduation après 1',
      'Juste avant 0,5',
      'Entre 6 et 7',
    ],
    correct: 0,
    cols: 1,
    explain: '0,6 = 6 dixièmes : c\'est la 6e graduation après 0, un peu après le milieu.',
  },
  {
    q: 'Une masse de 7,91 kg, c\'est environ…',
    options: ['7 kg', '8 kg', '7,5 kg', '79 kg'],
    correct: 1,
    explain: "7,91 n'est qu'à 0,09 de 8 : l'ordre de grandeur est 8 kg.",
  },
];

function FlashRetour({ onDone, score, setScore }) {
  const [idx, setIdx] = useState(0);
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = FLASH[idx];

  const next = () => {
    if (idx < FLASH.length - 1) {
      setIdx((i) => i + 1);
      setPick(null);
      setRevealed(false);
    } else {
      setFinished(true);
      onDone();
    }
  };

  if (finished) {
    return (
      <div className="text-center space-y-3 py-4">
        <div className="text-5xl" aria-hidden="true">{score === 5 ? '🏆' : score >= 4 ? '🥈' : '📚'}</div>
        <div className="text-2xl font-space font-extrabold text-slate-800">
          {score} / {FLASH.length}
        </div>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          {score === FLASH.length
            ? 'Score parfait ! Les cinq compétences de réactivation sont acquises.'
            : `${FLASH.length - score} question(s) à revoir — reprends le module correspondant dans ton profil.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs font-mono text-slate-400">
        <span>
          Question {idx + 1} / {FLASH.length}
        </span>
        <span className="text-emerald-600 font-bold">{score} ✓</span>
      </div>
      <div className="bg-slate-800 text-white rounded-xl p-5 text-sm font-semibold leading-relaxed">{q.q}</div>
      <ChoiceGrid
        options={q.options}
        selected={pick}
        onSelect={setPick}
        revealed={revealed}
        correctIndex={q.correct}
        cols={q.cols || 2}
      />
      {!revealed && (
        <ValidateButton
          onClick={() => {
            setRevealed(true);
            if (pick === q.correct) setScore((s) => s + 1);
          }}
          disabled={pick === null}
          tone="slate"
        >
          Valider
        </ValidateButton>
      )}
      {revealed && (
        <>
          <Feedback tone={pick === q.correct ? 'ok' : 'ko'}>{q.explain}</Feedback>
          <button
            type="button"
            onClick={next}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm min-h-[48px]"
          >
            {idx < FLASH.length - 1 ? 'Question suivante →' : 'Voir mon score →'}
          </button>
        </>
      )}
    </div>
  );
}

/* ═══ BADGES ═══════════════════════════════════════════════════════ */
const BADGES = [
  { id: 'dixiemes', emoji: '🏅', label: 'Explorateur des dixièmes', test: (s) => (s.fractions ?? 0) === 0 },
  { id: 'centiemes', emoji: '🏅', label: 'Maître des centièmes', test: (s) => (s.position ?? 0) === 0 },
  { id: 'decodeur', emoji: '🏅', label: 'Décodeur des nombres décimaux', test: (s) => (s.virgule ?? 0) === 0 },
  {
    id: 'detective',
    emoji: '🏅',
    label: 'Détective des comparaisons',
    test: (s) => (s.comparaison ?? 0) === 0 && (s.rangement ?? 0) === 0,
  },
  { id: 'droite', emoji: '🏅', label: 'Expert de la droite graduée', test: (s) => (s.droite ?? 0) === 0 },
];

/* ═══ MODULE ═══════════════════════════════════════════════════════ */
const PHASES = [
  { key: 'boss', label: 'Boss final', Icon: Trophy },
  { key: 'profil', label: 'Mon profil', Icon: Target },
  { key: 'synthese', label: 'Synthèse', Icon: BookMarked },
  { key: 'flash', label: 'Flash retour', Icon: Zap },
];

export default function Module11BossFinal() {
  const navLinks = getNavLinks(11);
  const { xp, awardXP } = useProgress(MODULE_CTX.lessonId);

  const [phase, setPhase] = useState('boss');
  const [done, setDone] = useState([]);
  const [misses, setMisses] = useState({});
  const [flashScore, setFlashScore] = useState(0);
  const [flashDone, setFlashDone] = useState(false);

  const bossDone = done.length === EPREUVES.length;
  const allDone = bossDone && flashDone;

  const solveEpreuve = (ep) => {
    if (done.includes(ep.id)) return;
    setDone((d) => (d.includes(ep.id) ? d : [...d, ep.id]));
    awardXP({ moduleId: '11', exerciseId: ep.id, amount: 20 });
  };

  const missEpreuve = (ep) => setMisses((m) => ({ ...m, [ep.skill]: (m[ep.skill] || 0) + 1 }));

  const badgesGagnes = BADGES.filter((b) => b.test(misses));
  const masterBadge = bossDone && flashDone && badgesGagnes.length === BADGES.length && flashScore === FLASH.length;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="🏆 Le Laboratoire des Décimaux"
      moduleSubtitle="Huit épreuves, un profil de maîtrise, une synthèse et cinq questions de réactivation."
      moduleNumber={11}
      estimatedTime="18 min"
      xp={xp}
      prevLink={navLinks.prevLink}
      nextLink={navLinks.nextLink}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PHASES.map(({ key, label, Icon }) => {
            const unlocked = true;
            return (
              <button
                key={key}
                type="button"
                disabled={!unlocked}
                onClick={() => setPhase(key)}
                className={`px-3 py-2.5 rounded-xl font-mono text-xs font-bold transition-all min-h-[48px] flex items-center justify-center gap-1.5 ${
                  phase === key
                    ? 'bg-slate-900 text-white'
                    : unlocked
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* ── BOSS ── */}
          {phase === 'boss' && (
            <motion.div key="boss" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <MissionBrief
                tag="🧪 Boss final"
                title="Bienvenue au laboratoire de mesure du collège."
                tone="amber"
              >
                <p>
                  Six relevés ont été effectués ce matin. Huit épreuves t'attendent : à toi de choisir, à chaque
                  fois, la bonne façon de lire, transformer, comparer ou estimer. Personne ne te dira laquelle.
                </p>
              </MissionBrief>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MESURES.map((m) => (
                  <div key={m.id} className="rounded-xl border-2 border-slate-200 bg-white p-2.5 text-center">
                    <div className="text-lg" aria-hidden="true">{m.emoji}</div>
                    <div className="text-[9px] font-mono text-slate-500 uppercase leading-tight">{m.label}</div>
                    <div className="font-mono font-extrabold text-sm text-slate-800 tabular-nums">
                      {formatDec(m.value)} {m.unit}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {EPREUVES.map((e, i) => (
                  <span
                    key={e.id}
                    className={`w-8 h-8 rounded-lg font-mono text-xs font-bold flex items-center justify-center ${
                      done.includes(e.id) ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {done.includes(e.id) ? '✓' : i + 1}
                  </span>
                ))}
              </div>

              {EPREUVES.map((ep, i) =>
                i === 0 || done.includes(EPREUVES[i - 1].id) ? (
                  <Epreuve
                    key={ep.id}
                    epreuve={ep}
                    index={i}
                    solved={done.includes(ep.id)}
                    onSolved={() => solveEpreuve(ep)}
                    onMiss={() => missEpreuve(ep)}
                  />
                ) : null
              )}

              {bossDone && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl p-6 text-center space-y-3"
                >
                  <div className="text-5xl" aria-hidden="true">🧪</div>
                  <div className="text-2xl font-space font-extrabold">Laboratoire validé !</div>
                  <p className="text-amber-50 text-sm">
                    Tu as mobilisé huit compétences différentes sans qu'on te dise lesquelles. Découvre ton profil.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPhase('profil')}
                    className="px-5 py-2.5 rounded-xl bg-white text-amber-700 font-mono text-xs font-bold min-h-[44px]"
                  >
                    Voir mon profil <ArrowRight className="inline w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── PROFIL ── */}
          {phase === 'profil' && (
            <motion.div key="profil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-space font-extrabold text-slate-900">Ton profil de maîtrise</h2>
                <p className="text-sm text-slate-500">
                  Pas seulement un score : ce que tu maîtrises, et ce qui mérite un second passage.
                </p>
              </div>

              <ProfilMaitrise scores={misses} />

              {badgesGagnes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-space font-bold text-slate-800 text-sm">Badges débloqués</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {badgesGagnes.map((b) => (
                      <motion.div
                        key={b.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3"
                      >
                        <span className="text-xl" aria-hidden="true">{b.emoji}</span>
                        <span className="text-sm font-bold text-amber-900">{b.label}</span>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    Les badges récompensent la compréhension et la justesse du raisonnement — jamais la vitesse.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setPhase('synthese')}
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl min-h-[48px]"
              >
                Passer à la synthèse →
              </button>
            </motion.div>
          )}

          {/* ── SYNTHÈSE ── */}
          {phase === 'synthese' && (
            <motion.div key="synthese" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <Synthese />
              <button
                type="button"
                onClick={() => setPhase('flash')}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl min-h-[48px]"
              >
                Je passe au Flash retour →
              </button>
            </motion.div>
          )}

          {/* ── FLASH ── */}
          {phase === 'flash' && (
            <motion.div key="flash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 space-y-4">
                <h2 className="text-lg font-space font-bold text-slate-800">⚡ Flash retour — 5 questions</h2>
                <FlashRetour
                  score={flashScore}
                  setScore={setFlashScore}
                  onDone={() => {
                    setFlashDone(true);
                    awardXP({ moduleId: '11', exerciseId: 'flash', amount: 30 });
                  }}
                />
              </div>

              {flashDone && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl p-8 text-center space-y-3"
                >
                  <div className="text-5xl" aria-hidden="true">{masterBadge ? '🏆' : '🎓'}</div>
                  <div className="text-2xl font-space font-extrabold">
                    {masterBadge ? 'Maître des nombres décimaux !' : 'Leçon terminée !'}
                  </div>
                  <p className="text-indigo-100 text-sm leading-relaxed max-w-lg mx-auto">
                    Un nombre décimal représente une quantité. Tu sais la découper, l'écrire en fraction décimale
                    ou avec une virgule, dire ce que vaut chaque chiffre, la comparer, la ranger, la placer sur une
                    droite et vérifier qu'un résultat est raisonnable.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    {['Fractions', 'Virgule', 'Comparer', 'Estimer'].map((v) => (
                      <div key={v} className="bg-white/15 rounded-xl py-2 text-sm font-bold">
                        ✓ {v}
                      </div>
                    ))}
                  </div>
                  {masterBadge && (
                    <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 font-bold text-sm px-4 py-2 rounded-full mt-2">
                      <FlaskConical className="w-4 h-4" aria-hidden="true" />
                      Badge « Maître des nombres décimaux » débloqué
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ModuleLayout>
  );
}
