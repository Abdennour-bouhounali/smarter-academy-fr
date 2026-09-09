import React, { useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import BarModel from '../../../../../common/components/BarModel';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEME_FINAL, plausible, fr } from '../components/raisonnement4e';

/**
 * Module 3 — MANIPULATION : voir la situation, puis la borner.
 *
 * Activity              construire le schéma en barres de l'énoncé morceau par
 *                       morceau, puis poser une fourchette AVANT tout calcul.
 * Mathematical objective un schéma dit QUEL calcul faire ; une estimation dit
 *                       DANS QUELLE ZONE la réponse doit tomber.
 * Student action        ajouter les segments un à un, puis choisir une
 *                       fourchette et justifier ses bornes.
 * Controlled variable   le nombre de segments posés ; puis la fourchette.
 * Mathematical state    les bornes sont calculées à partir de
 *                       `PROBLEME_FINAL`, jamais recopiées ; la plausibilité
 *                       vient de `plausible()`.
 * Visual consequence    la barre des trois ballons s'allonge de 4 € par
 *                       ballon au-dessus de celle des filets, et le total de
 *                       74 € se décompose en 5 parts égales + 12 €.
 * Expected observation  « les cinq parts sont égales, et il reste 12 € à
 *                       retirer avant de partager ».
 * Misconception targeted calculer sans borner, donc accepter n'importe quel
 *                       résultat ; et croire qu'une estimation faite après le
 *                       calcul en est une.
 *
 * Le calcul lui-même n'est PAS fait ici : le module 4 compare deux stratégies,
 * le module 6 mène l'enquête complète. Ce module s'arrête à la fourchette —
 * volontairement, parce que c'est le geste qu'on saute toujours.
 */
const F = PROBLEME_FINAL.solution;        // 12,4 — jamais écrit à la main
const TOTAL = 74;
const ECART = 4;
const NB_BALLONS = 3;
const NB_FILETS = 2;
const NB_PARTS = NB_BALLONS + NB_FILETS;  // 5
const SURPLUS = NB_BALLONS * ECART;       // 12 — ce que les ballons ont « en trop »
const RESTE = TOTAL - SURPLUS;            // 62 à partager en 5

/** Les trois temps de la construction du schéma. */
const ETAGES = [
  {
    key: 'filet',
    titre: 'Un filet, la part inconnue',
    bars: [{ label: 'un filet', hideTotal: true, segments: [{ value: 12, tone: 'sky', unknown: true }] }],
  },
  {
    key: 'ballon',
    titre: 'Un ballon : le filet, plus 4 €',
    bars: [
      { label: 'un filet', hideTotal: true, segments: [{ value: 12, tone: 'sky', unknown: true }] },
      { label: 'un ballon', hideTotal: true, segments: [
        { value: 12, tone: 'sky', unknown: true },
        { value: ECART, tone: 'amber', text: `${ECART} €` },
      ] },
    ],
  },
  {
    key: 'total',
    titre: `${NB_BALLONS} ballons et ${NB_FILETS} filets : ${TOTAL} €`,
    bars: [
      { label: `${NB_BALLONS} ballons + ${NB_FILETS} filets`, hideTotal: true, segments: [
        ...Array.from({ length: NB_PARTS }, () => ({ value: 12, tone: 'sky', unknown: true })),
        ...Array.from({ length: NB_BALLONS }, (_, i) => ({ value: ECART, tone: 'amber', text: `${ECART}`, key: i })),
      ] },
    ],
  },
];

export default function Module03Schema() {
  const [etage, setEtage] = useState(0);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = etage >= ETAGES.length - 1;
  const courant = ETAGES[Math.min(etage, ETAGES.length - 1)];

  // Le contrôle de plausibilité que la fourchette doit respecter, calculé.
  const borneHaute = plausible(TOTAL, PROBLEME_FINAL.contraintes);

  const steps = [
    {
      num: 1,
      title: 'Construis le schéma, morceau par morceau',
      subtitle: 'Une phrase de l’énoncé, un morceau de dessin.',
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Sans calculer : un filet coûte-t-il plus ou moins de 15 € ?"
            options={[
              { id: 'moins', label: 'Moins de 15 €' },
              { id: 'plus', label: 'Plus de 15 €' },
              { id: 'sais-pas', label: 'Impossible à dire' },
            ]}
            value={pred}
            onChange={setPred}
          />
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-sky-600">
              {courant.titre}
            </p>
            <BarModel bars={courant.bars} maxValue={NB_PARTS * 12 + SURPLUS} unit=" €" />
          </div>
          {/* Le labo reste VIVANT après validation : une fois le schéma
              complet, le bouton le rejoue depuis le début. Jamais de
              de gel après validation — voir la garde de parcours.test.js. */}
          <button
            type="button"
            onClick={() => setEtage((e) => (e >= ETAGES.length - 1 ? 0 : e + 1))}
            className="min-h-[44px] w-full rounded-xl bg-sky-600 px-3 py-2 text-sm font-bold text-white hover:bg-sky-700"
          >
            {done1 ? 'Recommencer le schéma' : 'Ajouter la phrase suivante'}
          </button>
          {done1 && (
            <Feedback tone="ok">
              Le dessin dit tout : {NB_PARTS} parts identiques, plus {NB_BALLONS} morceaux de{' '}
              {ECART} € qui font {SURPLUS} € à eux tous — et l’ensemble vaut {TOTAL} €.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce que le schéma rend visible',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Que faut-il faire AVANT de partager le total en parts égales ?"
            options={[
              `Retirer les ${SURPLUS} € des trois morceaux de ${ECART} €`,
              `Ajouter les ${SURPLUS} € au total`,
              `Diviser directement ${TOTAL} par ${NB_PARTS}`,
              `Diviser ${TOTAL} par ${NB_BALLONS}`,
            ]}
            correct={0}
            cols={1}
            requires={['modeliser-par-une-equation']}
            explain={`Les ${NB_PARTS} parts ne sont égales qu’une fois les morceaux de ${ECART} € enlevés. On retire donc ${SURPLUS} € d’abord : il reste ${RESTE} € à partager en ${NB_PARTS}.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="representer"
              variant="new"
              lead="Le dessin ne calcule pas à ta place, mais il vient de te dire quel calcul faire."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Donne une fourchette avant de calculer',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Toujours sans calculer : un filet vaut forcément moins que le total, et sûrement bien
            moins, puisqu’on en achète {NB_FILETS} plus {NB_BALLONS} ballons pour {TOTAL} €.
          </p>
          <TapQuestion
            prompt="Entre quelles valeurs le prix d’un filet se trouve-t-il ?"
            options={[
              `Entre 10 € et 15 €`,
              `Entre 20 € et 30 €`,
              `Entre 0 € et 5 €`,
              `Entre 60 € et ${TOTAL} €`,
            ]}
            correct={0}
            cols={2}
            requires={['controler-le-sens', 'representer']}
            explain={`${NB_PARTS} parts égales valent à elles seules ${RESTE} €, donc une part vaut environ ${RESTE} ÷ ${NB_PARTS}, c’est-à-dire un peu plus de 12 €. La fourchette 10–15 € est la seule compatible avec le schéma.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="estimer-avant"
              variant="new"
              lead="Tu viens de borner la réponse sans avoir posé la moindre opération."
            />
          )}
          {q3 && !borneHaute.ok && (
            <Feedback tone="info">
              À noter : {borneHaute.raisons.join(', ')}.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Le reste à partager',
      done: q4,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Une dernière chose avant de refermer le schéma : combien reste-t-il à partager entre
            les {NB_PARTS} parts égales, une fois les {SURPLUS} € retirés ?
          </p>
          <NumericQuestion
            prompt={`${TOTAL} € moins ${SURPLUS} €, cela fait combien ?`}
            expected={RESTE}
            parse={parseDec}
            suffix="€"
            requires={['representer', 'estimer-avant']}
            explain={`${TOTAL} − ${SURPLUS} = ${RESTE}. Ces ${RESTE} € se partagent ensuite en ${NB_PARTS} parts égales — et tu verras au module suivant que ${fr(F)} tombe bien dans ta fourchette.`}
            explainFor={(n) => {
              if (n === TOTAL + SURPLUS) return `Tu as ajouté les ${SURPLUS} € au lieu de les retirer. Les morceaux de ${ECART} € font partie des ${TOTAL} € déjà payés : on les enlève.`;
              if (n === TOTAL) return 'Il faut d’abord retirer les trois morceaux de 4 €, sinon les parts ne sont pas égales.';
              return null;
            }}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Il existe plusieurs façons d’aller au bout à partir de là. Le module suivant en
              compare deux — et les deux sont bonnes.
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
      moduleTitle="Dessiner, puis estimer"
      moduleSubtitle="Voir la situation, et borner la réponse"
      estimatedTime="11 min"
      brief={{
        tag: '🎬 Mission 03',
        title: 'Le dessin qui parle',
        tone: 'indigo',
        body: (
          <>
            Même énoncé qu’au module précédent, mais cette fois on le <strong>dessine</strong>.
            Et on ose dire à peu près combien coûte un filet — avant tout calcul.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5">
          <LayoutGrid className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
          <p className="text-sm text-sky-900">
            Chaque barre bleue vaut la même chose : c’est la part qu’on cherche. Les morceaux
            oranges sont les {ECART} € de différence.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
