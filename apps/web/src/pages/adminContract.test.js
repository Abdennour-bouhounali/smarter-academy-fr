import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

/**
 * LE CONTRAT DU PANNEAU D'ADMINISTRATION — vérifié sur la SOURCE, comme
 * `teacherContract.test.js` et `checkoutContract.test.js`.
 *
 * Il tient l'acquis de l'alignement : le panneau est le MÊME produit que
 * l'espace élève, dans la même langue et le même système visuel. Sans ce
 * test, le prochain écran d'administration repartirait d'un `AdminPage`
 * français à fond sombre — c'est exactement ainsi que la divergence était
 * née.
 *
 * Quatre engagements :
 *
 *   1. ARABE   — aucun libellé français n'atteint un écran d'administration ;
 *   2. SYSTÈME — pas de thème sombre ni de palette parallèle ;
 *   3. RTL     — propriétés logiques, jamais gauche/droite en dur ;
 *   4. LANGUE  — la navigation est faite de CLÉS, pas de texte.
 */
const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '..');

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(jsx?|mjs)$/.test(name) && !/\.test\./.test(name)) out.push(full);
  }
  return out;
}

/** Le code SANS ses commentaires : la maison commente en français, et c'est voulu. */
function codeOf(file) {
  return readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

const ADMIN_DIRS = ['pages/admin', 'components/admin'];
const adminFiles = ADMIN_DIRS.flatMap((rel) => walk(resolve(src, rel)));

describe('le panneau d’administration est arabe', () => {
  /**
   * Les libellés que le panneau rendait en français. On ne teste pas
   * « tout mot français » (les commentaires en sont pleins, à dessein) mais
   * les CHAÎNES qui atteignaient l'écran.
   */
  const FRENCH_UI = [
    /'Chargement/, /'Réessayer/, /'Annuler'/, /'Confirmer'/, /'Précédent'/, /'Suivant'/,
    /'Enregistrer'/, /'Rechercher/, /'Fermer'/, /'Supprimer'/, /'Modifier'/, /'Créer'/,
    /'Aucun résultat'/, /'Aucune? /, /'Tous'/, /'Toutes/, /'En cours…'/,
    /Tableau de bord/, /Élèves —/, /Enseignants —/, /Administration'/,
  ];

  for (const file of adminFiles) {
    const rel = file.slice(src.length + 1);
    // `StatusBadge` garde son vocabulaire français comme FILET pour un
    // statut hors catalogue : il n'atteint l'écran que si le serveur invente
    // un état, auquel cas dire « Publié » vaut mieux que « status.xyz ».
    if (rel.endsWith('ui/StatusBadge.jsx')) continue;

    it(`${rel} ne rend aucun libellé français`, () => {
      const code = codeOf(file);
      for (const pattern of FRENCH_UI) {
        expect(code, `${rel} rend ${pattern}`).not.toMatch(pattern);
      }
    });
  }

  it('le catalogue arabe du panneau existe et est monté', () => {
    const i18n = readFileSync(resolve(src, 'i18n/index.js'), 'utf8');
    // À la demande depuis 2026-11-17 : il arrive avec le cadre du panneau, pas avec l'application.
    expect(i18n).toMatch(/admin: \(\) => import\('\.\/locales\/ar\/admin\.json'\)/);

    const catalogue = JSON.parse(readFileSync(resolve(src, 'i18n/locales/ar/admin.json'), 'utf8'));
    // Les sections que tout écran consomme.
    for (const key of ['common', 'nav', 'status', 'dashboard']) {
      expect(catalogue, `admin.json a la section ${key}`).toHaveProperty(key);
    }
    // Un échantillon : les clés doivent porter de l'ARABE, pas du français
    // recopié. On teste la présence d'au moins une lettre arabe.
    expect(catalogue.common.loading).toMatch(/[؀-ۿ]/);
    expect(catalogue.status.published).toMatch(/[؀-ۿ]/);
  });

  it('toute clé citée par un écran existe dans le catalogue', () => {
    // Une clé absente ne casse rien : i18next rend la clé elle-même, et
    // « plans.tierOverlap » s'affiche à l'écran. C'est le défaut le plus
    // silencieux de cette architecture, donc celui qu'on teste.
    const catalogue = JSON.parse(readFileSync(resolve(src, 'i18n/locales/ar/admin.json'), 'utf8'));
    const has = (key) => {
      const parts = key.split('.');
      const leaf = parts.pop();
      const node = parts.reduce((n, part) => (n ?? {})[part], catalogue);
      if (!node || typeof node !== 'object') return false;
      // Un nom PLURIEL n'existe pas nu : i18next le range sous ses six
      // suffixes arabes (_zero, _one, _two, _few, _many, _other).
      return typeof node[leaf] === 'string'
        || ['zero', 'one', 'two', 'few', 'many', 'other'].some((f) => typeof node[`${leaf}_${f}`] === 'string');
    };

    for (const file of adminFiles) {
      const rel = file.slice(src.length + 1);
      const code = codeOf(file);
      if (!code.includes("useTranslation('admin')")) continue;
      for (const match of code.matchAll(/\bt\(\s*'([a-z][\w]*(?:\.[\w]+)+)'/g)) {
        const key = match[1];
        // On ne juge que les clés d'une section connue : `t(someVar)` et les
        // chemins qui n'en sont pas (params d'URL, etc.) ne sont pas des clés.
        if (!Object.prototype.hasOwnProperty.call(catalogue, key.split('.')[0])) continue;
        expect(has(key), `${rel} cite admin.${key}, absente du catalogue`).toBe(true);
      }
    }
  });

  it('un nom compté porte les six formes du pluriel arabe', () => {
    // ARABIC_RTL_CONTRACT §5 : l'arabe en a six, et un `_other` seul produit
    // « 2 درساً » là où il faut le duel.
    const catalogue = JSON.parse(readFileSync(resolve(src, 'i18n/locales/ar/admin.json'), 'utf8'));
    const FORMS = ['zero', 'one', 'two', 'few', 'many', 'other'];

    const check = (node, path) => {
      const bases = new Set();
      for (const key of Object.keys(node)) {
        if (typeof node[key] === 'object') { check(node[key], `${path}.${key}`); continue; }
        const m = key.match(/^(.*)_(zero|one|two|few|many|other)$/);
        if (m) bases.add(m[1]);
      }
      for (const base of bases) {
        for (const form of FORMS) {
          expect(typeof node[`${base}_${form}`], `${path}.${base} n’a pas la forme _${form}`).toBe('string');
        }
      }
    };
    check(catalogue, 'admin');
  });

  it('la navigation du panneau est faite de CLÉS, jamais de texte', () => {
    const nav = readFileSync(resolve(src, 'data/adminNavigation.js'), 'utf8');
    expect(nav).toMatch(/labelKey:/);
    // Plus aucun `label:` porteur de texte — sinon une entrée échapperait au
    // catalogue et resterait française.
    expect(codeOf(resolve(src, 'data/adminNavigation.js'))).not.toMatch(/\blabel:\s*['"]/);
  });
});

describe('le panneau partage le système visuel de l’espace élève', () => {
  it('la coquille n’est plus un thème sombre', () => {
    const layout = readFileSync(resolve(src, 'components/layout/AdminLayout.jsx'), 'utf8');
    const sidebar = codeOf(resolve(src, 'components/admin/AdminSidebar.jsx'));

    // Le fond du produit, le même que StudentLayout/TeacherLayout.
    expect(layout).toMatch(/bg-\[#FAFAFA\]/);
    // Aucune livrée sombre dans la barre : c'était `bg-slate-900`.
    expect(sidebar).not.toMatch(/bg-slate-9\d\d/);
    expect(sidebar).not.toMatch(/text-slate-300/);
    // Elle porte au contraire la barre blanche de l'espace élève.
    expect(sidebar).toMatch(/bg-white border-e border-slate-200/);
  });

  it('le panneau réutilise le cadre de page et les tuiles du produit', () => {
    const chrome = readFileSync(resolve(src, 'pages/admin/adminUi.jsx'), 'utf8');
    // La gouttière partagée, pas une largeur à soi.
    expect(chrome).toMatch(/sa-page/);

    // L'accueil monte `StatTile`, le composant de « تقدّمي » — et non une
    // copie locale.
    const dashboard = readFileSync(resolve(src, 'pages/admin/Dashboard.jsx'), 'utf8');
    expect(dashboard).toMatch(/from '\.\.\/\.\.\/components\/common\/StatTile'/);
  });

  it('aucun écran ne redéfinit une police : la typographie vient des jetons', () => {
    for (const file of adminFiles) {
      const code = codeOf(file);
      expect(code, `${file.slice(src.length + 1)} redéclare une police`).not.toMatch(/font-family:/);
      // Cairo ne se pose pas à la main : il est DERRIÈRE chaque pile dans
      // tailwind.config.js, et c'est la seule source (master spec §14).
      expect(code, `${file.slice(src.length + 1)} pose Cairo à la main`).not.toMatch(/['"]Cairo['"]/);
    }
  });
});

describe('le panneau est RTL par construction', () => {
  /**
   * Les propriétés PHYSIQUES qui cassent le miroir. On vise les utilitaires
   * Tailwind de marge, de rembourrage, de position et d'alignement — pas
   * `left`/`right` dans un mot quelconque.
   *
   * `inset-x-*`, `top-*`, `bottom-*` et `-translate-y-*` sont neutres : ils
   * ne distinguent pas début et fin.
   */
  const PHYSICAL = [
    /\b(?:sm:|md:|lg:|xl:)?[mp][lr]-\d/,
    /\b(?:sm:|md:|lg:|xl:)?(?:left|right)-\d/,
    /\btext-(?:left|right)\b/,
    /\bborder-[lr]\b/,
    /\brounded-[lr]-/,
  ];

  for (const file of adminFiles) {
    const rel = file.slice(src.length + 1);
    it(`${rel} n’utilise que des propriétés logiques`, () => {
      const code = codeOf(file);
      for (const pattern of PHYSICAL) {
        expect(code, `${rel} utilise ${pattern} au lieu de son équivalent logique (ms/me, ps/pe, start/end, text-start/end)`)
          .not.toMatch(pattern);
      }
    });
  }

  it('les FLÈCHES écrites dans une phrase arabe suivent le sens de lecture', () => {
    // `→` tapé dans une chaîne n'est pas une icône : il ne passe pas par
    // DirectionalIcons, et pointe donc à l'envers dans une phrase arabe. Une
    // flèche qui veut dire « devient » ou « puis » s'écrit `←`.
    // Les flèches MATHÉMATIQUES sont hors sujet : elles vivent dans
    // l'isolement LTR de MathText, jamais dans une chaîne d'interface.
    for (const file of adminFiles) {
      const rel = file.slice(src.length + 1);
      const code = codeOf(file);
      // On ne regarde que les lignes qui contiennent aussi de l'arabe : une
      // flèche dans du code ou une phrase latine ne concerne pas cette règle.
      for (const line of code.split('\n')) {
        if (!/[\u0600-\u06FF]/.test(line)) continue;
        expect(line, `${rel} écrit → dans une phrase arabe (utiliser ←)`).not.toMatch(/→/);
      }
    }
  });

  it('les icônes directionnelles passent par le résolveur, jamais en dur', () => {
    // Un chevron de navigation (« précédent »/« suivant ») doit venir de
    // DirectionalIcons : importé directement de lucide, il pointerait dans le
    // mauvais sens en RTL. Les chevrons VERTICAUX (tri d'une colonne) et les
    // icônes sémantiques (loupe, corbeille) n'y passent pas — ils ne se
    // retournent jamais.
    for (const rel of ['components/admin/ui/FilterBar.jsx', 'components/admin/AdminSidebar.jsx']) {
      const code = codeOf(resolve(src, rel));
      expect(code, `${rel} importe un chevron horizontal directement de lucide`)
        .not.toMatch(/import \{[^}]*Chevron(?:Left|Right)[^}]*\} from 'lucide-react'/);
    }
  });
});
