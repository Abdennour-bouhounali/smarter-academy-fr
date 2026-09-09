import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 2 — DÉCOUVERTE : le vocabulaire, et le rôle du signe.
 *
 * Ce que le module 1 a laissé ouvert : on SAIT quelles tuiles se regroupent,
 * on n'a pas de mot pour le dire, et on n'a manipulé que des coefficients
 * positifs affichés. C'est ici que « terme semblable », « coefficient » et
 * « réduire » sont posés, et que le signe est traité explicitement.
 *
 * Ce que ce module NE fait PAS : aucun développement — la distributivité
 * attend le module 3, qui a d'abord besoin de savoir réduire son résultat.
 */
export default function Module02TermesSemblables() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Le mot juste',
      subtitle: 'Ce que tu triais à la main porte un nom.',
      done: q1,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="termes-semblables"
            variant="new"
            lead={<>Les tuiles qui s’éclairaient ensemble avaient un point commun : la même lettre. Voici comment on le dit.</>}
          />
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour chaque paire, dis si les deux termes sont <strong>semblables</strong>.
              </p>
            }
            rows={[
              {
                id: 'r1',
                label: <MathText>{'$7x$ et $-2x$'}</MathText>,
                options: ['semblables', 'non semblables'],
                correct: 0,
                correction: 'même partie littérale x — ils se regroupent',
              },
              {
                id: 'r2',
                label: <MathText>{'$4x$ et $4$'}</MathText>,
                options: ['semblables', 'non semblables'],
                correct: 1,
                correction: 'l’un a un x, l’autre non',
              },
              {
                id: 'r3',
                label: <MathText>{'$-x$ et $9x$'}</MathText>,
                options: ['semblables', 'non semblables'],
                correct: 0,
                correction: 'même partie littérale ; les coefficients sont −1 et 9',
              },
            ]}
            requires={['termes-semblables']}
            feedback={({ allRight }) =>
              allRight ? (
                <p className="text-sm text-emerald-700">
                  Exactement. Seule la <strong>partie littérale</strong> décide : le coefficient,
                  lui, peut être n’importe quel nombre — y compris négatif, ou égal à 1 sans être
                  écrit.
                </p>
              ) : (
                <p className="text-sm text-slate-700">
                  Regarde uniquement la <strong>partie littérale</strong> — ce qu’il y a après le
                  nombre. Si elle est identique, les termes sont semblables, quels que soient leurs
                  coefficients. <MathText>{'$-x$'}</MathText> a bien un x : son coefficient vaut −1.
                </p>
              )
            }
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le signe fait partie du terme',
      subtitle: 'Réduire, c’est additionner les coefficients — signes compris.',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-violet-200 bg-violet-50/40 p-3 text-sm text-slate-700">
            <MathText>{'$3x - 7x$'}</MathText> : les coefficients sont <strong>3</strong> et{' '}
            <strong>−7</strong>. Leur somme vaut <strong>−4</strong>, donc le résultat est{' '}
            <MathText>{'$-4x$'}</MathText>.
          </div>
          <TapQuestion
            prompt={<span>Réduis <MathText>{'$8x - 3 - 5x + 7$'}</MathText></span>}
            options={[
              <MathText key="a">{'$3x + 4$'}</MathText>,
              <MathText key="b">{'$13x + 10$'}</MathText>,
              <MathText key="c">{'$3x + 10$'}</MathText>,
              <MathText key="d">{'$7x$'}</MathText>,
            ]}
            correct={0}
            cols={4}
            requires={['termes-semblables']}
            correctionLabel="3x + 4"
            explain="Les x : 8 − 5 = 3, donc 3x. Les nombres : −3 + 7 = 4. Résultat : 3x + 4. Chaque signe reste attaché au terme qui le suit."
            explainWrong="Attention aux signes : ce sont 8 et −5 qu’on additionne (et non 8 et 5), puis −3 et 7. Et les x ne se mélangent jamais avec les nombres, donc le résultat garde bien deux termes."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Déjà rangée ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Parmi ces expressions, laquelle ne peut plus être réduite ?"
            options={[
              <MathText key="a">{'$2x + 5x - 1$'}</MathText>,
              <MathText key="b">{'$6x - 9$'}</MathText>,
              <MathText key="c">{'$4 + 3x + 2$'}</MathText>,
              <MathText key="d">{'$x + x + x$'}</MathText>,
            ]}
            correct={1}
            cols={2}
            requires={['termes-semblables']}
            correctionLabel="6x − 9"
            explain="6x − 9 ne contient qu’un seul x et qu’un seul nombre : il n’y a plus rien à regrouper. Les trois autres cachent deux quantités semblables qui attendent d’être réunies (7x − 1, 3x + 6, et 3x)."
            explainWrong="Une expression est réduite quand il ne reste plus qu’un seul x et un seul nombre. Compte, dans chaque proposition, ce qui est de même nature."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Termes semblables"
      moduleSubtitle="Le vocabulaire du rangement"
      estimatedTime="11 min"
      brief={{
        tag: 'Découverte',
        title: 'Mettre des mots sur le tri',
        tone: 'indigo',
        body: (
          <p>
            Tu as rangé des tuiles sans avoir besoin de vocabulaire. Pour aller plus loin — et
            surtout pour traiter les <strong>signes</strong> — il faut maintenant nommer ce que tu
            as fait.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
