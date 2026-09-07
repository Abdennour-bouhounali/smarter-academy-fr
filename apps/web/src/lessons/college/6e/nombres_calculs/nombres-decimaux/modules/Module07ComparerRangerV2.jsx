import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import NumberLine from '../../../../../common/components/NumberLine';
import OrderingGame from '../../../../../common/components/OrderingGame';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import UnitGrid from '../components/UnitGrid';
import { formatDec, decCells, alignDecimals } from '../components/decimalUtils';

/**
 * Module 7 V2 — reconstruit sur le lesson kit.
 * Étapes 1, 2 (les deux QCM), 4 (chasse aux raisonnements faux) : TapQuestion.
 * Étape 3 : laboratoire colonne par colonne, manipulation maison (le geste
 * de comparaison lui-même est la pédagogie) — contrat kit respecté, un seul
 * essai puis reveal inconditionnel du bon signe.
 * Étape 5 : OrderingGame avec `formative` (jamais bloquant).
 */
const VISUEL = { a: 2.7, b: 2.4 };
const CRITIQUE = { a: 2.37, b: 2.4 };

const CRITIQUE_Q = {
  q: 'Lequel de ces deux nombres est le plus grand ?',
  options: ['2,37', '2,4', 'Ils sont égaux'],
  correct: 1,
  explain: "2,4 est le plus grand. Le piège consiste à comparer 37 et 4 comme des entiers — mais 37 compte des CENTIÈMES et 4 compte des DIXIÈMES : ce ne sont pas les mêmes parts.",
};

const ALIGN_Q = {
  q: 'Complète 2,4 pour lui donner autant de décimales que 2,37. Que devient-il ?',
  options: ['2,04', '2,40', '2,437', '2,04 ou 2,40 au choix'],
  correct: 1,
  explain: "On ajoute un zéro À LA FIN : 2,4 = 2,40. La quantité ne change pas, mais on peut maintenant comparer des parts de même taille : 37 centièmes contre 40 centièmes.",
};

const LABO = { a: 5.284, b: 5.248 };

function DecCompareLab({ a, b, solved, onSolved, react }) {
  const opts = { intPlaces: 1, decPlaces: 3 };
  const cellsA = decCells(a, opts);
  const cellsB = decCells(b, opts);
  const firstDiff = cellsA.findIndex((c, i) => c.digit !== cellsB[i].digit);

  const [revealed, setRevealed] = useState(solved ? firstDiff + 1 : 0);
  const [pick, setPick] = useState(solved ? (a > b ? '>' : a < b ? '<' : '=') : null);
  const [checked, setChecked] = useState(false);

  const stopped = firstDiff !== -1 && revealed > firstDiff;
  const nextCell = cellsA[revealed];
  const correctSymbol = a > b ? '>' : a < b ? '<' : '=';
  const intCount = cellsA.filter((c) => c.side === 'int').length;
  const isRight = pick === correctSymbol;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="mx-auto border-separate border-spacing-1 min-w-max">
          <thead>
            <tr>
              <th className="w-10" />
              {cellsA.map((c, i) => (
                <React.Fragment key={c.key}>
                  {i === intCount && <th className="w-4" aria-hidden="true" />}
                  <th className="px-1 pb-1 text-[9px] sm:text-[10px] font-mono text-slate-500 font-semibold uppercase">{c.label}</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {[{ label: 'A', cells: cellsA }, { label: 'B', cells: cellsB }].map((row, ri) => (
              <React.Fragment key={row.label}>
                {ri === 1 && (
                  <tr>
                    <td />
                    {cellsA.map((c, i) => {
                      const isCompared = i < revealed;
                      const equal = cellsA[i].digit === cellsB[i].digit;
                      const isDecisive = i === firstDiff && revealed > firstDiff;
                      return (
                        <React.Fragment key={c.key}>
                          {i === intCount && <td aria-hidden="true" />}
                          <td className="text-center">
                            {isCompared && (
                              <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className={`inline-block font-mono font-extrabold text-lg ${isDecisive ? 'text-rose-600' : equal ? 'text-slate-400' : 'text-slate-300'}`}>
                                {equal ? '=' : cellsA[i].digit > cellsB[i].digit ? '>' : '<'}
                              </motion.span>
                            )}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                )}
                <tr>
                  <th scope="row" className="text-[11px] font-mono font-bold text-slate-400 pr-1 text-right">{row.label}</th>
                  {row.cells.map((c, i) => {
                    const isCompared = i < revealed;
                    const isDecisive = i === firstDiff && revealed > firstDiff;
                    return (
                      <React.Fragment key={c.key}>
                        {i === intCount && <td className="text-center align-middle"><span className="text-2xl font-extrabold text-rose-500" aria-hidden="true">,</span></td>}
                        <td className="p-0.5">
                          <div className={`w-10 h-11 sm:w-12 sm:h-12 mx-auto rounded-xl border-2 flex items-center justify-center font-mono font-extrabold text-lg sm:text-xl tabular-nums transition-all ${isDecisive ? 'border-rose-400 bg-rose-50 text-rose-700' : isCompared ? 'border-slate-300 bg-slate-100 text-slate-500' : 'border-slate-200 bg-white text-slate-800'}`}>
                            {c.digit}
                          </div>
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {!stopped && !solved && (
        <div className="text-center space-y-2">
          <ValidateButton onClick={() => setRevealed((r) => r + 1)} tone="indigo">
            <ArrowDown className="inline w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            Comparer les {nextCell?.label.toLowerCase()}
          </ValidateButton>
          <p className="text-xs text-slate-500">
            On commence par la <strong>partie entière</strong>, puis on avance de gauche à droite.
          </p>
        </div>
      )}

      {revealed > 0 && !stopped && (
        <Feedback tone="info">
          {cellsA[revealed - 1].digit} contre {cellsB[revealed - 1].digit} à la position des{' '}
          {cellsA[revealed - 1].label.toLowerCase()} : <strong>égalité</strong>. On passe à la colonne suivante.
        </Feedback>
      )}

      {stopped && (
        <div className="space-y-4">
          <Feedback tone="hint">
            Première différence aux <strong>{cellsA[firstDiff].label.toLowerCase()}</strong> :{' '}
            {cellsA[firstDiff].digit} contre {cellsB[firstDiff].digit}. Les colonnes suivantes ne peuvent plus
            renverser la décision, car elles pèsent 10 fois moins.
          </Feedback>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="font-mono font-extrabold text-2xl text-slate-800 tabular-nums">{formatDec(a)}</span>
            <div className="flex gap-1.5">
              {['<', '>', '='].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  // RÈGLE PROJET (2026-09-06) : les trois signes restent
                  // cliquables après la validation — l'élève doit pouvoir
                  // reposer le bon signe lui-même, pas seulement le lire.
                  onClick={() => { setPick(sym); setChecked(false); }}
                  aria-label={`Signe ${sym}`}
                  // `solved` (the parent's onSolved → s3) flips true the instant Valider is
                  // clicked, even for a wrong pick — it must never override the symbol the
                  // student just chose this session. Only fall back to the correct symbol on
                  // a genuine REVISIT, where `pick` is still at its just-mounted null.
                  className={`w-12 h-12 rounded-xl border-2 font-mono font-extrabold text-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${(pick !== null ? pick : solved ? correctSymbol : null) === sym ? 'bg-blue-600 border-blue-700 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'}`}
                >
                  {sym}
                </button>
              ))}
            </div>
            <span className="font-mono font-extrabold text-2xl text-slate-800 tabular-nums">{formatDec(b)}</span>
          </div>

          {!solved && (
            <div className="text-center">
              <ValidateButton onClick={() => { setChecked(true); react(isRight); onSolved?.(); }} disabled={!pick}>
                Valider
              </ValidateButton>
            </div>
          )}

          {checked && !isRight && (
            <Feedback tone="ko">
              Tu as choisi <strong className="font-mono">{pick}</strong>. Bonne réponse :{' '}
              <strong className="font-mono">{correctSymbol}</strong>. Reprends la première différence :{' '}
              {cellsA[firstDiff].digit} contre {cellsB[firstDiff].digit} aux {cellsA[firstDiff].label.toLowerCase()}.
            </Feedback>
          )}

          {/* Le retour énonce la comparaison VRAIE, pas le bouton enfoncé :
              l'élève peut reposer un autre signe sans rendre la phrase fausse. */}
          {solved && (
            <Feedback tone="ok">
              <span className="font-mono font-bold">{formatDec(a)} {correctSymbol} {formatDec(b)}</span> — tout
              s'est joué aux {cellsA[firstDiff].label.toLowerCase()}.
              {pick !== null && pick !== correctSymbol && (
                <> Le signe posé en ce moment est <strong className="font-mono">{pick}</strong> : repose{' '}
                <strong className="font-mono">{correctSymbol}</strong> pour retrouver l'écriture juste.</>
              )}
            </Feedback>
          )}
        </div>
      )}
    </div>
  );
}

const ERREURS = [
  { claim: '« 4,8 < 4,35 car 8 < 35 »', options: ["On compare 8 dixièmes avec 35 centièmes : il faut d'abord écrire 4,8 = 4,80, puis comparer 80 et 35 centièmes.", 'Le raisonnement est correct.', 'Il fallait comparer le nombre de chiffres après la virgule.', 'Il fallait comparer les parties entières, qui sont différentes.'], correct: 0, truth: '4,8 > 4,35', detail: '4,8 = 4,80. Or 80 centièmes > 35 centièmes, donc 4,8 > 4,35.' },
  { claim: '« 3,09 > 3,9 parce que 09 > 9 »', options: ['Le raisonnement est correct.', "On ne peut pas comparer « 09 » et « 9 » comme des entiers : il faut aligner, 3,9 = 3,90, puis comparer 09 et 90 centièmes.", 'Il fallait ajouter les chiffres après la virgule.', 'Il fallait comparer les parties entières.'], correct: 1, truth: '3,09 < 3,90', detail: '3,9 = 3,90. Or 9 centièmes < 90 centièmes, donc 3,09 < 3,9.' },
  { claim: '« 5,40 > 5,4 car 40 > 4 »', options: ['Le raisonnement est correct.', 'Non : le zéro est ajouté à la fin, donc 5,40 = 5,4. Ce sont deux écritures du même nombre.', 'Non : 5,40 est plus petit que 5,4.', 'Non : il faut comparer les parties entières.'], correct: 1, truth: '5,40 = 5,4', detail: "40 centièmes = 4 dixièmes : la quantité est identique, seule l'écriture change." },
  { claim: '« 2,105 = 2,15 »', options: ['Le raisonnement est correct.', 'Non : dans 2,105 le 1 est aux dixièmes, le 0 aux centièmes et le 5 aux millièmes ; dans 2,15 le 5 est aux centièmes. Les colonnes ne correspondent pas.', 'Non : 2,105 est plus grand que 2,15.', 'Non : les deux nombres sont plus petits que 2.'], correct: 1, truth: '2,105 < 2,150', detail: 'En alignant : 2,105 et 2,150. On compare 105 millièmes contre 150 millièmes, donc 2,105 < 2,15.' },
];

const A_RANGER = [
  { id: 'r1', value: 2.5, text: '2,5' },
  { id: 'r2', value: 2.05, text: '2,05' },
  { id: 'r3', value: 2.55, text: '2,55' },
  { id: 'r4', value: 2.15, text: '2,15' },
  { id: 'r5', value: 2.5, text: '2,50' },
];

export default function Module07ComparerRanger() {
  const [s1, setS1] = useState(false);
  const [critOk, setCritOk] = useState(false);
  const [s2, setS2] = useState(false);
  const [laboDone, setLaboDone] = useState(false);
  const [erreursDone, setErreursDone] = useState([]);
  const [rangeDone, setRangeDone] = useState(false);

  const s3 = laboDone;
  const s4 = erreursDone.length === ERREURS.length;
  const s5 = rangeDone;

  const align = alignDecimals(CRITIQUE.a, CRITIQUE.b);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Comparer et ranger"
      moduleSubtitle="Pourquoi 2,4 est plus grand que 2,37 — et comment ne plus jamais se tromper."
      estimatedTime="14 min"
      brief={{
        tag: '⚖️ Comparaison',
        title: "Comparer des décimaux, ce n'est pas comparer des entiers.",
        body: (
          <p>
            Le plus grand piège des décimaux est ici. Tu vas construire une méthode sûre — et démasquer quatre
            raisonnements qui semblent logiques mais qui sont faux.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: "D'abord avec les yeux",
          done: s1,
          content: (
            <div className="space-y-4">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
                <NumberLine
                  min={2} max={3} step={0.1} labelEvery={5} height={170}
                  format={(v) => formatDec(v)}
                  markers={[{ value: VISUEL.b, label: '2,4', color: '#dc2626' }, { value: VISUEL.a, label: '2,7', color: '#059669' }]}
                  ariaLabel="2,4 et 2,7 placés entre 2 et 3"
                />
              </div>
              <TapQuestion
                prompt="Lequel est le plus grand ?"
                options={['2,7', '2,4', 'Ils sont égaux']}
                correct={0}
                cols={3}
                requires={['colonnes-decimales', 'dixieme']}
                explain={
                  <>
                    2,7 est plus à droite sur la droite graduée : <strong className="font-mono">2,7 &gt; 2,4</strong>.
                    Les parties entières sont égales (2 = 2), donc tout se joue aux dixièmes : 7 contre 4.
                  </>
                }
                solved={s1}
                onAnswered={() => setS1(true)}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le cas qui piège tout le monde : 2,37 et 2,4',
          subtitle: "Ici, le nombre qui a le plus de chiffres n'est PAS le plus grand.",
          done: s2,
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[CRITIQUE.a, CRITIQUE.b].map((v) => (
                  <div key={v} className="rounded-2xl border-2 border-slate-200 bg-white p-4 text-center">
                    <div className="font-mono font-extrabold text-2xl text-slate-800">{formatDec(v)}</div>
                  </div>
                ))}
              </div>

              <TapQuestion
                prompt={CRITIQUE_Q.q}
                options={CRITIQUE_Q.options}
                correct={CRITIQUE_Q.correct}
                cols={3}
                requires={['valeur-position-decimale', 'dixieme', 'centieme']}
                explain={CRITIQUE_Q.explain}
                solved={critOk}
                onAnswered={() => setCritOk(true)}
              />

              {critOk && (
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <TapQuestion
                    prompt={ALIGN_Q.q}
                    options={ALIGN_Q.options}
                    correct={ALIGN_Q.correct}
                    cols={2}
                    requires={['deux-zeros', 'ecritures-equivalentes']}
                    explain={ALIGN_Q.explain}
                    solved={s2}
                    onAnswered={() => setS2(true)}
                  />
                </div>
              )}

              {s2 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[{ txt: align.aText, cents: align.aUnits - 200, tone: 'rose' }, { txt: align.bText, cents: align.bUnits - 200, tone: 'emerald' }].map((x) => (
                      <div key={x.txt} className="border-2 border-slate-200 rounded-2xl p-3 bg-white space-y-2">
                        <div className="text-center font-mono font-extrabold text-xl text-slate-800">{x.txt}</div>
                        <UnitGrid parts={100} shaded={x.cents} tone={x.tone} showCount={false} size="sm" />
                        <p className="text-[11px] text-center font-mono text-slate-500">{x.cents} centièmes</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    Les 2 unités entières sont identiques : on ne compare ici que la partie décimale.
                  </p>
                  <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-1">
                    <div className="font-mono text-xl font-bold text-amber-300">37 centièmes &lt; 40 centièmes</div>
                    <div className="font-mono text-2xl font-extrabold">2,37 &lt; 2,4</div>
                    <p className="text-xs text-slate-400 pt-1">
                      La méthode : on complète avec des zéros pour avoir le même nombre de décimales, puis on
                      compare des parts de même taille.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Laboratoire : 5,284 et 5,248',
          subtitle: "Compare colonne par colonne et arrête-toi à la première différence.",
          done: s3,
          content: (kit) => (
            <>
              <DecCompareLab a={LABO.a} b={LABO.b} solved={laboDone} onSolved={() => setLaboDone(true)} react={kit.react} />
              {s3 && (
                <KnowledgeBrick
                  id="comparer-decimaux"
                  variant="new"
                  lead="Tu as dévoilé les colonnes jusqu'à la première différence : c'est toute la méthode."
                />
              )}
            </>
          ),
        },
        {
          num: 4,
          title: 'Chasse aux raisonnements faux',
          subtitle: 'Quatre élèves se sont trompés. Trouve l\'erreur de chacun.',
          done: s4,
          content: (
            <div className="space-y-4">
              {ERREURS.map((e, i) =>
                i === 0 || erreursDone.includes(i - 1) ? (
                  <div key={e.claim} className="space-y-3 border-2 border-amber-200 bg-amber-50/50 rounded-2xl p-4">
                    <div className="text-[11px] font-mono font-bold text-amber-600 uppercase tracking-wider">
                      Raisonnement d'élève à examiner
                    </div>
                    <p className="text-base font-semibold text-slate-800 italic">{e.claim}</p>
                    <TapQuestion
                      prompt="Où est l'erreur ?"
                      options={e.options}
                      correct={e.correct}
                      cols={1}
                      requires={['comparer-decimaux', 'deux-zeros', 'valeur-position-decimale']}
                      explain={
                        <>
                          La bonne réponse est <strong className="font-mono">{e.truth}</strong>. {e.detail}
                        </>
                      }
                      solved={erreursDone.includes(i)}
                      onAnswered={() => setErreursDone((d) => (d.includes(i) ? d : [...d, i]))}
                    />
                  </div>
                ) : null
              )}
            </div>
          ),
        },
        {
          num: 5,
          title: 'Mets les cinq cartes en file',
          subtitle: 'Du plus petit au plus grand. Attention : deux cartes cachent le même nombre.',
          done: s5,
          content: (
            <>
              <OrderingGame
                items={A_RANGER}
                direction="asc"
                solved={rangeDone}
                onSolved={() => setRangeDone(true)}
                format={(v) => formatDec(v)}
                instruction="Du plus petit au plus grand. Astuce : complète mentalement chaque nombre avec des zéros pour qu'ils aient tous deux décimales."
                formative
              />
              {s5 && (
                <KnowledgeBrick
                  id="ranger-decimaux"
                  variant="new"
                  lead="La file que tu viens de construire, et celle que tu obtiendrais à l'envers, portent chacune un nom."
                />
              )}
            </>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={7}>
          <strong>La suite.</strong> Tu sais départager et ranger des décimaux. Au module
          suivant, chacun reçoit une place précise sur une droite — que l'on peut zoomer.
        </KnowledgeSnapshot>
      }
    />
  );
}
