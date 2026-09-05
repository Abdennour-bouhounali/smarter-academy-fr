import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DecimalPlaceTable from '../components/DecimalPlaceTable';

/**
 * Module 0 V2 — diagnostic des prérequis avant « Nombres décimaux ».
 *
 * Aucune coursesData.js / champ `prerequisites` trouvé référençant
 * `6e_nombres-decimaux` dans le dépôt (grep infructueux) : les compétences
 * ci-dessous sont choisies par jugement pédagogique, sur le même principe
 * que contenances/nombres-entiers — jamais la matière enseignée par CETTE
 * leçon (fractions décimales, virgule, valeur de position décimale...),
 * seulement ce dont elle a besoin en amont :
 *  - numération entière : valeur de position d'un chiffre dans un entier,
 *    et comparaison d'entiers (indispensable pour comparer des parties
 *    entières de décimaux au module 7) ;
 *  - fractions simples : lire une fraction a/b comme « a parts sur b »
 *    (indispensable pour comprendre la fraction décimale au module 3).
 */
const SKILLS = {
  numerationEntiere: { label: 'Numération entière', emoji: '🔢' },
  fractionsSimples: { label: 'Fractions simples', emoji: '🍰' },
};

const QUESTIONS = [
  {
    id: 'q1-digit',
    skill: 'numerationEntiere',
    points: 2,
    type: 'custom',
    prompt: (
      <>
        Clique sur le chiffre des <strong>dizaines</strong> dans <strong className="font-mono">58</strong>.
      </>
    ),
    isCorrect: (pick) => pick === 'D',
    render: ({ pick, onPick }) => (
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex justify-center">
        <DecimalPlaceTableIntOnly value={58} onDigitClick={(cell) => onPick(cell.key)} selectedKey={pick} />
      </div>
    ),
    review: ({ pick }) => (
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex justify-center">
        <DecimalPlaceTableIntOnly value={58} selectedKey={pick} compact />
      </div>
    ),
    explainOk: 'Bien vu ! Dans 58, le 5 est dans la colonne des dizaines : il vaut 50.',
    explainKo: '💡 En partant de la droite : unités, puis dizaines. Dans 58, le 5 occupe la colonne des dizaines.',
  },
  {
    id: 'q2-value',
    skill: 'numerationEntiere',
    points: 2,
    prompt: (
      <>
        Dans <strong className="font-mono">7 306</strong>, quelle est la valeur du chiffre <strong className="font-mono">3</strong> ?
      </>
    ),
    options: ['3', '30', '300', '3 000'],
    cols: 2,
    correct: 2,
    explain: '7 306 : le 3 occupe la colonne des centaines. Sa valeur est donc 300.',
  },
  {
    id: 'q3-compare',
    skill: 'numerationEntiere',
    points: 2,
    prompt: <>Quel est le plus grand des deux nombres : <strong className="font-mono">308</strong> ou <strong className="font-mono">85</strong> ?</>,
    options: ['308', '85', 'Ils sont égaux'],
    cols: 3,
    correct: 0,
    explain: '308 a 3 chiffres (des centaines), 85 n\'en a que 2 (des dizaines) : 308 est donc plus grand, même si 85 "commence" par un chiffre plus grand que 3.',
  },
  {
    id: 'q4-fraction-lecture',
    skill: 'fractionsSimples',
    points: 2,
    prompt: <>Sur ce gâteau partagé en 4 parts égales, on en a mangé 3. Comment note-t-on cette quantité ?</>,
    options: ['4/3', '3/4', '3 + 4', '1/4'],
    cols: 2,
    correct: 1,
    explain: 'Le dénominateur (en bas) compte le nombre total de parts égales ; le numérateur (en haut) compte les parts prises : 3 parts sur 4, soit 3/4.',
  },
  {
    id: 'q5-fraction-sens',
    skill: 'fractionsSimples',
    points: 2,
    prompt: <>Dans la fraction <strong className="font-mono">5/8</strong>, que représente le nombre 8 ?</>,
    options: [
      'Le nombre de parts prises',
      'Le nombre total de parts égales dans le partage',
      'Le résultat de 5 ÷ 8 arrondi',
    ],
    cols: 1,
    correct: 1,
    explain: 'Le dénominateur (8) dit en combien de parts égales on a partagé le tout ; le numérateur (5) dit combien de ces parts on prend.',
  },
];

/** Tableau de position limité à la partie entière (pas de virgule ici : diagnostic sur les entiers). */
function DecimalPlaceTableIntOnly(props) {
  return <DecimalPlaceTable {...props} intPlaces={4} decPlaces={0} />;
}

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      estimatedTime="5 min"
      brief={{
        body: (
          <p>
            Avant de partir à la découverte des nombres décimaux, vérifions deux petites bases : la valeur de
            position dans un nombre entier, et la lecture d'une fraction simple. Ce test nous aide à savoir
            comment t'accompagner — ce n'est pas un examen, et tu pourras toujours continuer vers le Module 1,
            quel que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
