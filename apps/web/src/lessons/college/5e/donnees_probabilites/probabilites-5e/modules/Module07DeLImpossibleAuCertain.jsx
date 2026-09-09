import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EchelleLab from '../components/EchelleLab';
import { EVENEMENTS_DE, probaEvenementDe, pct, fr } from '../components/probabilites';

/**
 * Module 7 — LABO : l'échelle de 0 à 1.
 *
 * L'élève FAIT GLISSER un curseur pour placer chaque événement, puis compare
 * à la probabilité calculée. Placer avant de calculer force l'estimation, et
 * l'écart entre les deux est ce qui se discute.
 *
 * Les deux bornes ont déjà été rencontrées au module 3 (aucune face / toutes
 * les faces) et calculées au module 6 (0/6 et 6/6) : elles ne sont donc pas
 * une nouveauté, seulement leur mise en ordre sur une règle graduée.
 *
 * Expected observation : « toute probabilité tient entre 0 et 1 ; plus le
 * nombre de faces favorables monte, plus le curseur va vers la droite ».
 * Misconception targeted : croire qu'« improbable » veut dire « impossible »
 * (0,05 n'est pas 0) ; et donner une probabilité supérieure à 1.
 */
const A_PLACER = [
  { ev: EVENEMENTS_DE.sept, indice: 'Aucune face du dé ne porte ce nombre.' },
  { ev: EVENEMENTS_DE.six, indice: 'Une seule face sur six.' },
  { ev: EVENEMENTS_DE.pair, indice: 'Trois faces sur six.' },
  { ev: EVENEMENTS_DE.moinsDe7, indice: 'Toutes les faces conviennent.' },
];

export default function Module07DeLImpossibleAuCertain() {
  const [valeurs, setValeurs] = useState(() => A_PLACER.map(() => 0.5));
  const [revele, setRevele] = useState(() => A_PLACER.map(() => false));
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const cible = (i) => probaEvenementDe(A_PLACER[i].ev);
  const proche = (i) => Math.abs(valeurs[i] - cible(i)) <= 0.05;
  const tousPlaces = revele.every(Boolean);

  const placer = (i, v) => setValeurs((prev) => prev.map((x, k) => (k === i ? v : x)));
  const verifier = (i) => setRevele((prev) => prev.map((x, k) => (k === i ? true : x)));

  const steps = [
    {
      num: 1,
      title: 'Place les quatre événements',
      subtitle: 'Fais glisser le curseur, puis vérifie. L’un est tout à gauche, l’autre tout à droite.',
      done: tousPlaces,
      content: (
        <div className="space-y-5">
          {A_PLACER.map((item, i) => (
            <div key={item.ev.id} className="space-y-2 rounded-xl border-2 border-slate-200 p-3">
              <EchelleLab
                evenement={item.ev.label}
                valeur={valeurs[i]}
                onValeur={(v) => placer(i, v)}
                cible={cible(i)}
                montrerCible={revele[i]}
                ariaLabel={`Placer : ${item.ev.label}`}
              />
              {!revele[i] ? (
                <button
                  type="button"
                  onClick={() => verifier(i)}
                  className="w-full rounded-lg border-2 border-rose-300 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-800 transition hover:bg-rose-100"
                >
                  Vérifier ce placement
                </button>
              ) : (
                <Feedback tone={proche(i) ? 'ok' : 'ko'}>
                  «&nbsp;{item.ev.label}&nbsp;» est réalisé par{' '}
                  <strong>
                    {item.ev.realisent.length === 0
                      ? 'aucune face'
                      : `${item.ev.realisent.length} face${item.ev.realisent.length > 1 ? 's' : ''} (${item.ev.realisent.join(' ; ')})`}
                  </strong>{' '}
                  sur 6, donc <strong className="font-mono">{item.ev.realisent.length}/6 = {pct(cible(i))}</strong>.{' '}
                  {proche(i)
                    ? 'Ton curseur était au bon endroit.'
                    : `Tu l’avais placé à ${pct(valeurs[i], 0)}. ${item.indice}`}
                </Feedback>
              )}
            </div>
          ))}
          {tousPlaces && (
            <KnowledgeBrick
              id="echelle-probabilite"
              variant="new"
              lead={<>Les quatre curseurs se sont rangés entre deux butées, et ces butées ont un nom.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Improbable n’est pas impossible',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={
              <>
                Dans une tombola de 1 000 billets, tu en as acheté un. Ta probabilité de gagner
                est <strong className="font-mono">1/1000</strong>. Que peut-on dire ?
              </>
            }
            options={[
              'C’est très peu probable, mais pas impossible : tu peux gagner',
              'C’est impossible : 1/1000 est trop petit',
              'C’est une chance sur deux : soit tu gagnes, soit tu perds',
              'La probabilité est nulle',
            ]}
            correct={0}
            cols={1}
            requires={['echelle-probabilite', 'probabilite']}
            explain="1/1000 = 0,001 : c’est petit, mais strictement plus grand que 0. Seule une probabilité EXACTEMENT nulle signifie « impossible » — c’est-à-dire qu’aucune issue ne réalise l’événement."
            explainWrong="« Soit je gagne, soit je perds » compte deux issues, mais elles ne sont pas équiprobables : 1 billet gagnant contre 999 perdants. Deux possibilités ne font jamais automatiquement une chance sur deux."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Range-les du moins au plus probable',
      done: q3,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Un sac contient <strong>10 jetons numérotés de 1 à 10</strong>, tous identiques.
                Pour chaque événement, quelle probabilité ?
              </p>
            }
            rows={[
              {
                id: 'j1',
                label: 'Tirer le jeton 11',
                options: ['0', '1/10', '1'],
                correct: 0,
                correction: 'Aucun jeton ne porte 11 : l’événement est impossible, sa probabilité est 0.',
              },
              {
                id: 'j2',
                label: 'Tirer le jeton 7',
                options: ['0', '1/10', '1'],
                correct: 1,
                correction: 'Un seul jeton favorable sur dix : 1/10.',
              },
              {
                id: 'j3',
                label: 'Tirer un jeton pair',
                options: ['1/10', '5/10', '1'],
                correct: 1,
                correction: 'Les jetons 2, 4, 6, 8 et 10 : 5 favorables sur 10, soit une chance sur deux.',
              },
              {
                id: 'j4',
                label: 'Tirer un jeton inférieur à 20',
                options: ['0', '5/10', '1'],
                correct: 2,
                correction: 'Les dix jetons conviennent : 10/10 = 1, l’événement est certain.',
              },
            ]}
            requires={['echelle-probabilite', 'mem-probabilite', 'equiprobabilite']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  De 0 à 1, sans jamais sortir de la règle graduée : impossible (0), peu probable
                  (1/10), une chance sur deux (5/10), certain (1). Toute la leçon tient sur cette
                  règle.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Le geste ne change jamais : compte les jetons qui
                  réalisent l’événement, puis mets ce nombre sur 10. Si le compte est 0,
                  l’événement est impossible ; s’il vaut 10, il est certain.
                </Feedback>
              )
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && <KnowledgeBrick id="mem-echelle" variant="new" compact />}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="De l’impossible au certain"
      moduleSubtitle="Toutes les probabilités tiennent sur une seule règle graduée"
      estimatedTime="9 min"
      brief={{
        tag: 'Labo',
        title: 'Une règle graduée de 0 à 1',
        tone: 'amber',
        body: (
          <p>
            Fais glisser le curseur pour placer chaque événement : à gauche ce qui n’arrive
            jamais, à droite ce qui arrive à coup sûr. Tu vérifieras ensuite par le calcul — et
            tu constateras qu’<strong>aucune probabilité ne sort jamais de cette règle</strong>.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={7} />}
    />
  );
}
