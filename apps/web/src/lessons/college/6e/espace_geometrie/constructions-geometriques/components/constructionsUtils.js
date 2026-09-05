/**
 * Modèle de la leçon « Constructions géométriques ».
 *
 * ─── LES INSTRUMENTS ───────────────────────────────────────────────────
 * Chaque instrument a un DOMAINE : ce qu'il garantit, et ce qu'il ne garantit
 * pas. Choisir l'instrument adapté (P8) revient à savoir quelle propriété on
 * veut assurer — c'est le cœur de la leçon, pas un détail pratique.
 *
 * ─── LES PROGRAMMES DE CONSTRUCTION ────────────────────────────────────
 * Un programme est une SUITE ORDONNÉE d'étapes. L'ordre n'est pas décoratif :
 * on ne peut pas tracer un cercle avant d'avoir son centre. `checkOrder`
 * vérifie qu'une proposition respecte les dépendances déclarées, et nomme la
 * première étape mal placée — jamais un « faux » sec.
 */
import { dist, midpoint } from '../../../../../common/utils/geometry2d';

export { dist, midpoint };

/* ── Les trois instruments ───────────────────────────────────────────── */

export const INSTRUMENTS = {
  regle: {
    id: 'regle',
    nom: 'règle graduée',
    emoji: '📏',
    garantit: 'des traits droits et des longueurs exactes',
    neGarantitPas: 'ni les angles droits, ni le report d’une longueur inconnue',
  },
  equerre: {
    id: 'equerre',
    nom: 'équerre',
    emoji: '📐',
    garantit: 'l’angle droit — donc les perpendiculaires et les parallèles',
    neGarantitPas: 'les longueurs',
  },
  compas: {
    id: 'compas',
    nom: 'compas',
    emoji: '⭕',
    garantit: 'l’égalité de deux longueurs, et les cercles',
    neGarantitPas: 'les traits droits',
  },
};

export const INSTRUMENTS_LIST = Object.values(INSTRUMENTS);

/**
 * Quel instrument pour quelle tâche ? Le catalogue sert à la fois aux
 * questions et aux corrections : les deux ne peuvent pas diverger.
 */
export const TACHES = [
  { id: 't1', libelle: 'Tracer un segment de 7 cm', instrument: 'regle' },
  { id: 't2', libelle: 'Reporter une longueur sans la mesurer', instrument: 'compas' },
  { id: 't3', libelle: 'Tracer une perpendiculaire à une droite', instrument: 'equerre' },
  { id: 't4', libelle: 'Tracer un cercle de rayon 3 cm', instrument: 'compas' },
  { id: 't5', libelle: 'Tracer une parallèle à une droite', instrument: 'equerre' },
  { id: 't6', libelle: 'Mesurer la longueur d’un segment déjà tracé', instrument: 'regle' },
];

/** L'instrument attendu pour une tâche — jamais écrit en dur dans un module. */
export function instrumentFor(tacheId) {
  return TACHES.find((t) => t.id === tacheId)?.instrument ?? null;
}

/* ── Programmes de construction ──────────────────────────────────────── */

/**
 * Une étape : un texte, et la liste des étapes dont elle DÉPEND. Ces
 * dépendances sont ce qui rend l'ordre non arbitraire.
 */
export function checkOrder(steps, proposition) {
  const position = new Map(proposition.map((id, i) => [id, i]));
  for (const step of steps) {
    const ici = position.get(step.id);
    if (ici === undefined) continue;
    for (const dep of step.depend ?? []) {
      const la = position.get(dep);
      if (la === undefined || la > ici) {
        return {
          ok: false,
          fautif: step.id,
          manquant: dep,
          message: `« ${step.texte} » arrive trop tôt : il faut d’abord « ${
            steps.find((s) => s.id === dep)?.texte ?? dep
          } ».`,
        };
      }
    }
  }
  return { ok: true, message: 'Toutes les étapes sont dans un ordre possible.' };
}

/** Le programme de référence du module 5 : construire un rectangle. */
export const PROGRAMME_RECTANGLE = [
  { id: 'e1', texte: 'Tracer un segment [AB] de 6 cm', instrument: 'regle', depend: [] },
  { id: 'e2', texte: 'Tracer la perpendiculaire à (AB) passant par A', instrument: 'equerre', depend: ['e1'] },
  { id: 'e3', texte: 'Placer D sur cette perpendiculaire, à 4 cm de A', instrument: 'regle', depend: ['e2'] },
  { id: 'e4', texte: 'Tracer la parallèle à (AB) passant par D', instrument: 'equerre', depend: ['e3'] },
  { id: 'e5', texte: 'Placer C à 6 cm de D sur cette parallèle', instrument: 'regle', depend: ['e4'] },
  { id: 'e6', texte: 'Tracer le segment [BC]', instrument: 'regle', depend: ['e1', 'e5'] },
];

/* ── Erreurs de construction (module 6) ──────────────────────────────── */

/**
 * Chaque erreur est décrite par ce qui cloche ET par l'instrument qui
 * l'aurait évitée : c'est le lien que le module 6 fait construire.
 */
export const ERREURS = [
  {
    id: 'er1',
    figure: 'Un « carré » dont deux côtés mesurent 5 cm et deux autres 5,4 cm',
    probleme: 'longueurs',
    instrument: 'regle',
    explication:
      'Les côtés d’un carré doivent être exactement égaux. La règle graduée — ou le compas, pour reporter — l’aurait garanti.',
  },
  {
    id: 'er2',
    figure: 'Un « rectangle » dont un angle mesure 87°',
    probleme: 'angle',
    instrument: 'equerre',
    explication:
      'Un rectangle a quatre angles droits exacts. Seule l’équerre garantit le 90° — à main levée, on tombe rarement juste.',
  },
  {
    id: 'er3',
    figure: 'Un « cercle » tracé à main levée, plus large d’un côté',
    probleme: 'cercle',
    instrument: 'compas',
    explication:
      'Tous les points d’un cercle sont à la même distance du centre. Seul le compas, dont l’écartement ne bouge pas, l’assure.',
  },
];
