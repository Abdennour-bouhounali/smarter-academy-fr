import { memo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * L'ESCALIER — la représentation centrale de la récurrence (§3, §12).
 *
 * Deux usages, un seul dessin :
 *
 *   **`steps`** — l'escalier INTERACTIF : une marche par valeur de n, chacune
 *   avec son état (`untested` · `testing` · `correct` · `incorrect`). C'est
 *   le progrès mathématique de l'élève qui monte littéralement l'escalier.
 *   Les marches sont des `<button>` : on clique une marche pour y revenir.
 *
 *   **`hasBase` / `hasStep`** — l'escalier de DÉMONSTRATION, celui qui montre
 *   ce qui arrive quand une moitié du principe manque : sans cas de base le
 *   pied ne se pose jamais, sans le pas un barreau casse et tout ce qui est
 *   au-dessus reste gris.
 *
 * ── Ce que le dessin doit rendre évident ────────────────────────────────
 * §19, §21 : les flèches entre marches. La récurrence n'est pas une
 * collection de vérifications indépendantes, c'est une CHAÎNE — chaque
 * flèche est le « P(n) ⇒ P(n+1) » qui fait tenir l'ensemble, et c'est
 * précisément elle qui manque quand un barreau casse.
 *
 * ── Direction ───────────────────────────────────────────────────────────
 * `direction: ltr` explicite : SVG n'hérite pas de `dir`, et l'escalier
 * monte vers la droite comme un axe des n. C'est de la notation, pas de la
 * prose (ARABIC_RTL_CONTRACT §4).
 *
 * ── Mouvement (§13, §22) ────────────────────────────────────────────────
 * L'animation est portée par une classe CSS qui se désactive entière sous
 * `prefers-reduced-motion` ; l'état, lui, reste visible immédiatement — il
 * ne dépend jamais d'une transition terminée.
 */

const W = 340;
const H = 210;
const PAD_X = 26;
const PAD_Y = 18;
const DEMO_STEPS = 6;

function InductionStairs({
  steps = null,
  currentIndex = null,
  onSelectStep = null,
  hasBase = true,
  hasStep = true,
  breakAt = 3,
  caption,
  /**
   * QUI est cet escalier. L'aire en montre plusieurs — celui des
   * propositions, celui des règles, celui du principe — et sans ce nom les
   * sélecteurs de la QA navigateur en désignaient deux à la fois. C'est
   * exactement le défaut qu'un test e2e attrape et qu'une relecture manque.
   */
  name = null,
}) {
  const { t } = useTranslation('mathlab');

  // Mode démonstration : on fabrique des marches à partir des deux moitiés.
  const model = steps ?? demoSteps(hasBase, hasStep, breakAt);
  const count = model.length;
  const stepW = (W - PAD_X * 2) / count;
  const stepH = (H - PAD_Y * 2) / count;
  const baseY = H - PAD_Y;

  const state = steps
    ? null
    : (!hasBase ? 'no-base' : hasStep ? 'complete' : 'broken');

  return (
    <svg
      className="sa-ml-lg__svg sa-ml-lg__stairs"
      viewBox={`0 0 ${W} ${H}`}
      role={steps ? 'group' : 'img'}
      aria-label={caption}
      style={{ direction: 'ltr' }}
      data-ml-lg-stairs
      data-ml-lg-stairs-kind={steps ? 'climb' : 'demo'}
      data-ml-lg-stairs-name={name ?? undefined}
      data-ml-lg-stairs-state={state ?? undefined}
      data-ml-lg-stairs-reach={state ? String(reachOf(hasBase, hasStep, breakAt, count)) : undefined}
    >
      {/* Les FLÈCHES : la chaîne P(n) ⇒ P(n+1), dessinée sous les marches
          pour ne pas manger leur libellé (§19, §21). */}
      {model.map((step, i) => {
        if (i === count - 1) return null;
        // La flèche relie le HAUT de la marche i au HAUT de la marche i+1 :
        // elle enjambe la contremarche, ce qui est exactement le geste que
        // « P(n) ⇒ P(n+1) » décrit. Ancrée ailleurs, elle flottait à côté de
        // l'escalier au lieu de le gravir (défaut vu en QA visuelle).
        const topOf = (index) => baseY - (index + 1) * stepH;
        const from = PAD_X + (i + 0.72) * stepW;
        const to = PAD_X + (i + 1.3) * stepW;
        const y = topOf(i) - 5;
        const yTo = topOf(i + 1) - 5;
        // Une flèche est « vive » quand la marche d'où elle part est acquise.
        const live = step.status === 'correct';
        const cut = step.status === 'incorrect' || (!steps && !hasStep && i === breakAt - 1);

        return (
          <path
            key={`link-${i}`}
            d={`M ${from} ${y} Q ${(from + to) / 2} ${yTo - 7} ${to} ${yTo}`}
            fill="none"
            stroke={cut ? '#dc2626' : live ? '#4f46e5' : '#cbd5e1'}
            strokeWidth={live ? 2 : 1.3}
            strokeDasharray={cut ? '3 3' : undefined}
            markerEnd={cut ? undefined : `url(#sa-ml-lg-arrow-${live ? 'live' : 'idle'})`}
            data-ml-lg-stairs-link={i}
            data-ml-lg-link-live={String(live)}
          />
        );
      })}

      {model.map((step, i) => {
        const x = PAD_X + i * stepW;
        const y = baseY - (i + 1) * stepH;
        const w = stepW - 3;
        // Une marche PLEINE : la cellule moins un filet. Des marches maigres
        // se lisaient mal et ne « portaient » visiblement rien (QA visuelle).
        const h = Math.max(16, stepH - 2);
        const current = currentIndex === i;
        const tone = toneOf(step.status);
        const label = step.n ?? i + 1;
        // §21 — une marche porte la PROPOSITION, pas seulement un numéro :
        // « P(2) · u₂ < 3 » dit ce qu'on teste, « 2 » ne dit rien. Le texte
        // n'apparaît que si la marche est assez large pour le lire.
        const claim = step.claim && stepW >= 54 ? step.claim : null;

        const common = {
          x, y, width: w, height: h, rx: 4,
          fill: tone.fill,
          stroke: current ? '#4f46e5' : tone.stroke,
          strokeWidth: current ? 2.4 : 1.3,
          strokeDasharray: step.status === 'incorrect' ? '4 3' : undefined,
        };

        const content = (
          <>
            <rect {...common} />
            <text
              x={x + w / 2}
              y={claim ? y + h / 2 - 2 : y + h / 2 + 4}
              textAnchor="middle"
              fontSize="12"
              fontWeight="800"
              fill={tone.ink}
            >
              {step.title ?? label}
            </text>
            {claim && (
              <text
                x={x + w / 2}
                y={y + h / 2 + 11}
                textAnchor="middle"
                fontSize="9.5"
                fill={tone.ink}
                opacity="0.85"
                data-ml-lg-stair-claim
              >
                {claim}
              </text>
            )}
            {step.status === 'correct' && (
              <text x={x + w - 8} y={y + 12} textAnchor="middle" fontSize="10" fontWeight="700" fill="#15803d">✓</text>
            )}
            {step.status === 'incorrect' && (
              <text x={x + w - 8} y={y + 12} textAnchor="middle" fontSize="10" fontWeight="700" fill="#b91c1c">✕</text>
            )}
          </>
        );

        // Interactif : chaque marche est atteignable au clavier (§27).
        if (steps && onSelectStep) {
          return (
            <g
              key={`step-${i}`}
              className={`sa-ml-lg__stair${current ? ' is-current' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={t('tools.logic.induction.climb.stairLabel', {
                n: label,
                status: t(`tools.logic.induction.status.${step.status}`),
              })}
              aria-current={current ? 'step' : undefined}
              onClick={() => onSelectStep(i)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectStep(i);
                }
              }}
              data-ml-lg-stair={i}
              data-ml-lg-stair-n={label}
              data-ml-lg-stair-status={step.status}
              data-ml-lg-stair-current={String(current)}
            >
              {content}
            </g>
          );
        }

        return (
          <g
            key={`step-${i}`}
            data-ml-lg-stair={i}
            data-ml-lg-stair-status={step.status}
          >
            {content}
          </g>
        );
      })}

      {/* Le barreau CASSÉ : là où le pas de récurrence échoue, la montée
          s'arrête. Sans cette marque, l'escalier dirait seulement « gris au
          dessus » — on veut qu'il dise POURQUOI. */}
      {!steps && hasBase && !hasStep && breakAt < count && (
        <text
          x={PAD_X + (breakAt + 0.5) * stepW}
          y={baseY - (breakAt + 1) * stepH - 6}
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill="#b91c1c"
          data-ml-lg-stairs-break
        >
          ✕
        </text>
      )}

      {/* Le pied qui ne se pose pas : sans cas de base, rien ne démarre. */}
      {!steps && !hasBase && (
        <g data-ml-lg-stairs-nofoot>
          <line x1={PAD_X - 16} x2={PAD_X + 8} y1={baseY - 6} y2={baseY - 30} stroke="#b91c1c" strokeWidth="2.5" />
          <line x1={PAD_X - 16} x2={PAD_X + 8} y1={baseY - 30} y2={baseY - 6} stroke="#b91c1c" strokeWidth="2.5" />
        </g>
      )}

      <line x1={PAD_X - 18} x2={W - 6} y1={baseY} y2={baseY} stroke="#475569" strokeWidth="1.4" />
      <text x={W - 4} y={baseY + 14} textAnchor="end" fontSize="11" fill="#64748b">n</text>

      <defs>
        <marker id="sa-ml-lg-arrow-live" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="4.5" markerHeight="4.5" orient="auto">
          <path d="M 0 1 L 7 4 L 0 7 z" fill="#4f46e5" />
        </marker>
        <marker id="sa-ml-lg-arrow-idle" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="4.5" markerHeight="4.5" orient="auto">
          <path d="M 0 1 L 7 4 L 0 7 z" fill="#cbd5e1" />
        </marker>
      </defs>

      <title>{caption ?? t('tools.logic.induction.stairsCaption')}</title>
    </svg>
  );
}

/** La palette d'un état — jamais la couleur seule : ✓ / ✕ l'accompagnent (§27). */
function toneOf(status) {
  switch (status) {
    case 'correct': return { fill: '#bbf7d0', stroke: '#15803d', ink: '#14532d' };
    case 'incorrect': return { fill: '#fecaca', stroke: '#b91c1c', ink: '#7f1d1d' };
    case 'testing': return { fill: '#e0e7ff', stroke: '#4f46e5', ink: '#312e81' };
    default: return { fill: '#f1f5f9', stroke: '#cbd5e1', ink: '#94a3b8' };
  }
}

/** Jusqu'où le raisonnement porte, en mode démonstration. */
function reachOf(hasBase, hasStep, breakAt, count) {
  if (!hasBase) return -1;

  return hasStep ? count - 1 : Math.min(breakAt - 1, count - 1);
}

/** Les marches du mode démonstration, dérivées des deux moitiés du principe. */
function demoSteps(hasBase, hasStep, breakAt) {
  const reach = reachOf(hasBase, hasStep, breakAt, DEMO_STEPS);

  return Array.from({ length: DEMO_STEPS }, (_, i) => ({
    n: i + 1,
    status: i <= reach ? 'correct' : (hasBase && !hasStep && i === breakAt ? 'incorrect' : 'untested'),
  }));
}

export default memo(InductionStairs);
