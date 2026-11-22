import { useTranslation } from 'react-i18next';
import {
  Triangle, Square, Minus, Dot, Hexagon, Trash2, Undo2, Redo2,
} from 'lucide-react';
import { PRESETS, EXPERIMENTS, MAX_PATTERN_COPIES } from './practice.js';
import { displayToggles } from './scope.js';

/**
 * LES COMMANDES : créer une figure (§4, §33), poser un préréglage (§35),
 * ouvrir une expérience guidée (§41), régler ce qui s'affiche (§34, §45,
 * §46) et répéter un motif (§37).
 *
 * Tout est en boutons et en cases, rien en menu caché : un élève de 4AM doit
 * voir ce qu'il peut faire.
 */
export default function TransformControls({
  settings, onSettingChange, onAddFigure, onClearFigures, figureCount, maxFigures,
  onPreset, onExperiment, activeExperiment,
  pattern, onPatternChange, canUndo, canRedo, onUndo, onRedo, features = null,
}) {
  const { t } = useTranslation('mathlab');
  // Le labo (scope.js) : ses préréglages, ses expériences, ses réglages.
  const presets = features?.presets ?? PRESETS;
  const experiments = features?.experiments ?? EXPERIMENTS;
  const toggles = features ? displayToggles(features) : [
    'grid', 'snap', 'showOriginal', 'showIntermediate', 'trails',
    'showMeasures', 'showAngles', 'labels', 'showInvariants', 'showMatrix',
  ];

  return (
    <div className="sa-ml-tr__controls" data-ml-controls>
      {/* ── §48 : défaire / refaire ─────────────────────────────────── */}
      <section className="sa-ml-tr__panelsection">
        <div className="sa-ml-tr__historyrow" role="group" aria-label={t('tools.transformations.history')}>
          <button
            type="button" className="sa-ml-btn" onClick={onUndo} disabled={!canUndo}
            data-ml-undo
          >
            <Undo2 size={15} aria-hidden="true" />
            <span>{t('tools.transformations.undo')}</span>
          </button>
          <button
            type="button" className="sa-ml-btn" onClick={onRedo} disabled={!canRedo}
            data-ml-redo
          >
            <Redo2 size={15} aria-hidden="true" />
            <span>{t('tools.transformations.redo')}</span>
          </button>
        </div>
      </section>

      {/* ── §4, §33 : créer une figure ──────────────────────────────── */}
      <section className="sa-ml-tr__panelsection">
        <h3 className="sa-ml-tr__paneltitle">{t('tools.transformations.create.title')}</h3>
        <div className="sa-ml-tr__figurerow">
          {[
            ['point', Dot], ['segment', Minus], ['triangle', Triangle],
            ['square', Square], ['rectangle', Square], ['polygon', Hexagon],
          ].map(([kind, Icon]) => (
            <button
              key={kind}
              type="button"
              className="sa-ml-btn sa-ml-tr__figurebtn"
              onClick={() => onAddFigure(kind)}
              disabled={figureCount >= maxFigures}
              data-ml-add-figure={kind}
            >
              <Icon size={15} aria-hidden="true" />
              <span>{t(`tools.transformations.figures.${kind}`)}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="sa-ml-btn sa-ml-tr__danger sa-ml-tr__wide"
          onClick={onClearFigures}
          disabled={figureCount === 0}
          data-ml-clear-figures
        >
          <Trash2 size={15} aria-hidden="true" />
          <span>{t('tools.transformations.create.clear')}</span>
        </button>
        <p className="sa-ml-tr__hint">{t('tools.transformations.create.hint')}</p>
      </section>

      {/* ── §35 : les transformations remarquables ──────────────────── */}
      <section className="sa-ml-tr__panelsection">
        <h3 className="sa-ml-tr__paneltitle">{t('tools.transformations.presets.title')}</h3>
        <div className="sa-ml-tr__presets">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="sa-ml-btn sa-ml-tr__chip"
              onClick={() => onPreset(preset)}
              data-ml-preset={preset.id}
            >
              {t(`tools.transformations.${preset.labelKey}`)}
            </button>
          ))}
        </div>
      </section>

      {/* ── §41, §44 : les expériences guidées ──────────────────────── */}
      <section className="sa-ml-tr__panelsection">
        <h3 className="sa-ml-tr__paneltitle">{t('tools.transformations.experiments.title')}</h3>
        <ul className="sa-ml-tr__experiments">
          {experiments.map((experiment) => (
            <li key={experiment.id}>
              <button
                type="button"
                className={`sa-ml-btn sa-ml-tr__wide${activeExperiment === experiment.id ? ' sa-ml-tr__chip--on' : ''}`}
                onClick={() => onExperiment(experiment.id)}
                aria-pressed={activeExperiment === experiment.id}
                data-ml-experiment={experiment.id}
              >
                {t(`tools.transformations.${experiment.titleKey}`)}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* ── §37 : le motif ──────────────────────────────────────────── */}
      <section className="sa-ml-tr__panelsection">
        <h3 className="sa-ml-tr__paneltitle">{t('tools.transformations.pattern.title')}</h3>
        <label className="sa-ml-tr__control">
          <span className="sa-ml-tr__controllabel">
            {t('tools.transformations.pattern.count')}
            <span dir="ltr" className="sa-ml-tr__unit">{pattern}</span>
          </span>
          <input
            type="range"
            className="sa-ml-tr__slider"
            min={0}
            max={MAX_PATTERN_COPIES}
            step={1}
            value={pattern}
            dir="ltr"
            onChange={(event) => onPatternChange(Number(event.target.value))}
            data-ml-pattern-count
          />
        </label>
        <p className="sa-ml-tr__hint">{t('tools.transformations.pattern.hint')}</p>
      </section>

      {/* ── §34, §45, §46, §27 : ce qui s'affiche ───────────────────── */}
      <section className="sa-ml-tr__panelsection">
        <h3 className="sa-ml-tr__paneltitle">{t('tools.transformations.display.title')}</h3>
        <ul className="sa-ml-tr__toggles">
          {toggles.map((key) => (
            <li key={key}>
              <label className="sa-ml-tr__toggle">
                <input
                  type="checkbox"
                  checked={Boolean(settings[key])}
                  onChange={(event) => onSettingChange(key, event.target.checked)}
                  data-ml-toggle={key}
                />
                <span>{t(`tools.transformations.display.${key}`)}</span>
              </label>
            </li>
          ))}
        </ul>

        {settings.snap && (
          <label className="sa-ml-tr__field">
            <span>{t('tools.transformations.display.snapStep')}</span>
            <select
              className="sa-ml-tr__select"
              value={settings.snapStep}
              onChange={(event) => onSettingChange('snapStep', Number(event.target.value))}
              data-ml-snap-step
            >
              <option value={1}>1</option>
              <option value={0.5}>0,5</option>
              <option value={0.25}>0,25</option>
            </select>
          </label>
        )}
      </section>
    </div>
  );
}
