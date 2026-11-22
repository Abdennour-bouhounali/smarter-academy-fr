import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ShapeSelector from './ShapeSelector.jsx';
import DimensionControls from './DimensionControls.jsx';
import GeometryInfo from './GeometryInfo.jsx';

/**
 * Le panneau de la géométrie dans l'espace, sur le bord de départ (à droite
 * en arabe) : le solide, ses dimensions, les options d'affichage, les
 * mesures. Compact — la fenêtre 3D est le héros. Sous 768 px il passe sous
 * la fenêtre et se REPLIE sur son en-tête.
 */
export default function GeometryPanel({ data, selectedFace, onChangeShape, onChangeDimension, onToggleOption }) {
  const { t } = useTranslation('mathlab');
  const [collapsed, setCollapsed] = useState(false);
  const options = [
    { key: 'showMeasurements', label: t('tools.geometry3d.showMeasurements') },
    { key: 'showAxes', label: t('tools.geometry3d.showAxes') },
    { key: 'showGrid', label: t('tools.geometry3d.showGrid') },
  ];

  return (
    <aside className={`sa-ml-g3d__panel ${collapsed ? 'sa-ml-g3d__panel--collapsed' : ''}`} aria-label={t('tools.geometry3d.panelLabel')} data-ml-g3d-panel>
      <div className="sa-ml-g3d__panel-head">
        <h2 className="sa-ml-g3d__heading">{t('tools.geometry3d.shapeHeading')}</h2>
        <button
          type="button"
          className="sa-ml-btn sa-ml-btn--icon sa-ml-g3d__collapse"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? t('tools.geometry3d.panelShow') : t('tools.geometry3d.panelHide')}
          title={collapsed ? t('tools.geometry3d.panelShow') : t('tools.geometry3d.panelHide')}
          data-ml-g3d-panel-toggle
        >
          {collapsed ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
        </button>
      </div>

      <div className="sa-ml-g3d__panel-body">
        <ShapeSelector shape={data.shape} onChange={onChangeShape} />

        <section className="sa-ml-g3d__section" aria-labelledby="ml-g3d-dims-heading">
          <h3 id="ml-g3d-dims-heading" className="sa-ml-g3d__heading sa-ml-g3d__heading--sub">{t('tools.geometry3d.dimensionsHeading')}</h3>
          <DimensionControls shape={data.shape} dimensions={data.dimensions} onChange={onChangeDimension} />
          <p className="sa-ml-g3d__hint">{t('tools.geometry3d.dimensionsHint')}</p>
        </section>

        <section className="sa-ml-g3d__section" aria-labelledby="ml-g3d-options-heading">
          <h3 id="ml-g3d-options-heading" className="sa-ml-g3d__heading sa-ml-g3d__heading--sub">{t('tools.geometry3d.optionsHeading')}</h3>
          <div className="sa-ml-g3d__options">
            {options.map((option) => (
              <label key={option.key} className="sa-ml-g3d__toggle">
                <input type="checkbox" checked={data[option.key]} onChange={() => onToggleOption(option.key)} data-ml-g3d-option={option.key} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="sa-ml-g3d__section" aria-labelledby="ml-g3d-measures-heading">
          <h3 id="ml-g3d-measures-heading" className="sa-ml-g3d__heading sa-ml-g3d__heading--sub">{t('tools.geometry3d.measuresHeading')}</h3>
          <GeometryInfo shape={data.shape} dimensions={data.dimensions} selectedFace={selectedFace} />
        </section>
      </div>
    </aside>
  );
}
