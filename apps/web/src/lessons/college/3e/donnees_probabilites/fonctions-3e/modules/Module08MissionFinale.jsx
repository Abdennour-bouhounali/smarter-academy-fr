import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import FunctionMachine from '../components/FunctionMachine';
import { affine, square, imageOf, tableOf } from '../components/functionUtils';

/**
 * Module 8 — 🏆 MISSION FINALE : « L'atelier des machines ».
 *
 * Fichier de DONNÉES : dix épreuves QCM, silencieuses jusqu'à un unique envoi.
 * Écrites EN DERNIER, pour que chaque distracteur reprenne un piège réellement
 * rencontré dans la leçon :
 *   e2  antécédent lu comme une image (module 2)
 *   e3  « + 1 » oublié dans le calcul d'image (module 2)
 *   e4  un seul antécédent là où il y en a deux (module 2, la fonction carré)
 *   e5  tableau pris pour la fonction entière (module 3)
 *   e6  coordonnées inversées (module 4)
 *   e7  points supposés toujours alignés (module 4)
 *   e8  « linéaire donc pas affine » (module 5)
 *   e9  b lu ailleurs qu'en x = 0 (module 6)
 *   e10 prise en charge oubliée (module 7)
 *
 * Couverture des Learning Points : P1 (e1), P2 (e2), P3 (e2), P4 (e3),
 * P5 (e4), P6 (e5), P7 (e6), P8 (e7), P9 (e8), P10 (e8), P11 (e9), P12 (e10).
 */

const REGISTRE = [
  { id: 'machine', emoji: '⚙️', label: 'Machine', value: 'entrée → règle → sortie' },
  { id: 'image', emoji: '➡️', label: 'Image', value: 'f(x), une seule' },
  { id: 'antecedent', emoji: '⬅️', label: 'Antécédent', value: 'parfois plusieurs' },
  { id: 'droite', emoji: '📈', label: 'Affine', value: 'f(x) = ax + b' },
];

const SKILLS = {
  notion: { label: 'La notion de fonction', module: 1 },
  vocabulaire: { label: 'Image, antécédent, f(x)', module: 2 },
  tableau: { label: 'Le tableau de valeurs', module: 3 },
  graphique: { label: 'Du tableau au repère', module: 4 },
  familles: { label: 'Linéaire et affine', module: 5 },
  expression: { label: "Retrouver l'expression", module: 6 },
  modele: { label: 'Modéliser une situation', module: 7 },
};

const EPREUVES = [
  {
    id: 'fo-e1',
    skill: 'notion',
    title: 'Épreuve 1',
    prompt: "Une machine transforme chaque nombre selon une règle fixe. On lui donne 4 une deuxième fois. Que renvoie-t-elle ?",
    options: [
      'La même sortie que la première fois',
      'Une sortie qui peut être différente',
      'Rien, elle a déjà traité ce nombre',
      'La sortie précédente augmentée de 1',
    ],
    cols: 1,
    correct: 0,
    explain: "Une fonction associe à chaque nombre UNE sortie, toujours la même. C'est ce qui la distingue d'une liste de nombres tirés au hasard.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-3e_P1'] },
  },
  {
    id: 'fo-e2',
    skill: 'vocabulaire',
    title: 'Épreuve 2',
    prompt: 'On sait que f(5) = 12. Quelle phrase est exacte ?',
    options: [
      '12 est l’image de 5, et 5 est un antécédent de 12',
      '5 est l’image de 12, et 12 un antécédent de 5',
      'f multiplie 5 par 12',
      '5 et 12 sont deux images de f',
    ],
    cols: 1,
    correct: 0,
    explain: "Le nombre entre parenthèses est ce qu'on entre — l'antécédent. Le résultat est l'image. Donc 12 est l'image de 5.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-3e_P2', '3e_fonctions-3e_P3'] },
  },
  {
    id: 'fo-e3',
    skill: 'vocabulaire',
    title: 'Épreuve 3',
    prompt: 'Soit f(x) = 4x + 3. Que vaut f(−2) ?',
    options: ['−5', '−11', '5', '−8'],
    cols: 2,
    correct: 0,
    explain: "4 × (−2) = −8, puis −8 + 3 = −5. On applique la multiplication avant l'addition, et le signe du nombre entré compte.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-3e_P4'] },
  },
  {
    id: 'fo-e4',
    skill: 'vocabulaire',
    title: 'Épreuve 4',
    prompt: 'Soit g(x) = x². Combien le nombre 9 a-t-il d’antécédents par g ?',
    options: ['Deux : −3 et 3', 'Un seul : 3', 'Aucun', 'Une infinité'],
    cols: 2,
    correct: 0,
    explain: "g(3) = 9 et g(−3) = 9 : deux antécédents. Un nombre n'a qu'une image, mais une image peut avoir plusieurs antécédents — les deux sens ne sont pas symétriques.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-3e_P5'] },
  },
  {
    id: 'fo-e5',
    skill: 'tableau',
    title: 'Épreuve 5',
    prompt: 'Un tableau de valeurs de f donne les images de −2, −1, 0, 1 et 2. Peut-on en déduire f(7) ?',
    extra: (
      <p className="text-sm text-slate-600">
        Le tableau s’arrête à 2, mais la règle de f, elle, est connue.
      </p>
    ),
    options: [
      'Oui, en appliquant la règle de la fonction',
      'Non, 7 n’est pas dans le tableau',
      'Non, une fonction n’existe que pour les valeurs du tableau',
      'Oui, en prolongeant le tableau au hasard',
    ],
    cols: 1,
    correct: 0,
    explain: "Un tableau de valeurs n'est qu'un extrait : quelques couples choisis. La fonction, elle, répond pour tous les nombres — c'est la règle qui donne f(7).",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-3e_P6'] },
  },
  {
    id: 'fo-e6',
    skill: 'graphique',
    title: 'Épreuve 6',
    prompt: 'Le point de coordonnées (2 ; 7) appartient à la courbe de f. Qu’en déduit-on ?',
    options: ['f(2) = 7', 'f(7) = 2', 'f(2) = f(7)', 'f(2) + f(7) = 9'],
    cols: 2,
    correct: 0,
    explain: "Un point de la courbe se lit (antécédent ; image) : l'abscisse est ce qu'on entre, l'ordonnée ce qui sort. Donc f(2) = 7.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-3e_P7'] },
  },
  {
    id: 'fo-e7',
    skill: 'graphique',
    title: 'Épreuve 7',
    prompt: 'On place les points d’un tableau dans un repère et ils ne sont PAS alignés. Que peut-on conclure ?',
    options: [
      'La fonction n’est pas affine',
      'Il y a forcément une erreur de placement',
      'La fonction est linéaire',
      'Le tableau est incomplet',
    ],
    cols: 1,
    correct: 0,
    explain: "Une fonction affine donne toujours des points alignés. Des points non alignés prouvent donc que la fonction n'est pas affine — comme la fonction carré.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-3e_P8'] },
  },
  {
    id: 'fo-e8',
    skill: 'familles',
    title: 'Épreuve 8',
    prompt: 'Parmi ces fonctions, laquelle est linéaire ?',
    options: ['f(x) = 6x', 'f(x) = 6x + 1', 'f(x) = x² ', 'f(x) = 6'],
    cols: 2,
    correct: 0,
    explain: "Une fonction linéaire s'écrit ax, sans terme constant : sa droite passe par l'origine. 6x + 1 est affine sans être linéaire, et 6 est une fonction constante (affine avec a = 0).",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-3e_P9', '3e_fonctions-3e_P10'] },
  },
  {
    id: 'fo-e9',
    skill: 'expression',
    title: 'Épreuve 9',
    prompt: 'Une droite coupe l’axe des ordonnées en −4 et, quand x avance de 1, elle monte de 3. Quelle est son expression ?',
    options: ['f(x) = 3x − 4', 'f(x) = −4x + 3', 'f(x) = 3x + 4', 'f(x) = x − 4'],
    cols: 2,
    correct: 0,
    explain: "Le coefficient a est ce que gagne f quand x avance de 1 : a = 3. L'ordonnée à l'origine b se lit en x = 0 : b = −4. D'où f(x) = 3x − 4.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-3e_P11'] },
  },
  {
    id: 'fo-e10',
    skill: 'modele',
    title: 'Épreuve 10',
    prompt: 'Un plombier facture 40 € de déplacement puis 35 € par heure. Quelle fonction donne le prix pour x heures de travail ?',
    options: [
      'f(x) = 35x + 40',
      'f(x) = 40x + 35',
      'f(x) = 75x',
      'f(x) = 35x',
    ],
    cols: 2,
    correct: 0,
    explain: "Le tarif horaire multiplie la durée : 35x. Le déplacement se paie une seule fois, même pour zéro heure : + 40. C'est l'ordonnée à l'origine de la droite.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_fonctions-3e_P12'] },
  },
];

const BADGES = [
  { id: 'notion', emoji: '🏅', label: 'Mécanicien', test: (s) => (s.notion ?? 0) === 0 },
  { id: 'vocabulaire', emoji: '🏅', label: 'Traducteur des deux sens', test: (s) => (s.vocabulaire ?? 0) === 0 },
  { id: 'tableau', emoji: '🏅', label: 'Maître du tableau', test: (s) => (s.tableau ?? 0) === 0 },
  { id: 'graphique', emoji: '🏅', label: 'Lecteur de repère', test: (s) => (s.graphique ?? 0) === 0 },
  { id: 'familles', emoji: '🏅', label: 'Nomenclateur', test: (s) => (s.familles ?? 0) === 0 },
  { id: 'expression', emoji: '🏅', label: 'Enquêteur', test: (s) => (s.expression ?? 0) === 0 },
  { id: 'modele', emoji: '🏅', label: 'Modélisateur', test: (s) => (s.modele ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Sans faute', test: (s) => Object.values(s).every((v) => v === 0) },
];

const PIEGES = [
  { wrong: 'f(5) = 12 donc 5 est l’image de 12', right: '12 est l’image de 5 ; 5 est un antécédent de 12' },
  { wrong: 'Une image n’a qu’un seul antécédent', right: 'x² = 9 en a deux : −3 et 3' },
  { wrong: 'Le tableau contient toute la fonction', right: 'Il n’en montre que quelques couples ; la règle les donne tous' },
  { wrong: 'Linéaire, donc pas affine', right: 'Linéaire = affine avec b = 0' },
  { wrong: 'Le prix double si la distance double', right: 'Faux dès qu’il y a une prise en charge : f(x) = ax + b' },
];

const SYN_RULE = affine(2, -1);
const SYN_RANGE = { xMin: -3, xMax: 5, yMin: -5, yMax: 7 };

/** Synthèse : la machine signature figée, et la même fonction en trois habits. */
function Synthese() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-900 text-white p-4 text-center space-y-1">
        <p className="text-2xl">⚙️ 📋 📈</p>
        <p className="font-bold">Une seule fonction, trois façons de la voir</p>
        <p className="text-slate-300 text-sm">
          <MathText>{'$f(x) = 2x - 1$'}</MathText> — la machine, le tableau, la droite.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FunctionMachine rule={SYN_RULE} x={3} tested={tableOf(SYN_RULE, [0, 1, 2, 3])} frozen />
        <CoordPlane
          range={SYN_RANGE}
          unit={28}
          functions={[{ id: 'f', a: SYN_RULE.a, b: SYN_RULE.b, tone: 'indigo', label: 'f' }]}
          points={tableOf(SYN_RULE, [0, 1, 2, 3]).map((p) => ({ id: `s${p.x}`, x: p.x, y: p.y, color: '#059669' }))}
          intercept={{ y: SYN_RULE.b }}
          staircase={{ from: { x: 0, y: SYN_RULE.b }, a: SYN_RULE.a, run: 1 }}
          frozen
          caption={false}
          ariaLabel="Synthèse : la droite de f, ses points et son escalier"
        />
      </div>

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
        <p className="font-bold text-slate-800">Les mots, dans l’ordre où ils sont venus</p>
        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
          <li><strong>Fonction</strong> : un procédé qui associe à chaque nombre UNE sortie.</li>
          <li><strong>Image</strong> de x : le résultat, noté <MathText>{'$f(x)$'}</MathText>.</li>
          <li><strong>Antécédent</strong> de y : un nombre dont l’image est y — il peut y en avoir plusieurs.</li>
          <li><strong>Affine</strong> : <MathText>{'$f(x) = ax + b$'}</MathText>, représentée par une droite.</li>
          <li><strong>Linéaire</strong> : le cas <MathText>{'$b = 0$'}</MathText>, la droite passe par l’origine.</li>
        </ul>
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
        Une fonction, c’est une machine fiable. Tu sais maintenant la faire tourner dans les
        deux sens, la ranger en tableau, la dessiner, la nommer et la reconnaître dans une
        facture de taxi.
      </Feedback>
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
      moduleTitle="🏆 Mission finale : l’atelier des machines"
      moduleSubtitle="Dix épreuves pour prouver qu’aucune machine ne te résiste."
      estimatedTime="15 min"
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Dix machines à dompter',
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
        masterTitle: 'Chef d’atelier !',
        title: 'Atelier bouclé !',
        message: (
          <>
            De la boîte noire du début jusqu’au forfait téléphone, tu as fait tourner les
            machines dans les deux sens — sans confondre une image avec un antécédent, ni
            une linéaire avec une affine.
          </>
        ),
        verbs: ['Calculer', 'Remonter', 'Tracer', 'Modéliser'],
        masterBadgeLabel: 'Badge « Chef d’atelier » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
