import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import NumberLine from '../../../../../common/components/NumberLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { formatDec, parseDec } from '../components/decimalUtils';

/**
 * Module 9 V2 — reconstruit sur le lesson kit. Toutes les questions passent
 * en TapQuestion / NumericQuestion — formatif de bout en bout.
 */
const ARRONDIS = [
  { value: 1.98, context: '🧴 Une bouteille contient 1,98 L', explain: "1,98 est à seulement 0,02 de 2, mais à 0,98 de 1. Il est donc bien plus proche de 2 : on dit que 1,98 L, c'est « presque 2 litres »." },
  { value: 5.82, context: '📏 Une planche mesure 5,82 m', explain: "5,82 dépasse la moitié de l'intervalle (5,5) : il est plus proche de 6 que de 5." },
  { value: 3.4, context: '⚖️ Un colis pèse 3,4 kg', explain: "3,4 n'atteint pas la moitié de l'intervalle (3,5) : il reste plus proche de 3." },
  { value: 12.05, context: '⏱️ Une course a duré 12,05 minutes', explain: '12,05 est tout près de 12 : seulement 5 centièmes au-dessus.' },
];

function ArrondiItem({ item, index, total, solved, onSolved }) {
  const low = Math.floor(item.value);
  const high = low + 1;
  const correct = Math.round(item.value) === low ? 0 : 1;

  return (
    <div className="space-y-3 border-t border-slate-100 pt-5 first:border-0 first:pt-0">
      <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
        Situation {index + 1} / {total}
      </div>
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-800">{item.context}</p>
        <NumberLine
          min={low} max={high} step={0.1} labelEvery={5} height={150}
          format={(v) => formatDec(v)}
          markers={[{ value: item.value, label: formatDec(item.value), color: '#7c3aed' }]}
          ariaLabel={`${formatDec(item.value)} placé entre ${low} et ${high}`}
        />
      </div>

      <TapQuestion
        prompt={`De quel nombre entier ${formatDec(item.value)} est-il le plus proche ?`}
        options={[String(low), String(high)]}
        correct={correct}
        cols={2}
        explain={item.explain}
        solved={solved}
        onAnswered={() => onSolved?.()}
      />
    </div>
  );
}

const ESTIMATIONS = [
  { calcul: '19,8 + 5,1', estimation: 25, exact: 24.9, estimOptions: ['15', '25', '70', '250'], estimCorrect: 1, explainEstim: '19,8 est presque 20 et 5,1 est presque 5. On attend donc un résultat proche de 20 + 5 = 25.', explainExact: "Le résultat exact est 24,9 : très proche de l'estimation 25. L'estimation a bien joué son rôle de vérification." },
  { calcul: '4,95 + 3,02', estimation: 8, exact: 7.97, estimOptions: ['5', '8', '12', '80'], estimCorrect: 1, explainEstim: '4,95 ≈ 5 et 3,02 ≈ 3, donc on attend environ 5 + 3 = 8.', explainExact: "Résultat exact : 7,97. L'estimation 8 était excellente." },
];

function EstimationItem({ item, index, total, estimDone, onEstim, solved, onSolved }) {
  return (
    <div className="space-y-3 border-t border-slate-100 pt-5 first:border-0 first:pt-0">
      <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
        Calcul {index + 1} / {total}
      </div>
      <div className="bg-slate-900 rounded-xl py-4 text-center">
        <div className="font-mono font-extrabold text-2xl sm:text-3xl text-white tabular-nums">{item.calcul} = ?</div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          <span className="inline-block px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-mono text-[10px] font-bold mr-2">ÉTAPE 1</span>
          Sans calculer : quel résultat attends-tu, à peu près ?
        </p>
        <TapQuestion
          options={item.estimOptions}
          correct={item.estimCorrect}
          cols={4}
          explain={item.explainEstim}
          solved={estimDone}
          onAnswered={() => onEstim?.()}
        />
      </div>

      {estimDone && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2">
          <p className="text-sm font-semibold text-slate-700">
            <span className="inline-block px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-mono text-[10px] font-bold mr-2">ÉTAPE 2</span>
            Maintenant, donne le résultat exact.
          </p>
          <NumericQuestion
            expected={item.exact}
            parse={parseDec}
            explain={item.explainExact}
            explainFor={() => (
              <>Aligne les virgules et additionne colonne par colonne. Ton résultat doit rester proche de <strong>{item.estimation}</strong> — sinon, c'est qu'il y a une erreur.</>
            )}
            solved={solved}
            onAnswered={() => onSolved?.()}
          />
        </motion.div>
      )}
    </div>
  );
}

const RAISONNABLE = [
  { situation: 'Un élève achète un cahier à 2,50 € et un stylo à 3,75 €. Il annonce : « J\'ai payé 62,50 € ».', options: ['Raisonnable', 'Absurde : on attend environ 6 €'], correct: 1, explain: '2,50 € ≈ 2,50 et 3,75 € ≈ 4 : on attend environ 6 €. Un total de 62,50 € est dix fois trop grand — la virgule a sûrement été mal placée. Le vrai total est 6,25 €.' },
  { situation: 'Une piscine mesure 24,8 m de long. Un élève annonce : « Elle fait environ 25 m ».', options: ['Raisonnable', 'Absurde'], correct: 0, explain: "24,8 est très proche de 25 : l'ordre de grandeur annoncé est parfaitement correct." },
  { situation: 'Un sac de farine pèse 1,5 kg. Un élève annonce : « Trois sacs pèsent environ 45 kg ».', options: ['Raisonnable', 'Absurde : on attend environ 4,5 kg'], correct: 1, explain: '1,5 kg ≈ 1,5, donc trois sacs pèsent environ 3 × 1,5 = 4,5 kg. Annoncer 45 kg, c\'est dix fois trop : encore une virgule oubliée.' },
];

export default function Module09OrdreGrandeur() {
  const [arrondis, setArrondis] = useState([]);
  const [estimsDone, setEstimsDone] = useState([]);
  const [estimsFinal, setEstimsFinal] = useState([]);
  const [raisons, setRaisons] = useState([]);

  const s1 = arrondis.length === ARRONDIS.length;
  const s2 = estimsFinal.length === ESTIMATIONS.length;
  const s3 = raisons.length === RAISONNABLE.length;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(9)}
      moduleNumber={9}
      moduleTitle="Ordre de grandeur et estimation"
      moduleSubtitle="Savoir dire « à peu près » avant de calculer — et repérer les résultats absurdes."
      estimatedTime="10 min"
      brief={{
        tag: '🎯 Estimation',
        title: 'Un bon mathématicien sait d\'abord si le résultat est plausible.',
        body: (
          <p>
            Estimer, ce n'est pas être approximatif : c'est se donner un <strong className="text-white">repère</strong>{' '}
            pour vérifier ensuite qu'un résultat exact est cohérent.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'De quel entier est-on le plus proche ?',
          subtitle: 'La droite graduée rend la réponse évidente.',
          done: s1,
          content: (
            <div className="space-y-4">
              {ARRONDIS.map((item, i) =>
                i === 0 || arrondis.includes(i - 1) ? (
                  <ArrondiItem key={item.value} item={item} index={i} total={ARRONDIS.length} solved={arrondis.includes(i)} onSolved={() => setArrondis((d) => (d.includes(i) ? d : [...d, i]))} />
                ) : null
              )}
              {s1 && (
                <Feedback tone="info">
                  Le repère utile : la <strong>moitié de l'intervalle</strong>. Au-dessus, on est plus proche de
                  l'entier du haut ; en dessous, de celui du bas.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Estimer d\'abord, calculer ensuite',
          subtitle: "L'estimation sert de garde-fou : si le résultat exact s'en éloigne beaucoup, c'est qu'il y a une erreur.",
          done: s2,
          content: (
            <div className="space-y-4">
              {ESTIMATIONS.map((item, i) =>
                i === 0 || estimsFinal.includes(i - 1) ? (
                  <EstimationItem
                    key={item.calcul}
                    item={item}
                    index={i}
                    total={ESTIMATIONS.length}
                    estimDone={estimsDone.includes(i)}
                    onEstim={() => setEstimsDone((d) => (d.includes(i) ? d : [...d, i]))}
                    solved={estimsFinal.includes(i)}
                    onSolved={() => setEstimsFinal((d) => (d.includes(i) ? d : [...d, i]))}
                  />
                ) : null
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Ce résultat est-il raisonnable ?',
          subtitle: 'Trois annonces d\'élèves. À toi de jouer au détective.',
          done: s3,
          content: (
            <div className="space-y-4">
              {RAISONNABLE.map((item, i) => (
                <div key={item.situation} className="border-2 border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
                  <p className="text-sm text-slate-800">⚖️ {item.situation}</p>
                  <TapQuestion
                    options={item.options}
                    correct={item.correct}
                    cols={2}
                    explain={item.explain}
                    solved={raisons.includes(i)}
                    onAnswered={() => setRaisons((d) => (d.includes(i) ? d : [...d, i]))}
                  />
                </div>
              ))}
              {s3 && (
                <Feedback tone="info">
                  Retiens ce réflexe : <strong>j'estime, je calcule, je compare</strong>. Une virgule mal placée se
                  repère immédiatement quand on connaît l'ordre de grandeur attendu.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
    />
  );
}
