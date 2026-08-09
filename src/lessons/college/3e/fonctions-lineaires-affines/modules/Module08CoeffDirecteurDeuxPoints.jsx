import React from 'react';
import ModuleLayout from '../../../../common/components/ModuleLayout';
import MathText from '../../../../common/components/MathText';
import SectionHeader from '../../../../common/components/SectionHeader';
import QuizQuestion from '../../../../common/components/QuizQuestion';
import KeyTakeaway from '../../../../common/components/KeyTakeaway';
import { useProgress } from '../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

export default function Module08CoeffDirecteurDeuxPoints() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(8);

  const handleNext = () => markModuleCompleted('L08');

  return (
    <ModuleLayout
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={8}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Coefficient directeur avec deux points"
      moduleSubtitle="Déterminer l'expression complète f(x) = ax + b en connaissant deux points de la droite."
      estimatedTime="12 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      {/* Section 1 : Formule */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="La formule du coefficient directeur" color="rose" />

        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center">
          <p className="text-slate-700 leading-relaxed mb-4">
            Si on connaît deux points <MathText>{'$A(x_A\\,;\\,y_A)$'}</MathText> et{' '}
            <MathText>{'$B(x_B\\,;\\,y_B)$'}</MathText> appartenant à la droite, le coefficient
            directeur est :
          </p>
          <div className="inline-block bg-white border border-rose-200 rounded-2xl p-6 shadow-sm">
            <MathText>{'$$a = \\frac{y_B - y_A}{x_B - x_A}$$'}</MathText>
          </div>
          <p className="text-sm text-rose-800 mt-4">
            C'est la <strong>variation de hauteur</strong> (Δy) divisée par la{' '}
            <strong>variation horizontale</strong> (Δx). On dit aussi « élévation sur distance ».
          </p>
        </div>

        {/* Méthode complète */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-slate-800">
            Méthode complète pour trouver <MathText>$f(x) = ax + b$</MathText>
          </h3>
          <ol className="text-sm text-slate-700 space-y-2 list-none">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">①</span>
              <span>
                <MathText>{'Calculer $a$ avec la formule : $a = \\dfrac{y_B - y_A}{x_B - x_A}$'}</MathText>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">②</span>
              <span>
                Substituer un point connu dans <MathText>$f(x) = ax + b$</MathText>, par
                exemple <MathText>$A$</MathText>, pour former l'équation{' '}
                <MathText>{'$y_A = a \\cdot x_A + b$'}</MathText>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">③</span>
              <span>Résoudre pour trouver <MathText>$b$</MathText>, puis écrire l'expression complète.</span>
            </li>
          </ol>

          <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm mt-2">
            <p className="font-bold text-slate-800 mb-2">
              Exemple : <MathText>{'$A(2\\,;\\,5)$'}</MathText> et <MathText>{'$B(4\\,;\\,11)$'}</MathText>
            </p>
            <p className="text-slate-600">
              <MathText>{'① $a = \\dfrac{11 - 5}{4 - 2} = \\dfrac{6}{2} = 3$'}</MathText>
            </p>
            <p className="text-slate-600 mt-1">
              <MathText>{'② On remplace $A$ : $5 = 3 \\times 2 + b \\Rightarrow 5 = 6 + b \\Rightarrow b = -1$'}</MathText>
            </p>
            <p className="text-slate-600 mt-1 font-bold">
              <MathText>{'③ Donc $f(x) = 3x - 1$.'}</MathText>
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 : Quiz a */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={2} title="Calculer le coefficient a" color="rose" />

        <QuizQuestion
          question={
            <p>
              Soient <MathText>{'$A(1\\,;\\,3)$'}</MathText> et <MathText>{'$B(4\\,;\\,9)$'}</MathText>.
              Calculez le coefficient directeur <MathText>$a$</MathText>.
            </p>
          }
          choices={[
            { label: <MathText>$2$</MathText>, correct: true },
            { label: <MathText>$3$</MathText>, correct: false },
            { label: <MathText>$6$</MathText>, correct: false },
          ]}
          successFeedback={
            <>
              <strong>Exact !</strong>{' '}
              <MathText>{'$a = \\dfrac{9 - 3}{4 - 1} = \\dfrac{6}{3} = 2$'}</MathText>. (+50 XP)
            </>
          }
          errorFeedback={
            <>
              Appliquez la formule : numérateur = <MathText>{'$y_B - y_A = 9 - 3$'}</MathText> ;
              dénominateur = <MathText>{'$x_B - x_A = 4 - 1$'}</MathText>.
            </>
          }
          onCorrect={() => awardXP({ moduleId: 'L08', exerciseId: 'L08-Q1', amount: 50 })}
        />
      </section>

      {/* Section 3 : Quiz expression complète */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={3} title="Trouver l'expression complète" color="amber" />

        <QuizQuestion
          question={
            <p>
              Toujours avec <MathText>{'$A(1\\,;\\,3)$'}</MathText> et{' '}
              <MathText>{'$B(4\\,;\\,9)$'}</MathText> et <MathText>$a = 2$</MathText>.
              Quelle est l'expression de <MathText>$f(x)$</MathText> ?
              <span className="block text-xs text-slate-500 mt-1">
                Indice : substituez <MathText>$A$</MathText> dans <MathText>$f(x) = 2x + b$</MathText> pour trouver <MathText>$b$</MathText>.
              </span>
            </p>
          }
          choices={[
            { label: <MathText>$f(x) = 2x + 1$</MathText>, correct: true },
            { label: <MathText>$f(x) = 2x + 3$</MathText>, correct: false },
            { label: <MathText>$f(x) = 2x - 1$</MathText>, correct: false },
            { label: <MathText>$f(x) = 3x + 2$</MathText>, correct: false },
          ]}
          successFeedback={
            <>
              <strong>Parfait !</strong>{' '}
              <MathText>{'$f(1) = 2 \\times 1 + b = 3 \\Rightarrow b = 1$'}</MathText>.
              Donc <MathText>$f(x) = 2x + 1$</MathText>. (+50 XP)
            </>
          }
          errorFeedback={
            <>
              Remplacez le point <MathText>{'$A(1\\,;\\,3)$'}</MathText> dans{' '}
              <MathText>$f(x) = 2x + b$</MathText> :{' '}
              <MathText>{'$3 = 2 \\times 1 + b$'}</MathText>, donc <MathText>$b = 3 - 2 = 1$</MathText>.
            </>
          }
          onCorrect={() => awardXP({ moduleId: 'L08', exerciseId: 'L08-Q2', amount: 50 })}
        />
      </section>

      {/* À retenir */}
      <KeyTakeaway color="rose">
        <li>
          • <MathText>{'$a = \\dfrac{y_B - y_A}{x_B - x_A}$'}</MathText> (différence des ordonnées / différence des abscisses).
        </li>
        <li>
          • On substitue ensuite un point connu pour trouver <MathText>$b$</MathText>.
        </li>
        <li>
          • On vérifie l'expression avec le deuxième point.
        </li>
      </KeyTakeaway>
    </ModuleLayout>
  );
}
