import React, { useState, useEffect } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import MathText from '../../../../../common/components/MathText';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Target, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function Module06Mission() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(6);

  const [x, setX] = useState(6);
  const [step, setStep] = useState(0); 
  // 0: discover
  // 1: equation building
  // 2: factorization & solving
  // 3: conclusion (eliminate x=0)

  const handleNext = () => markModuleCompleted('L06');

  const areaSquare = x * x;
  const areaRect = 4 * x;
  const isEqual = areaSquare === areaRect;

  useEffect(() => {
    if (step === 0 && isEqual && x !== 0) {
      setTimeout(() => setStep(1), 1500);
      awardXP({ moduleId: 'L06', exerciseId: 'mission_discover', amount: 30 });
    }
  }, [x, isEqual, step, awardXP]);

  const [ans1, setAns1] = useState('');
  const [ans2, setAns2] = useState('');
  const checkEq = () => {
    if ((ans1 === '0' && ans2 === '4') || (ans1 === '4' && ans2 === '0')) {
      setStep(3);
      awardXP({ moduleId: 'L06', exerciseId: 'mission_solve', amount: 50 });
    }
  };

  // Convert x (which goes from 0 to 10) to pixels for the drawing
  // Max width = 10 -> 200px (scale = 20)
  const scale = 20;

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
      moduleTitle="Mission : Carré contre Rectangle"
      moduleSubtitle="Utilisez les équations produit pour résoudre un problème géométrique."
      estimatedTime="15 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="L'énigme des aires" color="amber" />

        <p className="text-slate-700 leading-relaxed">
          On dispose d'un <strong>carré de côté <MathText>{'$x$'}</MathText></strong> et d'un <strong>rectangle de dimensions <MathText>{'$4$'}</MathText> sur <MathText>{'$x$'}</MathText></strong> (en cm).
          <br/>Pour quelle(s) valeur(s) de <MathText>{'$x$'}</MathText> ces deux figures ont-elles <strong>exactement la même aire</strong> ?
        </p>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center">
          
          <div className="w-full max-w-sm mb-8">
            <div className="flex justify-between text-sm font-bold text-slate-500 mb-2">
              <span><MathText>{`$x = ${x} \\text{ cm}$`}</MathText></span>
            </div>
            <input 
              type="range" min="0" max="10" step="0.5" 
              value={x} onChange={(e) => setX(Number(e.target.value))}
              className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-end justify-center h-[250px] mb-8">
            {/* Square */}
            <div className="flex flex-col items-center">
              <div 
                className={`bg-blue-100 border-2 border-blue-400 flex items-center justify-center transition-all duration-300 ${isEqual ? 'bg-amber-100 border-amber-500' : ''}`}
                style={{ width: `${x * scale}px`, height: `${x * scale}px` }}
              >
                {x > 1 && <span className="text-blue-800 font-bold text-sm"><MathText>{'$x^2$'}</MathText></span>}
              </div>
              <span className="mt-2 text-sm font-bold text-slate-600">Carré (côté x)</span>
              <span className="text-lg font-mono font-black text-blue-700">{areaSquare.toFixed(2)} cm²</span>
            </div>

            {/* Rectangle */}
            <div className="flex flex-col items-center">
              <div 
                className={`bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center transition-all duration-300 ${isEqual ? 'bg-amber-100 border-amber-500' : ''}`}
                style={{ width: `${4 * scale}px`, height: `${x * scale}px` }}
              >
                {x > 1 && <span className="text-emerald-800 font-bold text-sm"><MathText>{'$4x$'}</MathText></span>}
              </div>
              <span className="mt-2 text-sm font-bold text-slate-600">Rectangle (4 sur x)</span>
              <span className="text-lg font-mono font-black text-emerald-700">{areaRect.toFixed(2)} cm²</span>
            </div>
          </div>

          {step === 0 && (
            <div className={`p-4 rounded-xl border-2 font-bold ${isEqual ? 'bg-amber-100 border-amber-400 text-amber-800 animate-pulse' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
              {isEqual ? (x === 0 ? "Trouvez une autre valeur que 0 !" : "Gagné ! Les aires sont égales.") : "Déplacez le curseur pour égaliser les aires."}
            </div>
          )}
        </div>
      </section>

      {step >= 1 && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in slide-in-from-bottom-4">
          <SectionHeader number={2} title="La preuve par l'équation" color="blue" />
          
          <p className="text-slate-700">
            Vous avez trouvé la réponse en tâtonnant, mais en mathématiques, on veut le prouver.
            Modélisons ce problème : "L'aire du carré = L'aire du rectangle" s'écrit :
          </p>

          <div className="text-center text-2xl font-mono font-bold text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <MathText>{'$x^2 = 4x$'}</MathText>
          </div>

          <p className="text-slate-700">
            Pour utiliser la règle du produit nul, on ramène tout à gauche pour que ça soit égal à 0, puis on factorise :
          </p>

          <div className="text-center text-xl font-mono font-bold text-slate-800 space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div><MathText>{'$x^2 - 4x = 0$'}</MathText></div>
            <div className="flex justify-center items-center gap-2">
              <span className="text-blue-600 bg-blue-100 px-2 rounded"><MathText>{'$x$'}</MathText></span>
              <span><MathText>{'$(x - 4) = 0$'}</MathText></span>
            </div>
          </div>

          {step < 3 && (
            <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-2xl">
              <p className="text-blue-900 font-bold mb-4">Résolvez cette équation produit nul :</p>
              <div className="flex justify-center items-center gap-4 flex-wrap">
                <span className="font-mono font-bold">x =</span>
                <input type="number" value={ans1} onChange={e=>setAns1(e.target.value)} className="w-16 p-2 text-center rounded-lg border-2 border-slate-300 font-mono font-bold" />
                <span className="font-bold text-slate-500">OU</span>
                <span className="font-mono font-bold">x =</span>
                <input type="number" value={ans2} onChange={e=>setAns2(e.target.value)} className="w-16 p-2 text-center rounded-lg border-2 border-slate-300 font-mono font-bold" />
                <button onClick={checkEq} className="ml-4 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Valider</button>
              </div>
            </div>
          )}

          {step >= 3 && (
            <div className="space-y-6 animate-in slide-in-from-top-4">
              <div className="flex gap-4">
                <div className="flex-1 bg-white p-4 border-2 border-emerald-400 rounded-xl text-center">
                  <span className="font-mono font-bold text-slate-500">Facteur 1</span><br/>
                  <span className="font-mono font-black text-xl text-emerald-600"><MathText>{'$x = 0$'}</MathText></span>
                </div>
                <div className="flex-1 bg-white p-4 border-2 border-blue-400 rounded-xl text-center">
                  <span className="font-mono font-bold text-slate-500">Facteur 2</span><br/>
                  <span className="font-mono font-black text-xl text-blue-600"><MathText>{'$x = 4$'}</MathText></span>
                </div>
              </div>

              <div className="bg-rose-50 p-6 rounded-2xl border border-rose-200 flex items-start gap-4">
                <AlertTriangle className="text-rose-500 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-rose-800 mb-2">L'interprétation géométrique</h4>
                  <p className="text-slate-700">
                    L'équation nous donne deux solutions mathématiques : 0 et 4. 
                    Cependant, dans la vraie vie, un carré dont le côté mesure 0 cm n'existe pas ! 
                    <br/><br/>
                    On doit donc rejeter la solution <MathText>{'$x = 0$'}</MathText>. 
                    La seule solution valable pour notre problème géométrique est <strong><MathText>{'$x = 4 \\text{ cm}$'}</MathText></strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

    </ModuleLayout>
  );
}
