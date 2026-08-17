import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import GroupBuilder from '../../../../../common/components/GroupBuilder';
import BarModel from '../../../../../common/components/BarModel';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, NumberField } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseFr } from '@smarter-academy/core';

/* ─── Étape 1 : le modèle « groupes » ─────────────────────────────── */
function ModeleGroupes({ solved, onSolved }) {
  const [groups, setGroups] = useState(0);
  const target = 4;
  const perGroup = 18;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Une bibliothèque possède 4 étagères. Chaque étagère contient 18 livres. Construis les 4 étagères.
      </p>
      <GroupBuilder perGroup={perGroup} groups={groups} onChange={setGroups} max={4} tone="amber" unit=" livres" disabled={solved} />
      {!solved && (
        <div className="text-center">
          <ValidateButton onClick={() => groups === target && onSolved?.()} disabled={groups !== target}>Valider</ValidateButton>
        </div>
      )}
      {solved && (
        <Feedback tone="ok">
          Le modèle « groupes » rend la multiplication visible : 4 étagères de 18 livres, c'est{' '}
          <strong className="font-mono">4 × 18 = 72</strong> livres.
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 2 : le modèle « schéma en barres » ───────────────────── */
function ModeleBarres({ solved, onSolved }) {
  const [val, setVal] = useState('');
  const [fb, setFb] = useState(null);

  const check = () => {
    if (parseFr(val) === 23) { onSolved?.(); setFb(null); }
    else setFb('La partie connue (12 €) et la partie inconnue (?) forment ensemble les 35 € de départ.');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Luc possède 35 €. Il dépense 12 €. Que représente le schéma ?</p>
      <BarModel
        bars={[{ label: 'Argent de Luc', segments: [{ value: 12, tone: 'rose', text: '−12 €', removed: true }, { value: 23, tone: 'sky', text: '?' }] }]}
        maxValue={35}
        unit=" €"
      />
      {solved ? (
        <Feedback tone="ok">
          Il reste <strong>23 €</strong> à Luc. Le schéma en barres montre le TOUT (35 €) partagé en une partie
          dépensée et une partie restante : 35 − 12 = 23.
        </Feedback>
      ) : (
        <>
          <div className="flex items-center gap-2 justify-center">
            <NumberField value={val} onChange={(v) => { setVal(v); setFb(null); }} onEnter={check} ariaLabel="Argent restant" placeholder="?" width="w-24" />
            <span className="text-sm font-mono text-slate-500">€</span>
            <ValidateButton onClick={check} disabled={!val}>OK</ValidateButton>
          </div>
          {fb && <Feedback tone="hint">{fb}</Feedback>}
        </>
      )}
    </div>
  );
}

/* ─── Étape 3 : choisir la bonne représentation ──────────────────── */
const CHOIX = [
  {
    situation: "Comparer la taille de 3 classes qui n'ont pas le même nombre d'élèves.",
    options: [
      { key: 'barres', label: '📊 Schéma en barres', good: true },
      { key: 'droite', label: '📏 Droite graduée', good: false },
      { key: 'tableau', label: '📋 Tableau', good: false },
    ],
    explain: 'Le schéma en barres montre immédiatement quelle classe est la plus grande et de combien.',
  },
  {
    situation: 'Repérer une position, comme un point kilométrique sur une route.',
    options: [
      { key: 'barres', label: '📊 Schéma en barres', good: false },
      { key: 'droite', label: '📏 Droite graduée', good: true },
      { key: 'objets', label: '🧱 Objets', good: false },
    ],
    explain: 'Une position sur un trajet se représente naturellement sur une droite graduée.',
  },
  {
    situation: "Organiser le prix de 5 fournitures différentes pour les comparer d'un coup d'œil.",
    options: [
      { key: 'objets', label: '🧱 Objets', good: false },
      { key: 'tableau', label: '📋 Tableau', good: true },
      { key: 'droite', label: '📏 Droite graduée', good: false },
    ],
    explain: 'Un tableau organise plusieurs données de même nature, prêtes à comparer.',
  },
];

function ChoixRepresentation({ solved, onSolved }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const allAnswered = Object.keys(answers).length === CHOIX.length;
  const allRight = CHOIX.every((c, i) => c.options[answers[i]]?.good);

  return (
    <div className="space-y-5">
      {CHOIX.map((c, i) => (
        <div key={c.situation} className="space-y-2 border-t border-slate-100 pt-4 first:border-0 first:pt-0">
          <p className="text-sm font-semibold text-slate-700">{c.situation}</p>
          <div className="flex gap-2 flex-wrap">
            {c.options.map((opt, oi) => {
              const isSel = answers[i] === oi;
              const isRight = checked && opt.good;
              const isWrong = checked && isSel && !opt.good;
              return (
                <button
                  key={opt.key}
                  type="button"
                  disabled={checked && solved}
                  onClick={() => { setChecked(false); setAnswers((a) => ({ ...a, [i]: oi })); }}
                  className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium min-h-[44px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isRight ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : isWrong ? 'bg-rose-50 border-rose-400 text-rose-700' : isSel ? 'bg-blue-50 border-blue-500 text-blue-900' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {checked && <p className="text-xs text-slate-500">{c.explain}</p>}
        </div>
      ))}
      {!solved && (
        <div className="text-center">
          <ValidateButton onClick={() => { setChecked(true); if (allRight) onSolved?.(); }} disabled={!allAnswered}>Vérifier</ValidateButton>
        </div>
      )}
      {solved && (
        <Feedback tone="info">
          Retiens la question clé : <strong>« Quelle représentation m'aide le mieux à comprendre CETTE situation ? »</strong> — il n'y a pas un seul bon modèle universel.
        </Feedback>
      )}
    </div>
  );
}

export default function Module04Modeliser() {
  const navLinks = getNavLinks(4);
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);
  const allDone = s1 && s2 && s3;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Modéliser"
      moduleSubtitle="Groupes, schéma en barres, droite graduée, tableau : rendre la relation visible."
      moduleNumber={4}
      estimatedTime="10 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="🧩 Modélisation" title="Un modèle rend une relation visible.">
          <p>Il existe plusieurs façons de représenter une même situation. Chacune éclaire une relation différente.</p>
        </MissionBrief>

        <StepCard num={1} title="Le modèle « groupes »" done={s1}>
          <ModeleGroupes solved={s1} onSolved={() => setS1(true)} />
        </StepCard>

        <StepCard num={2} title="Le modèle « schéma en barres »" done={s2} locked={!s1}>
          <ModeleBarres solved={s2} onSolved={() => setS2(true)} />
        </StepCard>

        <StepCard num={3} title="Choisir la bonne représentation" done={s3} locked={!s2}>
          <ChoixRepresentation solved={s3} onSolved={() => setS3(true)} />
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
