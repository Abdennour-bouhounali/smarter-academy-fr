import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
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
      moduleTitle="Choisir le bon nombre ami"
      moduleSubtitle="Sur la droite graduée, repérer lequel des deux voisins ronds est le plus proche."
      estimatedTime="9 min"
      brief={{
        tag: '🎯 Nombres amis',
        title: 'Entre deux voisins ronds, lequel choisir ?',
        body: (
          <p>
            À la dizaine, à la centaine ou au millier, le geste est toujours le même : simplifier
            le nombre sans trop s'en éloigner. La droite graduée le rend évident.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Le voisin rond le plus proche',
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
              {/* Le geste a été fait quatre fois : il a maintenant un nom. */}
              {s1 && (
                <KnowledgeBrick
                  id="arrondi"
                  variant="new"
                  lead="Ce que tu viens de faire quatre fois — choisir le voisin rond le plus proche — porte un nom."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Et pour de plus grands nombres',
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
            <div className="space-y-5">
              <TapQuestion
                prompt={MILIEU_Q.q}
                requires={['arrondi']}
                options={MILIEU_Q.options}
                correct={MILIEU_Q.correct}
                cols={1}
                explain={MILIEU_Q.explain}
                solved={milieuDone}
                onAnswered={() => setMilieuDone(true)}
              />
              {s3 && (
                <KnowledgeBrick
                  id="convention-milieu"
                  variant="new"
                  lead="Le 750 que rien ne départageait : ce n'est pas la droite graduée qui tranche, c'est un accord."
                />
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'À quel rang faut-il remplacer ?',
          done: s4,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt={PAS_Q.q}
                requires={['arrondi']}
                options={PAS_Q.options}
                correct={PAS_Q.correct}
                cols={1}
                explain={PAS_Q.explain}
                solved={pasDone}
                onAnswered={() => setPasDone(true)}
              />
              {s4 && (
                <KnowledgeBrick
                  id="pas-arrondi"
                  variant="new"
                  lead="Pour 4 128 tu as choisi le millier, pas la dizaine : le rang se choisit selon le nombre."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Le geste est nommé et fiable. On va s'en servir sur les trois
          opérations, en commençant par la somme.
        </KnowledgeSnapshot>
      }
    />
  );
}
