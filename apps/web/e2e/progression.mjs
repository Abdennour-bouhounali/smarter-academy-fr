/**
 * QA navigateur de « تقدّمي » (/espace/progression) — l'arbre الميدان →
 * الوحدة → الدرس → الكفاءات, la section « للعمل الآن », la recherche,
 * les filtres, les états vide / erreur / chargement, le mobile.
 *
 *   node apps/web/e2e/progression.mjs [dossier-captures]
 *
 * Prérequis : web (5173) et API (8000) lancés, l'élève QA du dépôt
 * (qa-eleve@smarter.dz). Une SEULE connexion par l'interface, puis
 * `storageState` partagé (le /auth/login est limité à 6/min).
 *
 * Aucune donnée n'est écrite en base : les scénarios « élève neuf »,
 * « profil riche » et « erreur » sont joués en interceptant les deux routes
 * de lecture (lesson-progress, learning-profile) ; l'activité locale est
 * semée dans localStorage (clé `u_<id>_smarter_lesson_<code>`).
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const EMAIL = process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const OUT = process.argv[2] || '/tmp/progression-shots';
mkdirSync(OUT, { recursive: true });

const results = [];
const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const pageErrors = [];
const consoleErrors = [];
function attach(page) {
  page.on('pageerror', (e) => pageErrors.push(e.message));
  // Le 500 est celui que le scénario « erreur » injecte lui-même.
  page.on('console', (m) => { if (m.type() === 'error' && !/status of (401|404|422|500)/.test(m.text())) consoleErrors.push(m.text()); });
}

const browser = await chromium.launch();
let authState = null;
let userId = null;
async function authedContext(options = {}) {
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ar-DZ', ...options, ...(authState ? { storageState: authState } : {}) });
  if (!authState) {
    const p = await c.newPage();
    await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await p.fill('input[type="email"]', EMAIL);
    await p.fill('input[type="password"]', PASSWORD);
    await p.click('button[type="submit"]');
    await p.waitForURL(/\/espace/, { timeout: 20000 });
    authState = await c.storageState();
    userId = await p.evaluate(() => {
      for (const k of Object.keys(localStorage)) { const m = k.match(/^u_(\d+)_/); if (m) return Number(m[1]); }
      return null;
    });
    if (userId == null) {
      // Aucune clé scoped encore : on lit l'utilisateur depuis /auth/me via l'app.
      const me = await p.evaluate(async () => {
        const t = localStorage.getItem('smarter_token') || Object.entries(localStorage).find(([k]) => /token/i.test(k))?.[1];
        const r = await fetch('http://localhost:8000/api/v1/auth/me', { headers: { Authorization: `Bearer ${JSON.parse(JSON.stringify(t))}`, Accept: 'application/json' } });
        return r.json().catch(() => ({}));
      });
      userId = me?.user?.id ?? me?.data?.user?.id ?? me?.id ?? null;
    }
    await p.close();
  }
  return c;
}

const NOW = Date.now();
const DAY = 86400000;
// Progression locale semée : une leçon terminée (il y a 3 jours), une en
// cours (hier) ; « qasim-mushtarak-akbar » vient du serveur (en cours).
const SEED = {
  'qawasim-adad-tabii': { completedModules: ['1', '2', '3', '4', '5', '6'], completedExercises: [], currentModule: 4, lastVisitedAt: NOW - 3 * DAY },
  'qasim-adad-tabii': { completedModules: ['1', '2'], completedExercises: [], currentModule: 3, lastVisitedAt: NOW - DAY },
};
function seedScript(uid, seed) {
  return `(() => { const u = ${JSON.stringify(uid)}; const seed = ${JSON.stringify(seed)}; for (const [id, v] of Object.entries(seed)) localStorage.setItem('u_' + u + '_smarter_lesson_' + id, JSON.stringify(v)); })();`;
}
function clearScript(uid) {
  return `(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('u_${uid}_smarter_lesson_') || k === 'u_${uid}_smarter_global_xp') localStorage.removeItem(k); })();`;
}

const RICH_PROFILE = {
  profile: {
    initialKnowledge: [],
    currentMastery: [{
      grade: '4am',
      lessons: [
        { lesson: 'qasim-adad-tabii', title: 'x', chapter: 'ansab_al_aadad_wal_hisab', learningPoints: [
          { code: '4am_qasim-adad-tabii_P1', title: 'نقطة متحكَّم فيها', status: 'mastered', confidence: 0.92, attempts: 5, correctCount: 5, lastEvidenceAt: null, diagnosticSkillId: null },
          { code: '4am_qasim-adad-tabii_P2', title: 'نقطة قيد التحسّن', status: 'reinforce', confidence: 0.55, attempts: 4, correctCount: 2, lastEvidenceAt: null, diagnosticSkillId: null },
          { code: '4am_qasim-adad-tabii_P3', title: 'نقطة تحتاج إلى تدعيم', status: 'gap', confidence: 0.15, attempts: 4, correctCount: 0, lastEvidenceAt: null, diagnosticSkillId: null },
        ] },
        { lesson: 'qawasim-adad-tabii', title: 'y', chapter: 'ansab_al_aadad_wal_hisab', learningPoints: [
          { code: '4am_qawasim-adad-tabii_P1', title: 'قواسم متحكَّم فيها', status: 'mastered', confidence: 0.88, attempts: 3, correctCount: 3, lastEvidenceAt: null, diagnosticSkillId: null },
          { code: '4am_qawasim-adad-tabii_P2', title: 'قواسم تحتاج إلى تدعيم', status: 'gap', confidence: 0.1, attempts: 3, correctCount: 0, lastEvidenceAt: null, diagnosticSkillId: null },
        ] },
      ],
    }],
  },
};

const isProfile = (u) => u.includes('/students/me/learning-profile');
const isProgress = (u) => u.includes('/students/me/lesson-progress');
const noOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
const gotoProgression = async (page) => {
  await page.goto(`${BASE}/espace/progression`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-progression-page]');
  await page.waitForFunction(() => document.querySelector('[data-progression-page]')?.getAttribute('aria-busy') !== 'true', null, { timeout: 15000 });
};

try {
  // ═══ 1. Élève NEUF : rien commencé, rien évalué ═══════════════════════
  {
    const ctx = await authedContext();
    await ctx.route((u) => isProgress(u.href), (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ progress: {} }) }));
    await ctx.route((u) => isProfile(u.href), (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ profile: { initialKnowledge: [], currentMastery: [] } }) }));
    await ctx.addInitScript(clearScript(userId));
    const page = await ctx.newPage(); attach(page);
    await gotoProgression(page);
    record('neuf : l’état vide s’affiche, sans statistiques ni « للعمل الآن »',
      (await page.locator('[data-progression-empty]').count()) === 1 && (await page.locator('[data-progression-stats]').count()) === 0 && (await page.locator('[data-progression-work-now]').count()) === 0);
    record('neuf : le CTA de l’état vide mène à /espace/cours', (await page.locator('[data-progression-empty] a').getAttribute('href')) === '/espace/cours');
    record('neuf : le programme reste visible — 4 ميادين, dont 1 construit', (await page.locator('[data-progression-field]').count()) === 4 && (await page.locator('[data-field-state="built"]').count()) === 1);
    const ctas = await page.locator('[data-progression-cta]').evaluateAll((els) => els.map((e) => e.dataset.progressionCta));
    record('neuf : chaque leçon propose « ابدأ » — aucune progression inventée', ctas.length > 0 && ctas.every((k) => k === 'start'), `${ctas.length} leçons`);
    record('neuf : aucune pastille « للعمل » — tout est « لم تُقيَّم بعد »', (await page.locator('[data-progression-lesson] li[aria-label*="تحتاج"]').count()) === 0);
    record('neuf : aucun raccourci vers le cahier', (await page.locator('[data-progression-page] a[href="/espace/cahier"]').count()) === 0);
    await page.screenshot({ path: `${OUT}/01-new-student.png`, fullPage: true });
    await ctx.close();
  }

  // ═══ 2. Élève ACTIF, profil RÉEL (serveur) ════════════════════════════
  {
    const ctx = await authedContext();
    await ctx.addInitScript(seedScript(userId, SEED));
    const page = await ctx.newPage(); attach(page);
    await gotoProgression(page);
    record('actif : en-tête, classe, statistiques, « للعمل الآن », programme',
      (await page.locator('[data-progression-grade]').count()) === 1 && (await page.locator('[data-progression-stats]').count()) === 1 && (await page.locator('[data-progression-work-now]').count()) === 1 && (await page.locator('[data-progression-curriculum]').count()) === 1);
    const statTexts = await page.locator('[data-progression-stats] p.font-space').allInnerTexts();
    record('actif : 1 leçon terminée, 2 en cours (dont celle du serveur)', statTexts[0] === '1' && statTexts[1] === '2', statTexts.join(' / '));
    record('actif : « maîtrisées / évaluées » vient du profil réel (0 / 1)', statTexts[2].replace(/\s/g, '') === '0/1', statTexts[2]);

    // Hiérarchie : le ميدان 1 s'ouvre de lui-même (dernier travail), son unité aussi.
    const field1 = page.locator('[data-progression-field="ansab_al_aadad_wal_hisab"]');
    record('actif : le ميدان du dernier travail est déplié', (await field1.locator('h3 button').getAttribute('aria-expanded')) === 'true');
    const unit = field1.locator('[data-progression-unit="aadad-tabiiya-natiqa"]');
    record('actif : sa وحدة est dépliée, avec ses 9 leçons construites', (await unit.locator('h4 button').getAttribute('aria-expanded')) === 'true' && (await unit.locator('[data-progression-lesson]').count()) === 9);
    record('actif : ordre officiel — la 1re leçon de l’unité vient d’abord', (await unit.locator('[data-progression-lesson]').first().getAttribute('data-progression-lesson')) === 'qasim-adad-tabii');

    // CTA contextuels et chemins existants.
    const ctaOf = async (id) => ({ kind: await page.locator(`[data-progression-lesson="${id}"] [data-progression-cta]`).getAttribute('data-progression-cta'), href: await page.locator(`[data-progression-lesson="${id}"] [data-progression-cta]`).getAttribute('href') });
    const cDone = await ctaOf('qawasim-adad-tabii'); const cProg = await ctaOf('qasim-adad-tabii'); const cGap = await ctaOf('qasim-mushtarak-akbar'); const cNew = await ctaOf('tayin-pgcd');
    record('actif : CTA « أعد المراجعة » pour la leçon terminée', cDone.kind === 'review' && cDone.href.startsWith('/courses/moyen/4am/'), cDone.href);
    record('actif : CTA « أواصل » vers le module suivant (registre)', cProg.kind === 'continue' && /^\/courses\/moyen\/4am\/.+\/qasim-adad-tabii\/.+/.test(cProg.href), cProg.href);
    record('actif : CTA « ابدأ » pour une leçon jamais ouverte', cNew.kind === 'start' && cNew.href.endsWith('/tayin-pgcd'), cNew.href);
    record('actif : la leçon avec lacune (en cours) propose « أواصل », la lacune reste visible', cGap.kind === 'continue' && (await page.locator('[data-progression-lesson="qasim-mushtarak-akbar"] li[aria-label^="تحتاج"]').count()) === 1);

    // « للعمل الآن » : la vraie lacune du profil (P1 de qasim-mushtarak-akbar).
    const items = page.locator('[data-work-now-item]');
    record('actif : « للعمل الآن » propose la lacune réelle, avec درس/وحدة/ميدان', (await items.count()) === 1 && (await items.first().getAttribute('data-state')) === 'gap' && (await items.first().locator('dd').count()) === 3);
    record('actif : son CTA mène à la leçon existante', (await items.first().locator('a').getAttribute('href')) === '/courses/moyen/4am/ansab_al_aadad_wal_hisab/qasim-mushtarak-akbar');

    // Dépli des points : réel = 1 lacune + 3 non évalués, jamais « à travailler ».
    const row = page.locator('[data-progression-lesson="qasim-mushtarak-akbar"]');
    await row.locator('[data-progression-points-toggle]').click();
    await page.waitForTimeout(400);
    const pills = await row.locator('#lp-qasim-mushtarak-akbar span.rounded-full.font-mono').allInnerTexts();
    record('actif : les points dépliés — 1 « تحتاج إلى تدعيم », 3 « لم تُقيَّم بعد »', pills.filter((p) => p.includes('تدعيم')).length === 1 && pills.filter((p) => p.includes('لم تُقيَّم')).length === 3, pills.join(' | '));
    record('actif : le bouton de dépli porte aria-expanded', (await row.locator('[data-progression-points-toggle]').getAttribute('aria-expanded')) === 'true');
    await page.screenshot({ path: `${OUT}/02-active-desktop.png`, fullPage: true });

    // Recherche : un point qui correspond garde son درس, sa وحدة et son ميدان.
    await page.fill('[data-progression-search]', 'الباقي المعدوم');
    await page.waitForTimeout(300);
    record('recherche : un point trouvé → 1 leçon, sous son unité et son ميدان',
      (await page.locator('[data-progression-lesson]').count()) === 1 && (await page.locator('[data-progression-lesson]').getAttribute('data-progression-lesson')) === 'qasim-adad-tabii'
      && (await page.locator('[data-progression-unit]').count()) === 1 && (await page.locator('[data-progression-field]').count()) === 1);
    record('recherche : le panneau des points s’ouvre seul, sur le point trouvé', (await page.locator('#lp-qasim-adad-tabii').count()) === 1 && (await page.locator('#lp-qasim-adad-tabii h4').count()) === 1);
    record('recherche : le compteur annonce « درس واحد من 9 »', /من\s*9/.test(await page.locator('[data-progression-results]').innerText()), await page.locator('[data-progression-results]').innerText());
    await page.fill('[data-progression-search]', 'الوحدة الطبيعية');
    await page.waitForTimeout(300);
    await page.fill('[data-progression-search]', 'الطبيعيّة');
    await page.waitForTimeout(300);
    record('recherche : un titre de وحدة garde toutes ses leçons', (await page.locator('[data-progression-lesson]').count()) === 9);
    await page.fill('[data-progression-search]', 'zzzz');
    await page.waitForTimeout(300);
    record('recherche : sans résultat, un message — pas un zéro', (await page.locator('[data-progression-no-match]').count()) === 1);
    await page.click('[data-progression-reset]');

    // Filtres.
    await page.click('[data-progression-filter="work"]');
    await page.waitForTimeout(300);
    record('filtre « للعمل » : seule la leçon avec lacune reste, sous sa وحدة/son ميدان',
      (await page.locator('[data-progression-lesson]').count()) === 1 && (await page.locator('[data-progression-lesson]').getAttribute('data-progression-lesson')) === 'qasim-mushtarak-akbar' && (await page.locator('[data-progression-field]').count()) === 1);
    record('filtre « للعمل » : le panneau ne montre que la lacune (pas les non évalués)', (await page.locator('#lp-qasim-mushtarak-akbar h4').count()) === 1);
    await page.click('[data-progression-filter="done"]');
    await page.waitForTimeout(300);
    record('filtre « مُنجزة » : la leçon terminée seulement', (await page.locator('[data-progression-lesson]').count()) === 1 && (await page.locator('[data-progression-lesson]').getAttribute('data-progression-lesson')) === 'qawasim-adad-tabii');
    await page.click('[data-progression-filter="inProgress"]');
    await page.waitForTimeout(300);
    record('filtre « قيد الإنجاز » : les 2 leçons en cours', (await page.locator('[data-progression-lesson]').count()) === 2);
    await page.click('[data-progression-filter="all"]');
    await page.selectOption('[data-progression-sort]', 'recent');
    await page.waitForTimeout(300);
    // La leçon du serveur (activité d'aujourd'hui, fondue dans le stockage
    // après le montage) passe devant celle semée « hier » : la page s'est
    // bien recalculée après la synchronisation.
    const order = await page.locator('[data-progression-lesson]').evaluateAll((els) => els.map((e) => e.dataset.progressionLesson));
    record('tri « آخر نشاط » : aujourd’hui (serveur), hier, il y a 3 jours, puis jamais', order.slice(0, 3).join(',') === 'qasim-mushtarak-akbar,qasim-adad-tabii,qawasim-adad-tabii', order.join(','));
    await page.selectOption('[data-progression-sort]', 'curriculum');

    // Filtres avancés : état « non évalué » seul.
    await page.click('[data-progression-advanced-toggle]');
    await page.click('[data-progression-advanced] button:has-text("لم تُقيَّم بعد")');
    await page.waitForTimeout(300);
    record('avancé « لم تُقيَّم بعد » : 9 leçons (toutes en ont), panneaux ouverts sur ces points', (await page.locator('[data-progression-lesson]').count()) === 9 && (await page.locator('[data-progression-lesson] [aria-expanded="true"]').count()) === 9);
    await page.click('[data-progression-reset]');

    // Clavier : Entrée sur le titre du ميدان le replie.
    await field1.locator('h3 button').focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    record('clavier : Entrée replie le ميدان (aria-expanded=false)', (await field1.locator('h3 button').getAttribute('aria-expanded')) === 'false');
    await ctx.close();
  }

  // ═══ 3. Profil RICHE (mocké) : les quatre états, l'ordre de « للعمل الآن » ═══
  {
    const ctx = await authedContext();
    await ctx.route((u) => isProfile(u.href), (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(RICH_PROFILE) }));
    await ctx.addInitScript(seedScript(userId, SEED));
    const page = await ctx.newPage(); attach(page);
    await gotoProgression(page);
    const statTexts = await page.locator('[data-progression-stats] p.font-space').allInnerTexts();
    record('riche : « 2 / 5 » = maîtrisées / évaluées (les non évalués hors dénominateur)', statTexts[2].replace(/\s/g, '') === '2/5', statTexts[2]);
    const states = await page.locator('[data-work-now-item]').evaluateAll((els) => els.map((e) => e.dataset.state));
    record('riche : « للعمل الآن » — les 🔴 d’abord, puis 🟡, jamais ⚪', JSON.stringify(states) === JSON.stringify(['gap', 'gap', 'reinforce']), states.join(','));
    const firstTitle = await page.locator('[data-work-now-item] h3').first().innerText();
    record('riche : à état égal, la leçon la plus récente d’abord', firstTitle === 'نقطة تحتاج إلى تدعيم', firstTitle);
    const chips = await page.locator('[data-progression-lesson="qasim-adad-tabii"] li[aria-label]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
    record('riche : les pastilles de la leçon disent 1/1/1/1 avec libellé accessible', chips.length === 4 && chips.every((c) => /: 1$/.test(c)), chips.join(' | '));
    const fieldChips = await page.locator('[data-progression-field="ansab_al_aadad_wal_hisab"] h3 li[aria-label]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
    record('riche : le ميدان additionne (2 maîtrisées, 1 en progrès, 2 lacunes)', fieldChips.some((c) => c.startsWith('متحكَّم') && c.endsWith(': 2')) && fieldChips.some((c) => c.startsWith('يحتاج') && c.endsWith(': 2')), fieldChips.join(' | '));
    await page.screenshot({ path: `${OUT}/03-rich-profile.png`, fullPage: false });
    await ctx.close();
  }

  // ═══ 4. ERREUR de chargement du profil : jamais un zéro ══════════════
  {
    const ctx = await authedContext();
    await ctx.route((u) => isProfile(u.href), (r) => r.fulfill({ status: 500, contentType: 'application/json', body: '{}' }));
    await ctx.addInitScript(seedScript(userId, SEED));
    const page = await ctx.newPage(); attach(page);
    await gotoProgression(page);
    await page.waitForSelector('[data-progression-error]', { timeout: 15000 });
    const statTexts = await page.locator('[data-progression-stats] p.font-space').allInnerTexts();
    record('erreur : bandeau + bouton réessayer, tuile des compétences à « — » et non « 0 »', (await page.locator('[data-progression-error] button').count()) === 1 && statTexts[2] === '—', statTexts[2]);
    record('erreur : « للعمل الآن » se tait (pas de faux « rien à faire »)', (await page.locator('[data-progression-work-now]').count()) === 0);
    record('erreur : la progression du parcours reste affichée', (await page.locator('[data-progression-lesson]').count()) === 9 && statTexts[0] === '1');
    record('erreur : aucune pastille de maîtrise inventée', (await page.locator('[data-progression-lesson] li[aria-label]').count()) === 0);
    await page.screenshot({ path: `${OUT}/04-error.png`, fullPage: false });
    await ctx.close();
  }

  // ═══ 5. MOBILE : pas de débordement horizontal ═══════════════════════
  {
    const ctx = await authedContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await ctx.route((u) => isProfile(u.href), (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(RICH_PROFILE) }));
    await ctx.addInitScript(seedScript(userId, SEED));
    const page = await ctx.newPage(); attach(page);
    await gotoProgression(page);
    record('mobile : aucun débordement horizontal (vue par défaut)', await noOverflow(page));
    await page.locator('[data-progression-lesson="qasim-adad-tabii"] [data-progression-points-toggle]').click();
    await page.waitForTimeout(400);
    record('mobile : aucun débordement, points dépliés', await noOverflow(page));
    await page.click('[data-progression-advanced-toggle]');
    await page.waitForTimeout(200);
    record('mobile : aucun débordement, filtres avancés ouverts', await noOverflow(page));
    const tooSmall = await page.locator('[data-progression-page] button, [data-progression-page] a[data-progression-cta], [data-work-now-item] a').evaluateAll((els) => els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.height < 36; }).map((e) => e.textContent.trim().slice(0, 30)));
    record('mobile : cibles tactiles ≥ 36px (44 pour les actions)', tooSmall.length === 0, tooSmall.join(' | '));
    await page.screenshot({ path: `${OUT}/05-mobile.png`, fullPage: true });
    await ctx.close();
  }

  record('aucune erreur de page', pageErrors.length === 0, pageErrors.join(' | ').slice(0, 300));
  record('aucune erreur console', consoleErrors.length === 0, consoleErrors.join(' | ').slice(0, 300));
} catch (e) {
  record('scénario interrompu', false, e.message);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} OK — captures dans ${OUT}`);
process.exit(failed.length ? 1 : 0);
