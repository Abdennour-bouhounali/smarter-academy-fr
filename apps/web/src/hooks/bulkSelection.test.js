import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { pruneToVisible, toggleAllVisible, toggleId } from './bulkSelectionCore';
import i18n from '../i18n';
import { CONTENT_NOUNS } from '../components/admin/contentNouns';

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, '../..');
const read = (p) => readFileSync(resolve(webRoot, p), 'utf8');

/**
 * La sélection multiple, et l'invariant qui la rend sûre : on ne peut pas agir
 * sur ce qu'on ne voit pas.
 *
 * C'est LE risque de cette fonctionnalité. Une sélection qui survit à un
 * changement de filtre laisse des identifiants cochés hors écran, et le geste
 * suivant touche des contenus que l'administrateur n'a pas choisis — sans
 * rien afficher de faux au passage. Ces tests existent pour que ce cas-là ne
 * puisse pas revenir en silence.
 */
describe('l’élagage de la sélection', () => {
  it('oublie ce qui a quitté l’écran', () => {
    // Filtre « Brouillon » → « Publié » : la page ne montre plus 12 ni 19.
    const next = pruneToVisible(new Set([12, 15, 19]), [15, 42, 43]);

    expect([...next]).toEqual([15]);
  });

  it('vide tout quand plus rien de coché n’est affiché', () => {
    const next = pruneToVisible(new Set([12, 15]), [90, 91]);

    expect(next.size).toBe(0);
  });

  it('vide tout quand la page devient vide', () => {
    // Une recherche sans résultat ne doit pas garder 25 lignes cochées
    // invisibles, prêtes à partir au prochain clic.
    expect(pruneToVisible(new Set([12, 15]), []).size).toBe(0);
  });

  it('rend le MÊME ensemble quand rien n’a disparu', () => {
    // L'identité compte : useAdminResource recrée un tableau à chaque
    // rechargement, et rendre un nouveau Set relancerait les consommateurs
    // React à chaque fois pour un contenu identique.
    const selected = new Set([12, 15]);

    expect(pruneToVisible(selected, [12, 15, 19])).toBe(selected);
  });

  it('ne fait rien sur une sélection vide', () => {
    const empty = new Set();

    expect(pruneToVisible(empty, [1, 2, 3])).toBe(empty);
  });
});

describe('cocher une ligne', () => {
  it('ajoute puis retire le même identifiant', () => {
    const once = toggleId(new Set(), 7);
    expect([...once]).toEqual([7]);

    expect(toggleId(once, 7).size).toBe(0);
  });

  it('ne modifie pas l’ensemble d’origine', () => {
    const selected = new Set([1]);
    toggleId(selected, 2);

    // Un updater impur ferait diverger l'état de React de ce qui est affiché.
    expect([...selected]).toEqual([1]);
  });
});

describe('« tout sélectionner »', () => {
  it('ne prend QUE les lignes affichées', () => {
    // Le point qui interdit une sélection à l'échelle de la base : le geste
    // ne connaît que la page.
    const next = toggleAllVisible(new Set(), [1, 2, 3]);

    expect([...next]).toEqual([1, 2, 3]);
  });

  it('décoche tout quand toute la page est déjà cochée', () => {
    expect(toggleAllVisible(new Set([1, 2, 3]), [1, 2, 3]).size).toBe(0);
  });

  it('complète la page quand la sélection est partielle', () => {
    // Une case maîtresse « indéterminée » complète, elle ne vide pas : c'est
    // ce que fait n'importe quelle case à cocher de tableau.
    const next = toggleAllVisible(new Set([2]), [1, 2, 3]);

    expect([...next]).toEqual([1, 2, 3]);
  });

  it('ne coche rien sur une page vide', () => {
    expect(toggleAllVisible(new Set(), []).size).toBe(0);
  });
});

/**
 * Le reste vérifie le BRANCHEMENT — la même famille de tests que
 * tierControl.test.js, qui lit la source parce que ce projet n'a pas
 * d'environnement DOM.
 */
describe('le branchement des actions groupées', () => {
  // La liste des MODULES n'en fait plus partie (2026-11-11) : un module n'a
  // pas d'état propre, il suit sa leçon — voir le test dédié plus bas.
  // La page « التمارين » n'en fait plus partie non plus (2026-11-11) : elle
  // est organisée PAR LEÇON — voir le test dédié plus bas.
  const PAGES = {
    'src/pages/admin/content/Lessons.jsx': 'lesson',
  };

  it('la page « التمارين » change la banque d’une leçon d’un seul geste, pas exercice par exercice', () => {
    const source = read('src/pages/admin/content/Exercises.jsx');
    expect(source).toContain('fetchLessons');
    expect(source).toContain('withExercises: 1');
    expect(source).toContain('ExerciseBankControl');
    expect(source).not.toContain('PublicationControl');
    expect(source).not.toContain('BulkActionBar');
  });

  it('il n’y a plus de page « المحاور » : un module suit sa leçon (2026-11-11)', () => {
    expect(existsSync(resolve(webRoot, 'src/pages/admin/content/Modules.jsx'))).toBe(false);
    expect(read('src/data/adminNavigation.js')).not.toContain('contenu/modules');
    expect(read('src/App.jsx')).not.toContain('contenu/modules');
    expect(read('src/services/admin/contentService.js')).not.toContain('/admin/content/modules');
    const detail = read('src/pages/admin/content/LessonDetail.jsx');
    expect(detail).not.toContain('type="module"');
    expect(detail).not.toContain('m.publicationStatus');
  });

  it('les listes de contenu portent la sélection et la barre d’actions', () => {
    for (const page of Object.keys(PAGES)) {
      const source = read(page);
      expect(source, page).toContain('useBulkSelection');
      expect(source, page).toContain('BulkActionBar');
      // La case à cocher passe par DataTable, pas par une colonne maison :
      // sinon l'état « indéterminé » et le libellé accessible seraient à
      // réécrire trois fois.
      expect(source, page).toContain('selection={selection}');
    }
  });

  it('chaque liste déclare le type que sa route serveur accepte', () => {
    for (const [page, type] of Object.entries(PAGES)) {
      expect(read(page), page).toContain(`type: '${type}'`);
    }
  });

  /**
   * LA règle de cohérence : un module n'a pas de palier, en lot comme à
   * l'unité. Le proposer ici créerait une action que le serveur refuse par la
   * route — un bouton qui ne peut qu'échouer.
   */
  it('le palier en lot n’est proposé que là où il existe à l’unité', () => {
    expect(read('src/pages/admin/content/Lessons.jsx')).toContain('withTier: true');
    expect(read('src/pages/admin/content/Lessons.jsx')).not.toContain('withTierInherit');
  });

  /**
   * Le lot passe par les MÊMES routes de contenu que le geste unitaire, sur le
   * même service serveur. Un second chemin d'écriture serait un second jeu de
   * règles métier.
   */
  it('le lot appelle le service de contenu, pas un chemin parallèle', () => {
    const service = read('src/services/admin/contentService.js');
    expect(service).toContain('/bulk-status');
    expect(service).toContain('/bulk-tier');

    const actions = read('src/components/admin/bulkContentActions.jsx');
    expect(actions).toContain('bulkChangeContentStatus');
    expect(actions).toContain('bulkChangeContentTier');
  });

  /**
   * Les actions groupées ne sont que les deux gestes qui existent à l'unité.
   * Aucune suppression, aucune duplication : le contenu pédagogique vit dans
   * les fichiers, la base ne porte que l'état de diffusion.
   */
  it('aucune action inventée ne s’est glissée dans le menu', () => {
    const actions = read('src/components/admin/bulkContentActions.jsx');

    for (const forbidden of ['delete', 'Supprimer', 'duplicate', 'Dupliquer']) {
      expect(actions, forbidden).not.toContain(forbidden);
    }
  });

  it('la barre rend compte des échecs au lieu d’annoncer un succès', () => {
    const bar = read('src/components/admin/BulkActionBar.jsx');
    // Les trois issues du serveur sont lues, pas seulement la première.
    expect(bar).toContain('result.applied');
    expect(bar).toContain('result.unchanged');
    expect(bar).toContain('failed');
    // Et l'erreur de transport n'est jamais avalée.
    expect(bar).toContain("role=\"alert\"");
  });

  it('rien ne se lance deux fois : les contrôles sont gelés pendant un lot', () => {
    const bar = read('src/components/admin/BulkActionBar.jsx');
    expect(bar).toContain('disabled={busy');
    expect(bar).toContain('if (busy) return');
  });

  /**
   * Les gestes unitaires restent branchés : le lot s'AJOUTE, il ne remplace
   * pas. Perdre le menu par ligne obligerait à cocher une case pour publier
   * une seule leçon.
   */
  it('les contrôles unitaires sont toujours là', () => {
    for (const page of Object.keys(PAGES)) {
      expect(read(page), page).toContain('PublicationControl');
    }
    expect(read('src/pages/admin/content/Lessons.jsx')).toContain('TierControl');
    // Le palier d'UN exercice se règle sur la fiche de sa leçon.
    expect(read('src/pages/admin/content/LessonDetail.jsx')).toContain('TierControl');
  });

  /**
   * La case à cocher n'apparaît QUE là où une action groupée existe. Les
   * listes de signalements et d'abonnements n'en ont pas : une case qui ne
   * mène à rien est une promesse non tenue. (Les élèves en ont une depuis
   * « تفعيل عرض » en lot — voir le test suivant.)
   */
  it('la sélection reste optionnelle dans DataTable', () => {
    const table = read('src/components/admin/ui/DataTable.jsx');
    expect(table).toContain('{selection && (');

    for (const page of [
      'src/pages/admin/reports/ReportList.jsx',
    ]) {
      expect(read(page), page).not.toContain('selection={');
    }
  });

  it('la liste des élèves active une offre par ligne ET en lot, par la route unitaire', () => {
    const page = read('src/pages/admin/students/StudentList.jsx');
    expect(page).toContain('PlanActivateControl');
    expect(page).toContain('BulkActionBar');
    expect(page).toContain('buildPlanBulkActions');
    // Sans offre activable, aucune case : elle ne mènerait à rien.
    expect(page).toContain('selection={plans.length ? selection : undefined}');

    // Le lot n'a pas de route à lui : il rappelle le geste unitaire, élève par
    // élève, pour garder la validation et le journal du serveur.
    const bulk = read('src/components/admin/commercial/bulkPlanActions.jsx');
    expect(bulk).toContain("activatePlan(token, 'students', row.id, { planId: plan.id })");
    expect(bulk).toContain('statusById');
  });
});

/**
 * LE NOMBRE, EN ARABE.
 *
 * L'ancienne version de ce bloc verifiait l'accord FRANCAIS : « 24 lecons
 * selectionnees » contre « 24 lecons selectionnes ». L'interface est arabe
 * desormais, et l'arabe ne se decline pas en deux formes mais en SIX
 * categories (`zero`, `one`, `two`, `few`, `many`, `other`) — c'est
 * `Intl.PluralRules('ar-DZ')` qui choisit, jamais une concatenation. Ces
 * tests verifient donc que le catalogue porte bien les six formes, et que le
 * nom vient toujours du TYPE.
 */
describe('le nom compte du contenu', () => {
  const noun = (key, count) => i18n.t(`bulk.noun.${key}`, { ns: 'admin', count });

  it('decline chaque type dans les categories de pluriel arabes', () => {
    for (const key of ['lesson', 'module', 'exercise', 'item']) {
      // Une forme par categorie, toutes non vides : une cle manquante revient
      // telle quelle et se verrait a l'ecran.
      for (const count of [1, 2, 3, 11, 100]) {
        const rendered = noun(key, count);
        expect(rendered, `${key}/${count}`).not.toContain('bulk.noun');
        expect(rendered, `${key}/${count}`).not.toBe('');
      }
    }
  });

  it('distingue le singulier, le duel et le pluriel', () => {
    // Le duel est ce qu'aucune regle francaise ne sait produire : « درسان »
    // ne s'obtient pas en ajoutant « s » a « درس ».
    expect(noun('lesson', 1)).not.toBe(noun('lesson', 2));
    expect(noun('lesson', 2)).not.toBe(noun('lesson', 3));
    expect(noun('lesson', 3)).not.toBe(noun('lesson', 11));
  });

  it('connait les trois types de contenu, par leur cle', () => {
    expect(CONTENT_NOUNS.lesson.key).toBe('lesson');
    expect(CONTENT_NOUNS.module.key).toBe('module');
    expect(CONTENT_NOUNS.exercise.key).toBe('exercise');
  });

  it('n\'expose plus d\'accord grammatical francais', async () => {
    const mod = await import('../components/admin/contentNouns');

    expect(mod.agree).toBeUndefined();
    expect(mod.countNoun).toBeUndefined();
  });

  /**
   * Le nom vient du TYPE, jamais de l'appelant : c'est ce qui empeche une
   * quatrieme page de reintroduire un nombre mal accorde en recopiant deux
   * chaines.
   */
  it('les pages ne recopient plus le nom a la main', () => {
    for (const page of [
      'src/pages/admin/content/Lessons.jsx',
    ]) {
      expect(read(page), page).toContain('CONTENT_NOUNS.');
      expect(read(page), page).not.toContain('nounPlural');
    }
  });
});
