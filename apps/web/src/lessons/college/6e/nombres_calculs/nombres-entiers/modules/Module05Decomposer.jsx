import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, RotateCcw, X } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PlaceValueTable from '../components/PlaceValueTable';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { formatFr, parseFr, decompose, digitCells } from '../components/numberUtils';

/**
 * Module 5 V2 — reconstruit sur le lesson kit. Les tuiles de décomposition
 * et la chasse aux zéros restent des manipulations maison ; le vrai/faux
 * par lot passe en BatchChoiceQuestion, la recomposition en
 * NumericQuestion (avec feedback ciblé sur le piège du zéro), et les QCM
 * en TapQuestion.
 */

const CIBLE = 4582;
const TUILES = [4000, 400, 500, 50, 80, 8, 2, 20];

function DecompositionTiles({ target, onSolved, solved, react }) {
  const [picked, setPicked] = useState([]);
  const [checked, setChecked] = useState(false);

  const sum = picked.reduce((acc, i) => acc + TUILES[i], 0);
  const attendu = decompose(target);
  const isRight = sum === target && picked.length === attendu.length;

  // RÈGLE PROJET (2026-09-06) : les tuiles ne se figent JAMAIS après la
  // validation — c'est en reprenant et en reposant des tuiles que l'élève
  // vérifie qu'une autre combinaison ne donne pas le même nombre.
  const toggle = (i) => {
    setChecked(false);
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 rounded-2xl p-5 text-center">
        <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Nombre à décomposer</div>
        <div className="font-mono font-extrabold text-4xl text-white tabular-nums">{formatFr(target)}</div>
      </div>

      <div>
        <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
          Tuiles disponibles — choisis celles qui composent le nombre
        </div>
        <div className="flex flex-wrap gap-2">
          {TUILES.map((t, i) => {
            const isPicked = picked.includes(i);
            return (
              <button
                key={`${t}-${i}`}
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={isPicked}
                className={`px-4 py-3 rounded-xl border-2 font-mono font-extrabold tabular-nums transition-all min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isPicked
                    ? 'bg-blue-600 border-blue-700 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {formatFr(t)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center min-h-[80px] flex flex-col justify-center">
        {picked.length === 0 ? (
          <span className="text-xs text-slate-400 italic">Sélectionne des tuiles pour construire la somme.</span>
        ) : (
          <>
            <div className="font-mono font-bold text-lg sm:text-xl text-slate-800 tabular-nums break-words">
              {picked.map((i) => formatFr(TUILES[i])).join(' + ')}
            </div>
            <div className="font-mono text-sm text-slate-500 mt-1">
              = {formatFr(sum)}{' '}
              {sum === target ? (
                <Check className="inline w-4 h-4 text-emerald-600" aria-label="somme correcte" />
              ) : (
                <span className="text-rose-500">(objectif : {formatFr(target)})</span>
              )}
            </div>
          </>
        )}
      </div>

      {!solved && (
        <div className="flex gap-2 flex-wrap">
          <ValidateButton
            onClick={() => {
              setChecked(true);
              react(isRight);
              onSolved?.();
            }}
            disabled={picked.length === 0}
          >
            Vérifier
          </ValidateButton>
          {picked.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setPicked([]);
                setChecked(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-500 hover:border-slate-400 font-mono text-xs font-bold min-h-[44px]"
            >
              <RotateCcw className="inline w-3.5 h-3.5 mr-1" aria-hidden="true" /> Tout enlever
            </button>
          )}
        </div>
      )}

      {/* Pas de `!solved` ici : onSolved est inconditionnel (politique
          formative), donc `solved` devient vrai dès la validation — le
          retour d'erreur doit rester visible à côté de la correction. */}
      {checked && !isRight && (
        <Feedback tone="ko">
          {sum !== target ? (
            <>
              Ta somme vaut <strong className="font-mono">{formatFr(sum)}</strong> au lieu de{' '}
              <strong className="font-mono">{formatFr(target)}</strong>.
            </>
          ) : (
            <>
              La somme est bonne, mais on cherche la décomposition <strong>par positions</strong> : une seule
              tuile par colonne du tableau de numération, soit {attendu.length} tuiles.
            </>
          )}{' '}
          La bonne décomposition est <strong className="font-mono">{attendu.map((v) => formatFr(v)).join(' + ')}</strong>.
        </Feedback>
      )}

      {solved && (
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-center"
          >
            <div className="font-mono font-extrabold text-xl sm:text-2xl text-emerald-800 tabular-nums">
              {formatFr(target)} = {attendu.map((v) => formatFr(v)).join(' + ')}
            </div>
          </motion.div>
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 sm:p-4">
            <PlaceValueTable value={target} showValues />
          </div>
        </div>
      )}
    </div>
  );
}

const PROPOSITIONS = [
  { expr: '4 000 + 500 + 80 + 2', value: 4582 },
  { expr: '4 500 + 82', value: 4582 },
  { expr: '4 000 + 50 + 80 + 2', value: 4132 },
  { expr: '4 580 + 2', value: 4582 },
  { expr: '400 + 500 + 80 + 2', value: 982 },
  { expr: '4 000 + 500 + 82', value: 4582 },
];

const RECOMPOSITIONS = [
  { expr: '3 000 + 400 + 20 + 7', answer: 3427, trap: null },
  { expr: '5 000 + 80 + 6', answer: 5086, trap: '586' },
  { expr: '4 000 + 5', answer: 4005, trap: '45' },
];

const ZEROS = [4005, 7040, 30006, 205007];

function ZeroHunt({ n, solved, onSolved, react }) {
  const [clicked, setClicked] = useState([]);
  const [checked, setChecked] = useState(false);

  const zeroKeys = digitCells(n)
    .filter((c) => c.digit === 0)
    .map((c) => c.key);
  const isRight =
    clicked.length === zeroKeys.length && zeroKeys.every((k) => clicked.includes(k));

  return (
    <div className="space-y-3">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-3">
        <PlaceValueTable
          value={n}
          selectedKey={null}
          highlightKeys={solved ? zeroKeys : clicked}
          // RÈGLE PROJET (2026-09-06) : le tableau reste cliquable après la
          // validation, pour continuer à désigner d'autres colonnes.
          onDigitClick={(cell) => {
            setChecked(false);
            setClicked((c) => (c.includes(cell.key) ? c.filter((x) => x !== cell.key) : [...c, cell.key]));
          }}
          compact
        />
      </div>
      {!solved && (
        <>
          <p className="text-xs text-slate-500">
            Clique sur <strong>toutes les positions vides</strong> de {formatFr(n)}.
          </p>
          <ValidateButton
            onClick={() => {
              setChecked(true);
              react(isRight);
              onSolved?.();
            }}
            disabled={clicked.length === 0}
          >
            Vérifier
          </ValidateButton>
        </>
      )}
      {checked && !isRight && (
        <Feedback tone="hint">
          Une position est « vide » lorsqu'elle contient un <strong className="font-mono">0</strong> :
          il n'y a aucune unité de cet ordre.
        </Feedback>
      )}
      {solved && (
        <Feedback tone="ok">
          {formatFr(n)} = {decompose(n).map((v) => formatFr(v)).join(' + ')} — les zéros ne s'écrivent pas dans la
          décomposition, mais ils sont indispensables dans le nombre.
        </Feedback>
      )}
    </div>
  );
}

const ZERO_QUESTION = {
  q: 'Que nous disent les deux zéros de 4 005 ?',
  options: [
    "Qu'il n'y a ni centaine ni dizaine, tout en gardant le 4 à la place des milliers",
    "Qu'ils ne servent à rien : on peut écrire 45",
    'Que le nombre a été multiplié par 100',
    'Que le nombre est un petit nombre',
  ],
  correct: 0,
  explain:
    "Le zéro signale qu'une position ne contient aucune unité de cet ordre. Sans lui, les autres chiffres glisseraient : 4 005 deviendrait 45, un nombre cent fois plus petit.",
};

const ERREUR_ZERO = {
  q: 'Un élève écrit : « 6 020 = 620 ». A-t-il raison ?',
  options: ['Oui, le zéro du milieu ne compte pas', 'Non, 6 020 et 620 sont deux nombres différents'],
  correct: 1,
  explain:
    '6 020 contient 6 milliers ; 620 n\'en contient aucun. En supprimant le zéro, le 6 passe des milliers aux centaines : le nombre est divisé par 10. 6 020 ≠ 620.',
};

export default function Module05Decomposer() {
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [recompDone, setRecompDone] = useState([]);
  const [zerosDone, setZerosDone] = useState([]);
  const [zeroRevealed, setZeroRevealed] = useState(false);
  const [errRevealed, setErrRevealed] = useState(false);

  const s3 = recompDone.length === RECOMPOSITIONS.length;
  const s4 = zerosDone.length === ZEROS.length && zeroRevealed && errRevealed;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Décomposer et recomposer"
      moduleSubtitle="Casser un nombre en morceaux, le reconstruire — et comprendre pourquoi le zéro est indispensable."
      estimatedTime="12 min"
      brief={{
        tag: '🧩 Atelier',
        title: 'Un nombre se démonte… et se remonte.',
        body: (
          <p>
            Décomposer, c'est séparer un nombre selon les positions. Recomposer, c'est faire le chemin inverse.
            Dans les deux sens, une chose ne change jamais : la valeur totale.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Décompose 4 582',
          subtitle: 'Choisis les bonnes tuiles — attention aux pièges.',
          done: s1,
          content: (kit) => (
            <div className="space-y-5">
              <DecompositionTiles target={CIBLE} solved={s1} onSolved={() => setS1(true)} react={kit.react} />
              {/* Les tuiles viennent d'être posées une par colonne : le mot
                  « décomposer » désigne maintenant un geste connu. */}
              {s1 && (
                <KnowledgeBrick
                  id="decomposer"
                  variant="new"
                  lead="La somme que tu viens de construire porte un nom."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Y a-t-il une seule bonne décomposition ?',
          subtitle: 'Six propositions. Certaines sont justes, d\'autres non.',
          done: s2,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  Pour chaque proposition, dis si elle est bien égale à <strong className="font-mono">4 582</strong>.
                </p>
              }
              rows={PROPOSITIONS.map((p, i) => ({
                id: String(i),
                label: <span className="font-mono font-bold tabular-nums">{p.expr}</span>,
                options: [
                  <><Check className="inline w-3 h-3 mr-1" aria-hidden="true" />= 4 582</>,
                  <><X className="inline w-3 h-3 mr-1" aria-hidden="true" />≠ 4 582</>,
                ],
                correct: p.value === CIBLE ? 0 : 1,
                correction: (
                  <>
                    {p.expr} = {formatFr(p.value)}
                  </>
                ),
              }))}
              solved={s2}
              requires={['decomposer', 'valeur-position']}
              onAnswered={() => setS2(true)}
              feedback={({ allRight }) => (
                <div className="space-y-3">
                  {!allRight && (
                    <Feedback tone="ko">
                      Certaines réponses étaient à revoir — regarde les corrections affichées ci-dessus (calcule
                      chaque somme position par position).
                    </Feedback>
                  )}
                  <Feedback tone="ok">
                    Quatre écritures différentes, un seul et même nombre :{' '}
                    <strong className="font-mono">4 582</strong>. Est-ce toujours le même nombre ?{' '}
                    <strong>Oui</strong> — tant que la somme des morceaux redonne 4 582, on peut regrouper comme
                    on veut. La décomposition « par positions » n'est qu'une décomposition parmi d'autres, mais
                    c'est la plus utile pour lire le nombre.
                  </Feedback>
                </div>
              )}
            />
          ),
        },
        {
          num: 3,
          title: 'Recompose : de la somme au nombre',
          subtitle: 'Le chemin inverse — et c\'est là que les zéros se rappellent à toi.',
          done: s3,
          content: (
            <div className="space-y-6">
              {/* Le chemin inverse a son piège propre (la colonne vide) : la
                  méthode se pose ICI, avant les trois saisies. */}
              <KnowledgeBrick
                id="recomposer"
                variant="new"
                lead="Tu viens de démonter 4 582 ; on va maintenant faire le chemin dans l'autre sens."
              />
              {RECOMPOSITIONS.map((item, i) => (
                <div key={item.expr} className="border-t border-slate-100 pt-4 first:border-0 first:pt-0">
                  <NumericQuestion
                    prompt={<span className="font-mono font-bold text-lg tabular-nums">{item.expr} =</span>}
                    expected={item.answer}
                    parse={parseFr}
                    requires={['recomposer', 'zero-place']}
                    explain="chaque morceau de la somme occupe une colonne différente du tableau de numération."
                    explainFor={(n) =>
                      item.trap && n === parseFr(item.trap) ? (
                        <>
                          en collant les morceaux tu obtiens {item.trap}, mais une position a disparu ! Il faut
                          écrire un <strong className="font-mono">0</strong> dans chaque colonne vide pour que
                          les autres chiffres restent à leur place.
                        </>
                      ) : (
                        'additionne les morceaux en respectant les positions : chacun occupe une colonne différente.'
                      )
                    }
                    solved={recompDone.includes(i)}
                    onAnswered={() => setRecompDone((d) => (d.includes(i) ? d : [...d, i]))}
                  />
                </div>
              ))}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Défi : le zéro, gardien des positions',
          subtitle: 'Repère les positions vides, puis explique à quoi sert le zéro.',
          done: s4,
          content: (kit) => (
            <div className="space-y-5">
              {ZEROS.map((n, i) =>
                i === 0 || zerosDone.includes(i - 1) ? (
                  <ZeroHunt
                    key={n}
                    n={n}
                    solved={zerosDone.includes(i)}
                    onSolved={() => setZerosDone((d) => (d.includes(i) ? d : [...d, i]))}
                    react={kit.react}
                  />
                ) : null
              )}

              {zerosDone.length === ZEROS.length && (
                <div className="space-y-4 border-t border-slate-200 pt-4">
                  <TapQuestion
                    prompt={ZERO_QUESTION.q}
                    options={ZERO_QUESTION.options}
                    correct={ZERO_QUESTION.correct}
                    cols={1}
                    requires={['zero-place', 'valeur-position']}
                    explain={ZERO_QUESTION.explain}
                    onAnswered={() => setZeroRevealed(true)}
                  />

                  {zeroRevealed && (
                    <div className="border-t border-slate-100 pt-4">
                      <TapQuestion
                        prompt={ERREUR_ZERO.q}
                        options={ERREUR_ZERO.options}
                        correct={ERREUR_ZERO.correct}
                        cols={1}
                        requires={['zero-place', 'valeur-position']}
                        explain={ERREUR_ZERO.explain}
                        onAnswered={() => setErrRevealed(true)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Tu sais démonter et remonter un nombre. Au module suivant, tu
          te sers des colonnes pour décider lequel de deux nombres est le plus grand.
        </KnowledgeSnapshot>
      }
    />
  );
}
