import React, { useState } from 'react';
import ModuleLayout from '../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../common/components/SectionHeader';
import KeyTakeaway from '../../../../common/components/KeyTakeaway';
import { useProgress } from '../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import InteractiveThales from '../components/InteractiveThales';

export default function Module05Papillon() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(5);

  const [discovered, setDiscovered] = useState(false);
  const [showCorrespondences, setShowCorrespondences] = useState(false);

  const handleNext = () => markModuleCompleted('L05');

  const handleKChange = (newK) => {
    // If user dragged to papillon side and back
    if (!discovered && newK < 0) {
      setDiscovered(true);
      awardXP({ moduleId: 'L05', exerciseId: 'papillon', amount: 75 });
    }
  };

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={5}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Configurations Papillon"
      moduleSubtitle="Basculez entre la configuration classique et croisée."
      estimatedTime="10 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="Le secret du Papillon" color="sky" />

        <p className="text-slate-700 leading-relaxed mb-6">
          Déplacez le curseur ci-dessous pour faire passer le petit triangle <strong>de l'autre côté</strong> du sommet A. C'est ce qu'on appelle la configuration "Papillon" !
        </p>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <div className="flex-1 w-full flex flex-col justify-center items-center">
             <InteractiveThales 
               config="both" 
               highlight={showCorrespondences ? 'small' : 'none'} 
               onKChange={handleKChange} 
             />
             
             <button
               onClick={() => setShowCorrespondences(!showCorrespondences)}
               className="mt-6 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 transition-colors flex items-center gap-2"
             >
               👁️ {showCorrespondences ? 'Masquer les correspondances' : 'Voir les correspondances'}
             </button>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="bg-sky-50 p-6 rounded-xl border border-sky-200">
              <h3 className="font-bold text-sky-800 mb-4">Le piège des côtés homologues</h3>
              <p className="text-sm text-slate-700 mb-4">
                Dans la configuration papillon, l'erreur classique est d'inverser les côtés !
                Regardez bien : le côté qui correspond à <strong className="text-sky-600">AB</strong> est <strong className="text-sky-600">AM</strong> (ils sont sur la même droite sécante).
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-sky-100 font-mono text-center text-lg">
                <span className="text-blue-600">AM</span> / <span className="text-blue-800">AB</span> = <span className="text-emerald-600">AN</span> / <span className="text-emerald-800">AC</span>
              </div>
              
              <p className="text-xs text-slate-500 mt-4 italic text-center">
                Cliquez sur "Voir les correspondances" pour mettre en évidence le petit triangle et voir comment il a basculé.
              </p>
            </div>

            {discovered ? (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 text-sm font-medium animate-pulse">
                🦋 Vous avez découvert le Papillon ! (+75 XP)
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 text-sm">
                Glissez le curseur vers la gauche pour passer en mode "Papillon"...
              </div>
            )}
          </div>
        </div>
      </section>

      <KeyTakeaway color="sky">
        <li>
          • La configuration "Papillon" fonctionne exactement <strong>de la même manière</strong> que la configuration emboîtée.
        </li>
        <li>
          • Pour ne pas vous tromper, suivez la droite sécante en partant de A : <strong>AM avec AB</strong>, et <strong>AN avec AC</strong>.
        </li>
      </KeyTakeaway>
    </ModuleLayout>
  );
}
