// « خريطة المعارف » and « تدرّب » of a lesson, as a STUDENT holding every key (lessons 5–6's trainer walks, made data):
// the map's cards laid out; a common mistake read as a card (the wrong sentence first, the rest uncovered by him); a key's
// memo sheet; then one card per plan of `world/trainer.js` (or the descriptor's `train`) trained — six questions each, so
// every kind of question is played through its screen. In each session: a wrong then a right answer (the hint) at
// questions 1 and 3, two wrong answers at question 5 (the written correction), the others right at the first try.
// Answers are computed by the descriptor: `gate[type](wave, n)` for a tap, `solve[kind](q)` for a form, `statement(text)`
// for « صحيح أم خطأ؟ » (without it the walk TRIES: true, then false after the hint) and its reason by `reasonTrue` here.
// EVIDENCE (A6): every exam-format first try the lesson owes (`trainer.evidenceOf`) is posted, and the kit's verifier
// (the server's rule) finds its claim TRUE exactly when the walk's own answer was right — a half-right answer is false.
import { createWalk } from '../walk.mjs';
import { mapLaidOut } from './checks.mjs';
import { gcd } from './experiments.mjs';

const plain = (text) =>
  String(text)
    .replace(/\$/g, '')
    .replace(/\\mathrm\{PGCD\}/g, 'PGCD')
    .replace(/\\times/g, '×')
    .replace(/\\left|\\right/g, '')
    .replace(/[⁦⁩]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
/** Is a reason TRUE? Every equality « x = y × z (+ r) », « x − y = z », every « d (لا) يقسم n », every PGCD it writes. */
export function reasonTrue(text) {
  const t = plain(text);
  for (const m of t.matchAll(/(\d+) = (\d+) × (\d+)(?: \+ (\d+))?/g))
    if (Number(m[1]) !== Number(m[2]) * Number(m[3]) + Number(m[4] ?? 0)) return false;
  for (const m of t.matchAll(/(\d+) [-−] (\d+) = (\d+)/g))
    if (Number(m[1]) - Number(m[2]) !== Number(m[3])) return false;
  for (const m of t.matchAll(/(\d+) (لا )?يقسم (\d+)/g))
    if ((Number(m[3]) % Number(m[1]) === 0) === Boolean(m[2])) return false;
  for (const m of t.matchAll(/PGCD\((\d+) ; (\d+)\) = (\d+)(?![\d(])/g))
    if (gcd(Number(m[1]), Number(m[2])) !== Number(m[3])) return false;
  return true;
}

export async function trainerWalk(L, D, opts) {
  const w = createWalk(`lesson-${L.id}-trainer`, opts);
  const { expect, check, shot } = w;
  const KEYS = L.lesson.keys;
  const nodes = L.lesson.knowledge.graph.nodes;
  const CARDS = nodes.map((n) => n.id);
  const OUT = { exit: ['[data-di-know-close]'], sound: true, numbers: true };
  /** A question draws its numbers at random: other lessons' numbers may come out (not checked there). */
  const DRAWN = { exit: ['[data-di-know-close]'], sound: true, numbers: false };
  const uid = (D.uid ?? 9900) + 60;
  // one card per plan of the lesson's trainer, first in the map's order (or the descriptor's list)
  const train =
    D.train ??
    (() => {
      const seen = new Set();
      return CARDS.filter((c) => {
        const p = L.planOf?.[c];
        if (!p || seen.has(p)) return false;
        seen.add(p);
        return true;
      });
    })();
  /** The kinds a session on card c asks (the lesson's own plan, drawn once: the kinds do not depend on the draw). */
  const kindsOf = (c) => [...new Set(L.lesson.trainer.makeSession(Math.random, c).map((q) => q.kind))];

  await w.run(async () => {
    const know = { found: CARDS, read: [], sealed: [], trained: {} };
    const practice = Object.fromEntries(KEYS.map((k) => [`${k}:1`, { stars: 2, best: 800 }]));
    const save = {
      v: 1,
      // the islands' road counts its segments; « قصر الساحات » its terraces (the save's last place)
      stage: L.lesson.story.segments ? L.lesson.story.segments.length : L.lesson.story.terraces.length - 1,
      stars: {},
      gems: [],
      keys: KEYS,
      keysEver: KEYS,
      falls: 0,
      flags: {},
      finished: true,
      practice,
      know,
    };
    const { page } = await w.student({
      uid,
      lessonId: L.id,
      url: L.url,
      grade: L.grade,
      seed: { [`u_${uid}_smarter_world_${L.id}`]: save },
    });
    await page.waitForSelector('[data-di-start]', { timeout: 30000 });
    await page.click('[data-di-know-open]');
    await page.waitForSelector('[data-di-kmap="full"]');
    await page.waitForTimeout(700);
    expect(
      (await page.locator('[data-di-knode]').count()) === CARDS.length &&
        (await page.locator('[data-di-knode][data-open="true"]').count()) === CARDS.length,
      `« خريطة المعارف »: the ${CARDS.length} cards of the lesson, all open with every key`,
    );
    await mapLaidOut(w, page, 'the knowledge map');
    await shot(page, 'know-full', OUT);

    // ══ a common mistake, read as a card; a key's memo sheet ══
    const kstate = () => page.evaluate(() => window.__world.getState().know);
    const mistake = nodes.find((n) => n.kind === 'common_mistake');
    if (mistake) {
      const P = `[data-di-kpanel="${mistake.id}"]`;
      await page.click(`[data-di-knode="${mistake.id}"]`);
      await page.waitForSelector(P);
      await page.waitForTimeout(250);
      expect(
        (await page.locator(`${P} .di-parts .is-wrong`).count()) >= 1 &&
          (await page.locator(`${P} [data-di-uncover]`).count()) === 1 &&
          (await page.locator(`${P} .di-parts .is-why, ${P} .di-parts .is-right`).count()) === 0 &&
          !(await kstate()).read.includes(mistake.id),
        `the mistake « ${mistake.title} » shows the WRONG sentence first; the reason and the right one wait until he asks`,
      );
      await shot(page, 'know-card-mistake', OUT);
      await page.click(`${P} [data-di-uncover]`);
      await page.waitForSelector(`${P} .di-parts .is-right`);
      expect(
        (await page.getAttribute(`[data-di-knode="${mistake.id}"]`, 'data-read')) === 'true' &&
          (await kstate()).read.includes(mistake.id),
        'uncovered, the card is READ: ticked on the map, saved',
      );
      await shot(page, 'know-card-mistake-read', OUT);
    }
    for (const n of nodes) {
      await page.click(`[data-di-knode="${n.id}"]`);
      await page.waitForTimeout(150);
      if (!(await page.locator(`[data-di-kpanel="${n.id}"] [data-di-tab="memo"]`).count())) continue;
      const K = `[data-di-kpanel="${n.id}"]`;
      await page.click(`${K} [data-di-tab="memo"]`);
      await page.waitForSelector(`${K} .di-memo`);
      const raw = await page
        .locator(`${K} .di-memo dd`)
        .evaluateAll((els) => els.filter((e) => !e.querySelector('.katex')).map((e) => e.textContent));
      check(
        !raw.some((t) => /\$|\\[a-zA-Z]{2,}/.test(t)),
        `the memo sheet of « ${n.title} »: no raw formula in its sentences`,
      );
      await shot(page, 'know-card-memo', OUT);
      if (D.quiz) console.log('NOTE  descriptor.quiz is not played yet by the library (README « Not covered »)');
      await page.click(`${K} [data-di-tab="card"]`);
      break;
    }

    // ══ « تدرّب » ══
    const tr = () =>
      page.evaluate(() => ({
        q: window.__trainer?.q,
        index: window.__trainer?.index,
        dom: document.querySelector('[data-di-trainer]')?.dataset.diTrainer,
        fb: document.querySelector('[data-di-tr-fb]')?.dataset.diTrFb ?? null,
        fbText: document.querySelector('[data-di-tr-fb]')?.textContent ?? '',
      }));
    const gate = (x, n) => {
      const judge = D.gate?.[x.type];
      expect(judge, `the descriptor judges the waves « ${x.type} » (gate.${x.type})`);
      return Boolean(judge(x, n));
    };
    /** The right answer of a question, from its numbers (null for « صحيح أم خطأ؟ » without `statement`: tried). */
    const solve = (q) => {
      if (q.kind === 'tap') {
        const ok = q.options.filter((n) => gate(q.wave, n));
        expect(
          ok.length === 1,
          `tap « ${q.wave.type} » (${q.options.join(', ')}): exactly one gate is right — computed here`,
        );
        return ok[0];
      }
      if (q.kind === 'tf') {
        // a lesson whose reasons are not the islands' equalities judges them itself (`descriptor.reasonTrue`)
        const truthOf = D.reasonTrue ?? reasonTrue;
        const good = q.reasons ? q.reasons.map((r, i) => (truthOf(r.t) ? i : -1)).filter((i) => i >= 0) : [null];
        if (q.reasons)
          check(
            good.length === 1,
            `tf « ${plain(q.statement).slice(0, 50)} »: exactly one reason states only true facts (${good.join()})`,
          );
        return { truth: D.statement ? Boolean(D.statement(plain(q.statement))) : null, reason: good[0] };
      }
      const f = D.solve?.[q.kind];
      expect(f, `the descriptor solves the questions « ${q.kind} » (solve.${q.kind})`);
      return f(q);
    };
    const wrongOf = (q, v) => {
      if (D.wrong?.[q.kind]) return D.wrong[q.kind](q, v);
      if (q.kind === 'tap') return q.options.find((n) => n !== v);
      if (q.kind === 'tf') return { truth: !v.truth, reason: v.reason };
      const last = Object.keys(v).at(-1);
      return { ...v, [last]: typeof v[last] === 'number' ? v[last] + 1 : { other: v[last] } };
    };
    const reply = async (q, v) => {
      if (await page.locator('[data-di-pgate-go]').count()) {
        await page.click('[data-di-pgate-go]');
        await page.waitForTimeout(300);
      }
      if (q.kind === 'tap') return page.click(`[data-di-tr-opt="${v}"]`);
      if (q.kind === 'tf') {
        await page.click(`[data-di-tr-tf="${v.truth}"]`);
        if (q.reasons) {
          await page.click(`[data-di-tr-reason="${v.reason}"]`);
          await page.click('[data-di-tr-check]');
        }
        return;
      }
      for (const [k, x] of Object.entries(v)) {
        const sel = `[data-di-tr="${k}"]`;
        if ((await page.evaluate((s) => document.querySelector(s)?.tagName, sel)) === 'SELECT') {
          const opt = await page.evaluate(
            ([s, want]) => {
              const opts = [...document.querySelector(s).options].map((o) => o.value).filter(Boolean);
              return typeof want === 'object'
                ? opts.find((o) => o !== want.other && !o.endsWith(want.other))
                : opts.find((o) => o === want || o.endsWith(want));
            },
            [sel, x],
          );
          await page.selectOption(sel, opt ?? String(x));
        } else await page.fill(sel, String(x));
      }
      await page.click('[data-di-tr-check]');
    };
    const settle = async (index) => {
      await page.waitForTimeout(200);
      for (let k = 0; k < 20; k += 1) {
        const t = await tr();
        if (t.fb || t.index !== index || t.dom === 'done') return t;
        await page.waitForTimeout(150);
      }
      return tr();
    };
    const knode = async (id) => {
      const nd = page.locator(`[data-di-knode="${id}"]`);
      if (!(await nd.isVisible())) await page.click('[data-di-tab="card"]');
      await nd.click();
    };

    const allPosts = [];
    for (const [ci, card] of train.entries()) {
      await knode(card);
      await page.waitForTimeout(200);
      await page.click('[data-di-know-train]');
      await page.waitForSelector('[data-di-trainer]');
      if (ci === 0) await mapLaidOut(w, page, `the knowledge map beside « تدرّب » (${card})`);
      const want = kindsOf(card);
      const kinds = new Set();
      const formats = [];
      const seen = new Set();
      const sent0 = (await page.evaluate(() => window.__posts ?? [])).length;
      const owed = [];
      for (let i = 0; i < 6; i += 1) {
        const t = await tr();
        const { q } = t;
        expect(t.index === i, `${card} · question ${i + 1}: « ${q.kind} » (${q.format})`);
        kinds.add(q.kind);
        formats.push(q.format);
        if (q.format === 'exam' && q.kind !== 'tf' && q.kind !== 'tap') {
          if (await page.locator('[data-di-pgate-go]').count()) {
            await page.click('[data-di-pgate-go]');
            await page.waitForTimeout(1200);
          }
          const wraps = await page.evaluate(
            () =>
              [...document.querySelectorAll('.di-sheet__line')].filter((l) => {
                const kids = [...l.children].map((k) => k.getBoundingClientRect()).filter((r) => r.height);
                return kids.some((r) => r.top > kids[0].top + kids[0].height * 0.8);
              }).length,
          );
          check(
            wraps === 0,
            `${card} · question ${i + 1} (${q.kind}): every line of the answer sheet stays on one line (${wraps} wrapped)`,
          );
        }
        if (!seen.has(`${q.kind}:${q.format}`)) {
          seen.add(`${q.kind}:${q.format}`);
          await shot(page, `${card}-q${i + 1}-${q.kind}-${q.format}`, DRAWN);
        }
        const v = solve(q);
        const tried = q.kind === 'tf' && v.truth === null;
        const plan = tried ? 'try' : i === 4 ? 'wrong-wrong' : i === 0 || i === 2 ? 'wrong-right' : 'right';
        const first = plan === 'right' ? v : plan === 'try' ? { ...v, truth: true } : wrongOf(q, v);
        if (q.format === 'exam') {
          const e = L.lesson.trainer.evidenceOf?.(q, first, { firstTry: true, helped: false });
          if (e) owed.push({ q, right: plan === 'right' });
        }
        if (plan === 'try') {
          await reply(q, first);
          let r = await settle(i);
          if (r.index === i && r.fb && r.fb !== 'ok') {
            await shot(page, `${card}-q${i + 1}-tried`, DRAWN);
            await reply(q, { ...v, truth: false });
            r = await settle(i);
          }
          check(
            r.fb === 'ok' || r.index !== i,
            `${card} · question ${i + 1} (tf): true or false, one of the two is accepted`,
          );
        } else if (plan === 'right') {
          await reply(q, v);
          const r = await settle(i);
          expect(
            r.fb === 'ok',
            `${card} · question ${i + 1} (${q.kind}): the right answer computed here is accepted at once`,
          );
        } else {
          await reply(q, first);
          let r = await settle(i);
          expect(
            r.fb === 'hint',
            `${card} · question ${i + 1} (${q.kind}): a wrong answer gets a HINT first, never « wrong » (« ${r.fbText.trim().slice(0, 70)} »)`,
          );
          check(!/خطأ|خاطئ/.test(r.fbText), `${card} · question ${i + 1}: the hint never says « wrong »`);
          if (i < 3) await shot(page, `${card}-q${i + 1}-hint`, DRAWN);
          if (plan === 'wrong-right') {
            await reply(q, v);
            r = await settle(i);
            expect(r.fb === 'ok', `${card} · question ${i + 1} (${q.kind}): …then the right answer is accepted`);
          } else {
            await reply(q, q.kind === 'tap' ? (q.options.find((n) => n !== v && n !== first) ?? first) : first);
            r = await settle(i);
            check(
              r.fb === 'fix',
              `${card} · question ${i + 1} (${q.kind}): a second wrong answer gets the written correction (${r.fb})`,
            );
            await shot(page, `${card}-q${i + 1}-fix`, DRAWN);
          }
        }
        if (await page.locator('[data-di-tr-next]').count()) await page.click('[data-di-tr-next]');
        await page.waitForTimeout(200);
      }
      check(
        formats.join(',') === 'game,game,exam,game,exam,exam',
        `${card}: the formats alternate and end on the exam (${formats.join(', ')})`,
      );
      check(
        want.every((k) => kinds.has(k)),
        `${card}: the session asked every kind of its plan (${want.join(', ')})`,
      );
      await page.waitForSelector('[data-di-trainer="done"]', { timeout: 8000 }).catch(() => {});
      await shot(page, `${card}-done`, DRAWN);
      const posts = (await page.evaluate(() => window.__posts ?? [])).slice(sent0).map((p) => p.body);
      check(
        posts.length === owed.length,
        `${card}: ${owed.length} first tries in the exam format are owed as evidence (sent ${posts.length})`,
      );
      for (const [k, p] of posts.entries()) {
        const x = owed[k];
        if (!x) break;
        const truth = L.verifyClaim(p.claim);
        check(
          p.context === 'trainer' &&
            typeof p.attemptId === 'string' &&
            String(p.learningPoint).startsWith(`${L.grade}_${L.id}_`) &&
            truth === x.right,
          `${card}: evidence ${k + 1} (${x.q.kind}) — its claim is ${truth ? 'TRUE' : 'FALSE'} as his first answer was ${x.right ? 'right' : 'wrong'} (${JSON.stringify(p.claim).slice(0, 80)})`,
        );
      }
      allPosts.push(...posts);
      if (await page.locator('[data-di-tab="card"]').count()) await page.click('[data-di-tab="card"]');
      await page.waitForTimeout(200);
    }
    check(
      new Set(allPosts.map((p) => p.attemptId)).size === allPosts.length,
      `every evidence has its own attempt id (${allPosts.length})`,
    );
    await page.click('[data-di-know-close]');
    await page.waitForSelector('[data-di-start]');
    expect(
      (await page.evaluate(() => window.__world.getState().phase)) === 'title',
      '« خريطة المعارف » closes back to the title screen',
    );
  });
  return w;
}
