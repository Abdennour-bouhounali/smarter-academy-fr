import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Pizza, Users } from 'lucide-react';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import ConceptCard from '../../../../../common/components/ConceptCard';

export default function Module01Partage() {
  const [cutParts, setCutParts] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalPizzas = 5;
  const totalFriends = 8;
  const totalSlices = totalPizzas * cutParts;
  const slicesPerFriend = totalSlices / totalFriends;
  const isCorrectCut = cutParts === 8;

  useEffect(() => {
    if (isCorrectCut) {
      setTimeout(() => setIsCompleted(true), 500);
    }
  }, [isCorrectCut]);

  const navLinks = getNavLinks(1);

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      moduleTitle="Le partage équitable"
      moduleNumber={1}
      totalModules={MODULE_CTX.totalModules}
      prevLink={navLinks.prevLink}
      nextLink={isCompleted ? navLinks.nextLink : undefined}
      isCompleted={isCompleted}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-8">
          
          <div className="mb-8">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Mission 1 / 5</span>
            <h2 className="text-3xl font-bold text-slate-800 mt-2">Comment partager 5 pizzas entre 8 personnes sans tricher ?</h2>
          </div>

          <div className="space-y-6">
            <p className="text-lg text-slate-600">
              C'est l'heure de manger ! Tu as commandé <strong>5 pizzas</strong> pour <strong>8 personnes</strong>.
              Si chacun prend une pizza entière, 3 personnes n'auront rien... C'est injuste !
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-sm">
              <div className="flex flex-col items-center">
                <div className="flex gap-2 flex-wrap justify-center max-w-[200px]">
                  {Array.from({ length: totalPizzas }).map((_, i) => (
                    <Pizza key={i} className="w-12 h-12 text-orange-500" />
                  ))}
                </div>
                <span className="mt-4 font-bold text-slate-700">5 Pizzas</span>
              </div>

              <ArrowRight className="w-8 h-8 text-slate-300 hidden md:block" />

              <div className="flex flex-col items-center">
                <div className="flex gap-2 flex-wrap justify-center max-w-[250px]">
                  {Array.from({ length: totalFriends }).map((_, i) => (
                    <Users key={i} className="w-10 h-10 text-indigo-500" />
                  ))}
                </div>
                <span className="mt-4 font-bold text-slate-700">8 Personnes</span>
              </div>
            </div>

            <div className="bg-indigo-50 text-indigo-800 p-6 rounded-2xl flex items-start gap-4">
              <div className="bg-indigo-200 p-2 rounded-full mt-1">🤔</div>
              <div>
                <p className="font-bold text-lg">Le défi :</p>
                <p>Il va falloir découper les pizzas. Mais en combien de parts égales doit-on couper <strong>chaque pizza</strong> pour pouvoir tout distribuer sans faire de jaloux ?</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-8 border-t border-slate-100">
            <p className="text-lg text-slate-600 font-medium">
              Manipule le couteau à roulettes ! En combien de parts coupes-tu chaque pizza ?
            </p>

            <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm text-center">
              <div className="flex items-center justify-center gap-4 mb-8">
                <button
                  onClick={() => setCutParts(Math.max(1, cutParts - 1))}
                  className="w-12 h-12 bg-slate-100 rounded-full font-bold text-xl hover:bg-slate-200 transition-colors"
                >-</button>
                <span className="text-2xl font-bold font-space w-32">
                  {cutParts} part{cutParts > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setCutParts(cutParts + 1)}
                  className="w-12 h-12 bg-slate-100 rounded-full font-bold text-xl hover:bg-slate-200 transition-colors"
                >+</button>
              </div>

              <div className="flex justify-center gap-4 flex-wrap mb-8">
                {Array.from({ length: totalPizzas }).map((_, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-full border-4 border-orange-200 bg-orange-100 overflow-hidden shadow-inner">
                    {cutParts > 1 && Array.from({ length: cutParts }).map((_, j) => (
                      <div
                        key={j}
                        className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-orange-300 origin-bottom"
                        style={{ transform: `rotate(${(360 / cutParts) * j}deg)` }}
                      ></div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-700">Total : {totalSlices} parts au total.</p>
                {totalSlices % totalFriends === 0 ? (
                  <div className="text-emerald-600 font-bold mt-2 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Génial ! On peut donner exactement {slicesPerFriend} part(s) à chacun.
                  </div>
                ) : (
                  <div className="text-red-500 font-bold mt-2">
                    Zut... {totalSlices} n'est pas dans la table de {totalFriends}. Il va y avoir des restes ou des bagarres !
                  </div>
                )}
              </div>
            </div>
          </div>

          {isCompleted && (
            <div className="space-y-6 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-emerald-50 border-2 border-emerald-200 p-8 rounded-2xl flex flex-col items-center text-center">
                <span className="text-4xl mb-4">🎉</span>
                <h3 className="text-2xl font-bold text-emerald-800 mb-2">Partage réussi !</h3>
                <p className="text-lg text-emerald-700 mb-6">
                  Tu as coupé chaque pizza en <strong>8</strong>. Chacun reçoit donc <strong>5 parts</strong>.
                </p>

                <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-xl shadow-sm border border-emerald-100">
                  <div className="text-right">
                    <p className="font-bold text-slate-700">Chacun reçoit</p>
                    <p className="text-sm text-slate-500">5 parts de "un huitième"</p>
                  </div>
                  <div className="text-3xl font-space font-bold text-indigo-600 flex flex-col items-center leading-none">
                    <span>5</span>
                    <div className="w-full h-1 bg-indigo-600 my-1"></div>
                    <span>8</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-700">de pizza</p>
                  </div>
                </div>
              </div>
              <ConceptCard label="Le sens de la fraction" emoji="💡" color="indigo">
                <p>Une fraction permet d'exprimer une quantité qui ne tombe pas juste. Le nombre du bas (en combien on coupe) et le nombre du haut (combien on prend) racontent l'histoire d'un partage équitable.</p>
              </ConceptCard>
            </div>
          )}

        </div>
      </div>
    </ModuleLayout>
  );
}
