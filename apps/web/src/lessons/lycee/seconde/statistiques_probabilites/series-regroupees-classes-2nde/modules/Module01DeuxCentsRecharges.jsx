import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ClassWidthLab from '../components/ClassWidthLab';
import { RECHARGES, AMPLITUDES } from '../data';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : régler l'amplitude
 * (components/ClassWidthLab.jsx).
 *
 * Step 1  LE GESTE D'ABORD (règle : le module s'ouvre sur la manipulation,
 *         jamais sur une question) : glisser l'amplitude de 2 à 40 min. À
 *         2 min c'est un peigne illisible ; à 40 min il ne reste que deux
 *         barres et la forme a disparu ; vers 10 min la distribution apparaît.
 *         Les 200 données brutes sont dessinées sous les barres — l'élève voit
 *         d'emblée qu'aucune valeur ne se répète.
 * Step 2  ce que le geste a résolu : pourquoi un tableau d'effectifs
 *         classique, sur ces données, n'apprendrait rien.
 * Step 3  ce que le regroupement coûte : le détail individuel est perdu.
 *
 * Le regroupement est ainsi DÉCOUVERT comme la solution d'un problème que
 * l'élève a d'abord constaté, pas présenté comme une technique à appliquer.
 */
export default function Module01DeuxCentsRecharges() {
  const [amp, setAmp] = useState(10);
  const [seen, setSeen] = useState(() => new Set([10]));
  const [pred, setPred] = useState(null);
  const [q1, setQ1] = useState(false);
  const [q3, setQ3] = useState(false);

  // Il faut avoir vu le trop fin ET le trop large : c'est la comparaison des
  // deux extrêmes qui fait comprendre qu'une amplitude est un CHOIX.
  const seenFine = [...seen].some((a) => a <= 2);
  const seenLarge = [...seen].some((a) => a >= 40);
  const done1 = q1;
  const done2 = seenFine && seenLarge;
  const done3 = q3;

  const change = (a, react) => {
    setAmp(a);
    const next = new Set(seen); next.add(a); setSeen(next);
    const fine = [...next].some((x) => x <= 2);
    const large = [...next].some((x) => x >= 40);
    if (!done2 && fine && large) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Découpe l’axe en tranches',
      subtitle: 'Deux cents durées de recharge, dessinées en bas. Fais glisser l’amplitude jusqu’à 2 min, puis jusqu’à 40 min.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="quelle largeur de tranche donnera l’image la plus utile ?"
            options={[
              { id: 'fine', label: 'La plus fine possible (2 min)' },
              { id: 'moyenne', label: 'Une largeur intermédiaire' },
              { id: 'large', label: 'La plus large possible (40 min)' },
            ]}
            value={pred} onChange={setPred} disabled={done2}
          />
          <ClassWidthLab values={RECHARGES} width={amp} onWidthChange={(a) => change(a, kit.react)}
            amplitudes={AMPLITUDES} min={10} max={90} unit="min" />
          {done2 ? (
            <Feedback tone="ok">
              {pred === 'moyenne' ? 'Ta prédiction tenait' : pred ? 'Regarde les trois cas' : 'Voilà'} : à
              <strong> 2 min</strong>, 40 tranches presque vides — on a remplacé une liste illisible par un peigne
              illisible. À <strong>40 min</strong>, deux barres : la forme a totalement disparu. Autour de
              <strong> 10 min</strong>, la distribution apparaît : un pic, puis une décroissance vers la droite.
              L’amplitude est un <strong>choix</strong>, et ce choix change ce qu’on voit.
              {' '}<span className="text-slate-500">Continue à la régler.</span>
            </Feedback>
          ) : null}
          {/* Le geste vient de fabriquer les tranches et de montrer qu'elles
              résument la série : on peut les nommer, dire ce qu'elles coûtent,
              puis dire comment se règle leur largeur — les trois avant la
              première question, à l'étape 2. */}
          {done2 && (
            <KnowledgeBrick
              id="regroupement-classes"
              variant="new"
              lead={<>Tu viens de remplacer 200 durées toutes différentes par une poignée de tranches, et de voir une forme apparaître.</>}
            />
          )}
          {done2 && (
            <KnowledgeBrick
              id="vocab-classe-amplitude"
              variant="new"
              compact
              lead={<>Les tranches que tu règles, et le nombre que tu fais glisser, portent chacun un nom.</>}
            />
          )}
          {done2 && (
            <KnowledgeBrick
              id="choix-amplitude"
              variant="new"
              compact
              lead={<>Le peigne de 2 min et les deux barres de 40 min viennent de te montrer les deux façons de rater ce réglage.</>}
            />
          )}
          {!done2 && (
            <Feedback tone="info">
              {!seenFine ? 'Essaie l’amplitude la plus fine (2 min). ' : ''}
              {!seenLarge ? 'Puis la plus large (40 min).' : ''}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Pourquoi il fallait regrouper',
      subtitle: 'Les 200 durées sont enregistrées au centième de minute près.',
      done: done1,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Les 12 premières durées enregistrées (min)</p>
            <p className="font-mono text-sm text-slate-700 leading-relaxed">
              {RECHARGES.slice(0, 12).map((v) => v.toFixed(2)).join(' · ')} …
            </p>
            <p className="text-xs text-slate-500 mt-2">
              200 valeurs au total, dont <strong>200 valeurs distinctes</strong> : aucune ne se répète.
            </p>
          </div>
          <TapQuestion
            prompt="On voulait faire le tableau des effectifs de cette série, comme au collège. Que donnerait-il ?"
            options={[
              '200 lignes d’effectif 1 : il n’apprendrait rien',
              'Un tableau clair avec quelques lignes',
              'Un tableau impossible à construire',
              'Le même tableau que pour une série de notes',
            ]}
            correct={0} cols={1}
            requires={['regroupement-classes', 'serie-statistique', 'effectif']}
            explain="Sur une grandeur CONTINUE mesurée finement, deux valeurs coïncident presque jamais. Le tableau d’effectifs classique se réduit à la liste des données : il ne résume rien. C’est exactement le problème que ton découpage vient de résoudre."
            explainWrong="Chaque durée n’apparaît qu’une fois : le tableau aurait autant de lignes que d’individus. C’est ce qui distingue une variable continue d’une variable discrète comme une note sur 20."
            solved={done1} onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce qu’on gagne, ce qu’on perd',
      done: done3,
      content: (
        <TapQuestion
          prompt="Une fois la série regroupée en classes de 10 min, que sait-on encore d’une recharge donnée ?"
          options={[
            'Seulement la tranche dans laquelle elle tombe, plus sa durée exacte',
            'Sa durée exacte, comme avant',
            'Rien du tout',
            'Sa durée exacte et son rang',
          ]}
          correct={0} cols={1}
          requires={['regroupement-classes', 'vocab-classe-amplitude', 'indicateur-stat']}
          explain="Le regroupement rend la série lisible, mais il PERD le détail : « 64 recharges entre 40 et 50 min » ne dit pas si l’une durait 41 ou 49 min. C’est pourquoi les indicateurs calculés à partir des classes seront des ESTIMATIONS."
          explainWrong="Les données brutes existent toujours, mais le tableau regroupé ne les contient plus : il ne retient que le nombre d’individus par tranche. C’est le prix de la lisibilité."
          solved={done3} onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="Deux cents recharges" moduleSubtitle="Quand la liste ne dit plus rien" estimatedTime="12 min"
      brief={{
        tag: 'Déclencheur', title: 'Découpe l’axe toi-même', tone: 'indigo',
        body: <p>Une borne de recharge a enregistré 200 durées, toutes différentes. Fais glisser la largeur des tranches et regarde la forme de la série apparaître — puis disparaître.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Les mots justes.</strong> Ces tranches s’appellent des <strong>classes</strong>, leur largeur
          l’<strong>amplitude</strong>. Module suivant : le tableau et le diagramme qui vont avec — et un piège
          sur la hauteur des barres.
        </KnowledgeSnapshot>
      )}
    />
  );
}
