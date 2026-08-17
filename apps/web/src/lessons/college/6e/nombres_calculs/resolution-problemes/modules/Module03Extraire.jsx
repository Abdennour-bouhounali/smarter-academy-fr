import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import InfoSorter from '../../../../../common/components/InfoSorter';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, NumberField } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseFr } from '@smarter-academy/core';

/* ─── Étape 1 : trier les informations ───────────────────────────── */
const ITEMS_1 = [
  { id: 'a', text: 'L\'école possède 240 cahiers.', useful: true },
  { id: 'b', text: 'Elle compte 12 classes.', useful: false },
  { id: 'c', text: 'Chaque cahier coûte 2 €.', useful: true },
  { id: 'd', text: "Le directeur travaille depuis 8 ans dans l'école.", useful: false },
];

function TriCahiers({ solved, onSolved }) {
  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-1">
        <p className="text-sm text-slate-700">
          Une école possède 240 cahiers. Elle compte 12 classes. Chaque cahier coûte 2 €. Le directeur travaille
          depuis 8 ans dans l'école.
        </p>
        <p className="text-sm font-bold text-slate-900">Question : combien coûtent tous les cahiers ?</p>
      </div>
      <InfoSorter items={ITEMS_1} solved={solved} onSolved={onSolved} />
      {solved && (
        <Feedback tone="ok">
          Le nombre de classes et l'ancienneté du directeur ne servent à rien pour calculer un COÛT TOTAL — même
          si ce sont de vraies informations plausibles. Seuls le nombre de cahiers et leur prix comptent :
          240 × 2 = 480 €.
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 2 : un second tri, autre contexte ────────────────────── */
const ITEMS_2 = [
  { id: 'a', text: 'Une classe compte 28 élèves.', useful: true },
  { id: 'b', text: 'Le professeur possède 5 marqueurs.', useful: false },
  { id: 'c', text: 'Chaque élève reçoit 3 feuilles.', useful: true },
  { id: 'd', text: 'La salle mesure 8 m de long.', useful: false },
];

function TriFeuilles({ solved, onSolved }) {
  const [val, setVal] = useState('');
  const [fb, setFb] = useState(null);
  const [sorted, setSorted] = useState(false);

  const check = () => {
    if (parseFr(val) === 84) { onSolved?.(); setFb(null); }
    else setFb('Utilise seulement les deux informations utiles : 28 élèves, 3 feuilles chacun.');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-1">
        <p className="text-sm text-slate-700">
          Une classe compte 28 élèves. Le professeur possède 5 marqueurs. Chaque élève reçoit 3 feuilles. La salle
          mesure 8 m de long.
        </p>
        <p className="text-sm font-bold text-slate-900">Question : combien de feuilles faut-il au total ?</p>
      </div>
      <InfoSorter items={ITEMS_2} solved={sorted} onSolved={() => setSorted(true)} />

      {sorted && !solved && (
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-700">Maintenant, calcule le nombre de feuilles.</p>
          <div className="flex items-center gap-2 justify-center">
            <NumberField value={val} onChange={(v) => { setVal(v); setFb(null); }} onEnter={check} ariaLabel="Nombre de feuilles" placeholder="?" width="w-24" />
            <ValidateButton onClick={check} disabled={!val}>OK</ValidateButton>
          </div>
          {fb && <Feedback tone="hint">{fb}</Feedback>}
        </div>
      )}
      {solved && <Feedback tone="ok">28 × 3 = 84 feuilles.</Feedback>}
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

export default function Module03Extraire() {
  const navLinks = getNavLinks(3);
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [manquePick, setManquePick] = useState(null);
  const [manqueRevealed, setManqueRevealed] = useState(false);

  const s3 = manqueRevealed && manquePick === MANQUE_Q.correct;
  const allDone = s1 && s2 && s3;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Extraire les informations"
      moduleSubtitle="Trier ce qui sert de ce qui ne sert pas — sans se laisser piéger par des informations plausibles."
      moduleNumber={3}
      estimatedTime="9 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="🗂️ Tri" title="Un énoncé contient rarement QUE des informations utiles.">
          <p>Certaines informations sont vraies mais inutiles à la question posée. D'autres, parfois, manquent complètement.</p>
        </MissionBrief>

        <StepCard num={1} title="Trie les informations : les cahiers" done={s1}>
          <TriCahiers solved={s1} onSolved={() => setS1(true)} />
        </StepCard>

        <StepCard num={2} title="Trie les informations : les feuilles" done={s2} locked={!s1}>
          <TriFeuilles solved={s2} onSolved={() => setS2(true)} />
        </StepCard>

        <StepCard num={3} title="Et si une information manque ?" done={s3} locked={!s2}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{MANQUE_Q.q}</p>
            <ChoiceGrid options={MANQUE_Q.options} selected={manquePick} onSelect={setManquePick} revealed={manqueRevealed} correctIndex={MANQUE_Q.correct} cols={1} />
            {!manqueRevealed && (
              <div className="text-center">
                <ValidateButton onClick={() => setManqueRevealed(true)} disabled={manquePick === null}>Valider</ValidateButton>
              </div>
            )}
            {manqueRevealed && (
              <Feedback tone={manquePick === MANQUE_Q.correct ? 'ok' : 'ko'}>
                {MANQUE_Q.explain}
                {manquePick !== MANQUE_Q.correct && (
                  <>
                    {' '}
                    <button type="button" onClick={() => { setManqueRevealed(false); setManquePick(null); }} className="underline font-semibold">Réessayer</button>
                  </>
                )}
              </Feedback>
            )}
          </div>
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
