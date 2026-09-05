import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProportionTable from '../components/ProportionTable';
import QuantityMachine from '../components/QuantityMachine';
import { CREPES, JUS } from '../components/kermesseData';
import { applyRule, buildRows, ratioAt, parseDec, formatDec } from '../components/proportionUtils';

/**
 * Module 2 — DÉCOUVERTE : le nombre caché.
 *
 * L'élève a constaté au module 1 que « ça double ensemble ». Il découvre ici
 * POURQUOI : de la première grandeur à la seconde, on multiplie toujours par
 * le MÊME nombre. La découverte se fait en calculant les rapports un par un
 * et en voyant apparaître une colonne de nombres identiques — la régularité
 * n'est pas affirmée, elle se constate.
 *
 * Le mot « coefficient » est introduit comme un raccourci de langage pour
 * « le nombre par lequel on multiplie » (le programme de 6e ne demande pas
 * plus), et immédiatement réutilisé sur un second exemple à coefficient
 * décimal (0,5) pour qu'il ne reste pas collé au cas k = 3.
 */
const ROWS = buildRows(CREPES.rule, [1, 2, 3, 5]);
const K = ratioAt(CREPES.rule, 1); // 3

export default function Module02MemeNombre() {
  const [checked, setChecked] = useState([]);
  const [coefDone, setCoefDone] = useState(false);
  const [predireDone, setPredireDone] = useState(false);
  const [jusDone, setJusDone] = useState(false);
  const [jusQty, setJusQty] = useState(2);

  const allChecked = checked.length === ROWS.length;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Toujours le même nombre"
      moduleSubtitle="Le passage d’une grandeur à l’autre cache une multiplication."
      estimatedTime="10 min"
      brief={{
        tag: '⚖️ Mission 02',
        title: 'Comment la machine calcule-t-elle, au juste ?',
        body: (
          <p>
            Tu sais que ça double ensemble. Reste à trouver l'opération exacte qui mène des jetons aux
            crêpes — et à vérifier qu'elle ne change jamais.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Cherche l’opération, ligne par ligne',
          done: allChecked,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Pour chaque ligne, touche l'opération qui mène des jetons aux crêpes.
              </p>
              <div className="space-y-2">
                {ROWS.map((r, i) => {
                  const done = checked.includes(i);
                  return (
                    <div
                      key={r.x}
                      className={`rounded-2xl border-2 p-3 flex items-center justify-between gap-3 ${
                        done ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <span className="font-mono text-sm text-slate-700 whitespace-nowrap">
                        {r.x} → {r.y}
                      </span>
                      {done ? (
                        <span className="font-mono text-sm font-bold text-emerald-700">
                          {r.x} × {K} = {r.y}
                        </span>
                      ) : (
                        <div className="flex gap-1.5">
                          {[K, r.y - r.x].map((cand, ci) => (
                            <button
                              key={ci}
                              type="button"
                              onClick={() => {
                                if (ci === 0) {
                                  const next = [...checked, i];
                                  setChecked(next);
                                  kit.react(true);
                                } else {
                                  kit.react(false);
                                }
                              }}
                              className="min-h-[40px] px-3 py-1.5 rounded-lg border-2 border-slate-300 bg-white font-mono text-xs font-bold text-slate-700 hover:border-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                            >
                              {ci === 0 ? `× ${K}` : `+ ${r.y - r.x}`}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {!allChecked && checked.length > 0 && (
                <Feedback tone="info">
                  Les additions marchent aussi ligne par ligne… mais regarde bien : « + 2 » puis « + 4 » puis
                  « + 6 », l'ajout change à chaque fois. La multiplication, elle, ne change pas.
                </Feedback>
              )}
              {allChecked && (
                <Feedback tone="ok">
                  Sur les quatre lignes, c'est le même <strong>× {K}</strong>. Ce nombre qui ne change jamais
                  est la clé de la machine.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le nombre qui ne change pas',
          done: coefDone,
          content: (
            <div className="space-y-3">
              <ProportionTable
                xLabel="Jetons"
                yLabel="Crêpes"
                columns={ROWS}
                coefficient={K}
                caption="Le même × 3 sur chaque colonne"
              />
              <TapQuestion
                prompt="Comment appelle-t-on ce nombre par lequel on multiplie toujours ?"
                options={['Le total', 'Le coefficient de proportionnalité', 'La différence']}
                correct={1}
                cols={1}
                explain="On l’appelle le COEFFICIENT de proportionnalité : le nombre par lequel on multiplie la première grandeur pour obtenir la seconde. Ici, il vaut 3."
                solved={coefDone}
                onAnswered={() => setCoefDone(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Utilise-le',
          done: predireDone,
          content: (
            <NumericQuestion
              prompt="Sans compter un seul jeton : combien de crêpes pour 12 jetons ?"
              suffix="crêpes"
              expected={applyRule(CREPES.rule, 12)}
              parse={parseDec}
              display={formatDec(applyRule(CREPES.rule, 12))}
              explain={<>12 × {K} = <strong>{applyRule(CREPES.rule, 12)} crêpes</strong>. Le coefficient permet de répondre pour N’IMPORTE quelle quantité, sans dessiner.</>}
              explainFor={(n) =>
                n === 15
                  ? 'Tu as ajouté 3 au lieu de multiplier par 3. Le coefficient se MULTIPLIE : 12 × 3.'
                  : n === 4
                  ? 'Tu as divisé par 3 : cela répondrait à « combien de jetons pour 12 crêpes ». Ici on va des jetons vers les crêpes, donc on multiplie.'
                  : `Multiplie la quantité de jetons par le coefficient : 12 × ${K}.`
              }
              solved={predireDone}
              onAnswered={() => setPredireDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Un autre coefficient',
          done: jusDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Au stand d'à côté, le jus coûte <strong>0,50 € le litre</strong>. Le coefficient n'est pas
                toujours un nombre entier — essaie plusieurs quantités.
              </p>
              <QuantityMachine
                rule={JUS.rule}
                quantities={[1, 2, 4, 6, 10]}
                value={jusQty}
                onChange={setJusQty}
                inputLabel="Litres"
                outputLabel="Prix"
                inputEmoji="🧃"
                outputEmoji="💶"
                outputUnit="€"
                showComputation
              />
              <TapQuestion
                prompt="Quel est le coefficient de cette situation (litres → prix) ?"
                options={['× 2', '× 0,5', '× 5']}
                correct={1}
                cols={3}
                explain="On multiplie le nombre de litres par 0,5 : 4 L → 2 €, 10 L → 5 €. Un coefficient peut être plus petit que 1 — le prix est alors plus petit que la quantité."
                explainWrong="Regarde 4 litres → 2 € : on n’a pas multiplié par 2 (ce serait 8), on a pris la moitié. Le coefficient vaut 0,5."
                solved={jusDone}
                onAnswered={(ok) => { setJusDone(true); if (!ok) kit.react(false); }}
              />
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <X className="w-6 h-6 mx-auto text-sky-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Dans une situation proportionnelle, on passe d'une grandeur à l'autre en multipliant TOUJOURS par
            le même nombre. Mais toutes les situations font-elles ça ?
          </p>
        </motion.div>
      }
    />
  );
}
