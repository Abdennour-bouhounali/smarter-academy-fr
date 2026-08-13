import React, { useState, useEffect } from 'react';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import ConceptCard from '../../../../../common/components/ConceptCard';
import MathText from '../../../../../common/components/MathText';
import { Car, MapPin, CheckCircle2, XCircle, ArrowRight, Calculator, AlertTriangle, RefreshCw } from 'lucide-react';

export default function Module01NotionFonction() {
  const [distance, setDistance] = useState(0);
  const [hasExplored, setHasExplored] = useState(false);
  
  const [trainingAnswer, setTrainingAnswer] = useState('');
  const [isTrainingComplete, setIsTrainingComplete] = useState(false);
  const [trainingError, setTrainingError] = useState(false);
  
  const [errorAnswers, setErrorAnswers] = useState({});
  const isErrorDiagnosed = errorAnswers[1]?.isCorrect && errorAnswers[2]?.isCorrect;

  const [showAntecedentAnim, setShowAntecedentAnim] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const price = 2 + 1.5 * distance;

  // Step 2 & 3: L'élève doit manipuler pour découvrir la régularité
  useEffect(() => {
    // Si l'élève a manipulé plusieurs fois (au delà de 5km)
    if (distance >= 5 && !hasExplored) {
      setTimeout(() => setHasExplored(true), 2500); // Laisse le temps de voir le graphe changer
    }
  }, [distance, hasExplored]);

  // Step 8: Auto complete
  useEffect(() => {
    if (showAntecedentAnim) {
      setTimeout(() => setIsCompleted(true), 3000);
    }
  }, [showAntecedentAnim]);

  const navLinks = getNavLinks(1);

  const handleTrainingSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(trainingAnswer.replace(',', '.'));
    if (val === 17) {
      setIsTrainingComplete(true);
      setTrainingError(false);
    } else {
      setTrainingError(true);
    }
  };

  const handleErrorQuiz = (qIndex, isCorrect, optionIndex) => {
    if (errorAnswers[qIndex]) return;
    setErrorAnswers(prev => ({ ...prev, [qIndex]: { isCorrect, optionIndex } }));
  };

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      moduleTitle="Notion de fonction"
      moduleNumber={1}
      totalModules={MODULE_CTX.totalModules}
      prevLink={navLinks.prevLink}
      nextLink={isCompleted ? navLinks.nextLink : undefined}
      isCompleted={isCompleted}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-12 overflow-hidden">
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mt-2">Le compteur du Taxi</h2>
          </div>

          {/* ── STEP 1 : JE DÉCOUVRE (Situation réelle sans formule) ── */}
          <div className="space-y-6">
            <p className="text-lg text-slate-600">
              Tu montes dans un taxi. Dès que tu t'assois, le compteur affiche déjà <strong>2 €</strong> (c'est la prise en charge). 
              Ensuite, le prix augmente de <strong>1,50 € à chaque kilomètre</strong> parcouru.
            </p>
            <div className="bg-amber-50 text-amber-800 p-6 rounded-2xl flex items-start gap-4 border border-amber-200">
              <div className="bg-amber-200 p-3 rounded-full"><Car className="w-6 h-6 text-amber-700" /></div>
              <div>
                <p className="font-bold text-lg mb-1">Le défi :</p>
                <p>Est-il possible de prévoir le prix exact de la course avant même que la voiture ne démarre ?</p>
              </div>
            </div>
          </div>

          {/* ── STEP 2 : JE MANIPULE (Simulateur au cœur du module) ── */}
          <div className="space-y-6 pt-8 border-t border-slate-100">
            <p className="text-lg text-slate-600 font-medium">
              🎚️ <strong>Modifie la distance de ta course</strong> et observe le prix évoluer.
            </p>
            
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border-2 border-slate-200">
              {/* Slider */}
              <div className="mb-12">
                <div className="flex justify-between text-sm font-bold text-slate-400 mb-2">
                  <span>0 km</span>
                  <span className="text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">{distance} km</span>
                  <span>20 km</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="20" step="1"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Dynamique Text */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4 font-mono text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Prise en charge :</span>
                    <span className="font-bold">2,00 €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Distance ({distance} km) :</span>
                    <span className="font-bold text-indigo-600">{distance} × 1,50 = {(distance * 1.5).toFixed(2)} €</span>
                  </div>
                  <div className="w-full h-px bg-slate-200 my-2"></div>
                  <div className="flex justify-between text-lg sm:text-xl">
                    <span className="font-bold text-slate-800">Prix total :</span>
                    <span className="font-bold text-emerald-600">{price.toFixed(2)} €</span>
                  </div>
                </div>

                {/* Graphique Dynamique Simplifié */}
                <div className="relative w-full h-48 bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                  {/* Axes */}
                  <div className="absolute left-8 bottom-8 w-[calc(100%-2rem)] h-0.5 bg-slate-300"></div>
                  <div className="absolute left-8 top-4 w-0.5 h-[calc(100%-3rem)] bg-slate-300"></div>
                  <span className="absolute bottom-2 right-4 text-xs font-bold text-slate-400">Dist. (km)</span>
                  <span className="absolute top-2 left-2 text-xs font-bold text-slate-400">Prix (€)</span>
                  
                  {/* Point mouvant */}
                  <div 
                    className="absolute w-4 h-4 bg-emerald-500 rounded-full shadow-md -ml-2 -mb-2 transition-all duration-300 z-10"
                    style={{ 
                      left: `calc(2rem + ${(distance / 20) * 80}%)`, 
                      bottom: `calc(2rem + ${(price / 32) * 80}%)` 
                    }}
                  >
                    <div className="absolute -top-8 -left-4 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded">
                      {price}€
                    </div>
                  </div>
                  
                  {/* Trace de la droite */}
                  <svg className="absolute left-8 bottom-8 w-full h-full overflow-visible" style={{ pointerEvents: 'none' }}>
                    <line 
                      x1="0" y1="0" 
                      x2={`${(distance / 20) * 80}%`} 
                      y2={`-${(price / 32) * 80}%`} 
                      stroke="#10b981" strokeWidth="3" strokeDasharray="4 4"
                      className="transition-all duration-300"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* ── STEP 4 : JE FORMULE (après avoir compris) ── */}
          {hasExplored && (
            <div className="space-y-6 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4">
              <ConceptCard
                type="rule"
                title="Qu'est-ce qu'une fonction ?"
                content="Tu viens de découvrir une règle mathématique cachée ! Quand la distance change, le prix change toujours selon la même logique. En mathématiques, on appelle cette règle une fonction."
              />
              
              <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm">
                <p className="text-slate-600 mb-6">Voici comment les mathématiciens écrivent le programme de ton compteur de taxi :</p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 flex-wrap">
                  
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center font-mono font-bold text-slate-700 text-2xl shadow-inner mx-auto mb-2">
                      <MathText>$x$</MathText>
                    </div>
                    <span className="text-sm font-bold text-slate-500">Entrée<br/>(Distance en km)</span>
                  </div>

                  <ArrowRight className="text-slate-300 w-8 h-8 hidden md:block" />

                  <div className="bg-indigo-600 text-white px-6 py-4 rounded-xl font-space font-bold shadow-lg text-center relative">
                    <div className="absolute -top-3 -right-3 bg-amber-400 text-amber-900 text-xs px-2 py-1 rounded-full shadow">Fonction</div>
                    <span className="text-xl">Multiplie par 1,5<br/>puis ajoute 2</span>
                  </div>

                  <ArrowRight className="text-slate-300 w-8 h-8 hidden md:block" />

                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center font-mono font-bold text-emerald-700 text-2xl shadow-inner mx-auto mb-2">
                      <MathText>$f(x)$</MathText>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">Sortie<br/>(Prix final en €)</span>
                  </div>
                  
                </div>
                
                <div className="mt-8 text-center bg-indigo-50 p-4 rounded-xl text-indigo-900 font-medium">
                  On l'écrit avec une formule courte : <span className="font-space font-bold text-lg bg-white px-3 py-1 rounded-md shadow-sm ml-2">f(x) = 1,5x + 2</span>
                </div>
              </div>

              {/* ── STEP 5 : JE M'ENTRAÎNE ── */}
              <div className="space-y-6 pt-8 border-t border-slate-100">
                <p className="text-lg text-slate-600 font-medium">
                  🎯 Utilisons notre nouvelle fonction ! Calcule le prix exact d'une course de <strong>10 km</strong>.
                </p>
                <form onSubmit={handleTrainingSubmit} className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-center">
                  <div className="text-xl font-space font-bold text-slate-700 flex items-center gap-2">
                    <MathText>$f(10) =$</MathText>
                  </div>
                  <div className="relative">
                    <input 
                      type="text"
                      value={trainingAnswer}
                      onChange={(e) => setTrainingAnswer(e.target.value)}
                      placeholder="Ex: 25"
                      className="w-32 px-4 py-2 border-2 border-slate-200 rounded-xl font-bold font-mono text-center focus:border-indigo-500 focus:ring-0 outline-none"
                      disabled={isTrainingComplete}
                    />
                    <span className="absolute right-4 top-2 text-slate-400 font-bold">€</span>
                  </div>
                  {!isTrainingComplete && (
                    <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-colors">
                      Vérifier
                    </button>
                  )}
                  {isTrainingComplete && (
                    <div className="text-emerald-600 font-bold flex items-center gap-2 animate-bounce">
                      <CheckCircle2 className="w-6 h-6" /> Bien joué !
                    </div>
                  )}
                </form>
                {trainingError && !isTrainingComplete && (
                  <p className="text-red-500 text-center font-bold">Essaie de remplacer x par 10 dans la formule 1,5x + 2.</p>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 6 : JE DÉTECTE MON ERREUR (Diagnostic pédagogique) ── */}
          {isTrainingComplete && (
            <div className="space-y-6 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-xl font-bold text-slate-800 text-center">Diagnostic express</h3>
              <p className="text-slate-600 text-center">On vient d'écrire <MathText>$f(10) = 17$</MathText>. Es-tu sûr d'avoir bien compris qui est qui ?</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <p className="font-bold text-slate-700 mb-4">Dans $f(10) = 17$, que représente <strong>10</strong> ?</p>
                  <div className="flex flex-col gap-3">
                    {[
                      { text: 'A. Le prix', correct: false },
                      { text: 'B. La distance', correct: true }
                    ].map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleErrorQuiz(1, opt.correct, i)}
                        disabled={errorAnswers[1] !== undefined}
                        className={`p-3 rounded-xl border-2 font-medium text-left flex justify-between ${
                          errorAnswers[1]?.optionIndex === i
                            ? (opt.correct ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-red-500 bg-red-50 text-red-700')
                            : errorAnswers[1] !== undefined
                              ? 'border-slate-200 text-slate-400 opacity-50'
                              : 'border-slate-200 hover:border-indigo-400 text-slate-600'
                        }`}
                      >
                        {opt.text}
                        {errorAnswers[1]?.optionIndex === i && (opt.correct ? <CheckCircle2 className="w-5 h-5"/> : <XCircle className="w-5 h-5"/>)}
                      </button>
                    ))}
                  </div>
                </div>

                {errorAnswers[1] !== undefined && (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 animate-in fade-in">
                    <p className="font-bold text-slate-700 mb-4">Et que représente <strong>17</strong> ?</p>
                    <div className="flex flex-col gap-3">
                      {[
                        { text: 'A. La distance', correct: false },
                        { text: 'B. Le prix', correct: true }
                      ].map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleErrorQuiz(2, opt.correct, i)}
                          disabled={errorAnswers[2] !== undefined}
                          className={`p-3 rounded-xl border-2 font-medium text-left flex justify-between ${
                            errorAnswers[2]?.optionIndex === i
                              ? (opt.correct ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-red-500 bg-red-50 text-red-700')
                              : errorAnswers[2] !== undefined
                                ? 'border-slate-200 text-slate-400 opacity-50'
                                : 'border-slate-200 hover:border-indigo-400 text-slate-600'
                          }`}
                        >
                          {opt.text}
                          {errorAnswers[2]?.optionIndex === i && (opt.correct ? <CheckCircle2 className="w-5 h-5"/> : <XCircle className="w-5 h-5"/>)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isErrorDiagnosed && (
                <ConceptCard
                  type="warning"
                  title="Le piège à éviter absolument"
                  content={
                    <div>
                      Ne confonds jamais ce qui rentre et ce qui sort de la fonction !
                      <ul className="mt-4 space-y-2">
                        <li>🧠 <strong>$x$ = l'entrée</strong> (ici les km). On l'appelle la variable.</li>
                        <li>🧠 <strong>$f(x)$ = la sortie</strong> (ici le prix). On l'appelle l'<strong>Image</strong>.</li>
                      </ul>
                    </div>
                  }
                />
              )}
            </div>
          )}

          {/* ── STEP 7 : JE RÉUTILISE (L'antécédent) ── */}
          {isErrorDiagnosed && (
            <div className="space-y-6 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4">
              <p className="text-lg text-slate-600 font-medium">
                🔄 C'est bien de trouver le prix si on connaît la distance. Mais peut-on faire l'inverse ?
              </p>
              
              <div className="bg-indigo-50 p-6 sm:p-8 rounded-3xl border-2 border-indigo-100">
                <p className="text-indigo-900 mb-6 font-medium">
                  Le chauffeur te dit : « Ça vous fera <strong>17 €</strong> s'il vous plaît ! »<br/>
                  Mais il fait nuit noire, tu n'as pas regardé la route. Quelle distance as-tu parcourue ?
                </p>

                <div className="flex flex-col items-center">
                  <form onSubmit={handleAntecedentSubmit} className="flex gap-4 items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
                    <span className="font-bold text-slate-700">Distance :</span>
                    <input 
                      type="text"
                      value={antecedentAnswer}
                      onChange={(e) => setAntecedentAnswer(e.target.value)}
                      placeholder="?"
                      className="w-20 px-3 py-1 border-2 border-slate-200 rounded-lg text-center font-bold outline-none focus:border-indigo-500"
                      disabled={isAntecedentComplete}
                    />
                    <span className="font-bold text-slate-700">km</span>
                    {!isAntecedentComplete && (
                      <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold">GO</button>
                    )}
                    {isAntecedentComplete && (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    )}
                  </form>
                </div>

                {isAntecedentComplete && (
                  <div className="text-center space-y-8 animate-in fade-in">
                    <div className="bg-white p-6 rounded-xl border border-indigo-100 flex flex-col items-center shadow-sm relative overflow-hidden">
                      <p className="mb-4 font-bold text-slate-700">Voici ce que tu viens de faire dans ta tête :</p>
                      
                      <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-lg relative z-10">
                        <div className="font-bold text-indigo-700 px-4 py-2 bg-indigo-50 rounded-lg">10 km</div>
                        <div className="flex flex-col items-center">
                          <ArrowRight className="w-6 h-6 text-indigo-400" />
                          <span className="text-xs font-bold text-indigo-600 uppercase">Fonction</span>
                        </div>
                        <div className="font-bold text-emerald-700 px-4 py-2 bg-emerald-50 rounded-lg">17 €</div>
                      </div>

                      <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-lg mt-4 relative z-10">
                        <div className="font-bold text-indigo-700 px-4 py-2 bg-indigo-50 rounded-lg border-2 border-indigo-400">10 km</div>
                        <div className="flex flex-col items-center">
                          <ArrowRight className="w-6 h-6 text-amber-400 rotate-180" />
                          <span className="text-xs font-bold text-amber-600 uppercase">Je cherche</span>
                        </div>
                        <div className="font-bold text-emerald-700 px-4 py-2 bg-emerald-50 rounded-lg">17 €</div>
                      </div>
                      
                      {/* L'explication algébrique invisible qui apparait */}
                      <div className="mt-8 pt-6 border-t border-slate-100 text-left w-full max-w-md">
                        <p className="text-sm text-slate-500 mb-2 font-bold uppercase tracking-wider">En langage mathématique :</p>
                        <div className="font-space font-medium text-slate-700 space-y-2">
                          <p><MathText>{"$1{,}5x + 2 = 17$"}</MathText></p>
                          <p><MathText>{"$1{,}5x = 15$"}</MathText></p>
                          <p><MathText>{"$x = 10$"}</MathText></p>
                        </div>
                      </div>
                    </div>

                    <div className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
                      <p className="text-lg">
                        <strong>10</strong> est appelé un <strong>antécédent</strong> de 17.
                      </p>
                      <button 
                        onClick={() => setShowAntecedentAnim(true)}
                        className="mt-4 px-6 py-2 bg-white text-indigo-600 font-bold rounded-xl shadow-sm text-sm"
                      >
                        J'ai compris !
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 8 : JE MAÎTRISE ── */}
          {showAntecedentAnim && (
            <div className="bg-emerald-50 border-2 border-emerald-200 p-8 rounded-3xl text-center shadow-sm animate-in zoom-in duration-500">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-emerald-800 mb-2">Compétence débloquée</h3>
              <p className="text-emerald-700 font-medium">Tu as compris comment fonctionne la "machine" mathématique.</p>
              <p className="text-sm text-emerald-600 mt-2">Prépare-toi pour le module suivant où l'on explorera plus en détail les graphiques !</p>
            </div>
          )}

        </div>
      </div>
    </ModuleLayout>
  );
}
