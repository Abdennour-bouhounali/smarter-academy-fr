import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PolygonPerimeter from '../components/PolygonPerimeter';
import FormulaBuilder from '../components/FormulaBuilder';
import { squarePerimeter, formatDec, parseDec } from '../components/perimUtils';

/**
 * Module 3 — manipulation : les formules se CONSTRUISENT.
 *
 * D'abord voir les côtés égaux (couleurs par paires), puis assembler la
 * formule jeton par jeton — la formule est une découverte, pas une donnée.
 * FormulaBuilder est un affichage contrôlé : le module possède l'état des
 * emplacements et valide la séquence par ids de jetons.
 */
const RECT = { sideLengths: [6, 4, 6, 4], unit: 'm' };
const RECT_COLORS = ['#2563eb', '#f97316', '#2563eb', '#f97316'];

const EGAUX_Q = {
  q: 'En faisant le tour du rectangle, qu’as-tu remarqué sur ses côtés ?',
  options: [
    'Les quatre côtés sont tous différents',
    'Les côtés opposés sont égaux deux à deux : deux longueurs (L) et deux largeurs (l)',
  ],
  correct: 1,
  explain: 'Deux côtés bleus égaux (les longueurs L) et deux côtés orange égaux (les largeurs l) : cette régularité va permettre une formule.',
};

// Formule cible : P = 2 × ( L + l )
const RECT_TARGET = ['t2', 'tx', 'topen', 'tL', 'tplus', 'tl', 'tclose'];
const RECT_CHIPS = [
  { id: 't2', label: '2' },
  { id: 'tx', label: '×' },
  { id: 'topen', label: '(' },
  { id: 'tL', label: 'L' },
  { id: 'tplus', label: '+' },
  { id: 'tl', label: 'l' },
  { id: 'tclose', label: ')' },
  { id: 'd4', label: '4' },
  { id: 'dminus', label: '−' },
];

// Formule cible carré : P = 4 × c
const SQ_TARGET = ['s4', 'sx', 'sc'];
const SQ_CHIPS = [
  { id: 's4', label: '4' },
  { id: 'sx', label: '×' },
  { id: 'sc', label: 'c' },
  { id: 's2', label: '2' },
  { id: 'splus', label: '+' },
];

function FormulaRound({ react, targetIds, chipDefs, prefix, hint, successText, solved, onSolved }) {
  const [slots, setSlots] = useState(
    targetIds.map((_, i) => ({ id: `slot-${i}`, placedChipId: solved ? targetIds[i] : null }))
  );
  const [checkedWrong, setCheckedWrong] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const filled = slots.every((s) => s.placedChipId);
  const isCorrect = filled && slots.every((s, i) => s.placedChipId === targetIds[i]);
  const done = solved || isCorrect || revealed;

  /** Sortie de secours : après 2 essais, montrer la formule sans bloquer. */
  const showSolution = () => {
    setSlots(targetIds.map((_, i) => ({ id: `slot-${i}`, placedChipId: targetIds[i] })));
    setRevealed(true);
    react(false);
    onSolved?.();
  };

  const usedIds = new Set(slots.map((s) => s.placedChipId).filter(Boolean));
  const chips = chipDefs.map((c) => ({ ...c, used: usedIds.has(c.id) }));

  const placeChip = (chipId) => {
    if (done) return;
    setCheckedWrong(false);
    // On calcule le prochain état HORS de l'updater : appeler react/onSolved
    // depuis l'intérieur d'un updater setState déclenche un setState pendant
    // le rendu d'un autre composant (avertissement React).
    const idx = slots.findIndex((s) => !s.placedChipId);
    if (idx === -1) return;
    const next = slots.map((s, i) => (i === idx ? { ...s, placedChipId: chipId } : s));
    setSlots(next);
    // Vérification au remplissage du dernier emplacement : révélation,
    // jamais de blocage — les jetons restent retirables.
    if (next.every((s) => s.placedChipId)) {
      const ok = next.every((s, i) => s.placedChipId === targetIds[i]);
      react(ok);
      if (ok) onSolved?.();
      else {
        setCheckedWrong(true);
        setAttempts((a) => a + 1);
      }
    }
  };

  const clearSlot = (slotId) => {
    if (done) return;
    setCheckedWrong(false);
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, placedChipId: null } : s)));
  };

  return (
    <div className="space-y-3">
      <FormulaBuilder
        slots={slots}
        chips={chips}
        onChipTap={placeChip}
        onSlotTap={clearSlot}
        prefix={prefix}
        disabled={done}
      />
      {done && <Feedback tone={revealed ? 'info' : 'ok'}>{successText}</Feedback>}
      {checkedWrong && !done && (
        <Feedback tone="hint">
          {hint} Touche un jeton placé pour le retirer et essayer une autre construction.
        </Feedback>
      )}
      {checkedWrong && !done && attempts >= 2 && (
        <div className="text-center">
          <button
            type="button"
            onClick={showSolution}
            className="text-xs text-slate-500 underline hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded"
          >
            Je ne trouve pas — montre-moi la formule
          </button>
        </div>
      )}
    </div>
  );
}

export default function Module03Formules() {
  const [traceDone, setTraceDone] = useState(false);
  const [egauxDone, setEgauxDone] = useState(false);
  const [rectFormulaDone, setRectFormulaDone] = useState(false);
  const [sqFormulaDone, setSqFormulaDone] = useState(false);
  const [calcDone, setCalcDone] = useState(false);

  const [tapped, setTapped] = useState([]);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Les formules du carré et du rectangle"
      moduleSubtitle="Des côtés égaux ? Alors une formule peut faire le travail."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 03',
        title: 'Certains enclos cachent une régularité.',
        body: <p>Quand des côtés sont égaux, plus besoin de tout additionner un par un : construis toi-même le raccourci.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Observe les côtés du rectangle',
          done: traceDone && egauxDone,
          content: (kit) => (
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-sm text-slate-600">Fais le tour du rectangle : les couleurs vont te montrer quelque chose.</p>
                <PolygonPerimeter
                  shape="rectangle"
                  sideLengths={RECT.sideLengths}
                  unit={RECT.unit}
                  sideColors={RECT_COLORS}
                  tappedIndices={tapped}
                  onTapSide={(i) => {
                    if (traceDone || tapped.includes(i)) return;
                    const next = [...tapped, i];
                    setTapped(next);
                    if (next.length === 4) {
                      kit.react(true);
                      setTraceDone(true);
                    }
                  }}
                  disabled={traceDone}
                  showRunningTotal
                />
              </div>
              {traceDone && (
                <TapQuestion
                  prompt={EGAUX_Q.q}
                  options={EGAUX_Q.options}
                  correct={EGAUX_Q.correct}
                  cols={1}
                  explain={EGAUX_Q.explain}
                  requires={['perimetre', 'tour-complet']}
                  solved={egauxDone}
                  onAnswered={() => setEgauxDone(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Construis la formule du rectangle',
          done: rectFormulaDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                6 + 4 + 6 + 4… ou bien : deux fois (une longueur + une largeur). Assemble cette deuxième écriture
                avec les jetons.
              </p>
              <FormulaRound
                react={kit.react}
                targetIds={RECT_TARGET}
                chipDefs={RECT_CHIPS}
                prefix="P ="
                hint="On compte UNE longueur plus UNE largeur… puis on double, car chaque côté a son jumeau."
                successText={
                  <>
                    <strong>P = 2 × (L + l)</strong> — la même chose que L + l + L + l, mais sans risque d'oublier
                    un côté. Ici : 2 × (6 + 4) = 20 m.
                  </>
                }
                solved={rectFormulaDone}
                onSolved={() => setRectFormulaDone(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Et pour le carré ?',
          done: sqFormulaDone,
          content: (kit) => (
            <div className="space-y-3">
              <PolygonPerimeter
                shape="square"
                sideLengths={[7, 7, 7, 7]}
                unit="m"
                sideColors={['#7c3aed', '#7c3aed', '#7c3aed', '#7c3aed']}
                tappedIndices={[]}
                disabled
              />
              <p className="text-sm text-slate-600">
                Quatre côtés, TOUS égaux (une seule couleur !). Assemble la formule la plus courte possible.
              </p>
              <FormulaRound
                react={kit.react}
                targetIds={SQ_TARGET}
                chipDefs={SQ_CHIPS}
                prefix="P ="
                hint="Quatre côtés identiques de longueur c : combien de fois c ?"
                successText={
                  <>
                    <strong>P = 4 × c</strong> — le carré est un rectangle si régulier que sa formule tient en
                    trois jetons.
                  </>
                }
                solved={sqFormulaDone}
                onSolved={() => setSqFormulaDone(true)}
              />
              {/* Les deux formules viennent d'être assemblées à la main :
                  la brique les fixe, elle ne les révèle pas. */}
              {sqFormulaDone && (
                <KnowledgeBrick
                  id="formules-polygones"
                  variant="new"
                  lead="Tu as construit les deux raccourcis toi-même. Les voici côte à côte, pour ta carte."
                />
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'La formule au travail',
          done: calcDone,
          content: (
            <NumericQuestion
              prompt="Un carré de côté c = 7,5 cm : quel est son périmètre ?"
              suffix="cm"
              expected={squarePerimeter(7.5)}
              parse={parseDec}
              display={formatDec(squarePerimeter(7.5))}
              explain={<>P = 4 × c = 4 × 7,5 = <strong>{formatDec(squarePerimeter(7.5))} cm</strong>.</>}
              explainFor={(n) =>
                n === 15
                  ? 'Tu as fait 2 × 7,5 : ça ne compte que deux côtés. Un carré en a quatre.'
                  : 'Applique P = 4 × c avec c = 7,5 cm.'
              }
              requires={['perimetre', 'formules-polygones']}
              solved={calcDone}
              onAnswered={() => setCalcDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Ces formules supposent des côtés droits. Le module suivant
          s'attaque à une figure qui n'en a aucun : le cercle.
        </KnowledgeSnapshot>
      }
    />
  );
}
