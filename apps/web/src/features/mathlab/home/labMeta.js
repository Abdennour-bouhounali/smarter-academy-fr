import { GraduationCap, School } from 'lucide-react';

/**
 * Ce qu'un مخبر montre de lui-même hors des textes (`mathlab.json › labs.*`) :
 * son icône. Les couleurs sont dans mathlab.css (`--moyen`, `--secondaire`).
 */
export const LAB_META = Object.freeze({
  moyen: Object.freeze({ icon: School }),
  secondaire: Object.freeze({ icon: GraduationCap }),
});
