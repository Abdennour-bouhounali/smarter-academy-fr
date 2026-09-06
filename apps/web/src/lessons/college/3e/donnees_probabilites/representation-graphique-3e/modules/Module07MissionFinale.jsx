import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import CoordPlane from '../../../../../common/components/CoordPlane';
import TruncatedLine from '../components/TruncatedLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import { RESERVOIR, TEMPERATURE } from '../components/graphData';

/**
 * Module 7 — 🏆 MISSION FINALE : « Le bureau d'études ».
 *
 * Fichier de DONNÉES : dix épreuves QCM, silencieuses jusqu'à un unique envoi.
 * Écrites EN DERNIER, chaque distracteur reprenant un piège de la leçon :
 *   e1  axes intervertis (module 1)
 *   e2  échelle trop fine : des valeurs sortent du cadre (module 4)
 *   e3  lecture d'une valeur sur un axe gradué de 5 en 5 (module 2)
 *   e4  placement entre deux graduations, arrondi à tort (module 3)
 *   e5  construction : quel pas choisir (module 4)
 *   e6  forme de courbe ↔ situation (module 5)
 *   e7  courbe ↔ tableau (module 4)
 *   e8  courbe ↔ expression, signe du coefficient (module 5)
 *   e9  axe tronqué non signalé (modules 2 et 6)
 *   e10 échelle qui aplatit une variation réelle (module 6)
 *
 * Couverture des Learning Points : P1 (e1), P2 (e2, e5), P3 (e3), P4 (e4),
 * P5 (e5), P7 (e7), P6 (e6), P8 (e8), P9 (e6), P10 (e10), P11 (e9, e10).
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Le test final CONSOLIDE : chaque épreuve déclare en `requires` ce qu'elle
 *   exige, et n'exige rien que la leçon n'ait établi par une brique ou déclaré
 *   en `priorKnowledge`. Il n'introduit ni concept, ni mot, ni notation.
 *   La synthèse garde ses visuels et ses pièges ; la liste de définitions
 *   qu'elle recopiait est remplacée par la carte complète, source unique.
 */

const REGISTRE = [
  { id: 'axes', emoji: '📐', label: 'Axes', value: 'la cause en abscisse' },
  { id: 'echelle', emoji: '📏', label: 'Échelle', value: 'combien vaut un carreau' },
  { id: 'points', emoji: '📍', label: 'Points', value: 'même entre deux graduations' },
  { id: 'trace', emoji: '📈', label: 'Tracé', value: 'relier si c’est continu' },
];

const SKILLS = {
  axes: { label: 'Choisir et lire les axes', module: 1 },
  echelle: { label: "Comprendre le rôle de l'échelle", module: 2 },
  placer: { label: 'Placer un point', module: 3 },
  construire: { label: 'Construire un graphique', module: 4 },
  associer: { label: 'Associer les représentations', module: 5 },
  reparer: { label: 'Détecter un graphique trompeur', module: 6 },
};

const EPREUVES = [
  {
    id: 'rg-e1',
    requires: ['choix-des-axes', 'abscisse'],
    skill: 'axes',
    title: 'Épreuve 1',
    prompt: 'On représente la distance parcourue en fonction du temps. Quelle grandeur va sur l’axe horizontal ?',
    options: ['Le temps', 'La distance', 'Peu importe', 'Les deux à la fois'],
    cols: 2,
    correct: 0,
    explain: "L'axe horizontal porte la grandeur dont l'autre dépend. La distance dépend du temps écoulé, donc le temps va en abscisse — l'inverse raconterait l'histoire à l'envers.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_representation-graphique-3e_P1'] },
  },
  {
    id: 'rg-e2',
    requires: ['choisir-une-echelle', 'echelle-axe'],
    skill: 'echelle',
    title: 'Épreuve 2',
    prompt: 'Les valeurs vont jusqu’à 60. Le cadre fait 12 carreaux. Que se passe-t-il si un carreau vaut 2 ?',
    options: [
      'Les valeurs au-dessus de 24 sortent du cadre',
      'Le graphique est simplement plus précis',
      'Tout rentre, mais en plus petit',
      'L’échelle n’a aucune influence',
    ],
    cols: 1,
    correct: 0,
    explain: "12 carreaux à 2 unités font un cadre de 0 à 24. Tout ce qui dépasse 24 n'a pas de place : une échelle trop fine ne « zoome » pas, elle fait sortir les grandes valeurs.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_representation-graphique-3e_P2'] },
  },
  {
    id: 'rg-e3',
    requires: ['echelle-axe', 'placer-entre-graduations'],
    skill: 'echelle',
    title: 'Épreuve 3',
    prompt: 'Sur un axe gradué de 5 en 5, un point est placé deux carreaux et demi au-dessus de 0. Quelle valeur lit-on ?',
    options: ['12,5', '2,5', '25', '10'],
    cols: 2,
    correct: 0,
    explain: "Chaque carreau vaut 5, donc deux carreaux et demi valent 2,5 × 5 = 12,5. Lire un graphique commence toujours par lire ce que vaut un carreau.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_representation-graphique-3e_P3'] },
  },
  {
    id: 'rg-e4',
    requires: ['placer-entre-graduations', 'echelle-axe'],
    skill: 'placer',
    title: 'Épreuve 4',
    prompt: 'Un carreau vaut 10. Où placer la valeur 45 ?',
    options: [
      'Au milieu entre 40 et 50',
      'Sur la graduation 40',
      'Sur la graduation 50',
      'Elle ne peut pas être placée',
    ],
    cols: 1,
    correct: 0,
    explain: "45 tombe entre deux graduations : on place le point au milieu du carreau. Arrondir à la graduation la plus proche fausserait le graphique.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_representation-graphique-3e_P4'] },
  },
  {
    id: 'rg-e5',
    requires: ['choisir-une-echelle', 'echelle-qui-aplatit'],
    skill: 'construire',
    title: 'Épreuve 5',
    prompt: 'Un tableau contient les valeurs 8, 22, 35 et 48. Sur 12 carreaux, quel pas choisir ?',
    options: ['5 par carreau', '2 par carreau', '20 par carreau', '1 par carreau'],
    cols: 2,
    correct: 0,
    explain: "Avec 5 par carreau, le cadre va jusqu'à 60 : tout rentre sans écraser la courbe. Avec 2, le cadre s'arrête à 24 et 35 comme 48 sortent ; avec 20, le cadre monte à 240 et la courbe est aplatie.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_representation-graphique-3e_P5', '3e_representation-graphique-3e_P2'] },
  },
  {
    id: 'rg-e6',
    requires: ['forme-de-la-courbe', 'forme-et-situation'],
    skill: 'associer',
    title: 'Épreuve 6',
    prompt: 'Une courbe est une droite horizontale. Quelle situation décrit-elle ?',
    options: [
      'Un abonnement à prix fixe, quel que soit l’usage',
      'Un réservoir qui se vide',
      'Une épargne qui grossit',
      'Un taxi avec prise en charge',
    ],
    cols: 1,
    correct: 0,
    explain: "Une horizontale signifie que la grandeur ne change pas quand x augmente : elle est constante. Les trois autres situations donnent des courbes qui montent ou qui descendent.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_representation-graphique-3e_P6', '3e_representation-graphique-3e_P9'] },
  },
  {
    id: 'rg-e7',
    requires: ['ligne-devient-point', 'verifier-un-graphique'],
    skill: 'construire',
    title: 'Épreuve 7',
    prompt: 'Un tableau indique 30 L à 4 min, mais la courbe passe à 52 L à cet endroit. Que conclure ?',
    options: [
      'Le point a été mal placé sur le graphique',
      'Le tableau est faux',
      'L’échelle est mal choisie',
      'C’est normal, la courbe lisse les valeurs',
    ],
    cols: 1,
    correct: 0,
    explain: "Le graphique doit reproduire le tableau, ligne par ligne. Un écart entre les deux est une erreur de placement — une courbe ne « lisse » jamais les données qu'elle représente.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_representation-graphique-3e_P7'] },
  },
  {
    id: 'rg-e8',
    requires: ['forme-et-expression', 'forme-de-la-courbe', 'fonction-affine', 'coefficient-lineaire', 'ordonnee-origine'],
    skill: 'associer',
    title: 'Épreuve 8',
    prompt: 'Une droite part de 26 sur l’axe vertical et descend régulièrement. Quelle expression lui correspond ?',
    options: ['f(x) = −4x + 26', 'f(x) = 4x + 26', 'f(x) = 26x − 4', 'f(x) = −26x + 4'],
    cols: 2,
    correct: 0,
    explain: "Une droite qui descend a un coefficient négatif : a = −4. Son point de départ sur l'axe vertical donne b = 26. Le signe de a se lit dans le SENS de la droite.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_representation-graphique-3e_P8'] },
  },
  {
    id: 'rg-e9',
    requires: ['axe-tronque', 'echelle-axe', 'verifier-un-graphique'],
    skill: 'reparer',
    title: 'Épreuve 9',
    prompt: 'Un graphique montre des températures de 17,5 à 19,5 °C sur un axe partant de 17. La courbe grimpe d’un bord à l’autre. Que penser ?',
    options: [
      'L’axe tronqué exagère une variation de 2 °C seulement',
      'La salle a vraiment beaucoup chauffé',
      'Les points sont mal placés',
      'Le graphique est parfaitement neutre',
    ],
    cols: 1,
    correct: 0,
    explain: "Aucun nombre n'est faux : c'est le choix de l'axe qui trompe. Sur un axe partant de 0, la même courbe serait presque plate. Un axe tronqué n'est pas interdit, mais il doit être signalé.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_representation-graphique-3e_P11'] },
  },
  {
    id: 'rg-e10',
    requires: ['echelle-qui-aplatit', 'choisir-une-echelle', 'verifier-un-graphique'],
    skill: 'reparer',
    title: 'Épreuve 10',
    prompt: 'Des valeurs autour de 19 sont tracées sur un axe montant jusqu’à 240, partant de 0. Le résultat paraît plat. Est-ce correct ?',
    options: [
      'Non : partir de 0 ne suffit pas, l’échelle doit être adaptée aux données',
      'Oui : partir de 0 est toujours la bonne méthode',
      'Non : l’axe est tronqué',
      'Oui, mais il faudrait relier les points',
    ],
    cols: 1,
    correct: 0,
    explain: "L'axe part bien de 0 et aucun nombre n'est faux, pourtant la variation devient invisible. Une échelle doit être choisie en fonction de l'étendue des données : trop grande, elle cache ce qu'on veut montrer.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_representation-graphique-3e_P10', '3e_representation-graphique-3e_P11'] },
  },
];

const BADGES = [
  { id: 'axes', emoji: '🏅', label: 'Maître des axes', test: (s) => (s.axes ?? 0) === 0 },
  { id: 'echelle', emoji: '🏅', label: 'Juge de l’échelle', test: (s) => (s.echelle ?? 0) === 0 },
  { id: 'placer', emoji: '🏅', label: 'Main sûre', test: (s) => (s.placer ?? 0) === 0 },
  { id: 'construire', emoji: '🏅', label: 'Constructeur', test: (s) => (s.construire ?? 0) === 0 },
  { id: 'associer', emoji: '🏅', label: 'Lecteur de formes', test: (s) => (s.associer ?? 0) === 0 },
  { id: 'reparer', emoji: '🏅', label: 'Détecteur de pièges', test: (s) => (s.reparer ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Sans faute', test: (s) => Object.values(s).every((v) => v === 0) },
];

const PIEGES = [
  { wrong: 'On place les points, puis on choisit l’échelle', right: 'L’échelle d’abord : sinon les valeurs sortent du cadre' },
  { wrong: 'Une valeur entre deux graduations s’arrondit', right: 'Elle se place entre les deux, au bon endroit du carreau' },
  { wrong: 'On relie toujours les points', right: 'Seulement si la grandeur varie continûment' },
  { wrong: 'Des nombres exacts font un graphique honnête', right: 'L’axe et l’échelle peuvent tromper sans fausser un seul nombre' },
  { wrong: 'Partir de 0 suffit à être neutre', right: 'Une échelle trop grande aplatit une variation réelle' },
];

const SYN_RANGE = { xMin: 0, xMax: 8, yMin: 0, yMax: 72 };

/** Synthèse : le même réservoir, bien construit — et le même mal construit. */
function Synthese() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-900 text-white p-4 text-center space-y-1">
        <p className="text-2xl">📐 📏 📍 📈</p>
        <p className="font-bold">Quatre décisions font un graphique</p>
        <p className="text-slate-300 text-sm">
          Les axes · l’échelle · les points · le tracé.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-emerald-700 text-center">✅ Bien construit</p>
          <CoordPlane
            range={SYN_RANGE}
            unit={26}
            unitY={312 / (SYN_RANGE.yMax - SYN_RANGE.yMin)}
            xStep={1}
            yStep={12}
            curves={[{ id: 'ok', points: RESERVOIR.rows, tone: 'emerald' }]}
            points={RESERVOIR.rows.map((r, i) => ({ id: `s${i}`, x: r.x, y: r.y, color: '#059669' }))}
            axisLabels={{ x: 'min', y: 'L' }}
            frozen
            caption={false}
            ariaLabel="Synthèse : le réservoir correctement représenté"
          />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-rose-700 text-center">❌ Axe tronqué</p>
          <TruncatedLine
            rows={TEMPERATURE.rows}
            base={17}
            top={20}
            step={0.5}
            xLabel="h"
            yLabel="°C"
            ariaLabel="Synthèse : le même relevé avec un axe tronqué"
          />
        </div>
      </div>

      <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4">
        <p className="font-bold text-rose-800 mb-2">Les pièges déjoués</p>
        <ul className="space-y-1.5 text-sm">
          {PIEGES.map((p) => (
            <li key={p.wrong} className="text-slate-700">
              <span className="text-rose-600">❌ {p.wrong}</span>
              <br />
              <span className="text-emerald-700">✅ {p.right}</span>
            </li>
          ))}
        </ul>
      </div>

      <Feedback tone="info">
        Un graphique ne se subit pas : il se construit, et il se vérifie. Les mêmes nombres
        peuvent donner une image honnête ou trompeuse — c’est le constructeur qui décide.
      </Feedback>

      {/* Les connaissances elles-mêmes : la carte complète, source unique. */}
      <KnowledgeSnapshot variant="complete" complete />
    </div>
  );
}

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le bureau d’études"
      moduleSubtitle="Dix épreuves où chaque graphique doit dire la vérité."
      estimatedTime="13 min"
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Dix graphiques à valider',
        tone: 'amber',
        body: (
          <p>
            Aucune correction avant la fin : réponds aux dix épreuves, puis valide en une
            fois. Tu verras ensuite ton profil et la synthèse.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Chef du bureau d’études !',
        title: 'Dossier validé !',
        message: (
          <>
            Du réservoir jusqu’aux graphiques trompeurs, tu as choisi les axes, réglé
            l’échelle, posé les points entre les graduations — et repéré ceux qui mentent
            sans jamais fausser un chiffre.
          </>
        ),
        verbs: ['Choisir', 'Graduer', 'Placer', 'Vérifier'],
        masterBadgeLabel: 'Badge « Chef du bureau d’études » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
