import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import QuadLab from '../components/QuadLab';
import { anglesQuad, quatriemeSommet } from '../components/paral';

/**
 * Module 3 — MANIPULATION : le contre-exemple introuvable.
 *
 * L'élève ne reçoit pas la propriété : on lui demande de la CASSER. Le
 * sommet D est asservi — il suit pour que la figure reste toujours un
 * parallélogramme — si bien que l'élève peut déformer autant qu'il veut sans
 * jamais quitter la famille. La table des mesures affiche les quatre
 * longueurs, et elles refusent obstinément de se séparer.
 *
 * ACTION → CHANGE → OBSERVATION → SENS
 *   action      : traîner A, B ou C (D suit)
 *   change      : les quatre longueurs se recalculent depuis la figure
 *   observation : AB et DC restent collés, AD et BC aussi — sur toutes les
 *                 formes atteignables, y compris les plus aplaties
 *   sens        : ce n'est pas une coïncidence de dessin, c'est une propriété
 *
 * Expected observation : « je n'arrive pas à fabriquer un parallélogramme
 * dont les côtés opposés soient différents ».
 * Misconception targeted : (b) de la spec — « côtés opposés égaux » confondu
 * avec « deux côtés quelconques égaux ». L'étape 3 la traite de front.
 *
 * Le motif « cherche un contre-exemple, tu n'en trouveras pas » est celui de
 * transformations-5e M4 : c'est ce qui transforme une affirmation reçue en
 * un fait éprouvé.
 */
const A0 = { x: 200, y: 380 };
const B0 = { x: 470, y: 380 };
const C0 = { x: 560, y: 200 };

export default function Module03CeQueLesCotesPromettent() {
  const [pts, setPts] = useState([A0, B0, C0, quatriemeSommet(A0, B0, C0)]);
  const [essais, setEssais] = useState(0);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const assezCherche = essais >= 6;
  const angles = anglesQuad(pts);

  /* L'effet de bord (le petit « bravo » du kit) est déclenché DEPUIS le
     gestionnaire, jamais depuis l'updater de setState : un updater doit être
     pur, et React avertit à juste titre quand il met à jour un autre
     composant pendant le rendu. */
  const bouger = (next, react) => {
    setPts(next);
    const m = essais + 1;
    setEssais(m);
    if (m === 6) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Cherche un contre-exemple',
      subtitle: 'Déforme la figure autant que tu veux : trouve un parallélogramme dont les côtés opposés ne sont PAS égaux.',
      done: assezCherche,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3.5 text-sm text-slate-700">
            Les trois sommets <strong>A</strong>, <strong>B</strong> et <strong>C</strong> sont à
            toi. Le quatrième suit tout seul, pour que la figure reste un parallélogramme quoi que
            tu fasses. Regarde les quatre longueurs pendant que tu déformes.
          </div>
          <QuadLab
            pts={pts}
            onPts={(next) => bouger(next, kit.react)}
            mobiles={[0, 1, 2]}
            asservi={3}
            montrerTemoins={false}
            montrerCodages
            montrerMesures
            ariaLabel="Un parallélogramme déformable dont on lit les quatre longueurs de côtés"
          />
          {assezCherche ? (
            <Feedback tone="ok">
              Tu as essayé {essais} formes différentes — allongées, aplaties, penchées. À chaque
              fois, <strong>AB et DC affichent le même nombre</strong>, et AD et BC aussi. Ce n’est
              pas la chance : c’est une propriété.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {essais === 0
                ? 'Prends un sommet et déforme. Essaie les formes extrêmes : très aplatie, très allongée.'
                : `${essais} forme${essais > 1 ? 's' : ''} essayée${essais > 1 ? 's' : ''}. Continue — surtout les formes bizarres, c’est là qu’un contre-exemple se cacherait.`}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La propriété, énoncée',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="cotes-opposes-egaux"
            variant="new"
            lead={<>Le contre-exemple n’existe pas : tu viens de le chercher sur {essais} formes différentes. On peut donc l’énoncer.</>}
          />
          <NumericQuestion
            prompt={<>Dans un parallélogramme ABCD, on sait que AB = 7 cm. Combien mesure DC, en cm ?</>}
            expected={7}
            suffix="cm"
            requires={['cotes-opposes-egaux', 'parallelogramme']}
            explain="[AB] et [DC] sont des côtés opposés : ils ont la même longueur. DC = 7 cm."
            explainFor={(n) => (n === 14
              ? 'On n’a pas doublé : les côtés opposés sont ÉGAUX, pas l’un le double de l’autre. DC = AB = 7 cm.'
              : undefined)}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Opposés, pas voisins',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-3.5 text-sm text-slate-700">
            Regarde encore la figure du haut : elle a bien <strong>deux</strong> longueurs
            différentes. Les côtés égaux vont par paires — et ces paires sont faites de côtés qui{' '}
            <strong>ne se touchent pas</strong>.
          </div>
          <TapQuestion
            prompt="Dans un parallélogramme ABCD avec AB = 8 cm et BC = 5 cm, que vaut AD ?"
            options={['5 cm', '8 cm', '13 cm', 'On ne peut pas savoir']}
            cols={4}
            correct={0}
            requires={['cotes-opposes-egaux', 'quadrilatere']}
            explain="[AD] est le côté opposé à [BC], donc AD = BC = 5 cm. (Le côté opposé à [AB] est [DC], qui mesure 8 cm.)"
            explainWrong="8 cm serait la longueur de [DC], le côté opposé à [AB]. Mais [AD] touche [AB] en A : ce sont deux côtés consécutifs, et rien n’oblige deux côtés consécutifs à être égaux. [AD] est opposé à [BC], donc AD = 5 cm."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Et les angles ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3.5 space-y-2">
            <p className="text-sm text-slate-700">
              Sur la figure que tu viens de déformer, les quatre angles valent en ce moment :
            </p>
            <div className="grid grid-cols-4 gap-2">
              {['A', 'B', 'C', 'D'].map((nom, i) => (
                <div key={nom} className="rounded-lg border-2 border-emerald-300 bg-white px-2 py-1.5 text-center">
                  <div className="text-xs font-semibold text-slate-500">en {nom}</div>
                  <div className="font-mono text-base font-black tabular-nums text-emerald-700">
                    {Math.round(angles[i])}°
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-700">
              Deux paires, encore une fois — et les deux angles voisins font ensemble{' '}
              <strong>{Math.round(angles[0] + angles[1])}°</strong>.
            </p>
          </div>
          <KnowledgeBrick
            id="angles-opposes-egaux"
            variant="new"
            lead={<>Les longueurs se rangeaient par paires ; les angles font pareil.</>}
          />
          <TapQuestion
            prompt="Dans un parallélogramme, un angle mesure 110°. Que mesure l’angle qui lui est opposé ?"
            options={['110°', '70°', '90°', '250°']}
            cols={4}
            correct={0}
            requires={['angles-opposes-egaux', 'parallelogramme']}
            explain="Les angles opposés d’un parallélogramme sont égaux : l’angle opposé mesure aussi 110°. (Ce sont les angles CONSÉCUTIFS qui font 180° ensemble : 110° + 70°.)"
            explainWrong="70° est la mesure des deux AUTRES angles, ceux qui touchent celui de 110° — car deux angles consécutifs font 180°. L’angle opposé, lui, est l’égal du premier : 110°."
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
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Ce que les côtés promettent"
      moduleSubtitle="Une propriété qu’on essaie de casser"
      estimatedTime="10 min"
      brief={{
        tag: 'Manipulation',
        title: 'Trouve un contre-exemple — si tu peux',
        tone: 'indigo',
        body: (
          <p>
            Au module 1, les longueurs se sont mises d’accord toutes seules. Était-ce un hasard de
            dessin ? Une seule façon de le savoir : <strong>essayer de fabriquer l’exception</strong>.
            La figure restera un parallélogramme quoi que tu fasses — à toi de la prendre en défaut.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
