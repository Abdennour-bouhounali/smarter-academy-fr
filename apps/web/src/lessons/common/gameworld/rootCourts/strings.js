/**
 * « Le palais des dalles » — the WORLD's own sentences (it names no lesson: a lesson's story overrides or adds through
 * `story.text`). Every sentence about what a platform did is a FACT: a band and a jam are never « wrong ».
 * The words of the world: a court is « une salle », a tile « une dalle », the measuring rod « la toise » (never
 * « règle »: that word is the forge's rule), the platform « la plateforme », the lift « l’ascenseur », the crate
 * « la caisse », the side « le côté ».
 */
import { counted } from '../kit/authoring/numbers';

/** The tiles, [singular, plural] — `counted` agrees them: « 0 dalle », « 1 dalle », « 2 dalles ». */
export const TILES = ['dalle', 'dalles'];

/**
 * « dalle » agreed with its number, the number written as it was given (text: « 30 », « 0,25 », « 49/64 ») and joined
 * to its noun by a no-break space. A whole number or a decimal takes the singular below 2 and the plural from 2
 * (« 0 dalle », « 1 dalle », « 0,25 dalle », « 2,5 dalles », « 49 dalles »); a fraction is a part OF a tile
 * (« 49/64 de dalle », « 88/49 de dalle »).
 */
export function tiles(text) {
  const t = String(text).trim();
  if (/^\d+$/.test(t)) return counted(Number(t), TILES);
  if (/^-?\d+\/\d+$/.test(t)) return `${t} de dalle`;
  const v = Number(t.replace(',', '.').replace('−', '-'));
  return `${t} ${Number.isFinite(v) && Math.abs(v) < 2 ? TILES[0] : TILES[1]}`;
}

/** The noun alone, for a number already written above or before it: « dalle », « dalles », « de dalle ». */
export function tileWord(text) {
  return tiles(text).slice(String(text).trim().length + 1);
}

export const WORLD_TEXT = {
  title: 'Le palais des dalles',
  subtitle:
    'Sur chaque terrasse, une salle carrée a son aire écrite sur sa porte. Tire la toise, construis la plateforme et prends l’ascenseur.',
  turn: { body: 'Tourne ton téléphone pour jouer.' },
  end: {
    title: 'Tu es en haut du palais',
    text: 'Chaque clé d’ici, c’est toi qui l’as forgée.',
    stay: 'Je me promène dans le palais',
  },
  hud: {
    rod: 'La toise',
    court: 'La salle',
    step: 'Graduations de la toise',
    wall: 'Côté de la salle',
    crate: 'La caisse',
    sealed: 'Aucune graduation ne monte',
    side: 'Côté du carré',
    left: (n) => `Reste dans la caisse : ${n}`,
    missing: (n) => `Il manque : ${n}`,
    empty: 'La caisse est vide, aucune case ouverte',
  },
  held: (s) => `La toise ${s}`,
  prompt: {
    grab: 'Prends la toise',
    drop: 'Pose la toise',
    lower: (s) => `Abaisse la plateforme — toise ${s}`,
    clamp: 'Fixe la toise dans le coin',
    key: 'Prends la clé de la salle',
    fix: (s) => `Fixe le carré — côté ${s}`,
    ride: (name) => `Monte sur la plateforme vers ${name}`,
  },
  verdict: {
    ride: 'La plateforme touche les quatre murs : l’ascenseur l’emporte.',
    band: (d) => `Il reste une bande de ${tiles(d)} : l’ascenseur ne bouge pas.`,
    jam: (d) => `La plateforme dépasse la salle de ${tiles(d)} : elle coince sur le rebord.`,
    wall: 'Cette toise a été prise sur le mur lui-même, d’un coin à l’autre.',
    bandHidden: 'La plateforme n’atteint pas tous les murs : il reste une bande, l’ascenseur ne bouge pas.',
    jamHidden: 'La plateforme est plus grande que la salle : elle coince sur le rebord.',
    yardRide: (a, s) => `La caisse est vide : ses ${tiles(a)} forment un carré de côté ${s}.`,
    yardBand: (d) => `Le carré est complet, mais il reste ${tiles(d)} dans la caisse.`,
    yardJam: (d) => `La caisse s’est vidée avant la fin du carré : il manque ${tiles(d)}.`,
  },
  say: {
    hello:
      'Voici une salle carrée : son aire est écrite sur sa porte. Prends la toise dans le coin et marche : la plateforme grandit avec toi.',
    fall: [
      'Attention au bord de la terrasse !',
      'Ce n’est rien. On revient et on continue.',
      'La terrasse est moins large que tu ne crois : reste dessus.',
    ],
    grab: 'Marche le long du mur : la longueur de la toise, c’est la longueur de ta marche.',
    ride: 'C’est parti !',
    key: 'La plateforme couvre toute la salle : voici sa clé. Prends-la !',
    sealed:
      'Entre deux graduations voisines, l’une laisse une bande et la suivante coince. Aucune graduation de cette terrasse ne fait monter la plateforme de cette salle.',
    guessRight: 'Comme tu l’avais prédit.',
    guessRode: 'Tu avais dit qu’elle ne monterait pas, et ta toise l’a fait monter.',
    guessSealed: 'Tu avais dit qu’elle monterait, et aucune graduation de cette terrasse ne la fait monter.',
    landed: (name) => `Nous y sommes : ${name}.`,
    end: 'D’ici, on voit tout le palais.',
  },
  objective: {
    grab: (a) => `Va au coin de la salle de ${tiles(a)} et prends la toise.`,
    grabHidden: 'Va au coin de la salle éclairée et prends la toise : personne n’a encore écrit son aire.',
    walkHidden:
      'Marche le long du mur jusqu’à ce que la plateforme touche les quatre murs, puis abaisse-la : on comptera ses dalles.',
    yard: (a) =>
      `Marche le long du mur gradué : les dalles se posent en carré. Vide toute la caisse (${tiles(a)}) en un carré complet, puis fixe-le.`,
    walk: (a) =>
      `Marche le long du mur jusqu’à ce que la plateforme couvre toute la salle (${tiles(a)}), puis abaisse-la.`,
    ride: (name) => `Monte sur la plateforme pour aller à ${name}.`,
    key: 'Prends la clé dorée de la salle : ensuite, la plateforme t’emporte.',
    keyStay: 'Prends la clé dorée de la salle.',
    end: 'Promène-toi dans le palais comme tu veux.',
  },
  mission: { check: 'Vérifie', later: 'Pas maintenant' },
  guess: {
    ask: 'Avant d’essayer : une graduation de cette terrasse fera-t-elle monter la plateforme de cette salle ?',
    yes: 'Elle monte',
    no: 'Elle ne monte pas',
  },
  // a level of the practice ladder on the rail: the words that differ from the story's course
  practice: {
    leave: 'Retour à la carte',
    quit: 'Quitter',
  },
  recall: {
    title: 'De la salle précédente',
    rode: (a, s) => `Salle ${a} : montée avec la toise ${s}`,
    band: (a, s, d) => `Salle ${a}, toise ${s} : il restait une bande de ${d}`,
    jam: (a, s, d) => `Salle ${a}, toise ${s} : elle dépassait de ${d}`,
  },
};

/**
 * The words the DRAWINGS of a case write (courtParts.jsx › Court, forgeParts.jsx › Line): what the world did, the
 * names of a line of evidence, how a fraction is read aloud. A drawing writes no other word.
 */
export const DRAWING_TEXT = {
  /** the chip of a line of evidence: what the world did */
  kind: { ride: 'Elle monte', band: 'Une bande', jam: 'Elle coince' },
  /** the title of the mirror's mark on a line it built */
  mirrored: 'Construite par le miroir',
  /** the head of a line and the court's `aria-label`: « salle 36 · toise 6 » */
  court: 'salle',
  rod: 'toise',
  /** a fraction read aloud: « 23 sur 7 » */
  over: 'sur',
  /**
   * the fact written beside a court, line by line (the difference and its noun follow a band and a jam) — each line
   * at most 19 characters: the zone beside the court holds 288 units at 27 units a glyph
   */
  fact: { ride: ['Elle monte', 'Tout est couvert'], band: 'Bande restante :', jam: 'Elle dépasse de' },
  /** under the plaque, beside the dashed square of ONE tile */
  tile: '1 dalle',
};

/** The world's sentences with the story's own on top, group by group. */
export function withStory(base, over = {}) {
  const out = { ...base };
  for (const [k, v] of Object.entries(over))
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && typeof base[k] === 'object' ? { ...base[k], ...v } : v;
  return out;
}
