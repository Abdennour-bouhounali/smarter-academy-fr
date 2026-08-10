import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

export default function Module01Decouverte() {
  const { prevLink, nextLink } = getNavLinks(1);
  const [showSpaces, setShowSpaces] = useState(false);

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      moduleTitle="Le besoin des classes"
      moduleNumber={1}
      totalModules={MODULE_CTX.totalModules}
      prevLink={prevLink}
      nextLink={nextLink}
    >
      <SectionHeader title="La lecture des grands nombres" icon="👀" />

      <div className="prose prose-blue max-w-none mb-8">
        <p className="text-gray-700 text-lg mb-4">
          La distance entre la Terre et le Soleil est d'environ <strong>149597870</strong> kilomètres.
        </p>
        <p className="text-gray-700 text-lg">
          Essaie de lire ce nombre à voix haute. N'est-ce pas difficile quand tous les chiffres sont collés ?
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col items-center">
        <div className="text-4xl sm:text-5xl font-bold font-mono tracking-wider text-blue-600 mb-6 transition-all duration-500">
          {showSpaces ? "149 597 870" : "149597870"}
        </div>
        
        <button
          onClick={() => setShowSpaces(!showSpaces)}
          className={`px-6 py-3 rounded-full font-medium transition-colors ${
            showSpaces 
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {showSpaces ? "Cacher les espaces" : "Ajouter des espaces"}
        </button>
      </div>

      {showSpaces && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 animate-fade-in">
          <h3 className="text-xl font-bold text-emerald-800 mb-3">L'importance des classes</h3>
          <p className="text-emerald-700 text-lg">
            En regroupant les chiffres par <strong>paquets de trois</strong> en partant de la droite, on crée des <strong>classes</strong> (unités, milliers, millions...).<br/><br/>
            Grâce aux espaces, le nombre devient facile à lire : <br/>
            <strong>Cent quarante-neuf millions cinq cent quatre-vingt-dix-sept mille huit cent soixante-dix.</strong>
          </p>
        </div>
      )}

    </ModuleLayout>
  );
}
