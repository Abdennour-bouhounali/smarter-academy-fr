import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Histogram, groupIntoClasses, formatNumber } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { RECHARGES, BORNES_10 } from '../data';

/**
 * Module 3 — DÉCOUVERTE : effectifs et fréquences cumulés croissants, et le
 * polygone qui les porte.
 *
 * L'intérêt est utilitaire et doit être vécu comme tel : sans cumul, chaque
 * question « combien en dessous de tant ? » demande une addition de classes ;
 * avec le polygone, c'est une lecture. Le curseur de lecture (`readAt`) fait
 * la démonstration en direct.
 */
const CLASSES = groupIntoClasses(RECHARGES, BORNES_10);

export default function Module03LesFrequencesCumulees() {
  const [readAt, setReadAt] = useState(0.5);
  const [seen, setSeen] = useState(() => new Set([0.5]));
  const [q1, setQ1] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = q1;
  const done2 = seen.size >= 3;
  const done3 = q3;
  const done4 = q4;

  const change = (f, react) => {
    setReadAt(f);
    const next = new Set(seen); next.add(f); setSeen(next);
    if (!done2 && next.size >= 3) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Cumuler les effectifs',
      done: done1,
      content: (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th scope="col" className="border border-slate-200 bg-slate-100 px-2 py-1.5 text-xs font-bold text-slate-600">Classe</th>
                  {CLASSES.map((c, i) => (
                    <th key={i} scope="col" className="border border-slate-200 bg-slate-100 px-2 py-1.5 text-[13px] font-bold text-slate-600">
                      [{c.from} ; {c.to}{c.isLast ? ']' : '['}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" className="border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-bold text-slate-600">Effectif</th>
                  {CLASSES.map((c, i) => <td key={i} className="border border-slate-200 px-2 py-1.5 text-center font-mono tabular-nums text-slate-700">{c.count}</td>)}
                </tr>
                <tr>
                  <th scope="row" className="border border-slate-200 bg-sky-50 px-2 py-1.5 text-xs font-bold text-sky-700">Cumul croissant</th>
                  {CLASSES.map((c, i) => <td key={i} className="border border-slate-200 bg-sky-50 px-2 py-1.5 text-center font-mono tabular-nums font-bold text-sky-900">{c.cumulativeCount}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
          {/* Le tableau vient de faire apparaître la ligne « cumul » : c'est
              l'instant où le concept a un sens concret, avant de le nommer
              et de l'exiger dans la question qui suit. */}
          <KnowledgeBrick
            id="frequences-cumulees"
            variant="new"
            lead={<>La ligne « Cumul croissant » que tu viens de lire compte, à chaque borne, tous les individus situés en dessous.</>}
          />
          <NumericQuestion
            prompt="Combien de recharges ont duré moins de 40 minutes ?"
            expected={98} suffix="recharges"
            requires={['frequences-cumulees', 'effectif']}
            explain="4 + 39 + 55 = 98. C’est exactement le cumul croissant lu sous la classe [30 ; 40[ : le cumul répond d’un seul coup d’œil."
            explainFor={(n) => (n === 55
              ? '55 est l’effectif de la seule classe [30 ; 40[. « Moins de 40 min » inclut aussi les deux classes précédentes : 4 + 39 + 55 = 98.'
              : 'On additionne les effectifs de toutes les classes situées avant 40 : 4 + 39 + 55 = 98.')}
            solved={done1} onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Lire sur le polygone',
      subtitle: 'La courbe violette porte les fréquences cumulées. Déplace la hauteur de lecture : trois positions.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <Histogram classes={CLASSES} useDensity={false} showCumulative readAt={readAt} unit="min" barLabel="effectif" />
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <label htmlFor="cum-read" className="text-sm font-semibold text-slate-700">Hauteur de lecture (fréquence cumulée) :</label>
              <span className="font-mono font-black text-lg tabular-nums text-emerald-700">{formatNumber(readAt * 100, 0)} %</span>
            </div>
            <input id="cum-read" type="range" min={5} max={95} step={5}
              value={Math.round(readAt * 100)}
              onChange={(e) => change(Number(e.target.value) / 100, kit.react)}
              aria-label="Hauteur de lecture" aria-valuetext={`${formatNumber(readAt * 100, 0)} pour cent`}
              className="sa-slider accent-emerald-600" />
            <div className="flex justify-between text-[13px] font-mono text-slate-400 -mt-1 px-0.5">
              <span>5 %</span><span>50 %</span><span>95 %</span>
            </div>
          </div>
          {done2 ? (<Feedback tone="ok">
              Le polygone répond à <strong>toutes</strong> les questions « combien en dessous de… » sans
              recalculer : on entre par une hauteur, on ressort par une durée (ou l’inverse). Il part
              de <strong>0 %</strong> à la borne gauche de la première classe et atteint
              <strong> 100 %</strong> à la borne droite de la dernière — il ne redescend jamais.
              {' '}<span className="text-slate-500">Continue à déplacer la lecture.</span>
            </Feedback>) : null}
          {done2 && (
            <KnowledgeBrick
              id="polygone-cumule"
              variant="new"
              compact
              lead={<>Le déplacement que tu viens de faire, d’une hauteur vers une durée, est la lecture du polygone que tu construiras toi-même.</>}
            />
          )}
          {!done2 && (
            <Feedback tone="info">Positions de lecture essayées : {seen.size} sur 3.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Cumul croissant : les propriétés',
      done: done3,
      content: (
        <BatchChoiceQuestion
          intro={<p className="text-sm font-semibold text-slate-700">Pour chaque affirmation sur un polygone des fréquences cumulées croissantes, vrai ou faux ?</p>}
          rows={[
            { id: 'p1', label: 'Il peut redescendre', options: ['Vrai', 'Faux'], correct: 1, correction: 'Un cumul ne fait qu’augmenter : on ajoute des effectifs positifs.' },
            { id: 'p2', label: 'Il finit toujours à 100 %', options: ['Vrai', 'Faux'], correct: 0, correction: 'Toute la population est comptée à la dernière borne.' },
            { id: 'p3', label: 'Il commence à 0 % à la borne gauche de la 1re classe', options: ['Vrai', 'Faux'], correct: 0, correction: 'Aucun individu n’est en dessous de la plus petite valeur relevée.' },
            { id: 'p4', label: 'Sa hauteur au-dessus d’une borne donne l’effectif de la classe', options: ['Vrai', 'Faux'], correct: 1, correction: 'Elle donne le cumul de TOUTES les classes précédentes, pas une seule.' },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Les quatre.' : `${nCorrect} sur ${total}.`} Un polygone cumulé est
              <strong> croissant de 0 % à 100 %</strong> : c’est ce qui permet de le lire dans les deux sens.
            </Feedback>
          )}
          requires={['polygone-cumule', 'frequences-cumulees']}
          solved={done3} onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Lire dans l’autre sens',
      done: done4,
      content: (
        <TapQuestion
          prompt="Sur le polygone des recharges, on lit qu’à 50 min la fréquence cumulée vaut 81 %. Comment interpréter ce nombre ?"
          options={[
            '81 % des recharges ont duré moins de 50 min — donc 19 % ont duré 50 min ou plus',
            '81 recharges ont duré 50 min',
            '81 % des recharges ont duré plus de 50 min',
            'La recharge moyenne dure 81 % de 50 min',
          ]}
          correct={0} cols={1}
          requires={['polygone-cumule', 'frequence']}
          explain="Le cumul CROISSANT compte tout ce qui est en dessous du seuil : 162 recharges sur 200, soit 81 %. Le complément à 100 % donne les 19 % restantes."
          explainWrong="Le cumul croissant se lit « en dessous de » : à 50 min, 162 recharges sur 200 sont déjà comptées, soit 81 %. Ce n’est pas un effectif, c’est une fréquence."
          solved={done4} onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="Les fréquences cumulées" moduleSubtitle="Répondre d’un coup à « combien en dessous de… »" estimatedTime="13 min"
      brief={{
        tag: 'Découverte', title: 'Le polygone croissant', tone: 'sky',
        body: <p>Additionner les classes une par une à chaque question est fastidieux. Le cumul le fait une fois pour toutes, et son polygone se lit dans les deux sens.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Et les indicateurs ?</strong> On ne connaît plus les valeurs individuelles. Peut-on encore
          calculer une moyenne ? Module suivant : oui, mais ce sera une <em>estimation</em>.
        </KnowledgeSnapshot>
      )}
    />
  );
}
