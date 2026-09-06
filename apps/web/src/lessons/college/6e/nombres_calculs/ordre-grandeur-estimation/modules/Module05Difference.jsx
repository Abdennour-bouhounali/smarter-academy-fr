import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import NumberLine from '../../../../../common/components/NumberLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EstimateInput from '../components/EstimateInput';
import { formatFr } from '../components/estimationUtils';

/**
 * Module 5 — manipulation, reconstruit sur le lesson kit.
 *
 * Soustraire = mesurer un écart : la droite graduée rend la distance entre
 * les deux nombres arrondis visible avant tout calcul.
 */

/* ─── Étape 1 : la distance sur la droite ────────────────────────── */
const DISTANCE_Q = {
  q: "Quelle est, à vue d'œil, cette distance ?",
  options: ['≈ 100', '≈ 500', '≈ 1 000'],
  correct: 1,
  explain: "De 300 à 800, il y a 500 : 800 − 300 = 500. C'est l'ordre de grandeur attendu pour 798 − 302.",
};

/* ─── Étape 2 : à toi d'estimer ───────────────────────────────────── */
const DIFFS = [
  { a: 803, b: 297, exact: 506, min: 450, max: 550, hint: '800 − 300 = 500.' },
  { a: 651, b: 189, exact: 462, min: 400, max: 500, hint: '650 − 190 ≈ 460, ou 650 − 200 = 450.' },
];

/* ─── Étape 3 : proche de 500 ou de 1000 ? ───────────────────────── */
const CHOIX_Q = {
  q: 'Pour 803 − 297, le résultat exact devrait-il être proche de 500 ou de 1 000 ?',
  options: ['Proche de 500', 'Proche de 1 000'],
  correct: 0,
  explain: '800 − 300 = 500 : le résultat exact (506) est bien proche de 500, pas de 1 000.',
};

export default function Module05Difference() {
  const [distDone, setDistDone] = useState(false);
  const [diffsDone, setDiffsDone] = useState([]);
  const [choixDone, setChoixDone] = useState(false);

  const s1 = distDone;
  const s2 = diffsDone.length === DIFFS.length;
  const s3 = choixDone;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Ordre de grandeur d'une différence"
      moduleSubtitle="798 − 302 : la distance entre deux nombres arrondis."
      estimatedTime="8 min"
      brief={{
        tag: '➖ Différence',
        title: "Soustraire, c'est mesurer un écart.",
        body: <p>La droite graduée rend cet écart visible avant même de calculer.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Vois la distance',
          done: s1,
          content: (
            <div className="space-y-5">
            <TapQuestion
              above={
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    798 − 302, c'est la <strong>distance</strong> entre 302 et 798 sur la droite graduée.
                  </p>
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
                    <NumberLine
                      min={0}
                      max={800}
                      step={100}
                      labelEvery={1}
                      height={150}
                      format={formatFr}
                      markers={[
                        { value: 302, label: '≈ 300', color: '#dc2626' },
                        { value: 798, label: '≈ 800', color: '#059669' },
                      ]}
                      ariaLabel="Distance entre 300 et 800"
                    />
                  </div>
                </div>
              }
              prompt={DISTANCE_Q.q}
              requires={['arrondi', 'ordre-de-grandeur']}
              options={DISTANCE_Q.options}
              correct={DISTANCE_Q.correct}
              cols={3}
              explain={DISTANCE_Q.explain}
              solved={distDone}
              onAnswered={() => setDistDone(true)}
            />
              {/* L'écart vient d'être lu à l'œil sur la droite graduée :
                  c'est l'instant où « différence = distance » a un sens. */}
              {s1 && (
                <KnowledgeBrick
                  id="difference-distance"
                  variant="new"
                  lead="Les 500 que tu as lus entre les deux repères, sans poser la soustraction."
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
              {DIFFS.map((d, i) =>
                i === 0 || diffsDone.includes(i - 1) ? (
                  <div key={`${d.a}-${d.b}`} className="space-y-2 border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                    <div className="text-center font-mono text-2xl font-extrabold text-slate-800">
                      {d.a} − {d.b}
                    </div>
                    <EstimateInput
                      prompt="Sans calculer exactement, donne un ordre de grandeur."
                      acceptMin={d.min}
                      acceptMax={d.max}
                      exact={d.exact}
                      hint={d.hint}
                      solved={diffsDone.includes(i)}
                      onAnswered={() => setDiffsDone((x) => (x.includes(i) ? x : [...x, i]))}
                    />
                  </div>
                ) : null
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Prévoir avant de calculer',
          done: s3,
          content: (
            <TapQuestion
              prompt={CHOIX_Q.q}
              requires={['difference-distance']}
              options={CHOIX_Q.options}
              correct={CHOIX_Q.correct}
              cols={2}
              explain={CHOIX_Q.explain}
              solved={choixDone}
              onAnswered={() => setChoixDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Reste la multiplication — celle où une erreur d'un seul zéro
          coûte le plus cher.
        </KnowledgeSnapshot>
      }
    />
  );
}
