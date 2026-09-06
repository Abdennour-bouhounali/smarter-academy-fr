import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import BarChart from '../components/BarChart';
import LineChart from '../components/LineChart';
import PieChart from '../components/PieChart';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import { METEO, CDI, SONDAGE, JOURS } from '../components/meteoData';
import { makeSeries, maxIndex, minIndex } from '../components/chartUtils';

/**
 * Module 7 — Boss Final (moteur du kit, QCM uniquement). Fichier de DONNÉES.
 *
 * Épreuves écrites EN DERNIER : chaque distracteur encode un piège
 * réellement travaillé dans les modules 1 à 6 —
 *   · lire une barre sans regarder l'axe (M2)
 *   · confondre valeur haute et forte hausse (M5)
 *   · croire qu'une baisse n'en est pas une quand la valeur reste grande (M5)
 *   · comparer des hauteurs sur un axe tronqué (M6)
 *   · additionner au lieu de soustraire pour un écart (M4)
 *   · faire dire au graphique ce qui n'y est pas mesuré (M5)
 *
 * Couverture des 10 LPs : P1 (e1), P2 (e2), P3 (e3), P4 (e4), P5 (e5),
 * P6 (e6), P7 (e7), P8 (e8), P9 (e9), P10 (e10).
 */
const REGISTRE = [
  { id: 'station', emoji: '🌡️', label: 'Station', value: 'collège' },
  { id: 'jours', emoji: '📅', label: 'Relevés', value: '5 jours' },
  { id: 'unite', emoji: '📏', label: 'Unité', value: '°C' },
  { id: 'axe', emoji: '⚠️', label: 'Vérifier', value: "l'axe" },
];

const SKILLS = {
  interet: { label: "L'intérêt d'un graphique", module: 1 },
  anatomie: { label: 'Les éléments et la lecture', module: 2 },
  lien: { label: 'Tableau ↔ graphique', module: 3 },
  comparer: { label: 'Comparer et repérer les extrêmes', module: 4 },
  evolution: { label: 'Hausses et baisses', module: 5 },
  critique: { label: 'Détecter un graphique faux', module: 6 },
};

const I_HOT = maxIndex(METEO);   // 3 jeudi 24
const I_COLD = minIndex(METEO);  // 1 mardi 11

const SPORT = makeSeries({
  categories: ['Lun', 'Mar', 'Mer', 'Jeu'],
  values: [20, 35, 30, 45],
  unit: 'élèves',
  label: 'Inscrits au tournoi',
});

const TRUQUE = makeSeries({
  categories: ['Collège A', 'Collège B'],
  values: [82, 84],
  unit: null,
  label: 'Réussite',
});

const EPREUVES = [
  {
    id: 'gr-e1',
    requires: ['graphique-outil'],
    skill: 'interet',
    title: 'Épreuve 1',
    prompt: 'Le bulletin météo du collège doit montrer l’allure de la semaine. Qu’apporte un graphique qu’un tableau apporte moins bien ?',
    options: [
      'Des valeurs plus précises',
      'La comparaison et l’allure générale, visibles d’un coup d’œil',
      'Moins de nombres à écrire',
    ],
    cols: 1,
    correct: 1,
    explain: 'Un graphique est moins précis qu’un tableau pour lire une valeur exacte — mais il rend les comparaisons et la forme d’ensemble immédiates.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_graphiques_P1'] },
  },
  {
    id: 'gr-e2',
    requires: ['axe-gradue'],
    skill: 'anatomie',
    title: 'Épreuve 2',
    prompt: 'On te montre des barres sans axe gradué ni unité. Que peux-tu en faire ?',
    options: [
      'Lire la valeur de chaque barre',
      'Seulement comparer les hauteurs entre elles',
      'Rien du tout, pas même comparer',
    ],
    cols: 1,
    correct: 1,
    explain: 'Sans graduations, aucune valeur n’est lisible — mais on voit toujours quelle barre est la plus haute. Comparer, oui ; mesurer, non.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_graphiques_P2'] },
  },
  {
    id: 'gr-e3',
    requires: ['lire-hauteur', 'echelle-axe'],
    skill: 'anatomie',
    title: 'Épreuve 3',
    prompt: 'Quelle température a-t-on relevée le mercredi ?',
    extra: <BarChart series={METEO} title="Température à midi (°C)" axisLabel="°C" tone="amber" />,
    options: ['11 °C', '17 °C', '24 °C'],
    cols: 3,
    correct: 1,
    explain: 'La barre du mercredi s’arrête à 17 °C. (11 °C est le mardi, 24 °C le jeudi.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_graphiques_P3'] },
  },
  {
    id: 'gr-e4',
    requires: ['hauteur-est-nombre'],
    skill: 'lien',
    title: 'Épreuve 4',
    prompt: 'Un tableau annonce « Mardi : 45 élèves » mais la barre du mardi s’arrête à 25. Que faut-il en conclure ?',
    options: [
      'Le graphique ne correspond pas au tableau : il est faux',
      'Le graphique a raison, le tableau se trompe forcément',
      'Les deux peuvent être justes : ce sont deux dessins différents',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un graphique est une autre écriture des mêmes nombres : la hauteur DOIT correspondre à la donnée. Si les deux se contredisent, la représentation est fautive.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_graphiques_P4'] },
  },
  {
    id: 'gr-e5',
    requires: ['hauteur-est-nombre', 'lire-hauteur', 'echelle-axe'],
    skill: 'lien',
    title: 'Épreuve 5',
    prompt: 'Tu construis le diagramme du tournoi à partir du tableau : Lun 20, Mar 35, Mer 30, Jeu 45. Jusqu’où monte la barre du mercredi ?',
    extra: <BarChart series={SPORT} step={10} title="Inscrits au tournoi" axisLabel="élèves" tone="amber" />,
    options: ['Jusqu’à la graduation 30', 'Jusqu’à 35', 'Jusqu’à 45'],
    cols: 1,
    correct: 0,
    explain: 'Construire un graphique, c’est traduire chaque nombre en hauteur : la barre du mercredi s’arrête pile sur la graduation 30. (35 est le mardi, 45 le jeudi.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_graphiques_P5'] },
  },
  {
    id: 'gr-e6',
    requires: ['ecart-chiffre', 'lire-hauteur'],
    skill: 'comparer',
    title: 'Épreuve 6',
    prompt: 'Combien d’élèves de plus au CDI le mardi que le mercredi ?',
    extra: <BarChart series={CDI} step={10} title="Élèves au CDI" axisLabel="élèves" tone="amber" />,
    options: ['30 élèves', '60 élèves', '15 élèves'],
    cols: 3,
    correct: 0,
    explain: 'Mardi 45, mercredi 15 : l’écart vaut 45 − 15 = 30. (60, c’est leur somme — un écart se soustrait.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_graphiques_P6'] },
  },
  {
    id: 'gr-e7',
    requires: ['maximum-minimum'],
    skill: 'comparer',
    title: 'Épreuve 7',
    prompt: 'Quel jour a-t-il fait le plus froid ?',
    extra: <BarChart series={METEO} title="Température à midi (°C)" axisLabel="°C" tone="amber" highlightMin={false} />,
    options: JOURS,
    cols: 5,
    correct: I_COLD,
    explain: 'Le mardi, avec 11 °C : c’est la barre la plus courte. Le minimum se repère à la hauteur, sans lire les nombres.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_graphiques_P7'] },
  },
  {
    id: 'gr-e8',
    requires: ['evolution-hausse-baisse', 'ecart-chiffre'],
    skill: 'evolution',
    title: 'Épreuve 8',
    prompt: 'Du jeudi au vendredi, la température passe de 24 °C à 20 °C. Comment décrire ce passage ?',
    extra: <LineChart series={METEO} title="Température à midi (°C)" axisLabel="°C" colorByVariation />,
    options: [
      'Une hausse, car 20 °C reste une température élevée',
      'Une baisse de 4 °C',
      'Aucun changement notable',
    ],
    cols: 1,
    correct: 1,
    explain: 'On compare toujours à la valeur précédente : 20 est inférieur à 24, donc c’est une baisse de 4 °C — même si 20 °C reste agréable.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_graphiques_P8'] },
  },
  {
    id: 'gr-e9',
    requires: ['hauteur-vs-pente', 'maximum-minimum', 'evolution-hausse-baisse'],
    skill: 'evolution',
    title: 'Épreuve 9',
    prompt: 'Le jeudi est le jour le plus chaud. Est-ce aussi là qu’a eu lieu la plus forte hausse ?',
    extra: <LineChart series={METEO} title="Température à midi (°C)" axisLabel="°C" colorByVariation />,
    options: [
      'Oui : la plus forte hausse est bien celle qui mène au jeudi (+7)',
      'Non : la valeur la plus haute n’a jamais de rapport avec la hausse',
      'Impossible à savoir sur ce graphique',
    ],
    cols: 1,
    correct: 0,
    explain: 'Ici les deux coïncident : la montée mercredi → jeudi vaut +7, la plus forte de la semaine. Mais ce sont bien deux lectures différentes — la hauteur d’un point d’un côté, la pente d’un segment de l’autre : elles peuvent parfaitement tomber sur des jours différents.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_graphiques_P9'] },
  },
  {
    id: 'gr-e10',
    requires: ['axe-tronque', 'echelle-axe', 'mem-verifier-graphique'],
    skill: 'critique',
    title: 'Épreuve 10',
    prompt: 'Une affiche compare deux collèges (82 % et 84 % de réussite) sur un axe qui démarre à 80. Que faut-il en penser ?',
    extra: (
      <BarChart series={TRUQUE} step={2} zeroBased={false} baseValue={80} title="Réussite (%) — axe démarrant à 80" tone="rose" />
    ),
    options: [
      'Le collège B est deux fois meilleur',
      'L’écart réel est de 2 points : l’axe tronqué exagère la différence',
      'Le graphique est faux car les nombres sont inventés',
    ],
    cols: 1,
    correct: 1,
    explain: 'Les deux nombres sont exacts, mais l’axe ne part pas de zéro : il n’affiche qu’une mince tranche, ce qui transforme 2 points d’écart en montagne. Toujours vérifier le bas de l’axe avant de comparer des hauteurs.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_graphiques_P10'] },
  },
];

const BADGES = [
  { id: 'lecteur', emoji: '🏅', label: 'Lecteur d’axes', test: (s) => (s.anatomie ?? 0) === 0 },
  { id: 'traducteur', emoji: '🏅', label: 'Traducteur tableau ↔ graphique', test: (s) => (s.lien ?? 0) === 0 },
  { id: 'comparateur', emoji: '🏅', label: 'Œil comparateur', test: (s) => (s.comparer ?? 0) === 0 },
  { id: 'suiveur', emoji: '🏅', label: 'Suiveur de courbes', test: (s) => (s.evolution ?? 0) === 0 },
  { id: 'detective', emoji: '🏅', label: 'Détecteur de trucages', test: (s) => (s.critique ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Météorologue en chef', test: (s) => Object.values(s).every((v) => v === 0) },
];

function Synthese() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-3 text-center">
        <div className="text-2xl" aria-hidden="true">📊</div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
          Un graphique ne remplace pas les nombres : il les redit en hauteurs. C'est ce qui rend la
          comparaison immédiate — et c'est aussi ce qui permet de tromper, si l'axe est truqué.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 space-y-3">
        <p className="text-sm font-semibold text-slate-700 text-center">La semaine de la station météo</p>
        <BarChart series={METEO} title="En barres : comparer" axisLabel="°C" tone="emerald" highlightMax highlightMin />
        <LineChart series={METEO} title="En courbe : suivre l’évolution" axisLabel="°C" colorByVariation />
        <p className="text-center text-xs text-slate-500">
          Maximum jeudi (24 °C), minimum mardi (11 °C), plus forte hausse mercredi → jeudi (+7 °C).
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4">
        <PieChart series={SONDAGE} title="Et pour des parts d’un tout : le camembert" />
      </div>

      {/* La carte complète REMPLACE les deux bandeaux recopiés à la main
          (« À retenir » et « les pièges à éviter ») : une leçon n'a qu'une
          source de connaissances (docs/architecture/KNOWLEDGE_MAP.md). */}
      <KnowledgeSnapshot complete variant="complete" />

      <Feedback tone="info">
        Tu sais lire une image de données — et repérer celles qui mentent. Prochaine étape : quand deux
        grandeurs varient ensemble, la proportionnalité.
      </Feedback>
    </div>
  );
}

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : la station météo"
      moduleSubtitle="Dix épreuves pour publier le bulletin du collège."
      estimatedTime="13 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Le bulletin part à l’impression. Vérifie tout.',
        tone: 'amber',
        body: (
          <p>
            Lire une hauteur, traduire un tableau, repérer un maximum, suivre une évolution et démasquer un
            axe truqué. Réponds à toutes les épreuves, puis valide pour voir ta correction et tes badges.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Météorologue en chef !',
        title: 'Bulletin publié !',
        message: (
          <>
            Du tableau illisible au bulletin vérifié, tu as construit, lu, comparé, suivi et critiqué des
            graphiques — sans te laisser avoir par un axe tronqué.
          </>
        ),
        verbs: ['Construire', 'Lire', 'Comparer', 'Vérifier'],
        masterBadgeLabel: 'Badge « Météorologue en chef » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
