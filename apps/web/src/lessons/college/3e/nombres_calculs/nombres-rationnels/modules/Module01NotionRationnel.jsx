import React from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import SectionHeader from '../../../../../common/components/SectionHeader';
import QuizQuestion from '../../../../../common/components/QuizQuestion';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

export default function Module01NotionRationnel() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(1);

  const handleNext = () => markModuleCompleted('L01');

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      chapterTitle={MODULE_CTX.chapterTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={1}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Notion de nombre rationnel"
      moduleSubtitle="Comprendre le lien entre fraction, quotient et nombre rationnel."
      estimatedTime="8 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      {/* Section 1 : Fraction et Quotient */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="De la fraction au quotient" color="blue" />

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <p className="text-slate-700 leading-relaxed mb-4">
            Une <strong>fraction</strong> s'écrit sous la forme <MathText>{'$\\frac{a}{b}$'}</MathText>, où :
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
            <li><MathText>$a$</MathText> est le numérateur (un entier).</li>
            <li><MathText>$b$</MathText> est le dénominateur (un entier différent de 0).</li>
          </ul>

          <p className="text-slate-700 leading-relaxed">
            Mais que représente cette écriture ? <MathText>{'$\\frac{a}{b}$'}</MathText> est en réalité le résultat de la <strong>division</strong> de <MathText>$a$</MathText> par <MathText>$b$</MathText>. On l'appelle le <strong>quotient</strong>.
          </p>

          <div className="flex items-center justify-center gap-4 my-8 flex-wrap">
            <div className="text-center">
              <div className="bg-white px-6 py-4 rounded-xl border-2 border-slate-300 shadow-sm text-2xl">
                <MathText>{'$\\frac{3}{4}$'}</MathText>
              </div>
              <span className="text-sm font-medium text-slate-500 mt-2 block">Fraction</span>
            </div>

            <div className="text-slate-400 font-bold text-xl" aria-hidden="true">=</div>

            <div className="text-center">
              <div className="bg-white px-6 py-4 rounded-xl border-2 border-slate-300 shadow-sm text-2xl">
                <MathText>{'$3 \\div 4$'}</MathText>
              </div>
              <span className="text-sm font-medium text-slate-500 mt-2 block">Division</span>
            </div>

            <div className="text-slate-400 font-bold text-xl" aria-hidden="true">=</div>

            <div className="text-center">
              <div className="bg-white px-6 py-4 rounded-xl border-2 border-emerald-300 shadow-sm text-2xl text-emerald-700">
                <MathText>{'$0{,}75$'}</MathText>
              </div>
              <span className="text-sm font-medium text-emerald-600 mt-2 block">Quotient (Valeur)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 : Qu'est-ce qu'un nombre rationnel ? */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={2} title="Le Nombre Rationnel" color="indigo" />

        <p className="text-slate-700 leading-relaxed">
          Un <strong>nombre rationnel</strong> est un nombre qui peut s'écrire sous la forme d'une fraction <MathText>{'$\\frac{a}{b}$'}</MathText> (avec <MathText>$a$</MathText> et <MathText>$b$</MathText> des entiers, et <MathText>$b \\neq 0$</MathText>).
        </p>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <span>✍️</span> Écriture décimale finie
            </h4>
            <p className="text-sm text-blue-800 mb-2">
              La division s'arrête. Le nombre rationnel est aussi un <strong>nombre décimal</strong>.
            </p>
            <div className="bg-white p-3 rounded border border-blue-100 flex items-center justify-center text-lg">
              <MathText>{'$\\frac{1}{2} = 0{,}5$'}</MathText>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 p-5 rounded-xl">
            <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
              <span>♾️</span> Écriture décimale infinie périodique
            </h4>
            <p className="text-sm text-purple-800 mb-2">
              La division ne s'arrête jamais, mais une séquence de chiffres se répète (la période). Ce <strong>n'est pas</strong> un nombre décimal, mais c'est bien un nombre rationnel !
            </p>
            <div className="bg-white p-3 rounded border border-purple-100 flex flex-col items-center justify-center text-lg gap-1">
              <MathText>{'$\\frac{1}{3} = 0{,}33333...$'}</MathText>
            </div>
          </div>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mt-4">
          <p className="font-bold text-amber-900 mb-1 text-sm">💡 Astuce</p>
          <p className="text-sm text-amber-800">
            Tous les nombres entiers et décimaux sont des rationnels ! Par exemple, <MathText>{'$5 = \\frac{5}{1}$'}</MathText> et <MathText>{'$1{,}2 = \\frac{12}{10}$'}</MathText>.
          </p>
        </div>
      </section>

      {/* Section 3 : Quiz */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={3} title="À vous de jouer !" color="emerald" />

        <QuizQuestion
          question={
            <p>
              Le nombre <MathText>{'$\\frac{2}{3}$'}</MathText> est-il un nombre décimal ?
            </p>
          }
          choices={[
            { label: "Oui, car c'est un nombre rationnel.", correct: false },
            { label: "Non, car sa division ne s'arrête jamais.", correct: true },
            { label: "Oui, car il s'écrit avec une fraction.", correct: false },
          ]}
          successFeedback={
            <>
              <strong>Exact !</strong> La division de 2 par 3 donne <MathText>{'$0{,}6666...$'}</MathText> Cela ne s'arrête jamais. <MathText>{'$\\frac{2}{3}$'}</MathText> est un nombre rationnel, mais pas un nombre décimal. (+50 XP)
            </>
          }
          errorFeedback={
            <>
              Attention, tous les rationnels (fractions) ne sont pas des nombres décimaux. Calculez <MathText>{'$2 \\div 3$'}</MathText> de tête ou posez la division pour voir si elle s'arrête.
            </>
          }
          onCorrect={() => awardXP({ moduleId: 'L01', exerciseId: 'L01-Q1', amount: 50 })}
        />
      </section>

      {/* Section 4 : À retenir */}
      <KeyTakeaway color="emerald">
        <li>
          • Une <strong>fraction</strong> représente le quotient d'une division : <MathText>{'$\\frac{a}{b} = a \\div b$'}</MathText>.
        </li>
        <li>
          • Un <strong>nombre rationnel</strong> est un nombre qui peut s'écrire sous forme de fraction.
        </li>
        <li>
          • L'écriture décimale d'un nombre rationnel est soit <strong>finie</strong> (c'est alors un nombre décimal), soit <strong>infinie périodique</strong> (les chiffres se répètent à l'infini).
        </li>
      </KeyTakeaway>
    </ModuleLayout>
  );
}
