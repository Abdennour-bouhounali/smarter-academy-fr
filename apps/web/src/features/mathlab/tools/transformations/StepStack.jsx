import { useTranslation } from 'react-i18next';
import {
  ArrowRight, RotateCw, FlipHorizontal2, Maximize2,
  Eye, EyeOff, Trash2, ChevronUp, ChevronDown, Play,
} from 'lucide-react';
import { formatValue } from '../functionGrapher/grapherFormat.js';
import { vectorColumnText } from '../vectors/vectorFormat.js';
import VectorColumn from '../vectors/VectorColumn.jsx';
import { describeStep } from './transformModel.js';
import { AXIS_TYPES } from './transformModel.js';

const KIND_ICONS = {
  translation: ArrowRight,
  rotation: RotateCw,
  reflection: FlipHorizontal2,
  dilation: Maximize2,
};

/** Les axes offerts dans le menu, dans l'ordre pédagogique du manuel. */
const AXIS_CHOICES = ['xAxis', 'yAxis', 'origin', 'diagonal', 'antidiagonal', 'horizontal', 'vertical', 'twoPoints'];

/**
 * LA PILE des transformations (§20, §21, §22).
 *
 *     Original
 *        ↓  T₁ : انسحاب (3 ; 2)
 *        ↓  T₂ : دوران 90°
 *     Image
 *
 * Chaque ligne est À LA FOIS l'affichage du pas et son éditeur : les
 * curseurs y sont, et tout ce qu'on y touche recalcule immédiatement tout
 * l'aval (§21). Aucun bouton « appliquer » (§5).
 *
 * Réordonner n'est jamais interdit (§23) : c'est l'expérience elle-même.
 */
export default function StepStack({
  steps, activeStepId, onSelect, onAdd, onUpdate, onRemove, onToggle, onMove, onAnimate, maxSteps,
  vertexCount, kinds = ['translation', 'rotation', 'reflection', 'dilation'],
}) {
  // Un seul pas (le collège, scope.js) : « ajouter » REMPLACE — le bouton reste actif.
  const single = maxSteps <= 1;
  const { t } = useTranslation('mathlab');

  return (
    <div className="sa-ml-tr__stack" data-ml-stack>
      <div className="sa-ml-tr__stackhead">
        <h3 className="sa-ml-tr__paneltitle">{t('tools.transformations.stack.title')}</h3>
        <span className="sa-ml-tr__stackcount">{`${steps.length}\u00A0/\u00A0${maxSteps}`}</span>
      </div>

      <p className="sa-ml-tr__stacknode" data-ml-node="original">{t('tools.transformations.stack.original')}</p>

      <ol className="sa-ml-tr__steps">
        {steps.map((step, index) => {
          const Icon = KIND_ICONS[step.kind] ?? ArrowRight;
          const description = describeStep(step, []);
          const active = step.id === activeStepId;

          return (
            <li
              key={step.id}
              className={`sa-ml-tr__step${active ? ' sa-ml-tr__step--active' : ''}${step.enabled ? '' : ' sa-ml-tr__step--off'}`}
              data-ml-step-id={step.id}
              data-ml-step-kind={step.kind}
              data-ml-step-enabled={String(step.enabled)}
            >
              <div className="sa-ml-tr__steprow">
                <button
                  type="button"
                  className="sa-ml-tr__stepname"
                  onClick={() => onSelect(step.id)}
                  aria-expanded={active}
                  data-ml-step-select
                >
                  <Icon size={16} aria-hidden="true" />
                  <span className="sa-ml-tr__stepindex" dir="ltr">{`T${index + 1}`}</span>
                  <span className="sa-ml-tr__steplabel">
                    {t(`tools.transformations.steps.${step.kind}`)}
                    {' '}
                    <span dir="ltr" className="sa-ml-tr__stepparams">{summarize(step, description, t)}</span>
                  </span>
                </button>

                <div className="sa-ml-tr__stepactions">
                  <button
                    type="button"
                    className="sa-ml-btn sa-ml-btn--icon"
                    onClick={() => onAnimate(step.id)}
                    aria-label={t('tools.transformations.stack.animateStep')}
                    title={t('tools.transformations.stack.animateStep')}
                    data-ml-step-animate
                  >
                    <Play size={15} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="sa-ml-btn sa-ml-btn--icon"
                    onClick={() => onToggle(step.id)}
                    aria-label={t(step.enabled ? 'tools.transformations.stack.disable' : 'tools.transformations.stack.enable')}
                    title={t(step.enabled ? 'tools.transformations.stack.disable' : 'tools.transformations.stack.enable')}
                    aria-pressed={!step.enabled}
                    data-ml-step-toggle
                  >
                    {step.enabled ? <Eye size={15} aria-hidden="true" /> : <EyeOff size={15} aria-hidden="true" />}
                  </button>
                  <button
                    type="button"
                    className="sa-ml-btn sa-ml-btn--icon"
                    onClick={() => onMove(step.id, -1)}
                    disabled={index === 0}
                    aria-label={t('tools.transformations.stack.moveUp')}
                    title={t('tools.transformations.stack.moveUp')}
                    data-ml-step-up
                  >
                    <ChevronUp size={15} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="sa-ml-btn sa-ml-btn--icon"
                    onClick={() => onMove(step.id, 1)}
                    disabled={index === steps.length - 1}
                    aria-label={t('tools.transformations.stack.moveDown')}
                    title={t('tools.transformations.stack.moveDown')}
                    data-ml-step-down
                  >
                    <ChevronDown size={15} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="sa-ml-btn sa-ml-btn--icon sa-ml-tr__danger"
                    onClick={() => onRemove(step.id)}
                    aria-label={t('tools.transformations.stack.remove')}
                    title={t('tools.transformations.stack.remove')}
                    data-ml-step-remove
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {active && (
                <StepEditor step={step} onUpdate={onUpdate} vertexCount={vertexCount} t={t} />
              )}
            </li>
          );
        })}
      </ol>

      <p className="sa-ml-tr__stacknode" data-ml-node="image">{t('tools.transformations.stack.image')}</p>

      <div className="sa-ml-tr__addrow" role="group" aria-label={t('tools.transformations.stack.add')}>
        {kinds.map((kind) => {
          const Icon = KIND_ICONS[kind];

          return (
            <button
              key={kind}
              type="button"
              className="sa-ml-btn sa-ml-tr__addbtn"
              onClick={() => onAdd(kind)}
              disabled={!single && steps.length >= maxSteps}
              data-ml-add-step={kind}
            >
              <Icon size={15} aria-hidden="true" />
              <span>{t(`tools.transformations.steps.${kind}`)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * L'ÉDITEUR d'un pas : ses curseurs et ses champs.
 *
 * Un curseur ET un champ pour chaque nombre, toujours : le curseur pour
 * SENTIR la variation continue (§9, §18), le champ pour poser une valeur
 * exacte (§10). L'un met l'autre à jour ; aucun des deux n'attend un bouton.
 */
function StepEditor({ step, onUpdate, vertexCount, t }) {
  const update = (patch) => onUpdate(step.id, patch);

  if (step.kind === 'translation') {
    return (
      <div className="sa-ml-tr__editor" data-ml-editor="translation">
        <NumberControl
          label="a" value={step.vx} min={-10} max={10} step={0.5}
          onChange={(vx) => update({ vx })} testId="vx"
        />
        <NumberControl
          label="b" value={step.vy} min={-10} max={10} step={0.5}
          onChange={(vy) => update({ vy })} testId="vy"
        />
        <p className="sa-ml-tr__editorhint" dir="ltr">
          <VectorColumn vector={{ x: step.vx, y: step.vy }} name="\\vec{v}" />
        </p>
      </div>
    );
  }

  if (step.kind === 'rotation') {
    return (
      <div className="sa-ml-tr__editor" data-ml-editor="rotation">
        <NumberControl
          label={t('tools.transformations.editor.angle')} value={step.angle}
          min={0} max={360} step={5} unit="°"
          onChange={(angle) => update({ angle })} testId="angle"
        />
        <div className="sa-ml-tr__quickangles" role="group" aria-label={t('tools.transformations.editor.quickAngles')}>
          {[90, 180, 270].map((angle) => (
            <button
              key={angle}
              type="button"
              className={`sa-ml-btn sa-ml-tr__chip${step.angle === angle ? ' sa-ml-tr__chip--on' : ''}`}
              onClick={() => update({ angle })}
              data-ml-quick-angle={angle}
            >
              <span dir="ltr">{`${angle}°`}</span>
            </button>
          ))}
        </div>
        <CenterPicker center={step.center} onChange={(center) => update({ center })} vertexCount={vertexCount} t={t} />
      </div>
    );
  }

  if (step.kind === 'dilation') {
    return (
      <div className="sa-ml-tr__editor" data-ml-editor="dilation">
        <NumberControl
          label="k" value={step.k} min={-3} max={3} step={0.1}
          onChange={(k) => update({ k })} testId="k"
        />
        <div className="sa-ml-tr__quickangles" role="group" aria-label={t('tools.transformations.editor.quickScales')}>
          {[-1, 0.5, 1, 2].map((k) => (
            <button
              key={k}
              type="button"
              className={`sa-ml-btn sa-ml-tr__chip${step.k === k ? ' sa-ml-tr__chip--on' : ''}`}
              onClick={() => update({ k })}
              data-ml-quick-scale={k}
            >
              <span dir="ltr">{formatValue(k)}</span>
            </button>
          ))}
        </div>
        <CenterPicker center={step.center} onChange={(center) => update({ center })} vertexCount={vertexCount} t={t} />
      </div>
    );
  }

  // Réflexion
  return (
    <div className="sa-ml-tr__editor" data-ml-editor="reflection">
      <label className="sa-ml-tr__field">
        <span>{t('tools.transformations.editor.axis')}</span>
        <select
          className="sa-ml-tr__select"
          value={step.axis?.type ?? 'xAxis'}
          onChange={(event) => update({ axis: axisFor(event.target.value, step.axis) })}
          data-ml-axis-select
        >
          {AXIS_CHOICES.filter((type) => AXIS_TYPES.includes(type)).map((type) => (
            <option key={type} value={type}>{t(`tools.transformations.axes.${type}`)}</option>
          ))}
        </select>
      </label>

      {(step.axis?.type === 'horizontal' || step.axis?.type === 'vertical') && (
        <NumberControl
          label={step.axis.type === 'horizontal' ? 'y' : 'x'}
          value={step.axis.value} min={-8} max={8} step={0.5}
          onChange={(value) => update({ axis: { ...step.axis, value } })}
          testId="axisvalue"
        />
      )}

      {step.axis?.type === 'twoPoints' && (
        <p className="sa-ml-tr__editorhint">{t('tools.transformations.editor.twoPointsHint')}</p>
      )}
    </div>
  );
}

/** Un nombre : curseur (sentir) + champ (viser). Les deux écrivent la même valeur. */
function NumberControl({ label, value, min, max, step, unit = '', onChange, testId }) {
  return (
    <div className="sa-ml-tr__control">
      <label className="sa-ml-tr__controllabel" htmlFor={`tr-${testId}`}>
        <span dir="ltr">{label}</span>
        <input
          id={`tr-${testId}-num`}
          type="number"
          className="sa-ml-tr__number"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          dir="ltr"
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isFinite(next)) onChange(next);
          }}
          data-ml-number={testId}
        />
        {unit && <span className="sa-ml-tr__unit" dir="ltr">{unit}</span>}
      </label>
      <input
        id={`tr-${testId}`}
        type="range"
        className="sa-ml-tr__slider"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        dir="ltr"
        onChange={(event) => onChange(Number(event.target.value))}
        data-ml-slider={testId}
      />
    </div>
  );
}

/** Le choix du centre (§11) : l'origine, un sommet de la figure, ou un point posé. */
function CenterPicker({ center, onChange, vertexCount, t }) {
  const type = center?.type ?? 'origin';

  return (
    <div className="sa-ml-tr__centerpicker">
      <label className="sa-ml-tr__field">
        <span>{t('tools.transformations.editor.center')}</span>
        <select
          className="sa-ml-tr__select"
          value={type === 'vertex' ? `vertex-${center.index}` : type}
          onChange={(event) => {
            const raw = event.target.value;
            if (raw.startsWith('vertex-')) onChange({ type: 'vertex', index: Number(raw.slice(7)) });
            else if (raw === 'point') onChange({ type: 'point', point: center?.point ?? { x: 2, y: 2 } });
            else onChange({ type: 'origin' });
          }}
          data-ml-center-select
        >
          <option value="origin">{t('tools.transformations.editor.centerOrigin')}</option>
          {Array.from({ length: Math.min(vertexCount, 6) }, (_, index) => (
            <option key={index} value={`vertex-${index}`}>
              {t('tools.transformations.editor.centerVertex', { name: 'ABCDEF'[index] })}
            </option>
          ))}
          <option value="point">{t('tools.transformations.editor.centerPoint')}</option>
        </select>
      </label>
      {type === 'point' && (
        <p className="sa-ml-tr__editorhint">{t('tools.transformations.editor.centerPointHint')}</p>
      )}
    </div>
  );
}

/** Le nouvel axe quand l'élève change de type, en gardant ce qui a du sens. */
function axisFor(type, previous) {
  switch (type) {
    case 'horizontal': return { type, value: previous?.value ?? 2 };
    case 'vertical': return { type, value: previous?.value ?? 2 };
    case 'twoPoints': return { type, a: previous?.a ?? { x: -3, y: -3 }, b: previous?.b ?? { x: 3, y: 3 } };
    case 'origin': return { type, center: { type: 'origin' } };
    default: return { type };
  }
}

/** Le résumé d'un pas sur sa ligne : les paramètres réels, en notation LTR. */
function summarize(step, description, t) {
  switch (step.kind) {
    case 'translation':
      // Un résumé de LIGNE : une chaîne, donc la colonne en texte (§ vectorFormat).
      return vectorColumnText({ x: step.vx, y: step.vy });
    case 'rotation':
      return `${formatValue(step.angle, 0)}°`;
    case 'dilation':
      return `k = ${formatValue(step.k)}`;
    case 'reflection':
      return t(`tools.transformations.axesShort.${step.axis?.type ?? 'xAxis'}`);
    default:
      return '';
  }
}
