import React, { useState } from 'react';
import { Scale, Grid3x3 } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SquareBalance from '../components/SquareBalance';
import { FIGURES, balanceOf, isRightTriangle } from '../components/pythagoreUtils';

/**
 * Module 2 — DÉCOUVERTE, et l'interaction SIGNATURE de la leçon.
 *
 * Activity              construire plusieurs triangles rectangles différents
 *                       et relever à chaque fois la balance des aires.
 * Mathematical objective l'aire du grand carré égale la somme des deux autres.
 * Student action        déplacer le sommet de l'angle droit (aimanté).
 * Controlled variable   la forme du triangle, l'angle droit étant préservé.
 * Mathematical state    les trois carrés et leurs aires MESURÉES.
 * Visual consequence    la balance reste à l'équilibre alors que les trois
 *                       nombres changent.
 * Expected observation  « les aires changent, l'égalité reste ».
 * Misconception ciblée   croire que la relation porte sur les LONGUEURS
 *                       (a + b = c). L'étape 3 la teste explicitement.
 * Feedback              on affiche les deux plateaux, jamais un verdict seul.
 * Formalization         l'écriture a² + b² = c² arrive au module 4.
 */
export default function Module02LesTroisCarres() {
  const [pts, setPts] = useState(FIGURES.rect345);
  const [releves, setReleves] = useState([]);
  const bal = balanceOf(pts);

  const relever = (react) => {
    if (!isRightTriangle(pts)) return false;
    const entry = {
      petits: Math.round(bal.sumOthers / 100),
      grand: Math.round(bal.big / 100),
    };
    // Un relevé n'apporte quelque chose que si la forme a changé.
    if (releves.some((r) => Math.abs(r.grand - entry.grand) < 3)) return false;
    setReleves((r) => [...r, entry]);
    react(true);
    return true;
  };
  const done1 = releves.length >= 3;

  const [q2, setQ2] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Trois triangles rectangles, trois relevés',
      subtitle: 'Fais glisser le sommet C vers le haut ou vers le bas : l’angle droit est préservé.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Sur chaque côté du triangle, on a construit un carré. Les nombres affichés sont leurs{' '}
            <strong>aires mesurées</strong>. Change la forme du triangle — en gardant l’angle droit —
            et regarde les deux plateaux.
          </p>
          <SquareBalance
            points={pts}
            onPointsChange={setPts}
            lockedIndices={[0]}
            snapRight
            keepRightAt={0}
            disabled={done1}
            ariaLabel="Triangle rectangle et les trois carrés construits sur ses côtés"
          />
          {!done1 && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => relever(kit.react)}
                disabled={!isRightTriangle(pts)}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700
                           disabled:opacity-40 text-white font-semibold min-h-[44px]"
              >
                Relever la balance ({releves.length}/3)
              </button>
              {!isRightTriangle(pts) && (
                <Feedback tone="info">
                  L’angle en A n’est plus droit : ramène le sommet jusqu’à ce que la marque carrée
                  réapparaisse. On ne relève que des triangles rectangles.
                </Feedback>
              )}
            </div>
          )}
          {releves.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center">
              {releves.map((r, i) => (
                <span key={i} className="text-xs font-mono px-2 py-1 rounded bg-emerald-50
                                         border border-emerald-200 text-emerald-800 tabular-nums">
                  {r.petits} = {r.grand}
                </span>
              ))}
            </div>
          )}
          {done1 && (
            <Feedback tone="ok">
              Trois triangles rectangles différents, et à chaque fois la même chose :{' '}
              <strong>les deux petits carrés réunis ont exactement l’aire du grand</strong>. Les
              nombres changent, l’égalité tient.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Aires ou longueurs ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <SquareBalance
            points={FIGURES.rect345}
            draggable={false}
            ariaLabel="Le triangle 3-4-5 et ses trois carrés d’aires 9, 16 et 25"
          />
          <TapQuestion
            prompt="Ce triangle a pour côtés 3, 4 et 5. Quelle égalité est vraie ?"
            options={[
              '3² + 4² = 5², c’est-à-dire 9 + 16 = 25',
              '3 + 4 = 5',
              '3 × 4 = 5 + 5',
              '3 + 4 + 5 = 12',
            ]}
            correct={0}
            cols={1}
            explain="La relation porte sur les AIRES des carrés, donc sur les carrés des longueurs : 9 + 16 = 25. Sur les longueurs elles-mêmes, 3 + 4 = 7, ce qui est faux — c’est justement pour cela qu’on regarde des aires."
            explainWrong="Attention : 3 + 4 = 7, pas 5. Ce sont les AIRES des carrés qui s’additionnent, pas les longueurs des côtés."
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
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Les trois carrés"
      moduleSubtitle="Une égalité d’aires, pas de longueurs"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'La balance des carrés',
        tone: 'sky',
        body: (
          <p>
            On construit un carré sur chacun des trois côtés. Les aires sont{' '}
            <strong>mesurées</strong> sur les figures, pas écrites d’avance. Regarde ce qui se
            passe quand tu déformes le triangle.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Grid3x3, t: 'Trois carrés', d: 'Un sur chaque côté, vers l’extérieur.', c: 'text-sky-600' },
            { icon: Scale, t: 'Deux plateaux', d: 'Les deux petits contre le grand.', c: 'text-emerald-600' },
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
          <strong>Ce que tu viens d’observer.</strong> Dans un triangle rectangle, l’aire du carré
          construit sur l’hypoténuse est égale à la somme des aires des carrés construits sur les
          deux autres côtés.
        </Feedback>
      }
    />
  );
}
