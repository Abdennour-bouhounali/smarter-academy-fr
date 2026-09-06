import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { affine, square, tableOf, formatRule, classify } from '../components/functionUtils';

/**
 * Module 5 — FORMALISATION : « Linéaire, affine, ou ni l'un ni l'autre ».
 *
 * Activity: comparer trois machines par leur graphique, puis nommer chacune.
 * Mathematical objective: donner leur nom aux deux familles APRÈS que l'élève
 *   a vu leurs allures — droite par l'origine, droite quelconque, non-droite.
 * Student action: comparer trois repères, puis trier des expressions.
 * Controlled variable: aucune ici — c'est le module qui formalise ; la
 *   manipulation a eu lieu aux modules 1 à 4.
 * Mathematical state: trois règles fixes, classées par `classify`.
 * Visual consequence: les trois repères côte à côte rendent la différence
 *   immédiate ; le point (0 ; b) est marqué sur chacune des droites.
 * Expected observation: « celle qui passe par l'origine n'a pas de terme
 *   constant » — le graphique et l'écriture disent la même chose.
 * Misconception targeted: « linéaire et affine, c'est pareil » et son inverse
 *   « une linéaire n'est pas affine ». On tranche : toute linéaire EST affine,
 *   c'est le cas b = 0.
 * Feedback: le lot révèle la bonne case de CHAQUE ligne, pas seulement les
 *   erreurs.
 * Formalization: c'est le cœur du module — les deux définitions sont posées.
 * Scaffolding: graphiques d'abord, écritures ensuite, sans graphique à la fin.
 * Transfer: le module 6 demande de retrouver a et b, ce qui suppose de savoir
 *   de quelle famille on parle.
 */

const LIN = affine(2, 0);        // f(x) = 2x
const AFF = affine(2, 3);        // g(x) = 2x + 3
const SQ = square();             // h(x) = x²
const RANGE = { xMin: -4, xMax: 4, yMin: -5, yMax: 8 };
const SQ_RANGE = { xMin: -3, xMax: 3, yMin: -1, yMax: 9 };

function MiniPlane({ rule, tone, label, intercept }) {
  const isSquare = rule.kind === 'square';
  return (
    <div className="space-y-1">
      <div className="text-center">
        <MathText>{`$${formatRule(rule, { name: label })}$`}</MathText>
      </div>
      <CoordPlane
        range={isSquare ? SQ_RANGE : RANGE}
        unit={22}
        functions={isSquare
          ? [{ id: label, fn: (x) => x * x, tone }]
          : [{ id: label, a: rule.a, b: rule.b, tone }]}
        intercept={intercept ? { y: rule.b, label: `b = ${rule.b}` } : null}
        points={isSquare ? [] : [{ id: 'O', x: 0, y: rule.b, color: tone === 'emerald' ? '#059669' : '#4f46e5' }]}
        caption={false}
        ariaLabel={`Représentation graphique de ${label}`}
      />
    </div>
  );
}

export default function Module05LineaireAffine() {
  const [shapeDone, setShapeDone] = useState(false);
  const [originDone, setOriginDone] = useState(false);
  const [sortDone, setSortDone] = useState(false);
  const [bothDone, setBothDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Linéaire, affine, ou ni l’un ni l’autre"
      moduleSubtitle="Trois machines, trois allures. Le graphique donne le nom."
      estimatedTime="9 min"
      brief={{
        tag: '🔤 Mission 05',
        title: 'Donne-leur un nom',
        tone: 'indigo',
        body: (
          <p>
            Tu sais tracer une fonction. Ces trois-là n’ont pas la même allure — et cette
            différence a un nom que les mathématiciens utilisent tous les jours.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Trois allures',
          subtitle: 'Compare les trois repères.',
          done: shapeDone,
          content: (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <MiniPlane rule={LIN} tone="indigo" label="f" />
                <MiniPlane rule={AFF} tone="emerald" label="g" intercept />
                <MiniPlane rule={SQ} tone="rose" label="h" />
              </div>
              <TapQuestion
                prompt="Qu’est-ce qui distingue f et g de h ?"
                options={[
                  'f et g donnent des droites, h non',
                  'f et g passent par l’origine, h non',
                  'h monte, f et g descendent',
                  'Rien : les trois sont des droites',
                ]}
                correct={0}
                cols={1}
                requires={['representation-graphique']}
                explain="f et g sont représentées par des DROITES. h, la fonction carré, donne une courbe. C’est l’allure qui sépare les deux familles."
                explainWrong="Regarde g : elle coupe l’axe des ordonnées en 3, donc elle ne passe pas par l’origine — et pourtant c’est bien une droite."
                solved={shapeDone}
                onAnswered={() => setShapeDone(true)}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Et entre f et g ?',
          done: originDone,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="Les deux sont des droites. Qu’est-ce qui les sépare ?"
                options={[
                  'f passe par l’origine, pas g',
                  'f est plus inclinée que g',
                  'g est plus longue',
                  'Rien du tout',
                ]}
                correct={0}
                cols={1}
                requires={['representation-graphique', 'origine-repere']}
                explain="f(x) = 2x passe par l’origine : f(0) = 0. g(x) = 2x + 3 coupe l’axe des ordonnées en 3. Le « + 3 » est exactement ce décalage vers le haut."
                explainWrong="Les deux droites ont la même inclinaison (le même 2 devant x). Ce qui change, c’est leur point de départ sur l’axe vertical."
                solved={originDone}
                onAnswered={() => setOriginDone(true)}
              />
              {originDone && (
                <KnowledgeBrick
                  id="ordonnee-origine"
                  variant="new"
                  lead="La hauteur à laquelle g coupe l’axe vertical — ce 3 que tu viens de repérer — porte un nom."
                  compact
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Les deux mots',
          done: sortDone,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="fonction-affine" variant="new" compact
                lead="Les deux droites que tu viens de comparer appartiennent à une même famille, qui porte un nom." />
              <KnowledgeBrick id="fonction-lineaire" variant="new" compact
                lead="Celle qui passe par l’origine en est un cas particulier." />
              <BatchChoiceQuestion
                intro={<p className="text-sm text-slate-600">Classe chaque écriture.</p>}
                rows={[
                  { id: 'r1', label: 'f(x) = 5x', options: ['linéaire', 'affine non linéaire', 'ni l’une ni l’autre'], correct: 0,
                    correction: 'Rien ne s’ajoute après le × 5 : c’est linéaire (et donc aussi affine).' },
                  { id: 'r2', label: 'f(x) = 5x − 2', options: ['linéaire', 'affine non linéaire', 'ni l’une ni l’autre'], correct: 1,
                    correction: 'Le « − 2 » décale la droite : affine, mais pas linéaire.' },
                  { id: 'r3', label: 'f(x) = x²', options: ['linéaire', 'affine non linéaire', 'ni l’une ni l’autre'], correct: 2,
                    correction: 'x² n’est pas de la forme ax + b : ce n’est ni linéaire ni affine.' },
                  { id: 'r4', label: 'f(x) = 7', options: ['linéaire', 'affine non linéaire', 'ni l’une ni l’autre'], correct: 1,
                    correction: 'C’est 0 × x + 7 : affine (constante), pas linéaire car b ≠ 0.' },
                ]}
                requires={['fonction-affine', 'fonction-lineaire']}
                feedback={({ allRight, nCorrect, total }) =>
                  allRight
                    ? <>Les quatre sont justes. Le test est toujours le même : peut-on l’écrire <MathText>{'$ax + b$'}</MathText> ?</>
                    : <>{nCorrect} sur {total}. Rappel : linéaire = <MathText>{'$ax$'}</MathText> (sans constante), affine = <MathText>{'$ax + b$'}</MathText>.</>
                }
                solved={sortDone}
                onAnswered={() => setSortDone(true)}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Le piège classique',
          done: bothDone,
          content: (
            <div className="space-y-3">
              <TapQuestion
              prompt={<>La fonction <MathText>{'$f(x) = 4x$'}</MathText> est-elle affine ?</>}
              options={[
                'Oui : c’est le cas b = 0, elle est linéaire ET affine',
                'Non : elle est linéaire, donc pas affine',
                'Non : il manque le + b',
              ]}
              correct={0}
              cols={1}
              requires={['fonction-affine', 'fonction-lineaire']}
              explain="4x s’écrit 4x + 0 : elle est bien de la forme ax + b. Les linéaires forment une famille À L’INTÉRIEUR des affines, comme les carrés parmi les rectangles."
              explainWrong="« Linéaire » ne s’oppose pas à « affine » : c’est un cas particulier d’affine, celui où la droite passe par l’origine."
                solved={bothDone}
                onAnswered={() => setBothDone(true)}
              />
              {bothDone && (
                <KnowledgeBrick
                  id="mem-lineaire-est-affine"
                  variant="new"
                  compact
                  lead="Retiens l’emboîtement que ce piège vient de mettre en évidence."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Tu sais reconnaître une famille à son graphique et à son
          écriture. Reste à faire l’inverse : retrouver <MathText>{'$a$'}</MathText> et{' '}
          <MathText>{'$b$'}</MathText> à partir de ce qu’on te donne.
        </KnowledgeSnapshot>
      )}
    />
  );
}
