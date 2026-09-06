import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TaxiMeter from '../components/TaxiMeter';
import { image, receipt, formatAffine } from '../components/affineUtils';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 1 — DÉCLENCHEUR : « Le taxi et le forfait » (manipulation signature).
 *
 * Activity: monter dans un taxi, rouler, lire le compteur et la facture en
 *   deux lignes ; prédire ; puis changer de compagnie et comparer.
 * Mathematical objective: faire apparaître qu'il faut DEUX nombres, alors que
 *   la leçon précédente n'en demandait qu'un. La forme ax + b naît de ce
 *   manque : un prix payé dès le départ, un prix par kilomètre.
 * Student action: glisser la distance (ou ±) ; prédire un prix ; toucher des
 *   pastilles de tarif.
 * Controlled variable: la distance x ; puis, par pastilles, la prise en charge
 *   et le prix du kilomètre.
 * Mathematical state: { a, b, km } — chaque prix affiché est calculé par
 *   `receipt`, jamais écrit en dur, donc l'énoncé ne peut pas mentir.
 * Visual consequence: le taxi avance, le compteur grimpe ; la ligne « prise en
 *   charge » ne bouge pas quand la distance change ; la trace démarre à la
 *   hauteur de la prise en charge ; changer de compagnie décale le départ ou
 *   change la pente de la trace.
 * Expected observation: « à 0 km je paie déjà 2 € » ; « deux fois plus loin
 *   n'est pas deux fois plus cher » ; « deux réglages, deux effets ».
 * Misconception targeted: appliquer la proportionnalité malgré la part fixe.
 * Feedback: compteur et facture ; explainFor cible l'oubli de la prise en
 *   charge et l'inversion des deux rôles.
 * Formalization: le mot « affine » et l'écriture ax + b sont posés par des
 *   <KnowledgeBrick>, à l'instant du geste qui leur donne sens — jamais en pied
 *   de module. Les noms de a et b restent le travail des modules 2 et 3, qui
 *   isolent chacun des deux avec un curseur continu.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Ce module posait autrefois « fonction affine » et ax + b dans son SEUL
 *   footer, c'est-à-dire après ses cinq étapes — donc après les questions qui
 *   raisonnaient déjà sur la part fixe, et avant que le module 2 n'ouvre en
 *   parlant de « a » et « b » comme de choses connues. L'ordre est maintenant :
 *     étape 1  rouler jusqu'à 0 km  → brique `part-fixe-part-variable`
 *     étape 3  deux factures        → brique `mem-affine-vs-lineaire`
 *     étape 4  les deux réglages    → briques `fonction-affine` puis `forme-ax-b`
 *   Les lettres a et b ne sont prononcées qu'à l'étape 4, une fois les deux
 *   réglages manipulés — avant, on dit « prise en charge » et « prix du
 *   kilomètre ».
 * Scaffolding: distance seule → prédictions → tarifs par pastilles → tri.
 * Transfer: les modules 2 et 3 isolent chacun des deux nombres.
 */

const A = 1.5;    // 1,50 € par kilomètre
const B = 2;      // 2 € de prise en charge
const KM_MAX = 10;
const TARIFFS = { fixed: [0, 2, 5], rate: [1, 1.5, 2] };
const Y_MAX = Math.max(...TARIFFS.fixed) + Math.max(...TARIFFS.rate) * KM_MAX;   // 25

export default function Module01TaxiEtForfait() {
  const [km, setKm] = useState(3);
  const [visited, setVisited] = useState(() => new Set([3]));
  const [a, setA] = useState(A);
  const [b, setB] = useState(B);
  const [seenA, setSeenA] = useState(() => new Set([A]));
  const [seenB, setSeenB] = useState(() => new Set([B]));
  const [fixedPartDone, setFixedPartDone] = useState(false);
  const [predictDone, setPredictDone] = useState(false);
  const [propDone, setPropDone] = useState(false);
  const [formDone, setFormDone] = useState(false);
  const [sortDone, setSortDone] = useState(false);

  const done1 = visited.has(0) && visited.size >= 3;
  const done4 = seenA.size >= 2 && seenB.size >= 2;

  const drive = (v, kit) => {
    if (v === km) return;
    setKm(v);
    setVisited((prev) => new Set(prev).add(v));
    kit.react(true);
  };
  const changeTariff = ({ a: na, b: nb }, kit) => {
    if (na === a && nb === b) return;
    setA(na); setB(nb);
    setSeenA((prev) => new Set(prev).add(na));
    setSeenB((prev) => new Set(prev).add(nb));
    kit.react(true);
  };

  const bill = (d, ra = A, rb = B) => {
    const r = receipt(ra, rb, d);
    return (
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{formatDec(d)} km</p>
        <div className="flex justify-between gap-3"><span>Prise en charge</span><span className="font-mono tabular-nums">{formatDec(r.fixed, { minDecimals: 2 })} €</span></div>
        <div className="flex justify-between gap-3"><span>{formatDec(d)} km × {formatDec(ra)} €</span><span className="font-mono tabular-nums">{formatDec(r.variable, { minDecimals: 2 })} €</span></div>
        <div className="flex justify-between gap-3 border-t border-slate-300 pt-1 font-bold"><span>Total</span><span className="font-mono tabular-nums">{formatDec(r.total, { minDecimals: 2 })} €</span></div>
      </div>
    );
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le taxi et le forfait"
      moduleSubtitle="Deux nombres commandent le prix : celui qu’on paie d’avance, et celui qui court."
      estimatedTime="7 min"
      brief={{
        tag: '🚕 Mission 01',
        title: 'Monte, roule, et regarde le compteur',
        tone: 'indigo',
        body: (
          <p>
            Tu montes dans un taxi. Fais-le avancer et observe le compteur : que paie-t-on
            avant même d’avoir roulé ? Et de combien grimpe le prix à chaque kilomètre ?
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Roule',
          subtitle: 'Avance, recule — et reviens jusqu’à 0 km.',
          done: done1 && fixedPartDone,
          content: (kit) => (
            <div className="space-y-3">
              <TaxiMeter a={a} b={b} km={km} onKmChange={(v) => drive(v, kit)} kmMax={KM_MAX} yMax={Y_MAX} />
              <Feedback tone={done1 ? 'ok' : 'info'}>
                {done1 ? (
                  <>
                    À <strong>0 km</strong>, le compteur affiche déjà <strong>{formatDec(b, { minDecimals: 2 })} €</strong> :
                    la prise en charge. Ensuite, chaque kilomètre ajoute {formatDec(a, { minDecimals: 2 })} €.
                    Un seul nombre ne suffit plus à décrire ce prix.
                  </>
                ) : (
                  <>
                    {visited.has(0)
                      ? <>Continue de rouler : essaie encore {3 - visited.size} distance{3 - visited.size > 1 ? 's' : ''}.</>
                      : <>Recule jusqu’à <strong>0 km</strong> : que paie-t-on quand on n’a pas encore roulé ?</>}
                  </>
                )}
              </Feedback>

              {done1 && (
                <KnowledgeBrick
                  id="part-fixe-part-variable"
                  variant="new"
                  lead="Tu viens de voir le compteur non nul à 0 km, puis grimper. Ces deux morceaux du prix ont un nom."
                >
                  <TapQuestion
                    prompt="Une salle se loue 40 € plus 6 € par personne. Quelle est la part fixe ?"
                    options={['40 €, la location', '6 €, par personne', '46 €, les deux ensemble']}
                    correct={0}
                    cols={1}
                    requires={['part-fixe-part-variable']}
                    explain="Les 40 € sont dus même sans personne : c’est la part fixe. Les 6 € par personne forment la part variable."
                    explainWrong="Demande-toi ce qu’on paie pour ZÉRO personne : il reste 40 €."
                    solved={fixedPartDone}
                    onAnswered={(ok) => { setFixedPartDone(true); kit.react(ok); }}
                  />
                </KnowledgeBrick>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Prédis, puis roule',
          subtitle: 'Écris ta prédiction ; la facture de la course apparaîtra ensuite.',
          done: predictDone,
          content: (
            <NumericQuestion
              prompt={`Combien coûte une course de ${KM_MAX} km ?`}
              expected={image(A, B, KM_MAX)}
              parse={parseDec}
              display={formatDec(image(A, B, KM_MAX))}
              suffix="€"
              requires={['part-fixe-part-variable']}
              above={(revealed) => revealed && bill(KM_MAX)}
              explain={`1,50 × ${KM_MAX} = ${formatDec(A * KM_MAX)} €, plus les 2 € de prise en charge : ${formatDec(image(A, B, KM_MAX))} €. Deux parts, deux rôles.`}
              explainFor={(n) => {
                if (n === A * KM_MAX) return 'Tu as compté les kilomètres mais oublié les 2 € dus dès la montée.';
                if (n === B * KM_MAX) return 'Tu as multiplié par 2 : c’est 1,50 € qui multiplie la distance, les 2 € s’ajoutent une seule fois.';
                if (n === KM_MAX + B) return 'Tu as ajouté 2 à 10. Les kilomètres coûtent 1,50 € chacun : 1,5 × 10 = 15.';
                return null;
              }}
              solved={predictDone}
              onAnswered={() => setPredictDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Deux fois plus loin, deux fois plus cher ?',
          done: propDone,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="Une course de 2 km coûte 5 €. Une course de 4 km coûte-t-elle 10 € ?"
                above={(revealed) => revealed && (
                  <div className="grid grid-cols-2 gap-2">{bill(2)}{bill(4)}</div>
                )}
                options={[
                  'Non : elle coûte 8 €, car les 2 € ne doublent pas',
                  'Oui : deux fois plus loin, deux fois plus cher',
                  'Non : elle coûte 11 €',
                ]}
                correct={0}
                cols={1}
                requires={['part-fixe-part-variable']}
                explain="2 km : 3 + 2 = 5 €. 4 km : 6 + 2 = 8 €. Les kilomètres doublent, la prise en charge non — donc le prix ne double pas. Ce n’est pas une situation de proportionnalité."
                explainWrong="Compare les deux factures : la ligne des kilomètres double (3 € → 6 €), la prise en charge reste à 2 €. Le total passe de 5 € à 8 €, pas à 10 €."
                solved={propDone}
                onAnswered={() => setPropDone(true)}
              />
              {propDone && (
                <KnowledgeBrick
                  id="mem-affine-vs-lineaire"
                  variant="new"
                  compact
                  lead="Les deux factures côte à côte l’ont montré. C’est ce qui sépare ce tarif d’un tarif proportionnel."
                />
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Change de taxi',
          subtitle: 'Essaie une autre prise en charge, puis un autre prix du kilomètre. Roule à chaque fois.',
          done: done4 && formDone,
          content: (kit) => (
            <div className="space-y-3">
              <TaxiMeter
                a={a} b={b} km={km}
                onKmChange={(v) => drive(v, kit)}
                kmMax={KM_MAX}
                yMax={Y_MAX}
                tariffs={TARIFFS}
                onTariffChange={(t) => changeTariff(t, kit)}
              />
              <Feedback tone={done4 ? 'ok' : 'info'}>
                {done4 ? (
                  <>
                    Deux réglages, deux effets. La <strong>prise en charge</strong> décide d’où
                    la trace <em>démarre</em> (le prix à 0 km) ; le <strong>prix du kilomètre</strong>{' '}
                    décide de la vitesse à laquelle elle <em>grimpe</em>. Ni l’un ni l’autre ne fait
                    le travail de l’autre.
                  </>
                ) : (
                  <>
                    {seenB.size < 2 && <>Change la prise en charge : que devient le compteur à 0 km ? Et la hauteur de départ de la trace ? </>}
                    {seenA.size < 2 && <>Change le prix du kilomètre : la trace grimpe-t-elle plus vite ou plus lentement ?</>}
                  </>
                )}
              </Feedback>

              {done4 && (
                <>
                  <KnowledgeBrick
                    id="fonction-affine"
                    variant="new"
                    lead="Le prix que tu viens de régler dans les deux sens porte un nom en mathématiques."
                  />
                  <KnowledgeBrick
                    id="forme-ax-b"
                    variant="new"
                    lead="Et pour ne plus écrire « prise en charge » et « prix du kilomètre » à chaque fois, on leur donne deux lettres."
                  >
                    <NumericQuestion
                      prompt={<>Un taxi facture <MathText>{'$f(x) = 2x + 3$'}</MathText>, où x est la distance. Combien coûte une course de 5 km ?</>}
                      expected={image(2, 3, 5)}
                      parse={parseDec}
                      display={formatDec(image(2, 3, 5))}
                      suffix="€"
                      requires={['forme-ax-b', 'part-fixe-part-variable']}
                      explain="2 × 5 = 10 pour les kilomètres, plus les 3 € de prise en charge : 13 €. On multiplie par a d’abord, on ajoute b ensuite."
                      explainFor={(n) => {
                        if (n === 10) return 'Tu as compté les kilomètres et oublié le « + 3 », la part fixe.';
                        if (n === 16) return 'Tu as ajouté 3 à 5 avant de multiplier : c’est 2 × 5 puis + 3, pas 2 × (5 + 3).';
                        if (n === 8) return 'Tu as échangé les rôles : c’est 2 qui multiplie la distance, 3 qui s’ajoute une seule fois.';
                        return null;
                      }}
                      solved={formDone}
                      onAnswered={(ok) => { setFormDone(true); kit.react(ok); }}
                    />
                  </KnowledgeBrick>
                </>
              )}
            </div>
          ),
        },
        {
          num: 5,
          title: 'Où est la part fixe ?',
          done: sortDone,
          content: (
            <BatchChoiceQuestion
              intro={<p className="text-sm text-slate-600">Chaque situation a-t-elle une part fixe, payée même pour zéro ?</p>}
              requires={['part-fixe-part-variable', 'mem-affine-vs-lineaire']}
              rows={[
                { id: 's1', label: 'Cinéma : 6 € la place', options: ['part fixe', 'aucune part fixe'], correct: 1,
                  correction: 'Zéro place coûte 0 € : proportionnel, donc fonction linéaire.' },
                { id: 's2', label: 'Salle : 40 € de location + 6 € par personne', options: ['part fixe', 'aucune part fixe'], correct: 0,
                  correction: 'Les 40 € sont dus même sans personne : c’est la part fixe.' },
                { id: 's3', label: 'Essence : 1,80 € le litre', options: ['part fixe', 'aucune part fixe'], correct: 1,
                  correction: 'Zéro litre coûte 0 € : proportionnel.' },
                { id: 's4', label: 'Abonnement : 15 € par mois + 0,10 € la minute', options: ['part fixe', 'aucune part fixe'], correct: 0,
                  correction: 'Les 15 € sont dus même sans appeler.' },
              ]}
              feedback={({ allRight, nCorrect, total }) =>
                allRight
                  ? <>Les quatre sont justes. Le test tient en une question : <strong>que paie-t-on pour zéro ?</strong></>
                  : <>{nCorrect} sur {total}. Demande-toi toujours ce qu’on paie quand la quantité vaut 0.</>
              }
              solved={sortDone}
              onAnswered={() => setSortDone(true)}
            />
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Le premier taxi s’écrit{' '}
          <MathText>{`$${formatAffine(A, B)}$`}</MathText>. Deux réglages, deux effets — mais
          lequel fait quoi, exactement ? Au module suivant, on en bloque un pour ne regarder
          que l’autre.
        </KnowledgeSnapshot>
      )}
    />
  );
}
