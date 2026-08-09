import React from 'react';
import ModuleLayout from '../../../../common/components/ModuleLayout';
import MathText from '../../../../common/components/MathText';
import SectionHeader from '../../../../common/components/SectionHeader';
import QuizQuestion from '../../../../common/components/QuizQuestion';
import KeyTakeaway from '../../../../common/components/KeyTakeaway';
import { useProgress } from '../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

export default function Module01NotionFonction() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(1);

  const handleNext = () => markModuleCompleted('L01');

  return (
    <ModuleLayout
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={1}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Notion de Fonction"
      moduleSubtitle="Comprendre qu'une fonction est une règle qui associe un unique résultat à chaque entrée."
      estimatedTime="8 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      {/* Section 1 : Définition */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="La machine mathématique" color="blue" />

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
          <p className="text-slate-700 leading-relaxed mb-6">
            Une <strong>fonction</strong> <MathText>$f$</MathText> est comme une machine.
            On y fait entrer un nombre <MathText>$x$</MathText>, la machine effectue un calcul,
            et ressort un nouveau nombre appelé <MathText>$f(x)$</MathText>.
          </p>

          {/* Machine visuelle */}
          <div className="flex items-center justify-center gap-4 my-8 flex-wrap">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center font-mono font-bold text-slate-700 text-xl shadow-inner mx-auto mb-2">
                <MathText>$x$</MathText>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">Entrée</span>
            </div>

            <div className="text-slate-400 font-bold text-xl" aria-hidden="true">➔</div>

            <div className="bg-indigo-500 text-white p-4 rounded-xl font-space font-bold text-lg shadow-lg">
              <MathText>$f$</MathText> — Fonction<br />
              <span className="text-sm font-normal opacity-80">ex : multiplier par 2</span>
            </div>

            <div className="text-slate-400 font-bold text-xl" aria-hidden="true">➔</div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center font-mono font-bold text-emerald-700 text-xl shadow-inner mx-auto mb-2">
                <MathText>$f(x)$</MathText>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 uppercase">Sortie</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 italic">
            Si <MathText>$f(x) = 2x$</MathText>, alors pour <MathText>$x = 3$</MathText>, on
            obtient <MathText>$f(3) = 2 \times 3 = 6$</MathText>.
          </p>
        </div>
      </section>

      {/* Section 2 : Exemples concrets */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={2} title="Exemples du quotidien" color="indigo" />

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
            <p className="font-bold text-blue-900 mb-1">Prix d'un trajet taxi</p>
            <p className="text-xs text-blue-800">
              Prix pour <MathText>$x$</MathText> km : <MathText>{'$2 \\times x$'}</MathText> euros.
              Pour <MathText>$x = 5$</MathText> km, le prix est <MathText>$10$</MathText> €.
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
            <p className="font-bold text-emerald-900 mb-1">Conversion de degrés Celsius</p>
            <p className="text-xs text-emerald-800">
              <MathText>{'$F(x) = 1{,}8x + 32$'}</MathText> convertit les °C en °F.
              Pour <MathText>$x = 0$</MathText>, on obtient <MathText>$F(0) = 32$</MathText> °F.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="font-bold text-slate-800 mb-1 text-sm">⚠️ Règle importante</p>
          <p className="text-sm text-slate-600">
            Une fonction associe à chaque valeur d'entrée <strong>un seul</strong> résultat.
            On dit qu'elle est <strong>bien définie</strong>.
          </p>
        </div>
      </section>

      {/* Section 3 : Quiz */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={3} title="À vous de jouer !" color="emerald" />

        <QuizQuestion
          question={
            <p>
              Soit la fonction <MathText>$g(x) = 3x - 1$</MathText>.
              Quelle est la valeur de sortie quand <MathText>$x = 4$</MathText> ?
            </p>
          }
          choices={[
            { label: <MathText>$11$</MathText>, correct: true },
            { label: <MathText>$12$</MathText>, correct: false },
            { label: <MathText>$3$</MathText>, correct: false },
          ]}
          successFeedback={
            <>
              <strong>Exact !</strong> On remplace <MathText>$x$</MathText> par <MathText>$4$</MathText> :{' '}
              <MathText>{'$g(4) = 3 \\times 4 - 1 = 12 - 1 = 11$'}</MathText>. (+50 XP)
            </>
          }
          errorFeedback={
            <>
              Pour calculer la valeur de sortie, remplacez <MathText>$x$</MathText> par{' '}
              <MathText>$4$</MathText> dans <MathText>$3x - 1$</MathText>.
              Calculez d'abord <MathText>{'$3 \\times 4$'}</MathText>, puis soustrayez 1.
            </>
          }
          onCorrect={() => awardXP({ moduleId: 'L01', exerciseId: 'L01-Q1', amount: 50 })}
        />
      </section>

      {/* Section 4 : À retenir */}
      <KeyTakeaway color="indigo">
        <li>
          • Une <strong>fonction</strong> est une règle de calcul : à chaque entrée{' '}
          <MathText>$x$</MathText> correspond une sortie <MathText>$f(x)$</MathText>.
        </li>
        <li>
          • On note cette sortie <MathText>$f(x)$</MathText> (lire : « f de x »).
        </li>
        <li>
          • Chaque entrée donne <strong>exactement une</strong> sortie.
        </li>
      </KeyTakeaway>
    </ModuleLayout>
  );
}
