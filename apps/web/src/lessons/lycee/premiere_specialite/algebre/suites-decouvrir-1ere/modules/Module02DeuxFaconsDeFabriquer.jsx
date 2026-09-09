import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import {
  FORMULES, RECURRENCES, deroulerRecurrence, parseNombre, fr,
} from '../components/suitesUtils';

/**
 * Module 2 — DÉCOUVERTE : les deux écritures (P1, P2).
 *
 * Étape 1  la FORMULE : le rang entre, le terme sort. On génère, puis on saute
 *          au rang 50 sans dérouler — c'est l'avantage de cette écriture.
 * Étape 2  la RÉCURRENCE : le premier terme et la règle du suivant. On déroule
 *          case après case, et l'on constate le prix : pour u(50), cinquante
 *          étapes.
 * Étape 3  le tri : quatre écritures, deux familles. La demande est légitime,
 *          les deux briques sont posées.
 * Étape 4  une récurrence qui n'est NI l'une NI l'autre des deux usines du
 *          module 1 (w(n+1) = 2w(n) − 1) : une définition de proche en proche
 *          n'est pas automatiquement une des deux familles à venir.
 *
 * LE GÉNÉRATEUR EST UNE MANIPULATION, pas un affichage : l'élève choisit le
 * rang au cliquet et la colonne se remplit sous ses yeux. Il n'est JAMAIS GELÉ
 * après validation.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 geste → brique
 * `definition-explicite` ; étape 2 geste → brique `definition-recurrence` puis
 * `methode-generer-termes` ; étapes 3 et 4 les demandes.
 *
 * Le mot « raison » n'apparaît pas : il est posé au module 3.
 */
export default function Module02DeuxFaconsDeFabriquer() {
  const F = FORMULES[0];              // u(n) = 2n + 1
  const R = RECURRENCES[0];           // u(0) = 4 ; u(n+1) = u(n) + 5
  const W = RECURRENCES[2];           // w(0) = 5 ; w(n+1) = 2w(n) − 1

  const [rangF, setRangF] = useState(0);
  const [vusF, setVusF] = useState([0]);
  const [q1, setQ1] = useState(false);

  const [rangR, setRangR] = useState(0);
  const [q2, setQ2] = useState(false);

  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = vusF.length >= 4 && q1;
  const done2 = rangR >= 3 && q2;

  const visiterF = (v, react) => {
    setRangF(v);
    if (vusF.includes(v)) return;
    const suivant = [...vusF, v];
    setVusF(suivant);
    if (!done1 && suivant.length >= 4 && q1) react?.(true);
  };

  const listeR = deroulerRecurrence(R, rangR);

  const steps = [
    {
      num: 1,
      title: 'Le calcul du rang',
      subtitle:
        'Cette liste est décrite par un calcul : u(n) = 2n + 1. Choisis un rang, et le terme sort tout seul. Visite au moins quatre rangs.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <GenerateurFormule
            expr={F.expr}
            f={F.f}
            rang={rangF}
            vus={vusF}
            onChangeRang={(v) => visiterF(v, kit.react)}
            rangMax={8}
          />
          <NumericQuestion
            prompt={
              <>
                Sans dérouler les cinquante précédents : que vaut <strong>u(50)</strong> pour
                u(n) = 2n + 1 ?
              </>
            }
            expected={F.f(50)}
            parse={parseNombre}
            display={fr(F.f(50))}
            requires={['vocab-notation-fx', 'image-antecedent']}
            explain={`On remplace n par 50 : 2 × 50 + 1 = ${fr(F.f(50))}. C’est tout l’intérêt d’un calcul du rang — il ne demande pas de connaître les termes précédents.`}
            explainFor={(n) =>
              n === 100
                ? 'Il manque le + 1 : 2 × 50 = 100, puis 100 + 1 = 101.'
                : n === 51
                ? 'C’est 50 + 1. La formule dit 2n + 1 : il faut d’abord doubler le rang.'
                : null
            }
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {done1 ? (
            <>
              <Feedback tone="ok">
                Le rang entre, le terme sort. Aucun terme précédent n’est nécessaire :{' '}
                <strong>u(50) = {fr(F.f(50))}</strong> se calcule directement.
              </Feedback>
              <KnowledgeBrick
                id="definition-explicite"
                variant="new"
                lead={<>L’écriture que tu viens d’utiliser a un nom. Rejoue quelques rangs en la lisant.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Rangs visités : {vusF.length} sur 4 — et la question à répondre. Chaque rang que tu
              choisis donne son terme sans passer par les autres.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le premier, et la règle du suivant',
      subtitle:
        'Ici, pas de calcul du rang : on donne le premier terme et la façon d’obtenir le suivant. Déroule jusqu’au rang 3 au moins.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <GenerateurRecurrence
            texte={R.texte}
            liste={listeR}
            rang={rangR}
            rangMax={6}
            onChangeRang={(v) => {
              setRangR(v);
              if (!done2 && v >= 3 && q2) kit.react?.(true);
            }}
            disabled={!done1}
          />
          <NumericQuestion
            prompt={<>Toujours pour u(0) = 4 et u(n+1) = u(n) + 5 : que vaut <strong>u(4)</strong> ?</>}
            expected={deroulerRecurrence(R, 4)[4]}
            parse={parseNombre}
            display={fr(deroulerRecurrence(R, 4)[4])}
            requires={['suite-rang-terme', 'definition-explicite']}
            explain={`On part de 4 et l’on ajoute 5 à chaque étape : 4, 9, 14, 19, ${fr(deroulerRecurrence(R, 4)[4])}. Il faut bien QUATRE étapes pour aller du rang 0 au rang 4.`}
            explainFor={(n) =>
              n === deroulerRecurrence(R, 4)[3]
                ? `${fr(deroulerRecurrence(R, 4)[3])} est le terme de rang 3 : une étape de plus reste à faire.`
                : n === 4 + 5
                ? 'C’est u(1). Le rang 4 demande quatre applications de la règle, pas une.'
                : null
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {done2 ? (
            <>
              <Feedback tone="ok">
                Il faut <strong>les deux</strong> : le premier terme dit où l’on part, la règle dit
                comment avancer. Le prix à payer se voit : pour u(50), il faudrait dérouler
                cinquante étapes.
              </Feedback>
              <KnowledgeBrick
                id="definition-recurrence"
                variant="new"
                lead={<>Cette seconde écriture a elle aussi un nom.</>}
              />
              <KnowledgeBrick
                id="methode-generer-termes"
                variant="new"
                lead={<>Et voici les deux gestes réunis, celui du rang et celui de proche en proche.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Rang atteint : {fr(rangR)} sur 3 — et la question à répondre. Chaque case se calcule à
              partir de la précédente.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Reconnaître l’écriture',
      done: q3,
      content: (
        <BatchChoiceQuestion
          intro={
            <p className="text-sm text-slate-700">
              Pour chaque écriture, dis laquelle des deux définitions c’est.
            </p>
          }
          rows={[
            { id: 'l1', label: 'u(n) = 4n − 7', options: ['une formule du rang', 'une règle de proche en proche'], correct: 0 },
            { id: 'l2', label: 'u(0) = 2 et u(n+1) = 3 × u(n)', options: ['une formule du rang', 'une règle de proche en proche'], correct: 1 },
            { id: 'l3', label: 'u(n) = 5 × 2ⁿ', options: ['une formule du rang', 'une règle de proche en proche'], correct: 0 },
            { id: 'l4', label: 'u(1) = 10 et u(n+1) = u(n) − 3', options: ['une formule du rang', 'une règle de proche en proche'], correct: 1 },
          ]}
          requires={['definition-explicite', 'definition-recurrence']}
          feedback={({ allRight, nCorrect, total }) => (
            <div className="text-sm">
              {allRight ? (
                <>
                  Le repère est simple : si le rang <strong>n</strong> apparaît dans un calcul, c’est
                  une formule du rang ; si le terme précédent <strong>u(n)</strong> apparaît à droite,
                  c’est une règle de proche en proche.
                </>
              ) : (
                <>
                  {nCorrect} sur {total}. Regarde ce qui se trouve à droite du signe égal : le{' '}
                  <strong>rang</strong> (formule) ou le <strong>terme précédent</strong> (proche en
                  proche).
                </>
              )}
            </div>
          )}
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Toutes les règles ne sont pas des usines du module 1',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="font-mono text-sm font-bold text-slate-900">{W.texte}</p>
            <p className="mt-1.5 font-mono text-base font-black tabular-nums text-slate-900">
              {deroulerRecurrence(W, 4).map(fr).join(' · ')}
            </p>
          </div>
          <TapQuestion
            prompt="Cette règle de proche en proche fabrique-t-elle une des deux listes du module 1 ?"
            options={[
              'Non : on n’ajoute pas toujours le même montant (+4, +8, +16), et on ne multiplie pas toujours par le même facteur',
              'Oui, c’est l’usine qui ajoute : on ajoute à chaque fois',
              'Oui, c’est l’usine qui multiplie : il y a un × 2',
              'On ne peut pas le savoir avec seulement cinq nombres',
            ]}
            correct={0}
            cols={1}
            requires={['definition-recurrence', 'deux-facons-de-fabriquer']}
            explain="Les écarts valent 4, 8, 16, 32 : pas constants. Les rapports valent 1,8 puis environ 1,89 : pas constants non plus. Une règle de proche en proche peut très bien ne relever d’aucune des deux usines — le × 2 est bien là, mais le − 1 casse la régularité du rapport."
            explainWrong="Regarde ce qui se répète entre deux cases : de 5 à 9 on ajoute 4, de 9 à 17 on ajoute 8. Le montant ajouté change. Et 9 ÷ 5 = 1,8 alors que 17 ÷ 9 ≈ 1,89 : le facteur change aussi."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Deux façons de fabriquer"
      moduleSubtitle="Le calcul du rang, ou le premier terme et la règle du suivant"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Deux écritures pour une même liste',
        tone: 'indigo',
        body: (
          <p>
            La même liste de nombres peut se décrire de deux manières : par un calcul qui part du
            rang, ou par un premier terme et une règle qui fabrique le suivant. Chacune a son
            avantage — et son prix.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> Tu sais fabriquer les termes. Reste à reconnaître, en ne
          voyant que les nombres, de quelle famille ils viennent — et à nommer le nombre qui règle
          l’usine.
        </KnowledgeSnapshot>
      }
    />
  );
}

/* ── Le générateur par formule : un cliquet sur le rang ─────────────── */
function GenerateurFormule({ expr, f, rang, vus, onChangeRang, rangMax, disabled = false }) {
  // `expr` porte le texte de la formule ; la ligne de substitution en est
  // dérivée, jamais recopiée.
  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 '
    + 'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  return (
    <div className="space-y-3 rounded-2xl border-2 border-violet-200 bg-violet-50/40 p-3">
      <div className="rounded-xl border border-violet-200 bg-white p-3 text-center font-mono text-base font-black text-violet-900">
        {expr}
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choisir le rang">
        <span className="text-[13px] text-slate-600">rang n :</span>
        <button type="button" className={btn} onClick={() => onChangeRang(rang - 1)} disabled={disabled || rang <= 0} aria-label="Rang précédent">
          −
        </button>
        <span className="rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-sm font-bold tabular-nums text-white">
          n = {fr(rang)}
        </span>
        <button type="button" className={btn} onClick={() => onChangeRang(rang + 1)} disabled={disabled || rang >= rangMax} aria-label="Rang suivant">
          +
        </button>
      </div>
      <div className="rounded-xl border-2 border-violet-300 bg-white p-3 text-center" aria-live="polite">
        <div className="font-mono text-sm text-slate-600">
          {/* La substitution est DÉRIVÉE de l'expression déclarée dans le
              modèle : réécrire « 2 × n + 1 » à la main ferait mentir l'écran
              le jour où la formule change. */}
          {expr.replace('u(n)', `u(${fr(rang)})`).replace(/(?<![0-9])n(?![0-9])/g, fr(rang))}
        </div>
        <div className="font-mono text-2xl font-black tabular-nums text-violet-900">{fr(f(rang))}</div>
      </div>
      {vus.length > 1 && (
        <div>
          <div className="mb-1.5 text-[13px] font-semibold text-violet-900">Rangs déjà visités</div>
          <ul className="flex flex-wrap gap-1.5">
            {[...vus].sort((a, b) => a - b).map((v) => (
              <li key={v} className="rounded-lg border border-violet-200 bg-white px-2 py-1 font-mono text-[13px] tabular-nums">
                u({fr(v)}) = <strong>{fr(f(v))}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── Le générateur de proche en proche : la colonne se remplit ──────── */
function GenerateurRecurrence({ texte, liste, rang, rangMax, onChangeRang, disabled = false }) {
  const btn =
    'min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 '
    + 'disabled:opacity-40 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  const btnLeger =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 '
    + 'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  return (
    <div className="space-y-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-3">
      <div className="rounded-xl border border-emerald-200 bg-white p-3 text-center font-mono text-base font-black text-emerald-900">
        {texte}
      </div>
      <ol className="space-y-1" aria-live="polite">
        {liste.map((v, i) => (
          <li key={i} className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5">
            <span className="w-16 shrink-0 font-mono text-[13px] text-slate-500">u({fr(i)})</span>
            <span className="font-mono text-base font-black tabular-nums text-emerald-900">{fr(v)}</span>
            {/* Le calcul montré est DÉRIVÉ des deux termes voisins : écrire
                « + 5 » en dur ferait mentir la colonne si la règle changeait. */}
            {i > 0 && (
              <span className="ml-auto font-mono text-[13px] text-slate-500">
                = {fr(liste[i - 1])} {v - liste[i - 1] >= 0 ? '+' : '−'} {fr(Math.abs(v - liste[i - 1]))}
              </span>
            )}
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Dérouler la règle">
        <button type="button" className={btnLeger} onClick={() => onChangeRang(rang - 1)} disabled={disabled || rang <= 0} aria-label="Retirer un terme">
          ← −1
        </button>
        <button type="button" className={btn} onClick={() => onChangeRang(rang + 1)} disabled={disabled || rang >= rangMax} aria-label="Fabriquer le terme suivant">
          fabriquer le suivant →
        </button>
      </div>
    </div>
  );
}
