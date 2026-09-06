import React, { useState } from 'react';
import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FunctionMachine from '../components/FunctionMachine';
import RuleTester from '../components/RuleTester';
import { affine, imageOf, planeFor } from '../components/functionUtils';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 1 — DÉCLENCHEUR : « La machine mystérieuse » (manipulation signature).
 *
 * Activity: nourrir une boîte noire avec des nombres — les siens compris —,
 *   tester des hypothèses de règle sur les couples obtenus, prédire une sortie
 *   jamais vue, puis voir les mêmes couples sous trois habits.
 * Mathematical objective: faire naître l'idée de FONCTION comme procédé
 *   stable — la même entrée redonne toujours la même sortie, et UNE règle
 *   explique tous les couples, y compris ceux qu'on n'a jamais essayés.
 * Student action: choisir ou taper une entrée, lancer ; choisir une règle
 *   candidate ; prédire ; relancer une entrée déjà vue ; basculer de vue.
 * Controlled variable: x, l'entrée (étape 1, 4) ; la règle candidate (2).
 * Mathematical state: { rule: 3x − 1 (cachée), tested[] } — tout le reste
 *   (verdicts, prédiction attendue, points du repère) en est dérivé.
 * Visual consequence: chaque lancement ajoute une colonne au journal ; une
 *   règle candidate se colore ✓ / ✗ colonne par colonne ; la prédiction est
 *   confirmée par la machine ; un même x redonne le même y ; les couples
 *   deviennent des points.
 * Expected observation: « ce n'est pas au hasard — il y a une règle, une
 *   seule, et elle vaut pour tous les nombres ».
 * Misconception targeted: « une fonction est une liste de nombres » (défaite
 *   par la prédiction sur un x jamais essayé) ; « une règle qui marche une
 *   fois est la bonne » (défaite par le testeur, qui rejoue TOUS les couples).
 * Feedback: la sortie elle-même ; le décompte d'accords du testeur ; la
 *   confrontation prédiction / machine. Jamais un « faux » sec.
 * Formalization: aucune ici — les mots « image », « antécédent », f(x) sont
 *   le travail du module 2. La règle est dite en mots (« × 3 puis − 1 »).
 * Scaffolding: règle cachée (SHOW) → candidates fermées (TRY) → prédiction
 *   libre (EXPLORE) → trois représentations (TRANSFER).
 * Transfer: la même machine, règle affichée, ouvre le module 2 ; le repère de
 *   l'étape 5 annonce le module 4 sans le faire (aucun point n'est placé ici).
 */

const RULE = affine(3, -1);       // règle secrète : ×3 puis −1
const XS = [-2, -1, 0, 1, 2, 3, 4];
const PREDICT_X = 7;              // jamais proposé par les pastilles
const CUSTOM = { min: -100, max: 100 };

const CANDIDATES = [
  { id: 'x3m1', label: '× 3 puis − 1', rule: affine(3, -1) },
  { id: 'm1x3', label: '− 1 puis × 3', rule: affine(3, -3) },
  { id: 'p2', label: '+ 2', rule: affine(1, 2) },
  { id: 'x2p1', label: '× 2 puis + 1', rule: affine(2, 1) },
];
const TRUE_ID = 'x3m1';
const RULE_WORDS = '× 3 puis − 1';

const VIEWS = [
  { id: 'machine', label: 'Machine' },
  { id: 'tableau', label: 'Tableau' },
  { id: 'repere', label: 'Repère' },
];

export default function Module01MachineMysterieuse() {
  const [x, setX] = useState(1);
  const [tested, setTested] = useState([]);
  const [candidate, setCandidate] = useState(null);
  const [found, setFound] = useState(false);
  const [predicted, setPredicted] = useState(false);
  const [rerun, setRerun] = useState(null);
  const [view, setView] = useState('machine');
  const [viewsSeen, setViewsSeen] = useState(() => new Set(['machine']));

  const record = (vx, vy) => {
    setTested((prev) => (prev.some((t) => t.x === vx) ? prev : [...prev, { x: vx, y: vy }]));
  };

  const done1 = tested.length >= 3;
  const done2 = found;
  const done3 = predicted;
  const done4 = rerun !== null;
  const done5 = VIEWS.every((v) => viewsSeen.has(v.id));

  const sortedTested = [...tested].sort((p, q) => p.x - q.x);
  const plane = planeFor(sortedTested);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La machine mystérieuse"
      moduleSubtitle="Une boîte avale un nombre et en recrache un autre. Trouve sa règle."
      estimatedTime="8 min"
      brief={{
        tag: '⚙️ Mission 01',
        title: 'Fais parler la boîte noire',
        tone: 'indigo',
        body: (
          <p>
            Cette machine transforme chaque nombre que tu lui donnes. Personne ne connaît
            sa règle. Donne-lui des nombres — les tiens aussi —, regarde ce qui sort, et
            devine.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Nourris la machine',
          subtitle: 'Choisis une entrée, puis lance. Trois entrées différentes au moins.',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <FunctionMachine
                rule={RULE}
                x={x}
                onXChange={setX}
                xs={XS}
                tested={tested}
                onRun={(vx, vy) => {
                  record(vx, vy);
                  if (!tested.some((t) => t.x === vx)) kit.react(true);
                }}
                showRule={false}
                label="❓ règle secrète"
                allowCustom
                customRange={CUSTOM}
              />
              {!done1 && (
                <Feedback tone="info">
                  Encore <strong>{3 - tested.length}</strong> entrée
                  {3 - tested.length > 1 ? 's' : ''} différente{3 - tested.length > 1 ? 's' : ''}.
                  Essaie un négatif, ou un grand nombre : et si tu mets 0 ?
                </Feedback>
              )}
              {done1 && (
                <>
                  <Feedback tone="ok">
                    Regarde la ligne du bas du journal : que faut-il faire au nombre du haut pour
                    obtenir celui du bas ? Continue d’essayer si tu veux, puis teste ta règle.
                  </Feedback>
                  <KnowledgeBrick
                    id="entree-sortie"
                    variant="new"
                    compact
                    lead="Avant d’aller plus loin, deux mots pour désigner ce que tu manipules."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Teste une règle',
          subtitle: 'Choisis une règle : la machine la rejoue sur tous tes couples.',
          done: done2,
          content: (kit) => (
            <div className="space-y-3">
              <RuleTester
                candidates={CANDIDATES}
                tested={sortedTested}
                selected={candidate}
                onSelect={(id) => {
                  setCandidate(id);
                  const ok = id === TRUE_ID;
                  kit.react(ok);
                  if (ok) setFound(true);
                }}
              />
              {done2 && (
                <Feedback tone="ok">
                  La règle est trouvée : <strong>{RULE_WORDS}</strong>. Elle est d’accord avec
                  tous tes couples. Est-elle aussi d’accord avec un nombre que tu n’as jamais
                  essayé ?
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Prédis, puis vérifie',
          subtitle: `Tu n’as jamais essayé ${formatDec(PREDICT_X)}. Écris ta prédiction, la machine tranchera.`,
          done: done3,
          content: (kit) => (
            <NumericQuestion
              prompt={`Que va renvoyer la machine pour ${formatDec(PREDICT_X)} ?`}
              expected={imageOf(RULE, PREDICT_X)}
              parse={parseDec}
              display={formatDec(imageOf(RULE, PREDICT_X))}
              above={(revealed) => revealed && (
                <FunctionMachine
                  rule={RULE}
                  x={PREDICT_X}
                  frozen
                  showRule={false}
                  label={RULE_WORDS}
                />
              )}
              explain={`${formatDec(PREDICT_X)} × 3 − 1 = ${formatDec(imageOf(RULE, PREDICT_X))}. La machine le confirme sans que tu l’aies essayé : une règle vaut pour TOUS les nombres, pas seulement ceux du journal.`}
              explainFor={(n) => {
                if (n === imageOf(affine(3, -3), PREDICT_X)) return 'Tu as enlevé 1 avant de multiplier. La règle multiplie d’abord, enlève ensuite.';
                if (n === imageOf(affine(2, 1), PREDICT_X)) return 'C’est la règle « × 2 puis + 1 » — le testeur l’avait écartée.';
                return null;
              }}
              requires={['entree-sortie']}
              solved={done3}
              onAnswered={(ok) => { setPredicted(true); }}
            />
          ),
        },
        {
          num: 4,
          title: 'La même entrée, deux fois',
          subtitle: 'Relance la machine avec une entrée déjà utilisée.',
          done: done4,
          content: (kit) => (
            <div className="space-y-3">
              <FunctionMachine
                rule={RULE}
                x={x}
                onXChange={setX}
                xs={sortedTested.map((t) => t.x)}
                tested={[]}
                onRun={(vx, vy) => {
                  if (rerun === null) kit.react(true);
                  setRerun({ x: vx, y: vy });
                }}
                showRule={false}
                label={RULE_WORDS}
              />
              <Feedback tone={done4 ? 'ok' : 'info'}>
                {done4 ? (
                  <>
                    Tu avais obtenu <strong>{formatDec(rerun.y)}</strong> pour{' '}
                    {formatDec(rerun.x)} ; la machine redonne <strong>{formatDec(rerun.y)}</strong>.
                    Relance autant de fois que tu veux : rien ne bougera.
                  </>
                ) : (
                  <>À ton avis : la machine va-t-elle redonner la même sortie, ou une autre ? Lance pour le savoir.</>
                )}
              </Feedback>
              {done4 && (
                <KnowledgeBrick
                  id="mem-une-entree-une-sortie"
                  variant="new"
                  compact
                  lead="Ce que tu viens de vérifier est la propriété qui fait d’une machine une fonction."
                />
              )}
            </div>
          ),
        },
        {
          num: 5,
          title: 'Trois vues de la même machine',
          subtitle: 'Les couples que tu as obtenus, sous trois habits.',
          done: done5,
          content: (kit) => (
            <div className="space-y-3">
              <div className="flex gap-2" role="group" aria-label="Choix de la vue">
                {VIEWS.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setView(v.id);
                      if (!viewsSeen.has(v.id)) {
                        setViewsSeen((prev) => new Set(prev).add(v.id));
                        kit.react(true);
                      }
                    }}
                    aria-pressed={view === v.id}
                    className={`flex-1 min-h-[44px] rounded-xl border-2 text-sm font-semibold transition
                      focus-visible:ring-2 focus-visible:ring-blue-500
                      ${view === v.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'}`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              {view === 'machine' && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                    Entrée → {RULE_WORDS} → sortie
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {sortedTested.map((t) => (
                      <li key={t.x} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-sm tabular-nums whitespace-nowrap">
                        <span className="text-indigo-800 font-bold">{formatDec(t.x)}</span>
                        <span className="text-slate-400 mx-1.5" aria-hidden="true">→</span>
                        <span className="sr-only">donne</span>
                        <span className="text-emerald-700 font-bold">{formatDec(t.y)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {view === 'tableau' && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 overflow-x-auto">
                  <table className="w-full text-sm">
                    <caption className="sr-only">Les couples obtenus, rangés par entrée croissante</caption>
                    <tbody>
                      <tr>
                        <th scope="row" className="text-left pr-2 font-semibold text-slate-600 whitespace-nowrap">Entrée</th>
                        {sortedTested.map((t) => (
                          <td key={`x${t.x}`} className="px-2 font-mono tabular-nums text-center">{formatDec(t.x)}</td>
                        ))}
                      </tr>
                      <tr>
                        <th scope="row" className="text-left pr-2 font-semibold text-slate-600 whitespace-nowrap">Sortie</th>
                        {sortedTested.map((t) => (
                          <td key={`y${t.x}`} className="px-2 font-mono tabular-nums text-center text-emerald-700 font-bold">
                            {formatDec(t.y)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {view === 'repere' && (
                <CoordPlane
                  range={plane.range}
                  unit={plane.unit}
                  unitY={plane.unitY}
                  xStep={plane.xStep}
                  yStep={plane.yStep}
                  points={sortedTested.map((t) => ({ id: `p${t.x}`, x: t.x, y: t.y, color: '#4f46e5' }))}
                  axisLabels={{ x: 'entrée', y: 'sortie' }}
                  ariaLabel="Repère : chaque couple entrée / sortie est un point"
                  caption={false}
                />
              )}

              <Feedback tone={done5 ? 'ok' : 'info'}>
                {done5 ? (
                  <>
                    Trois habits, <strong>une seule machine</strong> : une liste de couples, un
                    tableau, des points. Au module 4, c’est toi qui placeras les points.
                  </>
                ) : (
                  <>Ouvre les trois vues. Que remarques-tu sur les points du repère ?</>
                )}
              </Feedback>
              {done5 && (
                <KnowledgeBrick
                  id="fonction-machine"
                  variant="new"
                  lead="Ce que tu viens d’explorer sous trois habits porte, en mathématiques, un seul nom."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Tu sais ce qu’est une fonction et tu sais la faire tourner.
          Au module suivant, on nomme précisément ce qui entre et ce qui sort — et on apprend à
          l’écrire en une ligne.
        </KnowledgeSnapshot>
      )}
    />
  );
}
