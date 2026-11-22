import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Minus, Plus, RotateCcw, Trash2, Wand2 } from 'lucide-react';
import { ExamplePicker } from '../../shared/LabKit.jsx';
import { toPlainText } from '../algebra/rational.js';
import {
  MAX_BRANCHES, MAX_STAGES, addBranch, addStage, autoCompleteNode, autoCompletePreview, branchAt,
  childrenAt, complementLabel, createDefaultTree, deleteBranch, duplicateBranch, internalNodes,
  normalizeLabel, parsePathKey, pathKey, removeStage, setLabel, setProbability, setQuery, stageLabels,
} from './probabilityTree.js';
import { TREE_PRESETS, getTreePreset } from './treePresets.js';

/** Le nom lisible d'un nœud : « الجذر », ou le chemin qui y mène (« A ثم B »). */
function nodeName(tree, key, t) {
  if (key === '') return t('tools.probabilityStats.tree.root');
  const path = parsePathKey(key);
  const labels = path.map((_, i) => normalizeLabel(branchAt(tree, path.slice(0, i + 1))?.label ?? '?'));

  return t('tools.probabilityStats.tree.after', { path: labels.join(` ${t('tools.probabilityStats.tree.then')} `) });
}

/** L'étiquette d'une branche : un brouillon local, validé à la sortie du champ ou par Entrée (les espaces en cours de frappe survivent). */
function LabelField({ value, onCommit, label, invalid, attr }) {
  const [draft, setDraft] = useState(value);

  return (
    <input
      className={`sa-ml-ps__tree-input sa-ml-ps__tree-input--label${invalid ? ' sa-ml-ps__number--invalid' : ''}`}
      dir="auto"
      value={draft}
      maxLength={40}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => onCommit(draft)}
      onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); onCommit(draft); } }}
      aria-label={label}
      aria-invalid={invalid || undefined}
      data-ml-ps-tree-label={attr}
    />
  );
}

/**
 * LE PUPITRE de l'arbre : les exemples, la structure (étapes), le nœud
 * choisi et ses branches (nom, probabilité, contraire, dupliquer, supprimer,
 * ajouter, « أكمل تلقائيًا »), et ce qu'on veut calculer. Chaque bouton
 * appelle une transition pure de probabilityTree.js ; un bouton qui ne
 * ferait rien est DÉSACTIVÉ (jamais un faux contrôle).
 */
export default function TreeEditor({ tree, validation, selectedNode, onSelectNode, onChange }) {
  const { t } = useTranslation('mathlab');
  const k = (key) => `tools.probabilityStats.tree.${key}`;
  const nodes = internalNodes(tree);
  const nodeKey = nodes.some((node) => node.key === selectedNode) ? selectedNode : '';
  const nodePath = parsePathKey(nodeKey);
  const branches = childrenAt(tree, nodePath) ?? [];
  const nodeIssues = validation.nodeIssues[nodeKey] ?? [];
  const preview = autoCompletePreview(tree, nodePath);

  return (
    <>
      <ExamplePicker
        examples={TREE_PRESETS.map((preset) => ({ id: preset.id, level: preset.level, label: t(`${k('presets')}.${preset.id}.label`) }))}
        activeId={tree.presetId}
        onPick={(id) => { const preset = getTreePreset(id); if (preset) { onChange(() => preset.create()); onSelectNode(''); } }}
        dataAttr="data-ml-ps-tree-example"
      />

      <section className="sa-ml-ps__section" aria-labelledby="ml-ps-tree-structure">
        <h3 id="ml-ps-tree-structure" className="sa-ml-ps__heading">{t(k('structure'))}</h3>
        <p className="sa-ml-ps__hint" data-ml-ps-tree-stages={tree.stages}>{t(k('stagesCount'), { count: tree.stages })}</p>
        <div className="sa-ml-ps__tree-actions">
          <button type="button" className="sa-ml-ps__small-btn" disabled={tree.stages >= MAX_STAGES} onClick={() => onChange(addStage)} data-ml-ps-tree-add-stage>
            <Plus size={16} aria-hidden="true" />{t(k('addStage'))}
          </button>
          <button type="button" className="sa-ml-ps__small-btn" disabled={tree.stages <= 1} onClick={() => onChange(removeStage)} data-ml-ps-tree-remove-stage>
            <Minus size={16} aria-hidden="true" />{t(k('removeStage'))}
          </button>
          <button type="button" className="sa-ml-ps__small-btn" onClick={() => { onChange(() => createDefaultTree()); onSelectNode(''); }} data-ml-ps-tree-reset>
            <RotateCcw size={16} aria-hidden="true" />{t(k('reset'))}
          </button>
        </div>
        {tree.stages >= MAX_STAGES && <p className="sa-ml-ps__hint">{t(k('maxStages'), { max: MAX_STAGES })}</p>}
      </section>

      <section className="sa-ml-ps__section" aria-labelledby="ml-ps-tree-node">
        <h3 id="ml-ps-tree-node" className="sa-ml-ps__heading">{t(k('nodeHeading'))}</h3>
        <select
          className="sa-ml-ps__select"
          value={nodeKey}
          onChange={(event) => onSelectNode(event.target.value)}
          aria-labelledby="ml-ps-tree-node"
          data-ml-ps-tree-node-select
        >
          {nodes.map((node) => (
            <option key={node.key} value={node.key}>
              {nodeName(tree, node.key, t)}{validation.nodeIssues[node.key] ? ' ⚠' : ''}
            </option>
          ))}
        </select>

        <ul className="sa-ml-ps__tree-branches" data-ml-ps-tree-editor={nodeKey}>
          {branches.map((branch, index) => {
            const path = [...nodePath, index];
            const key = pathKey(path);
            const issue = validation.branchIssues[key];
            const errorId = `ml-ps-tree-err-${key.replace(/\./g, '-')}`;

            return (
              <li key={branch.id} className="sa-ml-ps__tree-branch" data-ml-ps-tree-branch-row={key}>
                <div className="sa-ml-ps__tree-fields">
                  <LabelField
                    key={`${branch.id}:${branch.label}`}
                    value={branch.label}
                    onCommit={(text) => onChange((current) => setLabel(current, path, text))}
                    label={t(k('labelField'), { index: index + 1 })}
                    invalid={issue?.code === 'emptyLabel'}
                    attr={key}
                  />
                  <input
                    className={`sa-ml-ps__tree-input sa-ml-ps__tree-input--p${issue && issue.code !== 'emptyLabel' ? ' sa-ml-ps__number--invalid' : ''}`}
                    dir="ltr"
                    inputMode="decimal"
                    value={branch.p}
                    placeholder="1/4"
                    maxLength={16}
                    onChange={(event) => onChange((current) => setProbability(current, path, event.target.value))}
                    aria-label={t(k('probabilityField'), { label: normalizeLabel(branch.label) || index + 1 })}
                    aria-invalid={Boolean(issue && issue.code !== 'emptyLabel') || undefined}
                    aria-describedby={issue ? errorId : undefined}
                    data-ml-ps-tree-p-input={key}
                  />
                </div>
                <div className="sa-ml-ps__tree-branch-actions">
                  {branches.length === 2 && (
                    <button
                      type="button"
                      className="sa-ml-ps__icon-btn"
                      onClick={() => onChange((current) => setLabel(current, path, complementLabel(branches[1 - index].label)))}
                      title={t(k('complement'))}
                      aria-label={t(k('complementOf'), { label: normalizeLabel(branches[1 - index].label) })}
                      data-ml-ps-tree-complement={key}
                    >
                      <span aria-hidden="true" className="sa-ml-ps__bar-glyph">x̄</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="sa-ml-ps__icon-btn"
                    disabled={branches.length >= MAX_BRANCHES}
                    onClick={() => onChange((current) => duplicateBranch(current, path))}
                    title={t(k('duplicate'))}
                    aria-label={t(k('duplicateOf'), { label: normalizeLabel(branch.label) })}
                    data-ml-ps-tree-duplicate={key}
                  >
                    <Copy size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="sa-ml-ps__icon-btn sa-ml-ps__icon-btn--danger"
                    disabled={branches.length <= 1}
                    onClick={() => onChange((current) => deleteBranch(current, path))}
                    title={t(k('delete'))}
                    aria-label={t(k('deleteOf'), { label: normalizeLabel(branch.label) })}
                    data-ml-ps-tree-delete={key}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
                {issue && (
                  <p id={errorId} className="sa-ml-ps__error" role="alert" data-ml-ps-tree-branch-error={issue.code}>
                    {t(`${k('errors')}.${issue.code}`)}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        {nodeIssues.map((issue) => (
          <p key={issue.code} className="sa-ml-ps__error" role="alert" data-ml-ps-tree-node-error={issue.code}>
            {t(`${k('errors')}.${issue.code}`)}
            {issue.code === 'sumNotOne' && (
              <>
                {' '}
                <bdi dir="ltr" className="sa-ml-ps__inline-value">{toPlainText(issue.sum)}</bdi>
              </>
            )}
            {issue.code === 'duplicateLabel' && (
              <>
                {' '}
                <bdi className="sa-ml-ps__inline-value">{issue.label}</bdi>
              </>
            )}
          </p>
        ))}

        <div className="sa-ml-ps__tree-actions">
          <button
            type="button"
            className="sa-ml-ps__small-btn"
            disabled={branches.length >= MAX_BRANCHES || nodePath.length >= tree.stages}
            onClick={() => onChange((current) => addBranch(current, nodePath))}
            data-ml-ps-tree-add-branch
          >
            <Plus size={16} aria-hidden="true" />{t(k('addBranch'))}
          </button>
          <button
            type="button"
            className="sa-ml-ps__small-btn sa-ml-ps__small-btn--accent"
            disabled={preview === null}
            onClick={() => onChange((current) => autoCompleteNode(current, nodePath))}
            title={preview === null ? t(k('autoCompleteUnavailable')) : undefined}
            data-ml-ps-tree-autocomplete
          >
            <Wand2 size={16} aria-hidden="true" />{t(k('autoComplete'))}
            {preview !== null && <bdi dir="ltr" className="sa-ml-ps__inline-value">{preview}</bdi>}
          </button>
        </div>
        {branches.length >= MAX_BRANCHES && <p className="sa-ml-ps__hint">{t(k('maxBranches'), { max: MAX_BRANCHES })}</p>}
      </section>

      <QueryControls tree={tree} onChange={onChange} />
    </>
  );
}

/** « ماذا نحسب؟ » — un chemin (choisi dans le dessin), un événement, une probabilité conditionnelle. */
function QueryControls({ tree, onChange }) {
  const { t } = useTranslation('mathlab');
  const k = (key) => `tools.probabilityStats.tree.${key}`;
  const kind = tree.query?.kind ?? 'path';
  const firstEvent = (stage) => ({ stage, label: stageLabels(tree, stage)[0] ?? '' });
  const choose = (next) => {
    if (next === 'path') onChange((current) => setQuery(current, current.query?.kind === 'path' ? current.query : null));
    if (next === 'event') onChange((current) => setQuery(current, { kind: 'event', event: firstEvent(current.stages) }));
    if (next === 'conditional' && tree.stages >= 2) {
      onChange((current) => setQuery(current, { kind: 'conditional', target: firstEvent(1), given: firstEvent(current.stages) }));
    }
  };

  return (
    <section className="sa-ml-ps__section" aria-labelledby="ml-ps-tree-query">
      <h3 id="ml-ps-tree-query" className="sa-ml-ps__heading">{t(k('queryHeading'))}</h3>
      <div className="sa-ml-ps__chart-types" role="group" aria-labelledby="ml-ps-tree-query">
        {['path', 'event', 'conditional'].map((option) => (
          <button
            key={option}
            type="button"
            className={`sa-ml-ps__chart-type${kind === option ? ' is-active' : ''}`}
            aria-pressed={kind === option}
            disabled={option === 'conditional' && tree.stages < 2}
            onClick={() => choose(option)}
            data-ml-ps-tree-query={option}
          >
            {t(`${k('queries')}.${option}`)}
          </button>
        ))}
      </div>
      {kind === 'path' && <p className="sa-ml-ps__hint">{t(k('pathHint'))}</p>}
      {kind === 'event' && (
        <EventPicker
          tree={tree}
          value={tree.query.event}
          legend={t(k('eventLegend'))}
          attr="event"
          onPick={(event) => onChange((current) => setQuery(current, { kind: 'event', event }))}
        />
      )}
      {kind === 'conditional' && (
        <>
          <EventPicker
            tree={tree}
            value={tree.query.target}
            legend={t(k('targetLegend'))}
            attr="target"
            onPick={(target) => onChange((current) => setQuery(current, { ...current.query, target }))}
          />
          <EventPicker
            tree={tree}
            value={tree.query.given}
            legend={t(k('givenLegend'))}
            attr="given"
            onPick={(given) => onChange((current) => setQuery(current, { ...current.query, given }))}
          />
        </>
      )}
    </section>
  );
}

/** Un événement = une étape + une étiquette de cette étape. */
function EventPicker({ tree, value, legend, attr, onPick }) {
  const { t } = useTranslation('mathlab');
  const labels = stageLabels(tree, value.stage);

  return (
    <fieldset className="sa-ml-ps__event-picker" data-ml-ps-tree-event-picker={attr}>
      <legend className="sa-ml-ps__field-label">{legend}</legend>
      <label className="sa-ml-ps__event-field">
        <span>{t('tools.probabilityStats.tree.stage')}</span>
        <select
          className="sa-ml-ps__select"
          value={value.stage}
          onChange={(event) => {
            const stage = Number(event.target.value);
            onPick({ stage, label: stageLabels(tree, stage)[0] ?? '' });
          }}
          data-ml-ps-tree-event-stage={attr}
        >
          {Array.from({ length: tree.stages }, (_, i) => i + 1).map((stage) => (
            <option key={stage} value={stage}>{stage}</option>
          ))}
        </select>
      </label>
      <label className="sa-ml-ps__event-field">
        <span>{t('tools.probabilityStats.tree.event')}</span>
        <select
          className="sa-ml-ps__select"
          value={value.label}
          onChange={(event) => onPick({ stage: value.stage, label: event.target.value })}
          data-ml-ps-tree-event-label={attr}
        >
          {labels.map((label) => <option key={label} value={label}>{label}</option>)}
        </select>
      </label>
    </fieldset>
  );
}
