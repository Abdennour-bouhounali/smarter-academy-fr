import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RectangleDistribLab from '../components/RectangleDistribLab';
import {
  expr, ecrire, developper, valeur, confusionDemiDistribution,
} from '../components/litteral';

/**
 * Module 5 — MANIPULATION : développer un produit.
 *
 * Activity              faire varier la lettre et constater que l'aire du
 *                       rectangle entier égale toujours la somme des aires des
 *                       deux morceaux.
 * Mathematical objective k × (a + b) = k × a + k × b, quelle que soit la
 *                       valeur de la lettre.
 * Student action        choisir la valeur de la lettre.
 * Visual consequence    les deux morceaux changent de largeur, mais les deux
 *                       écritures affichées en bas donnent toujours le même
 *                       nombre.
 * Expected observation  « couper le rectangle ne change pas son aire ».
 * Misconception targeted ne distribuer que sur le premier terme
 *                       (3 × (n + 2) → 3n + 2), ce qui reviendrait à perdre
 *                       tout un morceau du rectangle — le dessin le rend
 *                       impossible à ignorer.
 *
 * PÉRIMÈTRE 5e : la distributivité SIMPLE seulement. Le facteur est toujours
 * un NOMBRE ; components/litteral.js lève si l'on tente de développer par une
 * expression contenant la lettre, ce qui serait la double distributivité —
 * objet officiel de 4e (lesson.config.js § exclude).
 */
const LARGEUR = expr(1, 2);   // n + 2
const K = 3;

export default function Module05LeRectangleQuOnCoupe() {
  const [n, setN] = useState(1);
  const [testees, setTestees] = useState(() => new Set([1]));
  const done1 = testees.size >= 3;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const tester = (v, react) => {
    setN(v);
    const next = new Set(testees);
    next.add(v);
    setTestees(next);
    if (next.size >= 3 && testees.size < 3) react?.(true);
  };

  const developpe = developper(K, LARGEUR);
  const faux = confusionDemiDistribution(K, LARGEUR);

  const steps = [
    {
      num: 1,
      title: 'Coupe le rectangle, change la lettre',
      subtitle: 'Les deux écritures du bas donnent-elles toujours le même nombre ? Essaie au moins trois valeurs.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <RectangleDistribLab
            k={K}
            e={LARGEUR}
            n={n}
            onN={(v) => tester(v, kit.react)}
            valeurs={[1, 2, 3, 4, 5]}
            ariaLabel="Choisir la valeur de la lettre"
          />
          {done1 ? (
            <Feedback tone="ok">
              À chaque valeur, les deux écritures donnent{' '}
              <strong>exactement le même nombre</strong>. C’est logique : couper le rectangle en
              deux ne lui retire aucun carreau. On peut donc calculer son aire{' '}
              <strong>d’un bloc</strong>, ou <strong>morceau par morceau</strong> — au choix.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {testees.size} valeur{testees.size > 1 ? 's' : ''} essayée{testees.size > 1 ? 's' : ''} sur 3.
              Compare bien les deux cadres du bas.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce que le découpage s’écrit',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="distributivite"
            variant="new"
            lead={<>Tu viens de vérifier sur cinq valeurs qu’un rectangle coupé garde son aire. Cette égalité a un nom, et elle s’écrit une fois pour toutes.</>}
          />
          <KnowledgeBrick id="mem-developper" variant="new" compact />
          <TapQuestion
            prompt={<>Comment se développe <span className="font-mono font-bold">4 × (n + 5)</span> ?</>}
            options={[
              ecrire(developper(4, expr(1, 5))),
              ecrire(confusionDemiDistribution(4, expr(1, 5))),
              '4n × 20',
              'n + 20',
            ]}
            correct={0}
            cols={2}
            requires={['distributivite', 'mem-developper']}
            explain={`Le facteur 4 va sur les DEUX morceaux : 4 × n = 4n et 4 × 5 = 20, donc ${ecrire(developper(4, expr(1, 5)))}. Vérification avec n = 2 : 4 × 7 = 28, et 4 × 2 + 20 = 28. ✓`}
            explainWrong={`Écrire ${ecrire(confusionDemiDistribution(4, expr(1, 5)))} reviendrait à n’avoir multiplié que le premier morceau — donc à perdre une partie du rectangle. Vérifie avec n = 2 : 4 × (2 + 5) = 28, alors que 4 × 2 + 5 ne donnerait que 13.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Vérifier un développement tout seul',
      subtitle: 'La méthode la plus sûre, et tu la connais déjà.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-3.5 text-sm text-slate-700">
            Un élève affirme que <strong className="font-mono">{ecrire(LARGEUR)}</strong> multiplié
            par {K} donne <strong className="font-mono">{ecrire(faux)}</strong>.
          </div>
          <TapQuestion
            prompt="Comment lui montrer que c’est faux, sans lui faire un cours ?"
            options={[
              `En essayant une valeur : avec n = ${n}, les deux écritures ne donnent pas le même nombre`,
              'En lui disant que ce n’est pas la bonne règle',
              'En comptant le nombre de lettres dans chaque écriture',
              'On ne peut pas : les deux écritures se valent',
            ]}
            correct={0}
            cols={1}
            requires={['distributivite', 'substituer']}
            explain={`Avec n = ${n} : ${K} × (${n} + 2) = ${K * (n + 2)}, alors que son écriture ${ecrire(faux)} donne ${valeur(faux, n)}. Un seul contre-exemple suffit à prouver qu’une égalité est fausse — et tu peux toujours en fabriquer un seul.`}
            explainWrong={`Affirmer « ce n’est pas la règle » ne convainc personne. La force du calcul littéral est ailleurs : une égalité doit être vraie pour TOUTES les valeurs, donc il suffit d’en trouver UNE qui la met en défaut. Avec n = ${n}, les deux écritures donnent ${K * (n + 2)} et ${valeur(faux, n)}.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Quatre développements',
      done: q4,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={<p className="text-sm text-slate-700">Quel est le développement correct ?</p>}
            rows={[
              {
                id: 'd1',
                label: '2 × (n + 4)',
                options: [ecrire(developper(2, expr(1, 4))), ecrire(confusionDemiDistribution(2, expr(1, 4))), '2n × 8'],
                correct: 0,
                correction: `2 × n = 2n et 2 × 4 = 8 : ${ecrire(developper(2, expr(1, 4)))}.`,
              },
              {
                id: 'd2',
                label: '5 × (2n + 1)',
                options: [ecrire(confusionDemiDistribution(5, expr(2, 1))), ecrire(developper(5, expr(2, 1))), '10n × 5'],
                correct: 1,
                correction: `5 × 2n = 10n et 5 × 1 = 5 : ${ecrire(developper(5, expr(2, 1)))}.`,
              },
              {
                id: 'd3',
                label: '3 × (4n + 2)',
                options: [ecrire(developper(3, expr(4, 2))), ecrire(confusionDemiDistribution(3, expr(4, 2))), '12n × 6'],
                correct: 0,
                correction: `3 × 4n = 12n et 3 × 2 = 6 : ${ecrire(developper(3, expr(4, 2)))}.`,
              },
            ]}
            requires={['distributivite', 'mem-developper']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Le geste est toujours le même : le facteur de devant se pose{' '}
                  <strong>sur chaque morceau de la parenthèse</strong>, sans en oublier aucun. Et
                  si tu doutes, une valeur au hasard tranche en dix secondes.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Le piège est toujours le même : oublier de multiplier le
                  SECOND morceau. Reviens au rectangle — si tu ne multiplies qu’un morceau, il
                  manque toute une partie de l’aire.
                </Feedback>
              )
            }
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Le rectangle qu’on coupe"
      moduleSubtitle="Couper ne change pas l’aire"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Une aire, deux façons de la compter',
        tone: 'indigo',
        body: (
          <p>
            Tu avais déjà découpé un produit pour calculer de tête, dans la leçon « Opérations ».
            Le même geste fonctionne avec une lettre — et il donne l’une des règles les plus utiles
            de tout le collège.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
