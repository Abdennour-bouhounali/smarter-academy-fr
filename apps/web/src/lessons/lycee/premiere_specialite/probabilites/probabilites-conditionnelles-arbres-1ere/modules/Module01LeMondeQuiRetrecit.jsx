import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SplitPopulationLab from '../components/SplitPopulationLab';
import { barReadings, missionAccomplie, missionPairs, pct } from '../components/condUtils';
import { BAR_START, MISSION_A, MISSION_B, BAR_LABELS } from '../data';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : le monde qui rétrécit
 * (components/SplitPopulationLab.jsx).
 *
 * LE GLISSER (règle utilisateur du 2026-09-10). La composition de la population
 * se règle en ATTRAPANT LES SÉPARATIONS de la barre et en les faisant glisser :
 * pas un bouton ±, pas un curseur posé à côté de la figure. Le trait qui découpe
 * la population EST la poignée. `DraggableSplitBar` (common/stats) fournit le
 * `setPointerCapture`, la zone de préhension large et le chemin clavier complet.
 *
 * L'ARC DU MODULE :
 *   Étape 1  PRÉDICTION puis MANIPULATION LIBRE : régler la barre et voir les
 *            trois lectures bouger ensemble. Une seule question numérique, sur
 *            un état que l'élève a réglé lui-même.
 *   Étape 2  LA MISSION : trouver DEUX compositions où P(A ∩ B) est identique
 *            et P_B(A) différent. C'est le geste qui fait la découverte — pas
 *            une lecture, une recherche.
 *   Étape 3  la question qui compte : QU'EST-CE QUI A CHANGÉ ?
 *   Étape 4  ce que cela impose de faire avant tout calcul — posé comme une
 *            QUESTION, dont le module 2 fera une méthode.
 *
 * Rien n'est nommé ici que la 2de n'ait déjà nommé. Le module se termine en
 * DEMANDANT ce que le suivant construira : la phrase qui nomme sa population.
 *
 * MANIPULATION JAMAIS GELÉE. Aucun `disabled={done}` : le laboratoire reste
 * pilotable après validation, et c'est même le but — l'élève doit pouvoir
 * refaire glisser la séparation en lisant la brique. Seul le verrou
 * d'ANTÉRIORITÉ (`locked={!done1}`) existe, et seuls les `PredictionChips` se
 * figent, une prédiction ne s'enregistrant qu'une fois.
 */
export default function Module01LeMondeQuiRetrecit() {
  const [etat1, setEtat1] = useState(BAR_START);
  const [pred, setPred] = useState(null);
  const [q1, setQ1] = useState(false);
  const [etat2, setEtat2] = useState(BAR_START);
  const [visites, setVisites] = useState([BAR_START]);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = q1;
  const done2 = missionAccomplie(visites);
  const lecture1 = barReadings(etat1);

  // Chaque état RÉGLÉ entre dans l'historique : c'est la COMPARAISON de deux
  // compositions qui fait la découverte, pas la lecture d'une seule.
  const bouger2 = (next, react) => {
    setEtat2(next);
    const deja = visites.some((v) => v.nB === next.nB && v.nAB === next.nAB);
    if (deja) return;
    const suivant = [...visites, next];
    setVisites(suivant);
    if (!done2 && missionAccomplie(suivant)) react?.(true);
  };

  const paire = done2 ? missionPairs(visites)[0] : null;
  const lecturesPaire = paire ? paire.map(barReadings) : null;

  const steps = [
    {
      num: 1,
      title: 'Attrape une séparation et fais-la glisser',
      subtitle:
        'Deux traits noirs découpent les 1 000 habitants. Tire-les, regarde les trois lectures bouger, puis règle la première séparation sur 200 habitants proches du centre et la seconde sur 150 cyclistes.',
      done: done1,
      content: () => (
        <div className="space-y-3">
          <PredictionChips
            prompt="Si tu élargis le quartier « proche du centre » SANS toucher au nombre de cyclistes qui y habitent, que va faire le pourcentage de cyclistes parmi eux ?"
            options={[
              { id: 'monte', label: 'Il va monter' },
              { id: 'stable', label: 'Il ne bougera pas' },
              { id: 'baisse', label: 'Il va baisser' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done1}
          />
          <SplitPopulationLab state={etat1} onChange={setEtat1} highlight="condBA" />
          <NumericQuestion
            prompt={
              <>
                Règle la barre sur <strong>200</strong> habitants proches du centre dont{' '}
                <strong>150</strong> cyclistes. Quel pourcentage de cyclistes cela fait-il{' '}
                <strong>parmi les proches du centre</strong> ? (sans le signe %)
              </>
            }
            expected={75}
            parse={parseDec}
            display="75"
            suffix="%"
            requires={['univers-restreint', 'notation-sachant', 'denominateur']}
            explain="150 cyclistes rapportés aux 200 habitants du quartier : 150 ÷ 200 = 0,75, soit 75 %."
            explainFor={(n) =>
              n === 15
                ? 'C’est 150 rapporté aux 1 000 habitants du quartier entier. Ici on ne compte que parmi les 200 proches du centre : 150 ÷ 200 = 0,75.'
                : n === 20
                  ? 'C’est la part des proches du centre dans la population (200 sur 1 000). La question porte sur la part de cyclistes À L’INTÉRIEUR de ces 200.'
                  : 'Le dénominateur est l’effectif du groupe dans lequel on se place : 200 habitants proches du centre. 150 ÷ 200 = 0,75.'
            }
            solved={done1}
            onAnswered={() => setQ1(true)}
          />
          {done1 && (
            <>
              <Feedback tone="ok">
                {pred === 'baisse' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Regarde les trois lignes'} :
                les mêmes {lecture1.nAB} habitants comptés au numérateur ne donnent pas le même
                pourcentage selon le groupe auquel on les rapporte. Élargis maintenant le quartier
                sans toucher au trait magenta, et regarde la deuxième ligne descendre.
              </Feedback>
              <KnowledgeBrick
                id="intersection-vs-conditionnelle"
                variant="new"
                lead={<>Les trois lignes sous la barre ne posent pas la même question. Refais glisser en les relisant.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La mission : deux compositions, un même comptage, deux pourcentages',
      subtitle:
        'Trouve DEUX réglages où le nombre de cyclistes proches du centre est le MÊME, mais où leur pourcentage parmi les proches du centre DIFFÈRE. Fais glisser jusqu’à y arriver.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <SplitPopulationLab
            state={etat2}
            onChange={(next) => bouger2(next, kit.react)}
            locked={!done1}
            highlight="condBA"
          />
          {done2 && lecturesPaire ? (
            <>
              <Feedback tone="ok">
                Trouvé. Avec <strong>{lecturesPaire[0].nB}</strong> habitants proches du centre :{' '}
                {lecturesPaire[0].nAB} sur {lecturesPaire[0].nB} ={' '}
                <strong>{pct(lecturesPaire[0].condBA, 1)}</strong>. Avec{' '}
                <strong>{lecturesPaire[1].nB}</strong> : {lecturesPaire[1].nAB} sur{' '}
                {lecturesPaire[1].nB} = <strong>{pct(lecturesPaire[1].condBA, 1)}</strong>. Et
                pourtant la première ligne, P(A ∩ B), n’a pas bougé d’un millième : c’est le même
                comptage.
              </Feedback>
              <KnowledgeBrick
                id="denominateur-decide"
                variant="new"
                lead={<>Ce que tes deux réglages viennent de montrer se dit en une phrase. Refais-les en la lisant.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Réglages essayés : {visites.length}. Piste : garde le trait magenta immobile — c’est
              lui, le comptage — et fais glisser seulement la première séparation.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Qu’est-ce qui a changé ?',
      done: q3,
      content: (
        <TapQuestion
          prompt={`Entre tes deux réglages, ${MISSION_A.nAB} habitants sont restés à la fois cyclistes et proches du centre, et pourtant le pourcentage est passé de 75 % à 25 %. Pourquoi ?`}
          options={[
            'Parce que l’ensemble auquel on rapporte ce comptage a changé : 200 habitants d’abord, 600 ensuite',
            'Parce que le nombre de cyclistes proches du centre a augmenté',
            'Parce que la population totale a changé',
            'Parce que le calcul a été fait avec plus de précision',
          ]}
          correct={0}
          cols={1}
          requires={['denominateur-decide', 'intersection-vs-conditionnelle', 'univers-restreint']}
          explain="Le numérateur est resté le même à l’unité près, et la population entière aussi : 1 000 habitants dans les deux réglages. Seul l’ensemble de référence a changé de taille — et c’est lui qui divise."
          explainWrong="Relis la première ligne sous la barre : P(A ∩ B) est identique dans les deux réglages, donc ni le comptage ni la population totale n’ont bougé. Ce qui a changé, c’est le nombre par lequel on divise."
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Alors, que faut-il faire avant tout calcul ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <SplitPopulationLab state={MISSION_B} onChange={() => {}} locked highlight="condBA" />
          <TapQuestion
            prompt="Devant un pourcentage annoncé sans autre précision — « 25 % d’entre eux font du vélo » —, quel réflexe la manipulation impose-t-elle ?"
            options={[
              'Demander à quel ensemble ce pourcentage est rapporté, avant même de regarder le nombre',
              'Vérifier que le pourcentage est bien compris entre 0 et 100',
              'Multiplier par la population totale pour retrouver un effectif',
              'Comparer ce pourcentage à celui de la population entière',
            ]}
            correct={0}
            cols={1}
            requires={['denominateur-decide', 'intersection-vs-conditionnelle']}
            explain="Le même comptage vaut 75 % ou 25 % selon l’ensemble auquel on le rapporte : sans savoir lequel, le nombre ne veut rien dire. Le module suivant en fera une manière de PARLER — une phrase qui nomme toujours sa population."
            explainWrong="Un pourcentage entre 0 et 100 peut parfaitement être trompeur : 75 % et 25 % le sont tous les deux ici, et décrivent pourtant les mêmes 150 habitants. Ce qui manque, c’est l’ensemble de référence."
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
      moduleTitle="Le monde qui rétrécit"
      moduleSubtitle="Mille habitants, deux séparations, trois lectures qui divergent"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Le même comptage, deux pourcentages',
        tone: 'indigo',
        body: (
          <p>
            Mille habitants d’un quartier, croisés selon deux critères : {BAR_LABELS.a} et{' '}
            {BAR_LABELS.b}. Tu règles la composition en attrapant les traits noirs. Ta mission :
            trouver deux réglages où le même groupe d’habitants affiche deux pourcentages
            différents.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Ce que tu viens de voir.</strong> Un pourcentage n’existe jamais seul : il est
          toujours rapporté à un ensemble, et c’est cet ensemble qui décide de sa valeur. Module
          suivant : comment le calculer sur cent mille personnes, et surtout comment le DIRE sans
          mentir.
        </KnowledgeSnapshot>
      }
    />
  );
}
