import { useTranslation } from 'react-i18next';
import { formatValue, formatMaybeExact, formatApproximate, formatPoint } from './analysisFormat.js';

/**
 * LA LECTURE VIVE : les deux ou trois nombres de l'expérience en cours,
 * TOUJOURS visibles, quel que soit l'onglet ouvert.
 *
 * ── Pourquoi ce composant existe ─────────────────────────────────────────
 * Le panneau a trois onglets : الضبط (on règle), القراءة (on lit), التمارين.
 * Tant que la lecture n'existait QUE dans son onglet, un élève qui tirait le
 * curseur de b dans الضبط ne voyait AUCUN nombre changer : il fallait
 * basculer sur القراءة, où plus rien ne bougeait. La boucle même de
 * l'instrument — « أغيّر شيئًا → أرى النتيجة مباشرة → ألاحظ العلاقة » (§3) —
 * était coupée en deux par une navigation.
 *
 * La QA l'a rendu visible sans le nommer : le script de test devait basculer
 * d'onglet entre CHAQUE geste et CHAQUE lecture pour vérifier une pente.
 * Si le test doit le faire, l'élève aussi.
 *
 * Ce bandeau porte donc l'ESSENTIEL — jamais toute l'analyse, qui reste dans
 * القراءة — au-dessus des onglets, là où il ne peut pas disparaître. Il ne
 * calcule rien : il lit la scène déjà résolue, comme le reste de l'affichage.
 *
 * Ce qu'il montre dépend du laboratoire, parce que « le nombre qui compte »
 * n'est pas le même : le ميل pour la sécante, f′(a) pour le مماس, la valeur
 * de la limite, l'aire pour le تكامل.
 */
export default function LiveReadout({ data, scene }) {
  const { t } = useTranslation('mathlab');
  if (!scene || scene.error) return null;

  const cells = cellsFor(data, scene, t);
  if (cells.length === 0) return null;

  return (
    <dl className="sa-ml-an__live" data-ml-an-live={data.lab} aria-live="polite">
      {cells.map((cell) => (
        <div key={cell.key} className="sa-ml-an__livecell" data-ml-an-live-cell={cell.key}>
          <dt className="sa-ml-an__livelabel" dir="ltr">{cell.label}</dt>
          <dd className="sa-ml-an__livevalue" dir="ltr">{cell.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Les nombres qui comptent, laboratoire par laboratoire.
 *
 * On en montre DEUX ou TROIS, jamais plus : un bandeau de huit valeurs ne se
 * lit pas d'un coup d'œil pendant qu'on tire un curseur, et §44 interdit le
 * fouillis. Le reste vit dans القراءة.
 */
function cellsFor(data, scene, t) {
  const key = 'tools.analysis';

  switch (data.lab) {
    case 'secant': {
      if (!scene.rate?.ok) return [];

      return [
        { key: 'deltaX', label: 'Δx', value: formatValue(data.secondPoint - data.point, 3) },
        { key: 'deltaY', label: 'Δy', value: formatValue(scene.rate.fb - scene.rate.fa, 3) },
        { key: 'slope', label: t(`${key}.secant.slope`), value: formatValue(scene.rate.slope, 4), strong: true },
      ];
    }

    case 'tangent':
    case 'derivative': {
      const cells = [];
      if (scene.pointA) {
        cells.push({ key: 'x', label: 'x', value: formatValue(scene.pointA.x, 3) });
        cells.push({ key: 'fx', label: 'f(x)', value: formatValue(scene.pointA.y, 3) });
      }
      const info = scene.tangentInfo;
      cells.push({
        key: 'slope',
        label: "f′(x)",
        // §35 : une pente mesurée porte son « ≈ », une pente symbolique non.
        value: info?.ok ? formatMaybeExact(info.slope, info.exact, 3) : '—',
        strong: true,
      });

      return cells;
    }

    case 'limit': {
      const limit = scene.limit;
      if (!limit) return [];
      const side = (entry) => {
        if (!entry) return '—';
        if (entry.kind === 'finite') return formatApproximate(entry.value, 3);
        if (entry.kind === 'infinite') return entry.sign < 0 ? '−∞' : '+∞';

        return '—';
      };

      return [
        { key: 'left', label: `x → ${formatValue(data.limitPoint, 2)}⁻`, value: side(limit.left) },
        { key: 'right', label: `x → ${formatValue(data.limitPoint, 2)}⁺`, value: side(limit.right) },
      ];
    }

    case 'integral': {
      const cells = [];
      if (scene.area?.signed?.ok) {
        cells.push({
          key: 'integral',
          label: `∫ [${formatValue(data.bounds.a, 2)} ; ${formatValue(data.bounds.b, 2)}]`,
          value: formatApproximate(scene.area.signed.value, 4),
          strong: true,
        });
      }
      if (scene.riemann) {
        cells.push({ key: 'n', label: 'n', value: String(data.riemann.n) });
        cells.push({ key: 'sum', label: 'Σ', value: formatApproximate(scene.riemann.sum, 4) });
      }

      return cells;
    }

    case 'study': {
      const cells = [];
      if (Array.isArray(scene.roots)) {
        cells.push({
          key: 'roots',
          label: t(`${key}.study.roots`),
          value: scene.roots.length ? scene.roots.map((root) => formatValue(root.x, 2)).join(' ؛ ') : '—',
        });
      }
      if (Array.isArray(scene.extrema) && scene.extrema.length > 0) {
        cells.push({
          key: 'extrema',
          label: t(`${key}.study.extrema`),
          value: scene.extrema.map((point) => formatPoint(point.x, point.y, 2)).join(' '),
        });
      }

      return cells;
    }

    case 'transform': {
      return [
        { key: 'a', label: 'a', value: formatValue(data.parameters.a, 2) },
        { key: 'b', label: 'b', value: formatValue(data.parameters.b, 2) },
        { key: 'c', label: 'c', value: formatValue(data.parameters.c, 2) },
      ];
    }

    default:
      return [];
  }
}
