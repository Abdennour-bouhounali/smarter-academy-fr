import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import SectionHeader from '../../../../../common/components/SectionHeader';
import FeedbackBox from '../../../../../common/components/FeedbackBox';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

const FN_A = 2;
const TARGET_POINTS = [
  { x: -1, y: -2 },
  { x: 0,  y: 0  },
  { x: 1,  y: 2  },
  { x: 2,  y: 4  },
];

const toSVG = (mx, my) => ({ svgX: 150 + mx * 25, svgY: 150 - my * 25 });

export default function Module05RepresentationLineaire() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(5);

  const [placed, setPlaced] = useState([]);
  const [validated, setValidated] = useState(false);

  const handleSVGClick = (e) => {
    if (validated) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const svgW = rect.width;
    const svgH = rect.height;
    const clickX = ((e.clientX - rect.left) / svgW) * 300;
    const clickY = ((e.clientY - rect.top) / svgH) * 300;
    const mathX = Math.round(((clickX - 150) / 25) * 2) / 2;
    const mathY = Math.round(((150 - clickY) / 25) * 2) / 2;
    const intX = Math.round(mathX);
    const intY = Math.round(mathY);
    if (intX < -5 || intX > 5 || intY < -5 || intY > 5) return;
    if (placed.some(p => p.x === intX)) {
      setPlaced(prev => prev.filter(p => p.x !== intX).concat({ x: intX, y: intY }));
    } else {
      setPlaced(prev => [...prev, { x: intX, y: intY }]);
    }
  };

  const handleValidate = () => {
    const correct = TARGET_POINTS.filter(tp =>
      placed.some(p => p.x === tp.x && p.y === tp.y)
    ).length;
    setValidated(true);
    if (correct >= 3) awardXP({ moduleId: 'L05', exerciseId: 'L05-trace', amount: 75 });
    else if (correct >= 2) awardXP({ moduleId: 'L05', exerciseId: 'L05-trace', amount: 40 });
  };

  const correctCount = validated
    ? TARGET_POINTS.filter(tp => placed.some(p => p.x === tp.x && p.y === tp.y)).length
    : null;

  const handleNext = () => markModuleCompleted('L05');

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
      moduleTitle="Représentation Graphique"
      moduleSubtitle="Tracer la droite d'une fonction linéaire à partir de son tableau de valeurs."
      estimatedTime="10 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      {/* Section 1 : Méthode */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="Méthode : du tableau au graphique" color="sky" />

        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center">
            <div className="text-2xl mb-2">①</div>
            <p className="font-bold text-blue-900">Construire le tableau</p>
            <p className="text-blue-800 text-xs mt-1">
              Choisir des valeurs de <MathText>$x$</MathText> et calculer les <MathText>$f(x)$</MathText>.
            </p>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl text-center">
            <div className="text-2xl mb-2">②</div>
            <p className="font-bold text-indigo-900">Placer les points</p>
            <p className="text-indigo-800 text-xs mt-1">
              Chaque colonne <MathText>$(x, f(x))$</MathText> donne un point du repère.
            </p>
          </div>
          <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl text-center">
            <div className="text-2xl mb-2">③</div>
            <p className="font-bold text-sky-900">Tracer la droite</p>
            <p className="text-sky-800 text-xs mt-1">
              Relier les points à la règle pour tracer la droite.
            </p>
          </div>
        </div>

        {/* Exemple résolu */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <p className="font-bold text-slate-800 mb-3">
            Exemple : <MathText>$f(x) = x$</MathText> (la droite identité)
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="overflow-x-auto">
              <table className="text-center font-mono text-xs border-collapse">
                <tbody>
                  <tr className="bg-indigo-100 text-indigo-900 font-bold">
                    <td className="border border-indigo-200 p-2"><MathText>$x$</MathText></td>
                    {[-2,-1,0,1,2].map(x=><td key={x} className="border border-indigo-200 p-2">{x}</td>)}
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-slate-200 p-2 font-bold text-sky-700"><MathText>$f(x)$</MathText></td>
                    {[-2,-1,0,1,2].map(x=><td key={x} className="border border-slate-200 p-2 font-bold">{x}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="relative w-36 h-36 bg-white rounded-xl border border-slate-200 overflow-hidden flex-shrink-0">
              <svg viewBox="0 0 150 150" className="w-full h-full">
                {[30,60,90,120].map(p=>(
                  <React.Fragment key={p}>
                    <line x1={p} y1={0} x2={p} y2={150} stroke="#e2e8f0" strokeWidth="0.5"/>
                    <line x1={0} y1={p} x2={150} y2={p} stroke="#e2e8f0" strokeWidth="0.5"/>
                  </React.Fragment>
                ))}
                <line x1="0" y1="75" x2="150" y2="75" stroke="#64748b" strokeWidth="1.5"/>
                <line x1="75" y1="0" x2="75" y2="150" stroke="#64748b" strokeWidth="1.5"/>
                <line x1="0" y1="150" x2="150" y2="0" stroke="#6366f1" strokeWidth="2"/>
                {[-2,-1,0,1,2].map(x=>{
                  const sx = 75+x*15, sy = 75-x*15;
                  return <circle key={x} cx={sx} cy={sy} r="3" fill="#ef4444"/>;
                })}
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 : Exercice interactif */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={2} title="Placez les points sur le repère !" color="emerald" />

        <p className="text-sm text-slate-700">
          Cliquez sur le graphique pour placer les points du tableau de valeurs de{' '}
          <MathText>$f(x) = 2x$</MathText>.
        </p>

        {/* Tableau de référence */}
        <div className="overflow-x-auto">
          <table className="text-center font-mono text-sm border-collapse">
            <tbody>
              <tr className="bg-blue-100 text-blue-900 font-bold">
                <td className="border border-blue-200 p-2"><MathText>$x$</MathText></td>
                {TARGET_POINTS.map(p=><td key={p.x} className="border border-blue-200 p-2">{p.x}</td>)}
              </tr>
              <tr className="bg-white">
                <td className="border border-slate-200 p-2 font-bold text-sky-700"><MathText>$f(x)$</MathText></td>
                {TARGET_POINTS.map(p=>(
                  <td key={p.x} className={`border border-slate-200 p-2 font-bold
                    ${validated && placed.some(pl=>pl.x===p.x&&pl.y===p.y) ? 'bg-emerald-100 text-emerald-700' : ''}`}>
                    ?
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Repère SVG cliquable */}
        <div
          className="relative w-full max-w-[300px] aspect-square bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden cursor-crosshair mx-auto"
          onClick={handleSVGClick}
          role="img"
          aria-label="Repère graphique — cliquez pour placer un point"
        >
          <svg viewBox="0 0 300 300" className="w-full h-full select-none">
            {Array.from({length:11}).map((_,i)=>{
              const pos = i*25+25;
              return (
                <React.Fragment key={i}>
                  <line x1={pos} y1={0} x2={pos} y2={300} stroke="#e2e8f0" strokeWidth="1"/>
                  <line x1={0} y1={pos} x2={300} y2={pos} stroke="#e2e8f0" strokeWidth="1"/>
                </React.Fragment>
              );
            })}
            <line x1="0" y1="150" x2="300" y2="150" stroke="#64748b" strokeWidth="2"/>
            <line x1="150" y1="0" x2="150" y2="300" stroke="#64748b" strokeWidth="2"/>
            <text x="282" y="140" className="font-mono text-[9px] fill-slate-500">x</text>
            <text x="155" y="13" className="font-mono text-[9px] fill-slate-500">y</text>
            {[-4,-3,-2,-1,1,2,3,4].map(n=>{
              const {svgX} = toSVG(n,0), {svgY} = toSVG(0,n);
              return (
                <React.Fragment key={n}>
                  <text x={svgX-3} y={163} className="font-mono text-[8px] fill-slate-400">{n}</text>
                  <text x={155} y={svgY+3} className="font-mono text-[8px] fill-slate-400">{n}</text>
                </React.Fragment>
              );
            })}
            <text x={135} y={165} className="font-mono text-[8px] fill-slate-500">0</text>

            {validated && (
              <line
                x1={toSVG(-5,-10).svgX} y1={toSVG(-5,-10).svgY}
                x2={toSVG(5,10).svgX} y2={toSVG(5,10).svgY}
                stroke="#3b82f6" strokeWidth="2" strokeDasharray="4"
                opacity="0.5"
              />
            )}

            {placed.map(({x,y})=>{
              const {svgX,svgY} = toSVG(x,y);
              const isTarget = TARGET_POINTS.some(tp=>tp.x===x&&tp.y===y);
              return (
                <circle key={`${x},${y}`} cx={svgX} cy={svgY} r="6"
                  fill={validated ? (isTarget ? '#10b981' : '#ef4444') : '#6366f1'}
                  stroke="white" strokeWidth="2"
                  style={{transition:'fill 0.3s'}}
                />
              );
            })}
          </svg>
        </div>

        <p className="text-xs text-slate-400 text-center">
          Cliquez sur le repère pour placer un point. Cliquez à nouveau sur la même abscisse pour corriger.
        </p>

        {!validated && placed.length >= 2 && (
          <button
            type="button"
            onClick={handleValidate}
            className="px-6 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-mono text-sm font-bold transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-sky-400 focus:outline-none"
          >
            Valider les points
          </button>
        )}

        {validated && correctCount >= 3 && (
          <FeedbackBox type="success">
            <strong>{correctCount}/4 points corrects !</strong> Vous savez placer des points sur un repère.
            La droite bleue pointillée montre la courbe attendue. (+75 XP)
          </FeedbackBox>
        )}
        {validated && correctCount < 3 && (
          <FeedbackBox type="error">
            <strong>{correctCount}/4 points corrects.</strong> Rappel : pour <MathText>$f(x)=2x$</MathText> et{' '}
            <MathText>$x=1$</MathText>, <MathText>{'$f(1)=2$'}</MathText>, donc le point est{' '}
            <MathText>{'$(1\\,;\\,2)$'}</MathText> sur le repère.
          </FeedbackBox>
        )}
      </section>

      {/* À retenir */}
      <KeyTakeaway color="sky">
        <li>
          • On lit les points du tableau de valeurs : <MathText>$(x, f(x))$</MathText>.
        </li>
        <li>
          • On place chaque point sur le repère avec ses coordonnées.
        </li>
        <li>
          • On relie ensuite les points avec une <strong>règle</strong> pour tracer la droite.
        </li>
        <li>
          • Deux points suffisent pour tracer une droite — mais on en place au moins 3 pour vérifier.
        </li>
      </KeyTakeaway>
    </ModuleLayout>
  );
}
