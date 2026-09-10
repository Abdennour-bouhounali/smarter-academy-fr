import React, { useState, useMemo, useCallback } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DeuxJeuxLab from '../components/DeuxJeuxLab';
import {
  JEU_REGULIER, JEU_JACKPOT, JEU_ETIRABLE, loiDuJeu, loiEtiree, esperanceDuJeu,
  varianceDuJeu, ecartTypeDuJeu, varianceDeLaLoi, ecartTypeDeLaLoi,
  CRANS_ETIREMENT, CRAN_DEFAUT, N_PARTIES, serieDeParties, sessionSeed, makeRng,
  parseSigned, euros, fr,
} from '../components/dispersionUtils';

/**
 * Module 3 — DÉCOUVERTE : pourquoi la racine (P2).
 *
 * Étape 1  LE PROBLÈME D'UNITÉ, montré et non asséné : les mêmes gains écrits en
 *          centimes donnent 8 000 au lieu de 0,8. Le jeu n'a pas changé, le
 *          nombre a été multiplié par 10 000 — parce qu'on a élevé au carré.
 * Étape 2  LA RÉPARATION : la racine. √0,8 ≈ 0,89 € et √36 = 6 € se posent enfin
 *          à côté des 2 € de moyenne. Le nombre reçoit son nom.
 * Étape 3  LE LABORATOIRE RETROUVÉ : on reprend le cliquet du module 1, et
 *          cette fois les DEUX nombres sont affichés. La moyenne ne bouge pas,
 *          l'écart type suit le cran. L'élève doit atteindre un cran cible —
 *          vérifié atteignable par un test.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 le constat de l'unité →
 * brique `variance-en-unite-caree` ; étape 2 la racine calculée → briques
 * `ecart-type` puis `mem-variance-ecart-type` ; étape 3 les demandes.
 *
 * L'ID DE LA BRIQUE `ecart-type` EST IMPOSÉ par le lexique d'audit : l'audit ne
 * relie le mot « écart type » à sa brique que par l'égalité des identifiants.
 *
 * MANIPULATION JAMAIS GELÉE : le cliquet de l'étape 3 reste pilotable après
 * validation — c'est même là que l'élève doit refaire le geste pour se
 * convaincre. `disabled` ne porte que le verrou d'ANTÉRIORITÉ.
 */

/** Le cran que l'étape 3 demande d'atteindre. Atteignable : c'est un test. */
const CRAN_CIBLE = 2;

export default function Module03RevenirDansLUniteDesGains() {
  const graine = useMemo(() => sessionSeed(), []);

  const [q1, setQ1] = useState(false);
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [cran, setCran] = useState(CRAN_DEFAUT);
  const [cibleAtteinte, setCibleAtteinte] = useState(false);

  const loiReg = loiDuJeu(JEU_REGULIER);
  const loiJack = loiDuJeu(JEU_JACKPOT);
  const vReg = varianceDuJeu(JEU_REGULIER);          // 0,8
  const vJack = varianceDuJeu(JEU_JACKPOT);          // 36
  const sReg = ecartTypeDuJeu(JEU_REGULIER);         // ≈ 0,894
  const sJack = ecartTypeDuJeu(JEU_JACKPOT);         // 6 exactement

  // Les mêmes gains, écrits en centimes : la variance explose, l'écart type non.
  const loiCentimes = useMemo(() => loiReg.map((r) => ({ ...r, x: r.x * 100 })), [loiReg]);
  const vCentimes = varianceDeLaLoi(loiCentimes);     // 8 000
  const sCentimes = ecartTypeDeLaLoi(loiCentimes);    // ≈ 89,4

  const loiEtir = useMemo(() => loiEtiree(JEU_ETIRABLE, cran), [cran]);
  const simEtir = useMemo(
    () => serieDeParties(loiEtir, N_PARTIES, makeRng(graine + Math.round(cran * 400) + 31337)),
    [loiEtir, graine, cran],
  );
  const vEtir = varianceDeLaLoi(loiEtir);
  const sEtir = ecartTypeDeLaLoi(loiEtir);

  const done2 = s1 && s2;
  const done3 = cibleAtteinte && q3;

  const changerCran = useCallback((k, react) => {
    setCran(k);
    if (k === CRAN_CIBLE) {
      setCibleAtteinte(true);
      react?.(true);
    }
  }, []);

  const steps = [
    {
      num: 1,
      title: 'Un nombre qui dépend de l’unité choisie',
      subtitle:
        'Réécris les gains du Régulier en centimes : 100, 200 et 300 centimes au lieu de 1, 2 et 3 €. Le jeu est le même. Le nombre du module 2, lui, change.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border-2 border-slate-200 bg-white p-3 space-y-1">
              <div className="font-bold text-slate-900">En euros</div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 text-sm">
                <dt className="text-slate-500">gains</dt>
                <dd className="font-mono tabular-nums">{loiReg.map((r) => euros(r.x)).join(' · ')}</dd>
                <dt className="text-slate-500">moyenne</dt>
                <dd className="font-mono tabular-nums">{euros(esperanceDuJeu(JEU_REGULIER))}</dd>
                <dt className="text-slate-500">le nombre du module 2</dt>
                <dd className="font-mono tabular-nums font-bold">{fr(vReg)}</dd>
              </dl>
            </div>
            <div className="rounded-xl border-2 border-slate-200 bg-white p-3 space-y-1">
              <div className="font-bold text-slate-900">En centimes</div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 text-sm">
                <dt className="text-slate-500">gains</dt>
                <dd className="font-mono tabular-nums">{loiCentimes.map((r) => fr(r.x)).join(' · ')}</dd>
                <dt className="text-slate-500">moyenne</dt>
                <dd className="font-mono tabular-nums">{fr(esperanceDuJeu(JEU_REGULIER) * 100)}</dd>
                <dt className="text-slate-500">le nombre du module 2</dt>
                <dd className="font-mono tabular-nums font-bold">{fr(vCentimes)}</dd>
              </dl>
            </div>
          </div>
          <TapQuestion
            prompt={`La moyenne a été multipliée par 100 (2 € font 200 centimes). Par combien le nombre du module 2 a-t-il été multiplié ?`}
            options={[
              'Par 10 000, c’est-à-dire 100² — parce qu’on a élevé les écarts au carré',
              'Par 100, comme la moyenne',
              'Il n’a pas changé : le jeu est le même',
              'Par 2, parce qu’il y a deux gains extrêmes',
            ]}
            correct={0}
            cols={1}
            requires={['variance', 'methode-calculer-variance']}
            explain="0,8 devient 8 000 : un facteur 10 000 = 100². Chaque écart a été multiplié par 100, et chaque CARRÉ d’écart par 100² . Le nombre est donc dans une unité « au carré », qui ne se compare à aucun gain."
            explainWrong="Compare directement les deux nombres : 0,8 d’un côté, 8 000 de l’autre. Le rapport vaut 10 000, pas 100 — parce que ce sont les CARRÉS des écarts qu’on additionne, et que multiplier un écart par 100 multiplie son carré par 100 × 100."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <KnowledgeBrick
              id="variance-en-unite-carree"
              variant="new"
              lead={<>Ce que le changement d’unité vient de révéler.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Défaire le carré : la racine',
      subtitle:
        'Un carré s’annule par une racine carrée. Prends la racine des deux nombres du module 2, et regarde dans quelle unité ils reviennent.',
      done: done2,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<>Racine carrée du nombre du Jackpot : <strong>√{fr(vJack)}</strong></>}
            expected={6}
            parse={parseSigned}
            display="6"
            requires={['variance', 'variance-en-unite-carree']}
            explain="√36 = 6, exactement. Six euros : un montant qu’on peut enfin poser à côté des 2 € de moyenne."
            explainFor={(n) => (n === 18 ? 'Tu as divisé par 2 au lieu de prendre la racine : 36 ÷ 2 = 18, mais √36 = 6 puisque 6 × 6 = 36.' : null)}
            solved={s1}
            onAnswered={() => setS1(true)}
          />
          <NumericQuestion
            prompt={<>Racine carrée du nombre du Régulier, arrondie au centième : <strong>√{fr(vReg)}</strong></>}
            expected={(n) => Math.abs(n - sReg) < 0.006}
            parse={parseSigned}
            display={fr(sReg, { maxDecimals: 2 })}
            requires={['variance', 'variance-en-unite-carree']}
            explain={`√0,8 ≈ ${fr(sReg, { maxDecimals: 2 })}. Moins d’un euro : le Régulier s’écarte typiquement de moins d’un euro de sa moyenne, alors que le Jackpot s’en écarte de six.`}
            explainFor={(n) => (n === 0.4 ? 'Tu as divisé par 2 : 0,8 ÷ 2 = 0,4. Mais 0,4 × 0,4 = 0,16, pas 0,8. La racine de 0,8 vaut environ 0,89 — et elle est PLUS GRANDE que 0,8, parce que 0,8 est inférieur à 1.' : null)}
            solved={s2}
            onAnswered={() => setS2(true)}
          />
          {done2 && (
            <>
              <Feedback tone="ok">
                <strong>{euros(sReg)}</strong> contre <strong>{euros(sJack)}</strong>. Deux montants
                en euros, comparables aux gains eux-mêmes et à la moyenne de{' '}
                {euros(esperanceDuJeu(JEU_REGULIER))}. Et le test de l’unité est passé : en
                centimes, ce nouveau nombre vaut {fr(sCentimes, { maxDecimals: 1 })}, soit
                exactement 100 fois plus — il suit l’unité au lieu de la déformer.
              </Feedback>
              <KnowledgeBrick
                id="ecart-type"
                variant="new"
                lead={<>Le nom du nombre que la racine vient de produire.</>}
              />
              <KnowledgeBrick
                id="mem-variance-ecart-type"
                variant="new"
                lead={<>Les deux seules formules à retenir par cœur de cette moitié de leçon.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Les deux nombres, côte à côte',
      subtitle:
        'Reprends le cliquet du module 1 — cette fois les deux nombres sont affichés. Monte jusqu’au cran × 2 et regarde lequel bouge.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <DeuxJeuxLab
            jeux={[
              { jeu: JEU_ETIRABLE, loi: loiEtir, serie: simEtir },
              { jeu: JEU_JACKPOT, loi: loiJack, serie: null },
            ]}
            cranEtirement={cran}
            onChangerCran={(k) => changerCran(k, kit.react)}
            jeuEtireId={JEU_ETIRABLE.id}
            disabled={!done2}
          />
          <div className="rounded-xl border-2 border-sky-200 bg-sky-50/60 p-3">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-slate-600">cran</dt>
              <dd className="font-mono tabular-nums font-bold">× {fr(cran)}</dd>
              <dt className="text-slate-600">E(X) — la moyenne à long terme</dt>
              <dd className="font-mono tabular-nums font-bold text-slate-900">{euros(esperanceDuJeu(JEU_ETIRABLE))}</dd>
              <dt className="text-slate-600">V(X) — la variance</dt>
              <dd className="font-mono tabular-nums text-violet-700">{fr(vEtir, { maxDecimals: 4 })}</dd>
              <dt className="text-slate-600">σ(X) — l’écart type</dt>
              <dd className="font-mono tabular-nums font-bold text-sky-800">{euros(sEtir)}</dd>
            </dl>
          </div>
          {cibleAtteinte ? (
            <>
              <Feedback tone="ok">
                Au cran × {fr(CRAN_CIBLE)}, les gains valent{' '}
                {loiEtiree(JEU_ETIRABLE, CRAN_CIBLE).map((r) => euros(r.x)).join(' · ')} et l’écart
                type vaut {euros(ecartTypeDeLaLoi(loiEtiree(JEU_ETIRABLE, CRAN_CIBLE)))} — le double
                de celui du cran × 1. L’espérance, elle, vaut toujours{' '}
                {euros(esperanceDuJeu(JEU_ETIRABLE))}. <strong>Deux nombres, deux rôles :</strong>{' '}
                l’un dit autour de quoi, l’autre à quelle distance.
              </Feedback>
              <BatchChoiceQuestion
                intro={<p>Vrai ou faux, sur ce que le cliquet vient de montrer.</p>}
                rows={[
                  {
                    id: 'r1',
                    label: 'Étirer les gains change l’espérance du jeu',
                    options: ['Faux', 'Vrai'],
                    correct: 0,
                    correction: 'Faux : la barre noire n’a pas bougé d’un pixel, à aucun cran. Chaque gain s’éloigne de la moyenne, mais autant d’un côté que de l’autre.',
                  },
                  {
                    id: 'r2',
                    label: 'Étirer les gains change l’écart type',
                    options: ['Vrai', 'Faux'],
                    correct: 0,
                    correction: 'Vrai : au cran × 2 il vaut le double du cran × 1. C’est exactement ce que l’écart type est censé mesurer.',
                  },
                  {
                    id: 'r3',
                    label: 'Un écart type de 0 signifierait que le jeu paie toujours le même montant',
                    options: ['Vrai', 'Faux'],
                    correct: 0,
                    correction: 'Vrai : σ vaut 0 seulement si tous les écarts sont nuls, donc si tous les gains valent l’espérance. Aucun étalement, aucune surprise.',
                  },
                  {
                    id: 'r4',
                    label: 'L’écart type peut être négatif si les gains sont surtout sous la moyenne',
                    options: ['Faux', 'Vrai'],
                    correct: 0,
                    correction: 'Faux : c’est la racine carrée d’une somme de carrés multipliés par des probabilités. Elle est toujours positive ou nulle, quels que soient les signes des écarts.',
                  },
                ]}
                requires={['ecart-type', 'variance', 'mem-variance-ecart-type', 'dispersion-autour-de-la-moyenne']}
                feedback={({ allRight }) =>
                  allRight ? (
                    <>
                      Les deux nombres sont indépendants l’un de l’autre : on peut faire varier le
                      second en laissant le premier immobile — c’est exactement ce que le cliquet
                      fait.
                    </>
                  ) : (
                    <>
                      Rejoue les crans en regardant les deux lignes du tableau : E(X) reste figée,
                      σ(X) suit le cliquet. Et σ, racine d’une somme de carrés pondérés, ne peut
                      jamais être négative.
                    </>
                  )
                }
                solved={q3}
                onAnswered={() => setQ3(true)}
              />
            </>
          ) : (
            <Feedback tone="info">
              Monte jusqu’au cran <strong>× {fr(CRAN_CIBLE)}</strong> avec le bouton +. Cran
              actuel : × {fr(cran)}.
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
      moduleTitle="Revenir dans l’unité des gains"
      moduleSubtitle="Une racine, et le nombre redevient lisible"
      estimatedTime="10 min"
      brief={{
        tag: 'Atelier',
        title: 'Trente-six quoi ?',
        tone: 'indigo',
        body: (
          <p>
            Le nombre du module 2 distingue bien les deux jeux. Mais dire « ce jeu a une dispersion
            de 36 » ne veut rien dire tant qu’on n’a pas dit 36 <em>quoi</em>. Réparons cela.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Deux nombres décrivent une variable aléatoire :</strong> son espérance, et son
          écart type. La suite change de terrain : que se passe-t-il quand la même expérience à deux
          issues se répète encore et encore ?
        </KnowledgeSnapshot>
      }
    />
  );
}
