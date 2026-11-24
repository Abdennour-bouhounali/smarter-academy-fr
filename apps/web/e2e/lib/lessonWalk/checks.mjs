// The checks the lessons' own walks carried (lessons 4–6, defects.md « To move ») — here ONCE, for every lesson. Each takes
// the walk `w` (lib/walk.mjs › createWalk) and the page; none names a lesson. What every screenshot already checks is
// lib/walk.mjs › shot (nothing scrolls, 12 px, raw LaTeX, formulas, foreign words, a way out): these add what it cannot see.
import { FLOOR_PX } from '../walk.mjs';

/**
 * A sentence that calls his answer WRONG (« faux », « fausse », « erroné », « incorrect »): never said by the world, the
 * forge or a hint (FRENCH_LANGUAGE_CONTRACT.md §2 — the world shows what happens). The trainer's two answer buttons
 * « Vrai » / « Faux » are words of a statement, not a verdict: test feedback texts only, never a button.
 */
export const WRONG_WORD = /\bfau(?:x|sses?)\b|\berron[ée]e?s?\b|\bincorrecte?s?\b/i;

/** A regexp of the words that may not be read yet (null: none). */
export const wordsRe = (words) =>
  words.length ? new RegExp(words.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')) : null;

/**
 * A WORLD screen (B14, A1): the instruction on screen, uncovered, 16 px when open, never under the card on the right; the
 * « Appuie sur E » prompt off the equation and its verdict; the instruction, the card and Zero's sentence name no rule not forged
 * yet (`forbid`, a regexp or null). Then the screenshot.
 */
export async function worldShot(w, page, label, forbid, opts) {
  await page.waitForTimeout(250);
  const r = await page.evaluate(() => {
    const shown = (el) => {
      if (!el) return false;
      const b = el.getBoundingClientRect();
      return b.width > 0 && b.height > 0 && getComputedStyle(el).visibility !== 'hidden';
    };
    const meet = (a, b) =>
      Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
      Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
    const ins = document.querySelector('[data-di-instruction]');
    const out = { has: shown(ins), state: ins?.dataset.diInstruction ?? null, covered: [], px: null, overlap: [] };
    if (out.has) {
      const b = ins.getBoundingClientRect();
      for (const [fx, fy] of [
        [0.5, 0.5],
        [0.15, 0.3],
        [0.85, 0.3],
        [0.15, 0.75],
        [0.85, 0.75],
      ]) {
        const top = document.elementFromPoint(b.left + b.width * fx, b.top + b.height * fy);
        if (top && !ins.contains(top) && !top.contains(ins))
          out.covered.push(String(top.className?.baseVal ?? top.className).split(' ')[0] || top.tagName);
      }
      const text = ins.querySelector('.di-objective');
      if (text) out.px = parseFloat(getComputedStyle(text).fontSize);
      const rc = document.querySelector('[data-di-recall]');
      if (shown(rc) && meet(b, rc.getBoundingClientRect())) out.overlap.push('the card on the right');
    }
    const prompt = document.querySelector('[data-di-wprompt]');
    if (shown(prompt))
      for (const sel of ['.di-eq', '.di-verdict']) {
        const el = document.querySelector(sel);
        if (shown(el) && meet(prompt.getBoundingClientRect(), el.getBoundingClientRect())) out.overlap.push(sel);
      }
    out.texts = ['[data-di-instruction]', '[data-di-recall]']
      .map((sel) => document.querySelector(sel)?.textContent ?? '')
      .join(' ');
    out.say = window.__world?.getState().say?.text ?? '';
    return out;
  });
  w.check(
    r.has && r.covered.length === 0 && r.overlap.length === 0,
    `${label}: the instruction is on screen (${r.state}), nothing covers it, the « E » prompt and the card on the right beside what they would hide${r.covered.length ? ' — covered by ' + r.covered.join(', ') : ''}${r.overlap.length ? ' — overlaps ' + r.overlap.join(', ') : ''}`,
  );
  if (r.state === 'open') w.check(r.px >= 16, `${label}: the instruction is written at 16 px at least (${r.px} px)`);
  if (forbid) {
    const said = `${r.texts} ${r.say}`;
    const m = said.match(forbid);
    w.check(!m, `${label}: the islands name no rule before its tablet${m ? ` — « ${m[0]} »` : ''}`);
  }
  await w.shot(page, label, opts);
  return r;
}

/** A screen that covers the top bar (a forge, a bench): its OWN ✕ and sound button, uncovered, beside its title (B15). */
export async function ownTools(w, page, where, root = '.rf-root') {
  const t = await page.evaluate((R) => {
    const seen = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return (
        r.width > 0 && r.left >= 0 && r.right <= window.innerWidth + 1 && r.top >= 0 && (el === top || el.contains(top))
      );
    };
    const head = document.querySelector(`${R} .rf-head`);
    const kids = head ? [...head.children].map((k) => k.getBoundingClientRect()) : [];
    const apart = kids.every((a, i) => kids.every((b, j) => i >= j || a.right <= b.left + 1 || b.right <= a.left + 1));
    return { exit: seen(`${R} [data-di-exit]`), sound: seen(`${R} [data-di-sound]`), apart };
  }, root);
  w.check(
    t.exit && t.sound && t.apart,
    `${where}: its own ✕ and sound button, uncovered, beside its title (${JSON.stringify(t)})`,
  );
}

/** The forge's tiles: no tile, chip or column heading cut or off the screen. */
export async function tilesFit(w, page, where) {
  const bad = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll(
      '.rf-root [data-rf-tile], .rf-root .rf-slot > *:first-child, .rf-root .rf-chip, .rf-root .rf-tiles[data-rf-slots] h4',
    )) {
      const r = el.getBoundingClientRect();
      if (!r.width) continue;
      if (el.scrollWidth > el.clientWidth + 1) out.push(`cut: « ${el.textContent.trim().slice(0, 30)} »`);
      if (r.left < -1 || r.right > window.innerWidth + 1)
        out.push(`off screen: « ${el.textContent.trim().slice(0, 30)} »`);
    }
    return out;
  });
  w.check(
    bad.length === 0,
    `${where}: every tile, heading and chip whole on screen${bad.length ? ' — ' + bad.join(' | ') : ''}`,
  );
}

/** The words of a key's name never in its mirror before its tablet (A1, A2). */
export async function noName(w, page, where, re) {
  if (!re) return;
  const t = (await page.textContent('.rf-root')) ?? '';
  const m = t.match(re);
  w.check(!m, `${where}: the mirror names nothing before the tablet${m ? ` — « ${m[0]} »` : ''}`);
}

/**
 * The last step's lines: each on ONE row, nothing leaves the forge. A typed FRACTION (`[data-rf-frac]`, lesson 8: two
 * boxes stacked over a bar) is ONE unit of its row: the units of a line share a horizontal band (none sits wholly below
 * another), and a line is at most twice as tall as its tallest unit.
 */
export async function lastStepLayout(w, page, where) {
  const m = await page.evaluate(() => {
    const lines = [...document.querySelectorAll('.rf-root .rf-use')];
    const root = document.querySelector('.rf-root').getBoundingClientRect();
    const bad = [];
    lines.forEach((l, i) => {
      const r = l.getBoundingClientRect();
      // a unit of a line: a typed fraction, a box, a choice among written options (kit/ChoiceToken.jsx) — each ONE
      const units = [
        ...l.querySelectorAll('[data-rf-frac]'),
        ...[...l.querySelectorAll('[data-rf-use], [data-kit-choice]')].filter((b) => !b.closest('[data-rf-frac]')),
      ].map((b) => b.getBoundingClientRect());
      if (units.length && Math.max(...units.map((b) => b.top)) >= Math.min(...units.map((b) => b.bottom)))
        bad.push(`line ${i + 1}: its boxes wrap`);
      // two lines side by side (a two-column last step) share their row's height: the tallest unit of the ROW counts
      const row = lines.filter((x) => Math.abs(x.getBoundingClientRect().top - r.top) < 3);
      const tall = row.flatMap((x) => [
        ...[...x.querySelectorAll('[data-rf-frac]')].map((b) => b.getBoundingClientRect().height),
        ...[...x.querySelectorAll('[data-rf-use], [data-kit-choice]')].map((b) => b.getBoundingClientRect().height),
      ]);
      const bh = tall.length ? Math.max(...tall) : units.length ? Math.max(...units.map((b) => b.height)) : 30;
      if (r.height > bh * 1.9) bad.push(`line ${i + 1}: ${Math.round(r.height)} px tall (a box ${Math.round(bh)})`);
      if (r.right > root.right + 1 || r.left < root.left - 1 || r.bottom > root.bottom + 1)
        bad.push(`line ${i + 1} leaves the forge`);
    });
    return {
      n: lines.length,
      boxes: lines.map((l) => l.querySelectorAll('[data-rf-use], [data-kit-choice]').length),
      bad,
    };
  });
  w.check(
    m.bad.length === 0,
    `${where}: the last step's ${m.n} lines (boxes ${m.boxes.join('/')}) each on one row${m.bad.length ? ' — ' + m.bad.join(' | ') : ''}`,
  );
  return m;
}

/**
 * A case about TWO gaps (A10b): every line of the log names both gaps and the plank on one line, its mini drawn as two
 * bars; during an attack the mirror draws TWO bridges (`data-rf-pair`), their words at 12 px at least, inside the mirror,
 * apart; once dealt, each bridge holds or falls as the walk computes (`n % d`).
 */
export async function pairChecks(w, page, where) {
  await page.waitForTimeout(450);
  const f = await page.evaluate(() => window.__forge);
  const m = await page.evaluate((FLOOR) => {
    const meet = (a, b) =>
      Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 &&
      Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
    const out = { bad: [] };
    const log = document.querySelector('.rf-log ul')?.getBoundingClientRect();
    const rows = [...document.querySelectorAll('.rf-root [data-rf-row]')];
    out.rows = rows.length;
    for (const li of rows) {
      const head = li.querySelector(':scope > div');
      const id = li.dataset.rfRow;
      if (!head?.classList.contains('rf-line--pair')) out.bad.push(`${id}: not a pair line`);
      if (li.querySelectorAll('svg.rf-mini--pair > g').length !== 2) out.bad.push(`${id}: its mini is not two bars`);
      if (!head) continue;
      const lh = Math.max(
        ...[...head.querySelectorAll('strong, span, em')].map((e) => e.getBoundingClientRect().height),
        1,
      );
      if (head.getBoundingClientRect().height > lh * 1.35) out.bad.push(`${id}: its line wraps`);
      const r = li.getBoundingClientRect();
      if (log && (r.left < log.left - 1 || r.right > log.right + 1)) out.bad.push(`${id}: leaves the column`);
      if (head.scrollWidth > head.clientWidth + 1) out.bad.push(`${id}: its line is cut`);
    }
    const svg = document.querySelector('.rf-root [data-rf-pair]');
    out.pair = svg?.dataset.rfPair ?? null;
    out.bridge = document.querySelectorAll('.rf-root [data-rf-bridge]').length;
    if (svg) {
      out.stage = svg.dataset.rfStage;
      out.fills = [...svg.querySelectorAll('[data-rf-pair-row]')].map((g) => [
        Number(g.dataset.rfPairRow),
        g.dataset.rfFills,
        g.getAttribute('class'),
      ]);
      const vb = svg.viewBox.baseVal;
      const sr = svg.getBoundingClientRect();
      const k = Math.min(sr.width / vb.width, sr.height / vb.height);
      const box = document.querySelector('.rf-mirror').getBoundingClientRect();
      if (sr.top < box.top - 1 || sr.bottom > box.bottom + 1 || sr.left < box.left - 1 || sr.right > box.right + 1)
        out.bad.push('the two bridges leave the mirror');
      const texts = [];
      for (const el of svg.querySelectorAll('text')) {
        const px = parseFloat(getComputedStyle(el).fontSize) * k;
        if (px < FLOOR) out.bad.push(`« ${el.textContent} » drawn at ${px.toFixed(1)} px`);
        const r = el.getBoundingClientRect();
        if (r.top < box.top - 1 || r.bottom > box.bottom + 1) out.bad.push(`« ${el.textContent} » leaves the mirror`);
        texts.push({ t: el.textContent, r });
      }
      for (let i = 0; i < texts.length; i += 1)
        for (let j = i + 1; j < texts.length; j += 1)
          if (meet(texts[i].r, texts[j].r)) out.bad.push(`« ${texts[i].t} » over « ${texts[j].t} »`);
    }
    return out;
  }, FLOOR_PX);
  w.check(
    m.rows >= 1 && m.bad.length === 0,
    `${where}: ${m.rows} log lines and the mirror drawn as pairs, whole, in their boxes${m.bad.length ? ' — ' + m.bad.join(' | ') : ''}`,
  );
  if (f?.phase !== 'attack' || !f.atk) return;
  const c = f.atk.list[f.atk.i];
  w.check(
    m.pair === `${c.A}:${c.B}:${c.d}` && m.bridge === 0 && m.fills?.length === 2,
    `${where}: the mirror draws TWO bridges, ${c.A} and ${c.B}, the plank ${c.d} on each (${m.pair})`,
  );
  if (m.stage === 'done')
    for (const [n, f1, cls] of m.fills ?? []) {
      const yes = n % c.d === 0;
      w.check(
        f1 === (yes ? '1' : '0') && String(cls).includes(yes ? 'is-held' : 'is-fell'),
        `${where}: the bridge of ${n} ${yes ? 'holds' : 'falls'} with planks of ${c.d} (${cls})`,
      );
    }
}

/**
 * What an investigation screen is made of, world by world: its frame, the parts measured inside it, its drawn scenes. The
 * islands' (`divisorIsles/Inquiry*.jsx`) by default; another world passes its own (`worlds/<world>.mjs`).
 */
export const IQ_FRAME = {
  frame: '.iq',
  parts:
    'button, input, .iq-lead p, .iq-goal, .iq-fact, .iq-calc, .iq-scene, .iq-found li, .iq-chips, .iq-tpl, .iq-askline, .iq-lists, .iq-rung, .iq-both__col',
  scene: 'svg.iq-scene',
};

/**
 * An investigation screen (a bench or a forge's experiment): nothing leaves its frame, no button covered, no text under
 * 12 px (the frame's zoom counted), SVG text of its scene at its DRAWN size and apart, nothing scrolls (B3, B8).
 */
export async function inquiryFits(
  w,
  page,
  name,
  exit = ['[data-di-exit]', '[data-di-bench-back]'],
  frameOf = IQ_FRAME,
) {
  await page.waitForTimeout(250);
  const bad = await page.evaluate(
    ([FLOOR, F]) => {
      const meet = (a, b) =>
        Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 &&
        Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
      const out = [];
      const frame = document.querySelector(F.frame);
      if (!frame) return ['no investigation on screen'];
      const box = frame.getBoundingClientRect();
      const zoom = parseFloat(document.querySelector('.rf-fit')?.style.zoom) || 1;
      for (const el of frame.querySelectorAll(F.parts)) {
        const r = el.getBoundingClientRect();
        if (!r.width) continue;
        if (r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1)
          out.push(String(el.className?.baseVal ?? el.className).split(' ')[0] + ' leaves the frame');
        if (el.tagName === 'BUTTON' || el.tagName === 'INPUT') {
          const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          if (top && !el.contains(top) && !top.contains(el))
            out.push('covered: « ' + (el.textContent.trim() || el.tagName).slice(0, 18) + ' »');
        }
        if (
          el.textContent.trim() &&
          !el.querySelector('*:not(.katex):not(.katex *)') &&
          parseFloat(getComputedStyle(el).fontSize) * zoom < FLOOR
        )
          out.push('text under 12 px: ' + String(el.className).split(' ')[0]);
      }
      for (const svg of frame.querySelectorAll(F.scene)) {
        const vb = svg.viewBox.baseVal;
        const sr = svg.getBoundingClientRect();
        if (!vb || !vb.width || !sr.width) continue;
        const k = Math.min(sr.width / vb.width, sr.height / vb.height);
        for (const el of svg.querySelectorAll('text')) {
          if (!el.getClientRects().length) continue;
          const t = el.textContent.trim();
          if (!t) out.push('an empty label drawn in the scene');
          else if (parseFloat(getComputedStyle(el).fontSize) * k < FLOOR)
            out.push(`scene text under 12 px: « ${t.slice(0, 20)} »`);
        }
      }
      const texts = [...frame.querySelectorAll('svg text')]
        .map((e) => ({ t: e.textContent.trim(), r: e.getBoundingClientRect() }))
        .filter((x) => x.t && x.r.width);
      // two labels overlap when their boxes meet; a world whose labels stand in tight stacked lines (`F.lines`: « 30 » over
      // « dalles » on a gate) counts it only when they share more than that fraction of the smaller line's height
      const over = (a, b) =>
        F.lines == null
          ? meet(a, b)
          : Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 &&
            Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > F.lines * Math.min(a.height, b.height);
      for (let i = 0; i < texts.length; i += 1)
        for (let j = i + 1; j < texts.length; j += 1)
          if (over(texts[i].r, texts[j].r)) out.push(`scene texts overlap: « ${texts[i].t} » / « ${texts[j].t} »`);
      if (box.bottom > window.innerHeight + 1 || box.right > window.innerWidth + 1)
        out.push('the frame leaves the screen');
      for (const el of frame.querySelectorAll('*'))
        if (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight + 2)
          out.push('scrolls: ' + el.className);
      return [...new Set(out)];
    },
    [FLOOR_PX, frameOf],
  );
  w.check(
    bad.length === 0,
    `${name}: the investigation fits its frame — nothing cut, covered, scrolled, overlapping or too small${bad.length ? ' — ' + bad.join(' | ') : ''}`,
  );
  await w.shot(page, name, { exit, numbers: true });
}

/** Nothing on an investigation screen names a rule it leads to (A1). */
export async function tellsNothing(w, page, where, re, frame = '.iq') {
  if (!re) return;
  const t = (await page.textContent(frame)) ?? '';
  const m = t.match(re);
  w.check(!m, `${where}: the investigation names nothing of a rule not forged yet${m ? ` — « ${m[0]} »` : ''}`);
}

/**
 * « La carte des connaissances » laid out (B5, B8): every card inside the map box, no card on another, no link's label under a card,
 * the page's subtitle WHOLE (never an ellipsis; half a line of overhang tolerated, C4).
 */
export async function mapLaidOut(w, page, where) {
  const bad = await page.evaluate(() => {
    const meet = (a, b) =>
      Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 &&
      Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
    const out = [];
    const map = document.querySelector('[data-di-kmap="full"]');
    if (!map) return ['no map on screen'];
    const box = map.getBoundingClientRect();
    const shown = (el) => el.getClientRects().length > 0;
    const nodes = [...map.querySelectorAll('[data-di-knode]')]
      .filter(shown)
      .map((el) => ({ id: el.dataset.diKnode, r: el.getBoundingClientRect() }));
    const labels = [...map.querySelectorAll('.di-kmap__edge')]
      .filter(shown)
      .map((el) => ({ t: el.textContent.trim(), r: el.getBoundingClientRect() }));
    for (const n of nodes)
      if (n.r.left < box.left - 1 || n.r.right > box.right + 1 || n.r.top < box.top - 1 || n.r.bottom > box.bottom + 1)
        out.push(`card ${n.id} cut by the map's edge`);
    for (let i = 0; i < nodes.length; i += 1)
      for (let j = i + 1; j < nodes.length; j += 1)
        if (meet(nodes[i].r, nodes[j].r)) out.push(`cards ${nodes[i].id} / ${nodes[j].id} overlap`);
    for (const l of labels) for (const n of nodes) if (meet(l.r, n.r)) out.push(`label « ${l.t} » under card ${n.id}`);
    // a label pill always says something (an empty one is a stray dash on its line)
    for (const l of labels) if (!l.t) out.push('an empty label pill on a link');
    // two link labels never touch: 4 px of the map between them at least (2026-11-23: « Les grands nombres » against
    // « Erreur fréquente », each at the middle of its link)
    const grow = (r, d) => ({ left: r.left - d, right: r.right + d, top: r.top - d, bottom: r.bottom + d });
    for (let i = 0; i < labels.length; i += 1)
      for (let j = i + 1; j < labels.length; j += 1)
        if (meet(grow(labels[i].r, 3), grow(labels[j].r, 3)))
          out.push(`labels « ${labels[i].t} » and « ${labels[j].t} » touch`);
    const sub = document.querySelector('.di-page__head p');
    if (sub && sub.getClientRects().length) {
      const r = sub.getBoundingClientRect();
      const holder = sub.parentElement.getBoundingClientRect();
      const line = parseFloat(getComputedStyle(sub).lineHeight) || r.height;
      if (sub.scrollWidth > sub.clientWidth + 1 || sub.scrollHeight > sub.clientHeight + line / 2)
        out.push('the subtitle overflows its box');
      if (r.right > holder.right + 1 || r.left < holder.left - 1 || r.bottom > holder.bottom + 1)
        out.push('the subtitle is clipped by its header');
      if (getComputedStyle(sub).textOverflow === 'ellipsis' && sub.scrollWidth > sub.clientWidth)
        out.push('the subtitle ends on an ellipsis');
    }
    return out;
  });
  w.check(
    bad.length === 0,
    `${where}: the map's cards inside it and apart, no label under a card nor against another, the subtitle whole${bad.length ? ' — ' + bad.join(' | ') : ''}`,
  );
}

/** The practice hub's mind map: no label, node name or icon printed over another (B8). */
export async function mapApart(w, page, where) {
  const hits = await page.evaluate(() => {
    const meet = (a, b) =>
      Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 &&
      Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
    const items = [...document.querySelectorAll('.di-map__edge, .di-map__root, .di-node strong, .di-node__icon')].map(
      (el) => ({
        t: el.textContent.trim() || el.className,
        r: el.getBoundingClientRect(),
      }),
    );
    const out = [];
    for (let i = 0; i < items.length; i += 1)
      for (let j = i + 1; j < items.length; j += 1)
        if (meet(items[i].r, items[j].r)) out.push(`« ${items[i].t} » / « ${items[j].t} »`);
    return out;
  });
  w.check(
    hits.length === 0,
    `${where}: no label of the mind map covers another${hits.length ? ' — ' + hits.join(' | ') : ''}`,
  );
}
