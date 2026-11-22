import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MathText from '../../../../lessons/common/components/MathText.jsx';
import { LabDisclosure, LabMessage, StepList } from '../../shared/LabKit.jsx';
import StepPlayer from '../../shared/StepPlayer.jsx';
import useStepReveal from '../../shared/useStepReveal.js';
import MathBoard from '../../shared/mathBoard/MathBoard.jsx';
import useBoardPractice from '../../shared/mathBoard/useBoardPractice.js';
import { boardProgress } from '../../shared/mathBoard/frames.js';
import { formatValue } from '../functionGrapher/grapherFormat.js';
import { toNumber } from '../algebra/rational.js';
import {
  ambiguousLabels, independenceOf, pathsOf, setQuery, validateTree,
} from './probabilityTree.js';
import {
  conditionalSteps, eventSteps, eventTex, pathSteps, treeHighlight,
} from './treeFormulas.js';
import { queryFrames } from './treeFrames.js';
import { layoutTree } from './treeLayout.js';
import SectionFrame from './SectionFrame.jsx';
import TreeDiagram from './TreeDiagram.jsx';
import TreeEditor from './TreeEditor.jsx';

/** Un rationnel en texte court pour le dessin (« 3/10 », « 1 », « 0 »). */
function shortFraction(r) {
  return r.d === 1 ? String(r.n) : `${r.n}/${r.d}`;
}

/**
 * شجرة الاحتمالات — construire l'arbre, le VOIR, et lire ce qu'il dit :
 * la probabilité d'un chemin (règle du produit), d'un événement
 * (probabilités totales), une probabilité conditionnelle ou inverse
 * (Bayes), et l'indépendance des étapes — déduite, jamais déclarée.
 *
 * Choix constant : tant que l'arbre n'est pas valide, aucun résultat n'est
 * calculé (« غير محسوبة »), et les nœuds à corriger portent un « ! ».
 *
 * Le nœud ÉDITÉ est un état passager (non enregistré) ; la REQUÊTE (chemin,
 * événement, conditionnelle) est enregistrée avec l'arbre : on rouvre le
 * document sur le même calcul — à l'énoncé, jamais sur la réponse.
 *
 * LE CALCUL SE DÉROULE (exigence 2026-09-30) : l'arbre reste visible et
 * éditable (c'est la manipulation) ; le CALCUL se construit au tableau
 * (MathBoard, frames de treeFrames.js), frame par frame, et le dessin suit
 * le frame courant (treeHighlight) : la branche dont on lit la probabilité
 * s'allume, puis la suivante, puis le chemin entier. Choisir une branche sur le dessin EST l'action : son calcul
 * démarre (premier pas = la formule, jamais la réponse). Changer l'arbre ou
 * la question ramène à l'énoncé.
 *
 * Les « P = … » au bout des chemins, et les valeurs du tableau des chemins,
 * n'apparaissent que lorsqu'un pas les CALCULE ; un calcul mené à son terme
 * les laisse écrits (comme au tableau) jusqu'à ce que l'arbre change.
 */
export default function TreeSection({ title, tree, compact, onChange }) {
  const { t } = useTranslation('mathlab');
  const [selectedNode, setSelectedNode] = useState('');
  const validation = useMemo(() => validateTree(tree), [tree]);
  const layout = useMemo(() => layoutTree(tree, { width: compact ? 440 : 720, compact }), [tree, compact]);
  const fullPaths = useMemo(() => pathsOf(tree, validation), [tree, validation]);
  const leafProducts = useMemo(
    () => new Map(fullPaths.map((p) => [p.key, p.product ? shortFraction(p.product) : null])),
    [fullPaths],
  );
  // La signature des BRANCHES (étiquettes, probabilités, forme) : les produits déjà
  // calculés restent écrits tant qu'elle ne change pas.
  const treeSignature = useMemo(() => JSON.stringify([tree.stages, tree.branches]), [tree.stages, tree.branches]);
  const [written, setWritten] = useState({ signature: treeSignature, keys: [] });
  const independence = useMemo(() => independenceOf(tree, validation), [tree, validation]);
  const ambiguous = useMemo(() => ambiguousLabels(tree), [tree]);

  const query = tree.query;
  const calculation = useMemo(() => {
    if (query?.kind === 'path') return pathSteps(tree, query.path, validation);
    if (query?.kind === 'event') return eventSteps(tree, query.event, validation);
    if (query?.kind === 'conditional') return conditionalSteps(tree, query.target, query.given, validation);

    return null;
  }, [tree, query, validation]);

  // Le déroulé : seulement quand il y a un résultat à découvrir. Un arbre faux
  // n'a que sa formule (et le message qui dit pourquoi) — rien à cacher.
  const board = useMemo(() => (calculation?.computed ? queryFrames(tree, validation) : null), [calculation, tree, validation]);
  const playable = Boolean(board);
  const boardKey = `${treeSignature}|${JSON.stringify(query ?? null)}`;
  const player = useStepReveal(playable ? board.frames.length : 0, { resetKey: boardKey });
  // « تدرّب بنفسك » : les gestes du calcul, faits par l'élève (useBoardPractice).
  const practice = useBoardPractice(board?.frames ?? [], player, boardKey);
  const cursor = playable ? player.cursor : 0;
  const { primary, secondary, leaves } = useMemo(() => treeHighlight(board ?? calculation, cursor), [board, calculation, cursor]);

  // Un calcul mené à son terme laisse ses produits écrits au bout des chemins.
  const finished = playable && player.done;
  useEffect(() => {
    if (!finished || leaves.size === 0) return;
    setWritten((current) => {
      const base = current.signature === treeSignature ? current.keys : [];
      if ([...leaves].every((key) => base.includes(key))) return current.signature === treeSignature ? current : { signature: treeSignature, keys: base };

      return { signature: treeSignature, keys: [...new Set([...base, ...leaves])] };
    });
  }, [finished, leaves, treeSignature]);
  const revealedLeaves = useMemo(
    () => new Set([...(written.signature === treeSignature ? written.keys : []), ...leaves]),
    [written, treeSignature, leaves],
  );

  const { start } = player;
  const select = useCallback((node) => {
    if (!node) { setSelectedNode(''); return; }
    // Choisir une branche : on édite le groupe auquel elle appartient, et le
    // calcul de son chemin DÉMARRE (la formule d'abord, la réponse en dernier).
    setSelectedNode(node.parentKey);
    onChange((current) => setQuery(current, { kind: 'path', path: node.path }));
    start();
  }, [onChange, start]);

  const panel = (
    <TreeEditor
      tree={tree}
      validation={validation}
      selectedNode={selectedNode}
      onSelectNode={setSelectedNode}
      onChange={onChange}
    />
  );

  const stage = (
    <>
      {playable && (
        <StepPlayer player={player} {...practice.player} sticky progress={boardProgress(board.frames, player.cursor)} dataAttr="data-ml-ps-tree-step" />
      )}
      <h2 className="sa-ml-ps__stage-title">{t('tools.probabilityStats.tree.stageTitle')}</h2>
      {tree.presetId && (
        <p className="sa-ml-ps__prompt" data-ml-ps-tree-legend={tree.presetId}>
          {t(`tools.probabilityStats.tree.presets.${tree.presetId}.legend`)}
        </p>
      )}
      <div className="sa-ml-ps__tree-scroll">
        <TreeDiagram
          layout={layout}
          validation={validation}
          leafProducts={leafProducts}
          revealedLeaves={revealedLeaves}
          selectedNode={selectedNode}
          primary={primary}
          secondary={secondary}
          onSelect={select}
          compact={compact}
        />
      </div>

      <div role="status" aria-live="polite" data-ml-ps-tree-valid={validation.valid}>
        {validation.valid ? (
          <LabMessage tone="success">{t('tools.probabilityStats.tree.valid')}</LabMessage>
        ) : (
          <LabMessage tone="error">{t('tools.probabilityStats.tree.invalid')}</LabMessage>
        )}
      </div>

      {independence && (
        <p className="sa-ml-ps__independence" data-ml-ps-tree-independent={independence.independent}>
          {tree.stages === 2
            ? t(independence.independent ? 'tools.probabilityStats.tree.independent' : 'tools.probabilityStats.tree.dependent')
            : independence.stages.map((s) => t(s.independent ? 'tools.probabilityStats.tree.stageIndependent' : 'tools.probabilityStats.tree.stageDependent', { stage: s.stage })).join(' ')}
        </p>
      )}

      <section className="sa-ml-ps__section" aria-labelledby="ml-ps-tree-calc" data-ml-ps-tree-calculation={query?.kind ?? 'none'}>
        <h3 id="ml-ps-tree-calc" className="sa-ml-ps__heading">{t('tools.probabilityStats.tree.calculationHeading')}</h3>
        {!calculation ? (
          <p className="sa-ml-ps__hint">{t('tools.probabilityStats.tree.pathHint')}</p>
        ) : (
          <>
            {playable ? (
              <MathBoard
                {...practice.board}
                frames={board.frames}
                cursor={player.cursor}
                problem={board.problem}
                label={t('tools.probabilityStats.tree.calculationHeading')}
                dataAttr="data-ml-ps-tree-board"
              />
            ) : (
              <StepList
                steps={calculation.steps.map((step) => ({ ...step, text: t(`tools.probabilityStats.tree.steps.${step.kind}`) }))}
                label={t('tools.probabilityStats.tree.calculationHeading')}
                dataAttr="data-ml-ps-tree-steps"
              />
            )}
            {!calculation.computed && (
              <LabMessage tone="error">
                {t(calculation.zeroGiven ? 'tools.probabilityStats.tree.zeroGiven' : 'tools.probabilityStats.tree.notComputed')}
              </LabMessage>
            )}
          </>
        )}
      </section>

      <LabDisclosure kind="rule" title={t('tools.probabilityStats.tree.rules.title')} dataAttr="data-ml-ps-tree-rules">
        <p>{t('tools.probabilityStats.tree.rules.product')}</p>
        <div className="sa-ml-ps__formula" dir="ltr"><MathText>{'$P(A \\cap B) = P(A) \\times P_A(B)$'}</MathText></div>
        <p>{t('tools.probabilityStats.tree.rules.sum')}</p>
        <div className="sa-ml-ps__formula" dir="ltr"><MathText>{'$P(B) = P(A \\cap B) + P(\\bar{A} \\cap B)$'}</MathText></div>
        <p>{t('tools.probabilityStats.tree.rules.conditional')}</p>
        <div className="sa-ml-ps__formula" dir="ltr"><MathText>{'$P_B(A) = \\frac{P(A \\cap B)}{P(B)} \\qquad P_A(B) = P(B|A)$'}</MathText></div>
        <p>{t('tools.probabilityStats.tree.rules.independence')}</p>
      </LabDisclosure>

      <PathsTable tree={tree} paths={fullPaths} ambiguous={ambiguous} primary={primary} revealed={revealedLeaves} />
    </>
  );

  return <SectionFrame title={title} panel={panel} stage={stage} />;
}

/** La représentation textuelle de l'arbre : un chemin par ligne, sa probabilité en trois lectures. */
function PathsTable({ tree, paths, ambiguous, primary, revealed }) {
  const { t } = useTranslation('mathlab');

  return (
    <div className="sa-ml-ps__table-wrap">
      <table className="sa-ml-ps__table" data-ml-ps-tree-table={paths.length}>
        <caption className="sa-ml-ps__table-caption">{t('tools.probabilityStats.tree.tableCaption', { count: tree.stages })}</caption>
        <thead>
          <tr>
            <th scope="col">{t('tools.probabilityStats.tree.tablePath')}</th>
            <th scope="col">{t('tools.probabilityStats.tree.tableFraction')}</th>
            <th scope="col">{t('tools.probabilityStats.tree.tableDecimal')}</th>
            <th scope="col">%</th>
          </tr>
        </thead>
        <tbody>
          {paths.map((p) => {
            const value = p.product ? toNumber(p.product) : null;
            // Pas encore calculé dans un déroulé : la ligne pose la question, sans la réponse.
            if (p.product && !revealed.has(p.key)) {
              return (
                <tr key={p.key} className={primary.has(p.key) ? 'is-highlighted' : undefined} data-ml-ps-tree-row={p.key} data-ml-ps-tree-row-pending>
                  <th scope="row" dir="ltr">
                    <MathText>{`$${p.labels.map((label, i) => eventTex(label, i + 1, ambiguous)).join(' \\cap ')}$`}</MathText>
                  </th>
                  <td colSpan={3} className="sa-ml-ps__table-pending">{t('tools.probabilityStats.tree.notYet')}</td>
                </tr>
              );
            }

            return (
              <tr key={p.key} className={primary.has(p.key) ? 'is-highlighted' : undefined} data-ml-ps-tree-row={p.key}>
                <th scope="row" dir="ltr">
                  <MathText>{`$${p.labels.map((label, i) => eventTex(label, i + 1, ambiguous)).join(' \\cap ')}$`}</MathText>
                </th>
                <td dir="ltr">{p.product ? shortFraction(p.product) : t('tools.probabilityStats.tree.notComputedShort')}</td>
                <td dir="ltr">{value === null ? '—' : formatValue(value, 4)}</td>
                <td dir="ltr">{value === null ? '—' : `${formatValue(value * 100, 2)} %`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="sa-ml-ps__hint" data-ml-ps-tree-table-hint>{t('tools.probabilityStats.tree.leavesHint')}</p>
    </div>
  );
}
