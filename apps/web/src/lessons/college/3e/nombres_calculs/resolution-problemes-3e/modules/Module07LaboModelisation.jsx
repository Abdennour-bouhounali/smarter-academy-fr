import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import InfoSorter from '../../../../../common/components/InfoSorter';
import AnswerBuilder from '../../../../../common/components/AnswerBuilder';
import ValueTable from '../../../../../common/components/ValueTable';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProblemText from '../components/ProblemText';
import EquationBuilder from '../components/EquationBuilder';
import {
  lin, equation, foldCards, solveLinear, isEquivalentEquation, isSolvedForm,
  interpret, evalLin, formatEquation, formatDec, parseDec,
} from '../components/problemUtils';
import { FORFAIT_25, RECTANGLE } from '../components/problemsData';

/**
 * Module 7 — LABORATOIRE : « Le labo de modélisation ».
 *
 * Activity: quatre parcours complets, de l'énoncé à la phrase de réponse —
 *   dont un dont la solution n'est PAS un nombre entier (6,25 séances) et un
 *   dont la solution est mathématiquement correcte mais impossible dans
 *   l'histoire (un âge négatif).
 * Mathematical objective: établir que résoudre ne suffit pas : il faut
 *   INTERPRÉTER la valeur trouvée dans le contexte (arrondir dans le bon sens,
 *   rejeter une valeur impossible) et RÉPONDRE avec un résultat, une unité et
 *   une phrase qui reprend la question.
 * Student action: construire l'équation du forfait à 25 € carte par carte,
 *   saisir n, taper l'interprétation ; juger la plausibilité d'un résultat ;
 *   assembler une réponse complète (valeur + unité + phrase) ; trier un
 *   nouvel énoncé et le mener jusqu'au bout.
 * Controlled variable: les jetons de chaque membre ; puis la valeur saisie ;
 *   puis les briques de la réponse.
 * Mathematical state: l'équation construite (`foldCards`), sa solution
 *   (`solveLinear`), et l'interprétation lue dans `interpret(x, constraints)`.
 * Visual consequence: la sonde évalue les deux membres ; le tableau autour de
 *   6 et 7 montre que la carte B ne devient moins chère qu'à 7 séances ; la
 *   carte de réponse reste incomplète tant qu'il manque une brique.
 * Expected observation: 6,25 n'est pas une réponse — c'est un renseignement.
 *   À 6 séances la carte A gagne encore (54 € contre 55 €), à 7 séances la
 *   carte B passe devant (63 € contre 60 €).
 * Misconception targeted: n° 7 (« 6,25 séances » ou « dès 6 ») et n° 6
 *   (répondre par un nombre nu, sans unité ni phrase, ou n'en donner qu'une
 *   des deux quantités demandées).
 * Feedback: le tableau autour du point de bascule ; `explainFor` cible « 6 »
 *   et « 6,25 » ; la carte de réponse montre ses briques manquantes.
 * Formalization: étape 1, « un résultat non entier n'est pas faux : il faut
 *   l'interpréter » — nommée APRÈS la saisie de 6,25.
 * Scaffolding: le builder garde sa sonde et sa révélation après 3 essais ; le
 *   tableau de bascule n'apparaît qu'après la saisie.
 * Transfer: le boss e10 rejoue exactement cette conclusion.
 */

/* ── Étape 1 : le forfait à 25 € ──────────────────────────────────── */
const CARDS_25 = [
  { id: 'n9', label: '9n', latex: '9n', aria: 'neuf n', kind: 'term', value: lin(9, 0), fragmentId: 'f-a', tone: 'emerald' },
  { id: 'n5', label: '5n', latex: '5n', aria: 'cinq n', kind: 'term', value: lin(5, 0), fragmentId: 'f-b-var', tone: 'indigo' },
  { id: 'vingtcinq', label: '25', latex: '25', aria: 'vingt-cinq euros', kind: 'term', value: lin(0, 25), fragmentId: 'f-b-fixe', tone: 'amber' },
  { id: 'n', label: 'n', latex: 'n', aria: 'le nombre de séances n', kind: 'term', value: lin(1, 0), fragmentId: null, tone: 'slate' },
  { id: 'plus', label: '+', latex: '+', aria: 'le signe plus', kind: 'op', op: '+', fragmentId: null, tone: 'slate' },
  { id: 'fois', label: '×', latex: '\\times', aria: 'le signe multiplié', kind: 'op', op: '×', fragmentId: null, tone: 'slate' },
];

const SOL25 = solveLinear(FORFAIT_25.equation).x; // 6,25
const INTERP25 = interpret(SOL25, FORFAIT_25.constraints); // { kind: 'ceil', value: 7 }
const BASCULE_XS = [5, 6, 7, 8];
const BASCULE_COLUMNS = [
  { id: 'a', label: 'Carte A (9 €/séance)', fn: (n) => evalLin(FORFAIT_25.quantities[0].lin.n, n) },
  { id: 'b', label: 'Carte B (25 € + 5 €/séance)', fn: (n) => evalLin(FORFAIT_25.quantities[1].lin.n, n) },
];

const MAX_TRIES = 3;

/* ── Étape 4 : un énoncé neuf, mené de bout en bout ───────────────── */
const CLUB = {
  id: 'club',
  title: 'Le club de sport',
  text: "Le club de sport demande 40 € d'inscription, puis 12 € par mois. Léo a payé 208 € en tout cette année. Le club compte 350 adhérents. Combien de mois Léo a-t-il payés ?",
  fragments: [
    { id: 'f-inscription', text: 'Le club de sport demande 40 € d’inscription,' },
    { id: 'f-mensuel', text: 'puis 12 € par mois.' },
    { id: 'f-total', text: 'Léo a payé 208 € en tout cette année.' },
    { id: 'f-adherents', text: 'Le club compte 350 adhérents.' },
    { id: 'f-question', text: 'Combien de mois Léo a-t-il payés ?', isQuestion: true },
  ],
  equation: equation(lin(12, 40), lin(0, 208)), // 12m + 40 = 208 → m = 14
};
const SOL_CLUB = solveLinear(CLUB.equation).x; // 14

const ITEMS_CLUB = [
  { id: 'c-insc', text: '40 € d’inscription', useful: true },
  { id: 'c-mois', text: '12 € par mois', useful: true },
  { id: 'c-total', text: '208 € payés en tout', useful: true },
  { id: 'c-adherents', text: 'Le club compte 350 adhérents', useful: false },
];

export default function Module07LaboModelisation() {
  /* étape 1 */
  const [left, setLeft] = useState([]);
  const [right, setRight] = useState([]);
  const [active, setActive] = useState('left');
  const [order, setOrder] = useState([]);
  const [probed, setProbed] = useState(() => new Set());
  const [probeX, setProbeX] = useState(null);
  const [tries, setTries] = useState(0);
  const [verdict, setVerdict] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [nDone, setNDone] = useState(false);
  const [tested, setTested] = useState(() => new Set());
  const [interpDone, setInterpDone] = useState(false);
  /* étape 2 */
  const [plausibleDone, setPlausibleDone] = useState(false);
  /* étape 3 */
  const [answerDone, setAnswerDone] = useState(false);
  /* étape 4 */
  const [sortedClub, setSortedClub] = useState(false);
  const [clubAnswerDone, setClubAnswerDone] = useState(false);

  const committed = verdict?.ok === true || revealed;
  const setSide = (side, fn) => (side === 'left' ? setLeft(fn) : setRight(fn));

  const tap = (card) => {
    const token = card.kind === 'op'
      ? { id: card.id, kind: 'op', op: card.op, label: card.label, aria: card.aria }
      : { id: card.id, kind: 'term', value: card.value, label: card.label, aria: card.aria };
    setSide(active, (t) => [...t, token]);
    setOrder((o) => [...o, active]);
    setVerdict(null);
  };

  const remove = (side, i) => {
    setSide(side, (t) => t.filter((_, k) => k !== i));
    setOrder((o) => {
      const k = o.lastIndexOf(side);
      return k === -1 ? o : o.filter((_, j) => j !== k);
    });
    setVerdict(null);
    setProbeX(null);
  };

  const undo = () => {
    const last = order[order.length - 1];
    if (!last) return;
    setSide(last, (t) => t.slice(0, -1));
    setOrder((o) => o.slice(0, -1));
    setVerdict(null);
    setProbeX(null);
  };

  const commit = (react) => {
    const l = foldCards(left);
    const r = foldCards(right);
    if (!l || !r) return;
    const built = equation(l, r);
    const solved = isSolvedForm(built);
    const ok = !solved && isEquivalentEquation(built, FORFAIT_25.equation);
    const n = tries + 1;
    setTries(n);
    setVerdict({ ok, eq: built, solved });
    react(ok);
    if (!ok && n >= MAX_TRIES) setRevealed(true);
  };

  const step1Done = committed && nDone && interpDone;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Le labo de modélisation"
      moduleSubtitle="Des parcours complets, de l’énoncé à la phrase de réponse — y compris quand le résultat tombe sur 6,25."
      estimatedTime="11 min"
      brief={{
        tag: '🧪 Mission 07',
        title: 'Le carnet en entier, du premier mot à la dernière phrase.',
        body: (
          <p>
            Tu sais lire, choisir <MathText>{'$x$'}</MathText>, traduire, résoudre et vérifier. Il manque le
            dernier onglet : <strong>interpréter et répondre</strong>. Parce qu’une valeur trouvée n’est pas
            encore une réponse.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Le forfait à 25 € — quand le résultat n’est pas rond',
          subtitle: 'Construis l’équation, résous-la, puis dis ce que ça veut dire.',
          done: step1Done,
          content: (kit) => (
            <div className="space-y-3">
              <ProblemText fragments={FORFAIT_25.fragments} title="Énoncé — Le forfait à 25 €" />

              <EquationBuilder
                cards={CARDS_25}
                left={left}
                right={right}
                active={active}
                onSetActive={setActive}
                onTap={tap}
                onRemove={remove}
                onUndo={undo}
                onCommit={() => commit(kit.react)}
                probeXs={[5, 6, 7]}
                probed={probed}
                onProbe={(x) => {
                  setProbeX(x);
                  setProbed((p) => new Set([...p, x]));
                }}
                probeX={probeX}
                variable="n"
                committed={committed}
                disabled={committed}
              />

              {!verdict && !revealed && (
                <Feedback tone="info">
                  Même histoire qu’au module 1, un euro de plus sur la carte B. Le prix de la carte A d’un
                  côté, celui de la carte B de l’autre. La sonde te dira si tu chauffes — mais attention,
                  cette fois aucune valeur entière ne fera coïncider les deux membres.
                </Feedback>
              )}

              {verdict && !verdict.ok && !revealed && (
                <Feedback tone="ko">
                  Ton équation : <MathText>{`$${formatEquation(verdict.eq, 'n')}$`}</MathText>.{' '}
                  {verdict.solved ? (
                    <>
                      C’est une réponse, pas une traduction. L’équation doit raconter l’histoire : le prix
                      de la carte A et celui de la carte B.
                    </>
                  ) : (
                    <>
                      Elle ne dit pas la même chose que l’énoncé : pour n ={' '}
                      <strong className="font-mono">{formatDec(SOL25)}</strong> — la vraie solution — ton
                      membre de gauche vaut{' '}
                      <strong className="font-mono">{formatDec(evalLin(verdict.eq.left, SOL25))}</strong> et
                      ton membre de droite{' '}
                      <strong className="font-mono">{formatDec(evalLin(verdict.eq.right, SOL25))}</strong>.
                      Essai {tries} sur {MAX_TRIES}.
                    </>
                  )}
                </Feedback>
              )}

              {revealed && !verdict?.ok && (
                <Feedback tone="info">
                  Voici la traduction attendue :{' '}
                  <MathText>{`$${formatEquation(FORFAIT_25.equation, 'n')}$`}</MathText>. Les 25 € se paient
                  une seule fois ; les 5 € et les 9 € se comptent à chaque séance.
                </Feedback>
              )}

              {verdict?.ok && (
                <Feedback tone="ok">
                  <MathText>{`$${formatEquation(verdict.eq, 'n')}$`}</MathText> — accepté. Reste à la
                  résoudre : <MathText>{'$9n - 5n = 25$'}</MathText>, donc{' '}
                  <MathText>{'$4n = 25$'}</MathText>.
                </Feedback>
              )}

              {committed && (
                <NumericQuestion
                  prompt={
                    <>
                      Résous <MathText>{`$${formatEquation(FORFAIT_25.equation, 'n')}$`}</MathText> : que
                      vaut <MathText>{'$n$'}</MathText> ?
                    </>
                  }
                  expected={SOL25}
                  parse={parseDec}
                  display={formatDec(SOL25)}
                  explain={
                    <>
                      <MathText>{'$9n = 25 + 5n$'}</MathText> donne <MathText>{'$4n = 25$'}</MathText>,
                      donc <MathText>{'$n = 25 \\div 4 = 6{,}25$'}</MathText>. C’est exact — et c’est
                      justement là que le travail commence.
                    </>
                  }
                  explainFor={(v) => {
                    if (v === 6 || v === 7) {
                      return (
                        <>
                          {formatDec(v)} est un nombre de séances plausible, mais ce n’est pas la solution
                          de l’équation : <MathText>{'$4n = 25$'}</MathText> donne{' '}
                          <MathText>{'$25 \\div 4 = 6{,}25$'}</MathText>. On arrondira{' '}
                          <em>après</em>, en revenant à l’histoire — pas pendant le calcul.
                        </>
                      );
                    }
                    if (v === 5) {
                      return (
                        <>
                          5 vient de <MathText>{'$25 \\div 5$'}</MathText> : tu as partagé par le 5 de « 5 €
                          par séance » au lieu du 4 qui vient de{' '}
                          <MathText>{'$9n - 5n$'}</MathText>. L’équation donne{' '}
                          <MathText>{'$4n = 25$'}</MathText>, donc{' '}
                          <MathText>{'$n = 6{,}25$'}</MathText>.
                        </>
                      );
                    }
                    return (
                      <>
                        Regroupe les <MathText>{'$n$'}</MathText> d’un côté :{' '}
                        <MathText>{'$9n - 5n = 25$'}</MathText>, soit{' '}
                        <MathText>{'$4n = 25$'}</MathText> et{' '}
                        <MathText>{'$n = 6{,}25$'}</MathText>.
                      </>
                    );
                  }}
                  solved={nDone}
                  onAnswered={() => setNDone(true)}
                />
              )}

              {nDone && (
                <div className="space-y-3">
                  <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 text-sm text-slate-700 space-y-2">
                    <p>
                      <strong>Un résultat non entier n’est pas faux</strong> : il faut l’interpréter dans le
                      contexte. On ne va pas au cinéma 6,25 fois — mais 6,25 dit exactement où les deux
                      cartes se croisent. Regarde de part et d’autre.
                    </p>
                  </div>
                  <ValueTable
                    columns={BASCULE_COLUMNS}
                    xs={BASCULE_XS}
                    tested={tested}
                    onTest={(n) => {
                      setTested((t) => new Set([...t, n]));
                      kit.react(true);
                    }}
                    variable="n"
                    unit="€"
                    compare={false}
                    caption="Prix des deux cartes autour du point de bascule"
                    ariaLabel="Tableau des prix autour de 6 et 7 séances"
                  />
                  <TapQuestion
                    prompt={
                      <>
                        <MathText>{'$n = 6{,}25$'}</MathText>. Que répond-on à la question « à partir de
                        combien de séances la carte B est-elle plus avantageuse ? »
                      </>
                    }
                    options={[
                      'À partir de 6,25 séances',
                      'Dès 7 séances',
                      'Dès 6 séances',
                      'Jamais : le problème n’a pas de réponse',
                    ]}
                    cols={1}
                    correct={1}
                    explain={
                      <>
                        À 6 séances, la carte A coûte 54 € et la carte B 55 € : la carte A gagne encore. À 7
                        séances, 63 € contre 60 € : la carte B passe devant. La réponse est donc{' '}
                        <strong>{INTERP25.reason}</strong> — on arrondit{' '}
                        <em>vers le haut</em> parce qu’il faut <strong>dépasser</strong> le point
                        d’équilibre.
                      </>
                    }
                    explainWrong={
                      <>
                        6,25 séances n’existe pas, et « dès 6 » est faux : à 6 séances la carte B coûte
                        encore 1 € de plus (55 € contre 54 €). Le problème a bien une réponse — c’est le
                        premier entier <em>au-dessus</em> de 6,25 : <strong>7 séances</strong>.
                      </>
                    }
                    solved={interpDone}
                    onAnswered={() => setInterpDone(true)}
                  />
                </div>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Un résultat correct… et impossible',
          subtitle: 'L’équation ne sait pas ce qu’est un âge.',
          done: plausibleDone,
          content: (
            <TapQuestion
              prompt={
                <>
                  « Léa a 3 ans de plus que Tom. Dans 5 ans, la somme de leurs âges sera{' '}
                  <strong>9 ans</strong>. Quel est l’âge de Tom ? » — L’équation{' '}
                  <MathText>{'$2x + 13 = 9$'}</MathText> donne <MathText>{'$x = -2$'}</MathText>. Que
                  faut-il en conclure ?
                </>
              }
              options={[
                'Tom a −2 ans : c’est la solution de l’équation',
                'Le calcul est juste, mais un âge ne peut pas être négatif : cette situation est impossible',
                'Il faut prendre la valeur positive, donc 2 ans',
              ]}
              cols={1}
              correct={1}
              explain={
                <>
                  L’équation est correctement résolue :{' '}
                  <MathText>{'$2x = -4$'}</MathText>, donc <MathText>{'$x = -2$'}</MathText>. Mais la
                  contrainte de l’histoire dit <MathText>{'$x \\geq 0$'}</MathText> : aucun âge ne convient,
                  l’énoncé décrit une situation impossible. Changer le signe pour « arranger » le résultat
                  serait tricher : vérifie avec 2 ans — Tom 7 et Léa 10 dans 5 ans font 17, pas 9.
                </>
              }
              explainWrong={
                <>
                  −2 ans n’existe pas, et 2 ans ne vérifie pas l’énoncé (7 + 10 = 17, pas 9). Résoudre et{' '}
                  <strong>interpréter</strong> sont deux étapes différentes : ici l’équation répond
                  fidèlement, et c’est la <em>situation</em> qui est impossible.
                </>
              }
              solved={plausibleDone}
              onAnswered={() => setPlausibleDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Une réponse complète',
          subtitle: 'Le rectangle de périmètre 40 cm : la question demande LES dimensions.',
          done: answerDone,
          content: (
            <div className="space-y-3">
              <ProblemText fragments={RECTANGLE.fragments} title="Énoncé — Le rectangle" />
              <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                Avec <MathText>{'$x$'}</MathText> = la largeur, l’équation{' '}
                <MathText>{`$${formatEquation(RECTANGLE.equation)}$`}</MathText> donne{' '}
                <MathText>{'$x = 8$'}</MathText>. Assemble maintenant la réponse.
              </div>
              <AnswerBuilder
                value={8}
                unitOptions={['cm', 'cm²', '€']}
                correctUnit="cm"
                sentenceOptions={[
                  'x = 8',
                  'La largeur du rectangle est 8 cm.',
                  'Le rectangle a une largeur de 8 cm et une longueur de 12 cm.',
                  'Le périmètre du rectangle est 40 cm.',
                ]}
                correctSentenceIndex={2}
                hint="La largeur trouvée est 8, et une longueur se mesure en cm — pas en cm² (ça, c’est une aire)."
                solved={answerDone}
                onSolved={() => setAnswerDone(true)}
              />
              {answerDone && (
                <Feedback tone="ok">
                  La question était « quelles sont ses <strong>dimensions</strong> ? » : il en faut{' '}
                  <strong>deux</strong>. « x = 8 » n’est pas une réponse (personne ne sait ce qu’est x
                  ailleurs que dans ton brouillon), et donner la seule largeur laisse la question à moitié
                  ouverte. Une réponse complète = un résultat, une unité, une phrase qui reprend la
                  question.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Le parcours complet, sans filet',
          subtitle: 'Un énoncé neuf. Trie, puis réponds.',
          done: sortedClub && clubAnswerDone,
          content: (kit) => (
            <div className="space-y-4">
              <ProblemText fragments={CLUB.fragments} title="Énoncé — Le club de sport" />
              <InfoSorter
                items={ITEMS_CLUB}
                solved={sortedClub}
                onSolved={() => setSortedClub(true)}
                formative
                onCheck={kit.react}
              />
              {sortedClub && (
                <>
                  <Feedback tone="info">
                    Les 350 adhérents ne servent à rien ici : la question ne parle que de Léo. Avec{' '}
                    <MathText>{'$m$'}</MathText> = le nombre de mois payés, l’équation est{' '}
                    <MathText>{`$${formatEquation(CLUB.equation, 'm')}$`}</MathText> — soit{' '}
                    <MathText>{'$12m = 168$'}</MathText> et{' '}
                    <MathText>{`$m = ${formatDec(SOL_CLUB)}$`}</MathText>. Vérifie dans l’histoire :{' '}
                    <MathText>{'$40 + 12 \\times 14 = 208$'}</MathText> €. ✔
                  </Feedback>
                  <AnswerBuilder
                    value={SOL_CLUB}
                    unitOptions={['mois', '€', 'adhérents']}
                    correctUnit="mois"
                    sentenceOptions={[
                      'Léo a payé 208 € au club de sport.',
                      'Léo a payé 14 mois de cotisation.',
                      'm = 14',
                    ]}
                    correctSentenceIndex={1}
                    hint="La question demande un nombre de MOIS — pas la somme payée, qui était déjà dans l’énoncé."
                    solved={clubAnswerDone}
                    onSolved={() => setClubAnswerDone(true)}
                  />
                </>
              )}
              {clubAnswerDone && (
                <Feedback tone="ok">
                  Lire → choisir <MathText>{'$m$'}</MathText> → traduire → résoudre → vérifier →
                  interpréter → répondre. Sept gestes, cinq onglets, un seul carnet : celui que tu viens de
                  remplir en entier.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Un résultat non entier n’est pas faux : il faut l’interpréter dans le contexte — et arrondir dans
          le sens que la question impose. Onglet <strong>Vérifier · Répondre</strong> du carnet : rempli. Le
          carnet est complet — la mission finale t’attend.
        </Feedback>
      }
    />
  );
}
