import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { useDragDrop } from '../../../../../common/manip6e';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Tower, FactorSupply, DragGhost } from '../components/FactorTower';
import FactorLadder from '../components/FactorLadder';
import {
  makeTower, exponent, factorCount, addFactor, removeFactor,
  mergeInto, duplicate, expandedText, groupedText, simplifyPairs, packetCount,
} from '../components/factorTowerUtils';
import { formatDec, formatPower, parseDec, pow } from '../components/powerUtils';

/**
 * Module 3 — MANIPULATION SIGNATURE : « Empiler les tours ».
 *
 * Activity: construire deux tours de facteurs, les fusionner d'un geste, et
 *   COMPTER les facteurs obtenus avant que la moindre règle ne soit dite.
 * Mathematical objective: établir a^m × a^n = a^{m+n}, a^m ÷ a^n = a^{m−n} et
 *   (a^m)^k = a^{m×k} en lisant un compte de facteurs.
 * Student action: glisser un facteur « 3 » de la réserve sur une tour ; tirer
 *   la tour B sur la tour A pour les fusionner ; retirer les facteurs du
 *   sommet ; dupliquer une tour en paquets. Tout est doublé au clavier.
 * Controlled variable: la LISTE des facteurs de chaque tour.
 * Mathematical state: `{ base, factors[], below[] }` — l'exposant n'est jamais
 *   stocké, il est compté (`exponent`). L'écriture ne peut donc pas mentir
 *   sur le dessin.
 * Visual consequence: les blocs de B viennent se poser sur ceux de A et Y
 *   RESTENT DISTINCTS, avec leur couleur d'origine ; l'écriture intermédiaire
 *   (3×3)×(3×3×3) s'affiche, puis 3×3×3×3×3, puis seulement 3⁵.
 * Expected observation: 2 facteurs + 3 facteurs = 5 facteurs. Les exposants
 *   s'ajoutent parce que les FACTEURS se rassemblent ; la base ne bouge pas.
 * Misconception targeted: « 3² × 3³ = 9⁵ » (multiplier aussi les bases) et
 *   « 3² × 3³ = 3⁶ » (multiplier les exposants — c'est la règle de la
 *   RÉPÉTITION, rendue visuellement distincte à l'étape 3 par des paquets).
 * Feedback: le compte de facteurs est écrit sous chaque tour et cité vivant
 *   dans chaque message — jamais une valeur figée au moment de la validation.
 * Formalization: étape 4, les trois règles, APRÈS la question de
 *   discrimination — la découverte précède l'énoncé.
 * Scaffolding: réserve infinie (on ne peut pas se bloquer) ; après 3 réglages
 *   qui ÉLOIGNENT de la cible, « montre-moi » place les deux tours.
 * Transfer: la règle du quotient sert au module 6 pour les rapports d'échelle.
 */
const BASE = 3;
const TARGET_A = 2;
const TARGET_B = 3;

/* Étape 2 : 3⁵ ÷ 3² — assez de facteurs pour que la simplification se voie. */
const QUOTIENT_START = 5;
const QUOTIENT_REMOVE = 2;

/* Étape 3 : (3²)³ — trois paquets de deux, soit 6 facteurs ≠ 5. */
const PACKET_SIZE = 2;
const PACKET_COUNT = 3;

export default function Module03EmpilerLesTours() {
  /* ── Étape 1 — le produit ─────────────────────────────────────── */
  const [towerA, setTowerA] = useState(() => makeTower(BASE, 1, 'a'));
  const [towerB, setTowerB] = useState(() => makeTower(BASE, 1, 'b'));
  const [merged, setMerged] = useState(null);
  // Combien d'écritures de l'échelle sont atteintes (0 → 4).
  const [rungs, setRungs] = useState(0);
  const [counted, setCounted] = useState(false);
  const [misses, setMisses] = useState(0);
  const [revealed, setRevealed] = useState(false);

  /* ── Étape 2 — le quotient ────────────────────────────────────── */
  const [quotient, setQuotient] = useState(() => makeTower(BASE, QUOTIENT_START, 'a'));
  const removedCount = QUOTIENT_START - factorCount(quotient);
  const splitDone = removedCount >= QUOTIENT_REMOVE;

  /* ── Étape 3 — la puissance de puissance ──────────────────────── */
  const [packets, setPackets] = useState(() => [makeTower(BASE, PACKET_SIZE, 'p0')]);
  const repeated = packets.length >= PACKET_COUNT;

  /* ── Étape 4 — la règle, nommée après coup ────────────────────── */
  const [ruleDone, setRuleDone] = useState(false);

  const nA = factorCount(towerA);
  const nB = factorCount(towerB);
  const readyToMerge = nA === TARGET_A && nB === TARGET_B && !merged;
  const gap = Math.abs(TARGET_A - nA) + Math.abs(TARGET_B - nB);

  /* Le geste : prendre un facteur (ou la tour B entière) et le poser.
     `useDragDrop` porte le pointeur ET le clavier — aucune prop `disabled`,
     la manipulation reste vivante après la validation de l'étape. */
  const drag = useDragDrop({
    onDrop: (sourceId, zoneId) => {
      if (merged) return;
      if (sourceId === 'towerB' && zoneId === 'A') {
        // LE geste clé : verser B dans A. Les facteurs de B gardent leur
        // couleur, donc les deux groupes restent lisibles dans le résultat.
        const m = mergeInto(towerA, towerB);
        if (!m) return;
        setMerged(m);
        setRungs(2); // 3²×3³, puis (3×3)×(3×3×3) — pas plus : l'élève doit compter.
        return;
      }
      if (sourceId !== 'factor') return;
      if (zoneId === 'A') pushFactor(towerA, setTowerA, 'a', TARGET_A);
      if (zoneId === 'B') pushFactor(towerB, setTowerB, 'b', TARGET_B);
    },
    // Un refus ENSEIGNE : on ne verse pas une tour dans elle-même.
    accepts: (sourceId, zoneId) => !(sourceId === 'towerB' && zoneId === 'B'),
  });

  /**
   * Poser un facteur, et ne compter comme « raté » que le geste qui ÉLOIGNE
   * de la cible. L'ancienne version incrémentait aussi sur les réglages
   * corrects — et lisait un état périmé — si bien que « je ne trouve pas »
   * s'affichait en pleine réussite.
   *
   * Le calcul est fait ICI, hors de tout updater de setState : un updater
   * peut être rejoué deux fois en StrictMode, et le compteur doublerait.
   */
  const pushFactor = (tower, setTower, from, target) => {
    const next = addFactor(tower, from);
    if (Math.abs(target - factorCount(next)) > Math.abs(target - factorCount(tower))) {
      setMisses((m) => m + 1);
    }
    setTower(next);
  };

  const showMe = () => {
    setTowerA(makeTower(BASE, TARGET_A, 'a'));
    setTowerB(makeTower(BASE, TARGET_B, 'b'));
    setRevealed(true);
  };

  const mergedCount = merged ? factorCount(merged) : 0;

  /* Les quatre écritures. Toutes DÉRIVÉES de la tour fusionnée : aucune
     n'est recopiée à la main, donc aucune ne peut contredire le dessin. */
  const ladder = merged
    ? [
        {
          tex: `${formatPower(BASE, TARGET_A)} \\times ${formatPower(BASE, TARGET_B)}`,
          caption: 'Ce qu’on avait : deux tours.',
          tone: 'base',
        },
        {
          tex: groupedText(merged),
          caption: 'Ce que ça veut dire : les facteurs de chaque tour, écrits en entier.',
          tone: 'meaning',
        },
        {
          tex: expandedText(merged),
          caption: 'Une seule suite de facteurs — les parenthèses ne servaient qu’à se souvenir d’où ils venaient.',
          tone: 'flat',
        },
        {
          tex: `${formatPower(BASE, mergedCount)} = ${formatDec(pow(BASE, mergedCount))}`,
          caption: `L’écriture courte : ${formatDec(mergedCount)} facteurs ${BASE}.`,
          tone: 'short',
        },
      ]
    : [];

  /* Étape 2 — la simplification, montrée avant le résultat. */
  const { cancelled, remaining } = simplifyPairs(QUOTIENT_START, Math.min(removedCount, QUOTIENT_REMOVE));

  /* Étape 3 — le compte des paquets. */
  const pc = packetCount(packets);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Empiler les tours"
      moduleSubtitle="Deux tours de facteurs qui n’en font plus qu’une — et on compte."
      estimatedTime="11 min"
      brief={{
        tag: '🧱 Mission 03',
        title: 'Un bloc = un facteur. Compte-les, et les règles apparaissent.',
        body: (
          <p>
            Chaque bloc que tu poses est un facteur <strong>{BASE}</strong> — pas une valeur, pas un
            résultat. Construis une tour de <MathText>{`$${formatPower(BASE, TARGET_A)}$`}</MathText> et
            une de <MathText>{`$${formatPower(BASE, TARGET_B)}$`}</MathText>, fusionne-les, puis{' '}
            <strong>compte ce que tu obtiens</strong>.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Empile les facteurs, puis fusionne les deux tours',
          subtitle: 'Glisse un « 3 » sur une tour. Puis tire la tour B sur la tour A.',
          done: counted,
          content: (kit) => (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                La tour A doit contenir <strong>{formatDec(TARGET_A)} facteurs</strong>, la tour B{' '}
                <strong>{formatDec(TARGET_B)} facteurs</strong>. Chaque bloc est un{' '}
                <MathText>{`$${BASE}$`}</MathText> : le <MathText>{'$\\times$'}</MathText> est entre
                les blocs.
              </p>

              {!merged && <FactorSupply base={BASE} grabProps={drag.sourceProps('factor')} held={drag.held === 'factor'} />}
              <DragGhost base={BASE} ghost={drag.ghost} />

              {/* L'équation reste ENTIÈRE sous les yeux : A × B = C.
                  Remplacer A par le résultat effacerait la question — l'élève
                  ne pourrait plus comparer ce qu'il avait à ce qu'il obtient,
                  ni voir que les 2 blocs ambre et les 3 violets sont les
                  mêmes, simplement rassemblés.

                  Le tout est une GRILLE et non un `flex-wrap` : au retour à
                  la ligne, un flex laissait le « = » orphelin en fin de
                  première ligne, à côté de rien. Ici, sous 640 px, l'équation
                  se lit verticalement (A, ×, B, =, C) — chaque opérateur
                  reste collé aux deux tours qu'il relie. Le défilement
                  horizontal est proscrit. */}
              <div
                className="grid grid-cols-1 sm:grid-cols-[auto_auto_auto_auto_auto] gap-1 sm:gap-4 justify-items-center sm:items-end w-full"
                /* §16bis : la ligne réserve la hauteur de la plus haute tour
                   possible (5 facteurs), donc rien de ce qui suit ne bouge
                   quand les tours grandissent ou que C apparaît. */
                style={{ minHeight: 5 * 44 + 4 * 18 + 72 }}
              >
                <Tower
                  tower={towerA}
                  title="Tour A"
                  onRemoveTop={merged ? undefined : () => setTowerA((t) => removeFactor(t))}
                  dropProps={merged ? undefined : drag.zoneProps('A')}
                  onDropHere={!merged && drag.held === 'factor' ? () => drag.dropHere('A') : undefined}
                  dropLabel={`Poser le facteur ${BASE} sur la tour A`}
                  highlight={drag.hoverZone === 'A'}
                  frozen={!!merged}
                />
                <Operator sign="×" />
                <Tower
                  tower={towerB}
                  title="Tour B"
                  onRemoveTop={merged ? undefined : () => setTowerB((t) => removeFactor(t))}
                  dropProps={merged ? undefined : drag.zoneProps('B')}
                  onDropHere={!merged && drag.held === 'factor' ? () => drag.dropHere('B') : undefined}
                  dropLabel={`Poser le facteur ${BASE} sur la tour B`}
                  highlight={drag.hoverZone === 'B'}
                  grabWholeProps={readyToMerge ? drag.sourceProps('towerB') : undefined}
                  frozen={!!merged}
                />
                {/* §16bis, appliqué à l'HORIZONTALE : les colonnes du « = » et
                    de la tour C existent DÈS LE DÉPART, vides. Sans elles, la
                    grille ne compterait que trois colonnes et centrerait A et
                    B au milieu ; à l'apparition de C, tout glisserait vers la
                    gauche — l'élève verrait bouger ce qu'il vient de
                    construire au lieu de voir apparaître le résultat. */}
                {merged ? (
                  <>
                    <Operator sign="=" tone="emerald" />
                    <Tower tower={merged} title="Tour C — le résultat" frozen />
                  </>
                ) : (
                  <>
                    {/* Le fantôme est la VRAIE tour résultat, rendue invisible :
                        seule elle occupe exactement la largeur que C prendra.
                        Une cale de largeur devinée laissait la grille se
                        redistribuer de ~15 px à l'apparition de C. */}
                    <Operator sign="" />
                    <div aria-hidden="true" style={{ visibility: 'hidden' }}>
                      <Tower
                        tower={mergeInto(makeTower(BASE, TARGET_A, 'a'), makeTower(BASE, TARGET_B, 'b'))}
                        title="Tour C — le résultat"
                        frozen
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Pas de panneau « sans glisser » : le chemin sans souris est
                  DANS la figure. La réserve est un bouton — on l'active pour
                  prendre le facteur, puis on active une tour pour l'y poser
                  (`useDragDrop` gère les deux chemins) — et le bloc du sommet
                  de chaque tour est un bouton qui le retire. Quatre boutons
                  redondants sous la figure n'ajoutaient aucune capacité :
                  ils doublaient l'interface et détournaient du geste. */}

              {!merged && !readyToMerge && (
                <Feedback tone="info">
                  A contient <strong className="font-mono">{formatDec(nA)}</strong> facteur
                  {nA > 1 ? 's' : ''}, B en contient <strong className="font-mono">{formatDec(nB)}</strong>.
                  Il reste <strong className="font-mono">{formatDec(gap)}</strong> geste
                  {gap > 1 ? 's' : ''} pour atteindre {formatDec(TARGET_A)} et {formatDec(TARGET_B)}.
                </Feedback>
              )}
              {readyToMerge && (
                <>
                  <Feedback tone="ok">
                    Les deux tours sont prêtes. Maintenant <strong>tire la tour B sur la tour A</strong> —
                    attrape son bloc du haut et amène-le sur A.
                  </Feedback>
                  {/* Le geste reste le glissement ; ce bouton est son
                      équivalent sans souris, et il n'apparaît qu'au moment
                      où fusionner a un sens — donc jamais comme une étape
                      de plus à franchir. */}
                  <div className="flex justify-center">
                    <KeyButton
                      primary
                      onClick={() => {
                        const m = mergeInto(towerA, towerB);
                        if (m) { setMerged(m); setRungs(2); }
                      }}
                    >
                      Fusionner les tours
                    </KeyButton>
                  </div>
                </>
              )}
              {!merged && misses >= 3 && !revealed && (
                <button
                  type="button"
                  onClick={showMe}
                  className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Je ne trouve pas — montre-moi
                </button>
              )}

              {merged && (
                <div className="space-y-3">
                  <Feedback tone="ok">
                    Les {formatDec(nB)} facteurs de B se sont posés sur les {formatDec(nA)} de A —{' '}
                    <strong>et ils sont tous encore là</strong>. Compte-les sur la tour.
                  </Feedback>

                  <FactorLadder rungs={ladder} shown={rungs} />

                  {/* C'est la réponse de l'élève qui fait avancer, pas une
                      minuterie : il doit COMPTER pour que 3⁵ apparaisse. */}
                  {!counted && (
                    <NumericQuestion
                      prompt={
                        <>
                          Combien de facteurs <MathText>{`$${BASE}$`}</MathText> comptes-tu maintenant sur
                          la tour ?
                        </>
                      }
                      expected={mergedCount}
                      parse={parseDec}
                      display={formatDec(mergedCount)}
                      suffix="facteurs"
                      explain={`${formatDec(TARGET_A)} facteurs, puis ${formatDec(TARGET_B)} facteurs : ${formatDec(TARGET_A)} + ${formatDec(TARGET_B)} = ${formatDec(mergedCount)}.`}
                      explainFor={(v) =>
                        v === TARGET_A * TARGET_B
                          ? `Tu as multiplié ${formatDec(TARGET_A)} × ${formatDec(TARGET_B)}. Mais on n’a rien multiplié : on a MIS ENSEMBLE deux paquets de blocs. Compte-les un par un sur le dessin.`
                          : v === TARGET_A || v === TARGET_B
                          ? 'Tu n’as compté qu’une des deux tours. Les blocs des DEUX tours sont maintenant sur la même pile.'
                          : `Recompte les blocs de la tour un par un : il y en a ${formatDec(mergedCount)}.`
                      }
                      requires={['exposant-compte']}
                      solved={counted}
                      onAnswered={() => {
                        setCounted(true);
                        setRungs(4);
                        kit.react(true);
                      }}
                    />
                  )}

                  {counted && (
                    <Feedback tone="ok">
                      <strong className="font-mono">{formatDec(TARGET_A)} facteurs</strong> plus{' '}
                      <strong className="font-mono">{formatDec(TARGET_B)} facteurs</strong> font{' '}
                      <strong className="font-mono">{formatDec(mergedCount)} facteurs</strong> — donc{' '}
                      <MathText>{`$${formatDec(TARGET_A)} + ${formatDec(TARGET_B)} = ${formatDec(mergedCount)}$`}</MathText>.
                      Les exposants s’additionnent parce que les <strong>facteurs se rassemblent</strong>.
                      Et la base est restée <strong>{BASE}</strong> : aucun bloc n’a changé de nature.
                      {revealed && ' (Ce coup-ci on t’a placé les tours — refais-le avec d’autres nombres pour le sentir.)'}
                    </Feedback>
                  )}
                </div>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Retire des blocs du sommet : c’est ça, diviser',
          subtitle: 'Chaque bloc retiré s’annule avec un bloc du diviseur.',
          done: splitDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                La tour a <MathText>{`$${formatPower(BASE, QUOTIENT_START)}$`}</MathText>. Pour la diviser
                par <MathText>{`$${formatPower(BASE, QUOTIENT_REMOVE)}$`}</MathText>, retire{' '}
                <strong>{formatDec(QUOTIENT_REMOVE)} facteurs</strong> : tape le bloc du sommet.
              </p>

              {/* §16bis : les commandes à CÔTÉ — la tour raccourcit à chaque
                  retrait, des boutons placés dessous remonteraient sous le
                  doigt à chaque geste. */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 sm:gap-6">
                <div
                  className="flex items-end justify-center"
                  style={{ minHeight: QUOTIENT_START * 44 + (QUOTIENT_START - 1) * 18 + 96 }}
                >
                <Tower
                  tower={quotient}
                  title="La tour à diviser"
                  onRemoveTop={() => {
                    // Hors updater : `kit.react` déclenche un effet sonore et
                    // ne doit pas être rejoué par un double rendu StrictMode.
                    const next = removeFactor(quotient);
                    if (QUOTIENT_START - factorCount(next) === QUOTIENT_REMOVE) kit.react(true);
                    setQuotient(next);
                  }}
                />
                </div>
                <div className="flex sm:flex-col justify-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const next = removeFactor(quotient);
                      if (QUOTIENT_START - factorCount(next) === QUOTIENT_REMOVE) kit.react(true);
                      setQuotient(next);
                    }}
                    aria-label={`Retirer un facteur ${BASE} du sommet`}
                    className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    Retirer un facteur
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-center space-y-1">
                <MathText className="text-lg text-slate-800">
                  {`$\\frac{${expandedText(makeTower(BASE, QUOTIENT_START))}}{${expandedText(makeTower(BASE, QUOTIENT_REMOVE))}}$`}
                </MathText>
                <p className="text-xs text-slate-600">
                  {cancelled === 0
                    ? 'Retire un facteur du haut : il s’annulera avec un facteur du bas.'
                    : `${formatDec(cancelled)} paire${cancelled > 1 ? 's' : ''} ${BASE}/${BASE} qui vaut${cancelled > 1 ? 'ent' : ''} 1 — il reste ${formatDec(remaining)} facteur${remaining > 1 ? 's' : ''}.`}
                </p>
              </div>

              {!splitDone && (
                <Feedback tone="info">
                  Tu as retiré <strong className="font-mono">{formatDec(removedCount)}</strong> facteur
                  {removedCount > 1 ? 's' : ''} sur {formatDec(QUOTIENT_REMOVE)}. Il reste{' '}
                  <strong className="font-mono">{formatDec(factorCount(quotient))}</strong> facteur
                  {factorCount(quotient) > 1 ? 's' : ''} sur la tour.
                </Feedback>
              )}
              {splitDone && (
                <Feedback tone="ok">
                  Il reste <strong className="font-mono">{formatDec(factorCount(quotient))}</strong> facteur
                  {factorCount(quotient) > 1 ? 's' : ''} :{' '}
                  <MathText>{`$${formatPower(BASE, QUOTIENT_START)} \\div ${formatPower(BASE, QUOTIENT_REMOVE)} = ${formatPower(BASE, exponent(quotient))}$`}</MathText>.
                  Diviser, c’est <strong>enlever des facteurs</strong> — donc soustraire les exposants.
                  {exponent(quotient) < 0 && ' Tu es passé sous le sol : la tour vaut maintenant une fraction, comme au module 2.'}
                  {exponent(quotient) >= 0 && ' Continue à en retirer si tu veux voir la tour passer sous le sol.'}
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Recopie la tour : des PAQUETS, pas une pile',
          subtitle: 'Une tour de 2 facteurs, prise 3 fois — combien de facteurs en tout ?',
          done: repeated,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Cette fois on ne verse rien : on <strong>recopie la tour entière</strong>. Ajoute des
                copies jusqu’à en avoir <strong>{formatDec(PACKET_COUNT)}</strong>, et regarde bien qu’elles
                restent <strong>séparées</strong>.
              </p>

              {/* §16bis : ici la figure s'élargit (des paquets s'ajoutent à
                  droite) plutôt qu'elle ne grandit ; les commandes restent
                  donc sous elle sans jamais se déplacer verticalement — on
                  réserve seulement la hauteur d'un paquet. */}
              <div
                className="flex items-end justify-center gap-2 sm:gap-4 flex-wrap"
                style={{ minHeight: PACKET_SIZE * 44 + (PACKET_SIZE - 1) * 18 + 96 }}
              >
                {packets.map((p, i) => (
                  <div key={i} className="rounded-xl border-2 border-violet-300 bg-violet-50/50 p-2">
                    <Tower tower={p} title={`Paquet ${formatDec(i + 1)}`} frozen />
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-2 flex-wrap">
                <KeyButton
                  primary
                  onClick={() => {
                    const next = duplicate(makeTower(BASE, PACKET_SIZE), Math.min(packets.length + 1, PACKET_COUNT));
                    if (next.length >= PACKET_COUNT) kit.react(true);
                    setPackets(next);
                  }}
                >
                  Ajouter une copie de la tour
                </KeyButton>
                {packets.length > 1 && (
                  <KeyButton onClick={() => setPackets((ps) => ps.slice(0, -1))}>Retirer une copie</KeyButton>
                )}
              </div>

              <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-center space-y-1">
                <MathText className="text-lg text-slate-800">
                  {`$${packets.map(() => `\\left(${expandedText(packets[0])}\\right)`).join(' \\times ')}$`}
                </MathText>
                <p className="text-xs text-slate-600 tabular-nums">
                  {formatDec(pc.packets)} paquet{pc.packets > 1 ? 's' : ''} de {formatDec(pc.perPacket)}{' '}
                  facteurs = <strong>{formatDec(pc.total)} facteurs</strong>
                </p>
              </div>

              {!repeated && (
                <Feedback tone="info">
                  Tu as <strong className="font-mono">{formatDec(pc.packets)}</strong> paquet
                  {pc.packets > 1 ? 's' : ''} de <strong className="font-mono">{formatDec(pc.perPacket)}</strong>{' '}
                  facteurs, soit <strong className="font-mono">{formatDec(pc.total)}</strong> facteurs.
                </Feedback>
              )}
              {repeated && (
                <Feedback tone="ok">
                  <strong className="font-mono">{formatDec(pc.packets)}</strong> paquets de{' '}
                  <strong className="font-mono">{formatDec(pc.perPacket)}</strong> facteurs font{' '}
                  <strong className="font-mono">{formatDec(pc.total)}</strong> facteurs :{' '}
                  <MathText>{`$\\left(${formatPower(BASE, PACKET_SIZE)}\\right)^{${formatDec(PACKET_COUNT)}} = ${formatPower(BASE, pc.total)}$`}</MathText>.
                  Ici on <strong>multiplie</strong> les exposants ({formatDec(pc.perPacket)} ×{' '}
                  {formatDec(pc.packets)}), parce qu’on compte des paquets de facteurs — pas comme à
                  l’étape 1, où on les rassemblait.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Sais-tu les distinguer ?',
          subtitle: 'La question d’abord — les règles ensuite.',
          done: ruleDone,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt={
                  <>
                    Combien vaut <MathText>{'$3^{2} \\times 3^{3}$'}</MathText> ?
                  </>
                }
                options={['$9^{5}$', '$3^{5}$', '$3^{6}$']}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['9⁵', '3⁵', '3⁶'][i]}
                correctionLabel="3⁵"
                cols={3}
                correct={1}
                explain={
                  <>
                    Tu les as comptés : 2 facteurs puis 3 facteurs font 5 facteurs, tous de base 3 —{' '}
                    <MathText>{'$3^{2} \\times 3^{3} = 3^{5} = 243$'}</MathText>.
                  </>
                }
                explainWrong={
                  <>
                    Les deux pièges. <MathText>{'$9^{5}$'}</MathText> multiplie aussi les bases — or aucun
                    bloc n’a changé de nature quand les deux tours se sont réunies : ils portaient tous un
                    3, ils portent toujours un 3. <MathText>{'$3^{6}$'}</MathText> multiplie les exposants
                    (2 × 3) : c’est la règle de l’étape 3, celle des <strong>paquets</strong> — et tu as vu
                    que 3 paquets de 2 font 6 facteurs, pas 5. Rassembler et recopier ne sont pas le même
                    geste.
                  </>
                }
                requires={['exposant-compte']}
                solved={ruleDone}
                onAnswered={() => setRuleDone(true)}
              />

              {ruleDone && (
                <>
                  <KnowledgeBrick
                    id="regle-produit"
                    variant="new"
                    compact
                    lead="Tu as compté 5 facteurs après avoir réuni 2 et 3."
                  />
                  <KnowledgeBrick
                    id="regle-quotient"
                    variant="new"
                    compact
                    lead="Et tu as vu chaque facteur retiré s’annuler avec un facteur du diviseur."
                  />
                  <KnowledgeBrick
                    id="regle-puissance-de-puissance"
                    variant="new"
                    compact
                    lead="Les trois paquets, eux, donnaient 6 facteurs — pas 5."
                  />
                </>
              )}
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Trois règles, un seul principe : la base ne bouge pas, les
          facteurs se comptent. Au module suivant, la base devient 10.
        </KnowledgeSnapshot>
      )}
    />
  );
}

/**
 * Un opérateur entre deux tours. Il s'aligne sur le SOL des tours en mode
 * ligne (les tours n'ont pas la même hauteur, c'est leur sol qui est commun)
 * et se recentre en mode colonne, où il sépare deux tours empilées.
 */
function Operator({ sign, tone = 'slate' }) {
  return (
    <div
      className={`text-3xl font-extrabold leading-none py-1 sm:pb-14 sm:self-end ${
        tone === 'emerald' ? 'text-emerald-600' : 'text-slate-400'
      }`}
      aria-hidden="true"
    >
      {sign}
    </div>
  );
}

function KeyButton({ children, onClick, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        primary
          ? 'bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-700'
          : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-500'
      }`}
    >
      {children}
    </button>
  );
}
