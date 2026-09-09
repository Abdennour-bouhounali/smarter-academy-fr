import React, { useState } from 'react';
import { Unlink } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { useLabState } from '../../../../../common/hooks/useLabState';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CarresLab from '../components/CarresLab';
import { A_DEFAUT, B_DEFAUT, surLeCercle, bilanAires, angles, arrondi, fr } from '../components/pythagore4e';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 2 — DÉCOUVERTE : l'égalité est une propriété DE l'angle droit.
 *
 * Activity              libérer C du cercle et l'emmener partout.
 * Mathematical objective l'égalité des aires ne tient QUE si l'angle est
 *                       droit. Elle se rompt dans un sens quand l'angle est
 *                       aigu, dans l'autre quand il est obtus.
 * Student action        glisser C librement dans le plan.
 * Controlled variable   la position de C, sans contrainte.
 * Mathematical state    les trois sommets ; l'angle en C et le bilan des
 *                       aires sont MESURÉS.
 * Visual consequence    la balance penche, et la jauge d'angle change de mot.
 * Expected observation  « dès que je quitte le cercle, ça penche — et le sens
 *                       dépend de quel côté je vais ».
 * Misconception targeted appliquer le théorème à un triangle quelconque.
 * Formalization         la contraposée est VÉCUE ici (l'égalité rompue ⇒ pas
 *                       d'angle droit) ; elle sera nommée au module 6.
 *
 * CONTINUITÉ : le triangle vient du module 1 (`useLabState`), et on lui
 * retire sa contrainte. C'est la même figure, libérée.
 */
export default function Module02QuandLangleSeCasse() {
  const memo = useLabState(LESSON_CONFIG.id, 'triangle', { theta: 55 });
  const depart = surLeCercle(A_DEFAUT, B_DEFAUT, ((memo.value.theta ?? 55) * Math.PI) / 180);
  const [C, setC] = useState(depart);
  const [vus, setVus] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const T = { A: A_DEFAUT, B: B_DEFAUT, C };
  const bilan = bilanAires(T);
  const ang = angles(T).C;

  const bouger = (p) => {
    setC(p);
    const nature = Math.abs(angles({ ...T, C: p }).C - 90) < 0.5 ? 'droit'
      : angles({ ...T, C: p }).C > 90 ? 'obtus' : 'aigu';
    setVus((v) => (v.includes(nature) ? v : [...v, nature]));
  };

  const done1 = vus.includes('aigu') && vus.includes('obtus');

  const steps = [
    {
      num: 1,
      title: 'Sors du cercle',
      subtitle: 'Le point C est libre. Emmène-le vers l’intérieur, puis vers l’extérieur.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Le cercle est toujours dessiné, mais C ne le suit plus. Regarde en même temps la
            balance et l’angle affiché en dessous.
          </p>
          <CarresLab contraint={false} C={C} onC={bouger} />
          {!done1 && (
            <Feedback tone="info">
              Angles rencontrés : {vus.length ? vus.join(', ') : 'aucun'}. Il te manque
              {vus.includes('aigu') ? '' : ' un angle aigu'}
              {!vus.includes('aigu') && !vus.includes('obtus') ? ' et' : ''}
              {vus.includes('obtus') ? '' : ' un angle obtus'}.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Dans les deux cas la balance penche — mais pas du même côté. L’égalité ne tient
              que sur le cercle, là où l’angle est droit.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Dans quel sens penche-t-elle ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Quand l’angle en C dépasse 90° (angle obtus), que devient le grand carré ?"
            options={[
              'Il devient plus grand que la somme des deux autres',
              'Il devient plus petit que la somme des deux autres',
              'Il ne change pas',
              'Il devient égal à un seul des deux petits',
            ]}
            correct={0}
            cols={1}
            requires={['egalite-des-aires', 'angle-droit']}
            explain="Un angle plus ouvert écarte A et B : le côté qui leur fait face s’allonge, donc son carré grossit plus vite que les deux autres. Avec un angle aigu, c’est l’inverse."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que cela permet de dire',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Dans un triangle, on mesure les trois carrés et l’égalité N’EST PAS vérifiée. Que peut-on affirmer ?"
            options={[
              'Ce triangle n’a pas d’angle droit',
              'Ce triangle a un angle droit mal placé',
              'On ne peut rien conclure',
              'Il faut refaire les mesures',
            ]}
            correct={0}
            cols={1}
            requires={['egalite-des-aires']}
            explain="Tu viens de le vérifier en déplaçant C : hors du cercle, l’égalité tombe toujours. Donc si elle tombe, c’est qu’il n’y a pas d’angle droit."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="condition-angle-droit"
              variant="new"
              lead="L’égalité et l’angle droit vont ensemble — dans les deux sens."
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Quand l’angle se casse"
      moduleSubtitle="L’égalité ne tient que pour l’angle droit"
      estimatedTime="10 min"
      brief={{
        tag: '🎬 Mission 02',
        title: 'Et si l’angle n’était plus droit ?',
        tone: 'amber',
        body: (
          <>
            Ton triangle du module 1 revient, mais son sommet est libéré du cercle.
            <strong> L’égalité des aires va-t-elle survivre ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5">
          <Unlink className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden="true" />
          <p className="text-sm text-violet-900">
            Va vers l’intérieur du cercle, puis nettement à l’extérieur. La balance penche des
            deux côtés — note bien lequel correspond à quoi.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
