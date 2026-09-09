import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MachineLab from '../components/MachineLab';
import {
  LAB_PAS_ADDITIFS, LAB_PAS_MULTIPLICATIFS,
  etatLab, missionLabRemplie, parseNombre, fr,
} from '../components/suitesUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : la machine à deux
 * boutons (components/MachineLab.jsx).
 *
 * Étape 1  faire tourner les deux usines et lire leurs deux piles : elles
 *          fabriquent des nombres de deux façons différentes.
 * Étape 2  LA MISSION — régler les deux machines pour qu'elles donnent les
 *          mêmes DEUX premiers nombres, puis appuyer encore et voir diverger.
 * Étape 3  ce qui est resté constant : pas le nombre produit, mais le geste.
 * Étape 4  la question qui ouvre le module 2 — comment distinguer les deux
 *          familles quand on ne voit que la liste de nombres ?
 *
 * DEUX TERMES, ET PAS TROIS. La consigne dit ce qui est MATHÉMATIQUEMENT VRAI.
 * Il n'existe aucun réglage qui fasse coïncider trois termes : u0 + 2r = u0q²
 * avec u0 + r = u0q donne u0(q − 1)² = 0, donc q = 1 — des machines qui ne
 * bougent pas. Le balayage est dans common/analysis/sequences.test.js, et la
 * conséquence pédagogique est plus forte que la consigne d'origine : DEUX
 * termes identiques ne suffisent JAMAIS, la séparation est inévitable.
 *
 * Rien ne s'appelle « arithmétique », « géométrique » ni « raison » avant le
 * module 3 : le module se termine en DEMANDANT ce que les suivants nommeront
 * (§6bis.1). Les mots que ce module POSE sont ceux dont il a besoin pour
 * parler : rang, terme, et les deux façons de fabriquer.
 *
 * CONNAISSANCES AVANT LA DEMANDE. L'ordre est geste → observation → brique →
 * demande :
 *   étape 1  faire tourner et lire les cases → brique `suite-rang-terme`
 *   étape 2  régler, voir coïncider puis diverger → brique
 *            `deux-facons-de-fabriquer`
 *   étapes 3 et 4  les questions, désormais légitimes.
 *
 * MANIPULATION JAMAIS GELÉE. Le laboratoire reste pilotable une fois l'étape
 * validée : `disabled` ne porte que le verrou d'ANTÉRIORITÉ de l'étape 2 sur
 * l'étape 1. Seuls les `PredictionChips` se figent — une prédiction
 * s'enregistre une fois, avant la révélation.
 */
export default function Module01LaMachineADeuxBoutons() {
  // Étape 1 : réglages libres, volontairement dépareillés au départ.
  const [add1, setAdd1] = useState(LAB_PAS_ADDITIFS[0]);
  const [mul1, setMul1] = useState(LAB_PAS_MULTIPLICATIFS[0]);
  const [rang1, setRang1] = useState(2);
  const [q1, setQ1] = useState(false);

  // Étape 2 : la mission.
  const [pred, setPred] = useState(null);
  const [add2, setAdd2] = useState(LAB_PAS_ADDITIFS[0]);
  const [mul2, setMul2] = useState(LAB_PAS_MULTIPLICATIFS[0]);
  const [rang2, setRang2] = useState(1);
  const [mission, setMission] = useState(false);

  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = q1;
  const etat2 = etatLab(add2, mul2, rang2);
  const done2 = mission;

  // La mission tombe dès que les deux machines coïncident ET que l'élève a
  // poussé jusqu'au rang 2, c'est-à-dire jusqu'à la séparation. `react` ne se
  // déclenche qu'au moment où l'objectif tombe.
  const majMission = (next, react) => {
    if (mission) return;
    if (missionLabRemplie(next)) {
      setMission(true);
      react?.(true);
    }
  };
  const changerAdd2 = (v, react) => { setAdd2(v); majMission(etatLab(v, mul2, rang2), react); };
  const changerMul2 = (v, react) => { setMul2(v); majMission(etatLab(add2, v, rang2), react); };
  const changerRang2 = (v, react) => { setRang2(v); majMission(etatLab(add2, mul2, v), react); };

  // La valeur que l'étape 1 demande de lire, RECALCULÉE — jamais écrite à la
  // main. Le laboratoire est libre : la question porte donc sur un réglage
  // qu'elle nomme, pas sur l'état courant.
  const lecture1 = etatLab(2, 2, 3);

  const steps = [
    {
      num: 1,
      title: 'Deux usines, un bouton chacune',
      subtitle:
        'Appuie sur « +1 rang » : chaque usine fabrique son nombre suivant, et le pose dans sa pile. Regarde ce que chacune fait entre deux cases.',
      done: done1,
      content: () => (
        <div className="space-y-3">
          <MachineLab
            pasAdd={add1}
            pasMul={mul1}
            rang={rang1}
            onChangePasAdd={setAdd1}
            onChangePasMul={setMul1}
            onChangeRang={setRang1}
          />
          <NumericQuestion
            prompt={
              <>
                Règle l’usine A sur <strong>+ 2</strong> et l’usine B sur <strong>× 2</strong>, puis
                va jusqu’au rang 3. Quel nombre l’usine B a-t-elle fabriqué au{' '}
                <strong>rang 3</strong> ?
              </>
            }
            expected={lecture1.mul[3]}
            parse={parseNombre}
            display={fr(lecture1.mul[3])}
            requires={['vocab-notation-fx', 'tableau-valeurs']}
            explain={`En partant de 2 et en multipliant par 2 à chaque fois : 2, puis 4, puis 8, puis ${fr(lecture1.mul[3])}. Attention au compte : on part du rang 0, donc le rang 3 est la quatrième case.`}
            explainFor={(n) =>
              n === lecture1.add[3]
                ? `${fr(lecture1.add[3])} est le nombre de l’usine A, celle qui ajoute. L’usine B multiplie : 2, 4, 8, ${fr(lecture1.mul[3])}.`
                : n === lecture1.mul[2]
                ? `${fr(lecture1.mul[2])} est au rang 2, pas au rang 3 : on compte à partir du rang 0, la case du rang 3 est la quatrième.`
                : null
            }
            solved={done1}
            onAnswered={() => setQ1(true)}
          />
          {done1 && (
            <>
              <Feedback tone="ok">
                Deux usines, deux gestes. L’une <strong>ajoute</strong> toujours le même montant,
                l’autre <strong>multiplie</strong> toujours par le même facteur. Chaque case porte
                sa place dans la file — et l’on compte à partir de 0.
              </Feedback>
              <KnowledgeBrick
                id="suite-rang-terme"
                variant="new"
                lead={<>Les cases que tu viens de remplir ont un nom, et leur numéro aussi.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La mission : les faire coïncider',
      subtitle:
        'Règle les deux usines pour qu’elles fabriquent les MÊMES nombres aux rangs 0 et 1. Puis appuie encore une fois sur « +1 rang ».',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="si les deux usines donnent les mêmes deux premiers nombres, que va-t-il se passer ensuite ?"
            options={[
              { id: 'toujours', label: 'Elles donneront toujours les mêmes nombres' },
              { id: 'separent', label: 'Elles vont se séparer' },
              { id: 'plus-tard', label: 'Elles se sépareront, mais très loin' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done2}
          />
          <MachineLab
            pasAdd={add2}
            pasMul={mul2}
            rang={rang2}
            onChangePasAdd={(v) => changerAdd2(v, kit.react)}
            onChangePasMul={(v) => changerMul2(v, kit.react)}
            onChangeRang={(v) => changerRang2(v, kit.react)}
            disabled={!done1}
          />
          {done2 ? (
            <>
              <Feedback tone="ok">
                {pred === 'separent' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Voilà ce qui arrive'} :
                les deux usines donnent bien les mêmes nombres aux rangs 0 et 1, et{' '}
                <strong>elles se séparent au rang 2</strong>. Ce n’est pas un mauvais réglage :
                aucun réglage ne peut faire mieux. Faire coïncider trois nombres obligerait les
                deux usines à ne rien fabriquer du tout — à répéter éternellement le même nombre.
              </Feedback>
              <KnowledgeBrick
                id="deux-facons-de-fabriquer"
                variant="new"
                lead={<>Ce que tes deux piles viennent de montrer tient en une phrase. Refais tourner les usines en la lisant.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              {etat2.coincidentAuRang1 ? (
                <>
                  Les deux usines donnent le même nombre au rang 1. Appuie maintenant sur{' '}
                  <strong>« +1 rang »</strong> pour voir ce qui se passe au rang 2.
                </>
              ) : (
                <>
                  Pour l’instant elles se séparent dès le rang 1 : l’usine A donne{' '}
                  <strong>{fr(etat2.add[1] ?? etat2.add[0])}</strong> et l’usine B{' '}
                  <strong>{fr(etat2.mul[1] ?? etat2.mul[0])}</strong>. Change les réglages jusqu’à
                  ce que les deux cases du rang 1 portent le même nombre.
                </>
              )}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Qu’est-ce qui reste pareil ?',
      done: q3,
      content: (
        <TapQuestion
          prompt="Dans chaque usine, il y a quelque chose qui ne change JAMAIS d’une case à la suivante. Quoi ?"
          options={[
            'Le geste : l’usine A ajoute toujours le même montant, l’usine B multiplie toujours par le même facteur',
            'Le nombre fabriqué, qui reste le même à chaque rang',
            'L’écart entre les deux piles, qui reste constant',
            'Le rang, qui ne bouge pas',
          ]}
          correct={0}
          cols={1}
          requires={['suite-rang-terme', 'deux-facons-de-fabriquer']}
          explain="Ce qui est constant n’est pas le nombre produit — il change à chaque rang — mais le PAS : « + le même montant » pour l’une, « × le même facteur » pour l’autre. C’est là toute la différence entre les deux usines."
          explainWrong="Les nombres fabriqués changent à chaque rang, sinon les piles seraient plates. Et l’écart entre les deux piles grandit, tu l’as vu : c’est précisément parce que le geste, lui, ne change pas."
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Et si l’on ne voyait que les nombres ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm text-slate-700">
              On te donne cette liste, sans dire de quelle usine elle sort :
            </p>
            <p className="mt-1.5 font-mono text-lg font-black tabular-nums text-slate-900">
              5 · 10 · 20 · 40
            </p>
          </div>
          <TapQuestion
            prompt="Comment savoir de quelle usine elle vient ?"
            options={[
              'En regardant ce qui se répète d’un nombre au suivant : ce qu’on ajoute, ou ce par quoi on multiplie',
              'En regardant si les nombres sont pairs',
              'En comparant le dernier nombre au premier',
              'C’est impossible sans connaître le réglage de l’usine',
            ]}
            correct={0}
            cols={1}
            requires={['suite-rang-terme', 'deux-facons-de-fabriquer']}
            explain="On mesure ce qui se passe entre deux nombres consécutifs. Ici on n’ajoute pas toujours la même chose (+5, puis +10, puis +20), mais on multiplie toujours par la même chose. Les deux mesures — l’écart et le rapport — ont chacune un nom, et le nombre qu’elles trouvent aussi : le module 3 les pose."
            explainWrong="Comparer le dernier au premier ne dit rien du geste répété : 40 − 5 = 35 ne se retrouve nulle part entre deux cases. La parité ne distingue pas non plus les deux usines. Ce qu’il faut regarder, c’est ce qui se répète de case en case."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La machine à deux boutons"
      moduleSubtitle="Deux usines, deux gestes, et des piles qui finissent par se séparer"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Jusqu’où peuvent-elles se ressembler ?',
        tone: 'indigo',
        body: (
          <p>
            Deux usines fabriquent des listes de nombres, chacune avec son geste. Règle-les pour
            qu’elles produisent les mêmes premiers résultats — et regarde jusqu’où la ressemblance
            tient.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Le mot juste.</strong> Les deux gestes que tu viens de comparer donnent deux
          familles de listes, et le nombre qui les règle porte un nom. Module suivant : les deux
          façons d’écrire une telle liste, avant de les nommer.
        </KnowledgeSnapshot>
      }
    />
  );
}
