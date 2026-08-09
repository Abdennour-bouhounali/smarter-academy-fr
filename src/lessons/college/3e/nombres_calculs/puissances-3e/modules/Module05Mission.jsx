import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import MathText from '../../../../../common/components/MathText';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

export default function Module05Mission() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(5);

  const [zoomLevel, setZoomLevel] = useState(2);
  const [discoveredAll, setDiscoveredAll] = useState(false);
  const [visited, setVisited] = useState(new Set([2]));

  const handleNext = () => markModuleCompleted('L05');

  const scaleItems = [
    {
      name: "La Voie Lactée (Galaxie)",
      sizeDesc: "1 000 000 000 000 000 000 000 mètres",
      scientific: "1 \\times 10^{21}",
      emoji: "🌌",
      color: "purple"
    },
    {
      name: "Le Système Solaire",
      sizeDesc: "10 000 000 000 000 mètres",
      scientific: "1 \\times 10^{13}",
      emoji: "🪐",
      color: "blue"
    },
    {
      name: "La Terre (Diamètre)",
      sizeDesc: "12 700 000 mètres",
      scientific: "1,27 \\times 10^7",
      emoji: "🌍",
      color: "emerald"
    },
    {
      name: "Être humain",
      sizeDesc: "1,7 mètre",
      scientific: "1,7 \\times 10^0",
      emoji: "🧍",
      color: "amber"
    },
    {
      name: "Globule rouge (Cellule)",
      sizeDesc: "0,000 008 mètre",
      scientific: "8 \\times 10^{-6}",
      emoji: "🩸",
      color: "red"
    },
    {
      name: "Atome d'hydrogène",
      sizeDesc: "0,000 000 000 1 mètre",
      scientific: "1 \\times 10^{-10}",
      emoji: "⚛️",
      color: "indigo"
    }
  ];

  const handleZoom = (e) => {
    const val = Number(e.target.value);
    setZoomLevel(val);
    
    setVisited((prev) => {
      const newSet = new Set(prev);
      newSet.add(val);
      if (newSet.size === scaleItems.length && !discoveredAll) {
        setDiscoveredAll(true);
        awardXP({ moduleId: 'L05', exerciseId: 'explore-universe', amount: 150 });
      }
      return newSet;
    });
  };

  const currentItem = scaleItems[zoomLevel];

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      chapterTitle={MODULE_CTX.chapterTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={5}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Mission : L'échelle de l'univers"
      moduleSubtitle="Voyagez de l'infiniment grand à l'infiniment petit."
      estimatedTime="12 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-8">
        
        <SectionHeader number={1} title="Le Zoom Cosmique" color="amber" />

        <p className="text-slate-700 text-lg mb-6">
          Utilisez le curseur pour "zoomer" ou "dézoomer". Observez comment l'écriture scientifique permet de représenter facilement des dimensions extrêmes.
        </p>

        {/* The Interactive Scale */}
        <div className={`bg-${currentItem.color}-50 border border-${currentItem.color}-100 rounded-3xl p-8 flex flex-col items-center gap-8 transition-colors duration-500 min-h-[400px] justify-center relative overflow-hidden`}>
          
          <div className="absolute top-4 right-4 text-xs font-bold text-slate-400">
            {visited.size} / {scaleItems.length} découverts
          </div>

          <div className="text-8xl drop-shadow-lg animate-bounce-slow">
            {currentItem.emoji}
          </div>

          <div className="text-center z-10 space-y-4">
            <h3 className={`text-3xl font-black text-${currentItem.color}-800`}>{currentItem.name}</h3>
            
            <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-sm space-y-2">
              <p className="text-slate-500 font-medium">Taille classique (en mètres) :</p>
              <p className="text-xl font-bold text-slate-800 break-all">{currentItem.sizeDesc}</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm px-8 py-4 rounded-xl shadow-sm border border-slate-200 mt-4">
              <p className="text-slate-500 font-medium mb-2">Écriture scientifique (en mètres) :</p>
              <div className={`text-4xl font-black text-${currentItem.color}-600`}>
                <MathText>{`$${currentItem.scientific}$`}</MathText>
              </div>
            </div>
          </div>

        </div>

        {/* Zoom Slider */}
        <div className="max-w-2xl mx-auto mt-8 space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
          <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-500 px-2">
            <span>Infiniment Grand</span>
            <span>Échelle Humaine</span>
            <span>Infiniment Petit</span>
          </div>
          <input 
            type="range" min="0" max="5" step="1" 
            value={zoomLevel} 
            onChange={handleZoom}
            className="w-full h-4 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-amber-600"
            style={{ direction: 'ltr' }}
          />
        </div>

        {discoveredAll && (
          <div className="animate-fade-in mt-8">
            <KeyTakeaway color="amber">
              Mission accomplie ! L'écriture scientifique est indispensable pour les physiciens, les biologistes et les astronomes car elle permet de lire instantanément l'ordre de grandeur d'une mesure, sans avoir à compter les zéros.
            </KeyTakeaway>
          </div>
        )}

      </section>
    </ModuleLayout>
  );
}
