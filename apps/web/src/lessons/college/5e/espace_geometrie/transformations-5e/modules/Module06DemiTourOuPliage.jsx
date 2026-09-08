import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ContrasteLab from '../components/ContrasteLab';
import { LETTRE_F, placer } from '../components/transformations';

/**
 * Module 6 — RÉUTILISATION : demi-tour ou pliage ?
 *
 * Les deux transformations conservent tout ce que le module 4 a établi
 * (longueurs, angles, aires) : ce n'est donc PAS là qu'on peut les distinguer,
 * et c'est le point que ce module fait admettre avant de chercher ailleurs.
 *
 * La différence est ailleurs, et elle est visible : le pliage RETOURNE la
 * figure. Le laboratoire l'expose sur une lettre F — la seule figure sur
 * laquelle un retournement ne peut pas passer inaperçu.
 *
 * Expected observation : « le F du pliage est à l'envers ; celui du demi-tour
 * est encore un F normal, juste posé dans l'autre sens ».
 * Misconception targeted : croire que la symétrie centrale est « une symétrie
 * axiale avec un point », ou chercher la différence dans les longueurs.
 */
const FIG = placer(LETTRE_F, { x: 105, y: 300 });

export default function Module06DemiTourOuPliage() {
  const [centre, setCentre] = useState({ x: 300, y: 230 });
  const [axeX, setAxeX] = useState(560);
  const [vu, setVu] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'La même figure, les deux transformations',
      subtitle: 'Déplace le centre rouge et l’axe bleu. Compare les deux images à la figure grise.',
      done: vu,
      content: (kit) => (
        <div className="space-y-3">
          <ContrasteLab
            figure={FIG}
            centre={centre}
            onCentre={(c) => { setCentre(c); if (!vu) { setVu(true); kit.react?.(true); } }}
            axeX={axeX}
            onAxeX={(x) => { setAxeX(x); if (!vu) { setVu(true); kit.react?.(true); } }}
            ariaLabel="Une lettre F, son image par un demi-tour et son image par un pliage"
          />
          {vu ? (
            <Feedback tone="ok">
              Regarde bien les deux F. Le <strong className="text-sky-700">bleu</strong> est un F{' '}
              <strong>à l’envers</strong> — un F « miroir », qu’aucun glissement ne remettra jamais
              droit. Le <strong className="text-violet-700">violet</strong>, lui, est encore un vrai
              F : il est seulement posé dans l’autre sens.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Traîne le point rouge (le centre du demi-tour) et le point bleu (l’axe du pliage). La
              lettre F est choisie exprès : elle n’a aucune symétrie, donc un retournement se
              remarque tout de suite.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Où NE PAS chercher la différence',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Peut-on distinguer un demi-tour d’un pliage en mesurant les longueurs et les angles de l’image ?"
            options={[
              'Non : les deux conservent longueurs, angles et aires',
              'Oui : le pliage réduit les longueurs',
              'Oui : le demi-tour double les angles',
            ]}
            correct={0}
            cols={1}
            requires={['invariants-symetrie', 'axe-symetrie']}
            explain="Les deux transformations conservent exactement les mêmes grandeurs. Mesurer ne servira donc jamais à les distinguer : il faut regarder si la figure a été RETOURNÉE."
            explainWrong="Reprends le laboratoire et compare : les deux F ont la même taille et les mêmes angles que le F gris. Aucune mesure ne les sépare — la différence est ailleurs."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="centrale-vs-axiale"
              variant="new"
              lead={<>Puisque les mesures ne les séparent pas, il fallait regarder autre chose : ce que tu as vu sur les deux F.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le test qui tranche',
      done: q3,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour chaque situation, s’agit-il d’un demi-tour (symétrie centrale) ou d’un pliage
                (symétrie axiale) ?
              </p>
            }
            rows={[
              {
                id: 'r1',
                label: 'Une figure et son image se superposent en faisant glisser le calque sur la table, sans le soulever.',
                options: ['Demi-tour', 'Pliage'],
                correct: 0,
                correction: 'Glisser sans soulever, c’est exactement ce qu’on peut faire après un demi-tour : la figure n’a pas été retournée.',
              },
              {
                id: 'r2',
                label: 'Il faut retourner le calque (le soulever et le poser face contre table) pour superposer les deux figures.',
                options: ['Demi-tour', 'Pliage'],
                correct: 1,
                correction: 'Devoir retourner le calque est la signature du pliage : la symétrie axiale renverse la figure comme un miroir.',
              },
              {
                id: 'r3',
                label: 'Un seul point de la figure reste exactement à sa place.',
                options: ['Demi-tour', 'Pliage'],
                correct: 0,
                correction: 'Le demi-tour ne laisse fixe que le centre. Dans un pliage, c’est toute la droite de l’axe qui reste fixe.',
              },
              {
                id: 'r4',
                label: 'Toute une droite de la figure reste à sa place.',
                options: ['Demi-tour', 'Pliage'],
                correct: 1,
                correction: 'L’axe du pliage ne bouge pas : chacun de ses points est son propre symétrique.',
              },
            ]}
            requires={['centrale-vs-axiale']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Deux tests suffisent, et tu peux toujours les appliquer :{' '}
                  <strong>la figure est-elle retournée ?</strong> et{' '}
                  <strong>qu’est-ce qui reste fixe — un point, ou toute une droite ?</strong>
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Reviens au geste physique : dans un demi-tour, le calque
                  reste <strong>à plat sur la table</strong>. Dans un pliage, il faut le{' '}
                  <strong>retourner</strong>. Et ce qui reste fixe est un point d’un côté, une
                  droite entière de l’autre.
                </Feedback>
              )
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Un cas qui trompe',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-3.5 text-sm text-slate-700">
            Un élève affirme : « le symétrique d’une figure par rapport à un point, c’est pareil
            que par rapport à une droite — il suffit de choisir la bonne droite. »
          </div>
          <TapQuestion
            prompt="A-t-il raison ?"
            options={[
              'Non : le pliage retourne la figure, le demi-tour jamais',
              'Oui, si la droite passe par le centre',
              'Oui, toujours',
            ]}
            correct={0}
            cols={1}
            requires={['centrale-vs-axiale', 'invariants-symetrie']}
            explain="Aucune droite ne peut reproduire un demi-tour : le pliage produit toujours une figure retournée, le demi-tour jamais. Ce sont deux transformations différentes, quelles que soient la droite et le point choisis."
            explainWrong="Teste l’idée sur le F du laboratoire : place l’axe où tu veux, l’image bleue reste toujours un F à l’envers. Elle ne coïncidera jamais avec l’image violette, qui est un F à l’endroit."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              C’est pour cela qu’on leur donne deux noms différents. Elles se ressemblent beaucoup —
              elles conservent les mêmes grandeurs — mais l’une <strong>retourne</strong> et
              l’autre <strong>fait tourner</strong>.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Demi-tour ou pliage ?"
      moduleSubtitle="Deux transformations qu’on confond"
      estimatedTime="10 min"
      brief={{
        tag: 'Réutilisation',
        title: 'Elles se ressemblent — jusqu’à un détail',
        tone: 'rose',
        body: (
          <p>
            Symétrie centrale et symétrie axiale conservent exactement les mêmes grandeurs. Alors
            comment les distinguer ? En regardant <strong>ce qu’aucune mesure ne dit</strong> : si
            la figure a été retournée.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
