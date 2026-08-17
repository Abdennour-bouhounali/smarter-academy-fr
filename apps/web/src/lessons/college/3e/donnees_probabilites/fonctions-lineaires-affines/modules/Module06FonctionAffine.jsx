import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import SectionHeader from '../../../../../common/components/SectionHeader';
import QuizQuestion from '../../../../../common/components/QuizQuestion';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

export default function Module06FonctionAffine() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(6);
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);

  const handleNext = () => markModuleCompleted('L06');

  // SVG helpers
  const toSVG = (mx, my) => ({ x: 200 + mx * 20, y: 200 - my * 20 });
  const pt1 = toSVG(-10, a * -10 + b);
  const pt2 = toSVG(10, a * 10 + b);
  const originPt = toSVG(0, b);

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      chapterTitle={MODULE_CTX.chapterTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={6}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Fonction Affine"
      moduleSubtitle="Découvrir f(x) = ax + b — une généralisation de la fonction linéaire."
      estimatedTime="10 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      {/* Section 1 : Définition */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="Définition : deux paramètres au lieu d'un" color="purple" />

        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
          <p className="text-slate-700 leading-relaxed mb-3">
            Une fonction est dite <strong>affine</strong> si elle s'écrit sous la forme :
          </p>
          <div className="text-center text-3xl font-mono font-bold text-purple-700 my-4">
            <MathText>$f(x) = ax + b$</MathText>
          </div>
          <p className="text-sm text-purple-800">
            C'est une généralisation : si <MathText>$b = 0$</MathText>, on retrouve la fonction
            linéaire <MathText>$f(x) = ax$</MathText>.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
            <p className="font-bold text-blue-900 mb-1">
              Le coefficient directeur (<MathText>$a$</MathText>)
            </p>
            <p className="text-xs text-blue-800">
              C'est la pente de la droite. Si <MathText>{'$a > 0$'}</MathText>, la droite monte.
              Si <MathText>{'$a < 0$'}</MathText>, elle descend.
              Si <MathText>{'$a = 0$'}</MathText>, elle est horizontale.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
            <p className="font-bold text-amber-900 mb-1">
              L'ordonnée à l'origine (<MathText>$b$</MathText>)
            </p>
            <p className="text-xs text-amber-800">
              C'est la valeur de <MathText>$f(0)$</MathText>. La droite coupe l'axe des ordonnées
              (l'axe vertical) au point <MathText>{'$(0\\,;\\,b)$'}</MathText>.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="font-bold text-slate-800 mb-2">Exemple concret :</p>
          <p className="text-slate-600 text-sm">
            Un abonnement coûte 10 € par mois. Chaque option supplémentaire coûte 2 €.
          </p>
          <p className="text-slate-600 text-sm mt-1">
            Coût total pour <MathText>$x$</MathText> options :{' '}
            <MathText>{'$P(x) = 2x + 10$'}</MathText> (ici <MathText>$a = 2$</MathText>,{' '}
            <MathText>$b = 10$</MathText>).
          </p>
        </div>
      </section>

      {/* Section 2 : Simulateur double */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-8 space-y-6">
        <SectionHeader number={2} title="Simulateur interactif" color="indigo" />

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          {/* Graphique */}
          <div className="relative w-full max-w-[400px] aspect-square bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-shrink-0">
            <svg viewBox="0 0 400 400" className="w-full h-full" role="img" aria-label="Graphique de f(x)=ax+b">
              {Array.from({ length: 21 }).map((_, i) => {
                const pos = i * 20;
                if (pos === 200) return null;
                return (
                  <React.Fragment key={`g-${i}`}>
                    <line x1={pos} y1={0} x2={pos} y2={400} stroke="#e2e8f0" strokeWidth="1" />
                    <line x1={0} y1={pos} x2={400} y2={pos} stroke="#e2e8f0" strokeWidth="1" />
                  </React.Fragment>
                );
              })}
              <line x1="0" y1="200" x2="400" y2="200" stroke="#64748b" strokeWidth="2" />
              <line x1="200" y1="0" x2="200" y2="400" stroke="#64748b" strokeWidth="2" />
              <text x="385" y="190" className="font-mono text-[10px] fill-slate-500">x</text>
              <text x="210" y="15" className="font-mono text-[10px] fill-slate-500">y</text>
              <text x="185" y="215" className="font-mono text-[10px] fill-slate-500">0</text>
              <line
                x1={pt1.x} y1={pt1.y}
                x2={pt2.x} y2={pt2.y}
                stroke="#7c3aed" strokeWidth="3"
                style={{ transition: 'all 0.1s' }}
              />
              <circle cx={originPt.x} cy={originPt.y} r="6" fill="#f59e0b" style={{ transition: 'all 0.1s' }} />
              <text x={originPt.x + 8} y={originPt.y + 4} className="font-mono text-[10px] fill-amber-600 font-bold">
                b={b}
              </text>
            </svg>
          </div>

          {/* Contrôles */}
          <div className="w-full max-w-sm space-y-6">
            <div className="bg-slate-900 text-white p-4 rounded-xl font-space font-bold text-2xl text-center shadow-lg flex items-center justify-center gap-1 flex-wrap">
              <MathText>$f(x) =$</MathText>
              <span className="text-blue-400">{a === 1 ? '' : a === -1 ? '-' : a}</span>
              <MathText>$x$</MathText>
              {b !== 0 && (
                <>
                  <span className="text-amber-400 mx-1">{b > 0 ? '+' : '−'}</span>
                  <span className="text-amber-400">{Math.abs(b)}</span>
                </>
              )}
            </div>

            <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="slider-a-aff" className="font-bold text-blue-900 text-sm">
                    Coefficient directeur (<MathText>$a$</MathText>)
                  </label>
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{a}</span>
                </div>
                <input id="slider-a-aff" type="range" min="-5" max="5" step="0.5"
                  value={a} onChange={(e) => setA(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer" />
                <p className="text-[11px] text-slate-500">Contrôle la pente (inclinaison) de la droite.</p>
              </div>

              <hr className="border-slate-100" />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="slider-b-aff" className="font-bold text-amber-900 text-sm">
                    Ordonnée à l'origine (<MathText>$b$</MathText>)
                  </label>
                  <span className="font-mono font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">{b}</span>
                </div>
                <input id="slider-b-aff" type="range" min="-8" max="8" step="1"
                  value={b} onChange={(e) => setB(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer" />
                <p className="text-[11px] text-slate-500">
                  Déplace la droite verticalement. Le point jaune indique où la droite coupe
                  l'axe des <MathText>$y$</MathText>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 : Quiz */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={3} title="Identifier a et b" color="emerald" />

        <QuizQuestion
          question={
            <p>
              Soit <MathText>$f(x) = -3x + 5$</MathText>.
              Quelles sont les valeurs de <MathText>$a$</MathText> et <MathText>$b$</MathText> ?
            </p>
          }
          choices={[
            { label: <MathText>{'$a = 3$ et $b = 5$'}</MathText>, correct: false },
            { label: <MathText>{'$a = -3$ et $b = 5$'}</MathText>, correct: true },
            { label: <MathText>{'$a = 5$ et $b = -3$'}</MathText>, correct: false },
            { label: <MathText>{'$a = -3x$ et $b = 5$'}</MathText>, correct: false },
          ]}
          successFeedback={
            <>
              <strong>Exact !</strong> Dans <MathText>$f(x) = ax + b$</MathText>, le coefficient{' '}
              <MathText>$a$</MathText> est <strong>le nombre devant <MathText>$x$</MathText></strong> (ici{' '}
              <MathText>$-3$</MathText>, avec son signe), et <MathText>$b$</MathText> est{' '}
              <strong>le nombre seul</strong> (ici <MathText>$5$</MathText>). (+75 XP)
            </>
          }
          errorFeedback={
            <>
              Rappel : <MathText>$f(x) = ax + b$</MathText>. Le <MathText>$a$</MathText> est le
              nombre collé à <MathText>$x$</MathText> <strong>avec son signe</strong> (ne pas
              oublier le signe <MathText>$-$</MathText>).
            </>
          }
          onCorrect={() => awardXP({ moduleId: 'L06', exerciseId: 'L06-Q1', amount: 75 })}
        />
      </section>

      {/* À retenir */}
      <KeyTakeaway color="purple">
        <li>
          • <MathText>$f(x) = ax + b$</MathText> est une <strong>fonction affine</strong>.
        </li>
        <li>
          • <MathText>$a$</MathText> = coefficient directeur = <strong>pente</strong> de la droite.
        </li>
        <li>
          • <MathText>$b$</MathText> = ordonnée à l'origine = point d'intersection avec l'axe
          des <MathText>$y$</MathText>.
        </li>
        <li>
          • Si <MathText>$b = 0$</MathText>, la fonction affine devient une
          fonction <strong>linéaire</strong>.
        </li>
      </KeyTakeaway>
    </ModuleLayout>
  );
}
