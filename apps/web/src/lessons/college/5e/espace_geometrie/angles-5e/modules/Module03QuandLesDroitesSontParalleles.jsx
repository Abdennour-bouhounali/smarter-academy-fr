import React, { useMemo, useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SecanteLab from '../components/SecanteLab';
import {
  droite, configuration, ecartDirections, sontAlternesInternes,
} from '../components/angles';
import { fr } from '../../../../../common/geo5e/geo5e';

/**
 * Module 3 — MANIPULATION : quand les droites sont parallèles.
 *
 * Le module 2 s'est arrêté sur un constat volontairement frustrant : deux
 * angles alternes-internes n'ont AUCUNE raison d'être égaux. Ce module fait
 * chercher la position où ils le deviennent — et c'est l'élève qui découvre
 * que cette position est exactement le parallélisme.
 *
 * §6bis — l'étape 1 rend le laboratoire, pas une définition.
 *
 * LA COÏNCIDENCE EST CALCULÉE, PAS SCÉNARISÉE. L'écart des angles est
 * rigoureusement égal à l'écart des directions (test « NON parallèles ⇒ les
 * alternes-internes DIFFÈRENT »). L'élève ne peut donc pas tomber sur un faux
 * zéro dû à un arrondi, ni rater le vrai.
 *
 * Expected observation : « les deux angles deviennent égaux au moment précis
 * où les droites deviennent parallèles, et pour n'importe quelle sécante ».
 * Misconception targeted : croire que l'égalité vaut « à peu près » pour des
 * droites presque parallèles.
 */
const P1 = { x: 390, y: 150 };
const P2 = { x: 390, y: 355 };
const PS = { x: 390, y: 252 };

export default function Module03QuandLesDroitesSontParalleles() {
  const [d2, setD2] = useState(droite(P2, 21));
  const [s, setS] = useState(droite(PS, 62));
  const [aTrouve, setATrouve] = useState(false);
  const [secantesTestees, setSecantesTestees] = useState(0);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const d1 = useMemo(() => droite(P1, 0), []);

  const config = useMemo(() => {
    try {
      return configuration(d1, d2, s);
    } catch {
      return null;
    }
  }, [d1, d2, s]);

  // LE couple observé : deux alternes-internes réels, choisis par le prédicat
  // testé — jamais deux arcs posés à la main.
  const couple = useMemo(() => {
    if (!config) return null;
    for (const x of config.angles) {
      for (const y of config.angles) {
        if (sontAlternesInternes(x, y)) return [x, y];
      }
    }
    return null;
  }, [config]);

  const ecartAngles = couple ? Math.abs(couple[0].mesure - couple[1].mesure) : null;
  const egaux = ecartAngles !== null && ecartAngles < 0.6;
  const ecartDroites = ecartDirections(d1, d2);

  const tournerD2 = (nd, react) => {
    setD2(nd);
    if (!aTrouve && ecartDirections(d1, nd) < 0.6) {
      setATrouve(true);
      react?.(true);
    }
  };

  const tournerS = (ns) => {
    setS(ns);
    if (aTrouve) setSecantesTestees((n) => Math.min(n + 1, 99));
  };

  const steps = [
    {
      num: 1,
      title: 'Rends les deux angles égaux',
      subtitle: 'Fais pivoter la droite du bas jusqu’à ce que les deux angles marqués aient la même mesure.',
      done: aTrouve,
      content: (kit) => (
        <div className="space-y-3">
          <SecanteLab
            d1={d1}
            d2={d2}
            onD2={(nd) => tournerD2(nd, kit.react)}
            s={s}
            onS={tournerS}
            montrer="paire"
            paire={couple ? couple.map((a) => a.id) : null}
            couleurPaire="#0284c7"
            ariaLabel="Deux angles alternes-internes dont on cherche à égaliser les mesures en tournant la droite du bas"
          />
          {couple && (
            <div className={`rounded-xl border-2 p-3 text-center ${egaux ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Écart entre les deux angles alternes-internes
              </div>
              <div className={`font-mono text-2xl font-black tabular-nums ${egaux ? 'text-emerald-700' : 'text-slate-700'}`}>
                {fr(ecartAngles, 1)}°
              </div>
            </div>
          )}
          {aTrouve ? (
            <Feedback tone="ok">
              Regarde ce qui s’est produit <strong>au même instant</strong> : l’écart des angles est
              tombé à 0°, <em>et</em> les chevrons du parallélisme sont apparus sur les deux
              droites. Écarte la droite d’un seul degré : les deux disparaissent ensemble.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Fais pivoter la <strong>droite du bas</strong> par sa poignée. Ton but : amener
              l’écart ci-dessus à <strong>0°</strong>. Surveille en même temps la bande du bas du
              laboratoire, qui te dit si les droites sont parallèles.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Est-ce un coup de chance ?',
      subtitle: 'Les droites sont parallèles. Change maintenant la sécante de place.',
      done: aTrouve && secantesTestees >= 3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3.5 text-sm text-slate-700">
            Reviens au laboratoire et fais pivoter la <strong>sécante bleue</strong>. Les deux
            angles vont changer de mesure — mais leur <strong>écart</strong>, lui, va rester à 0°.
          </div>
          {aTrouve && secantesTestees >= 3 ? (
            <Feedback tone="ok">
              L’égalité ne dépend donc <strong>ni de la sécante choisie</strong>, ni de la valeur
              des angles. Elle ne dépend que d’une seule chose : le <strong>parallélisme</strong>{' '}
              des deux droites.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {aTrouve
                ? `Sécantes essayées : ${secantesTestees} sur 3. Continue de faire pivoter la sécante bleue.`
                : 'Termine d’abord l’étape 1 : rends les deux angles égaux.'}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'La propriété',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="paralleles-angles-egaux"
            variant="new"
            lead={<>L’écart tombe à zéro exactement quand les droites deviennent parallèles, et cela pour n’importe quelle sécante. Voilà ce que cela signifie.</>}
          />
          <KnowledgeBrick id="mem-angles-paralleles" variant="new" compact />
          <NumericQuestion
            prompt={<>Deux droites parallèles sont coupées par une sécante. Un angle mesure <strong>63°</strong>. Combien mesure l’angle alterne-interne qui lui est associé ?</>}
            expected={63}
            suffix="°"
            requires={['paralleles-angles-egaux', 'angles-alternes-internes']}
            explain="Les droites sont parallèles : les angles alternes-internes sont donc égaux. Le second mesure lui aussi 63°."
            explainFor={(n) => (n === 117
              ? '117°, c’est 180 − 63 : ce serait la mesure de l’angle voisin, celui qui complète l’angle plat — pas celle de l’alterne-interne. Les alternes-internes, eux, sont ÉGAUX.'
              : n === 27
                ? '27°, c’est 90 − 63. Il n’y a aucun angle droit dans cette configuration : la propriété dit simplement que les deux angles sont égaux.'
                : null)}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'L’hypothèse est-elle nécessaire ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Deux droites NON parallèles sont coupées par une sécante. Que peut-on dire de deux angles alternes-internes ?"
            options={[
              'Ils sont différents',
              'Ils sont égaux, comme toujours',
              'Ils sont supplémentaires',
            ]}
            correct={0}
            cols={3}
            requires={['paralleles-angles-egaux']}
            explain="Tu l’as manipulé : dès que les droites s’écartent, un écart d’angles apparaît — et il vaut exactement l’écart entre les deux droites. Sans parallélisme, aucune égalité."
            explainWrong="Reviens au début de ce module : les droites n’étaient pas parallèles et l’écart affiché n’était pas nul. C’est précisément pour cela que la propriété exige l’hypothèse « parallèles »."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Cette propriété est une <strong>machine à déduire</strong> : à partir d’un seul angle,
              elle en donne d’autres. Le module suivant va jusqu’au bout — les huit d’un coup.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Quand les droites sont parallèles"
      moduleSubtitle="Deux choses qui arrivent au même instant"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Le moment où les mesures se rejoignent',
        tone: 'indigo',
        body: (
          <p>
            Au module précédent, deux angles alternes-internes avaient des mesures{' '}
            <strong>différentes</strong>. Tourne la droite du bas jusqu’à les rendre égaux — et
            regarde ce qui se produit <em>en même temps</em> sur les deux droites.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
