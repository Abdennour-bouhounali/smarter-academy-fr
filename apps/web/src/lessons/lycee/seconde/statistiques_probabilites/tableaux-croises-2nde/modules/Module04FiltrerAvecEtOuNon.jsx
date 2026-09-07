import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FilterLab from '../components/FilterLab';
import { ELEVES, CLASSES, ACTIVITES } from '../data';

/**
 * Module 4 — MANIPULATION : traduire une phrase en filtre logique.
 *
 * Le point dur est le OU : en français courant, « au judo ou à la danse »
 * s'entend souvent comme exclusif, et l'élève additionne les deux effectifs.
 * Le laboratoire montre les pastilles s'allumer UNE SEULE FOIS, et affiche le
 * calcul n(A) + n(B) − n(A et B). C'est la constatation qui corrige, pas la
 * règle énoncée.
 */
export default function Module04FiltrerAvecEtOuNon() {
  const [f, setF] = useState({ critClasse: '2de A', critActivite: 'judo', operateur: 'ET', negClasse: false, negActivite: false });
  const [pred, setPred] = useState(null);
  const [usedOu, setUsedOu] = useState(false);
  const [usedNon, setUsedNon] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = usedOu && usedNon;
  const done2 = q2;
  const done3 = q3;

  const update = (patch, react) => {
    const next = { ...f, ...patch };
    setF(next);
    let hit = false;
    if (next.operateur === 'OU' && next.critClasse && next.critActivite && !usedOu) { setUsedOu(true); hit = usedNon; }
    if ((next.negClasse || next.negActivite) && !usedNon) { setUsedNon(true); hit = hit || usedOu; }
    if (hit && !done1) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Composer un filtre',
      subtitle: 'Essaie un OU (avec les deux critères), puis un NON. Regarde les pastilles s’allumer.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="il y a 14 élèves en 2de A et 15 judokas. Combien sont « en 2de A OU au judo » ?"
            options={[
              { id: '29', label: '29, la somme' },
              { id: 'moins', label: 'Moins de 29' },
              { id: 'plus', label: 'Plus de 29' },
            ]}
            value={pred} onChange={setPred} disabled={done1}
          />
          <FilterLab eleves={ELEVES} classes={CLASSES} activites={ACTIVITES}
            {...f} onChange={(patch) => update(patch, kit.react)} />
          {done1 ? (
            <Feedback tone="ok">
              {pred === 'moins' ? 'Ta prédiction tenait' : 'Regarde le calcul affiché'} : « 2de A OU judo » retient
              <strong> 23</strong> élèves, pas 29 — car les <strong>6</strong> élèves de 2de A qui font du judo
              ne s’allument qu’une fois. En mathématiques, le <strong>OU est inclusif</strong> : il retient ceux qui
              vérifient l’un, l’autre, ou les deux. Le <strong>ET</strong> désigne exactement une case du tableau,
              et le <strong>NON</strong> le complémentaire.
              {' '}<span className="text-slate-500">Continue à composer des filtres.</span>
            </Feedback>
          ) : (
            <Feedback tone="info">
              {!usedOu ? 'Choisis une classe ET une activité, puis passe l’opérateur à OU. ' : ''}
              {!usedNon ? 'Essaie aussi un bouton NON.' : ''}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le OU inclusif',
      done: done2,
      content: (
        <NumericQuestion
          prompt="Il y a 19 danseurs et 20 élèves de 2de B ; 6 élèves de 2de B font de la danse. Combien d’élèves sont « en 2de B OU à la danse » ?"
          expected={33} suffix="élèves"
          explain="19 + 20 − 6 = 33. On additionne les deux groupes puis on retire l’intersection, comptée deux fois. C’est la formule des cardinaux : n(A ou B) = n(A) + n(B) − n(A et B)."
          explainFor={(n) => (n === 39
            ? '39 = 19 + 20 : tu as compté deux fois les 6 élèves qui vérifient les deux critères. Il faut retirer l’intersection : 39 − 6 = 33.'
            : n === 6
              ? '6 est l’effectif du ET (l’intersection), pas du OU. Le OU est plus large : 19 + 20 − 6 = 33.'
              : 'n(A ou B) = n(A) + n(B) − n(A et B) = 19 + 20 − 6 = 33.')}
          solved={done2} onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Le NON',
      done: done3,
      content: (
        <TapQuestion
          prompt="Sur 60 élèves, 20 sont en 2de B. Combien ne sont PAS en 2de B ?"
          options={[
            '40 : le complémentaire, soit 60 − 20',
            '20 : le même effectif',
            '80 : la somme',
            'On ne peut pas savoir sans le tableau complet',
          ]}
          correct={0} cols={2}
          explain="Le NON désigne le complémentaire dans la population : 60 − 20 = 40 élèves. Sa seule donnée nécessaire est l’effectif total et celui du groupe nié."
          explainWrong="Nier un critère revient à prendre tous les individus qui ne le vérifient pas : 60 − 20 = 40. Le tableau croisé complet n’est pas nécessaire."
          solved={done3} onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Filtrer avec ET, OU, NON" moduleSubtitle="Traduire une phrase en comptage" estimatedTime="13 min"
      brief={{
        tag: 'Manipulation', title: 'Le OU qui piège', tone: 'emerald',
        body: <p>« En 2de A ET au judo », « au judo OU à la danse », « pas en 2de B » : trois filtres, trois comptages différents. Le OU des mathématiques n’est pas celui de la conversation courante.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Dernier entraînement.</strong> Un tableau croisé se lit — mais il se lit aussi mal.
          Module suivant : ce qu’il dit vraiment, et ce qu’on lui fait dire à tort.
        </KnowledgeSnapshot>
      )}
    />
  );
}
