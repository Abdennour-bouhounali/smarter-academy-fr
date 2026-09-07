import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 6 — ÉVALUATION. Distracteurs : rectangle confondu avec min–max (e2),
 * zone large prise pour zone peuplée (e4), étendue confondue avec écart
 * interquartile (e5), conclusion tirée d'une seule médiane (e7, e9), boîtes
 * comparées sans axe commun (e8). Les 9 LPs sont couverts.
 */
const EPREUVES = [
  { id: 'bm-e1', skill: 'lire', title: 'Les cinq nombres', prompt: 'Quels sont les cinq nombres d’une boîte à moustaches, dans l’ordre ?', options: ['minimum, Q1, médiane, Q3, maximum', 'minimum, moyenne, médiane, écart type, maximum', 'Q1, Q2, Q3, Q4, Q5', 'minimum, médiane, moyenne, Q3, maximum'], cols: 1, explain: 'Le résumé des cinq nombres n’utilise ni la moyenne ni l’écart type : minimum, Q1, médiane, Q3, maximum.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_boites-a-moustaches-2nde_P1'] } },
  { id: 'bm-e2', skill: 'lire', title: 'Le rectangle', prompt: 'Les extrémités du rectangle d’une boîte à moustaches correspondent à…', options: ['Q1 et Q3', 'au minimum et au maximum', 'à la médiane et à la moyenne', 'aux 10 % et 90 % de l’effectif'], cols: 2, explain: 'Le rectangle va de Q1 à Q3 : il couvre la moitié centrale de l’effectif. Ce sont les moustaches qui atteignent les extrêmes.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_boites-a-moustaches-2nde_P2'] } },
  { id: 'bm-e3', skill: 'lire', title: 'L’étendue', prompt: 'Une boîte donne : min 6, Q1 13, médiane 17,5, Q3 25, max 35. Quelle est l’étendue ?', options: ['29', '12', '17,5', '35'], cols: 4, explain: 'Étendue = maximum − minimum = 35 − 6 = 29. La valeur 12 est l’écart interquartile (25 − 13).', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_boites-a-moustaches-2nde_P3'] } },
  { id: 'bm-e4', skill: 'zones', title: 'Une zone large', prompt: 'La moustache droite d’une boîte est deux fois plus longue que la gauche. Que peut-on en conclure ?', options: ['Le quart supérieur des valeurs est plus étalé que le quart inférieur', 'Il y a deux fois plus d’individus à droite', 'La médiane est mal placée', 'La série compte deux fois plus de valeurs élevées'], cols: 1, explain: 'Chaque zone contient environ 25 % de l’effectif, quelle que soit sa longueur. Une zone plus longue signifie des valeurs plus dispersées, jamais plus nombreuses.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_boites-a-moustaches-2nde_P4'] } },
  { id: 'bm-e5', skill: 'zones', title: 'Écart interquartile', prompt: 'Sur la même boîte (min 6, Q1 13, médiane 17,5, Q3 25, max 35), quel est l’écart interquartile ?', options: ['12', '29', '7,5', '18,5'], cols: 4, explain: 'Q3 − Q1 = 25 − 13 = 12 : c’est la largeur du rectangle, pas celle de la figure entière.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_boites-a-moustaches-2nde_P4', 'seconde_boites-a-moustaches-2nde_P3'] } },
  { id: 'bm-e6', skill: 'comparer', title: 'Comparer des médianes', prompt: 'Deux boîtes sur un même axe : A a une médiane de 24, B de 17,5. Que peut-on dire ?', options: ['La valeur centrale de A est plus élevée que celle de B', 'Toutes les valeurs de A dépassent celles de B', 'A a plus d’individus que B', 'A est plus dispersée que B'], cols: 1, explain: 'La médiane compare les POSITIONS centrales. Elle ne dit rien des extrêmes, des effectifs ni de la dispersion.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_boites-a-moustaches-2nde_P6'] } },
  { id: 'bm-e7', skill: 'comparer', title: 'Médiane basse, maximum haut', prompt: 'La ville C a la médiane la plus BASSE des trois, mais le maximum le plus HAUT. Est-ce possible ?', options: ['Oui : une médiane basse n’empêche pas des valeurs extrêmes élevées', 'Non : c’est contradictoire', 'Oui, mais seulement si les effectifs diffèrent', 'Non, sauf erreur de tracé'], cols: 2, explain: 'C’est exactement le cas d’une série très dispersée : la moitié des valeurs est basse, mais la moustache droite s’étire loin. Médiane et maximum sont deux informations indépendantes.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_boites-a-moustaches-2nde_P5', 'seconde_boites-a-moustaches-2nde_P6'] } },
  { id: 'bm-e8', skill: 'comparer', title: 'L’axe commun', prompt: 'Pourquoi faut-il dessiner les boîtes à comparer sur un axe COMMUN ?', options: ['Sinon chaque boîte occupe toute la largeur et les tailles ne sont plus comparables', 'Pour économiser de la place', 'Parce que c’est la convention d’écriture', 'Pour que les médianes soient alignées'], cols: 1, explain: 'À échelles séparées, une série très resserrée et une série très étalée occupent la même largeur : la comparaison visuelle devient trompeuse.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_boites-a-moustaches-2nde_P5', 'seconde_boites-a-moustaches-2nde_P7'] } },
  { id: 'bm-e9', skill: 'choisir', title: 'Choisir l’indicateur', prompt: 'On cherche la machine dont les pièces sont les plus RÉGULIÈRES. Quel indicateur regarder ?', options: ['L’écart interquartile (ou l’étendue) : le plus faible', 'La médiane la plus haute', 'Le maximum le plus élevé', 'Le minimum le plus bas'], cols: 1, explain: 'La régularité est une question de dispersion : c’est la largeur de la boîte et la longueur des moustaches qui répondent, pas la position.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_boites-a-moustaches-2nde_P8', 'seconde_boites-a-moustaches-2nde_P7'] } },
  { id: 'bm-e10', skill: 'choisir', title: 'Interpréter en contexte', prompt: 'Deux serveurs ont des médianes quasi identiques (200 et 210 ms), mais A monte à 900 ms quand B plafonne à 320 ms. Que conclure ?', options: ['B est préférable : ses temps de réponse restent contenus, malgré une médiane légèrement plus haute', 'A est préférable : sa médiane est plus basse', 'Les deux se valent : les médianes sont proches', 'On ne peut pas conclure sans la moyenne'], cols: 1, explain: 'Un écart de 10 ms sur la médiane est négligeable ; une queue à 900 ms ne l’est pas. En contexte, ce sont les requêtes lentes qui dégradent le service.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_boites-a-moustaches-2nde_P9'] } },
];
const SKILLS = {
  lire: { label: 'Lire une boîte', module: 1 },
  zones: { label: 'Ce que disent les zones', module: 2 },
  comparer: { label: 'Comparer des distributions', module: 3 },
  choisir: { label: 'Choisir l’indicateur', module: 4 },
};
const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Les cinq nombres', test: (m) => !m.lire },
  { id: 'b2', emoji: '🏅', label: 'Large ≠ nombreux', test: (m) => !m.zones },
  { id: 'b3', emoji: '🏅', label: 'L’axe commun', test: (m) => !m.comparer },
  { id: 'b4', emoji: '🏅', label: 'Le bon indicateur', test: (m) => !m.choisir },
  { id: 'b-parfait', emoji: '💎', label: 'Lecteur de boîtes', test: (m) => Object.keys(m).length === 0 },
];

export default function Module06MissionFinaleLesCinqNombres() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6} lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : les cinq nombres" moduleSubtitle="Dix épreuves sur les boîtes à moustaches"
      estimatedTime="5 min" timerSeconds={600} timerLabel="10 min" xpPerCorrect={10}
      brief={{ tag: 'Mission finale', title: 'Lire et comparer', tone: 'amber', body: <p>Dix questions, une seule validation. Réflexe : le rectangle va de Q1 à Q3, chaque zone vaut un quart de l’effectif, et une comparaison exige un axe commun.</p> }}
      registre={[
        { id: 'r1', emoji: '📦', label: 'rectangle', value: 'Q1 → Q3' },
        { id: 'r2', emoji: '🟩', label: 'trait', value: 'la médiane' },
        { id: 'r3', emoji: '〰️', label: 'moustaches', value: 'min et max' },
        { id: 'r4', emoji: '¼', label: 'chaque zone', value: '25 % de l’effectif' },
      ]}
      skills={SKILLS} epreuves={EPREUVES} badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{ masterTitle: 'Lecteur de boîtes !', title: 'Mission accomplie', message: 'Tu construis une boîte à moustaches, tu sais ce que dit chaque zone, et tu compares plusieurs distributions sans te faire piéger.', verbs: ['Résumer', 'Construire', 'Lire', 'Comparer'], masterBadgeLabel: 'Lecteur de boîtes' }} />
  );
}
