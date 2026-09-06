import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RatioLab from '../components/RatioLab';
import { RAMPES, sidesFor, roundTenth } from '../components/trigoUtils';

/**
 * Module 1 — DÉCLENCHEUR : deux rampes de tailles différentes.
 *
 * Activity              comparer l'inclinaison de deux rampes.
 * Mathematical objective une pente se mesure par un RAPPORT, pas par une
 *                       longueur : deux rampes de tailles différentes peuvent
 *                       avoir exactement la même inclinaison.
 * Student action        calculer les deux quotients hauteur ÷ base.
 * Mathematical state    deux triangles semblables.
 * Visual consequence    la petite rampe s'emboîte exactement dans la grande.
 * Expected observation  « les longueurs diffèrent, le rapport non ».
 * Misconception ciblée   « la plus grande rampe est la plus raide ».
 * Feedback              on compare les deux quotients côte à côte.
 * Formalization         aucun nom de fonction trigonométrique dans ce module.
 * Transfer              module 3 : l'invariance devient systématique.
 */
export default function Module01DeuxRampes() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const petite = sidesFor(RAMPES[0].alpha, RAMPES[0].hyp);
  const grande = sidesFor(RAMPES[1].alpha, RAMPES[1].hyp);

  const steps = [
    {
      num: 1,
      title: 'Laquelle est la plus raide ?',
      subtitle: 'Deux rampes d’accès, deux tailles.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            {RAMPES.map((r) => (
              <div key={r.id} className="space-y-1">
                <p className="text-xs font-semibold text-slate-600 text-center">{r.label}</p>
                <RatioLab alpha={r.alpha} hyp={r.hyp} showRatios={false} disabled
                  ariaLabel={`${r.label} : rampe inclinée`} />
              </div>
            ))}
          </div>
          <TapQuestion
            prompt="À vue d’œil, laquelle de ces deux rampes est la plus raide ?"
            options={[
              'Elles ont la même inclinaison — seule la taille change',
              'La rampe B, parce qu’elle est plus longue',
              'La rampe A, parce qu’elle est plus courte',
              'Impossible à dire sans mesurer les angles',
            ]}
            correct={0}
            cols={1}
            explain="Les deux rampes forment le même angle avec le sol. La plus grande n’est pas plus raide : elle est simplement plus longue, et elle monte donc plus haut. Tu vas le vérifier par le calcul à l’étape suivante."
            explainWrong="La longueur ne dit rien de l’inclinaison : une rampe deux fois plus longue au même angle monte deux fois plus haut, mais grimpe pareil."
            requires={['triangle-rectangle']}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le vérifier par le calcul',
      subtitle: 'La pente, c’est hauteur ÷ base.',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3">
            <p className="text-sm text-slate-700">
              Rampe A : elle monte de <strong>{Math.round(petite.opp)}</strong> pour une base de{' '}
              <strong>{Math.round(petite.adj)}</strong>.<br />
              Rampe B : elle monte de <strong>{Math.round(grande.opp)}</strong> pour une base de{' '}
              <strong>{Math.round(grande.adj)}</strong>.
            </p>
          </div>
          <NumericQuestion
            prompt={`Calcule la pente de la rampe A : ${Math.round(petite.opp)} ÷ ${Math.round(petite.adj)}, arrondi au centième.`}
            expected={(n) => Math.abs(n - Math.round(petite.opp) / Math.round(petite.adj)) < 0.011}
            parse={(s) => Number(String(s).replace(',', '.'))}
            display={String(Math.round((Math.round(petite.opp) / Math.round(petite.adj)) * 100) / 100).replace('.', ',')}
            width="w-24"
            explain={`${Math.round(petite.opp)} ÷ ${Math.round(petite.adj)} ≈ ${String(Math.round((Math.round(petite.opp) / Math.round(petite.adj)) * 100) / 100).replace('.', ',')}. Fais le même calcul pour la rampe B : tu obtiendras le même nombre.`}
            requires={['quotient']}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que mesure ce nombre',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-emerald-50 border-2 border-emerald-200 p-3">
            <p className="text-sm text-emerald-900">
              Les deux rampes donnent le même quotient : environ{' '}
              <strong>{String(roundTenth((grande.opp / grande.adj) * 10) / 10).replace('.', ',')}</strong>.
              Pourtant aucune de leurs longueurs n’est identique.
            </p>
          </div>
          <TapQuestion
            prompt="De quoi dépend ce quotient ?"
            options={[
              'De l’angle de la rampe uniquement',
              'De la longueur de la rampe',
              'De la hauteur atteinte',
              'De la taille du bâtiment',
            ]}
            correct={0}
            cols={1}
            explain="Deux rampes de tailles différentes mais de même angle donnent le même quotient. Ce nombre ne mesure donc pas une longueur : il mesure l’ANGLE. C’est toute la trigonométrie, et c’est ce que tu vas explorer dans les modules suivants."
            explainWrong="Les deux rampes ont des longueurs et des hauteurs différentes, et pourtant le même quotient. La seule chose qu’elles ont en commun, c’est leur angle."
            requires={['quotient']}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        {q3 && (
          <KnowledgeBrick
            id="pente-quotient"
            variant="new"
            lead="Ce que tu viens de constater sur les deux rampes vaut bien au-delà d’elles."
          />
        )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Deux rampes"
      moduleSubtitle="Quand deux tailles donnent la même pente"
      estimatedTime="8 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Laquelle grimpe le plus ?',
        tone: 'indigo',
        body: (
          <p>
            Deux rampes d’accès, l’une bien plus longue que l’autre. Le calcul va montrer qu’un
            certain nombre les rend <strong>identiques</strong> — et ce nombre ne dépend d’aucune
            longueur.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-3 flex gap-3 items-start">
          <TrendingUp className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-indigo-900">
            Une pente se mesure par un <strong>rapport</strong> : de combien on monte pour une
            distance donnée. C’est ainsi que sont notés les panneaux routiers (« 8 % »).
          </p>
        </div>
      }
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Un quotient mesure la raideur. Reste à savoir de
          quels côtés on parle : c’est le module suivant.
        </KnowledgeSnapshot>
      )}
    />
  );
}
