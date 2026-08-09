import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import SectionHeader from '../../../../../common/components/SectionHeader';
import FeedbackBox from '../../../../../common/components/FeedbackBox';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

// Coûts des 3 forfaits
const FA = (x) => 0.1 * x + 10;  // Forfait A : affine
const FB = (x) => 0.3 * x;        // Forfait B : linéaire
const FC = 25;                      // Forfait C : constant

// Conversion → SVG (x: 0–200 min ; y: 0–80 €)
const toSVG = (mins, euros) => ({
  sx: 40 + (mins / 200) * 320,
  sy: 280 - (euros / 80) * 240,
});

export default function Module09MissionForfait() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(9);

  const [q1, setQ1] = useState(null);
  const [q2, setQ2] = useState(null);
  const [q3, setQ3] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [simMins, setSimMins] = useState(80);

  const handleQ1 = (correct) => {
    if (correct) {
      awardXP({ moduleId: 'L09', exerciseId: 'L09-Q1', amount: 60 });
    }
    setQ1(correct ? 'success' : 'error');
  };

  const handleQ2 = (correct) => {
    if (correct) {
      awardXP({ moduleId: 'L09', exerciseId: 'L09-Q2', amount: 70 });
    }
    setQ2(correct ? 'success' : 'error');
  };

  const handleQ3 = (correct) => {
    if (correct) {
      awardXP({ moduleId: 'L09', exerciseId: 'L09-Q3', amount: 70 });
      setTimeout(() => setIsSuccess(true), 1200);
    }
    setQ3(correct ? 'success' : 'error');
  };

  const handleNext = () => markModuleCompleted('L09');

  // Points pour le graphique des 3 fonctions
  const minsRange = [0, 50, 100, 150, 200];
  const lineA = minsRange.map(m => ({ m, ...toSVG(m, FA(m)) }));
  const lineB = minsRange.map(m => ({ m, ...toSVG(m, FB(m)) }));
  const lineC_pts = [{ m: 0, ...toSVG(0, FC) }, { m: 200, ...toSVG(200, FC) }];

  const simCostA = FA(simMins).toFixed(2);
  const simCostB = FB(simMins).toFixed(2);
  const simCostC = FC.toFixed(2);
  const cheapest = [
    { name: 'A', cost: parseFloat(simCostA) },
    { name: 'B', cost: parseFloat(simCostB) },
    { name: 'C', cost: parseFloat(simCostC) },
  ].reduce((m, c) => (c.cost < m.cost ? c : m), { name: '', cost: Infinity });

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-6 py-8 max-w-md">
          <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/30">
            <span className="text-5xl" aria-hidden="true">🏆</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-space font-extrabold text-slate-900">Mission accomplie !</h2>
            <p className="text-slate-600">Vous avez appliqué les fonctions affines à un vrai problème de vie réelle.</p>
          </div>
          <div className="pt-4">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-900 text-white font-mono font-bold hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 focus:outline-none"
            >
              Continuer vers le Bilan Final →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      chapterTitle={MODULE_CTX.chapterTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={9}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Mission : Le Choix du Forfait"
      moduleSubtitle="Vous êtes consultant pour une famille. Quel forfait mobile choisir selon les habitudes d'appel ?"
      estimatedTime="15 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      {/* Le Dossier */}
      <section className="bg-white rounded-3xl border border-amber-200 shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-space font-bold text-slate-900 flex items-center gap-2">
          <span aria-hidden="true">📜</span> Le Dossier
        </h2>

        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100 text-sm text-slate-700 space-y-3 leading-relaxed">
          <p>
            Un opérateur téléphonique propose trois forfaits. Soit <MathText>$x$</MathText> le
            nombre de minutes d'appel par mois :
          </p>
          <ul className="list-none space-y-2">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">A</span>
              <span><strong>Forfait A :</strong> abonnement fixe de 10 €/mois, plus 0,10 € par minute d'appel.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">B</span>
              <span><strong>Forfait B :</strong> pas d'abonnement fixe, 0,30 € par minute d'appel.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">C</span>
              <span><strong>Forfait C :</strong> 25 €/mois, appels illimités.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Étape 1 : Écrire les expressions */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={1} title="Modéliser les forfaits" color="amber" />
        <p className="text-sm text-slate-600">Associez chaque forfait à sa bonne expression :</p>

        <div className="grid gap-3">
          {[
            { id: 1, label: <><MathText>{'$f(x) = 0{,}1x + 10$'}</MathText> ; <MathText>{'$g(x) = 0{,}3x$'}</MathText> ; <MathText>$h(x) = 25$</MathText></>, correct: true },
            { id: 2, label: <><MathText>{'$f(x) = 10x + 0{,}1$'}</MathText> ; <MathText>$g(x) = 25$</MathText> ; <MathText>{'$h(x) = 0{,}3x$'}</MathText></>, correct: false },
            { id: 3, label: <><MathText>{'$f(x) = 0{,}1x$'}</MathText> ; <MathText>{'$g(x) = 0{,}3x + 10$'}</MathText> ; <MathText>$h(x) = 25x$</MathText></>, correct: false },
          ].map(({ id, label, correct }) => (
            <button key={id} type="button" onClick={() => handleQ1(correct)}
              disabled={q1 === 'success'}
              className={`w-full p-4 rounded-xl border-2 text-left flex justify-between items-center transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none
                ${q1 === 'success' && correct ? 'border-emerald-400 bg-emerald-50' : ''}
                ${q1 === 'error' && !correct ? 'border-rose-200' : ''}
                ${!q1 ? 'border-slate-200 hover:border-blue-300' : 'border-slate-200'}`}
            >
              <span className="text-xs font-mono font-bold text-slate-700">{label}</span>
            </button>
          ))}
        </div>

        {q1 === 'success' && (
          <FeedbackBox type="success">
            <strong>Parfait !</strong> <MathText>$f(x)$</MathText> est affine (part fixe + variable),{' '}
            <MathText>$g(x)$</MathText> est linéaire (que du variable) et <MathText>$h(x)$</MathText>{' '}
            est constante (fixe). (+60 XP)
          </FeedbackBox>
        )}
        {q1 === 'error' && (
          <FeedbackBox type="error">
            Relisez l'énoncé. Le Forfait A a un <strong>fixe</strong> de 10 € (<MathText>$b=10$</MathText>)
            et <strong>0,10 € par minute</strong> (<MathText>{'$a=0{,}1$'}</MathText>).
          </FeedbackBox>
        )}
      </section>

      {/* Graphique interactif (visible après Q1 réussie) */}
      {q1 === 'success' && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <SectionHeader number={2} title="Comparaison graphique" color="sky" />
          <p className="text-sm text-slate-600">
            Déplacez le curseur pour voir le coût de chaque forfait selon le nombre de minutes.
          </p>

          <div className="w-full overflow-x-auto">
            <svg viewBox="0 0 400 300" className="w-full max-w-lg mx-auto block" style={{ minWidth: 280 }}
              role="img" aria-label="Graphique comparatif des 3 forfaits">
              {[0,1,2,3].map(i => (
                <line key={`gy${i}`} x1="40" y1={40+i*60} x2="360" y2={40+i*60} stroke="#e2e8f0" strokeWidth="1"/>
              ))}
              {[0,1,2,3,4].map(i => (
                <line key={`gx${i}`} x1={40+i*80} y1="40" x2={40+i*80} y2="280" stroke="#e2e8f0" strokeWidth="1"/>
              ))}
              <line x1="40" y1="280" x2="360" y2="280" stroke="#64748b" strokeWidth="2"/>
              <line x1="40" y1="40" x2="40" y2="280" stroke="#64748b" strokeWidth="2"/>
              {[0,50,100,150,200].map((m,i)=>(
                <text key={m} x={40+i*80-4} y="294" className="font-mono text-[8px] fill-slate-400">{m}</text>
              ))}
              <text x="190" y="308" className="font-mono text-[9px] fill-slate-500">Minutes (x)</text>
              {[0,20,40,60,80].map((e,i)=>(
                <text key={e} x="2" y={280-i*60+3} className="font-mono text-[8px] fill-slate-400">{e}€</text>
              ))}
              <polyline points={lineA.map(p=>`${p.sx},${p.sy}`).join(' ')} fill="none" stroke="#3b82f6" strokeWidth="2.5"/>
              <text x={lineA[4].sx+5} y={lineA[4].sy} className="font-mono text-[9px] fill-blue-600 font-bold">A</text>
              <polyline points={lineB.map(p=>`${p.sx},${p.sy}`).join(' ')} fill="none" stroke="#10b981" strokeWidth="2.5"/>
              <text x={lineB[4].sx+5} y={lineB[4].sy} className="font-mono text-[9px] fill-emerald-600 font-bold">B</text>
              <line x1={lineC_pts[0].sx} y1={lineC_pts[0].sy} x2={lineC_pts[1].sx} y2={lineC_pts[1].sy}
                stroke="#7c3aed" strokeWidth="2.5"/>
              <text x={lineC_pts[1].sx+5} y={lineC_pts[1].sy} className="font-mono text-[9px] fill-purple-600 font-bold">C</text>
              {(() => {
                const { sx } = toSVG(simMins, 0);
                return <line x1={sx} y1="40" x2={sx} y2="280" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4" />;
              })()}
            </svg>
          </div>

          <div className="space-y-2">
            <label htmlFor="sim-slider" className="text-sm font-bold text-slate-700">
              Simuler pour <span className="text-amber-600">{simMins} minutes</span>
            </label>
            <input id="sim-slider" type="range" min="0" max="200" step="5"
              value={simMins}
              onChange={(e) => setSimMins(parseInt(e.target.value))}
              className="w-full accent-amber-500" />
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono mt-2">
              <div className={`p-2 rounded-xl border ${cheapest.name === 'A' ? 'bg-blue-100 border-blue-400 font-bold text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                A : {simCostA} €
              </div>
              <div className={`p-2 rounded-xl border ${cheapest.name === 'B' ? 'bg-emerald-100 border-emerald-400 font-bold text-emerald-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                B : {simCostB} €
              </div>
              <div className={`p-2 rounded-xl border ${cheapest.name === 'C' ? 'bg-purple-100 border-purple-400 font-bold text-purple-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                C : {simCostC} €
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Étape 2 : 50 minutes */}
      {q1 === 'success' && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <SectionHeader number={3} title="Le petit consommateur (50 min/mois)" color="emerald" />
          <p className="text-sm text-slate-600">
            Quel forfait est le moins cher pour <MathText>$x = 50$</MathText> minutes ?
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {['A', 'B', 'C'].map(name => (
              <button key={name} type="button" onClick={() => handleQ2(name === 'A')}
                disabled={q2 === 'success'}
                className="p-4 rounded-xl border border-slate-200 hover:bg-slate-50 font-mono font-bold text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none">
                Forfait {name}
              </button>
            ))}
          </div>
          {q2 === 'success' && (
            <FeedbackBox type="success">
              <strong>Exact !</strong> À 50 min :{' '}
              <MathText>{'$f(50) = 0{,}1 \\times 50 + 10 = 15$'}</MathText> € ;{' '}
              <MathText>{'$g(50) = 0{,}3 \\times 50 = 15$'}</MathText> € ;{' '}
              <MathText>$h = 25$</MathText> €.
              A et B sont ex-aequo, tous deux moins chers que C ! (+70 XP)
            </FeedbackBox>
          )}
          {q2 === 'error' && (
            <FeedbackBox type="error">
              Calculez le coût de chaque forfait pour <MathText>$x = 50$</MathText>, puis comparez.
            </FeedbackBox>
          )}
        </section>
      )}

      {/* Étape 3 : 150 minutes */}
      {q2 === 'success' && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <SectionHeader number={4} title="Le grand consommateur (150 min/mois)" color="indigo" />
          <p className="text-sm text-slate-600">
            Quel forfait est le moins cher pour <MathText>$x = 150$</MathText> minutes ?
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {['A', 'B', 'C'].map(name => (
              <button key={name} type="button" onClick={() => handleQ3(name === 'A')}
                disabled={q3 === 'success'}
                className="p-4 rounded-xl border border-slate-200 hover:bg-slate-50 font-mono font-bold text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none">
                Forfait {name}
              </button>
            ))}
          </div>
          {q3 === 'success' && (
            <FeedbackBox type="success">
              <strong>Mission réussie !</strong> À 150 min :{' '}
              <MathText>$f(150) = 25$</MathText> € ; <MathText>$g(150) = 45$</MathText> € ;{' '}
              <MathText>$h = 25$</MathText> €.
              A et C sont ex-aequo, moins chers que B ! Le Forfait A est le meilleur sur toute la plage. (+70 XP)
            </FeedbackBox>
          )}
          {q3 === 'error' && (
            <FeedbackBox type="error">
              Calculez pour <MathText>$x = 150$</MathText> :{' '}
              <MathText>{'$f(150) = 0{,}1 \\times 150 + 10$'}</MathText>,{' '}
              <MathText>{'$g(150) = 0{,}3 \\times 150$'}</MathText>,{' '}
              <MathText>$h = 25$</MathText>.
            </FeedbackBox>
          )}
        </section>
      )}

      <KeyTakeaway color="amber">
        <li>
          • Les fonctions affines servent à modéliser des situations réelles (tarifs, consommations…).
        </li>
        <li>
          • Comparer des fonctions, c'est comparer leurs expressions pour des valeurs de{' '}
          <MathText>$x$</MathText> données.
        </li>
        <li>
          • Sur un graphique, la fonction la <strong>plus basse</strong> représente le coût le plus faible.
        </li>
      </KeyTakeaway>
    </ModuleLayout>
  );
}
