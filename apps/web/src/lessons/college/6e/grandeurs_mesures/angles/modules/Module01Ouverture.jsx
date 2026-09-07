import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AngleFigure from '../components/AngleFigure';
import OuvertureLab from '../components/OuvertureLab';
import { formatDeg } from '../components/angleUtils';


/**
 * Module 1 — LABORATOIRE : « L'angle est une OUVERTURE ».
 *
 * Activity: sur un même angle, trois poignées indépendantes — faire TOURNER
 *   le côté mobile, et RALLONGER chacun des deux côtés séparément.
 * Mathematical objective: la mesure d'un angle dépend de l'ouverture et
 *   d'elle seule ; la longueur des côtés n'a aucun effet.
 * Student action: chaque poignée agit immédiatement sur la figure ; la
 *   mesure affichée réagit à l'une et reste de marbre devant les autres.
 * Mathematical state: un triplet (deg, r0, r1) dont DEUX composantes sont
 *   mathématiquement inertes — c'est cette inertie qui est l'objet du module.
 * Expected observation: on peut doubler la longueur des deux côtés sans
 *   gagner un seul degré ; en revanche, une rotation minuscule change la
 *   mesure aussitôt.
 * Misconception targeted: « l'angle aux côtés longs est le plus grand » —
 *   LA misconception de 6e sur les angles, et la raison pour laquelle tant
 *   d'élèves lisent un rapporteur de travers.
 * Controlled surprise: la prédiction porte sur l'effet d'un rallongement ;
 *   la majorité annonce que la mesure grandira. Elle ne bouge pas.
 * Formalization: le mot « angle » à l'étape 1 (après la rotation), la règle
 *   « la longueur des côtés ne compte pas » à l'étape 2 — chacun après le
 *   geste qui le fonde.
 * Scaffolding: aucune poignée ne se fige après validation ; les extrêmes
 *   (5°, 175°, côtés minimaux et maximaux) sont tous atteignables, au doigt
 *   comme au clavier.
 *
 * L'ancienne version ouvrait une porte (une seule poignée), puis présentait
 * DEUX figures dessinées de 40° pour asséner que la longueur ne compte pas :
 * l'élève lisait deux images et cochait. Ici il tire lui-même sur les côtés
 * et voit le nombre refuser de bouger — sa propre main réfute son intuition.
 */
const START_DEG = 20;

const RAYONS_Q = {
  q: 'Tu viens de rallonger les côtés au maximum, puis de les raccourcir au minimum. Qu’est-il arrivé à la mesure pendant ces gestes ?',
  options: [
    'Elle a grandi quand les côtés se sont allongés',
    'Elle a diminué quand les côtés se sont allongés',
    'Elle n’a pas bougé d’un seul degré : seule la rotation la change',
  ],
  correct: 2,
  explain:
    'Un angle mesure une OUVERTURE, pas une longueur. Prolonger ses côtés ne l’ouvre pas davantage — c’est exactement ce que le compteur vient de te montrer en restant figé pendant que tu tirais. C’est LE piège le plus fréquent des angles.',
};

const NOTATION_Q = {
  q: 'On note un angle avec trois lettres, par exemple ÂBC (ou l’angle ABC). Que représente la lettre du MILIEU ?',
  options: ['Le sommet de l’angle', 'Le côté le plus long', 'La mesure de l’angle'],
  correct: 0,
  explain: 'La lettre du milieu est toujours le SOMMET — le point d’où partent les deux demi-droites. Les deux autres lettres nomment un point sur chaque côté.',
};

/**
 * ACTION      trois poignées : la rotation (bleue, sur le côté mobile) et
 *             les deux bouts de côté (blanches, cerclées de rouge).
 * CHANGE      la figure et la mesure se recalculent à chaque pixel.
 * OBSERVATION la mesure suit la rotation ; elle ignore les allongements.
 * SENS        l'angle est une ouverture — d'où les degrés, et non les cm.
 *
 * L'étape est validée quand l'élève a fait les DEUX familles de gestes :
 * tourner (au moins 30° d'amplitude) et rallonger un côté. Sans les deux,
 * l'observation « seule la rotation compte » n'a pas été produite.
 */
function AngleLab({ react, solved, onSolved }) {
  const [deg, setDeg] = useState(START_DEG);
  const [rays, setRays] = useState([60, 60]);
  const [tourne, setTourne] = useState(false);
  const [rallonge, setRallonge] = useState(false);
  // La mesure au moment du premier allongement : c'est la preuve, gardée par
  // le code et non par une phrase, que le nombre n'a pas bougé.
  const degAuRallonge = React.useRef(null);
  const done = solved || (tourne && rallonge);

  const changeDeg = (d) => {
    setDeg(d);
    if (Math.abs(d - START_DEG) >= 30) setTourne(true);
  };

  const changeRay = (i, v) => {
    setRays((prev) => {
      const next = [...prev];
      next[i] = v;
      if (Math.abs(v - prev[i]) > 0) {
        if (degAuRallonge.current === null) degAuRallonge.current = deg;
        setRallonge(true);
      }
      return next;
    });
  };

  React.useEffect(() => {
    if (tourne && rallonge && !solved) { react(true); onSolved?.(); }
  }, [tourne, rallonge, solved, react, onSolved]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Voici une porte vue du dessus. Attrape la <strong className="text-sky-600">poignée bleue</strong> pour
        la faire pivoter — puis les <strong className="text-rose-600">bouts des côtés</strong> pour les
        rallonger. Surveille le nombre à chaque geste.
      </p>
      <OuvertureLab
        deg={deg}
        rayLengths={rays}
        onDeg={changeDeg}
        onRay={changeRay}
        tone="sky"
      />
      <div className="flex justify-center gap-2 text-xs">
        <span className={`px-2 py-1 rounded-lg font-mono font-bold ${tourne ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
          {tourne ? '✓' : '○'} j'ai fait pivoter
        </span>
        <span className={`px-2 py-1 rounded-lg font-mono font-bold ${rallonge ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
          {rallonge ? '✓' : '○'} j'ai rallongé un côté
        </span>
      </div>
      {done && (
        <Feedback tone="ok">
          En faisant pivoter le battant, ce n'est pas sa LONGUEUR qui a grandi : c'est l'
          <strong>écartement</strong> entre le mur et le battant. Et quand tu as rallongé les côtés, le
          nombre n'a pas bougé{degAuRallonge.current !== null ? ` (il était à ${formatDeg(degAuRallonge.current)}, il y est resté)` : ''}.
          Cette ouverture entre deux demi-droites partant d'un même point (le <strong>sommet</strong>)
          s'appelle un <strong>angle</strong>. Continue à jouer avec les trois poignées : la règle tient à
          chaque fois.
        </Feedback>
      )}
    </div>
  );
}

export default function Module01Ouverture() {
  const [porteDone, setPorteDone] = useState(false);
  const [pred, setPred] = useState(null);
  const [rayonsDone, setRayonsDone] = useState(false);
  // La figure de vérification de l'étape 2 : elle reste manipulable, avant
  // comme après la réponse (règle projet : un labo ne se fige jamais).
  const [verifDeg, setVerifDeg] = useState(40);
  const [verifRays, setVerifRays] = useState([45, 45]);
  const [notationDone, setNotationDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La porte, la pizza et le skate"
      moduleSubtitle="Ouvre la porte : ce qui grandit, ce n’est pas la longueur."
      estimatedTime="7 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Qu’est-ce qui grandit exactement quand une porte s’ouvre ?',
        body: <p>Le battant garde la même taille, et pourtant « ça s'ouvre ». C'est cette grandeur-là qu'on va apprendre à mesurer.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Ouvre la porte, puis rallonge ses côtés',
          subtitle: 'Trois poignées, un seul nombre : lequel des gestes le fait bouger ?',
          done: porteDone,
          content: (kit) => (
            <div className="space-y-4">
              <PredictionChips
                prompt="si tu rallonges les deux côtés sans rien faire tourner, que fera la mesure ?"
                options={[
                  { id: 'grandit', label: 'Elle grandira' },
                  { id: 'fixe', label: 'Elle ne changera pas' },
                  { id: 'baisse', label: 'Elle diminuera' },
                ]}
                value={pred}
                onChange={setPred}
                disabled={porteDone}
              />
              <AngleLab react={kit.react} solved={porteDone} onSolved={() => setPorteDone(true)} />
              {porteDone && pred && (
                <Feedback tone="info">
                  {pred === 'fixe'
                    ? 'Ta prédiction tenait : la mesure est restée fixe pendant que tu tirais.'
                    : 'Ta prédiction annonçait une mesure qui change ; la figure te contredit — elle n’a pas bougé.'}
                </Feedback>
              )}
              {/* Le battant vient d'être ouvert sans jamais s'allonger :
                  c'est ICI que le mot « angle » a un sens, pas dans un
                  explain (docs/architecture/KNOWLEDGE_DEPENDENCY.md). */}
              {porteDone && (
                <KnowledgeBrick
                  id="angle-ouverture"
                  variant="new"
                  lead="Ce qui a grandi pendant que tu ouvrais la porte porte un nom."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le piège des côtés longs',
          done: rayonsDone,
          content: (
            <div className="space-y-5">
            {/* La figure reste VIVANTE pendant la question : l'élève peut
                re-tirer les côtés pour vérifier sa réponse avant de la
                donner, et continuer après. Deux images figées ne
                permettaient que de croire. */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500">
                Vérifie encore : tire les bouts des côtés, regarde le nombre.
              </p>
              <OuvertureLab
                deg={verifDeg}
                rayLengths={verifRays}
                onDeg={setVerifDeg}
                onRay={(i, v) => setVerifRays((prev) => { const n = [...prev]; n[i] = v; return n; })}
                tone="violet"
              />
            </div>
            <TapQuestion
              prompt={RAYONS_Q.q}
              options={RAYONS_Q.options}
              correct={RAYONS_Q.correct}
              cols={1}
              explain={RAYONS_Q.explain}
              requires={['angle-ouverture']}
              solved={rayonsDone}
              onAnswered={() => setRayonsDone(true)}
            />
            {/* La comparaison vient d'être tranchée sur deux figures
                concrètes : la règle se pose sur ce constat. */}
            {rayonsDone && (
              <KnowledgeBrick
                id="longueur-cotes-sans-effet"
                variant="new"
                lead="Ce que tu viens de constater sur ces deux figures vaut pour tous les angles."
              />
            )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Comment on écrit un angle',
          done: notationDone,
          content: (
            <div className="space-y-5">
              <TapQuestion
                above={<AngleFigure deg={55} rayLengths={[90, 90]} labels={['A', 'B', 'C']} tone="emerald" />}
                prompt={NOTATION_Q.q}
                options={NOTATION_Q.options}
                correct={NOTATION_Q.correct}
                cols={1}
                explain={NOTATION_Q.explain}
                requires={['angle-ouverture', 'demi-droite']}
                solved={notationDone}
                onAnswered={() => setNotationDone(true)}
              />
              {/* La lettre du milieu vient d'être identifiée sur la figure :
                  la convention d'écriture peut être fixée. */}
              {notationDone && (
                <KnowledgeBrick
                  id="notation-angle"
                  variant="new"
                  lead="Tu as repéré le sommet dans ÂBC. Voilà la convention complète."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Tu sais ce qu'est un angle. Reste à comparer deux angles
          dessinés dans tous les sens — et à leur donner un nom.
        </KnowledgeSnapshot>
      }
    />
  );
}
