// « فضاء الامتحان » — walk of the exam LADDER and of the SITTINGS of the pilot lesson `qasim-adad-tabii` as a STUDENT
// (simulated session, no API). The ladder (five levels, the next one lit); a sitting of level 4 on a sheet the walk CHOOSES
// from the bank on disk (DEV hook `localStorage['di.dev.sheet']`), filled to FAIL for sure (wrong steps until the mark is
// under 80 %, at least two, and one step left blank); the copy handed back — the mark by the bank's points, « أرشدني »
// never giving the answer, « اشرح لي » the bank's real correction, the notebook; the retry screen; a similar sheet answered
// right → the promotion with its stars; level 5 read then quit; « تقدّمي »'s readiness computed HERE from the two copies.
// Then lib/sittingWalk.mjs › copies (blank / wrong / quit / right) and everySheet (the 50 sheets of the bank, each checked
// against the disk). The answer key and the points are always the disk's, never the page's.
// The copy goes to the practice engine (POST /practice/sessions…), recorded by lib/walk.mjs in window.__api.
// About 5–6 min at one size (the 50-sheet loop ~3 min).
// Run (dev server up): [E2E_SIZE=1366x768] [E2E_PARTS=pilot,copies,sheets] node apps/web/e2e/gameworld-sitting.mjs [outDir]
import { createWalk, lessonUrl, PHONE, QAWASIM_WORDS, QAWASIM_NUMBERS } from './lib/walk.mjs';
import { rightOf, wrongOf, fillStep, ON, bankOnDisk, bankWrites } from './lib/bankSheet.mjs';
import {
  NB,
  SHEET_OUT,
  PASS,
  starsFor,
  readinessFor,
  appreciationFor,
  stepsOf,
  markOf,
  totalOf,
  checkPaper,
  checkFields,
  checkGuide,
  checkExplain,
  toLadder,
  openSitting,
  firstSheet,
  guideTestable,
  copies,
  everySheet,
} from './lib/sittingWalk.mjs';

const ID = 'qasim-adad-tabii';
const GRADE = '4am';
const URL = lessonUrl('ansab_al_aadad_wal_hisab', ID);
const KEYS = ['qasim-baqi', 'qasim-jidaa', 'siyagh-mutakafia', 'wahid-wa-nafsuh'];
const BANK = bankOnDisk(GRADE, ID);
// the pilot's own words are not foreign here (`pilot: true`); the later lessons' are — allowed on a sheet screen only
// where the pilot's bank writes them itself
const ALLOW = bankWrites(BANK, { words: QAWASIM_WORDS, numbers: QAWASIM_NUMBERS });
const w = createWalk('gameworld-sitting', { pilot: true, foreign: QAWASIM_WORDS, foreignNumbers: QAWASIM_NUMBERS });
const { expect, shot } = w;
const PARTS = (process.env.E2E_PARTS || 'pilot,copies,sheets').split(',');
if (PARTS.length < 3) console.log(`NOTE: only the part(s) ${PARTS.join(', ')} of gameworld-sitting — NOT a full run`);
const fmt = (n) => String(n).replace('.', ',');
const practicePosts = (page) =>
  page.evaluate(() => (window.__api ?? []).filter((x) => x.method === 'POST' && x.url.includes('/practice/')));
const bodyOf = (p) => (typeof p?.body === 'string' ? JSON.parse(p.body) : p?.body);
const px = (page, sel) =>
  page.evaluate((s) => {
    const el = document.querySelector(s);
    const z = Number(document.querySelector('.xs-fit').style.zoom || 1);
    return el ? Math.round(parseFloat(getComputedStyle(el).fontSize) * z) : 0;
  }, sel);

async function pilot() {
  const practice = Object.fromEntries(KEYS.map((k) => [`${k}:1`, { stars: 2, best: 900 }]));
  const one = (mark, total) => ({ stars: 3, mark, total });
  const save = { v: 1, stage: 8, stars: {}, gems: [], keys: KEYS, keysEver: KEYS, falls: 0, flags: {}, finished: true, practice, exam: { best: { 1: one(3, 3), 2: one(6, 6), 3: one(7, 7) }, fails: {}, weak: {}, sittings: 3 } };
  const { page, ctx } = await w.student({ uid: 9401, lessonId: ID, url: URL, seed: { [`u_9401_smarter_world_${ID}`]: save } });
  await page.waitForSelector('[data-di-map]', { timeout: 30000 });

  // ── 0. the two spaces: the game first, the exam behind its switch; a ladder of five levels ──
  await page.click('[data-di-map]');
  await page.waitForSelector('[data-di-space="exam"]');
  expect((await page.locator('[data-di-node]').count()) >= 5 && (await page.locator('[data-di-ladder]').count()) === 0, 'the practice hub opens on « فضاء اللعب »');
  await page.click('[data-di-map-close]');
  await page.waitForSelector('[data-di-map]');
  await toLadder(page);
  expect((await page.locator('[data-di-exam-level]').count()) === 5 && (await page.locator('.di-rungs li.is-passed').count()) === 3 && (await page.locator('.di-rungs li.is-next [data-di-exam-level="4"]').count()) === 1 && (await page.locator('[data-di-exam-level="5"]').isDisabled()), '« فضاء الامتحان »: five levels, three passed, level 4 lit, level 5 locked');
  await shot(page, 'ladder', { exit: ['[data-di-map-close]'], numbers: true });

  // ── 1. reading time: a sheet of level 4 the walk chose on disk (one with a number step and hints), beside another ──
  const S = firstSheet(BANK, 4, guideTestable);
  const subject = await openSitting(page, 4, S.id);
  expect(subject.level === 4 && subject.exercises.length === 2 && subject.exercises.some((e) => e.bankId === S.id) && subject.exercises.every((e) => BANK.has(e.bankId)), `the subject is two exam sheets of the bank's level 4, ${S.id} among them (${subject.exercises.map((e) => e.bankId).join(', ')})`);
  const qs = stepsOf(subject, BANK);
  expect(qs.every((q) => q.sheet && JSON.stringify(q.bank) === JSON.stringify(subject.exercises.flatMap((e) => e.questions).find((x) => x.id === q.id).bank)), 'the sheets served are the bank\'s files as they are on disk');
  expect((await page.locator('.xs-ex').count()) === 2 && (await page.locator('.xs-root input, .xs-root textarea, [data-xs-field]').count()) === 0, 'reading time: the two sheets are on the paper, and no answer box exists yet');
  for (const e of subject.exercises) await checkPaper(w, page, '.xs-paper', BANK.get(e.bankId), `read ${e.bankId}`);
  expect(await page.evaluate(() => window.__world.getState().paper === true && window.__world.audio.musicWanted === false), 'the sitting is silent: the music is off');
  await page.locator('.xs-word').nth(3).click();
  expect((await page.locator('.xs-word.is-marked').count()) === 1, 'a tap underlines a word of the subject in pencil');
  console.log('    text on screen (px): statement', await px(page, '.xs-statement'), '· question', await px(page, '.xs-ex ol'), '· title', await px(page, '.xs-head h2'));
  // a phone held sideways has ONE scale, its root font at 13 px (GAME_WORLD.md « On a phone », rule 1)
  expect((await px(page, '.xs-ex ol')) >= (PHONE ? 14 : 17), 'the subject is comfortable to read');
  await shot(page, 'read', { ...SHEET_OUT, allow: ALLOW });
  await page.click('[data-xs-start]');
  await page.waitForSelector('[data-xs="sit"]');

  // ── 2. a copy planned to FAIL: the chosen number step wrong, more wrong steps until the mark is under 80 % (two at
  //       least), the last typed step of the OTHER sheet left blank ──
  const typedOf = (e) => qs.filter((q) => q.exercise.id === e.id && !q.paper);
  const eS = subject.exercises.find((e) => e.bankId === S.id);
  const eO = subject.exercises.find((e) => e !== eS);
  const total = totalOf(qs);
  const plan = Object.fromEntries(qs.filter((q) => !q.paper).map((q) => [q.id, rightOf(q)]));
  const blankQ = typedOf(eO).at(-1);
  delete plan[blankQ.id];
  const wrongQ = typedOf(eS).find((q) => q.answerType === 'rational' && (q.bank.hints ?? []).length) ?? typedOf(eS)[0];
  const wrongs = [wrongQ];
  plan[wrongQ.id] = wrongOf(wrongQ);
  for (const q of qs.filter((x) => !x.paper && x !== wrongQ && x !== blankQ)) {
    if (wrongs.length >= 2 && markOf(qs, plan) < total * PASS) break;
    plan[q.id] = wrongOf(q);
    wrongs.push(q);
  }
  const want = markOf(qs, plan);
  expect(wrongs.length >= 2 && want < total * PASS, `the copy will fail for sure: ${wrongs.length} wrong steps and a blank → ${fmt(want)} / ${fmt(total)} < 80 %`);
  const order = [subject.exercises.indexOf(eS), subject.exercises.indexOf(eO)];
  {
    const i = order[0];
    await page.click(`[data-xs-page="${i}"]`);
    expect((await page.locator(`${ON} .xs-paper .xs-ex`).count()) === 1 && (await page.locator(`${ON} .xs-sheet li`).count()) === eS.questions.length, `${eS.title}: its statement and its answer boxes are side by side`);
    await checkFields(w, page, qs.filter((q) => q.exercise.id === eS.id), eS.bankId);
    for (const q of typedOf(eS)) await fillStep(page, q, plan[q.id]);
    await page.locator(`${ON} .xs-flag`).first().click();
    await shot(page, 'sit', { ...SHEET_OUT, allow: ALLOW });
    // a forgotten exercise: he hands in after this sheet only — the answer sheet turns to the empty one, once
    await page.click('[data-xs-hand]');
    expect((await page.getAttribute('[data-xs-forgot]', 'data-xs-forgot')) === String(order[1]) && (await page.locator('[data-xs-hand-yes]').count()) === 0, 'handing in with an untouched sheet is not accepted at once: it is named');
    expect((await page.locator(`[data-xs-page="${order[1]}"].is-on`).count()) === 1 && (await page.textContent(`${ON} .xs-sheet h3`)).includes(eO.title), 'the answer sheet has turned to the forgotten sheet');
    expect((await page.locator('.xs-pen, .xs-total, .xs-red, [data-xs-mark]').count()) === 0, 'the reminder is not a verdict');
    await shot(page, 'forgot', { ...SHEET_OUT, allow: ALLOW });
    await page.click('[data-xs-forgot-go]');
    expect((await page.locator('[data-xs-forgot]').count()) === 0 && (await page.locator('[data-xs-hand]').count()) === 1, '« أواصل » gives the sheet back');
    await page.click('[data-xs-hand]');
    expect((await page.locator('[data-xs-hand-yes]').count()) === 1 && (await page.locator('[data-xs-forgot]').count()) === 0, 'the second hand-in is accepted, even with a sheet still empty: it is now his choice');
    await page.click('[data-xs-hand-no]');
  }
  await page.click(`[data-xs-page="${order[1]}"]`);
  await checkFields(w, page, qs.filter((q) => q.exercise.id === eO.id), eO.bankId);
  for (const q of typedOf(eO)) await fillStep(page, q, plan[q.id]);
  await page.click(`[data-xs-page="${order[0]}"]`);
  expect(await page.evaluate((on) => [...document.querySelectorAll(`${on} [data-xs-field] input, ${on} [data-xs-field] textarea`)].some((el) => el.value !== '') || document.querySelectorAll(`${on} [data-xs-field] [aria-pressed="true"], ${on} [data-xs-field] [aria-checked="true"]`).length > 0, ON), 'turning the pages back: what he typed on the first sheet is still there');
  expect((await page.locator('.xs-pen, .xs-total, .xs-red, [data-xs-mark]').count()) === 0 && !(await page.textContent('.xs-root')).includes('✓'), 'during the sitting there is NO verdict of any kind: no tick, no mark, no red');
  expect((await page.locator('[data-xs-pace]').count()) === 1, 'a quiet pace line shows where the student should be');
  expect((await practicePosts(page)).length === 0 && (await page.evaluate(() => window.__posts ?? [])).length === 0, 'nothing is sent before the paper is handed in');
  await page.click('[data-xs-hand]');
  await page.waitForSelector('[data-xs-hand-yes]');
  await shot(page, 'confirm', { ...SHEET_OUT, allow: ALLOW });
  await page.click('[data-xs-hand-yes]');
  await page.waitForSelector('[data-xs="back"]');
  await page.waitForTimeout(500);

  // ── 3. the copy handed back ──
  const got = Number(await page.getAttribute('[data-xs-total]', 'data-xs-total'));
  expect(got === want, `the mark follows the bank's key and points on disk: ${fmt(want)} / ${fmt(total)} (shown ${fmt(got)})`);
  expect((await page.textContent('[data-xs-appreciation]')).trim() === appreciationFor(want, total), `the copy reads « ${appreciationFor(want, total)} »`);
  expect((await Promise.all(wrongs.map((q) => page.getAttribute(`[data-xs-row="${q.id}"]`, 'data-xs-mark')))).every((m) => m === 'ko') && (await page.getAttribute(`[data-xs-row="${blankQ.id}"]`, 'data-xs-mark')) === 'ko' && (await page.textContent(`[data-xs-row="${blankQ.id}"]`)).includes('لم تُجب'), 'each question carries its red mark: a cross on each wrong step, and « لم تُجب » for the blank');
  {
    const posts = await practicePosts(page);
    const answered = qs.filter((q) => plan[q.id]);
    const answers = posts.filter((p) => /\/answers$/.test(p.url.split('?')[0])).map(bodyOf);
    expect((await page.evaluate(() => window.__posts ?? [])).length === 0, 'the sitting sends no game claim: the bank\'s answers go to the practice engine');
    expect(posts.filter((p) => /\/practice\/sessions$/.test(p.url.split('?')[0])).length === 1 && answers.length === answered.length, `الكفاءات: one practice session, one answer per step he answered (${answered.length}) — never the blank; the server judges them again`);
    expect(wrongs.every((q) => answers.some((b) => JSON.stringify(b?.answer) === JSON.stringify(plan[q.id]) && b?.outcome !== 'correct')), 'each wrong answer is sent as the student wrote it, never as right');
  }
  await shot(page, 'back', { exit: ['[data-xs-close]'], allow: ALLOW });
  await page.click(`[data-xs-row="${wrongQ.id}"]`);
  await page.waitForSelector(`[data-xs-detail="${wrongQ.id}"]`);
  expect((await page.locator('.xs-scheme input').count()) >= 2 && (await page.locator('[data-xs-help]').count()) === 0, 'a lost point opens the scheme to tick against the paper — and no answer yet');
  await page.click('[data-xs-guide]');
  await checkGuide(w, page, wrongQ, `${wrongQ.qid}`);
  await shot(page, 'guide', { exit: ['[data-xs-close]'], allow: ALLOW });
  await page.click('[data-xs-explain]');
  await checkExplain(w, page, wrongQ, `${wrongQ.qid}`);
  await page.locator('.xs-scheme input').first().check();
  await shot(page, 'explain', { exit: ['[data-xs-close]'], allow: ALLOW });
  const rightQ = qs.find((q) => !q.paper && plan[q.id] && JSON.stringify(plan[q.id]) === JSON.stringify(rightOf(q)));
  expect(Boolean(rightQ), 'a step of the copy was answered right');
  await page.click(`[data-xs-row="${rightQ.id}"]`);
  expect((await page.locator('[data-xs-help="explain"]').count()) === 1 && (await page.locator('[data-xs-guide]').count()) === 0, 'a full-mark question shows its model copy directly');
  await checkExplain(w, page, rightQ, `${rightQ.qid} (right)`);
  await page.locator('[data-xs-notebook-open]').first().click();
  await page.waitForSelector('[data-xs-notebook]');
  {
    const keys = new Set([...wrongs, blankQ].map((q) => q.key).filter(Boolean));
    expect(keys.size > 0 && (await page.locator('[data-xs-notebook] li').count()) === keys.size, `the notebook lists what to write by hand: one line per rule that lost points (${keys.size}: ${[...keys].join(', ') || 'NO step mapped to a key'})`);
  }
  await shot(page, 'notebook', { exit: ['[data-xs-close]', '[data-xs-finish]'], allow: ALLOW });
  await page.click('[data-xs-finish]');
  expect((await page.locator('.xs-root').count()) === 0 && (await page.evaluate(() => window.__world.getState().paper === false)), 'the sitting closes; the music may come back');

  // ── 4. between two levels: the GAME comes back. Under 80 %: an encouragement and another sheet of the level ──
  await page.waitForSelector('[data-di-promotion="retry"]', { timeout: 5000 });
  const st = await page.evaluate(() => window.__world.getState().exam);
  const missed = subject.exercises.filter((e) => qs.some((q) => q.exercise.id === e.id && !q.paper && !(plan[q.id] && JSON.stringify(plan[q.id]) === JSON.stringify(rightOf(q))))).map((e) => e.bankId);
  expect(st.fails[4] === 1 && !st.best[4] && missed.every((id) => st.weak[4].includes(`ex:${id}`)), `a failed sheet: the level stays, and the sheets where points were lost are remembered (${missed.join(', ')})`);
  expect((await page.locator('[data-di-promo-similar]').count()) === 1 && (await page.locator('[data-di-promo-next]').count()) === 0 && (await page.locator('.di-confetti').count()) === 0 && (await page.textContent('.di-promo__mark b')).trim() === `${fmt(want)}${NB}${fmt(total)}`, `no celebration, no next level: « ورقة مشابهة », the mark ${fmt(want)} / ${fmt(total)}`);
  await shot(page, 'retry', { exit: ['[data-di-promo-ladder]', '[data-di-promo-similar]'] });
  await page.evaluate(() => {
    window.__sitting = null;
    localStorage.removeItem('di.dev.sheet');
  });
  await page.click('[data-di-promo-similar]');
  await page.waitForSelector('[data-xs="read"]');
  await page.waitForFunction(() => window.__sitting?.subject);
  const second = await page.evaluate(() => window.__sitting.subject);
  expect(second.level === 4 && second.exercises.every((e) => !missed.includes(e.bankId)), `the new sheet is of the same level, and leaves out the sheets he missed (${second.exercises.map((e) => e.bankId).join(', ')})`);
  const qs2 = stepsOf(second, BANK);
  const total2 = totalOf(qs2);
  await page.click('[data-xs-start]');
  await page.waitForSelector('[data-xs="sit"]');
  for (const [i, e] of second.exercises.entries()) {
    await page.click(`[data-xs-page="${i}"]`);
    for (const q of qs2.filter((x) => x.exercise.id === e.id)) await fillStep(page, q, rightOf(q));
  }
  await page.click('[data-xs-hand]');
  await page.click('[data-xs-hand-yes]');
  await page.waitForSelector('[data-xs="back"]');
  expect(Number(await page.getAttribute('[data-xs-total]', 'data-xs-total')) === total2, `a full paper: ${fmt(total2)} / ${fmt(total2)} (the points of its sheets on disk)`);
  await page.click('[data-xs-close]');
  await page.waitForSelector('[data-di-promotion="promoted"]');
  {
    const ex = await page.evaluate(() => window.__world.getState().exam);
    const stars = starsFor(total2, total2);
    expect(ex.best[4].stars === stars && ex.best[4].mark === total2 && ex.fails[4] === 0 && ex.weak[4].length === 0, `the level is passed with ${stars} stars (a full paper); its weak list is cleared`);
    expect((await page.locator('.di-confetti i').count()) > 10 && (await page.locator('[data-di-promotion] .di-stars3 .is-on').count()) === stars && (await page.locator('[data-di-promo-next]').count()) === 1, `the promotion is a moment of GAME: confetti, ${stars} stars lit, the next level offered`);
  }
  await shot(page, 'promotion', { exit: ['[data-di-promo-ladder]'] });
  await page.click('[data-di-promo-ladder]');
  await page.waitForSelector('[data-di-ladder="open"]');
  expect((await page.locator('.di-rungs li.is-next [data-di-exam-level="5"]').count()) === 1 && !(await page.locator('[data-di-exam-level="5"]').isDisabled()), 'back on the ladder: level 5 is open and lit');
  await shot(page, 'ladder-after', { exit: ['[data-di-map-close]'], numbers: true });
  const S5 = firstSheet(BANK, 5);
  const five = await openSitting(page, 5, S5.id);
  const total5 = totalOf(stepsOf(five, BANK));
  expect(five.level === 5 && five.exercises.length === 1 && five.exercises[0].bankId === S5.id && five.exercises[0].title === 'الوضعيّة الإدماجيّة' && total5 > 0, `level 5 is the integrative situation of the bank: one sheet (${S5.id}), ${fmt(total5)} points on disk`);
  await checkPaper(w, page, '.xs-paper', S5, 'level 5 read');
  await shot(page, 'level5-read', { ...SHEET_OUT, allow: ALLOW });

  // ── 4bis. « خروج »: one confirmation, then back to the ladder — nothing marked, nothing sent, nothing counted ──
  {
    const before = await page.evaluate(() => ({ exam: JSON.stringify(window.__world.getState().exam), api: (window.__api ?? []).filter((x) => x.method === 'POST').length }));
    await page.click('[data-xs-quit]');
    await page.waitForSelector('[data-xs-quit-box]');
    expect((await page.textContent('[data-xs-quit-box]')).includes('تخرج من الامتحان؟') && (await page.locator('[data-xs="read"]').count()) === 1, '« خروج » asks first: the sitting is still there behind the question');
    await shot(page, 'quit', { exit: ['[data-xs-quit-no]', '[data-xs-quit-yes]'], allow: ALLOW });
    await page.click('[data-xs-quit-no]');
    expect((await page.locator('[data-xs-quit-box]').count()) === 0 && (await page.locator('[data-xs="read"]').count()) === 1, '« أواصل » closes the question and keeps the sitting');
    await page.click('[data-xs-start]');
    await page.waitForSelector('[data-xs="sit"]');
    const q5 = stepsOf(five, BANK).find((x) => !x.paper);
    await fillStep(page, q5, rightOf(q5));
    await page.click('[data-xs-quit]');
    await page.click('[data-xs-quit-yes]');
    await page.waitForSelector('[data-di-ladder="open"]');
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => ({ exam: JSON.stringify(window.__world.getState().exam), api: (window.__api ?? []).filter((x) => x.method === 'POST').length, paper: window.__world.getState().paper, type: window.__world.getState().overlay?.type }));
    expect((await page.locator('[data-xs]').count()) === 0 && after.type === 'map', '« نعم، أخرج » during the sitting leads back to the ladder');
    expect(after.exam === before.exam && after.api === before.api && after.paper !== true, 'leaving counts for nothing: the ladder has not moved, nothing was sent, the paper mode is off');
    expect(!(await page.locator('[data-di-exam-level="5"]').isDisabled()), 'the same level is still open, for a new sheet');
  }

  // ── 5. « تقدّمي »: the road, the readiness computed HERE from the two copies, the ONE next thing ──
  const countedOf = (steps, p) => steps.filter((q) => !q.paper && q.key && q.counted && p[q.id]);
  const c1 = countedOf(qs, plan);
  const ok1 = c1.filter((q) => JSON.stringify(plan[q.id]) === JSON.stringify(rightOf(q))).length;
  const c2 = countedOf(qs2, Object.fromEntries(qs2.filter((q) => !q.paper).map((q) => [q.id, rightOf(q)])));
  const n = c1.length + c2.length;
  const ok = ok1 + c2.length;
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-di-progress-open]');
  await page.click('[data-di-progress-open]');
  await page.waitForSelector('[data-di-progress]');
  {
    expect((await page.locator('[data-di-road-step]').count()) === 5 && (await page.locator('[data-di-prow]').count()) === 4, '« تقدّمي »: the five stations of the road and the four الكفاءات');
    const ready = Number(await page.getAttribute('[data-di-ready]', 'data-di-ready'));
    const tally = await page.evaluate(() => window.__world.getState().tally ?? {});
    const tn = Object.values(tally).reduce((t, x) => t + x.n, 0);
    const tok = Object.values(tally).reduce((t, x) => t + x.ok, 0);
    expect(n > 0 && tn === n && tok === ok, `the tally — saved across a reload — counts the steps answered as in an exam: ${tok} right of ${tn} (computed ${ok} of ${n}; the blank and the quit count nothing)`);
    expect(ready === readinessFor(4, ok, n), `the readiness: ½ × 4/5 + ½ × ${ok}/${n} = ${readinessFor(4, ok, n)}% (shown ${ready}%)`);
    expect((await page.getAttribute('[data-di-next-step]', 'data-di-next-step')) === 'exam', 'the next thing: sit level 5');
    await shot(page, 'progress', { exit: ['[data-di-progress-close]'], numbers: true });
    await page.click('[data-di-next-step]');
    await page.waitForSelector('[data-xs="read"]');
    expect((await page.evaluate(() => window.__sitting.subject.level)) === 5, 'one tap on it opens that sitting');
  }
  await ctx.close();
}

await w.run(async () => {
  const ctx = { id: ID, grade: GRADE, url: URL, keys: KEYS, bank: BANK, allow: ALLOW };
  if (PARTS.includes('pilot')) await pilot();
  if (PARTS.includes('copies')) await copies(w, { ...ctx, uid: 9402 });
  if (PARTS.includes('sheets')) await everySheet(w, { ...ctx, uid: 9403 });
});
