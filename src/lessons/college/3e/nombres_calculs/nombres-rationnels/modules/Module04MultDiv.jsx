import React from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import SectionHeader from '../../../../../common/components/SectionHeader';
import QuizQuestion from '../../../../../common/components/QuizQuestion';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { AlertTriangle, ArrowRight, XCircle } from 'lucide-react';

export default function Module04MultDiv() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(4);

  const handleNext = () => markModuleCompleted('L04');

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      chapterTitle={MODULE_CTX.chapterTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={4}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Multiplication et Division"
      moduleSubtitle="Les règles de calcul pour multiplier et diviser des nombres rationnels, et l'importance de l'inverse."
      estimatedTime="10 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      {/* Section 1 : La multiplication */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="La Multiplication : Simplifiez avant !" color="blue" />

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <p className="text-slate-700 leading-relaxed mb-4">
            Pour la multiplication, <strong>pas besoin</strong> de mettre au même dénominateur ! On multiplie simplement les numérateurs entre eux, et les dénominateurs entre eux.
          </p>

          <div className="bg-white p-4 rounded-xl border-2 border-blue-100 flex items-center justify-center text-xl mb-6 font-bold text-slate-800">
            <MathText>{'$\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}$'}</MathText>
          </div>

          <p className="text-slate-700 leading-relaxed mb-4">
            Mais attention ! Le secret des champions, c'est de <strong>simplifier avant de calculer</strong> pour éviter les très grands nombres.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl relative">
              <span className="absolute -top-3 -right-3 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">Méthode lente</span>
              <h4 className="font-bold text-rose-900 mb-2">Calculer puis simplifier</h4>
              <div className="text-center font-mono text-sm space-y-2">
                <MathText>{'$\\frac{15}{14} \\times \\frac{21}{10} = \\frac{315}{140}$'}</MathText>
                <div className="text-rose-600 text-xs mt-2">Puis il faut trouver le grand diviseur commun... (bon courage !)</div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl relative">
              <span className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">Méthode Ninja 🥷</span>
              <h4 className="font-bold text-emerald-900 mb-2">Décomposer avant</h4>
              <div className="text-center font-mono text-sm space-y-2">
                <MathText>{'$\\frac{3 \\times 5}{2 \\times 7} \\times \\frac{3 \\times 7}{2 \\times 5}$'}</MathText>
                <p className="text-emerald-700 text-xs italic my-2">On barre les 5 et les 7 qui sont en haut et en bas.</p>
                <div className="text-lg font-bold text-emerald-800">
                  <MathText>{'$\\frac{3 \\times 3}{2 \\times 2} = \\frac{9}{4}$'}</MathText>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 : La division et l'inverse */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={2} title="La Division : Le pouvoir de l'inverse" color="indigo" />

        <p className="text-slate-700 leading-relaxed mb-4">
          Diviser par une fraction, c'est très difficile directement. Mais il existe une règle magique : <strong>Diviser par un nombre, c'est multiplier par son inverse.</strong>
        </p>

        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-1 bg-amber-50 p-4 rounded-xl border border-amber-200">
            <h4 className="font-bold text-amber-900 flex items-center gap-2 mb-2">
              <AlertTriangle size={18} /> Ne pas confondre
            </h4>
            <p className="text-sm text-amber-800 mb-2">
              <strong>L'opposé</strong> change le signe : l'opposé de <MathText>{'$\\frac{3}{5}$'}</MathText> est <MathText>{'$-\\frac{3}{5}$'}</MathText>.
            </p>
            <p className="text-sm text-amber-800">
              <strong>L'inverse</strong> retourne la fraction : l'inverse de <MathText>{'$\\frac{3}{5}$'}</MathText> est <MathText>{'$\\frac{5}{3}$'}</MathText>.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
          <p className="text-sm text-slate-500 mb-4 uppercase tracking-wider font-bold">Règle de la division</p>
          
          <div className="flex items-center justify-center gap-4 text-xl flex-wrap">
            <div className="bg-white px-4 py-3 border-2 border-slate-300 rounded-xl font-bold shadow-sm">
              <MathText>{'$\\frac{A}{B} \\div \\frac{C}{D}$'}</MathText>
            </div>
            <ArrowRight className="text-slate-400" />
            <div className="bg-white px-4 py-3 border-2 border-indigo-300 rounded-xl font-bold text-indigo-800 shadow-sm">
              <MathText>{'$\\frac{A}{B} \\times \\frac{D}{C}$'}</MathText>
            </div>
          </div>
          
          <p className="text-sm text-indigo-600 mt-4 font-medium">On garde la première fraction, on change le <MathText>{'$\\div$'}</MathText> en <MathText>{'$\\times$'}</MathText>, et on <strong>inverse</strong> la deuxième fraction.</p>
        </div>

        {/* Erreur fréquente */}
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl mt-4">
          <p className="font-bold text-rose-900 mb-1 flex items-center gap-2">
            <XCircle size={18} /> Le piège de l'inversion
          </p>
          <p className="text-sm text-rose-800 mb-2">
            N'inversez jamais la <strong>première</strong> fraction ! On n'inverse que celle qui est <strong>après</strong> le signe diviser.
          </p>
        </div>
      </section>

      {/* Section 3 : Quiz */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={3} title="À vous de jouer !" color="emerald" />

        <QuizQuestion
          question={
            <p>
              Par quelle opération remplace-t-on ce calcul : <MathText>{'$\\frac{2}{7} \\div \\frac{5}{3}$'}</MathText> ?
            </p>
          }
          choices={[
            { label: <MathText>{'$\\frac{7}{2} \\times \\frac{5}{3}$'}</MathText>, correct: false },
            { label: <MathText>{'$\\frac{2}{7} \\times \\frac{3}{5}$'}</MathText>, correct: true },
            { label: <MathText>{'$\\frac{7}{2} \\times \\frac{3}{5}$'}</MathText>, correct: false },
          ]}
          successFeedback={
            <>
              <strong>Parfait !</strong> La première fraction reste intacte, le signe division devient multiplication, et la deuxième fraction s'inverse. (+50 XP)
            </>
          }
          errorFeedback={
            <>
              Rappelez-vous la règle d'or : seule la fraction qui est divisée (celle de droite) doit être inversée. La première fraction ne bouge jamais.
            </>
          }
          onCorrect={() => awardXP({ moduleId: 'L04', exerciseId: 'L04-Q1', amount: 50 })}
        />
      </section>

      {/* Section 4 : À retenir */}
      <KeyTakeaway color="blue">
        <li>
          • Pour <strong>multiplier</strong> : on multiplie les hauts ensemble et les bas ensemble, mais on décompose avant pour simplifier !
        </li>
        <li>
          • Pour <strong>diviser</strong> : on multiplie par l'inverse de la deuxième fraction.
        </li>
        <li>
          • <strong>L'inverse</strong> d'une fraction <MathText>{'$\\frac{a}{b}$'}</MathText> est la fraction <MathText>{'$\\frac{b}{a}$'}</MathText>.
        </li>
      </KeyTakeaway>
    </ModuleLayout>
  );
}
