import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PlausibilityQuestion from '../components/PlausibilityQuestion';

/**
 * Module 7 — formalisation, reconstruit sur le lesson kit.
 *
 * Le jugement central de la leçon : classer un résultat proposé en
 * plausible / suspect / impossible, à partir de son estimation. La bonne
 * catégorie vient du validateur pur classifyPlausibility, via le composant
 * partagé PlausibilityQuestion (également l'esprit du Boss final).
 */
const CASES = [
  { calc: '198 + 403', proposed: 1601, estimate: 600 },
  { calc: '347 + 251', proposed: 590, estimate: 600 },
  { calc: '802 − 399', proposed: 1000, estimate: 400 },
  { calc: '49 × 21', proposed: 800, estimate: 1000 },
  { calc: '198 + 403', proposed: 601, estimate: 600 },
  { calc: '58 × 11', proposed: 65, estimate: 600 },
];

const PROOF_Q = {
  q: '198 + 403 = 601 a été jugé « plausible ». Cela prouve-t-il que 601 est exact ?',
  options: [
    'Oui, plausible veut dire exact',
    "Non : plausible veut dire cohérent avec l'estimation, pas forcément exact — il faudrait recalculer pour en être sûr",
  ],
  correct: 1,
  explain:
    "L'estimation sert à CONTRÔLER, pas à PROUVER. Un résultat plausible peut quand même être faux de quelques unités — ici, 601 est en fait le résultat exact, mais l'estimation seule ne pouvait pas le garantir.",
};

export default function Module07Detective() {
  const [done, setDone] = useState([]);
  const [proofDone, setProofDone] = useState(false);

  const s1 = done.length === CASES.length;
  const s2 = proofDone;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Détective des erreurs"
      moduleSubtitle="Calcul + réponse donnée : plausible, suspect ou impossible ?"
      estimatedTime="9 min"
      brief={{
        tag: '🕵️ Enquête',
        title: 'Six résultats à juger, sans tout recalculer.',
        body: <p>Utilise ton estimation pour classer chaque réponse. Les cas deviennent progressivement plus subtils.</p>,
      }}
      steps={[
        {
          num: 1,
          title: "Mène l'enquête",
          done: s1,
          content: (
            <div className="space-y-6">
              {CASES.map((item, i) =>
                i === 0 || done.includes(i - 1) ? (
                  <div
                    key={`${item.calc}-${item.proposed}`}
                    className={`border-2 rounded-2xl p-4 ${done.includes(i) ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-white'}`}
                  >
                    <PlausibilityQuestion
                      calc={item.calc}
                      proposed={item.proposed}
                      estimate={item.estimate}
                      solved={done.includes(i)}
                      onAnswered={() => setDone((d) => (d.includes(i) ? d : [...d, i]))}
                    />
                  </div>
                ) : null
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Plausible ne veut pas dire prouvé',
          done: s2,
          content: (
            <TapQuestion
              prompt={PROOF_Q.q}
              options={PROOF_Q.options}
              correct={PROOF_Q.correct}
              cols={1}
              explain={PROOF_Q.explain}
              solved={proofDone}
              onAnswered={() => setProofDone(true)}
            />
          ),
        },
      ]}
    />
  );
}
