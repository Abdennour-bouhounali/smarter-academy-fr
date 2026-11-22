/**
 * engine — le moteur PUR de « جولة الانطلاق » (بوصلتي, P1).
 *
 * Déterministe : (cibles, graphe des prérequis, réponses) → prochaine action,
 * bandes, priorité. Le serveur ne stocke QUE les réponses (corrigées côté
 * serveur) ; reprendre une session = rejouer ses réponses ici.
 * Contrat : docs/architecture/YEAR_COMPASS.md §4.
 *
 * Machine par كفاءة (item du programme), niveaux 1 = très facile, 2 = plus dur :
 *   L1 ✓ → L2 ✓ → « ثابتة » (2 réponses, dont le niveau haut)
 *   L1 ✓ → L2 ✗ → « تحتاج تثبيتًا »
 *   L1 ✗ → L1' ✓ → L2 ✓ → « تحتاج تثبيتًا » (un faux pas)
 *   L1 ✗ → L1' ✓ → L2 ✗ → « تحتاج تثبيتًا »
 *   L1 ✗ → L1' ✗ → « نبدأ منها »
 * « غير متأكّد » compte comme ✗ pour la décision (jamais comme une faute
 * affichée). Un item non « ثابتة » ouvre ses prérequis à l'étape suivante
 * (au plus 2 étapes, jamais 3) ; un item partagé n'est mesuré qu'une fois.
 */

export const BANDS = Object.freeze({ SOLID: 'solid', CONSOLIDATE: 'consolidate', START: 'start', UNSEEN: 'unseen' });
const MAX_STEP = 2;
const DEFAULTS = Object.freeze({ maxQuestions: 36, roundSize: 12, prereqsPerItem: 2 });

/**
 * L'état d'un item après ses réponses (dans l'ordre).
 * → { done, band, next: null | { level } }.
 */
export function itemProgress(answers) {
  const ok = (a) => a.correct === true && !a.unsure;
  const [a1, a2, a3] = answers;
  if (!a1) return { done: false, band: BANDS.UNSEEN, next: { level: 1 } };
  if (ok(a1)) {
    if (!a2) return { done: false, band: BANDS.UNSEEN, next: { level: 2 } };
    return { done: true, band: ok(a2) ? BANDS.SOLID : BANDS.CONSOLIDATE, next: null };
  }
  if (!a2) return { done: false, band: BANDS.UNSEEN, next: { level: 1 } };
  if (!ok(a2)) return { done: true, band: BANDS.START, next: null };
  if (!a3) return { done: false, band: BANDS.UNSEEN, next: { level: 2 } };
  return { done: true, band: BANDS.CONSOLIDATE, next: null };
}

const before = (a, b) => {
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return a[i] < b[i];
  }
  return false;
};

/**
 * Rejoue une session.
 * @param {object} p
 * @param {string[]} p.targets   items cibles (règles A + B), dans l'ordre de la classe
 * @param {(id: string) => string[]} p.prereqsOf  prérequis directs d'un item (un pas dans le réseau), du plus proche au plus lointain
 * @param {{ itemId: string, level: number, correct: boolean, unsure?: boolean }[]} p.answers
 * @param {(id: string, level: number) => boolean} [p.hasQuestion]  faux → l'item reste « لم نفحصها بعد »
 * @param {object} [p.options]
 */
export function replay({ targets, prereqsOf, answers, hasQuestion = () => true, options = {} }) {
  const opt = { ...DEFAULTS, ...options };
  const items = new Map();
  const order = [];
  const add = (id, step, parent) => {
    if (items.has(id)) {
      const it = items.get(id);
      if (parent && !it.parents.includes(parent)) it.parents.push(parent);
      return;
    }
    items.set(id, { id, step, parents: parent ? [parent] : [], answers: [], opened: false, children: [] });
    order.push(id);
  };
  for (const t of targets) add(t, 0, null);

  const byItem = new Map();
  for (const a of answers) {
    if (!byItem.has(a.itemId)) byItem.set(a.itemId, []);
    byItem.get(a.itemId).push(a);
  }

  // Ouvre les prérequis des items terminés non « ثابتة », jusqu'à stabilité.
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of [...order]) {
      const it = items.get(id);
      it.answers = byItem.get(id) ?? [];
      const pr = itemProgress(it.answers);
      if (pr.done && pr.band !== BANDS.SOLID && !it.opened && it.step < MAX_STEP) {
        it.opened = true;
        const kids = prereqsOf(id).filter((k) => k !== id).slice(0, opt.prereqsPerItem);
        it.children = kids;
        for (const k of kids) add(k, it.step + 1, id);
        changed = true;
      }
    }
  }

  // Prochaine question : le niveau le plus bas d'abord (très facile → plus dur),
  // puis l'étape la plus profonde (on finit de localiser une lacune ouverte),
  // puis l'ordre d'apparition.
  let next = null;
  if (answers.length < opt.maxQuestions) {
    let best = null;
    order.forEach((id, idx) => {
      const it = items.get(id);
      const pr = itemProgress(it.answers);
      if (pr.done || !pr.next || !hasQuestion(id, pr.next.level)) return;
      const key = [pr.next.level, -it.step, idx];
      if (!best || before(key, best.key)) best = { key, itemId: id, level: pr.next.level };
    });
    if (best) next = { itemId: best.itemId, level: best.level };
  }

  const asked = answers.length;
  return {
    items,
    order,
    next,
    asked,
    finished: next === null,
    roundIndex: Math.floor(asked / opt.roundSize),
    inRound: asked % opt.roundSize,
    /** Une manche vient de se terminer et il reste des questions : « واصل أو توقّف ». */
    roundEnded: asked > 0 && asked % opt.roundSize === 0 && next !== null,
  };
}

/** Les bandes finales : Map id → band (UNSEEN pour un item jamais terminé). */
export function bandsOf(session) {
  const out = new Map();
  for (const id of session.order) {
    const pr = itemProgress(session.items.get(id).answers);
    out.set(id, pr.done ? pr.band : BANDS.UNSEEN);
  }
  return out;
}

/** Compte par bande — ce que montre le rapport (jamais un %). */
export function bandCounts(bands) {
  const c = { solid: 0, consolidate: 0, start: 0, unseen: 0 };
  for (const b of bands.values()) c[b] += 1;
  return c;
}

/**
 * La priorité « ابدأ من هنا » et deux « وأيضًا ».
 * Règle : la lacune la plus PROFONDE d'abord (« نبدأ منها » à l'étape la plus
 * haute, car la réparer débloque ce qui est au-dessus), puis « تحتاج تثبيتًا » ;
 * à égalité, l'ordre de la classe.
 * → { priority: id | null, also: id[] (≤ 2), rest: id[] }
 */
export function priorities(session, bands = bandsOf(session)) {
  const rank = (id) => {
    const b = bands.get(id);
    const step = session.items.get(id).step;
    if (b === BANDS.START) return [0, -step];
    if (b === BANDS.CONSOLIDATE) return [1, -step];
    return null;
  };
  const ranked = session.order
    .map((id, idx) => ({ id, idx, r: rank(id) }))
    .filter((x) => x.r)
    .sort((a, b) => a.r[0] - b.r[0] || a.r[1] - b.r[1] || a.idx - b.idx)
    .map((x) => x.id);
  return { priority: ranked[0] ?? null, also: ranked.slice(1, 3), rest: ranked.slice(3) };
}
