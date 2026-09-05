import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import {
  INSTRUMENTS, INSTRUMENTS_LIST, PROGRAMME_RECTANGLE, ERREURS,
} from '../components/constructionsUtils';

/**
 * Module 7 — ÉVALUATION (« Boss final ») — et clôture du chapitre.
 *
 * Fichier de DONNÉES : le moteur vit dans common/kit/BossFinal.jsx.
 *
 * Distracteurs, tous adossés à un piège réellement travaillé :
 *   - « à main levée, c'est presque juste »          (module 1)
 *   - le piège du zéro sur la règle                  (module 2)
 *   - croire qu'il faut mesurer pour reporter        (module 3)
 *   - deux instruments pour deux constructions       (module 4)
 *   - un programme dont l'ordre ne compterait pas    (module 5)
 *   - « presque un carré »                           (module 6)
 *
 * Couverture des LP : P1(e1) P2(e5) P3(e3) P4(e2) P5(e4) P6(e6) P7(e5)
 * P8(e7) P9(e8) P10(e9) P11(e10) P12(e8) — les 12 LP sont évalués.
 */
const SKILLS = {
  regle: { label: 'La règle graduée', module: 2 },
  compas: { label: 'Le compas', module: 3 },
  equerre: { label: 'L’équerre', module: 4 },
  choisir: { label: 'Choisir l’instrument', module: 1 },
  programme: { label: 'Le programme de construction', module: 5 },
  verifier: { label: 'Vérifier et corriger', module: 6 },
};

const EPREUVES = [
  {
    id: 'cg-e1',
    skill: 'regle',
    title: 'Épreuve 1 — Le piège du zéro',
    prompt:
      'Un segment est posé sur une règle, d’une extrémité à la graduation 2 jusqu’à la graduation 9. Combien mesure-t-il ?',
    options: ['7 unités', '9 unités', '11 unités'],
    cols: 3,
    correct: 0,
    explain:
      'Une longueur est une DIFFÉRENCE de graduations : 9 − 2 = 7. Lire 9 revient à croire que le segment part de 0.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_constructions-geometriques_P1'] },
  },
  {
    id: 'cg-e2',
    skill: 'regle',
    title: 'Épreuve 2 — Tracer une longueur',
    prompt: 'Pour tracer un segment [AB] de 7 cm, quelle est la bonne marche à suivre ?',
    options: [
      'Placer A sur la graduation 0, marquer un point au 7, puis relier',
      'Tracer un trait puis le raccourcir jusqu’à 7 cm',
      'Tracer un trait d’environ 7 cm',
    ],
    cols: 1,
    correct: 0,
    explain:
      'On repère les deux points aux bonnes graduations, PUIS on trace. Retoucher un trait fait perdre l’exactitude à chaque essai.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_constructions-geometriques_P4'] },
  },
  {
    id: 'cg-e3',
    skill: 'compas',
    title: 'Épreuve 3 — À quoi sert le compas ?',
    prompt: 'Que garantit le compas, que ni la règle ni l’équerre ne garantissent ?',
    options: [
      'L’égalité de deux longueurs, sans avoir à les mesurer',
      'Les traits parfaitement droits',
      'Les angles droits',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Le compas conserve un écartement : il REPORTE une longueur sans jamais la lire. La règle trace droit, l’équerre garantit l’angle droit.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_constructions-geometriques_P3'] },
  },
  {
    id: 'cg-e4',
    skill: 'compas',
    title: 'Épreuve 4 — Reporter une longueur',
    prompt:
      'On veut reporter la longueur d’un segment ailleurs sur la feuille, sans connaître sa mesure. Comment fait-on ?',
    options: [
      'On règle le compas sur le segment, puis on pointe ailleurs sans y toucher',
      'On mesure d’abord à la règle, puis on retrace',
      'On plie la feuille',
    ],
    cols: 1,
    correct: 0,
    explain:
      'C’est tout l’intérêt du report : l’écartement porte la longueur exacte, même inconnue. Mesurer obligerait à arrondir.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_constructions-geometriques_P5'] },
  },
  {
    id: 'cg-e5',
    skill: 'equerre',
    title: 'Épreuve 5 — Le rituel de l’équerre',
    prompt:
      'Pour tracer la perpendiculaire à une droite (d) passant par un point A, comment pose-t-on l’équerre ?',
    options: [
      'Un côté de l’angle droit le long de (d), et le sommet exactement sur A',
      'N’importe comment, du moment qu’elle touche (d)',
      'Le sommet sur (d), et un côté vers A',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Deux conditions : le côté aligné sur la droite, le sommet sur le point. Si le sommet n’est pas sur A, l’angle droit est ailleurs.',
    assessment: {
      enabled: true,
      type: 'assessment',
      learningPointIds: ['6e_constructions-geometriques_P2', '6e_constructions-geometriques_P7'],
    },
  },
  {
    id: 'cg-e6',
    skill: 'equerre',
    title: 'Épreuve 6 — Construire une parallèle',
    prompt: 'Quelle méthode garantit une droite parallèle à (d) passant par un point B ?',
    options: [
      'Utiliser l’équerre : deux perpendiculaires à une même droite sont parallèles',
      'Tracer un trait à l’œil, en gardant la même pente',
      'Mesurer la même longueur des deux côtés',
    ],
    cols: 1,
    correct: 0,
    explain:
      'L’angle droit de l’équerre garantit le parallélisme : si d′ ⊥ c et d ⊥ c, alors d′ // d. L’œil ne garantit rien.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_constructions-geometriques_P6'] },
  },
  {
    id: 'cg-e7',
    skill: 'choisir',
    title: 'Épreuve 7 — Le bon instrument',
    prompt: 'On veut s’assurer que deux côtés d’une figure ont exactement la même longueur. Quel instrument ?',
    options: [
      'Le compas — il reporte la longueur sans l’arrondir',
      'L’équerre',
      'Aucun : on compare à l’œil',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Le compas compare deux longueurs directement, sans passer par un nombre — donc sans arrondi. La règle marche aussi, mais elle oblige à lire.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_constructions-geometriques_P8'] },
  },
  {
    id: 'cg-e8',
    skill: 'programme',
    title: 'Épreuve 8 — L’ordre des étapes',
    prompt:
      'Dans un programme de construction, peut-on tracer la perpendiculaire à (AB) avant d’avoir tracé [AB] ?',
    options: [
      'Non : chaque étape s’appuie sur les précédentes',
      'Oui : l’ordre des étapes est libre',
      'Oui, si on connaît la longueur',
    ],
    cols: 1,
    correct: 0,
    explain:
      'On ne peut pas être perpendiculaire à une droite qui n’existe pas encore. L’ordre traduit des dépendances réelles, ce n’est pas une question de style.',
    assessment: {
      enabled: true,
      type: 'assessment',
      learningPointIds: ['6e_constructions-geometriques_P9', '6e_constructions-geometriques_P12'],
    },
  },
  {
    id: 'cg-e9',
    skill: 'verifier',
    title: 'Épreuve 9 — Diagnostiquer une erreur',
    prompt:
      'Un élève rend un « rectangle » dont un angle mesure 87°. Quel instrument aurait évité cette erreur ?',
    options: ['L’équerre', 'Le compas', 'La règle graduée'],
    cols: 3,
    correct: 0,
    explain:
      'Seule l’équerre garantit l’angle droit exact. À main levée ou à la règle seule, on tombe rarement sur 90° pile.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_constructions-geometriques_P10'] },
  },
  {
    id: 'cg-e10',
    skill: 'verifier',
    title: 'Épreuve 10 — Vérifier une figure',
    prompt: 'Comment vérifie-t-on qu’une figure construite est bien un carré ?',
    options: [
      'En contrôlant ses 4 angles droits à l’équerre ET l’égalité de ses 4 côtés',
      'En vérifiant qu’elle ressemble à un carré',
      'En mesurant un seul côté',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Vérifier, c’est reprendre CHAQUE propriété de la définition, avec l’instrument qui la garantit. Un seul contrôle laisse tout le reste non vérifié.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_constructions-geometriques_P11'] },
  },
];

const BADGES = [
  { id: 'b-regle', emoji: '🏅', label: 'Règle sans piège', test: (m) => !m.regle },
  { id: 'b-compas', emoji: '🏅', label: 'Maître du report', test: (m) => !m.compas },
  { id: 'b-equerre', emoji: '🏅', label: 'Rituel de l’équerre', test: (m) => !m.equerre },
  { id: 'b-choix', emoji: '🏅', label: 'Bon instrument, bonne propriété', test: (m) => !m.choisir },
  { id: 'b-prog', emoji: '🏅', label: 'Rédacteur de programmes', test: (m) => !m.programme },
  { id: 'b-verif', emoji: '🏅', label: 'Contrôleur rigoureux', test: (m) => !m.verifier },
];

/** Synthèse : les trois instruments, et le programme qui les enchaîne. */
function Synthese() {
  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-space font-extrabold text-slate-900">Trois instruments, trois garanties</h2>
        <p className="text-sm text-slate-500">
          Choisir un instrument, c’est choisir la propriété qu’on veut assurer.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {INSTRUMENTS_LIST.map((i) => (
          <div key={i.id} className="rounded-2xl border-2 border-slate-200 bg-white p-4 text-center space-y-1.5">
            <div className="text-3xl" aria-hidden="true">{i.emoji}</div>
            <div className="font-space font-extrabold text-slate-900 capitalize text-sm">{i.nom}</div>
            <div className="text-xs text-emerald-700">✓ {i.garantit}</div>
            <div className="text-xs text-slate-400">✗ {i.neGarantitPas}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 space-y-2">
        <h3 className="font-space font-bold text-blue-900 text-sm">Un programme de construction</h3>
        <ol className="text-sm text-blue-900 space-y-1">
          {PROGRAMME_RECTANGLE.map((s, i) => (
            <li key={s.id} className="flex items-center gap-2">
              <span className="font-mono font-bold">{i + 1}.</span>
              <span className="flex-1">{s.texte}</span>
              <span aria-hidden="true">{INSTRUMENTS[s.instrument].emoji}</span>
            </li>
          ))}
        </ol>
        <p className="text-xs text-blue-800">
          L’ordre traduit des dépendances : chaque étape a besoin des précédentes.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-2">
        <h3 className="font-space font-bold text-amber-900 text-sm">Les pièges à éviter</h3>
        <ul className="text-sm text-amber-900 space-y-1.5">
          <li>❌ lire la graduation d’arrivée &nbsp;→&nbsp; ✅ une longueur est une différence</li>
          <li>❌ mesurer pour reporter &nbsp;→&nbsp; ✅ le compas conserve l’écartement</li>
          <li>❌ l’équerre posée « à peu près » &nbsp;→&nbsp; ✅ un côté sur la droite, le sommet sur le point</li>
          <li>❌ « presque un carré » &nbsp;→&nbsp; ✅ une propriété est vérifiée, ou ne l’est pas</li>
        </ul>
      </div>
    </div>
  );
}

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : l’atelier du géomètre"
      moduleSubtitle="Dix épreuves : instruments, programmes et vérifications."
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={600}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Défi final',
        title: 'La dernière épreuve du chapitre.',
        body: (
          <p>
            Dix épreuves, une seule validation à la fin. Pour chaque question, demande-toi quelle{' '}
            <strong>propriété</strong> doit être garantie.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '📏', label: 'Règle', value: 'longueur' },
        { id: 'r2', emoji: '📐', label: 'Équerre', value: 'angle droit' },
        { id: 'r3', emoji: '⭕', label: 'Compas', value: 'report' },
        { id: 'r4', emoji: '📋', label: 'Programme', value: 'ordre' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Maître du chapitre !',
        title: 'Mission accomplie !',
        message:
          'Tu maîtrises la règle, l’équerre et le compas, tu sais suivre et écrire un programme de construction, et vérifier qu’une figure respecte ses propriétés. Le chapitre « Espace et géométrie » est terminé — bravo.',
        verbs: ['Tracer', 'Reporter', 'Construire', 'Vérifier'],
        masterBadgeLabel: 'Sans aucune erreur',
      }}
      xpPerCorrect={10}
    />
  );
}
