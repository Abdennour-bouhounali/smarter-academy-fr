import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import BarModel from '../../../../../common/components/BarModel';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, NumberField } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseFr } from '@smarter-academy/core';

/* ─── Étape 1 : retirer des objets ────────────────────────────────── */
function RetirerBilles({ solved, onSolved }) {
  const [removed, setRemoved] = useState([]);
  const total = 18;
  const target = 7;
  const remaining = total - removed.length;

  const toggle = (i) => {
    if (solved) return;
    setRemoved((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : prev.length < target ? [...prev, i] : prev));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Ana a 18 billes. Elle en donne 7 à son frère. Touche 7 billes pour les lui donner.
      </p>
      <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl justify-center">
        {Array.from({ length: total }, (_, i) => {
          const isRemoved = removed.includes(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              disabled={solved}
              aria-pressed={isRemoved}
              aria-label={`Bille ${i + 1}${isRemoved ? ', donnée' : ''}`}
              className={`w-8 h-8 rounded-full border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isRemoved ? 'bg-slate-100 border-slate-200 opacity-30' : 'bg-amber-400 border-amber-500 hover:scale-105'
              }`}
            />
          );
        })}
      </div>
      <p className="text-center text-sm font-mono text-slate-600">
        Données : <strong>{removed.length}</strong> — Restantes : <strong>{remaining}</strong>
      </p>
      {!solved && (
        <div className="text-center">
          <ValidateButton onClick={() => removed.length === target && onSolved?.()} disabled={removed.length !== target}>
            Valider
          </ValidateButton>
        </div>
      )}
      {solved && (
        <Feedback tone="ok">
          Il reste <strong>{remaining}</strong> billes à Ana. On a modélisé un RETRAIT : 18 − 7 = 11. L'opération
          est apparue en manipulant, pas en repérant le mot « donne ».
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 2 : même opération, situation différente (comparer) ─── */
function ComparerCartes({ solved, onSolved }) {
  const [val, setVal] = useState('');
  const [fb, setFb] = useState(null);
  const check = () => {
    if (parseFr(val) === 6) { onSolved?.(); setFb(null); }
    else setFb("Compare les deux barres : de combien la barre de Léo dépasse-t-elle celle de Zoé ?");
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Léo a 15 cartes. Zoé en a 9. Combien de cartes Léo a-t-il de plus que Zoé ?</p>
      <BarModel
        bars={[
          { label: 'Léo', segments: [{ value: 9, tone: 'sky', text: '9' }, { value: 6, tone: 'amber', text: '?' }] },
          { label: 'Zoé', segments: [{ value: 9, tone: 'sky', text: '9' }] },
        ]}
        maxValue={15}
      />
      {solved ? (
        <Feedback tone="ok">
          Léo a <strong>6</strong> cartes de plus. Ici aussi c'est une soustraction (15 − 9), mais elle raconte une
          COMPARAISON, pas un retrait : personne ne « donne » rien.
        </Feedback>
      ) : (
        <>
          <div className="flex items-center gap-2 justify-center">
            <NumberField value={val} onChange={(v) => { setVal(v); setFb(null); }} onEnter={check} ariaLabel="Différence" placeholder="?" width="w-24" />
            <ValidateButton onClick={check} disabled={!val}>OK</ValidateButton>
          </div>
          {fb && <Feedback tone="hint">{fb}</Feedback>}
        </>
      )}
    </div>
  );
}

/* ─── Étape 3 : réflexion ─────────────────────────────────────────── */
const REFLEX_Q = {
  q: "Les deux problèmes précédents utilisent tous les deux une soustraction. Que peux-tu en conclure ?",
  options: [
    "Une même opération peut raconter des situations très différentes : retirer, ou comparer",
    "Ce sont en fait deux opérations différentes, on s'est trompé",
    "Le mot « reste » indique toujours un retrait",
  ],
  correct: 0,
  explain: "Exactement. Ana « perd » des billes (retrait), Léo et Zoé sont simplement comparés (aucun objet ne bouge). Même calcul, deux histoires différentes. C'est pour cela qu'il faut comprendre la situation avant de choisir un calcul.",
};

export default function Module02Comprendre() {
  const navLinks = getNavLinks(2);
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [reflexPick, setReflexPick] = useState(null);
  const [reflexRevealed, setReflexRevealed] = useState(false);

  const s3 = reflexRevealed && reflexPick === REFLEX_Q.correct;
  const allDone = s1 && s2 && s3;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Comprendre la situation"
      moduleSubtitle="Qu'est-ce qui se passe ? L'opération doit émerger du modèle, pas du hasard."
      moduleNumber={2}
      estimatedTime="9 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <MissionBrief tag="🔍 Comprendre" title="Avant de calculer : qu'est-ce qui se passe vraiment ?">
          <p>Deux histoires très différentes, un même calcul final. Regarde bien ce qui se passe dans chacune.</p>
        </MissionBrief>

        <StepCard num={1} title="Situation 1 — Un retrait" done={s1}>
          <RetirerBilles solved={s1} onSolved={() => setS1(true)} />
        </StepCard>

        <StepCard num={2} title="Situation 2 — Une comparaison" done={s2} locked={!s1}>
          <ComparerCartes solved={s2} onSolved={() => setS2(true)} />
        </StepCard>

        <StepCard num={3} title="Ce que ces deux situations t'apprennent" done={s3} locked={!s2}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{REFLEX_Q.q}</p>
            <ChoiceGrid options={REFLEX_Q.options} selected={reflexPick} onSelect={setReflexPick} revealed={reflexRevealed} correctIndex={REFLEX_Q.correct} cols={1} />
            {!reflexRevealed && (
              <div className="text-center">
                <ValidateButton onClick={() => setReflexRevealed(true)} disabled={reflexPick === null}>Valider</ValidateButton>
              </div>
            )}
            {reflexRevealed && (
              <Feedback tone={reflexPick === REFLEX_Q.correct ? 'ok' : 'ko'}>
                {REFLEX_Q.explain}
                {reflexPick !== REFLEX_Q.correct && (
                  <>
                    {' '}
                    <button type="button" onClick={() => { setReflexRevealed(false); setReflexPick(null); }} className="underline font-semibold">Réessayer</button>
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
