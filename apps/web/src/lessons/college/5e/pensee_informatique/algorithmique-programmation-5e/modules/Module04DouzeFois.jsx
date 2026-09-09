import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TraceLab from '../components/TraceLab';
import ProgramView from '../components/ProgramView';
import {
  avancer, tourner, lit, makeRepeat, executer, premiereDifference,
  tailleEcrite, tailleExecutee,
} from '../components/trace';

/**
 * Module 4 — MANIPULATION : la boucle naît d'un besoin, pas d'une définition.
 *
 * Le brief l'impose explicitement : montrer d'ABORD la répétition écrite à la
 * main, puis demander « comment éviter de répéter ? ». La boucle « répéter n
 * fois » de la 6e est un acquis (priorKnowledge `boucle`) — ce qui est NEUF en
 * 5e, c'est qu'elle porte un NOMBRE DE TOURS qui peut être une variable, et
 * que le bloc répété contient des instructions paramétrées.
 *
 * ACTION → CHANGE → OBSERVATION → SENS :
 *   ACTION       exécuter les deux programmes, l'un après l'autre ;
 *   CHANGE       les deux feuilles se remplissent de la même façon ;
 *   OBSERVATION  trait pour trait, le dessin est identique — seul le nombre
 *                d'instructions écrites diffère (24 contre 1) ;
 *   SENS         la boucle ne change pas ce que fait le programme, elle change
 *                ce qu'on écrit. Donc le nombre d'endroits où se tromper.
 *
 * Expected observation : « les deux dessins sont identiques, mais l'un tient
 * en trois lignes ».
 * Misconception targeted : croire que la boucle « accélère » ou « change » le
 * dessin. L'égalité des tracés est un INVARIANT DU MOTEUR, vérifié par un test
 * unitaire (trace.test.js) : les deux programmes produisent la même liste de
 * pas, donc le même tracé — la leçon ne peut pas mentir sur ce point.
 *
 * PÉRIMÈTRE : une seule profondeur de boucle (makeRepeat aplatit), aucune
 * boucle conditionnelle. « Tant que » est la matière de la 3e.
 */

/* Le dodécagone écrit À LA MAIN : 24 instructions. C'est volontairement pénible
   — c'est la pénibilité qui motive la boucle. */
const A_LA_MAIN = Array.from({ length: 12 }, () => [avancer(30), tourner(30)]).flat();

/* Le même, en boucle. */
const EN_BOUCLE = [makeRepeat(12, [avancer(30), tourner(30)])];

/* La boucle dont le nombre de tours est une VARIABLE — c'est l'apport de 5e. */
const BOUCLE_VARIABLE = [makeRepeat(lit('n'), [avancer(lit('cote')), tourner(30)])];

export default function Module04DouzeFois() {
  const [prediction, setPrediction] = useState(null);
  const [vuMain, setVuMain] = useState(false);
  const [vuBoucle, setVuBoucle] = useState(false);
  const [q3, setQ3] = useState(false);
  const [n, setN] = useState(6);
  const [essaisN, setEssaisN] = useState(() => new Set());
  const vuN = essaisN.size >= 2;
  const [q5, setQ5] = useState(false);

  // L'égalité des deux tracés n'est pas affirmée : elle est CALCULÉE ici, à
  // partir du moteur, et affichée telle quelle.
  const identiques = premiereDifference(executer(A_LA_MAIN), executer(EN_BOUCLE)) === -1;

  const steps = [
    {
      num: 1,
      title: 'Vingt-quatre instructions',
      subtitle: 'Le programme du dodécagone, écrit sans rien répéter d’autre que ta patience.',
      done: vuMain,
      content: (kit) => (
        <div className="space-y-3">
          <TraceLab
            programme={A_LA_MAIN}
            hauteur={240}
            vitesse={90}
            titreProgramme="Écrit à la main — 24 instructions"
            onFin={() => { if (!vuMain) { setVuMain(true); kit.react(true); } }}
            bilan={(r) => (
              <Feedback tone="ok">
                {r.segments.length} côtés tracés — et il a fallu écrire{' '}
                <strong>{tailleEcrite(A_LA_MAIN)} instructions</strong> pour cela. Fais défiler la
                colonne de droite : c’est deux fois la même paire, douze fois de suite.
              </Feedback>
            )}
          />
          {vuMain && (
            <Feedback tone="info">
              Vingt-quatre lignes pour une figure. Et si elle avait cent côtés ? Il doit exister un
              moyen de dire « refais ça douze fois » sans l’écrire douze fois.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le même dessin, en trois lignes',
      subtitle: 'Prédis d’abord ce que va tracer ce programme-ci.',
      done: vuBoucle,
      content: (kit) => (
        <div className="space-y-3">
          <TraceLab
            programme={EN_BOUCLE}
            hauteur={240}
            vitesse={90}
            titreProgramme="Avec une boucle — 1 instruction écrite"
            onFin={() => { if (!vuBoucle) { setVuBoucle(true); kit.react(true); } }}
            bilan={() => null}
          />
          <PredictionChips
            prompt="ce programme va-t-il tracer la même figure que le précédent ?"
            options={[
              { id: 'meme', label: 'Exactement la même' },
              { id: 'plus-petit', label: 'La même, mais plus petite' },
              { id: 'autre', label: 'Une figure différente' },
              { id: 'rien', label: 'Un seul côté' },
            ]}
            value={prediction}
            onChange={setPrediction}
          />
          {vuBoucle && (
            <>
              <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-3 space-y-2">
                <p className="text-center text-sm font-bold text-emerald-900">
                  {identiques
                    ? 'Trait pour trait, les deux dessins sont identiques.'
                    : 'Les deux dessins diffèrent.'}
                </p>
                <div className="grid sm:grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg border-2 border-slate-300 bg-white px-3 py-2">
                    <div className="text-xs font-semibold text-slate-500">Écrit à la main</div>
                    <div className="font-mono text-lg font-black text-slate-700 tabular-nums">
                      {tailleEcrite(A_LA_MAIN)} instructions
                    </div>
                  </div>
                  <div className="rounded-lg border-2 border-purple-300 bg-white px-3 py-2">
                    <div className="text-xs font-semibold text-purple-600">Avec la boucle</div>
                    <div className="font-mono text-lg font-black text-purple-700 tabular-nums">
                      {tailleEcrite(EN_BOUCLE)} instruction
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-slate-700">
                  Et pourtant, <strong>{tailleExecutee(EN_BOUCLE)} instructions exécutées</strong>{' '}
                  des deux côtés : la boucle n’en supprime aucune, elle évite seulement de les
                  écrire.
                </p>
              </div>
              <KnowledgeBrick
                id="repeter-n-fois"
                variant="new"
                lead={<>Ce que tu viens de comparer a un nom, et une raison d’exister.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que la boucle change, et ce qu’elle ne change pas',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="En remplaçant huit instructions par une boucle « RÉPÉTER 4 fois », qu’est-ce qui change ?"
            options={[
              'Rien au dessin ; seul le nombre d’instructions écrites diminue',
              'Le dessin devient plus régulier',
              'Le programme s’exécute en moins d’étapes',
              'Le dessin devient quatre fois plus grand',
            ]}
            correct={0}
            cols={1}
            requires={['repeter-n-fois']}
            explain="La boucle est une façon d’ÉCRIRE la même suite d’instructions. Le stylo exécute exactement les mêmes gestes, dans le même ordre : le dessin est identique au trait près."
            explainWrong="Tu viens de le vérifier à l’étape 2 : les deux figures sont superposables, et le nombre d’instructions EXÉCUTÉES est le même. Ce qui diminue, c’est seulement le nombre de lignes écrites."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Le nombre de tours devient une entrée',
      subtitle: 'Ce que la 6e ne faisait pas : régler n sans toucher au programme.',
      done: vuN,
      content: (kit) => (
        <div className="space-y-3">
          <TraceLab
            programme={BOUCLE_VARIABLE}
            env={{ n, cote: 34 }}
            entrees={[{ nom: 'n', label: 'nombre de tours de boucle', min: 2, max: 12, pas: 1 }]}
            onEnv={(_, v) => { setN(v); setEssaisN((s) => new Set(s).add(v)); if (essaisN.size === 1) kit.react(true); }}
            autoExecuter
            hauteur={240}
            titreProgramme="RÉPÉTER n fois"
            bilan={(r) => (
              <div className="rounded-xl border-2 border-purple-200 bg-purple-50 px-3 py-2.5 text-sm text-purple-900">
                <strong className="font-mono">n = {n}</strong> → <strong>{r.segments.length}</strong>{' '}
                côté{r.segments.length > 1 ? 's' : ''} tracé{r.segments.length > 1 ? 's' : ''}. Le
                nombre de tours de boucle et le nombre de côtés sont un seul et même nombre.
              </div>
            )}
          />
          {vuN ? (
            <Feedback tone="ok">
              Le nombre de tours est une <strong>entrée</strong>, exactement comme la longueur du
              côté au module 2. Un seul programme, et toute une collection de figures — mais aucune
              ne se referme… pour l’instant.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Fais glisser <strong className="font-mono">n</strong> sur au moins deux valeurs.
              Compte les côtés à chaque fois.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 5,
      title: 'Compter les instructions',
      done: q5,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3.5">
            <ProgramView
              programme={[makeRepeat(9, [avancer(20), tourner(40)])]}
              env={{}}
              titre="Le programme à lire"
              compact
            />
          </div>
          <TapQuestion
            prompt="Combien d’instructions KIWI exécute-t-il en tout ?"
            options={['18', '9', '2', '11']}
            correct={0}
            cols={4}
            requires={['repeter-n-fois']}
            explain="La boucle contient 2 instructions et fait 9 tours : 9 × 2 = 18 instructions exécutées. Écrites, il n’y en a que deux."
            explainWrong="9 est le nombre de TOURS, pas le nombre d’instructions. À chaque tour, KIWI exécute les deux instructions du bloc : il faut donc multiplier, 9 × 2 = 18."
            solved={q5}
            onAnswered={() => setQ5(true)}
          />
          {q5 && (
            <Feedback tone="info">
              Tu sais faire répéter un bloc autant de fois que tu veux. Mais aucune de tes figures
              ne s’est encore refermée proprement. Il manque une seule chose — et c’est de la
              géométrie, pas de la programmation.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Douze fois la même chose"
      moduleSubtitle="La boucle ne change pas le dessin — elle change ce qu’on écrit"
      estimatedTime="10 min"
      brief={{
        tag: 'Manipulation',
        title: 'Comment éviter de tout réécrire ?',
        tone: 'indigo',
        body: (
          <p>
            Pour tracer une figure à douze côtés, il faut écrire vingt-quatre instructions — et
            deux d’entre elles seulement sont vraiment différentes. Tu vas voir le même dessin
            sortir d’un programme qui tient en trois lignes.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
