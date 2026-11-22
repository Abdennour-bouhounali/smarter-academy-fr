import { memo, useEffect, useRef, useState } from 'react';
import { Check, AlertCircle, Repeat } from 'lucide-react';
import * as C from './conicMath.js';
import {
  parseConicEquation, parseLineEquation, formatCanonical, formatGeneral, formatLine,
} from './conicParser.js';
import { comparisonRows } from './sceneAnalysis.js';
import { formatValue } from '../functionGrapher/grapherFormat.js';
import { buildCanonicalFrames } from './canonicalSteps.js';
import ConicDerivation from './ConicDerivation.jsx';
import { LabPanel } from '../../shared/LabKit.jsx';

/**
 * L'INSPECTEUR (§7, §8, §9, §21, §28, §30, §31, §32, §33, §44).
 *
 * C'est ici que l'ÉQUATION et la GÉOMÉTRIE se parlent dans les deux sens :
 *
 *   géométrie → équation   le champ affiche la forme canonique, recalculée
 *                          à chaque image depuis la conique elle-même ;
 *   équation → géométrie   l'élève écrit, l'analyseur lit, la courbe change.
 *
 * ── Pourquoi le champ n'est pas « contrôlé » au sens habituel ────────────
 * Tant que l'élève n'a pas touché le champ, il MONTRE l'équation de la
 * conique et suit chaque glissement de poignée. Dès qu'il tape, le champ lui
 * appartient — sinon un glissement, ou même un simple rendu, effacerait sa
 * saisie à moitié écrite. Il redevient miroir dès qu'il est validé ou
 * abandonné. C'est le seul moyen d'avoir §7 dans les DEUX sens sans que
 * l'un ne détruise l'autre.
 */

function ConicInspector({
  conic, features, analysis, reference, selected, onApplyEquation, onApplyLine, t,
}) {
  /**
   * L'objet ÉDITÉ est celui que l'élève a sélectionné — conique ou droite.
   *
   * Une droite se manipule comme une conique (§26) : mêmes poignées, mêmes
   * curseurs, même champ d'équation. Il aurait été plus simple de n'éditer
   * que les coniques et de laisser la droite se glisser ; ç'aurait fait deux
   * catégories d'objets, l'une de première classe et l'autre non, dans un
   * laboratoire dont le sujet est justement leur rencontre.
   */
  const editingLine = selected?.kind === 'line';
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState(null);
  /**
   * Le passage développée → canonique d'une équation TAPÉE (`canonicalSteps.js`).
   * Il ne vit que tant que la conique est celle que cette équation a produite :
   * dès qu'on la tire, le champ redevient miroir et le déroulé n'a plus d'objet.
   */
  const [derivation, setDerivation] = useState(null);
  const inputRef = useRef(null);

  const canonical = editingLine ? formatLine(selected) : (conic ? formatCanonical(conic) : '');
  const general = editingLine ? '' : (conic ? formatGeneral(conic) : '');

  // Le champ redevient miroir dès que la conique change SOUS lui — mais
  // seulement quand l'élève n'est pas en train d'écrire.
  useEffect(() => {
    if (draft === null) setError(null);
  }, [canonical, draft]);

  const submit = (event) => {
    event.preventDefault();
    const text = draft ?? canonical;
    const result = editingLine ? parseLineEquation(text) : parseConicEquation(text);
    if (!result.ok) {
      setError(result);
      setDerivation(null);

      return;
    }
    setError(null);
    setDraft(null);
    if (editingLine) {
      setDerivation(null);
    } else {
      const built = buildCanonicalFrames(text, result);
      setDerivation(built.ok ? { ...built, source: text, canonical: formatCanonical(result.conic) } : null);
    }
    if (editingLine) onApplyLine(selected.id, result.line);
    else onApplyEquation(result.conic);
  };

  const degeneracy = conic ? C.degeneracyOf(conic) : 'unknown';

  return (
    <div className="sa-ml-cn__inspector">
      {/* ── §7, §30 — L'ÉQUATION, dans les deux sens ─────────────────── */}
      <section className="sa-ml-cn__section">
        <h3 className="sa-ml-cn__h3">{t('tools.conics.equation.title')}</h3>

        <form onSubmit={submit} className="sa-ml-cn__eqform">
          <label className="sa-ml-cn__sr" htmlFor="sa-ml-cn-equation">
            {t('tools.conics.equation.label')}
          </label>
          <input
            id="sa-ml-cn-equation"
            ref={inputRef}
            className={`sa-ml-cn__eqinput${error ? ' sa-ml-cn__eqinput--error' : ''}`}
            type="text"
            dir="ltr"
            spellCheck={false}
            autoComplete="off"
            value={draft ?? canonical}
            onChange={(event) => { setDraft(event.target.value); setError(null); }}
            onBlur={() => { if (draft === null) setError(null); }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'sa-ml-cn-eqerror' : undefined}
            data-ml-cn-equation
          />
          <button type="submit" className="sa-ml-btn sa-ml-btn--primary" data-ml-cn-eqapply>
            <Check size={16} aria-hidden="true" />
            <span>{t('tools.conics.equation.apply')}</span>
          </button>
        </form>

        {/* §51 — un refus qui ENSEIGNE, en arabe, jamais « erreur » */}
        {error && (
          <p className="sa-ml-cn__error" id="sa-ml-cn-eqerror" role="alert" data-ml-cn-eqerror={error.error}>
            <AlertCircle size={15} aria-hidden="true" />
            <span>{t(`tools.conics.equation.errors.${error.error}`, t('tools.conics.equation.errors.syntax'))}</span>
          </p>
        )}

        {/*
          §30 — la forme DÉVELOPPÉE, l'autre face de la même conique.

          Le bouton la COPIE dans le champ : c'est l'exercice de §30 — on
          part de `x² + y² − 4x − 6y + 9 = 0`, on valide, et la conique
          revient écrite en `(x − 2)² + (y − 3)² = 4`. Montrer les deux
          formes côte à côte n'apprendrait rien ; passer de l'une à l'autre
          par l'analyseur, si.
        */}
        {general && (
          <p className="sa-ml-cn__general" dir="ltr" data-ml-cn-general>{general}</p>
        )}
        {general && (
          <button
            type="button"
            className="sa-ml-btn sa-ml-btn--ghost sa-ml-cn__small"
            onClick={() => { setDraft(general); setError(null); inputRef.current?.focus(); }}
            data-ml-cn-togglegeneral
          >
            <Repeat size={14} aria-hidden="true" />
            <span>{t('tools.conics.equation.expanded')}</span>
          </button>
        )}
        <p className="sa-ml-cn__note">
          {t(editingLine ? 'tools.conics.equation.hintLine' : 'tools.conics.equation.hint')}
        </p>
      </section>

      {/* ── §30 — le passage développée → canonique, pas à pas ───────── */}
      {!editingLine && derivation && derivation.canonical === canonical && (
        <ConicDerivation derivation={derivation} t={t} />
      )}

      {/* ── §31 — LES ÉLÉMENTS REMARQUABLES, extraits ────────────────── */}
      {!editingLine && conic && degeneracy === null && features && (
        <section className="sa-ml-cn__section">
          <h3 className="sa-ml-cn__h3">{t('tools.conics.features.title')}</h3>
          <dl className="sa-ml-cn__facts" data-ml-cn-features>
            {features.center && (
              <Fact label={t('tools.conics.features.center')} value={pointText(features.center)} name="center" />
            )}
            {features.vertex && (
              <Fact label={t('tools.conics.features.vertex')} value={pointText(features.vertex)} name="vertex" />
            )}
            {conic.kind === 'circle' && features.measures && (
              <>
                <Fact label={t('tools.conics.features.radius')} value={formatValue(features.measures.radius)} name="radius" />
                <Fact label={t('tools.conics.features.diameter')} value={formatValue(features.measures.diameter)} name="diameter" />
                <Fact label={t('tools.conics.features.circumference')} value={formatValue(features.measures.circumference)} name="circumference" />
                <Fact label={t('tools.conics.features.area')} value={formatValue(features.measures.area)} name="area" />
              </>
            )}
            {conic.kind !== 'circle' && features.foci?.length > 0 && (
              <Fact
                label={t('tools.conics.features.foci')}
                value={features.foci.map(pointText).join('  ·  ')}
                name="foci"
              />
            )}
            {features.directrix && (
              <Fact
                label={t('tools.conics.features.directrix')}
                value={`${features.directrix.kind === 'horizontal' ? 'y' : 'x'} = ${formatValue(features.directrix.value)}`}
                name="directrix"
              />
            )}
            {features.asymptotes?.length > 0 && (
              <Fact
                label={t('tools.conics.features.asymptotes')}
                value={features.asymptotes.map(lineText).join('  ·  ')}
                name="asymptotes"
              />
            )}
            {conic.kind === 'ellipse' && (
              <>
                <Fact label={t('tools.conics.features.semiMajor')} value={formatValue(features.semiMajor)} name="semiMajor" />
                <Fact label={t('tools.conics.features.semiMinor')} value={formatValue(features.semiMinor)} name="semiMinor" />
                <Fact label={t('tools.conics.features.focalSum')} value={formatValue(features.focalSum)} name="focalSum" />
              </>
            )}
            {conic.kind === 'hyperbola' && (
              <Fact label={t('tools.conics.features.focalDifference')} value={formatValue(features.focalDifference)} name="focalDifference" />
            )}
            {conic.kind === 'parabola' && (
              <>
                <Fact label={t('tools.conics.features.focalDistance')} value={formatValue(features.focalDistance)} name="focalDistance" />
                <Fact label={t('tools.conics.features.opening')} value={t(`tools.conics.openings.${features.opening}`)} name="opening" />
              </>
            )}
            {Number.isFinite(features.eccentricity) && (
              <Fact label={t('tools.conics.features.eccentricity')} value={formatValue(features.eccentricity)} name="eccentricity" />
            )}
          </dl>
        </section>
      )}

      {/* §52 — une conique dégénérée le DIT, et ne dessine rien de faux */}
      {!editingLine && conic && degeneracy !== null && (
        <p className="sa-ml-cn__error" role="alert" data-ml-cn-degenerate={degeneracy}>
          <AlertCircle size={15} aria-hidden="true" />
          <span>{t(`tools.conics.degenerate.${degeneracy}`, t('tools.conics.degenerate.unknown'))}</span>
        </p>
      )}

      {/* ── §10, §28, §32 — LE POINT INTERROGÉ ───────────────────────── */}
      {analysis.probeReport && (
        <section className="sa-ml-cn__section">
          <h3 className="sa-ml-cn__h3">
            {t(analysis.probeReport.onCurve ? 'tools.conics.probe.titleTrace' : 'tools.conics.probe.title')}
          </h3>

          <p className="sa-ml-cn__readout" data-ml-cn-probe>
            <span>P</span>
            <strong dir="ltr">{pointText(analysis.probeReport.point)}</strong>
          </p>

          {/* §32 — LA SUBSTITUTION, montrée : c'est le calcul qu'on enseigne */}
          <p className={`sa-ml-cn__position sa-ml-cn__position--${analysis.probeReport.position}`} data-ml-cn-position={analysis.probeReport.position}>
            {t(`tools.conics.probe.position.${analysis.probeReport.position}`)}
          </p>

          {/* §28 — LA PROPRIÉTÉ FOCALE, MESURÉE, jamais récitée */}
          <FocalReport report={analysis.probeReport} t={t} />
        </section>
      )}

      {/* ── §21 — LE TABLEAU COMPARATIF, avec les VRAIES valeurs ─────── */}
      {conic && features && (
        <LabPanel id="conics.inspector.compare" title={t('tools.conics.compare.title')} className="sa-ml-cn__labpanel">
          <div className="sa-ml-cn__tablewrap">
            <table className="sa-ml-cn__table" data-ml-cn-compare>
              <caption className="sa-ml-cn__sr">{t('tools.conics.compare.caption')}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('tools.conics.compare.property')}</th>
                  {C.CONIC_KINDS.map((kind) => (
                    <th key={kind} scope="col" className={kind === conic.kind ? 'sa-ml-cn__th--active' : ''}>
                      {t(`tools.conics.kinds.${kind}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows(conic, features).map((row) => (
                  <tr key={row.property}>
                    <th scope="row">{t(`tools.conics.compare.rows.${row.property}`)}</th>
                    {C.CONIC_KINDS.map((kind) => {
                      const cell = row.values[kind];

                      return (
                        <td key={kind} className={kind === conic.kind ? 'sa-ml-cn__td--active' : ''} dir={kind === conic.kind ? 'ltr' : undefined}>
                          {t(`tools.conics.compare.${cell.key}`, cell.params ?? {})}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LabPanel>
      )}

      {/* ── §44 — AVANT / APRÈS ──────────────────────────────────────── */}
      {reference && conic && (
        <LabPanel id="conics.inspector.reference" title={t('tools.conics.reference.title')} className="sa-ml-cn__labpanel">
          <div className="sa-ml-cn__beforeafter" data-ml-cn-beforeafter>
            <div>
              <span className="sa-ml-cn__hint">{t('tools.conics.reference.before')}</span>
              <p dir="ltr" className="sa-ml-cn__mono">{formatCanonical(reference.objects.find((o) => C.CONIC_KINDS.includes(o.kind)))}</p>
            </div>
            <div>
              <span className="sa-ml-cn__hint">{t('tools.conics.reference.after')}</span>
              <p dir="ltr" className="sa-ml-cn__mono">{canonical}</p>
            </div>
          </div>
        </LabPanel>
      )}
    </div>
  );
}

export default memo(ConicInspector);

/**
 * §28 — la propriété focale, avec ses DEUX distances et leur somme ou leur
 * différence. Le texte ne dit jamais « le théorème affirme » : il montre les
 * nombres, et laisse l'élève constater qu'ils ne bougent pas.
 */
function FocalReport({ report, t }) {
  const { check, kind } = report;
  if (!check) return null;

  const rows = [];
  if (Number.isFinite(check.d1)) rows.push(['PF₁', check.d1]);
  if (Number.isFinite(check.d2)) rows.push(['PF₂', check.d2]);
  if (kind === 'parabola') {
    rows.length = 0;
    rows.push(['PF', check.toFocus], ['Pd', check.toDirectrix]);
  }

  const total = kind === 'ellipse' ? check.sum
    : kind === 'hyperbola' ? check.difference
      : kind === 'circle' ? check.d1 : null;

  return (
    <div className="sa-ml-cn__focal" data-ml-cn-focal={check.property}>
      <dl className="sa-ml-cn__facts">
        {rows.map(([label, value]) => (
          <Fact key={label} label={label} value={formatValue(value)} name={label} />
        ))}
        {total !== null && (
          <Fact
            label={t(`tools.conics.probe.${kind === 'hyperbola' ? 'difference' : kind === 'ellipse' ? 'sum' : 'distance'}`)}
            value={formatValue(total)}
            name="focalTotal"
            strong
          />
        )}
      </dl>
      <p className={`sa-ml-cn__verdict${check.equal ? ' sa-ml-cn__verdict--ok' : ''}`} data-ml-cn-focalequal={check.equal ? 'true' : 'false'}>
        {t(check.equal
          ? `tools.conics.probe.holds.${check.property}`
          : 'tools.conics.probe.offCurve')}
      </p>
    </div>
  );
}

function Fact({ label, value, name, strong = false }) {
  return (
    <div className="sa-ml-cn__fact" data-ml-cn-fact={name}>
      <dt>{label}</dt>
      <dd dir="ltr" className={strong ? 'sa-ml-cn__fact--strong' : undefined}>{value}</dd>
    </div>
  );
}

const pointText = (p) => (C.isPoint(p) ? `(${formatValue(p.x)} ; ${formatValue(p.y)})` : '—');
const lineText = (line) => `y = ${formatValue(line.slope)}x ${line.intercept < 0 ? '−' : '+'} ${formatValue(Math.abs(line.intercept))}`;
