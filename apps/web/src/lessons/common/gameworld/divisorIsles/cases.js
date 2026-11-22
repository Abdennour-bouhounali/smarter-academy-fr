/**
 * « La coopérative du verger » — PURE logic of the real-world practice game of « L’archipel des diviseurs » (no three.js,
 * no React).
 *
 * The student runs the packing depot of a cooperative. A MISSION is a short day of ORDERS; an order is a real case solved in
 * one to four STEPS (choose a crate, type a number); after a step the depot packs for real and shows what the choice does:
 * n = b × q + r, crates filled, items left on the floor. Seven kinds of order, one per idea of the lesson:
 *   fit      which crate leaves nothing?                      (divisor by the remainder)
 *   count    the client wants q equal full crates: capacity?  (divisor by the product)
 *   orders   one crate size in stock: which order can go?     (multiple of / divisible by / divisor of / divides)
 *   special  an order no usual crate fits: the two packings that always work (1 and the number itself)
 *   cost     two crate sizes, one fits: crates, then the invoice          (exam case)
 *   profit   two trays fit: which packaging earns more?                    (exam case)
 *   trip     trucks: the remainder MEANS one more truck and empty places   (exam case)
 *   share    another world: crêpes shared FAIRLY between friends, then with the neighbours so that nothing is left
 *   tiling   another world: a tiler who cuts no tile and wastes none — the tile, the whole floor, the boxes to buy
 * A step never asks for a number the packing has just SHOWN (the world counted it in front of the student).
 * `judge` is the one place that says whether a step is right and, when it is not, WHY — with the division the choice produces,
 * never the answer.
 */
import { divide } from './logic';
import { divisionTip, productTip } from '../kit/tips';
import { counted } from '../kit/authoring/numbers';

const int = (rand, lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
const pick = (rand, list) => list[Math.floor(rand() * list.length)];
const shuffle = (rand, list) => {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** French agreement of a counted noun: forms = [singular, plural] — « 1 caisse », « 12 caisses » (`counted` of the kit). */
export const count = (forms, n) => counted(n, forms);
/** A sum of money, written the French way: « 320 € », « 4 500 € » (narrow no-break space for thousands). */
const groups = (n, sep) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
const eur = (n) => `${groups(n, ' ')} €`;
/** A sum inside LaTeX: thousands with a thin space « 4\,500 ». */
const texNum = (n) => groups(n, '\\,');
const BOX = ['caisse', 'caisses'];
const TRAY = ['plateau', 'plateaux'];
const TRUCK = ['camion', 'camions'];
const KIDS = ['enfant', 'enfants'];
const TILE = ['carreau', 'carreaux'];
const PACK = ['paquet', 'paquets'];
/** The tiler of the tiling world. */
const TILER = 'Mme Moreau';
/** The legend of the equality a = b × q + r in each kind of packing (what q counts). */
export const simUnit = (q, mode) =>
  mode === 'share'
    ? `${q} chacun`
    : mode === 'row'
      ? count(TILE, q)
      : mode === 'boxes'
        ? count(PACK, q)
        : count(mode === 'trucks' ? TRUCK : BOX, q);
const GOODS = {
  dates: {
    id: 'dates',
    name: 'les boîtes de pommes',
    unit: ['boîte de pommes', 'boîtes de pommes'],
    left: ['boîte', 'boîtes'],
    color: 0xc0392b,
  },
  oil: {
    id: 'oil',
    name: 'les bouteilles de jus de pomme',
    unit: ['bouteille de jus de pomme', 'bouteilles de jus de pomme'],
    left: ['bouteille', 'bouteilles'],
    color: 0xe0a030,
  },
  eggs: {
    id: 'eggs',
    name: 'les œufs',
    unit: ['œuf', 'œufs'],
    left: ['œuf', 'œufs'],
    color: 0xf1dfb8,
  },
  crates: { id: 'crates', name: 'les caisses', unit: BOX, left: BOX, color: 0xc79a5b },
  sweets: {
    id: 'sweets',
    name: 'les crêpes',
    unit: ['crêpe', 'crêpes'],
    left: ['crêpe', 'crêpes'],
    color: 0xe8b34a,
  },
  tiles: { id: 'tiles', name: 'le carrelage', unit: TILE, left: TILE, color: 0xc96f4a },
};
const CLIENTS = [
  'École du quartier',
  'Cantine du collège',
  'Épicerie du village',
  'Boulangerie de la place',
  'Marché de gros',
  'Club de sport',
];
export const ORDER_PAY = 1200;
export const MISTAKE_COST = 300;
export const CASE_HEARTS = 3;
const K = { baqi: 'qasim-baqi', jidaa: 'qasim-jidaa', siyagh: 'siyagh-mutakafia', wahid: 'wahid-wa-nafsuh' };
const eq = (a, b, q, r) => (r ? `$${a} = ${b} \\times ${q} + ${r}$` : `$${a} = ${b} \\times ${q}$`);
const nonDivisorsNear = (n, b, lo, hi) => {
  const out = [];
  for (let x = lo; x <= hi; x += 1) if (x !== b && x > 1 && n % x !== 0) out.push(x);
  return out;
};

// ───────────────────────────── the orders ─────────────────────────────
const MAKE = {
  fit(rand, i) {
    const b = int(rand, 6, 9 + i * 2);
    const q = int(rand, 4 + i * 2, 7 + i * 4);
    const n = b * q;
    const wrong = shuffle(rand, nonDivisorsNear(n, b, Math.max(4, b - 4), b + 5)).slice(0, 2);
    if (wrong.length < 2) return null;
    const good = pick(rand, [GOODS.dates, GOODS.oil]);
    return {
      kind: 'fit',
      key: K.baqi,
      good,
      n,
      b,
      q,
      client: pick(rand, CLIENTS),
      brief: `« ${'$C'} » commande ${count(good.unit, n)}. Le camion ne prend que des caisses bien pleines, et rien ne doit rester par terre.`,
      steps: [
        {
          id: 'crate',
          type: 'choose',
          prompt: 'Quelle caisse choisis-tu ?',
          options: shuffle(rand, [b, ...wrong]).map((v) => ({ v, label: String(v), sub: `contient ${v}` })),
        },
      ],
    };
  },
  count(rand, i) {
    const b = int(rand, 6, 10 + i * 3);
    const q = int(rand, 4 + i, 8 + i * 2);
    const n = b * q;
    const good = pick(rand, [GOODS.dates, GOODS.oil]);
    return {
      kind: 'count',
      key: K.jidaa,
      good,
      n,
      b,
      q,
      client: pick(rand, CLIENTS),
      brief: `« ${'$C'} » veut ${count(good.unit, n)} dans ${count(BOX, q)} identiques, bien pleines.`,
      steps: [
        {
          id: 'capacity',
          type: 'number',
          div: [n, q],
          prompt: 'Combien contient une caisse ?',
          tokens: [String(n), '=', { slot: 'x', label: 'contenance', w: 2 }, '×', String(q)],
        },
      ],
    };
  },
  orders(rand, i) {
    const b = pick(rand, [8, 9, 12, 14, 15, 16, 18]);
    const q = int(rand, 5 + i, 9 + i * 2);
    const n = b * q;
    const others = shuffle(
      rand,
      [n - 4, n - 3, n - 2, n + 2, n + 3, n + 4, n + 5].filter((x) => x % b !== 0),
    ).slice(0, 2);
    const good = pick(rand, [GOODS.dates, GOODS.oil]);
    const what = `le nombre de ${good.left[1]}`;
    const phrase = [
      `${what} est un multiple de ${b}`,
      `${what} est divisible par ${b}`,
      `${b} est un diviseur du nombre de ${good.left[1]}`,
      `${b} divise ${what}`,
    ][i % 4];
    return {
      kind: 'orders',
      key: K.siyagh,
      good,
      n,
      b,
      q,
      client: 'Trois clients',
      brief: `Il ne reste en stock que des caisses de ${b}. Trois commandes attendent : on accepte celle pour laquelle ${phrase}.`,
      steps: [
        {
          id: 'order',
          type: 'choose',
          prompt: 'Quelle commande prépares-tu en entier ?',
          options: shuffle(rand, [n, ...others]).map((v) => ({ v, label: String(v), sub: good.left[1] })),
        },
      ],
    };
  },
  special(rand) {
    const n = pick(rand, [13, 17, 19, 23, 29, 31]);
    const good = GOODS.oil;
    const usual = shuffle(rand, [2, 3, 4, 5, 6, 7, 8, 9])
      .slice(0, 3)
      .sort((x, y) => x - y);
    return {
      kind: 'special',
      key: K.wahid,
      good,
      n,
      client: pick(rand, CLIENTS),
      brief: `Une commande têtue de « ${'$C'} » : ${count(good.unit, n)}. Avec toutes les caisses habituelles, il reste toujours quelque chose par terre !`,
      steps: [
        {
          id: 'two',
          type: 'choose',
          pick: 2,
          prompt: 'Quels deux emballages marchent à coup sûr, sans aucun calcul ?',
          options: [1, ...usual, n].map((v) => ({
            v,
            label: String(v),
            sub: v === 1 ? 'une seule par caisse' : v === n ? 'une seule grande caisse' : `contient ${v}`,
          })),
        },
      ],
    };
  },
  cost(rand) {
    const b2 = pick(rand, [12, 15, 16, 18, 20, 24]);
    const q2 = int(rand, 8, 16);
    const n = b2 * q2;
    const b1 = pick(
      rand,
      nonDivisorsNear(n, b2, b2 - 5, b2 + 5).filter((x) => x >= 9),
    );
    const price = pick(rand, [150, 180, 250, 320]);
    if (!b1) return null;
    const d1 = divide(n, b1);
    const good = GOODS.dates;
    return {
      kind: 'cost',
      key: K.baqi,
      good,
      n,
      b1,
      b2,
      q1: d1.q,
      r1: d1.r,
      q2,
      price,
      client: pick(rand, CLIENTS),
      brief: `« ${'$C'} » commande ${count(good.unit, n)} en caisses bien pleines. En stock, deux modèles : des caisses de ${b1} et des caisses de ${b2}. Une caisse coûte ${eur(price)}, quel que soit le modèle.`,
      steps: [
        {
          id: 'first',
          type: 'number',
          div: [n, b1],
          prompt: `Essaie les caisses de ${b1} : complète la division euclidienne.`,
          tokens: [
            String(n),
            '=',
            String(b1),
            '×',
            { slot: 'q', label: 'nombre de caisses', w: 2 },
            '+',
            { slot: 'r', label: 'reste', w: 2 },
          ],
        },
        {
          id: 'second',
          type: 'number',
          div: [n, b2],
          prompt: `Et les caisses de ${b2} ?`,
          tokens: [String(n), '=', String(b2), '×', { slot: 'q', label: 'nombre de caisses', w: 2 }],
        },
        {
          id: 'invoice',
          type: 'number',
          prompt: 'Combien le client paie-t-il pour les caisses ?',
          tokens: [{ slot: 'x', label: 'montant', w: 5 }, '€'],
        },
      ],
    };
  },
  profit(rand) {
    const [b1, b2, k] = pick(rand, [
      [12, 30, 6],
      [6, 10, 10],
      [8, 12, 12],
      [10, 15, 10],
      [12, 20, 6],
      [6, 30, 10],
    ]);
    const lcm =
      (b1 * b2) /
      (function g(x, y) {
        return y ? g(y, x % y) : x;
      })(b1, b2);
    const n = lcm * int(rand, 2, Math.max(2, Math.floor(k / 2)));
    const p1 = pick(rand, [100, 120, 150]);
    const p2 = Math.round((p1 * (b2 / b1) * pick(rand, [0.9, 1.1])) / 10) * 10;
    const q1 = n / b1;
    const q2 = n / b2;
    if (q1 > 36 || q1 * p1 === q2 * p2) return null;
    return {
      kind: 'profit',
      key: K.jidaa,
      good: GOODS.eggs,
      n,
      b1,
      b2,
      q1,
      q2,
      p1,
      p2,
      best: q1 * p1 > q2 * p2 ? b1 : b2,
      client: 'Marché de gros',
      brief: `La coopérative a ramassé ${count(GOODS.eggs.unit, n)}. On les vend en plateaux de ${b1} œufs à ${eur(p1)} le plateau, ou en plateaux de ${b2} œufs à ${eur(p2)} le plateau. Quel emballage rapporte le plus ?`,
      steps: [
        {
          id: 'small',
          type: 'number',
          div: [n, b1],
          prompt: `Combien de plateaux de ${b1} œufs ?`,
          tokens: [String(n), '=', String(b1), '×', { slot: 'q', label: 'nombre de plateaux', w: 2 }],
        },
        {
          id: 'big',
          type: 'number',
          div: [n, b2],
          prompt: `Et combien de plateaux de ${b2} œufs ?`,
          tokens: [String(n), '=', String(b2), '×', { slot: 'q', label: 'nombre de plateaux', w: 2 }],
        },
        {
          id: 'best',
          type: 'choose',
          prompt: 'Quel emballage rapporte le plus d’argent ?',
          options: [
            { v: b1, label: String(b1), sub: `${count(TRAY, q1)} × ${eur(p1)}` },
            { v: b2, label: String(b2), sub: `${count(TRAY, q2)} × ${eur(p2)}` },
          ],
        },
        {
          id: 'income',
          type: 'number',
          prompt: 'Et combien rapporte cet emballage ?',
          tokens: [{ slot: 'x', label: 'montant', w: 5 }, '€'],
        },
      ],
    };
  },
  trip(rand) {
    const b = pick(rand, [24, 30, 36, 40, 48]);
    const q = int(rand, 3, 6);
    const r = int(rand, 5, b - 6);
    const n = b * q + r;
    const price = pick(rand, [4500, 6000, 7500]);
    return {
      kind: 'trip',
      key: K.baqi,
      good: GOODS.crates,
      n,
      b,
      q,
      r,
      price,
      client: 'Plateforme d’expédition',
      brief: `${count(BOX, n)} sont prêtes à partir. Un camion transporte ${count(BOX, b)}, et sa location coûte ${eur(price)}. Toutes les caisses doivent partir.`,
      steps: [
        {
          id: 'trucks',
          type: 'number',
          div: [n, b],
          prompt: 'Combien de camions faut-il ?',
          tokens: [{ slot: 'x', label: 'nombre de camions', w: 2 }],
        },
        {
          id: 'empty',
          type: 'number',
          prompt: 'Combien de places restent vides dans le dernier camion ?',
          tokens: [{ slot: 'x', label: 'places vides', w: 2 }],
        },
        {
          id: 'rent',
          type: 'number',
          prompt: 'Combien paie-t-on pour louer les camions ?',
          tokens: [{ slot: 'x', label: 'montant', w: 5 }, '€'],
        },
      ],
    };
  },
  /** A WORLD of its own — « Le goûter entre amis »: sharing crêpes FAIRLY (the divisor is the number of children). */
  share(rand, i) {
    const g = int(rand, 5, 8);
    const gq = int(rand, 4 + i, 7 + i * 2);
    const n = g * gq;
    const b = pick(
      rand,
      [g - 1, g - 2, g + 1].filter((x) => x >= 3 && n % x !== 0),
    );
    const others = shuffle(
      rand,
      [g - 3, g - 2, g - 1, g + 1, g + 2, g + 3].filter((x) => x >= 3 && x !== b && n % x !== 0),
    ).slice(0, 2);
    if (!b || others.length < 2) return null;
    const d = divide(n, b);
    const good = GOODS.sweets;
    const host = pick(rand, ['Lucas', 'Inès', 'Hugo', 'Léa']);
    return {
      kind: 'share',
      key: K.baqi,
      good,
      n,
      b,
      q: d.q,
      r: d.r,
      g,
      gq,
      host,
      client: host,
      brief: `La famille de ${host} a préparé ${count(good.unit, n)}. ${host} les partage équitablement avec ses amis, sans se servir plus que les autres : ils sont ${count(KIDS, b)} en tout.`,
      steps: [
        {
          id: 'each',
          type: 'number',
          div: [n, b],
          prompt: 'Combien de crêpes pour chacun ? Combien en reste-t-il dans le plat ?',
          tokens: [
            String(n),
            '=',
            String(b),
            '×',
            { slot: 'q', label: 'part de chacun', w: 2 },
            '+',
            { slot: 'r', label: 'crêpes restantes', w: 2 },
          ],
        },
        {
          id: 'guests',
          type: 'choose',
          prompt: `${host} invite aussi des enfants du voisinage, pour que toutes les crêpes soient partagées équitablement, sans reste. Combien d’enfants seront-ils en tout ?`,
          options: [g, ...others].sort((x, y) => x - y).map((v) => ({ v, label: String(v), sub: 'enfants' })),
        },
      ],
    };
  },
  /** A WORLD of its own — « Le chantier du carreleur »: a tiler who works properly: no tile cut, no gap, nothing wasted. */
  tiling(rand, i) {
    const s = pick(rand, [20, 25, 30, 40]);
    const q = int(rand, 9 + i, 13 + i * 2);
    const L = s * q;
    const wrong = shuffle(
      rand,
      [20, 25, 30, 40, 45, 50, 60].filter((x) => x !== s && L % x !== 0),
    ).slice(0, 2);
    const rows = int(rand, 3, 6);
    const total = q * rows;
    const box = pick(
      rand,
      [8, 10, 12].filter((x) => total % x !== 0),
    );
    if (wrong.length < 2 || !box) return null;
    const d = divide(total, box);
    return {
      kind: 'tiling',
      key: K.baqi,
      good: GOODS.tiles,
      n: L,
      L,
      s,
      q,
      rows,
      total,
      box,
      bq: d.q,
      br: d.r,
      boxes: d.q + 1,
      spare: box - d.r,
      client: TILER,
      brief: `${TILER} est carreleuse et aime le travail soigné : elle ne coupe aucun carreau et ne laisse aucun vide. Aujourd’hui, elle carrelle un couloir de ${L} cm.`,
      steps: [
        {
          id: 'tile',
          type: 'choose',
          prompt: 'Quel carreau couvre toute la longueur du couloir sans aucune coupe ?',
          options: [s, ...wrong].sort((x, y) => x - y).map((v) => ({ v, label: String(v), sub: 'cm' })),
        },
        {
          id: 'all',
          type: 'number',
          prompt: `Le couloir est assez large pour ${rows} rangées. Combien de carreaux lui faut-il en tout ?`,
          tokens: [String(rows), '×', String(q), '=', { slot: 'x', label: 'total des carreaux', w: 3 }],
        },
        {
          id: 'boxes',
          type: 'number',
          div: [total, box],
          prompt: `Les carreaux sont vendus par paquets de ${box}, et ${TILER} n’achète pas plus que nécessaire. Combien de paquets achète-t-elle ?`,
          tokens: [{ slot: 'x', label: 'nombre de paquets', w: 2 }],
        },
      ],
    };
  },
};

/**
 * The missions of the practice space: which orders a day holds (kind, difficulty index).
 * `WORLD_OF` says in which 3D world a mission is played: the cooperative's depot, the friends' table or the tiler's site.
 */
export const MISSIONS = {
  fit: [
    ['fit', 0],
    ['fit', 1],
    ['fit', 2],
  ],
  count: [
    ['count', 0],
    ['count', 1],
    ['count', 2],
  ],
  orders: [
    ['orders', 0],
    ['orders', 1],
    ['orders', 2],
    ['orders', 3],
  ],
  special: [
    ['special', 0],
    ['special', 1],
  ],
  day: [
    ['cost', 0],
    ['profit', 0],
    ['trip', 0],
  ],
  share: [
    ['share', 0],
    ['share', 1],
  ],
  tiling: [
    ['tiling', 0],
    ['tiling', 1],
  ],
};
export const WORLD_OF = {
  fit: 'depot',
  count: 'depot',
  orders: 'depot',
  special: 'depot',
  day: 'depot',
  share: 'share',
  tiling: 'tiling',
};

export function makeOrder(rand, kind, i) {
  for (let t = 0; t < 300; t += 1) {
    const o = MAKE[kind](rand, i);
    if (o) {
      o.brief = o.brief.replace('$C', o.client);
      return o;
    }
  }
  throw new Error(`cases: no order for ${kind}`);
}
export function makeMission(rand, mission) {
  const out = [];
  for (const [kind, i] of MISSIONS[mission]) {
    let o;
    let t = 0;
    do {
      o = makeOrder(rand, kind, i);
      t += 1;
    } while (t < 20 && out.some((x) => x.n === o.n));
    out.push(o);
  }
  return out;
}

/**
 * EVERYTHING THE CURRENT STEP NEEDS IS ON ITS SCREEN (owner, 2026-11-15 — the platform's « no back-and-forth » rule): the data
 * of the story and the results the student has already found in this case, as short lines kept beside the question.
 * `facts(o, i)` = what is known when step i is asked. A test checks that every number a step needs is in them or in its prompt.
 */
export function facts(o, i) {
  const f = [];
  const done = (id) => {
    const k = o.steps.findIndex((s) => s.id === id);
    return k >= 0 && k < i;
  };
  const U = o.good.unit;
  switch (o.kind) {
    case 'fit':
    case 'special':
      f.push(`Commande : ${count(U, o.n)}`);
      break;
    case 'count':
      f.push(`Commande : ${count(U, o.n)}`, `Demandé : ${count(BOX, o.q)} identiques et pleines`);
      break;
    case 'orders':
      f.push(`Contenance de la seule caisse : ${o.b}`);
      break;
    case 'cost':
      f.push(`Commande : ${count(U, o.n)}`, `Caisses : ${o.b1} ou ${o.b2}`, `Prix d’une caisse : ${eur(o.price)}`);
      if (done('first')) f.push(`${eq(o.n, o.b1, o.q1, o.r1)} : les caisses de ${o.b1} ne conviennent pas`);
      if (done('second')) f.push(`${eq(o.n, o.b2, o.q2, 0)} : ${count(BOX, o.q2)} de ${o.b2}`);
      break;
    case 'profit':
      f.push(`Récolte : ${count(U, o.n)}`, `Plateau de ${o.b1} : ${eur(o.p1)}`, `Plateau de ${o.b2} : ${eur(o.p2)}`);
      if (done('small')) f.push(`${eq(o.n, o.b1, o.q1, 0)} : ${count(TRAY, o.q1)} de ${o.b1}`);
      if (done('big')) f.push(`${eq(o.n, o.b2, o.q2, 0)} : ${count(TRAY, o.q2)} de ${o.b2}`);
      if (done('best')) f.push(`Le plus rentable : les plateaux de ${o.best}`);
      break;
    case 'trip':
      f.push(
        `À expédier : ${count(BOX, o.n)}`,
        `Charge d’un camion : ${count(BOX, o.b)}`,
        `Location d’un camion : ${eur(o.price)}`,
      );
      if (done('trucks')) f.push(`${eq(o.n, o.b, o.q, o.r)} : ${count(TRUCK, o.q + 1)}`);
      if (done('empty')) f.push(`Places vides : ${o.b - o.r}`);
      break;
    case 'share':
      f.push(`Dans le plat : ${count(U, o.n)}`, `Enfants : ${o.b}`);
      if (done('each')) f.push(`${eq(o.n, o.b, o.q, o.r)} : il reste ${count(o.good.left, o.r)}`);
      break;
    case 'tiling':
      f.push(`Longueur du couloir : ${o.L} cm`);
      if (done('tile'))
        f.push(
          `Longueur d’un carreau : ${o.s} cm`,
          `${eq(o.L, o.s, o.q, 0)} : ${count(TILE, o.q)} par rangée`,
          `Rangées : ${o.rows}`,
        );
      if (done('all'))
        f.push(`Total : $${o.rows} \\times ${o.q} = ${o.total}$ carreaux`, `Un paquet : ${count(TILE, o.box)}`);
      break;
    default:
      break;
  }
  return f;
}

/**
 * An answer as the student GAVE it, to read again later: parts of text, `mine: true` on what he chose or typed.
 * A choice is its option; a typed answer is its whole template with his numbers in place (« 330 = 30 × 11 »).
 * `rtl` is kept in the shape of a part and is always false now (the interface reads left to right).
 */
export function answerParts(step, value) {
  if (step.type === 'choose') {
    const picked = Array.isArray(value) ? value : [value];
    return picked.flatMap((v, i) => {
      const op = step.options.find((x) => x.v === v);
      return [
        ...(i ? [{ text: 'et', mine: false, rtl: false }] : []),
        { text: op?.label ?? String(v), mine: true },
        { text: op?.sub ?? '', mine: false, rtl: false },
      ];
    });
  }
  return step.tokens.map((t) =>
    typeof t === 'string' ? { text: t, mine: false, rtl: false } : { text: String(value?.[t.slot] ?? ''), mine: true },
  );
}

/** The right answer of a step — used by the tests and by the automated walk, never shown to the student. */
export function answerOf(o, stepIndex) {
  const id = o.steps[stepIndex].id;
  switch (`${o.kind}.${id}`) {
    case 'fit.crate':
      return o.b;
    case 'count.capacity':
      return { x: o.b };
    case 'orders.order':
      return o.n;
    case 'special.two':
      return [1, o.n];
    case 'cost.first':
      return { q: o.q1, r: o.r1 };
    case 'cost.second':
      return { q: o.q2 };
    case 'cost.invoice':
      return { x: o.q2 * o.price };
    case 'profit.small':
      return { q: o.q1 };
    case 'profit.big':
      return { q: o.q2 };
    case 'profit.best':
      return o.best;
    case 'profit.income':
      return { x: o.best === o.b1 ? o.q1 * o.p1 : o.q2 * o.p2 };
    case 'trip.trucks':
      return { x: o.q + 1 };
    case 'trip.empty':
      return { x: o.b - o.r };
    case 'trip.rent':
      return { x: (o.q + 1) * o.price };
    case 'share.each':
      return { q: o.q, r: o.r };
    case 'share.guests':
      return o.g;
    case 'tiling.tile':
      return o.s;
    case 'tiling.all':
      return { x: o.total };
    case 'tiling.boxes':
      return { x: o.boxes };
    default:
      return null;
  }
}

/**
 * Judges one step. `value` = the chosen option (a number, or two numbers for `pick: 2`) or { slot: number }.
 * Returns { ok, sims: [{ n, b, mode }], text } — `sims` is what the depot packs to SHOW the consequence of the answer;
 * `text` says what happened, in the depot's words (a right step is confirmed, a wrong one is explained by its own division).
 */
/** The shortcut worth showing once a step is RIGHT (never before: it would give the result away), or null. */
function tipFor(o, stepIndex) {
  const st = o.steps[stepIndex];
  switch (`${o.kind}.${st.id}`) {
    case 'fit.crate':
    case 'orders.order':
      return divisionTip(o.n, o.b);
    case 'cost.invoice':
      return productTip(o.q2, o.price);
    case 'profit.income':
      return o.best === o.b1 ? productTip(o.q1, o.p1) : productTip(o.q2, o.p2);
    case 'trip.rent':
      return productTip(o.q + 1, o.price);
    case 'share.guests':
      return divisionTip(o.n, o.g);
    case 'tiling.tile':
      return divisionTip(o.L, o.s);
    case 'tiling.all':
      return productTip(o.q, o.rows);
    default:
      return st.div ? divisionTip(st.div[0], st.div[1]) : null;
  }
}

export function judge(o, stepIndex, value) {
  const res = judgeRaw(o, stepIndex, value);
  return res.ok ? { ...res, tip: tipFor(o, stepIndex) } : res;
}

function judgeRaw(o, stepIndex, value) {
  const id = o.steps[stepIndex].id;
  const L = o.good.left;
  const num = (k) => Number(value?.[k]);
  const bad = (text, sims = []) => ({ ok: false, sims, text });
  const good = (text, sims = []) => ({ ok: true, sims, text });
  const money = (a, b) => `$${a} \\times ${b} = ${texNum(a * b)}$ €`;
  const leaves = (n, b) => {
    const { q, r } = divide(n, b);
    return `${eq(n, b, q, r)} : il reste ${count(L, r)} par terre.`;
  };
  const valid = (...ks) => ks.every((k) => Number.isInteger(num(k)) && num(k) >= 0);
  switch (`${o.kind}.${id}`) {
    case 'fit.crate': {
      const b = value;
      const { q, r } = divide(o.n, b);
      return r === 0
        ? good(`${eq(o.n, b, q, 0)} : ${count(BOX, q)} bien pleines, et rien ne reste.`, [{ n: o.n, b }])
        : bad(`${leaves(o.n, b)} La caisse de ${b} ne convient pas.`, [{ n: o.n, b }]);
    }
    case 'count.capacity': {
      if (!valid('x') || num('x') < 1) return bad('Écris la contenance d’une caisse.');
      const x = num('x');
      const { q, r } = divide(o.n, x);
      if (x === o.b)
        return good(`${eq(o.n, x, q, 0)} : ${count(BOX, q)}, comme le client l’a demandé.`, [{ n: o.n, b: x }]);
      return bad(
        r === 0
          ? `Avec des caisses de ${x}, tu remplis ${count(BOX, q)}, et le client en veut ${o.q}.`
          : `Avec des caisses de ${x} : ${leaves(o.n, x)}`,
        x <= o.n && q <= 40 ? [{ n: o.n, b: x }] : [],
      );
    }
    case 'orders.order': {
      const n = value;
      const { q, r } = divide(n, o.b);
      return r === 0
        ? good(`${eq(n, o.b, q, 0)} : ${n} est un multiple de ${o.b}, et ${o.b} est un diviseur de ${n}.`, [
            { n, b: o.b },
          ])
        : bad(`${leaves(n, o.b)} ${n} n’est pas un multiple de ${o.b}.`, [{ n, b: o.b }]);
    }
    case 'special.two': {
      const picked = [...value].sort((x, y) => x - y);
      const wrong = picked.find((x) => o.n % x !== 0);
      if (wrong) return bad(`${leaves(o.n, wrong)} La caisse de ${wrong} ne convient pas.`, [{ n: o.n, b: wrong }]);
      return good(
        `${eq(o.n, 1, o.n, 0)} et ${eq(o.n, o.n, 1, 0)} : 1 et le nombre lui-même sont toujours des diviseurs.`,
        [
          { n: o.n, b: 1 },
          { n: o.n, b: o.n },
        ],
      );
    }
    case 'cost.first': {
      if (!valid('q', 'r')) return bad('Écris les deux nombres : le nombre de caisses et le reste.');
      const q = num('q');
      const r = num('r');
      if (o.b1 * q > o.n)
        return bad(`${count(BOX, q)} de ${o.b1}, cela fait ${o.b1 * q}, et la commande n’est que de ${o.n}.`);
      if (o.b1 * q + r !== o.n)
        return bad(`Vérifie : $${o.b1} \\times ${q} + ${r} = ${o.b1 * q + r}$, et la commande est de ${o.n}.`);
      if (r >= o.b1)
        return bad(`Il reste ${r} : de quoi remplir une autre caisse. Le reste doit être plus petit que ${o.b1}.`);
      return good(
        `${eq(o.n, o.b1, q, r)} : le reste ${r} n’est pas nul, donc les caisses de ${o.b1} ne conviennent pas.`,
        [{ n: o.n, b: o.b1 }],
      );
    }
    case 'cost.second':
    case 'profit.small':
    case 'profit.big': {
      if (!valid('q')) return bad('Écris le nombre.');
      const b = id === 'second' ? o.b2 : id === 'small' ? o.b1 : o.b2;
      const q = num('q');
      if (b * q !== o.n) return bad(`Vérifie : $${b} \\times ${q} = ${b * q}$, et la commande est de ${o.n}.`);
      return good(`${eq(o.n, b, q, 0)} : le reste est 0, donc ${b} est un diviseur de ${o.n}.`, [{ n: o.n, b }]);
    }
    case 'cost.invoice': {
      if (!valid('x')) return bad('Écris le montant.');
      return num('x') === o.q2 * o.price
        ? good(`${money(o.q2, o.price)}.`)
        : bad(
            `Ce n’est pas ce montant. La facture : nombre de caisses × prix d’une caisse, soit $${o.q2} \\times ${o.price}$.`,
          );
    }
    case 'profit.best': {
      return value === o.best
        ? good(`${money(o.q1, o.p1)} et ${money(o.q2, o.p2)}.`)
        : bad(
            `Calcule les deux montants : $${o.q1} \\times ${o.p1}$ pour les plateaux de ${o.b1}, et $${o.q2} \\times ${o.p2}$ pour les plateaux de ${o.b2}, puis compare.`,
          );
    }
    case 'profit.income': {
      if (!valid('x')) return bad('Écris le montant.');
      const [q, p] = o.best === o.b1 ? [o.q1, o.p1] : [o.q2, o.p2];
      return num('x') === q * p
        ? good(`${money(q, p)}.`)
        : bad(`Ce n’est pas ce montant : nombre de plateaux × prix d’un plateau, soit $${q} \\times ${p}$.`);
    }
    case 'trip.trucks': {
      if (!valid('x') || num('x') < 1) return bad('Écris le nombre de camions.');
      const x = num('x');
      const sim = [{ n: o.n, b: o.b, mode: 'trucks' }];
      if (x === o.q + 1)
        return good(
          `${eq(o.n, o.b, o.q, o.r)} : ${count(TRUCK, o.q)} pleins, et un camion de plus pour les ${o.r} caisses restantes.`,
          sim,
        );
      if (x <= o.q)
        return bad(
          `Avec ${count(TRUCK, x)}, on ne transporte que $${o.b} \\times ${x} = ${o.b * x}$ caisses : il en reste ${o.n - o.b * x} sur le quai.`,
          x === o.q ? sim : [],
        );
      return bad(
        `${count(TRUCK, x)}, c’est plus qu’il n’en faut : calcule la division euclidienne de ${o.n} par ${o.b}, sans oublier le reste.`,
      );
    }
    case 'trip.empty': {
      if (!valid('x')) return bad('Écris le nombre.');
      return num('x') === o.b - o.r
        ? good(
            `Dans le dernier camion, ${o.r} places sur ${o.b} sont prises : il reste $${o.b} - ${o.r} = ${o.b - o.r}$ places vides.`,
          )
        : bad(
            `Le dernier camion ne transporte que le reste, soit ${count(BOX, o.r)} pour ${o.b} places. Combien lui en manque-t-il pour être plein ?`,
          );
    }
    case 'trip.rent': {
      if (!valid('x')) return bad('Écris le montant.');
      return num('x') === (o.q + 1) * o.price
        ? good(`${money(o.q + 1, o.price)}.`)
        : bad(
            `Ce n’est pas ce montant : on paie la location de tous les camions, soit $${o.q + 1} \\times ${o.price}$.`,
          );
    }
    case 'share.each': {
      if (!valid('q', 'r')) return bad('Écris les deux nombres : la part de chacun et les crêpes restantes.');
      const q = num('q');
      const r = num('r');
      if (o.b * q > o.n)
        return bad(
          `Il n’y a pas assez de crêpes : $${o.b} \\times ${q} = ${o.b * q}$, et le plat n’en contient que ${o.n}.`,
        );
      if (o.b * q + r !== o.n)
        return bad(`Vérifie : $${o.b} \\times ${q} + ${r} = ${o.b * q + r}$, et le plat contient ${o.n} crêpes.`);
      if (r >= o.b)
        return bad(
          `Il reste ${count(L, r)} : chacun peut en avoir une de plus. Le reste doit être plus petit que ${o.b}.`,
        );
      return good(`${eq(o.n, o.b, q, r)} : chacun en a ${q}, et il reste ${count(L, r)} dans le plat.`, [
        { n: o.n, b: o.b, mode: 'share' },
      ]);
    }
    case 'share.guests': {
      const x = value;
      const { q, r } = divide(o.n, x);
      const sim = [{ n: o.n, b: x, mode: 'share' }];
      return r === 0
        ? good(
            `${eq(o.n, x, q, 0)} : chaque enfant en a ${q}, et il ne reste rien. ${x} est un diviseur de ${o.n} : le partage est parfaitement équitable.`,
            sim,
          )
        : bad(
            `${eq(o.n, x, q, r)} : il reste ${count(L, r)} dans le plat. Avec ${count(KIDS, x)}, le partage ne tombe pas juste.`,
            sim,
          );
    }
    case 'share.fair': {
      if (!valid('q')) return bad('Écris la part de chacun.');
      return num('q') === o.gq
        ? good(`${eq(o.n, o.g, o.gq, 0)} : tout le monde a la même part.`)
        : bad(`Vérifie : $${o.g} \\times ${num('q')} = ${o.g * num('q')}$, et le plat contient ${o.n} crêpes.`);
    }
    case 'tiling.tile': {
      const x = value;
      const { q, r } = divide(o.L, x);
      const sim = [{ n: o.L, b: x, mode: 'row' }];
      return r === 0
        ? good(`${eq(o.L, x, q, 0)} : ${count(TILE, q)} entiers couvrent le couloir, sans aucune coupe.`, sim)
        : bad(
            `${eq(o.L, x, q, r)} : il reste ${r} cm au bout du couloir. Il faudrait couper un carreau : ce n’est pas du travail soigné.`,
            sim,
          );
    }
    case 'tiling.perRow': {
      if (!valid('q')) return bad('Écris le nombre de carreaux.');
      return num('q') === o.q
        ? good(`${eq(o.L, o.s, o.q, 0)} : ${count(TILE, o.q)} par rangée.`)
        : bad(`Vérifie : $${o.s} \\times ${num('q')} = ${o.s * num('q')}$ cm, et le couloir mesure ${o.L} cm.`);
    }
    case 'tiling.all': {
      if (!valid('x')) return bad('Écris le total des carreaux.');
      return num('x') === o.total
        ? good(`$${o.rows} \\times ${o.q} = ${o.total}$ : il lui faut ${count(TILE, o.total)}.`)
        : bad(`Ce n’est pas ce nombre : nombre de rangées × carreaux d’une rangée, soit $${o.rows} \\times ${o.q}$.`);
    }
    case 'tiling.boxes': {
      if (!valid('x') || num('x') < 1) return bad('Écris le nombre de paquets.');
      const x = num('x');
      const sim = [{ n: o.total, b: o.box, mode: 'boxes' }];
      if (x === o.boxes)
        return good(
          `${eq(o.total, o.box, o.bq, o.br)} : ${count(PACK, o.bq)} ne suffisent pas, donc elle en achète ${o.boxes}. Il reste ${count(TILE, o.spare)} : elle les garde pour les réparations, rien n’est gaspillé.`,
          sim,
        );
      if (x <= o.bq)
        return bad(
          `${count(PACK, x)}, cela fait seulement $${o.box} \\times ${x} = ${o.box * x}$ carreaux : il lui manque ${count(TILE, o.total - o.box * x)}.`,
          x === o.bq ? sim : [],
        );
      return bad(
        `${count(PACK, x)}, c’est plus qu’il n’en faut, et ${TILER} ne gaspille pas. Calcule la division euclidienne de ${o.total} par ${o.box}, sans oublier le reste.`,
      );
    }
    default:
      return bad('');
  }
}
