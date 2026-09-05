import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import OrderingGame from '../../../../../common/components/OrderingGame';
import NumberLine from '../../../../../common/components/NumberLine';
import { Feedback, ValidateButton, NumberField } from '../../../../../common/components/LessonUI';
import { formatFr, texFr, parseFr, frame } from '../components/numberUtils';

/**
 * Module 7 V2 — reconstruit sur le lesson kit. Les rangements utilisent
 * OrderingGame en mode `formative` (jamais bloquant, bon ordre révélé) ;
 * l'encadrement à deux bornes reste une interaction maison ; le QCM de
 * consolidation passe en TapQuestion.
 */

const A_RANGER = [4502, 4250, 5020, 3999, 4999].map((v) => ({ id: `n${v}`, value: v }));

const CIBLE = 4582;

const NIVEAUX = [
  {
    unit: 1000,
    title: 'Entre quels milliers se trouve 4 582 ?',
    hint: "Un millier « rond » se termine par trois zéros : 4 000, 5 000, 6 000… Cherche celui juste en dessous de 4 582 et celui juste au-dessus.",
    lineStep: 100,
    labelEvery: 5,
  },
  {
    unit: 100,
    title: 'Entre quelles centaines ?',
    hint: 'Une centaine « ronde » se termine par deux zéros : 4 500, 4 600, 4 700…',
    lineStep: 10,
    labelEvery: 5,
  },
  {
    unit: 10,
    title: 'Entre quelles dizaines ?',
    hint: 'Une dizaine « ronde » se termine par un zéro : 4 570, 4 580, 4 590…',
    lineStep: 1,
    labelEvery: 5,
  },
];

function EncadrementStep({ niveau, solved, onSolved, react }) {
  const [low, setLow] = useState('');
  const [high, setHigh] = useState('');
  const [checked, setChecked] = useState(false);
  const [expected0, expected1] = frame(CIBLE, niveau.unit);

  const isRight = parseFr(low) === expected0 && parseFr(high) === expected1;

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-700">{niveau.title}</p>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        {solved ? (
          <div className="font-mono font-extrabold text-lg sm:text-xl text-emerald-700">
            <MathText>{`$${texFr(expected0)} < ${texFr(CIBLE)} < ${texFr(expected1)}$`}</MathText>
          </div>
        ) : (
          <>
            <NumberField
              value={low}
              onChange={(v) => {
                setLow(v);
                setChecked(false);
              }}
              ariaLabel="Borne inférieure"
              width="w-28"
              size="sm"
            />
            <span className="font-mono font-bold text-xl text-slate-500">&lt;</span>
            <span className="font-mono font-extrabold text-xl text-slate-800 tabular-nums px-2">
              {formatFr(CIBLE)}
            </span>
            <span className="font-mono font-bold text-xl text-slate-500">&lt;</span>
            <NumberField
              value={high}
              onChange={(v) => {
                setHigh(v);
                setChecked(false);
              }}
              ariaLabel="Borne supérieure"
              width="w-28"
              size="sm"
            />
          </>
        )}
      </div>

      {!solved && (
        <div className="text-center">
          <ValidateButton
            onClick={() => {
              setChecked(true);
              react(isRight);
              onSolved?.();
            }}
            disabled={!low || !high}
          >
            Valider l'encadrement
          </ValidateButton>
        </div>
      )}

      {/* Pas de `!solved` : onSolved est inconditionnel, le retour d'erreur
          doit rester visible à côté de la correction. */}
      {checked && !isRight && (
        <Feedback tone="hint">
          Ta réponse : <span className="font-mono">{low || '—'} &lt; {formatFr(CIBLE)} &lt; {high || '—'}</span>.{' '}
          {niveau.hint} La bonne réponse :{' '}
          <span className="font-mono font-bold">
            {formatFr(expected0)} &lt; {formatFr(CIBLE)} &lt; {formatFr(expected1)}
          </span>
          .
        </Feedback>
      )}

      {solved && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
            <NumberLine
              min={expected0}
              max={expected1}
              step={niveau.lineStep}
              labelEvery={niveau.labelEvery}
              height={150}
              markers={[{ value: CIBLE, label: formatFr(CIBLE), color: '#7c3aed' }]}
              ariaLabel={`4 582 encadré entre ${formatFr(expected0)} et ${formatFr(expected1)}`}
            />
          </div>
          <p className="text-xs text-slate-500 text-center">
            <ZoomIn className="inline w-3.5 h-3.5 mr-1" aria-hidden="true" />
            L'intervalle mesure {formatFr(niveau.unit)} : on sait maintenant où se trouve 4 582 à{' '}
            {formatFr(niveau.unit)} près.
          </p>
        </motion.div>
      )}
    </div>
  );
}

const CONSO = {
  q: 'Entre quels milliers se trouve 9 875 ?',
  options: ['8 000 et 9 000', '9 000 et 10 000', '9 800 et 9 900', '900 et 1 000'],
  correct: 1,
  explain:
    "9 875 contient 9 milliers complets (9 000) et il n'atteint pas 10 000. Donc 9 000 < 9 875 < 10 000. Attention : 9 800 et 9 900 sont des centaines, pas des milliers.",
};

export default function Module07RangerEncadrer() {
  const [ascDone, setAscDone] = useState(false);
  const [descDone, setDescDone] = useState(false);
  const [niveauxDone, setNiveauxDone] = useState([]);
  const [consoRevealed, setConsoRevealed] = useState(false);

  const s3 = niveauxDone.length === NIVEAUX.length && consoRevealed;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Ranger et encadrer"
      moduleSubtitle="Mettre les nombres en ordre, puis les coincer entre deux repères de plus en plus proches."
      estimatedTime="12 min"
      brief={{
        tag: '📊 Ordre',
        title: 'Cinq nombres, deux rangements, un encadrement.',
        body: (
          <p>
            Ranger, c'est comparer plusieurs fois de suite. Encadrer, c'est dire entre quels repères ronds se
            situe un nombre — de plus en plus précisément.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: "Range dans l'ordre croissant",
          done: ascDone,
          content: (
            <OrderingGame
              items={A_RANGER}
              direction="asc"
              solved={ascDone}
              onSolved={() => setAscDone(true)}
              instruction="Du plus petit au plus grand. Si tu te trompes, on te dira exactement où l'ordre casse."
              formative
            />
          ),
        },
        {
          num: 2,
          title: "Maintenant dans l'ordre décroissant",
          done: descDone,
          content: (
            <OrderingGame
              items={A_RANGER}
              direction="desc"
              solved={descDone}
              onSolved={() => setDescDone(true)}
              instruction="Du plus grand au plus petit. Ce n'est pas seulement la liste à l'envers : vérifie chaque comparaison."
              formative
            />
          ),
        },
        {
          num: 3,
          title: 'Encadrer 4 582 : de plus en plus précis',
          subtitle: "D'abord entre deux milliers, puis deux centaines, puis deux dizaines.",
          done: s3,
          content: (kit) => (
            <div className="space-y-8">
              {NIVEAUX.map((niveau, i) =>
                i === 0 || niveauxDone.includes(i - 1) ? (
                  <div key={niveau.unit} className="space-y-3 border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                    <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Précision {i + 1} / {NIVEAUX.length}
                    </div>
                    <EncadrementStep
                      niveau={niveau}
                      solved={niveauxDone.includes(i)}
                      onSolved={() => setNiveauxDone((d) => (d.includes(i) ? d : [...d, i]))}
                      react={kit.react}
                    />
                  </div>
                ) : null
              )}

              {niveauxDone.length === NIVEAUX.length && (
                <div className="space-y-4 border-t border-slate-200 pt-5">
                  <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-2 text-center">
                    <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
                      Trois encadrements du même nombre
                    </div>
                    {NIVEAUX.map((n) => {
                      const [lo, hi] = frame(CIBLE, n.unit);
                      return (
                        <div key={n.unit} className="font-mono text-base sm:text-lg font-bold text-amber-300">
                          <MathText>{`$${texFr(lo)} < ${texFr(CIBLE)} < ${texFr(hi)}$`}</MathText>
                        </div>
                      );
                    })}
                    <p className="text-xs text-slate-400 pt-1">
                      Plus l'intervalle est petit, plus on sait précisément où se trouve le nombre.
                    </p>
                  </div>

                  <TapQuestion
                    prompt={CONSO.q}
                    options={CONSO.options}
                    correct={CONSO.correct}
                    cols={2}
                    explain={CONSO.explain}
                    onAnswered={() => setConsoRevealed(true)}
                  />
                </div>
              )}
            </div>
          ),
        },
      ]}
    />
  );
}
