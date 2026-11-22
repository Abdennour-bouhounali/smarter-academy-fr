import { useTranslation } from 'react-i18next';
import { SHAPE_IDS } from './geometryState.js';

/**
 * Le choix du solide : une liste native — accessible au clavier, connue de
 * tous les lecteurs d'écran, ouverte au doigt par le système. Changer de
 * solide change le rendu tout de suite.
 */
export default function ShapeSelector({ shape, onChange }) {
  const { t } = useTranslation('mathlab');

  return (
    <label className="sa-ml-g3d__field">
      <span className="sa-ml-g3d__field-label">{t('tools.geometry3d.shapeLabel')}</span>
      <select
        className="sa-ml-g3d__select"
        value={shape}
        onChange={(event) => onChange(event.target.value)}
        data-ml-g3d-shape-select
      >
        {SHAPE_IDS.map((id) => (
          <option key={id} value={id}>{t(`tools.geometry3d.shapes.${id}`)}</option>
        ))}
      </select>
    </label>
  );
}
