import React, { useState } from 'react';
import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DurationLine from '../components/DurationLine';
import { hopsBetween, formatTime, parseDec, formatDec } from '../components/durationUtils';

/**
 * Module 5 — formalisation : la méthode des sauts.
 *
 * Jamais de « 12 h 15 − 9 h 47 posé en colonnes » : on SAUTE. L'élève
 * construit lui-même les sauts en tapant les bonnes étapes dans l'ordre ;
 * chaque bonne étape dessine son arc sur la ligne du temps. Un mauvais
 * choix révèle pourquoi il ne colle pas — sans jamais bloquer.
 */
const START = { h: 9, min: 47 };
const END = { h: 12, min: 15 };
const HOPS = hopsBetween(START, END); // +13 min → 10h00 ; +2 h → 12h00 ; +15 min → 12h15

// Jetons proposés : les 3 vrais sauts + 1 distracteur plausible.
const CHIPS = [
  { id: 'hop-13', hopIndex: 0, label: '+ 13 min → 10 h 00' },
  { id: 'hop-2h', hopIndex: 1, label: '+ 2 h → 12 h 00' },
  { id: 'hop-15', hopIndex: 2, label: '+ 15 min → 12 h 15' },
  { id: 'distracteur', hopIndex: -1, label: '+ 28 min → 10 h 15' },
];

function SautsBuilder({ react, solved, onSolved }) {
  const [visibleCount, setVisibleCount] = useState(solved ? HOPS.length : 0);
  const [wrongPick, setWrongPick] = useState(null);
  const done = solved || visibleCount >= HOPS.length;

  const tapChip = (chip) => {
    if (done) return;
    if (chip.hopIndex === visibleCount) {
      setWrongPick(null);
      const next = visibleCount + 1;
      setVisibleCount(next);
      react(true);
      if (next >= HOPS.length) onSolved?.();
    } else {
      setWrongPick(chip.id);
      react(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Le train part à <strong>{formatTime(START)}</strong> et arrive à <strong>{formatTime(END)}</strong>.
        Construis le trajet en tapant les sauts DANS L'ORDRE : d'abord jusqu'à l'heure ronde, puis les heures
        entières, puis le reste.
      </p>
      <DurationLine start={START} end={END} hops={HOPS} visibleCount={done ? HOPS.length : visibleCount} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="group" aria-label="Sauts disponibles">
        {CHIPS.map((chip) => {
          const used = chip.hopIndex !== -1 && chip.hopIndex < visibleCount;
          return (
            <button
              key={chip.id}
              type="button"
              disabled={done || used}
              onClick={() => tapChip(chip)}
              className={`px-3 py-2.5 rounded-xl border-2 font-mono text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                used
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : wrongPick === chip.id
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-amber-400'
              }`}
            >
              {chip.label} {used && '✓'}
            </button>
          );
        })}
      </div>
      {wrongPick === 'distracteur' && !done && (
        <Feedback tone="hint">
          + 28 min mènerait à 10 h 15… mais en partant de 9 h 47, le saut NATUREL est d'abord d'atteindre l'heure
          ronde : 10 h 00. Combien de minutes manquent entre 47 et 60 ?
        </Feedback>
      )}
      {wrongPick && wrongPick !== 'distracteur' && !done && (
        <Feedback tone="hint">
          Ce saut viendra plus tard : suis l'ordre — heure ronde d'abord, puis heures entières, puis le reste.
        </Feedback>
      )}
      {done && (
        <Feedback tone="ok">
          Trois sauts : <strong>13 min</strong> (jusqu'à 10 h), <strong>2 h</strong> (jusqu'à 12 h),{' '}
          <strong>15 min</strong> (jusqu'à 12 h 15). Il ne reste qu'à les additionner.
        </Feedback>
      )}
    </div>
  );
}

export default function Module05MethodeSauts() {
  const [sautsDone, setSautsDone] = useState(false);
  const [totalHDone, setTotalHDone] = useState(false);
  const [totalMinDone, setTotalMinDone] = useState(false);
  const [reverseDone, setReverseDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="La méthode des sauts"
      moduleSubtitle="De 9 h 47 à 12 h 15 : saute d’heure ronde en heure ronde."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 05',
        title: 'Interdiction de poser la soustraction !',
        body: (
          <p>
            « 12 h 15 − 9 h 47 » posé en colonnes finit presque toujours en catastrophe (le 60 n'est pas un 100).
            Les pros du rail sautent d'heure ronde en heure ronde.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Construis les sauts',
          done: sautsDone,
          content: (kit) => (
            <div className="space-y-5">
              <SautsBuilder react={kit.react} solved={sautsDone} onSolved={() => setSautsDone(true)} />
              {/* Les trois sauts viennent d'être posés dans l'ordre sur la
                  ligne du temps : la méthode se fixe sur ce geste, avant
                  qu'on demande d'additionner. */}
              {sautsDone && (
                <KnowledgeBrick
                  id="methode-sauts"
                  variant="new"
                  lead="Les trois sauts que tu viens de placer forment une méthode complète — celle des professionnels du rail."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Additionne les sauts',
          done: totalHDone && totalMinDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">
                13 min + 2 h + 15 min : quelle est la durée totale du trajet ? (deux réponses)
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <NumericQuestion
                  prompt="Heures :"
                  suffix="h"
                  expected={2}
                  parse={parseDec}
                  display={formatDec(2)}
                  explain={<>Le seul saut en heures : <strong>2 h</strong>.</>}
                  explainFor={() => 'Un seul saut compte des heures entières.'}
                  requires={['unites-temps', 'methode-sauts']}
                  solved={totalHDone}
                  onAnswered={() => setTotalHDone(true)}
                />
                <NumericQuestion
                  prompt="Minutes :"
                  suffix="min"
                  expected={28}
                  parse={parseDec}
                  display={formatDec(28)}
                  explain={<>13 + 15 = <strong>28 min</strong> : le trajet dure 2 h 28 min.</>}
                  explainFor={() => 'Additionne les deux sauts en minutes : 13 + 15.'}
                  requires={['unites-temps', 'methode-sauts', 'base-60']}
                  solved={totalMinDone}
                  onAnswered={() => setTotalMinDone(true)}
                />
              </div>
              {totalHDone && totalMinDone && (
                <>
                  <Feedback tone="ok">
                    Durée du trajet : <strong>2 h 28 min</strong>. (La soustraction posée aurait donné « 2 h 68 » ou
                    pire — les sauts, eux, ne trahissent jamais.)
                  </Feedback>
                  {/* « 2 h 68 » vient d'être évoqué : c'est le moment de
                      poser la règle de retenue, exigée par le boss final. */}
                  <KnowledgeBrick
                    id="mem-retenue-60"
                    variant="new"
                    lead="Pourquoi « 2 h 68 min » n’est jamais une réponse finie."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'La méthode en marche arrière',
          done: reverseDone,
          content: (
            <NumericQuestion
              prompt="Le film dure 1 h 50 min et se termine à 21 h 30. À quelle heure a-t-il commencé ? (réponds en minutes après 19 h : par ex. 19 h 40 → 40)"
              suffix="min après 19 h"
              expected={40}
              parse={parseDec}
              display={formatDec(40)}
              explain={<>En arrière depuis 21 h 30 : − 1 h → 20 h 30, puis − 30 min → 20 h 00, puis − 20 min → <strong>19 h 40</strong>. Les sauts marchent dans les deux sens.</>}
              explainFor={() => 'Recule par sauts : enlève d’abord 1 h (→ 20 h 30), puis 30 min (→ 20 h), puis les 20 min restantes.'}
              requires={['unites-temps', 'lire-cadran', 'methode-sauts']}
              solved={reverseDone}
              onAnswered={() => setReverseDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Ta carte est complète. Le module suivant n'ajoute rien : il
          envoie tout cela sur de vrais horaires.
        </KnowledgeSnapshot>
      }
    />
  );
}
