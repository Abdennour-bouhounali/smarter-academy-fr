import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AreaGrid from '../components/AreaGrid';

/**
 * Module 1 — déclencheur : l'aire se découvre en RECOUVRANT.
 *
 * Deux jardins qui se disputent le titre de « plus grand » : l'élève tape
 * des carreaux de pelouse pour recouvrir chaque jardin, et le comptage
 * tranche. Le mot « aire » n'arrive qu'après le geste.
 */
// Jardin A : long et fin (2 × 6 = 12 carreaux) ; jardin B : ramassé (3 × 4 = 12… non, B plus petit : 3 × 3 = 9).
const JARDIN_A = { rows: 2, cols: 6, count: 12 };
const JARDIN_B = { rows: 3, cols: 3, count: 9 };

const SENS_Q = {
  q: '« Mon jardin est plus grand ! » disent les deux voisins. Pour la PELOUSE, « plus grand » veut dire quoi ?',
  options: [
    'Plus long dans un sens',
    'Plus de clôture autour',
    'Plus de surface à recouvrir de pelouse',
  ],
  correct: 2,
  explain:
    'Pour la pelouse, ce qui compte est la quantité de surface à recouvrir — exactement ce que ton pavage vient de compter. Ni la longueur d’un seul côté, ni la clôture ne répondent à la question.',
};

// Étape 3 : la question du TOUR se pose en langage courant (« la clôture »),
// avant que la brique ne lui donne son nom. Cf. KNOWLEDGE_DEPENDENCY.md :
// on ne demande pas un mot qu'on n'a pas encore posé.
const TOUR_Q = {
  q: 'Le voisin commande maintenant sa CLÔTURE. Que doit-il mesurer pour savoir combien en acheter ?',
  options: [
    'Le nombre de carreaux de pelouse à l’intérieur',
    'La longueur totale du bord, en faisant tout le tour du jardin',
    'La longueur du plus grand côté seulement',
  ],
  correct: 1,
  explain:
    'La clôture longe le BORD : sa longueur est celle du tour complet. Les carreaux du dedans ne servent qu’à la pelouse, et un seul côté ne fait pas le tour.',
};

const VOCAB_ROWS = [
  { id: 'pelouse', emoji: '🌱', label: 'La pelouse à poser', correct: 'l’aire' },
  { id: 'cloture', emoji: '🚧', label: 'La clôture autour', correct: 'le périmètre' },
  { id: 'portail', emoji: '🚪', label: 'La largeur du portail', correct: 'une longueur' },
];
const VOCAB_OPTIONS = ['l’aire', 'le périmètre', 'une longueur'];

function JardinPaver({ react, solved, onSolved }) {
  const [cellsA, setCellsA] = useState(solved ? Array.from({ length: JARDIN_A.count }, (_, i) => i) : []);
  const [cellsB, setCellsB] = useState(solved ? Array.from({ length: JARDIN_B.count }, (_, i) => i) : []);
  const aFull = cellsA.length === JARDIN_A.count;
  const bFull = cellsB.length === JARDIN_B.count;
  const done = solved || (aFull && bFull);

  const toggle = (setCells) => (i) => {
    if (done) return;
    setCells((prev) => {
      const next = prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i];
      return next;
    });
  };

  React.useEffect(() => {
    if (aFull && bFull && !solved) {
      react(true);
      onSolved?.();
    }
  }, [aFull, bFull, solved, react, onSolved]);

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        Recouvre entièrement les deux jardins de carreaux de pelouse (tape chaque carreau), puis compare les
        comptes.
      </p>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-center text-xs font-semibold text-slate-500">Jardin A (tout en longueur)</p>
          <AreaGrid rows={JARDIN_A.rows} cols={JARDIN_A.cols} cells={cellsA} onToggle={toggle(setCellsA)} unit="carreau" disabled={done} tone="emerald" ariaLabel="Jardin A" />
          <p className="text-center font-mono text-sm text-slate-700">{cellsA.length} carreau{cellsA.length > 1 ? 'x' : ''}</p>
        </div>
        <div className="space-y-2">
          <p className="text-center text-xs font-semibold text-slate-500">Jardin B (ramassé)</p>
          <AreaGrid rows={JARDIN_B.rows} cols={JARDIN_B.cols} cells={cellsB} onToggle={toggle(setCellsB)} unit="carreau" disabled={done} tone="sky" ariaLabel="Jardin B" />
          <p className="text-center font-mono text-sm text-slate-700">{cellsB.length} carreau{cellsB.length > 1 ? 'x' : ''}</p>
        </div>
      </div>
      {done && (
        <Feedback tone="ok">
          Verdict du recouvrement : jardin A = <strong>12 carreaux</strong>, jardin B = <strong>9 carreaux</strong>.
          Le jardin « tout en longueur » a PLUS de pelouse, même s'il paraît étroit. Mesurer une surface en
          comptant des carreaux-unités : c'est exactement ça, mesurer une <strong>aire</strong>.
        </Feedback>
      )}
    </div>
  );
}

export default function Module01Mission() {
  const [paverDone, setPaverDone] = useState(false);
  const [sensDone, setSensDone] = useState(false);
  const [tourDone, setTourDone] = useState(false);
  const [vocabDone, setVocabDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La guerre des pelouses"
      moduleSubtitle="Deux jardins, deux voisins fâchés : lequel a le plus de pelouse ?"
      estimatedTime="7 min"
      brief={{
        tag: '📋 Mission 01',
        title: '« Mon jardin est plus grand ! » — « Non, c’est le mien ! »',
        body: <p>Les deux voisins n'arrivent pas à se mettre d'accord à l'œil nu. Départage-les avec une méthode indiscutable.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Recouvre et compte',
          done: paverDone,
          content: (kit) => (
            <JardinPaver react={kit.react} solved={paverDone} onSolved={() => setPaverDone(true)} />
          ),
        },
        {
          num: 2,
          title: 'Ce qu’on vient de mesurer',
          done: sensDone,
          content: (
            <div className="space-y-5">
              <TapQuestion
                prompt={SENS_Q.q}
                options={SENS_Q.options}
                correct={SENS_Q.correct}
                cols={1}
                explain={SENS_Q.explain}
                requires={[]}
                solved={sensDone}
                onAnswered={() => setSensDone(true)}
              />
              {/* Le geste (recouvrir puis compter) vient de désigner la
                  grandeur : c'est ICI, et pas dans un explain, que le mot
                  « aire » existe. */}
              {sensDone && (
                <KnowledgeBrick
                  id="aire"
                  variant="new"
                  lead="Cette quantité de surface que tu viens de compter en carreaux porte un nom."
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Et pour commander la clôture ?',
          done: tourDone,
          content: (
            <div className="space-y-5">
              <TapQuestion
                prompt={TOUR_Q.q}
                options={TOUR_Q.options}
                correct={TOUR_Q.correct}
                cols={1}
                explain={TOUR_Q.explain}
                requires={['aire']}
                solved={tourDone}
                onAnswered={() => setTourDone(true)}
              />
              {/* Le second geste — suivre le bord — est ce qui sépare cette
                  grandeur de la précédente. Le mot arrive après lui. */}
              {tourDone && (
                <KnowledgeBrick
                  id="perimetre"
                  variant="new"
                  lead="Le tour que tu viens de décrire porte lui aussi un nom — et ce n’est pas le même que le dedans."
                />
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Trois grandeurs, trois noms',
          done: vocabDone,
          content: (
            <BatchChoiceQuestion
              requires={['aire', 'perimetre']}
              intro={
                <p className="text-sm text-slate-600">
                  Dans le même jardin, trois choses différentes se mesurent. Associe chacune à sa grandeur.
                </p>
              }
              rows={VOCAB_ROWS.map((it) => ({
                id: it.id,
                label: (
                  <>
                    <span className="text-2xl" aria-hidden="true">{it.emoji}</span>
                    <span>{it.label}</span>
                  </>
                ),
                options: VOCAB_OPTIONS,
                correct: VOCAB_OPTIONS.indexOf(it.correct),
                correction: <>→ {it.correct}</>,
              }))}
              solved={vocabDone}
              onAnswered={() => setVocabDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  L'aire = la surface (pelouse) · le périmètre = le tour (clôture) · la longueur = une seule
                  dimension (portail). Trois grandeurs bien distinctes du même jardin.
                </Feedback>
              )}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Tu sais nommer le dedans et le tour. Reste à savoir si l'un
          permet de deviner l'autre — c'est l'expérience du module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
