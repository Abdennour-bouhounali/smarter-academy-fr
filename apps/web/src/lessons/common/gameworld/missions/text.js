/**
 * THE WORDS OF A MISSION'S SCREENS (`MissionRunner.jsx`, `parts.jsx`, `Ink.jsx`) — words only, no logic beyond the
 * agreement of a count. What a mission SAYS of its own situation (its text, its data, its facts) is the lesson's data;
 * this file holds what every mission says. « tu », short, imperative; a verdict is never « faux ».
 * Two words for two things: « ta feuille » is the real sheet of paper on his desk, « ta copie » its typed twin on the
 * screen (`Copy`).
 */
import { COINS, counted } from '../kit/authoring/numbers';

const MINUTES = ['minute', 'minutes'];
const q = (s) => `« ${s} »`;

export const T = {
  /** the word of a right answer, drawn at random */
  bravo: ['Bravo !', 'Excellent !', 'Super !', 'C’est juste !', 'Bien vu !'],

  // the copy on the screen and its three sections
  copy: 'Ma copie',
  data: 'Les données',
  goal: 'On cherche',
  work: 'Ma solution',

  // the robot does the first gesture
  demo: (text) =>
    `Zéro a souligné ${q(text)} et l’a écrit dans les données. À toi : souligne dans le texte tout ce qu’il te faut.`,

  // the question of the header, step by step
  readFirst: 'Lis d’abord tout l’exercice, jusqu’à la dernière question.',
  compare: 'Compare ta feuille à ce corrigé, et corrige-la au stylo.',
  marker: 'Qu’y a-t-il sur ta feuille ? Coche ce que tu as écrit.',
  dataAsk: (conditions, n, of) =>
    `Quelles sont les données ? Souligne dans le texte ${conditions ? 'chaque nombre et chaque condition' : 'chaque nombre'} (${n} sur ${of}).`,
  dataDone: 'Voici tes données. Écris-les sur ta feuille.',
  goalAsk: 'Que cherche-t-on ? Clique sur la question dans le texte.',
  planAsk: (then) => `La question cache des étapes. Que cherches-tu ${then ? 'ensuite' : 'd’abord'} ?`,
  planDone: 'Voici ton plan. Écris-le sur ta feuille.',
  reviewFound: 'C’est cette ligne. Corrige-la sur la copie de ton camarade.',

  // the mission card and the message before the clock
  need: 'Feuille · stylo',
  minutes: (n) => counted(n, MINUTES),
  resume: (stage, of) => `Reprends où tu en étais (étape ${stage} sur ${of})`,
  again: 'Recommence depuis le début',
  start: 'Ma feuille et mon stylo sont prêts',
  notNow: 'Pas maintenant',
  clockStarts: 'Le chrono démarre',
  clockSay: (n) => `Tu as ${counted(n, MINUTES)}. Prépare ta feuille et ton stylo.`,

  // the header
  stage: (n, of) => `Étape ${n} sur ${of}`,
  pen: 'Stylo',
  quit: 'Quitter',

  // the model copy, the reading, the hints
  model: (session) => `${session} — le corrigé`,
  reading: 'Prends le temps de lire…',
  readDone: 'J’ai lu tout l’exercice',
  dataHint: 'Les nombres et les conditions sont dans le texte de l’exercice, à gauche.',
  dataSheet: `Écris ${q('Les données')} comme sur ta copie à l’écran.`,
  goalHint: 'La question est à la fin du texte, à gauche.',
  goalSheet: `Écris ${q('On cherche')} sur ta feuille.`,
  planHint: (then) => `Clique sur ce que tu cherches ${then ? 'ensuite' : 'd’abord'}.`,
  planSheet: `Écris ton plan sous ${q('On cherche')} : les étapes dans l’ordre.`,
  owed: (text) => `Ajoute à tes données : ${q(text)}.`,
  connectHint: 'Clique sur ce dont la question a besoin.',
  tied: 'J’ai relié',
  reviewHint: 'Clique sur la ligne où se trouve l’erreur.',
  write: 'Je l’écris sur ma feuille',
  corrected: 'J’ai corrigé ma feuille',
  markerTitle: 'Qu’y a-t-il sur ta feuille ?',
  done: 'J’ai fini',

  // the end of the mission
  finale: 'Mission accomplie !',
  finaleSay: (session) => `Tu as résolu cet exercice (${session}) avec ta feuille et ton stylo.`,
  coins: (n) => counted(n, COINS),
  timeLeft: (clock) => `Il reste ${clock}`,
  toModel: 'Compare ta feuille au corrigé',

  // parts.jsx: the « on your sheet » gate
  onSheet: 'Sur ta feuille :',
  written: (wait) => (wait > 0 ? `J’ai écrit sur ma feuille (${wait})` : 'J’ai écrit sur ma feuille'),

  // Ink.jsx: the student's pen
  inkColour: 'Couleur du stylo',
  inkUndo: 'Annuler',
  inkClear: 'Effacer',
  inkClose: 'Ranger le stylo',
};
