import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { FUNCTION_PRESETS, MAX_FUNCTIONS } from './grapherState.js';
import FunctionRow from './FunctionRow.jsx';
import PointInspector from './PointInspector.jsx';
import TangentPanel from './TangentPanel.jsx';

/**
 * Le panneau des fonctions : compact, sur le bord de départ (à droite en
 * arabe). La liste, « أضف دالة », quelques exemples pour démarrer, et la
 * lecture du point posé. Rien d'autre — le plan est le héros.
 *
 * Sous 768 px il passe sous le plan et peut se REPLIER sur son en-tête pour
 * rendre l'écran au graphique.
 */
export default function FunctionPanel({
  data, compiledById, focusId, onChangeExpression, onChangeColor, onToggle, onRemove, onAdd, onPickPreset,
  onChangePointX, onRemovePoint, tangentProps, presets = FUNCTION_PRESETS,
}) {
  const { t } = useTranslation('mathlab');
  const [collapsed, setCollapsed] = useState(false);
  const full = data.functions.length >= MAX_FUNCTIONS;
  const point = data.points[0] ?? null;
  const pointFn = point ? data.functions.find((f) => f.id === point.functionId) : null;

  return (
    <aside className={`sa-ml-grapher__panel ${collapsed ? 'sa-ml-grapher__panel--collapsed' : ''}`} aria-label={t('tools.functionGrapher.functionsHeading')} data-ml-panel>
      <div className="sa-ml-grapher__panel-head">
        <h2 className="sa-ml-grapher__heading">
          {t('tools.functionGrapher.functionsHeading')}
          <span className="sa-ml-grapher__count" dir="ltr">{data.functions.length}/{MAX_FUNCTIONS}</span>
        </h2>
        <button
          type="button"
          className="sa-ml-btn sa-ml-btn--icon sa-ml-grapher__collapse"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? t('tools.functionGrapher.panelShow') : t('tools.functionGrapher.panelHide')}
          title={collapsed ? t('tools.functionGrapher.panelShow') : t('tools.functionGrapher.panelHide')}
          data-ml-panel-toggle
        >
          {collapsed ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
        </button>
      </div>

      <div className="sa-ml-grapher__panel-body">
        {data.functions.length === 0 ? (
          <div className="sa-ml-grapher__empty" data-ml-empty>
            <p className="sa-ml-grapher__empty-title">{t('tools.functionGrapher.emptyTitle')}</p>
            <p className="sa-ml-grapher__empty-body">{t('tools.functionGrapher.emptyBody')}</p>
            <p className="sa-ml-grapher__empty-example" dir="ltr">f(x) = x²</p>
          </div>
        ) : (
          <ul className="sa-ml-grapher__list" data-ml-fn-list>
            {data.functions.map((fn) => (
              <FunctionRow
                key={fn.id}
                fn={fn}
                compiled={compiledById.get(fn.id)}
                onChange={onChangeExpression}
                onChangeColor={onChangeColor}
                onToggle={onToggle}
                onRemove={onRemove}
                autoFocus={focusId === fn.id}
              />
            ))}
          </ul>
        )}

        <button
          type="button"
          className="sa-ml-btn sa-ml-grapher__add"
          onClick={onAdd}
          disabled={full}
          aria-disabled={full}
          data-ml-fn-add
        >
          <Plus size={18} aria-hidden="true" />
          <span>{t('tools.functionGrapher.addFunction')}</span>
        </button>
        {full && <p className="sa-ml-grapher__hint" data-ml-fn-limit>{t('tools.functionGrapher.limitReached', { max: MAX_FUNCTIONS })}</p>}

        <div className="sa-ml-grapher__presets" role="group" aria-label={t('tools.functionGrapher.examples')} data-ml-presets>
          <span className="sa-ml-grapher__presets-label">{t('tools.functionGrapher.examples')}</span>
          {presets.map((preset) => (
            <button
              key={preset.expression}
              type="button"
              className="sa-ml-grapher__chip"
              dir="ltr"
              onClick={() => onPickPreset(preset.expression)}
              disabled={full}
              data-ml-preset={preset.expression}
            >
              <PresetLabel expression={preset.expression} />
            </button>
          ))}
        </div>

        {tangentProps && (
          <TangentPanel {...tangentProps} />
        )}

        {data.tangent?.enabled ? null : point && pointFn ? (
          <PointInspector
            point={point}
            fn={pointFn}
            compiled={compiledById.get(pointFn.id)}
            onChangeX={onChangePointX}
            onRemove={onRemovePoint}
          />
        ) : (
          data.functions.length > 0 && <p className="sa-ml-grapher__hint" data-ml-point-hint>{t('tools.functionGrapher.pointHint')}</p>
        )}
      </div>
    </aside>
  );
}

/** Un libellé lisible des exemples, sans moteur : ces sept-là sont connus. */
const PRESET_LABELS = {
  'x': 'x',
  'x^2': 'x²',
  '2x+1': '2x + 1',
  '\\frac{1}{x}': '1/x',
  '\\left|x\\right|': '|x|',
  '\\sqrt{x}': '√x',
  '\\sin(x)': 'sin(x)',
  // Ceux de مخبر المتوسط (scope.js).
  '2x': '2x',
  '-x+3': '−x + 3',
  '\\frac{1}{2}x-1': '½x − 1',
  '3': '3',
};

function PresetLabel({ expression }) {
  return <span>{PRESET_LABELS[expression] ?? expression}</span>;
}
