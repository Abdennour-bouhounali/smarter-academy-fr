import React from 'react';
import { FractionView } from '../../../../common/algebra4e';
import { q } from './components/rationnels4e';

/**
 * Connaissances de la leçon « Nombres rationnels » (4e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md). Aucun module n'écrit son propre
 * résumé : l'« À retenir » de fin de module EST cette carte, à son état
 * courant.
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules, et
 * c'est elle que la carte doit donner à voir :
 *
 *     produits en croix (M1)  ← le test qui remplace le tâtonnement
 *          ↓
 *     nombre rationnel, signe (M2)
 *          ↓
 *     dénominateur commun → somme et différence (M3)
 *          ↓                        ↓
 *     produit (M4) ──────→ inverse → quotient (M5)
 *                                    ↓
 *                          problèmes (M6)
 *
 * Rien n'y est arbitraire. Le produit en croix (M1) précède tout, parce
 * qu'il fonde à la fois l'égalité et, par le même geste « ramener à des
 * entiers », le dénominateur commun. Le produit (M4) précède l'inverse (M5)
 * parce que l'inverse se DÉFINIT par un produit qui vaut 1 — et le quotient
 * ne peut donc venir qu'après.
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées au module
 * qui le déclare.
 *
 * Ce que cette carte NE contient PAS : le sens de la fraction, la
 * graduation, les fractions égales par ×k, la simplification. Ce sont les
 * acquis de 5e, listés dans `priorKnowledge` et diagnostiqués au module 0.
 */

/** Une égalité de fractions avec ses deux produits — réutilisée par les items. */
const Croix = ({ a, b, c, d }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-center gap-3">
      <FractionView value={{ n: a, d: b }} size="md" tone="indigo" />
      <span className="text-xl font-black text-emerald-600">=</span>
      <FractionView value={{ n: c, d: d }} size="md" tone="violet" />
    </div>
    <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-600">
      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5">
        {a} × {d} = {a * d}
      </span>
      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5">
        {b} × {c} = {b * c}
      </span>
    </div>
  </div>
);

/** Une opération posée : a ⋆ b = r. */
const Calcul = ({ a, op, b, r, tone = 'slate' }) => (
  <div className="flex flex-wrap items-center justify-center gap-2">
    <FractionView value={a} size="md" tone="indigo" />
    <span className="text-lg font-black text-slate-500">{op}</span>
    <FractionView value={b} size="md" tone="violet" />
    <span className="text-lg font-black text-slate-500">=</span>
    <FractionView value={r} size="md" tone={tone} />
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Le TEST d'égalité. Aucun vocabulaire nouveau sur le nombre
       lui-même : seulement le procédé que la manipulation a rendu
       inévitable. */
    1: [
      {
        id: 'produits-en-croix',
        type: 'methodes',
        title: 'Les produits en croix',
        summary: 'Deux fractions sont égales exactement quand leurs deux produits en croix sont égaux.',
        visual: <Croix a={3} b={4} c={9} d={12} />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Pour savoir si deux fractions désignent le même nombre, on ne cherche plus à les
              simplifier au hasard : on multiplie <strong>en diagonale</strong>.
            </p>
            <div className="rounded-xl border-2 border-emerald-200 bg-white p-3 text-sm text-slate-700 space-y-1.5">
              <div>
                <FractionView value={{ n: 3, d: 4 }} size="sm" tone="indigo" /> et{' '}
                <FractionView value={{ n: 9, d: 12 }} size="sm" tone="violet" /> :
                3 × 12 = <strong>36</strong> et 4 × 9 = <strong>36</strong> → les deux fractions sont{' '}
                <strong className="text-emerald-700">égales</strong>.
              </div>
              <div>
                <FractionView value={{ n: 2, d: 3 }} size="sm" tone="indigo" /> et{' '}
                <FractionView value={{ n: 3, d: 4 }} size="sm" tone="violet" /> :
                2 × 4 = <strong>8</strong> et 3 × 3 = <strong>9</strong> → elles ne sont{' '}
                <strong className="text-rose-600">pas égales</strong>.
              </div>
            </div>
            <p className="text-sm text-slate-600">
              L’intérêt : la question « ces deux fractions sont-elles égales ? » devient une question
              sur deux <strong>nombres entiers</strong>, à laquelle on sait toujours répondre.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les deux diagonales qui passaient au vert ensemble.
            </div>
          </div>
        ),
      },
      {
        id: 'ecart-ne-decide-pas',
        type: 'regles',
        title: 'L’écart ne décide de rien',
        summary: 'Deux fractions dont le numérateur et le dénominateur diffèrent du même écart ne sont pas égales pour autant.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <FractionView value={{ n: 2, d: 3 }} size="sm" tone="indigo" /> et{' '}
              <FractionView value={{ n: 3, d: 4 }} size="sm" tone="violet" /> ont toutes deux « un
              d’écart » entre le haut et le bas — et pourtant elles ne sont pas égales : 2 × 4 = 8,
              mais 3 × 3 = 9.
            </p>
            <p className="text-slate-600">
              Ce qui conserve une fraction, ce n’est pas <strong>ajouter</strong> le même nombre en
              haut et en bas, c’est <strong>multiplier</strong> par le même nombre.
            </p>
          </div>
        ),
      },
    ],

    /* M2 — Le NOM du nombre, et le signe. */
    2: [
      {
        id: 'nombre-rationnel',
        type: 'concepts',
        title: 'Un nombre rationnel',
        summary: 'Un nombre rationnel est le quotient de deux entiers relatifs, le second n’étant pas nul.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Un <strong>nombre rationnel</strong> s’écrit comme un quotient de deux{' '}
              <strong>entiers relatifs</strong> — le dénominateur n’étant jamais zéro.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[q(3, 4), q(-2, 5), q(7), q(0)].map((f, i) => (
                <div key={i} className="flex items-center justify-center rounded-xl border border-violet-100 bg-white p-2">
                  <FractionView value={f} size="md" tone="violet" />
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-600">
              Tout entier en est un : <strong>7</strong> s’écrit 7/1. Zéro aussi. Un nombre rationnel
              a une <strong>infinité d’écritures</strong>, et une seule qu’on ne peut plus réduire.
            </p>
          </div>
        ),
      },
      {
        id: 'signe-de-la-fraction',
        type: 'regles',
        title: 'Où se met le signe',
        summary: 'Le signe d’une fraction est celui du quotient : on l’écrit devant la barre, une seule fois.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-orange-200 bg-white p-3 text-sm text-slate-700 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <FractionView value={{ n: -3, d: 4 }} size="sm" tone="rose" />
                <span>=</span>
                <span className="font-mono">(−3) ÷ 4</span>
                <span>=</span>
                <span className="font-mono">3 ÷ (−4)</span>
                <span className="text-slate-500">— une seule et même valeur</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <FractionView value={{ n: -3, d: -4 }} size="sm" tone="emerald" />
                <span className="text-slate-500">
                  deux négatifs → le quotient est <strong>positif</strong>
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              C’est la règle des signes du quotient, déjà rencontrée sur les entiers : elle ne
              change pas parce qu’on écrit une fraction.
            </p>
          </div>
        ),
      },
    ],

    /* M3 — Le dénominateur commun, FABRIQUÉ. */
    3: [
      {
        id: 'denominateur-commun',
        type: 'methodes',
        title: 'Fabriquer un dénominateur commun',
        summary: 'Pour additionner deux fractions, on les réécrit d’abord sur une graduation commune — qu’il faut souvent construire.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              En 5e, un dénominateur était toujours multiple de l’autre : la graduation commune
              était <em>donnée</em>. Ici il faut la <strong>fabriquer</strong>.
            </p>
            <div className="rounded-xl border-2 border-sky-200 bg-white p-3 space-y-2 text-sm">
              <div className="flex flex-wrap items-center gap-2 text-slate-700">
                <FractionView value={q(1, 4)} size="sm" tone="indigo" />
                <span className="font-black text-slate-500">+</span>
                <FractionView value={q(1, 6)} size="sm" tone="violet" />
              </div>
              <div className="text-slate-600">
                4 et 6 divisent tous deux <strong>12</strong> : on réécrit{' '}
                <FractionView value={{ n: 3, d: 12 }} size="sm" tone="indigo" /> (×3) et{' '}
                <FractionView value={{ n: 2, d: 12 }} size="sm" tone="violet" /> (×2).
              </div>
              <div className="flex flex-wrap items-center gap-2 text-slate-700">
                <span>Il ne reste qu’à compter les parts :</span>
                <FractionView value={q(5, 12)} size="sm" tone="emerald" />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Le produit des dénominateurs (24) marche toujours — mais 12 donne des nombres plus
              petits, donc moins d’erreurs.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-jamais-les-denominateurs',
        type: 'memoriser',
        title: '⭐ On n’additionne jamais les dénominateurs',
        summary: 'Le dénominateur dit la TAILLE des parts : il ne se compte pas, il s’égalise.',
        body: (
          <div className="space-y-3">
            <div className="space-y-2 rounded-xl border-2 border-rose-200 bg-rose-50 p-5 text-center">
              <div className="text-lg font-black text-rose-700 sm:text-xl">
                Même dénominateur → on compte les numérateurs
              </div>
              <div className="text-lg font-black text-rose-700 sm:text-xl">
                Dénominateurs différents → on les égalise D’ABORD
              </div>
            </div>
            <p className="text-center text-xs text-slate-500">
              1/2 + 1/3 ne fait pas 2/5 : ce serait dire qu’une demi-part plus un tiers de part font
              moins qu’une demi-part.
            </p>
          </div>
        ),
      },
    ],

    /* M4 — Le produit, lu sur le quadrillage. */
    4: [
      {
        id: 'produit-fractions',
        type: 'regles',
        title: 'Multiplier deux fractions',
        summary: 'On multiplie les numérateurs entre eux et les dénominateurs entre eux — sans aucun dénominateur commun.',
        visual: <Calcul a={q(2, 3)} op="×" b={q(3, 4)} r={q(1, 2)} tone="emerald" />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Multiplier, c’est prendre <strong>une part d’une part</strong>. Prendre les deux tiers
              d’un rectangle déjà coupé en quatre revient à découper le rectangle en 3 × 4 = 12
              cases et à en garder 2 × 3 = 6.
            </p>
            <div className="rounded-xl border-2 border-emerald-200 bg-white p-3 text-sm text-slate-700">
              <div className="flex flex-wrap items-center gap-2">
                <FractionView value={q(2, 3)} size="sm" tone="indigo" />
                <span className="font-black">×</span>
                <FractionView value={q(3, 4)} size="sm" tone="violet" />
                <span className="font-black">=</span>
                <FractionView value={{ n: 6, d: 12 }} size="sm" />
                <span className="font-black">=</span>
                <FractionView value={q(1, 2)} size="sm" tone="emerald" />
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Contrairement à l’addition, la multiplication <strong>n’exige aucun dénominateur
              commun</strong>. C’est l’opération la plus simple des quatre — et c’est pour cela
              qu’on ramènera la division à elle.
            </p>
          </div>
        ),
      },
    ],

    /* M5 — L'inverse, puis le quotient qui s'y ramène. */
    5: [
      {
        id: 'inverse-nombre',
        type: 'concepts',
        title: 'L’inverse d’un nombre',
        summary: 'L’inverse d’un nombre est celui qui, multiplié par lui, donne 1. Zéro n’en a pas.',
        visual: <Calcul a={q(3, 5)} op="×" b={q(5, 3)} r={q(1)} tone="emerald" />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              L’inverse d’une fraction s’obtient en <strong>échangeant ses deux termes</strong> —
              parce que c’est exactement ce qui fait tomber le produit sur 1.
            </p>
            <div className="rounded-xl border-2 border-amber-200 bg-white p-3 text-sm text-slate-700 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                l’inverse de <FractionView value={q(3, 5)} size="sm" tone="indigo" /> est{' '}
                <FractionView value={q(5, 3)} size="sm" tone="amber" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                l’inverse de <FractionView value={q(4)} size="sm" tone="indigo" /> est{' '}
                <FractionView value={q(1, 4)} size="sm" tone="amber" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                l’inverse de <FractionView value={q(-2, 7)} size="sm" tone="indigo" /> est{' '}
                <FractionView value={q(-7, 2)} size="sm" tone="amber" />{' '}
                <span className="text-xs text-slate-500">— le signe reste</span>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              <strong>Zéro n’a pas d’inverse</strong> : aucun nombre multiplié par 0 ne donne 1.
              C’est la même raison qui interdit de diviser par zéro.
            </p>
          </div>
        ),
      },
      {
        id: 'diviser-par-inverse',
        type: 'regles',
        title: 'Diviser, c’est multiplier par l’inverse',
        summary: 'Une division par une fraction se remplace par une multiplication par son inverse.',
        visual: <Calcul a={q(2, 3)} op="÷" b={q(4, 5)} r={q(5, 6)} tone="emerald" />,
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-orange-200 bg-white p-3 text-sm text-slate-700">
              <div className="flex flex-wrap items-center gap-2">
                <FractionView value={q(2, 3)} size="sm" tone="indigo" />
                <span className="font-black">÷</span>
                <FractionView value={q(4, 5)} size="sm" tone="violet" />
                <span className="font-black">=</span>
                <FractionView value={q(2, 3)} size="sm" tone="indigo" />
                <span className="font-black">×</span>
                <FractionView value={q(5, 4)} size="sm" tone="amber" />
                <span className="font-black">=</span>
                <FractionView value={q(5, 6)} size="sm" tone="emerald" />
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Pourquoi ? Parce que diviser par 4/5, c’est chercher <em>combien de fois</em> 4/5 tient
              dans le nombre — et multiplier par 5/4 défait exactement ce que multiplier par 4/5
              avait fait.
            </p>
            <p className="text-sm text-slate-600">
              Attention : c’est le <strong>second</strong> nombre qu’on inverse, jamais le premier.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-inverser-le-second',
        type: 'memoriser',
        title: '⭐ On inverse le SECOND, et on multiplie',
        summary: 'a ÷ b devient a × (inverse de b) — jamais l’inverse de a.',
        body: (
          <div className="space-y-3">
            <div className="space-y-2 rounded-xl border-2 border-rose-200 bg-rose-50 p-5 text-center">
              <div className="text-lg font-black text-rose-700 sm:text-xl">
                DIVISER par une fraction
              </div>
              <div className="text-lg font-black text-rose-700 sm:text-xl">
                = MULTIPLIER par son inverse
              </div>
            </div>
            <p className="text-center text-xs text-slate-500">
              Diviser par un nombre plus petit que 1 fait donc AUGMENTER le résultat.
            </p>
          </div>
        ),
      },
    ],

    /* M6 — Choisir l'opération : la vraie difficulté d'un problème. */
    6: [
      {
        id: 'choisir-l-operation',
        type: 'methodes',
        title: 'Choisir l’opération',
        summary: 'Dans un problème, la difficulté n’est pas de calculer : c’est de décider quelle opération traduit la situation.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border border-rose-100 bg-white p-3 text-sm text-slate-700 space-y-1.5">
              <div>
                « les <strong>deux tiers</strong> des trois quarts du terrain » → une part{' '}
                <em>d’</em>une part → <strong>on multiplie</strong>
              </div>
              <div>
                « il a versé 1/4 L, puis 1/6 L » → deux quantités qui{' '}
                <em>s’ajoutent</em> → <strong>on additionne</strong>
              </div>
              <div>
                « combien de bouteilles de 3/4 L dans 6 L ? » → combien de fois une part{' '}
                <em>tient dans</em> → <strong>on divise</strong>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Un contrôle utile avant de calculer : le résultat doit-il être plus grand ou plus
              petit que ce dont on part ? Multiplier par un nombre inférieur à 1 diminue ; diviser
              par un nombre inférieur à 1 augmente.
            </p>
          </div>
        ),
      },
    ],
  },
};
