import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PaveLab from '../components/PaveLab';
import { convert, parseDec, formatDec } from '../components/areaUtils';

/**
 * Module 5 — formalisation : la marche des aires vaut ×100.
 *
 * ACTION      l'élève PAVE lui-même le carré de 1 dm de côté avec des
 *             carreaux de 1 cm² — au balayage du doigt, comme au module 3.
 * CHANGE      le compteur monte carreau après carreau, et la première
 *             rangée révèle qu'il en faut 10 juste pour traverser.
 * OBSERVATION dix rangées de dix : 100 carreaux, et non 10.
 * SENS        la marche entre deux unités d'aire voisines vaut ×100 parce
 *             que le côté est multiplié par 10 DANS LES DEUX SENS.
 *
 * L'ancienne version affichait un bouton « Quadriller en cm ▦ » : le
 * quadrillage apparaissait tout fait, l'élève n'avait rien produit. C'est
 * une révélation, pas une manipulation (INTERACTION_PEDAGOGY §2). Le
 * pavage à 100 carreaux reste sous le plafond de densité parce que les
 * cellules ne sont pas 100 boutons scénarisés mais une seule surface
 * balayée — et le geste continu rend le comptage supportable.
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

/**
 * Le pavage du dm². 10 × 10 = 100 carreaux de 1 cm² : l'élève les pose
 * lui-même, et la première rangée suffit déjà à casser l'intuition « ×10 ».
 *
 * Validé dès que la PREMIÈRE RANGÉE est complète (10 carreaux) : c'est là
 * que se joue la découverte — il en faut déjà dix rien que pour traverser,
 * donc bien plus de dix pour recouvrir. Le pavage complet reste possible et
 * n'est jamais bloqué : le labo ne se fige pas.
 */
const DM_COLS = 10;
const DM_ROWS = 10;

function DmDiscovery({ react, solved, onSolved }) {
  const [prediction, setPrediction] = useState(null);
  const [cells, setCells] = useState([]);
  // La première rangée est celle des indices 0..9 : la traversée du carré.
  const rangeeFaite = Array.from({ length: DM_COLS }, (_, i) => i).every((i) => cells.includes(i));
  const complet = cells.length === DM_COLS * DM_ROWS;
  const done = solved || rangeeFaite;

  const pave = (i) => setCells((prev) => (prev.includes(i) ? prev : [...prev, i]));

  /* Le signal part d'un EFFET : appeler `react` depuis l'updater de
     setState met à jour le parent pendant le rendu de l'enfant. */
  React.useEffect(() => {
    if (rangeeFaite && !solved) { react(prediction === 1); onSolved?.(); }
    // `prediction` est volontairement hors dépendances : le verdict doit
    // porter sur la prédiction au moment où la rangée se complète.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeeFaite, solved]);
  const unpave = (i) => setCells((prev) => prev.filter((x) => x !== i));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">
          Voici un carré de 1 dm de côté : son aire vaut 1 dm². Son côté mesure aussi 10 cm. AVANT de le
          paver : combien de carreaux de 1 cm² faudra-t-il pour le recouvrir ?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="group" aria-label="Ta prédiction">
          {PREDICTION_OPTIONS.map((opt, i) => (
            <button
              key={opt}
              type="button"
              disabled={done}
              onClick={() => setPrediction(i)}
              aria-pressed={prediction === i}
              className={`min-h-[44px] px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
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

      <p className="text-sm text-slate-600">
        Appuie sur le carré et <strong>balaie</strong> pour poser les carreaux de 1 cm². Commence par une
        seule rangée, de gauche à droite.
      </p>
      {/* cellSize 26 px : 10 colonnes tiennent dans 260 px, donc dans la
          colonne de contenu même à 375 px de large. */}
      <PaveLab
        rows={DM_ROWS}
        cols={DM_COLS}
        cells={cells}
        onPave={pave}
        onUnpave={unpave}
        cellSize={26}
        tone="amber"
        unit="cm²"
        ariaLabel="Carré de 1 dm² à paver en cm²"
      />

      {done && (
        <Feedback tone={prediction === 1 ? 'ok' : 'info'}>
          {prediction === 1 ? 'Bien prédit : ' : 'Le pavage a tranché : '}
          il faut déjà <strong>10 carreaux</strong> rien que pour traverser le carré une fois — et il y a{' '}
          <strong>10 rangées</strong> comme celle-là. Soit <strong className="font-mono">10 × 10 = 100</strong>{' '}
          carreaux de 1 cm² dans 1 dm². La marche entre deux unités d'aire vaut <strong>×100</strong>, alors
          qu'entre deux unités de longueur elle vaut ×10 : parce que le côté est multiplié par 10 dans les
          DEUX sens.
          {complet ? ' Tu viens de les poser tous les cent.' : ' Continue si tu veux les poser tous.'}
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
            <div className="space-y-5">
              <DmDiscovery react={kit.react} solved={dmDone} onSolved={() => setDmDone(true)} />
              {/* Le quadrillage vient de compter 100 carreaux à l'écran :
                  la règle se pose sur ce constat, avant toute conversion. */}
              {dmDone && (
                <KnowledgeBrick
                  id="marche-x100"
                  variant="new"
                  lead="Ces 100 carreaux ne sont pas un hasard : ils s’expliquent, et ils valent pour toutes les unités d’aire."
                />
              )}
            </div>
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
              requires={['aire', 'marche-x100']}
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
            <div className="space-y-5">
              <TapQuestion
                prompt={CHOIX_Q.q}
                options={CHOIX_Q.options}
                correct={CHOIX_Q.correct}
                cols={1}
                explain={CHOIX_Q.explain}
                requires={['aire', 'choisir-unite-aire', 'marche-x100']}
                solved={choixDone}
                onAnswered={() => setChoixDone(true)}
              />
              {/* Aire et périmètre se côtoient depuis le module 1 ; le
                  repère à mémoriser se pose ici, une fois les deux calculs
                  et les deux unités rencontrés. */}
              {choixDone && (
                <KnowledgeBrick
                  id="mem-aire-vs-perimetre"
                  variant="new"
                  lead="Un dernier repère, celui qui évite la confusion la plus coûteuse de toute la leçon."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Ta carte est complète. Le module suivant n'apporte plus rien
          de neuf : il met tout au travail sur un vrai chantier.
        </KnowledgeSnapshot>
      }
    />
  );
}
