import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import SlopeFromTwoPoints from '../components/SlopeFromTwoPoints';

/**
 * Module 7 — 🏆 MISSION FINALE : « L'atelier des tarifs ».
 *
 * Fichier de DONNÉES : huit épreuves QCM, silencieuses jusqu'à un unique envoi.
 * Écrites EN DERNIER, chaque distracteur reprenant un piège réellement
 * rencontré :
 *   e1  proportionnalité appliquée malgré la part fixe (module 1)
 *   e2  a et b intervertis dans le calcul d'image (module 2)
 *   e3  « augmenter a fait monter toute la droite » (modules 2 et 3)
 *   e4  b lu ailleurs qu'en x = 0 (module 3)
 *   e5  droites parallèles non reconnues (module 3)
 *   e6  rapport Δy/Δx inversé (module 5)
 *   e7  une image prise pour b (module 5)
 *   e8  « un tarif est meilleur partout » (module 6)
 *
 * Couverture des Learning Points : P1 (e1), P2 (e1), P7 (e2), P5 (e3),
 * P9 (e3), P4 (e4), P6 (e5), P3 (e6), P10 (e6, e7), P8 (e7), P11 (e8).
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Le test final CONSOLIDE : il n'introduit rien — ni concept, ni mot, ni
 *   notation. Chaque épreuve déclare ses `requires`, et tous sont établis par
 *   une <KnowledgeBrick> des modules 1 à 6. La synthèse ne recopie plus les
 *   définitions (« les quatre lectures d'une fonction affine » était une liste
 *   de définitions dupliquée) : elle rend la carte complète, source unique,
 *   par <KnowledgeSnapshot variant="complete" complete />. Les deux repères et
 *   les pièges déjoués restent : ce sont des visuels et des contre-exemples,
 *   pas des définitions.
 */

const REGISTRE = [
  { id: 'taxi', emoji: '🚕', label: 'Taxi', value: '2 € + 1,50 €/km' },
  { id: 'forme', emoji: '✏️', label: 'Forme', value: 'f(x) = ax + b' },
  { id: 'a', emoji: '📐', label: 'a', value: 'incline' },
  { id: 'b', emoji: '🎈', label: 'b', value: 'soulève' },
];

const SKILLS = {
  reconnaitre: { label: 'Reconnaître une fonction affine', module: 1 },
  roleA: { label: 'Le rôle du coefficient a', module: 2 },
  roleB: { label: "Le rôle de l'ordonnée à l'origine b", module: 3 },
  lire: { label: 'Lire et construire la droite', module: 4 },
  retrouver: { label: "Retrouver l'expression", module: 5 },
  modeliser: { label: 'Modéliser un tarif', module: 6 },
};

const EPREUVES = [
  {
    id: 'fa-e1',
    skill: 'reconnaitre',
    title: 'Épreuve 1',
    prompt: 'Une salle se loue 40 € plus 6 € par personne. Une soirée à 10 personnes coûte 100 €. Combien coûte une soirée à 20 personnes ?',
    options: ['160 €', '200 €', '120 €', '140 €'],
    cols: 2,
    correct: 0,
    requires: ['part-fixe-part-variable', 'mem-affine-vs-lineaire', 'forme-ax-b'],
    explain: "6 × 20 + 40 = 160 €. Doubler le nombre de personnes ne double PAS le prix : les 40 € de location ne se paient qu'une fois. C'est ce qui distingue une fonction affine d'une fonction linéaire.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-affines-3e_P1', '3e_fonctions-affines-3e_P2'] },
  },
  {
    id: 'fa-e2',
    skill: 'roleA',
    title: 'Épreuve 2',
    prompt: 'Soit f(x) = 5x − 2. Que vaut f(3) ?',
    options: ['13', '9', '15', '3'],
    cols: 2,
    correct: 0,
    requires: ['forme-ax-b', 'coefficient-directeur', 'ordonnee-origine'],
    explain: "5 × 3 = 15, puis 15 − 2 = 13. On multiplie par a d'abord, on applique b ensuite — jamais l'inverse.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-affines-3e_P7'] },
  },
  {
    id: 'fa-e3',
    skill: 'roleA',
    title: 'Épreuve 3',
    prompt: 'On augmente a sans toucher à b. Que devient la droite ?',
    options: [
      'Elle s’incline davantage, en gardant le même point de départ',
      'Elle monte tout entière, parallèlement',
      'Elle se déplace vers la droite',
      'Elle devient horizontale',
    ],
    cols: 1,
    correct: 0,
    requires: ['coefficient-directeur', 'role-de-a'],
    explain: "a commande l'inclinaison. Le point (0 ; b) ne dépend que de b : il reste immobile pendant que la droite pivote autour de lui.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-affines-3e_P5', '3e_fonctions-affines-3e_P9'] },
  },
  {
    id: 'fa-e4',
    skill: 'roleB',
    title: 'Épreuve 4',
    prompt: 'Une droite passe par (0 ; −5) et (2 ; 1). Que vaut b ?',
    options: ['−5', '1', '2', '3'],
    cols: 2,
    correct: 0,
    requires: ['ordonnee-origine', 'mem-f0-egale-b'],
    explain: "b est l'image de 0, c'est-à-dire l'ordonnée du point d'abscisse 0 : ici −5. Le point (2 ; 1) sert à trouver a, pas b.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-affines-3e_P4'] },
  },
  {
    id: 'fa-e5',
    skill: 'roleB',
    title: 'Épreuve 5',
    prompt: 'Les droites de f(x) = −3x + 1 et g(x) = −3x − 4 sont-elles parallèles ?',
    options: [
      'Oui : même coefficient a, donc même inclinaison',
      'Non : leurs ordonnées à l’origine diffèrent',
      'Non : elles se croisent en x = 1',
      'Impossible à dire sans les tracer',
    ],
    cols: 1,
    correct: 0,
    requires: ['droites-paralleles', 'coefficient-directeur'],
    explain: "Deux fonctions affines de même a sont parallèles quels que soient leurs b. Un b différent les décale verticalement : elles ne se rencontrent jamais.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-affines-3e_P6'] },
  },
  {
    id: 'fa-e6',
    skill: 'retrouver',
    title: 'Épreuve 6',
    prompt: 'Une droite passe par (2 ; 7) et (6 ; 19). Que vaut son coefficient directeur ?',
    options: ['3', '12', '4', '0,33'],
    cols: 2,
    correct: 0,
    requires: ['pente-deux-points', 'coefficient-directeur'],
    explain: "Δy = 19 − 7 = 12 et Δx = 6 − 2 = 4, donc a = 12 ÷ 4 = 3. Le coefficient est la montée DIVISÉE par l'avancée, jamais l'inverse.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-affines-3e_P3', '3e_fonctions-affines-3e_P10'] },
  },
  {
    id: 'fa-e7',
    skill: 'retrouver',
    title: 'Épreuve 7',
    prompt: 'Une fonction affine a pour coefficient a = 4 et vérifie f(2) = 11. Quelle est son expression ?',
    options: ['f(x) = 4x + 3', 'f(x) = 4x + 11', 'f(x) = 4x − 3', 'f(x) = 11x + 4'],
    cols: 2,
    correct: 0,
    requires: ['methode-retrouver-a-b', 'ordonnee-origine', 'forme-ax-b'],
    explain: "4 × 2 + b = 11 donne b = 3. Le nombre 11 est une IMAGE, pas l'ordonnée à l'origine : il faut remonter en retirant a × x.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-affines-3e_P10', '3e_fonctions-affines-3e_P8'] },
  },
  {
    id: 'fa-e8',
    skill: 'modeliser',
    title: 'Épreuve 8',
    prompt: 'Tarif A : 0,30 €/min sans abonnement. Tarif B : 9 € d’abonnement + 0,10 €/min. Lequel choisir ?',
    options: [
      'Cela dépend : A en dessous de 45 min, B au-dessus',
      'B, toujours : son prix à la minute est plus bas',
      'A, toujours : il n’a pas d’abonnement',
      'Les deux coûtent pareil quel que soit l’usage',
    ],
    cols: 1,
    correct: 0,
    requires: ['modeliser-tarif', 'role-de-b', 'part-fixe-part-variable'],
    explain: "0,3x = 0,1x + 9 donne x = 45 min. Avant, A est moins cher ; après, B. Aucun tarif à part fixe n'est meilleur en toutes circonstances — c'est l'usage qui décide.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-affines-3e_P11'] },
  },
];

const BADGES = [
  { id: 'reconnaitre', emoji: '🏅', label: 'Œil du comptable', test: (s) => (s.reconnaitre ?? 0) === 0 },
  { id: 'roleA', emoji: '🏅', label: 'Maître de la pente', test: (s) => (s.roleA ?? 0) === 0 },
  { id: 'roleB', emoji: '🏅', label: 'Gardien du départ', test: (s) => (s.roleB ?? 0) === 0 },
  { id: 'retrouver', emoji: '🏅', label: 'Enquêteur des tarifs', test: (s) => (s.retrouver ?? 0) === 0 },
  { id: 'modeliser', emoji: '🏅', label: 'Négociateur', test: (s) => (s.modeliser ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Sans faute', test: (s) => Object.values(s).every((v) => v === 0) },
];

const PIEGES = [
  { wrong: 'Deux fois plus loin, deux fois plus cher', right: 'Faux dès qu’il y a une part fixe : f(2x) ≠ 2·f(x)' },
  { wrong: 'a fait monter toute la droite', right: 'a l’incline ; c’est b qui la soulève' },
  { wrong: 'b se lit sur n’importe quel point', right: 'b est l’image de 0, sur l’axe vertical' },
  { wrong: 'a = Δx ÷ Δy', right: 'a = Δy ÷ Δx : la montée divisée par l’avancée' },
  { wrong: 'Le tarif sans abonnement est toujours meilleur', right: 'Cela dépend de l’usage — le croisement dit où' },
];

const SYN = { a: 1.5, b: -2 };
const SYN_RANGE = { xMin: -4, xMax: 4, yMin: -6, yMax: 6 };

/** Synthèse : les deux boutons figés, et le triangle qui donne le coefficient. */
function Synthese() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-900 text-white p-4 text-center space-y-1">
        <p className="text-2xl">📐 🎈</p>
        <p className="font-bold">Deux nombres, deux métiers</p>
        <p className="text-slate-300 text-sm">
          <MathText>{'$f(x) = ax + b$'}</MathText> — a incline, b soulève.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-700 text-center">La droite et son départ</p>
          <CoordPlane
            range={SYN_RANGE}
            unit={30}
            functions={[{ id: 'f', a: SYN.a, b: SYN.b, tone: 'indigo', label: 'f' }]}
            intercept={{ y: SYN.b }}
            staircase={{ from: { x: 0, y: SYN.b }, a: SYN.a, run: 1 }}
            frozen
            caption={false}
            ariaLabel="Synthèse : la droite, son escalier et son ordonnée à l’origine"
          />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-700 text-center">Le triangle des deux points</p>
          <SlopeFromTwoPoints
            A={{ x: -2, y: -5 }}
            B={{ x: 2, y: 1 }}
            frozen
            showExpression={false}
            range={SYN_RANGE}
          />
        </div>
      </div>

      {/* Les définitions ne sont pas recopiées ici : la carte des connaissances
          en est la source unique, et elle est rendue complète, avec ses visuels
          et ses formules (docs/architecture/KNOWLEDGE_MAP.md). */}
      <KnowledgeSnapshot variant="complete" complete />

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
        Une fonction affine tient en deux nombres qui ne se marchent jamais dessus. Savoir
        lequel fait quoi, c’est savoir lire un tarif, un graphique et une facture.
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
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : l’atelier des tarifs"
      moduleSubtitle="Huit épreuves où a et b ne doivent jamais être confondus."
      estimatedTime="12 min"
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Huit tarifs à décoder',
        tone: 'amber',
        body: (
          <p>
            Aucune correction avant la fin : réponds aux huit épreuves, puis valide en une
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
        masterTitle: 'Expert des tarifs !',
        title: 'Atelier bouclé !',
        message: (
          <>
            Du taxi jusqu’à l’abonnement négocié, tu as gardé a et b à leur place — l’un
            incline, l’autre soulève, et aucun tarif n’est meilleur partout.
          </>
        ),
        verbs: ['Décomposer', 'Régler', 'Retrouver', 'Comparer'],
        masterBadgeLabel: 'Badge « Expert des tarifs » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
