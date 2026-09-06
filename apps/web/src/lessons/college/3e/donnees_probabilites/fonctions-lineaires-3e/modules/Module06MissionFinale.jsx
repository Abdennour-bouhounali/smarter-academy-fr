import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import { image, tableOf } from '../components/linearUtils';

/**
 * Module 6 — 🏆 MISSION FINALE : « Le marché ».
 *
 * Fichier de DONNÉES : huit épreuves QCM, silencieuses jusqu'à un unique envoi.
 * Écrites EN DERNIER, chaque distracteur reprenant un piège de la leçon :
 *   e1  proportionnalité vs situation avec part fixe (module 1, la barquette)
 *   e2  coefficient cherché par soustraction (module 2)
 *   e3  rapport inversé x ÷ y (module 4)
 *   e4  « changer a déplace la droite » (module 3)
 *   e5  l'origine prise comme point de référence (module 4)
 *   e6  pourcentage traité comme une addition (module 5)
 *   e7  « −20 % puis +20 % s'annulent » (module 5)
 *   e8  agrandissement : aire confondue avec longueur (module 5)
 *
 * Couverture des Learning Points : P1 (e1), P8 (e1), P2 (e4), P3 (e2),
 * P4 (e6), P5 (e2), P6 (e4), P7 (e5), P9 (e7), P10 (e3), P11 (e8).
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Le test final CONSOLIDE et n'introduit RIEN : chaque épreuve déclare ses
 *   `requires`, tous établis par une brique d'un module antérieur ou par le
 *   `priorKnowledge` de la leçon. Le mot « fonction affine » a disparu de
 *   l'épreuve 1 — il n'est enseigné nulle part ici, et une bonne réponse ne
 *   doit jamais s'expliquer par un mot que l'élève n'a pas.
 *   La SYNTHÈSE ne recopie plus de définitions : la liste « ce qui se lit sur
 *   la droite » est remplacée par la carte des connaissances complète
 *   (<KnowledgeSnapshot variant="complete" complete />), source unique. Les
 *   visuels — la droite à pivot, les quatre noms du coefficient — et les
 *   pièges déjoués restent : ils ne sont pas des définitions.
 */

const REGISTRE = [
  { id: 'cerises', emoji: '🍒', label: 'Cerises', value: '4 € le kilo' },
  { id: 'forme', emoji: '✏️', label: 'Forme', value: 'f(x) = ax' },
  { id: 'origine', emoji: '📍', label: 'Toujours', value: 'passe par O' },
  { id: 'methode', emoji: '➗', label: 'Méthode', value: 'a = y ÷ x' },
];

const SKILLS = {
  reconnaitre: { label: 'Reconnaître une fonction linéaire', module: 1 },
  coefficient: { label: 'Identifier le coefficient', module: 2 },
  graphique: { label: 'La droite et son pivot', module: 3 },
  retrouver: { label: "Retrouver l'expression", module: 4 },
  problemes: { label: 'Résoudre un problème', module: 5 },
};

const EPREUVES = [
  {
    id: 'fl-e1',
    skill: 'reconnaitre',
    title: 'Épreuve 1',
    prompt: 'Laquelle de ces situations est une fonction linéaire ?',
    options: [
      'Le prix de x kg de pommes à 3 € le kilo',
      'Un abonnement de 10 € plus 2 € par séance',
      'Le prix d’un taxi : 2 € puis 1,50 € du kilomètre',
      'Une entrée à 8 €, quel que soit le nombre de personnes',
    ],
    cols: 1,
    correct: 0,
    requires: ['fonction-lineaire', 'lineaire-est-proportionnalite', 'mem-zero-donne-zero'],
    explain: "Seul le prix au kilo est proportionnel : 0 kg coûte 0 €. Les deux suivants font payer quelque chose pour 0 (10 € d'abonnement, 2 € de prise en charge), et la dernière ne change jamais.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-lineaires-3e_P1', '3e_fonctions-lineaires-3e_P8'] },
  },
  {
    id: 'fl-e2',
    skill: 'coefficient',
    title: 'Épreuve 2',
    prompt: 'Un tableau donne : 4 → 18 et 6 → 27. Quel est le coefficient de cette fonction linéaire ?',
    options: ['4,5', '14', '9', '2'],
    cols: 2,
    correct: 0,
    requires: ['coefficient', 'coefficient-par-division', 'test-lineaire'],
    explain: "18 ÷ 4 = 4,5 et 27 ÷ 6 = 4,5 : les rapports coïncident, donc a = 4,5. Le coefficient est un quotient, jamais une différence.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-lineaires-3e_P3', '3e_fonctions-lineaires-3e_P5'] },
  },
  {
    id: 'fl-e3',
    skill: 'retrouver',
    title: 'Épreuve 3',
    prompt: 'Une fonction linéaire vérifie f(8) = 20. Quelle est son expression ?',
    options: ['f(x) = 2,5x', 'f(x) = 0,4x', 'f(x) = 12x', 'f(x) = 160x'],
    cols: 2,
    correct: 0,
    requires: ['methode-determiner-lineaire', 'coefficient-par-division', 'notation-fx', 'image'],
    explain: "a = 20 ÷ 8 = 2,5. Attention au sens du quotient : c'est l'image divisée par l'antécédent, pas l'inverse (0,4 serait 8 ÷ 20).",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-lineaires-3e_P10'] },
  },
  {
    id: 'fl-e4',
    skill: 'graphique',
    title: 'Épreuve 4',
    prompt: 'On augmente le coefficient a d’une fonction linéaire. Que devient sa représentation graphique ?',
    options: [
      'Elle pivote autour de l’origine en se redressant',
      'Elle monte tout entière sans changer d’inclinaison',
      'Elle se décale vers la droite',
      'Elle devient une courbe',
    ],
    cols: 1,
    correct: 0,
    requires: ['pivot-autour-origine', 'droite-par-origine', 'coefficient'],
    explain: "Comme f(0) = 0 quel que soit a, le point (0 ; 0) reste sur la droite : elle tourne autour de lui. Une droite qui glisse verticalement, c'est le rôle de b — et b n'existe pas ici.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-lineaires-3e_P2', '3e_fonctions-lineaires-3e_P6'] },
  },
  {
    id: 'fl-e5',
    skill: 'graphique',
    title: 'Épreuve 5',
    prompt: 'Quel point ne permet PAS de déterminer une fonction linéaire ?',
    options: ['(0 ; 0)', '(1 ; 4)', '(−3 ; −12)', '(2,5 ; 10)'],
    cols: 2,
    correct: 0,
    requires: ['un-point-suffit', 'droite-par-origine', 'coordonnees'],
    explain: "L'origine appartient à TOUTES les fonctions linéaires : elle n'en distingue aucune. Les trois autres points donnent chacun a = 4 par division.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-lineaires-3e_P7'] },
  },
  {
    id: 'fl-e6',
    skill: 'problemes',
    title: 'Épreuve 6',
    prompt: 'Un article à 60 € subit une remise de 15 %. Quel est le prix payé ?',
    options: ['51 €', '45 €', '9 €', '69 €'],
    cols: 2,
    correct: 0,
    requires: ['coefficient-en-situation', 'fonction-lineaire'],
    explain: "Enlever 15 %, c'est multiplier par 0,85 : 60 × 0,85 = 51 €. Retirer 15 (et non 15 %) donnerait 45 € — c'est le piège.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-lineaires-3e_P4'] },
  },
  {
    id: 'fl-e7',
    skill: 'problemes',
    title: 'Épreuve 7',
    prompt: 'Un prix augmente de 10 %, puis diminue de 10 %. Que vaut-il par rapport au départ ?',
    options: [
      '99 % du prix initial',
      'Exactement le prix initial',
      '101 % du prix initial',
      'Impossible à dire',
    ],
    cols: 1,
    correct: 0,
    requires: ['coefficients-se-multiplient', 'coefficient-en-situation'],
    explain: "On multiplie par 1,1 puis par 0,9 : 1,1 × 0,9 = 0,99. Il manque 1 %. Les pourcentages ne s'additionnent pas ; ce sont les coefficients qui se multiplient.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-lineaires-3e_P9'] },
  },
  {
    id: 'fl-e8',
    skill: 'problemes',
    title: 'Épreuve 8',
    prompt: 'Un jardin rectangulaire est agrandi : toutes ses longueurs sont doublées. Que devient son aire ?',
    options: ['Elle est multipliée par 4', 'Elle est doublée', 'Elle est multipliée par 8', 'Elle ne change pas'],
    cols: 2,
    correct: 0,
    requires: ['coefficients-se-multiplient', 'fonction-lineaire'],
    explain: "La longueur ET la largeur doublent, donc l'aire est multipliée par 2 × 2 = 4. Les longueurs suivent une fonction linéaire de coefficient 2 ; l'aire, non.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-lineaires-3e_P11'] },
  },
];

const BADGES = [
  { id: 'reconnaitre', emoji: '🏅', label: 'Œil du marchand', test: (s) => (s.reconnaitre ?? 0) === 0 },
  { id: 'coefficient', emoji: '🏅', label: 'Chasseur de coefficient', test: (s) => (s.coefficient ?? 0) === 0 },
  { id: 'graphique', emoji: '🏅', label: 'Maître du pivot', test: (s) => (s.graphique ?? 0) === 0 },
  { id: 'retrouver', emoji: '🏅', label: 'Enquêteur', test: (s) => (s.retrouver ?? 0) === 0 },
  { id: 'problemes', emoji: '🏅', label: 'Calculateur de soldes', test: (s) => (s.problemes ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Sans faute', test: (s) => Object.values(s).every((v) => v === 0) },
];

const PIEGES = [
  { wrong: 'a se trouve en soustrayant', right: 'a = y ÷ x, un quotient' },
  { wrong: 'Le point (0 ; 0) donne le coefficient', right: 'Il est sur toutes les droites linéaires : il n’en désigne aucune' },
  { wrong: 'Changer a fait glisser la droite', right: 'Elle pivote autour de l’origine' },
  { wrong: '−20 % puis +20 % s’annulent', right: '0,8 × 1,2 = 0,96 : il manque 4 %' },
  { wrong: 'Doubler les longueurs double l’aire', right: 'L’aire est multipliée par 4' },
];

const SYN_A = 2;
const SYN_RANGE = { xMin: -4, xMax: 4, yMin: -6, yMax: 6 };

/** Synthèse : la droite à pivot figée, avec son escalier et son point fixe. */
function Synthese() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-900 text-white p-4 text-center space-y-1">
        <p className="text-2xl">🍒 ➗ 📈</p>
        <p className="font-bold">Une proportionnalité, écrite comme une fonction</p>
        <p className="text-slate-300 text-sm">
          <MathText>{'$f(x) = ax$'}</MathText> — le coefficient, la droite, le pivot.
        </p>
      </div>

      <CoordPlane
        range={SYN_RANGE}
        unit={30}
        functions={[{ id: 'f', a: SYN_A, b: 0, tone: 'indigo', label: 'f' }]}
        staircase={{ from: { x: 0, y: 0 }, a: SYN_A, run: 1 }}
        points={[{ id: 'O', name: 'O', x: 0, y: 0, color: '#e11d48' }]}
        frozen
        caption={false}
        ariaLabel="Synthèse : la droite de f, son escalier et le pivot O"
      />

      {/* Aucune définition n'est recopiée ici : la carte des connaissances EST
          la synthèse, et elle rend les mêmes items que les briques des
          modules (docs/architecture/KNOWLEDGE_MAP.md). */}
      <KnowledgeSnapshot variant="complete" complete />

      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
        <p className="font-bold text-emerald-800 mb-1">Le même coefficient, quatre noms</p>
        <p className="text-sm text-slate-700">
          Prix au kilo · vitesse · taux de remise · facteur d’agrandissement. À chaque fois,
          c’est le nombre par lequel on multiplie.
        </p>
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
        Une fonction linéaire ne dit rien de plus qu’une situation de proportionnalité —
        mais elle le dit avec une droite, et cette droite pivote toujours autour du même point.
      </Feedback>
    </div>
  );
}

export default function Module06MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le marché"
      moduleSubtitle="Huit épreuves où tout se ramène à un seul coefficient."
      estimatedTime="12 min"
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Huit étals à traverser',
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
        masterTitle: 'Roi du marché !',
        title: 'Marché bouclé !',
        message: (
          <>
            Des cerises au kilo jusqu’au jardin agrandi, tu as reconnu la même fonction
            partout — et tu ne confondras plus une remise avec une soustraction.
          </>
        ),
        verbs: ['Reconnaître', 'Diviser', 'Tracer', 'Appliquer'],
        masterBadgeLabel: 'Badge « Roi du marché » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
