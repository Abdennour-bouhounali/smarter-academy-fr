import React, { useState } from 'react';
import ModuleLayout from '../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../common/components/SectionHeader';
import KeyTakeaway from '../../../../common/components/KeyTakeaway';
import { useProgress } from '../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Play } from 'lucide-react';

export default function Module01RegleZero() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(1);

  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  
  const [discoveredA, setDiscoveredA] = useState(false);
  const [discoveredB, setDiscoveredB] = useState(false);
  const [discoveredBoth, setDiscoveredBoth] = useState(false);

  const handleNext = () => markModuleCompleted('L01');

  const updateA = (val) => {
    setA(val);
    checkDiscovery(val, b);
  };

  const updateB = (val) => {
    setB(val);
    checkDiscovery(a, val);
  };

  const checkDiscovery = (valA, valB) => {
    if (valA === 0 && valB !== 0 && !discoveredA) {
      setDiscoveredA(true);
      awardXP({ moduleId: 'L01', exerciseId: 'zeroA', amount: 20 });
    }
    if (valB === 0 && valA !== 0 && !discoveredB) {
      setDiscoveredB(true);
      awardXP({ moduleId: 'L01', exerciseId: 'zeroB', amount: 20 });
    }
    if (valA === 0 && valB === 0 && !discoveredBoth) {
      setDiscoveredBoth(true);
      awardXP({ moduleId: 'L01', exerciseId: 'zeroBoth', amount: 20 });
    }
  };

  const product = a * b;
  const isZero = product === 0;
  
  const isAllDiscovered = discoveredA && discoveredB && discoveredBoth;

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={1}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="La Règle du Zéro"
      moduleSubtitle="Découvrez le secret d'une multiplication qui donne zéro."
      estimatedTime="8 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="La machine multiplicatrice" color="blue" />

        <p className="text-slate-700 leading-relaxed">
          Essayez d'obtenir un résultat égal à <strong className="text-indigo-600">0</strong> en modifiant les valeurs de <strong className="text-blue-600">A</strong> et <strong className="text-emerald-600">B</strong> avec les curseurs ci-dessous.
        </p>

        <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200">
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 mb-8">
            {/* Input A */}
            <div className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${a === 0 ? 'bg-blue-50 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-white border-slate-200'}`}>
              <span className="text-sm font-bold text-slate-500 mb-2">Facteur A</span>
              <span className={`text-4xl font-black font-mono ${a === 0 ? 'text-blue-600 animate-pulse' : 'text-slate-800'}`}>{a}</span>
              <input 
                type="range" min="-5" max="5" step="1" 
                value={a} onChange={(e) => updateA(Number(e.target.value))}
                className="mt-4 w-32 accent-blue-600 cursor-pointer"
              />
            </div>
            
            <span className="text-3xl font-black text-slate-300">×</span>
            
            {/* Input B */}
            <div className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${b === 0 ? 'bg-emerald-50 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-white border-slate-200'}`}>
              <span className="text-sm font-bold text-slate-500 mb-2">Facteur B</span>
              <span className={`text-4xl font-black font-mono ${b === 0 ? 'text-emerald-600 animate-pulse' : 'text-slate-800'}`}>{b}</span>
              <input 
                type="range" min="-5" max="5" step="1" 
                value={b} onChange={(e) => updateB(Number(e.target.value))}
                className="mt-4 w-32 accent-emerald-600 cursor-pointer"
              />
            </div>
            
            <span className="text-3xl font-black text-slate-300">=</span>
            
            {/* Result */}
            <div className={`flex flex-col items-center p-6 rounded-2xl border-4 transition-all duration-500 ${isZero ? 'bg-indigo-600 border-indigo-400 shadow-xl scale-110' : 'bg-slate-800 border-slate-700'}`}>
              <span className="text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">Produit</span>
              <span className="text-5xl font-black font-mono text-white">{product}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <h3 className="font-bold text-slate-700 mb-2">Mission : Trouver toutes les façons de faire zéro !</h3>
            <div className="flex gap-4">
              <div className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${discoveredA ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                {discoveredA ? '✅ 0 × B = 0' : '1. Annuler A'}
              </div>
              <div className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${discoveredB ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                {discoveredB ? '✅ A × 0 = 0' : '2. Annuler B'}
              </div>
              <div className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${discoveredBoth ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                {discoveredBoth ? '✅ 0 × 0 = 0' : '3. Les deux ?'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {isAllDiscovered && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in slide-in-from-bottom-4">
          <SectionHeader number={2} title="Le Bilan" color="indigo" />
          
          <p className="text-slate-700 leading-relaxed">
            Vous l'avez constaté : la <strong>seule façon</strong> d'obtenir un produit égal à zéro est qu'au moins l'un des nombres multipliés soit égal à zéro !
          </p>

          <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
            <h4 className="font-bold text-rose-800 mb-3 flex items-center gap-2">
              <span className="text-xl">⚠️</span> Attention au piège
            </h4>
            <p className="text-slate-700 mb-4">
              Si on vous donne l'équation : <span className="font-mono bg-white px-2 py-1 rounded text-rose-700">x(x - 3) = 0</span>
            </p>
            <p className="text-slate-700">
              Il est très fréquent de répondre uniquement <strong className="text-rose-700">x = 3</strong> (car 3 - 3 = 0). 
              <br />Mais n'oubliez pas le premier facteur ! Si <strong className="text-emerald-700">x = 0</strong>, le produit sera nul aussi : <span className="font-mono opacity-80">0 × (0 - 3) = 0 × (-3) = 0</span>.
            </p>
          </div>
        </section>
      )}

      {isAllDiscovered && (
        <KeyTakeaway color="indigo">
          <li>
            • <strong>Règle du Zéro :</strong> Un produit est nul si et seulement si <strong>au moins l'un de ses facteurs est nul</strong>.
          </li>
          <li>
            • C'est la clé absolue pour résoudre des équations plus complexes : on essaie toujours de se ramener à « quelque chose × quelque chose = 0 ».
          </li>
        </KeyTakeaway>
      )}
    </ModuleLayout>
  );
}
