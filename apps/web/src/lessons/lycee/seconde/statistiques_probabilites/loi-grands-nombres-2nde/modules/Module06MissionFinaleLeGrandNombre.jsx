import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 6 — ÉVALUATION. Distracteurs : loi des séries (e5), écart en
 * nombre confondu avec écart en fréquence (e6), fréquence prise pour une
 * certitude (e4), conclusion hâtive sur une série courte (e7),
 * équiprobabilité prise pour un théorème (e8), effectif confondu avec
 * fréquence (e9). Les 9 LPs sont couverts.
 */
const EPREUVES = [
  { id: 'lgn-e1', skill: 'simuler', title: 'Fréquence observée', prompt: 'Sur 500 lancers d’une pièce, on obtient 265 fois Pile. Quelle est la fréquence observée de Pile ?', options: ['53 %', '50 %', '26,5 %', '265 %'], cols: 4, explain: '265 ÷ 500 = 0,53 = 53 %. La fréquence se calcule sur les lancers réellement effectués, pas sur le modèle.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_loi-grands-nombres-2nde_P3'] } },
  { id: 'lgn-e2', skill: 'simuler', title: 'Fréquence ou probabilité', prompt: 'Quelle grandeur ne change JAMAIS d’une série de lancers à l’autre, pour un même dé équilibré ?', options: ['La probabilité du modèle', 'La fréquence observée', 'Le nombre de succès', 'L’écart à la moyenne'], cols: 2, explain: 'La probabilité est fixée par le modèle (1/6 pour chaque face) : aucune série ne la déplace. Tout le reste est un résultat d’expérience et fluctue.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_loi-grands-nombres-2nde_P6'] } },
  { id: 'lgn-e3', skill: 'fluctuation', title: 'Répétitions indépendantes', prompt: 'Pour simuler correctement 1 000 répétitions d’une expérience aléatoire, il faut que les tirages soient…', options: ['indépendants les uns des autres', 'répartis équitablement entre les issues', 'rangés du plus petit au plus grand', 'tous différents'], cols: 2, explain: 'L’indépendance est l’hypothèse clé : chaque répétition se fait « comme si c’était la première ». Forcer une répartition équitable reviendrait à supprimer le hasard qu’on veut observer.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_loi-grands-nombres-2nde_P2'] } },
  { id: 'lgn-e4', skill: 'fluctuation', title: 'Ce que la loi ne promet pas', prompt: 'Une pièce équilibrée est lancée 10 000 fois. Que peut-on affirmer ?', options: ['La fréquence de Pile sera très probablement proche de 50 %', 'On obtiendra exactement 5 000 Pile', 'Il y aura autant de Pile que de Face', 'La fréquence sera exactement 0,5'], cols: 1, explain: 'La loi des grands nombres affirme une PROXIMITÉ probable, jamais une égalité exacte. Obtenir précisément 5 000 Pile est possible, mais peu probable.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_loi-grands-nombres-2nde_P5'] } },
  { id: 'lgn-e5', skill: 'fluctuation', title: 'La loi des séries', prompt: 'Une pièce équilibrée vient de donner 5 fois Pile d’affilée. Au 6ᵉ lancer, P(Face) vaut…', options: ['1/2', 'plus de 1/2', 'moins de 1/2', 'impossible à dire'], cols: 4, explain: 'La pièce n’a pas de mémoire : les lancers sont indépendants, donc P(Face) = 1/2. La « loi des séries » n’existe pas ; la stabilisation vient de la dilution des premiers résultats, pas d’une compensation.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_loi-grands-nombres-2nde_P2', 'seconde_loi-grands-nombres-2nde_P5'] } },
  { id: 'lgn-e6', skill: 'loi', title: 'Deux écarts', prompt: 'Quand n augmente, l’écart entre le nombre de Pile et la moitié des lancers…', options: ['a tendance à grandir', 'tend vers 0', 'reste constant', 'devient négatif'], cols: 2, explain: 'C’est l’écart en FRÉQUENCE qui se resserre, pas l’écart en NOMBRE : sur 10 000 lancers on s’écarte typiquement d’une centaine de Pile, contre une unité sur 10 lancers. La loi ne parle que du quotient.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_loi-grands-nombres-2nde_P4', 'seconde_loi-grands-nombres-2nde_P5'] } },
  { id: 'lgn-e7', skill: 'loi', title: 'Conclure trop vite', prompt: 'Un élève lance une pièce 20 fois et obtient 13 Pile. Il en conclut qu’elle est truquée. Que penser ?', options: ['Conclusion prématurée : 20 lancers fluctuent beaucoup', 'Il a raison, 13 sur 20 est anormal', 'La pièce est sûrement truquée à 65 %', 'Il faut refaire exactement les mêmes 20 lancers'], cols: 1, explain: 'Sur 20 lancers, obtenir 13 Pile n’a rien d’extraordinaire : la fluctuation d’échantillonnage est énorme pour de si petites séries. Seule une longue série permettrait de soupçonner un truquage.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_loi-grands-nombres-2nde_P4', 'seconde_loi-grands-nombres-2nde_P7'] } },
  { id: 'lgn-e8', skill: 'modele', title: 'Une hypothèse, pas un théorème', prompt: '« Les six faces de ce dé réel sont équiprobables » est…', options: ['une hypothèse de modèle, réfutable par les données', 'un théorème de mathématiques', 'une conséquence de la loi des grands nombres', 'toujours vrai pour un dé à 6 faces'], cols: 1, explain: 'C’est une hypothèse posée sur un objet du monde, en général par symétrie. Un dé pipé la met en défaut — et seule une longue série de lancers permet de le montrer.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_loi-grands-nombres-2nde_P8', 'seconde_loi-grands-nombres-2nde_P7'] } },
  { id: 'lgn-e9', skill: 'modele', title: 'Lire un script', prompt: 'Dans un script qui simule 10 000 lancers de dé, la variable succes compte les 6 obtenus. Que vaut print(succes / 10000) ?', options: ['La fréquence observée des 6', 'Le nombre de 6', 'La probabilité théorique exacte', 'Le nombre de lancers'], cols: 1, explain: 'Diviser l’effectif des succès par le nombre de répétitions donne la fréquence observée — un nombre proche de 1/6, mais qui change à chaque exécution du programme.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_loi-grands-nombres-2nde_P9', 'seconde_loi-grands-nombres-2nde_P1'] } },
  { id: 'lgn-e10', skill: 'modele', title: 'Choisir la bonne série', prompt: 'On soupçonne un dé de favoriser le 6. Quelle démarche permet de trancher ?', options: ['Le lancer plusieurs milliers de fois et comparer la fréquence du 6 à 1/6', 'Le lancer 10 fois et regarder s’il y a des 6', 'Examiner sa couleur et son poids', 'Calculer la probabilité théorique du 6'], cols: 1, explain: 'Seule une grande série sépare un vrai déséquilibre de la fluctuation. Dix lancers ne prouvent rien, et le calcul théorique suppose justement ce qu’on veut vérifier.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_loi-grands-nombres-2nde_P7', 'seconde_loi-grands-nombres-2nde_P8'] } },
];
const SKILLS = {
  simuler: { label: 'Simuler et calculer', module: 1 },
  fluctuation: { label: 'Fluctuation', module: 2 },
  loi: { label: 'Ce que dit la loi', module: 3 },
  modele: { label: 'Modèle et réalité', module: 4 },
};
const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Fréquence juste', test: (m) => !m.simuler },
  { id: 'b2', emoji: '🏅', label: 'Fluctuation comprise', test: (m) => !m.fluctuation },
  { id: 'b3', emoji: '🏅', label: 'Sans loi des séries', test: (m) => !m.loi },
  { id: 'b4', emoji: '🏅', label: 'Esprit critique', test: (m) => !m.modele },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du grand nombre', test: (m) => Object.keys(m).length === 0 },
];

export default function Module06MissionFinaleLeGrandNombre() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6} lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le grand nombre" moduleSubtitle="Dix épreuves sur le hasard et la régularité"
      estimatedTime="10 min" timerSeconds={600} timerLabel="10 min" xpPerCorrect={10}
      brief={{ tag: 'Mission finale', title: 'Hasard ou régularité ?', tone: 'amber', body: <p>Dix questions, une seule validation. Réflexe : distinguer ce qui fluctue (la fréquence) de ce qui est fixé (la probabilité), et se méfier des séries courtes.</p> }}
      registre={[
        { id: 'r1', emoji: '🎲', label: 'probabilité', value: 'fixée par le modèle' },
        { id: 'r2', emoji: '📊', label: 'fréquence', value: 'succès ÷ répétitions' },
        { id: 'r3', emoji: '〰️', label: 'fluctuation', value: 'diminue quand n grandit' },
        { id: 'r4', emoji: '🚫', label: 'loi des séries', value: 'n’existe pas' },
      ]}
      skills={SKILLS} epreuves={EPREUVES} badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{ masterTitle: 'Maître du grand nombre !', title: 'Mission accomplie', message: 'Tu sais calculer une fréquence, décrire sa fluctuation, énoncer la loi des grands nombres sans lui faire dire ce qu’elle ne dit pas, et mettre un modèle à l’épreuve des données.', verbs: ['Simuler', 'Observer', 'Énoncer', 'Critiquer'], masterBadgeLabel: 'Maître du grand nombre' }} />
  );
}
