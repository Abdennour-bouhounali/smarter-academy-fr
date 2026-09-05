import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import ValueTable from '../../../../../common/components/ValueTable';
import { parseDec, formatDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AlgebraRect from '../components/AlgebraRect';
import { term } from '../components/litteralUtils';

/**
 * Module 7 — PRACTICE LAB : « Choisir la bonne forme ».
 *
 * Activity: pour trois BUTS différents, choisir l'écriture qui rend le
 *   travail facile — puis faire le calcul avec elle.
 * Mathematical objective: établir que développée et factorisée ne se valent
 *   pas selon l'objectif : calculer vite, annuler un produit, ou lire une
 *   aire. La transformation est un OUTIL, pas un rituel.
 * Student action: taper la forme choisie, puis calculer (9 991), puis
 *   reconnaître l'aire du cadre, enfin tester deux valeurs.
 * Controlled variable: la forme choisie à chaque but, et les x testés.
 * Mathematical state: (x + 3)² − 9 et sa forme factorisée x(x + 6) — mêmes
 *   valeurs, coûts de calcul très différents ; puis (x + 4)² − x² = 8x + 16.
 * Visual consequence: le calcul avec la mauvaise forme demande un carré à
 *   quatre chiffres ; avec la bonne, une multiplication de tête. Le cadre
 *   montre l'aire retirée par un rectangle gris.
 * Expected observation: 97 × 103 = 9 991 se fait de tête via x(x + 6) ;
 *   (x + 4)² − x² se réduit à 8x + 16, et 8 × 2 + 16 = 32 se vérifie.
 * Misconception targeted: « il faut toujours développer » et « il faut
 *   toujours factoriser » ; « deux écritures égales en un point sont égales ».
 * Feedback: les deux formes sont comparées en nombre d'opérations, puis
 *   confirmées au tableau de valeurs.
 * Formalization: la phrase « la question décide de l'écriture » est dite à
 *   la fin, une fois les trois buts joués.
 * Scaffolding: les deux formes sont toujours écrites côte à côte ; le
 *   NumericQuestion accepte le décimal via parseDec et révèle la valeur.
 * Transfer: l'étape 2 renvoie explicitement à « Équations produit nul » —
 *   cette leçon ne résout PAS d'équation, elle prépare la forme utile.
 */
const EQUATIONS_PATH = '/courses/college/3e/nombres_calculs/equations-produit';
const FRAME = { a: [term(1, 1), term(4, 0)], b: [term(1, 1), term(4, 0)] }; // (x + 4)²

export default function Module07ChoisirLaForme() {
  const [formPicked, setFormPicked] = useState(false);
  const [computed, setComputed] = useState(false);
  const [zeroDone, setZeroDone] = useState(false);
  const [frameDone, setFrameDone] = useState(false);
  const [tested, setTested] = useState(() => new Set());

  const done1 = formPicked && computed;
  const done2 = zeroDone;
  const done3 = frameDone;
  const done4 = tested.size >= 2;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Choisir la bonne forme"
      moduleSubtitle="Calculer vite, ou annuler un produit : c’est la question qui décide."
      estimatedTime="10 min"
      brief={{
        tag: '🌹 Mission 07',
        title: 'L’allée du jardin, et trois questions très différentes.',
        tone: 'rose',
        body: (
          <p>
            Tu sais développer, réduire et factoriser. Reste le plus important : savoir{' '}
            <strong>quand</strong> faire quoi. Trois buts, trois écritures gagnantes.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'But n°1 : calculer vite',
          subtitle: '(x + 3)² − 9 pour x = 97, sans calculatrice.',
          done: done1,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
                <p className="text-sm text-slate-600">
                  Les deux écritures ci-dessous sont la <strong>même expression</strong> — tu peux le
                  vérifier en développant la première :
                </p>
                <div className="grid sm:grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <p className="text-[11px] font-mono uppercase text-slate-500">Développée</p>
                    <p className="text-base"><MathText>{'$(x + 3)^{2} - 9$'}</MathText></p>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <p className="text-[11px] font-mono uppercase text-slate-500">Factorisée</p>
                    <p className="text-base"><MathText>{'$x(x + 6)$'}</MathText></p>
                  </div>
                </div>
              </div>
              <TapQuestion
                prompt={
                  <>
                    Pour calculer la valeur en <MathText>{'$x = 97$'}</MathText> de tête, quelle forme
                    choisis-tu ?
                  </>
                }
                options={[
                  '$(x + 3)^{2} - 9$ : élever 100 au carré, puis retirer 9',
                  '$x(x + 6)$ : multiplier 97 par 103',
                  'Les deux demandent le même travail',
                ]}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) =>
                  ['(x + 3)² − 9', 'x(x + 6)', 'Les deux demandent le même travail'][i]
                }
                correctionLabel="(x + 3)² − 9 : élever 100 au carré, puis retirer 9"
                cols={1}
                correct={0}
                explain={
                  <>
                    Ici la <strong>développée</strong> gagne, parce que{' '}
                    <MathText>{'$97 + 3 = 100$'}</MathText> : le carré devient{' '}
                    <MathText>{'$100^{2} = 10\\,000$'}</MathText>, et il ne reste qu’à retirer 9. La
                    forme factorisée demanderait <MathText>{'$97 \\times 103$'}</MathText> — faisable,
                    mais posé.
                  </>
                }
                explainWrong={
                  <>
                    Les deux donnent bien le <strong>même nombre</strong> — mais pas le même{' '}
                    <strong>travail</strong>. <MathText>{'$97 + 3 = 100$'}</MathText> : un carré rond,
                    puis −9. C’est le choix de l’écriture qui rend le calcul faisable de tête.
                  </>
                }
                solved={formPicked}
                onAnswered={() => setFormPicked(true)}
              />
              {formPicked && (
                <NumericQuestion
                  prompt={
                    <>
                      Alors, combien vaut <MathText>{'$(x + 3)^{2} - 9$'}</MathText> pour{' '}
                      <MathText>{'$x = 97$'}</MathText> ?
                    </>
                  }
                  expected={9991}
                  parse={parseDec}
                  display={formatDec(9991)}
                  explain="100² = 10 000, puis 10 000 − 9 = 9 991. Et 97 × 103 donne bien 9 991 : les deux écritures se rejoignent, comme toujours."
                  explainFor={(v) =>
                    v === 10000
                      ? '10 000, c’est 100² — tu as oublié de retirer les 9 : 10 000 − 9 = 9 991.'
                      : v === 9409
                      ? '9 409, c’est 97² — mais le carré porte sur x + 3, soit 100, pas sur x. Réponse : 10 000 − 9 = 9 991.'
                      : 'On calcule (97 + 3)² − 9 = 100² − 9 = 10 000 − 9 = 9 991.'
                  }
                  solved={computed}
                  onAnswered={() => setComputed(true)}
                />
              )}
              {done1 && (
                <Feedback tone="ok">
                  Même expression, deux coûts de calcul : la forme développée s’est appuyée sur un
                  nombre rond. Aucune des deux n’est « la bonne » dans l’absolu.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'But n°2 : rendre un produit nul',
          subtitle: 'Une question qui appartient à une autre leçon — mais dont la forme se prépare ici.',
          done: done2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={
                  <>
                    On cherche les valeurs de x pour lesquelles{' '}
                    <MathText>{'$(x + 3)(x - 5)$'}</MathText> vaut 0. Quelle écriture faut-il{' '}
                    <strong>garder</strong> ?
                  </>
                }
                options={[
                  'La forme factorisée $(x + 3)(x - 5)$',
                  'Il faut d’abord développer en $x^{2} - 2x - 15$',
                  'Il faut réduire les termes semblables',
                ]}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) =>
                  ['La forme factorisée (x + 3)(x − 5)', 'Développer en x² − 2x − 15', 'Réduire'][i]
                }
                correctionLabel="La forme factorisée (x + 3)(x − 5)"
                cols={1}
                correct={0}
                explain={
                  <>
                    Un <strong>produit</strong> est nul dès qu’un de ses facteurs l’est : la forme
                    factorisée met les réponses sous les yeux. Développer casserait justement le
                    produit et rendrait la question difficile.
                  </>
                }
                explainWrong={
                  <>
                    Développer donne <MathText>{'$x^{2} - 2x - 15$'}</MathText> : une somme, dont on ne
                    lit plus rien. C’est le contraire du réflexe utile — ici, on{' '}
                    <strong>factorise</strong>, ou on garde la forme factorisée qu’on a déjà.
                  </>
                }
                solved={done2}
                onAnswered={() => setZeroDone(true)}
              />
              {done2 && (
                <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 space-y-2.5">
                  <p className="text-sm font-semibold text-rose-900">Attention — ce n’est pas ici qu’on résout.</p>
                  <p className="text-sm text-rose-900 leading-relaxed">
                    Cette leçon te donne la <strong>bonne écriture</strong> ; trouver les valeurs de x
                    et rédiger la résolution, c’est le sujet entier d’une autre leçon. Le principe qui
                    s’y démontre : si <MathText>{'$A \\times B = 0$'}</MathText>, alors{' '}
                    <MathText>{'$A = 0$'}</MathText> ou <MathText>{'$B = 0$'}</MathText>.
                  </p>
                  <Link
                    to={EQUATIONS_PATH}
                    className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border-2 border-rose-300 bg-white text-sm font-bold text-rose-800 hover:border-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  >
                    Aller à « Équations produit nul »
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'But n°3 : lire l’aire d’un cadre',
          subtitle: 'Un carré de côté x + 4, moins un carré de côté x.',
          done: done3,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Maya entoure un massif carré de côté <MathText>{'$x$'}</MathText> par une allée large
                de 2, ce qui fait un grand carré de côté <MathText>{'$x + 4$'}</MathText>. L’aire de
                l’allée vaut <MathText>{'$(x + 4)^{2} - x^{2}$'}</MathText>.
              </p>
              <AlgebraRect
                product={FRAME}
                mode="rebuild"
                splitA
                splitB
                counted={['r0c0', 'r0c1', 'r1c0', 'r1c1']}
                merged
                frozen
                caption="Le grand carré (x + 4)² : le morceau x² en haut à gauche est le massif, tout le reste est l’allée."
              />
              <TapQuestion
                prompt={
                  <>
                    Quelle est la forme <strong>réduite</strong> de l’aire de l’allée,{' '}
                    <MathText>{'$(x + 4)^{2} - x^{2}$'}</MathText> ?
                  </>
                }
                options={['$8x + 16$', '$16$', '$8x$', '$2x + 16$']}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['8x + 16', '16', '8x', '2x + 16'][i]}
                correctionLabel="8x + 16"
                cols={2}
                correct={0}
                explain={
                  <>
                    On développe d’abord :{' '}
                    <MathText>{'$(x + 4)^{2} = x^{2} + 8x + 16$'}</MathText>. On retire{' '}
                    <MathText>{'$x^{2}$'}</MathText> : il reste{' '}
                    <MathText>{'$8x + 16$'}</MathText>. Sur l’image : les deux bandes{' '}
                    <MathText>{'$4x$'}</MathText> et le carré{' '}
                    <MathText>{'$16$'}</MathText> — le morceau <MathText>{'$x^{2}$'}</MathText> est
                    exactement celui qu’on enlève. Ici, c’est la forme{' '}
                    <strong>développée</strong> qui rend l’aire lisible.
                  </>
                }
                explainWrong={
                  <>
                    <MathText>{'$16$'}</MathText> serait l’erreur{' '}
                    <MathText>{'$(x+4)^{2} = x^{2} + 16$'}</MathText> — les deux bandes de{' '}
                    <MathText>{'$4x$'}</MathText> oubliées. Regarde l’image : autour du massif il y a
                    bien deux bandes et un coin. Total :{' '}
                    <MathText>{'$4x + 4x + 16 = 8x + 16$'}</MathText>.
                  </>
                }
                solved={done3}
                onAnswered={() => setFrameDone(true)}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Le rituel, une dernière fois',
          subtitle: 'Vérifie 8x + 16 contre (x + 4)² − x² sur deux valeurs.',
          done: done4,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Avant de valider une transformation, on teste. Deux valeurs au minimum — tu sais
                pourquoi.
              </p>
              <ValueTable
                columns={[
                  { id: 'cadre', label: <MathText>{'$(x+4)^{2}-x^{2}$'}</MathText>, fn: (x) => (x + 4) ** 2 - x ** 2 },
                  { id: 'reduite', label: <MathText>{'$8x+16$'}</MathText>, fn: (x) => 8 * x + 16 },
                  { id: 'piege', label: <MathText>{'$16$'}</MathText>, fn: () => 16 },
                ]}
                xs={[0, 1, 2, 5, 10]}
                tested={tested}
                onTest={(v) => {
                  const next = new Set(tested);
                  next.add(v);
                  setTested(next);
                  if (next.size >= 2 && tested.size < 2) kit.react(true);
                }}
                caption="La colonne 16 tient une seule ligne — celle où x = 0."
              />
              {!done4 && (
                <Feedback tone="info">
                  {tested.size === 0
                    ? 'Aucune valeur testée. Commence par x = 0 : les trois colonnes vont s’accorder — ce qui ne prouvera rien.'
                    : 'Une valeur testée. Il en faut une seconde : c’est elle qui démasquera la colonne 16.'}
                </Feedback>
              )}
              {done4 && (
                <>
                  <Feedback tone="ok">
                    Les deux premières colonnes tombent ensemble à chaque ligne :{' '}
                    <MathText>{'$8x + 16$'}</MathText> est bien la forme réduite de l’aire de l’allée.
                    La colonne <MathText>{'$16$'}</MathText>, elle, ne survit qu’à{' '}
                    <MathText>{'$x = 0$'}</MathText>.
                  </Feedback>
                  <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 space-y-1.5">
                    <p className="text-sm font-semibold text-rose-900">La règle de choix :</p>
                    <p className="text-sm text-rose-900 leading-relaxed">
                      <strong>Calculer une valeur</strong> → la forme la plus simple à évaluer, souvent
                      la <strong>développée</strong> (surtout si un nombre rond apparaît).{' '}
                      <strong>Annuler une expression</strong> → la <strong>factorisée</strong>, parce
                      qu’un produit est nul dès qu’un facteur l’est. <strong>Comparer ou lire une
                      aire</strong> → la <strong>réduite</strong>. La question décide, pas l’habitude.
                    </p>
                  </div>
                </>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Développer, réduire, factoriser sont des <strong>outils</strong>. La bonne écriture dépend de
          la question : calculer → développée ; <MathText>{'$= 0$'}</MathText> → factorisée. Et dans
          tous les cas, le tableau de valeurs reste juge.
        </Feedback>
      }
    />
  );
}
