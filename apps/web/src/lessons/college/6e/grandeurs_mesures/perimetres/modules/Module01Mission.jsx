import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PolygonPerimeter from '../components/PolygonPerimeter';
import ContourUnroller from '../components/ContourUnroller';

/**
 * Module 1 — LABORATOIRE : « La clôture du parc ».
 *
 * Activity: DÉROULER le contour de l'enclos — l'élève tire le bout du ruban
 *   et un point parcourt le bord, côté après côté, pendant que le même tour
 *   s'empile à plat sur une règle.
 * Mathematical objective: le périmètre est une LONGUEUR — le contour mis
 *   bout à bout — et non une propriété abstraite du dessin.
 * Student action: le geste est continu ; le point sur la figure, les côtés
 *   allumés, la règle et le total bougent tous ensemble, sans validation.
 * Mathematical state: UN réel `parcouru` (la distance parcourue le long du
 *   bord) ; position, portion allumée, somme partielle en dérivent.
 * Expected observation: quand le point revient à son départ, le ruban porte
 *   exactement 12 + 9 + 14 + 8 = 43 m. Le tour est devenu un segment.
 * Misconception targeted: « le périmètre, c'est la taille de la figure » —
 *   et, à l'inverse, l'idée qu'un tour ne se mesure pas au mètre ruban.
 * Controlled surprise: la prédiction porte sur la longueur du ruban ; l'œil
 *   sous-estime presque toujours un contour déroulé.
 * Formalization: le mot « périmètre » n'arrive qu'à la brique, après le tour
 *   complet ; son unité (des mètres) découle du ruban qu'on vient de voir.
 * Scaffolding: le déroulement se rejoue à l'infini, dans les deux sens, et
 *   ne se fige jamais après validation de l'étape.
 *
 * L'ancienne version tapait les quatre côtés l'un après l'autre : quatre
 * clics, un total, et surtout aucune raison visible que ce total soit une
 * LONGUEUR. Le ruban déroulé donne cette raison.
 */
const ENCLOS = { sideLengths: [12, 9, 14, 8], unit: 'm' };
// Quadrilatère quelconque : aucun côté égal, donc aucune formule possible —
// seule la somme des côtés fait le tour.
const ENCLOS_VERTICES = [
  { x: 30, y: 170 }, { x: 270, y: 150 }, { x: 230, y: 30 }, { x: 70, y: 50 },
];
const ENCLOS_TOTAL = ENCLOS.sideLengths.reduce((a, b) => a + b, 0);

const TRAP_Q = {
  q: "Voici deux enclos. Celui de droite paraît plus « grand » à l'intérieur, mais son contour est plus court. Lequel demande le PLUS de clôture ?",
  options: [
    "Celui qui paraît le plus grand à l'intérieur",
    'Celui dont le contour est le plus long — même s’il paraît plus petit à l’intérieur',
  ],
  correct: 1,
  explain:
    "La clôture suit le CONTOUR. Un enclos peut paraître grand à l'intérieur et avoir un tour plus court qu'un enclos allongé. Le périmètre ne se devine pas à l'œil sur la surface : il se mesure sur le bord.",
};

const UNITE_Q = {
  q: 'La commande de clôture est prête. En quelle unité s’exprime un périmètre ?',
  options: ['En mètres (m) : c’est une longueur', 'En mètres carrés (m²)', 'En kilogrammes (kg)'],
  correct: 0,
  explain:
    'Le périmètre est la LONGUEUR du contour : il se mesure donc avec une unité de longueur (m, cm, km…). Les m² mesurent des surfaces, pas des tours.',
};

function DeroulerEnclos({ react, solved, onSolved }) {
  const [parcouru, setParcouru] = useState(0);
  const [tourFait, setTourFait] = useState(false);
  const done = solved || tourFait;

  const change = (v) => {
    setParcouru(v);
    // Le tour est « fait » dès que le point est revenu à son point de
    // départ — c'est le seul état qui compte mathématiquement.
    if (v >= ENCLOS_TOTAL - 1e-9 && !tourFait) {
      setTourFait(true);
      if (!solved) { react(true); onSolved?.(); }
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Le gardien doit commander la clôture du nouvel enclos. Attrape le{' '}
        <strong className="text-rose-600">bout du ruban</strong> sous la figure et tire : le contour se
        déroule en ligne droite, côté après côté.
      </p>
      <ContourUnroller
        vertices={ENCLOS_VERTICES}
        sideLengths={ENCLOS.sideLengths}
        travelled={parcouru}
        onChange={change}
        unit={ENCLOS.unit}
        step={0.5}
      />
      {done && (
        <Feedback tone="ok">
          Le tour complet, mis à plat, mesure {ENCLOS.sideLengths.join(' + ')} ={' '}
          <strong>{ENCLOS_TOTAL} {ENCLOS.unit}</strong> de clôture. Cette longueur du contour porte un nom :
          c'est le <strong>périmètre</strong> de l'enclos. Rembobine et recommence : le ruban donne toujours
          la même longueur.
        </Feedback>
      )}
    </div>
  );
}

export default function Module01Mission() {
  const [traceDone, setTraceDone] = useState(false);
  const [pred, setPred] = useState(null);
  const [trapDone, setTrapDone] = useState(false);
  const [uniteDone, setUniteDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La clôture du parc"
      moduleSubtitle="Faire le tour d’un enclos, pas à pas : c’est ça, le périmètre."
      estimatedTime="7 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Le gardien du parc a besoin de toi.',
        body: <p>Un nouvel enclos vient d'être dessiné. Avant de commander la clôture, il faut connaître la longueur exacte de son tour.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Déroule le tour de l’enclos',
          subtitle: 'Le ruban se remplit sous ton doigt : rien à valider.',
          done: traceDone,
          content: (kit) => (
            <div className="space-y-4">
              <PredictionChips
                prompt="mis bout à bout, ce contour fera-t-il plus ou moins de 30 m ?"
                options={[
                  { id: 'moins', label: 'Moins de 30 m' },
                  { id: 'autour', label: 'Autour de 30 m' },
                  { id: 'plus', label: 'Plus de 30 m' },
                ]}
                value={pred}
                onChange={setPred}
                disabled={traceDone}
              />
              <DeroulerEnclos react={kit.react} solved={traceDone} onSolved={() => setTraceDone(true)} />
              {traceDone && (
                <Feedback tone="info">
                  {pred === 'plus'
                    ? 'Ta prédiction tenait : '
                    : pred
                      ? 'Ta prédiction visait plus bas, et pourtant : '
                      : ''}
                  43 m de ruban pour un enclos qui tient dans une cour. Un contour déroulé est presque
                  toujours plus long qu'on ne le croit.
                </Feedback>
              )}
              {/* Le tour vient d'être parcouru côté par côté : c'est ICI que
                  le mot existe, et pas dans un explain
                  (docs/architecture/KNOWLEDGE_DEPENDENCY.md). */}
              {traceDone && (
                <KnowledgeBrick
                  id="perimetre"
                  variant="new"
                  lead="La longueur que tu viens de parcourir en suivant le bord porte un nom."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le piège du « plus grand »',
          done: trapDone,
          content: (
            <div className="space-y-5">
            {/* Sans ce repère, la question qui suit demanderait à l'élève de
                distinguer deux grandeurs dont une seule a été nommée. */}
            <KnowledgeBrick
              id="perimetre-vs-aire"
              variant="new"
              lead="Avant de comparer deux enclos, il faut savoir ce qu’on compare : le tour, ou le dedans ?"
            />
            <TapQuestion
              above={
                <div className="grid grid-cols-2 gap-3" aria-hidden="true">
                  <div className="space-y-1">
                    <PolygonPerimeter shape="rectangle" sideLengths={[16, 2, 16, 2]} unit="m" tappedIndices={[]} disabled />
                    <p className="text-center text-xs text-slate-500">Enclos A (allongé)</p>
                  </div>
                  <div className="space-y-1">
                    <PolygonPerimeter shape="square" sideLengths={[7, 7, 7, 7]} unit="m" tappedIndices={[]} disabled />
                    <p className="text-center text-xs text-slate-500">Enclos B (ramassé)</p>
                  </div>
                </div>
              }
              prompt={TRAP_Q.q}
              options={TRAP_Q.options}
              correct={TRAP_Q.correct}
              cols={1}
              explain={TRAP_Q.explain}
              requires={['perimetre', 'perimetre-vs-aire']}
              solved={trapDone}
              onAnswered={() => setTrapDone(true)}
            />
            </div>
          ),
        },
        {
          num: 3,
          title: 'L’unité de la commande',
          done: uniteDone,
          content: (
            <div className="space-y-5">
              <TapQuestion
                prompt={UNITE_Q.q}
                options={UNITE_Q.options}
                correct={UNITE_Q.correct}
                cols={1}
                explain={UNITE_Q.explain}
                requires={['perimetre', 'perimetre-vs-aire']}
                solved={uniteDone}
                onAnswered={() => setUniteDone(true)}
              />
              {/* Le choix de l'unité vient d'être fait sur un bon de
                  commande réel : la règle se pose sur ce constat. */}
              {uniteDone && (
                <KnowledgeBrick
                  id="perimetre-est-longueur"
                  variant="new"
                  lead="Ce choix d’unité n’est pas une convention arbitraire : il découle de ce qu’est un contour."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Tu sais ce qu'est un tour. Reste à le mesurer sans jamais
          oublier un côté — c'est la méthode du module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
