import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RoundPicker from '../components/RoundPicker';

/**
 * Module 3 — manipulation, reconstruit sur le lesson kit.
 *
 * Arrondir = choisir le nombre ami le plus proche, sur droite graduée.
 * L'étape 3 enseigne la convention du « pile au milieu » (750 → 800 : on
 * arrondit au-dessus), en cohérence avec friendlyNeighbours dans
 * estimationUtils.js — les deux doivent rester alignés.
 */

/* ─── Étape 1 : arrondir à la dizaine ─────────────────────────────── */
const DIZAINES = [198, 302, 49, 71];

/* ─── Étape 2 : arrondir à la centaine ────────────────────────────── */
const CENTAINES = [347, 620];

/* ─── Étape 3 : le cas pile au milieu ─────────────────────────────── */
const MILIEU_Q = {
  q: 'Faut-il arrondir 750 à 700 ou à 800 (à la centaine) ?',
  options: [
    '700, car c\'est le plus petit des deux',
    "800 : quand on est pile au milieu, la convention est d'arrondir au-dessus",
    "Impossible : 750 ne peut pas s'arrondir",
  ],
  correct: 1,
  explain:
    "750 est à égale distance de 700 et de 800. Pour que tout le monde arrondisse pareil, la convention est de choisir le nombre AU-DESSUS : 750 → 800. Les deux restent proches de 750 — l'essentiel pour une estimation — mais la convention évite les hésitations.",
};

/* ─── Étape 4 : quel pas choisir ? ────────────────────────────────── */
const PAS_Q = {
  q: "Pour estimer rapidement 4 128 + 3 950, quel pas d'arrondi choisirais-tu ?",
  options: ['La dizaine (10)', 'La centaine (100)', 'Le millier (1 000)'],
  correct: 2,
  explain:
    'Pour des nombres à 4 chiffres, arrondir au millier donne un calcul très simple (4 000 + 4 000 = 8 000) tout en restant assez précis. Plus le nombre est grand, plus le pas d\'arrondi peut être grand.',
};

export default function Module03Arrondir() {
  const [dizDone, setDizDone] = useState([]);
  const [centDone, setCentDone] = useState([]);
  const [milieuDone, setMilieuDone] = useState(false);
  const [pasDone, setPasDone] = useState(false);

  const s1 = dizDone.length === DIZAINES.length;
  const s2 = centDone.length === CENTAINES.length;
  const s3 = milieuDone;
  const s4 = pasDone;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Arrondir pour estimer"
      moduleSubtitle="Choisir le nombre ami le plus proche, facile à calculer de tête."
      estimatedTime="9 min"
      brief={{
        tag: '🎯 Arrondir',
        title: "Un « nombre ami », c'est un nombre facile à calculer.",
        body: (
          <p>
            Arrondir à la dizaine, à la centaine ou au millier : le but est toujours le même — simplifier sans
            trop s'éloigner du nombre de départ.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Arrondis à la dizaine',
          done: s1,
          content: (
            <div className="space-y-6">
              {DIZAINES.map((v, i) =>
                i === 0 || dizDone.includes(i - 1) ? (
                  <RoundPicker
                    key={v}
                    value={v}
                    step={10}
                    solved={dizDone.includes(i)}
                    onAnswered={() => setDizDone((d) => (d.includes(i) ? d : [...d, i]))}
                  />
                ) : null
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Et pour de plus grands nombres : la centaine',
          done: s2,
          content: (
            <div className="space-y-6">
              {CENTAINES.map((v, i) =>
                i === 0 || centDone.includes(i - 1) ? (
                  <RoundPicker
                    key={v}
                    value={v}
                    step={100}
                    solved={centDone.includes(i)}
                    onAnswered={() => setCentDone((d) => (d.includes(i) ? d : [...d, i]))}
                  />
                ) : null
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Un cas particulier : pile au milieu',
          done: s3,
          content: (
            <TapQuestion
              prompt={MILIEU_Q.q}
              options={MILIEU_Q.options}
              correct={MILIEU_Q.correct}
              cols={1}
              explain={MILIEU_Q.explain}
              solved={milieuDone}
              onAnswered={() => setMilieuDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: "Choisir le bon pas d'arrondi",
          done: s4,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt={PAS_Q.q}
                options={PAS_Q.options}
                correct={PAS_Q.correct}
                cols={1}
                explain={PAS_Q.explain}
                solved={pasDone}
                onAnswered={() => setPasDone(true)}
              />
              {s4 && (
                <Feedback tone="info">
                  Retiens l'idée, pas une règle rigide :{' '}
                  <strong>plus le nombre est grand, plus on peut arrondir large</strong> — l'objectif reste
                  toujours d'obtenir un calcul simple.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
    />
  );
}
