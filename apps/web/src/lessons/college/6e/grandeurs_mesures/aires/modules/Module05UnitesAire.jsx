import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { convert, parseDec, formatDec } from '../components/areaUtils';

/**
 * Module 5 — formalisation : la marche des aires vaut ×100.
 *
 * La découverte passe par le quadrillage du dm² : l'élève tape
 * « Quadriller en cm », un quadrillage 10×10 STATIQUE se dessine (jamais
 * 100 nœuds interactifs — plafond de densité), et 10 × 10 = 100 surgit.
 * Le contraste avec les longueurs (×10) est le message central.
 */
const PREDICTION_OPTIONS = ['10 carreaux de 1 cm²', '100 carreaux de 1 cm²', '1 000 carreaux de 1 cm²'];

const CHOIX_Q = {
  q: 'Associe mentalement, puis choisis LA bonne ligne :',
  options: [
    'Timbre → cm² · cahier → m² · France → km²',
    'Timbre → cm² · cahier → cm² · France → km²',
    'Timbre → mm² · cahier → km² · France → m²',
  ],
  correct: 1,
  explain:
    'Un timbre : quelques cm². Un cahier : environ 600 cm² (pas encore un m² !). La France : en km². L’unité d’aire se choisit selon la surface à mesurer.',
};

/** Quadrillage 10×10 statique en SVG pur — décor, aucune interactivité. */
function DmSquare({ gridded }) {
  const S = 220;
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="w-full max-w-[240px] mx-auto select-none" role="img" aria-label={gridded ? '1 dm² quadrillé en 100 cm²' : '1 dm²'}>
      <rect x={1} y={1} width={S - 2} height={S - 2} fill="#fef3c7" stroke="#d97706" strokeWidth="2.5" />
      {gridded && (
        <g style={{ pointerEvents: 'none' }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <React.Fragment key={i}>
              <line x1={((i + 1) * S) / 10} y1={1} x2={((i + 1) * S) / 10} y2={S - 1} stroke="#d97706" strokeWidth="0.8" opacity="0.6" />
              <line x1={1} y1={((i + 1) * S) / 10} x2={S - 1} y2={((i + 1) * S) / 10} stroke="#d97706" strokeWidth="0.8" opacity="0.6" />
            </React.Fragment>
          ))}
          {/* Un cm² témoin, en surbrillance */}
          <rect x={1} y={1} width={S / 10} height={S / 10} fill="#f59e0b" opacity="0.85" />
        </g>
      )}
      <text x={S / 2} y={gridded ? S + 0 : S / 2 + 6} textAnchor="middle" style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 700, pointerEvents: 'none' }} className="fill-amber-700">
        {gridded ? '' : '1 dm²'}
      </text>
    </svg>
  );
}

function DmDiscovery({ react, solved, onSolved }) {
  const [prediction, setPrediction] = useState(null);
  const [gridded, setGridded] = useState(solved);
  const done = solved || gridded;

  const reveal = () => {
    if (done) return;
    setGridded(true);
    react(prediction === 1);
    onSolved?.();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">
          Voici un carré de 1 dm de côté : son aire vaut 1 dm². Son côté mesure aussi 10 cm. AVANT de quadriller :
          combien de carreaux de 1 cm² faudra-t-il pour le recouvrir ?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="group" aria-label="Ta prédiction">
          {PREDICTION_OPTIONS.map((opt, i) => (
            <button
              key={opt}
              type="button"
              disabled={done}
              onClick={() => setPrediction(i)}
              aria-pressed={prediction === i}
              className={`px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                prediction === i
                  ? 'bg-amber-500 border-amber-600 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <DmSquare gridded={done} />

      {prediction !== null && !done && (
        <div className="text-center">
          <button
            type="button"
            onClick={reveal}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Quadriller en cm ▦
          </button>
        </div>
      )}

      {done && (
        <Feedback tone={prediction === 1 ? 'ok' : 'info'}>
          {prediction === 1 ? 'Bien prédit : ' : 'Le quadrillage a tranché : '}
          10 colonnes × 10 lignes = <strong>100 carreaux</strong>. Donc <strong>1 dm² = 100 cm²</strong> — la
          marche entre deux unités d'aire voisines vaut <strong>× 100</strong> (10 × 10), et non × 10 comme les
          longueurs. C'est LA différence à retenir.
        </Feedback>
      )}
    </div>
  );
}

export default function Module05UnitesAire() {
  const [dmDone, setDmDone] = useState(false);
  const [convDone, setConvDone] = useState(false);
  const [choixDone, setChoixDone] = useState(false);

  const M2_TO_CM2 = convert(3, 'm²', 'cm²'); // 30 000

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Les unités d’aire"
      moduleSubtitle="Pourquoi 1 dm² vaut 100 cm² (et pas 10) : la marche des aires vaut ×100."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 05',
        title: 'Un piège attend tous les débutants des aires.',
        body: <p>« 1 dm = 10 cm, donc 1 dm² = 10 cm² » — vraiment ? Prédis, quadrille, et tranche toi-même.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Prédis, puis quadrille',
          done: dmDone,
          content: (kit) => (
            <DmDiscovery react={kit.react} solved={dmDone} onSolved={() => setDmDone(true)} />
          ),
        },
        {
          num: 2,
          title: 'Saute les marches',
          done: convDone,
          content: (
            <NumericQuestion
              prompt="La pelouse fait 3 m². Convertis en cm² (2 marches de ×100 : m² → dm² → cm²)."
              suffix="cm²"
              expected={M2_TO_CM2}
              parse={parseDec}
              display={formatDec(M2_TO_CM2)}
              explain={<>3 m² = 300 dm² = <strong>{formatDec(M2_TO_CM2)} cm²</strong> : chaque marche multiplie par 100 — DEUX zéros par marche.</>}
              explainFor={(n) =>
                n === 300
                  ? '300, c’est 3 × 100 : une seule marche (m² → dm²). Il en faut deux pour atteindre les cm².'
                  : n === 30
                    ? 'Tu as multiplié par 10, comme pour des longueurs. Les aires sautent par ×100 : 10 × 10.'
                    : 'Deux marches de ×100 : 3 m² → 300 dm² → 30 000 cm².'
              }
              solved={convDone}
              onAnswered={() => setConvDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'La bonne unité pour chaque surface',
          done: choixDone,
          content: (
            <TapQuestion
              prompt={CHOIX_Q.q}
              options={CHOIX_Q.options}
              correct={CHOIX_Q.correct}
              cols={1}
              explain={CHOIX_Q.explain}
              solved={choixDone}
              onAnswered={() => setChoixDone(true)}
            />
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <Layers className="w-6 h-6 mx-auto text-amber-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            km² → m² → dm² → cm² → mm² : chaque marche vaut × 100 (car 10 × 10). Les longueurs sautent d'un zéro,
            les aires de deux.
          </p>
        </motion.div>
      }
    />
  );
}
