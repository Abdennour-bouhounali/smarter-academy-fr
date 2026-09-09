import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Le test CONSOLIDE :
 * il n'introduit ni concept, ni vocabulaire, ni notation neufs
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *
 * TRANSFERT, pas répétition : aucune épreuve ne reprend les valeurs des
 * modules (ni le cycliste à 36 km en 1 h 30, ni le réservoir de 300 L, ni les
 * 36, 72 et 90 km/h), et chaque distracteur encode une erreur RÉELLEMENT
 * rencontrée :
 *   — « doubler double toujours », sans dire ce qu'on fixe (M1) ;
 *   — trier une unité sur son symbole plutôt que sur sa lecture (M2) ;
 *   — multiplier là où le « par » demande une division (M3) ;
 *   — appliquer « ÷ 3,6 » dans le mauvais sens (M4) ;
 *   — écrire t = v ÷ d au lieu de d ÷ v (M5) ;
 *   — additionner deux grandeurs quotient (M6).
 *
 * La bonne réponse est déclarée par `correct` et sa POSITION VARIE.
 * `badges[].test` est une FONCTION `(misses) => bool`.
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 6 LPs sont tous couverts.
 */
const SKILLS = {
  relier: { label: 'Relier d, t et v', module: 1, emoji: '🚴' },
  familles: { label: 'Quotient ou produit', module: 2, emoji: '🏷️' },
  debit: { label: 'Débit', module: 3, emoji: '💧' },
  unites: { label: 'Changer d’unité', module: 4, emoji: '📏' },
  formule: { label: 'Lire une formule', module: 5, emoji: '🔁' },
};

const BADGES = [
  { id: 'b-relier', emoji: '🚴', label: 'Maître des cadrans', test: (m) => !m.relier },
  { id: 'b-familles', emoji: '🏷️', label: 'Oreille absolue', test: (m) => !m.familles },
  { id: 'b-debit', emoji: '💧', label: 'Robinet sûr', test: (m) => !m.debit },
  { id: 'b-unites', emoji: '📏', label: 'Bon sens de conversion', test: (m) => !m.unites },
  { id: 'b-formule', emoji: '🔁', label: 'Formule retournée', test: (m) => !m.formule },
  { id: 'b-parfait', emoji: '💎', label: 'Maître des grandeurs composées', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'gc-e1',
    skill: 'relier',
    title: 'Deux données suffisent',
    prompt: 'Un randonneur marche 14 km en 3 h 30 min. À quelle vitesse a-t-il marché ?',
    options: ['4 km/h', '49 km/h', '17,5 km/h', '0,25 km/h'],
    correct: 0,
    cols: 4,
    requires: ['trois-grandeurs-liees', 'lire-une-formule'],
    explain: '3 h 30 min font 3,5 h, et 14 ÷ 3,5 = 4 km/h. (49 km/h viendrait d’une multiplication ; 0,25 km/h d’une division à l’envers.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_grandeurs-composees-4e_P1'] },
  },
  {
    id: 'gc-e2',
    skill: 'relier',
    title: 'Si je double…',
    prompt: 'Un cycliste garde la MÊME distance mais met deux fois plus de temps. Que devient sa vitesse ?',
    options: [
      'Elle double',
      'Elle ne change pas',
      'Elle est divisée par deux',
      'On ne peut pas le savoir',
    ],
    correct: 2,
    cols: 1,
    requires: ['trois-grandeurs-liees'],
    explain: 'À distance fixée, doubler la durée divise la vitesse par deux : on met deux fois plus de temps pour le même chemin. C’est l’inverse de ce qui se passe à durée fixée quand on double la distance.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_grandeurs-composees-4e_P1'] },
  },
  {
    id: 'gc-e3',
    skill: 'familles',
    title: 'Par ou fois ?',
    prompt: 'Le kilowattheure (kWh) est-il une grandeur quotient ou une grandeur produit ?',
    options: [
      'Un quotient : c’est une énergie divisée par un temps',
      'Un produit : il se lit « des kilowatts fois des heures »',
      'Un quotient, car il n’a pas de barre de fraction',
      'Ni l’un ni l’autre : c’est une unité simple',
    ],
    correct: 1,
    cols: 1,
    requires: ['grandeur-quotient'],
    explain: 'Un four de 2 kW allumé 3 h consomme 2 × 3 = 6 kWh : c’est bien une multiplication. Le symbole n’a pas de barre justement parce que ce n’est pas une division.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_grandeurs-composees-4e_P2'] },
  },
  {
    id: 'gc-e4',
    skill: 'familles',
    title: 'Ce que dit le mot « par »',
    prompt: 'La masse volumique de l’aluminium vaut 2,7 g/cm³. Que dit ce nombre ?',
    options: [
      'Un morceau d’aluminium pèse 2,7 g',
      'Un centimètre cube d’aluminium pèse 2,7 g',
      'Il faut 2,7 cm³ pour obtenir un gramme',
      'L’aluminium occupe 2,7 cm³',
    ],
    correct: 1,
    cols: 1,
    requires: ['grandeur-quotient', 'debit'],
    explain: '« Des grammes par centimètre cube » : le mot « par » annonce toujours ce que vaut UNE unité de l’autre grandeur. Ici, un cm³ pèse 2,7 g.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_grandeurs-composees-4e_P2'] },
  },
  {
    id: 'gc-e5',
    skill: 'debit',
    title: 'Le volume écoulé',
    prompt: 'Une pompe débite 18 L/min. Quel volume a-t-elle versé au bout de 20 min ?',
    options: ['360 L', '38 L', '0,9 L', '1,11 L'],
    correct: 0,
    cols: 4,
    requires: ['debit'],
    explain: '18 × 20 = 360 L. Le débit dit combien il sort par minute : on répète 18 L vingt fois. (38 L viendrait d’une addition, 0,9 L d’une division.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_grandeurs-composees-4e_P3'] },
  },
  {
    id: 'gc-e6',
    skill: 'debit',
    title: 'Combien de temps ?',
    prompt: 'Une citerne de 750 L se remplit à 15 L/min. En combien de temps est-elle pleine ?',
    options: ['11 250 min', '765 min', '50 min', '5 min'],
    correct: 2,
    cols: 4,
    requires: ['debit'],
    explain: '750 ÷ 15 = 50 min. Exactement la division qui donne une durée à partir d’une distance et d’une vitesse : le total, partagé par ce qui passe en une unité de temps.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_grandeurs-composees-4e_P3'] },
  },
  {
    id: 'gc-e7',
    skill: 'unites',
    title: 'Vers les mètres par seconde',
    prompt: 'Un scooter roule à 54 km/h. Combien de mètres parcourt-il en une seconde ?',
    options: ['194,4 m', '15 m', '54 000 m', '0,9 m'],
    correct: 1,
    cols: 4,
    requires: ['changer-unite'],
    explain: '54 km = 54 000 m, parcourus en 3600 s : 54 000 ÷ 3600 = 15 m/s. (194,4 viendrait d’une multiplication par 3,6 — le mauvais sens ; 0,9 d’une division par 60 seulement.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_grandeurs-composees-4e_P4'] },
  },
  {
    id: 'gc-e8',
    skill: 'unites',
    title: 'Et dans l’autre sens',
    prompt: 'Un coureur avance à 5 m/s. Quelle est sa vitesse en km/h ?',
    options: ['1,39 km/h', '18 km/h', '300 km/h', '5 km/h'],
    correct: 1,
    cols: 4,
    requires: ['changer-unite', 'mem-conversion'],
    explain: 'En une heure il parcourt 5 × 3600 = 18 000 m, soit 18 km. En allant vers les km/h le nombre GRANDIT : on multiplie par 3,6. (1,39 viendrait d’une division — le mauvais sens.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_grandeurs-composees-4e_P4'] },
  },
  {
    id: 'gc-e9',
    skill: 'formule',
    title: 'La bonne écriture',
    prompt: 'On connaît une distance d et une vitesse v, et on cherche la durée t. Quelle écriture utiliser ?',
    options: ['t = v ÷ d', 't = d × v', 't = d ÷ v', 't = d + v'],
    correct: 2,
    cols: 4,
    requires: ['lire-une-formule'],
    explain: 'On isole ce qu’on cherche : d = v × t donne t = d ÷ v. Les unités le confirment — des km divisés par des km/h laissent bien des heures, alors que v ÷ d n’en donnerait pas.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_grandeurs-composees-4e_P5'] },
  },
  {
    id: 'gc-e10',
    skill: 'formule',
    title: 'Le trajet complet',
    prompt: 'Un car fait 40 km à 40 km/h, puis 60 km à 60 km/h. À quelle vitesse a-t-il roulé sur l’ensemble du trajet ?',
    options: ['50 km/h', '100 km/h', '20 km/h', '48 km/h'],
    correct: 0,
    cols: 4,
    requires: ['lire-une-formule', 'trois-grandeurs-liees', 'grandeur-quotient'],
    explain: 'Deux vitesses ne s’additionnent pas : il faut repasser par les grandeurs. Le car parcourt 40 + 60 = 100 km en 1 h + 1 h = 2 h, donc 100 ÷ 2 = 50 km/h. Ici le résultat coïncide avec le milieu de 40 et 60 seulement parce que les deux durées sont égales — ce n’est pas toujours le cas.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_grandeurs-composees-4e_P6', '4e_grandeurs-composees-4e_P5'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : le grand trajet"
      moduleSubtitle="Dix épreuves, une seule soumission"
      estimatedTime="9 min"
      lessonConfig={LESSON_CONFIG}
      brief={{
        tag: '🏆 Mission finale',
        title: 'Le grand trajet',
        tone: 'amber',
        body: (
          <>
            Dix situations de route, de remplissage et de mesure. Réponds à tout, puis soumets :
            aucune correction avant la fin.
          </>
        ),
      }}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'Grandeurs composées maîtrisées',
        title: 'Mission accomplie',
        message: 'Tu sais relier trois grandeurs, reconnaître un quotient d’un produit, calculer un débit et changer d’unité en raisonnant plutôt qu’en récitant.',
        verbs: ['Relier', 'Reconnaître', 'Calculer', 'Convertir'],
        masterBadgeLabel: 'Maître des grandeurs composées',
      }}
    />
  );
}
