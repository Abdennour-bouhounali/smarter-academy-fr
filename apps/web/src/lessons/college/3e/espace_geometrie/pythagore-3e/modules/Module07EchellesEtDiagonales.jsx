import React, { useState } from 'react';
import { Tv, Hammer } from 'lucide-react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import LadderScene from '../components/LadderScene';
import {
  computeHypotenuse, computePythagoreanLeg, roundTenth, kindFromSides,
} from '../components/pythagoreUtils';

/**
 * Module 7 — LABORATOIRE : trois situations réelles.
 *
 * Activity              l'échelle (dont la distance au mur est réglable), la
 *                       diagonale d'un écran, la corde 3-4-5 du maçon.
 * Mathematical objective reconnaître la configuration rectangle dans un énoncé
 *                       qui ne dit pas « triangle rectangle ».
 * Student action        régler une donnée, prédire, calculer.
 * Visual consequence    la scène se redessine à partir du calcul lui-même.
 * Misconception ciblée   ne pas voir l'angle droit implicite (mur/sol,
 *                       longueur/largeur d'un écran).
 * Transfer              la corde à 13 nœuds inverse le sens : on se sert de la
 *                       réciproque pour FABRIQUER un angle droit.
 */
export default function Module07EchellesEtDiagonales() {
  const [dist, setDist] = useState(1);
  const [q1, setQ1] = useState(false);
  const hauteur = computePythagoreanLeg(5, dist);

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'L’échelle contre le mur',
      subtitle: 'Écarte le pied de l’échelle et observe la hauteur atteinte.',
      done: q1,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="pythagore-dans-le-reel"
            variant="new"
            lead="Voici où ce théorème sert vraiment — et dans quel sens, selon la question posée."
          />
          <p className="text-sm text-slate-700">
            L’échelle mesure <strong>5 m</strong>. Le mur et le sol forment un angle droit : le
            triangle est donc rectangle, même si l’énoncé ne le dit pas.
          </p>
          <LadderScene ladder={5} distance={dist} reveal={q1} />
          <div className="flex items-center gap-2 justify-center flex-wrap">
            <span className="text-sm font-semibold text-slate-700">Distance au mur</span>
            <button type="button" aria-label="Rapprocher l’échelle du mur" disabled={dist <= 1}
              onClick={() => setDist((d) => Math.max(1, d - 1))}
              className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">−</button>
            <span className="w-16 text-center text-lg font-mono font-bold tabular-nums">{dist} m</span>
            <button type="button" aria-label="Écarter l’échelle du mur" disabled={dist >= 4}
              onClick={() => setDist((d) => Math.min(4, d + 1))}
              className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">+</button>
          </div>
          <Feedback tone="info">
            Plus le pied s’écarte, plus la hauteur atteinte diminue — l’échelle, elle, garde
            toujours 5 m.
          </Feedback>
          <NumericQuestion
            prompt={`Le pied est à ${dist} m du mur. À quelle hauteur l’échelle touche-t-elle le mur ? (arrondi au dixième)`}
            suffix="m"
            expected={(n) => Math.abs(n - roundTenth(hauteur)) < 0.051}
            parse={(s) => Number(String(s).replace(',', '.'))}
            display={String(roundTenth(hauteur)).replace('.', ',')}
            width="w-24"
            explain={`L’échelle est l’hypoténuse (5 m). On cherche un côté de l’angle droit, donc on SOUSTRAIT : hauteur² = 5² − ${dist}² = ${25 - dist * dist}, d’où une hauteur de ${String(roundTenth(hauteur)).replace('.', ',')} m.`}
            explainFor={(n) => (Math.abs(n - Math.sqrt(25 + dist * dist)) < 0.2
              ? 'Tu as additionné. L’échelle est déjà l’hypoténuse : la hauteur cherchée est forcément plus PETITE que 5 m.'
              : null)}
            requires={['pythagore-dans-le-reel', 'methode-ecrire-puis-calculer']}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'La diagonale de l’écran',
      subtitle: 'Un téléviseur « 40 pouces », c’est sa diagonale.',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3">
            <p className="text-sm text-slate-700">
              Un écran rectangulaire mesure <strong>88 cm</strong> de large et{' '}
              <strong>50 cm</strong> de haut. Un rectangle a quatre angles droits : sa diagonale
              coupe le rectangle en deux triangles rectangles.
            </p>
          </div>
          <NumericQuestion
            prompt="Quelle est la diagonale de l’écran, arrondie au centimètre ?"
            suffix="cm"
            expected={(n) => Math.abs(n - Math.round(computeHypotenuse(88, 50))) < 0.6}
            parse={(s) => Number(String(s).replace(',', '.'))}
            display={String(Math.round(computeHypotenuse(88, 50)))}
            width="w-24"
            explain={`La diagonale est l’hypoténuse : d² = 88² + 50² = 7744 + 2500 = 10244, donc d ≈ ${Math.round(computeHypotenuse(88, 50))} cm.`}
            explainFor={(n) => (n === 138
              ? 'Tu as additionné les longueurs (88 + 50). Ce sont leurs carrés qu’il faut additionner.'
              : n === 10244 ? 'C’est d² que tu as calculé. Prends la racine carrée pour obtenir la longueur.' : null)}
            requires={['pythagore-dans-le-reel', 'calculer-un-cote-de-langle-droit']}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'La corde du maçon',
      subtitle: 'Ici, on se sert du théorème À L’ENVERS.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-3">
            <p className="text-sm text-amber-900">
              Pour tracer un angle droit sans équerre, un maçon tend une corde en triangle de
              <strong> 3 m, 4 m et 5 m</strong>. Il affirme que l’angle entre les côtés de 3 m et
              4 m est alors exactement droit.
            </p>
          </div>
          <TapQuestion
            prompt="Sur quoi repose cette technique ?"
            options={[
              'Sur la réciproque : 3² + 4² = 9 + 16 = 25 = 5², donc le triangle est rectangle',
              'Sur le théorème direct : on connaît déjà l’angle droit',
              'Sur une approximation : l’angle est presque droit',
              'Sur le fait que 3, 4 et 5 se suivent',
            ]}
            correct={0}
            cols={1}
            explain="Le maçon ne connaît PAS l’angle au départ : il l’obtient. En imposant des longueurs qui vérifient l’égalité, la réciproque garantit que l’angle est droit — exactement, pas approximativement. C’est le théorème utilisé pour CONSTRUIRE."
            explainWrong="Le théorème direct partirait d’un angle droit connu. Ici, c’est l’inverse : ce sont les longueurs qui sont choisies, et l’angle droit en découle."
            requires={['pythagore-dans-le-reel', 'reciproque-pythagore']}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Échelles, écrans et diagonales"
      moduleSubtitle="Reconnaître l’angle droit dans une situation réelle"
      estimatedTime="10 min"
      brief={{
        tag: 'Atelier',
        title: 'Le théorème hors du cahier',
        tone: 'rose',
        body: (
          <p>
            Dans la vraie vie, personne ne dit « soit ABC un triangle rectangle ». C’est à toi de{' '}
            <strong>repérer l’angle droit</strong> : un mur et un sol, les bords d’un écran, une
            corde tendue.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Tv, t: 'Repérer', d: 'Mur/sol, largeur/hauteur : l’angle droit est partout.', c: 'text-rose-600' },
            { icon: Hammer, t: 'Construire', d: 'La réciproque sert à FABRIQUER un angle droit.', c: 'text-amber-600' },
          ].map(({ icon: Icon, t, d, c }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className={`w-5 h-5 mb-1 ${c}`} aria-hidden="true" />
              <p className="font-semibold text-slate-800 text-sm">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={7}>
          <strong>La suite.</strong> Il ne reste qu’à tout mettre à l’épreuve.
        </KnowledgeSnapshot>
      )}
    />
  );
}
