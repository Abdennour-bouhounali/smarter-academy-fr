import React from 'react';

export default function GraphFonctionAffine() {
  return (
    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center my-8">
      <h3 className="text-lg font-bold font-space text-slate-800 mb-4">Simulateur: Tracé d'une fonction affine</h3>
      <div className="w-full max-w-md aspect-square bg-white border border-slate-300 rounded-xl flex items-center justify-center relative overflow-hidden shadow-inner">
        {/* Mock representation of a graph */}
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-10">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="border-b border-r border-slate-900" />
          ))}
        </div>
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-slate-400" />
        <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-slate-400" />
        {/* A line representing f(x) = 2x - 1 */}
        <div className="absolute inset-0 origin-center rotate-[63deg] scale-150">
          <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-blue-500 translate-y-12" />
        </div>
      </div>
      <p className="text-sm text-slate-500 mt-4 text-center">
        Un graphique interactif permettra bientôt à l'élève de modifier <span className="font-mono text-blue-600">a</span> et <span className="font-mono text-purple-600">b</span> pour voir l'impact sur la droite.
      </p>
    </div>
  );
}
