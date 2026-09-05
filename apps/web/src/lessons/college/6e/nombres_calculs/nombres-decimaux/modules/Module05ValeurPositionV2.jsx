import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MousePointerClick } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DecimalPlaceTable from '../components/DecimalPlaceTable';
import UnitGrid from '../components/UnitGrid';
import { formatDec, decCells } from '../components/decimalUtils';

/**
 * Module 5 V2 — reconstruit sur le lesson kit.
 * DigitHunt reste une manipulation maison (cliquer le bon chiffre dans le
 * tableau) suivie d'un TapQuestion pour la question de sens ; les deux
 * autres étapes utilisent TapQuestion directement.
 */
const LABO = 7.305;

const CHASSES = [
  { digit: 3, key: 'd1', options: ['3 unités', '3 dixièmes, soit 0,3', '3 centièmes, soit 0,03', '3 millièmes, soit 0,003'], correct: 1, explain: "Le 3 occupe la première colonne après la virgule : les dixièmes. Il représente 3 dixièmes, c'est-à-dire 0,3." },
  { digit: 0, key: 'd2', options: ['0 unité', '0 dixième', '0 centième', 'Rien du tout : il ne sert à rien'], correct: 2, explain: "Le 0 occupe la colonne des centièmes : il indique qu'il n'y a AUCUN centième. Il est indispensable : sans lui, le 5 glisserait à la place des centièmes et le nombre changerait." },
  { digit: 5, key: 'd3', options: ['5 dixièmes, soit 0,5', '5 centièmes, soit 0,05', '5 millièmes, soit 0,005', '5 unités'], correct: 2, explain: 'Le 5 est à la troisième position après la virgule : les millièmes. Il vaut 5 millièmes, soit 0,005.' },
];

function DigitHunt({ chasse, solved, onSolved }) {
  const [clicked, setClicked] = useState(solved ? chasse.key : null);
  const located = clicked === chasse.key;
  const clickedCell = clicked ? decCells(LABO, { intPlaces: 1, decPlaces: 3 }).find((c) => c.key === clicked) : null;

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 sm:p-4">
        <DecimalPlaceTable
          value={LABO}
          intPlaces={1}
          decPlaces={3}
          selectedKey={clicked}
          onDigitClick={(cell) => {
            if (solved) return;
            setClicked(cell.key);
          }}
        />
      </div>

      {!located && (
        <div className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <MousePointerClick className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" aria-hidden="true" />
          <span>
            Clique sur le chiffre <strong className="font-mono text-base">{chasse.digit}</strong> dans le tableau.
          </span>
        </div>
      )}

      {clicked && !located && (
        <Feedback tone="hint">
          Tu as sélectionné le <strong className="font-mono">{clickedCell?.digit}</strong> (colonne des{' '}
          {clickedCell?.label.toLowerCase()}). Cherche le chiffre <strong className="font-mono">{chasse.digit}</strong>.
        </Feedback>
      )}

      {located && (
        <TapQuestion
          prompt={
            <>
              Que représente le chiffre <span className="font-mono text-base">{chasse.digit}</span> dans{' '}
              <span className="font-mono">{formatDec(LABO)}</span> ?
            </>
          }
          options={chasse.options}
          correct={chasse.correct}
          cols={2}
          explain={chasse.explain}
          solved={solved}
          onAnswered={() => onSolved?.()}
        />
      )}
    </div>
  );
}

const ZERO_Q = {
  q: 'Les nombres 4,05 et 4,5 représentent-ils la même quantité ?',
  options: ['Oui, le zéro ne change rien', 'Non : 4,05 vaut 4 unités et 5 centièmes, alors que 4,5 vaut 4 unités et 5 dixièmes', 'Oui, car ils ont les mêmes chiffres', 'Non : 4,05 est plus grand que 4,5'],
  correct: 1,
  explain: "Le 5 n'occupe pas la même colonne ! Dans 4,05 il est aux centièmes (5 centièmes = 0,05) ; dans 4,5 il est aux dixièmes (5 dixièmes = 0,50, soit 50 centièmes). 4,5 est dix fois plus grand que 0,05 au-delà de 4.",
};

const ZERO_FINAL_Q = {
  q: 'Et 4,50 : est-ce la même quantité que 4,5 ?',
  options: ['Oui : 50 centièmes = 5 dixièmes, la quantité est identique', 'Non, 4,50 est plus grand', 'Non, 4,50 est plus petit', 'Impossible à dire'],
  correct: 0,
  explain: "Ajouter un zéro À LA FIN de la partie décimale ne change rien : 5 dixièmes = 50 centièmes, c'est la même quantité coloriée. En revanche, ajouter un zéro JUSTE APRÈS la virgule décale tous les chiffres et change le nombre.",
};

export default function Module05ValeurPosition() {
  const [chassesDone, setChassesDone] = useState([]);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);

  const s1 = chassesDone.length === CHASSES.length;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="La valeur de position"
      moduleSubtitle="Après la virgule aussi, c'est la position qui décide de la valeur d'un chiffre."
      estimatedTime="12 min"
      brief={{
        tag: '🔬 Laboratoire',
        title: 'Un chiffre après la virgule ne vaut pas ce qu\'il paraît.',
        tone: 'indigo',
        body: (
          <p>
            Comme pour les nombres entiers, un chiffre ne vaut pas « lui-même » : il vaut ce que sa{' '}
            <strong className="text-white">colonne</strong> lui donne. Tu vas le vérifier sur 7,305.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: `Laboratoire de valeur : ${formatDec(LABO)}`,
          done: s1,
          content: (
            <div className="space-y-8">
              {CHASSES.map((chasse, i) =>
                i === 0 || chassesDone.includes(i - 1) ? (
                  <div key={chasse.key} className="space-y-3">
                    <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Analyse {i + 1} / {CHASSES.length}
                    </div>
                    <DigitHunt
                      chasse={chasse}
                      solved={chassesDone.includes(i)}
                      onSolved={() => setChassesDone((d) => (d.includes(i) ? d : [...d, i]))}
                    />
                  </div>
                ) : null
              )}

              {s1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
                    <div className="font-mono text-4xl font-extrabold">7,305</div>
                    <div className="text-slate-400" aria-hidden="true">=</div>
                    <div className="text-lg sm:text-xl text-amber-300">
                      <MathText>{'$7 + \\frac{3}{10} + \\frac{0}{100} + \\frac{5}{1000}$'}</MathText>
                    </div>
                  </div>
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-3">
                    <DecimalPlaceTable value={LABO} intPlaces={1} decPlaces={3} showValues dimZeros />
                  </div>
                </motion.div>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le piège du zéro : 4,05 et 4,5',
          subtitle: 'Deux nombres qui se ressemblent… et qui ne valent pas du tout la même chose.',
          done: s2,
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { v: 4.05, cents: 5, tone: 'rose', legend: '4 unités + 5 centièmes' },
                  { v: 4.5, cents: 50, tone: 'emerald', legend: '4 unités + 5 dixièmes = 50 centièmes' },
                ].map((x) => (
                  <div key={x.v} className="border-2 border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                    <div className="text-center font-mono font-extrabold text-2xl text-slate-800">{formatDec(x.v)}</div>
                    <div className="text-[11px] font-mono text-slate-400 text-center">la 5<sup>e</sup> unité, agrandie</div>
                    <UnitGrid parts={100} shaded={x.cents} tone={x.tone} showCount={false} size="sm" />
                    <p className="text-xs text-center text-slate-600">{x.legend}</p>
                  </div>
                ))}
              </div>

              <TapQuestion
                prompt={ZERO_Q.q}
                options={ZERO_Q.options}
                correct={ZERO_Q.correct}
                cols={1}
                explain={ZERO_Q.explain}
                solved={s2}
                onAnswered={() => setS2(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Et le zéro tout à la fin ?',
          done: s3,
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { v: 4.5, cents: 50, label: '4,5 → 5 dixièmes' },
                  { v: 4.5, cents: 50, label: '4,50 → 50 centièmes' },
                ].map((x, i) => (
                  <div key={i} className="border-2 border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                    <div className="text-center font-mono font-extrabold text-2xl text-slate-800">{i === 0 ? '4,5' : '4,50'}</div>
                    <UnitGrid parts={i === 0 ? 10 : 100} shaded={i === 0 ? 5 : 50} tone="emerald" showCount={false} size="sm" />
                    <p className="text-xs text-center text-slate-600">{x.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 text-center">
                La surface coloriée est exactement la même : seul le découpage a changé.
              </p>

              <TapQuestion
                prompt={ZERO_FINAL_Q.q}
                options={ZERO_FINAL_Q.options}
                correct={ZERO_FINAL_Q.correct}
                cols={1}
                explain={ZERO_FINAL_Q.explain}
                solved={s3}
                onAnswered={() => setS3(true)}
              />

              {s3 && (
                <div className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-2xl p-5 text-center space-y-1">
                  <div className="text-xs font-mono uppercase tracking-widest text-violet-200">La règle à ne jamais oublier</div>
                  <div className="text-lg sm:text-xl font-space font-extrabold">4,5 = 4,50 mais 4,5 ≠ 4,05</div>
                  <p className="text-sm text-violet-100">
                    Un zéro <strong>à la fin</strong> ne change rien. Un zéro <strong>juste après la virgule</strong>{' '}
                    décale tout.
                  </p>
                </div>
              )}
            </div>
          ),
        },
      ]}
    />
  );
}
