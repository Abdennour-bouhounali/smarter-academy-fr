import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { LESSON_CONFIG as STAT } from './statistiques-5e/lesson.config';
import { LESSON_CONFIG as PROBA } from './probabilites-5e/lesson.config';

/**
 * CONTRAT DE PREUVE (LP evidence).
 *
 * useEvidenceSubmission n'émet une preuve que si l'épreuve porte
 * `assessment.enabled`, `type: 'assessment'` et un `learningPointIds` non
 * vide (cf. hooks/useEvidenceSubmission.js). Un visiteur anonyme n'en produit
 * aucune — c'est voulu — donc l'e2e ne peut PAS vérifier ce contrat : il se
 * vérifie ici, sur les métadonnées elles-mêmes.
 *
 * On lit les fichiers en TEXTE parce que le validateur exige des littéraux :
 * ce test constate donc exactement ce que le validateur et le runtime voient.
 */
const lire = (l) =>
  readFileSync(new URL(`./${l}/modules/Module08MissionFinale.jsx`, import.meta.url), 'utf8');

const CAS = [
  { nom: 'statistiques-5e', src: lire('statistiques-5e'), config: STAT, prefixe: '5e_statistiques-5e_', nbLP: 7 },
  { nom: 'probabilites-5e', src: lire('probabilites-5e'), config: PROBA, prefixe: '5e_probabilites-5e_', nbLP: 6 },
];

describe.each(CAS)('$nom — contrat de preuve du test final', ({ src, config, prefixe, nbLP }) => {
  const epreuves = [...src.matchAll(/id: '([\w-]+e\d+)'/g)].map((m) => m[1]);
  const metas = [...src.matchAll(/assessment: \{ enabled: (\w+), type: '(\w+)', learningPointIds: \[([^\]]*)\] \}/g)];

  it('compte dix épreuves', () => {
    expect(epreuves).toHaveLength(10);
  });

  it('donne à CHAQUE épreuve des métadonnées de preuve valides', () => {
    expect(metas).toHaveLength(10);
    for (const [, enabled, type, lps] of metas) {
      expect(enabled).toBe('true');
      expect(type).toBe('assessment');
      expect(lps.trim().length).toBeGreaterThan(0);
    }
  });

  it('ne référence que des LP existants, écrits en littéraux', () => {
    const cites = new Set();
    for (const [, , , lps] of metas) {
      for (const m of lps.matchAll(/'([^']+)'/g)) {
        expect(m[1]).toMatch(new RegExp(`^${prefixe}P\\d+$`));
        cites.add(m[1]);
      }
    }
    // Chacun des LP du catalogue est couvert par au moins une épreuve.
    const attendus = Array.from({ length: nbLP }, (_, i) => `${prefixe}P${i + 1}`);
    expect([...cites].sort()).toEqual(expect.arrayContaining(attendus));
  });

  it('couvre tous les LP annoncés par les modules formatifs', () => {
    const parModules = new Set(
      config.modules.flatMap((m) => m.teachesLearningPointIds ?? []),
    );
    const parTest = new Set();
    for (const [, , , lps] of metas) for (const m of lps.matchAll(/'([^']+)'/g)) parTest.add(m[1]);
    // Tout ce qui est enseigné est évalué.
    for (const lp of parModules) expect(parTest.has(lp)).toBe(true);
  });

  it('n’évalue aucune épreuve deux fois sous le même identifiant', () => {
    expect(new Set(epreuves).size).toBe(epreuves.length);
  });
});
