import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, ArrowLeftRight } from 'lucide-react';
import ValueInput from './ValueInput.jsx';
import SendToMenu from './SendToMenu.jsx';
import { placeValues, roundTo } from './numberTheory.js';
import { formatNumber } from './numberValue.js';

/**
 * §5, §6 — LA VALEUR DE POSITION, rendue physique.
 *
 * L'élève ajoute des unités une à une ; à la dixième, la colonne est pleine
 * et le bouton « اجمع » s'allume. Il l'actionne, les dix unités glissent
 * ensemble et deviennent UNE dizaine. C'est le système décimal non pas
 * expliqué mais VÉCU — et c'est ce que §5 demande explicitement
 * (« the regrouping must be animated »).
 *
 * ── Pourquoi on ne stocke pas les jetons ────────────────────────────────
 * On pourrait garder un tableau de jetons par colonne. On garde un NOMBRE, et
 * les colonnes se déduisent de lui (`placeValues`). Conséquence : il est
 * impossible d'afficher « 12 unités » et « 4582 » en même temps — deux
 * représentations du même nombre ne peuvent pas diverger, parce qu'il n'y a
 * qu'un nombre. C'est le principe de §46 tenu jusque dans ce mode.
 *
 * La seule exception est le moment du regroupement : pendant l'animation, la
 * colonne montre bien dix jetons partants. Cet état vit dans le composant,
 * jamais dans le document (§43).
 */

const REGROUP_MS = 620;

export default function PlaceValueMode({ value, decimals, onChange, onSend, compact, reducedMotion }) {
  const { t } = useTranslation('mathlab');
  const [animation, setAnimation] = useState(null);
  const [announcement, setAnnouncement] = useState('');

  // Les colonnes affichées : toujours au moins les unités, et les décimales
  // quand l'élève les demande (§6).
  const columns = useMemo(() => {
    const high = Math.max(3, String(Math.abs(Math.trunc(value))).length - 1);
    const low = decimals ? -3 : 0;

    return placeValues(value, { minPower: low, maxPower: high });
  }, [value, decimals]);

  const step = useCallback((power) => 10 ** power, []);

  const add = useCallback((power, delta) => {
    const next = roundTo(value + delta * step(power), 6);
    if (Math.abs(next) > 99999) return;
    onChange(next);
    setAnnouncement(t(delta > 0 ? 'tools.numberLab.place.addOne' : 'tools.numberLab.place.removeOne', {
      rank: t(`tools.numberLab.place.ranks.${power}`, String(power)),
    }));
  }, [value, onChange, step, t, decimals]);

  /**
   * LE REGROUPEMENT : dix d'un rang deviennent un du rang supérieur.
   *
   * La valeur du nombre NE CHANGE PAS — c'est tout le propos. On anime, puis
   * on rend la main : le nombre est le même, son écriture s'est réorganisée.
   */
  const regroup = useCallback((power, direction) => {
    const from = power;
    const to = direction === 'up' ? power + 1 : power - 1;
    setAnimation({ from, to, direction });
    setAnnouncement(t(direction === 'up' ? 'tools.numberLab.place.regrouped' : 'tools.numberLab.place.brokeDown', {
      from: t(`tools.numberLab.place.rankShort.${from}`, String(from)),
      to: t(`tools.numberLab.place.rankShort.${to}`, String(to)),
    }));
    // §59 : le mouvement réduit fait du regroupement un saut, pas une absence.
    window.setTimeout(() => setAnimation(null), reducedMotion ? 60 : REGROUP_MS);
  }, [t, reducedMotion]);

  return (
    <div className="sa-ml-nb__mode sa-ml-nb__mode--place">
      <div className="sa-ml-nb__row">
        <ValueInput
          value={value}
          onChange={onChange}
          label={t('tools.numberLab.valueLabel')}
          integer={!decimals}
          min={-99999}
          max={99999}
        />
        <label className="sa-ml-nb__switch">
          <input
            type="checkbox"
            checked={decimals}
            onChange={(event) => onChange(value, { decimals: event.target.checked })}
          />
          <span>{t('tools.numberLab.place.decimalsToggle')}</span>
        </label>
        <SendToMenu value={Math.trunc(value)} onSend={onSend} exclude="place" />
      </div>

      <p className="sa-ml-nb__hint">{t('tools.numberLab.place.hint')}</p>

      <div className={`sa-ml-nb__columns${compact ? ' is-compact' : ''}`} dir="ltr">
        {columns.map((column) => {
          const isAnimatingFrom = animation?.from === column.power;
          const isAnimatingTo = animation?.to === column.power;
          const canRegroupUp = column.digit >= 1 && columns.some((c) => c.power === column.power + 1);
          const canBreakDown = column.digit >= 1 && columns.some((c) => c.power === column.power - 1);

          return (
            <section
              key={column.power}
              className={`sa-ml-nb__column${isAnimatingFrom ? ' is-leaving' : ''}${isAnimatingTo ? ' is-arriving' : ''}`}
            >
              <header className="sa-ml-nb__column-head">
                <span className="sa-ml-nb__column-name">
                  {t(`tools.numberLab.place.ranks.${column.power}`, String(column.power))}
                </span>
                <span className="sa-ml-nb__column-power">
                  {column.power >= 0 ? `10${superscript(column.power)}` : `1/10${superscript(-column.power)}`}
                </span>
              </header>

              {/* Les jetons : ce qu'on compte des yeux. */}
              <div
                className="sa-ml-nb__tokens"
                role="img"
                aria-label={t('tools.numberLab.place.columnLabel', {
                  rank: t(`tools.numberLab.place.ranks.${column.power}`, String(column.power)),
                  digit: column.digit,
                  value: formatNumber(column.value, 6),
                })}
              >
                {Array.from({ length: column.digit }, (_, index) => (
                  <span
                    key={index}
                    className={`sa-ml-nb__token sa-ml-nb__token--p${column.power < 0 ? `m${-column.power}` : column.power}`}
                  />
                ))}
                {column.digit === 0 && <span className="sa-ml-nb__token is-empty" />}
              </div>

              <output className="sa-ml-nb__column-digit">{column.digit}</output>
              <p className="sa-ml-nb__column-value">{formatNumber(column.value, 6)}</p>

              <div className="sa-ml-nb__column-actions">
                <button
                  type="button"
                  className="sa-ml-nb__mini"
                  onClick={() => add(column.power, -1)}
                  disabled={column.digit === 0 && value <= 0}
                  aria-label={t('tools.numberLab.place.removeOne', { rank: t(`tools.numberLab.place.ranks.${column.power}`, String(column.power)) })}
                >
                  <Minus size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="sa-ml-nb__mini"
                  onClick={() => add(column.power, 1)}
                  aria-label={t('tools.numberLab.place.addOne', { rank: t(`tools.numberLab.place.ranks.${column.power}`, String(column.power)) })}
                >
                  <Plus size={14} aria-hidden="true" />
                </button>
              </div>

              {/* §5 : le regroupement, dans les deux sens. */}
              <div className="sa-ml-nb__column-regroup">
                {canRegroupUp && (
                  <button
                    type="button"
                    className="sa-ml-nb__tiny"
                    onClick={() => regroup(column.power, 'up')}
                    title={t('tools.numberLab.place.regroup', {
                      from: t(`tools.numberLab.place.rankShort.${column.power}`, String(column.power)),
                      to: t(`tools.numberLab.place.rankShort.${column.power + 1}`, String(column.power + 1)),
                    })}
                  >
                    <ArrowLeftRight size={12} aria-hidden="true" />
                    10 → 1
                  </button>
                )}
                {canBreakDown && (
                  <button
                    type="button"
                    className="sa-ml-nb__tiny"
                    onClick={() => regroup(column.power, 'down')}
                    title={t('tools.numberLab.place.breakDown', {
                      from: t(`tools.numberLab.place.rankShort.${column.power}`, String(column.power)),
                      to: t(`tools.numberLab.place.rankShort.${column.power - 1}`, String(column.power - 1)),
                    })}
                  >
                    <ArrowLeftRight size={12} aria-hidden="true" />
                    1 → 10
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <p className="sa-ml-nb__total" dir="ltr">
        <span className="sa-ml-nb__total-label">{t('tools.numberLab.place.total')}</span>
        <strong>{formatNumber(value, 6)}</strong>
        {' = '}
        {columns.filter((c) => c.digit !== 0).map((c) => formatNumber(c.value, 6)).join(' + ') || '0'}
      </p>

      <p className="sa-ml-nb__sr" aria-live="polite">{announcement}</p>
    </div>
  );
}

const SUPERSCRIPTS = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶'];
const superscript = (n) => SUPERSCRIPTS[n] ?? String(n);
