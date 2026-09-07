import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PaveLab from '../components/PaveLab';

/**
 * Module 1 — LABORATOIRE : « La guerre des pelouses ».
 *
 * Activity: paver deux jardins au doigt — on appuie sur la pelouse et on
 *   BALAIE, les carreaux se posent sous le doigt — puis comparer les comptes.
 * Mathematical objective: mesurer une surface, c'est compter combien de fois
 *   l'unité de surface la recouvre. Le nombre EST le compte de carreaux.
 * Student action: le balayage pose les carreaux en continu ; le compteur
 *   monte à chaque carreau touché, sans clic de validation.
 * Mathematical state: DEUX listes d'indices (`cellsA`, `cellsB`) ; les deux
 *   compteurs, le verdict et la comparaison en dérivent tous.
 * Expected observation: le jardin qui PARAÎT le plus étroit demande PLUS de
 *   carreaux — la forme ne dit rien de la quantité de surface.
 * Misconception targeted: « le plus grand, c'est le plus long » — juger une
 *   surface à sa silhouette au lieu de la recouvrir.
 * Controlled surprise: la prédiction se fait à l'œil, le pavage tranche.
 * Formalization: le mot « aire » n'arrive qu'à l'étape 2, après le geste ;
 *   « périmètre » à l'étape 3, après le second geste (le tour).
 * Scaffolding: le pavage se refait à volonté (repasser sur un carreau posé
 *   le retire) et ne se fige jamais après validation.
 *
 * L'ancienne version tapait 21 carreaux un par un et figeait la grille
 * (`disabled={done}`) dès le dernier posé : 21 clics, puis plus rien à
 * explorer. Le balayage rend le geste au carreleur, et le labo reste vivant.
 */
// Jardin A : allongé (2 × 6 = 12 carreaux). Jardin B : ramassé (3 × 3 = 9).
// A PARAÎT plus étroit et pourtant il en demande plus — c'est la surprise.
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

/**
 * Le laboratoire de pavage. Les deux jardins partagent le même geste ; le
 * module n'interprète qu'une fois les deux entièrement recouverts.
 */
function JardinPaver({ onFull, full }) {
  const [cellsA, setCellsA] = useState([]);
  const [cellsB, setCellsB] = useState([]);

  const add = (setter) => (i) =>
    setter((prev) => (prev.includes(i) ? prev : [...prev, i]));
  const remove = (setter) => (i) => setter((prev) => prev.filter((x) => x !== i));

  const aFull = cellsA.length === JARDIN_A.count;
  const bFull = cellsB.length === JARDIN_B.count;

  /* Le signal « les deux jardins sont pavés » part d'un effet, jamais de
     l'updater de setState : appeler le setState du parent depuis l'updater
     d'un enfant, c'est mettre à jour un composant pendant le rendu d'un
     autre (avertissement React, et rendu incohérent). */
  React.useEffect(() => {
    if (aFull && bFull) onFull?.();
  }, [aFull, bFull, onFull]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Appuie sur un jardin et <strong>balaie</strong> : les carreaux de pelouse se posent sous ton doigt.
        Recouvre les deux entièrement (repasse sur un carreau posé pour le retirer).
      </p>
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <p className="text-center text-xs font-semibold text-slate-500">Jardin A (tout en longueur)</p>
          <PaveLab
            rows={JARDIN_A.rows}
            cols={JARDIN_A.cols}
            cells={cellsA}
            onPave={add(setCellsA)}
            onUnpave={remove(setCellsA)}
            tone="emerald"
            ariaLabel="Jardin A à paver"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-center text-xs font-semibold text-slate-500">Jardin B (ramassé)</p>
          <PaveLab
            rows={JARDIN_B.rows}
            cols={JARDIN_B.cols}
            cells={cellsB}
            onPave={add(setCellsB)}
            onUnpave={remove(setCellsB)}
            tone="sky"
            ariaLabel="Jardin B à paver"
          />
        </div>
      </div>
      {/* Le verdict n'apparaît que quand les DEUX pavages sont complets :
          comparer deux mesures suppose d'avoir mesuré les deux. */}
      {aFull && bFull && (
        <Feedback tone="ok">
          Verdict du recouvrement : jardin A = <strong>{JARDIN_A.count} carreaux</strong>, jardin B ={' '}
          <strong>{JARDIN_B.count} carreaux</strong>. Le jardin « tout en longueur » a PLUS de pelouse, même
          s'il paraît étroit. {full ? 'Recommence autant que tu veux : le compte ne dépend pas de l’ordre des carreaux.' : ''}
        </Feedback>
      )}
    </div>
  );
}

/** Capture `kit.react` dans une ref, sans provoquer de rendu supplémentaire. */
function ReactRefSetter({ kit, target }) {
  target.current = kit.react;
  return null;
}

export default function Module01Mission() {
  const [paverDone, setPaverDone] = useState(false);
  const [pred, setPred] = useState(null);
  const [sensDone, setSensDone] = useState(false);
  const [tourDone, setTourDone] = useState(false);
  const [vocabDone, setVocabDone] = useState(false);
  const reactRef = React.useRef(null);
  const paverDoneRef = React.useRef(false);
  paverDoneRef.current = paverDone;

  // Stable : l'effet du labo ne dépend donc que de l'état du pavage.
  const onBothPaved = React.useCallback(() => {
    if (paverDoneRef.current) return;
    reactRef.current?.(true);
    setPaverDone(true);
  }, []);


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
        body: <p>Les deux voisins n'arrivent pas à se mettre d'accord à l'œil nu. Départage-les avec une méthode indiscutable : recouvre.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Recouvre et compte',
          subtitle: 'Le compteur suit ton doigt : rien à valider.',
          done: paverDone,
          content: (kit) => (
            <div className="space-y-4">
              {/* `kit.react` change d'identité à chaque rendu : on le garde
                  dans une ref pour que `onBothPaved` reste stable et que
                  l'effet du labo ne se redéclenche pas en boucle. */}
              <ReactRefSetter kit={kit} target={reactRef} />
              <PredictionChips
                prompt="à l’œil nu, lequel des deux jardins demandera le plus de carreaux ?"
                options={[
                  { id: 'a', label: 'Le jardin A (allongé)' },
                  { id: 'b', label: 'Le jardin B (ramassé)' },
                  { id: 'egal', label: 'Autant tous les deux' },
                ]}
                value={pred}
                onChange={setPred}
                disabled={paverDone}
              />
              <JardinPaver
                full={paverDone}
                onFull={onBothPaved}
              />
              {paverDone && (
                <Feedback tone="ok">
                  {pred === 'a'
                    ? 'Ta prédiction tenait : '
                    : pred
                      ? 'Ta prédiction disait autre chose, et pourtant : '
                      : ''}
                  12 carreaux contre 9. La <strong>silhouette</strong> d'un jardin ne dit pas combien de pelouse
                  il faut : seul le recouvrement tranche.
                </Feedback>
              )}
            </div>
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
