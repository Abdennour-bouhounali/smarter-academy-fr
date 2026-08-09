import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import SectionHeader from '../../../../../common/components/SectionHeader';
import FeedbackBox from '../../../../../common/components/FeedbackBox';
import KeyTakeaway from '../../../../../common/components/KeyTakeaway';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

const TARGET_FN = (x) => 2 * x + 1;
const X_VALUES = [-2, -1, 0, 1, 2];

export default function Module03TableauValeurs() {
  const { xp, awardXP, markModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const { prevLink, nextLink } = getNavLinks(3);

  const [answers, setAnswers] = useState(Array(X_VALUES.length).fill(''));
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState([]);

  const handleChange = (i, val) => {
    const next = [...answers];
    next[i] = val;
    setAnswers(next);
  };

  const handleCheck = () => {
    const res = X_VALUES.map((x, i) => {
      const parsed = parseFloat(answers[i]);
      return !isNaN(parsed) && parsed === TARGET_FN(x);
    });
    setChecked(true);
    setResults(res);
    const correct = res.filter(Boolean).length;
    if (correct >= 4) awardXP({ moduleId: 'L03', exerciseId: 'L03-tableau', amount: 50 });
    else if (correct >= 2) awardXP({ moduleId: 'L03', exerciseId: 'L03-tableau', amount: 25 });
  };

  const allCorrect = results.length > 0 && results.every(Boolean);
  const handleNext = () => markModuleCompleted('L03');

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      chapterTitle={MODULE_CTX.chapterTitle}
      levelLabel="Collège"
      gradeLabel="3ème"
      moduleNumber={3}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="Tableau de Valeurs"
      moduleSubtitle="Construire et compléter un tableau de valeurs — l'outil qui relie algèbre et graphique."
      estimatedTime="7 min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={handleNext}
    >
      {/* Section 1 : Explication */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <SectionHeader number={1} title="Qu'est-ce qu'un tableau de valeurs ?" color="violet" />

        <p className="text-slate-700 leading-relaxed">
          Un tableau de valeurs présente, pour une liste de valeurs de <MathText>$x$</MathText> choisies,
          les valeurs correspondantes de <MathText>$f(x)$</MathText>. C'est un outil essentiel pour
          comprendre le comportement d'une fonction et préparer son tracé graphique.
        </p>

        {/* Exemple résolu */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <p className="font-bold text-slate-800 mb-3">
            Exemple : <MathText>$f(x) = x + 3$</MathText>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-center font-mono text-sm border-collapse">
              <tbody>
                <tr className="bg-indigo-100 text-indigo-900 font-bold">
                  <td className="border border-indigo-200 p-2 text-left pl-3"><MathText>$x$</MathText></td>
                  {[-2, -1, 0, 1, 2].map(x => (
                    <td key={x} className="border border-indigo-200 p-2">{x}</td>
                  ))}
                </tr>
                <tr className="bg-emerald-50 text-emerald-800">
                  <td className="border border-emerald-200 p-2 text-left pl-3 font-bold"><MathText>$f(x)$</MathText></td>
                  {[-2, -1, 0, 1, 2].map(x => (
                    <td key={x} className="border border-emerald-200 p-2 font-bold">{x + 3}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Pour chaque valeur de <MathText>$x$</MathText>, on calcule <MathText>$f(x) = x + 3$</MathText> en
            remplaçant <MathText>$x$</MathText>.
          </p>
        </div>
      </section>

      {/* Section 2 : Tableau interactif */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SectionHeader number={2} title="À vous de compléter !" color="emerald" />

        <p className="text-sm text-slate-700">
          Complétez le tableau de valeurs pour <MathText>$g(x) = 2x + 1$</MathText>.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-center font-mono text-sm border-collapse">
            <tbody>
              <tr className="bg-indigo-100 text-indigo-900 font-bold">
                <td className="border border-indigo-200 p-2 text-left pl-3"><MathText>$x$</MathText></td>
                {X_VALUES.map(x => (
                  <td key={x} className="border border-indigo-200 p-2">{x}</td>
                ))}
              </tr>
              <tr className="bg-slate-50">
                <td className="border border-slate-200 p-2 text-left pl-3 font-bold text-emerald-700"><MathText>$g(x)$</MathText></td>
                {X_VALUES.map((x, i) => (
                  <td key={x} className="border border-slate-200 p-1">
                    <input
                      type="number"
                      value={answers[i]}
                      onChange={(e) => handleChange(i, e.target.value)}
                      disabled={checked && results[i]}
                      aria-label={`Valeur de g(${x})`}
                      className={`w-14 text-center font-mono font-bold py-1 px-1 rounded-lg border text-sm transition-colors
                        ${checked
                          ? results[i]
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                            : 'bg-rose-100 border-rose-400 text-rose-800'
                          : 'border-slate-300 focus:border-blue-400 focus:outline-none'}`}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {!checked && (
          <button
            type="button"
            onClick={handleCheck}
            className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-sm font-bold transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-400 focus:outline-none"
          >
            Vérifier mes réponses
          </button>
        )}

        {checked && allCorrect && (
          <FeedbackBox type="success">
            <strong>Parfait !</strong> Toutes les cases sont correctes. Vous maîtrisez le tableau de valeurs. (+50 XP)
          </FeedbackBox>
        )}
        {checked && !allCorrect && (
          <FeedbackBox type="error">
            Certaines cases sont incorrectes. Rappel : pour chaque <MathText>$x$</MathText>,
            calculez <MathText>{'$2 \\times x + 1$'}</MathText>.<br />
            Valeurs attendues :{' '}
            {X_VALUES.map((x, i) => (
              <span key={x}>{i > 0 ? ' | ' : ''}<MathText>{`$g(${x}) = ${TARGET_FN(x)}$`}</MathText></span>
            ))}
          </FeedbackBox>
        )}
      </section>

      {/* Section 3 : À retenir */}
      <KeyTakeaway color="violet">
        <li>
          • Le tableau de valeurs liste des couples <MathText>$(x, f(x))$</MathText>.
        </li>
        <li>
          • Chaque colonne est un calcul d'image (vu au module 2).
        </li>
        <li>
          • On choisit des valeurs de <MathText>$x$</MathText> symétriques (ex : −2, −1, 0, 1, 2)
          pour avoir une vue équilibrée.
        </li>
        <li>
          • Ce tableau servira à <strong>placer des points sur un graphique</strong> au module suivant.
        </li>
      </KeyTakeaway>
    </ModuleLayout>
  );
}
