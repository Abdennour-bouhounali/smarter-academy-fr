import { useTranslation } from 'react-i18next';
import { Check, X, Minus } from 'lucide-react';
import { formatValue } from '../functionGrapher/grapherFormat.js';
import VectorColumn from '../vectors/VectorColumn.jsx';
import * as M from './transformMath.js';
import { VERTEX_NAMES } from './transformState.js';
import { analyzeInvariants, coordinateFormula, cumulativeMatrix } from './transformModel.js';

/**
 * L'INSPECTEUR : tout ce que l'élève LIT — les mesures de la figure (§6), la
 * table original/image (§25), les invariants (§24), la formule en
 * coordonnées (§26), le شعاع du déplacement (§28) et, sur demande, la
 * matrice (§27).
 *
 * Il ne calcule RIEN : `analyzeInvariants`, `coordinateFormula` et
 * `cumulativeMatrix` sont des fonctions pures du modèle, appelées ici et
 * testées ailleurs. Le composant choisit seulement ce qui se montre et dans
 * quel ordre.
 *
 * ── La direction ─────────────────────────────────────────────────────────
 * Le panneau suit la page (RTL, arabe). Mais chaque NOTATION — `A(3, 2)`,
 * `AB = 5`, la formule, la matrice — est enfermée dans un `dir="ltr"` :
 * l'écriture mathématique est LTR partout dans le monde, y compris dans un
 * manuel algérien (§52, ARABIC_RTL_CONTRACT).
 */
export default function TransformInspector({ figures, steps, settings, activeStepId }) {
  const { t } = useTranslation('mathlab');
  const entry = figures[0];
  if (!entry) {
    return <p className="sa-ml-tr__empty">{t('tools.transformations.inspector.noFigure')}</p>;
  }

  const { figure, image } = entry;
  const source = figure.vertices;
  const moved = !M.sameVertices(source, image);
  const invariants = analyzeInvariants(source, image);
  const activeStep = steps.find((step) => step.id === activeStepId) ?? steps.find((step) => step.enabled !== false) ?? null;
  const formula = activeStep ? coordinateFormula(activeStep, source) : null;
  const matrix = cumulativeMatrix(source, steps);
  const degenerate = source.length >= 3 && M.isDegenerate(source);

  return (
    <div className="sa-ml-tr__inspector" data-ml-inspector>
      {/* ── §6 : la figure elle-même ────────────────────────────────── */}
      <section className="sa-ml-tr__panelsection">
        <h3 className="sa-ml-tr__paneltitle">{t(`tools.transformations.figures.${figure.kind}`)}</h3>

        {degenerate && (
          <p className="sa-ml-tr__warning" data-ml-degenerate>{t('tools.transformations.inspector.degenerate')}</p>
        )}

        <dl className="sa-ml-tr__facts">
          {source.map((vertex, index) => (
            <div className="sa-ml-tr__fact" key={index}>
              <dt>{VERTEX_NAMES[index]}</dt>
              <dd dir="ltr"><Coords point={vertex} /></dd>
            </div>
          ))}
        </dl>

        {source.length >= 2 && (
          <dl className="sa-ml-tr__facts">
            {M.sideLengths(source).slice(0, source.length === 2 ? 1 : source.length).map((length, index) => (
              <div className="sa-ml-tr__fact" key={index}>
                <dt dir="ltr">{`${VERTEX_NAMES[index]}${VERTEX_NAMES[(index + 1) % source.length]}`}</dt>
                <dd dir="ltr">{formatValue(length)}</dd>
              </div>
            ))}
          </dl>
        )}

        {source.length >= 3 && (
          <dl className="sa-ml-tr__facts">
            <div className="sa-ml-tr__fact">
              <dt>{t('tools.transformations.inspector.perimeter')}</dt>
              <dd dir="ltr" data-ml-perimeter>{formatValue(M.perimeter(source))}</dd>
            </div>
            <div className="sa-ml-tr__fact">
              <dt>{t('tools.transformations.inspector.area')}</dt>
              <dd dir="ltr" data-ml-area>{formatValue(M.area(source))}</dd>
            </div>
          </dl>
        )}

        {source.length >= 3 && (
          <dl className="sa-ml-tr__facts">
            {M.interiorAngles(source).map((angle, index) => (
              <div className="sa-ml-tr__fact" key={index}>
                <dt dir="ltr">{`∠${VERTEX_NAMES[index]}`}</dt>
                <dd dir="ltr">{Number.isFinite(angle) ? `${formatValue(angle, 1)}°` : '—'}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {/* ── §26 : la formule, avec les VRAIS paramètres ─────────────── */}
      {formula && (
        <section className="sa-ml-tr__panelsection">
          <h3 className="sa-ml-tr__paneltitle">{t('tools.transformations.inspector.formula')}</h3>
          <p className="sa-ml-tr__formula" dir="ltr" data-ml-formula>
            {t(`tools.transformations.formulas.${formula.key}`, formatParams(formula.params))}
          </p>
        </section>
      )}

      {/* ── §25 : la table original → image ─────────────────────────── */}
      {moved && (
        <section className="sa-ml-tr__panelsection">
          <h3 className="sa-ml-tr__paneltitle">{t('tools.transformations.inspector.comparison')}</h3>
          <table className="sa-ml-tr__table" data-ml-table>
            <thead>
              <tr>
                <th scope="col">{t('tools.transformations.inspector.property')}</th>
                <th scope="col">{t('tools.transformations.inspector.original')}</th>
                <th scope="col">{t('tools.transformations.inspector.image')}</th>
              </tr>
            </thead>
            <tbody>
              {source.map((vertex, index) => (
                <tr key={`v-${index}`}>
                  <th scope="row" dir="ltr">{VERTEX_NAMES[index]}</th>
                  <td dir="ltr"><Coords point={vertex} /></td>
                  <td dir="ltr"><Coords point={image[index]} /></td>
                </tr>
              ))}
              {invariants?.distances && source.length >= 2 && (
                <tr>
                  <th scope="row" dir="ltr">{`${VERTEX_NAMES[0]}${VERTEX_NAMES[1]}`}</th>
                  <td dir="ltr">{formatValue(invariants.distances.before[0])}</td>
                  <td dir="ltr">{formatValue(invariants.distances.after[0])}</td>
                </tr>
              )}
              {invariants?.perimeter && (
                <tr>
                  <th scope="row">{t('tools.transformations.inspector.perimeter')}</th>
                  <td dir="ltr">{formatValue(invariants.perimeter.before)}</td>
                  <td dir="ltr">{formatValue(invariants.perimeter.after)}</td>
                </tr>
              )}
              {invariants?.area && (
                <tr>
                  <th scope="row">{t('tools.transformations.inspector.area')}</th>
                  <td dir="ltr">{formatValue(invariants.area.before)}</td>
                  <td dir="ltr" data-ml-imagearea>{formatValue(invariants.area.after)}</td>
                </tr>
              )}
              {invariants?.angles && (
                <tr>
                  <th scope="row" dir="ltr">{`∠${VERTEX_NAMES[0]}`}</th>
                  <td dir="ltr">{`${formatValue(invariants.angles.before[0], 1)}°`}</td>
                  <td dir="ltr">{`${formatValue(invariants.angles.after[0], 1)}°`}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* §19 : le rapport des aires — la découverte, écrite en toutes lettres. */}
          {invariants?.area && Number.isFinite(invariants.area.ratio) && !invariants.area.preserved && (
            <p className="sa-ml-tr__ratio" data-ml-arearatio>
              <span dir="ltr">{`A′ / A = ${formatValue(invariants.area.ratio)}`}</span>
            </p>
          )}
        </section>
      )}

      {/* ── §28 : le شعاع du déplacement ─────────────────────────────── */}
      {moved && (
        <section className="sa-ml-tr__panelsection">
          <h3 className="sa-ml-tr__paneltitle">{t('tools.transformations.inspector.displacement')}</h3>
          <dl className="sa-ml-tr__facts">
            <div className="sa-ml-tr__fact">
              <dt dir="ltr">{`${VERTEX_NAMES[0]}${VERTEX_NAMES[0]}′`}</dt>
              <dd dir="ltr" data-ml-displacement>
                <VectorColumn vector={{ x: image[0].x - source[0].x, y: image[0].y - source[0].y }} />
              </dd>
            </div>
            <div className="sa-ml-tr__fact">
              <dt>{t('tools.transformations.inspector.magnitude')}</dt>
              <dd dir="ltr">{formatValue(M.distance(source[0], image[0]))}</dd>
            </div>
          </dl>
        </section>
      )}

      {/* ── §24 : les invariants, MESURÉS ───────────────────────────── */}
      {settings.showInvariants && invariants && moved && (
        <section className="sa-ml-tr__panelsection">
          <h3 className="sa-ml-tr__paneltitle">{t('tools.transformations.inspector.invariants')}</h3>
          <ul className="sa-ml-tr__invariants" data-ml-invariants>
            <Invariant label={t('tools.transformations.invariants.distances')} state={invariants.distances?.preserved} name="distances" t={t} />
            {invariants.angles && <Invariant label={t('tools.transformations.invariants.angles')} state={invariants.angles.preserved} name="angles" t={t} />}
            {invariants.area && <Invariant label={t('tools.transformations.invariants.area')} state={invariants.area.preserved} name="area" t={t} />}
            <Invariant label={t('tools.transformations.invariants.perimeter')} state={invariants.perimeter?.preserved} name="perimeter" t={t} />
            <Invariant label={t('tools.transformations.invariants.parallelism')} state={invariants.parallelism?.preserved} name="parallelism" t={t} />
            {invariants.orientation && <Invariant label={t('tools.transformations.invariants.orientation')} state={invariants.orientation.preserved} name="orientation" t={t} />}
            <Invariant label={t('tools.transformations.invariants.coordinates')} state={invariants.coordinates?.preserved} name="coordinates" t={t} />
          </ul>
        </section>
      )}

      {/* ── §27 : la matrice, cachée par défaut ─────────────────────── */}
      {settings.showMatrix && (
        <section className="sa-ml-tr__panelsection">
          <h3 className="sa-ml-tr__paneltitle">{t('tools.transformations.inspector.matrix')}</h3>
          <div className="sa-ml-tr__matrix" dir="ltr" data-ml-matrix>
            <span className="sa-ml-tr__bracket" aria-hidden="true">(</span>
            <table>
              <tbody>
                <tr><td>{formatValue(matrix.a)}</td><td>{formatValue(matrix.c)}</td></tr>
                <tr><td>{formatValue(matrix.b)}</td><td>{formatValue(matrix.d)}</td></tr>
              </tbody>
            </table>
            <span className="sa-ml-tr__bracket" aria-hidden="true">)</span>
          </div>
          <p className="sa-ml-tr__matrixnote" dir="ltr">
            {'+ '}
            <VectorColumn vector={{ x: matrix.e, y: matrix.f }} />
          </p>
          <p className="sa-ml-tr__matrixdet">
            {t('tools.transformations.inspector.determinant')}
            {' '}
            <span dir="ltr">{formatValue(M.determinant(matrix))}</span>
          </p>
        </section>
      )}
    </div>
  );
}

/** Un couple de coordonnées, toujours LTR, toujours avec la virgule décimale. */
function Coords({ point }) {
  if (!M.isPoint(point)) return <>—</>;

  return <>{`(${formatValue(point.x)} ; ${formatValue(point.y)})`}</>;
}

/**
 * Une ligne d'invariant.
 *
 * ✓ / ✗ ne sont PAS seuls : chacun porte un mot (« محفوظ » / « يتغيّر ») et
 * un `aria-label`. §53 interdit de distinguer par la seule couleur ou la
 * seule icône.
 */
function Invariant({ label, state, name, t }) {
  const known = typeof state === 'boolean';
  const Icon = known ? (state ? Check : X) : Minus;
  const word = known
    ? t(state ? 'tools.transformations.invariants.kept' : 'tools.transformations.invariants.changed')
    : '—';

  return (
    <li
      className={`sa-ml-tr__invariant${known ? (state ? ' sa-ml-tr__invariant--kept' : ' sa-ml-tr__invariant--changed') : ''}`}
      data-ml-invariant={name}
      data-ml-kept={known ? String(state) : undefined}
    >
      <Icon size={16} aria-hidden="true" />
      <span className="sa-ml-tr__invariantlabel">{label}</span>
      <span className="sa-ml-tr__invariantstate">{word}</span>
    </li>
  );
}

/** Les paramètres d'une formule, formatés pour la lecture (virgule, vrai moins). */
function formatParams(params) {
  return Object.fromEntries(Object.entries(params ?? {}).map(([key, value]) => [
    key,
    typeof value === 'number' ? formatValue(value, 2) : value,
  ]));
}
