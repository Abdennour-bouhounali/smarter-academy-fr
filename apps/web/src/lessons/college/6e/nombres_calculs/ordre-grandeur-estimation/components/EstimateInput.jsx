import React, { useState } from 'react';
import { Feedback, NumberField, ValidateButton } from '../../../../../common/components/LessonUI';
import { formatFr } from './estimationUtils';
import { parseFr } from '@smarter-academy/core';

/**
 * EstimateInput — saisie libre d'une estimation, tolérante par nature.
 *
 * Contrairement à un calcul exact, plusieurs arrondis valables donnent des
 * estimations légèrement différentes (350+250=600, 300+300=600, mais aussi
 * 340+250=590...). On accepte donc une PLAGE de valeurs, pas un nombre unique
 * — la marge est passée par le module appelant, qui la choisit selon les
 * arrondis raisonnables pour ce calcul précis.
 */
export default function EstimateInput({ prompt, acceptMin, acceptMax, exact, exactLabel = 'Résultat exact', solved, onSolved, hint }) {
  const [val, setVal] = useState('');
  const [checked, setChecked] = useState(false);
  const [showExact, setShowExact] = useState(false);

  const n = parseFr(val);
  const isRight = !Number.isNaN(n) && n >= acceptMin && n <= acceptMax;

  const submit = () => {
    setChecked(true);
    if (isRight) {
      onSolved?.();
      setShowExact(true);
    }
  };

  return (
    <div className="space-y-3">
      {prompt && <p className="text-sm text-slate-600">{prompt}</p>}

      {solved ? (
        <div className="text-center font-mono font-extrabold text-2xl text-emerald-700">≈ {formatFr(n)}</div>
      ) : (
        <div className="flex items-center gap-2 justify-center flex-wrap">
          <NumberField
            value={val}
            onChange={(v) => { setVal(v); setChecked(false); }}
            onEnter={submit}
            ariaLabel="Ton estimation"
            placeholder="≈ ?"
            width="w-32"
          />
          <ValidateButton onClick={submit} disabled={!val}>
            Valider
          </ValidateButton>
        </div>
      )}

      {checked && !isRight && <Feedback tone="hint">{hint}</Feedback>}

      {(solved || showExact) && exact !== undefined && (
        <Feedback tone="ok">
          {exactLabel} : <strong className="font-mono">{formatFr(exact)}</strong>. Ton estimation était bien dans
          le bon ordre de grandeur.
        </Feedback>
      )}
    </div>
  );
}
