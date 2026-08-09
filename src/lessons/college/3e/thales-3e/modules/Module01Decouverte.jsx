import React, { useState } from 'react';
import ModuleLayout from '../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../common/components/SectionHeader';
import KeyTakeaway from '../../../../common/components/KeyTakeaway';
import { useProgress } from '../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import InteractiveThales from '../components/InteractiveThales';

export default function Module01Decouverte() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(1);

  const [discovered, setDiscovered] = useState(false);
  const [k, setK] = useState(0.5);

  const handleNext = () => markModuleCompleted('L01');

  // Trigger discovery XP if user dragged the point M
  const handleKChange = (newK) => {
    setK(newK);
    if (!discovered && Math.abs(newK - 0.5) > 0.1) {
      setDiscovered(true);
      awardXP({ moduleId: 'L01', exerciseId: 'discover-thales', amount: 50 });
    }
  };

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={1}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Découverte des Configurations"
      moduleSubtitle="Manipulez la figure pour comprendre la configuration de Thalès."
      estimatedTime="8 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="Triangles emboîtés" color="emerald" />

        <p className="text-slate-700 leading-relaxed mb-6">
          Déplacez le point <strong className="text-blue-600">M</strong> ou les sommets du triangle. 
          Remarquez que peu importe comment vous déformez la figure, la droite (MN) reste <strong>parallèle</strong> à la droite (BC).
        </p>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <div className="flex-1 w-full flex justify-center">
             <InteractiveThales config="standard" highlight="small" onKChange={handleKChange} />
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-2">Que faut-il observer ?</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">1.</span>
                  Il y a un grand triangle <strong className="text-emerald-600">ABC</strong>.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">2.</span>
                  Il y a un petit triangle <strong className="text-blue-600">AMN</strong> à l'intérieur.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">3.</span>
                  Leurs bases (MN) et (BC) sont strictement <strong className="text-rose-600">parallèles</strong>.
                </li>
              </ul>
            </div>

            {discovered ? (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 text-sm font-medium animate-pulse">
                ✨ Bravo ! Vous avez manipulé la figure. (+50 XP)
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 text-sm">
                Déplacez le point M bleu pour valider cette étape...
              </div>
            )}
          </div>
        </div>
      </section>

      <KeyTakeaway color="emerald">
        <li>
          • Pour utiliser le théorème de Thalès, il faut TOUJOURS avoir <strong>deux triangles avec un sommet commun (ici A)</strong> et <strong>deux droites parallèles</strong>.
        </li>
      </KeyTakeaway>
    </ModuleLayout>
  );
}
