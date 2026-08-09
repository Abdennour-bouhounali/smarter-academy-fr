import React from 'react';
import ModuleLayout from '../../../../common/components/ModuleLayout';
import MathText from '../../../../common/components/MathText';
import SectionHeader from '../../../../common/components/SectionHeader';
import QuizQuestion from '../../../../common/components/QuizQuestion';
import KeyTakeaway from '../../../../common/components/KeyTakeaway';
import { useProgress } from '../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

export default function Module02ImageAntecedent() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(2);

  const handleNext = () => markModuleCompleted('L02');

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={2}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Image et Antécédent"
      moduleSubtitle="Calculer f(x) et retrouver x connaissant f(x) — deux opérations distinctes et fondamentales."
      estimatedTime="8 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      {/* Section 1 : Définitions côte à côte */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="Deux notions, deux opérations" color="indigo" />

        <div className="grid sm:grid-cols-2 gap-4">
          {/* IMAGE */}
          <div className="bg-blue-50 border-2 border-blue-200 p-5 rounded-2xl space-y-3">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-mono font-bold">
              📤 L'IMAGE
            </div>
            <p className="font-bold text-blue-900">
              L'<strong>image</strong> de <MathText>$x$</MathText> par <MathText>$f$</MathText>,
              c'est le résultat <MathText>$f(x)$</MathText>.
            </p>
            <div className="bg-white border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
              <p>Pour <MathText>$f(x) = 2x + 1$</MathText> et <MathText>$x = 3$</MathText> :</p>
              <p className="font-mono font-bold mt-1">
                <MathText>{'$f(3) = 2 \\times 3 + 1 = 7$'}</MathText>
              </p>
              <p className="text-xs text-blue-600 mt-1">➜ L'image de 3 est <strong>7</strong>.</p>
            </div>
            <p className="text-xs text-blue-700 italic">
              On connaît l'entrée (x), on calcule la sortie f(x).
            </p>
          </div>

          {/* ANTÉCÉDENT */}
          <div className="bg-amber-50 border-2 border-amber-200 p-5 rounded-2xl space-y-3">
            <div className="inline-block px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-mono font-bold">
              📥 L'ANTÉCÉDENT
            </div>
            <p className="font-bold text-amber-900">
              L'<strong>antécédent</strong> de <MathText>$k$</MathText> est le{' '}
              <MathText>$x$</MathText> tel que <MathText>$f(x) = k$</MathText>.
            </p>
            <div className="bg-white border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
              <p>Pour <MathText>$f(x) = 2x + 1$</MathText>, quel <MathText>$x$</MathText> donne <MathText>$f(x) = 7$</MathText> ?</p>
              <p className="font-mono font-bold mt-1">
                <MathText>{'$2x + 1 = 7 \\Rightarrow 2x = 6 \\Rightarrow x = 3$'}</MathText>
              </p>
              <p className="text-xs text-amber-700 mt-1">➜ L'antécédent de 7 est <strong>3</strong>.</p>
            </div>
            <p className="text-xs text-amber-700 italic">
              On connaît la sortie f(x), on cherche l'entrée x.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700">
          <strong>Lien entre les deux :</strong> Si l'image de 3 est 7, alors l'antécédent de 7 est 3.
          Ce sont deux façons de regarder la même relation.
        </div>
      </section>

      {/* Section 2 : Quiz image */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={2} title="Calcul d'image" color="blue" />

        <QuizQuestion
          question={
            <p>
              Soit <MathText>$h(x) = 4x - 3$</MathText>.
              Calculez l'<strong>image de 2</strong> par <MathText>$h$</MathText>.
            </p>
          }
          choices={[
            { label: <MathText>$5$</MathText>, correct: true },
            { label: <MathText>$11$</MathText>, correct: false },
            { label: <MathText>$8$</MathText>, correct: false },
          ]}
          successFeedback={
            <>
              <strong>Exact !</strong>{' '}
              <MathText>{'$h(2) = 4 \\times 2 - 3 = 8 - 3 = 5$'}</MathText>. (+25 XP)
            </>
          }
          errorFeedback={
            <>
              Remplacez <MathText>$x$</MathText> par <MathText>$2$</MathText> dans{' '}
              <MathText>$4x - 3$</MathText> : <MathText>{'$4 \\times 2 - 3$'}</MathText>.
            </>
          }
          onCorrect={() => awardXP({ moduleId: 'L02', exerciseId: 'L02-Q1', amount: 25 })}
        />
      </section>

      {/* Section 3 : Quiz antécédent */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={3} title="Recherche d'antécédent" color="amber" />

        <QuizQuestion
          question={
            <p>
              Toujours avec <MathText>$h(x) = 4x - 3$</MathText>.
              Quel est l'<strong>antécédent de 9</strong> ?
              <span className="block text-xs text-slate-500 mt-1">
                Indice : il faut résoudre <MathText>$4x - 3 = 9$</MathText>.
              </span>
            </p>
          }
          choices={[
            { label: <MathText>$3$</MathText>, correct: true },
            { label: <MathText>$33$</MathText>, correct: false },
            { label: <MathText>$2$</MathText>, correct: false },
          ]}
          successFeedback={
            <>
              <strong>Exact !</strong>{' '}
              <MathText>{'$4x - 3 = 9 \\Rightarrow 4x = 12 \\Rightarrow x = 3$'}</MathText>.
              L'antécédent de 9 est 3. (+25 XP)
            </>
          }
          errorFeedback={
            <>
              Posez l'équation <MathText>$4x - 3 = 9$</MathText>, puis isolez{' '}
              <MathText>$x$</MathText> : ajoutez 3 des deux côtés, puis divisez par 4.
            </>
          }
          onCorrect={() => awardXP({ moduleId: 'L02', exerciseId: 'L02-Q2', amount: 25 })}
        />
      </section>

      {/* Section 4 : À retenir */}
      <KeyTakeaway color="indigo">
        <li>
          • <strong>Image :</strong> je connais <MathText>$x$</MathText>, je calcule{' '}
          <MathText>$f(x)$</MathText>.
        </li>
        <li>
          • <strong>Antécédent :</strong> je connais <MathText>$f(x)$</MathText>, je résous
          pour trouver <MathText>$x$</MathText>.
        </li>
      </KeyTakeaway>
    </ModuleLayout>
  );
}
