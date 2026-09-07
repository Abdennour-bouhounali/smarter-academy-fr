import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { formatPercent } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ReferenceLab from '../components/ReferenceLab';
import { enqueteTable } from '../data';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : changer la population
 * de référence (components/ReferenceLab.jsx).
 *
 * Le phénomène central de la leçon tient en une manipulation : l'élève fixe
 * un numérateur (une case), puis fait varier le DÉNOMINATEUR en choisissant
 * la référence. Le même effectif de 100 élèves donne 25 %, 50 % ou 62,5 %.
 * Aucune définition ne peut produire cette surprise ; le geste, si.
 */
const T = enqueteTable();

export default function Module01LaMemeCaseTroisNombres() {
  const [row, setRow] = useState('bus');
  const [col, setCol] = useState('2de');
  const [refMode, setRefMode] = useState('total');
  const [seenRefs, setSeenRefs] = useState(() => new Set(['total']));
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);

  const done1 = seenRefs.size >= 3;
  const done2 = q2;

  const changeRef = (r, react) => {
    setRefMode(r);
    const next = new Set(seenRefs); next.add(r); setSeenRefs(next);
    if (!done1 && next.size >= 3) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Une case, trois dénominateurs',
      subtitle: 'La case « bus × 2de » vaut 100 élèves. Essaie les trois références et regarde le pourcentage changer.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="100 élèves prennent le bus et sont en 2de. Cela fait-il un seul pourcentage, ou plusieurs ?"
            options={[
              { id: 'un', label: 'Un seul : 100 sur 400' },
              { id: 'plusieurs', label: 'Plusieurs, selon le groupe considéré' },
            ]}
            value={pred} onChange={setPred} disabled={done1}
          />
          <ReferenceLab table={T} row={row} col={col} refMode={refMode}
            onPick={(r, c) => { setRow(r); setCol(c); }}
            onRefChange={(r) => changeRef(r, kit.react)}
            rowsTitle="Transport" colsTitle="Niveau" />
          {done1 ? (
            <Feedback tone="ok">
              {pred === 'plusieurs' ? 'Ta prédiction tenait' : 'Surprise'} : les mêmes <strong>100 élèves</strong>
              {' '}valent <strong>{formatPercent(100 / 400, 0)}</strong> de l’ensemble,
              {' '}<strong>{formatPercent(100 / 200, 0)}</strong> parmi les élèves de 2de, et
              {' '}<strong>{formatPercent(100 / 160, 1)}</strong> parmi les usagers du bus. Le numérateur n’a
              pas bougé — c’est le <strong>dénominateur</strong>, c’est-à-dire le groupe dont on parle, qui
              change tout.
              {' '}<span className="text-slate-500">Continue à changer de case et de référence.</span>
            </Feedback>
          ) : (
            <Feedback tone="info">Références essayées : {seenRefs.size} sur 3.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'De quoi parle-t-on ?',
      done: done2,
      content: (
        <TapQuestion
          prompt="« 50 % des élèves de 2de prennent le bus. » Quel est le dénominateur de ce pourcentage ?"
          options={[
            'Les 200 élèves de 2de',
            'Les 400 élèves de l’enquête',
            'Les 160 usagers du bus',
            'Les 100 élèves de 2de qui prennent le bus',
          ]}
          correct={0} cols={1}
          explain="La phrase dit « des élèves de 2de » : ce groupe est la population de référence, donc le dénominateur. 100 ÷ 200 = 50 %. Rapporté aux 400 enquêtés on obtiendrait 25 %, et rapporté aux 160 usagers du bus 62,5 % — trois phrases différentes."
          explainWrong="Le groupe de référence est celui que la phrase désigne juste après « des » ou « parmi les » : ici les élèves de 2de, soit 200 personnes."
          solved={done2} onAnswered={() => setQ2(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="La même case, trois nombres" moduleSubtitle="Le dénominateur décide" estimatedTime="13 min"
      brief={{
        tag: 'Déclencheur', title: '100 élèves, trois pourcentages', tone: 'indigo',
        body: <p>Une enquête sur 400 lycéens. Une case du tableau vaut 100 élèves — et pourtant on peut en tirer plusieurs pourcentages, tous justes. Tu vas voir lequel dépend de quoi.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Les mots justes.</strong> Diviser par le total donne une fréquence <strong>conjointe</strong> ou
          <strong> marginale</strong> ; diviser par une ligne ou une colonne donne une fréquence
          <strong> conditionnelle</strong>. Module suivant : les nommer et savoir laquelle répond à quoi.
        </KnowledgeSnapshot>
      )}
    />
  );
}
