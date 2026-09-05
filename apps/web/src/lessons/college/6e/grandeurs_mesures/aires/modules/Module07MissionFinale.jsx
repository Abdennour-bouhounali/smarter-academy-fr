import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import AreaGrid from '../components/AreaGrid';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — Boss Final sur le moteur du kit partagé (QCM uniquement).
 *
 * Voir docs/architecture/LESSON_INTEGRATION_GUIDE.md §7 : ce fichier est un
 * fichier de DONNÉES — épreuves, compétences, badges, synthèse — zéro
 * logique recopiée. Le moteur `BossFinal` applique par construction la
 * forme obligatoire et branche l'evidence + la persistance de tentative.
 *
 * Histoire unique : la classe rénove la cour et la salle d'arts plastiques
 * (peinture, pelouse, carrelage, plans). Les métadonnées `assessment`
 * couvrent les 7 LPs.
 */
const REGISTRE = [
  { id: 'peinture', emoji: '🎨', label: 'Peinture', value: 'murs' },
  { id: 'pelouse', emoji: '🌱', label: 'Pelouse', value: 'cour' },
  { id: 'carrelage', emoji: '🧱', label: 'Carrelage', value: 'préau' },
  { id: 'plans', emoji: '📋', label: 'Plans', value: 'en m²' },
];

const SKILLS = {
  notion: { label: 'L’aire comme surface', module: 1 },
  comparer: { label: 'Comparer des surfaces', module: 2 },
  paver: { label: 'Mesurer par pavage', module: 3 },
  formule: { label: 'Aire du rectangle et du carré', module: 4 },
  unites: { label: 'Unités d’aire', module: 5 },
  problemes: { label: 'Problèmes d’aires', module: 6 },
};

const MOSAIQUE_OUTLINE = [0, 1, 2, 4, 5, 6, 8, 9];
const MOSAIQUE_HALVES = [{ index: 2, corner: 'bl' }, { index: 6, corner: 'tl' }];

const EPREUVES = [
  {
    id: 'ai-e1',
    skill: 'notion',
    title: 'Épreuve 1',
    prompt: 'Sur le plan, on commande la pelouse de la cour. Que mesure-t-on pour savoir COMBIEN de pelouse acheter ?',
    options: ['Le tour de la cour', 'La surface de la cour', 'La longueur de la cour'],
    cols: 3,
    correct: 1,
    explain: 'La pelouse recouvre une SURFACE : c’est l’aire de la cour qu’il faut connaître, pas son tour ni sa longueur.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_aires_P1'] },
  },
  {
    id: 'ai-e2',
    skill: 'comparer',
    title: 'Épreuve 2',
    prompt: 'Deux dalles sont découpées différemment à partir de la même plaque de 8 carreaux, sans perte. Que peut-on dire de leurs aires ?',
    options: [
      'Elles sont égales : découper-recoller conserve l’aire',
      'La dalle la plus allongée a une aire plus grande',
      'Impossible à savoir sans mesurer les contours',
    ],
    cols: 1,
    correct: 0,
    explain: 'On n’a rien ajouté ni enlevé : 8 carreaux restent 8 carreaux, quelle que soit la forme. Le contour ne renseigne pas l’aire.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_aires_P2'] },
  },
  {
    id: 'ai-e3',
    skill: 'comparer',
    title: 'Épreuve 3',
    prompt: 'Deux bacs à fleurs ont exactement le même périmètre. Contiennent-ils forcément la même surface de terre ?',
    options: [
      'Oui : même tour, même surface',
      'Non : à périmètre égal, les aires peuvent être très différentes',
    ],
    cols: 1,
    correct: 1,
    explain: 'Un carré 3×3 et une barre 1×5 ont tous deux 12 unités de tour, mais 9 et 5 carreaux d’aire. Le périmètre ne prédit pas l’aire.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_aires_P2', '6e_aires_P1'] },
  },
  {
    id: 'ai-e4',
    skill: 'paver',
    title: 'Épreuve 4',
    prompt: 'La mosaïque du préau couvre 6 carreaux entiers et 2 demi-carreaux. Quelle est son aire ?',
    extra: <AreaGrid rows={3} cols={4} cells={MOSAIQUE_OUTLINE} outline={MOSAIQUE_OUTLINE} halfCells={MOSAIQUE_HALVES} unit="carreau" tone="sky" ariaLabel="Mosaïque du préau" />,
    options: ['6 carreaux', '7 carreaux', '8 carreaux'],
    cols: 3,
    correct: 1,
    explain: '6 entiers + 2 demis (= 1 entier) : 7 carreaux. Les demi-carreaux s’assemblent.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_aires_P3'] },
  },
  {
    id: 'ai-e5',
    skill: 'paver',
    title: 'Épreuve 5',
    prompt: 'Pour mesurer l’aire du préau entier, quel carreau-unité choisir ?',
    options: ['1 cm² (il en faudrait des millions)', '1 m² (quelques centaines suffisent)', '1 km² (le préau n’en remplit pas un)'],
    cols: 1,
    correct: 1,
    explain: 'L’unité adaptée donne un compte raisonnable : le m² pour un préau, comme le cm² pour un cahier ou le km² pour une ville.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_aires_P3'] },
  },
  {
    id: 'ai-e6',
    skill: 'formule',
    title: 'Épreuve 6',
    prompt: 'Le mur à peindre mesure 5 m sur 2,5 m. Son aire ?',
    options: ['7,5 m²', '12,5 m²', '15 m²'],
    cols: 3,
    correct: 1,
    explain: 'A = L × l = 5 × 2,5 = 12,5 m². (15, c’est 2 × (5 + 2,5) : le périmètre !)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_aires_P5'] },
  },
  {
    id: 'ai-e7',
    skill: 'formule',
    title: 'Épreuve 7',
    prompt: 'Chaque dalle du carrelage est un carré de 30 cm de côté. L’aire d’une dalle ?',
    options: ['120 cm²', '900 cm²', '60 cm²'],
    cols: 3,
    correct: 1,
    explain: 'A = c × c = 30 × 30 = 900 cm². (120 cm, c’est le périmètre 4 × 30 — et il s’écrirait en cm, pas en cm².)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_aires_P5'] },
  },
  {
    id: 'ai-e8',
    skill: 'formule',
    title: 'Épreuve 8',
    prompt: 'La salle d’arts en L se découpe en un rectangle 6 m × 4 m et un carré de 2 m de côté. Aire totale ?',
    options: ['24 m²', '28 m²', '32 m²'],
    cols: 3,
    correct: 1,
    explain: '6 × 4 = 24 m², plus 2 × 2 = 4 m² : total 28 m². Décomposer, calculer, additionner.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_aires_P6'] },
  },
  {
    id: 'ai-e9',
    skill: 'unites',
    title: 'Épreuve 9',
    prompt: 'Le devis du carreleur est en cm², le plan en m². Combien vaut 2 m² en cm² ?',
    options: ['200 cm²', '2 000 cm²', '20 000 cm²'],
    cols: 3,
    correct: 2,
    explain: 'Deux marches de ×100 : 2 m² = 200 dm² = 20 000 cm². Les aires sautent de DEUX zéros par marche.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_aires_P4'] },
  },
  {
    id: 'ai-e10',
    skill: 'problemes',
    title: 'Épreuve 10',
    prompt: 'Dernier chantier : le mur du fond fait 4 m × 3 m, percé d’une porte de 1 m × 2 m. Un pot de peinture couvre 5 m². Combien de pots ?',
    options: ['2 pots', '3 pots', '12 pots'],
    cols: 3,
    correct: 0,
    explain: 'Mur : 12 m², porte : 2 m² → à peindre : 10 m². Deux pots couvrent exactement 10 m². (12 pots, c’est confondre m² et pots !)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_aires_P7', '6e_aires_P6'] },
  },
];

const BADGES = [
  { id: 'surface', emoji: '🏅', label: 'Œil de surface', test: (s) => (s.notion ?? 0) === 0 && (s.comparer ?? 0) === 0 },
  { id: 'paveur', emoji: '🏅', label: 'Paveur précis', test: (s) => (s.paver ?? 0) === 0 },
  { id: 'formules', emoji: '🏅', label: 'Maître du L × l', test: (s) => (s.formule ?? 0) === 0 },
  { id: 'unites', emoji: '🏅', label: 'Virtuose du ×100', test: (s) => (s.unites ?? 0) === 0 },
  { id: 'chantier', emoji: '🏅', label: 'Chef de chantier', test: (s) => (s.problemes ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Architecte d’or', test: (s) => Object.values(s).every((v) => v === 0) },
];

const PIEGES = [
  { wrong: 'Juger une aire à son contour', right: 'Recouvrir et compter — le périmètre ne prédit rien' },
  { wrong: '1 dm² = 10 cm²', right: '1 dm² = 100 cm² — les aires sautent par ×100' },
  { wrong: 'A = 2 × (L + l)', right: 'Ça, c’est le périmètre. L’aire du rectangle : A = L × l' },
  { wrong: 'Écrire une aire en m', right: 'Une aire s’écrit en m², cm²… jamais en unités de longueur' },
];

function Synthese() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-3 text-center">
        <div className="text-2xl" aria-hidden="true">▦</div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
          L'aire mesure la quantité de surface : elle se découvre en recouvrant, se conserve au
          découpage-recollage, et se calcule en multipliant.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 space-y-3">
        <p className="text-sm font-semibold text-slate-700 text-center">Le plan de la cour rénovée</p>
        <AreaGrid
          rows={3}
          cols={7}
          cells={Array.from({ length: 21 }, (_, i) => i)}
          unit="m²"
          showRowColHints
          tone="emerald"
          ariaLabel="Cour rénovée pavée"
        />
        <p className="text-center font-mono text-sm text-slate-600">
          3 lignes × 7 colonnes = <strong>21 m²</strong> — compter les lignes, c'est multiplier.
        </p>
      </div>

      <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-2xl p-5 text-center space-y-1">
        <p className="text-xs uppercase tracking-wide text-violet-100 font-mono font-bold">À retenir</p>
        <p className="font-mono font-extrabold text-base sm:text-lg">Rectangle : A = L × l · Carré : A = c × c</p>
        <p className="font-mono font-extrabold text-base sm:text-lg">1 m² = 100 dm² = 10 000 cm²</p>
      </div>

      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 space-y-2.5">
        <p className="text-sm font-bold text-amber-900">Les pièges à éviter</p>
        {PIEGES.map((p) => (
          <div key={p.wrong} className="text-sm space-y-0.5">
            <div className="text-rose-700">❌ {p.wrong}</div>
            <div className="text-emerald-700">✅ {p.right}</div>
          </div>
        ))}
      </div>

      <Feedback tone="info">
        Aire et périmètre vivent sur la même figure mais ne se parlent pas : l'un mesure le dedans, l'autre le
        tour. Toujours vérifier QUELLE grandeur le problème demande.
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
      moduleTitle="🏆 Mission finale : le chantier de l’école"
      moduleSubtitle="Dix épreuves pour rénover la cour et la salle d’arts."
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'La classe rénove l’école : peinture, pelouse, carrelage.',
        tone: 'amber',
        body: (
          <p>
            Chaque commande dépend d'une aire bien mesurée : pavage, formules, conversions et pièges de périmètre.
            Réponds à toutes les épreuves, puis valide pour découvrir ta correction et tes badges de maîtrise.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Architecte d’or !',
        title: 'Mission accomplie !',
        message: (
          <>
            De la guerre des pelouses au chantier de l'école, tu as recouvert, découpé, multiplié et converti des
            surfaces — sans jamais te faire piéger par le contour.
          </>
        ),
        verbs: ['Recouvrir', 'Comparer', 'Calculer', 'Convertir'],
        masterBadgeLabel: 'Badge « Architecte d’or » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
