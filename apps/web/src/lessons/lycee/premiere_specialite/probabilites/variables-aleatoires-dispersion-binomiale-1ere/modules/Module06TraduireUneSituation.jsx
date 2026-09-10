import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import {
  LIVREUR, binomialPmf, binomialExpectation, binomialVariance,
  binomialSd, parseSigned, fr,
} from '../components/dispersionUtils';

/**
 * Module 6 — ATELIER : modéliser (P6).
 *
 * Étape 1  LES TROIS CASES, remplies dans l'ordre à partir d'un énoncé en
 *          français : que compte-t-on, combien de fois, avec quelle
 *          probabilité. Rien n'est calculé tant que les trois ne sont pas
 *          posées — c'est le geste que la leçon veut installer.
 * Étape 2  UNE FOIS MODÉLISÉE, la situation se calcule : une probabilité par
 *          la formule, puis l'espérance par le raccourci np.
 * Étape 3  LE PIÈGE DU p, éprouvé : un énoncé qui donne « 3 pièces sur 10 en
 *          moyenne » donne n × p, pas p. Distinguer les deux est exactement ce
 *          qui sépare une modélisation juste d'une fausse.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 les trois cases remplies → brique
 * `modeliser-par-une-variable` ; étape 2 les calculs menés → brique
 * `esperance-variance-binomiale` ; étape 3 la demande.
 *
 * PARSE. Les réponses sont décimales : `parse={parseSigned}` partout.
 */
export default function Module06TraduireUneSituation() {
  const [q1, setQ1] = useState(false);
  const [nb, setNb] = useState(false);
  const [pr, setPr] = useState(false);
  const [k0, setK0] = useState(false);
  const [esp, setEsp] = useState(false);
  const [q3, setQ3] = useState(false);

  const n = LIVREUR.n;             // 4
  const p = LIVREUR.p;             // 0,25
  const p0 = binomialPmf(n, 0, p); // 0,31640625
  const auMoinsUn = 1 - p0;        // 0,68359375
  const e = binomialExpectation(n, p);   // 1
  const v = binomialVariance(n, p);      // 0,75
  const s = binomialSd(n, p);            // ≈ 0,866

  const done1 = nb && pr && q1;
  const done2 = k0 && esp;

  const steps = [
    {
      num: 1,
      title: 'Remplir les trois cases',
      subtitle:
        'Un livreur effectue 4 tournées dans la journée. À chaque tournée, il a 25 % de risque d’être en retard, indépendamment des autres. On s’intéresse au nombre de tournées en retard.',
      done: done1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-950">
            <p>
              Avant tout calcul, trois questions dans l’ordre : <strong>que compte-t-on ?</strong>{' '}
              <strong>combien de fois l’épreuve est-elle répétée ?</strong>{' '}
              <strong>quelle est la probabilité sur UNE épreuve ?</strong>
            </p>
          </div>
          <TapQuestion
            prompt="Première case : que compte la variable X ?"
            options={[
              'Le nombre de tournées en retard, parmi les 4 de la journée',
              'Le nombre total de tournées de la journée',
              'Le temps de retard cumulé sur la journée',
              'La probabilité d’être en retard',
            ]}
            correct={0}
            cols={1}
            requires={['variable-aleatoire', 'compter-les-succes']}
            explain="X compte les tournées en retard : c’est le résultat qu’on a choisi de compter, donc le « succès ». X prend les valeurs 0, 1, 2, 3 ou 4."
            explainWrong="Le nombre total de tournées ne varie pas : il vaut 4 quoi qu’il arrive, ce n’est donc pas une variable aléatoire. Un temps cumulé ne se compte pas en épreuves réussies. Et une probabilité n’est pas ce que X mesure : c’est ce qui pèse chaque branche."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <>
              <NumericQuestion
                prompt={<>Deuxième case — <strong>n</strong>, le nombre de répétitions :</>}
                expected={n}
                parse={parseSigned}
                display={fr(n)}
                requires={['schema-bernoulli']}
                explain="4 tournées, fixées d’avance par l’énoncé. Ce nombre ne dépend pas de ce qui se passe : c’est bien un n."
                solved={nb}
                onAnswered={() => setNb(true)}
              />
              <NumericQuestion
                prompt={<>Troisième case — <strong>p</strong>, la probabilité d’un retard sur UNE tournée :</>}
                expected={p}
                parse={parseSigned}
                display={fr(p)}
                requires={['schema-bernoulli', 'frequence-probabilite']}
                explain="25 % d’une tournée, c’est 0,25. C’est bien une probabilité par épreuve, pas un total sur la journée."
                explainFor={(val) =>
                  val === 25
                    ? 'Une probabilité s’écrit entre 0 et 1 : 25 % vaut 0,25.'
                    : val === 1
                    ? 'Un est le nombre de retards ATTENDU sur les 4 tournées (4 × 0,25), pas la probabilité sur une tournée.'
                    : null
                }
                solved={pr}
                onAnswered={() => setPr(true)}
              />
            </>
          )}
          {done1 && (
            <>
              <Feedback tone="ok">
                Les trois cases sont remplies : X compte les tournées en retard, n = {fr(n)},
                p = {fr(p)}, et les tournées sont indépendantes. La phrase de modélisation s’écrit
                alors d’un trait — et tout le calcul en découle.
              </Feedback>
              <KnowledgeBrick
                id="modeliser-par-une-variable"
                variant="new"
                lead={<>Les cinq gestes que tu viens de faire, et le piège du p.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Une fois modélisée, la situation se calcule',
      subtitle: 'Le livreur veut savoir s’il finira la journée sans aucun retard, et combien de retards il doit prévoir en moyenne.',
      done: done2,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<>Probabilité d’aucun retard sur les {fr(n)} tournées : <strong>{fr(1 - p)}<sup>{fr(n)}</sup></strong> (arrondie au centième ou mieux)</>}
            // 0,32 (au centième) comme 0,316 (au millième) sont acceptés : la
            // tolérance couvre le pire arrondi demandé, jamais davantage — 0,3
            // et 0,33 restent refusés.
            expected={(val) => Math.abs(val - p0) < 0.005}
            parse={parseSigned}
            display={fr(p0, { maxDecimals: 3 })}
            requires={['loi-binomiale', 'mem-loi-binomiale', 'produit-chemin']}
            explain={`0,75⁴ = ${fr(p0, { maxDecimals: 5 })}, soit environ ${fr(p0, { maxDecimals: 3 })}. Le coefficient vaut 1 : un seul chemin ne porte aucun retard. Une journée sur trois environ se passe sans incident — donc deux sur trois en comportent au moins un : ${fr(auMoinsUn, { maxDecimals: 3 })}.`}
            explainFor={(val) =>
              val === 0.75
                ? 'C’est la probabilité qu’UNE tournée se passe bien. Pour que les quatre se passent bien, il faut multiplier le long du chemin : 0,75 × 0,75 × 0,75 × 0,75.'
                : val === 3
                ? 'Tu as multiplié 0,75 par 4 au lieu de l’élever à la puissance 4. Quatre branches successives se multiplient entre elles.'
                : null
            }
            solved={k0}
            onAnswered={() => setK0(true)}
          />
          <NumericQuestion
            prompt={<>Nombre de retards attendu en moyenne sur la journée : <strong>{fr(n)} × {fr(p)}</strong></>}
            expected={e}
            parse={parseSigned}
            display={fr(e)}
            requires={['esperance', 'loi-binomiale']}
            explain="4 × 0,25 = 1. Un retard par jour en moyenne — un nombre qui se raconte en une phrase, et qui n’exige pas de dresser le tableau complet."
            explainFor={(val) => (val === 0.25 ? 'C’est la probabilité sur UNE tournée. Sur quatre tournées, on en attend quatre fois plus : 4 × 0,25 = 1.' : null)}
            solved={esp}
            onAnswered={() => setEsp(true)}
          />
          {done2 && (
            <>
              <Feedback tone="ok">
                Un retard attendu par jour, et V(X) = {fr(n)} × {fr(p)} × {fr(1 - p)} = {fr(v)},
                donc σ(X) = {fr(s, { maxDecimals: 3 })} retard. Les deux nombres de la première
                moitié de la leçon se lisent directement sur n et p, sans passer par le tableau.
              </Feedback>
              <KnowledgeBrick
                id="esperance-variance-binomiale"
                variant="new"
                lead={<>Le raccourci que tu viens d’utiliser — et sa condition d’emploi.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le piège du p',
      done: q3,
      content: (
        <BatchChoiceQuestion
          intro={<p>Dans chaque énoncé, quelle est la valeur de <strong>p</strong> — la probabilité sur UNE épreuve ?</p>}
          rows={[
            {
              id: 'r1',
              label: '« Une machine produit 8 % de pièces défectueuses. On en prélève 30. »',
              options: ['0,08', '30', '2,4'],
              correct: 0,
              correction: '8 % d’une pièce prélevée : p = 0,08, et n = 30. Le nombre 2,4 serait n × p, c’est-à-dire le nombre de défauts attendu — pas p.',
            },
            {
              id: 'r2',
              label: '« Sur 20 lancers d’un dé équilibré, on compte les 6. »',
              options: ['1/6', '6', '20'],
              correct: 0,
              correction: 'Un dé équilibré à six faces : chaque face a la probabilité 1/6 ≈ 0,167. Le 6 est la face qu’on compte, pas sa probabilité.',
            },
            {
              id: 'r3',
              label: '« Un joueur réussit en moyenne 3 paniers sur 10 tentatives. Il en tente 10. »',
              options: ['0,3', '3', '10'],
              correct: 0,
              correction: '3 réussites sur 10 tentatives, c’est une proportion de 0,3 par tentative : p = 0,3 et n = 10. Ici n × p vaut bien 3 — c’est ce que l’énoncé annonçait, mais ce n’est pas p.',
            },
            {
              id: 'r4',
              label: '« Un vaccin protège 9 personnes sur 10. On suit 50 personnes vaccinées et l’on compte celles qui ne sont PAS protégées. »',
              options: ['0,1', '0,9', '5'],
              correct: 0,
              correction: 'Attention à ce qu’on compte : ici c’est « non protégée », donc p = 1 − 0,9 = 0,1. Le succès est le résultat compté, et changer d’étiquette change p.',
            },
          ]}
          requires={['modeliser-par-une-variable', 'schema-bernoulli', 'esperance-variance-binomiale']}
          feedback={({ allRight }) =>
            allRight ? (
              <>
                Trois pièges différents : le total confondu avec la probabilité, la face confondue
                avec sa probabilité, et — le plus subtil — le succès mal choisi, qui donne 1 − p au
                lieu de p. C’est pourquoi on remplit les trois cases AVANT de calculer.
              </>
            ) : (
              <>
                Demande-toi à chaque fois : « quelle est la probabilité pour UNE SEULE épreuve, du
                résultat que je compte ? ». Un effectif attendu (2,4 défauts, 3 paniers) est n × p,
                pas p. Et si l’on compte l’issue contraire, p devient 1 − p.
              </>
            )
          }
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
      moduleTitle="Traduire une situation"
      moduleSubtitle="Trois cases à remplir avant le moindre calcul"
      estimatedTime="8 min"
      brief={{
        tag: 'Atelier',
        title: 'Du français aux paramètres',
        tone: 'indigo',
        body: (
          <p>
            Un énoncé ne dit jamais « n = 4 et p = 0,25 » : il parle de tournées et de retards.
            Tout le travail est là — et une fois les trois cases remplies, le calcul est mécanique.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>Tu as tout.</strong> Mesurer une dispersion, revenir dans la bonne unité,
          reconnaître une répétition d’épreuves, calculer avec elle, et traduire un énoncé en
          paramètres. Il reste à le prouver.
        </KnowledgeSnapshot>
      }
    />
  );
}
