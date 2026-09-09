import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { MODELES, terms, parseNombre, fr } from '../components/suitesUtils';

/**
 * Module 6 — ATELIER : modéliser une situation réelle (P3, P4, P2).
 *
 * Étape 1  le versement fixe : « on ajoute 20 € chaque mois ». L'élève déroule
 *          le compte au cliquet et retrouve l'usine A du module 1.
 * Étape 2  la hausse de 5 % : le piège central du chapitre. « + 5 % » n'est pas
 *          « + 5 » — c'est × 1,05, le coefficient multiplicateur de 2de.
 *          → brique `modeliser-par-une-suite`.
 * Étape 3  choisir la famille devant quatre énoncés.
 *
 * TROIS ÉTAPES ET NON QUATRE : ce module vaut 8 minutes, la moitié d'un module
 * de découverte. Il consolide, il n'introduit qu'une seule brique.
 *
 * TOUTES LES VALEURS VIENNENT DE `MODELES`, dont les termes sont recalculés par
 * `suitesUtils.test.js` — y compris le fait que 400 × 1,05 vaut 420 et non 405.
 *
 * MANIPULATION JAMAIS GELÉE : les deux dérouleurs restent pilotables après
 * validation. Seul demeure le verrou d'ANTÉRIORITÉ de l'étape 2 sur l'étape 1.
 */
export default function Module06AtelierModeliser() {
  const EPARGNE = MODELES[0];   // 150 €, + 20 € par mois
  const LOYER = MODELES[1];     // 400 €, + 5 % par an

  const [rangA, setRangA] = useState(1);
  const [q1, setQ1] = useState(false);
  const [rangB, setRangB] = useState(1);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = rangA >= 3 && q1;
  const done2 = rangB >= 2 && q2;

  const listeLoyer = terms(LOYER.gen, 3);

  const steps = [
    {
      num: 1,
      title: 'Le versement fixe',
      subtitle:
        'Déroule le compte mois après mois, au moins jusqu’au rang 3, puis dis de quelle famille il relève.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <Derouleur
            enonce={EPARGNE.enonce}
            gen={EPARGNE.gen}
            rang={rangA}
            rangMax={6}
            unite="€"
            libelleRang="mois"
            onChangeRang={(v) => {
              setRangA(v);
              if (!done1 && v >= 3 && q1) kit.react?.(true);
            }}
          />
          <TapQuestion
            prompt="De quelle famille relève cette suite, et quelle est sa raison ?"
            options={[
              `Arithmétique, de raison ${fr(EPARGNE.raison)}`,
              `Géométrique, de raison ${fr(EPARGNE.raison)}`,
              `Arithmétique, de raison ${fr(EPARGNE.u0)}`,
              'Ni l’une ni l’autre',
            ]}
            correct={0}
            cols={1}
            requires={['suite-arithmetique', 'methode-trouver-la-raison']}
            explain={`On AJOUTE ${fr(EPARGNE.raison)} € chaque mois : l’écart entre deux mois consécutifs vaut toujours ${fr(EPARGNE.raison)}. La suite est arithmétique de raison ${fr(EPARGNE.raison)}, et son premier terme est ${fr(EPARGNE.u0)} €.`}
            explainWrong={`${fr(EPARGNE.u0)} est le premier terme, pas la raison : la raison est ce qu’on ajoute d’un mois au suivant. Et il n’y a aucune multiplication ici — le rapport ${fr(terms(EPARGNE.gen, 1)[1])} ÷ ${fr(EPARGNE.u0)} n’est pas constant.`}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {done1 && (
            <Feedback tone="ok">
              « On verse le même montant » se traduit par une addition répétée : c’est l’usine A du
              module 1, et le montant versé est la raison.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La hausse en pourcentage',
      subtitle:
        'Même geste, autre situation : déroule le loyer année après année, au moins jusqu’au rang 2.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <Derouleur
            enonce={LOYER.enonce}
            gen={LOYER.gen}
            rang={rangB}
            rangMax={5}
            unite="€"
            libelleRang="année"
            disabled={!done1}
            onChangeRang={(v) => {
              setRangB(v);
              if (!done2 && v >= 2 && q2) kit.react?.(true);
            }}
          />
          <NumericQuestion
            prompt={<>Quel est le loyer après <strong>une</strong> année, en euros ?</>}
            expected={listeLoyer[1]}
            parse={parseNombre}
            display={fr(listeLoyer[1])}
            requires={['coefficient-multiplicateur', 'mem-k-1-plus-t']}
            explain={`Une hausse de 5 % se traduit par une multiplication par 1 + 0,05 = ${fr(LOYER.raison)} : ${fr(LOYER.u0)} × ${fr(LOYER.raison)} = ${fr(listeLoyer[1])} €.`}
            explainFor={(n) =>
              n === LOYER.u0 + 5
                ? `${fr(LOYER.u0 + 5)} serait « + 5 € ». Une hausse de 5 % porte sur le loyer entier : elle vaut ${fr(listeLoyer[1] - LOYER.u0)} € ici.`
                : n === LOYER.u0 * 1.5
                ? 'Ce serait une hausse de 50 %, pas de 5 %. Le coefficient est 1,05, pas 1,5.'
                : null
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {done2 ? (
            <>
              <Feedback tone="ok">
                Chaque année, on multiplie par le même nombre : <strong>{fr(LOYER.raison)}</strong>.
                La suite est <strong>géométrique de raison {fr(LOYER.raison)}</strong>. Et l’écart,
                lui, n’est pas constant : {fr(listeLoyer[1] - listeLoyer[0])} € la première année,{' '}
                {fr(Math.round((listeLoyer[2] - listeLoyer[1]) * 100) / 100)} € la deuxième — c’est
                bien pour cela que « + 5 % » n’est pas « + 5 € ».
              </Feedback>
              <KnowledgeBrick
                id="modeliser-par-une-suite"
                variant="new"
                lead={<>Les deux traductions, celle du montant fixe et celle du pourcentage, notées côte à côte.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Déroule au moins jusqu’à la deuxième année — et compare les deux augmentations en
              euros.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Choisir la famille',
      done: q3,
      content: (
        <TapQuestion
          prompt="« Une population de 8 000 habitants perd 3 % chaque année. » Quelle suite la modélise ?"
          options={[
            'Géométrique de raison 0,97 : on multiplie chaque année par 1 − 0,03',
            'Arithmétique de raison −3 : on retire 3 chaque année',
            'Arithmétique de raison −240 : on retire toujours le même nombre d’habitants',
            'Géométrique de raison 3 : le pourcentage est 3',
          ]}
          correct={0}
          cols={1}
          requires={['modeliser-par-une-suite', 'coefficient-multiplicateur', 'suite-geometrique']}
          explain="Une baisse de 3 % se traduit par une multiplication par 1 − 0,03 = 0,97. La première année fait perdre 240 habitants, mais la deuxième en fait perdre moins (232,8) : le nombre retiré change, seul le facteur reste le même. La suite est géométrique de raison 0,97 — et elle décroît, bien qu’on multiplie."
          explainWrong="Retirer « 3 » retirerait 3 habitants, pas 3 %. Et retirer toujours 240 habitants serait une baisse en nombre, pas en pourcentage : ce n’est pas ce que dit l’énoncé."
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Atelier : modéliser"
      moduleSubtitle="Un montant fixe, un pourcentage — deux énoncés, deux familles"
      estimatedTime="8 min"
      brief={{
        tag: 'Atelier',
        title: 'De la phrase à la famille',
        tone: 'indigo',
        body: (
          <p>
            Deux situations, deux formulations qui se ressemblent. L’une ajoute toujours la même
            chose, l’autre multiplie toujours par la même chose — et l’écart entre les deux se
            creuse vite.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>Tout est en place.</strong> Générer, reconnaître, démontrer, décrire le sens et
          modéliser : la mission finale les met à l’épreuve ensemble.
        </KnowledgeSnapshot>
      }
    />
  );
}

/* ── Le dérouleur : une situation, un cliquet, une colonne ──────────── */
function Derouleur({ enonce, gen, rang, rangMax, unite, libelleRang, onChangeRang, disabled = false }) {
  const liste = terms(gen, rang);
  const btnLeger =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 '
    + 'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  const btnFort =
    'min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 '
    + 'disabled:opacity-40 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  return (
    <div className="space-y-3 rounded-2xl border-2 border-amber-200 bg-amber-50/40 p-3">
      <p className="text-sm font-semibold text-amber-900">{enonce}</p>

      <ol className="space-y-1" aria-live="polite">
        {liste.map((v, i) => {
          const ecart = i > 0 ? v - liste[i - 1] : null;
          return (
            <li key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-white px-2.5 py-1.5">
              <span className="w-24 shrink-0 font-mono text-[13px] text-slate-500">
                {libelleRang} {fr(i)}
              </span>
              <span className="font-mono text-base font-black tabular-nums text-amber-900">
                {fr(Math.round(v * 100) / 100)} {unite}
              </span>
              {ecart !== null && (
                // L'augmentation en euros est CALCULÉE, jamais écrite : c'est
                // elle qui montre que « + 5 % » ne fait pas le même nombre
                // d'euros d'une année sur l'autre.
                <span className="ml-auto font-mono text-[13px] text-slate-500">
                  {ecart >= 0 ? '+' : '−'} {fr(Math.round(Math.abs(ecart) * 100) / 100)} {unite}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Dérouler : ${libelleRang}`}>
        <button type="button" className={btnLeger} onClick={() => onChangeRang(rang - 1)} disabled={disabled || rang <= 0} aria-label="Revenir en arrière">
          ← −1
        </button>
        <button type="button" className={btnFort} onClick={() => onChangeRang(rang + 1)} disabled={disabled || rang >= rangMax} aria-label={`Passer au ${libelleRang} suivant`}>
          {libelleRang} suivant →
        </button>
      </div>
    </div>
  );
}
