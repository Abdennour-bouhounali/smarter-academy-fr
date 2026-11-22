/**
 * Les couleurs des figures du « مختبر التفكير » — une seule palette pour toutes, pour
 * qu'une même couche (la région cherchée, l'observation 👁, la construction) garde la
 * même couleur d'un défi à l'autre. Jamais de rouge : il est réservé… à rien ici
 * (« ليس بعد » n'est jamais rouge, THINKING_LAB.md §7).
 */
export const FIG = Object.freeze({
  ink: '#1e293b', // traits de la figure
  muted: '#94a3b8', // traits secondaires, pointillés
  paper: '#ffffff',
  sought: '#0ea5e9', // ce qu'on cherche (région, longueur)
  soughtFill: 'rgba(14, 165, 233, 0.22)',
  observe: '#d97706', // 👁 ce que l'on remarque (ambre)
  observeFill: 'rgba(217, 119, 6, 0.16)',
  build: '#7c3aed', // une construction ajoutée par le raisonnement
  buildFill: 'rgba(124, 58, 237, 0.14)',
  deadEnd: '#64748b', // ↩ une piste abandonnée
  deadEndFill: 'rgba(100, 116, 139, 0.18)',
  label: '#0f172a',
});

/** Les attributs d'un texte de figure : lettres et nombres toujours LTR dans une page RTL. */
export const ltrText = { direction: 'ltr', unicodeBidi: 'isolate', fontFamily: 'Inter, system-ui, sans-serif' };
