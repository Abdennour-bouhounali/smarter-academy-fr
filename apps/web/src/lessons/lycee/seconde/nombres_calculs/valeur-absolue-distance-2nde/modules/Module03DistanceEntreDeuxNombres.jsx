import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DistanceLine from '../components/DistanceLine';
import Stepper from '../components/Stepper';
import { distance, parseDec } from '../components/absUtils';

/**
 * Module 3 — DISCOVERY : « La distance entre deux nombres ».
 * Activity: deux bateaux mobiles a et b ; lire l'écart ; avancer les deux
 *   ensemble ; calculer |b − a|.
 * Mathematical objective: distance(a, b) = |b − a| = |a − b| ; invariance
 *   par translation ; le calcul « grand − petit » n'est qu'un cas de |b − a|.
 * Expected observation: la barre entre −3 et 5 mesure 8 ; en avançant les
 *   deux de 2 km elle ne change pas ; |5 − (−3)| = |(−3) − 5| = 8.
 * Misconception targeted: « distance = 5 − 3 = 2 » (signe oublié), « la
 *   distance dépend de l'ordre ».
 */
export default function Module03DistanceEntreDeuxNombres() {
  const [a, setA] = useState(-3);
  const [b, setB] = useState(5);
  const [shifts, setShifts] = useState(0);
  const [orderDone, setOrderDone] = useState(false);
  const [calcDone, setCalcDone] = useState(false);
  const measureDone = a === -3 && b === 5 ? false : true;
  const d = distance(a, b);
  const shift = (k) => { if (a + k < -10 || b + k > 10 || a + k > 10 || b + k < -10) return; setA(a + k); setB(b + k); setShifts(shifts + 1); };

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="La distance entre deux nombres"
      moduleSubtitle="Deux bateaux, une barre entre eux : |b − a| ou |a − b|, c’est la même longueur. Et si les deux avancent ?"
      estimatedTime="8 min"
      brief={{ tag: '⛵ Mission 03', title: 'Bateau A au km −3, bateau B au km 5. Ils doivent rester à 8 km l’un de l’autre.', tone: 'indigo', body: <p>Déplace-les, puis fais-les avancer ensemble. Que devient la barre ?</p> }}
      steps={[
        {
          num: 1, title: 'Mesure l’écart', subtitle: 'Déplace un bateau (au moins une fois), puis fais avancer les deux ensemble de 2 km, deux fois.', done: measureDone && shifts >= 2,
          content: (kit) => (
            <div className="space-y-3">
              <DistanceLine x={b} onX={setB} a={a} onA={setA} labelX="B" labelA="A" unit="km" min={-10} max={10} step={1} snap={0.5} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Stepper label="A" value={a} onChange={setA} min={-10} max={10} step={0.5} tone="amber" unit=" km" />
                <Stepper label="B" value={b} onChange={setB} min={-10} max={10} step={0.5} unit=" km" />
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => { shift(2); if (shifts === 1) kit.react(true); }} className="min-h-[44px] px-4 rounded-xl bg-emerald-600 text-white font-mono text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Les deux avancent de 2 km →</button>
                <button type="button" onClick={() => shift(-2)} className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-slate-700 font-mono text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">← Les deux reculent de 2 km</button>
              </div>
              <Feedback tone={shifts >= 2 ? 'ok' : 'info'}>
                A = {a} km, B = {b} km : écart <strong>{d} km</strong>. {shifts >= 2 ? 'Les deux ont avancé ensemble et la barre n’a pas bougé : la distance ne dépend que de l’écart entre les deux nombres, pas de l’endroit où ils sont.' : 'Quand les deux avancent du même pas, regarde la barre.'}
              </Feedback>
              {/* Le geste vient de montrer la barre entre A et B, puis son
                  invariance quand les deux avancent ensemble : les deux
                  bricks se posent ici, avant la question de l'étape 2. */}
              {shifts >= 2 && (
                <KnowledgeBrick
                  id="distance-deux-nombres"
                  variant="new"
                  compact
                  lead={<>La barre entre A et B mesure <strong>{d} km</strong>, quel que soit l’ordre dans lequel on la lit.</>}
                />
              )}
              {shifts >= 2 && (
                <KnowledgeBrick
                  id="regle-distance-invariante"
                  variant="new"
                  compact
                  lead={<>A et B ont avancé ensemble, deux fois : la barre entre eux n’a pas bougé.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Dans quel ordre soustraire ?', done: orderDone,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="A = −3 et B = 5. Quelle expression donne leur distance ?"
                options={['|5 − (−3)|', '|(−3) − 5|', 'Les deux : elles valent 8', '5 − 3 = 2']} cols={2} correct={2}
                requires={['distance-deux-nombres', 'regle-distance-invariante', 'nombres-relatifs']}
                explain="5 − (−3) = 8 et (−3) − 5 = −8 : les valeurs absolues sont toutes deux 8. La distance entre a et b est |b − a| = |a − b| — l’ordre n’a pas d’importance, la valeur absolue s’en charge."
                explainWrong="Les deux différences sont opposées (8 et −8), donc leurs valeurs absolues sont égales : 8. Et 5 − 3 = 2 oublie le signe de −3 : de −3 à 5 il y a 3 km jusqu’au phare, puis 5 km."
                solved={orderDone} onAnswered={() => setOrderDone(true)} />
              {/* La question vient de confirmer la formule d(a;b) = |b−a| =
                  |a−b| : elle se retient ici, avant le calcul sans la côte de
                  l'étape 3. */}
              {orderDone && (
                <KnowledgeBrick
                  id="mem-distance"
                  variant="new"
                  compact
                  lead={<>Les deux expressions valaient 8 : |b − a| = |a − b|, la formule de la distance.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'Calcule sans la côte', done: calcDone,
          content: (
            <NumericQuestion
              prompt="Quelle est la distance entre −7,5 et −2 ?"
              expected={5.5} parse={parseDec} display="5,5" suffix="km"
              requires={['mem-distance', 'distance-deux-nombres']}
              explain="|−2 − (−7,5)| = |−2 + 7,5| = |5,5| = 5,5. Ou |−7,5 − (−2)| = |−5,5| = 5,5 : même résultat."
              explainFor={(v) => (v === 9.5 ? 'Tu as additionné 7,5 et 2. Les deux nombres sont du MÊME côté du phare : la distance est la différence des distances, 7,5 − 2 = 5,5.' : v === -5.5 ? 'Une distance n’est jamais négative : |−5,5| = 5,5.' : 'Calcule b − a = −2 − (−7,5) = 5,5, puis prends la valeur absolue : 5,5.')}
              solved={calcDone} onAnswered={() => setCalcDone(true)} />
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
