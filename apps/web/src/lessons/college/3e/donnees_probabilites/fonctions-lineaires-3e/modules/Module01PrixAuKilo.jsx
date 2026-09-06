import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ScalingLab from '../components/ScalingLab';
import { image, priceWithFixed, coefficientFromPair } from '../components/linearUtils';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 1 — DÉCLENCHEUR : « Le prix au kilo » (manipulation signature).
 *
 * Activity: peser des cerises sur une balance dont la caisse répond ; noter
 *   les couples ; prédire le double ; découvrir le rapport constant, les
 *   points alignés avec l'origine, puis casser tout cela avec une barquette.
 * Mathematical objective: faire RECONNAÎTRE une fonction linéaire dans une
 *   situation de proportionnalité que l'élève sait déjà traiter — la nouveauté
 *   est le nom et l'écriture f(x) = ax, pas la mathématique.
 * Student action: glisser la masse (ou ±), noter au tableau, prédire, relier,
 *   ajouter une barquette.
 * Controlled variable: la masse x (pas 0,5 kg) ; puis la part fixe (0 ou 1 €).
 * Mathematical state: { a: 4, recorded:Set<x>, fixed } — chaque prix, chaque
 *   rapport, chaque point est calculé par `priceWithFixed`, jamais saisi.
 * Visual consequence: les tuiles de cerises et les pièces s'allongent ensemble ;
 *   le tableau se remplit ; les points s'alignent avec O ; la barquette décale
 *   tous les points et la droite rate O.
 * Expected observation: « c'est toujours le même nombre qui multiplie » et
 *   « 0 kg → 0 €, donc la droite passe par O — sauf avec la barquette ».
 * Misconception targeted: ajouter 4 au lieu de multiplier ; croire qu'une
 *   part fixe reste proportionnelle.
 * Feedback: la lecture « x kg → y € » ; explainFor cible l'addition ; la
 *   colonne des rapports montre le 4 partout.
 * Formalization: f(x) = 4x est posé À L'ÉTAPE 4, par une brique, dès que la
 *   colonne des rapports a montré le 4 partout — puis essayé immédiatement.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Ce module posait « fonction linéaire » dans un `explain` d'étape 4 et
 *   f(x) = ax dans son `footer` — c'est-à-dire APRÈS les avoir exigés, et pour
 *   le footer après TOUTES les étapes. L'ordre est maintenant :
 *     étape 3  rappel de la notation f(x) (acquis de la leçon « Fonctions »)
 *     étape 4  la colonne des rapports montre le 4 → briques `fonction-lineaire`
 *              et `lineaire-est-proportionnalite` → essai immédiat f(3)
 *     étape 6  la barquette casse tout → brique `mem-zero-donne-zero`
 *   Le mot « linéaire » n'est prononcé nulle part avant l'étape 4, et la
 *   fonction affine — objet d'une autre leçon — n'est plus nommée du tout.
 * Scaffolding: masse libre → prédiction → prix hors balance → rapport →
 *   graphique → contre-exemple.
 * Transfer: le module 2 fait varier le coefficient ; le module 3 fait pivoter
 *   la droite — ici on constate seulement qu'elle passe par O pour a = 4.
 */

const A = 4;                       // 4 € le kilo
const X_MAX = 5;
const OUTSIDE_X = 7;               // au-delà de la balance : il faut calculer
const RANGE = { xMin: 0, xMax: X_MAX, yMin: 0, yMax: 24 };
const UNIT = 44;
const UNIT_Y = 220 / (RANGE.yMax - RANGE.yMin);

export default function Module01PrixAuKilo() {
  const [x, setX] = useState(1);
  const [recorded, setRecorded] = useState(() => new Set());
  const [doubleDone, setDoubleDone] = useState(false);
  const [outsideDone, setOutsideDone] = useState(false);
  const [ratioDone, setRatioDone] = useState(false);
  const [nameDone, setNameDone] = useState(false);
  const [originDone, setOriginDone] = useState(false);
  const [fixed, setFixed] = useState(0);
  const [notPropDone, setNotPropDone] = useState(false);

  const rows = [...recorded].sort((p, q) => p - q).map((m) => ({ x: m, y: image(A, m) }));
  const done1 = recorded.size >= 3;

  const record = (m, kit) => {
    if (recorded.has(m)) return;
    setRecorded((prev) => new Set(prev).add(m));
    kit.react(true);
  };

  const receipt = (m, extra = 0) => (
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{formatDec(m)} kg</p>
      <div className="flex flex-wrap justify-center gap-1" aria-hidden="true">
        {Array.from({ length: Math.round(priceWithFixed(A, m, extra)) }, (_, i) => (
          <span key={i} className="w-6 h-6 rounded-full bg-amber-100 border-2 border-amber-400 text-[10px] font-bold text-amber-800 flex items-center justify-center">1</span>
        ))}
      </div>
      <p className="font-mono font-bold text-amber-700 tabular-nums">{formatDec(priceWithFixed(A, m, extra))} €</p>
    </div>
  );

  const plane = (withLine, extra) => (
    <CoordPlane
      range={RANGE}
      unit={UNIT}
      unitY={UNIT_Y}
      xStep={1}
      yStep={4}
      functions={withLine ? [{ id: 'f', a: A, b: extra, tone: extra ? 'rose' : 'emerald' }] : []}
      points={[
        { id: 'O', name: 'O', x: 0, y: 0, color: '#e11d48' },
        ...rows.map((r) => ({ id: `p${r.x}`, x: r.x, y: priceWithFixed(A, r.x, extra), color: extra ? '#e11d48' : '#059669' })),
      ]}
      axisLabels={{ x: 'kg', y: '€' }}
      ariaLabel={`Repère : prix selon la masse${extra ? ', avec la barquette' : ''}`}
      caption={false}
    />
  );

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le prix au kilo"
      moduleSubtitle="Une balance, un prix : tu connais déjà cette fonction sans le savoir."
      estimatedTime="7 min"
      brief={{
        tag: '🍒 Mission 01',
        title: 'Des cerises à 4 € le kilo',
        tone: 'indigo',
        body: (
          <p>
            Pose des cerises sur la balance : la caisse répond aussitôt. Fais varier la
            masse, regarde les pièces — que remarques-tu ?
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Pèse, regarde, note',
          subtitle: 'Fais varier la masse, puis note au moins trois couples différents.',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <ScalingLab
                a={A}
                x={x}
                onXChange={setX}
                xMax={X_MAX}
                onRecord={(m) => record(m, kit)}
                recorded={recorded}
              />
              {rows.length > 0 && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 overflow-x-auto">
                  <table className="w-full text-sm">
                    <caption className="sr-only">Couples notés : masse et prix</caption>
                    <tbody>
                      <tr>
                        <th scope="row" className="text-left pr-2 font-semibold text-slate-600 whitespace-nowrap">Masse (kg)</th>
                        {rows.map((r) => <td key={`x${r.x}`} className="px-2 text-center font-mono tabular-nums">{formatDec(r.x)}</td>)}
                      </tr>
                      <tr>
                        <th scope="row" className="text-left pr-2 font-semibold text-slate-600 whitespace-nowrap">Prix (€)</th>
                        {rows.map((r) => <td key={`y${r.x}`} className="px-2 text-center font-mono tabular-nums text-amber-700 font-bold">{formatDec(r.y)}</td>)}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              <Feedback tone={done1 ? 'ok' : 'info'}>
                {done1 ? (
                  <>Trois couples au tableau. Pour chacun, que faut-il faire à la masse pour obtenir le prix ?</>
                ) : (
                  <>Encore <strong>{3 - recorded.size}</strong> couple{3 - recorded.size > 1 ? 's' : ''} à noter. Essaie aussi 0 kg.</>
                )}
              </Feedback>
            </div>
          ),
        },
        {
          num: 2,
          title: 'Prédis : le double',
          subtitle: 'Réponds avant de regarder les pièces.',
          done: doubleDone,
          content: (
            <TapQuestion
              prompt="1 kg coûte 4 €. Si je pose 2 kg — deux fois plus —, que devient le prix ?"
              options={['Il double : 8 €', 'Il coûte 5 € : un kilo de plus, un euro de plus', 'Il reste 4 €', 'Impossible à savoir sans peser']}
              correct={0}
              cols={1}
              requires={['proportionnalite']}
              above={(revealed) => revealed && (
                <div className="grid grid-cols-2 gap-2">{receipt(1)}{receipt(2)}</div>
              )}
              explain="Deux fois plus de cerises, deux fois plus de pièces : 8 €. Doubler la masse double le prix — c’est la marque d’une situation proportionnelle."
              explainWrong="Regarde les deux caisses : 4 pièces puis 8 pièces. Quand la masse double, le prix double."
              solved={doubleDone}
              onAnswered={() => setDoubleDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Sans peser',
          subtitle: `Appelons p la caisse : p(x) est le prix de x kg. La balance s’arrête à ${X_MAX} kg — et pour ${OUTSIDE_X} kg ?`,
          done: outsideDone,
          content: (kit) => (
            <div className="space-y-3">
              <KnowledgeBrick
                id="notation-fx"
                variant="rappel"
                compact
                lead="La balance est une machine à nombres comme celles de la leçon précédente : on peut lui donner un nom et écrire ses résultats en une ligne."
              />
              <NumericQuestion
                prompt={<>Combien coûtent {OUTSIDE_X} kg de cerises ? Autrement dit, que vaut <MathText>{'$p(7)$'}</MathText> ?</>}
                expected={image(A, OUTSIDE_X)}
                parse={parseDec}
                display={formatDec(image(A, OUTSIDE_X))}
                suffix="€"
                requires={['notation-fx', 'image']}
                explain={`${OUTSIDE_X} × 4 = ${formatDec(image(A, OUTSIDE_X))} €. Le prix s’obtient en multipliant la masse par 4 — même hors de la balance.`}
                explainFor={(n) => {
                  if (n === OUTSIDE_X + A) return 'Tu as ajouté 4 au lieu de multiplier par 4 : ici c’est bien 7 × 4.';
                  if (n === image(A, X_MAX)) return `Tu as pris ${X_MAX} kg, la limite de la balance. On demande ${OUTSIDE_X} kg.`;
                  return null;
                }}
                solved={outsideDone}
                onAnswered={(ok) => { setOutsideDone(true); kit.react(ok); }}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Le nombre qui ne change pas',
          done: ratioDone && nameDone,
          content: (kit) => (
            <div className="space-y-3">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Tes couples, avec le rapport prix ÷ masse</caption>
                  <tbody>
                    <tr>
                      <th scope="row" className="text-left pr-2 font-semibold text-slate-600 whitespace-nowrap">Masse (kg)</th>
                      {rows.map((r) => <td key={`x${r.x}`} className="px-2 text-center font-mono tabular-nums">{formatDec(r.x)}</td>)}
                    </tr>
                    <tr>
                      <th scope="row" className="text-left pr-2 font-semibold text-slate-600 whitespace-nowrap">Prix (€)</th>
                      {rows.map((r) => <td key={`y${r.x}`} className="px-2 text-center font-mono tabular-nums text-amber-700 font-bold">{formatDec(r.y)}</td>)}
                    </tr>
                    <tr className="border-t border-slate-200">
                      <th scope="row" className="text-left pr-2 font-semibold text-indigo-700 whitespace-nowrap">Prix ÷ masse</th>
                      {rows.map((r) => {
                        const k = coefficientFromPair(r.x, r.y);
                        return (
                          <td key={`k${r.x}`} className="px-2 text-center font-mono tabular-nums text-indigo-700 font-bold">
                            {k === null ? '—' : formatDec(k)}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
              <TapQuestion
                prompt="Que représente ce 4 qui revient partout ?"
                options={[
                  'Le prix d’un kilo — le coefficient de proportionnalité',
                  'Le prix total de la commande',
                  'La masse achetée',
                  'Le nombre de sachets',
                ]}
                correct={0}
                cols={1}
                requires={['proportionnalite']}
                explain="4 est le prix d’UN kilo : c’est le coefficient de proportionnalité que tu utilises depuis la 6e. Il ne change jamais, quelle que soit la masse."
                explainWrong="Le prix total change à chaque pesée ; le 4, lui, ne change jamais. C’est le prix par kilo."
                solved={ratioDone}
                onAnswered={() => setRatioDone(true)}
              />

              {ratioDone && (
                <>
                  <KnowledgeBrick
                    id="fonction-lineaire"
                    variant="new"
                    lead="Un nombre fixe qui multiplie, et rien d’autre : cette machine-là porte un nom."
                  />
                  <KnowledgeBrick
                    id="lineaire-est-proportionnalite"
                    variant="new"
                    lead="Et ce nom ne désigne pas une mathématique neuve — regarde la ligne « prix ÷ masse »."
                  >
                    <NumericQuestion
                      prompt={<>La caisse est donc la fonction linéaire <MathText>{'$p(x) = 4x$'}</MathText>. Que vaut <MathText>{'$p(3)$'}</MathText> ?</>}
                      expected={image(A, 3)}
                      parse={parseDec}
                      display={formatDec(image(A, 3))}
                      suffix="€"
                      requires={['fonction-lineaire', 'notation-fx', 'image']}
                      explain="p(3) = 4 × 3 = 12 €. Dans f(x) = ax, on remplace x par le nombre voulu et on multiplie par a."
                      explainFor={(n) => {
                        if (n === 7) return 'Tu as ajouté 4 et 3. Une fonction linéaire MULTIPLIE : 4 × 3.';
                        if (n === 43) return 'Tu as accolé les deux chiffres. 4x veut dire « 4 fois x ».';
                        return null;
                      }}
                      solved={nameDone}
                      onAnswered={(ok) => { setNameDone(true); kit.react(ok); }}
                    />
                  </KnowledgeBrick>
                </>
              )}
            </div>
          ),
        },
        {
          num: 5,
          title: 'Tes couples deviennent des points',
          subtitle: 'Prédis, puis regarde la droite apparaître.',
          done: originDone,
          content: (
            <TapQuestion
              prompt="Si l’on relie tes points par une droite, passera-t-elle par l’origine O ?"
              above={(revealed) => plane(revealed, 0)}
              options={[
                'Oui : 0 kg coûte 0 €, donc (0 ; 0) est sur la droite',
                'Non : elle passe au-dessus de O',
                'Non : elle passe en dessous de O',
                'Impossible à savoir',
              ]}
              correct={0}
              cols={1}
              requires={['fonction-lineaire', 'coordonnees', 'origine-repere']}
              explain="Aucune cerise, aucun euro : le point (0 ; 0) appartient à la droite. Tous tes points sont alignés avec l’origine — c’est ce à quoi ressemble une situation proportionnelle dans un repère."
              explainWrong="Que paie-t-on pour 0 kg ? Rien. Le point (0 ; 0) est donc sur la droite, qui passe par O."
              solved={originDone}
              onAnswered={() => setOriginDone(true)}
            />
          ),
        },
        {
          num: 6,
          title: 'Et si on ajoutait une barquette ?',
          subtitle: 'Le marchand facture 1 € de barquette en plus. Ajoute-la et observe.',
          done: notPropDone,
          content: (kit) => (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => { setFixed(fixed ? 0 : 1); kit.react(true); }}
                aria-pressed={fixed > 0}
                className={`w-full min-h-[48px] rounded-xl border-2 font-semibold transition focus-visible:ring-2 focus-visible:ring-blue-500
                  ${fixed ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-rose-400'}`}
                style={{ touchAction: 'manipulation' }}
              >
                {fixed ? '📦 Barquette ajoutée (1 €) — retirer' : '📦 Ajouter 1 € de barquette'}
              </button>
              <ScalingLab a={A} x={x} onXChange={setX} xMax={X_MAX} fixed={fixed} />
              {plane(true, fixed)}
              <Feedback tone="info">
                {fixed ? (
                  <>Avec la barquette, 0 kg coûte déjà <strong>1 €</strong> : tous les points sont montés d’un cran et la droite ne passe plus par O.</>
                ) : (
                  <>Sans barquette, la droite passe par O. Ajoute la barquette et regarde le point 0 kg.</>
                )}
              </Feedback>
              <TapQuestion
                prompt="Avec 1 € de barquette en plus, est-ce encore une fonction linéaire ?"
                options={[
                  'Non : pour 0 kg on paie déjà 1 €',
                  'Oui : le prix augmente toujours régulièrement',
                  'Oui : il suffit d’ajouter 1 à chaque fois',
                ]}
                correct={0}
                cols={1}
                requires={['fonction-lineaire', 'lineaire-est-proportionnalite']}
                explain="Dans une situation proportionnelle, 0 donne toujours 0 et la droite passe par O. Ici on paie 1 € sans rien acheter : la multiplication ne suffit plus, il faut AJOUTER 1. Ce n’est donc plus une fonction linéaire."
                explainWrong="Vérifie les rapports : 5 ÷ 1 = 5, mais 9 ÷ 2 = 4,5. Ils ne sont pas égaux, donc pas de proportionnalité — et la droite rate O."
                solved={notPropDone}
                onAnswered={() => setNotPropDone(true)}
              />
              {notPropDone && (
                <KnowledgeBrick
                  id="mem-zero-donne-zero"
                  variant="new"
                  compact
                  lead="Tu viens de trouver le test le plus rapide qui existe. Retiens-le tel quel."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Ici le prix au kilo valait 4. Au module suivant, trois
          marchands changent ce nombre — et lui seul.
        </KnowledgeSnapshot>
      )}
    />
  );
}
