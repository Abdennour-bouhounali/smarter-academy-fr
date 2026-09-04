import React, { useState } from 'react';
import { AlertTriangle, ArrowLeftRight } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SquareBalance from '../components/SquareBalance';
import { FIGURES, balanceOf, isRightTriangle } from '../components/pythagoreUtils';

/**
 * Module 3 — DÉCOUVERTE : l'équilibre caractérise l'angle droit.
 *
 * Activity              casser volontairement l'angle droit et observer la
 *                       balance basculer, dans les DEUX sens.
 * Mathematical objective l'égalité des aires n'est pas une propriété de tous
 *                       les triangles : elle caractérise le rectangle. C'est
 *                       la réciproque, découverte avant d'être nommée.
 * Student action        déplacer le sommet librement (sans aimantation).
 * Mathematical state    la balance et le verdict d'angle droit.
 * Visual consequence    la marque carrée disparaît exactement quand
 *                       l'équilibre est rompu.
 * Expected observation  « les deux vont toujours ensemble ».
 * Misconception ciblée   croire que a² + b² = c² vaut dans tout triangle.
 * Feedback              on nomme le sens de la bascule (aigu / obtus).
 */
export default function Module03QuandCeNestPlusDroit() {
  const [pts, setPts] = useState(FIGURES.rect345);
  const [vus, setVus] = useState(new Set());
  const bal = balanceOf(pts);
  const droit = isRightTriangle(pts);

  const observer = (next) => {
    const b = balanceOf(next);
    const bucket = b.level ? 'droit' : b.tilt;
    setVus((s) => (s.has(bucket) ? s : new Set([...s, bucket])));
  };
  const done1 = vus.size >= 3;

  const [q2, setQ2] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Casse l’angle droit',
      subtitle: 'Obtiens les trois situations : équilibre, penché à gauche, penché à droite.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Cette fois, <strong>aucune aimantation</strong> : le sommet va où tu veux. Observe la
            marque d’angle droit et la balance <em>en même temps</em>.
          </p>
          <SquareBalance
            points={pts}
            onPointsChange={(p) => { setPts(p); observer(p); if (vus.size >= 2) kit.react(true); }}
            lockedIndices={[0]}
            snapRight={false}
            disabled={done1}
            ariaLabel="Triangle déformable librement, avec ses trois carrés"
          />
          {done1 ? (
            <Feedback tone="ok">
              Tu l’as vu dans les trois cas : la balance est à l’équilibre{' '}
              <strong>exactement</strong> quand la marque d’angle droit est là. Dès que l’angle
              s’ouvre, le grand carré l’emporte ; dès qu’il se referme, ce sont les deux petits.
              L’égalité des aires ne caractérise <strong>que</strong> le triangle rectangle.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Situations rencontrées : {vus.size} sur 3.{' '}
              {droit
                ? 'Là, l’angle est droit et la balance est équilibrée. Ouvre-le, puis referme-le.'
                : `Angle ${bal.tilt === 'grand' ? 'trop ouvert (obtus)' : 'trop fermé (aigu)'} : le grand carré ${bal.tilt === 'grand' ? 'l’emporte' : 'est dépassé'}.`}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce que l’égalité permet d’affirmer',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { pts: FIGURES.aigu, l: 'Angle trop fermé' },
              { pts: FIGURES.obtus, l: 'Angle trop ouvert' },
            ].map(({ pts: p, l }) => (
              <div key={l} className="space-y-1">
                <p className="text-xs font-semibold text-slate-600 text-center">{l}</p>
                <SquareBalance points={p} draggable={false} showBalance
                  ariaLabel={`${l} : la balance des carrés n’est pas équilibrée`} />
              </div>
            ))}
          </div>
          <TapQuestion
            prompt="Un triangle a pour côtés 7 cm, 8 cm et 12 cm. On calcule : 7² + 8² = 113, et 12² = 144. Que peut-on conclure ?"
            options={[
              'Les deux résultats diffèrent : le triangle n’est PAS rectangle',
              'Le triangle est rectangle, puisqu’on a pu faire le calcul',
              'On ne peut rien conclure sans mesurer les angles',
              'Le triangle est rectangle car 12 est le plus grand côté',
            ]}
            correct={0}
            cols={1}
            explain="L’égalité des aires caractérise le triangle rectangle : quand elle est fausse, le triangle ne l’est pas. Ici 113 ≠ 144, et comme la somme est PLUS PETITE, l’angle est trop ouvert — le triangle est obtusangle."
            explainWrong="Justement, le calcul montre que les deux nombres sont DIFFÉRENTS. Or tu viens de voir que la balance ne s’équilibre que dans le cas rectangle."
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
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Quand l’angle n’est plus droit"
      moduleSubtitle="L’équilibre ne se produit que dans un seul cas"
      estimatedTime="9 min"
      brief={{
        tag: 'Découverte',
        title: 'Rompre l’équilibre',
        tone: 'emerald',
        body: (
          <p>
            Tu as vu l’égalité tenir pour tous les triangles rectangles. Vérifie maintenant qu’elle{' '}
            <strong>ne tient que</strong> pour eux — c’est ce qui la rend utile.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: ArrowLeftRight, t: 'Ouvre l’angle', d: 'Le grand carré prend le dessus.', c: 'text-rose-600' },
            { icon: AlertTriangle, t: 'Referme-le', d: 'Ce sont les deux petits qui l’emportent.', c: 'text-amber-600' },
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
          <strong>Une équivalence.</strong> L’égalité des aires et l’angle droit vont toujours
          ensemble : l’un entraîne l’autre, dans les deux sens. C’est ce qui permettra, plus loin,
          de <em>démontrer</em> qu’un triangle est rectangle à partir de ses seules longueurs.
        </Feedback>
      }
    />
  );
}
