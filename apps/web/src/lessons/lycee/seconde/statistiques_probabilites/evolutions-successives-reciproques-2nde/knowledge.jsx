import React from 'react';
import MathText from '../../../../common/components/MathText';

/** Connaissances de « Évolutions successives et réciproques » — SOURCE UNIQUE (KNOWLEDGE_MAP.md). */

/** La chaîne 100 → 120 → 96, figure fondatrice de la leçon. */
const ChainFigure = ({ width = 250 }) => (
  <svg viewBox="0 0 250 76" aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: width }}>
    {[{ x: 6, v: '100', c: '#64748b' }, { x: 95, v: '120', c: '#059669' }, { x: 184, v: '96', c: '#e11d48' }].map((b) => (
      <g key={b.v}>
        <rect x={b.x} y={22} width={60} height={32} rx="6" fill="#fff" stroke={b.c} strokeWidth="2" />
        <text x={b.x + 30} y={43} textAnchor="middle" fontSize="14" fontWeight="800" fill={b.c}>{b.v} €</text>
      </g>
    ))}
    <text x={81} y={18} textAnchor="middle" fontSize="10" fontWeight="700" fill="#059669">×1,20</text>
    <text x={81} y={44} textAnchor="middle" fontSize="16" fill="#cbd5e1">→</text>
    <text x={170} y={18} textAnchor="middle" fontSize="10" fontWeight="700" fill="#e11d48">×0,80</text>
    <text x={170} y={44} textAnchor="middle" fontSize="16" fill="#cbd5e1">→</text>
    <text x={125} y={70} textAnchor="middle" fontSize="10" fill="#64748b">1,20 × 0,80 = 0,96 → −4 %</text>
  </svg>
);

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'base-mouvante',
        type: 'concepts',
        title: 'Chaque évolution part de la valeur courante',
        summary: 'La seconde évolution s’applique à la valeur DÉJÀ modifiée, pas à la valeur de départ — c’est pourquoi deux taux opposés ne se compensent pas.',
        visual: <ChainFigure />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              +20 % sur 100 € ajoute 20 € ; −20 % sur <strong>120 €</strong> retire <strong>24 €</strong>. Le pourcentage
              est le même, la base ne l’est pas. On arrive à 96 €, soit <strong>−4 %</strong>.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Une hausse et une baisse de même taux laissent <strong>toujours</strong> moins que le départ, jamais plus.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le vélo à 100 €, revenu à 96 €.</div>
          </div>
        ),
      },
      {
        id: 'ordre-sans-importance',
        type: 'regles',
        title: 'L’ordre des évolutions ne change pas l’arrivée',
        summary: 'Hausse puis baisse, ou baisse puis hausse : les étapes diffèrent, le résultat final est le même.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>100 → 120 → 96 et 100 → 80 → 96. Les chemins passent par des valeurs différentes, mais aboutissent au même prix : c’est la signature d’une multiplication.</p>
          </div>
        ),
      },
      {
        id: 'mem-ne-sannule-pas',
        type: 'memoriser',
        title: '⭐ +20 % puis −20 % ≠ 0 %',
        summary: 'Deux taux opposés ne s’annulent pas : ×1,20 × 0,80 = 0,96, soit −4 %.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">1,20 × 0,80 = 0,96</div>
            <p className="text-xs text-rose-700">100 € → 120 € → 96 € — il manque 4 %</p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'coefficient-global',
        type: 'regles',
        title: 'Le coefficient global est le PRODUIT des coefficients',
        summary: 'Enchaîner des évolutions revient à multiplier leurs coefficients : k = k₁ × k₂ × … × kₙ.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-violet-100 p-3 text-center">
              <MathText>{'$$V_f = V_i \\times k_1 \\times k_2 \\times \\dots \\times k_n$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              +10 %, +5 % puis +2 % : k = 1,10 × 1,05 × 1,02 = 1,1781. Un seul nombre résume toute la chaîne, quel que
              soit le nombre d’étapes.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le bloc « du départ à l’arrivée », toujours égal au produit.</div>
          </div>
        ),
      },
      {
        id: 'methode-composer',
        type: 'methodes',
        title: 'Enchaîner plusieurs évolutions',
        summary: 'Traduire chaque taux en coefficient (1 + t), multiplier les coefficients, puis appliquer à la valeur initiale.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Chaque taux → son coefficient : +50 % → 1,5 ; −40 % → 0,6.</li>
              <li>Multiplier : 1,5 × 0,6 = 0,9.</li>
              <li>Appliquer : V_f = V_i × 0,9.</li>
            </ol>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">
              Une hausse « plus grande » que la baisse ne garantit pas un gain : 1,5 × 0,6 = 0,9, soit −10 %.
            </div>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'taux-global',
        type: 'formules',
        title: 'Taux d’évolution global',
        summary: 't_global = k_global − 1, où k_global est le produit des coefficients. Les taux ne s’additionnent JAMAIS.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-sky-100 p-3 text-center">
              <MathText>{'$$t_{\\text{global}} = k_1 \\times k_2 \\times \\dots - 1$$'}</MathText>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">+10 % puis +10 % → 1,21, soit <strong>+21 %</strong> (et non +20 %)</div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">−10 % puis −10 % → 0,81, soit <strong>−19 %</strong> (et non −20 %)</div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">+8 % puis −5 % → 1,026, soit <strong>+2,6 %</strong> (et non +3 %)</div>
            </div>
          </div>
        ),
      },
      {
        id: 'somme-jamais',
        type: 'regles',
        title: 'La somme des taux ne décrit pas la chaîne',
        summary: 'Elle ne coïncide avec le taux global que si l’un des taux est nul — c’est-à-dire s’il n’y a qu’une évolution.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>Le « +1 % » supplémentaire de +10 % puis +10 % correspond aux 10 % appliqués aux 10 % déjà gagnés.</p>
            <p>Deux baisses successives ne peuvent jamais atteindre −100 % : 0,7 × 0,7 = 0,49, soit −51 % et non −60 %.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la ligne « somme des taux annoncés », qui ne tombe jamais juste.</div>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'evolution-reciproque',
        type: 'concepts',
        title: 'Évolution réciproque',
        summary: 'Celle qui ramène exactement à la valeur de départ : son coefficient est l’INVERSE, k’ = 1/k.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 text-center">
              <MathText>{'$$k \\times k\' = 1 \\quad\\Longleftrightarrow\\quad k\' = \\frac{1}{k}$$'}</MathText>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">Annuler +25 % (×1,25) → ×0,80, soit <strong>−20 %</strong></div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">Annuler −20 % (×0,80) → ×1,25, soit <strong>+25 %</strong></div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">Annuler −50 % (×0,50) → ×2, soit <strong>+100 %</strong></div>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Le taux réciproque n’est <strong>pas l’opposé</strong> : −25 % n’annule pas +25 %.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l’écart rouge qui ne se referme qu’en un seul point.</div>
          </div>
        ),
      },
      {
        id: 'formule-taux-reciproque',
        type: 'formules',
        title: 'Taux réciproque',
        summary: 't’ = 1/(1 + t) − 1.',
        body: (
          <div className="space-y-2">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 text-center">
              <MathText>{'$$t\' = \\frac{1}{1 + t} - 1 \\qquad t = 0{,}25 \\Rightarrow t\' = \\frac{1}{1{,}25} - 1 = -0{,}20$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">Annuler une baisse demande une hausse plus grande en valeur absolue ; annuler une hausse demande une baisse plus petite.</p>
          </div>
        ),
      },
      {
        id: 'mem-inverse-pas-oppose',
        type: 'memoriser',
        title: '⭐ Pour revenir : l’INVERSE, pas l’opposé',
        summary: 'k’ = 1/k. Annuler +25 % demande −20 %.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-2xl font-black text-rose-700">k’ = 1 / k</div>
            <p className="text-xs text-rose-700">1 ÷ 1,25 = 0,80 → −20 % · 1 ÷ 0,80 = 1,25 → +25 %</p>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'retrouver-valeur-initiale',
        type: 'methodes',
        title: 'Retrouver la valeur initiale',
        summary: 'V_i = V_f ÷ k_global : pour remonter une chaîne, on DIVISE par le coefficient global.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-cyan-100 p-3 text-center">
              <MathText>{'$$V_i \\times k = V_f \\quad\\Longrightarrow\\quad V_i = \\frac{V_f}{k}$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              Après −20 %, un manteau coûte 96 € : le prix initial était 96 ÷ 0,80 = <strong>120 €</strong>.
              Vérification : 120 × 0,80 = 96 ✓.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Ajouter 20 % au prix soldé donnerait 115,20 € : les 20 % de la remise portaient sur 120 €, pas sur 96 €.
            </div>
          </div>
        ),
      },
      {
        id: 'verification-systematique',
        type: 'methodes',
        title: 'Toujours vérifier en redescendant',
        summary: 'Une fois la valeur initiale trouvée, lui appliquer la chaîne doit redonner la valeur finale.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>8 800 habitants après +10 % puis −20 % : k = 0,88, donc V_i = 8 800 ÷ 0,88 = 10 000. Vérification : 10 000 → 11 000 → 8 800 ✓.</p>
            <p>Cette vérification coûte une multiplication et détecte immédiatement une division faite à l’envers.</p>
          </div>
        ),
      },
    ],
    6: [
      {
        id: 'methode-choisir-operation',
        type: 'methodes',
        title: 'Composer, inverser ou remonter ?',
        summary: 'Lire l’énoncé pour décider de l’opération avant de calculer : produit, inverse, ou division.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ul className="list-disc list-inside space-y-1">
              <li>Plusieurs évolutions et on veut l’arrivée → <strong>multiplier</strong> les coefficients.</li>
              <li>On veut revenir au départ → <strong>inverser</strong> le coefficient (1/k).</li>
              <li>On connaît l’arrivée et on cherche le départ → <strong>diviser</strong> par le coefficient global.</li>
            </ul>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
              « Le CA a baissé de 10 % après une hausse de 10 % » : 1,10 × 0,90 = 0,99 — il manque 1 %, sans qu’aucun montant soit nécessaire.
            </div>
          </div>
        ),
      },
    ],
  },
};
