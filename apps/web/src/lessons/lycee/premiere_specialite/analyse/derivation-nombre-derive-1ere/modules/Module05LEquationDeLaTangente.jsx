import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TangentBuilder from '../components/TangentBuilder';
import { CARRE, tangente, eq, fr } from '../components/derivUtils';

/**
 * Module 5 — ATELIER : écrire l'équation.
 *
 * Étape 1  les trois nombres, un par un : a, f(a), f′(a) — en a = 2 sur x².
 * Étape 2  le PIÈGE, montré avant d'être nommé : y = f′(a)x + f(a) donne
 *          y = 4x + 4, qui vaut 12 en x = 2 alors que la courbe y vaut 4. On
 *          fait constater l'écart, puis on pose la formule juste.
 * Étape 3  appliquer sur trois points, et vérifier en remettant x = a.
 *
 * CONNAISSANCES AVANT LA DEMANDE : le calcul est mené AVANT que la formule ne
 * soit posée (étape 2 : geste → constat → brique `formule-equation-tangente`
 * puis `methode-ecrire-tangente`), et l'étape 3 les exige légitimement.
 *
 * MANIPULATION JAMAIS GELÉE : le vérificateur de l'étape 2 reste pilotable.
 */
export default function Module05LEquationDeLaTangente() {
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2, setQ2] = useState(false);
  const [a2, setA2] = useState(2);
  const [m2, setM2] = useState(0);
  const [q3, setQ3] = useState(false);

  const done1 = q1a && q1b;
  const done2 = q2;
  const done3 = q3;

  const tan2 = tangente(CARRE, 2);   // y = 4x − 4

  const steps = [
    {
      num: 1,
      title: 'Les trois nombres',
      subtitle: 'On veut la tangente à f(x) = x² au point d’abscisse a = 2. Deux nombres à calculer.',
      done: done1,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<>D’abord l’ordonnée du point de contact : combien vaut <strong>f(2)</strong> ?</>}
            expected={4}
            parse={parseDec}
            display="4"
            requires={['notation-fx', 'image']}
            explain="f(2) = 2² = 4. Le point de contact est donc (2 ; 4)."
            explainFor={(n) => (n === 8 ? 'Tu as calculé le double : f(2) = 2², c’est-à-dire 2 × 2 = 4.' : null)}
            solved={q1a}
            onAnswered={() => setQ1a(true)}
          />
          <NumericQuestion
            prompt={<>Ensuite la pente : combien vaut <strong>f′(2)</strong>, sachant que f′(a) = 2a ?</>}
            expected={4}
            parse={parseDec}
            display="4"
            requires={['nombre-derive', 'methode-calculer-nombre-derive', 'derive-coefficient-directeur']}
            explain="f′(2) = 2 × 2 = 4. Ici f(2) et f′(2) valent tous deux 4 — c’est une coïncidence de ce point, pas une règle."
            explainFor={(n) => (n === 2 ? 'Attention : f′(a) = 2a, donc f′(2) = 2 × 2 = 4, et non a lui-même.' : null)}
            solved={q1b}
            onAnswered={() => setQ1b(true)}
          />
          {done1 && (
            <Feedback tone="ok">
              Point de contact <strong>(2 ; 4)</strong>, pente <strong>4</strong>. Il ne reste
              qu’à écrire la droite qui passe par ce point avec cette pente.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le piège du décalage',
      subtitle:
        'Une écriture tentante : « pente × x + ordonnée », donc y = 4x + 4. Vérifie-la : que vaut-elle en x = 2 ?',
      done: done2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            <p>
              Candidate : <strong className="font-mono">y = 4x + 4</strong>. Le point de contact
              est (2 ; 4). Une tangente doit <strong>passer par son point de contact</strong>.
            </p>
          </div>
          <NumericQuestion
            prompt={<>Que vaut <strong>4 × 2 + 4</strong> ?</>}
            expected={12}
            parse={parseDec}
            display="12"
            requires={['droite-equation-reduite']}
            explain="4 × 2 + 4 = 12. Or la courbe passe par 4 en x = 2 : cette droite rate le point de contact de 8 unités. Elle a la bonne pente, mais elle est trop haute."
            solved={done2}
            onAnswered={() => setQ2(true)}
          />
          {done2 && (
            <>
              <Feedback tone="ko">
                <strong>12 au lieu de 4.</strong> La droite y = 4x + 4 a bien la pente 4, mais elle
                ne passe pas par (2 ; 4) : ce n’est donc pas la tangente. Il manque le décalage qui
                la ramène sur le point.
              </Feedback>
              <KnowledgeBrick
                id="formule-equation-tangente"
                variant="new"
                lead={<>Voici l’écriture qui corrige exactement ce décalage.</>}
              />
              <KnowledgeBrick
                id="methode-ecrire-tangente"
                variant="new"
                compact
                lead={<>Et les quatre gestes, dans l’ordre.</>}
              />
              <KnowledgeBrick
                id="mem-equation-tangente"
                variant="new"
                lead={<>La seule chose à retenir par cœur de tout ce module.</>}
              />
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <p>
                  Avec la formule : y = 4(x − 2) + 4 = 4x − 8 + 4, soit{' '}
                  <strong className="font-mono">{eq(tan2)}</strong>. Vérification en x = 2 :
                  4 × 2 − 4 = <strong>4</strong> = f(2). ✔
                </p>
              </div>
              <TangentBuilder
                fn={CARRE}
                a={a2}
                onChangeA={setA2}
                m={m2}
                onChangeM={setM2}
                pasM={CARRE.pasPente}
                showVraie
              />
              <p className="text-[13px] text-slate-600">
                👉 Règle la pente sur 4 et déplace le point de contact : l’équation change avec le
                point, mais la droite passe toujours par lui.
              </p>
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Trois tangentes à écrire',
      done: done3,
      content: (
        <BatchChoiceQuestion
          intro={
            <p>
              Toujours f(x) = x², avec f′(a) = 2a. Associe chaque point de contact à l’équation
              réduite de sa tangente.
            </p>
          }
          rows={[
            {
              id: 't1',
              label: 'en a = 1',
              options: ['y = 2x − 1', 'y = 2x + 1', 'y = x + 1'],
              correct: 0,
              correction: 'f(1) = 1, f′(1) = 2 : y = 2(x − 1) + 1 = 2x − 1. En x = 1 : 2 − 1 = 1 ✔',
            },
            {
              id: 't2',
              label: 'en a = 3',
              options: ['y = 6x − 9', 'y = 6x + 9', 'y = 6x − 3'],
              correct: 0,
              correction: 'f(3) = 9, f′(3) = 6 : y = 6(x − 3) + 9 = 6x − 9. En x = 3 : 18 − 9 = 9 ✔',
            },
            {
              id: 't3',
              label: 'en a = 0',
              options: ['y = 0', 'y = x', 'y = 0x + 1'],
              correct: 0,
              correction: 'f(0) = 0, f′(0) = 0 : y = 0(x − 0) + 0 = 0. La tangente est l’axe des abscisses.',
            },
          ]}
          requires={['formule-equation-tangente', 'methode-ecrire-tangente', 'nombre-derive']}
          feedback={({ allRight }) =>
            allRight ? (
              <>
                Le réflexe qui ne trompe pas : remets x = a dans ton équation, tu dois retrouver
                f(a). Si tu tombes à côté, c’est le décalage qui manque.
              </>
            ) : (
              <>
                Vérifie chaque candidate en remplaçant x par a : la droite doit rendre f(a). Pour
                a = 1, y = 2x + 1 donne 3, alors que f(1) = 1 — elle rate le point.
              </>
            )
          }
          solved={done3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="L’équation de la tangente"
      moduleSubtitle="Trois nombres, une droite, une vérification"
      estimatedTime="12 min"
      brief={{
        tag: 'Atelier',
        title: 'L’écrire, pas seulement la placer',
        tone: 'indigo',
        body: (
          <p>
            Une tangente se dessine, mais elle s’écrit aussi. Trois nombres suffisent — et il y a
            un piège classique dans l’ordre où on les assemble.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Tu as tout.</strong> Le taux, le nombre dérivé, la pente de la tangente et son
          équation. Il reste à le prouver.
        </KnowledgeSnapshot>
      }
    />
  );
}
