import React, { useState } from 'react';
import { ScrollText, Lightbulb } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProofStrip from '../components/ProofStrip';
import TriangleLab from '../components/TriangleLab';
import { PROOF_STEPS, checkProof, FIGURES } from '../components/triangleUtils';

/**
 * Module 6 — FORMALISATION : rédiger un raisonnement.
 *
 * Activity              assembler une démonstration à partir de cartes.
 * Mathematical objective distinguer donnée, propriété invoquée et conclusion.
 * Student action        taper les étapes dans l'ordre.
 * Controlled variable   l'ordre des étapes.
 * Mathematical state    la suite choisie, comparée à la suite correcte.
 * Visual consequence    la rédaction s'écrit ligne à ligne, avec le rôle de
 *                       chaque étape affiché.
 * Misconception ciblée   « justifier = donner le résultat ». Les distracteurs
 *                       sont des affirmations vraies-en-apparence (les trois
 *                       angles valent 60°, l'angle B vaut 140°) qui sautent
 *                       une étape ou confondent isocèle et équilatéral.
 * Feedback              on montre à quelle ligne le raisonnement dévie.
 * Escape hatch          après 3 essais, la rédaction correcte est révélée et
 *                       l'étape est validée : on n'enferme jamais l'élève.
 */
export default function Module06Justifier() {
  const KEY = 'isocele';
  const { steps: cards, enonce } = PROOF_STEPS[KEY];

  const [chosen, setChosen] = useState([]);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const result = checkProof(chosen, KEY);
  const complete = chosen.length === PROOF_STEPS[KEY].correct.length;
  const done1 = (complete && result.ok) || revealed;

  const [q2, setQ2] = useState(false);

  const pick = (id, react) => {
    const next = [...chosen, id];
    setChosen(next);
    if (next.length === PROOF_STEPS[KEY].correct.length) {
      const r = checkProof(next, KEY);
      setTries((t) => t + 1);
      react(r.ok);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Rédiger la démonstration',
      subtitle: 'Quatre étapes, dans l’ordre : donnée, propriétés, conclusion.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3">
            <p className="text-sm text-slate-800">{enonce}</p>
          </div>
          <TriangleLab
            points={FIGURES.isocele}
            draggable={false}
            showName={false}
            ariaLabel="Triangle ABC isocèle en A, figure d’appui"
          />
          <ProofStrip
            steps={cards}
            chosen={chosen}
            onPick={(id) => pick(id, kit.react)}
            onUndo={() => setChosen((c) => c.slice(0, -1))}
            firstWrong={complete && !result.ok ? result.firstWrong : -1}
            locked={done1}
            revealed={done1}
          />
          {done1 && (
            <Feedback tone="ok">
              {revealed
                ? 'Rédaction révélée. Retiens la charpente : on part de la donnée, on invoque une propriété du cours, puis on conclut par un calcul.'
                : 'Rédaction correcte. Chaque ligne a un rôle : la donnée, les deux propriétés invoquées, puis la conclusion chiffrée.'}
            </Feedback>
          )}
          {complete && !result.ok && !done1 && (
            <div className="space-y-2">
              <Feedback tone="ko">
                Le raisonnement dévie à la ligne {result.firstWrong + 1}. Une démonstration ne peut
                pas sauter d’étape : chaque conclusion doit venir d’une propriété nommée juste avant.
              </Feedback>
              <button
                type="button"
                onClick={() => setChosen([])}
                className="text-sm px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 min-h-[44px]"
              >
                Recommencer la rédaction
              </button>
            </div>
          )}
          {tries >= 3 && !done1 && (
            <button
              type="button"
              onClick={() => { setChosen(PROOF_STEPS[KEY].correct); setRevealed(true); }}
              className="text-sm px-4 py-2 rounded-lg bg-amber-100 hover:bg-amber-200
                         text-amber-900 font-semibold min-h-[44px]"
            >
              Je ne trouve pas — montre-moi
            </button>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Qu’est-ce qui manque ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-3">
            <p className="text-sm text-amber-900">
              Un élève écrit : « <em>ABC est isocèle en A, donc l’angle B vaut 70°.</em> »
              Le résultat est juste, mais la copie est incomplète.
            </p>
          </div>
          <TapQuestion
            prompt="Que manque-t-il à cette rédaction ?"
            options={[
              'Les propriétés invoquées : que les angles à la base sont égaux, et que la somme des angles vaut 180°.',
              'Rien : le résultat est correct, cela suffit.',
              'Il faudrait mesurer l’angle avec un rapporteur pour vérifier.',
              'Il faudrait redessiner la figure plus grande.',
            ]}
            correct={0}
            cols={1}
            explain="Une démonstration relie la donnée à la conclusion PAR des propriétés nommées. Sans elles, on affirme un résultat sans dire d’où il vient — et le lecteur ne peut pas vérifier."
            explainWrong="Trouver le bon nombre ne suffit pas en géométrie : ce qui est évalué, c’est la chaîne de raisonnement qui permet d’y arriver."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Justifier"
      moduleSubtitle="Du résultat à la démonstration"
      estimatedTime="10 min"
      brief={{
        tag: 'Formalisation',
        title: 'Écrire pourquoi',
        tone: 'blue',
        body: (
          <p>
            Tu sais calculer. Il reste à <strong>expliquer</strong> : relier ce que l’énoncé donne à
            ce que tu conclus, par des propriétés que l’on peut nommer.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 space-y-2">
          <div className="flex gap-2 items-center">
            <ScrollText className="w-5 h-5 text-blue-700" aria-hidden="true" />
            <p className="font-bold text-blue-900">La charpente d’une démonstration</p>
          </div>
          <ol className="text-sm text-blue-900 space-y-1 list-decimal pl-5">
            <li><strong>Donnée</strong> — ce que l’énoncé affirme.</li>
            <li><strong>Propriété</strong> — la règle du cours qui s’applique ici.</li>
            <li><strong>Conclusion</strong> — ce qu’on en déduit, avec le calcul.</li>
          </ol>
        </div>
      }
      steps={steps}
      footer={
        <Feedback tone="ok">
          <div className="flex gap-2 items-start">
            <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong>Retenons.</strong> En géométrie, une réponse sans justification est
              incomplète. La formule est toujours la même : « puisque… (donnée), or… (propriété),
              donc… (conclusion) ».
            </span>
          </div>
        </Feedback>
      }
    />
  );
}
