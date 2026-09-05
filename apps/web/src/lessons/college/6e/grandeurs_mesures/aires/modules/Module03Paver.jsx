import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid3x3 } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AreaGrid from '../components/AreaGrid';
import { parseDec, formatDec } from '../components/areaUtils';

/**
 * Module 3 — manipulation : mesurer une aire, c'est paver puis compter.
 *
 * L'élève recouvre la terrasse (figure sur quadrillage) carreau par
 * carreau — le compteur monte en direct. Puis les demi-carreaux
 * s'assemblent, et enfin le choix du carreau-unité adapté.
 */
// Terrasse en L sur un quadrillage 4×6 : 14 cellules.
const ROWS = 4;
const COLS = 6;
const TERRASSE = [0, 1, 2, 3, 6, 7, 8, 9, 12, 13, 18, 19, 14, 20];

const HALF_ROWS = 2;
const HALF_COLS = 3;
// Pignon du toit : rangée du bas entière, rangée du haut avec 2 demi-carreaux
// aux extrémités → 4 carreaux entiers + 2 demis.
const HALF_OUTLINE = [0, 1, 2, 3, 4, 5];
const HALF_CELLS = [{ index: 0, corner: 'br' }, { index: 2, corner: 'bl' }];

const HALF_Q = {
  q: 'Le pignon du toit couvre 4 carreaux entiers et 2 demi-carreaux. Quelle est son aire ?',
  options: ['4 carreaux', '5 carreaux', '6 carreaux'],
  correct: 1,
  explain: '2 demi-carreaux s’assemblent en 1 carreau entier : 4 + 1 = 5 carreaux. On peut recomposer des morceaux pour compter une aire.',
};

const UNIT_Q = {
  q: 'Pour mesurer la cour de récréation, quel carreau-unité est le plus adapté ?',
  options: [
    'Un carreau de 1 cm de côté (1 cm²)',
    'Un carreau de 1 m de côté (1 m²)',
    'Un carreau de 1 km de côté (1 km²)',
  ],
  correct: 1,
  explain:
    'Avec des cm², il faudrait des millions de carreaux ; avec des km², la cour n’en remplirait même pas un. Le m² donne un compte raisonnable : l’unité d’aire se choisit comme l’unité de longueur — selon la taille de ce qu’on mesure.',
};

function TerrassePaver({ react, solved, onSolved }) {
  const [cells, setCells] = useState(solved ? TERRASSE : []);
  const done = solved || cells.length === TERRASSE.length;

  const toggle = (i) => {
    if (done) return;
    setCells((prev) => {
      const next = prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i];
      return next;
    });
  };

  React.useEffect(() => {
    if (cells.length === TERRASSE.length && !solved) {
      react(true);
      onSolved?.();
    }
  }, [cells.length, solved, react, onSolved]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Le carreleur doit paver la terrasse (la zone claire). Tape chaque carreau pour la recouvrir entièrement —
        le compteur suit ton travail.
      </p>
      <AreaGrid
        rows={ROWS}
        cols={COLS}
        cells={cells}
        onToggle={toggle}
        outline={TERRASSE}
        unit="m²"
        disabled={done}
        tone="emerald"
        ariaLabel="Terrasse à paver"
      />
      <div className="text-center font-mono text-lg text-slate-800">
        Carreaux posés : <strong>{cells.length}</strong> {done && <>→ aire = <strong>{TERRASSE.length} m²</strong></>}
      </div>
      {done && (
        <Feedback tone="ok">
          Terrasse entièrement pavée : <strong>{TERRASSE.length} carreaux de 1 m²</strong>, donc une aire de{' '}
          <strong>{TERRASSE.length} m²</strong>. Mesurer une aire = compter combien de fois l'unité de surface
          recouvre la figure.
        </Feedback>
      )}
    </div>
  );
}

export default function Module03Paver() {
  const [paverDone, setPaverDone] = useState(false);
  const [ecrireDone, setEcrireDone] = useState(false);
  const [halfDone, setHalfDone] = useState(false);
  const [unitDone, setUnitDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Paver pour mesurer"
      moduleSubtitle="Recouvrir de carreaux-unités et compter : mesurer une aire, c’est ça."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 03',
        title: 'Le carreleur a besoin d’un compte exact.',
        body: <p>Pas de formule aujourd'hui : uniquement le geste fondamental — recouvrir, compter, écrire l'aire avec son unité.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Pave la terrasse',
          done: paverDone,
          content: (kit) => (
            <TerrassePaver react={kit.react} solved={paverDone} onSolved={() => setPaverDone(true)} />
          ),
        },
        {
          num: 2,
          title: 'Écris l’aire',
          done: ecrireDone,
          content: (
            <NumericQuestion
              prompt="Le carreleur note l'aire de la terrasse sur son devis. Combien de m² ?"
              suffix="m²"
              expected={TERRASSE.length}
              parse={parseDec}
              display={formatDec(TERRASSE.length)}
              explain={<>{TERRASSE.length} carreaux de 1 m² → <strong>{TERRASSE.length} m²</strong>. L'aire s'écrit toujours avec une unité de SURFACE (m², cm²…), jamais en m.</>}
              explainFor={() => 'Reprends ton pavage : chaque carreau vaut 1 m², il suffit de les compter.'}
              solved={ecrireDone}
              onAnswered={() => setEcrireDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Les demi-carreaux',
          done: halfDone,
          content: (
            <TapQuestion
              above={
                <AreaGrid
                  rows={HALF_ROWS}
                  cols={HALF_COLS}
                  cells={HALF_OUTLINE}
                  outline={HALF_OUTLINE}
                  halfCells={HALF_CELLS}
                  unit="carreau"
                  tone="sky"
                  ariaLabel="Pignon du toit avec demi-carreaux"
                />
              }
              prompt={HALF_Q.q}
              options={HALF_Q.options}
              correct={HALF_Q.correct}
              cols={3}
              explain={HALF_Q.explain}
              solved={halfDone}
              onAnswered={() => setHalfDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Choisis ton carreau-unité',
          done: unitDone,
          content: (
            <TapQuestion
              prompt={UNIT_Q.q}
              options={UNIT_Q.options}
              correct={UNIT_Q.correct}
              cols={1}
              explain={UNIT_Q.explain}
              solved={unitDone}
              onAnswered={() => setUnitDone(true)}
            />
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <Grid3x3 className="w-6 h-6 mx-auto text-emerald-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Une aire se mesure en carreaux-unités : on recouvre, on compte (les demi-carreaux s'assemblent), et on
            écrit le résultat en m², cm²… selon la taille de la surface.
          </p>
        </motion.div>
      }
    />
  );
}
