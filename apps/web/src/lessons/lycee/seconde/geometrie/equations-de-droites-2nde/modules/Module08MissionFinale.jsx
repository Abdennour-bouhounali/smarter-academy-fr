import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import LineScene from '../components/LineScene';
import { FIGURES, pointAt, formatReduced, formatCartesian, reducedOf, cartesianOf } from '../components/lineUtils';

/**
 * Module 8 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Chaque
 * distracteur encode une erreur RÉELLEMENT rencontrée dans la leçon :
 *   - « le vecteur directeur est unique » / 2u change la droite (M1) ;
 *   - (a ; b) pris pour un vecteur directeur (M3, M6) ;
 *   - pente = avancée ÷ montée, signe oublié (M2) ;
 *   - p pris pour y du point, ou p confondu avec la pente (M4, M7) ;
 *   - toute droite aurait une équation réduite (M4) ;
 *   - appartenance jugée à l'œil ou en remplaçant y au lieu de x (M5).
 *
 * Les objets `assessment` sont écrits en toutes lettres. Les 12 LPs sont
 * tous couverts.
 */
const EPREUVES = [
  {
    id: 'eq-e1',
    requires: ['droite-vecteur-directeur', 'droite-point-direction'],
    skill: 'labo',
    title: 'Vecteurs directeurs',
    prompt: 'Une droite a pour vecteur directeur u (2 ; −3). Lesquels de ces vecteurs la dirigent aussi ?',
    options: ['(−4 ; 6) et (1 ; −1,5)', 'Seulement (−4 ; 6)', 'Aucun : le vecteur directeur est unique', '(3 ; 2) et (−3 ; −2)'],
    cols: 1,
    explain: 'Tout vecteur non nul colinéaire à u dirige la même droite : (−4 ; 6) = −2u et (1 ; −1,5) = 0,5u. (3 ; 2) n’est pas colinéaire à (2 ; −3).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_equations-de-droites-2nde_P1'] },
  },
  {
    id: 'eq-e2',
    requires: ['droite-equation-cartesienne', 'droite-lire-cartesienne'],
    skill: 'equation',
    title: 'Lire un vecteur directeur',
    prompt: 'Un vecteur directeur de la droite 3x + 2y − 6 = 0 est…',
    options: ['(−2 ; 3)', '(3 ; 2)', '(2 ; 3)', '(2 ; −3) seulement'],
    cols: 4,
    explain: 'Pour a·x + b·y + c = 0, (−b ; a) = (−2 ; 3) dirige la droite (et (2 ; −3) aussi, son opposé). (3 ; 2) = (a ; b) est perpendiculaire à la droite.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_equations-de-droites-2nde_P2', 'seconde_equations-de-droites-2nde_P9'] },
  },
  {
    id: 'eq-e3',
    requires: ['droite-calculer-pente', 'droite-pente'],
    skill: 'pente',
    title: 'Pente entre deux points',
    prompt: 'P (−1 ; 2) et Q (3 ; −4). Pente de (PQ) ?',
    options: ['−1,5', '−0,67', '1,5', '−6'],
    cols: 4,
    explain: 'Montée : −4 − 2 = −6 ; avancée : 3 − (−1) = 4 ; pente = −6 ÷ 4 = −1,5. −0,67 inverse le quotient, 1,5 oublie le signe, −6 est la montée seule.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_equations-de-droites-2nde_P3', 'seconde_equations-de-droites-2nde_P4'] },
  },
  {
    id: 'eq-e4',
    requires: ['droite-methode-deux-points', 'droite-equation-reduite'],
    skill: 'atelier',
    title: 'Par deux points',
    prompt: 'Équation réduite de la droite passant par (0 ; −2) et (2 ; 2) ?',
    options: ['y = 2x − 2', 'y = −2x + 2', 'y = 0,5x − 2', 'y = 2x + 2'],
    cols: 2,
    explain: 'Pente (2 − (−2))/(2 − 0) = 2 ; le point (0 ; −2) donne p = −2. y = 2x − 2. Vérifie : 2 × 2 − 2 = 2 ✓.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_equations-de-droites-2nde_P5'] },
  },
  {
    id: 'eq-e5',
    requires: ['droite-methode-point-vecteur', 'droite-equation-cartesienne'],
    skill: 'atelier',
    title: 'Par un point et un vecteur directeur',
    prompt: 'Droite passant par A (1 ; −2), de vecteur directeur u (2 ; 1). Équation cartésienne ?',
    options: ['x − 2y − 5 = 0', 'x − 2y + 5 = 0', '2x + y = 0', '2x − y − 4 = 0'],
    cols: 2,
    explain: 'a = u_y = 1, b = −u_x = −2 : x − 2y + c = 0 ; A dessus : 1 + 4 + c = 0, c = −5. Vérifie : (−b ; a) = (2 ; 1) = u ✓.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_equations-de-droites-2nde_P6'] },
  },
  {
    id: 'eq-e6',
    requires: ['droite-methode-point-pente', 'droite-equation-reduite'],
    skill: 'atelier',
    title: 'Par un point et une pente',
    prompt: 'Droite passant par (2 ; 3), de pente −1. Équation réduite ?',
    options: ['y = −x + 5', 'y = −x + 3', 'y = −x + 1', 'y = x + 1'],
    cols: 4,
    explain: 'y = −x + p avec 3 = −2 + p, donc p = 5. p n’est pas y du point (3) : c’est le cas seulement si x = 0.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_equations-de-droites-2nde_P7'] },
  },
  {
    id: 'eq-e7',
    requires: ['droite-lire-equation', 'droite-ordonnee-origine', 'droite-role-m-p'],
    skill: 'coefficients',
    title: 'Lire y = mx + p',
    prompt: 'Dans y = −0,5x + 4, que représente le nombre 4 ?',
    options: [
      'L’ordonnée à l’origine : la droite passe par (0 ; 4)',
      'La pente : la droite monte de 4 par unité',
      'L’abscisse du point où la droite coupe l’axe des x',
      'La longueur de la droite',
    ],
    cols: 1,
    explain: 'p = 4 est la valeur de y quand x = 0 : la droite coupe l’axe des ordonnées en (0 ; 4). La pente est −0,5. Elle coupe l’axe des abscisses en x = 8.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_equations-de-droites-2nde_P8'] },
  },
  {
    id: 'eq-e8',
    requires: ['droite-verticale', 'droite-equation-cartesienne'],
    skill: 'coefficients',
    title: 'La verticale',
    prompt: 'La droite passant par (3 ; 1) et (3 ; −4)…',
    options: [
      'a pour équation cartésienne x − 3 = 0 et n’a pas d’équation réduite',
      'a pour équation réduite y = 3',
      'a une pente infinie, donc y = ∞·x',
      'n’existe pas : deux points de même abscisse ne définissent pas de droite',
    ],
    cols: 1,
    explain: 'Deux points de même abscisse : la droite est verticale, x = 3, soit x − 3 = 0 (a = 1, b = 0). Aucun m ne convient : pas d’équation réduite, pas de pente.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_equations-de-droites-2nde_P9', 'seconde_equations-de-droites-2nde_P8'] },
  },
  {
    id: 'eq-e9',
    requires: ['droite-tracer', 'droite-appartenance'],
    skill: 'coefficients',
    title: 'Tracer',
    prompt: 'Pour tracer la droite y = −x + 2, quels points peut-on placer ?',
    options: ['(0 ; 2) et (2 ; 0)', '(2 ; 0) et (0 ; −2)', '(0 ; −1) et (1 ; 2)', '(1 ; 1) et (−1 ; −1)'],
    cols: 2,
    explain: 'x = 0 donne y = 2 ; x = 2 donne y = 0. Les deux points vérifient l’équation. (0 ; −2) donnerait −2 = 2, faux ; (1 ; 1) : 1 = −1 + 2 ✓ mais (−1 ; −1) : −1 ≠ 3.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_equations-de-droites-2nde_P10'] },
  },
  {
    id: 'eq-e10',
    requires: ['droite-alignement-equation', 'droite-methode-tester-point'],
    skill: 'appartenance',
    title: 'Alignés ?',
    prompt: 'A (−2 ; −3), B (1 ; 3), C (3 ; 7). La droite (AB) a pour équation y = 2x + 1. Les trois points sont-ils alignés ?',
    options: [
      'Oui : 2 × 3 + 1 = 7 = y_C, donc C est sur (AB)',
      'Non : C est trop loin de A et B',
      'Oui : sur un dessin, ils ont l’air alignés',
      'Non : 2 × 7 + 1 ≠ 3',
    ],
    cols: 1,
    explain: 'On remplace x par x_C = 3 : 2 × 3 + 1 = 7, qui est bien y_C. C vérifie l’équation de (AB) : alignés. On remplace toujours x, jamais y.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_equations-de-droites-2nde_P11', 'seconde_equations-de-droites-2nde_P12'] },
  },
];

const SKILLS = {
  labo: { label: 'Point + direction', module: 1 },
  pente: { label: 'Pente', module: 2 },
  equation: { label: 'De la droite à l’équation', module: 3 },
  coefficients: { label: 'Coefficients et tracé', module: 4 },
  appartenance: { label: 'Appartenance, alignement', module: 5 },
  atelier: { label: 'Déterminer une équation', module: 7 },
};

const BADGES = [
  { id: 'b-labo', emoji: '🏅', label: 'Un point, une flèche', test: (m) => !m.labo },
  { id: 'b-pente', emoji: '🏅', label: 'Montée sur avancée', test: (m) => !m.pente },
  { id: 'b-eq', emoji: '🏅', label: 'Lecteur d’équations', test: (m) => !m.equation },
  { id: 'b-coef', emoji: '🏅', label: 'm tourne, p glisse', test: (m) => !m.coefficients },
  { id: 'b-app', emoji: '🏅', label: 'L’équation tranche', test: (m) => !m.appartenance },
  { id: 'b-atelier', emoji: '🏅', label: 'Constructeur de droites', test: (m) => !m.atelier },
  { id: 'b-parfait', emoji: '💎', label: 'Maître des droites', test: (m) => Object.keys(m).length === 0 },
];

/** La synthèse : la droite fil rouge, sa flèche, ses points A + t·u, ses deux équations. */
function Synthese() {
  const line = FIGURES.fil;
  const pts = [-3, -2, -1, 2].map((t) => ({ id: `t${t}`, ...pointAt(line.A, line.u, t), color: '#059669' }));
  return (
    <div className="space-y-4">
      <LineScene line={line} showArrow frozen points={pts} ariaLabel={`La droite fil rouge ${formatReduced(reducedOf(line))}, sa flèche u et des points A + t·u`} />
      <div className="grid sm:grid-cols-3 gap-2 text-sm">
        {[
          { t: 'Un point, une direction', d: 'A (1 ; 3), u (1 ; 2) — et tout k·u. Points A + t·u.' },
          { t: 'Une relation', d: `det(AM, u) = 0 ⇔ ${formatCartesian(cartesianOf(line))} ⇔ ${formatReduced(reducedOf(line))}.` },
          { t: 'Un test', d: 'M est sur la droite ⇔ ses coordonnées vérifient l’équation.' },
        ].map(({ t, d }) => (
          <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
            <p className="font-semibold text-slate-800">{t}</p>
            <p className="text-xs text-slate-600">{d}</p>
          </div>
        ))}
      </div>
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
      moduleTitle="🏆 Mission finale : la droite"
      moduleSubtitle="Dix épreuves pour prouver qu’aucune droite ne garde de secret pour toi"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître des droites',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Réflexe à chaque fois : la direction d’abord
            (vecteur ou pente), puis le point.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '➡️', label: 'Vecteur directeur', value: '(−b ; a)' },
        { id: 'r2', emoji: '📐', label: 'Pente', value: 'u_y / u_x' },
        { id: 'r3', emoji: '📈', label: 'Réduite', value: 'y = mx + p' },
        { id: 'r4', emoji: '🧮', label: 'Appartenance', value: 'vérifie l’équation' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Maître des droites !',
        title: 'Mission accomplie',
        message: 'Tu sais construire, lire, tracer une droite et tester un point avec son équation.',
        verbs: ['Construire', 'Lire', 'Tracer', 'Tester'],
        masterBadgeLabel: 'Maître des droites',
      }}
    />
  );
}
