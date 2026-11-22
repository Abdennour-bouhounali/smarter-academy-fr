import { useTranslation } from 'react-i18next';
import { formatValue } from './analysisFormat.js';

/** La hauteur de la piste où montent et descendent les valeurs de f. */
const TRACK = 92;

/**
 * Le tableau de variations, tel qu'on l'écrit au lycée.
 *
 * Il ne calcule rien : `variationTable.js` a déjà posé les colonnes, les
 * signes et la hauteur de chaque valeur. Ce composant les met en page.
 *
 * ── Pourquoi une GRILLE et non un `<table>` ──────────────────────────────
 * Un tableau de variations n'est pas un tableau de données : la POSITION
 * VERTICALE d'une valeur y porte du sens (une valeur en haut est un maximum,
 * en bas un minimum), et une flèche traverse obliquement sa case. Un
 * `<table>` sémantique force chaque valeur au centre de sa cellule et perd
 * exactement ce que le tableau dit.
 *
 * On garde donc la lisibilité pour un lecteur d'écran par une description
 * textuelle complète (`aria-label` sur chaque colonne et un résumé caché),
 * et la mise en page par une grille CSS. C'est le même arbitrage que le
 * labo de trigonométrie fait pour son cercle.
 *
 * ── Sens de lecture ──────────────────────────────────────────────────────
 * Le tableau se lit de gauche à droite : x croît vers la DROITE (−∞ à
 * gauche), comme sur le graphe juste à côté. Le `dir="ltr"` de la grille
 * le garantit même si la page changeait de sens.
 */
export default function VariationTable({ table, functionName = 'f', rows = 4 }) {
  const { t } = useTranslation('mathlab');

  if (!table?.ok) {
    return (
      <p className="sa-ml-an__note" data-ml-an-vartable="empty">
        {t(`tools.analysis.variationTable.${table?.reason === 'tooNarrow' ? 'tooNarrow' : 'unavailable'}`)}
      </p>
    );
  }

  /**
   * `rows` : la CONSTRUCTION pas à pas (variationTable.js › buildVariationSteps).
   * 1 = la ligne x et les zéros / barres de f′, 2 = + les signes, 3 = + les
   * flèches, 4 = + les valeurs (le tableau complet). Une ligne future n'est
   * pas rendue du tout ; la phrase du lecteur d'écran, qui DIT le tableau,
   * n'existe qu'une fois le tableau complet.
   */
  if (rows < 1) return null;
  const complete = rows >= 4;
  const { columns, intervals } = table;
  /**
   * La grille : un LIBELLÉ de ligne, puis colonne / intervalle / colonne…
   *
   * Les rangées sont NOMMÉES explicitement (`gridRow`), pas laissées au flux
   * implicite : un libellé qui s'étend sur `1 / -1` ouvre une rangée à lui
   * seul, et le placement automatique poussait alors les flèches hors de
   * leur ligne — la QA visuelle a vu un tableau sans aucune flèche.
   */
  const gridTemplate = `auto ${columns.map(() => 'auto 1fr').slice(0, -1).join(' ')} auto`;
  const ROW_X = 1;
  const ROW_D = 2;
  const ROW_F = 3;
  /** La colonne de grille d'une colonne du tableau (1 = libellé). */
  const colOf = (index) => index * 2 + 2;
  /** Celle d'un intervalle : juste après sa colonne de gauche. */
  const gapOf = (index) => index * 2 + 3;

  return (
    <figure
      className="sa-ml-an__vartable"
      data-ml-an-vartable={complete ? 'ok' : 'building'}
      data-ml-an-varrows={Math.min(rows, 4)}
    >
      <figcaption className="sa-ml-an__vartitle">{t('tools.analysis.variationTable.title')}</figcaption>

      <div className="sa-ml-an__varscroll">
        <div className="sa-ml-an__vargrid" dir="ltr" style={{ gridTemplateColumns: gridTemplate }}>

          {/* ── Ligne x ─────────────────────────────────────────────────── */}
          <div className="sa-ml-an__varrowlabel" style={{ gridRow: ROW_X, gridColumn: 1 }} dir="ltr">x</div>
          {columns.map((column, index) => (
            <div
              key={`x-${index}`} className="sa-ml-an__varx"
              style={{ gridRow: ROW_X, gridColumn: colOf(index) }}
            >
              {formatValue(column.x, 2)}
            </div>
          ))}

          {/* ── Ligne f′(x) : le SIGNE entre les colonnes, le zéro dessus ── */}
          <div className="sa-ml-an__varrowlabel" style={{ gridRow: ROW_D, gridColumn: 1 }} dir="ltr">
            {functionName}′(x)
          </div>
          {columns.map((column, index) => (
            <div
              key={`d-${index}`} className="sa-ml-an__vard"
              style={{ gridRow: ROW_D, gridColumn: colOf(index) }}
            >
              {column.kind === 'break'
                ? <span className="sa-ml-an__varbar" aria-hidden="true">‖</span>
                : column.derivativeZero ? '0' : ''}
            </div>
          ))}
          {rows >= 2 && intervals.map((interval, index) => (
            <SignCell key={`s-${index}`} interval={interval} column={gapOf(index)} row={ROW_D} t={t} />
          ))}

          {/* ── Ligne f(x) : les valeurs à leur HAUTEUR, les flèches entre ── */}
          {rows >= 3 && (
            <div className="sa-ml-an__varrowlabel" style={{ gridRow: ROW_F, gridColumn: 1 }} dir="ltr">
              {functionName}(x)
            </div>
          )}
          {complete && columns.map((column, index) => (
            <ValueCell key={`v-${index}`} column={column} gridColumn={colOf(index)} row={ROW_F} t={t} />
          ))}
          {rows >= 3 && intervals.map((interval, index) => (
            <ArrowCell key={`a-${index}`} interval={interval} column={gapOf(index)} row={ROW_F} t={t} />
          ))}
        </div>
      </div>

      {/* Ce que le tableau DIT, en une phrase, pour un lecteur d'écran —
          seulement quand il est complet : avant, elle donnerait la réponse. */}
      {complete && <p className="sa-ml-an__sr">{describe(table, functionName, t)}</p>}
    </figure>
  );
}

/** Le signe de f′ sur un intervalle : `+`, `−`, ou rien si on ne tranche pas. */
function SignCell({ interval, column, row, t }) {
  const symbol = interval.sign > 0 ? '+' : interval.sign < 0 ? '−' : interval.sign === 0 ? '0' : '?';
  const label = interval.sign > 0
    ? t('tools.analysis.variationTable.positive')
    : interval.sign < 0 ? t('tools.analysis.variationTable.negative') : '';

  return (
    <div
      className={`sa-ml-an__varsign${interval.sign > 0 ? ' is-positive' : interval.sign < 0 ? ' is-negative' : ''}`}
      style={{ gridRow: row, gridColumn: column }}
      aria-label={label}
      data-ml-an-varsign={interval.sign}
    >
      {symbol}
    </div>
  );
}

/**
 * La valeur de f, posée en HAUT, en BAS ou à MI-HAUTEUR de la piste.
 *
 * La hauteur est l'information : haut = maximum ou fin de montée, bas =
 * minimum ou fin de descente, milieu = point stationnaire qui n'est pas un
 * extremum (x³ en 0) — que §17 interdit de faire passer pour un extremum.
 */
function ValueCell({ column, gridColumn, row, t }) {
  const position = column.middle ? 'center' : column.high ? 'flex-start' : 'flex-end';

  return (
    <div
      className="sa-ml-an__varvalue"
      style={{ gridRow: row, gridColumn, minHeight: TRACK, justifyContent: position }}
      data-ml-an-varcell={column.kind}
      data-ml-an-varpos={column.middle ? 'middle' : column.high ? 'high' : 'low'}
    >
      {column.kind === 'break' ? (
        <span className="sa-ml-an__varbar" title={t('tools.analysis.variationTable.undefinedHere')}>‖</span>
      ) : column.infinite ? (
        /**
         * Au bord de la fenêtre, la fonction FILE : on écrit sa limite, pas
         * la valeur qu'elle atteint là où le cadre s'arrête. « 430,61 » au
         * bout de x³ laissait croire à un maximum ; « +∞ » dit la vérité.
         */
        <span className="sa-ml-an__varnum sa-ml-an__varinf" data-ml-an-varinf={column.infinite > 0 ? '+' : '-'}>
          {column.infinite > 0 ? '+∞' : '−∞'}
        </span>
      ) : (
        <span className={`sa-ml-an__varnum${column.extremum === 'min' || column.extremum === 'max' ? ' is-extremum' : ''}`}>
          {column.value === null ? '—' : formatValue(column.value, 2)}
        </span>
      )}
    </div>
  );
}

/** La flèche d'un intervalle : ↗ pour une montée, ↘ pour une descente. */
function ArrowCell({ interval, column, row, t }) {
  const up = interval.direction === 'increasing';
  const down = interval.direction === 'decreasing';
  const label = up
    ? t('tools.analysis.study.increasing')
    : down ? t('tools.analysis.study.decreasing') : t('tools.analysis.study.constant');

  return (
    <div
      className={`sa-ml-an__vararrow${up ? ' is-up' : down ? ' is-down' : ''}`}
      style={{ gridRow: row, gridColumn: column, minHeight: TRACK }}
      aria-label={label}
      data-ml-an-vararrow={interval.direction}
    >
      <span aria-hidden="true">{up ? '↗' : down ? '↘' : '→'}</span>
    </div>
  );
}

/**
 * Le tableau en UNE phrase — ce qu'un lecteur d'écran lit à la place d'une
 * grille dont toute l'information est dans la position.
 */
function describe(table, functionName, t) {
  const edges = table.columns
    .filter((column) => column.infinite)
    .map((column) => `${t('tools.analysis.variationTable.towards')} ${column.infinite > 0 ? '+∞' : '−∞'}`);
  const parts = table.intervals.map((interval) => {
    const direction = interval.direction === 'increasing'
      ? t('tools.analysis.study.increasing')
      : interval.direction === 'decreasing'
        ? t('tools.analysis.study.decreasing')
        : t('tools.analysis.study.constant');

    return `${direction} ${t('tools.analysis.variationTable.on')} ]${formatValue(interval.from, 2)} ; ${formatValue(interval.to, 2)}[`;
  });

  return `${functionName} : ${[...parts, ...edges].join(' ; ')}`;
}
