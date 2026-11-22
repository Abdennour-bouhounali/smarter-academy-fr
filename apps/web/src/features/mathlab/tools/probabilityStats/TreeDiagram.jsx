import { useTranslation } from 'react-i18next';
import { PILL_HEIGHT, pillWidth } from './treeLayout.js';
import { labelParts, normalizeLabel } from './probabilityTree.js';

/**
 * L'ARBRE DESSINÉ — شجرة الاحتمالات en SVG, de gauche à droite (LTR, comme au
 * tableau). Chaque événement est une PASTILLE au bout de sa branche ; la
 * probabilité est écrite SUR la branche, telle que saisie ; au bout de
 * chaque chemin complet, sa probabilité (règle du produit).
 *
 * Le dessin est interactif : une pastille (ou sa branche) se choisit au
 * clic ou au clavier (Entrée / Espace) — elle devient le nœud édité ET le
 * chemin mis en évidence. Un nœud dont les branches posent problème porte
 * un marqueur « ! » (une forme, pas seulement une couleur). Les branches
 * neuves poussent, le chemin choisi s'anime ; `prefers-reduced-motion`
 * coupe les deux (CSS).
 *
 * Le « P = … » d'une feuille n'est écrit que lorsqu'un calcul l'a posé
 * (`revealedLeaves`, TreeSection) : avant, « P = ? » — le dessin ne donne
 * pas la réponse d'une question que l'élève est en train de dérouler.
 *
 * Le dessin ne calcule rien : positions (treeLayout.js), validité et
 * produits (probabilityTree.js) lui sont donnés.
 */
export default function TreeDiagram({
  layout, validation, leafProducts, revealedLeaves = null, selectedNode, primary, secondary, onSelect, compact,
}) {
  const { t } = useTranslation('mathlab');
  const maxPill = Math.max(30, (layout.resultX - layout.root.x) / 3.4);
  const pw = (label) => Math.min(maxPill, pillWidth(label));
  const rootIssue = Boolean(validation.nodeIssues['']);
  const ends = new Map(layout.nodes.map((node) => [node.key, node]));

  const onKey = (event, node) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(node);
    }
  };
  const describe = (node) => {
    const labels = node.path.map((_, i) => normalizeLabel(ends.get(node.path.slice(0, i + 1).join('.')).branch.label));

    return t('tools.probabilityStats.tree.nodeAria', { path: labels.join(' ← '), p: node.branch.p || '؟' });
  };

  return (
    <svg
      className="sa-ml-ps__chart sa-ml-ps-tree"
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      preserveAspectRatio="xMidYMin meet"
      role="group"
      aria-label={t('tools.probabilityStats.tree.diagramAria', { count: layout.nodes.filter((n) => n.leaf).length })}
      dir="ltr"
      data-ml-ps-tree-diagram
      data-compact={compact || undefined}
    >
      {/* Les branches d'abord (sous les pastilles). */}
      {layout.nodes.map((node) => {
        const x1 = node.depth === 1 ? node.parentX + 7 : node.parentX + pw(ends.get(node.parentKey).branch.label) / 2;
        const x2 = node.x - pw(node.branch.label) / 2;
        const state = primary.has(node.key) ? ' is-primary' : secondary.has(node.key) ? ' is-secondary' : '';
        const issue = validation.branchIssues[node.key];
        const mx = x1 + (x2 - x1) * 0.5;
        const my = node.parentY + (node.y - node.parentY) * 0.5;

        return (
          <g key={node.branch.id} className={`sa-ml-ps-tree__branch${state}`} data-ml-ps-tree-branch={node.key}>
            <line x1={x1} y1={node.parentY} x2={x2} y2={node.y} className="sa-ml-ps-tree__edge" pathLength="1" />
            {/* Une zone de clic large et invisible : une branche de 2 px ne se vise pas au doigt. */}
            <line
              x1={x1}
              y1={node.parentY}
              x2={x2}
              y2={node.y}
              className="sa-ml-ps-tree__hit"
              onClick={() => onSelect(node)}
            />
            <text
              x={mx}
              y={my - 6}
              textAnchor="middle"
              className={`sa-ml-ps-tree__p${issue ? ' is-invalid' : ''}`}
              data-ml-ps-tree-p={node.key}
            >
              {node.branch.p.trim() === '' ? '؟' : node.branch.p}
            </text>
          </g>
        );
      })}

      <g
        className={`sa-ml-ps-tree__root${selectedNode === '' ? ' is-selected' : ''}`}
        role="button"
        tabIndex={0}
        aria-label={t('tools.probabilityStats.tree.rootAria')}
        aria-pressed={selectedNode === ''}
        onClick={() => onSelect(null)}
        onKeyDown={(event) => onKey(event, null)}
        data-ml-ps-tree-node=""
      >
        <circle cx={layout.root.x} cy={layout.root.y} r="7" />
        {rootIssue && <IssueMarker x={layout.root.x + 4} y={layout.root.y - 20} />}
      </g>

      {layout.nodes.map((node) => {
        const width = pw(node.branch.label);
        const { text, bar } = labelParts(node.branch.label);
        const on = primary.has(node.key);
        const selected = selectedNode === node.key;
        const issue = !node.leaf && validation.nodeIssues[node.key];
        const product = node.leaf ? leafProducts.get(node.key) : null;
        const shown = product && (!revealedLeaves || revealedLeaves.has(node.key));

        return (
          <g
            key={node.branch.id}
            className={`sa-ml-ps-tree__node${on ? ' is-primary' : secondary.has(node.key) ? ' is-secondary' : ''}${selected ? ' is-selected' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={describe(node)}
            aria-pressed={on}
            onClick={() => onSelect(node)}
            onKeyDown={(event) => onKey(event, node)}
            data-ml-ps-tree-node={node.key}
          >
            <rect x={node.x - width / 2} y={node.y - PILL_HEIGHT / 2} width={width} height={PILL_HEIGHT} rx={PILL_HEIGHT / 2} className="sa-ml-ps-tree__pill" />
            <text x={node.x} y={node.y + 4.5} textAnchor="middle" className="sa-ml-ps-tree__label">
              {text || '؟'}
            </text>
            {/* Le contraire : une barre AU-DESSUS de la lettre (Ā), dessinée, pas un caractère. */}
            {bar && <line x1={node.x - 4.5} y1={node.y - 8.5} x2={node.x + 4.5} y2={node.y - 8.5} className="sa-ml-ps-tree__bar" />}
            {issue && <IssueMarker x={node.x + width / 2 - 2} y={node.y - PILL_HEIGHT / 2 - 12} />}
            {node.leaf && (
              <text
                x={layout.resultX + 6}
                y={node.y + 4.5}
                className={`sa-ml-ps-tree__result${shown ? ' is-written' : ' is-pending'}`}
                data-ml-ps-tree-leaf={node.key}
                data-ml-ps-tree-leaf-state={shown ? 'written' : product ? 'pending' : 'none'}
              >
                {shown ? `P = ${product}` : product ? 'P = ?' : '—'}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Le marqueur « ! » d'un nœud à corriger : un triangle ET un point d'exclamation. */
function IssueMarker({ x, y }) {
  return (
    <g className="sa-ml-ps-tree__issue" aria-hidden="true" data-ml-ps-tree-issue>
      <path d={`M ${x} ${y} L ${x + 8} ${y + 14} L ${x - 8} ${y + 14} Z`} />
      <text x={x} y={y + 12} textAnchor="middle">!</text>
    </g>
  );
}
