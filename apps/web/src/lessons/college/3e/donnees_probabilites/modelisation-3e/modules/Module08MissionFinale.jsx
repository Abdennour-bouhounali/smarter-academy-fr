import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import ModelTester from '../components/ModelTester';
import ModelViews from '../components/ModelViews';
import { TROTTINETTE as T } from '../components/situationsData';

/**
 * Module 8 — 🏆 MISSION FINALE : « Le bureau d'études ».
 *
 * Fichier de DONNÉES : dix épreuves QCM, silencieuses jusqu'à un unique envoi.
 * Écrites EN DERNIER, chaque distracteur reprenant un piège de la leçon :
 *   e1  donnée décorative prise pour utile (module 1)
 *   e2  variable et grandeur dépendante inversées (module 2)
 *   e3  représentation inadaptée à la question (module 2)
 *   e4  relation additive au lieu de multiplicative (module 5)
 *   e5  tableau : colonne calculée sans la part fixe (module 3)
 *   e6  forme du graphique : « par O » pour un affine (module 3)
 *   e7  paramètre lu sans son sens (module 5)
 *   e8  proportionnel choisi malgré la part fixe (module 4)
 *   e9  prévision sans le déblocage (module 1)
 *   e10 extrapolation hors domaine (module 6)
 *
 * Couverture des Learning Points : P1 (e1), P2 (e2), P3 (e3), P4 (e4), P5 (e5),
 * P6 (e6), P7 (e7), P8 (e8), P9 (e8), P10 (e9), P11 (e10), P12 (e10).
 *
 * `requires` déclare, épreuve par épreuve, ce que le test consolide : rien qui
 * ne soit posé par une brique des modules 1 à 7 ou par `priorKnowledge`. Le
 * test final n'introduit ni concept, ni mot, ni notation.
 */

const REGISTRE = [
  { id: 'cycle', emoji: '🔁', label: 'Le cycle', value: 'situation → modèle → retour' },
  { id: 'data', emoji: '🎫', label: 'Les données', value: 'toutes, pas une' },
  { id: 'trois', emoji: '📋📈🔤', label: 'Trois vues', value: 'tableau · graphique · expression' },
  { id: 'limite', emoji: '🚧', label: 'Limites', value: 'domaine, plafond, sens' },
];

const SKILLS = {
  trier: { label: 'Informations, grandeurs, représentation', module: 2 },
  traduire: { label: 'Traduire en relation', module: 5 },
  representer: { label: 'Tableau et graphique', module: 3 },
  choisir: { label: 'Choisir le modèle', module: 4 },
  prevoir: { label: 'Prévoir et interpréter', module: 6 },
};

const EPREUVES = [
  {
    id: 'mo-e1', skill: 'trier', title: 'Épreuve 1',
    prompt: 'Pour calculer le prix d’un trajet en trottinette (1 € de déblocage + 0,15 €/min), quelle information est inutile ?',
    options: ['L’autonomie : 25 km', 'Le déblocage : 1 €', 'Le tarif : 0,15 € par minute', 'La durée du trajet'],
    cols: 1, correct: 0,
    explain: 'Le prix dépend de la durée, du déblocage et du tarif par minute. L’autonomie ne change pas d’un trajet à l’autre : elle n’entre pas dans le modèle.',
    requires: ['informations-utiles'],
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_modelisation-3e_P1'] },
  },
  {
    id: 'mo-e2', skill: 'trier', title: 'Épreuve 2',
    prompt: 'Un tuyau verse 12 L par minute dans une piscine. Quelle grandeur est la variable, et laquelle en dépend ?',
    options: ['Variable : la durée · dépend : le volume d’eau', 'Variable : le volume d’eau · dépend : la durée', 'Variable : le débit · dépend : la durée', 'Variable : la surface du jardin · dépend : le volume'],
    cols: 1, correct: 0,
    explain: 'On choisit le moment (la durée t) ; le volume en découle : V = 12t. Le débit est un paramètre fixe, pas une variable.',
    requires: ['variable-modele'],
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_modelisation-3e_P2'] },
  },
  {
    id: 'mo-e3', skill: 'trier', title: 'Épreuve 3',
    prompt: 'Question : « à partir de combien de personnes la salle devient-elle moins chère que le traiteur ? ». Quelle représentation répond le mieux ?',
    options: ['Le graphique des deux modèles, où les droites se croisent', 'Le tableau pour n = 45 seulement', 'La liste des devis', 'Le prix pour une personne'],
    cols: 1, correct: 0,
    explain: 'Un « à partir de quand » est un croisement : le graphique le montre (puis le calcul le précise). Une valeur isolée ne répond pas à une question de seuil.',
    requires: ['choisir-representation', 'seuil-deux-modeles'],
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_modelisation-3e_P3'] },
  },
  {
    id: 'mo-e4', skill: 'traduire', title: 'Épreuve 4',
    prompt: '« 6 € par mois, plus 3 € par film loué. » Quelle relation donne la facture F pour n films ?',
    options: ['F = 6 + 3n', 'F = 9n', 'F = 6n + 3', 'F = 6 + 3 + n'],
    cols: 2, correct: 0,
    explain: 'Une part fixe (6) et un coût par film (3 × n) : F = 6 + 3n. « 9n » additionne à tort le fixe et le tarif par film.',
    requires: ['expression-du-modele', 'sens-des-parametres'],
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_modelisation-3e_P4'] },
  },
  {
    id: 'mo-e5', skill: 'representer', title: 'Épreuve 5',
    prompt: 'Réservoir : volume = 60 − 5t. Quelle ligne du tableau est correcte ?',
    options: ['t = 4 → 40 L', 't = 4 → 20 L', 't = 4 → 55 L', 't = 4 → 64 L'],
    cols: 2, correct: 0,
    explain: '60 − 5 × 4 = 60 − 20 = 40 L. Chaque colonne du tableau est un calcul complet de la règle — avec la part fixe.',
    requires: ['tableau-de-valeurs', 'expression-du-modele'],
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_modelisation-3e_P5'] },
  },
  {
    id: 'mo-e6', skill: 'representer', title: 'Épreuve 6',
    prompt: 'On place les points du tableau de prix = 0,15t + 1. Quelle forme obtient-on ?',
    options: ['Des points alignés sur une droite qui ne passe pas par l’origine', 'Des points alignés sur une droite qui passe par l’origine', 'Une courbe qui monte de plus en plus vite', 'Des points sans forme particulière'],
    cols: 1, correct: 0,
    explain: 'Modèle affine avec b = 1 : droite, mais 0 min → 1 €, donc pas par l’origine. Une droite par O signerait un modèle proportionnel.',
    requires: ['representation-graphique', 'familles-modeles'],
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_modelisation-3e_P6'] },
  },
  {
    id: 'mo-e7', skill: 'traduire', title: 'Épreuve 7',
    prompt: 'Dans prix = 0,15 × t + 1, que représente 0,15 ?',
    options: ['Le prix d’une minute de trajet', 'Le prix du trajet', 'Le déblocage', 'La durée minimale'],
    cols: 2, correct: 0,
    explain: 'Le coefficient de t est ce qui s’ajoute pour CHAQUE minute : 0,15 € par minute. Le 1 est le déblocage, payé même pour 0 minute.',
    requires: ['sens-des-parametres'],
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_modelisation-3e_P7'] },
  },
  {
    id: 'mo-e8', skill: 'choisir', title: 'Épreuve 8',
    prompt: 'Un forfait donne : 0 Go → 5 €, 2 Go → 9 €, 5 Go → 15 €. Quel modèle convient ?',
    options: ['f(x) = 2x + 5 : affine, à cause des 5 € pour 0 Go', 'f(x) = 3x : proportionnel', 'f(x) = 4,5x : proportionnel', 'Aucun modèle simple'],
    cols: 1, correct: 0,
    explain: 'Le point (0 ; 5) exclut tout modèle proportionnel. f(x) = 2x + 5 est d’accord avec les TROIS points : 5, 9, 15. Un modèle doit coller à toutes les données.',
    requires: ['modele-choisi-par-donnees', 'familles-modeles', 'mem-toutes-les-donnees', 'notation-fx'],
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_modelisation-3e_P8', '3e_modelisation-3e_P9'] },
  },
  {
    id: 'mo-e9', skill: 'prevoir', title: 'Épreuve 9',
    prompt: 'Avec prix = 0,15t + 1, combien coûte un trajet de 40 minutes ?',
    options: ['7 €', '6 €', '41 €', '46 €'],
    cols: 2, correct: 0,
    explain: '0,15 × 40 + 1 = 7 €. Oublier le déblocage donne 6 € ; ajouter la durée au déblocage donne 41 €.',
    requires: ['expression-du-modele', 'modeliser'],
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_modelisation-3e_P10'] },
  },
  {
    id: 'mo-e10', skill: 'prevoir', title: 'Épreuve 10',
    prompt: 'Le modèle prix = 0,15t + 1 donne 19 € pour 120 min, mais l’application plafonne à 8 € par heure. Que conclure ?',
    options: ['Le modèle n’est valable que jusqu’au plafond : 120 min coûtent 16 € (2 × 8), pas 19 €', 'Le prix est 19 €', 'Le modèle était faux depuis le début', 'L’application s’est trompée'],
    cols: 1, correct: 0,
    explain: 'Un modèle a un domaine de validité. Hors de ce domaine, le calcul reste juste et le résultat devient faux : c’est l’extrapolation. Il faut interpréter et vérifier dans la situation.',
    requires: ['domaine-de-validite', 'extrapolation', 'interpreter-resultat'],
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_modelisation-3e_P11', '3e_modelisation-3e_P12'] },
  },
];

const BADGES = [
  { id: 'trier', emoji: '🏅', label: 'Trieur d’informations', test: (s) => (s.trier ?? 0) === 0 },
  { id: 'traduire', emoji: '🏅', label: 'Traducteur', test: (s) => (s.traduire ?? 0) === 0 },
  { id: 'representer', emoji: '🏅', label: 'Cartographe', test: (s) => (s.representer ?? 0) === 0 },
  { id: 'choisir', emoji: '🏅', label: 'Juge des modèles', test: (s) => (s.choisir ?? 0) === 0 },
  { id: 'prevoir', emoji: '🏅', label: 'Prévisionniste prudent', test: (s) => (s.prevoir ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Sans faute', test: (s) => Object.values(s).every((v) => v === 0) },
];

const PIEGES = [
  { wrong: 'Toutes les données de l’énoncé servent', right: 'Trier : ce qui varie et fait varier' },
  { wrong: 'Un modèle qui colle à un ticket suffit', right: 'Il doit être d’accord avec TOUTES les données' },
  { wrong: '« Plus 1 € » se traduit t + 1', right: '0,15 × t + 1 : le tarif multiplie, le fixe s’ajoute' },
  { wrong: '6,25 est la réponse', right: '6,25 € — ou « dès la 7e séance » : interpréter' },
  { wrong: 'Le modèle vaut partout', right: 'Il a un domaine ; au-delà, on doute' },
];

/** Synthèse : le testeur figé sur le bon modèle, et ses trois vues. */
function Synthese() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-900 text-white p-4 text-center space-y-1">
        <p className="text-2xl">🛴 🔁 🧐</p>
        <p className="font-bold">Traduire le réel en mathématiques — et revenir</p>
        <p className="text-slate-300 text-sm">situation → grandeurs → relation → représentation → calcul → interprétation → vérification</p>
      </div>
      <ModelTester candidates={T.candidates} points={T.tickets} selected="aff" onSelect={() => {}} xLabel="durée" xUnit="min" yLabel="prix" yUnit="€" disabled />
      <ModelViews model={T.model} xs={[0, 10, 20, 30, 40]} points={T.tickets} extraPoint={{ x: 35, y: 6.25, label: '35 min' }} variable="t" xLabel="durée" yLabel="prix" xUnit="min" yUnit="€" caption="Le modèle retenu, trois fois" />
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
      <Feedback tone="info">Un modèle est une traduction, pas la réalité : il sert à raisonner, il prévoit dans son domaine, et il se vérifie toujours en revenant à la situation.</Feedback>

      {/* Les connaissances elles-mêmes : la carte complète, source unique. */}
      <KnowledgeSnapshot variant="complete" complete />
    </div>
  );
}

export default function Module08MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le bureau d’études"
      moduleSubtitle="Dix épreuves pour traduire, prévoir et douter comme un ingénieur."
      estimatedTime="15 min"
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Dix dossiers à instruire',
        tone: 'amber',
        body: (
          <p>
            Aucune correction avant la fin : réponds aux dix épreuves, puis valide en une fois. Tu verras
            ensuite ton profil et la synthèse.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Ingénieur des modèles !',
        title: 'Bureau d’études validé !',
        message: (
          <>
            De l’écran encombré de l’application jusqu’au plafond de 8 €, tu as trié, traduit, représenté, prévu —
            et douté au bon moment. C’est exactement ce que fait un modèle bien mené.
          </>
        ),
        verbs: ['Trier', 'Traduire', 'Prévoir', 'Douter'],
        masterBadgeLabel: 'Badge « Ingénieur des modèles » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
