import React, { useState } from 'react';
import { Ruler, Timer } from 'lucide-react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ConversionLab, { ETAPES } from '../components/ConversionLab';
import { fr, kmhVersMs, msVersKmh } from '../components/grandeurs4e';

/**
 * Module 4 — MANIPULATION : changer d'unité par le SENS.
 *
 * Activity              choisir une vitesse, puis dérouler le raisonnement en
 *                       quatre temps jusqu'à voir naître le « ÷ 3,6 ».
 * Mathematical objective 1 km/h, c'est 1000 m parcourus en 3600 s. Le
 *                       raccourci n'est pas une règle à croire : c'est ce
 *                       raisonnement, déjà fait.
 * Student action        glisser la vitesse ; dévoiler l'étape suivante.
 * Controlled variable   la vitesse en km/h, et le niveau de dévoilement.
 * Mathematical state    une vitesse. Les quatre lignes viennent TOUTES de
 *                       `kmhVersMs(v).etapes` : le raisonnement affiché et le
 *                       résultat affiché ne peuvent pas diverger.
 * Visual consequence    les lignes se réécrivent ensemble à chaque cran.
 * Expected observation  « la ligne 4 donne toujours le même nombre que la
 *                       ligne 3 — donc diviser par 3,6, c'est juste plus
 *                       court ».
 * Misconception targeted appliquer « ÷ 3,6 » dans le mauvais sens. Le SENS le
 *                       dit : en m/s le nombre est forcément plus petit.
 * Formalization         la brique `changer-unite` arrive après que la
 *                       quatrième ligne a été dévoilée ; le mémo des trois
 *                       repères arrive plus tard encore, à l'étape 4 — une
 *                       fois qu'on s'en est SERVI.
 */

/** La vitesse repère de l'étape 1 : 36 km/h, dont l'image est un entier. */
const REPERE = 36;
/** La vitesse de l'étape 3 : 90 km/h, l'allure d'une route. */
const ROUTE = 90;
/** Le piège de l'étape 3, nommé en toutes lettres. */
const PIEGE_ROUTE = Math.round(ROUTE * 3.6 * 100) / 100;

export default function Module04MilleMetres() {
  const [v, setV] = useState(REPERE);
  const [niveau, setNiveau] = useState(1);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = niveau >= 4;

  const lab = <ConversionLab v={v} onV={setV} niveau={niveau} />;

  const route = kmhVersMs(ROUTE);
  const retour = msVersKmh(kmhVersMs(REPERE).valeur);

  const steps = [
    {
      num: 1,
      title: 'Dis ce que l’unité veut dire',
      subtitle: 'Quatre lignes, dévoilées une à une. La dernière ne t’apprend rien de neuf.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            « {REPERE} kilomètres par heure », c’est {REPERE} km parcourus en 1 h. Reste à dire
            cela en <strong>mètres</strong> et en <strong>secondes</strong>.
          </p>
          <PredictionChips
            prompt={`Avant de dérouler : à ${REPERE} km/h, combien de mètres par seconde à peu près ?`}
            options={[
              { id: 'moins', label: 'Moins de 20' },
              { id: 'autour', label: 'Autour de 100' },
              { id: 'plus', label: 'Plus de 1000' },
            ]}
            value={pred}
            onChange={setPred}
          />
          <div className="flex flex-wrap gap-2">
            {ETAPES.map((e, i) => (
              <button
                key={e.id}
                type="button"
                disabled={i > niveau}
                onClick={() => setNiveau((n) => Math.max(n, i + 1))}
                className={`min-h-[44px] rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                  i < niveau
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : i === niveau
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-300'
                }`}
              >
                {i < niveau ? '✓ ' : ''}{e.titre}
              </button>
            ))}
          </div>
          {lab}
          {done1 && (
            <Feedback tone="ok">
              La ligne 4 redonne exactement la ligne 3, à toutes les vitesses. Le « ÷ 3,6 » n’est
              donc pas une règle de plus : c’est ce raisonnement, écrit en un seul geste.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'D’où vient le 3,6 ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Pourquoi diviser par 3,6 revient-il au même que le raisonnement en deux temps ?"
            options={[
              'Parce qu’on multiplie par 1000 et qu’on divise par 3600, et 3600 ÷ 1000 = 3,6',
              'Parce que 3,6 est le nombre de secondes dans une minute',
              'Parce qu’une heure vaut 3,6 minutes',
              'C’est une convention qu’il faut simplement retenir',
            ]}
            correct={0}
            cols={1}
            requires={['grandeur-quotient']}
            explain="Multiplier par 1000 puis diviser par 3600, c’est diviser par 3600 ÷ 1000, soit par 3,6. Le raccourci n’est pas une convention : il est démontré par les deux étapes que tu viens de dérouler."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="changer-unite"
              variant="new"
              lead="La méthode que tu viens de dérouler vaut pour n’importe quelle vitesse."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Sur la route',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Règle le curseur sur {ROUTE} km/h, et refais le raisonnement.
          </p>
          {lab}
          <NumericQuestion
            prompt={`Une voiture roule à ${ROUTE} km/h. Combien de mètres parcourt-elle en une seconde ?`}
            expected={route.valeur}
            parse={parseDec}
            suffix="m/s"
            requires={['changer-unite']}
            explain={`${ROUTE} km = ${fr(route.etapes.metres)} m, et 1 h = ${fr(route.etapes.secondes)} s. Donc ${fr(route.etapes.metres)} ÷ ${fr(route.etapes.secondes)} = ${fr(route.valeur)} m/s.`}
            explainFor={(n) => {
              if (n === PIEGE_ROUTE) return `Tu as multiplié par 3,6 au lieu de diviser. ${fr(PIEGE_ROUTE)} m/s dépasserait la vitesse du son : en m/s, le nombre doit être PLUS PETIT, parce qu’une seconde est bien plus courte qu’une heure.`;
              if (n === 90000) return 'C’est le nombre de MÈTRES parcourus en une heure, pas en une seconde. Il reste à diviser par les 3600 secondes de l’heure.';
              if (n === 1.5) return 'Tu as divisé par 60 : cela donne des kilomètres par MINUTE, pas des mètres par seconde. Il faut convertir les deux grandeurs, pas une seule.';
              return null;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Et dans l’autre sens ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Un coureur avance à {fr(kmhVersMs(REPERE).valeur)} m/s. Cette fois, on remonte vers
            les km/h : le nombre va-t-il grandir ou rétrécir ?
          </p>
          <NumericQuestion
            prompt={`${fr(kmhVersMs(REPERE).valeur)} m/s, cela fait combien de km/h ?`}
            expected={retour.valeur}
            parse={parseDec}
            suffix="km/h"
            requires={['changer-unite']}
            explain={`En une heure, il parcourt ${fr(kmhVersMs(REPERE).valeur)} × 3600 = ${fr(retour.etapes.metres)} m, soit ${fr(retour.valeur)} km. On MULTIPLIE donc par 3,6 dans ce sens-là — et le nombre grandit, parce qu’une heure est bien plus longue qu’une seconde.`}
            explainFor={(n) => {
              if (n === 2.78) return 'Tu as divisé par 3,6. En allant vers les km/h, le nombre doit GRANDIR : on compte sur une heure entière au lieu d’une seconde.';
              if (n === 600) return 'Tu as multiplié par 60 : cela donne des mètres par minute. Il faut aussi passer des mètres aux kilomètres.';
              return null;
            }}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <KnowledgeBrick
              id="mem-conversion"
              variant="new"
              lead="Trois repères reviennent tout le temps : autant les avoir en tête pour vérifier."
            />
          )}
          {q4 && (
            <Feedback tone="info">
              Une question reste : jusqu’ici tu as calculé la vitesse, la durée, la distance —
              mais comment savoir d’avance laquelle diviser par laquelle ? C’est le module suivant.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="1000 mètres en 3600 secondes"
      moduleSubtitle="Changer d’unité en disant ce que l’unité veut dire"
      estimatedTime="11 min"
      brief={{
        tag: '🎬 Mission 04',
        title: 'On te dira « divise par 3,6 »',
        tone: 'indigo',
        body: (
          <>
            Tout le monde connaît ce raccourci, et presque personne ne sait d’où il vient — donc
            beaucoup l’appliquent à l’envers. <strong>Fabrique-le toi-même, et tu ne te
            tromperas plus de sens.</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5">
          <Ruler className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="text-sm text-emerald-900">
            Deux questions seulement : combien de mètres,{' '}
            <Timer className="inline h-4 w-4" aria-hidden="true" /> en combien de secondes. La
            réponse tombe toute seule — et le raccourci avec.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
