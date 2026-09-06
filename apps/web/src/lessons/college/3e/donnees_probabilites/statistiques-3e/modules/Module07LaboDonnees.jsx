import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DotPlot from '../components/DotPlot';
import { mean, median, missingForMean, sum, total } from '../components/statUtils';
import { NOTES } from '../components/trajetData';
import { parseDec, formatDec, roundTo } from '@smarter-academy/core';

/**
 * Module 7 — ATELIER : « Le labo des données ».
 *
 * Activity: atteindre une moyenne visée en ajoutant la bonne valeur, puis
 *   démonter une affirmation statistiquement trompeuse.
 * Mathematical objective: retourner la moyenne — au lieu de la calculer, on la
 *   VISE. Et transférer le raisonnement du module 6 à une phrase du quotidien.
 * Student action: régler la note manquante jusqu'à atteindre la moyenne cible.
 * Controlled variable: la valeur ajoutée.
 * Mathematical state: { extra } ; `missingForMean` fournit la cible exacte,
 *   donc l'écart affiché est toujours juste.
 * Visual consequence: le repère ambre marque la moyenne visée, et le triangle
 *   bleu s'en rapproche à mesure qu'on règle la note.
 * Expected observation: « pour monter la moyenne d'un point, il faut bien plus
 *   qu'un point de plus ».
 * Misconception targeted: croire qu'ajouter une valeur égale à la moyenne
 *   visée suffit ; et accepter une affirmation parce qu'elle cite un chiffre.
 * Feedback: l'écart à la cible est quantifié à chaque réglage ; échappée après
 *   4 essais.
 * Formalization: la méthode « viser une moyenne » est posée par une
 *   <KnowledgeBrick> à l'étape 2, après que le réglage à la main l'a fait
 *   éprouver ; le réflexe de lecture critique par une seconde à l'étape 3.
 * Scaffolding: cible affichée → calcul inverse → jugement d'une affirmation.
 * Transfer: c'est le module de transfert de la leçon.
 */

const TARGET = 15;
const NEEDED = missingForMean(NOTES, TARGET);   // 20 : (6 × 15) − 70
const AXE_NOTES = { min: 0, max: 20, step: 2 };

export default function Module07LaboDonnees() {
  const [extra, setExtra] = useState(10);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [whyDone, setWhyDone] = useState(false);
  const [claimDone, setClaimDone] = useState(false);

  const values = [...NOTES, extra];
  const m = roundTo(mean(values), 2);
  const hit = m === TARGET;
  const done1 = hit || revealed;

  const change = (i, v, kit) => {
    if (i !== NOTES.length || v === extra) return;
    setExtra(v);
    setTries((t) => t + 1);
    if (roundTo(mean([...NOTES, v]), 2) === TARGET) kit.react(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Le labo des données"
      moduleSubtitle="Atteindre une moyenne visée, et démonter une affirmation trompeuse."
      estimatedTime="10 min"
      brief={{
        tag: '🔬 Mission 07',
        title: 'La sixième note',
        tone: 'indigo',
        body: (
          <p>
            Cinq notes déjà rendues : {NOTES.join(', ')}. Il reste un devoir. Quelle note
            faudrait-il pour atteindre <strong>{TARGET} de moyenne</strong> ?
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Règle la sixième note',
          subtitle: 'Déplace la dernière pastille jusqu’à la moyenne visée.',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <DotPlot
                values={values}
                min={AXE_NOTES.min}
                max={AXE_NOTES.max}
                step={AXE_NOTES.step}
                mode={done1 ? 'display' : 'drag'}
                activeIndex={NOTES.length}
                onActiveChange={() => {}}
                onChange={(i, v) => change(i, v, kit)}
                showMean
                target={TARGET}
                unit=""
                ariaLabel="Axe des notes : règle la sixième note pour viser la moyenne"
              />
              <Feedback tone={done1 ? (revealed ? 'info' : 'ok') : 'info'}>
                {done1 ? (
                  <>
                    {revealed ? 'On te la montre : ' : 'Atteinte. '}
                    il faut <strong>{formatDec(NEEDED)}</strong>. La somme visée est{' '}
                    6 × {TARGET} = {formatDec(6 * TARGET)}, et les cinq notes en donnent déjà{' '}
                    {formatDec(sum(NOTES))} : il manque exactement{' '}
                    {formatDec(6 * TARGET - sum(NOTES))}.
                  </>
                ) : (
                  <>
                    Avec {formatDec(extra)}, la moyenne vaut <strong>{formatDec(m)}</strong> :
                    il manque <strong>{formatDec(roundTo(TARGET - m, 2))}</strong> pour
                    atteindre {TARGET}.
                  </>
                )}
              </Feedback>
              {!done1 && tries >= 4 && (
                <button
                  type="button"
                  onClick={() => { setExtra(NEEDED); setRevealed(true); kit.react(false); }}
                  className="w-full min-h-[44px] rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                  style={{ touchAction: 'manipulation' }}
                >
                  Je ne trouve pas — montre-moi la note
                </button>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Pourquoi faut-il autant ?',
          done: whyDone,
          content: (
            <div className="space-y-3">
            <TapQuestion
              prompt={<>La moyenne actuelle est {formatDec(roundTo(mean(NOTES), 1))}. Pourquoi une note de {TARGET} ne suffirait-elle pas à atteindre {TARGET} de moyenne ?</>}
              requires={['moyenne', 'calcul-moyenne']}
              options={[
                'Parce qu’une note égale à la cible laisse la moyenne où elle est',
                'Parce qu’il faut toujours une note maximale',
                'Parce que six notes comptent plus que cinq',
                'Elle suffirait, en fait',
              ]}
              correct={0}
              cols={1}
              explain={`Ajouter une valeur égale à la moyenne actuelle ne la change pas ; ajouter une valeur égale à la CIBLE ne l'y amène pas non plus, tant que les autres notes sont en dessous. Il faut compenser tout le retard accumulé : d'où ${formatDec(NEEDED)}.`}
              explainWrong="Essaie avec 15 dans la manipulation : la moyenne monte, mais pas jusqu’à 15. Les cinq premières notes tirent encore vers le bas."
              solved={whyDone}
              onAnswered={() => setWhyDone(true)}
            />
            {whyDone && (
              <KnowledgeBrick
                id="viser-une-moyenne"
                variant="new"
                lead="Tu as réglé la note à la main. Voici comment la trouver du premier coup, sans tâtonner."
              />
            )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'L’affirmation du journal',
          done: claimDone,
          content: (
            <div className="space-y-3">
            <TapQuestion
              prompt="« La moyenne des trajets est de 16 min, donc la plupart des élèves mettent environ 16 min. » Que penser de cette phrase ?"
              requires={['moyenne', 'mem-ce-que-la-moyenne-ne-dit-pas', 'comparer-series', 'etendue']}
              options={[
                'Elle est trompeuse : la moyenne ne dit rien du nombre d’élèves proches d’elle',
                'Elle est juste : c’est la définition de la moyenne',
                'Elle est juste seulement si l’étendue est grande',
                'Impossible à juger sans connaître l’effectif',
              ]}
              correct={0}
              cols={1}
              explain="La moyenne peut très bien ne correspondre à AUCUN élève. Dans une classe où la moitié met 5 min et l’autre 27 min, la moyenne vaut 16 alors que personne ne met 16 min. Pour parler de « la plupart », il faut regarder la dispersion."
              explainWrong="La moyenne équilibre les valeurs, elle ne dit pas combien d’élèves sont proches d’elle. C’est justement ce que le module précédent a montré avec les deux classes."
              solved={claimDone}
              onAnswered={() => setClaimDone(true)}
            />
            {claimDone && (
              <KnowledgeBrick
                id="mem-lire-un-chiffre-publie"
                variant="new"
                lead="Le réflexe à emporter hors du cours, chaque fois qu’un chiffre est publié quelque part."
              />
            )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={7}>
          Ta carte est complète. La mission finale te demande de t’en servir sur dix chiffres à
          publier — sans en laisser passer un seul qui mente.
        </KnowledgeSnapshot>
      }
    />
  );
}
