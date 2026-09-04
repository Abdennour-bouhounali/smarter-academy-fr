import React, { useState } from 'react';
import { Pyramid, Waves } from 'lucide-react';
import { ContentModule, NumericQuestion, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { fourthProportional, roundTenth, twoRatiosAgree } from '../components/thalesUtils';

/**
 * Module 7 — LABORATOIRE : trois problèmes réels.
 *
 * Activity              la pyramide de Khéops (mesurer l'inaccessible), la
 *                       largeur d'une rivière, un contrôle de parallélisme sur
 *                       un chantier.
 * Mathematical objective reconnaître la configuration dans un énoncé qui ne la
 *                       dessine pas, et choisir entre théorème et réciproque.
 * Misconception ciblée   appliquer Thalès sans vérifier la configuration.
 * Transfer              le dernier problème inverse le sens : c'est le
 *                       parallélisme qui est la question.
 *
 * NOTE SUR LA VERSION PRÉ-KIT : le module Khéops exigeait une fraction
 * irréductible via une expression régulière sur du LaTeX, et son validateur
 * pouvait accepter une réponse non analysable. Ici, la réponse est une longueur
 * décimale — ce que demande réellement un énoncé de brevet.
 */
export default function Module07DeKheopsAuParking() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  // Khéops : bâton de 1,5 m → ombre 2 m ; ombre de la pyramide 187,4 m.
  const hauteurPyramide = fourthProportional({ a: 1.5, b: 2, c: null, d: 187.4 });

  const steps = [
    {
      num: 1,
      title: 'La hauteur de Khéops',
      subtitle: 'Thalès lui-même, dit-on, a mesuré la pyramide de cette façon.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-3">
            <p className="text-sm text-amber-900">
              Un bâton planté verticalement mesure <strong>1,5 m</strong> et projette une ombre de{' '}
              <strong>2 m</strong>. Au même instant, l’ombre de la pyramide mesure{' '}
              <strong>187,4 m</strong>. Le soleil étant le même, les deux triangles ont la même
              forme.
            </p>
          </div>
          <NumericQuestion
            prompt="Quelle est la hauteur de la pyramide, arrondie au dixième ?"
            suffix="m"
            expected={(n) => Math.abs(n - roundTenth(hauteurPyramide)) < 0.11}
            parse={(s) => Number(String(s).replace(',', '.'))}
            display={String(roundTenth(hauteurPyramide)).replace('.', ',')}
            width="w-28"
            explain={`Les rapports hauteur ÷ ombre sont égaux : 1,5 ÷ 2 = h ÷ 187,4. Donc h = (1,5 × 187,4) ÷ 2 ≈ ${String(roundTenth(hauteurPyramide)).replace('.', ',')} m.`}
            explainFor={(n) => (Math.abs(n - (2 * 187.4) / 1.5) < 1
              ? 'Produit en croix inversé. Le bâton est plus PETIT que son ombre (1,5 < 2), donc la pyramide doit être plus petite que son ombre de 187,4 m.'
              : null)}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'La largeur de la rivière',
      subtitle: 'Une configuration papillon sur le terrain.',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3">
            <p className="text-sm text-slate-700">
              Pour mesurer la largeur d’une rivière, un géomètre place un piquet A sur une berge et
              vise deux arbres B et C sur l’autre rive. Il obtient une configuration de Thalès avec
              AM = 12 m, AB = 30 m et MN = 8 m, où [MN] est parallèle à [BC].
            </p>
          </div>
          <NumericQuestion
            prompt="Quelle est la longueur BC, c’est-à-dire l’écart entre les deux arbres ?"
            suffix="m"
            expected={20}
            parse={(s) => Number(String(s).replace(',', '.'))}
            display="20"
            width="w-24"
            explain="AM/AB = MN/BC, soit 12/30 = 8/BC. Donc BC = (8 × 30) ÷ 12 = 20 m. Le rapport vaut 0,4 : BC doit être plus GRAND que MN, ce qui est cohérent."
            explainFor={(n) => (Math.abs(n - 3.2) < 0.2
              ? 'Produit en croix inversé : tu obtiens une longueur plus petite que MN, alors que BC est le grand segment.'
              : null)}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'La poutre est-elle bien parallèle ?',
      subtitle: 'Ici, c’est le parallélisme qui est la question.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3">
            <p className="text-sm text-slate-700">
              Un charpentier vérifie une poutre [MN] posée dans un cadre triangulaire. Il mesure
              AM = 45 cm, AB = 120 cm, AN = 60 cm et AC = 160 cm, les points étant alignés dans le
              même ordre.
            </p>
          </div>
          <TapQuestion
            prompt="La poutre est-elle parallèle à la base [BC] ?"
            options={[
              'Oui : 45/120 = 0,375 et 60/160 = 0,375, les rapports sont égaux',
              'Non : les longueurs ne sont pas les mêmes',
              'Oui : 120 − 45 = 75 et 160 − 60 = 100, la différence augmente régulièrement',
              'On ne peut pas conclure sans mesurer un angle',
            ]}
            correct={0}
            cols={1}
            explain="On calcule les deux rapports : 45 ÷ 120 = 0,375 et 60 ÷ 160 = 0,375. Ils sont égaux, et les points sont alignés dans le même ordre : d’après la réciproque du théorème de Thalès, la poutre est bien parallèle à la base."
            explainWrong="Ce sont les RAPPORTS qu’il faut comparer, pas les longueurs ni leurs différences. Ici les deux quotients valent 0,375."
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
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="De Khéops au chantier"
      moduleSubtitle="Mesurer l’inaccessible, vérifier l’invisible"
      estimatedTime="8 min"
      brief={{
        tag: 'Atelier',
        title: 'Thalès sur le terrain',
        tone: 'rose',
        body: (
          <p>
            Trois situations où personne ne dessine la configuration : c’est à toi de la voir, puis
            de choisir entre <strong>calculer</strong> et <strong>démontrer</strong>.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Pyramid, t: 'Mesurer', d: 'Une hauteur qu’on ne peut pas atteindre.', c: 'text-amber-600' },
            { icon: Waves, t: 'Vérifier', d: 'Un parallélisme qu’on ne peut pas voir.', c: 'text-sky-600' },
          ].map(({ icon: Icon, t, d, c }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className={`w-5 h-5 mb-1 ${c}`} aria-hidden="true" />
              <p className="font-semibold text-slate-800 text-sm">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={
        <Feedback tone="ok">
          <strong>Ce que Thalès permet.</strong> Mesurer ce qu’on ne peut pas atteindre, et
          démontrer un parallélisme sans jamais poser d’équerre — à condition d’avoir reconnu la
          configuration.
        </Feedback>
      }
    />
  );
}
