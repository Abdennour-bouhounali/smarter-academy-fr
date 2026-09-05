import React, { useState, useEffect, useRef } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ScaleBox from '../components/ScaleBox';
import RatioTable from '../components/RatioTable';
import { formatDec, parseDec, scaleFigure, scaleSides, ratioOfLengths } from '../components/propUtils';

/**
 * Module 4 — MANIPULATION : « Agrandir sans se tromper ».
 *
 * Activity: prédire ce que devient l'aire quand on agrandit ×2, puis régler k
 *   et compter les copies ; passer à k = 3 et k = 0,5 ; ajouter la troisième
 *   dimension (volume) ; retrouver un côté d'un triangle agrandi (Thalès) ;
 *   vérifier un agrandissement de photo.
 * Mathematical objective: dans un agrandissement de rapport k, les longueurs
 *   sont multipliées par k, les aires par k², les volumes par k³ ; les
 *   longueurs d'une figure et de son agrandie sont proportionnelles (le
 *   rapport constant est k — la configuration de Thalès) ; un résultat se
 *   vérifie par le rapport.
 * Student action: répondre, glisser ou ± k, observer les copies.
 * Controlled variable: k.
 * Mathematical state: { k } ; toutes les mesures viennent de `scaleFigure`.
 * Visual consequence: le rectangle agrandi se pave de k × k copies de la
 *   base ; les mesures s'écrivent avec leur facteur.
 * Expected observation: « ×2 sur les côtés, 4 copies : ×4 sur l'aire ».
 * Misconception targeted: « ×2 double l'aire » ; « +2 cm sur chaque côté ».
 */

const BASE = { w: 4, h: 2 };
const BOX = { w: 4, h: 2, d: 3 };
const TRI = [3, 4, 5];
const K_TRI = 2.5;

export default function Module04Agrandir() {
  const [predDone, setPredDone] = useState(false);
  const [k, setK] = useState(1);
  const [reached2, setReached2] = useState(false);
  const [k2, setK2] = useState(2);
  const [areaDone, setAreaDone] = useState(false);
  const [volDone, setVolDone] = useState(false);
  const [thalesDone, setThalesDone] = useState(false);
  const [checkDone, setCheckDone] = useState(false);
  const reactRef = useRef(null);

  useEffect(() => {
    if (!predDone || reached2 || k !== 2) return;
    setReached2(true);
    reactRef.current?.(true);
  }, [k, predDone, reached2]);

  const f2 = scaleFigure(BASE, 2);
  const big = scaleSides(TRI, K_TRI);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Agrandir sans se tromper"
      moduleSubtitle="Règle le rapport k : les côtés suivent, l’aire non — elle fait k²."
      estimatedTime="11 min"
      brief={{
        tag: '🖼️ Mission 04',
        title: 'La banderole de la fête',
        tone: 'violet',
        body: (
          <p>
            La maquette de la banderole mesure 4 cm sur 2 cm. On veut l’agrandir <strong>deux fois</strong>.
            Combien de tissu faudra-t-il — deux fois plus ? Prédis, puis règle k.
          </p>
        ),
      }}
      intro={(kit) => { reactRef.current = kit.react; return null; }}
      steps={[
        {
          num: 1,
          title: 'Prédis, puis agrandis ×2',
          subtitle: 'Réponds d’abord ; ensuite règle k sur 2 et compte les copies.',
          done: reached2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="On multiplie les deux côtés par 2. L’aire de la banderole est multipliée par…"
                options={['2', '4', 'Elle augmente de 2 cm²', '8']}
                correct={1}
                cols={2}
                explain="Vérifie-le : règle k sur 2 et compte les copies de la maquette dans la grande banderole."
                explainWrong="Ne me crois pas sur parole : règle k sur 2 et compte les copies de la maquette qui tiennent dans la grande banderole."
                solved={predDone}
                onAnswered={() => setPredDone(true)}
              />
              {predDone && <ScaleBox base={BASE} k={k} onKChange={setK} caption="Règle k" />}
              {reached2 && (
                <Feedback tone="ok">
                  k = 2 : les côtés passent de {formatDec(BASE.w)} et {formatDec(BASE.h)} à {formatDec(f2.w)} et {formatDec(f2.h)} cm (× 2), le périmètre de{' '}
                  {formatDec(scaleFigure(BASE, 1).perimeter)} à {formatDec(f2.perimeter)} cm (× 2)… mais l’aire de {formatDec(scaleFigure(BASE, 1).area)} à{' '}
                  {formatDec(f2.area)} cm² : <strong>× 4</strong>. Quatre copies de la maquette pavent la grande banderole — 2 en largeur × 2 en hauteur.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'k = 3, k = 0,5',
          subtitle: 'Règle k librement, puis calcule sans regarder.',
          done: areaDone,
          content: (
            <div className="space-y-3">
              <ScaleBox base={BASE} k={k2} onKChange={setK2} caption="Explore" />
              <NumericQuestion
                prompt="Pour k = 3, quelle est l’aire de la banderole agrandie ? (maquette : 4 cm × 2 cm)"
                suffix="cm²"
                expected={scaleFigure(BASE, 3).area}
                parse={parseDec}
                display={`${formatDec(scaleFigure(BASE, 3).area)} cm²`}
                explain="12 cm × 6 cm = 72 cm² — soit 8 × 9 : l’aire est multipliée par k² = 3² = 9. Et pour k = 0,5 (une réduction), elle est divisée par 4 : 2 cm²."
                explainFor={(n) => {
                  if (n === 24) return '8 × 3 = 24 multiplie l’aire par k. Mais chaque côté est × 3, donc l’aire est × 3 × 3 = × 9 : 72 cm².';
                  if (n === 18) return '18 cm² correspond à k = 1,5 (aire × 2,25). Pour k = 3 : 12 × 6 = 72 cm².';
                  return null;
                }}
                solved={areaDone}
                onAnswered={() => setAreaDone(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Et le volume ?',
          subtitle: 'La boîte des décorations : 4 cm × 2 cm × 3 cm, agrandie ×2.',
          done: volDone,
          content: (
            <TapQuestion
              prompt="On multiplie les trois dimensions de la boîte par 2. Son volume est multiplié par…"
              above={(revealed) => revealed && <ScaleBox base={BOX} k={2} onKChange={() => {}} frozen showVolume caption="La boîte agrandie ×2 (vue de face)" />}
              options={['8', '2', '4', '6']}
              correct={0}
              cols={2}
              explain="Volume de base : 4 × 2 × 3 = 24 cm³ ; agrandie : 8 × 4 × 6 = 192 cm³ = 24 × 8. Trois dimensions multipliées par 2, c’est × 2 × 2 × 2 = × k³. Longueurs × k, aires × k², volumes × k³."
              solved={volDone}
              onAnswered={() => setVolDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Le triangle agrandi',
          subtitle: 'Un triangle de côtés 3, 4 et 5 cm est agrandi : son petit côté mesure 7,5 cm.',
          done: thalesDone,
          content: (
            <div className="space-y-3">
              <RatioTable xLabel="petit triangle" xUnit="cm" yLabel="grand triangle" yUnit="cm"
                columns={[{ x: TRI[0], y: big[0] }, { x: TRI[1], y: thalesDone ? big[1] : null }, { x: TRI[2], y: thalesDone ? big[2] : null }]}
                ratios={thalesDone ? 'all' : new Set([0])} coefficient={thalesDone ? K_TRI : null} caption="Les côtés, deux à deux" />
              <NumericQuestion
                prompt="Quelle est la longueur du plus grand côté du triangle agrandi ?"
                suffix="cm"
                expected={big[2]}
                parse={parseDec}
                display={`${formatDec(big[2])} cm`}
                explain={`Le rapport d’agrandissement se lit sur le petit côté : 7,5 ÷ 3 = ${formatDec(ratioOfLengths(TRI[0], big[0]))}. Tous les côtés sont multipliés par ${formatDec(K_TRI)} : 4 → ${formatDec(big[1])}, 5 → ${formatDec(big[2])} cm. Les longueurs des deux triangles sont proportionnelles — c’est exactement ce que dit le théorème de Thalès.`}
                explainFor={(n) => {
                  if (n === 9.5) return '5 + 4,5 ajoute l’écart du petit côté (7,5 − 3). Mais on MULTIPLIE : 5 × 2,5 = 12,5 cm.';
                  if (n === 10) return '10 cm, c’est le côté de 4 agrandi. Le plus grand côté : 5 × 2,5 = 12,5 cm.';
                  return null;
                }}
                solved={thalesDone}
                onAnswered={() => setThalesDone(true)}
              />
            </div>
          ),
        },
        {
          num: 5,
          title: 'Vérifier un résultat',
          subtitle: 'Une photo 10 cm × 15 cm est agrandie : sa largeur devient 40 cm.',
          done: checkDone,
          content: (
            <TapQuestion
              prompt="Un élève annonce une hauteur de 45 cm. Est-ce cohérent ?"
              options={['Non : 40 ÷ 10 = 4 mais 45 ÷ 15 = 3 — les rapports diffèrent, il faut 60 cm', 'Oui : 45 est bien plus grand que 15', 'Oui : 40 − 10 = 30 et 15 + 30 = 45', 'On ne peut pas savoir sans la photo']}
              correct={0}
              cols={1}
              explain="Vérifier, c’est comparer les RAPPORTS : la largeur a été multipliée par 4, la hauteur doit l’être aussi : 15 × 4 = 60 cm. Avec 45 cm, la photo serait déformée. « Plus grand » ne suffit pas ; « même rapport » est le test."
              solved={checkDone}
              onAnswered={() => setCheckDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          <strong>À retenir.</strong> Agrandissement ou réduction de rapport k : longueurs × k, aires × k², volumes × k³.
          Les longueurs d’une figure et de son agrandie sont proportionnelles (Thalès), et un résultat se vérifie
          en comparant les rapports. Prochaine étape : les pourcentages, qui sont eux aussi des multiplications.
        </Feedback>
      }
    />
  );
}
