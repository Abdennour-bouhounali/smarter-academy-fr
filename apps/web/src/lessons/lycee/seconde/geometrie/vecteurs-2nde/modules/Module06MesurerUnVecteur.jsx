import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VectorLab from '../components/VectorLab';
import MidpointLab from '../components/MidpointLab';
import { VecName } from '../components/VectorScene';
import { SCENES, RANGE, equal, normText, formatVec, formatNum, midpoint, vec, dist, parseDecSigned } from '../components/vecteurUtils';

/**
 * Module 6 — MANIPULATION : mesurer un vecteur.
 *
 * Activity              lire la norme dans l'escalier (Pythagore) ; calculer
 *                       une distance ; placer un milieu.
 * Mathematical objective ‖u‖ = √(x² + y²) dans une base orthonormée ;
 *                       AB = ‖AB‖ ; I milieu ⟺ AI = IB ⟺ coordonnées moyennes.
 * Student action        régler u jusqu'à (3 ; 4) puis (6 ; 8) ; déplacer I.
 * Controlled variable   u, puis I.
 * Visual consequence    l'escalier = un triangle rectangle dont la flèche est
 *                       l'hypoténuse ; le calcul écrit dessous ; deux flèches
 *                       AI, IB qui deviennent égales.
 * Expected observation  « la longueur, c'est Pythagore sur les deux marches » ;
 *                       « doubler le vecteur double la longueur ».
 * Misconception targeted ‖u‖ = x + y ; oublier la racine ; milieu = (B − A)/2.
 */
const { u: U, origin: O } = SCENES.norme;
const U2 = { x: 6, y: 8 };
const A2 = { x: -1, y: 2 };
const B2 = { x: 3, y: -1 };
const { A: A3, B: B3 } = SCENES.milieu;
const M3 = midpoint(A3, B3);
const C4 = { x: 2, y: -3 };
const D4 = { x: -4, y: 1 };

function NormReadout({ v }) {
  const n = normText(v);
  return (
    <p className="text-sm flex flex-wrap items-center gap-2 font-mono tabular-nums" aria-live="polite">
      <span className="px-3 py-1 rounded-lg bg-cyan-100 text-cyan-900 font-bold">‖<VecName>u</VecName>‖² = {n.squares}</span>
      <span className="px-3 py-1 rounded-lg bg-cyan-600 text-white font-bold">‖<VecName>u</VecName>‖ = {n.exact}{n.approx ? ` ≈ ${n.approx}` : ''}</span>
    </p>
  );
}

export default function Module06MesurerUnVecteur() {
  const [v1, setV1] = useState({ x: 2, y: 1 });
  const [seen, setSeen] = useState(() => new Set());
  const done1 = seen.has('a') && seen.has('b');

  const [q2, setQ2] = useState(false);

  const [I, setI] = useState({ x: 1, y: -3 });
  const done3 = equal(vec(A3, I), vec(I, B3));

  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'La longueur sort de l’escalier',
      subtitle: 'Règle u = (3 ; 4) et lis sa longueur. Puis double-le : (6 ; 8).',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <VectorLab
            origin={O}
            vector={v1}
            onVectorChange={(nv) => {
              setV1(nv);
              const key = equal(nv, U) ? 'a' : equal(nv, U2) ? 'b' : null;
              if (key && !seen.has(key)) { const s = new Set(seen); s.add(key); setSeen(s); kit.react(true); }
            }}
            mode="build"
            range={RANGE}
            names={{ origin: 'A', tip: 'B', vector: 'u' }}
            escalier
            showWords={false}
            disabled={done1}
            ariaLabel={`Flèche u depuis A, coordonnées ${formatVec(v1)}`}
          />
          <NormReadout v={v1} />
          {done1 ? (
            <Feedback tone="ok">
              L’escalier est un triangle rectangle et la flèche en est l’hypoténuse : Pythagore donne{' '}
              ‖<VecName>u</VecName>‖ = √(3² + 4²) = 5, puis √(6² + 8²) = 10. Doubler le vecteur{' '}
              <strong>double</strong> la longueur (pas ×4). Cette formule marche parce que la base est{' '}
              <strong>orthonormée</strong> : axes perpendiculaires, même unité.
            </Feedback>
          ) : (
            <Feedback tone="info">{seen.has('a') ? 'Maintenant (6 ; 8).' : 'D’abord (3 ; 4).'} Regarde le calcul se réécrire à chaque réglage — y compris quand la racine ne tombe pas juste.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La distance entre deux points',
      subtitle: `A ${formatVec(A2)} et B ${formatVec(B2)}. La distance AB est la longueur du vecteur AB.`,
      done: q2,
      content: (
        <NumericQuestion
          prompt="Combien vaut AB ?"
          expected={dist(A2, B2)}
          parse={parseDecSigned}
          display={formatNum(dist(A2, B2))}
          width="w-24"
          explain={`AB = (3 − (−1) ; −1 − 2) = (4 ; −3), donc AB = √(4² + (−3)²) = √(16 + 9) = √25 = 5.`}
          explainFor={(n) => (n === 25
            ? '25 est AB², la somme des carrés. Il reste la racine : √25 = 5.'
            : n === 7 ? '7 est 4 + 3, la somme des marches. Une longueur ne s’ajoute pas ainsi : c’est √(4² + 3²) = 5.'
              : n === 1 ? '1 serait 4 − 3. Les carrés s’AJOUTENT : 16 + 9 = 25, et √25 = 5.' : null)}
          solved={q2}
          onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Place le milieu',
      subtitle: `A ${formatVec(A3)}, B ${formatVec(B3)}. Déplace I jusqu’à ce que AI et IB soient le même vecteur.`,
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <MidpointLab A={A3} B={B3} I={I} onI={(p) => { setI(p); if (equal(vec(A3, p), vec(p, B3))) kit.react(true); }} range={RANGE} disabled={done3} />
          {done3 ? (
            <Feedback tone="ok">
              I {formatVec(M3)} : <VecName>AI</VecName> = <VecName>IB</VecName>, chacun vaut la moitié de{' '}
              <VecName>AB</VecName>. Ses coordonnées sont les <strong>moyennes</strong> de celles de A et B :
              ({formatNum(A3.x)} + {formatNum(B3.x)}) ÷ 2 = {formatNum(M3.x)} et ({formatNum(A3.y)} + {formatNum(B3.y)}) ÷ 2 = {formatNum(M3.y)}.
            </Feedback>
          ) : (
            <Feedback tone="info">Le point I peut se poser au demi-carreau. Les deux flèches doivent avoir les mêmes coordonnées.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Sans la figure',
      done: q4,
      content: (
        <TapQuestion
          prompt={`Quel est le milieu de [CD], avec C ${formatVec(C4)} et D ${formatVec(D4)} ?`}
          options={[formatVec(midpoint(C4, D4)), '(−3 ; 2)', '(−2 ; −2)', '(3 ; −2)']}
          correct={0}
          cols={2}
          explain="Moyenne des abscisses : (2 + (−4)) ÷ 2 = −1 ; moyenne des ordonnées : (−3 + 1) ÷ 2 = −1. Le milieu est (−1 ; −1)."
          explainWrong="(−3 ; 2) est la moitié du vecteur CD, pas un point : le milieu s’obtient avec la SOMME des coordonnées divisée par 2, soit (−1 ; −1)."
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Mesurer un vecteur"
      moduleSubtitle="Norme, distance, milieu"
      estimatedTime="9 min"
      brief={{
        tag: 'Manipulation',
        title: 'Combien mesure la flèche ?',
        tone: 'cyan',
        body: (
          <p>
            Jusqu’ici, on comptait des cases. Mais la flèche (3 ; 2) ne mesure ni 3, ni 2, ni 5 cases.
            Sa longueur se cache dans l’escalier.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <Feedback tone="ok">
          <strong>Retenons.</strong> Dans une base orthonormée, ‖<VecName>u</VecName>‖ = √(x² + y²) ;
          la distance AB est ‖<VecName>AB</VecName>‖ = √((x<sub>B</sub> − x<sub>A</sub>)² + (y<sub>B</sub> − y<sub>A</sub>)²) ;
          le milieu I de [AB] a pour coordonnées ((x<sub>A</sub> + x<sub>B</sub>)/2 ; (y<sub>A</sub> + y<sub>B</sub>)/2).
        </Feedback>
      }
    />
  );
}
