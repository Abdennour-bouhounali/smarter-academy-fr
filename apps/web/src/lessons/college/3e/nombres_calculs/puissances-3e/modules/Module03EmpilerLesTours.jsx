import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PowerTower from '../components/PowerTower';
import { formatDec, formatPower, pow, tower, mergeTowers, splitTowers, repeatTower } from '../components/powerUtils';

/**
 * Module 3 — MANIPULATION SIGNATURE : « Empiler les tours ».
 *
 * Activity: fusionner deux tours de même base, en retrancher une d'une autre,
 *   puis répéter une tour — et compter les blocs à chaque fois.
 * Mathematical objective: établir a^m × a^n = a^{m+n}, a^m ÷ a^n = a^{m−n} et
 *   (a^m)^k = a^{m×k} en LISANT le compte des blocs, jamais en récitant.
 * Student action: taper « ×3 » / « Dépiler » pour régler chaque tour, puis
 *   « Fusionner », « Retrancher », « Répéter ×2 ».
 * Controlled variable: les exposants m et n (nombres de blocs).
 * Mathematical state: deux tours `{ base, n }` possédées par le module ; le
 *   résultat vient de mergeTowers / splitTowers / repeatTower, jamais d'une
 *   formule écrite à la main.
 * Visual consequence: les blocs de B viennent se poser sur A (fusion), ou
 *   disparaissent du sommet de A (retranchement) ; l'écriture compacte se
 *   met à jour depuis le compte.
 * Expected observation: les blocs s'ajoutent, donc les exposants s'ajoutent —
 *   les BASES, elles, ne bougent jamais.
 * Misconception targeted: « 3² × 3³ = 9⁵ » (on multiplie aussi les bases) et
 *   « 3² × 3³ = 3⁶ » (on multiplie les exposants au lieu de les ajouter).
 * Feedback: tant que la cible n'est pas atteinte, l'écart en nombre de blocs
 *   est affiché ; après la fusion, le compte total est relu à voix haute.
 * Formalization: étape 4, les trois règles, écrites après les trois gestes.
 * Scaffolding: après 3 réglages infructueux, « Je ne trouve pas — montre-moi »
 *   place les deux tours sur la cible et effectue l'opération.
 * Transfer: la règle du quotient sert au module 4 sur les puissances de 10.
 */
const BASE = 3;
const TARGET_M = 2;
const TARGET_N = 3;

export default function Module03EmpilerLesTours() {
  // Étape 1 — produit
  const [mA, setMA] = useState(1);
  const [mB, setMB] = useState(1);
  const [merged, setMerged] = useState(false);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Étape 2 — quotient
  const [qA, setQA] = useState(3);
  const [qB, setQB] = useState(1);
  const [splitDone, setSplitDone] = useState(false);

  // Étape 3 — puissance de puissance
  const [rN, setRN] = useState(2);
  const [repeated, setRepeated] = useState(false);

  // Étape 4 — la règle nommée
  const [ruleDone, setRuleDone] = useState(false);

  const readyToMerge = mA === TARGET_M && mB === TARGET_N;
  const mergedTower = mergeTowers(tower(BASE, mA), tower(BASE, mB));
  const splitTower = splitTowers(tower(BASE, qA), tower(BASE, qB));
  const repeatedTower = repeatTower(tower(BASE, rN), 2);

  const setMAWithTries = (v) => {
    setMA(v);
    if (!(v === TARGET_M && mB === TARGET_N)) setTries((t) => t + 1);
  };
  const setMBWithTries = (v) => {
    setMB(v);
    if (!(mA === TARGET_M && v === TARGET_N)) setTries((t) => t + 1);
  };

  const showMe = (kitReact) => {
    setMA(TARGET_M);
    setMB(TARGET_N);
    setMerged(true);
    setRevealed(true);
    kitReact?.(false);
  };

  const doMerge = (kitReact) => {
    setMerged(true);
    kitReact?.(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Empiler les tours"
      moduleSubtitle="Deux tours qui fusionnent, une tour qu’on ampute, une tour qu’on répète."
      estimatedTime="11 min"
      brief={{
        tag: '🧱 Mission 03',
        title: 'Ce ne sont pas les bases qui bougent, ce sont les blocs.',
        body: (
          <p>
            Tu vas régler deux tours de base <strong>{BASE}</strong>, les faire fusionner, puis compter les
            blocs du résultat. Trois gestes, trois règles — que tu écriras toi-même à la fin.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: `Règle la tour A sur ${TARGET_M} blocs, la tour B sur ${TARGET_N}, puis fusionne`,
          subtitle: 'Tape « × 3 » pour empiler, « Dépiler » pour retirer.',
          done: merged,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                La tour A doit valoir <MathText>{`$${formatPower(BASE, TARGET_M)}$`}</MathText>, la tour B{' '}
                <MathText>{`$${formatPower(BASE, TARGET_N)}$`}</MathText>. Ensuite, verse B dans A et regarde
                la hauteur obtenue.
              </p>
              <PowerTower
                base={BASE}
                n={mA}
                onChange={merged ? undefined : setMAWithTries}
                n2={mB}
                onChange2={merged ? undefined : setMBWithTries}
                mode="merge"
                minN={0}
                maxN={6}
                onCombine={readyToMerge && !merged ? () => doMerge(kit.react) : undefined}
                combined={merged}
                label="Deux tours à fusionner"
              />
              {!merged && !readyToMerge && (
                <Feedback tone="info">
                  Pour l’instant A a <strong className="font-mono">{formatDec(mA)}</strong> bloc
                  {mA > 1 ? 's' : ''} et B en a <strong className="font-mono">{formatDec(mB)}</strong>. Il
                  manque{' '}
                  <strong className="font-mono">
                    {formatDec(Math.abs(TARGET_M - mA) + Math.abs(TARGET_N - mB))}
                  </strong>{' '}
                  réglage{Math.abs(TARGET_M - mA) + Math.abs(TARGET_N - mB) > 1 ? 's' : ''} pour atteindre{' '}
                  <MathText>{`$${formatPower(BASE, TARGET_M)}$`}</MathText> et{' '}
                  <MathText>{`$${formatPower(BASE, TARGET_N)}$`}</MathText>.
                </Feedback>
              )}
              {!merged && readyToMerge && (
                <Feedback tone="ok">
                  Les deux tours sont prêtes. Tape <strong>Fusionner</strong> : les blocs de B viennent se
                  poser sur A.
                </Feedback>
              )}
              {!merged && tries >= 3 && (
                <button
                  type="button"
                  onClick={() => showMe(kit.react)}
                  className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Je ne trouve pas — montre-moi
                </button>
              )}
              {merged && (
                <Feedback tone="ok">
                  <strong className="font-mono">{formatDec(TARGET_M)}</strong> blocs plus{' '}
                  <strong className="font-mono">{formatDec(TARGET_N)}</strong> blocs font{' '}
                  <strong className="font-mono">{formatDec(mergedTower.n)}</strong> blocs :{' '}
                  <MathText>{`$${formatPower(BASE, TARGET_M)} \\times ${formatPower(BASE, TARGET_N)} = ${formatPower(BASE, mergedTower.n)} = ${formatDec(pow(BASE, mergedTower.n))}$`}</MathText>.
                  La base est restée <strong>{BASE}</strong> — seuls les blocs se sont additionnés.
                  {revealed && ' (Ce coup-ci on te l’a montré — refais-le avec d’autres réglages pour le sentir.)'}
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Retire les blocs de B à la tour A',
          subtitle: 'Même base, mais cette fois on divise.',
          done: splitDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                A a <MathText>{`$${formatPower(BASE, qA)}$`}</MathText>, B a{' '}
                <MathText>{`$${formatPower(BASE, qB)}$`}</MathText>. Divise A par B en retirant du sommet de A
                autant de blocs que B en contient.
              </p>
              <PowerTower
                base={BASE}
                n={qA}
                onChange={splitDone ? undefined : setQA}
                n2={qB}
                onChange2={splitDone ? undefined : setQB}
                mode="split"
                minN={0}
                maxN={6}
                onCombine={
                  splitDone
                    ? undefined
                    : () => {
                        setSplitDone(true);
                        kit.react(true);
                      }
                }
                combined={splitDone}
                label="Une tour à retrancher"
              />
              {!splitDone && (
                <Feedback tone="info">
                  Si on retire <strong className="font-mono">{formatDec(qB)}</strong> bloc
                  {qB > 1 ? 's' : ''} d’une tour qui en a <strong className="font-mono">{formatDec(qA)}</strong>,
                  combien en restera-t-il ? Tape <strong>Retrancher</strong> pour le voir.
                </Feedback>
              )}
              {splitDone && (
                <Feedback tone="ok">
                  Il reste <strong className="font-mono">{formatDec(splitTower.n)}</strong> bloc
                  {Math.abs(splitTower.n) > 1 ? 's' : ''} :{' '}
                  <MathText>{`$${formatPower(BASE, qA)} \\div ${formatPower(BASE, qB)} = ${formatPower(BASE, splitTower.n)} = ${formatDec(pow(BASE, splitTower.n), { maxDecimals: 6 })}$`}</MathText>.
                  Diviser, c’est <strong>enlever</strong> des blocs : les exposants se soustraient.
                  {splitTower.n < 0 && ' Ici on est passé sous le sol — la tour vaut une fraction.'}
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Répète la tour deux fois',
          subtitle: 'Une tour de m blocs, prise 2 fois : combien de blocs ?',
          done: repeated,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Cette fois, on prend la tour entière et on la recopie. Règle-la, puis tape{' '}
                <strong>Répéter ×2</strong>.
              </p>
              <PowerTower
                base={BASE}
                n={rN}
                onChange={repeated ? undefined : setRN}
                mode="repeat"
                k={2}
                minN={1}
                maxN={5}
                onCombine={
                  repeated
                    ? undefined
                    : () => {
                        setRepeated(true);
                        kit.react(true);
                      }
                }
                combined={repeated}
                label="Une tour à répéter"
              />
              {!repeated && (
                <Feedback tone="info">
                  La tour a <strong className="font-mono">{formatDec(rN)}</strong> bloc{rN > 1 ? 's' : ''}. En
                  la prenant 2 fois, on empile deux paquets de {formatDec(rN)} blocs.
                </Feedback>
              )}
              {repeated && (
                <Feedback tone="ok">
                  Deux paquets de <strong className="font-mono">{formatDec(rN)}</strong> blocs font{' '}
                  <strong className="font-mono">{formatDec(repeatedTower.n)}</strong> blocs :{' '}
                  <MathText>{`$\\left(${formatPower(BASE, rN)}\\right)^{2} = ${formatPower(BASE, repeatedTower.n)} = ${formatDec(pow(BASE, repeatedTower.n))}$`}</MathText>.
                  Répéter, c’est <strong>multiplier</strong> les exposants.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Les trois règles, maintenant qu’elles sont vues',
          done: ruleDone,
          content: (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 space-y-2 text-center">
                <p className="text-sm font-semibold text-emerald-900">À retenir — même base, on compte les blocs :</p>
                <MathText className="text-lg text-slate-800">{'$a^{m} \\times a^{n} = a^{m+n}$'}</MathText>
                <MathText className="text-lg text-slate-800">{'$a^{m} \\div a^{n} = a^{m-n}$'}</MathText>
                <MathText className="text-lg text-slate-800">{'$\\left(a^{m}\\right)^{n} = a^{m \\times n}$'}</MathText>
                <p className="text-xs text-emerald-800">
                  La base ne change jamais. Ce sont les exposants — les comptes de blocs — qui bougent.
                </p>
              </div>
              <TapQuestion
                prompt={
                  <>
                    Combien vaut <MathText>{'$3^{2} \\times 3^{3}$'}</MathText> ?
                  </>
                }
                options={['$9^{5}$', '$3^{5}$', '$3^{6}$']}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['9⁵', '3⁵', '3⁶'][i]}
                correctionLabel="3⁵"
                cols={3}
                correct={1}
                explain={
                  <>
                    2 blocs plus 3 blocs font 5 blocs, tous de base 3 :{' '}
                    <MathText>{'$3^{2} \\times 3^{3} = 3^{5} = 243$'}</MathText>.
                  </>
                }
                explainWrong={
                  <>
                    Les deux pièges. <MathText>{'$9^{5}$'}</MathText> multiplie aussi les bases — or aucun
                    bloc ne change de base quand on fusionne. <MathText>{'$3^{6}$'}</MathText> multiplie les
                    exposants (2 × 3) au lieu de les ajouter : c’est la règle de la RÉPÉTITION, pas celle du
                    produit. Sur la tour, on a bien 2 + 3 = 5 blocs.
                  </>
                }
                solved={ruleDone}
                onAnswered={() => setRuleDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Tu as fusionné, retranché et répété des tours. Les trois règles ne sont pas trois formules à
          apprendre : ce sont trois façons de <strong>compter des blocs</strong> — on ajoute, on enlève, on
          multiplie le compte.
        </Feedback>
      }
    />
  );
}
