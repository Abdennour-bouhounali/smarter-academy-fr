import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import SectionHeader from '../../../../../common/components/SectionHeader';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import clsx from 'clsx';
import MathInput from '../../../../../common/components/MathInput';
import ExerciseValidator from '../../../../../common/components/ExerciseValidator';
import { useAdaptiveExercise } from '../../../../../common/hooks/useAdaptiveExercise';
import { ComputeEngine } from '@cortex-js/compute-engine';

const ce = new ComputeEngine();

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

export default function Module06Mission() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(6);

  const handleNext = () => markModuleCompleted('L06');

  // The user controls the "time of day" which changes the angle of the sun.
  // We represent this as a shadowFactor (shadow_length / height).
  const [shadowFactor, setShadowFactor] = useState(1.4);
  
  // Real Pyramide height is roughly 146m. 
  // Stick height is 2m.
  const stickHeight = 2;
  const pyramidHeight = 146;
  
  // Displayed lengths
  const l = stickHeight * shadowFactor; // Stick shadow length
  const L = pyramidHeight * shadowFactor; // Pyramid shadow length from center
  
  const targetH = 146;
  const [userH, setUserH] = useState("");
  
  const L_rounded = Math.round(L);
  const l_rounded = Number(l.toFixed(1));
  const exactHValue = (2 * L_rounded) / l_rounded;
  
  const adaptiveState = useAdaptiveExercise({
    validate: (values) => {
      let isCorrect = false;
      let feedback = null;
      
      const latex = values.h || "";
      let numericValue = null;
      try {
        numericValue = ce.parse(latex).N().value;
      } catch (e) {
        return { isCorrect: false, feedback: "Expression invalide." };
      }

      if (Math.abs(numericValue - exactHValue) > 0.001) {
        return { 
          isCorrect: false, 
          feedback: `Ce n'est pas ça. Revoyez votre calcul avec l = ${l_rounded} m et L = ${L_rounded} m. N'oubliez pas le produit en croix.` 
        };
      }

      // Numerically correct! Now check if it is a simplified fraction.
      const cleanLatex = latex.replace(/\s+/g, '');
      const fracMatch = cleanLatex.match(/^\\frac{([0-9]+)}{([0-9]+)}$/);
      const intMatch = cleanLatex.match(/^[0-9]+$/);
      const decimalMatch = cleanLatex.match(/^[0-9]+[.,][0-9]+$/);
      
      if (intMatch) {
        // Correct and it's an integer. (e.g. if the result happens to be exactly 146)
        return { isCorrect: true, feedback: null };
      }
      
      if (fracMatch) {
        const num = parseInt(fracMatch[1]);
        const den = parseInt(fracMatch[2]);
        if (gcd(num, den) === 1) {
          return { isCorrect: true, feedback: null };
        } else {
          return { 
            isCorrect: false, 
            feedback: "C'est la bonne valeur, mais la fraction n'est pas irréductible. Simplifiez-la au maximum !" 
          };
        }
      }
      
      // If it's a decimal or unformatted
      return { 
        isCorrect: false, 
        feedback: "C'est la bonne valeur, mais vous devez écrire la réponse sous forme de fraction irréductible." 
      };
    },
    guidanceSteps: [
      { type: 'hint', content: `Utilisez l'égalité : 2 / H = ${l_rounded} / ${L_rounded}.` },
      { type: 'hint', content: `Le produit en croix donne : H = (2 × ${L_rounded}) / ${l_rounded}.` },
      { type: 'hint', content: "Écrivez le résultat de la division sous forme de fraction, puis simplifiez-la en divisant le numérateur et le dénominateur par un diviseur commun." },
      { type: 'solution', content: `H = (2 × ${L_rounded}) / ${l_rounded} m.` } // We keep it generic as solution might depend on the slider.
    ],
    onSuccess: () => {
      awardXP({ moduleId: 'L06', exerciseId: 'kheops', amount: 200 });
    }
  });

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
      moduleTitle="Mission : La Pyramide de Khéops"
      moduleSubtitle="Comment Thalès a-t-il mesuré l'immense pyramide avec un simple bâton ?"
      estimatedTime="15 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      <section className="bg-white rounded-3xl border border-amber-200 shadow-sm overflow-hidden">
        
        {/* Mission Header */}
        <div className="bg-amber-50 p-8 border-b border-amber-200 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-9xl opacity-10">☀️</div>
          <SectionHeader number="Mission" title="L'Ombre de la Pyramide" color="amber" />
          <p className="text-amber-900 leading-relaxed max-w-3xl mt-4 font-medium relative z-10">
            Nous sommes en Égypte ancienne. Thalès veut mesurer la hauteur de la pyramide de Khéops, mais elle est bien trop grande. Il plante son bâton de <strong>2 mètres</strong> dans le sable et observe les ombres.
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Simulation View */}
            <div className="flex-1 space-y-6">
              <div className="bg-sky-50 rounded-2xl border border-sky-100 p-4 overflow-hidden relative shadow-inner flex flex-col justify-end">
                {/* SVG Canvas */}
                <svg viewBox="0 0 400 250" className="w-full h-auto drop-shadow-sm">
                  {/* Sun (moves based on factor) */}
                  <g className="transition-all duration-300" style={{ transform: `translate(${350 - shadowFactor * 100}px, 30px)` }}>
                    <circle cx="0" cy="0" r="15" fill="#f59e0b" />
                    <circle cx="0" cy="0" r="25" fill="#fbbf24" opacity="0.4" />
                  </g>

                  {/* Ground */}
                  <rect x="0" y="200" width="400" height="50" fill="#fef3c7" />
                  <line x1="0" y1="200" x2="400" y2="200" stroke="#d97706" strokeWidth="2" />

                  {/* Stick (Exaggerated for visual) */}
                  <g transform="translate(320, 0)">
                    {/* Shadow */}
                    <polygon 
                      points={`0,200 ${shadowFactor * 30},200 0,200`} 
                      fill="rgba(0,0,0,0.2)" 
                      className="transition-all duration-300"
                    />
                    <line x1="0" y1="200" x2={shadowFactor * 30} y2="200" stroke="#1e293b" strokeWidth="2" className="transition-all duration-300" />
                    {/* Sun Ray (Extended to y=-50 to go off-screen) */}
                    <line x1={-220 * shadowFactor} y1={-50} x2={shadowFactor * 30} y2="200" stroke="#d97706" strokeWidth="2" strokeDasharray="4 4" className="transition-all duration-300" />
                    {/* Stick */}
                    <line x1="0" y1="170" x2="0" y2="200" stroke="#78350f" strokeWidth="4" />
                    <text x="0" y="160" textAnchor="middle" className="text-[10px] font-bold fill-amber-900">Bâton (h=2m)</text>
                    
                    {/* Dimension line for l */}
                    <line x1="0" y1="210" x2={shadowFactor * 30} y2="210" stroke="#334155" strokeWidth="1.5" className="transition-all duration-300" />
                    <line x1="0" y1="207" x2="0" y2="213" stroke="#334155" strokeWidth="1.5" />
                    <line x1={shadowFactor * 30} y1="207" x2={shadowFactor * 30} y2="213" stroke="#334155" strokeWidth="1.5" className="transition-all duration-300" />
                    <text x={shadowFactor * 15} y="222" textAnchor="middle" className="text-[10px] font-bold fill-slate-700 transition-all duration-300">l = {l.toFixed(1)}m</text>
                  </g>

                  {/* Pyramid */}
                  <g transform="translate(100, 0)">
                    {/* Shadow (starts from center) */}
                    <polygon 
                      points={`0,200 ${shadowFactor * 80},200 0,200`} 
                      fill="rgba(0,0,0,0.2)" 
                      className="transition-all duration-300"
                    />
                    <line x1="0" y1="200" x2={shadowFactor * 80} y2="200" stroke="#1e293b" strokeWidth="2" className="transition-all duration-300" />
                    {/* Sun Ray (Extended to y=-50 to go off-screen) */}
                    <line x1={-170 * shadowFactor} y1={-50} x2={shadowFactor * 80} y2="200" stroke="#d97706" strokeWidth="2" strokeDasharray="4 4" className="transition-all duration-300" />
                    
                    {/* Pyramid Shape */}
                    <polygon points="-60,200 0,120 60,200" fill="#d97706" stroke="#b45309" strokeWidth="1" />
                    <polygon points="0,120 60,200 80,200" fill="#b45309" opacity="0.8" />
                    
                    {/* Center line (Height) */}
                    <line x1="0" y1="120" x2="0" y2="200" stroke="#fff" strokeDasharray="2 2" strokeWidth="1.5" />
                    <text x="-5" y="165" textAnchor="end" className="text-[10px] font-bold fill-white">H = ?</text>
                    
                    {/* Dimension line for L */}
                    <line x1="0" y1="210" x2={shadowFactor * 80} y2="210" stroke="#334155" strokeWidth="1.5" className="transition-all duration-300" />
                    <line x1="0" y1="207" x2="0" y2="213" stroke="#334155" strokeWidth="1.5" />
                    <line x1={shadowFactor * 80} y1="207" x2={shadowFactor * 80} y2="213" stroke="#334155" strokeWidth="1.5" className="transition-all duration-300" />
                    <text x={shadowFactor * 40} y="222" textAnchor="middle" className="text-[10px] font-bold fill-slate-700 transition-all duration-300">L = {Math.round(L)}m</text>
                  </g>
                </svg>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <label className="text-sm font-bold text-slate-700 block mb-3 flex items-center justify-between">
                  <span>Mouvement du Soleil (Heure de la journée)</span>
                  <span className="text-xl">☀️</span>
                </label>
                <input 
                  type="range" min="0.5" max="2.5" step="0.1" 
                  value={shadowFactor} 
                  onChange={(e) => {
                    setShadowFactor(Number(e.target.value)); 
                    if (adaptiveState.status !== 'idle') adaptiveState.reset();
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <p className="text-xs text-slate-500 mt-2 text-center italic">Observez le parallélisme parfait des rayons solaires (lignes pointillées).</p>
              </div>
            </div>

            {/* Math Abstraction & Resolution */}
            <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Modélisation Mathématique</h3>
                
                <p className="text-sm text-slate-600 mb-4">
                  Les rayons du soleil sont parallèles. On se retrouve avec deux triangles rectangles emboîtés !
                </p>
                
                <div className="font-mono text-center bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm">
                  <div className="text-amber-700 mb-2 font-bold">Petit Triangle (Bâton) ↔ Grand Triangle (Pyramide)</div>
                  <div className="flex items-center justify-center gap-4 text-lg">
                    <div className="flex flex-col items-center">
                      <span>h (bâton)</span>
                      <div className="w-24 h-px bg-slate-400 my-1"></div>
                      <span>H (pyramide)</span>
                    </div>
                    <span>=</span>
                    <div className="flex flex-col items-center">
                      <span>l (ombre bâton)</span>
                      <div className="w-40 h-px bg-slate-400 my-1"></div>
                      <span>L (ombre pyramide)</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-sm">
                  <p><strong>Bâton (h)</strong> = 2 m</p>
                  <p><strong>Ombre du bâton (l)</strong> = {l_rounded} m</p>
                  <p><strong>Ombre de la pyramide (L)</strong> = {L_rounded} m</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="font-bold text-slate-800">Calculez la hauteur exacte H de la pyramide :</h3>
                <p className="text-sm text-slate-600"><em>(Votre réponse doit être écrite sous la forme d'une <strong>fraction irréductible</strong> la plus simple possible)</em></p>
                
                <ExerciseValidator
                  adaptiveState={adaptiveState}
                  onSubmit={() => adaptiveState.submitAnswer({ h: userH })}
                  disabled={adaptiveState.status === 'correct'}
                >
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <MathInput 
                        value={userH}
                        onChange={(val) => {
                          setUserH(val);
                          if (adaptiveState.status !== 'idle') adaptiveState.reset();
                        }}
                        disabled={adaptiveState.status === 'correct'}
                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </ExerciseValidator>
                
                {adaptiveState.status === 'correct' && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl shadow-sm animate-fade-in mt-4">
                    🎉 <strong>Mission accomplie ! (+200 XP)</strong><br/><br/>
                    Grâce au théorème de Thalès, nous avons pu calculer la hauteur avec la configuration actuelle ! 
                    <br/><br/>
                    <span className="text-sm"><em>Fait historique : Thalès a en réalité attendu que l'ombre de son bâton soit parfaitement égale à sa taille (h = l) pour que l'ombre de la pyramide soit égale à sa hauteur (H = L), simplifiant ainsi son calcul pour trouver environ 146 mètres ! Mais avec le produit en croix, vous pouvez calculer la hauteur exacte à n'importe quelle heure de la journée sous forme de fraction.</em></span>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </section>
    </ModuleLayout>
  );
}
