import { describe, it, expect } from 'vitest';
import { CLIMAX_TEXT as TALIS_1 } from '../talis-hisab-atwal/content/forbidden.js';

/**
 * Unité 9 « خاصية طالس » — ce que l'élève LIT de la mission, de la carte des معارف et des données du manuel (modèle : l'unité 2,
 * hisab-judhur/_unit/missionStrings.test.js ; rollout 2026-11-10). Une leçon CONVERTIE entre dans `CLIMAX` avec la signature de SA مسألة
 * (aksiya-talis, inshaat-talis puis talis-hisab-atwal le 2026-11-10 — les trois leçons de l'unité) :
 *   - aucun caractère de contrôle dans un point d'étape ni dans l'ouverture (« \times » dans une chaîne JS à apostrophes devient TAB + « imes ») ;
 *   - aucune ligne de la carte des معارف (knowledgeGraph.js) ne renvoie au manuel ;
 *   - les cartes de connaissance (knowledge.jsx) et la carte des معارف — ouvertes dès le début (`knowledgeMapOpen`) — ne montrent pas la
 *     solution de la مسألة de LEUR leçon (sa signature : ses nombres, ses rapports, ses produits) ;
 *   - les points d'étape d'une leçon convertie ne la montrent pas non plus ;
 *   - les textes du manuel que l'élève lit (knowledge.jsx, knowledgeGraph.js, content/textbook.js, content/exercises.js) ne disent ni
 *     « الكتاب », ni « تمرين N : », ni « خطأً مطبعيًا » (indépendance du manuel) — hors commentaires et métadonnées `src(...)`.
 */
const configs = import.meta.glob('../*/lesson.config.js', { eager: true });
const graphs = import.meta.glob('../*/knowledgeGraph.js', { eager: true });
const raw = import.meta.glob(['../*/knowledge.jsx', '../*/knowledgeGraph.js', '../*/content/textbook.js', '../*/content/exercises.js'], { eager: true, query: '?raw', import: 'default' });
const CONTROL = /[\t\n\r\f\v\b]/;

/** Le texte d'un fichier sans ses commentaires ni ses métadonnées de source. */
const strings = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')
  .replace(/\s\/\/ .*$/gm, '')
  .replace(/src\([^)]*\)/g, '');

/**
 * La signature de la مسألة de chaque leçon CONVERTIE : ce que ses cartes de connaissance et ses points d'étape ne montrent jamais.
 *   aksiya-talis (module 5, le tréteau des peintres) : les barres 80 / 100, les trous 24, 30, 36, 44, 45, 46, les produits 2400 / 3600 / 3680,
 *   les rapports 3/10, 9/20, 23/50 et leurs écritures décimales 0,3 / 0,45 / 0,46.
 *   inshaat-talis (module 4, la banderole du derby) : la banderole de 10 cm, AN = 40 et NB = 30, la banderole réelle de 35 m (20 m + 15 m),
 *   les prix 650 / 600 / 13000 / 9000 / 22000, les 3000 supporters, les rapports 4/3 et 3/4, la part 4/7, les longueurs 40/7, 30/7,
 *   10/7, 40/3 et l'écriture décimale 5,7. (3/7 — le leurre MB/AB de la مسألة — n'est PAS dans ce balayage de texte : la طريقة « قطعة طولها
 *   14/3 » écrit la proportion DONNÉE 3/7 = 2/AB, un autre rôle ; dans le labo, le balayage par rôle de content/forbidden.js l'interdit comme
 *   part du tout.)
 *   talis-hisab-atwal (module 5, le ciné-club) : ses nombres sont de PETITS nombres (3, 4, 5, 6, 8, 9, 10, 12) que les données du manuel de la
 *   leçon portent dans d'AUTRES rôles (AC = 4,5 du نشاط, BE = 12, AP = 10…) — sa signature de texte est donc PAR RÔLE (content/forbidden.js ›
 *   CLIMAX_TEXT) : 180, 54, 56, 4,8, 2,4, 5,6, 0,4, la fraction 2/5, et les couples « AB = 10 », « AC = 12 », « BC = 6 », « AB′ = 4 / 4,5 / 5 »,
 *   « AD = 15 », « DE = 9 ». Aucune liste d'exceptions, la مسألة n'est pas retouchée (conseil du 2026-11-10).
 */
const num = (list) => new RegExp(`(^|[^0-9,{}.])(${list.join('|')})(?![0-9]|\\{,\\})`);
const frac = (n, d) => new RegExp(`frac\\{${n}\\}\\{${d}\\}`);
const CLIMAX = {
  'aksiya-talis': [num(['80', '100', '24', '30', '36', '44', '45', '46', '2400', '3600', '3680']), frac(3, 10), frac(9, 20), frac(23, 50), /0\{?,\}?(3|45|46)(?![0-9])/],
  'inshaat-talis': [num(['10', '40', '30', '35', '20', '15', '650', '600', '13000', '9000', '22000', '3000']), frac(4, 3), frac(3, 4), frac(4, 7),
    frac(40, 7), frac(30, 7), frac(10, 7), frac(40, 3), /5\{?,\}?7(?![0-9])/],
  'talis-hisab-atwal': TALIS_1,
  // la synthèse (2026-11-10, pilote du recette « synthèse ») : des jetons DISTINCTIFS seulement — le défi 🏆 (module 8) et les réponses de la
  // وضعية de l'unité (module 7). Jamais 2 ou 4 nus (ils toucheraient r^2 ou 1→2→3→4) ; le balayage complet par rôle est
  // wadiya-idmajiya-talis/content/mission.test.js.
  'wadiya-idmajiya-talis': [num(['201{,}06', '804{,}25', '50{,}27', '91{,}125', '286{,}28']), /10\{?,\}?5(?![0-9])/, /64\s*\\pi/, /\\dfrac\{14\}\{2\}/,
    /12\s*-\s*h/, /18r\s*=\s*72/, /24r\s*=\s*108/, /7\{?,\}?25(?![0-9])/, /\\dfrac\{18\s*-\s*[hr]\}\{18\}/],
};
const BOOK = [/الكتاب(?!ة)/, /تمرين\s*\d+\s*:/, /خطأً? مطبعي/];
const lessonOf = (path) => path.split('/')[1];

describe('unit 9 — mission strings and knowledge maps', () => {
  it('found the lessons', () => {
    expect(Object.keys(configs).length).toBeGreaterThanOrEqual(4);
    expect(Object.keys(graphs).length).toBeGreaterThanOrEqual(4);
    // the raw scans really read each converted lesson's knowledge, map, textbook and exercise files
    // (la synthèse n'a pas de content/exercises.js : chaque leçon convertie a au moins ses cartes, sa carte des معارف et ses textes)
    Object.keys(CLIMAX).forEach((id) => {
      ['knowledge.jsx', 'knowledgeGraph.js', 'content/textbook.js'].forEach((f) => expect(Object.keys(raw).some((path) => path === `../${id}/${f}`), `${id}/${f}`).toBe(true));
    });
    expect(Object.values(raw).every((src) => typeof src === 'string' && src.length > 100)).toBe(true);
  });
  it('the signature regexes catch what they must (negative controls)', () => {
    const sigs = CLIMAX['aksiya-talis'];
    const hit = (s) => sigs.some((re) => re.test(s));
    ['$AM = 24$', 'AB = 80', '\\dfrac{9}{20}', '$0{,}45$', '2400', 'الثقب 45'].forEach((s) => expect(hit(s), s).toBe(true));
    ['$AB = 9$', '\\dfrac{1}{3}', '$2{,}45$', '$0{,}35$', '124', '4,5'].forEach((s) => expect(hit(s), s).toBe(false));
    const hit3 = (s) => CLIMAX['inshaat-talis'].some((re) => re.test(s));
    ['طولها 10 cm', '$\\dfrac{MA}{MB} = \\dfrac{4}{3}$', '\\dfrac{4}{7}', '$AN = 40$', '35 m', '$5{,}7$', '\\dfrac{40}{7}', '650'].forEach((s) => expect(hit3(s), s).toBe(true));
    ['$AB = 9$', '\\dfrac{14}{3}', '\\dfrac{2}{3}', '$2{,}4$', '\\sqrt{13}', '\\dfrac{3}{5}', '12 cm', '110', '5,75', '$a^2+b^2$'].forEach((s) => expect(hit3(s), s).toBe(false));
    // leçon 1 : des jetons PAR RÔLE — le couple « lettre = valeur » de la مسألة, jamais ses petits nombres nus
    // la synthèse : ses jetons distinctifs (défi 🏆 et réponses du module 7), jamais ses petits nombres
    const hitS = (s) => CLIMAX['wadiya-idmajiya-talis'].some((re) => re.test(s));
    ['$64\\pi$', '$10{,}5$ m', '$\\dfrac{14}{2}$', '$12 - h$', '$18r = 72$', '$24r = 108$', '$7{,}25$', '$\\dfrac{18 - h}{18}$', '201{,}06'].forEach((s) => expect(hitS(s), s).toBe(true));
    ['$r^2$', '$1\\to2\\to3\\to4$', '$12{,}5$', '$40r=336$', '$75\\pi$', '$\\dfrac{16-h}{16}$', '$6{,}5$'].forEach((s) => expect(hitS(s), s).toBe(false));
    const hit1 = (s) => CLIMAX['talis-hisab-atwal'].some((re) => re.test(s));
    ['$AB = 10$', 'AC = 12', "$AB' = 4$", "$AB' = 4{,}5$", '$4{,}8$', '$B\'C\' = 2{,}4$', '5,6', '\\dfrac{2}{5}', '$0{,}4$', '180 كرسيًّا', '54', '$AD = 15$', '$DE = 9$', '$BC = 6$'].forEach((s) => expect(hit1(s), s).toBe(true));
    ['$AC = 4{,}5$', '$BE = 12$', '$AP = 10$', '$AB = 6$', "$AB' = 3{,}2$", "$AB' = 1{,}6$", '$BC = 6{,}1$', '$2{,}45$', '12,54', '$DN = 2{,}5$', '\\dfrac{1}{3}', '$AB = 5$', '$OE = 1{,}5$', '2,24', '$0{,}45$', '154'].forEach((s) => expect(hit1(s), s).toBe(false));
  });
  it('no checkpoint string holds a control character (a lost backslash)', () => {
    Object.entries(configs).forEach(([path, m]) => {
      (m.LESSON_CONFIG?.mission?.checkpoints ?? []).forEach((cp) => {
        [cp.prompt, ...cp.options, cp.explain].forEach((s) => expect(CONTROL.test(String(s)), `${path} ${cp.id}: ${JSON.stringify(s)}`).toBe(false));
      });
      const o = m.LESSON_CONFIG?.mission?.opening?.text;
      if (o) expect(CONTROL.test(o), `${path} opening`).toBe(false);
    });
  });
  it('the checkpoints of a converted lesson never show its climax', () => {
    Object.entries(configs).forEach(([path, m]) => {
      const sigs = CLIMAX[m.LESSON_CONFIG?.id];
      if (!sigs) return;
      (m.LESSON_CONFIG.mission?.checkpoints ?? []).forEach((cp) => {
        const s = [cp.prompt, ...cp.options, cp.explain].join(' ');
        sigs.forEach((re) => expect(re.test(s), `${path} ${cp.id} ${re}`).toBe(false));
      });
    });
  });
  it('no knowledge-map line of a converted lesson sends the student to the textbook', () => {
    // la leçon pas encore convertie (1, le 2026-11-10) entre ici avec sa conversion
    Object.entries(graphs).filter(([path]) => CLIMAX[lessonOf(path)]).forEach(([path, m]) => {
      expect(JSON.stringify(m.KNOWLEDGE_GRAPH ?? {}).includes('الكتاب'), path).toBe(false);
    });
  });
  it('the knowledge cards and the knowledge map never show their own lesson\'s climax solution', () => {
    Object.entries(raw).filter(([path]) => /knowledge(Graph)?\.jsx?$/.test(path)).forEach(([path, src]) => {
      const sigs = CLIMAX[lessonOf(path)];
      if (!sigs) return;
      strings(src).split('\n').forEach((line, i) => sigs.forEach((re) => expect(re.test(line), `${path}:${i + 1} ${re} — ${line.trim().slice(0, 90)}`).toBe(false)));
    });
    // la carte des معارف cite aussi des phrases IMPORTÉES (content/textbook.js › LINES…) : on balaie donc aussi son contenu ÉVALUÉ
    Object.entries(graphs).forEach(([path, m]) => {
      const sigs = CLIMAX[lessonOf(path)];
      if (!sigs) return;
      (m.KNOWLEDGE_GRAPH?.nodes ?? []).forEach((node) => {
        const text = JSON.stringify(node).replace(/\\\\/g, '\\');
        sigs.forEach((re) => expect(re.test(text), `${path} node ${node.id} ${re}`).toBe(false));
      });
    });
  });
  it('the textbook data a student reads never names the book, an exercise number or a printing error', () => {
    Object.entries(raw).filter(([path]) => CLIMAX[lessonOf(path)]).forEach(([path, src]) => {
      strings(src).split('\n').forEach((line, i) => BOOK.forEach((re) => expect(re.test(line), `${path}:${i + 1} ${re} — ${line.trim().slice(0, 90)}`).toBe(false)));
    });
  });
});
