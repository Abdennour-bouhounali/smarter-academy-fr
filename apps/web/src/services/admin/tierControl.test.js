import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import adminCatalogue from '../../i18n/locales/ar/admin.json';

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, '../../..');
const read = (p) => readFileSync(resolve(webRoot, p), 'utf8');

/**
 * Le contrôle du palier dans l'administration.
 *
 * Écrit après un rapport : le point d'entrée serveur existait, la colonne
 * « Accès » affichait le palier — mais rien ne permettait de le CHANGER. Un
 * réglage qu'on ne peut lire que dans une pastille n'est pas un réglage.
 */
describe('le contrôle du palier dans l’administration', () => {
  it('un composant dédié appelle la route de palier', () => {
    const control = read('src/components/admin/TierControl.jsx');
    expect(control).toContain('changeContentTier');

    const service = read('src/services/admin/contentService.js');
    // Route DISTINCTE de /status : les deux dimensions sont indépendantes.
    expect(service).toContain("/tier`");
    expect(service).toContain("send('PATCH', token, { tier })");
  });

  it('le contrôle est branché partout où le palier se voyait', () => {
    for (const page of [
      'src/pages/admin/content/Lessons.jsx',
      // Le palier d'UN exercice se règle sur la fiche de sa leçon : la page
      // « التمارين » est organisée par leçon depuis le 2026-11-11.
      'src/pages/admin/content/LessonDetail.jsx',
    ]) {
      expect(read(page), page).toContain('TierControl');
    }
  });

  it('palier et publication restent deux contrôles séparés', () => {
    // Les fondre empêcherait de vendre une leçon sans la republier, ou de la
    // retirer sans la rendre gratuite.
    const detail = read('src/pages/admin/content/LessonDetail.jsx');
    expect(detail).toContain('TierControl');
    expect(detail).toContain('PublicationControl');

    const control = read('src/components/admin/TierControl.jsx');
    // Le contrôle de palier n'envoie JAMAIS de statut de publication.
    expect(control).not.toContain('changeContentStatus');
    expect(control).not.toContain('publicationStatus');
  });

  it('fermer du contenu se confirme, l’ouvrir non', () => {
    const control = read('src/components/admin/TierControl.jsx');
    // Rendre payant retire l'accès à tous les élèves sans abonnement.
    expect(control).toContain("next === 'premium'");
    expect(control).toContain('bulk.confirmPremiumOneTitle');

    // Les PHRASES vivent dans le catalogue arabe depuis que le panneau parle
    // la langue du produit : on les vérifie là où elles sont, ce qui interdit
    // en plus qu'une clé soit citée sans exister.
    for (const key of [
      'confirmPremiumOneTitle', 'premiumOneMessageBefore', 'withoutSubscription',
      // La confirmation dit ce qui NE se passe pas, pour lever le doute.
      'noLearningDataLost', 'publicationUnchanged',
    ]) {
      expect(typeof adminCatalogue.bulk[key], `admin.bulk.${key}`).toBe('string');
      expect(control, `TierControl rend bulk.${key}`).toContain(`bulk.${key}`);
    }
  });

  it('un exercice peut hériter de sa leçon, une leçon non', () => {
    const control = read('src/components/admin/TierControl.jsx');
    // `null` = « hérite ». Une leçon est la racine de la règle : le serveur
    // refuse null pour elle, donc l'option ne lui est pas proposée.
    expect(control).toContain("isExercise ? [{ value: INHERIT");
    expect(control).toContain('bulk.inherit');
    expect(typeof adminCatalogue.bulk.inherit).toBe('string');
  });

  it('la pastille « Premium » ne ressemble pas à « Gratuit »', () => {
    const badge = read('src/components/admin/ui/StatusBadge.jsx');
    // `premium` retombait sur le gris du défaut — même pastille que
    // « Gratuit » pour deux états opposés.
    expect(badge).toMatch(/premium:\s*'bg-amber/);
    // Le libellé est arabe et vient du catalogue ; `STATUS_LABELS` ne reste
    // qu'un filet pour un statut hors vocabulaire.
    expect(adminCatalogue.status.premium).toMatch(/[\u0600-\u06FF]/);
    expect(adminCatalogue.status.free).toMatch(/[\u0600-\u06FF]/);
    expect(adminCatalogue.status.premium).not.toBe(adminCatalogue.status.free);
  });
});
