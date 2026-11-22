import { memo } from 'react';
import {
  Circle, Parentheses, Egg, Spline, Minus, Trash2, Eye, EyeOff,
  MoveHorizontal, FlipHorizontal, RotateCw, Crosshair,
} from 'lucide-react';
import * as C from './conicMath.js';
import * as I from './intersections.js';
import IntersectionSolvePanel from './IntersectionSolvePanel.jsx';
import { formatCanonical, formatLine } from './conicParser.js';
import { isConicObject, isLineObject, MAX_CONICS, MAX_LINES } from './conicState.js';
import { formatValue } from '../functionGrapher/grapherFormat.js';

/**
 * LES COMMANDES (§5, §12, §17, §22, §23, §24, §35) — les curseurs et les
 * boutons qui pilotent la conique sélectionnée.
 *
 * Aucun calcul ici : chaque valeur affichée vient de `features`, que le
 * composant parent a obtenu de `conicMath`. Ce fichier décide de ce qu'on
 * MONTRE et de ce qu'on peut TOUCHER, jamais de ce qui est vrai (§50).
 *
 * ── Pourquoi des curseurs, et pas seulement des champs ───────────────────
 * §5 le demande, et §23 en fait une expérience à part entière : la
 * découverte vient du CONTINU. Voir l'ellipse devenir un cercle quand `b`
 * rejoint `a`, voir la parabole se retourner quand `a` traverse zéro — un
 * champ numérique ne montre pas cela, un curseur si. Chaque curseur est
 * doublé d'un champ pour la valeur exacte : le curseur explore, le champ
 * précise.
 *
 * ── L'ÉQUATION EST ICI AUSSI, et c'est essentiel (§2, §7) ────────────────
 * Le champ d'équation ÉDITABLE vit dans l'inspecteur (« Mesures ») : c'est
 * lui qui tient le sens équation → géométrie. Mais §2 exige que l'élève voie
 * l'équation changer PENDANT qu'il manipule — or manipuler se fait ici, et
 * l'inspecteur est alors sur l'autre onglet, donc invisible. Sans un second
 * affichage, la moitié de la synchronisation à double sens ne se voyait
 * jamais : on poussait un curseur sans rien lire changer.
 *
 * Ce bandeau est donc une LECTURE seule, recalculée à chaque image depuis la
 * conique elle-même — jamais une seconde source de vérité, jamais un champ
 * à tenir en accord avec l'autre. (Demandé en cours de QA visuelle.)
 */

const KIND_ICONS = {
  circle: Circle, parabola: Parentheses, ellipse: Egg, hyperbola: Spline,
};

function ConicControls({
  scene, settings, selected, features, onSelect, onChangeKind, onParameter, onParameterCommit,
  onToggleSetting, onSetSetting, onAddConic, onAddLine, onRemove, onToggleVisible,
  onTransform, onSetLocus, onTrace, t,
}) {
  const conics = scene.objects.filter(isConicObject);
  const lines = scene.objects.filter(isLineObject);
  const isConic = selected && isConicObject(selected);
  const isLine = selected && isLineObject(selected);

  /**
   * §26, §27 — ce que la droite sélectionnée fait à la première conique
   * VISIBLE : 0, 1 ou 2 points.
   *
   * Le calcul appartient au moteur (`intersections.js`) ; on ne fait ici que
   * lui demander et nommer le résultat. C'est la même règle que partout dans
   * ce fichier : décider de ce qu'on MONTRE, jamais de ce qui est vrai (§50).
   */
  const lineReport = (() => {
    if (!isLine) return null;
    const target = conics.find((conic) => conic.visible !== false);
    if (!target) return null;
    const result = I.lineConicIntersection(target, selected);
    if (!result) return null;
    const tone = result.count === 0 ? 'outside' : result.count === 1 ? 'on' : 'inside';

    return {
      count: result.count, classification: result.classification, tone, target,
    };
  })();

  return (
    <div className="sa-ml-cn__controls">
      {/* ── §24 — LES OBJETS de la scène ─────────────────────────────── */}
      <section className="sa-ml-cn__section">
        <h3 className="sa-ml-cn__h3">{t('tools.conics.objects.title')}</h3>
        <ul className="sa-ml-cn__objects">
          {scene.objects.map((object) => {
            const Icon = isLineObject(object) ? Minus : KIND_ICONS[object.kind] ?? Circle;
            const name = isLineObject(object)
              ? t('tools.conics.objects.line')
              : t(`tools.conics.kinds.${object.kind}`);

            return (
              <li key={object.id} className={`sa-ml-cn__object${object.id === scene.selectedId ? ' sa-ml-cn__object--active' : ''}`}>
                <button
                  type="button"
                  className="sa-ml-cn__objectmain"
                  onClick={() => onSelect(object.id)}
                  aria-pressed={object.id === scene.selectedId}
                  data-ml-cn-object={object.id}
                >
                  <span className="sa-ml-cn__swatch" style={{ background: object.color }} aria-hidden="true">
                    <Icon size={13} aria-hidden="true" />
                  </span>
                  <span>{name}</span>
                </button>
                <button
                  type="button"
                  className="sa-ml-btn sa-ml-btn--icon sa-ml-cn__objectbtn"
                  onClick={() => onToggleVisible(object.id, object.visible === false)}
                  aria-label={t(object.visible === false ? 'tools.conics.objects.show' : 'tools.conics.objects.hide')}
                  title={t(object.visible === false ? 'tools.conics.objects.show' : 'tools.conics.objects.hide')}
                >
                  {object.visible === false ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                </button>
                <button
                  type="button"
                  className="sa-ml-btn sa-ml-btn--icon sa-ml-cn__objectbtn"
                  onClick={() => onRemove(object.id)}
                  disabled={isConicObject(object) && conics.length <= 1}
                  aria-label={t('tools.conics.objects.remove')}
                  title={t('tools.conics.objects.remove')}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>

        <div className="sa-ml-cn__addrow">
          {C.CONIC_KINDS.map((kind) => {
            const Icon = KIND_ICONS[kind];

            return (
              <button
                key={kind}
                type="button"
                className="sa-ml-btn sa-ml-btn--ghost sa-ml-cn__add"
                onClick={() => onAddConic(kind)}
                disabled={conics.length >= MAX_CONICS}
                data-ml-cn-add={kind}
              >
                <Icon size={15} aria-hidden="true" />
                <span>{t(`tools.conics.kinds.${kind}`)}</span>
              </button>
            );
          })}
          <button
            type="button"
            className="sa-ml-btn sa-ml-btn--ghost sa-ml-cn__add"
            onClick={onAddLine}
            disabled={lines.length >= MAX_LINES}
            data-ml-cn-add="line"
          >
            <Minus size={15} aria-hidden="true" />
            <span>{t('tools.conics.objects.line')}</span>
          </button>
        </div>
      </section>

      {/* ── §21 — CHANGER DE FAMILLE, même centre ────────────────────── */}
      {isConic && (
        <section className="sa-ml-cn__section">
          <h3 className="sa-ml-cn__h3">{t('tools.conics.family.title')}</h3>
          <div className="sa-ml-cn__segmented" role="group" aria-label={t('tools.conics.family.title')}>
            {C.CONIC_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                className={`sa-ml-cn__seg${selected.kind === kind ? ' sa-ml-cn__seg--active' : ''}`}
                onClick={() => onChangeKind(selected.id, kind)}
                aria-pressed={selected.kind === kind}
                data-ml-cn-kind={kind}
              >
                {t(`tools.conics.kinds.${kind}`)}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── §5, §12, §17, §23 — LES PARAMÈTRES ───────────────────────── */}
      {isConic && (
        <section className="sa-ml-cn__section">
          <h3 className="sa-ml-cn__h3">{t('tools.conics.parameters.title')}</h3>

          {/*
            §2, §7 — L'ÉQUATION EN DIRECT.

            Elle suit le doigt : glisser une poignée du plan ou pousser un
            curseur ci-dessous la réécrit immédiatement. Elle COLLE au haut
            de la section pour rester lisible pendant qu'on fait défiler les
            curseurs — c'est le point de §2 : voir l'équation et la
            géométrie changer ENSEMBLE.
          */}
          <p className="sa-ml-cn__liveeq" dir="ltr" aria-live="polite" data-ml-cn-liveequation>
            {formatCanonical(selected)}
          </p>

          <Slider
            id="h"
            label="h"
            hint={t(selected.kind === 'parabola' ? 'tools.conics.parameters.hVertex' : 'tools.conics.parameters.h')}
            value={selected.h}
            min={-20}
            max={20}
            stepSize={settings.snap ? settings.snapStep : 0.1}
            onChange={(value) => onParameter(selected.id, 'h', value)}
            onCommit={onParameterCommit}
          />
          <Slider
            id="k"
            label="k"
            hint={t(selected.kind === 'parabola' ? 'tools.conics.parameters.kVertex' : 'tools.conics.parameters.k')}
            value={selected.k}
            min={-20}
            max={20}
            stepSize={settings.snap ? settings.snapStep : 0.1}
            onChange={(value) => onParameter(selected.id, 'k', value)}
            onCommit={onParameterCommit}
          />

          {selected.kind === 'circle' && (
            <Slider
              id="r"
              label="r"
              hint={t('tools.conics.parameters.r')}
              value={selected.r}
              min={0.25}
              max={20}
              stepSize={settings.snap ? settings.snapStep : 0.1}
              onChange={(value) => onParameter(selected.id, 'r', value)}
              onCommit={onParameterCommit}
            />
          )}

          {selected.kind === 'parabola' && (
            <Slider
              id="a"
              label="a"
              hint={t('tools.conics.parameters.aParabola')}
              value={selected.a}
              min={-4}
              max={4}
              stepSize={0.05}
              onChange={(value) => onParameter(selected.id, 'a', value)}
              onCommit={onParameterCommit}
            />
          )}

          {(selected.kind === 'ellipse' || selected.kind === 'hyperbola') && (
            <>
              <Slider
                id="a"
                label="a"
                hint={t(`tools.conics.parameters.a${selected.kind === 'ellipse' ? 'Ellipse' : 'Hyperbola'}`)}
                value={selected.a}
                min={0.25}
                max={20}
                stepSize={settings.snap ? settings.snapStep : 0.1}
                onChange={(value) => onParameter(selected.id, 'a', value)}
                onCommit={onParameterCommit}
              />
              <Slider
                id="b"
                label="b"
                hint={t(`tools.conics.parameters.b${selected.kind === 'ellipse' ? 'Ellipse' : 'Hyperbola'}`)}
                value={selected.b}
                min={0.25}
                max={20}
                stepSize={settings.snap ? settings.snapStep : 0.1}
                onChange={(value) => onParameter(selected.id, 'b', value)}
                onCommit={onParameterCommit}
              />
            </>
          )}

          {/* §3 — l'ORIENTATION, là où elle a un sens mathématique */}
          {(selected.kind === 'parabola' || selected.kind === 'hyperbola') && (
            <div className="sa-ml-cn__field">
              <span className="sa-ml-cn__fieldlabel">{t('tools.conics.parameters.orientation')}</span>
              <div className="sa-ml-cn__segmented" role="group">
                {['horizontal', 'vertical'].map((orientation) => (
                  <button
                    key={orientation}
                    type="button"
                    className={`sa-ml-cn__seg${C.orientationOf(selected) === orientation ? ' sa-ml-cn__seg--active' : ''}`}
                    onClick={() => {
                      onParameter(selected.id, 'orientation', orientation);
                      onParameterCommit();
                    }}
                    aria-pressed={C.orientationOf(selected) === orientation}
                    data-ml-cn-orientation={orientation}
                  >
                    {t(`tools.conics.orientations.${selected.kind}.${orientation}`)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* §17 — l'excentricité, LUE pendant qu'on pousse les curseurs */}
          {features && Number.isFinite(features.eccentricity) && selected.kind !== 'parabola' && (
            <p className="sa-ml-cn__readout" data-ml-cn-eccentricity>
              <span>e</span>
              <strong dir="ltr">{formatValue(features.eccentricity)}</strong>
              <span className="sa-ml-cn__hint">
                {t(`tools.conics.eccentricityHint.${features.isCircle ? 'circle' : selected.kind}`)}
              </span>
            </p>
          )}
        </section>
      )}

      {/* ── §26 — LES PARAMÈTRES D'UNE DROITE ────────────────────────── */}
      {isLine && (
        <section className="sa-ml-cn__section">
          <h3 className="sa-ml-cn__h3">{t('tools.conics.lineParameters.title')}</h3>

          {/* §2, §7 — l'équation de la droite, EN DIRECT elle aussi. */}
          <p className="sa-ml-cn__liveeq" dir="ltr" aria-live="polite" data-ml-cn-liveequation>
            {formatLine(selected)}
          </p>

          {/*
            Une droite VERTICALE n'a pas de pente : `x = c` est son équation,
            et lui montrer un curseur « m » serait mentir. On bascule donc
            entre les deux FORMES, et chacune n'expose que ses propres
            paramètres.
          */}
          <div className="sa-ml-cn__field">
            <span className="sa-ml-cn__fieldlabel">{t('tools.conics.lineParameters.form')}</span>
            <div className="sa-ml-cn__segmented" role="group">
              <button
                type="button"
                className={`sa-ml-cn__seg${!selected.vertical ? ' sa-ml-cn__seg--active' : ''}`}
                onClick={() => { onParameter(selected.id, 'vertical', false); onParameterCommit(); }}
                aria-pressed={!selected.vertical}
                data-ml-cn-lineform="slope"
              >
                y = mx + p
              </button>
              <button
                type="button"
                className={`sa-ml-cn__seg${selected.vertical ? ' sa-ml-cn__seg--active' : ''}`}
                onClick={() => { onParameter(selected.id, 'vertical', true); onParameterCommit(); }}
                aria-pressed={Boolean(selected.vertical)}
                data-ml-cn-lineform="vertical"
              >
                x = c
              </button>
            </div>
          </div>

          {selected.vertical ? (
            <Slider
              id="lineX"
              label="c"
              hint={t('tools.conics.lineParameters.x')}
              value={selected.x}
              min={-20}
              max={20}
              stepSize={settings.snap ? settings.snapStep : 0.1}
              onChange={(value) => onParameter(selected.id, 'x', value)}
              onCommit={onParameterCommit}
            />
          ) : (
            <>
              <Slider
                id="slope"
                label="m"
                hint={t('tools.conics.lineParameters.slope')}
                value={selected.slope}
                min={-10}
                max={10}
                stepSize={0.25}
                onChange={(value) => onParameter(selected.id, 'slope', value)}
                onCommit={onParameterCommit}
              />
              <Slider
                id="intercept"
                label="p"
                hint={t('tools.conics.lineParameters.intercept')}
                value={selected.intercept}
                min={-20}
                max={20}
                stepSize={settings.snap ? settings.snapStep : 0.1}
                onChange={(value) => onParameter(selected.id, 'intercept', value)}
                onCommit={onParameterCommit}
              />
            </>
          )}

          {/*
            §26, §27 — ce que la droite FAIT à la conique sélectionnée, lu
            pendant qu'on pousse les curseurs : 0, 1 ou 2 points. C'est
            exactement l'expérience « sécante / tangente / disjointe », et
            elle n'a de sens que là où l'on manipule.
          */}
          {lineReport && (
            <p className={`sa-ml-cn__position sa-ml-cn__position--${lineReport.tone}`} data-ml-cn-linecount={lineReport.count}>
              {t(`tools.conics.lineParameters.intersections.${lineReport.classification}`, { n: lineReport.count })}
            </p>
          )}
          {/* Le compte reste vivant ; la RÉSOLUTION se déroule sur demande, pas à pas. */}
          {lineReport && <IntersectionSolvePanel conic={lineReport.target} line={selected} t={t} />}
        </section>
      )}

      {/* ── §22 — LES TRANSFORMATIONS ────────────────────────────────── */}
      {isConic && (
        <section className="sa-ml-cn__section">
          <h3 className="sa-ml-cn__h3">{t('tools.conics.transform.title')}</h3>
          <p className="sa-ml-cn__note">{t('tools.conics.transform.note')}</p>
          <div className="sa-ml-cn__btnrow">
            <button type="button" className="sa-ml-btn sa-ml-btn--ghost" onClick={() => onTransform({ kind: 'translate', dx: 1, dy: 0 })} data-ml-cn-translate>
              <MoveHorizontal size={15} aria-hidden="true" />
              <span>{t('tools.conics.transform.right')}</span>
            </button>
            <button type="button" className="sa-ml-btn sa-ml-btn--ghost" onClick={() => onTransform({ kind: 'translate', dx: 0, dy: 1 })}>
              <span>{t('tools.conics.transform.up')}</span>
            </button>
            <button type="button" className="sa-ml-btn sa-ml-btn--ghost" onClick={() => onTransform({ kind: 'reflect', axis: 'xAxis' })} data-ml-cn-reflect>
              <FlipHorizontal size={15} aria-hidden="true" />
              <span>{t('tools.conics.transform.reflectX')}</span>
            </button>
            <button type="button" className="sa-ml-btn sa-ml-btn--ghost" onClick={() => onTransform({ kind: 'reflect', axis: 'yAxis' })}>
              <span>{t('tools.conics.transform.reflectY')}</span>
            </button>
            <button type="button" className="sa-ml-btn sa-ml-btn--ghost" onClick={() => onTransform({ kind: 'rotate', quarterTurns: 1 })} data-ml-cn-rotate>
              <RotateCw size={15} aria-hidden="true" />
              <span>{t('tools.conics.transform.quarter')}</span>
            </button>
          </div>
        </section>
      )}

      {/* ── §34, §35 — LA TRACE et LE LIEU ───────────────────────────── */}
      <section className="sa-ml-cn__section">
        <h3 className="sa-ml-cn__h3">{t('tools.conics.explore.title')}</h3>
        <div className="sa-ml-cn__btnrow">
          <button
            type="button"
            className={`sa-ml-btn sa-ml-btn--ghost${scene.trace ? ' sa-ml-btn--active' : ''}`}
            onClick={() => onTrace(scene.trace ? null : (selected?.id ?? conics[0]?.id))}
            aria-pressed={Boolean(scene.trace)}
            data-ml-cn-trace
          >
            <Crosshair size={15} aria-hidden="true" />
            <span>{t('tools.conics.explore.trace')}</span>
          </button>
          <button
            type="button"
            className={`sa-ml-btn sa-ml-btn--ghost${scene.locus?.kind === 'fixedDistance' ? ' sa-ml-btn--active' : ''}`}
            onClick={() => onSetLocus(scene.locus?.kind === 'fixedDistance'
              ? null
              : { kind: 'fixedDistance', focus: scene.probe ?? { x: 0, y: 0 }, distance: 3 })}
            aria-pressed={scene.locus?.kind === 'fixedDistance'}
            data-ml-cn-locus="fixedDistance"
          >
            <span>{t('tools.conics.explore.locusCircle')}</span>
          </button>
          <button
            type="button"
            className={`sa-ml-btn sa-ml-btn--ghost${scene.locus?.kind === 'equidistant' ? ' sa-ml-btn--active' : ''}`}
            onClick={() => onSetLocus(scene.locus?.kind === 'equidistant'
              ? null
              : {
                kind: 'equidistant',
                focus: scene.probe ?? { x: 0, y: 2 },
                directrix: { kind: 'horizontal', value: -2 },
              })}
            aria-pressed={scene.locus?.kind === 'equidistant'}
            data-ml-cn-locus="equidistant"
          >
            <span>{t('tools.conics.explore.locusParabola')}</span>
          </button>
        </div>
        {scene.locus && (
          <p className="sa-ml-cn__note" data-ml-cn-locusnote>
            {t(`tools.conics.explore.locusNote.${scene.locus.kind}`)}
          </p>
        )}
      </section>

      {/* ── LES COUCHES (§20, §31) ───────────────────────────────────── */}
      <section className="sa-ml-cn__section">
        <h3 className="sa-ml-cn__h3">{t('tools.conics.layers.title')}</h3>
        <div className="sa-ml-cn__toggles">
          {[
            'showCenter', 'showVertices', 'showFoci', 'showDirectrix',
            'showAsymptotes', 'showAxes', 'showMeasures', 'showIntersections', 'labels',
          ].map((key) => (
            <label key={key} className="sa-ml-cn__toggle-label">
              <input
                type="checkbox"
                checked={settings[key] !== false}
                onChange={() => onToggleSetting(key)}
                data-ml-cn-layer={key}
              />
              <span>{t(`tools.conics.layers.${key}`)}</span>
            </label>
          ))}
        </div>

        <div className="sa-ml-cn__toggles">
          <label className="sa-ml-cn__toggle-label">
            <input type="checkbox" checked={settings.grid} onChange={() => onToggleSetting('grid')} data-ml-cn-layer="grid" />
            <span>{t('tools.conics.layers.grid')}</span>
          </label>
          <label className="sa-ml-cn__toggle-label">
            <input type="checkbox" checked={settings.snap} onChange={() => onToggleSetting('snap')} data-ml-cn-layer="snap" />
            <span>{t('tools.conics.layers.snap')}</span>
          </label>
        </div>

        {settings.snap && (
          <div className="sa-ml-cn__field">
            <span className="sa-ml-cn__fieldlabel">{t('tools.conics.layers.snapStep')}</span>
            <div className="sa-ml-cn__segmented" role="group">
              {[0.25, 0.5, 1].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`sa-ml-cn__seg${settings.snapStep === value ? ' sa-ml-cn__seg--active' : ''}`}
                  onClick={() => onSetSetting('snapStep', value)}
                  aria-pressed={settings.snapStep === value}
                  dir="ltr"
                >
                  {formatValue(value)}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default memo(ConicControls);

/**
 * UN CURSEUR et son champ — explorer d'un côté, préciser de l'autre (§5).
 *
 * Le curseur émet en CONTINU (`onChange`) et ne commet qu'au relâchement
 * (`onCommit`) : c'est ce qui met un seul pas dans l'historique pour un
 * glissement entier (§45), exactement comme une poignée du plan.
 */
function Slider({
  id, label, hint, value, min, max, stepSize, onChange, onCommit,
}) {
  return (
    <div className="sa-ml-cn__slider" data-ml-cn-param={id}>
      <div className="sa-ml-cn__sliderhead">
        <label htmlFor={`sa-ml-cn-${id}`} className="sa-ml-cn__sliderlabel">
          <span dir="ltr" className="sa-ml-cn__mono">{label}</span>
          {hint && <span className="sa-ml-cn__hint">{hint}</span>}
        </label>
        <input
          type="number"
          className="sa-ml-cn__number"
          value={Number.isFinite(value) ? Number(value.toFixed(4)) : 0}
          min={min}
          max={max}
          step={stepSize}
          dir="ltr"
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isFinite(next)) onChange(next);
          }}
          onBlur={onCommit}
          aria-label={`${label} — ${hint ?? ''}`}
          data-ml-cn-input={id}
        />
      </div>
      <input
        id={`sa-ml-cn-${id}`}
        type="range"
        className="sa-ml-cn__range"
        min={min}
        max={max}
        step={stepSize}
        value={Number.isFinite(value) ? value : 0}
        dir="ltr"
        onChange={(event) => onChange(Number(event.target.value))}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
        data-ml-cn-range={id}
      />
    </div>
  );
}
