import React, { useState } from 'react';
import { ShoppingCart, Ruler, Timer } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import OrderingGame from '../../../../../common/components/OrderingGame';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, NumberField } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { formatDec, texDec, parseDec, decEquals } from '../components/decimalUtils';

/* ─── La démarche, affichée en permanence ────────────────────────── */
const DEMARCHE = [
  'Je comprends',
  "J'identifie les nombres",
  "J'estime l'ordre de grandeur",
  'Je calcule',
  'Je vérifie la cohérence',
];

function DemarcheBanner({ current }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {DEMARCHE.map((d, i) => (
        <span
          key={d}
          className={`text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-full transition-colors ${
            i < current
              ? 'bg-emerald-100 text-emerald-700'
              : i === current
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-400'
          }`}
        >
          {i < current ? '✓ ' : `${i + 1}. `}
          {d}
        </span>
      ))}
    </div>
  );
}

/* ─── Question générique ─────────────────────────────────────────── */
function Question({ item, solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [val, setVal] = useState('');
  const [fb, setFb] = useState(null);

  const checkInput = () => {
    const n = parseDec(val);
    if (!Number.isNaN(n) && decEquals(n, item.answer)) {
      onSolved?.();
      setFb(null);
    } else {
      setFb(item.hint);
    }
  };

  return (
    <div className="space-y-3 border-t border-slate-100 pt-4">
      <p className="text-sm font-semibold text-slate-800 leading-relaxed">
        {item.tag && (
          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 text-white font-mono text-[10px] font-bold mr-2 align-middle">
            {item.tag}
          </span>
        )}
        {item.q}
      </p>

      {item.type === 'mcq' ? (
        <>
          <ChoiceGrid
            options={item.options}
            selected={pick}
            onSelect={setPick}
            revealed={revealed || solved}
            correctIndex={item.correct}
            cols={item.cols || 2}
          />
          {!revealed && !solved && (
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
          )}
        </>
      ) : solved ? (
        <Feedback tone="ok">
          <strong className="font-mono">
            {formatDec(item.answer)} {item.unit}
          </strong>{' '}
          — {item.explain}
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
              onEnter={checkInput}
              ariaLabel={item.q}
              width="w-32"
              size="sm"
            />
            {item.unit && <span className="text-sm font-mono text-slate-500">{item.unit}</span>}
            <ValidateButton onClick={checkInput} disabled={!val}>
              OK
            </ValidateButton>
          </div>
          {fb && <Feedback tone="hint">{fb}</Feedback>}
        </>
      )}
    </div>
  );
}

/* ─── Problème 1 — les achats ────────────────────────────────────── */
const P1 = [
  {
    tag: 'ÉTAPE 2',
    type: 'mcq',
    q: 'Quels sont les deux nombres utiles à ce problème ?',
    options: ['2,50 et 3,75', '2,50 et 6', '250 et 375', '2 et 3'],
    correct: 0,
    explain: 'Les deux prix sont 2,50 € et 3,75 €. Ce sont eux qu\'il faudra additionner.',
  },
  {
    tag: 'ÉTAPE 3',
    type: 'mcq',
    q: "Avant tout calcul : quel ordre de grandeur attends-tu pour le total ?",
    options: ['Environ 6 €', 'Environ 60 €', 'Environ 1 €', 'Environ 15 €'],
    correct: 0,
    explain: "2,50 € est proche de 2,50 et 3,75 € est proche de 4 : on attend un total d'environ 6 €.",
  },
  {
    tag: 'ÉTAPE 4',
    type: 'input',
    q: 'Calcule maintenant le total exact.',
    answer: 6.25,
    unit: '€',
    hint: 'Additionne les centimes : 50 + 75 = 125 centimes, soit 1 € et 25 centimes. Donc 2 + 3 + 1,25.',
    explain: "2,50 + 3,75 = 6,25 €.",
  },
  {
    tag: 'ÉTAPE 5',
    type: 'mcq',
    q: 'Ton résultat est-il cohérent avec ton estimation ?',
    options: [
      'Oui : 6,25 € est bien proche des 6 € attendus',
      'Non : il faudrait recommencer le calcul',
      "On ne peut pas comparer une estimation et un résultat exact",
    ],
    correct: 0,
    cols: 1,
    explain:
      "6,25 € est très proche de l'estimation 6 € : le calcul est validé. C'est exactement le rôle de l'estimation.",
  },
];

/* ─── Problème 2 — les rubans ────────────────────────────────────── */
const P2 = [
  {
    tag: 'ÉTAPE 1',
    type: 'mcq',
    q: 'Quel ruban est le plus long ?',
    options: ['Le ruban A (2,4 m)', 'Le ruban B (1,35 m)', 'Ils ont la même longueur'],
    correct: 0,
    cols: 3,
    explain:
      "Les parties entières suffisent : 2 > 1, donc 2,4 m > 1,35 m. Le ruban B a pourtant plus de chiffres — ce n'est jamais un critère.",
  },
  {
    tag: 'ÉTAPE 3',
    type: 'mcq',
    q: 'Quelle est la longueur totale approximative des deux rubans mis bout à bout ?',
    options: ['Environ 3,5 m', 'Environ 4,5 m', 'Environ 2,5 m', 'Environ 35 m'],
    correct: 0,
    explain: '2,4 m ≈ 2,4 et 1,35 m ≈ 1,4 : on attend environ 3,8 m, donc un total voisin de 3,5 à 4 m.',
  },
  {
    tag: 'ÉTAPE 4',
    type: 'input',
    q: 'Calcule la longueur totale exacte.',
    answer: 3.75,
    unit: 'm',
    hint: 'Aligne les virgules : 2,40 + 1,35. Additionne les centièmes, puis les dixièmes, puis les unités.',
    explain: '2,4 + 1,35 = 2,40 + 1,35 = 3,75 m — cohérent avec l\'estimation.',
  },
  {
    tag: 'ÉTAPE 5',
    type: 'mcq',
    q: "Pour additionner, pourquoi a-t-on écrit 2,4 sous la forme 2,40 ?",
    options: [
      'Pour que les chiffres de même valeur soient alignés : dixièmes sous dixièmes, centièmes sous centièmes',
      'Pour rendre le nombre plus grand',
      'Parce que 2,4 est faux',
      "Par habitude, cela n'a pas d'importance",
    ],
    correct: 0,
    cols: 1,
    explain:
      "2,4 = 2,40 : la quantité ne change pas. Écrire le zéro permet d'aligner les colonnes et d'additionner des parts de même taille.",
  },
];

/* ─── Problème 3 — la course ─────────────────────────────────────── */
const TEMPS = [
  { id: 't1', value: 12.45, text: '12,45', nom: 'Alix' },
  { id: 't2', value: 12.5, text: '12,5', nom: 'Bilal' },
  { id: 't3', value: 12.08, text: '12,08', nom: 'Chloé' },
  { id: 't4', value: 12.4, text: '12,4', nom: 'Dounia' },
];

const P3_QUESTIONS = [
  {
    tag: 'ÉTAPE 1',
    type: 'mcq',
    q: "Dans une course, qui est le plus rapide : celui qui a le plus grand temps ou le plus petit ?",
    options: ['Le plus petit temps', 'Le plus grand temps'],
    correct: 0,
    cols: 2,
    explain:
      "Le plus rapide met le MOINS de temps. Attention : ici, le plus petit nombre correspond à la meilleure performance.",
  },
  {
    tag: 'ÉTAPE 5',
    type: 'mcq',
    q: 'Qui a gagné la course ?',
    options: ['Alix (12,45 s)', 'Bilal (12,5 s)', 'Chloé (12,08 s)', 'Dounia (12,4 s)'],
    correct: 2,
    explain:
      "Chloé, avec 12,08 s : c'est le plus petit temps. En alignant — 12,45 / 12,50 / 12,08 / 12,40 — on voit que 08 centièmes est bien le plus petit.",
  },
  {
    tag: 'BONUS',
    type: 'mcq',
    q: 'Entre quels dixièmes de seconde se situe le temps de Chloé ?',
    options: ['12,0 et 12,1', '12,0 et 12,8', '12 et 13', '12,08 et 12,1'],
    correct: 0,
    explain: '12,08 est compris entre 12,0 et 12,1 : on écrit 12,0 < 12,08 < 12,1.',
  },
];

export default function Module10Problemes() {
  const navLinks = getNavLinks(10);
  const [p1, setP1] = useState([]);
  const [p2, setP2] = useState([]);
  const [p3, setP3] = useState([]);
  const [rangeDone, setRangeDone] = useState(false);

  const s1 = p1.length === P1.length;
  const s2 = p2.length === P2.length;
  const s3 = rangeDone && p3.length === P3_QUESTIONS.length;
  const allDone = s1 && s2 && s3;

  const mark = (setter, i) => setter((d) => (d.includes(i) ? d : [...d, i]));

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Calculs et problèmes"
      moduleSubtitle="Des décimaux dans la vraie vie : comprendre, estimer, calculer, puis vérifier."
      moduleNumber={10}
      estimatedTime="14 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="🧠 Résolution" title="La même démarche pour tous les problèmes.">
          <p>
            Ce n'est pas le calcul qui est difficile, c'est de savoir ce qu'on cherche et de vérifier que la
            réponse a du sens. Suis les cinq étapes à chaque fois.
          </p>
          <div className="pt-1">
            <DemarcheBanner current={-1} />
          </div>
        </MissionBrief>

        {/* Problème 1 */}
        <StepCard num={1} title="Problème 1 — Les achats" subtitle="Niveau : découverte" done={s1}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-white border-2 border-slate-200 rounded-2xl p-4">
              <ShoppingCart className="w-5 h-5 mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
              <p className="text-sm text-slate-700">
                <span className="font-mono font-bold text-[10px] uppercase text-slate-400 block mb-1">
                  Étape 1 — Je comprends
                </span>
                Un élève achète un cahier à <strong>2,50 €</strong> et un stylo à <strong>3,75 €</strong>. On
                cherche combien il paie en tout.
              </p>
            </div>
            <DemarcheBanner current={Math.min(p1.length + 1, DEMARCHE.length)} />

            {P1.map((item, i) =>
              i === 0 || p1.includes(i - 1) ? (
                <Question key={item.q} item={item} solved={p1.includes(i)} onSolved={() => mark(setP1, i)} />
              ) : null
            )}
          </div>
        </StepCard>

        {/* Problème 2 */}
        <StepCard num={2} title="Problème 2 — Les rubans" subtitle="Niveau : intermédiaire" done={s2} locked={!s1}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-white border-2 border-slate-200 rounded-2xl p-4">
              <Ruler className="w-5 h-5 mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
              <p className="text-sm text-slate-700">
                <span className="font-mono font-bold text-[10px] uppercase text-slate-400 block mb-1">
                  Étape 1 — Je comprends
                </span>
                Le ruban A mesure <strong>2,4 m</strong>, le ruban B mesure <strong>1,35 m</strong>.
              </p>
            </div>

            {/* Comparaison visuelle des deux longueurs */}
            <div className="space-y-2 bg-slate-50 rounded-xl p-4 border border-slate-200">
              {[
                { nom: 'Ruban A', v: 2.4, color: 'bg-emerald-500' },
                { nom: 'Ruban B', v: 1.35, color: 'bg-sky-500' },
              ].map((r) => (
                <div key={r.nom} className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-600 w-16 shrink-0">{r.nom}</span>
                  <div className="flex-1 h-5 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full ${r.color} rounded-full`} style={{ width: `${(r.v / 2.4) * 100}%` }} />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-700 w-14 text-right">
                    {formatDec(r.v)} m
                  </span>
                </div>
              ))}
            </div>

            {P2.map((item, i) =>
              i === 0 || p2.includes(i - 1) ? (
                <Question key={item.q} item={item} solved={p2.includes(i)} onSolved={() => mark(setP2, i)} />
              ) : null
            )}
          </div>
        </StepCard>

        {/* Problème 3 */}
        <StepCard num={3} title="Problème 3 — La finale du 100 m" subtitle="Niveau : expert" done={s3} locked={!s2}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-white border-2 border-slate-200 rounded-2xl p-4">
              <Timer className="w-5 h-5 mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
              <p className="text-sm text-slate-700">
                <span className="font-mono font-bold text-[10px] uppercase text-slate-400 block mb-1">
                  Étape 1 — Je comprends
                </span>
                Quatre élèves ont couru le 100 m. Voici leurs temps, en secondes.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TEMPS.map((t) => (
                <div key={t.id} className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-center">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">{t.nom}</div>
                  <div className="font-mono font-extrabold text-lg text-slate-800 tabular-nums">{t.text}</div>
                  <div className="text-[10px] font-mono text-slate-400">secondes</div>
                </div>
              ))}
            </div>

            {P3_QUESTIONS.slice(0, 1).map((item) => (
              <Question
                key={item.q}
                item={item}
                solved={p3.includes(0)}
                onSolved={() => mark(setP3, 0)}
              />
            ))}

            {p3.includes(0) && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <p className="text-sm font-semibold text-slate-800">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 text-white font-mono text-[10px] font-bold mr-2 align-middle">
                    ÉTAPE 4
                  </span>
                  Range les quatre temps du plus petit au plus grand.
                </p>
                <OrderingGame
                  items={TEMPS}
                  direction="asc"
                  solved={rangeDone}
                  onSolved={() => setRangeDone(true)}
                  format={(v) => formatDec(v)}
                  instruction="Astuce : complète mentalement chaque temps avec un zéro pour qu'ils aient tous deux décimales."
                />
              </div>
            )}

            {rangeDone &&
              P3_QUESTIONS.slice(1).map((item, k) => {
                const idx = k + 1;
                return idx === 1 || p3.includes(idx - 1) ? (
                  <Question
                    key={item.q}
                    item={item}
                    solved={p3.includes(idx)}
                    onSolved={() => mark(setP3, idx)}
                  />
                ) : null;
              })}

            {s3 && (
              <Feedback tone="ok">
                Classement final :{' '}
                <MathText>{`$${texDec(12.08)} < ${texDec(12.4)} < ${texDec(12.45)} < ${texDec(12.5)}$`}</MathText>{' '}
                — Chloé gagne. Remarque que <strong>12,4 &lt; 12,45</strong> alors que 12,4 a moins de chiffres :
                c'est bien la valeur, et non la longueur de l'écriture, qui compte.
              </Feedback>
            )}
          </div>
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
