import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import GroupBuilder from '../../../../../common/components/GroupBuilder';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, NumberField } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseFr } from '@smarter-academy/core';

/* ─── Étape 1 : construire la structure ──────────────────────────── */
function ConstructionGroupes({ solved, onSolved }) {
  const [groups, setGroups] = useState(0);
  const target = 6;
  const perGroup = 24;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        6 classes participent à la sortie, chacune avec 24 élèves. Ajoute les classes une par une et observe le
        total évoluer.
      </p>
      <GroupBuilder perGroup={perGroup} groups={groups} onChange={setGroups} max={6} tone="violet" unit=" élèves" disabled={solved} />
      {groups > 0 && groups < target && (
        <p className="text-center text-xs font-mono text-slate-400">
          {Array.from({ length: groups }, () => perGroup).join(' + ')} = {groups * perGroup}
        </p>
      )}
      {!solved && (
        <div className="text-center">
          <ValidateButton onClick={() => groups === target && onSolved?.()} disabled={groups !== target}>
            Valider les 6 classes
          </ValidateButton>
        </div>
      )}
      {solved && (
        <Feedback tone="ok">
          <span className="font-mono">24 + 24 + 24 + 24 + 24 + 24 = 144</span> : tu viens de construire 6 groupes
          identiques de 24.
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 2 : l'opération émerge du modèle ─────────────────────── */
const OP_Q = {
  q: 'Tu viens de répéter 6 fois le même groupe de 24. Quelle écriture représente exactement ce que tu as fait ?',
  options: ['6 × 24', '6 + 24', '24 ÷ 6', '6 − 24'],
  correct: 0,
  explain: 'Répéter un même groupe plusieurs fois, c\'est une multiplication : 6 groupes de 24, c\'est 6 × 24 = 144. Tu as découvert l\'opération EN CONSTRUISANT, pas en devinant un mot-clé.',
};

/* ─── Étape 3 : au-delà du calcul, interpréter ───────────────────── */
function BusReasoning({ solved, onSolved }) {
  const [val, setVal] = useState('');
  const [fb, setFb] = useState(null);

  const check = () => {
    const n = parseFr(val);
    if (n === 3) { onSolved?.(); setFb(null); }
    else if (n === 2 || n === 2.88) setFb("2 bus n'offrent que 2 × 50 = 100 places : c'est insuffisant pour 144 personnes. Il faut un bus de plus.");
    else setFb("Chaque bus accueille 50 personnes. Compare 144 aux multiples de 50 : 50, 100, 150…");
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Chaque bus accueille au maximum <strong>50 personnes</strong>. Combien de bus faut-il prévoir pour les 144
        personnes ?
      </p>
      {solved ? (
        <Feedback tone="ok">
          Il faut <strong>3 bus</strong>. 144 ÷ 50 = 2 reste 44 : deux bus ne suffisent pas (2 × 50 = 100 &lt; 144),
          il en faut un troisième pour les 44 personnes restantes — même s'il n'est pas rempli.
        </Feedback>
      ) : (
        <>
          <div className="flex items-center gap-2 justify-center">
            <NumberField value={val} onChange={(v) => { setVal(v); setFb(null); }} onEnter={check} ariaLabel="Nombre de bus" placeholder="?" width="w-24" />
            <span className="text-sm font-mono text-slate-500">bus</span>
            <ValidateButton onClick={check} disabled={!val}>OK</ValidateButton>
          </div>
          {fb && <Feedback tone="hint">{fb}</Feedback>}
        </>
      )}
    </div>
  );
}

export default function Module01Mission() {
  const navLinks = getNavLinks(1);
  const [s1, setS1] = useState(false);
  const [opPick, setOpPick] = useState(null);
  const [opRevealed, setOpRevealed] = useState(false);
  const [s3, setS3] = useState(false);

  const s2 = opRevealed && opPick === OP_Q.correct;
  const allDone = s1 && s2 && s3;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Mission : Le problème mystère"
      moduleSubtitle="6 classes, 24 élèves chacune : découvre la structure avant de chercher une opération."
      moduleNumber={1}
      estimatedTime="9 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="📋 Mission 01" title="Une sortie scolaire se prépare.">
          <p>
            6 classes participent, chacune avec 24 élèves. Le bus peut accueillir 50 personnes.{' '}
            <strong className="text-white">Combien de personnes doivent être transportées ?</strong>
          </p>
          <p className="text-xs">Ne cherche pas encore une opération : construis d'abord la situation.</p>
        </MissionBrief>

        <StepCard num={1} title="Construis les 6 classes" done={s1}>
          <ConstructionGroupes solved={s1} onSolved={() => setS1(true)} />
        </StepCard>

        <StepCard num={2} title="Nomme ce que tu as construit" done={s2} locked={!s1}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{OP_Q.q}</p>
            <ChoiceGrid options={OP_Q.options} selected={opPick} onSelect={setOpPick} revealed={opRevealed} correctIndex={OP_Q.correct} cols={2} />
            {!opRevealed && (
              <div className="text-center">
                <ValidateButton onClick={() => setOpRevealed(true)} disabled={opPick === null}>Valider</ValidateButton>
              </div>
            )}
            {opRevealed && (
              <Feedback tone={opPick === OP_Q.correct ? 'ok' : 'ko'}>
                {OP_Q.explain}
                {opPick !== OP_Q.correct && (
                  <>
                    {' '}
                    <button type="button" onClick={() => { setOpRevealed(false); setOpPick(null); }} className="underline font-semibold">Réessayer</button>
                  </>
                )}
              </Feedback>
            )}
          </div>
        </StepCard>

        <StepCard num={3} title="Va plus loin que le calcul" done={s3} locked={!s2}>
          <BusReasoning solved={s3} onSolved={() => setS3(true)} />
          {s3 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-slate-900 text-white rounded-2xl p-5 text-center space-y-1">
              <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Ce que tu retiens</div>
              <p className="text-sm text-slate-300">
                Une situation, une fois modélisée, ne se résume pas toujours à UN SEUL calcul : il faut parfois{' '}
                <strong className="text-white">interpréter</strong> le résultat pour répondre à la vraie question.
              </p>
            </motion.div>
          )}
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
