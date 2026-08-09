import React, { useState } from 'react';
import ModuleLayout from '../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../common/components/SectionHeader';
import KeyTakeaway from '../../../../common/components/KeyTakeaway';
import { useProgress } from '../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

export default function Module03Calcul() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(3);

  // We are trying to find AN.
  // Knowns: AM = 5, AB = 10, AC = 8.
  // Equation: AM/AB = AN/AC => 5/10 = AN/8 => AN = (5*8)/10 = 4.
  // We will let the user drag a slider for AM from 1 to 9.
  
  const [AM, setAM] = useState(5);
  const AB = 10;
  const AC = 8;
  const AN = ((AM * AC) / AB).toFixed(1);

  const [discovered, setDiscovered] = useState(false);

  const handleNext = () => markModuleCompleted('L03');

  const handleSliderChange = (e) => {
    setAM(Number(e.target.value));
    if (!discovered) {
      setDiscovered(true);
      awardXP({ moduleId: 'L03', exerciseId: 'simulate-thales', amount: 75 });
    }
  };

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={3}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Calculer une longueur avec Thalès"
      moduleSubtitle="Simulez la variation d'une longueur et observez comment Thalès conserve les proportions."
      estimatedTime="12 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="Le Simulateur de Proportionnalité" color="blue" />

        <p className="text-slate-700 leading-relaxed mb-6">
          Nous connaissons <strong className="text-blue-600">AB = {AB} cm</strong> et <strong className="text-emerald-600">AC = {AC} cm</strong>.
          Modifiez la longueur de <strong className="text-blue-600">AM</strong> à l'aide du curseur et observez comment <strong className="text-emerald-600">AN</strong> s'ajuste automatiquement pour que l'égalité soit toujours respectée !
        </p>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-8 items-center">
          
          {/* Slider and Visualizer */}
          <div className="flex-1 w-full space-y-6">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Longueur de AM (cm) : {AM}</label>
              <input 
                type="range" min="1" max="9" step="1" 
                value={AM} 
                onChange={handleSliderChange}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            
            <div className="relative h-40 bg-white border border-slate-200 rounded-xl overflow-hidden p-4">
               {/* Visual representation of AB and AM */}
               <div className="flex items-center gap-2 mb-4">
                 <span className="w-8 text-xs font-bold text-slate-500">AB/AM</span>
                 <div className="relative h-6 flex-1 bg-slate-100 rounded">
                   <div className="absolute top-0 left-0 h-full bg-blue-100 w-full rounded" />
                   <div className="absolute top-0 left-0 h-full bg-blue-500 rounded flex items-center justify-center text-xs text-white font-bold" style={{ width: `${(AM/AB)*100}%` }}>AM={AM}</div>
                   <div className="absolute top-6 right-0 text-[10px] text-slate-400">AB={AB}</div>
                 </div>
               </div>
               
               {/* Visual representation of AC and AN */}
               <div className="flex items-center gap-2">
                 <span className="w-8 text-xs font-bold text-slate-500">AC/AN</span>
                 <div className="relative h-6 flex-1 bg-slate-100 rounded">
                   <div className="absolute top-0 left-0 h-full bg-emerald-100 rounded" style={{ width: `${(AC/AB)*100}%` }} />
                   <div className="absolute top-0 left-0 h-full bg-emerald-500 rounded flex items-center justify-center text-xs text-white font-bold" style={{ width: `${(AN/AB)*100}%` }}>AN={AN}</div>
                   <div className="absolute top-6 text-[10px] text-slate-400" style={{ left: `${(AC/AB)*100}%`, transform: 'translateX(-100%)' }}>AC={AC}</div>
                 </div>
               </div>
            </div>
          </div>
          
          {/* Dynamic Calculation Block */}
          <div className="flex-1 w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 text-center">Calcul avec le Produit en Croix</h4>
            
            <div className="flex items-center justify-center gap-4 text-lg font-mono mb-6">
              <div className="flex flex-col items-center">
                <span className="text-blue-600 h-6">AM</span>
                <div className="w-8 h-0.5 bg-slate-800 my-1"></div>
                <span className="text-slate-800 h-6">AB</span>
              </div>
              <span>=</span>
              <div className="flex flex-col items-center">
                <span className="text-emerald-600 h-6">AN</span>
                <div className="w-8 h-0.5 bg-slate-800 my-1"></div>
                <span className="text-slate-800 h-6">AC</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-xl font-mono mb-6 bg-slate-50 p-4 rounded-lg">
              <div className="flex flex-col items-center">
                <span className="text-blue-600 font-bold h-8">{AM}</span>
                <div className="w-10 h-0.5 bg-slate-800 my-1"></div>
                <span className="text-slate-800 h-8">{AB}</span>
              </div>
              <span>=</span>
              <div className="flex flex-col items-center">
                <span className="text-emerald-600 font-bold h-8">AN</span>
                <div className="w-10 h-0.5 bg-slate-800 my-1"></div>
                <span className="text-slate-800 h-8">{AC}</span>
              </div>
            </div>
            
            <div className="text-center font-mono text-lg bg-emerald-50 p-3 rounded-lg border border-emerald-100">
              AN = <span className="text-emerald-600 font-bold">({AM} × {AC}) / {AB}</span> = <span className="text-emerald-700 font-bold bg-white px-2 py-1 rounded shadow-sm">{AN}</span>
            </div>
          </div>

        </div>
        
        {discovered && (
          <div className="text-sm text-blue-700 font-bold bg-blue-50 p-3 rounded-xl border border-blue-200 text-center animate-pulse mt-4">
            👍 Bien joué ! Vous avez simulé différentes configurations. (+75 XP)
          </div>
        )}
      </section>

      <KeyTakeaway color="blue">
        <li>
          • Pour calculer une longueur avec le théorème de Thalès, on écrit d'abord <strong>l'égalité des 3 rapports</strong>.
        </li>
        <li>
          • On remplace par les <strong>valeurs connues</strong>.
        </li>
        <li>
          • On sélectionne les deux fractions utiles et on utilise le <strong>produit en croix</strong> (quatrième proportionnelle).
        </li>
      </KeyTakeaway>
    </ModuleLayout>
  );
}
