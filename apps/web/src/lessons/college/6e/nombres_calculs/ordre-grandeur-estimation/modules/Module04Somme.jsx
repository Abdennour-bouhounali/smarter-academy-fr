import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EstimateInput from '../components/EstimateInput';

/**
 * Module 4 — manipulation, reconstruit sur le lesson kit.
 *
 * L'ordre de grandeur d'une somme : plusieurs arrondis raisonnables mènent
 * au même ordre de grandeur (EstimateInput accepte une PLAGE, pas une seule
 * valeur — c'est le cœur pédagogique de l'estimation).
 */

/* ─── Étape 1 : deux stratégies pour la même somme ───────────────── */
const STRATEGIES_Q = {
  q: 'Pour estimer 347 + 251, deux élèves arrondissent différemment : 350 + 250 = 600, et 300 + 300 = 600. Que penses-tu de leurs deux réponses ?',
  options: [
    'Une seule est correcte, il faut toujours arrondir à la dizaine',
    'Les deux sont acceptables : elles donnent le même ordre de grandeur par des chemins différents',
  ],
  correct: 1,
  explain:
    "Il n'y a pas UNE seule bonne façon d'arrondir. Les deux stratégies donnent un résultat proche du vrai calcul (598) : les deux sont de bonnes estimations.",
};

/* ─── Étape 2 : à toi de jouer ────────────────────────────────────── */
const SOMMES = [
  { a: 347, b: 251, exact: 598, min: 550, max: 650, hint: 'Arrondis chaque nombre à la dizaine ou à la centaine, puis additionne mentalement : 350 + 250 = 600.' },
  { a: 512, b: 289, exact: 801, min: 750, max: 850, hint: '512 ≈ 500 et 289 ≈ 300 : 500 + 300 = 800.' },
];

/* ─── Étape 3 : reconnaissance rapide ────────────────────────────── */
const RECO = [
  { q: '523 + 468 ≈ ?', options: ['100', '1 000', '10 000'], correct: 1, explain: '523 ≈ 500 et 468 ≈ 500 : 500 + 500 = 1 000.' },
  { q: '89 + 76 ≈ ?', options: ['17', '170', '1 700'], correct: 1, explain: '89 ≈ 90 et 76 ≈ 80 : 90 + 80 = 170.' },
];

export default function Module04Somme() {
  const [stratDone, setStratDone] = useState(false);
  const [sommesDone, setSommesDone] = useState([]);
  const [recoDone, setRecoDone] = useState([]);

  const s1 = stratDone;
  const s2 = sommesDone.length === SOMMES.length;
  const s3 = recoDone.length === RECO.length;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Ordre de grandeur d'une somme"
      moduleSubtitle="347 + 251 : plusieurs façons d'arrondir, un seul bon ordre de grandeur."
      estimatedTime="8 min"
      brief={{
        tag: '➕ Somme',
        title: "Il existe plusieurs bonnes façons d'estimer.",
        body: (
          <p>
            Ce qui compte, c'est d'arriver à un ordre de grandeur cohérent — pas de suivre une seule méthode
            imposée.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Deux stratégies, un même résultat',
          done: s1,
          content: (
            <div className="space-y-5">
              <TapQuestion
                prompt={STRATEGIES_Q.q}
                requires={['arrondi', 'pas-arrondi']}
                options={STRATEGIES_Q.options}
                correct={STRATEGIES_Q.correct}
                cols={1}
                explain={STRATEGIES_Q.explain}
                solved={stratDone}
                onAnswered={() => setStratDone(true)}
              />
              {s1 && (
                <KnowledgeBrick
                  id="plusieurs-arrondis"
                  variant="new"
                  lead="Deux élèves, deux façons d'arrondir, et le même 600 au bout."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: "À toi d'estimer",
          done: s2,
          content: (
            <div className="space-y-8">
              {SOMMES.map((s, i) =>
                i === 0 || sommesDone.includes(i - 1) ? (
                  <div key={`${s.a}-${s.b}`} className="space-y-2 border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                    <div className="text-center font-mono text-2xl font-extrabold text-slate-800">
                      {s.a} + {s.b}
                    </div>
                    <EstimateInput
                      prompt="Sans calculer exactement, donne un ordre de grandeur."
                      acceptMin={s.min}
                      acceptMax={s.max}
                      exact={s.exact}
                      hint={s.hint}
                      solved={sommesDone.includes(i)}
                      onAnswered={() => setSommesDone((d) => (d.includes(i) ? d : [...d, i]))}
                    />
                  </div>
                ) : null
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Reconnaissance rapide',
          done: s3,
          content: (
            <div className="space-y-6">
              {RECO.map((item, i) =>
                i === 0 || recoDone.includes(i - 1) ? (
                  <div key={item.q} className="border-t border-slate-100 pt-4 first:border-0 first:pt-0">
                    <TapQuestion
                      prompt={<span className="font-mono">{item.q}</span>}
                      requires={['plusieurs-arrondis', 'ordre-de-grandeur']}
                      options={item.options}
                      correct={item.correct}
                      cols={3}
                      explain={item.explain}
                      solved={recoDone.includes(i)}
                      onAnswered={() => setRecoDone((d) => (d.includes(i) ? d : [...d, i]))}
                    />
                  </div>
                ) : null
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> Même travail sur la soustraction — et là, une image
          particulièrement parlante t'attend.
        </KnowledgeSnapshot>
      }
    />
  );
}
