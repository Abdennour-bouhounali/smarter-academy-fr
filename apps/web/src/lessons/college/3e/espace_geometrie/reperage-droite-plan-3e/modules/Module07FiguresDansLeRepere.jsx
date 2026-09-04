import React, { useState } from 'react';
import { Shapes, Sparkles } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PointDriver from '../components/PointDriver';
import {
  PARC, formatCoords, formatNumber, samePoint, fourthVertex, isAxisAlignedRectangle,
  isoscelesByCoords, axisDistance, reflectAcrossAxis,
} from '../components/reperageUtils';

/**
 * Module 7 — LABORATOIRE : les coordonnées comme OUTIL de raisonnement.
 *
 * Activity              trois problèmes où la réponse se lit dans les nombres.
 * Mathematical objective démontrer une propriété géométrique par le calcul sur
 *                       les coordonnées, sans mesurer.
 * Student action        placer le quatrième sommet, comparer des longueurs,
 *                       construire un symétrique.
 * Controlled variable   un point à la fois.
 * Mathematical state    la figure, dont les propriétés sont DÉRIVÉES
 *                       (isAxisAlignedRectangle, isoscelesByCoords).
 * Visual consequence    la figure se ferme et se colore quand elle est juste.
 * Expected observation  « je peux prouver, pas seulement voir ».
 * Misconception ciblée   se fier à l'allure : l'étape 2 propose un triangle qui
 *                       PARAÎT isocèle et ne l'est pas ; seul le calcul tranche.
 * Feedback              on montre les longueurs comparées, pas un verdict sec.
 * Transfer              c'est la démarche de toute la géométrie analytique.
 */
const RANGE = PARC.range;
const RECT = { A: { x: -4, y: 3 }, B: { x: 3, y: 3 }, C: { x: 3, y: -2 } };
const RECT_D = fourthVertex(RECT.A, RECT.B, RECT.C);

const TRI_VRAI = [{ x: -3, y: -2 }, { x: 3, y: -2 }, { x: 0, y: 3 }];
const TRI_FAUX = [{ x: -3, y: -2 }, { x: 3, y: -2 }, { x: 1, y: 3 }];

const SYM_SOURCE = { x: 2, y: -3 };
const SYM_CIBLE = reflectAcrossAxis(SYM_SOURCE, 'x');

export default function Module07FiguresDansLeRepere() {
  const [d, setD] = useState({ x: 0, y: 0 });
  const [movedD, setMovedD] = useState(null);
  const done1 = samePoint(d, RECT_D);

  const [q2, setQ2] = useState(false);
  const [q2b, setQ2b] = useState(false);

  const [s, setS] = useState({ x: 0, y: 0 });
  const [movedS, setMovedS] = useState(null);
  const done3 = samePoint(s, SYM_CIBLE);

  const rectPoints = [RECT.A, RECT.B, RECT.C, d];
  const rectOk = isAxisAlignedRectangle(rectPoints);

  const steps = [
    {
      num: 1,
      title: 'Fermer le rectangle',
      subtitle: 'Trois sommets sont posés. Place le quatrième.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            ABCD doit être un rectangle. A {formatCoords(RECT.A)}, B {formatCoords(RECT.B)},
            C {formatCoords(RECT.C)}. Où doit tomber D ?
          </p>
          <CoordPlane
            range={RANGE}
            points={[
              { id: 'A', name: 'A', x: RECT.A.x, y: RECT.A.y, color: '#0f172a' },
              { id: 'B', name: 'B', x: RECT.B.x, y: RECT.B.y, color: '#0f172a' },
              { id: 'C', name: 'C', x: RECT.C.x, y: RECT.C.y, color: '#0f172a' },
              { id: 'D', name: 'D', x: d.x, y: d.y, color: '#4f46e5' },
            ]}
            polygons={rectOk ? [{ id: 'r', points: rectPoints, fill: '#a7f3d0', stroke: '#059669' }] : []}
            segments={[
              { id: 'ab', from: RECT.A, to: RECT.B, color: '#0f172a' },
              { id: 'bc', from: RECT.B, to: RECT.C, color: '#0f172a' },
            ]}
            caption={false}
            ariaLabel="Trois sommets d’un rectangle à compléter"
          />
          <div className="flex items-center gap-2 justify-center flex-wrap">
            {[['x', 'Abscisse de D'], ['y', 'Ordonnée de D']].map(([axis, label]) => (
              <div key={axis} className="flex items-center gap-1">
                <span className="text-xs font-semibold text-slate-600">{label}</span>
                <button type="button" aria-label={`Diminuer ${label}`} disabled={done1}
                  onClick={() => { setD((v) => ({ ...v, [axis]: Math.max(RANGE.xMin, v[axis] - 1) })); setMovedD(axis); }}
                  className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">−</button>
                <span className="w-9 text-center font-mono font-bold tabular-nums">{formatNumber(d[axis])}</span>
                <button type="button" aria-label={`Augmenter ${label}`} disabled={done1}
                  onClick={() => {
                    const next = { ...d, [axis]: Math.min(RANGE.xMax, d[axis] + 1) };
                    setD(next); setMovedD(axis);
                    if (samePoint(next, RECT_D)) kit.react(true);
                  }}
                  className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">+</button>
              </div>
            ))}
          </div>
          {done1 ? (
            <Feedback tone="ok">
              D {formatCoords(RECT_D)}. D est sous A donc il garde son abscisse (−4), et il est à la
              hauteur de C donc il prend son ordonnée (−2). Le rectangle mesure{' '}
              {formatNumber(axisDistance(RECT.A, RECT.B))} sur {formatNumber(axisDistance(RECT.B, RECT.C))}.
            </Feedback>
          ) : (
            <Feedback tone="info">
              D est en {formatCoords(d)}. Pour que [AD] soit vertical, D doit avoir la même abscisse
              que A ; pour que [DC] soit horizontal, la même ordonnée que C.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Isocèle, ou seulement joli ?',
      subtitle: 'Deux triangles se ressemblent. Un seul est isocèle.',
      done: q2 && q2b,
      content: (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { id: 'T1', pts: TRI_VRAI, nom: 'Triangle 1' },
              { id: 'T2', pts: TRI_FAUX, nom: 'Triangle 2' },
            ].map(({ id, pts, nom }) => (
              <div key={id} className="space-y-1">
                <p className="text-sm font-semibold text-slate-700 text-center">{nom}</p>
                <CoordPlane
                  range={RANGE}
                  points={pts.map((p, i) => ({ id: `${id}${i}`, name: 'ABC'[i], x: p.x, y: p.y, color: '#0f172a' }))}
                  polygons={[{ id, points: pts, fill: '#ddd6fe', stroke: '#6d28d9' }]}
                  caption={false}
                  ariaLabel={`${nom} : sommets ${pts.map(formatCoords).join(', ')}`}
                />
              </div>
            ))}
          </div>
          <NumericQuestion
            prompt="Triangle 1 : quelle est la longueur de la base [AB] (horizontale) ?"
            expected={6}
            width="w-24"
            explain="A (−3 ; −2) et B (3 ; −2) ont la même ordonnée : AB = |3 − (−3)| = 6."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          <TapQuestion
            prompt="Lequel des deux est vraiment isocèle, et pourquoi ?"
            options={[
              'Le triangle 1 : son sommet C (0 ; 3) est à égale distance de A et de B, car il est pile au-dessus du milieu de [AB].',
              'Le triangle 2, parce qu’il paraît plus régulier.',
              'Les deux, puisqu’ils ont la même base.',
              'Aucun des deux : il faudrait mesurer avec une règle.',
            ]}
            correct={0}
            cols={1}
            explain="Le milieu de [AB] a pour abscisse 0. Le sommet du triangle 1 a lui aussi l’abscisse 0 : il est donc à égale distance de A et de B. Celui du triangle 2 est en (1 ; 3), décalé — les deux côtés n’ont pas la même longueur. Le dessin ne suffisait pas, le calcul tranche."
            explainWrong="L’allure ne prouve rien : les deux triangles se ressemblent beaucoup. Ce sont les coordonnées qui décident, en comparant les distances aux deux extrémités de la base."
            solved={q2b}
            onAnswered={() => setQ2b(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le reflet dans l’étang',
      subtitle: 'Place le symétrique de S par rapport à l’axe horizontal.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Le pédalo S est en {formatCoords(SYM_SOURCE)}. Son reflet est son symétrique par rapport
            à l’<strong>axe horizontal</strong>. Place-le.
          </p>
          <PointDriver
            point={s}
            onPointChange={(next, axis) => {
              setS(next); setMovedS(axis);
              if (samePoint(next, SYM_CIBLE)) kit.react(true);
            }}
            range={RANGE}
            lastMoved={movedS}
            disabled={done3}
            showGuides={false}
            ariaLabel="Repère : place le symétrique du pédalo"
          />
          <div className="flex justify-center">
            <CoordPlane
              range={RANGE}
              points={[
                { id: 'S', name: 'S', x: SYM_SOURCE.x, y: SYM_SOURCE.y, color: '#e11d48' },
                { id: 'R', name: "S'", x: s.x, y: s.y, color: '#4f46e5' },
              ]}
              segments={[{ id: 'ss', from: SYM_SOURCE, to: s, color: '#94a3b8', dashed: true }]}
              caption={false}
              ariaLabel="Le pédalo et le point que tu places"
            />
          </div>
          {done3 ? (
            <Feedback tone="ok">
              {formatCoords(SYM_CIBLE)}. Par rapport à l’axe horizontal, l’abscisse ne change pas et
              l’ordonnée change de signe. Les deux points sont à la même distance de l’axe, de part
              et d’autre.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Tu es en {formatCoords(s)}. Un symétrique par rapport à l’axe horizontal reste à la
              même abscisse — c’est la hauteur qui se retourne.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Des figures dans le repère"
      moduleSubtitle="Prouver avec des nombres, pas avec les yeux"
      estimatedTime="11 min"
      brief={{
        tag: 'Atelier',
        title: 'Les coordonnées comme preuve',
        tone: 'rose',
        body: (
          <p>
            Trois problèmes du parc. Dans chacun, la réponse est déjà dans les nombres — le dessin ne
            sert qu’à vérifier.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Shapes, t: 'Construire', d: 'Fermer un rectangle, retrouver un symétrique.', c: 'text-rose-600' },
            { icon: Sparkles, t: 'Démontrer', d: 'Un triangle qui a l’air isocèle ne l’est pas forcément.', c: 'text-amber-600' },
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
      footer={
        <Feedback tone="ok">
          <strong>Ce que tu viens de faire est une démonstration.</strong> Comparer des coordonnées
          permet d’affirmer qu’une figure est un rectangle ou qu’un triangle est isocèle — sans
          jamais poser de règle sur le dessin.
        </Feedback>
      }
    />
  );
}
