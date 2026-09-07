import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';

import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EvolutionChain from '../components/EvolutionChain';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : la chaîne
 * (components/EvolutionChain.jsx).
 *
 * Step 1  la chaîne exacte de l'énoncé : 100 → ×1,20 → 120 → ×0,80 → 96.
 *         L'élève l'exécute, prédiction posée avant. La surprise est le
 *         cœur du module : on ne retombe pas sur 100.
 * Step 2  changer le taux commun (±10 %, ±25 %, ±50 %) : le manque est
 *         TOUJOURS là, et il grandit avec le taux. Ce n'est pas un accident
 *         de 20 %, c'est un phénomène.
 * Step 3  inverser l'ordre : baisse d'abord, hausse ensuite → même arrivée.
 *         Le résultat ne dépend pas de l'ordre, mais reste ≠ 100.
 * Step 4  la question qui ouvre la leçon, sans y répondre.
 *
 * Rien n'est appelé « produit des coefficients » avant le pied de module.
 */
const PAIRS = [
  { id: '10', label: '+10 % puis −10 %', rates: [0.1, -0.1] },
  { id: '25', label: '+25 % puis −25 %', rates: [0.25, -0.25] },
  { id: '50', label: '+50 % puis −50 %', rates: [0.5, -0.5] },
];

export default function Module01LePrixDuVelo() {
  const [rates, setRates] = useState([0.2, -0.2]);
  const [ran, setRan] = useState(false);
  const [pred, setPred] = useState(null);

  const [triedPairs, setTriedPairs] = useState(() => new Set());
  const [pairRates, setPairRates] = useState([0.1, -0.1]);

  const [order, setOrder] = useState('up-first');
  const [seenOrders, setSeenOrders] = useState(() => new Set(['up-first']));

  const [q4, setQ4] = useState(false);

  // Step 1 : il faut avoir réellement posé la chaîne +20 % / −20 %.
  const done1 = ran;
  const done2 = triedPairs.size >= 2;
  const done3 = seenOrders.size >= 2;
  const done4 = q4;

  const changeRates = (r, react) => {
    setRates(r);
    // La chaîne visée est celle de l'énoncé : +20 % puis −20 %. L'élève garde
    // ensuite la main sur les deux curseurs (règle : jamais figé).
    if (!ran && Math.abs(r[0] - 0.2) < 1e-9 && Math.abs(r[1] + 0.2) < 1e-9) { setRan(true); react?.(true); }
  };
  const pickPair = (p, react) => {
    setPairRates(p.rates);
    const next = new Set(triedPairs); next.add(p.id); setTriedPairs(next);
    if (!done2 && next.size >= 2) react?.(true);
  };
  const changeOrder = (o, react) => {
    setOrder(o);
    const next = new Set(seenOrders); next.add(o); setSeenOrders(next);
    if (!done3 && next.size >= 2) react?.(true);
  };

  const orderRates = order === 'up-first' ? [0.2, -0.2] : [-0.2, 0.2];

  const steps = [
    {
      num: 1,
      title: 'Une hausse, puis une baisse',
      subtitle: 'Le vélo coûte 100 €. Fais glisser la première évolution à +20 %, la seconde à −20 %.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="après +20 % puis −20 %, le vélo coûtera…"
            options={[
              { id: '100', label: 'Exactement 100 € — ça s’annule' },
              { id: 'moins', label: 'Moins de 100 €' },
              { id: 'plus', label: 'Plus de 100 €' },
            ]}
            value={pred} onChange={setPred} disabled={done1}
          />
          <EvolutionChain initial={100} rates={rates} onRatesChange={(r) => changeRates(r, kit.react)} maxSteps={2} />
          {done1 ? (
            <Feedback tone="ok">
              {pred === 'moins' ? 'Ta prédiction tenait' : pred ? 'Surprise' : 'Regarde l’arrivée'} :
              {' '}<strong>96 €</strong>, et non 100 €. Regarde le maillon du milieu : la baisse de 20 % s’applique à
              {' '}<strong>120 €</strong>, pas à 100 €. Elle retire 24 € quand la hausse n’en avait ajouté que 20.
              Le vélo a perdu <strong>4 %</strong> au total.
              {' '}<span className="text-slate-500">Continue à régler les deux curseurs : l’arrivée ne revient à 100 € que si l’un des taux est nul.</span>
            </Feedback>
          ) : null}
          {/* Le geste vient de montrer que la seconde évolution a porté sur
              120 € et non sur 100 € : c'est l'instant où « la base bouge »
              a un sens, et les étapes 2 à 4 vont s'appuyer dessus. */}
          {done1 && (
            <KnowledgeBrick
              id="base-mouvante"
              variant="new"
              lead={<>Tu viens de voir la baisse retirer <strong>24 €</strong> là où la hausse n’en avait ajouté que 20. Le pourcentage était le même — pas le nombre sur lequel il s’applique.</>}
            />
          )}
          {!done1 && (
            <Feedback tone="info">Choisis +20 % pour la première évolution et −20 % pour la seconde.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Est-ce un accident de 20 % ?',
      subtitle: 'Essaie deux autres couples « +x % puis −x % ».',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Couples de taux opposés">
            {PAIRS.map((p) => {
              const on = triedPairs.has(p.id);
              return (
                <button key={p.id} type="button" aria-pressed={on}
                  onClick={() => pickPair(p, kit.react)}
                  className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    on ? 'bg-violet-600 border-violet-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-violet-400'
                  }`}>
                  {p.label}
                </button>
              );
            })}
          </div>
          <EvolutionChain initial={100} rates={pairRates} onRatesChange={() => {}} editable={false} maxSteps={2} />
          {done2 ? (
            <Feedback tone="ok">
              Jamais 100 €. ±10 % laisse 99 €, ±25 % laisse 93,75 €, ±50 % laisse 75 €. Plus le taux est grand,
              plus la perte est grande — et elle est <strong>toujours une perte</strong>, jamais un gain.
              Ce n’est donc pas un accident : c’est une règle.
            </Feedback>
          ) : (
            <Feedback tone="info">Couples essayés : {triedPairs.size} sur 2.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Et si on inversait l’ordre ?',
      subtitle: 'La baisse d’abord, la hausse ensuite. Compare les deux arrivées.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Ordre des évolutions">
            {[
              { id: 'up-first', label: '+20 % puis −20 %' },
              { id: 'down-first', label: '−20 % puis +20 %' },
            ].map((o) => (
              <button key={o.id} type="button" aria-pressed={order === o.id}
                onClick={() => changeOrder(o.id, kit.react)}
                className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  order === o.id ? 'bg-sky-600 border-sky-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-sky-400'
                }`}>
                {o.label}
              </button>
            ))}
          </div>
          <EvolutionChain initial={100} rates={orderRates} onRatesChange={() => {}} editable={false} maxSteps={2} />
          {done3 ? (
            <Feedback tone="ok">
              Les deux chemins passent par des étapes différentes (120 € ou 80 €) mais arrivent au <strong>même prix</strong> :
              96 €. L’ordre ne change pas l’arrivée — indice sérieux sur la nature de l’opération qui combine
              deux évolutions.
            </Feedback>
          ) : null}
          {/* Les deux ordres viennent de donner la même arrivée : le constat
              est fait, on peut le nommer avant que l'étape 4 ne s'en serve. */}
          {done3 && (
            <KnowledgeBrick
              id="ordre-sans-importance"
              variant="new"
              compact
              lead={<>Deux chemins, deux valeurs intermédiaires différentes (120 € ou 80 €), et pourtant la même arrivée.</>}
            />
          )}
          {!done3 && (
            <Feedback tone="info">Essaie les deux ordres.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Pourquoi ça ne s’annule pas',
      done: done4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Pourquoi la baisse de 20 % ne compense-t-elle pas la hausse de 20 % ?"
            options={[
              'Parce que les deux pourcentages ne s’appliquent pas à la même valeur : +20 % sur 100, mais −20 % sur 120',
              'Parce qu’une baisse compte toujours plus qu’une hausse',
              'Parce qu’il faudrait faire la baisse en premier',
              'Parce que 20 % n’est pas un nombre rond',
            ]}
            correct={0} cols={1}
            requires={['base-mouvante', 'ordre-sans-importance', 'pourcentage']}
            explain="La hausse ajoute 20 € (20 % de 100), la baisse retire 24 € (20 % de 120). Chaque évolution se rapporte à la valeur courante, et celle-ci a changé entre les deux."
            explainWrong="Tu l’as vu à l’étape 3 : l’ordre n’y change rien, et à l’étape 2 le phénomène existe pour tous les taux. Ce qui compte, c’est que le second pourcentage porte sur une base déjà modifiée."
            solved={done4} onAnswered={() => setQ4(true)}
          />
          {/* Le fait est maintenant expliqué : il devient le repère que
              l'élève emporte dans toute la leçon. */}
          {done4 && (
            <KnowledgeBrick
              id="mem-ne-sannule-pas"
              variant="new"
              lead={<>C’est le chiffre à retenir de ce module — il reviendra à chaque chaîne.</>}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="Le prix du vélo" moduleSubtitle="Une hausse, une baisse, et 4 € qui manquent" estimatedTime="11 min"
      brief={{
        tag: 'Déclencheur', title: '100 → 120 → 96', tone: 'indigo',
        body: <p>Un vélo à 100 €. Le magasin augmente son prix de 20 % en juin, puis le baisse de 20 % en juillet. Fais tourner la chaîne toi-même et regarde l’arrivée.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Une piste.</strong> Les taux ne se sont pas additionnés, mais les coefficients 1,20 et 0,80 étaient bien
          là à chaque flèche — et 1,20 × 0,80 = 0,96. Module suivant : cette multiplication est-elle une coïncidence ?
        </KnowledgeSnapshot>
      )}
    />
  );
}
