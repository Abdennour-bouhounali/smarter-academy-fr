import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FractionAreaGrid from '../components/FractionAreaGrid';
import RationalBar from '../components/RationalBar';
import PacketCounter from '../components/PacketCounter';
import ErrorSpotter from '../components/ErrorSpotter';
import {
  div, formatDec, formatFrac, mul, parseDec, rat, toDecimal,
} from '../components/rationalUtils';

/**
 * Module 5 — MANIPULATION : « Une fraction d'une fraction ».
 *
 * Activity: peindre 3 colonnes sur 4 (bleu), puis 2 lignes sur 3 (jaune) ; la
 *   zone peinte DEUX fois est le produit.
 * Mathematical objective: multiplier deux rationnels, c'est prendre une part
 *   d'une part — l'aire commune vaut (2 × 3) / (3 × 4).
 * Student action: taper les en-têtes de colonne et de ligne du quadrillage.
 * Controlled variable: les ensembles de colonnes et de lignes peintes.
 * Mathematical state: `cols` et `rows` (deux Set) ; le nombre de cases vertes
 *   et la fraction résultat en sont dérivés.
 * Visual consequence: 6 cases vertes sur 12 apparaissent à l'intersection.
 * Expected observation: le produit (1/2) est PLUS PETIT que chacun des deux
 *   facteurs (2/3 et 3/4) — multiplier n'agrandit pas toujours.
 * Misconception targeted: « multiplier agrandit toujours », « on multiplie
 *   les numérateurs et on garde le dénominateur », et « diviser rapetisse
 *   toujours » (traité à l'étape 3).
 * Feedback: le module compte ce qui manque (« il manque une ligne jaune »).
 * Formalization: étape 2, la règle produit ; étape 3, diviser = multiplier
 *   par l'inverse, lu comme « combien de 1/4 tiennent dans 3/2 ».
 * Scaffolding: après 3 essais, « montre-moi » peint la cible.
 * Transfer: étape 4, une division dont le résultat est plus GRAND que le
 *   dividende.
 */
const A = rat(3, 4); // colonnes (bleu)
const B = rat(2, 3); // lignes (jaune)
const PRODUCT = mul(A, B); // 1/2
const DIVIDEND = rat(3, 2);
const DIVISOR = rat(1, 4);
const QUOTIENT = div(DIVIDEND, DIVISOR); // 6

export default function Module05FractionDeFraction() {
  const [cols, setCols] = useState(() => new Set());
  const [rows, setRows] = useState(() => new Set());
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [ruleDone, setRuleDone] = useState(false);
  const [divDone, setDivDone] = useState(false);
  // Étape 3 : on ne LIT plus le nombre de paquets, on les POSE.
  const [packets, setPackets] = useState(0);
  const [packetRefusal, setPacketRefusal] = useState('');
  // Étape 5 : la copie qui multiplie sans retourner.
  const [tapped, setTapped] = useState([]);
  const [repair, setRepair] = useState(null);
  const [check2, setCheck2] = useState(0);
  const [invDone, setInvDone] = useState(false);

  const painted = cols.size === A.num && rows.size === B.num;
  const spotDone = tapped.includes('q1') && repair === 'inv';
  const packetsFull = Math.abs(packets * toDecimal(DIVISOR, 8) - toDecimal(DIVIDEND, 8)) < 1e-8 && packets > 0;

  const toggle = (setFn, key) => {
    setFn((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setTries((t) => t + 1);
  };

  const showMe = (kitReact) => {
    setCols(new Set([0, 1, 2]));
    setRows(new Set([0, 1]));
    setRevealed(true);
    kitReact?.(false);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Une fraction d’une fraction"
      moduleSubtitle="Peins les deux tiers d’un quadrillage déjà aux trois quarts peint."
      estimatedTime="10 min"
      brief={{
        tag: '🎨 Mission 05',
        title: '« Les deux tiers des trois quarts », ça fait combien ?',
        body: (
          <p>
            Un carré, découpé en colonnes et en lignes. Peins d’abord{' '}
            <MathText>{`$${formatFrac(A)}$`}</MathText> des colonnes en bleu, puis{' '}
            <MathText>{`$${formatFrac(B)}$`}</MathText> des lignes en jaune. Compte ensuite les cases
            peintes deux fois.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Peins 3 colonnes sur 4, puis 2 lignes sur 3',
          subtitle: 'Tape les en-têtes bleus, puis les en-têtes jaunes.',
          done: painted,
          content: (kit) => (
            <div className="space-y-3">
              <FractionAreaGrid
                aDen={A.den}
                bDen={B.den}
                aNum={A.num}
                bNum={B.num}
                cols={cols}
                rows={rows}
                onToggleCol={(i) => toggle(setCols, i)}
                onToggleRow={(j) => toggle(setRows, j)}
              />
              {!painted && (
                <Feedback tone="info">
                  Il te faut <strong className="font-mono">{A.num}</strong> colonne
                  {A.num > 1 ? 's' : ''} bleue{A.num > 1 ? 's' : ''} (tu en as {cols.size}) et{' '}
                  <strong className="font-mono">{B.num}</strong> ligne{B.num > 1 ? 's' : ''} jaune
                  {B.num > 1 ? 's' : ''} (tu en as {rows.size}).
                  {cols.size > A.num && ' Re-tape une colonne bleue pour la dépeindre.'}
                  {rows.size > B.num && ' Re-tape une ligne jaune pour la dépeindre.'}
                </Feedback>
              )}
              {!painted && tries >= 3 && (
                <button
                  type="button"
                  onClick={() => showMe(kit.react)}
                  className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Je ne trouve pas — montre-moi
                </button>
              )}
              {painted && (
                <Feedback tone="ok">
                  <strong className="font-mono">6</strong> cases vertes sur{' '}
                  <strong className="font-mono">12</strong> :{' '}
                  <MathText>{'$\\frac{6}{12} = \\frac{1}{2}$'}</MathText>. Et regarde bien :{' '}
                  {formatDec(toDecimal(PRODUCT, 3))} est plus PETIT que{' '}
                  {formatDec(toDecimal(A, 3))} et que {formatDec(toDecimal(B, 3))}. Multiplier par un
                  nombre inférieur à 1 rapetisse.
                  {revealed && ' (Le coloriage t’a été montré — refais-le à la main.)'}
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'D’où viennent le 6 et le 12 ?',
          done: ruleDone,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt="Sur le quadrillage, comment obtient-on le nombre de cases vertes et le nombre total de cases ?"
                options={[
                  '2 × 3 cases vertes, et 3 × 4 cases en tout : on multiplie haut par haut et bas par bas',
                  '2 + 3 cases vertes, et 3 + 4 cases en tout',
                  '2 × 3 cases vertes, mais le dénominateur reste 4',
                ]}
                cols={1}
                correct={0}
                explain={
                  <>
                    Le rectangle vert fait 3 colonnes sur 2 lignes, soit 3 × 2 = 6 cases ; le carré
                    entier fait 4 × 3 = 12 cases. D’où{' '}
                    <MathText>{`$${formatFrac(B)} \\times ${formatFrac(A)} = \\frac{2 \\times 3}{3 \\times 4} = \\frac{6}{12} = ${formatFrac(PRODUCT)}$`}</MathText>.
                  </>
                }
                explainWrong={
                  <>
                    Compte sur la grille : le rectangle vert a 3 cases de large et 2 de haut → 3 × 2 = 6
                    (pas 5). Et le carré entier a 4 × 3 = 12 cases (pas 7). Garder le dénominateur 4
                    donnerait 6/4, soit 1,5 — bien plus grand que le carré lui-même, ce qui est
                    impossible.
                  </>
                }
                requires={['meme-decoupe', 'ecritures-equivalentes']}
                solved={ruleDone}
                onAnswered={() => setRuleDone(true)}
              />
              {ruleDone && (
                <KnowledgeBrick
                  id="produit-rationnels"
                  variant="new"
                  lead="Le rectangle vert que tu as peint donne les deux nombres d’un coup : sa largeur en haut, sa hauteur en bas."
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Combien de quarts tiennent dans 3/2 ?',
          subtitle: 'Pose les paquets bout à bout, puis écris ce que tu as compté.',
          done: packetsFull && divDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                La zone bleue mesure <MathText>{`$${formatFrac(DIVIDEND)}$`}</MathText>. Pose des
                paquets d’un quart bout à bout jusqu’à la remplir <strong>exactement</strong>, et
                compte-les.
              </p>
              <PacketCounter
                total={DIVIDEND}
                packet={DIVISOR}
                placed={packets}
                onPlaced={(n) => { setPacketRefusal(''); setPackets(n); }}
                onRefuse={setPacketRefusal}
                max={2}
              />
              {packetRefusal && <Feedback tone="ko">{packetRefusal}</Feedback>}
              {!packetsFull && (
                <Feedback tone="info">
                  {packets === 0
                    ? 'Glisse vers la droite (ou tape +) pour poser un premier paquet.'
                    : `${packets} paquet${packets > 1 ? 's' : ''} posé${packets > 1 ? 's' : ''} — la zone bleue n’est pas encore remplie.`}
                </Feedback>
              )}
              {packetsFull && (
                <Feedback tone="ok">
                  Remplie exactement avec <strong className="font-mono">{packets}</strong> paquets d’un
                  quart. Tu viens de répondre à la question « combien de fois{' '}
                  <MathText>{`$${formatFrac(DIVISOR)}$`}</MathText> tient-il dans{' '}
                  <MathText>{`$${formatFrac(DIVIDEND)}$`}</MathText> ? » — sans poser une seule division.
                </Feedback>
              )}
              <NumericQuestion
                prompt={
                  <>
                    <MathText>{`$${formatFrac(DIVIDEND)} \\div ${formatFrac(DIVISOR)} = ?$`}</MathText>
                  </>
                }
                expected={toDecimal(QUOTIENT)}
                parse={parseDec}
                display={formatDec(toDecimal(QUOTIENT))}
                explain="En quarts, 3/2 s'écrit 6/4 : il y a exactement 6 paquets d'un quart. Diviser par 1/4, c'est multiplier par 4."
                explainFor={(n) =>
                  n < 1.5
                    ? "Piège classique : « diviser rend plus petit ». C'est vrai en divisant par un nombre PLUS GRAND que 1. Ici on divise par 1/4, qui est plus petit que 1 : le résultat est plus grand. Compte les paquets sur la barre — il y en a 6."
                    : "En quarts, 3/2 s'écrit 6/4 : il y a exactement 6 paquets d'un quart. Diviser par 1/4, c'est multiplier par 4."
                }
                requires={['ecritures-equivalentes', 'quotient']}
                solved={divDone}
                onAnswered={() => setDivDone(true)}
              />
              {divDone && (
                <Feedback tone="ok">
                  Le résultat, <strong className="font-mono">6</strong>, est bien plus grand que{' '}
                  <MathText>{`$${formatFrac(DIVIDEND)}$`}</MathText>. « Diviser rend plus petit » est
                  faux dès qu’on divise par un nombre inférieur à 1.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Et si on n’a pas envie de compter les paquets ?',
          done: invDone,
          content: (
            <div className="space-y-4">
              <KnowledgeBrick
                id="quotient-rationnels"
                variant="new"
                lead="Compter six paquets d’un quart dans 3/2, c’est exactement multiplier 3/2 par 4. Ce raccourci a un nom."
              />
              <TapQuestion
                prompt={
                  <>
                    Combien vaut <MathText>{'$\\frac{2}{5} \\div \\frac{3}{4}$'}</MathText> ?
                  </>
                }
                options={['$\\frac{8}{15}$', '$\\frac{6}{20}$', '$\\frac{2 \\times 3}{5 \\times 4}$']}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['8/15', '6/20', '(2×3)/(5×4)'][i]}
                correctionLabel="8/15"
                cols={3}
                correct={0}
                explain={
                  <>
                    On retourne <MathText>{'$\\frac{3}{4}$'}</MathText> en{' '}
                    <MathText>{'$\\frac{4}{3}$'}</MathText>, puis{' '}
                    <MathText>{'$\\frac{2}{5} \\times \\frac{4}{3} = \\frac{8}{15}$'}</MathText>. Comme
                    on divise par un nombre plus petit que 1, le résultat (≈{' '}
                    {formatDec(toDecimal(rat(8, 15), 2))}) dépasse{' '}
                    <MathText>{'$\\frac{2}{5}$'}</MathText> (= {formatDec(0.4)}).
                  </>
                }
                explainWrong={
                  <>
                    Les deux autres réponses ont multiplié SANS retourner :{' '}
                    <MathText>{'$\\frac{2 \\times 3}{5 \\times 4} = \\frac{6}{20}$'}</MathText>, c’est le
                    PRODUIT, pas le quotient. Il faut d’abord retourner la deuxième fraction :{' '}
                    <MathText>{'$\\frac{2}{5} \\times \\frac{4}{3} = \\frac{8}{15}$'}</MathText>.
                  </>
                }
                requires={['quotient-rationnels', 'produit-rationnels']}
                solved={invDone}
                onAnswered={() => setInvDone(true)}
              />
            </div>
          ),
        },
        {
          num: 5,
          title: 'La copie de Naïm',
          subtitle: 'Trouve la ligne fautive, répare-la, puis vérifie en comptant.',
          done: spotDone && check2 === 2,
          content: (kit) => (
            <div className="space-y-3">
              <ErrorSpotter
                title="Naïm calcule 2/5 ÷ 3/4"
                lines={[
                  { id: 'q1', latex: '\\frac{2}{5} \\div \\frac{3}{4} \;=\; \\frac{2 \\times 3}{5 \\times 4}' },
                  { id: 'q2', latex: '\;=\; \\frac{6}{20}' },
                  { id: 'q3', latex: '\;=\; \\frac{3}{10}' },
                ]}
                faultyId="q1"
                tapped={tapped}
                onTap={(id, ok) => { setTapped((t) => (t.includes(id) ? t : [...t, id])); kit.react(ok); }}
                reasonFor={(id) => {
                  if (id === 'q2') return 'Ligne juste : 2 × 3 = 6 et 5 × 4 = 20. Le calcul est bon — c’est ce qu’on lui demandait de calculer qui était faux.';
                  if (id === 'q3') return 'Ligne juste : 6/20 se simplifie bien par 2 en 3/10.';
                  if (id === 'q1') return 'C’est là, dès la première ligne. Naïm a MULTIPLIÉ les deux fractions au lieu de retourner la seconde. Tout ce qui suit est juste, mais part d’un mauvais départ.';
                  if (id === 'inv') return 'Oui : on retourne la seconde, puis on multiplie — 2/5 × 4/3 = 8/15 ≈ 0,53.';
                  if (id === 'both') return 'Non : retourner les DEUX fractions donne 5/2 × 4/3, encore autre chose.';
                  return 'Non : c’est exactement ce que Naïm a écrit, et c’est le produit, pas le quotient.';
                }}
                repairs={[
                  { id: 'mul', latex: '\\frac{2}{5} \\times \\frac{3}{4}' },
                  { id: 'inv', latex: '\\frac{2}{5} \\times \\frac{4}{3}' },
                  { id: 'both', latex: '\\frac{5}{2} \\times \\frac{4}{3}' },
                ]}
                repairId="inv"
                repairPicked={repair}
                onRepair={(id, ok) => { setRepair(id); kit.react(ok); }}
                repairPrompt="Par quoi fallait-il remplacer la première ligne ?"
              />
              {spotDone && (
                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 space-y-2">
                  <p className="text-sm font-semibold text-slate-700">
                    Vérifie le raccourci sur un cas que tu peux compter :{' '}
                    <MathText>{'$\\frac{1}{2} \\div \\frac{1}{4}$'}</MathText>. Combien de quarts
                    dans un demi ?
                  </p>
                  <PacketCounter
                    total={rat(1, 2)}
                    packet={rat(1, 4)}
                    placed={check2}
                    onPlaced={setCheck2}
                    max={1}
                  />
                  <Feedback tone={check2 === 2 ? 'ok' : 'info'}>
                    {check2 === 2 ? (
                      <>
                        Deux paquets — et le raccourci donne{' '}
                        <MathText>{'$\\frac{1}{2} \\times \\frac{4}{1} = 2$'}</MathText>. Compter et
                        multiplier par l’inverse donnent bien la même chose.
                      </>
                    ) : (
                      'Pose les paquets d’un quart jusqu’à remplir le demi.'
                    )}
                  </Feedback>
                </div>
              )}
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Ni multiplier ni diviser ne « rapetissent toujours ». Tu as
          maintenant les quatre opérations — au module suivant, on regarde dans quel ORDRE les faire.
        </KnowledgeSnapshot>
      )}
    />
  );
}
