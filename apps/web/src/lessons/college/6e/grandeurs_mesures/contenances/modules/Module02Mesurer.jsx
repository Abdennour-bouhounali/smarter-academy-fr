import React, { useState } from 'react';
import { Ruler } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import LiquidContainer from '../components/LiquidContainer';
import { formatDec } from '../components/capacityUtils';

/**
 * Module 2 V2 — reconstruit sur le lesson kit. Le repère 1 L reste une
 * manipulation maison (monter/descendre le niveau) ; les lectures de
 * niveau passent en TapQuestion avec le verre gradué en visuel.
 */

const MAX_L = 2;
const GRADS = [0.5, 1, 1.5, 2].map((v) => ({ pct: v / MAX_L, label: `${formatDec(v)} L` }));

function LitreReference({ solved, onSolved, react }) {
  const [value, setValue] = useState(0);
  const [touched, setTouched] = useState(false);
  const atTarget = value === 1;

  const bump = (delta) => {
    setTouched(true);
    setValue((v) => Math.max(0, Math.min(MAX_L, Math.round((v + delta) * 2) / 2)));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Voici un repère à connaître : <strong>1 litre (1 L)</strong>. Utilise les boutons pour faire monter ou
        descendre le niveau, et observe où se trouve 1 L.
      </p>
      <div className="flex justify-center">
        <LiquidContainer shape="glass" fillPct={(solved ? 1 : value) / MAX_L} graduations={GRADS} color="#0ea5e9" ariaLabel="Verre gradué de référence" />
      </div>
      {!solved && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => bump(-0.5)}
            disabled={value <= 0}
            className="w-11 h-11 rounded-xl bg-white border-2 border-slate-200 font-bold text-lg disabled:opacity-30 hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Diminuer de 0,5 L"
          >
            −
          </button>
          <div className="font-mono text-2xl font-extrabold text-slate-800 tabular-nums w-20 text-center">{formatDec(value)} L</div>
          <button
            type="button"
            onClick={() => bump(0.5)}
            disabled={value >= MAX_L}
            className="w-11 h-11 rounded-xl bg-white border-2 border-slate-200 font-bold text-lg disabled:opacity-30 hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Augmenter de 0,5 L"
          >
            +
          </button>
        </div>
      )}
      {!solved && touched && !atTarget && (
        <Feedback tone="hint">
          Tu es à {formatDec(value)} L. Le repère à retrouver est <strong>1 L</strong>.
          {value > 1 ? ' Redescends vers 1 L.' : ' Fais encore monter le niveau.'}
        </Feedback>
      )}
      {!solved && atTarget && (
        <div className="text-center space-y-3">
          <Feedback tone="ok">✓ Exactement 1 L !</Feedback>
          <ValidateButton
            onClick={() => {
              react(true);
              onSolved?.();
            }}
          >
            J’ai repéré 1 L
          </ValidateButton>
        </div>
      )}
      {solved && <Feedback tone="ok">1 L, c’est le repère : une bouteille d’eau classique en contient à peu près autant.</Feedback>}
    </div>
  );
}

const READ_ROUNDS = [
  { value: 1, options: ['0,5 L', '1 L', '1,5 L'], correct: 1 },
  { value: 1.5, options: ['1 L', '1,5 L', '2 L'], correct: 1 },
  { value: 0.5, options: ['0,5 L', '1 L', '1,5 L'], correct: 0 },
];

const UNLABELED_GRADS = GRADS.map((g) => ({ pct: g.pct, label: null }));

export default function Module02Mesurer() {
  const [refDone, setRefDone] = useState(false);
  const [readDone, setReadDone] = useState([]);
  const allReadDone = readDone.length === READ_ROUNDS.length;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Mesurer une contenance"
      moduleSubtitle="Le litre comme repère : remplir, lire, comparer."
      estimatedTime="9 min"
      brief={{
        tag: '📋 Mission 02',
        title: 'Pour mesurer une contenance, il faut un repère.',
        body: <p>Ce repère, c’est le litre. Découvre-le en le manipulant.</p>,
      }}
      steps={[
        {
          num: 1,
          title: '1 litre, un repère à connaître',
          done: refDone,
          content: (kit) => <LitreReference solved={refDone} onSolved={() => setRefDone(true)} react={kit.react} />,
        },
        {
          num: 2,
          title: 'Lis le niveau',
          done: allReadDone,
          content: (
            <div className="space-y-8">
              {READ_ROUNDS.map((round, i) =>
                i === 0 || readDone.includes(i - 1) ? (
                  <div key={round.value} className="border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                    <TapQuestion
                      above={
                        <div className="flex justify-center">
                          <LiquidContainer shape="glass" fillPct={round.value / MAX_L} graduations={UNLABELED_GRADS} color="#0ea5e9" ariaLabel="Verre gradué, niveau à lire" height={190} />
                        </div>
                      }
                      prompt="Combien ce verre contient-il ?"
                      options={round.options}
                      correct={round.correct}
                      cols={3}
                      explain={
                        <>
                          <strong>{round.options[round.correct]}</strong> — compte les graduations depuis le bas : chacune vaut 0,5 L.
                        </>
                      }
                      solved={readDone.includes(i)}
                      onAnswered={() => setReadDone((d) => (d.includes(i) ? d : [...d, i]))}
                    />
                  </div>
                ) : null
              )}
            </div>
          ),
        },
      ]}
      footer={
        <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <Ruler className="w-6 h-6 mx-auto text-sky-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Le litre n’est qu’un premier repère. D’autres unités existent pour les quantités plus petites ou plus
            grandes.
          </p>
        </div>
      }
    />
  );
}
