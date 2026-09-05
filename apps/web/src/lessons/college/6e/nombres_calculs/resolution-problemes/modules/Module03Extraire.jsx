import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, useKit } from '../../../../../common/kit';
import InfoSorter from '../../../../../common/components/InfoSorter';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 3 — découverte, reconstruit sur le lesson kit.
 *
 * InfoSorter en mode `formative` (voir son en-tête) : le tri se conclut
 * toujours, juste ou faux, avec le bon tri montré — jamais de blocage.
 */

/* ─── Étape 1 : trier les informations ───────────────────────────── */
const ITEMS_1 = [
  { id: 'a', text: "L'école possède 240 cahiers.", useful: true },
  { id: 'b', text: 'Elle compte 12 classes.', useful: false },
  { id: 'c', text: 'Chaque cahier coûte 2 €.', useful: true },
  { id: 'd', text: "Le directeur travaille depuis 8 ans dans l'école.", useful: false },
];

function TriCahiers({ react, solved, onSolved }) {
  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-1">
        <p className="text-sm text-slate-700">
          Une école possède 240 cahiers. Elle compte 12 classes. Chaque cahier coûte 2 €. Le directeur travaille
          depuis 8 ans dans l'école.
        </p>
        <p className="text-sm font-bold text-slate-900">Question : combien coûtent tous les cahiers ?</p>
      </div>
      <InfoSorter items={ITEMS_1} solved={solved} onSolved={onSolved} formative onCheck={react} />
    </div>
  );
}

/* ─── Étape 2 : un second tri, puis calcul ───────────────────────── */
const ITEMS_2 = [
  { id: 'a', text: 'Une classe compte 28 élèves.', useful: true },
  { id: 'b', text: 'Le professeur possède 5 marqueurs.', useful: false },
  { id: 'c', text: 'Chaque élève reçoit 3 feuilles.', useful: true },
  { id: 'd', text: 'La salle mesure 8 m de long.', useful: false },
];

function TriFeuilles({ react, sorted, setSorted, solved, onAnswered }) {
  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-1">
        <p className="text-sm text-slate-700">
          Une classe compte 28 élèves. Le professeur possède 5 marqueurs. Chaque élève reçoit 3 feuilles. La
          salle mesure 8 m de long.
        </p>
        <p className="text-sm font-bold text-slate-900">Question : combien de feuilles faut-il au total ?</p>
      </div>
      <InfoSorter items={ITEMS_2} solved={sorted || solved} onSolved={() => setSorted(true)} formative onCheck={react} />

      {(sorted || solved) && (
        <div className="border-t border-slate-100 pt-4">
          <NumericQuestion
            prompt="Maintenant, calcule le nombre de feuilles."
            expected={84}
            explain="28 × 3 = 84 feuilles."
            explainFor={() => 'Utilise seulement les deux informations utiles : 28 élèves, 3 feuilles chacun.'}
            solved={solved}
            onAnswered={onAnswered}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Étape 3 : information manquante ────────────────────────────── */
const MANQUE_Q = {
  q: '« Une classe possède plusieurs boîtes contenant chacune des crayons. Combien de crayons possède-t-elle ? » Que dois-tu répondre ?',
  options: [
    'Il faut inventer un nombre de boîtes et de crayons pour pouvoir répondre',
    'Il manque une information : on ne connaît ni le nombre de boîtes ni le nombre de crayons par boîte',
    "C'est forcément 0, puisqu'on ne sait rien",
  ],
  correct: 1,
  explain: "Un bon résolveur de problèmes sait dire « il manque une information » plutôt que d'inventer des données. Ici, sans le nombre de boîtes ET le nombre de crayons par boîte, aucun calcul n'est possible.",
};

function Step1({ solved, onSolved }) {
  const { react } = useKit();
  return <TriCahiers react={react} solved={solved} onSolved={onSolved} />;
}

function Step2({ solved, onAnswered }) {
  const { react } = useKit();
  const [sorted, setSorted] = useState(false);
  return <TriFeuilles react={react} sorted={sorted} setSorted={setSorted} solved={solved} onAnswered={onAnswered} />;
}

export default function Module03Extraire() {
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Extraire les informations"
      moduleSubtitle="Trier ce qui sert de ce qui ne sert pas — sans se laisser piéger par des informations plausibles."
      estimatedTime="7 min"
      brief={{
        tag: '🗂️ Tri',
        title: "Un énoncé contient rarement QUE des informations utiles.",
        body: <p>Certaines informations sont vraies mais inutiles à la question posée. D'autres, parfois, manquent complètement.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Trie les informations : les cahiers',
          done: s1,
          content: <Step1 solved={s1} onSolved={() => setS1(true)} />,
        },
        {
          num: 2,
          title: 'Trie les informations : les feuilles',
          done: s2,
          content: <Step2 solved={s2} onAnswered={() => setS2(true)} />,
        },
        {
          num: 3,
          title: 'Et si une information manque ?',
          done: s3,
          content: (
            <TapQuestion
              prompt={MANQUE_Q.q}
              options={MANQUE_Q.options}
              correct={MANQUE_Q.correct}
              cols={1}
              explain={MANQUE_Q.explain}
              solved={s3}
              onAnswered={() => setS3(true)}
            />
          ),
        },
      ]}
    />
  );
}
