import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { cumulativeKnowledge, knowledgeModuleNumbers } from './knowledgeState';

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, '../../../..');
const read = (p) => readFileSync(resolve(webRoot, p), 'utf8');

// Toutes les unités de TOUS les ميادين (unité 1 : 9 leçons ; unité 2 « الحساب على الجذور » : 6, 2026-09-30 ;
// unité 3 « الحساب الحرفي » : 4, 2026-10-01 ; unité 4 « معادلات ومتراجحات » : 5, 2026-10-01 ;
// unité 5 « جمل معادلتين » : 4, 2026-10-01 ; unité 6 « الدالة الخطية والتناسبية » : 6, 2026-10-02,
// sous le ميدان d'affichage « ميدان التناسبية والدوال »).
const GRADE = 'src/lessons/moyen/4am';
const UNITS = readdirSync(resolve(webRoot, GRADE)).flatMap((chapter) =>
  readdirSync(resolve(webRoot, GRADE, chapter)).map((u) => `${GRADE}/${chapter}/${u}`));

/** Les modules d'évaluation de toutes les unités : ceux qui passent un `synthese`. */
function evaluationModules() {
  const out = [];
  for (const UNIT of UNITS) {
    const unitDir = resolve(webRoot, UNIT);
    for (const lesson of readdirSync(unitDir)) {
      const modulesDir = join(unitDir, lesson, 'modules');
      if (!existsSync(modulesDir)) continue;
      for (const file of readdirSync(modulesDir)) {
        const rel = `${UNIT}/${lesson}/modules/${file}`;
        if (read(rel).includes('synthese=')) out.push([lesson, rel]);
      }
    }
  }
  return out;
}

/**
 * LA HOUSSE FINALE (« الحوصلة ») DOIT MONTRER LA CARTE DE LA LEÇON.
 *
 * `CompleteView({ items })` reçoit ses items en PROP et ne lit jamais le
 * contexte. Les neuf modules d'évaluation rendaient `<CompleteView />` sans
 * items : `buildStructure([])` ne produisait aucune strate, et la dernière
 * chose que voyait l'élève après le test final était un écran vide avec un
 * bouton d'impression.
 *
 * Le correctif ne touche pas `CompleteView` : il emploie le composant qui
 * existait déjà pour ça — `KnowledgeSnapshot complete`, qui appelle
 * `unlockAll()` puis passe les vrais items à `CompleteView`.
 */
describe('synthèse finale — الحوصلة', () => {
  const modules = evaluationModules();

  // unité 1 : 6 depuis le 2026-11-18 — les leçons 1–3 sont v2, leurs pages de module (et leur « إختبار أولي ») sont supprimées ;
  // 5 depuis le 2026-11-19 — la leçon 4 (qasim-mushtarak-akbar) aussi ; 4 le même jour — la leçon 5 (tayin-pgcd) ; 3 le même jour — la leçon 6 (bahth-pgcd) ; 2 le 2026-11-20 — la leçon 7 (awwaliyan-fima-baynahuma) ; 1 le même jour — la leçon 8 (ikhtizal-kasr) : reste la synthèse
  // unit 1: 0 since 2026-11-20 — its last lesson (« أدمج تعلّماتي », the mission island) is v2 too: no evaluation page left
  // unit 2: 5 since 2026-11-21 — its lesson 1 (jidhr-tarbii) is v2, its « إختبار أولي » deleted; 4 the same day — lesson 2 (natiqa-ghayr-natiqa)
  it('les unités ont bien 0 + 4 + 4 + 5 + 4 + 6 + 6 + 5 + 4 + 5 + 5 + 5 + 5 + 5 modules d’évaluation', () => {
    expect(modules.length).toBe(63);
  });

  it.each(modules)('%s : la synthèse lit la carte, elle n’est pas vide', (_lesson, rel) => {
    const src = read(rel);
    // Le motif défectueux : un CompleteView sans items.
    expect(src).not.toMatch(/synthese=\{<CompleteView\s*\/>\}/);
    // Le motif correct : le composant qui débloque la leçon et fournit les items.
    expect(src).toMatch(/synthese=\{<KnowledgeSnapshot\s+complete[^}]*\/>\}/);
  });

  it.each(modules)('%s : importe KnowledgeSnapshot et plus CompleteView', (_lesson, rel) => {
    const src = read(rel);
    expect(src).toMatch(/import \{[^}]*KnowledgeSnapshot[^}]*\} from '[^']*common\/knowledge'/);
    expect(src).not.toMatch(/\bCompleteView\b/);
  });

  it('KnowledgeSnapshot complete débloque la leçon entière et passe les items', () => {
    const snap = read('src/lessons/common/knowledge/KnowledgeSnapshot.jsx');
    expect(snap).toMatch(/if \(complete\) unlockAll\(\)/);
    expect(snap).toMatch(/<CompleteView items=\{items\}/);
  });

  it('une carte entièrement débloquée rend tous les items de la leçon', () => {
    // Le comportement que la synthèse doit produire, vérifié sur la structure
    // réelle d'une carte : deux modules, trois connaissances.
    const knowledge = {
      modules: {
        1: [{ id: 'qasim-baqi', type: 'concepts', title: 'A', summary: 'a' }],
        2: [
          { id: 'qasim-jidaa', type: 'concepts', title: 'B', summary: 'b' },
          { id: 'siyagh', type: 'vocabulaire', title: 'C', summary: 'c' },
        ],
      },
    };
    const all = knowledgeModuleNumbers(knowledge); // ce que fait unlockAll()
    const items = cumulativeKnowledge(knowledge, all, [], []);
    expect(items.map((i) => i.id)).toEqual(['qasim-baqi', 'qasim-jidaa', 'siyagh']);
  });

  it('sans déblocage, la carte est vide — le défaut d’origine', () => {
    const knowledge = { modules: { 1: [{ id: 'x', type: 'concepts', title: 'X', summary: 'x' }] } };
    expect(cumulativeKnowledge(knowledge, [], [], [])).toEqual([]);
  });

  it('une leçon sans carte reste un état vide légitime, pas une erreur', () => {
    // KnowledgeSnapshot rend « map.emptyMapLong » plutôt qu'une strate vide.
    expect(cumulativeKnowledge({ modules: {} }, [1, 2], [], [])).toEqual([]);
    expect(read('src/lessons/common/knowledge/KnowledgeSnapshot.jsx'))
      .toMatch(/items\.length === 0 \?[\s\S]{0,120}map\.emptyMapLong/);
  });
});
