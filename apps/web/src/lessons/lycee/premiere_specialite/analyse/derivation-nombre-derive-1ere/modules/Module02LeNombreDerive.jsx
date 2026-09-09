import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SecantLab from '../components/SecantLab';
import { CARRE, fr } from '../components/derivUtils';

/**
 * Module 2 — DÉCOUVERTE : le nombre sur lequel les pentes se posent reçoit son
 * nom et sa notation, puis se CALCULE par le calcul littéral.
 *
 * Étape 1  déplacer A : le nombre limite change avec le point. C'est ce geste
 *          qui justifie la notation f′(a) — une fonction du point, pas une
 *          constante de la courbe.
 * Étape 2  le calcul littéral : (2ah + h²)/h = 2a + h, puis h → 0.
 * Étape 3  appliquer : f′(3), f′(0), f′(−1).
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 geste → brique `nombre-derive` ;
 * étape 2 calcul mené → brique `methode-calculer-nombre-derive` ; étape 3 les
 * demandes, qui n'exigent que ce qui précède.
 *
 * MANIPULATION JAMAIS GELÉE : le laboratoire de l'étape 1 reste pilotable
 * après validation — l'élève doit pouvoir promener A en lisant la règle.
 */
export default function Module02LeNombreDerive() {
  const [a, setA] = useState(1);
  const [vusA, setVusA] = useState([1]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  // Trois points distincts suffisent à voir que le nombre suit le point.
  const done1 = vusA.length >= 3;
  const done2 = q2;
  const done3 = q3;

  const bougerA = (v, react) => {
    setA(v);
    if (vusA.includes(v)) return;
    const suivant = [...vusA, v];
    setVusA(suivant);
    if (!done1 && suivant.length >= 3) react?.(true);
  };

  const btnA =
    'min-w-[44px] h-11 px-3 rounded-lg bg-violet-100 hover:bg-violet-200 disabled:opacity-40 ' +
    'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  const steps = [
    {
      num: 1,
      title: 'Le nombre suit le point',
      subtitle:
        'L’écart est déjà au plus petit cran. Déplace maintenant le point A et regarde la pente : elle change avec le point. Visite au moins trois positions.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <SecantLab
            fn={CARRE}
            a={a}
            h={0.01}
            onChangeH={() => {}}
            showTangente={done1}
            aControls={
              <span className="inline-flex items-center gap-2" role="group" aria-label="Déplacer le point A">
                <button
                  type="button"
                  className={btnA}
                  onClick={() => bougerA(Math.round((a - 1) * 100) / 100, kit.react)}
                  disabled={a <= 0}
                  aria-label="Déplacer A vers la gauche"
                >
                  ← A
                </button>
                <span className="px-3 py-1.5 rounded-lg bg-violet-900 text-white font-mono font-bold tabular-nums text-sm">
                  a = {fr(a)}
                </span>
                <button
                  type="button"
                  className={btnA}
                  onClick={() => bougerA(Math.round((a + 1) * 100) / 100, kit.react)}
                  disabled={a >= 3}
                  aria-label="Déplacer A vers la droite"
                >
                  A →
                </button>
              </span>
            }
          />
          {done1 ? (
            <>
              <Feedback tone="ok">
                En a = 0 la pente se tasse sur <strong>0</strong>, en a = 1 sur <strong>2</strong>,
                en a = 2 sur <strong>4</strong>, en a = 3 sur <strong>6</strong>. Le nombre limite
                n’est pas une constante de la courbe : il dépend du point. D’où une notation qui
                mentionne le point.
              </Feedback>
              <KnowledgeBrick
                id="nombre-derive"
                variant="new"
                lead={<>Voici le nom et la notation de ce nombre. Repromène A en les lisant.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Positions visitées : {vusA.length} sur 3. Déplace A et lis la pente à chaque fois.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le calculer, sans tâtonner',
      subtitle: 'La colonne de pentes suggère un résultat. Le calcul, lui, le démontre pour tous les points d’un coup.',
      done: done2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-violet-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <p className="font-semibold text-violet-900">Le taux de f(x) = x² entre a et a + h :</p>
            <p className="font-mono text-center text-[15px]">
              [(a + h)² − a²] ÷ h = [a² + 2ah + h² − a²] ÷ h = (2ah + h²) ÷ h
            </p>
            <p>
              Le numérateur se factorise par h : <span className="font-mono">h(2a + h) ÷ h</span>,
              et l’on simplifie — c’est légitime, car h n’est jamais nul.
            </p>
          </div>
          <NumericQuestion
            prompt={<>Après simplification, le taux vaut 2a + h. Quand h se rapproche de 0, vers quel nombre se dirige-t-il, pour <strong>a = 1</strong> ?</>}
            expected={2}
            parse={parseDec}
            display="2"
            requires={['nombre-derive', 'rapprochement-stabilisation']}
            explain="2a + h avec a = 1 donne 2 + h, qui se dirige vers 2 lorsque h se rapproche de 0. On retrouve exactement la colonne du module 1."
            explainFor={(n) =>
              n === 3
                ? 'C’est 2a + h avec h = 1 : tu as gardé l’écart au lieu de le faire tendre vers 0. Il reste 2.'
                : n === 1
                ? 'C’est f(1), l’ordonnée du point — pas la pente. Le taux simplifié vaut 2a + h, soit 2 + h ici.'
                : null
            }
            solved={done2}
            onAnswered={() => setQ2(true)}
          />
          {done2 && (
            <>
              <Feedback tone="ok">
                2a + h se dirige vers <strong>2a</strong>. Donc f′(a) = 2a pour f(x) = x² : la
                formule vaut pour TOUS les points d’un coup, alors que la colonne du module 1 n’en
                donnait qu’un.
              </Feedback>
              <KnowledgeBrick
                id="methode-calculer-nombre-derive"
                variant="new"
                lead={<>Les quatre gestes que tu viens de faire, dans l’ordre.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Trois points, trois nombres',
      done: done3,
      content: (
        <BatchChoiceQuestion
          intro={<p>Avec f(x) = x² et f′(a) = 2a, associe chaque point à son nombre dérivé.</p>}
          rows={[
            { id: 'r1', label: 'f′(3)', options: ['6', '9', '3'], correct: 0, correction: '2 × 3 = 6. (9 serait f(3), l’ordonnée.)' },
            { id: 'r2', label: 'f′(0)', options: ['0', '2', 'n’existe pas'], correct: 0, correction: '2 × 0 = 0 : en 0, la pente limite est nulle.' },
            { id: 'r3', label: 'f′(−1)', options: ['−2', '2', '1'], correct: 0, correction: '2 × (−1) = −2. (1 serait f(−1).)' },
          ]}
          requires={['nombre-derive', 'methode-calculer-nombre-derive']}
          feedback={({ allRight }) =>
            allRight ? (
              <>Un point, un nombre. Et f′(a) ne se confond pas avec f(a) : en 3, f(3) = 9 alors que f′(3) = 6.</>
            ) : (
              <>Attention au piège : f(a) est l’ORDONNÉE du point, f′(a) est la PENTE. En a = 3 : f(3) = 9 mais f′(3) = 2 × 3 = 6.</>
            )
          }
          solved={done3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Le nombre dérivé"
      moduleSubtitle="Un point, un nombre — et une notation qui le dit"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Ce nombre a un nom',
        tone: 'indigo',
        body: (
          <p>
            Les pentes se sont tassées sur 2 pour le point d’abscisse 1. Change de point, et le
            nombre change. Il est donc attaché au point : voici comment on l’écrit, et comment on
            le calcule sans tâtonner.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Reste une question.</strong> On sait calculer f′(a). Mais où ce nombre se
          VOIT-il sur le dessin ? Module suivant : la tangente.
        </KnowledgeSnapshot>
      }
    />
  );
}
