import React, { useState } from 'react';
import { PenLine } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseDec } from '@smarter-academy/core';
import { hypotenuse, fr, arrondi } from '../components/pythagore4e';

/**
 * Module 4 — MANIPULATION : de l'égalité au nombre.
 *
 * Activity              écrire l'égalité pour un triangle donné, puis la
 *                       calculer jusqu'à la longueur.
 * Mathematical objective la méthode en trois temps : écrire l'égalité,
 *                       calculer le carré, extraire la racine.
 * Student action        choisir l'écriture correcte, puis saisir les nombres.
 * Mathematical state    les deux côtés connus ; le carré et la racine sont
 *                       CALCULÉS.
 * Misconception targeted « a + b = c » — testée explicitement, chiffrée.
 *                       Et « oublier la racine », piégée à l'étape 3.
 * Formalization         la méthode est posée en brique après avoir été suivie
 *                       une première fois.
 */
export default function Module04EcrirePuisCalculer() {
  const [pred, setPred] = useState(null);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const h = hypotenuse(3, 4);
  const h2 = hypotenuse(5, 12);
  const h3 = hypotenuse(4, 5); // ne tombe pas juste : √41

  const steps = [
    {
      num: 1,
      title: 'Quelle égalité écrire ?',
      subtitle: 'Un triangle rectangle a deux côtés de 3 et 4. On cherche l’hypoténuse, appelée c.',
      done: q1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="À vue de nez, l’hypoténuse mesure-t-elle plus ou moins que 7 ?"
            options={[
              { id: 'moins', label: 'Moins de 7' },
              { id: 'sept', label: 'Exactement 7' },
              { id: 'plus', label: 'Plus de 7' },
            ]}
            value={pred}
            onChange={setPred}
          />
          <TapQuestion
            prompt="Quelle égalité traduit le théorème pour ce triangle ?"
            options={['3² + 4² = c²', '3 + 4 = c', '3² + 4² = c', '(3 + 4)² = c²']}
            correct={0}
            cols={2}
            requires={['theoreme-pythagore']}
            explain="Le théorème relie les CARRÉS des trois côtés. Les deux membres sont donc des carrés : 3² + 4² d’un côté, c² de l’autre."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <Feedback tone="info">
              L’égalité s’écrit avant tout calcul. C’est elle qui dit ce qu’on cherche.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Calcule le carré',
      done: q2,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt="Combien vaut 3² + 4² ?"
            expected={h.carre}
            requires={['theoreme-pythagore']}
            explain="3² = 9 et 4² = 16, donc 9 + 16 = 25. C’est le carré de l’hypoténuse, pas encore sa longueur."
            explainFor={(n) => {
              if (n === 7) return 'Tu as additionné les LONGUEURS (3 + 4). Le théorème additionne leurs carrés : 9 + 16.';
              if (n === 49) return 'Tu as calculé (3 + 4)². Or on additionne 3² et 4² séparément : 9 + 16 = 25.';
              if (n === 12) return 'Tu as multiplié 3 × 4. Le théorème additionne les carrés.';
              return null;
            }}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le piège de la dernière étape',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3.5 text-center font-mono text-sm">
            <div className="text-slate-600">3² + 4² = c²</div>
            <div className="font-black text-emerald-900">25 = c²</div>
          </div>
          <NumericQuestion
            prompt="Combien mesure l’hypoténuse ?"
            expected={h.valeur}
            parse={parseDec}
            requires={['theoreme-pythagore', 'racine-carree']}
            explain="25 est le CARRÉ de l’hypoténuse. Il reste à trouver le nombre dont le carré vaut 25 : c’est 5. Et 5 est bien plus petit que 3 + 4 = 7."
            explainFor={(n) => {
              if (n === 25) return '25, c’est c², pas c. Cherche le nombre dont le carré vaut 25.';
              if (n === 7) return '3 + 4 = 7 : c’est le piège. Le calcul exact donne 5, ce qui est plus court — l’hypoténuse est toujours plus courte que la somme des deux autres côtés.';
              if (n === 12.5) return 'La moitié de 25. La racine carrée de 25, c’est le nombre qui multiplié par lui-même donne 25.';
              return null;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="methode-calculer"
              variant="new"
              lead="Les trois temps que tu viens de suivre forment une méthode."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Quand ça ne tombe pas juste',
      done: q4,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Un triangle rectangle a deux côtés de 4 et 5. Son hypoténuse au carré vaut{' '}
            <strong>{h3.carre}</strong>. Or {h3.encadrement.bas}² = {h3.encadrement.bas ** 2} et{' '}
            {h3.encadrement.haut}² = {h3.encadrement.haut ** 2}.
          </p>
          <TapQuestion
            prompt="Que peut-on dire de cette hypoténuse ?"
            options={[
              `Elle est comprise entre ${h3.encadrement.bas} et ${h3.encadrement.haut}`,
              `Elle vaut exactement ${h3.carre}`,
              'Elle vaut exactement 9',
              'On ne peut rien en dire',
            ]}
            correct={0}
            cols={1}
            requires={['methode-calculer', 'encadrer-une-racine']}
            explain={`${h3.carre} est entre ${h3.encadrement.bas ** 2} et ${h3.encadrement.haut ** 2}, donc sa racine carrée est entre ${h3.encadrement.bas} et ${h3.encadrement.haut}. À la calculatrice : environ ${fr(arrondi(h3.valeur, 2))}.`}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              La plupart des triangles rectangles ont une hypoténuse qui ne tombe pas juste.
              Les triplets comme 3-4-5 ou 5-12-13 sont l’exception, pas la règle.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Écrire, puis calculer"
      moduleSubtitle="Trois temps, dans cet ordre"
      estimatedTime="11 min"
      brief={{
        tag: '🎬 Mission 04',
        title: 'De l’égalité au nombre',
        tone: 'indigo',
        body: (
          <>
            Tu sais que les carrés s’additionnent. Reste à en tirer une longueur —
            et <strong>une étape s’oublie très souvent</strong>.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5">
          <PenLine className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="text-sm text-emerald-900">
            On écrit d’abord l’égalité, on calcule ensuite, et on n’oublie pas la dernière
            marche.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
