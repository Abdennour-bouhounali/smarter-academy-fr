/**
 * « Vers le brevet — Multiples et diviseurs » — the lesson's content (docs/reports/VERS_LE_BREVET_PLAN.md §7bis).
 * A RAPID REVISION of the unit (owner, 2026-11-26): for each of its four lessons the idea, the rule, the trap and the
 * words; then two solved exercises; then a quick quiz. Own contexts and numbers; the rules are those of the four
 * lessons' knowledge sheets, said in one sentence. `[d:…]` marks a number given, `[c:…]` a condition, `[g:…]` what is
 * asked; `$…$` is LaTeX. Every number is checked by `logic.test.js`.
 */
import { fr } from '../../../../../../features/versLeBrevet/text';

const lesson = (o) => ({
  ...o,
  idea: fr(o.idea),
  rule: fr(o.rule),
  example: fr(o.example),
  trap: fr(o.trap),
  manip: fr(o.manip),
  words: o.words.map(([w, d]) => ({ w, d: fr(d) })),
});
const line = ([tag, t, why]) => ({ tag, t: fr(t), why: fr(why) });

export const UNIT = {
  id: 'multiples-et-diviseurs',
  title: 'Multiples et diviseurs',

  // ── the map: four lessons and how one feeds the next
  lessons: [
    lesson({
      id: 'dec',
      title: 'Décomposer en facteurs premiers',
      short: '$60 = 2^2 \\times 3 \\times 5$',
      idea: 'Tout nombre entier plus grand que 1 s’écrit comme un produit de nombres premiers, d’une seule façon.',
      rule: 'Divise par 2 tant que c’est possible, puis par 3, par 5, par 7… Tu t’arrêtes quand il reste 1.',
      example: '$60 = 2 \\times 2 \\times 3 \\times 5 = 2^2 \\times 3 \\times 5$',
      trap: '1 n’est pas premier. Et un nombre impair n’est pas toujours premier : $91 = 7 \\times 13$.',
      manip: 'Casse le nombre : touche un nombre premier qui le divise.',
      words: [
        [
          'nombre premier',
          'Un nombre qui a exactement deux diviseurs : 1 et lui-même. Les premiers : 2, 3, 5, 7, 11, 13…',
        ],
        ['facteur', 'Un nombre d’un produit. Dans 2 × 3 × 5, les facteurs sont 2, 3 et 5.'],
        ['puissance', '2³ veut dire 2 × 2 × 2. Le petit 3 s’appelle l’exposant.'],
        ['diviseur', '6 est un diviseur de 24 car 24 = 6 × 4 : le reste de la division est 0.'],
      ],
    }),
    lesson({
      id: 'pgcd',
      title: 'Le plus grand diviseur commun',
      short: '$\\mathrm{PGCD}(126 ; 90) = 18$',
      idea: 'Un diviseur commun divise les deux nombres. Le plus grand s’appelle le PGCD : il sert à partager en parts identiques.',
      rule: 'Décompose les deux nombres. Garde les facteurs communs, chacun avec son plus petit exposant.',
      example:
        '$126 = 2 \\times 3^2 \\times 7$ et $90 = 2 \\times 3^2 \\times 5$, donc $\\mathrm{PGCD} = 2 \\times 3^2 = 18$',
      trap: 'Ne prends pas tous les facteurs : seulement ceux qui sont dans les deux nombres.',
      manip: 'Choisis un nombre de bouquets : je partage les 24 roses et les 36 tulipes.',
      words: [
        ['diviseur commun', 'Un nombre qui divise l’un et l’autre. 6 est un diviseur commun de 24 et 36.'],
        ['PGCD', 'Le Plus Grand Commun Diviseur : le plus grand des diviseurs communs.'],
        ['division euclidienne', 'a = b × q + r, avec un reste r plus petit que b. Si r = 0, b divise a.'],
        ['lots identiques', 'Des parts toutes pareilles, sans rien laisser : leur nombre divise chaque quantité.'],
      ],
    }),
    lesson({
      id: 'ppcm',
      title: 'Le plus petit multiple commun',
      short: '12 et 18 se retrouvent à 36',
      idea: 'Un multiple commun est dans la table des deux nombres. Le plus petit, sans compter 0, dit quand deux rythmes se retrouvent.',
      rule: 'Décompose les deux nombres. Garde tous les facteurs, chacun avec son plus grand exposant.',
      example: '$12 = 2^2 \\times 3$ et $18 = 2 \\times 3^2$, donc $2^2 \\times 3^2 = 36$',
      trap: 'Multiplier les deux nombres donne un multiple commun, mais pas toujours le plus petit : 12 × 18 = 216.',
      manip: 'Deux phares : l’un s’allume toutes les 12 s, l’autre toutes les 18 s. Avance dans le temps.',
      words: [
        ['multiple', '36 est un multiple de 12 car 36 = 12 × 3 : il est dans la table de 12.'],
        ['multiple commun', 'Un nombre qui est dans les deux tables. 36 et 72 sont des multiples communs de 12 et 18.'],
        [
          'engrenage',
          'Deux roues dentées : elles reviennent ensemble à leur départ après un multiple commun de leurs nombres de dents.',
        ],
      ],
    }),
    lesson({
      id: 'irr',
      title: 'Rendre une fraction irréductible',
      short: '$\\dfrac{42}{70} = \\dfrac{3}{5}$',
      idea: 'Une fraction est irréductible quand son numérateur et son dénominateur n’ont plus aucun diviseur commun, à part 1.',
      rule: 'Divise le haut et le bas par leur PGCD : tu arrives en une seule étape.',
      example:
        '$\\mathrm{PGCD}(42 ; 70) = 14$, donc $\\dfrac{42}{70} = \\dfrac{42 \\div 14}{70 \\div 14} = \\dfrac{3}{5}$',
      trap: 'Au brevet, un résultat en fraction se donne toujours sous forme irréductible.',
      manip: 'Simplifie la fraction : touche un nombre qui divise le haut et le bas.',
      words: [
        ['numérateur', 'Le nombre du haut d’une fraction.'],
        ['dénominateur', 'Le nombre du bas d’une fraction. Il n’est jamais 0.'],
        ['simplifier', 'Diviser le haut et le bas par un même nombre : la fraction garde sa valeur.'],
        ['irréductible', 'Qu’on ne peut plus simplifier : le PGCD du haut et du bas vaut 1.'],
      ],
    }),
  ],
  // what one lesson gives the next, written on the lines of the map
  links: { 'dec-pgcd': 'les facteurs communs', 'dec-ppcm': 'tous les facteurs', 'pgcd-irr': 'diviser par le PGCD' },

  // ── two solved exercises: each line says which lesson it uses
  solved: [
    {
      id: 'lots',
      text: fr(
        'Un pâtissier a préparé [d:126 macarons] et [d:90 financiers]. Il veut faire des [c:lots identiques] en utilisant [c:tous les gâteaux]. Quel est [g:le plus grand nombre de lots] ? Que contient chaque lot ?',
      ),
      picture: { kind: 'lots', a: 126, b: 90, A: 'macarons', B: 'financiers', n: 18, from: 3 },
      lines: [
        [
          'La phrase',
          'Le nombre de lots doit diviser 126 et 90.',
          'Commence toujours par dire ce que tu cherches : ici, un diviseur commun, et le plus grand.',
        ],
        [
          'Décomposer',
          '126 = 2 × 3² × 7 et 90 = 2 × 3² × 5.',
          'La calculatrice est autorisée dans cette partie : elle donne les décompositions.',
        ],
        [
          'PGCD',
          'PGCD(126 ; 90) = 2 × 3² = 18.',
          'Je garde les facteurs communs, 2 et 3², puis je les multiplie. Regarde : 18 lots, rien ne reste.',
        ],
        ['Calcul', '126 ÷ 18 = 7 et 90 ÷ 18 = 5.', 'Chaque stock est partagé en 18.'],
        [
          'Conclusion',
          'Il peut faire 18 lots, chacun de 7 macarons et 5 financiers.',
          'Chaque question se termine par une phrase, avec les unités.',
        ],
      ].map(line),
    },
    {
      id: 'trains',
      text: fr(
        'Dans une gare, un train pour Lyon part [d:toutes les 45 minutes] et un train pour Lille [d:toutes les 60 minutes]. Les deux partent [c:ensemble à 6 h 00]. À quelle heure partent-ils [g:de nouveau ensemble] ?',
      ),
      picture: { kind: 'rdv', a: 45, b: 60, unit: 'min', at: 180, from: 3 },
      lines: [
        [
          'La phrase',
          'Le moment cherché est un multiple de 45 et de 60.',
          'Deux rythmes qui se retrouvent : c’est un multiple commun, et on veut le plus petit.',
        ],
        ['Décomposer', '45 = 3² × 5 et 60 = 2² × 3 × 5.', 'Les mêmes décompositions qu’à la première leçon.'],
        [
          'Multiple commun',
          'Le plus petit multiple commun est 2² × 3² × 5 = 180.',
          'Je garde tous les facteurs, chacun avec son plus grand exposant. Regarde la ligne du temps.',
        ],
        [
          'Conclusion',
          '180 min = 3 h : ils repartent ensemble à 9 h 00.',
          'Je convertis, puis je réponds à la question posée : une heure, pas un nombre de minutes.',
        ],
      ].map(line),
    },
  ],

  // ── the quick quiz: one tap each, the reason right after
  quiz: [
    {
      lesson: 'dec',
      q: 'Le nombre 91 est-il premier ?',
      choices: [['Oui'], ['Non', 1]],
      why: '91 = 7 × 13 : il a d’autres diviseurs que 1 et lui-même.',
    },
    {
      lesson: 'dec',
      q: 'Que vaut $2^3 \\times 5$ ?',
      choices: [['30'], ['40', 1], ['13']],
      why: '2³ = 2 × 2 × 2 = 8, et 8 × 5 = 40.',
    },
    {
      lesson: 'pgcd',
      q: 'Pour faire le plus possible de lots identiques avec 48 stylos et 36 gommes, je cherche…',
      choices: [['le PGCD', 1], ['le plus petit multiple commun']],
      why: 'Le nombre de lots doit diviser 48 et 36 : c’est un diviseur commun, le plus grand.',
    },
    {
      lesson: 'pgcd',
      q: 'Que vaut $\\mathrm{PGCD}(48 ; 36)$ ?',
      choices: [['6'], ['12', 1], ['144']],
      why: '48 = 2⁴ × 3 et 36 = 2² × 3² : les facteurs communs donnent 2² × 3 = 12.',
    },
    {
      lesson: 'irr',
      q: 'La fraction $\\dfrac{15}{28}$ est-elle irréductible ?',
      choices: [['Oui', 1], ['Non']],
      why: '15 = 3 × 5 et 28 = 2² × 7 : aucun facteur commun, leur PGCD vaut 1.',
    },
    {
      lesson: 'ppcm',
      q: 'Deux feux clignotent toutes les 4 s et toutes les 6 s. Ils clignotent de nouveau ensemble au bout de…',
      choices: [['2 s'], ['12 s', 1], ['24 s']],
      why: '12 est le plus petit nombre qui est dans la table de 4 et dans celle de 6.',
    },
  ].map((q) => ({ ...q, q: fr(q.q), why: fr(q.why), choices: q.choices.map(([t, ok]) => ({ t, ok: Boolean(ok) })) })),
};
