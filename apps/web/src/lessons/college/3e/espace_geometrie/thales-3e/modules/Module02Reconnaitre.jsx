import React, { useState } from 'react';
import { ScanSearch } from 'lucide-react';
import { ContentModule, BatchChoiceQuestion, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ThalesLab from '../components/ThalesLab';
import { FIGURES } from '../components/thalesUtils';

/**
 * Module 2 — DÉCOUVERTE : reconnaître la configuration.
 *
 * Activity              trier des figures selon qu'elles forment ou non une
 *                       configuration de Thalès.
 * Mathematical objective la configuration exige DEUX conditions : des points
 *                       alignés depuis un même sommet, et des droites
 *                       parallèles. L'une sans l'autre ne suffit pas.
 * Misconception ciblée   « il y a un petit triangle dans un grand, donc c'est
 *                       Thalès ». Deux figures du tri sont précisément dans ce
 *                       cas sans que la configuration soit valide.
 * Formalization         le vocabulaire (configuration triangle / papillon) est
 *                       posé ici, avant le travail sur les rapports.
 */
export default function Module02Reconnaitre() {
  const [batch, setBatch] = useState(false);
  const [q2, setQ2] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Les deux configurations',
      subtitle: 'Le papillon compte aussi.',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600 text-center">
                Configuration « triangle » — M entre A et B
              </p>
              <ThalesLab figure={FIGURES.triangle} k={0.4} mode="parallel" disabled
                showRatios={false}
                ariaLabel="Configuration triangle : M entre A et B" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600 text-center">
                Configuration « papillon » — M de l’autre côté de A
              </p>
              <ThalesLab figure={FIGURES.triangle} k={-0.45} mode="parallel" disabled
                showRatios={false} allowPapillon
                ariaLabel="Configuration papillon : M au-delà de A" />
            </div>
          </div>
          <TapQuestion
            prompt="Qu’ont en commun ces deux figures ?"
            options={[
              'Deux droites sécantes en A, et deux parallèles qui les coupent',
              'Un petit triangle entièrement contenu dans un grand',
              'Deux triangles de même taille',
              'Trois points alignés seulement',
            ]}
            correct={0}
            cols={1}
            explain="Dans les deux cas : deux droites se coupent en A, et deux droites parallèles ((MN) et (BC)) viennent les couper. Que M soit entre A et B ou de l’autre côté ne change rien — le papillon est une configuration de Thalès à part entière."
            explainWrong="Le « petit triangle dans le grand » ne décrit que le premier cas. Dans le papillon, les deux triangles sont opposés par le sommet A, et pourtant Thalès s’applique."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Configuration ou pas ?',
      subtitle: 'Deux conditions, toutes les deux nécessaires.',
      done: batch,
      content: (
        <BatchChoiceQuestion
          intro={
            <p className="text-sm text-slate-700">
              Pour chaque situation, dis si le théorème de Thalès peut s’appliquer.
            </p>
          }
          rows={[
            {
              id: 'f1',
              label: 'Deux droites sécantes en A, coupées par deux droites parallèles',
              options: ['Thalès s’applique', 'Non applicable'],
              correct: 0,
              correction: 'Les deux conditions sont réunies : un point d’intersection commun, et le parallélisme. C’est la configuration de base.',
            },
            {
              id: 'f2',
              label: 'Deux droites sécantes en A, coupées par deux droites NON parallèles',
              options: ['Thalès s’applique', 'Non applicable'],
              correct: 1,
              correction: 'Sans parallélisme, aucun rapport ne se conserve. C’est la condition qu’on ne peut jamais sauter — et tu le vérifieras toi-même au module 5.',
            },
            {
              id: 'f3',
              label: 'Un petit triangle posé à côté d’un grand, sans sommet commun',
              options: ['Thalès s’applique', 'Non applicable'],
              correct: 1,
              correction: 'Il manque le sommet commun : les deux droites doivent se couper en un même point. Deux triangles côte à côte ne forment pas une configuration de Thalès.',
            },
            {
              id: 'f4',
              label: 'Configuration papillon : M et N de l’autre côté du sommet A',
              options: ['Thalès s’applique', 'Non applicable'],
              correct: 0,
              correction: 'Le papillon est bien une configuration de Thalès : les mêmes rapports s’écrivent, et de la même façon.',
            },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'info'}>
              {allRight
                ? 'Tu vérifies les deux conditions à chaque fois : un sommet commun, et des droites parallèles.'
                : `${nCorrect} sur ${total}. Pose-toi toujours les deux questions : les droites se coupent-elles en un même point ? Y a-t-il bien deux parallèles ?`}
            </Feedback>
          )}
          solved={batch}
          onAnswered={() => setBatch(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Reconnaître la configuration"
      moduleSubtitle="Deux conditions, jamais une seule"
      estimatedTime="9 min"
      brief={{
        tag: 'Découverte',
        title: 'Avant de calculer, reconnaître',
        tone: 'sky',
        body: (
          <p>
            Le théorème ne s’applique pas partout. Avant tout calcul, il faut vérifier{' '}
            <strong>deux</strong> choses — et savoir reconnaître la configuration même quand elle
            est retournée.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3 flex gap-3 items-start">
          <ScanSearch className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-sky-900">
            Les deux conditions : <strong>(1)</strong> deux droites qui se coupent en un même point,
            <strong> (2)</strong> deux droites parallèles qui les coupent toutes les deux.
          </p>
        </div>
      }
      steps={steps}
      footer={
        <Feedback tone="ok">
          <strong>Retenons.</strong> Une configuration de Thalès, c’est deux droites sécantes en un
          point A, coupées par deux droites parallèles. Elle prend deux formes : le{' '}
          <strong>triangle</strong> et le <strong>papillon</strong>. Les deux se traitent de la même
          façon.
        </Feedback>
      }
    />
  );
}
