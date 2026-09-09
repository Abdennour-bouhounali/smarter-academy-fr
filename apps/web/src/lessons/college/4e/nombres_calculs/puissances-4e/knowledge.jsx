import React from 'react';
import { decimalDeDix } from './components/puissances4e';

/**
 * Connaissances de la leçon « Puissances » (4e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md). Aucun module n'écrit son propre
 * résumé.
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules :
 *
 *     la descente ÷ base (M1)
 *          ↓
 *     exposant négatif, a⁻ⁿ = 1/aⁿ (M2)
 *          ↓
 *     règles opératoires (M3)  ← comptées sur les facteurs
 *          ↓
 *     notation scientifique (M4)
 *          ↓
 *     ordres de grandeur (M5)
 *
 * Rien n'y est arbitraire : la notation scientifique (M4) EXIGE l'exposant
 * négatif (M2) pour écrire les petits nombres, et les ordres de grandeur (M5)
 * exigent la notation scientifique pour être comparés.
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées au module
 * qui le déclare.
 *
 * Ce que cette carte NE contient PAS : le sens de la puissance, l'exposant
 * qui compte les facteurs, le carré, le cube, les carrés parfaits. Ce sont
 * les acquis de 5e, listés dans `priorKnowledge` et diagnostiqués au module 0.
 */

/** L'échelle des puissances de 10, en petit — réutilisée par les items. */
const Echelle = ({ de = 3, a = -3 }) => {
  const rows = [];
  for (let e = de; e >= a; e -= 1) rows.push(e);
  return (
    <div className="space-y-0.5 rounded-xl border border-indigo-100 bg-white p-2.5 font-mono text-[13px]">
      {rows.map((e) => (
        <div key={e} className="flex items-center justify-between gap-3">
          <span className={e < 0 ? 'font-bold text-indigo-700' : 'text-slate-600'}>
            10<sup>{e < 0 ? `−${-e}` : e}</sup>
          </span>
          <span className={e < 0 ? 'font-bold text-indigo-700' : 'text-slate-700'}>
            {decimalDeDix(e)}
          </span>
          {e < de && <span className="text-[11px] text-emerald-600">÷ 10</span>}
        </div>
      ))}
    </div>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — La régularité de la descente. Aucune règle énoncée : seulement le
       constat que le rapport ne change pas, et ce qu'il impose. */
    1: [
      {
        id: 'descente-des-exposants',
        type: 'concepts',
        title: 'La descente des exposants',
        summary: 'D’une puissance à la suivante en descendant, on divise toujours par la base — et cela ne s’arrête pas à 1.',
        visual: <Echelle de={3} a={-2} />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              1000, 100, 10 : à chaque cran on <strong>divise par 10</strong>. La question est de
              savoir si cette règle s’arrête quelque part.
            </p>
            <p className="text-sm text-slate-700">
              Elle ne s’arrête pas. Après 10 vient <strong>1</strong> (c’est 10 ÷ 10), et c’est
              pourquoi <strong>10⁰ = 1</strong>. Après 1 vient <strong>0,1</strong>, puis 0,01 — la
              descente continue, indéfiniment, sans jamais changer de règle.
            </p>
            <p className="text-sm text-slate-600">
              Les nombres deviennent de plus en plus <strong>petits</strong>, mais restent toujours{' '}
              <strong>positifs</strong> : diviser par 10 ne fait pas passer de l’autre côté de zéro.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les barreaux de l’échelle, que tu as descendus un à un.
            </div>
          </div>
        ),
      },
    ],

    /* M2 — L'exposant négatif, nommé comme CONSÉQUENCE du module 1. */
    2: [
      {
        id: 'exposant-negatif',
        type: 'regles',
        title: 'L’exposant négatif',
        summary: 'a⁻ⁿ est l’inverse de aⁿ : un exposant négatif signale une division, jamais un nombre négatif.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-orange-200 bg-white p-3 text-center">
              <div className="font-mono text-lg font-black text-orange-700">
                a<sup>−n</sup> = 1 / a<sup>n</sup>
              </div>
            </div>
            <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-3 font-mono text-sm text-slate-700">
              <div>10<sup>−1</sup> = 1/10 = 0,1</div>
              <div>10<sup>−3</sup> = 1/1000 = 0,001</div>
              <div>2<sup>−2</sup> = 1/4 = 0,25</div>
            </div>
            <p className="text-sm text-slate-700">
              Le signe « − » porte sur l’<strong>exposant</strong>, pas sur le nombre. 10⁻³ vaut
              0,001 : c’est un nombre <strong>positif</strong>, simplement très petit. Le nombre
              négatif, lui, s’écrirait −1000.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-exposant-negatif',
        type: 'memoriser',
        title: '⭐ Exposant négatif ≠ nombre négatif',
        summary: '10⁻³ vaut 0,001 — un tout petit nombre positif.',
        body: (
          <div className="space-y-3">
            <div className="space-y-2 rounded-xl border-2 border-rose-200 bg-rose-50 p-5 text-center">
              <div className="font-mono text-lg font-black text-rose-700 sm:text-xl">
                10<sup>−3</sup> = 0,001
              </div>
              <div className="text-sm font-bold text-rose-700">et non −1000</div>
            </div>
            <p className="text-center text-xs text-slate-500">
              Un exposant négatif fait RAPETISSER, il ne fait pas changer de signe.
            </p>
          </div>
        ),
      },
    ],

    /* M3 — Les trois règles, comptées sur les facteurs. */
    3: [
      {
        id: 'regles-puissances',
        type: 'formules',
        title: 'Les trois règles de calcul',
        summary: 'Produit : on additionne les exposants. Quotient : on soustrait. Puissance d’une puissance : on multiplie.',
        visual: (
          <div className="space-y-1.5 rounded-xl border border-sky-100 bg-white p-3 text-center font-mono text-sm">
            <div className="text-sky-800">a<sup>m</sup> × a<sup>n</sup> = a<sup>m+n</sup></div>
            <div className="text-sky-800">a<sup>m</sup> ÷ a<sup>n</sup> = a<sup>m−n</sup></div>
            <div className="text-sky-800">(a<sup>m</sup>)<sup>n</sup> = a<sup>m×n</sup></div>
          </div>
        ),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Ces règles ne se retiennent pas : elles se <strong>comptent</strong>.
            </p>
            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
              <div>
                <strong>10³ × 10⁴</strong> : trois facteurs 10, puis quatre autres — en tout{' '}
                <strong>sept</strong> facteurs. D’où 10⁷.
              </div>
              <div>
                <strong>10⁵ ÷ 10²</strong> : cinq facteurs, dont deux se simplifient — il en{' '}
                <strong>reste trois</strong>. D’où 10³.
              </div>
              <div>
                <strong>(10³)²</strong> : le paquet de trois facteurs, pris deux fois —{' '}
                <strong>six</strong> facteurs. D’où 10⁶.
              </div>
            </div>
            <div className="rounded-xl border-2 border-rose-200 bg-rose-50/60 p-3 text-sm text-slate-700">
              <strong className="text-rose-700">Une seule condition :</strong> la <strong>même
              base</strong> des deux côtés. 2³ × 3² ne se simplifie pas — il n’y a aucune règle,
              seulement 8 × 9 = 72.
            </div>
          </div>
        ),
      },
    ],

    /* M4 — La notation scientifique. */
    4: [
      {
        id: 'notation-scientifique',
        type: 'methodes',
        title: 'La notation scientifique',
        summary: 'Un nombre s’écrit a × 10ⁿ, où a est compris entre 1 et 10 (10 exclu).',
        body: (
          <div className="space-y-3">
            <div className="space-y-1 rounded-xl border-2 border-emerald-200 bg-white p-3 font-mono text-sm text-slate-700">
              <div>45 000 = <strong className="text-emerald-700">4,5 × 10⁴</strong></div>
              <div>0,00072 = <strong className="text-emerald-700">7,2 × 10⁻⁴</strong></div>
            </div>
            <p className="text-sm text-slate-700">
              La contrainte <strong>1 ≤ a &lt; 10</strong> est ce qui rend l’écriture{' '}
              <strong>unique</strong> : sans elle, 45 000 pourrait s’écrire 45 × 10³, 0,45 × 10⁵…
              et deux nombres ne seraient plus comparables d’un coup d’œil.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              Repère pratique : l’exposant compte de combien de rangs la virgule s’est{' '}
              <strong>déplacée</strong>. Vers la gauche → exposant positif ; vers la droite →
              exposant négatif.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-entre-1-et-10',
        type: 'memoriser',
        title: '⭐ Le coefficient est entre 1 et 10',
        summary: 'a × 10ⁿ n’est scientifique que si 1 ≤ a < 10.',
        body: (
          <div className="space-y-3">
            <div className="space-y-2 rounded-xl border-2 border-rose-200 bg-rose-50 p-5 text-center">
              <div className="font-mono text-lg font-black text-rose-700 sm:text-xl">1 ≤ a &lt; 10</div>
              <div className="text-sm text-rose-700">
                un seul chiffre, non nul, avant la virgule
              </div>
            </div>
            <p className="text-center text-xs text-slate-500">
              45 × 10³ et 0,45 × 10⁵ désignent le bon nombre, mais ne sont pas des écritures
              scientifiques.
            </p>
          </div>
        ),
      },
    ],

    /* M5 — Les ordres de grandeur. */
    5: [
      {
        id: 'ordre-de-grandeur-4e',
        type: 'methodes',
        title: 'Comparer des ordres de grandeur',
        summary: 'L’ordre de grandeur est la puissance de 10 la plus proche : il suffit à comparer deux nombres très différents.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Pour comparer deux nombres écrits en notation scientifique, on regarde d’abord{' '}
              <strong>l’exposant</strong> : le plus grand exposant l’emporte, quel que soit le
              coefficient. Les coefficients ne départagent que des exposants égaux.
            </p>
            <div className="space-y-1.5 rounded-xl border border-rose-100 bg-white p-3 text-sm text-slate-700">
              <div>
                Un cheveu : <strong>10⁻⁴ m</strong> · Une bactérie : <strong>10⁻⁶ m</strong>
              </div>
              <div className="text-slate-600">
                Deux exposants d’écart : le cheveu est <strong>100 fois</strong> plus épais qu’une
                bactérie est longue.
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Chaque unité d’exposant vaut un facteur 10. C’est ce qui permet de comparer un atome
              et une galaxie sans jamais écrire un seul zéro.
            </p>
          </div>
        ),
      },
    ],
  },
};
