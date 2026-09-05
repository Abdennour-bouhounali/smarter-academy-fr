import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PaperFold from '../components/PaperFold';
import { formatDec, formatExpanded, parseDec, pow } from '../components/powerUtils';

/**
 * Module 1 — DÉCLENCHEUR : « Le pliage ».
 *
 * Activity: plier une feuille cinq fois en comptant les épaisseurs.
 * Mathematical objective: rencontrer la multiplication répétée et le BESOIN
 *   d'une écriture courte, avant tout vocabulaire.
 * Student action: taper « Plier en deux », puis « Déplier ».
 * Controlled variable: le nombre de plis.
 * Mathematical state: f (entier). Les épaisseurs, les bandes dessinées et le
 *   produit développé sont dérivés de pow(2, f).
 * Visual consequence: la feuille se découpe en 2^f bandes et le produit
 *   « 2 × 2 × … » s'allonge d'un facteur par pli.
 * Expected observation: après 5 plis, écrire le calcul en entier est déjà
 *   pénible — d'où le besoin d'un nom court, 2^5.
 * Misconception targeted: « 5 plis = 10 épaisseurs » (2 × 5 confondu avec
 *   2^5) ; le dessin affiche 32, pas 10.
 * Feedback: le nombre d'épaisseurs manquantes est annoncé tant que la cible
 *   n'est pas atteinte.
 * Formalization: le mot « puissance », la base et l'exposant sont nommés à
 *   l'étape 2, une fois le pliage fait.
 * Scaffolding: deux boutons seulement ; l'écriture compacte apparaît d'un
 *   coup à l'étape 2 (showCompact).
 * Transfer: étape 4, lire 4^3 sans le calculer — d'abord dire ce qu'il
 *   REPRÉSENTE.
 */
const TARGET_FOLDS = 5;

export default function Module01LePliage() {
  const [folds, setFolds] = useState(0);
  const [reached, setReached] = useState(false);
  const [nameDone, setNameDone] = useState(false);
  const [trapDone, setTrapDone] = useState(false);
  const [readDone, setReadDone] = useState(false);

  const layers = pow(2, folds);

  const handleFold = (next, kitReact) => {
    setFolds(next);
    if (next >= TARGET_FOLDS && !reached) {
      setReached(true);
      kitReact?.(true);
    }
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le pliage"
      moduleSubtitle="Plie une feuille et compte les épaisseurs."
      estimatedTime="8 min"
      brief={{
        tag: '📄 Mission 01',
        title: 'Une feuille, quelques plis, et le calcul devient impossible à écrire.',
        body: (
          <p>
            Plie la feuille en deux, encore et encore. À chaque pli, le nombre d’épaisseurs double. Va
            jusqu’à <strong>{TARGET_FOLDS} plis</strong> et regarde ce que devient le calcul écrit en entier.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: `Plie la feuille ${TARGET_FOLDS} fois`,
          subtitle: 'Un pli = deux fois plus d’épaisseurs.',
          done: reached,
          content: (kit) => (
            <div className="space-y-3">
              <PaperFold folds={folds} onChange={(f) => handleFold(f, kit.react)} maxFolds={6} />
              {!reached && (
                <Feedback tone="info">
                  {folds === 0 ? (
                    <>La feuille est encore à plat : <strong className="font-mono">1</strong> épaisseur. Tape « Plier en deux ».</>
                  ) : (
                    <>
                      <strong className="font-mono">{formatDec(folds)}</strong> pli{folds > 1 ? 's' : ''} →{' '}
                      <strong className="font-mono">{formatDec(layers)}</strong> épaisseurs. Il reste{' '}
                      <strong className="font-mono">{formatDec(TARGET_FOLDS - folds)}</strong> pli
                      {TARGET_FOLDS - folds > 1 ? 's' : ''} à faire.
                    </>
                  )}
                </Feedback>
              )}
              {reached && (
                <Feedback tone="ok">
                  {formatDec(TARGET_FOLDS)} plis → <strong className="font-mono">{formatDec(pow(2, TARGET_FOLDS))}</strong>{' '}
                  épaisseurs, et le calcul s’écrit{' '}
                  <strong className="font-mono">{formatExpanded(2, TARGET_FOLDS).replace(/\\times/g, '×')}</strong>.
                  Cinq facteurs, c’est déjà long. Imagine dix plis : 1 024 épaisseurs, et dix « × 2 » à
                  écrire.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le nom court de ce calcul',
          subtitle: 'Deux nombres suffisent : lequel se répète, et combien de fois.',
          done: nameDone,
          content: (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 text-center space-y-2">
                <p className="text-sm text-indigo-900">
                  Pour éviter d’écrire {TARGET_FOLDS} fois « × 2 », on note le nombre répété, puis en petit
                  et en haut, combien de fois il apparaît :
                </p>
                <MathText className="text-2xl text-slate-800">
                  {`$\\underbrace{${formatExpanded(2, TARGET_FOLDS)}}_{${TARGET_FOLDS}\\text{ facteurs}} = 2^{${TARGET_FOLDS}} = ${pow(2, TARGET_FOLDS)}$`}
                </MathText>
                <p className="text-xs text-indigo-800">
                  Le <strong>2</strong> en gros est la <strong>base</strong> : le nombre qui se répète. Le{' '}
                  <strong>{TARGET_FOLDS}</strong> en petit est l’<strong>exposant</strong> : le nombre de
                  facteurs. On lit « 2 puissance {TARGET_FOLDS} ».
                </p>
              </div>
              <PaperFold folds={TARGET_FOLDS} showCompact frozen />
              <TapQuestion
                prompt={
                  <>
                    Dans l’écriture <MathText>{'$7^{4}$'}</MathText>, qui est la base et qui est l’exposant ?
                  </>
                }
                options={[
                  'Base 7, exposant 4 : on multiplie quatre 7',
                  'Base 4, exposant 7 : on multiplie sept 4',
                  'Base 7, exposant 4 : on fait 7 × 4',
                ]}
                cols={1}
                correct={0}
                explain={
                  <>
                    La base est le gros nombre écrit en bas, l’exposant le petit nombre en haut :{' '}
                    <MathText>{'$7^{4} = 7 \\times 7 \\times 7 \\times 7 = 2401$'}</MathText>.
                  </>
                }
                explainWrong={
                  <>
                    Attention à ne pas inverser, et surtout à ne pas confondre avec une multiplication
                    simple : <MathText>{'$7 \\times 4 = 28$'}</MathText>, alors que{' '}
                    <MathText>{'$7^{4} = 2401$'}</MathText>. L’exposant COMPTE les facteurs, il n’en est pas
                    un.
                  </>
                }
                solved={nameDone}
                onAnswered={() => setNameDone(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le piège le plus classique',
          done: trapDone,
          content: (
            <TapQuestion
              prompt={
                <>
                  Un élève dit : « <MathText>{'$2^{5}$'}</MathText>, c’est 2 × 5, donc 10 épaisseurs. » A-t-il
                  raison ?
                </>
              }
              options={['Oui, 10 épaisseurs', 'Non, 32 épaisseurs', 'Non, 25 épaisseurs']}
              cols={3}
              correct={1}
              explain={
                <>
                  Tu l’as vu sur la feuille : 5 plis donnent{' '}
                  <strong className="font-mono">{formatDec(pow(2, 5))}</strong> épaisseurs.{' '}
                  <MathText>{'$2^{5} = 2 \\times 2 \\times 2 \\times 2 \\times 2 = 32$'}</MathText>, pas 10.
                </>
              }
              explainWrong={
                <>
                  <MathText>{'$2 \\times 5 = 10$'}</MathText> AJOUTE cinq fois 2 ;{' '}
                  <MathText>{'$2^{5}$'}</MathText> MULTIPLIE cinq fois 2 par lui-même, ce qui donne 32 — le
                  nombre de bandes que tu viens de compter. Et 25, c’est{' '}
                  <MathText>{'$5^{2}$'}</MathText> : base et exposant échangés.
                </>
              }
              solved={trapDone}
              onAnswered={() => setTrapDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Lire une puissance sans la calculer',
          done: readDone,
          content: (
            <NumericQuestion
              prompt={
                <>
                  Combien de facteurs y a-t-il dans <MathText>{'$4^{3}$'}</MathText> ?
                </>
              }
              expected={3}
              parse={parseDec}
              display={formatDec(3)}
              suffix="facteurs"
              explain="L’exposant EST le nombre de facteurs : 4³ = 4 × 4 × 4, donc 3 facteurs (et la valeur vaut 64)."
              explainFor={(n) =>
                n === 4
                  ? 'Tu as lu la base. La base (4) est le nombre répété ; c’est l’EXPOSANT (3) qui dit combien de fois.'
                  : n === 12
                  ? 'Tu as calculé 4 × 3. La question ne demande pas la valeur mais le NOMBRE de facteurs : 3.'
                  : 'L’exposant EST le nombre de facteurs : 4³ = 4 × 4 × 4, donc 3 facteurs.'
              }
              solved={readDone}
              onAnswered={() => setReadDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Une puissance, c’est une multiplication répétée écrite court : la <strong>base</strong> se répète,
          l’<strong>exposant</strong> compte les répétitions. Au module suivant, tu vas régler ces deux
          nombres toi-même.
        </Feedback>
      }
    />
  );
}
