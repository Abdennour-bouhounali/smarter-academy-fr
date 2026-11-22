import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { courseLevels } from '@smarter-academy/core';

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, '../..');
const read = (p) => readFileSync(resolve(webRoot, p), 'utf8');

/**
 * Le droit d'accès, vu du frontend.
 *
 * L'invariant que ces tests protègent n'est PAS « l'interface bloque bien » —
 * l'interface ne bloque rien, elle affiche. C'est « l'interface ne décide
 * pas » : la valeur qui ouvre une leçon payante doit venir du serveur, et
 * jamais d'un état local qu'un élève pourrait retourner.
 *
 * La preuve fonctionnelle de l'accès vit côté backend
 * (EntitlementAccessMatrixTest) — c'est lui l'autorité.
 */
describe('la porte de palier côté élève', () => {
  it('le catalogue embarqué ne porte AUCUN palier', () => {
    // `lessons.tier` (en base, décidé par l'administrateur) est la seule
    // source de vérité. Un palier dans le bundle serait une seconde autorité
    // — une liste figée de leçons gratuites ou payantes.
    const lessons = courseLevels.flatMap((l) => l.grades)
      .flatMap((g) => g.chapters ?? [])
      .flatMap((c) => c.lessons ?? []);
    expect(lessons.length).toBeGreaterThan(0);
    for (const lesson of lessons) {
      expect(lesson, lesson.id).not.toHaveProperty('tier');
    }
  });

  it('aucune surface élève ne lit un palier embarqué', () => {
    for (const file of [
      'src/components/student/LessonCard.jsx',
      'src/pages/student/StudentHome.jsx',
      'src/lessons/common/components/LessonIndex.jsx',
      'src/lessons/common/components/ModuleLayout.jsx',
    ]) {
      expect(read(file), file).not.toMatch(/lesson\??\.tier\b/);
    }
    expect(read('src/components/student/LessonCard.jsx')).not.toContain('isLessonUnlocked');
  });

  it('la carte lit le palier et le verrou du SERVEUR', () => {
    // L'état de la carte (et de la ligne) est lu par useLessonTileState.
    const source = read('src/components/student/useLessonTileState.js');
    expect(source).not.toMatch(/isPremiumUser:\s*false/);
    expect(source).toContain('const isPremiumLesson = isLessonPremium(lesson.id);');
    expect(source).toContain('const isUnlocked = !isLessonLocked(lesson.id);');
  });

  it('un visiteur reçoit aussi le palier du serveur', () => {
    const service = read('src/services/contentAvailabilityService.js');
    expect(service).toContain("'/content/availability/public'");
    const context = read('src/context/ContentAvailabilityContext.jsx');
    // Plus de court-circuit « pas de jeton = rien à charger ».
    expect(context).not.toContain('if (!token) return null;');
  });

  it('une URL de leçon ou de module tapée directement passe par la porte', () => {
    // La fabrique de routes de l'unité enveloppe CHAQUE page (sommaire et
    // modules) : une leçon générée demain en hérite sans code.
    // La composition porte → page vit dans le runtime de leçon partagé
    // (lot paresseux, docs/architecture/BUNDLE_BOUNDARIES.md) : la fabrique
    // rend LessonPageFrame pour chaque page, et LessonPageFrame pose la porte
    // AUTOUR du <Suspense> qui charge le code de la page.
    const routes = read('src/lessons/common/unit/buildLessonRoutes.jsx');
    expect(routes).toContain('<LessonPageFrame');
    expect(routes).toMatch(/const withSuspense = \(Component, module = null\) => \(\s*<Suspense[^>]*>\s*<LessonPageFrame/);
    const frame = read('src/lessons/common/lessonRuntime.jsx');
    expect(frame).toMatch(/<LessonAccessGate lessonId=\{config\.id\}[^>]*>\s*<Suspense/);
    const gate = read('src/lessons/common/components/LessonAccessGate.jsx');
    expect(gate).toContain('isLessonLocked(lessonId)');
    // Et le module lui-même refuse d'écrire une progression sous verrou.
    const layout = read('src/lessons/common/components/ModuleLayout.jsx');
    expect(layout).toContain('const unlocked = sequentiallyUnlocked && !premiumLocked;');
  });

  it('le contexte distingue « retiré » de « verrouillé »', () => {
    const source = read('src/context/ContentAvailabilityContext.jsx');
    // Deux questions distinctes : une leçon retirée n'existe pas pour
    // l'élève, une leçon verrouillée existe et lui dit ce qui lui manque.
    expect(source).toContain('isLessonClosed');
    expect(source).toContain('isLessonLocked');
  });

  it('le contexte reste OUVERT tant que la réponse n’est pas arrivée', () => {
    const source = read('src/context/ContentAvailabilityContext.jsx');
    expect(source).toContain('isLessonLocked: () => false');
  });

  it('le sommaire d’une leçon verrouillée ne révèle aucun contenu', () => {
    const source = read('src/lessons/common/components/LessonIndex.jsx');
    expect(source).toContain('isLessonLocked(config.id)');
    expect(source).toContain('<PremiumLessonLocked');
    // Un retour AVANT le rendu du sommaire : le bloc verrouillé sort de la
    // fonction, il ne se superpose pas au contenu (qui resterait dans le DOM).
    const lockedAt = source.indexOf('isLessonLocked(config.id)');
    const roadmapAt = source.indexOf('isModuleClosed(config.id, module.number)');
    expect(lockedAt).toBeGreaterThan(-1);
    expect(roadmapAt).toBeGreaterThan(lockedAt);

    // Le panneau partagé : message arabe (clé i18n) et chemin vers la SAISIE
    // D'UN CODE, jamais une page de tarifs — le produit algérien se paie en
    // espèces, hors de l'application (§17/§18).
    const panel = read('src/lessons/common/components/PremiumLessonLocked.jsx');
    expect(panel).toContain("t('lockedHint')");
    expect(panel).toContain('/espace/activation');
    expect(panel).not.toContain('/tarifs');
  });

  it('le badge Premium reste visible quand l’élève A l’accès', () => {
    // Masquer le badge dès que l'accès est ouvert ferait passer du payant
    // pour du gratuit — et la disparition de l'accès, le jour où
    // l'abonnement s'arrête, serait incompréhensible.
    const source = read('src/components/student/LessonCard.jsx');
    expect(source).toContain('isPremiumLesson');
    // Le badge vit aussi dans la branche ACCESSIBLE, pas seulement dans la
    // branche verrouillée : deux occurrences de « Premium » au minimum.
    expect(source.match(/Premium/g).length).toBeGreaterThanOrEqual(2);
  });

  it('le badge suit le CONTENU, le verrou suit l’ÉLÈVE', () => {
    // Deux questions distinctes, donc deux listes distinctes. `locked` se
    // vide dès que l'élève a accès ; `premium` non — sinon une leçon payante
    // qu'il peut ouvrir n'apparaîtrait plus nulle part comme payante.
    const source = read('src/context/ContentAvailabilityContext.jsx');
    expect(source).toContain('isLessonPremium');
    expect(source).toContain('isLessonLocked');

    const state = read('src/components/student/useLessonTileState.js');
    const card = read('src/components/student/LessonCard.jsx');
    // Le verrou décide de la BRANCHE (carte cliquable ou CTA tarifs) ; le
    // palier décide seulement du badge.
    expect(state).toContain('!isLessonLocked(lesson.id)');
    expect(state).toContain("state = 'locked'");
    expect(card).toContain("state === 'locked'");
    expect(card).toContain('isPremiumLesson');
  });

  it('un seul appel sert la disponibilité ET le droit d’accès', () => {
    // Pas d'appel par page : le contexte partagé porte les deux (spec §44).
    const source = read('src/services/contentAvailabilityService.js');
    expect(source).toContain('access: data.access ?? null');
    expect(source).not.toContain('/me/access');
  });
});
