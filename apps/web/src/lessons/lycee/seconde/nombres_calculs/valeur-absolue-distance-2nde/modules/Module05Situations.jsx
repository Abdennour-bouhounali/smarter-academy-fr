import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import RealLine from '../../../../../common/components/RealLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseDec } from '../components/absUtils';

/**
 * Module 5 — PRACTICE LAB : « Situations ». La manipulation s'efface : des
 * situations à traduire en |x − a| ≤ r puis en intervalle, et une lecture
 * de tolérance.
 */
export default function Module05Situations() {
  const [d1a, setD1a] = useState(false);
  const [d1b, setD1b] = useState(false);
  const [d2, setD2] = useState(false);
  const [d3, setD3] = useState(false);
  const [d4, setD4] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Situations"
      moduleSubtitle="Une vis à 20 mm ± 0,5, un vaccin entre 2 et 8 °C, un randonneur à moins de 1,5 km de la borne 12."
      estimatedTime="8 min"
      brief={{ tag: '🔧 Mission 06', title: 'Une tolérance, une plage, une position approximative : trois distances déguisées.', tone: 'indigo', body: <p>À chaque fois, trouve le centre, le rayon, puis l’intervalle.</p> }}
      steps={[
        {
          num: 1, title: 'La vis', subtitle: 'Une vis doit mesurer 20 mm à 0,5 mm près : |d − 20| ≤ 0,5.', done: d1a && d1b,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
                <RealLine min={18.5} max={21.5} step={0.25} labelEvery={2} format={(v) => (Number.isInteger(v * 2) ? String(v).replace('.', ',') : '')} intervals={[{ id: 'tol', from: 19.5, to: 20.5, tone: 'emerald', label: '|d − 20| ≤ 0,5' }]} points={[{ id: 'c', value: 20, label: '20', tone: 'amber' }, { id: 'v', value: 20.6, label: '20,6', tone: 'rose', open: true }]} ariaLabel="Tolérance de 19,5 à 20,5 mm, une vis à 20,6 mm" />
              </div>
              {/* Le schéma vient de traduire « 20 mm à 0,5 mm près » en
                  |d − 20| ≤ 0,5 : c'est l'instant où « lire une tolérance »
                  se nomme, avant la question qui l'exige. */}
              <KnowledgeBrick
                id="methode-tolerance"
                variant="new"
                compact
                lead={<>« 20 mm à 0,5 mm près » : un centre (20) et un rayon (0,5), exactement comme le faisceau du phare.</>}
              />
              <TapQuestion prompt="Quelles longueurs d sont acceptées ?" options={['[19,5 ; 20,5]', '[20 ; 20,5]', ']19,5 ; 20,5[', '[19,5 ; 20]']} cols={2} correct={0}
                requires={['methode-tolerance', 'faisceau-intervalle', 'intervalle-crochets']}
                explain="Centre 20, rayon 0,5, bornes incluses (≤) : [19,5 ; 20,5]. Une vis de 20,6 mm est refusée : |20,6 − 20| = 0,6 > 0,5."
                explainWrong="La tolérance joue des DEUX côtés de 20 (plus court ou plus long), et « à 0,5 près » inclut 0,5 : [19,5 ; 20,5]."
                solved={d1a} onAnswered={() => setD1a(true)} />
              {d1a && (
                <NumericQuestion prompt="Une vis mesure 19,45 mm. De combien dépasse-t-elle la tolérance ?" expected={0.05} parse={parseDec} display="0,05" suffix="mm"
                  requires={['methode-tolerance', 'mem-distance']}
                  explain="|19,45 − 20| = 0,55 ; la tolérance est 0,5 ; elle dépasse de 0,55 − 0,5 = 0,05 mm."
                  explainFor={(v) => (v === 0.55 ? '0,55 est sa distance à 20. La tolérance autorise 0,5 : le dépassement est 0,55 − 0,5 = 0,05 mm.' : v === 0.45 ? '0,45 serait la distance à 19 — le centre est 20 : |19,45 − 20| = 0,55, dépassement 0,05.' : 'Distance au centre : |19,45 − 20| = 0,55 ; tolérance 0,5 ; dépassement 0,05 mm.')}
                  solved={d1b} onAnswered={() => setD1b(true)} />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Le vaccin', subtitle: 'Un vaccin se conserve entre 2 °C et 8 °C inclus.', done: d2,
          content: (
            <TapQuestion prompt="Quelle inégalité en valeur absolue traduit cette plage ?" options={['|T − 5| ≤ 3', '|T − 2| ≤ 8', '|T − 5| < 3', '|T − 3| ≤ 5']} cols={2} correct={0}
              requires={['methode-tolerance', 'faisceau-intervalle']}
              explain="Centre = (2 + 8) ÷ 2 = 5, rayon = (8 − 2) ÷ 2 = 3, bornes incluses : |T − 5| ≤ 3. Un frigo réglé sur 5 °C avec une tolérance de 3 °C."
              explainWrong="Le centre est le milieu de 2 et 8, soit 5 ; le rayon la moitié de 6, soit 3 ; « inclus » → ≤. Donc |T − 5| ≤ 3."
              solved={d2} onAnswered={() => setD2(true)} />
          ),
        },
        {
          num: 3, title: 'Le randonneur', subtitle: 'Un randonneur est à moins de 1,5 km (strictement) de la borne kilométrique 12.', done: d3,
          content: (
            <div className="space-y-3">
              <TapQuestion prompt="Entre quelles bornes se trouve-t-il ?" options={[']10,5 ; 13,5[', '[10,5 ; 13,5]', '[12 ; 13,5[', ']12 ; 13,5]']} cols={2} correct={0}
                requires={['methode-tolerance', 'faisceau-intervalle']}
                explain="|x − 12| < 1,5 : centre 12, rayon 1,5, strict → intervalle ouvert ]10,5 ; 13,5[. Il peut être avant ou après la borne 12."
                explainWrong="« À moins de 1,5 km de la borne 12 » : des deux côtés de 12 (avant et après), et « strictement » exclut les bords : ]10,5 ; 13,5[."
                solved={d3} onAnswered={() => setD3(true)} />
              {d3 && (
                <KnowledgeBrick
                  id="regle-deux-positions"
                  variant="new"
                  compact
                  lead={<>Le randonneur pouvait être n’importe où dans une plage. À une distance EXACTE (pas « moins de »), il n’y a plus que deux positions possibles, une de chaque côté.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'Deux positions', done: d4,
          content: (
            <TapQuestion prompt="Un bateau est exactement à 3 km d’un phare situé au km −2. Où est-il ?" options={['Au km −5 ou au km 1', 'Au km 1', 'Au km −5', 'Au km 3 ou au km −3']} cols={2} correct={0}
              requires={['regle-deux-positions', 'equation-distance-egale']}
              explain="|x − (−2)| = 3, soit |x + 2| = 3 : x = −2 − 3 = −5 ou x = −2 + 3 = 1. Deux positions, de part et d’autre du phare."
              explainWrong="Une distance donnée définit DEUX positions, une de chaque côté : −2 − 3 = −5 et −2 + 3 = 1. Les positions ±3 seraient à 3 km du km 0, pas du km −2."
              solved={d4} onAnswered={() => setD4(true)} />
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
