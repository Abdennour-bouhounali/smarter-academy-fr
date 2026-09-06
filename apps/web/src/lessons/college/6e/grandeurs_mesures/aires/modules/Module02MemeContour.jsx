import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ShapeComposer from '../components/ShapeComposer';
import AreaGrid from '../components/AreaGrid';

/**
 * Module 2 — découverte : l'aire ne se lit PAS sur le contour.
 *
 * Deux découvertes par le geste :
 *  1. Découper/recoller conserve l'aire (ShapeComposer : la figure en S
 *     devient un rectangle, toujours 6 carreaux).
 *  2. Même périmètre n'implique pas même aire (3×3 vs 1×5, tous deux de
 *     tour 12 unités).
 */
// Figure en S (6 carreaux) : pièce A (2×2) + pièce B (2×1 verticale).
const PIECES = [
  { id: 'A', cells: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }], color: 'rose' },
  { id: 'B', cells: [{ r: 0, c: 0 }, { r: 1, c: 0 }], color: 'sky' },
];
const INITIAL_POS = { A: { r: 1, c: 0 }, B: { r: 0, c: 2 } };
const SLOTS = [
  { id: 'slot-A', r: 0, c: 5, w: 2, h: 2 },
  { id: 'slot-B', r: 0, c: 7, w: 1, h: 2 },
];
const TARGET_POS = { A: { r: 0, c: 5 }, B: { r: 0, c: 7 } };

const VF_ROWS = [
  { id: 'decoupe', label: 'Si je découpe une figure et que je recolle les morceaux autrement, son aire change.', correct: 'Faux' },
  { id: 'contour', label: 'Une figure au contour plus long a toujours une aire plus grande.', correct: 'Faux' },
  { id: 'forme', label: 'Deux figures de formes très différentes peuvent avoir la même aire.', correct: 'Vrai' },
];
const VF_OPTIONS = ['Vrai', 'Faux'];

function Recomposer({ react, solved, onSolved }) {
  const [positions, setPositions] = useState(solved ? TARGET_POS : INITIAL_POS);
  const [selected, setSelected] = useState(null);
  const done = solved || (positions.A.r === TARGET_POS.A.r && positions.A.c === TARGET_POS.A.c
    && positions.B.r === TARGET_POS.B.r && positions.B.c === TARGET_POS.B.c);

  const handleSlotTap = (slotId) => {
    if (done || !selected) return;
    const slot = SLOTS.find((s) => s.id === slotId);
    const next = { ...positions, [selected]: { r: slot.r, c: slot.c } };
    setPositions(next);
    setSelected(null);
    const ok = next.A.r === TARGET_POS.A.r && next.A.c === TARGET_POS.A.c
      && next.B.r === TARGET_POS.B.r && next.B.c === TARGET_POS.B.c;
    if (ok) {
      react(true);
      onSolved?.();
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Cette figure en escalier fait <strong>6 carreaux</strong>. Déplace ses deux morceaux (tape un morceau,
        puis tape un emplacement en pointillés) pour en faire un rectangle.
      </p>
      <ShapeComposer
        pieces={PIECES}
        positions={positions}
        slots={done ? null : SLOTS}
        selectedPieceId={selected}
        onPieceTap={(id) => !done && setSelected((s) => (s === id ? null : id))}
        onSlotTap={handleSlotTap}
        gridRows={3}
        gridCols={9}
        showAreaBadges
        disabled={done}
      />
      {selected && !done && (
        <p className="text-center text-xs text-slate-500">Pièce sélectionnée — tape maintenant un emplacement en pointillés.</p>
      )}
      {done && (
        <Feedback tone="ok">
          La figure a changé de forme… mais on n'a rien ajouté, rien enlevé : toujours <strong>4 + 2 = 6
          carreaux</strong>. Découper et recoller <strong>conserve l'aire</strong>.
        </Feedback>
      )}
    </div>
  );
}

const PERIM_Q = {
  q: 'Ces deux figures ont le MÊME périmètre (12 unités de tour chacune). Ont-elles la même aire ?',
  options: [
    'Oui : même tour, donc même surface',
    'Non : 9 carreaux pour le carré, 5 pour la barre — même périmètre, aires différentes',
  ],
  correct: 1,
  explain:
    'Les deux contours mesurent 12 unités, mais le carré 3×3 contient 9 carreaux quand la barre 1×5 n’en contient que 5. Le périmètre ne dit RIEN de l’aire : ce sont deux grandeurs indépendantes.',
};

export default function Module02MemeContour() {
  const [recomposeDone, setRecomposeDone] = useState(false);
  const [perimDone, setPerimDone] = useState(false);
  const [vfDone, setVfDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Même contour, même aire ?"
      moduleSubtitle="Découpe, recolle, compare : l’aire ne se devine pas au contour."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 02',
        title: 'Le grand piège des surfaces.',
        body: <p>Deux expériences pour démonter l'illusion la plus répandue : croire qu'on peut juger une aire à sa forme ou à son tour.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Découpe et recolle',
          done: recomposeDone,
          content: (kit) => (
            <div className="space-y-5">
              <Recomposer react={kit.react} solved={recomposeDone} onSolved={() => setRecomposeDone(true)} />
              {/* La figure vient de changer de forme sous les doigts sans
                  perdre un carreau : c'est l'instant où la conservation de
                  l'aire est une observation, pas une affirmation. */}
              {recomposeDone && (
                <KnowledgeBrick
                  id="aire-conservee"
                  variant="new"
                  lead="Tu n’as rien ajouté, rien enlevé — seulement déplacé. Voilà ce que cela garantit."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Même périmètre… même aire ?',
          done: perimDone,
          content: (
            <div className="space-y-5">
            <TapQuestion
              above={
                <div className="grid grid-cols-2 gap-6" aria-hidden="true">
                  <div className="space-y-1">
                    <AreaGrid rows={3} cols={3} cells={[0, 1, 2, 3, 4, 5, 6, 7, 8]} unit="carreau" tone="emerald" ariaLabel="Carré 3 sur 3" />
                    <p className="text-center text-xs text-slate-500">Carré 3 × 3 — tour : 12 unités</p>
                  </div>
                  <div className="space-y-1">
                    <AreaGrid rows={1} cols={5} cells={[0, 1, 2, 3, 4]} unit="carreau" tone="sky" ariaLabel="Barre 1 sur 5" />
                    <p className="text-center text-xs text-slate-500">Barre 1 × 5 — tour : 12 unités</p>
                  </div>
                </div>
              }
              prompt={PERIM_Q.q}
              options={PERIM_Q.options}
              correct={PERIM_Q.correct}
              cols={1}
              explain={PERIM_Q.explain}
              requires={['aire', 'perimetre']}
              solved={perimDone}
              onAnswered={() => setPerimDone(true)}
            />
            {/* Le contre-exemple vient d'être constaté sur deux figures
                concrètes : la règle peut maintenant être posée. */}
            {perimDone && (
              <KnowledgeBrick
                id="aire-perimetre-independants"
                variant="new"
                lead="Deux tours identiques, deux comptes de carreaux différents : la conclusion se généralise."
              />
            )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Vrai ou faux ?',
          done: vfDone,
          content: (
            <BatchChoiceQuestion
              requires={['aire', 'perimetre', 'aire-conservee', 'aire-perimetre-independants']}
              intro={<p className="text-sm text-slate-600">Trois affirmations à trancher, avec ce que tu viens de voir.</p>}
              rows={VF_ROWS.map((it) => ({
                id: it.id,
                label: <span className="text-sm">{it.label}</span>,
                options: VF_OPTIONS,
                correct: VF_OPTIONS.indexOf(it.correct),
                correction: <>→ {it.correct}</>,
              }))}
              solved={vfDone}
              onAnswered={() => setVfDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Découper-recoller conserve l'aire ; le contour ne dit rien de la surface ; et deux formes très
                  différentes peuvent recouvrir exactement autant.
                </Feedback>
              )}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> Comparer, c'est fait. Reste à mettre un nombre exact sur une
          surface : c'est l'atelier de pavage du module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
