import React from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import SectionHeader from '../../../../../common/components/SectionHeader';
import QuizQuestion from '../../../../../common/components/QuizQuestion';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

export default function Module07LectureGraphique() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(7);

  const handleNext = () => markModuleCompleted('L07');

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      chapterTitle={MODULE_CTX.chapterTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={7}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Lecture Graphique"
      moduleSubtitle="Déterminer visuellement l'expression f(x) = ax + b à partir de la droite."
      estimatedTime="12 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      {/* Section 1 : Méthode */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="La méthode en 2 étapes" color="cyan" />

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
            <p className="font-bold text-amber-900 mb-1">
              Étape 1 : Trouver <MathText>$b$</MathText> (ordonnée à l'origine)
            </p>
            <p className="text-xs text-amber-800">
              Repérez où la droite <strong>coupe l'axe vertical</strong> (axe des <MathText>$y$</MathText>).
              La hauteur de ce point est la valeur de <MathText>$b$</MathText>.
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
            <p className="font-bold text-emerald-900 mb-1">
              Étape 2 : Trouver <MathText>$a$</MathText> (méthode de l'escalier)
            </p>
            <p className="text-xs text-emerald-800">
              Partez d'un point de la droite. Avancez de <strong>1 unité à droite</strong>,
              puis mesurez la hauteur de montée/descente. Ce nombre est <MathText>$a$</MathText>.
            </p>
          </div>
        </div>

        {/* Graphique annoté */}
        <div className="flex justify-center">
          <div className="w-full max-w-[350px] aspect-square bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <svg viewBox="0 0 300 300" className="w-full h-full" role="img" aria-label="Graphique annoté de f(x) = 2x − 3">
              {Array.from({ length: 13 }).map((_, i) => {
                const pos = i * 25;
                if (pos === 150) return null;
                return (
                  <React.Fragment key={`g-${i}`}>
                    <line x1={pos} y1={0} x2={pos} y2={300} stroke="#e2e8f0" strokeWidth="1" />
                    <line x1={0} y1={pos} x2={300} y2={pos} stroke="#e2e8f0" strokeWidth="1" />
                  </React.Fragment>
                );
              })}
              <line x1="0" y1="150" x2="300" y2="150" stroke="#64748b" strokeWidth="2" />
              <line x1="150" y1="0" x2="150" y2="300" stroke="#64748b" strokeWidth="2" />
              <text x="285" y="140" className="font-mono text-[10px] fill-slate-500">x</text>
              <text x="155" y="15" className="font-mono text-[10px] fill-slate-500">y</text>
              <text x="135" y="165" className="font-mono text-[10px] fill-slate-500">0</text>
              <text x="173" y="165" className="font-mono text-[9px] fill-slate-400">1</text>
              <text x="135" y="126" className="font-mono text-[9px] fill-slate-400">1</text>

              {/* Droite f(x)=2x-3 */}
              <line x1="100" y1="325" x2="250" y2="25" stroke="#0284c7" strokeWidth="3" />
              <text x="200" y="60" className="font-mono font-bold text-[10px] fill-sky-700">f(x) = 2x − 3</text>

              {/* Annotation b */}
              <circle cx="150" cy="225" r="5" fill="#f59e0b" />
              <text x="110" y="240" className="font-mono font-bold text-[10px] fill-amber-600">b = −3</text>
              <line x1="150" y1="150" x2="150" y2="225" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3" />

              {/* Annotation a : escalier */}
              <circle cx="175" cy="175" r="4" fill="#334155" />
              <line x1="175" y1="175" x2="200" y2="175" stroke="#10b981" strokeWidth="2" strokeDasharray="4" />
              <text x="180" y="192" className="font-mono text-[9px] fill-emerald-600">+1</text>
              <line x1="200" y1="175" x2="200" y2="125" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" />
              <text x="207" y="155" className="font-mono font-bold text-[10px] fill-red-500">a = +2</text>
              <circle cx="200" cy="125" r="4" fill="#334155" />
            </svg>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700">
          <strong>Résumé :</strong>{' '}
          Sur le graphique ci-dessus, la droite coupe l'axe des <MathText>$y$</MathText> en{' '}
          <MathText>$-3$</MathText> donc <MathText>$b = -3$</MathText>. Quand on avance de 1,
          on monte de 2 donc <MathText>$a = 2$</MathText>. On conclut :{' '}
          <MathText>$f(x) = 2x - 3$</MathText>.
        </div>
      </section>

      {/* Section 2 : Quiz */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={2} title="À vous de lire !" color="emerald" />

        <QuizQuestion
          question={
            <p>
              D'après le graphique annoté ci-dessus, quelle est l'expression de la fonction ?
            </p>
          }
          choices={[
            { label: <MathText>$f(x) = -3x + 2$</MathText>, correct: false },
            { label: <MathText>$f(x) = 2x - 3$</MathText>, correct: true },
            { label: <MathText>$f(x) = 2x + 3$</MathText>, correct: false },
            { label: <MathText>$f(x) = -2x - 3$</MathText>, correct: false },
          ]}
          successFeedback={
            <>
              <strong>Exact !</strong> <MathText>$b = -3$</MathText> (intersection axe{' '}
              <MathText>$y$</MathText>) et <MathText>$a = 2$</MathText> (monter de 2 pour avancer
              de 1). Donc <MathText>$f(x) = 2x - 3$</MathText>. (+100 XP)
            </>
          }
          errorFeedback={
            <>
              Reprenez les deux étapes : 1) où la droite coupe l'axe des <MathText>$y$</MathText>{' '}
              → <MathText>$b$</MathText> ; 2) escalier de 1 à droite → hauteur = <MathText>$a$</MathText>.
            </>
          }
          onCorrect={() => awardXP({ moduleId: 'L07', exerciseId: 'L07-Q1', amount: 100 })}
        />
      </section>

      {/* À retenir */}
      <KeyTakeaway color="cyan">
        <li>
          • Pour lire <MathText>$b$</MathText> : cherchez où la droite coupe
          l'axe des <MathText>$y$</MathText>.
        </li>
        <li>
          • Pour lire <MathText>$a$</MathText> : avancez de 1 à droite et mesurez la variation
          de hauteur.
        </li>
        <li>
          • Si <MathText>$a$</MathText> est entier, l'escalier est simple ; sinon, prenez un
          déplacement <MathText>{'$\\Delta x$'}</MathText> plus grand et divisez.
        </li>
      </KeyTakeaway>
    </ModuleLayout>
  );
}
