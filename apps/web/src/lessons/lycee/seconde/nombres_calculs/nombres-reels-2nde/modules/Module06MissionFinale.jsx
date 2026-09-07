import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import RealLine from '../../../../../common/components/RealLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 6 — Boss Final « La diagonale » (moteur du kit, QCM uniquement).
 * Fichier de DONNÉES.
 *
 * Distracteurs = pièges des modules 1–6 : « √2 = 1,414 » (M1, M4) ·
 * « une racine est toujours irrationnelle » (M2, M5) · « 1/3 est décimal »
 * (M3) · troncature prise pour arrondi (M4) · arrondir en cours de calcul
 * (M5) · √n = n/2 (M6) · arrondir au plus proche quand la situation impose
 * le sens (M6) · lecture d'un point entre deux graduations (M1).
 *
 * Couverture : P1 → e1, e2 · P2 → e3, e10 · P3 → e2, e4, e5 · P4 → e6, e7 ·
 * P5 → e3, e8, e9, e10.
 */
const REGISTRE = [
  { id: 'zoom', emoji: '🔍', label: 'Zoom', value: '1,41 < √2 < 1,42' },
  { id: 'familles', emoji: '📦', label: 'Familles', value: 'ℕ⊂ℤ⊂𝔻⊂ℚ⊂ℝ' },
  { id: 'restes', emoji: '➗', label: 'Restes', value: '0 ou boucle' },
  { id: 'exact', emoji: '=', label: 'Exact', value: '√2, 1/3, 6π' },
];

const SKILLS = {
  droite: { label: 'Placer et lire sur la droite', module: 1 },
  familles: { label: 'Familles de nombres', module: 2 },
  division: { label: 'Décimal ou périodique', module: 3 },
  approche: { label: 'Exact et approché', module: 4 },
  encadrer: { label: 'Encadrer et comparer', module: 6 },
};

const tex = (o) => <MathText>{o}</MathText>;

const EPREUVES = [
  {
    id: 'nr-e1', skill: 'familles', title: 'Épreuve 1',
    requires: ['familles-emboitees', 'decimal', 'rationnel'],
    prompt: 'Laquelle de ces affirmations est vraie ?',
    options: ['Tout nombre décimal est un nombre rationnel', 'Tout nombre rationnel est un nombre décimal', 'Un nombre réel est toujours rationnel', 'ℚ ⊂ 𝔻'],
    cols: 1, correct: 0,
    explain: '0,75 = 75/100 : un décimal est un quotient d’entiers, donc rationnel (𝔻 ⊂ ℚ). L’inverse est faux : 1/3 est rationnel sans être décimal. Et √2 est réel sans être rationnel.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_nombres-reels-2nde_P1'] },
  },
  {
    id: 'nr-e2', skill: 'familles', title: 'Épreuve 2',
    requires: ['familles-emboitees', 'irrationnel', 'racine-carree'],
    prompt: 'Quelle est la plus petite famille contenant √36 ?',
    options: ['ℕ', '𝔻 sans être dans ℤ', 'ℚ sans être dans 𝔻', 'Les irrationnels'],
    cols: 2, correct: 0,
    explain: '√36 = 6 : un entier naturel. Une racine carrée n’est irrationnelle que si le nombre sous la racine n’est pas un carré parfait.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_nombres-reels-2nde_P1', 'seconde_nombres-reels-2nde_P3'] },
  },
  {
    id: 'nr-e3', skill: 'droite', title: 'Épreuve 3',
    requires: ['droite-reelle', 'methode-encadrer-decimales'],
    prompt: 'Le point marqué est √2. Quel encadrement lit-on sur cette fenêtre ?',
    extra: (
      <div className="rounded-2xl border border-slate-200 bg-white p-1">
        <RealLine min={1.4} max={1.5} step={0.01} format={(v) => v.toFixed(2).replace('.', ',')} points={[{ id: 'x', value: Math.SQRT2, label: '√2', tone: 'indigo' }]} ariaLabel="Fenêtre de 1,40 à 1,50 avec √2" />
      </div>
    ),
    options: ['1,41 < √2 < 1,42', '1,4 < √2 < 1,5', '1,42 < √2 < 1,43', '√2 = 1,41'],
    cols: 2, correct: 0,
    explain: 'Sur la fenêtre zoomée ×100, √2 est entre les graduations 1,41 et 1,42. « 1,4 < √2 < 1,5 » est vrai mais moins précis que ce que la fenêtre permet ; √2 = 1,41 est faux : √2 ne tombe sur aucune graduation.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_nombres-reels-2nde_P2', 'seconde_nombres-reels-2nde_P5'] },
  },
  {
    id: 'nr-e4', skill: 'division', title: 'Épreuve 4',
    requires: ['regle-restes-division', 'regle-fraction-finie-ou-periodique'],
    prompt: 'On pose la division de 4 par 11. Que se passe-t-il ?',
    options: ['Un reste revient : l’écriture est périodique (0,3636…)', 'Le reste tombe à 0 : 4/11 est décimal', 'Elle ne s’arrête ni ne se répète : 4/11 est irrationnel', 'Elle donne exactement 0,36'],
    cols: 1, correct: 0,
    explain: '4/11 : restes 4 → 7 → 4 : le reste 4 revient, la période est 36. Une fraction a TOUJOURS une écriture finie ou périodique ; 0,36 n’est qu’une valeur approchée.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_nombres-reels-2nde_P3'] },
  },
  {
    id: 'nr-e5', skill: 'division', title: 'Épreuve 5',
    requires: ['regle-restes-division', 'decimal'],
    prompt: 'Laquelle de ces fractions est un nombre décimal ?',
    options: ['$\\frac{7}{20}$', '$\\frac{1}{6}$', '$\\frac{5}{9}$', '$\\frac{2}{7}$'],
    renderOption: tex, optionLabel: (i) => ['7/20', '1/6', '5/9', '2/7'][i],
    cols: 4, correct: 0,
    explain: '7/20 = 0,35 : le dénominateur 20 = 2² × 5 n’a que des 2 et des 5, la division tombe sur un reste 0. 6, 9 et 7 contiennent un autre facteur : écritures périodiques.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_nombres-reels-2nde_P3'] },
  },
  {
    id: 'nr-e6', skill: 'approche', title: 'Épreuve 6',
    requires: ['arrondi-troncature'],
    prompt: 'Quel est l’arrondi au centième de 5/6 = 0,8333… ?',
    options: ['0,83', '0,84', '0,8', '0,833'],
    cols: 4, correct: 0,
    explain: 'Le chiffre après le centième est 3 (< 5) : on garde 0,83. 0,84 monterait sans raison ; 0,8 est l’arrondi au dixième ; 0,833 au millième.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_nombres-reels-2nde_P4'] },
  },
  {
    id: 'nr-e7', skill: 'approche', title: 'Épreuve 7',
    requires: ['mem-exact-puis-arrondir', 'arrondi-troncature'],
    prompt: 'Un disque a un rayon de 5 cm. Quelle écriture de son aire est EXACTE ?',
    options: ['$25\\pi$ cm²', '$78{,}5$ cm²', '$78{,}54$ cm²', '$78{,}5398$ cm²'],
    renderOption: tex, optionLabel: (i) => ['25π cm²', '78,5 cm²', '78,54 cm²', '78,5398 cm²'][i],
    cols: 2, correct: 0,
    explain: 'π × 5² = 25π, exactement. Toute écriture décimale de π est coupée : 78,5 ; 78,54 ; 78,5398 sont des valeurs approchées, à écrire avec ≈.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_nombres-reels-2nde_P4'] },
  },
  {
    id: 'nr-e8', skill: 'encadrer', title: 'Épreuve 8',
    requires: ['methode-encadrer-racine'],
    prompt: 'Sans calculatrice : entre quels entiers consécutifs se trouve √40 ?',
    options: ['6 et 7', '19 et 21', '5 et 6', '39 et 41'],
    cols: 4, correct: 0,
    explain: '6² = 36 ≤ 40 < 49 = 7², donc 6 < √40 < 7. √40 n’est ni la moitié de 40 (20) ni « 40 moins un peu ».',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_nombres-reels-2nde_P5'] },
  },
  {
    id: 'nr-e9', skill: 'encadrer', title: 'Épreuve 9',
    requires: ['methode-comparer-reels'],
    prompt: 'Range dans l’ordre croissant : 1,73 ; √3 ; 7/4 ; 1,7.   (√3 = 1,7320…)',
    options: ['1,7 < 1,73 < √3 < 7/4', '1,7 < √3 < 1,73 < 7/4', '7/4 < 1,7 < 1,73 < √3', '1,73 < 1,7 < √3 < 7/4'],
    cols: 1, correct: 0,
    explain: '7/4 = 1,75 et √3 = 1,732… : 1,7 < 1,73 < 1,732… < 1,75. Pour comparer, on met tout le monde en écriture décimale (approchée si besoin) — ou sur la même droite.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_nombres-reels-2nde_P5'] },
  },
  {
    id: 'nr-e10', skill: 'droite', title: 'Épreuve 10',
    requires: ['methode-encadrer-racine', 'regle-sens-arrondi'],
    prompt: 'Une planche doit mesurer √50 dm (≈ 7,07 dm). Le vendeur ne coupe qu’au décimètre entier et il faut que la planche soit assez longue. On demande :',
    options: ['8 dm', '7 dm', '7,07 dm', '25 dm'],
    cols: 4, correct: 0,
    explain: '7 ≤ √50 < 8 (49 ≤ 50 < 64) : 7 dm est trop court, il faut le premier entier au-dessus, 8 dm. 7,07 n’est pas un entier ; 25 serait la moitié de 50, qui n’a rien à voir avec √50.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_nombres-reels-2nde_P5', 'seconde_nombres-reels-2nde_P2'] },
  },
];

const BADGES = [
  { id: 'b-droite', emoji: '🔍', label: 'Droite et encadrements sans faute', test: (m) => !m.droite && !m.encadrer },
  { id: 'b-familles', emoji: '📦', label: 'Familles sans faute', test: (m) => !m.familles },
  { id: 'b-division', emoji: '➗', label: 'Divisions sans faute', test: (m) => !m.division },
  { id: 'b-approche', emoji: '≈', label: 'Exact / approché sans faute', test: (m) => !m.approche },
  { id: 'b-perfect', emoji: '💎', label: 'Dix sur dix', test: (m) => Object.values(m).every((v) => !v) },
];


export default function Module06MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="🏆 Mission finale : la diagonale"
      moduleSubtitle="Dix épreuves pour prouver qu’aucune écriture ne te trompe."
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{ tag: '🏆 Boss final', title: 'Le carreleur te confie ses mesures.', body: <p>Dix questions, aucune aide, une seule validation à la fin. Tes réponses deviennent ton profil de maîtrise.</p> }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître de la droite réelle',
        title: 'Leçon terminée',
        message: 'Tu sais placer un réel, reconnaître sa famille, distinguer une écriture exacte d’une valeur approchée, encadrer et comparer. La valeur absolue s’appuiera sur cette droite.',
        verbs: ['Zoomer', 'Classer', 'Approcher', 'Encadrer'],
        masterBadgeLabel: 'Tous les badges débloqués',
      }}
    />
  );
}
