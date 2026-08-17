import React, { useState } from 'react';
import { Feedback, NumberField, ChoiceGrid, ValidateButton } from './LessonUI';
import { parseFr } from '@smarter-academy/core';

/**
 * AnswerBuilder — construire une réponse complète, pas juste un nombre.
 *
 * Trois briques obligatoires : le RÉSULTAT, l'UNITÉ, la PHRASE qui répond
 * réellement à la question posée. « 157 » seul n'est jamais accepté comme
 * réponse complète dans cette leçon.
 *
 * @param {number} value            résultat numérique attendu
 * @param {string[]} unitOptions    unités proposées (dont la bonne)
 * @param {string} correctUnit
 * @param {string[]} sentenceOptions phrases proposées (dont la bonne)
 * @param {number} correctSentenceIndex
 */
export default function AnswerBuilder({
  value,
  unitOptions,
  correctUnit,
  sentenceOptions,
  correctSentenceIndex,
  onSolved,
  solved,
  hint,
}) {
  const [val, setVal] = useState('');
  const [valChecked, setValChecked] = useState(false);
  const [unit, setUnit] = useState(null);
  const [sentencePick, setSentencePick] = useState(null);
  const [sentenceRevealed, setSentenceRevealed] = useState(false);

  const numOk = parseFr(val) === value;
  const unitOk = unit === correctUnit;
  const step1Done = numOk && unitOk;

  const checkNum = () => {
    setValChecked(true);
  };

  return (
    <div className="space-y-4">
      {/* Résultat + unité */}
      <div>
        <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
          1. Résultat et unité
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <NumberField
            value={val}
            onChange={(v) => { setVal(v); setValChecked(false); }}
            ariaLabel="Résultat"
            placeholder="?"
            width="w-28"
          />
          <div className="flex gap-1.5 flex-wrap">
            {unitOptions.map((u) => (
              <button
                key={u}
                type="button"
                disabled={solved}
                onClick={() => { setUnit(u); setValChecked(false); }}
                aria-pressed={unit === u}
                className={`px-3 py-2 rounded-lg border-2 font-mono text-sm font-bold min-h-[40px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  unit === u ? 'bg-blue-600 border-blue-700 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
          {!step1Done && (
            <ValidateButton onClick={checkNum} disabled={!val || unit === null}>
              OK
            </ValidateButton>
          )}
        </div>
        {valChecked && !step1Done && (
          <Feedback tone="hint" className="mt-2">
            {hint || (!numOk ? 'Revérifie ton calcul.' : "Cette unité ne correspond pas à ce que demande la question.")}
          </Feedback>
        )}
      </div>

      {/* Phrase de réponse */}
      {step1Done && (
        <div>
          <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
            2. La phrase qui répond à la question
          </div>
          <ChoiceGrid
            options={sentenceOptions}
            selected={sentencePick}
            onSelect={setSentencePick}
            revealed={sentenceRevealed || solved}
            correctIndex={correctSentenceIndex}
            cols={1}
          />
          {!sentenceRevealed && !solved && (
            <div className="text-center mt-2">
              <ValidateButton
                onClick={() => {
                  setSentenceRevealed(true);
                  if (sentencePick === correctSentenceIndex) onSolved?.();
                }}
                disabled={sentencePick === null}
              >
                Valider ma réponse
              </ValidateButton>
            </div>
          )}
        </div>
      )}

      {solved && (
        <Feedback tone="ok">
          Réponse complète : <strong className="font-mono">{value} {correctUnit}</strong> — «{' '}
          {sentenceOptions[correctSentenceIndex]} »
        </Feedback>
      )}
    </div>
  );
}
