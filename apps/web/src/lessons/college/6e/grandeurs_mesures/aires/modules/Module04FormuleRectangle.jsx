import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AreaGrid from '../components/AreaGrid';
import { rectangleArea, squareArea, parseDec, formatDec } from '../components/areaUtils';

/**
 * Module 4 — manipulation : la formule L × l apparaît sous les doigts.
 *
 * L'élève colorie le rectangle LIGNE PAR LIGNE : 7, 14, 21, 28… la
 * multiplication se voit avant d'être nommée. Puis la formule s'applique
 * (décimaux → parseDec/formatDec), et la décomposition en L traite les
 * figures composées.
 */
const RECT = { rows: 4, cols: 7 };

const DECOMP_Q = {
  q: 'La salle en L peut se découper en deux rectangles : un 5 m × 3 m et un 2 m × 2 m. Quelle est son aire totale ?',
  options: ['15 m²', '19 m²', '21 m²'],
  correct: 1,
  explain: '5 × 3 = 15 m² et 2 × 2 = 4 m² : au total 15 + 4 = 19 m². Décomposer en rectangles, calculer chaque aire, additionner.',
};

const SOUSTRACTION_Q = {
  q: 'Pour peindre un mur de 4 m × 3 m percé d’une fenêtre de 2 m × 1 m, quelle est la surface à peindre ?',
  options: [
    '12 m² : on peint tout, la fenêtre ne compte pas',
    '10 m² : l’aire du mur MOINS l’aire de la fenêtre',
    '2 m² : seulement la fenêtre',
  ],
  correct: 1,
  explain: 'Aire du mur : 4 × 3 = 12 m². Aire de la fenêtre : 2 × 1 = 2 m². À peindre : 12 − 2 = 10 m². On peut aussi RETRANCHER une aire.',
};

function LigneParLigne({ react, solved, onSolved }) {
  const [rowsPainted, setRowsPainted] = useState(solved ? RECT.rows : 0);
  const done = solved || rowsPainted === RECT.rows;
  const cells = Array.from({ length: rowsPainted * RECT.cols }, (_, i) => i);

  const paintRow = () => {
    if (done) return;
    const next = rowsPainted + 1;
    setRowsPainted(next);
    if (next === RECT.rows) {
      react(true);
      onSolved?.();
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Le potager fait {RECT.rows} lignes de {RECT.cols} carreaux. Colorie-le ligne par ligne et regarde le
        compte grandir.
      </p>
      <AreaGrid
        rows={RECT.rows}
        cols={RECT.cols}
        cells={cells}
        unit="m²"
        showRowColHints
        tone="violet"
        ariaLabel="Potager à colorier ligne par ligne"
      />
      <div className="text-center space-y-2">
        <div className="font-mono text-lg text-slate-800">
          {rowsPainted > 0 ? (
            <>
              {Array.from({ length: rowsPainted }, () => RECT.cols).join(' + ')} ={' '}
              <strong>{rowsPainted * RECT.cols}</strong> carreaux
              {rowsPainted > 1 && <span className="text-violet-600"> = {rowsPainted} × {RECT.cols}</span>}
            </>
          ) : (
            <span className="text-slate-400">0 carreau</span>
          )}
        </div>
        {!done && (
          <button
            type="button"
            onClick={paintRow}
            className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            Colorier une ligne ({rowsPainted + 1}/{RECT.rows})
          </button>
        )}
      </div>
      {done && (
        <Feedback tone="ok">
          {RECT.rows} lignes de {RECT.cols} carreaux : {RECT.rows} × {RECT.cols} ={' '}
          <strong>{RECT.rows * RECT.cols} carreaux</strong>. Compter ligne par ligne, c'est MULTIPLIER — l'aire du
          rectangle est <strong>A = L × l</strong>.
        </Feedback>
      )}
    </div>
  );
}

export default function Module04FormuleRectangle() {
  const [lignesDone, setLignesDone] = useState(false);
  const [rectCalcDone, setRectCalcDone] = useState(false);
  const [carreCalcDone, setCarreCalcDone] = useState(false);
  const [decompDone, setDecompDone] = useState(false);
  const [soustractionDone, setSoustractionDone] = useState(false);

  const RECT_A = rectangleArea(6, 3.5); // 21
  const CARRE_A = squareArea(5); // 25

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="La formule du rectangle"
      moduleSubtitle="Colorier ligne par ligne… et voir apparaître L × l."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 04',
        title: 'Compter 28 carreaux un par un ? Il y a plus malin.',
        body: <p>Les lignes du quadrillage cachent une multiplication. Fais-la apparaître, puis mets-la au travail.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Ligne par ligne',
          done: lignesDone,
          content: (kit) => (
            <div className="space-y-5">
              <LigneParLigne react={kit.react} solved={lignesDone} onSolved={() => setLignesDone(true)} />
              {/* La multiplication s'est écrite toute seule pendant le
                  coloriage : la formule ne fait que la fixer. */}
              {lignesDone && (
                <KnowledgeBrick
                  id="aire-rectangle"
                  variant="new"
                  lead="Tu as compté 7, 14, 21, 28 : ces additions répétées ont un nom plus court."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'La formule au travail',
          done: rectCalcDone && carreCalcDone,
          content: (
            <div className="space-y-6">
              <NumericQuestion
                prompt="Un tapis rectangulaire de 6 m sur 3,5 m : quelle est son aire ?"
                suffix="m²"
                expected={RECT_A}
                parse={parseDec}
                display={formatDec(RECT_A)}
                explain={<>A = L × l = 6 × 3,5 = <strong>{formatDec(RECT_A)} m²</strong>.</>}
                explainFor={(n) =>
                  n === 19
                    ? 'Tu as calculé 2 × (6 + 3,5) = 19 : c’est le PÉRIMÈTRE (le tour), pas l’aire. L’aire se calcule en multipliant : L × l.'
                    : 'Applique A = L × l : multiplie 6 par 3,5.'
                }
                requires={['aire', 'aire-rectangle', 'perimetre']}
                solved={rectCalcDone}
                onAnswered={() => setRectCalcDone(true)}
              />
              {rectCalcDone && (
                <div className="border-t border-slate-100 pt-4">
                  <NumericQuestion
                    prompt="Une dalle carrée de 5 m de côté : quelle est son aire ?"
                    suffix="m²"
                    expected={CARRE_A}
                    parse={parseDec}
                    display={formatDec(CARRE_A)}
                    explain={<>A = c × c = 5 × 5 = <strong>{CARRE_A} m²</strong> — le carré est un rectangle dont L = l.</>}
                    explainFor={(n) =>
                      n === 20
                        ? '20, c’est 4 × 5 : le périmètre du carré. Son aire vaut c × c = 5 × 5.'
                        : 'Le carré est un rectangle particulier : A = c × c.'
                    }
                    requires={['aire', 'aire-rectangle', 'perimetre']}
                    solved={carreCalcDone}
                    onAnswered={() => setCarreCalcDone(true)}
                  />
                </div>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Découper pour calculer',
          done: decompDone,
          content: (
            <div className="space-y-5">
              <TapQuestion
                prompt={DECOMP_Q.q}
                options={DECOMP_Q.options}
                correct={DECOMP_Q.correct}
                cols={3}
                explain={DECOMP_Q.explain}
                requires={['aire', 'aire-rectangle', 'aire-conservee']}
                solved={decompDone}
                onAnswered={() => setDecompDone(true)}
              />
              {/* Découper puis additionner vient d'être fait sur la salle
                  en L : la méthode est posée avant la question qui, elle,
                  demande de RETRANCHER. */}
              {decompDone && (
                <KnowledgeBrick
                  id="aire-composee"
                  variant="new"
                  lead="Ce découpage marche aussi dans l’autre sens : on peut enlever un morceau au lieu d’en ajouter un."
                />
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Retrancher une aire',
          done: soustractionDone,
          content: (
            <TapQuestion
              prompt={SOUSTRACTION_Q.q}
              options={SOUSTRACTION_Q.options}
              correct={SOUSTRACTION_Q.correct}
              cols={1}
              explain={SOUSTRACTION_Q.explain}
              requires={['aire', 'aire-rectangle', 'aire-composee']}
              solved={soustractionDone}
              onAnswered={() => setSoustractionDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> Tu sais calculer une aire. Reste à la convertir — et là,
          une surprise t'attend : les marches ne valent pas ×10.
        </KnowledgeSnapshot>
      }
    />
  );
}
