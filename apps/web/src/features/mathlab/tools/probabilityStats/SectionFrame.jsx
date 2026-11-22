import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Le CADRE commun des quatre sections : le pupitre sur le bord de départ
 * (à droite en arabe) et la scène qui prend le reste ; sous 768 px, la scène
 * en haut et le pupitre dessous, repliable (MATH_LAB.md § 5d.7). Chaque
 * section fournit son pupitre et sa scène ; le cadre ne calcule rien.
 */
export default function SectionFrame({ title, panel, stage, stageAttrs = {} }) {
  const { t } = useTranslation('mathlab');
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="sa-ml-ps__body">
      <aside
        className={`sa-ml-ps__panel ${collapsed ? 'sa-ml-ps__panel--collapsed' : ''}`}
        aria-label={t('tools.probabilityStats.panelLabel')}
        data-ml-ps-panel
      >
        <div className="sa-ml-ps__panel-head">
          <h2 className="sa-ml-ps__panel-title">{title}</h2>
          <button
            type="button"
            className="sa-ml-btn sa-ml-btn--icon sa-ml-ps__collapse"
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? t('tools.probabilityStats.panelShow') : t('tools.probabilityStats.panelHide')}
            title={collapsed ? t('tools.probabilityStats.panelShow') : t('tools.probabilityStats.panelHide')}
            data-ml-ps-panel-toggle
          >
            {collapsed ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
          </button>
        </div>
        <div className="sa-ml-ps__panel-body">{panel}</div>
      </aside>
      <div className="sa-ml-ps__stage" data-ml-ps-stage {...stageAttrs}>
        <div className="sa-ml-ps__scroll">{stage}</div>
      </div>
    </div>
  );
}
