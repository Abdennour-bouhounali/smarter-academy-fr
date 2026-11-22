#!/usr/bin/env node
/**
 * Construit les niveaux de « المستكشف » (le jeu de plates-formes de « فضاء
 * الألعاب ») → apps/api/resources/games/explorer/levels.json.
 *
 * Le fichier est LA source commune : le moteur web l'importe (cartes,
 * physique, barème) et l'API le lit pour borner un score (le maximum
 * possible d'un niveau) et une durée (le minimum pour le traverser).
 *
 * Les niveaux sont ASSEMBLÉS, de façon déterministe (graine fixe), à partir
 * de morceaux dont la jouabilité est garantie par construction : un trou ne
 * dépasse jamais MAX_GAP colonnes, une marche jamais MAX_STEP lignes, un
 * rebord haut n'existe qu'après un ressort. `node scripts/games/build-explorer-levels.mjs --check`
 * échoue si le fichier versionné n'est plus celui que produit ce script.
 *
 * Légende (une case = une tuile) :
 *   .  vide          #  sol           B  brique        ?  bloc-cristal (frappé par-dessous)
 *   P  bloc-bouclier =  plate-forme traversable par-dessous
 *   c  cristal       S  ressort       ^  pics          ~  lave
 *   e  gluant (on l'écrase)   k  hérisson (on l'évite)   f  drone (on l'écrase)
 *   @  départ        C  balise (point de reprise)      G  fusée (arrivée)
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'apps/api/resources/games/explorer/levels.json');
const H = 14;
const MAX_GAP = 3;
const MAX_STEP = 2;

const PHYSICS = {
  gravity: 60,
  jumpVelocity: 18,
  jumpCut: 0.45,
  runSpeed: 7,
  accel: 55,
  friction: 40,
  maxFall: 22,
  springVelocity: 28,
  stompBounce: 12,
  coyote: 0.1,
  jumpBuffer: 0.12,
  playerW: 0.72,
  playerH: 0.92,
};

const SCORING = { crystal: 10, block: 10, enemy: 50, power: 100, completeBase: 1000, completePerLevel: 100, timeBonusPerSecond: 5 };

const WORLDS = [
  { id: 'moon', levels: [1, 2, 3, 4], pit: 'void' },
  { id: 'mars', levels: [5, 6, 7, 8], pit: 'lava' },
  { id: 'nebula', levels: [9, 10, 11, 12], pit: 'void' },
];

function rngFrom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildLevel(n, world) {
  const rnd = rngFrom(1000 + n * 7919);
  const pick = (list) => list[Math.floor(rnd() * list.length)];
  const diff = (n - 1) % 4 + Math.floor((n - 1) / 4); // 0..5
  const cols = [];
  let ground = 11;
  const blank = () => Array(H).fill('.');
  const column = (g = ground) => {
    const c = blank();
    for (let y = g; y < H; y++) c[y] = '#';
    return c;
  };
  const put = (x, y, ch) => { if (cols[x] && y >= 0 && y < H) cols[x][y] = ch; };

  const flat = (len) => { const x0 = cols.length; for (let i = 0; i < len; i++) cols.push(column()); return x0; };
  const crystalsRow = (x0, len, y) => { for (let i = 0; i < len; i++) put(x0 + i, y, 'c'); };

  const seg = {
    start() { const x = flat(7); put(x + 2, ground - 1, '@'); },
    plain() { const x = flat(5 + Math.floor(rnd() * 3)); crystalsRow(x + 1, 3, ground - 1); },
    gap() {
      const w = Math.min(MAX_GAP, 2 + Math.floor(rnd() * (diff >= 2 ? 2 : 1)));
      flat(2);
      const x0 = cols.length;
      for (let i = 0; i < w; i++) {
        const c = blank();
        if (world.pit === 'lava') { c[H - 2] = '~'; c[H - 1] = '~'; }
        cols.push(c);
      }
      for (let i = 0; i < w; i++) put(x0 + i, ground - 3, 'c');
      flat(2);
    },
    stepUp() { const h = 1 + Math.floor(rnd() * MAX_STEP); if (ground - h < 6) return seg.plain(); ground -= h; const x = flat(4); put(x + 2, ground - 1, 'c'); },
    stepDown() { const h = 1 + Math.floor(rnd() * MAX_STEP); if (ground + h > 12) return seg.plain(); ground += h; flat(4); },
    blocks() {
      const x = flat(8);
      const y = ground - 4;
      const kinds = rnd() < 0.35 ? ['B', '?', 'P', '?'] : ['?', 'B', '?', 'B'];
      kinds.forEach((k, i) => put(x + 2 + i, y, k));
      put(x + 3, y - 1, 'c');
    },
    enemy() { const x = flat(8); put(x + 4, ground - 1, 'e'); crystalsRow(x + 2, 2, ground - 4); },
    crawler() { const x = flat(8); put(x + 4, ground - 1, 'k'); },
    drone() { const x = flat(7); put(x + 3, ground - 3, 'f'); crystalsRow(x + 1, 2, ground - 1); },
    spikes() { const w = diff >= 3 ? 2 : 1; const x = flat(4 + w); for (let i = 0; i < w; i++) put(x + 2 + i, ground - 1, '^'); put(x + 2, ground - 3, 'c'); },
    spring() {
      if (ground < 9) return seg.plain();
      const x = flat(3);
      put(x + 1, ground - 1, 'S');
      const high = ground - 5;
      // Le rebord haut : seul le ressort y mène ; des cristaux en récompense.
      const x1 = cols.length;
      for (let i = 0; i < 5; i++) { const c = column(); for (let y = high; y < ground; y++) c[y] = y === high ? '#' : '.'; cols.push(c); }
      for (let i = 0; i < 4; i++) put(x1 + i, high - 1, 'c');
      flat(2);
    },
    platforms() {
      flat(2);
      const x0 = cols.length;
      const w = 6;
      for (let i = 0; i < w; i++) {
        const c = blank();
        if (world.pit === 'lava') { c[H - 2] = '~'; c[H - 1] = '~'; }
        cols.push(c);
      }
      // Deux plates-formes traversables, à portée de saut de chaque bord.
      put(x0 + 1, ground - 1, '='); put(x0 + 2, ground - 1, '=');
      put(x0 + 4, ground - 2, '='); put(x0 + 5, ground - 2, '=');
      put(x0 + 4, ground - 3, 'c');
      flat(2);
    },
    checkpoint() { const x = flat(4); put(x + 2, ground - 1, 'C'); },
    goal() { const x = flat(10); put(x + 5, ground - 1, 'G'); },
  };

  const pool = ['plain', 'gap', 'stepUp', 'stepDown', 'blocks', 'enemy', 'blocks', 'enemy'];
  if (diff >= 1) pool.push('crawler', 'spikes', 'platforms');
  if (diff >= 2) pool.push('drone', 'spring', 'gap', 'crawler');
  if (diff >= 3) pool.push('spikes', 'drone', 'platforms', 'enemy');

  const length = 80 + diff * 22;
  seg.start();
  seg.plain();
  let checkpointed = false;
  let last = '';
  while (cols.length < length) {
    let name = pick(pool);
    if (name === last && name !== 'plain') name = 'plain';
    seg[name]();
    last = name;
    if (!checkpointed && cols.length > length / 2) { seg.checkpoint(); checkpointed = true; }
  }
  if (ground < 11) { ground = Math.min(11, ground + 2); flat(2); }
  seg.goal();

  const rows = Array.from({ length: H }, (_, y) => cols.map((c) => c[y]).join(''));
  const width = cols.length;
  const time = Math.ceil(((width / PHYSICS.runSpeed) * 2.6 + 30) / 10) * 10;
  return { n, world: world.id, time, rows };
}

/** Ce que l'API recalcule aussi : le maximum d'un niveau et sa durée minimale. */
export function summarize(level) {
  const count = (ch) => level.rows.reduce((s, r) => s + r.split(ch).length - 1, 0);
  const find = (ch) => {
    for (let y = 0; y < level.rows.length; y++) { const x = level.rows[y].indexOf(ch); if (x >= 0) return { x, y }; }
    return null;
  };
  const start = find('@');
  const goal = find('G');
  return {
    crystals: count('c') + count('?'),
    stompable: count('e') + count('f'),
    powers: count('P'),
    start, goal,
    width: level.rows[0].length,
  };
}

function validate(level) {
  const s = summarize(level);
  if (!s.start || !s.goal) throw new Error(`level ${level.n}: start/goal missing`);
  if (count1(level, '@') !== 1 || count1(level, 'G') !== 1) throw new Error(`level ${level.n}: exactly one start and one goal`);
  // Aucun trou plus large que MAX_GAP sur la ligne de sol (hors plates-formes).
  let run = 0;
  for (let x = 0; x < s.width; x++) {
    const solid = level.rows.some((r) => r[x] === '#' || r[x] === '=');
    run = solid ? 0 : run + 1;
    if (run > MAX_GAP) throw new Error(`level ${level.n}: gap wider than ${MAX_GAP} at x=${x}`);
  }
}
const count1 = (level, ch) => level.rows.reduce((s, r) => s + r.split(ch).length - 1, 0);

const levels = [];
for (const world of WORLDS) for (const n of world.levels) { const l = buildLevel(n, world); validate(l); levels.push(l); }

const data = { version: 1, generatedBy: 'scripts/games/build-explorer-levels.mjs', physics: PHYSICS, scoring: SCORING, worlds: WORLDS.map(({ id, levels: ls }) => ({ id, levels: ls })), levels };
const json = `${JSON.stringify(data, null, 1)}\n`;

if (process.argv.includes('--check')) {
  const current = readFileSync(OUT, 'utf8');
  if (current !== json) { console.error('levels.json is stale — run node scripts/games/build-explorer-levels.mjs'); process.exit(1); }
  console.log(`✅ ${levels.length} levels up to date`);
} else {
  writeFileSync(OUT, json);
  for (const l of levels) {
    const s = summarize(l);
    console.log(`L${l.n} ${l.world} w=${s.width} t=${l.time}s crystals=${s.crystals} enemies=${s.stompable} powers=${s.powers}`);
  }
}
