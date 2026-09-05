import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SquareLab from '../components/SquareLab';
import {
  bracket, isqrt, approxRoot, formatDec, formatSqrt, formatBracket,
} from '../components/rootUtils';

/**
 * Module 3 — MANIPULATION SIGNATURE : « Le carré à reconstruire ».
 *
 * Activity: on impose l'AIRE d'un carré (20 m²) et l'élève cherche son côté
 *   en tirant le coin / en poussant −/+ au dixième.
 * Mathematical objective: aucun décimal au dixième ne convient — √20 se
 *   coince entre 4 et 5, puis entre 4,4 et 4,5 : c'est un nombre d'un
 *   nouveau genre, qu'on encadre au lieu de l'écrire exactement.
 * Student action: glisser la poignée du coin, taper − / +, ou une puce
 *   entière ; la droite graduée reflète le côté.
 * Controlled variable: le côté c, au pas 0,1.
 * Mathematical state: c seul. L'aire c², l'écart à 20 et la position sur la
 *   droite en sont dérivés (SquareLab).
 * Visual consequence: le carré cible en pointillés reste visible derrière ;
 *   le carré courant vire au rouge s'il déborde, au bleu s'il manque.
 * Expected observation: 4 → 16 (trop petit), 5 → 25 (trop grand), 4,4 →
 *   19,36, 4,5 → 20,25 — on saute par-dessus 20 sans jamais l'atteindre.
 * Misconception targeted: « √20 = 10 » (racine confondue avec la moitié) et
 *   « il existe un décimal dont le carré vaut exactement 20 ».
 * Feedback: l'écart d'aire est chiffré à chaque essai (« il manque 0,64 m² »).
 * Formalization: √a est le côté du carré d'aire a ; (√a)² = a et √(a²) = a
 *   se lisent sur la même figure ; on compare √50 et 7 par les carrés.
 * Scaffolding: après 3 essais, « Je ne trouve pas — montre-moi » place le
 *   côté sur la meilleure valeur au dixième et révèle l'encadrement.
 * Transfer: la comparaison de √50 et 7, puis le boss (Synthèse figée 49 → 7).
 */
const TARGET = 20;
const [LO, HI] = bracket(TARGET);          // [4, 5]
const BEST_TENTH = 4.4;                     // 4,4² = 19,36 < 20 < 20,25 = 4,5²

export default function Module03CarreAReconstruire() {
  const [side, setSide] = useState(3);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [bracketed, setBracketed] = useState(false);
  const [squareDone, setSquareDone] = useState(false);
  const [compareDone, setCompareDone] = useState(false);

  // Objectif MATHÉMATIQUE de l'étape 1 : avoir testé les deux bornes de
  // l'encadrement (le carré trop petit ET le carré trop grand) et être
  // revenu dans le couloir du dixième. Ce n'est pas « avoir bougé ».
  const [seenLow, setSeenLow] = useState(false);
  const [seenHigh, setSeenHigh] = useState(false);
  const explored = (seenLow && seenHigh) || revealed;

  const area = Math.round(side * side * 100) / 100;
  const tooSmall = area < TARGET;
  const tooBig = area > TARGET;

  const handleSide = (next) => {
    setSide(next);
    const a = Math.round(next * next * 100) / 100;
    if (a < TARGET && next >= LO) setSeenLow(true);
    if (a > TARGET && next <= HI) setSeenHigh(true);
    setTries((t) => t + 1);
  };

  const showMe = (kitReact) => {
    setSide(BEST_TENTH);
    setSeenLow(true);
    setSeenHigh(true);
    setRevealed(true);
    kitReact?.(false);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le carré à reconstruire"
      moduleSubtitle="On te donne l’aire, tu retrouves le côté."
      estimatedTime="11 min"
      brief={{
        tag: '🧩 Mission 03',
        title: 'Une aire de 20 m². Quel côté ?',
        body: (
          <p>
            Le carré en pointillés a l’aire qu’il faut atteindre. Redimensionne le tien jusqu’à ce que
            son aire fasse exactement <strong>20 m²</strong> — au dixième près si besoin. Regarde bien ce
            qui se passe entre <strong>4</strong> et <strong>5</strong>.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Coince l’aire 20 entre deux carrés',
          subtitle: 'Un côté qui donne moins de 20, un côté qui donne plus.',
          done: explored,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Tire le coin du carré, ou utilise <strong>−</strong> et <strong>+</strong> (pas de 0,1), ou
                tape une puce. Trouve un côté dont l’aire est <em>trop petite</em>, puis un côté dont l’aire
                est <em>trop grande</em>.
              </p>

              <SquareLab
                mode="reverse"
                side={side}
                onChange={handleSide}
                targetArea={TARGET}
                maxSide={10}
                unit="m"
                label="Carré à reconstruire, aire visée 20 m²"
              />

              {!explored && (
                <Feedback tone="info">
                  {tooSmall && (
                    <>
                      Avec un côté de <strong className="font-mono">{formatDec(side)} m</strong>, l’aire vaut{' '}
                      <strong className="font-mono">{formatDec(area)} m²</strong> : il manque{' '}
                      <strong className="font-mono">{formatDec(Math.round((TARGET - area) * 100) / 100)} m²</strong>.
                      Agrandis.
                    </>
                  )}
                  {tooBig && (
                    <>
                      Avec un côté de <strong className="font-mono">{formatDec(side)} m</strong>, l’aire vaut{' '}
                      <strong className="font-mono">{formatDec(area)} m²</strong> : on dépasse de{' '}
                      <strong className="font-mono">{formatDec(Math.round((area - TARGET) * 100) / 100)} m²</strong>.
                      Réduis.
                    </>
                  )}
                  {!tooSmall && !tooBig && <>L’aire tombe pile — mais est-ce bien 20 ?</>}
                  {seenLow && !seenHigh && ' Tu as le « trop petit » : cherche maintenant un « trop grand ».'}
                  {seenHigh && !seenLow && ' Tu as le « trop grand » : cherche maintenant un « trop petit ».'}
                </Feedback>
              )}

              {!explored && tries >= 3 && (
                <button
                  type="button"
                  onClick={() => showMe(kit.react)}
                  className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Je ne trouve pas — montre-moi
                </button>
              )}

              {explored && (
                <Feedback tone="ok">
                  <p>
                    <MathText>{'$4^{2} = 16$'}</MathText> (trop petit) et{' '}
                    <MathText>{'$5^{2} = 25$'}</MathText> (trop grand) : le côté cherché est{' '}
                    <strong>entre 4 et 5</strong>. Au dixième non plus rien ne tombe juste —{' '}
                    <MathText>{'$4{,}4^{2} = 19{,}36$'}</MathText> et{' '}
                    <MathText>{'$4{,}5^{2} = 20{,}25$'}</MathText> sautent par-dessus 20.
                  </p>
                  <p className="mt-1">
                    Aucun nombre décimal ne tombe juste. Ce côté porte donc un nom à lui :{' '}
                    <MathText>{`$${formatSqrt(TARGET)}$`}</MathText>, et on l’encadre :{' '}
                    <MathText>{`$${formatBracket(TARGET)}$`}</MathText>{' '}
                    (≈ {formatDec(approxRoot(TARGET, 2))} à la calculatrice).
                    {revealed && ' (Le côté t’a été montré — refais varier autour pour le sentir.)'}
                  </p>
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Encadrer, c’est répondre',
          done: bracketed,
          content: (
            <TapQuestion
              prompt={
                <>
                  Entre quels deux entiers consécutifs se trouve <MathText>{'$\\sqrt{50}$'}</MathText> ?
                </>
              }
              options={['$6 < \\sqrt{50} < 7$', '$7 < \\sqrt{50} < 8$', '$24 < \\sqrt{50} < 26$']}
              renderOption={(o) => <MathText>{o}</MathText>}
              optionLabel={(i) => ['6 < √50 < 7', '7 < √50 < 8', '24 < √50 < 26'][i]}
              correctionLabel="7 < √50 < 8"
              cols={1}
              correct={1}
              explain={
                <>
                  On cherche les carrés parfaits qui encadrent 50 :{' '}
                  <MathText>{'$7^{2} = 49$'}</MathText> et <MathText>{'$8^{2} = 64$'}</MathText>. Comme
                  49 &lt; 50 &lt; 64, on a bien 7 &lt; √50 &lt; 8.
                </>
              }
              explainWrong={
                <>
                  Attention : encadrer une racine, ce n’est pas diviser par 2. On compare les CARRÉS :{' '}
                  <MathText>{'$6^{2} = 36$'}</MathText> est trop petit,{' '}
                  <MathText>{'$7^{2} = 49$'}</MathText> passe juste sous 50, et{' '}
                  <MathText>{'$8^{2} = 64$'}</MathText> dépasse. Donc 7 &lt; √50 &lt; 8.
                </>
              }
              solved={bracketed}
              onAnswered={() => setBracketed(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Le carré et la racine s’annulent',
          subtitle: 'Deux lectures de la même figure.',
          done: squareDone,
          content: (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 space-y-2">
                <p className="text-sm text-violet-900">
                  Sur ton carré : le côté est <MathText>{`$${formatSqrt(TARGET)}$`}</MathText>, et l’aire —
                  c’est-à-dire le côté au carré — vaut 20. Autrement dit :
                </p>
                <p className="text-center">
                  <MathText className="text-lg text-slate-800">
                    {'$(\\sqrt{20})^{2} = 20$'}
                  </MathText>
                </p>
                <p className="text-sm text-violet-900">
                  Et dans l’autre sens : un carré d’aire <MathText>{'$7^{2} = 49$'}</MathText> a pour côté 7,
                  donc <MathText>{'$\\sqrt{7^{2}} = 7$'}</MathText>.
                </p>
              </div>

              <TapQuestion
                prompt={
                  <>
                    Sans calculatrice : que vaut <MathText>{'$(\\sqrt{13})^{2}$'}</MathText> ?
                  </>
                }
                options={['$13$', '$169$', '$\\sqrt{13}$']}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['13', '169', '√13'][i]}
                correctionLabel="13"
                cols={3}
                correct={0}
                explain={
                  <>
                    <MathText>{'$\\sqrt{13}$'}</MathText> est le côté d’un carré d’aire 13. L’élever au
                    carré, c’est retrouver cette aire : 13. Les deux opérations s’annulent.
                  </>
                }
                explainWrong={
                  <>
                    169, c’est <MathText>{'$13^{2}$'}</MathText> : tu as élevé 13 au carré au lieu de
                    l’élever <em>après</em> la racine. Or élever au carré ANNULE la racine :{' '}
                    <MathText>{'$(\\sqrt{13})^{2} = 13$'}</MathText>.
                  </>
                }
                solved={squareDone}
                onAnswered={() => setSquareDone(true)}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Comparer sans calculatrice',
          subtitle: 'On compare les carrés, pas les approximations.',
          done: compareDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Deux longueurs : <MathText>{'$\\sqrt{50}$'}</MathText> et <strong>7</strong>. Laquelle est
                la plus grande ? Compare les <strong>aires</strong> des carrés correspondants.
              </p>
              <TapQuestion
                above={(shown) => (
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3">
                      <div className="text-xs font-mono text-slate-500">Côté</div>
                      <div className="text-lg"><MathText>{'$\\sqrt{50}$'}</MathText></div>
                      <div className="text-xs font-mono text-slate-500 mt-1">Aire du carré</div>
                      <div className="font-mono font-extrabold text-slate-800">{shown ? '50' : '?'}</div>
                    </div>
                    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3">
                      <div className="text-xs font-mono text-slate-500">Côté</div>
                      <div className="text-lg"><MathText>{'$7$'}</MathText></div>
                      <div className="text-xs font-mono text-slate-500 mt-1">Aire du carré</div>
                      <div className="font-mono font-extrabold text-slate-800">{shown ? '49' : '?'}</div>
                    </div>
                  </div>
                )}
                prompt="Quelle comparaison est vraie ?"
                options={['$\\sqrt{50} < 7$', '$\\sqrt{50} > 7$', '$\\sqrt{50} = 7$']}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['√50 < 7', '√50 > 7', '√50 = 7'][i]}
                correctionLabel="√50 > 7"
                cols={3}
                correct={1}
                explain={
                  <>
                    Le carré de côté <MathText>{'$\\sqrt{50}$'}</MathText> a pour aire 50 ; celui de côté 7
                    a pour aire 49. Le plus grand carré a le plus grand côté, donc{' '}
                    <MathText>{'$\\sqrt{50} > 7$'}</MathText>. Aucune calculatrice n’a été nécessaire.
                  </>
                }
                explainWrong={
                  <>
                    Compare les aires : 50 contre <MathText>{'$7^{2} = 49$'}</MathText>. Comme 50 &gt; 49,
                    le côté <MathText>{'$\\sqrt{50}$'}</MathText> dépasse 7 (de très peu — √50 ≈{' '}
                    {formatDec(approxRoot(50, 2))}). Et √50 = 7 est faux : sinon l’aire vaudrait 49.
                  </>
                }
                solved={compareDone}
                onAnswered={() => setCompareDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Tu sais maintenant lire un carré dans les deux sens :{' '}
          <strong>de l’aire au côté (la racine)</strong> et <strong>du côté à l’aire (le carré)</strong>.
          Quand la racine ne tombe pas juste, on l’<strong>encadre</strong> entre deux entiers — et pour
          comparer, on compare les carrés. Entre {isqrt(TARGET)} et {isqrt(TARGET) + 1} pour{' '}
          <MathText>{`$${formatSqrt(TARGET)}$`}</MathText>.
        </Feedback>
      }
    />
  );
}
