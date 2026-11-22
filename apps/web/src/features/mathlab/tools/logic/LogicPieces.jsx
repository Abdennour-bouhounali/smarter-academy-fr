import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { TRUTH_ROWS, rowIndexOf, truthTable, formTable } from './logicMath.js';
import { boolText, formatNumber, SYMBOLS } from './logicFormat.js';

/**
 * Les PIÈCES communes du مختبر المنطق : la notation isolée, la pastille de
 * vérité, la table de vérité, le diagramme d'ensembles.
 *
 * Elles vivent ici parce que six aires les réutilisent — écrire une table de
 * vérité deux fois serait la première étape vers deux tables qui se
 * contredisent. Aucune ne calcule quoi que ce soit : elles reçoivent des
 * valeurs déjà décidées par logicMath.js.
 *
 * ── Deux règles tenues dans CHAQUE pièce ─────────────────────────────────
 * 1. Toute notation est `dir="ltr"` (ARABIC_RTL_CONTRACT §4) : « P ⇒ Q » se
 *    lit de gauche à droite même dans une page arabe.
 * 2. La couleur n'est jamais seule (§45) : V / F accompagne toujours le vert
 *    et le rouge, et un lecteur d'écran reçoit le mot entier.
 */

/**
 * Une notation mathématique, isolée du flux arabe.
 *
 * Elle s'appelle `Notation` et NON `Math` : un composant nommé `Math`
 * masquerait l'objet global `Math` dans tout le module, et le premier
 * `Math.max` du fichier lèverait « Math.max is not a function ». Le piège a
 * déjà coûté un laboratoire (docs/architecture/MATH_LAB.md).
 */
export function Notation({ children, block = false, lead = false, className = '', ...rest }) {
  const classes = ['sa-ml-lg__math', block ? 'sa-ml-lg__math--block' : '', lead ? 'sa-ml-lg__math--lead' : '', className]
    .filter(Boolean).join(' ');

  return (
    <span className={classes} dir="ltr" {...rest}>{children}</span>
  );
}

/**
 * Un ÉNONCÉ : une phrase arabe qui CONTIENT de la notation.
 *
 * Elle ne va PAS en `dir="ltr"`. « إذا كان n زوجيًا فإنّ n² زوجي » est une
 * phrase arabe ; la forcer en LTR en retourne les mots et l'affiche
 * « زوجي n² زوجيًا فإنّ n إذا كان » — ce qui s'était produit sur les titres
 * de preuves, les énoncés à réfuter et les arguments fallacieux.
 *
 * La bonne règle est celle d'ARABIC_RTL_CONTRACT §4 : la PAGE (et donc la
 * phrase) est RTL, et seule la NOTATION s'isole. `dir="auto"` laisse le
 * navigateur suivre le premier caractère fort — arabe ici — et les `n`, `n²`
 * ou `⇒` qu'elle contient sont des runs neutres que l'algorithme bidi place
 * correctement d'eux-mêmes.
 *
 * `<Notation>` reste pour ce qui est PUREMENT de la notation (« P ⇒ Q »,
 * « x² > x ») : là, le LTR est juste.
 */
export function Statement({ children, className = '', ...rest }) {
  return (
    <p className={`sa-ml-lg__statement ${className}`.trim()} dir="auto" {...rest}>
      {children}
    </p>
  );
}

/** V / F / ؟ — la lettre, la couleur, et le mot pour le lecteur d'écran. */
export function TruthBadge({ value }) {
  const { t } = useTranslation('mathlab');
  const tone = value === true ? 'true' : value === false ? 'false' : 'unknown';
  const label = value === true ? t('tools.logic.common.true')
    : value === false ? t('tools.logic.common.false')
      : t('tools.logic.common.undefined');

  return (
    <span className={`sa-ml-lg__badge sa-ml-lg__badge--${tone}`} aria-hidden="true" data-ml-lg-truth={tone}>
      {boolText(value)}
      <span className="sa-ml-lg__sr">{label}</span>
    </span>
  );
}

/** Une pastille « صحيحة / خاطئة » avec son mot — jamais la couleur seule. */
export function VerdictPill({ value, label = null }) {
  const { t } = useTranslation('mathlab');
  const tone = value === true ? 'true' : value === false ? 'false' : 'unknown';
  const text = label ?? (value === true ? t('tools.logic.common.true')
    : value === false ? t('tools.logic.common.false')
      : t('tools.logic.common.undefined'));

  return (
    <span className={`sa-ml-lg__verdict sa-ml-lg__verdict--${tone}`} data-ml-lg-verdict={tone}>
      <TruthBadge value={value} />
      {text}
    </span>
  );
}

/**
 * La TABLE DE VÉRITÉ (§12). Le sujet est `connector` (un connecteur) ou
 * `forms` (plusieurs colonnes : la comparaison de §16 et §24). La ligne
 * courante — celle où (P, Q) valent ce que l'élève a réglé — est mise en
 * évidence par une classe ET par `aria-current`, jamais par la couleur seule.
 */
export const TruthTable = memo(function TruthTable({
  connector = null, forms = null, current = null, caption, columnLabels = null,
}) {
  const { t } = useTranslation('mathlab');
  const currentIndex = current ? rowIndexOf(current.p, current.q) : -1;

  if (connector === 'not') {
    const rows = truthTable('not');

    return (
      <div className="sa-ml-lg__tableWrap">
        <table className="sa-ml-lg__table" data-ml-lg-table="not">
          <caption className="sa-ml-lg__sr">{caption}</caption>
          <thead>
            <tr>
              <th scope="col" dir="ltr">P</th>
              <th scope="col" dir="ltr">{`${SYMBOLS.not}P`}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isCurrent = current?.p === row.p;

              return (
                <tr key={String(row.p)} className={isCurrent ? 'is-current' : ''} aria-current={isCurrent ? 'true' : undefined}>
                  <td className={row.p ? 'is-true' : 'is-false'}>{boolText(row.p)}</td>
                  <td className={row.result ? 'is-true' : 'is-false'}>{boolText(row.result)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  const columns = forms
    ? forms.map((form) => ({ key: form, label: columnLabels?.[form] ?? form, values: formTable(form).map((r) => r.result) }))
    : [{
      key: connector,
      label: columnLabels?.[connector] ?? connector,
      values: truthTable(connector).map((r) => r.result),
    }];

  return (
    <div className="sa-ml-lg__tableWrap">
      <table className="sa-ml-lg__table" data-ml-lg-table={forms ? forms.join('+') : connector}>
        <caption className="sa-ml-lg__sr">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" dir="ltr">P</th>
            <th scope="col" dir="ltr">Q</th>
            {columns.map((column) => (
              <th key={column.key} scope="col" dir="ltr">{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TRUTH_ROWS.map((row, index) => {
            const isCurrent = index === currentIndex;

            return (
              <tr
                key={`${row.p}-${row.q}`}
                className={isCurrent ? 'is-current' : ''}
                aria-current={isCurrent ? 'true' : undefined}
                data-ml-lg-row={index}
              >
                <td className={row.p ? 'is-true' : 'is-false'}>{boolText(row.p)}</td>
                <td className={row.q ? 'is-true' : 'is-false'}>{boolText(row.q)}</td>
                {columns.map((column) => (
                  <td key={column.key} className={column.values[index] ? 'is-true' : 'is-false'} data-ml-lg-cell={column.key}>
                    {boolText(column.values[index])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {forms && forms.length > 1 && (
        <p className="sa-ml-lg__tableNote">{t('tools.logic.connectors.currentRow')}</p>
      )}
    </div>
  );
});

/**
 * §14, §17 — P et Q comme deux RÉGIONS. Le dessin est piloté par la
 * partition réelle (`parts`), donc il ne peut pas mentir : quand `pOnly` est
 * vide, le disque P est réellement DANS le disque Q, et l'inclusion se voit.
 *
 * SVG en `direction: ltr` explicitement : SVG n'hérite pas de `dir`.
 */
export const SetDiagram = memo(function SetDiagram({ parts, pLabel, qLabel, highlight = null, caption }) {
  const pInsideQ = parts.pOnly.length === 0;
  const qInsideP = parts.qOnly.length === 0;
  const same = pInsideQ && qInsideP;

  // Trois dispositions, décidées par la partition elle-même.
  const layout = same
    ? { p: { cx: 150, r: 62 }, q: { cx: 150, r: 62 } }
    : pInsideQ
      ? { p: { cx: 138, r: 40 }, q: { cx: 150, r: 74 } }
      : qInsideP
        ? { p: { cx: 150, r: 74 }, q: { cx: 162, r: 40 } }
        : { p: { cx: 118, r: 62 }, q: { cx: 182, r: 62 } };

  return (
    <svg
      className="sa-ml-lg__svg"
      viewBox="0 0 300 170"
      role="img"
      aria-label={caption}
      style={{ direction: 'ltr' }}
      data-ml-lg-sets={same ? 'same' : pInsideQ ? 'p-in-q' : qInsideP ? 'q-in-p' : 'overlap'}
    >
      <circle
        cx={layout.q.cx} cy={85} r={layout.q.r}
        fill={highlight === 'q' ? '#bfdbfe' : '#dbeafe'} stroke="#2563eb" strokeWidth="2" opacity="0.85"
      />
      <circle
        cx={layout.p.cx} cy={85} r={layout.p.r}
        fill={highlight === 'p' ? '#c7d2fe' : '#e0e7ff'} stroke="#4f46e5" strokeWidth="2" opacity="0.85"
      />
      <text x={layout.p.cx} y={same ? 80 : 85 - layout.p.r + 18} textAnchor="middle" className="sa-ml-lg__svgValue">
        {pLabel}
      </text>
      <text
        x={qInsideP ? layout.q.cx : layout.q.cx + (pInsideQ ? 0 : 6)}
        y={same ? 100 : 85 + layout.q.r - 8}
        textAnchor="middle"
        className="sa-ml-lg__svgLabel"
      >
        {qLabel}
      </text>
    </svg>
  );
});

/**
 * §7 — la vérité comme RÉGIONS d'une droite. On dessine les intervalles
 * rendus par `truthIntervals`, la sonde de l'élève, et les points exclus
 * marqués d'une croix (§6 : le domaine doit se VOIR).
 *
 * ── La droite est GRADUÉE ────────────────────────────────────────────────
 * Une droite sans graduations ne se lit pas : l'élève à qui l'on dit
 * « cherche une valeur » doit voir OÙ il est. Le pas suit une suite 1-2-5
 * comme le grapheur, de sorte qu'une fenêtre [−6 ; 6] montre −6…6 et une
 * fenêtre [0 ; 40] montre 0, 10, 20, 30, 40 — jamais quarante étiquettes
 * serrées. Le défaut avait été trouvé à l'œil, pas par un test.
 */
export const TruthLine = memo(function TruthLine({
  intervals, points = [], excluded = [], min, max, probe = null, marks = [], caption, height = 96,
}) {
  const width = 320;
  const pad = 18;
  const toX = (value) => pad + ((value - min) / (max - min)) * (width - pad * 2);
  // Une valeur hors de la FENÊTRE reste valable (31 réfute « tout premier > 2
  // est pair ») mais ne se dessine pas hors du cadre : elle vit dans le message.
  const visible = (value) => Number.isFinite(value) && value >= min && value <= max;
  const axisY = height - 38;
  const ticks = niceTicks(min, max);

  return (
    <svg
      className="sa-ml-lg__svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={caption}
      style={{ direction: 'ltr' }}
      data-ml-lg-line
    >
      {intervals.map((interval, index) => (
        <rect
          key={`iv-${index}`}
          x={toX(interval.from)}
          y={axisY - 14}
          width={Math.max(1, toX(interval.to) - toX(interval.from))}
          height={28}
          fill={interval.value ? '#bbf7d0' : '#fecaca'}
          opacity="0.9"
          data-ml-lg-interval={interval.value ? 'true' : 'false'}
        />
      ))}

      <line x1={pad} x2={width - pad} y1={axisY} y2={axisY} stroke="#475569" strokeWidth="1.6" />
      <path d={`M ${width - pad} ${axisY} l -8 -4 v 8 z`} fill="#475569" />

      {/* Les graduations : sans elles, « cherche une valeur » n'a pas de sens. */}
      {ticks.map((tick) => (
        <g key={`tick-${tick}`} data-ml-lg-tick={tick}>
          <line
            x1={toX(tick)} x2={toX(tick)}
            y1={axisY - (tick === 0 ? 8 : 5)} y2={axisY + (tick === 0 ? 8 : 5)}
            stroke={tick === 0 ? '#334155' : '#94a3b8'}
            strokeWidth={tick === 0 ? 1.8 : 1.1}
          />
          <text x={toX(tick)} y={axisY + 19} textAnchor="middle" className="sa-ml-lg__svgLabel">
            {formatNumber(tick, 2)}
          </text>
        </g>
      ))}

      {marks.filter((mark) => visible(mark.value)).map((mark) => (
        <g key={`mark-${mark.value}`}>
          <line x1={toX(mark.value)} x2={toX(mark.value)} y1={axisY - 6} y2={axisY + 6} stroke="#334155" strokeWidth="1.4" />
          <text x={toX(mark.value)} y={axisY - 20} textAnchor="middle" className="sa-ml-lg__svgValue">{mark.label}</text>
        </g>
      ))}

      {/* Les points isolés où l'énoncé est vrai (x + 2 = 5). */}
      {points.filter(visible).map((value) => (
        <circle key={`pt-${value}`} cx={toX(value)} cy={axisY} r="5" fill="#15803d" stroke="#ffffff" strokeWidth="2" />
      ))}

      {/* Les valeurs exclues : une croix, parce qu'un trou ne se voit pas. */}
      {excluded.map((value) => (
        <g key={`ex-${value}`} data-ml-lg-excluded={value}>
          <line x1={toX(value) - 5} x2={toX(value) + 5} y1={axisY - 5} y2={axisY + 5} stroke="#b91c1c" strokeWidth="2" />
          <line x1={toX(value) - 5} x2={toX(value) + 5} y1={axisY + 5} y2={axisY - 5} stroke="#b91c1c" strokeWidth="2" />
        </g>
      ))}

      {probe !== null && visible(probe) && (
        <g data-ml-lg-probe-marker={probe}>
          <line x1={toX(probe)} x2={toX(probe)} y1={axisY - 30} y2={axisY + 10} stroke="#4f46e5" strokeWidth="2" />
          <circle cx={toX(probe)} cy={axisY} r="6" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
});

/**
 * Des graduations LISIBLES : un pas de la suite 1-2-5 qui donne entre 4 et 10
 * repères sur l'étendue demandée. Même principe que `gridStep.js` du
 * grapheur — on ne réutilise pas ce module car il raisonne en pixels et en
 * deux dimensions, quand il s'agit ici d'une seule droite de largeur fixe.
 */
function niceTicks(min, max) {
  const span = max - min;
  if (!(span > 0)) return [];
  const raw = span / 8;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * magnitude).find((candidate) => span / candidate <= 10) ?? magnitude * 10;

  const out = [];
  const first = Math.ceil(min / step) * step;
  for (let value = first; value <= max + 1e-9 && out.length < 24; value += step) {
    out.push(Math.round(value * 1e6) / 1e6);
  }

  return out;
}
