import { useTranslation } from 'react-i18next';
import { LabPanel } from '../../shared/LabKit.jsx';
import { AlertCircle } from 'lucide-react';
import {
  formatDegrees, formatRadians, formatRatio, formatSign, formatLength,
  quadrantKey,
} from './trigFormat.js';
import { quadrantSigns } from './trigMath.js';

/**
 * L'INSPECTEUR (§31) — ce que l'élève LIT pendant qu'il manipule.
 *
 * Rien n'est calculé ici : l'état mathématique arrive tout fait de
 * `stateAt()` (§39). Le composant ne décide que de la mise en page et des
 * mots.
 *
 * ── La notation reste LTR (§36) ──────────────────────────────────────────
 * `sin(θ) = √3/2` et `(1/2 ; √3/2)` se lisent de gauche à droite dans une
 * page arabe. Chaque valeur est donc posée dans un conteneur `dir="ltr"` —
 * sans quoi le bidi retournerait la parenthèse et le point-virgule, et
 * l'élève lirait le couple à l'envers. Les LIBELLÉS, eux, suivent la page.
 */
export default function TrigInspector({
  state, valueMode, unit, highlight, identityPanel, tanPanel, onHighlight, children = null,
  readings = null,
}) {
  // Le مخبر (scope.js) : au collège, ni radians, ni point du cercle, ni quadrant.
  const show = { radians: true, point: true, quadrant: true, signTable: true, ...(readings ?? {}) };
  const { t } = useTranslation('mathlab');
  const { degrees, normalized, sin, cos, tan, signs, identity, quadrant, axis } = state;

  const sinReading = formatRatio(degrees, 'sin', sin, valueMode);
  const cosReading = formatRatio(degrees, 'cos', cos, valueMode);
  const tanReading = formatRatio(degrees, 'tan', tan, valueMode);

  return (
    <section className="sa-ml-trig__inspector" aria-label={t('tools.trigonometry.inspectorHeading')}>
      {/* ── θ, dans les deux unités, avec son équivalent (§15) ────────── */}
      <div className="sa-ml-trig__theta" data-ml-trig-theta>
        <span className="sa-ml-trig__theta-label">θ</span>
        <span className="sa-ml-trig__theta-main" dir="ltr">
          {unit === 'rad' ? formatRadians(degrees) : formatDegrees(degrees, 1)}
        </span>
        {show.radians && (
        <span className="sa-ml-trig__theta-alt" dir="ltr">
          {unit === 'rad' ? formatDegrees(degrees, 1) : formatRadians(degrees)}
        </span>
        )}
      </div>

      {/* L'angle équivalent, seulement quand il diffère (§14, §15). */}
      {!state.isNormalized && (
        <p className="sa-ml-trig__equivalent" data-ml-trig-equivalent>
          {t('tools.trigonometry.equivalentTo')}{' '}
          <strong dir="ltr">{formatDegrees(normalized, 1)}</strong>
          {state.turns !== 0 && (
            <span className="sa-ml-trig__turns">
              {' '}{t('tools.trigonometry.turns', { count: Math.abs(state.turns) })}
            </span>
          )}
        </p>
      )}

      {/* ── Le point (§31) ───────────────────────────────────────────── */}
      {show.point && (
      <div className="sa-ml-trig__row">
        <span className="sa-ml-trig__row-label">{t('tools.trigonometry.point')}</span>
        <span className="sa-ml-trig__row-value" dir="ltr" data-ml-trig-point>
          {`(${cosReading.text} ; ${sinReading.text})`}
        </span>
      </div>
      )}

      {/* ── Les trois rapports, cliquables : SOH-CAH-TOA (§10) ────────── */}
      <div className="sa-ml-trig__ratios" role="group" aria-label={t('tools.trigonometry.ratiosHeading')}>
        {[
          ['sin', sinReading, 'opposite', 'hypotenuse'],
          ['cos', cosReading, 'adjacent', 'hypotenuse'],
          ['tan', tanReading, 'opposite', 'adjacent'],
        ].map(([ratio, reading, numerator, denominator]) => (
          <button
            key={ratio}
            type="button"
            className={`sa-ml-trig__ratio${highlight === ratio ? ' sa-ml-trig__ratio--on' : ''}${reading.isUndefined ? ' sa-ml-trig__ratio--undefined' : ''}`}
            onClick={() => onHighlight?.(ratio)}
            aria-pressed={highlight === ratio}
            data-ml-trig-ratio={ratio}
            title={t('tools.trigonometry.ratioHint', {
              ratio,
              numerator: t(`tools.trigonometry.sides.${numerator}`),
              denominator: t(`tools.trigonometry.sides.${denominator}`),
            })}
          >
            <span className="sa-ml-trig__ratio-name" dir="ltr">{`${ratio}(θ)`}</span>
            <span className="sa-ml-trig__ratio-value" dir="ltr" data-ml-trig-value={ratio}>
              {reading.text}
            </span>
            {reading.approx && (
              <span className="sa-ml-trig__ratio-approx" dir="ltr">{`≈ ${reading.approx}`}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Le quadrant et ses signes (§5, §20) ──────────────────────── */}
      {show.quadrant && (
      <div className="sa-ml-trig__quadbox" data-ml-trig-quadrant-readout>
        <span className="sa-ml-trig__row-label">{t('tools.trigonometry.quadrantLabel')}</span>
        <strong className="sa-ml-trig__quadname">{t(quadrantKey({ quadrant, axis }))}</strong>
        <span className="sa-ml-trig__signs" dir="ltr">
          {['sin', 'cos', 'tan'].map((ratio) => (
            <span key={ratio} className="sa-ml-trig__signchip" data-ml-trig-sign={ratio}>
              <span className="sa-ml-trig__signchip-name">{ratio}</span>
              <span className={`sa-ml-trig__signchip-value sa-ml-trig__signchip-value--${signs[ratio] === null ? 'undef' : signs[ratio] > 0 ? 'pos' : signs[ratio] < 0 ? 'neg' : 'zero'}`}>
                {signs[ratio] === null ? '∅' : formatSign(signs[ratio])}
              </span>
            </span>
          ))}
        </span>
      </div>
      )}

      {/* « D'un seul regard » (§3.5) : ce que l'élève a déclenché (la
          résolution du triangle) vient JUSTE sous les rapports, à côté du
          dessin ; les tables de référence suivent, dans des LabPanel. */}
      {children}

      {/* ── La table des signes, avec la ligne courante (§20) ─────────── */}
      {show.signTable && (
      <LabPanel id="trigonometry.inspector.signs" title={t('tools.trigonometry.signTableCaption')} className="sa-ml-trig__labpanel">
      <table className="sa-ml-trig__signtable" data-ml-trig-signtable>
        <caption className="sa-ml-trig__caption">{t('tools.trigonometry.signTableCaption')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('tools.trigonometry.quadrantShort')}</th>
            <th scope="col" dir="ltr">sin</th>
            <th scope="col" dir="ltr">cos</th>
            <th scope="col" dir="ltr">tan</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4].map((q) => {
            const rowSigns = quadrantSigns(q);
            const current = q === quadrant;

            return (
              <tr
                key={q}
                className={current ? 'sa-ml-trig__signrow--current' : undefined}
                data-ml-trig-signrow={q}
                aria-current={current ? 'true' : undefined}
              >
                <th scope="row">
                  {t(`tools.trigonometry.quadrants.q${q}`)}
                  {/* §37 : jamais la couleur seule — la ligne courante est ANNONCÉE. */}
                  {current && <span className="sa-ml-trig__sr"> — {t('tools.trigonometry.currentRow')}</span>}
                </th>
                {['sin', 'cos', 'tan'].map((ratio) => (
                  <td key={ratio} dir="ltr" className={rowSigns[ratio] > 0 ? 'sa-ml-trig__cell--pos' : 'sa-ml-trig__cell--neg'}>
                    {formatSign(rowSigns[ratio])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      </LabPanel>
      )}

      {/* ── tan = sin / cos (§23) ────────────────────────────────────── */}
      {tanPanel && (
        <LabPanel id="trigonometry.inspector.tan" title={<bdi dir="ltr">tan(θ) = sin(θ) / cos(θ)</bdi>} className="sa-ml-trig__labpanel">
        <div className="sa-ml-trig__tanpanel" data-ml-trig-tanpanel>
          <div className="sa-ml-trig__tanline" dir="ltr">
            <span className="sa-ml-trig__formula-frac">
              <span className="sa-ml-trig__formula-num">{sinReading.text}</span>
              <span className="sa-ml-trig__formula-bar" />
              <span className="sa-ml-trig__formula-den">{cosReading.text}</span>
            </span>
            <span className="sa-ml-trig__formula-eq">=</span>
            <span className={`sa-ml-trig__formula-value${tanReading.isUndefined ? ' sa-ml-trig__formula-value--undef' : ''}`}>
              {tanReading.text}
            </span>
          </div>
          {tanReading.isUndefined && (
            <p className="sa-ml-trig__note sa-ml-trig__note--warn" role="status" data-ml-trig-tannote>
              <AlertCircle size={15} aria-hidden="true" />
              {t('tools.trigonometry.tanUndefinedNote')}
            </p>
          )}
          {!tanReading.isUndefined && Math.abs(cos) < 0.18 && (
            <p className="sa-ml-trig__note" role="status">
              {t('tools.trigonometry.tanGrowingNote', { cos: formatLength(Math.abs(cos), 3) })}
            </p>
          )}
        </div>
        </LabPanel>
      )}

      {/* ── sin²θ + cos²θ = 1, EN BARRE (§22) ─────────────────────────── */}
      {identityPanel && identity && (
        <LabPanel id="trigonometry.inspector.identity" title={<bdi dir="ltr">sin²(θ) + cos²(θ) = 1</bdi>} className="sa-ml-trig__labpanel">
        <div className="sa-ml-trig__identity" data-ml-trig-identity>
          {/* La balance de §22 : deux parts qui se compensent exactement. */}
          <div
            className="sa-ml-trig__bar"
            role="img"
            aria-label={t('tools.trigonometry.identityBarLabel', {
              sin: formatLength(identity.sinSquared, 2),
              cos: formatLength(identity.cosSquared, 2),
            })}
          >
            <span
              className="sa-ml-trig__bar-sin"
              style={{ width: `${identity.sinSquared * 100}%` }}
              data-ml-trig-barsin
            />
            <span
              className="sa-ml-trig__bar-cos"
              style={{ width: `${identity.cosSquared * 100}%` }}
              data-ml-trig-barcos
            />
          </div>
          <dl className="sa-ml-trig__identity-rows" dir="ltr">
            <div>
              <dt>sin²(θ)</dt>
              <dd data-ml-trig-sinsq>{formatLength(identity.sinSquared, 3)}</dd>
            </div>
            <div>
              <dt>cos²(θ)</dt>
              <dd data-ml-trig-cossq>{formatLength(identity.cosSquared, 3)}</dd>
            </div>
            <div className="sa-ml-trig__identity-sum">
              <dt>{t('tools.trigonometry.sum')}</dt>
              <dd data-ml-trig-sum>{formatLength(identity.sum, 3)}</dd>
            </div>
          </dl>
        </div>
        </LabPanel>
      )}
    </section>
  );
}

