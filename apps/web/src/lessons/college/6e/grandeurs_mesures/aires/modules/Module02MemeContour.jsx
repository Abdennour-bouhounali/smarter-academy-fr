import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ShapeComposer from '../components/ShapeComposer';
import ContourConstant from '../components/ContourConstant';

/**
 * Module 2 — LABORATOIRE : l'aire ne se lit PAS sur le contour.
 *
 * Activity: déformer un rectangle en tirant son coin, avec un tour FIXÉ par
 *   construction (L = demi-tour − l), et regarder les deux nombres.
 * Mathematical objective: aire et périmètre sont deux grandeurs
 *   indépendantes — connaître l'une ne donne aucune information sur l'autre.
 * Student action: on attrape le coin du rectangle et on le tire ; longueur,
 *   largeur, surface et tour se recalculent à chaque pixel.
 * Mathematical state: UN entier `l` (la largeur) ; L = 12 − l, l'aire, le
 *   tour, le dessin et les cotes en dérivent tous.
 * Expected observation: le tour ne bouge JAMAIS (24 m à chaque instant),
 *   pendant que l'aire s'effondre de 36 m² à 11 m².
 * Misconception targeted: « même tour ⇒ même surface » et « plus grand tour
 *   ⇒ plus grande surface » — LA confusion aire/périmètre de 6e.
 * Controlled surprise: la prédiction porte sur ce que fera le tour ; la
 *   plupart des élèves annoncent qu'il grandira avec la figure. Il ne bouge
 *   pas d'un mètre.
 * Formalization: la règle (brique `aire-perimetre-independants`) n'arrive
 *   qu'après que l'élève a produit lui-même l'écart maximal.
 * Scaffolding: la déformation reste vivante après validation ; le carré et
 *   la lanière extrême sont tous deux atteignables (Début / Fin au clavier).
 *
 * L'ancienne version juxtaposait deux figures dessinées (un carré 3×3 et une
 * barre 1×5) sous un QCM : l'élève lisait deux images et cochait. Deux
 * figures ne prouvent qu'un cas ; la déformation continue en montre
 * l'infinité, et surtout elle est CAUSÉE par l'élève.
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
/* Les emplacements de DÉPART restent disponibles après le recollage : sans
   eux, l'atelier serait à sens unique et l'élève ne pourrait pas défaire son
   rectangle pour vérifier que l'aire n'a pas bougé. */
const SLOTS_ALL = [
  ...SLOTS,
  { id: 'slot-A0', r: 1, c: 0, w: 2, h: 2 },
  { id: 'slot-B0', r: 0, c: 2, w: 1, h: 2 },
];

/* Le demi-tour du terrain : L + l = 12, donc P = 24 m quoi qu'il arrive.
   Le carré (6 × 6 = 36 m²) et la lanière (1 × 11 = 11 m²) sont les deux
   extrêmes atteignables — un rapport de plus de trois pour un. */
const DEMI_TOUR = 12;
const DEPART = 6;      // on ouvre sur le carré : l'aire maximale
const AIRE_MAX = 36;
const AIRE_MIN = 11;

const VF_ROWS = [
  { id: 'decoupe', label: 'Si je découpe une figure et que je recolle les morceaux autrement, son aire change.', correct: 'Faux' },
  { id: 'contour', label: 'Une figure au contour plus long a toujours une aire plus grande.', correct: 'Faux' },
  { id: 'forme', label: 'Deux figures de formes très différentes peuvent avoir la même aire.', correct: 'Vrai' },
];
const VF_OPTIONS = ['Vrai', 'Faux'];

/**
 * Le laboratoire signature : la clôture est déjà achetée (24 m), le terrain
 * se déforme. L'élève doit atteindre les deux extrêmes pour valider — donc
 * PRODUIRE l'écart, pas le lire.
 */
function TerrainDeformable({ onExplored, done }) {
  const [l, setL] = useState(DEPART);
  const [seenMin, setSeenMin] = useState(false);
  const [seenMax, setSeenMax] = useState(false);
  const L = DEMI_TOUR - l;
  const aire = l * L;

  const change = (v) => {
    setL(v);
    // « Explorer », c'est avoir vu les deux bouts : la plus grande surface
    // possible ET la plus petite, à tour constant.
    const min = v * (DEMI_TOUR - v) <= 15;
    const max = v * (DEMI_TOUR - v) >= 35;
    if (min) setSeenMin(true);
    if (max) setSeenMax(true);
    if ((min && seenMax) || (max && seenMin)) onExplored?.();
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Le fermier a déjà acheté sa clôture : <strong>24 m</strong>, pas un mètre de plus. Il peut donner
        au terrain la forme qu'il veut, tant que la clôture en fait exactement le tour. Attrape le{' '}
        <strong className="text-rose-600">coin rouge</strong> et déforme le terrain.
      </p>
      <ContourConstant half={DEMI_TOUR} width={l} onChange={change} min={1} unit="m" />
      <p className="text-center text-xs text-slate-500">
        {L} m × {l} m — surface de <strong>{aire} m²</strong> pour un tour de <strong>24 m</strong>
      </p>
      <div className="flex justify-center gap-2 text-xs">
        <span className={`px-2 py-1 rounded-lg font-mono font-bold ${seenMax ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
          {seenMax ? '✓' : '○'} la plus grande surface
        </span>
        <span className={`px-2 py-1 rounded-lg font-mono font-bold ${seenMin ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
          {seenMin ? '✓' : '○'} la plus petite
        </span>
      </div>
      {done && (
        <Feedback tone="ok">
          Le tour n'a pas bougé d'un seul mètre : <strong>24 m</strong> du début à la fin. La surface, elle,
          est passée de <strong>{AIRE_MAX} m²</strong> (le carré) à <strong>{AIRE_MIN} m²</strong> (la lanière) —
          plus de trois fois moins, avec la même clôture. Le contour ne commande pas la surface.
        </Feedback>
      )}
    </div>
  );
}

function Recomposer({ react, solved, onSolved }) {
  const [positions, setPositions] = useState(solved ? TARGET_POS : INITIAL_POS);
  const [selected, setSelected] = useState(null);
  const done = solved || (positions.A.r === TARGET_POS.A.r && positions.A.c === TARGET_POS.A.c
    && positions.B.r === TARGET_POS.B.r && positions.B.c === TARGET_POS.B.c);

  // `pieceId` vient du glisser (la pièce lâchée) ou du chemin clic/clavier
  // (la pièce en main). Dans les deux cas, la pièce se DÉPLACE : ni sa forme
  // ni son nombre de carreaux ne change en route.
  const handleSlotDrop = (slotId, pieceId) => {
    if (!pieceId) return;
    const slot = SLOTS_ALL.find((s) => s.id === slotId);
    if (!slot) return;
    const next = { ...positions, [pieceId]: { r: slot.r, c: slot.c } };
    setPositions(next);
    const ok = next.A.r === TARGET_POS.A.r && next.A.c === TARGET_POS.A.c
      && next.B.r === TARGET_POS.B.r && next.B.c === TARGET_POS.B.c;
    if (ok && !done) {
      react(true);
      onSolved?.();
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Cette figure en escalier fait <strong>6 carreaux</strong>. <strong>Fais glisser</strong> ses deux
        morceaux dans les emplacements en pointillés pour en faire un rectangle.
      </p>
      {/* L'atelier reste MANIPULABLE après le recollage (règle projet du
          2026-09-06) : les emplacements de départ restent offerts, donc
          l'élève peut défaire son rectangle, refaire l'escalier, et
          constater que le compte de carreaux ne bouge jamais — ce qui EST
          la conservation de l'aire. */}
      <ShapeComposer
        pieces={PIECES}
        positions={positions}
        slots={SLOTS_ALL}
        onPieceTap={setSelected}
        onSlotTap={handleSlotDrop}
        gridRows={3}
        gridCols={9}
        showAreaBadges
      />
      {selected && (
        <p className="text-center text-xs text-slate-500">
          Pièce en main — lâche-la sur un emplacement en pointillés (ou active l'emplacement pour l'y poser).
        </p>
      )}
      {done && (
        <Feedback tone="ok">
          La figure a changé de forme… mais on n'a rien ajouté, rien enlevé : toujours <strong>4 + 2 = 6
          carreaux</strong>. Découper et recoller <strong>conserve l'aire</strong> — alors que son tour, lui,
          vient de raccourcir.
        </Feedback>
      )}
    </div>
  );
}

const PERIM_Q = {
  q: 'Le fermier hésite entre le terrain carré (6 m × 6 m) et le terrain-lanière (11 m × 1 m). Sa clôture de 24 m fait le tour des DEUX. Que peut-il en conclure ?',
  options: [
    'Les deux terrains ont la même surface, puisque la clôture est la même',
    'Connaître le tour ne suffit pas : les deux surfaces sont très différentes (36 m² et 11 m²)',
    'Le terrain-lanière a plus de surface, car il est plus long',
  ],
  correct: 1,
  explain:
    'Une même clôture de 24 m entoure aussi bien 36 m² que 11 m². Le périmètre ne dit RIEN de l’aire : ce sont deux grandeurs indépendantes, et il faut choisir laquelle la question demande.',
};

export default function Module02MemeContour() {
  const [deformDone, setDeformDone] = useState(false);
  const [pred, setPred] = useState(null);
  const [recomposeDone, setRecomposeDone] = useState(false);
  const [perimDone, setPerimDone] = useState(false);
  const [vfDone, setVfDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Même contour, même aire ?"
      moduleSubtitle="Déforme un terrain sans toucher à sa clôture — et regarde la surface fondre."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 02',
        title: 'Le grand piège des surfaces.',
        body: <p>Une clôture de 24 m, achetée. Et un terrain qu'on peut déformer autant qu'on veut. Combien de pelouse rentre dedans ?</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'La clôture est fixe — déforme le terrain',
          subtitle: 'Tire le coin rouge : les deux nombres réagissent tout de suite.',
          done: deformDone,
          content: (kit) => (
            <div className="space-y-4">
              <PredictionChips
                prompt="quand tu vas étirer le terrain en lanière, que fera la longueur de la clôture ?"
                options={[
                  { id: 'grandit', label: 'Elle grandira' },
                  { id: 'fixe', label: 'Elle ne changera pas' },
                  { id: 'baisse', label: 'Elle raccourcira' },
                ]}
                value={pred}
                onChange={setPred}
                disabled={deformDone}
              />
              <TerrainDeformable
                done={deformDone}
                onExplored={() => {
                  if (!deformDone) { kit.react?.(true); setDeformDone(true); }
                }}
              />
              {deformDone && (
                <Feedback tone="ok">
                  {pred === 'fixe'
                    ? 'Ta prédiction tenait : le tour est resté fixe. '
                    : pred
                      ? 'Ta prédiction annonçait un tour qui change ; le terrain te contredit : il n’a pas bougé. '
                      : ''}
                  Ce que tu viens de fabriquer toi-même, c'est une infinité de terrains de{' '}
                  <strong>même tour</strong> et de surfaces toutes différentes.
                </Feedback>
              )}
              {/* La règle arrive après que l'élève a PRODUIT l'écart, pas
                  après avoir lu deux dessins juxtaposés. */}
              {deformDone && (
                <KnowledgeBrick
                  id="aire-perimetre-independants"
                  variant="new"
                  lead="Une seule clôture, des surfaces qui vont de 36 m² à 11 m² : voilà ce que cela prouve."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Découpe et recolle',
          subtitle: 'Cette fois, c’est la surface qui ne bouge pas.',
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
          num: 3,
          title: 'Que peut-on conclure ?',
          done: perimDone,
          content: (
            <TapQuestion
              prompt={PERIM_Q.q}
              options={PERIM_Q.options}
              correct={PERIM_Q.correct}
              cols={1}
              explain={PERIM_Q.explain}
              requires={['aire', 'perimetre', 'aire-perimetre-independants']}
              solved={perimDone}
              onAnswered={() => setPerimDone(true)}
            />
          ),
        },
        {
          num: 4,
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
