import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import AffineExplorer from '../../../../../common/components/AffineExplorer';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { image, stepDelta } from '../components/affineUtils';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 2 — DÉCOUVERTE : « Le bouton a » (b verrouillé).
 *
 * Activity: régler le seul coefficient a et regarder la droite s'incliner
 *   autour d'un point qui, lui, ne bouge pas.
 * Mathematical objective: isoler le rôle de a. Une variable à la fois
 *   (pédagogie §8) : le réglage de b reste VISIBLE mais désactivé, pour que
 *   l'élève voie qu'il existe et qu'il est tenu immobile.
 * Student action: glisser ou avancer pas à pas le réglage de a.
 * Controlled variable: a seul ; b est figé à 2.
 * Mathematical state: { a, b: 2 } — la droite, l'escalier et l'expression en
 *   dérivent ; `stepDelta` fournit la correction, donc elle ne peut pas
 *   diverger de ce qui est dessiné.
 * Visual consequence: la droite pivote autour de (0 ; 2) ; l'escalier +1 → +a
 *   se redessine ; le point d'ordonnée à l'origine reste sur place.
 * Expected observation: « le point de départ ne bouge pas, seule la pente
 *   change ».
 * Misconception targeted: « augmenter a fait monter toute la droite » — c'est
 *   le rôle de b, pas de a.
 * Feedback: le compteur d'inclinaisons explorées quantifie ce qui reste ;
 *   explainFor cible la confusion a/b sur le calcul d'image.
 * Formalization: le nom « coefficient directeur » est posé à l'étape 2, par une
 *   <KnowledgeBrick> qui n'apparaît qu'une fois les trois inclinaisons
 *   explorées — le mot nomme l'escalier que l'élève vient de voir bouger.
 * Scaffolding: prédiction → exploration guidée (trois régimes) → nom + essai
 *   immédiat → image → ce que a ne fait pas.
 * Transfer: le module 3 fait l'expérience symétrique sur b.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   C'était le défaut le plus grave de la leçon : « coefficient directeur » ET
 *   « ordonnée à l'origine » apparaissaient pour la PREMIÈRE fois dans les
 *   OPTIONS du QCM de l'étape 4 — dont trois sont fausses. Répondre exigeait
 *   donc de deviner le mot que la question demandait, et « antécédent » ne
 *   servait que de leurre. Désormais :
 *     étape 2  explorer les trois inclinaisons → brique `coefficient-directeur`
 *              + essai immédiat (lire a sur un escalier)
 *     étape 3  calculer une image, le nom étant acquis
 *     étape 4  brique `role-de-a` : ce que a NE fait pas — la question porte
 *              sur l'effet, plus sur le nom, et ses distracteurs rejouent des
 *              erreurs réelles au lieu d'introduire un mot inconnu.
 *   « ordonnée à l'origine » n'est pas prononcé ici : son réglage est bloqué,
 *   c'est le module 3 qui le nomme. On dit « hauteur de départ » en attendant.
 */

const B_FIXED = 2;
const RANGE = { xMin: -5, xMax: 5, yMin: -7, yMax: 7 };

export default function Module02BoutonA() {
  const [a, setA] = useState(1);
  const [seen, setSeen] = useState(() => new Set(['1']));
  const [predicted, setPredicted] = useState(false);
  const [imageDone, setImageDone] = useState(false);
  const [nameDone, setNameDone] = useState(false);
  const [roleDone, setRoleDone] = useState(false);

  const kinds = new Set();
  for (const v of seen) {
    const n = Number(v);
    if (n < 0) kinds.add('neg');
    else if (n > 0 && n < 1) kinds.add('doux');
    else if (n >= 2) kinds.add('fort');
  }
  const LABELS = { fort: 'une pente forte (a ≥ 2)', doux: 'une pente douce (0 < a < 1)', neg: 'une pente négative (a < 0)' };
  const missing = ['fort', 'doux', 'neg'].filter((k) => !kinds.has(k));
  const explored = missing.length === 0;

  const change = ({ a: next }, kit) => {
    if (next === a) return;
    setA(next);
    setSeen((prev) => new Set(prev).add(String(next)));
    kit.react(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Le bouton a"
      moduleSubtitle="On bloque b. Un seul réglage bouge — et la droite s’incline."
      estimatedTime="7 min"
      brief={{
        tag: '🎚️ Mission 02',
        title: 'Un seul réglage à la fois',
        tone: 'indigo',
        body: (
          <p>
            Le réglage de <MathText>{'$b$'}</MathText> est bloqué sur 2 : tu le vois, mais
            tu ne peux pas y toucher. Fais varier <MathText>{'$a$'}</MathText> et observe.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Prédis avant de régler',
          done: predicted,
          content: (
            <TapQuestion
              prompt="Si tu augmentes a, que va faire la droite ?"
              options={[
                'Elle va s’incliner davantage, en gardant le même point de départ',
                'Elle va monter tout entière',
                'Elle va garder son inclinaison et glisser',
                'Rien ne changera',
              ]}
              correct={0}
              cols={1}
              requires={['forme-ax-b']}
              explain="a commande l’inclinaison. Le point de départ, lui, est fixé par b — et b est bloqué."
              explainWrong="Tu vas pouvoir vérifier juste en dessous : garde l’œil sur le point orange, celui qui est posé sur l’axe vertical."
              solved={predicted}
              onAnswered={() => setPredicted(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Explore les trois inclinaisons',
          subtitle: 'Une montée forte, une montée douce, une descente.',
          done: explored && nameDone,
          content: (kit) => (
            <div className="space-y-3">
              <AffineExplorer
                a={a}
                b={B_FIXED}
                showB
                lockB
                onChange={(v) => change(v, kit)}
                aRange={{ min: -3, max: 3, step: 0.5 }}
                bRange={{ min: -4, max: 4, step: 1 }}
                range={RANGE}
                showStaircase
                showIntercept
              />
              <Feedback tone={explored ? 'ok' : 'info'}>
                {explored ? (
                  <>
                    Trois inclinaisons, un seul point immobile : <strong>(0 ; 2)</strong>. Le
                    réglage bloqué de b n’a jamais bougé, et le départ non plus.
                  </>
                ) : (
                  <>Il te reste à essayer <strong>{missing.map((k) => LABELS[k]).join(', ')}</strong>.</>
                )}
              </Feedback>

              {explored && (
                <KnowledgeBrick
                  id="coefficient-directeur"
                  variant="new"
                  lead="Tu as vu l’escalier se redessiner à chaque réglage : quand on avance de 1, on monte d’autant que vaut a. Ce nombre a un nom."
                >
                  <NumericQuestion
                    prompt={<>Sur une droite, quand on avance de 1 vers la droite on monte de 4. Que vaut son <strong>coefficient directeur</strong> ?</>}
                    expected={4}
                    parse={parseDec}
                    display="4"
                    requires={['coefficient-directeur']}
                    explain="Le coefficient directeur EST cette montée pour une avancée de 1 : ici 4."
                    explainFor={(n) => {
                      if (n === 1) return 'Tu as donné l’avancée. Le coefficient directeur est la MONTÉE quand on avance de 1.';
                      if (n === 0.25) return 'Tu as divisé l’avancée par la montée. C’est l’inverse : on lit de combien on MONTE pour une avancée de 1.';
                      return null;
                    }}
                    solved={nameDone}
                    onAnswered={(ok) => { setNameDone(true); kit.react(ok); }}
                  />
                </KnowledgeBrick>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Calcule une image',
          done: imageDone,
          content: (kit) => (
            <NumericQuestion
              prompt={<>Pour <MathText>{'$f(x) = 3x + 2$'}</MathText>, que vaut <MathText>{'$f(4)$'}</MathText> ?</>}
              expected={image(3, 2, 4)}
              parse={parseDec}
              display={formatDec(image(3, 2, 4))}
              requires={['forme-ax-b', 'coefficient-directeur']}
              explain="3 × 4 = 12, puis on ajoute 2 : f(4) = 14. On multiplie d’abord, on ajoute la part fixe ensuite."
              explainFor={(n) => {
                if (n === 18) return 'Tu as ajouté 2 à 4 avant de multiplier : c’est 3 × 4 puis + 2, pas 3 × (4 + 2).';
                if (n === 12) return 'Tu as oublié le + 2, la part fixe.';
                if (n === 9) return 'Tu as peut-être échangé les rôles : c’est a = 3 qui multiplie, b = 2 qui s’ajoute.';
                return null;
              }}
              solved={imageDone}
              onAnswered={(ok) => { setImageDone(true); kit.react(ok); }}
            />
          ),
        },
        {
          num: 4,
          title: 'Ce que a ne fait pas',
          subtitle: 'Tu as réglé son inclinaison. Vérifie ce qui, dans la droite, lui échappe.',
          done: roleDone,
          content: (kit) => (
            <KnowledgeBrick
              id="role-de-a"
              variant="new"
              lead="Pendant tout le module, un point n’a jamais bougé pendant que la droite tournait. Voilà la limite exacte du pouvoir de a."
            >
              <TapQuestion
                prompt={<>On double <MathText>{'$a$'}</MathText> sans toucher au réglage bloqué. Qu’arrive-t-il au point où la droite coupe l’axe vertical ?</>}
                options={[
                  'Il ne bouge pas : la droite pivote autour de lui',
                  'Il monte deux fois plus haut',
                  'Il se décale vers la droite',
                  'Il descend, puisque la droite est plus raide',
                ]}
                correct={0}
                cols={1}
                requires={['coefficient-directeur', 'role-de-a']}
                explain="a ne commande que l’inclinaison. La hauteur de départ, elle, est réglée par l’autre nombre — celui qui est resté bloqué sur 2 : le point (0 ; 2) n’a pas bougé d’un pixel."
                explainWrong="Reviens à l’étape 2 : les trois inclinaisons essayées passaient toutes par le même point. Faire monter la droite entière, c’est le travail de l’autre réglage."
                solved={roleDone}
                onAnswered={(ok) => { setRoleDone(true); kit.react(ok); }}
              />
            </KnowledgeBrick>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> Au module suivant, on bloque{' '}
          <MathText>{'$a$'}</MathText> et on libère <MathText>{'$b$'}</MathText> — le réglage
          que tu viens de voir tenir la droite en place sans jamais pouvoir y toucher.
        </KnowledgeSnapshot>
      )}
    />
  );
}
