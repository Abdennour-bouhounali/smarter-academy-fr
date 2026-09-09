import React, { useState } from 'react';
import { Repeat } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RoueLab from '../components/RoueLab';
import { GRAINE_LECON, graineSuivante, TAILLES_DE_SERIE } from '../components/proba4e';

/**
 * Module 2 — DÉCOUVERTE : fluctuation ET stabilisation, nommées.
 *
 * Activity              relancer plusieurs fois la MÊME roue au MÊME nombre
 *                       de tours, et constater que les résultats changent ;
 *                       puis changer de taille et constater qu'ils changent
 *                       moins.
 * Mathematical objective deux séries identiques en tout point donnent des
 *                       fréquences différentes — c'est la fluctuation. Elle
 *                       diminue quand le nombre de répétitions augmente —
 *                       c'est la stabilisation.
 * Student action        relancer, changer de taille.
 * Controlled variable   la graine (par « relancer ») et la taille.
 * Mathematical state    { taille, graine }, composition FIGÉE ici.
 * Visual consequence    les cinq barres se redessinent entièrement à chaque
 *                       relance, et l'écart chiffré change.
 * Expected observation  « je n'ai rien changé, et pourtant ce n'est pas
 *                       pareil ».
 * Misconception targeted « une différence entre deux séries signale une
 *                       erreur ou une roue truquée ».
 *
 * La composition est verrouillée (`lockComposition`) : c'est le SEUL module
 * où elle l'est, parce que la découverte porte sur ce qui varie quand RIEN
 * ne change. Le labo reste entièrement manipulable par ailleurs.
 */
const ROUE = { or: 3, violet: 2, turquoise: 2, rose: 1 };

export default function Module02JamaisDeuxFoisPareil() {
  const [taille, setTaille] = useState(TAILLES_DE_SERIE[0]);
  const [graine, setGraine] = useState(GRAINE_LECON);
  const [relances, setRelances] = useState(0);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const relancer = () => {
    setGraine((g) => graineSuivante(g));
    setRelances((r) => r + 1);
  };

  const done1 = relances >= 3;

  const lab = (
    <RoueLab
      composition={ROUE}
      onComposition={() => {}}
      taille={taille}
      onTaille={setTaille}
      graine={graine}
      onRelancer={relancer}
      lance
      lockComposition
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Relance sans rien changer',
      subtitle: 'Même roue, même nombre de tours. Appuie trois fois sur « Relancer ».',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            La composition est bloquée : la roue est exactement la même à chaque fois. Seul le
            hasard change.
          </p>
          {lab}
          {relances > 0 && !done1 && (
            <Feedback tone="info">
              {relances} relance{relances > 1 ? 's' : ''}. Continue : regarde si tu obtiens deux
              fois de suite les mêmes cinq barres.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Trois relances, trois tableaux différents — sans qu’on ait touché à la roue. Ce
              n’est pas une erreur : c’est le hasard.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le mot juste',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Deux séries de 10 tours sur la MÊME roue donnent des fréquences différentes. Comment l’expliquer ?"
            options={[
              'C’est normal : les fréquences fluctuent d’une série à l’autre',
              'La roue s’est déréglée entre les deux séries',
              'L’une des deux séries contient une erreur',
              'C’est impossible : elles devraient être identiques',
            ]}
            correct={0}
            cols={1}
            requires={['fluctuation']}
            explain="Rien n’a changé dans la roue. Sur peu de lancers, le hasard fait varier le résultat d’une série à l’autre : c’est attendu, et c’est mesurable."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce qui fait rétrécir l’écart',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Passe à {TAILLES_DE_SERIE[TAILLES_DE_SERIE.length - 1].toLocaleString('fr-FR')} tours,
            puis relance plusieurs fois. Compare l’écart affiché en bas à celui de 10 tours.
          </p>
          {lab}
          <TapQuestion
            prompt="Qu’est-ce qui fait diminuer l’écart entre les séries ?"
            options={[
              'Augmenter le nombre de tours de chaque série',
              'Relancer plus souvent',
              'Ajouter des couleurs à la roue',
              'Rien : l’écart est toujours le même',
            ]}
            correct={0}
            cols={1}
            requires={['fluctuation']}
            explain="Relancer ne change rien à l’écart : ce sont toujours des séries de la même taille. C’est la TAILLE de chaque série qui resserre les résultats autour de la probabilité."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="stabilisation"
              variant="new"
              lead="Le second phénomène, celui qui rassure : plus on répète, plus on se rapproche."
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Jamais deux fois pareil"
      moduleSubtitle="Ce qui varie, et ce qui finit par ne plus varier"
      estimatedTime="11 min"
      brief={{
        tag: '🎬 Mission 02',
        title: 'La même roue, deux résultats',
        tone: 'indigo',
        body: (
          <>
            Tu n’as rien changé à la roue, et pourtant les cinq séries ne se ressemblent pas.
            <strong> Est-ce un problème ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5">
          <Repeat className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden="true" />
          <p className="text-sm text-violet-900">
            Ici, la composition est verrouillée exprès : seule la part du hasard peut changer.
            Relance, et compare.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
