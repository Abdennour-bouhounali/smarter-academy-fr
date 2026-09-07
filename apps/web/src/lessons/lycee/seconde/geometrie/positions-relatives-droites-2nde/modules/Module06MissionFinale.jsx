import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 6 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Chaque
 * distracteur encode une erreur RÉELLEMENT rencontrée dans la leçon :
 *   - « pas de croisement sur le dessin ⇒ parallèles » (M1, M4) ;
 *   - « éloigner B rend parallèle » — position prise pour direction (M1) ;
 *   - « même pente ⇒ même droite » (M3) ; la verticale « a une pente » (M2) ;
 *   - déterminant calculé sans croiser, ou additionné (M2) ;
 *   - écritures cartésienne / réduite jugées différentes (M3, M5) ;
 *   - système : x non rassemblés, division oubliée, « 2 = −1 donc erreur » (M4).
 *
 * Les objets `assessment` sont écrits en toutes lettres. Les 8 LPs sont
 * tous couverts. La synthèse est la CARTE DES CONNAISSANCES COMPLÈTE.
 */
const EPREUVES = [
  {
    id: 'pr-e1',
    requires: ['positions-trois-cas', 'critere-equations-reduites', 'methode-interpretation-graphique'],
    skill: 'labo',
    title: 'Hors du dessin',
    prompt: 'Sur une figure, deux droites (d₁) : y = 0,5x + 2 et (d₂) : y = 0,6x − 4 ne se coupent pas dans le cadre. Que peut-on affirmer ?',
    options: [
      'Elles sont sécantes : leurs coefficients directeurs diffèrent, le point commun est simplement hors du cadre.',
      'Elles sont parallèles : elles ne se coupent pas.',
      'On ne peut rien dire sans agrandir le dessin.',
      'Elles sont confondues.',
    ],
    cols: 1,
    explain: '0,5 ≠ 0,6 : les directions diffèrent, donc UN point commun existe — en x = 60 (0,5x + 2 = 0,6x − 4 ⟺ 6 = 0,1x). Le cadre d’un dessin ne décide de rien.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_positions-relatives-droites-2nde_P2', 'seconde_positions-relatives-droites-2nde_P7'] },
  },
  {
    id: 'pr-e2',
    requires: ['positions-trois-cas', 'mem-trois-comptes', 'vocab-secantes-paralleles-confondues'],
    skill: 'labo',
    title: 'Points communs',
    prompt: 'Deux droites distinctes du plan ont exactement…',
    options: ['0 ou 1 point commun', '0, 1 ou 2 points communs', '1 point commun, toujours', '0, 1 ou une infinité de points communs'],
    cols: 2,
    explain: 'Deux droites DISTINCTES sont sécantes (1 point) ou strictement parallèles (0). « Une infinité » correspond à des droites confondues, donc non distinctes. Deux points communs forceraient les droites à être la même.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_positions-relatives-droites-2nde_P1', 'seconde_positions-relatives-droites-2nde_P2'] },
  },
  {
    id: 'pr-e3',
    requires: ['critere-vecteurs-directeurs', 'formule-det-directions', 'methode-comparer-directions'],
    skill: 'direction',
    title: 'Vecteurs directeurs',
    prompt: '(d₁) a pour vecteur directeur u(3 ; −2) et (d₂) v(−6 ; 4). Position relative ?',
    options: ['Parallèles ou confondues : det(u, v) = 0', 'Sécantes : det(u, v) = −24', 'Sécantes : les vecteurs sont de sens contraires', 'Confondues, forcément'],
    cols: 1,
    explain: 'det = 3 × 4 − (−2) × (−6) = 12 − 12 = 0 : même direction (v = −2u). Le sens ne compte pas. Reste à savoir si un point de l’une est sur l’autre pour départager parallèles / confondues.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_positions-relatives-droites-2nde_P1', 'seconde_positions-relatives-droites-2nde_P3'] },
  },
  {
    id: 'pr-e4',
    requires: ['critere-vecteurs-directeurs', 'critere-pentes', 'methode-comparer-directions'],
    skill: 'direction',
    title: 'La verticale',
    prompt: '(d₁) : x = 2 et (d₂) : y = 3x + 1. Comment décider de leur position relative ?',
    options: [
      'Elles sont sécantes : (d₁) est verticale (pas de pente), (d₂) ne l’est pas ; det((0 ; 1), (1 ; 3)) = −1 ≠ 0.',
      'Elles sont parallèles : la pente de x = 2 vaut 2 et celle de (d₂) vaut 3, presque égales.',
      'On ne peut pas comparer : x = 2 n’a pas de pente.',
      'Elles sont confondues en x = 2.',
    ],
    cols: 1,
    explain: 'Une droite verticale n’a pas de pente, mais elle a un vecteur directeur, (0 ; 1). Le déterminant avec (1 ; 3) vaut 0 × 3 − 1 × 1 = −1 ≠ 0 : sécantes, au point (2 ; 7).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_positions-relatives-droites-2nde_P3', 'seconde_positions-relatives-droites-2nde_P2'] },
  },
  {
    id: 'pr-e5',
    requires: ['critere-equations-reduites', 'mem-m-decide-p-departage', 'vocab-secantes-paralleles-confondues'],
    skill: 'equations',
    title: 'Même pente ?',
    prompt: 'y = −2x + 5 et y = −2x − 1. Position relative ?',
    options: ['Strictement parallèles', 'Confondues', 'Sécantes', 'Parallèles et confondues à la fois'],
    cols: 2,
    explain: 'Même coefficient directeur (−2) : même direction. Ordonnées à l’origine différentes (5 et −1) : pas la même droite. Strictement parallèles.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_positions-relatives-droites-2nde_P4', 'seconde_positions-relatives-droites-2nde_P1'] },
  },
  {
    id: 'pr-e6',
    requires: ['critere-equations-cartesiennes', 'methode-ramener-meme-ecriture', 'critere-equations-reduites'],
    skill: 'equations',
    title: 'Deux écritures',
    prompt: '3x − y + 2 = 0 et y = 3x + 2. Position relative ?',
    options: ['Confondues', 'Strictement parallèles', 'Sécantes', 'Impossible à comparer'],
    cols: 2,
    explain: '3x − y + 2 = 0 ⟺ y = 3x + 2 : la même droite, écrite sous deux formes. Toujours ramener à une même écriture avant de comparer.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_positions-relatives-droites-2nde_P4'] },
  },
  {
    id: 'pr-e7',
    requires: ['point-intersection-systeme', 'methode-resoudre-systeme', 'formule-abscisse-intersection'],
    skill: 'intersection',
    title: 'Le point commun',
    prompt: 'y = 2x − 1 et y = −x + 5. Coordonnées du point d’intersection ?',
    options: ['(2 ; 3)', '(4 ; 7)', '(2 ; 7)', '(−4 ; −9)'],
    cols: 4,
    explain: '2x − 1 = −x + 5 ⟺ 3x = 6 ⟺ x = 2, puis y = 2 × 2 − 1 = 3. (4 ; 7) vient de 2x = 8 (x non rassemblés) ; (2 ; 7) mélange x = 2 avec y = −x + 5 mal calculé.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_positions-relatives-droites-2nde_P5', 'seconde_positions-relatives-droites-2nde_P6'] },
  },
  {
    id: 'pr-e8',
    requires: ['regle-nombre-solutions', 'point-intersection-systeme', 'mem-intersection-systeme'],
    skill: 'intersection',
    title: 'Le système',
    prompt: 'Un système de deux équations de droites conduit à 4 = 4. Combien de solutions ?',
    options: ['Une infinité : les droites sont confondues', 'Aucune : les droites sont parallèles', 'Une seule : x = 4', 'Le calcul est faux'],
    cols: 1,
    explain: 'Une égalité toujours vraie signifie que tout point de l’une vérifie l’équation de l’autre : droites confondues, infinité de solutions. Une égalité fausse (2 = −1) donnerait au contraire « aucune ».',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_positions-relatives-droites-2nde_P6', 'seconde_positions-relatives-droites-2nde_P7'] },
  },
  {
    id: 'pr-e9',
    requires: ['methode-parallele-par-un-point', 'critere-equations-reduites'],
    skill: 'probleme',
    title: 'La parallèle',
    prompt: 'Équation de la droite parallèle à y = −3x + 1 passant par E(2 ; −1) ?',
    options: ['y = −3x + 5', 'y = −3x + 1', 'y = −3x − 1', 'y = 3x − 7'],
    cols: 2,
    explain: 'Parallèle ⟹ même coefficient directeur −3. E vérifie l’équation : −1 = −3 × 2 + p, donc p = 5. y = −3x + 1 est la droite de départ, y = −3x − 1 prend l’ordonnée de E pour p.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_positions-relatives-droites-2nde_P8', 'seconde_positions-relatives-droites-2nde_P4'] },
  },
  {
    id: 'pr-e10',
    requires: ['methode-ab-cd', 'critere-vecteurs-directeurs', 'regle-direction-position'],
    skill: 'probleme',
    title: 'Quatre points',
    prompt: 'A(1 ; 1), B(3 ; 2), C(0 ; 4), D(4 ; 6). Les droites (AB) et (CD) sont…',
    options: ['Strictement parallèles', 'Sécantes', 'Confondues', 'Impossible à dire sans figure'],
    cols: 2,
    explain: 'AB(2 ; 1), CD(4 ; 2) : det = 2 × 2 − 1 × 4 = 0, même direction. (AB) : y = 0,5x + 0,5 ; C(0 ; 4) donne 0,5 ≠ 4, donc C n’est pas sur (AB) : strictement parallèles.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_positions-relatives-droites-2nde_P8', 'seconde_positions-relatives-droites-2nde_P1', 'seconde_positions-relatives-droites-2nde_P3'] },
  },
];

const SKILLS = {
  labo: { label: 'Trois positions, points communs', module: 1 },
  direction: { label: 'Direction : déterminant et pentes', module: 2 },
  equations: { label: 'Décider avec les équations', module: 3 },
  intersection: { label: 'Point d’intersection et système', module: 4 },
  probleme: { label: 'Résoudre un problème', module: 5 },
};

const BADGES = [
  { id: 'b-labo', emoji: '🏅', label: 'Trois situations', test: (m) => !m.labo },
  { id: 'b-dir', emoji: '🏅', label: 'Le déterminant tranche', test: (m) => !m.direction },
  { id: 'b-eq', emoji: '🏅', label: 'm décide, p départage', test: (m) => !m.equations },
  { id: 'b-int', emoji: '🏅', label: 'Le point exact', test: (m) => !m.intersection },
  { id: 'b-prob', emoji: '🏅', label: 'Stratège', test: (m) => !m.probleme },
  { id: 'b-parfait', emoji: '💎', label: 'Contrôleur aérien', test: (m) => Object.keys(m).length === 0 },
];

export default function Module06MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le croisement"
      moduleSubtitle="Dix épreuves pour prouver que tu sais où deux droites se rencontrent"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Contrôleur aérien',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune, demande-toi d’abord : <strong>même direction ?</strong> — puis, si oui,
            <strong> même position ?</strong> — sinon, <strong>où est le point commun ?</strong>
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '✖️', label: 'Sécantes', value: '1 point' },
        { id: 'r2', emoji: '∥', label: 'Parallèles', value: 'det = 0' },
        { id: 'r3', emoji: '≡', label: 'Confondues', value: 'm et p égaux' },
        { id: 'r4', emoji: '⚖️', label: 'Intersection', value: 'système' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Contrôleur aérien !',
        title: 'Mission accomplie',
        message: 'Tu sais décider si deux droites se croisent, où, et le prouver par le calcul.',
        verbs: ['Décider', 'Comparer', 'Résoudre', 'Prouver'],
        masterBadgeLabel: 'Contrôleur aérien',
      }}
    />
  );
}
