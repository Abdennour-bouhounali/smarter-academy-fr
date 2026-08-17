import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import SectionHeader from '../../../../../common/components/SectionHeader';
import QuizQuestion from '../../../../../common/components/QuizQuestion';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

export default function Module04FonctionLineaire() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(4);
  const [a, setA] = useState(2);

  const handleNext = () => markModuleCompleted('L04');

  // Coordonnées SVG (repère 300×300, centre à (150,150), 1 unité = 15px)
  const toSVG = (mx, my) => ({ x: 150 + mx * 15, y: 150 - my * 15 });
  const p1 = toSVG(-10, a * -10);
  const p2 = toSVG(10, a * 10);
  const originDot = toSVG(0, 0);

  const xVals = [-2, -1, 0, 1, 2];

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
      moduleTitle="Fonction Linéaire"
      moduleSubtitle="Découvrir f(x) = ax — la proportionnalité sous forme de fonction."
      estimatedTime="10 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      {/* Section 1 : Définition */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="Définition et proportionnalité" color="blue" />

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <p className="text-slate-700 leading-relaxed mb-3">
            Une fonction est dite <strong>linéaire</strong> si elle s'écrit sous la forme :
          </p>
          <div className="text-center text-2xl font-mono font-bold text-blue-700 my-4">
            <MathText>$f(x) = ax$</MathText>
          </div>
          <p className="text-sm text-blue-800">
            Le nombre <MathText>$a$</MathText> est le <strong>coefficient directeur</strong>.
            C'est aussi le <strong>coefficient de proportionnalité</strong> : quand <MathText>$x$</MathText> est
            multiplié par un nombre, <MathText>$f(x)$</MathText> l'est aussi par le même nombre.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="font-bold text-slate-800 mb-2">Exemple concret :</p>
          <p className="text-slate-600 text-sm">
            Si 1 kg de pommes coûte 3 €, alors <MathText>$x$</MathText> kg coûtent <MathText>$3x$</MathText> €.
          </p>
          <p className="text-slate-600 text-sm mt-1">
            La fonction prix est linéaire : <MathText>$P(x) = 3x$</MathText> (ici <MathText>$a = 3$</MathText>).
          </p>
        </div>

        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
          <h3 className="font-bold text-indigo-900 mb-1">Représentation graphique 📈</h3>
          <p className="text-sm text-indigo-800">
            La droite représentant une fonction linéaire <strong>passe toujours par l'origine{' '}
            <MathText>$(0, 0)$</MathText></strong>. C'est sa propriété fondamentale.
          </p>
        </div>
      </section>

      {/* Section 2 : Simulateur */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={2} title="Simulateur : effet du coefficient a" color="indigo" />

        <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
          {/* Graphique */}
          <div className="relative w-full max-w-[300px] aspect-square bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-shrink-0">
            <svg viewBox="0 0 300 300" className="w-full h-full" role="img" aria-label="Représentation graphique de f(x)=ax">
              {Array.from({ length: 21 }).map((_, i) => {
                const pos = i * 15;
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
              <text x="282" y="140" className="font-mono text-[9px] fill-slate-500">x</text>
              <text x="155" y="13" className="font-mono text-[9px] fill-slate-500">y</text>
              <text x="133" y="165" className="font-mono text-[9px] fill-slate-500">0</text>
              <line
                x1={p1.x} y1={p1.y}
                x2={p2.x} y2={p2.y}
                stroke="#3b82f6" strokeWidth="3"
                style={{ transition: 'all 0.1s' }}
              />
              <circle cx={originDot.x} cy={originDot.y} r="5" fill="#ef4444" />
              <text x={155} y={145} className="font-mono text-[8px] fill-red-500 font-bold">O(0,0)</text>
            </svg>
          </div>

          {/* Contrôles */}
          <div className="w-full max-w-sm space-y-6">
            {/* Équation live */}
            <div className="bg-slate-900 text-white p-4 rounded-xl font-space font-bold text-2xl text-center shadow-lg">
              <MathText>$f(x) =$</MathText>
              <span className="text-blue-400 mx-1">{a === 1 ? '' : a === -1 ? '-' : a}</span>
              <MathText>$x$</MathText>
            </div>

            {/* Slider a */}
            <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center">
                <label htmlFor="slider-a-lin" className="font-bold text-blue-900 text-sm">
                  Coefficient directeur (<MathText>$a$</MathText>)
                </label>
                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{a}</span>
              </div>
              <input
                id="slider-a-lin"
                type="range" min="-5" max="5" step="0.5"
                value={a}
                onChange={(e) => setA(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <ul className="text-[11px] text-slate-500 space-y-0.5">
                <li>
                  <MathText>{'• $a > 0$ : la droite monte de gauche à droite.'}</MathText>
                </li>
                <li>
                  <MathText>{'• $a < 0$ : la droite descend de gauche à droite.'}</MathText>
                </li>
                <li>
                  • Quelle que soit la valeur de <MathText>$a$</MathText>,
                  la droite <strong>passe par O(0,0)</strong>.
                </li>
              </ul>
            </div>

            {/* Tableau de valeurs live */}
            <div className="overflow-x-auto">
              <table className="w-full text-center font-mono text-xs border-collapse">
                <tbody>
                  <tr className="bg-blue-100 text-blue-900 font-bold">
                    <td className="border border-blue-200 p-1 text-left pl-2">x</td>
                    {xVals.map(x => <td key={x} className="border border-blue-200 p-1">{x}</td>)}
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-slate-200 p-1 text-left pl-2 text-blue-700 font-bold">f(x)</td>
                    {xVals.map(x => (
                      <td key={x} className="border border-slate-200 p-1 font-bold" style={{ transition: 'all 0.1s' }}>
                        {(a * x) % 1 === 0 ? a * x : (a * x).toFixed(1)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 : Quiz */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={3} title="Reconnaître une fonction linéaire" color="emerald" />

        <QuizQuestion
          question={<p>Parmi les fonctions suivantes, laquelle est une fonction <strong>linéaire</strong> ?</p>}
          choices={[
            { label: <MathText>$f(x) = 2x + 3$</MathText>, correct: false },
            { label: <MathText>{'$g(x) = x^2$'}</MathText>, correct: false },
            { label: <MathText>$h(x) = -4x$</MathText>, correct: true },
          ]}
          layout="stack"
          successFeedback={
            <>
              <strong>Exact !</strong> <MathText>$h(x) = -4x$</MathText> est de la forme{' '}
              <MathText>$ax$</MathText> avec <MathText>$a = -4$</MathText>. Elle passe par l'origine. (+75 XP)
            </>
          }
          errorFeedback={
            <>
              Une fonction linéaire s'écrit <strong>uniquement</strong> <MathText>$ax$</MathText> :
              pas de terme constant ajouté (ce serait <MathText>$ax+b$</MathText>), et pas de puissance
              (ce serait <MathText>{'$x^2$'}</MathText>).
            </>
          }
          onCorrect={() => awardXP({ moduleId: 'L04', exerciseId: 'L04-Q1', amount: 75 })}
        />
      </section>

      {/* À retenir */}
      <KeyTakeaway color="blue">
        <li>
          • <MathText>$f(x) = ax$</MathText> est une <strong>fonction linéaire</strong>.
        </li>
        <li>
          • <MathText>$a$</MathText> est son <strong>coefficient directeur</strong> (pente de la droite).
        </li>
        <li>
          • Sa droite passe <strong>toujours par l'origine</strong> <MathText>$(0,0)$</MathText>.
        </li>
        <li>
          • C'est un modèle de <strong>proportionnalité directe</strong>.
        </li>
      </KeyTakeaway>
    </ModuleLayout>
  );
}
