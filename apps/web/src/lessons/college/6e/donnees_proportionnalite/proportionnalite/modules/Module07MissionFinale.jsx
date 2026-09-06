import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import ProportionTable from '../components/ProportionTable';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import { CREPES, BARQUE } from '../components/kermesseData';
import { buildRows, applyRule, formatDec } from '../components/proportionUtils';

/**
 * Module 7 — Boss Final (moteur du kit, QCM uniquement). Fichier de DONNÉES.
 *
 * Épreuves écrites EN DERNIER : chaque distracteur encode un piège
 * réellement travaillé dans les modules 1 à 6 —
 *   · additionner au lieu de multiplier (M2 : « +3 » au lieu de « ×3 »)
 *   · ajouter l'écart des quantités au prix (M5 : 5→15 donc 7→17)
 *   · croire proportionnelle une situation à part fixe (M3 : la barque)
 *   · croire proportionnel tout ce qui augmente ensemble (M3/M6 : l'âge, la taille)
 *   · confondre le sens du coefficient (×3 au lieu de ÷3)
 *
 * Couverture des 11 LPs : P1 (e1), P2 (e2), P3 (e3), P4 (e4), P5 (e5),
 * P6 (e6), P7 (e7), P8 (e8), P9 (e9), P10 (e10), P11 (e10 également).
 */
const REGISTRE = [
  { id: 'stand', emoji: '🥞', label: 'Stand', value: 'crêpes' },
  { id: 'prix', emoji: '💶', label: 'Tarif', value: '3 € l’unité' },
  { id: 'test', emoji: '🔬', label: 'Réflexe', value: 'tester' },
  { id: 'verif', emoji: '✔️', label: 'Puis', value: 'vérifier' },
];

const SKILLS = {
  reconnaitre: { label: 'Reconnaître une situation proportionnelle', module: 1 },
  multiplicatif: { label: 'La relation multiplicative', module: 2 },
  comparer: { label: 'Proportionnel ou non', module: 3 },
  tableau: { label: 'Compléter un tableau', module: 4 },
  strategie: { label: 'Choisir sa stratégie', module: 5 },
  problemes: { label: 'Résoudre et vérifier', module: 6 },
};

const CREPES_ROWS = buildRows(CREPES.rule, [1, 4, 7]);
const BARQUE_ROWS = buildRows(BARQUE.rule, [1, 2, 3]);

const EPREUVES = [
  {
    id: 'pr-e1',
    requires: ['proportionnalite', 'coefficient-proportionnalite'],
    skill: 'reconnaitre',
    title: 'Épreuve 1',
    prompt: 'Au stand, 1 crêpe coûte 3 €, 2 crêpes 6 €, 5 crêpes 15 €. Comment reconnaît-on une situation de proportionnalité ?',
    options: [
      'Les deux grandeurs augmentent, cela suffit',
      'On passe de l’une à l’autre en multipliant toujours par le même nombre',
      'Les nombres sont tous des entiers',
    ],
    cols: 1,
    correct: 1,
    explain: 'C’est la régularité du passage qui compte : ×3 à chaque fois. Beaucoup de grandeurs augmentent ensemble sans être proportionnelles (l’âge et la taille, par exemple).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_proportionnalite_P1'] },
  },
  {
    id: 'pr-e2',
    requires: ['coefficient-proportionnalite', 'proportionnalite'],
    skill: 'multiplicatif',
    title: 'Épreuve 2',
    prompt: 'Dans ce tableau, quel est le coefficient qui mène des crêpes au prix ?',
    extra: <ProportionTable xLabel="Crêpes" yLabel="Prix" unit="€" columns={CREPES_ROWS} caption="Tarif du stand" />,
    options: ['× 3', '+ 2', '× 4'],
    cols: 3,
    correct: 0,
    explain: '1 → 3, 4 → 12, 7 → 21 : c’est toujours ×3. (« +2 » marcherait pour la première colonne seulement — l’ajout change à chaque ligne.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_proportionnalite_P2'] },
  },
  {
    id: 'pr-e3',
    requires: ['deux-grandeurs', 'part-fixe'],
    skill: 'reconnaitre',
    title: 'Épreuve 3',
    prompt: 'Dans « un taxi facture 4 € de prise en charge puis 2 € par kilomètre », quelles sont les deux grandeurs qui varient ensemble ?',
    options: [
      'Le nombre de kilomètres et le prix de la course',
      'La prise en charge et le prix par kilomètre',
      'Le nombre de passagers et le prix',
    ],
    cols: 1,
    correct: 0,
    explain: 'Ce qui varie, ce sont les kilomètres parcourus et le prix payé. Les 4 € et les 2 €/km sont des constantes du tarif, pas des grandeurs qui varient.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_proportionnalite_P3'] },
  },
  {
    id: 'pr-e4',
    requires: ['coefficient-proportionnalite', 'passage-unite'],
    skill: 'tableau',
    title: 'Épreuve 4',
    prompt: 'Le tableau du stand est proportionnel. Combien coûtent 7 crêpes ?',
    extra: <ProportionTable xLabel="Crêpes" yLabel="Prix" unit="€" columns={[{ x: 1, y: 3 }, { x: 4, y: 12 }, { x: 7, y: null }]} caption="Une case à compléter" />,
    options: ['15 €', '21 €', '19 €'],
    cols: 3,
    correct: 1,
    explain: '7 × 3 = 21 €. (19 €, c’est 12 + 7 : on ajouterait un nombre de crêpes à un prix, deux grandeurs qui ne s’additionnent pas.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_proportionnalite_P4'] },
  },
  {
    id: 'pr-e5',
    requires: ['passage-unite'],
    skill: 'strategie',
    title: 'Épreuve 5',
    prompt: '6 ballons coûtent 24 €. Quel est le prix d’UN ballon ?',
    options: ['4 €', '18 €', '30 €'],
    cols: 3,
    correct: 0,
    explain: 'Passage par l’unité : 24 ÷ 6 = 4 €. Cette valeur unitaire est la clé qui ouvre toutes les autres quantités.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_proportionnalite_P5'] },
  },
  {
    id: 'pr-e6',
    requires: ['passage-unite', 'choisir-strategie'],
    skill: 'strategie',
    title: 'Épreuve 6',
    prompt: 'Un ballon coûte 4 €. Combien coûtent 15 ballons ?',
    options: ['19 €', '60 €', '11 €'],
    cols: 3,
    correct: 1,
    explain: '4 × 15 = 60 €. On multiplie la valeur unitaire par la quantité — on ne l’additionne pas (19 = 4 + 15 mélange des ballons et des euros).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_proportionnalite_P6'] },
  },
  {
    id: 'pr-e7',
    requires: ['double-triple-moitie'],
    skill: 'strategie',
    title: 'Épreuve 7',
    prompt: '10 crêpes coûtent 30 €. Combien coûtent 5 crêpes ?',
    options: ['15 €', '25 €', '20 €'],
    cols: 3,
    correct: 0,
    explain: '5 crêpes, c’est la MOITIÉ de 10 : le prix est donc la moitié de 30, soit 15 €. Moitié d’un côté, moitié de l’autre.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_proportionnalite_P7'] },
  },
  {
    id: 'pr-e8',
    requires: ['part-fixe', 'proportionnalite'],
    skill: 'comparer',
    title: 'Épreuve 8',
    prompt: 'La barque coûte 5 € de location plus 2 € par personne. Cette situation est-elle proportionnelle ?',
    extra: <ProportionTable xLabel="Personnes" yLabel="Prix" unit="€" columns={BARQUE_ROWS} caption="Le tarif de la barque" />,
    options: [
      'Oui : le prix augmente régulièrement',
      'Non : les 5 € fixes sont payés une seule fois et ne doublent jamais',
      'Oui : 2 € par personne, c’est un coefficient',
    ],
    cols: 1,
    correct: 1,
    explain: `1 personne coûte ${applyRule(BARQUE.rule, 1)} €, mais 2 personnes coûtent ${applyRule(BARQUE.rule, 2)} € et non ${2 * applyRule(BARQUE.rule, 1)} €. La part fixe casse la proportionnalité : augmenter régulièrement ne suffit pas.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_proportionnalite_P8'] },
  },
  {
    id: 'pr-e9',
    requires: ['choisir-strategie', 'double-triple-moitie', 'passage-unite'],
    skill: 'strategie',
    title: 'Épreuve 9',
    prompt: '8 badges coûtent 32 €. Pour trouver le prix de 16 badges, quelle est la stratégie la plus RAPIDE ?',
    options: [
      'Doubler 32 €, car 16 est le double de 8',
      'Calculer le prix d’un badge, puis multiplier par 16',
      'Ajouter 8 € au prix de départ',
    ],
    cols: 1,
    correct: 0,
    explain: 'Les deux premières donnent 64 €, mais doubler est immédiat : 16 est le double de 8. Passer par l’unité fonctionne toujours — ici c’est juste un détour. (Ajouter 8 € est faux : on n’ajoute pas des badges à des euros.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_proportionnalite_P9'] },
  },
  {
    id: 'pr-e10',
    requires: ['verifier-coherence', 'passage-unite'],
    skill: 'problemes',
    title: 'Épreuve 10',
    prompt: 'Un élève calcule : « 5 tickets coûtent 15 €, donc 8 tickets coûtent 18 € ». Que faut-il en penser ?',
    options: [
      'C’est juste : il a ajouté 3 tickets et 3 €',
      'C’est faux : un ticket coûte 3 €, donc 8 tickets coûtent 24 €',
      'C’est faux, mais il faudrait tout recalculer pour le savoir',
    ],
    cols: 1,
    correct: 1,
    explain: 'Il a ajouté 3 € pour 3 tickets de plus, alors que chaque ticket coûte 3 € : il en fallait 9 de plus. Le contrôle est immédiat — 18 ÷ 8 ne redonne pas 3 €, donc le rapport n’a pas été conservé.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_proportionnalite_P10', '6e_proportionnalite_P11'] },
  },
];

const BADGES = [
  { id: 'oeil', emoji: '🏅', label: 'Œil du testeur', test: (s) => (s.reconnaitre ?? 0) === 0 && (s.comparer ?? 0) === 0 },
  { id: 'coef', emoji: '🏅', label: 'Maître du coefficient', test: (s) => (s.multiplicatif ?? 0) === 0 },
  { id: 'tableau', emoji: '🏅', label: 'Roi du tableau', test: (s) => (s.tableau ?? 0) === 0 },
  { id: 'strategie', emoji: '🏅', label: 'Stratège', test: (s) => (s.strategie ?? 0) === 0 },
  { id: 'verif', emoji: '🏅', label: 'Vérificateur', test: (s) => (s.problemes ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Patron de la kermesse', test: (s) => Object.values(s).every((v) => v === 0) },
];

function Synthese() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-3 text-center">
        <div className="text-2xl" aria-hidden="true">⚖️</div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
          Une situation est proportionnelle quand on passe d'une grandeur à l'autre en multipliant toujours
          par le même nombre. Tout le reste — l'unité, les doubles, les tableaux — découle de là.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 space-y-3">
        <p className="text-sm font-semibold text-slate-700 text-center">Le stand de crêpes, de bout en bout</p>
        <ProportionTable
          xLabel="Crêpes"
          yLabel="Prix"
          unit="€"
          columns={buildRows(CREPES.rule, [1, 2, 4, 7, 10])}
          coefficient={3}
          horizontalHint={{ from: 2, to: 4, factor: 2 }}
          caption="Toujours × 3, dans les deux lectures"
        />
        <p className="text-center text-xs text-slate-500">
          Vers le bas : ×3, le coefficient. Sur le côté : ×2 appliqué aux deux lignes.
        </p>
      </div>

      <div className="bg-white border-2 border-rose-200 rounded-2xl p-5 space-y-2">
        <p className="text-sm font-semibold text-rose-700 text-center">Et le contre-exemple à ne pas oublier</p>
        <ProportionTable
          xLabel="Personnes"
          yLabel="Prix barque"
          unit="€"
          columns={buildRows(BARQUE.rule, [1, 2, 4])}
          caption="5 € de location + 2 € par personne : PAS proportionnel"
        />
        <p className="text-center text-xs text-slate-500">
          {formatDec(applyRule(BARQUE.rule, 1))} € puis {formatDec(applyRule(BARQUE.rule, 2))} € : le double
          de personnes ne donne pas le double de prix.
        </p>
      </div>

      {/* La carte complète REMPLACE les deux bandeaux recopiés à la main
          (« À retenir » et « les pièges à éviter ») : une leçon n'a qu'une
          source de connaissances (docs/architecture/KNOWLEDGE_MAP.md). */}
      <KnowledgeSnapshot complete variant="complete" />

      <Feedback tone="info">
        Prix, distances, recettes, recettes de cuisine : la proportionnalité est partout. Le réflexe à garder
        est toujours le même — teste d'abord, calcule ensuite.
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
      moduleTitle="🏆 Mission finale : le grand stand"
      moduleSubtitle="Dix épreuves pour tenir le stand de la kermesse sans une erreur."
      estimatedTime="11 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'C’est toi qui tiens le stand. Chaque prix doit être juste.',
        tone: 'amber',
        body: (
          <p>
            Reconnaître, compléter, choisir la bonne stratégie et vérifier : tout ce que tu as manipulé.
            Réponds à toutes les épreuves, puis valide pour voir ta correction et tes badges.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Patron de la kermesse !',
        title: 'Stand tenu !',
        message: (
          <>
            Du distributeur de crêpes au grand stand, tu as testé, découvert le coefficient, complété des
            tableaux et choisi tes stratégies — sans tomber dans le piège de la barque.
          </>
        ),
        verbs: ['Tester', 'Multiplier', 'Choisir', 'Vérifier'],
        masterBadgeLabel: 'Badge « Patron de la kermesse » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
