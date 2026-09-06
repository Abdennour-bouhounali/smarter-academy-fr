import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PolygonPerimeter from '../components/PolygonPerimeter';

/**
 * Module 1 — déclencheur.
 *
 * Le périmètre se DÉCOUVRE en faisant le tour : l'élève parcourt le contour
 * de l'enclos côté par côté (geste, jamais d'état faux) avant qu'on nomme
 * quoi que ce soit. Le mot « périmètre » n'apparaît qu'après le geste.
 */
const ENCLOS = { sideLengths: [12, 9, 14, 8], unit: 'm' };

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

function TraceEnclos({ react, solved, onSolved }) {
  const [tapped, setTapped] = useState(solved ? ENCLOS.sideLengths.map((_, i) => i) : []);
  const total = tapped.reduce((s, i) => s + ENCLOS.sideLengths[i], 0);
  const isDone = solved || tapped.length === ENCLOS.sideLengths.length;

  const handleTap = (i) => {
    if (solved || tapped.includes(i)) return;
    const next = [...tapped, i];
    setTapped(next);
    if (next.length === ENCLOS.sideLengths.length) {
      react(true);
      onSolved?.();
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Le gardien doit commander la clôture du nouvel enclos. Tape chaque côté, dans l'ordre, pour faire le tour
        complet avec lui.
      </p>
      <PolygonPerimeter
        shape="quad"
        sideLengths={ENCLOS.sideLengths}
        unit={ENCLOS.unit}
        tappedIndices={tapped}
        onTapSide={handleTap}
        disabled={solved}
        showRunningTotal
      />
      <div className="text-center font-mono text-lg text-slate-800">
        Clôture parcourue : <strong>{total} {ENCLOS.unit}</strong>{' '}
        {tapped.length > 0 && !isDone && `(${tapped.length}/${ENCLOS.sideLengths.length} côtés)`}
      </div>
      {isDone && (
        <Feedback tone="ok">
          Tu as fait le tour complet : {ENCLOS.sideLengths.join(' + ')} ={' '}
          <strong>{ENCLOS.sideLengths.reduce((a, b) => a + b, 0)} m</strong> de clôture. Cette longueur du contour
          porte un nom : c'est le <strong>périmètre</strong> de l'enclos.
        </Feedback>
      )}
    </div>
  );
}

export default function Module01Mission() {
  const [traceDone, setTraceDone] = useState(false);
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
          title: 'Fais le tour de l’enclos',
          done: traceDone,
          content: (kit) => (
            <div className="space-y-5">
              <TraceEnclos react={kit.react} solved={traceDone} onSolved={() => setTraceDone(true)} />
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
