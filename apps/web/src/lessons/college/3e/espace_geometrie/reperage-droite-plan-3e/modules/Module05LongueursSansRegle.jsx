import React, { useState } from 'react';
import { Ruler } from 'lucide-react';
import { ContentModule, NumericQuestion, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import {
  PARC, formatCoords, axisDistance, axisOf, midpointCoords, formatNumber, lieuById,
} from '../components/reperageUtils';

/**
 * Module 5 — MANIPULATION : lire une longueur dans les coordonnées.
 *
 * Activity              faire glisser une extrémité d'un segment horizontal.
 * Mathematical objective la longueur d'un segment horizontal (ou vertical) est
 *                       l'écart de la seule coordonnée qui change.
 * Student action        régler l'abscisse de B et regarder la longueur.
 * Controlled variable   une extrémité, contrainte sur la ligne.
 * Mathematical state    deux points ; la longueur en est DÉRIVÉE.
 * Visual consequence    l'étiquette de longueur suit, et l'écart d'abscisses
 *                       affiché à côté porte toujours le même nombre.
 * Expected observation  la longueur, c'est la différence — en valeur absolue.
 * Misconception ciblée   soustraire dans le mauvais sens et annoncer une
 *                       longueur négative ; et croire qu'on peut faire pareil
 *                       en diagonale (l'étape 4 dit explicitement que non).
 * Feedback              les deux calculs sont montrés côte à côte.
 * Formalization         le milieu comme moyenne des coordonnées.
 * Transfer              prépare Pythagore, qui traitera le cas oblique.
 */
const RANGE = PARC.range;
const A = { x: -3, y: 2 };
const CIBLE_LONGUEUR = 7;

export default function Module05LongueursSansRegle() {
  const [bx, setBx] = useState(-1);
  const B = { x: bx, y: A.y };
  const longueur = axisDistance(A, B);
  const done1 = longueur === CIBLE_LONGUEUR;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const kiosque = lieuById('kiosque');
  const manege = lieuById('manege');
  const milieu = midpointCoords(kiosque, manege);

  const steps = [
    {
      num: 1,
      title: 'Un segment de longueur 7',
      subtitle: 'A est fixé en (−3 ; 2). Fais glisser B sur la même ligne.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <CoordPlane
            range={RANGE}
            points={[
              { id: 'A', name: 'A', x: A.x, y: A.y, color: '#e11d48' },
              { id: 'B', name: 'B', x: B.x, y: B.y, color: '#4f46e5' },
            ]}
            segments={[{
              id: 'AB', from: A, to: B, color: '#7c3aed',
              label: longueur !== null ? `${formatNumber(longueur)}` : undefined,
            }]}
            caption={false}
            ariaLabel={`Segment AB horizontal, longueur ${longueur ?? 0}`}
          />
          <div className="flex items-center gap-2 justify-center flex-wrap">
            <span className="text-sm font-semibold text-slate-700">Abscisse de B</span>
            <button type="button" aria-label="Diminuer l’abscisse de B" disabled={done1 || bx <= RANGE.xMin}
              onClick={() => setBx((v) => Math.max(RANGE.xMin, v - 1))}
              className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">−</button>
            <span className="w-12 text-center text-xl font-mono font-bold tabular-nums">{formatNumber(bx)}</span>
            <button type="button" aria-label="Augmenter l’abscisse de B" disabled={done1 || bx >= RANGE.xMax}
              onClick={() => {
                const next = Math.min(RANGE.xMax, bx + 1);
                setBx(next);
                if (axisDistance(A, { x: next, y: A.y }) === CIBLE_LONGUEUR) kit.react(true);
              }}
              className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">+</button>
          </div>
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3 text-center">
            <p className="text-sm text-slate-700">
              A {formatCoords(A)} · B {formatCoords(B)} — écart des {axisOf(A, B) ?? 'coordonnées'} :{' '}
              <strong className="font-mono">
                |{formatNumber(B.x)} − ({formatNumber(A.x)})| = {longueur === null ? '—' : formatNumber(longueur)}
              </strong>
            </p>
          </div>
          {done1 ? (
            <Feedback tone="ok">
              AB = 7. Les deux points ont la même ordonnée, donc seule l’abscisse compte : la longueur
              est l’<strong>écart des abscisses</strong>, pris en valeur absolue.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Longueur actuelle : {longueur === null ? '0' : formatNumber(longueur)}. Il te faut 7.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Dans quel sens soustraire ?',
      done: q2,
      content: (
        <TapQuestion
          prompt="C (5 ; −1) et D (−2 ; −1). Quelle est la longueur CD ?"
          options={['7', '−7', '3', 'on ne peut pas la calculer']}
          correct={0}
          explain="−2 − 5 = −7, et 5 − (−2) = 7 : les deux soustractions donnent le même écart au signe près. Une longueur est toujours positive, on prend donc la valeur absolue : CD = 7."
          explainWrong="Une longueur ne peut pas être négative. Si ta soustraction donne −7, c’est que tu as soustrait dans un sens ; l’écart vaut 7."
          solved={q2}
          onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Le milieu, sans mesurer',
      done: q3,
      content: (
        <div className="space-y-3">
          <CoordPlane
            range={RANGE}
            points={[
              { id: 'K', name: '🎪', x: kiosque.x, y: kiosque.y, color: '#0f172a' },
              { id: 'M', name: '🎠', x: manege.x, y: manege.y, color: '#0f172a' },
            ]}
            segments={[{ id: 'KM', from: kiosque, to: manege, color: '#94a3b8', dashed: true }]}
            caption={false}
            ariaLabel="Segment entre le kiosque et le manège"
          />
          <p className="text-sm text-slate-700 text-center">
            Le kiosque est en {formatCoords(kiosque)}, le manège en {formatCoords(manege)}.
            On veut planter un banc au <strong>milieu</strong> du segment.
          </p>
          <NumericQuestion
            prompt="Quelle est l’abscisse du milieu ?"
            expected={milieu.x}
            parse={(s) => Number(String(s).replace(',', '.').replace('−', '-'))}
            display={formatNumber(milieu.x, 1)}
            width="w-28"
            explain={`Le milieu a pour coordonnées la moyenne de chaque coordonnée : (−3 + 4) ÷ 2 = ${formatNumber(milieu.x, 1)}.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Et en diagonale ?',
      subtitle: 'La limite honnête de la méthode.',
      done: q4,
      content: (
        <TapQuestion
          prompt="E (0 ; 0) et F (3 ; 4). Peut-on trouver EF de la même façon ?"
          options={[
            'Non : les deux coordonnées changent, l’écart d’une seule ne donne pas la longueur.',
            'Oui : EF = 3 + 4 = 7.',
            'Oui : EF = 4 − 3 = 1.',
            'Oui, EF = 3, car on prend toujours l’abscisse.',
          ]}
          correct={0}
          cols={1}
          explain="Quand les deux coordonnées changent, le segment est oblique et sa longueur n’est plus un simple écart. Il faudra le théorème de Pythagore — ce sera une autre leçon. (Ici EF vaut 5, et non 7.)"
          explainWrong="Additionner les deux écarts revient à mesurer le trajet en escalier, pas le segment droit. Le chemin direct est toujours plus court."
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Des longueurs sans règle"
      moduleSubtitle="Quand la longueur est déjà écrite dans les coordonnées"
      estimatedTime="10 min"
      brief={{
        tag: 'Manipulation',
        title: 'Mesurer sans mesurer',
        tone: 'purple',
        body: (
          <p>
            Si deux points sont sur une même ligne horizontale, inutile de sortir une règle :
            leurs coordonnées contiennent déjà la réponse.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3 flex gap-3 items-start">
          <Ruler className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-purple-900">
            Une seule coordonnée change ? Alors la longueur est l’écart de celle-là. Les deux
            changent ? La méthode ne suffit plus — et c’est important de le savoir.
          </p>
        </div>
      }
      steps={steps}
      footer={
        <Feedback tone="ok">
          <strong>Retenons.</strong> Segment horizontal : longueur = |x<sub>B</sub> − x<sub>A</sub>|.
          Segment vertical : longueur = |y<sub>B</sub> − y<sub>A</sub>|. Milieu : la moyenne de chaque
          coordonnée. Segment oblique : il faudra Pythagore.
        </Feedback>
      }
    />
  );
}
