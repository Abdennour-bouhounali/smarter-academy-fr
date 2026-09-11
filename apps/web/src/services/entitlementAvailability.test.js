import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { isLessonUnlocked } from '@smarter-academy/core';

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
  it('une leçon gratuite est ouverte sans aucun droit', () => {
    expect(isLessonUnlocked({ tier: 'free' })).toBe(true);
    expect(isLessonUnlocked({})).toBe(true);
    // Palier absent ou inconnu : ouvert. Même défaut sûr que côté serveur —
    // une donnée manquante ne doit jamais fermer une leçon.
    expect(isLessonUnlocked({ tier: undefined })).toBe(true);
  });

  it('une leçon payante reste fermée sans droit, ouverte avec', () => {
    expect(isLessonUnlocked({ tier: 'premium' })).toBe(false);
    expect(isLessonUnlocked({ tier: 'premium' }, { isPremiumUser: true })).toBe(true);
  });

  it('la carte lit le droit d’accès du SERVEUR, pas une constante locale', () => {
    const source = read('src/components/student/LessonCard.jsx');
    // La valeur codée en dur qui existait avant l'implémentation des droits
    // ne doit pas revenir : elle rendrait la porte insensible au serveur.
    expect(source).not.toMatch(/isPremiumUser:\s*false/);
    expect(source).toContain('access?.premiumAccess === true');
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
    // Le message français attendu, et un retour AVANT le rendu du sommaire :
    // le bloc verrouillé sort de la fonction, il ne se superpose pas au
    // contenu (qui resterait alors dans le DOM).
    expect(source).toContain('Cette leçon nécessite un accès premium.');
    const lockedAt = source.indexOf('isLessonLocked(config.id)');
    const roadmapAt = source.indexOf('isModuleClosed(config.id, module.number)');
    expect(lockedAt).toBeGreaterThan(-1);
    expect(roadmapAt).toBeGreaterThan(lockedAt);
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

  it('le palier vient du serveur autant que du bundle', () => {
    const source = read('src/components/student/LessonCard.jsx');
    // Le bundle peut être en retard sur la base : une leçon rendue payante
    // côté serveur reste `free` dans coursesData.js jusqu'au déploiement.
    expect(source).toContain("lesson.tier === 'premium' || isLessonPremium(lesson.id)");
  });

  it('le badge suit le CONTENU, le verrou suit l’ÉLÈVE', () => {
    // Deux questions distinctes, donc deux listes distinctes. `locked` se
    // vide dès que l'élève a accès ; `premium` non — sinon une leçon payante
    // qu'il peut ouvrir n'apparaîtrait plus nulle part comme payante.
    const source = read('src/context/ContentAvailabilityContext.jsx');
    expect(source).toContain('isLessonPremium');
    expect(source).toContain('isLessonLocked');

    const card = read('src/components/student/LessonCard.jsx');
    // Le verrou décide de la BRANCHE (carte cliquable ou CTA tarifs) ; le
    // palier décide seulement du badge.
    expect(card).toContain('!isLessonLocked(lesson.id)');
    expect(card).toContain('isPremiumLesson');
  });

  it('un seul appel sert la disponibilité ET le droit d’accès', () => {
    // Pas d'appel par page : le contexte partagé porte les deux (spec §44).
    const source = read('src/services/contentAvailabilityService.js');
    expect(source).toContain('access: data.access ?? null');
    expect(source).not.toContain('/me/access');
  });
});
