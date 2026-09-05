import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RectangleArray from '../components/RectangleArray';
import { divisorPairs, divisors, mirrorThreshold, isPrime, normalizePair, hasPair } from '../components/divisibilityUtils';

/**
 * Module 4 — MANIPULATION SIGNATURE : « Le Rectangle-Détecteur ».
 *
 * Activity: trouver TOUS les diviseurs d'un nombre en tamponnant les paires
 *   de rangées qui donnent un rectangle complet, et s'arrêter de soi-même
 *   quand les paires se remettent à tourner.
 * Mathematical objective: la liste des diviseurs d'un entier est FINIE et
 *   structurée en paires (d, n/d) ; passé √n, les paires se répètent ; un
 *   nombre premier n'a qu'une seule paire, 1 × n — le bâton.
 * Student action: régler les rangées (puces / stepper), taper « Garder cette
 *   paire », puis trancher « bâton seulement » / « autre rectangle ».
 * Controlled variable: le nombre de rangées r.
 * Mathematical state: (n, rows) + l'ensemble des paires tamponnées.
 * Visual consequence: rectangle émeraude ou bac « reste » rouge ; la carte
 *   d'identité de n se remplit et se trie toute seule.
 * Expected observation: 36 donne 5 paires et pas une de plus ; à partir de
 *   6 rangées on retombe sur des paires déjà vues ; 13 et 23 ne donnent
 *   jamais autre chose que le bâton.
 * Misconception targeted: #2 (« ça se divise même avec un reste »), #3
 *   (« 1 est premier » / « 2 n'est pas premier car pair »).
 * Feedback: l'écart restant est chiffré (« il te manque 2 paires ») ;
 *   échappatoire après 6 essais infructueux, qui révèle et complète.
 * Formalization: le mot « nombre premier » est nommé APRÈS le geste, à
 *   l'étape 4, comme lecture de la forme « un seul rectangle : le bâton ».
 * Scaffolding: étape 1 guidée sur 36 (déjà vu au module 1), étape 3 en
 *   autonomie sur 24, étape 4 sans tampon — juste un verdict.
 * Transfer: 13 · 21 · 23 puis le crible du module 5.
 */

const N1 = 36;
const N2 = 24;
const PAIRS_36 = divisorPairs(N1); // 5 paires
const PAIRS_24 = divisorPairs(N2); // 4 paires
const MIRROR_36 = mirrorThreshold(N1); // 6

const VERDICT_NUMBERS = [13, 21, 23];

export default function Module04RectangleDetecteur() {
  /* Étape 1 — les 5 paires de 36 */
  const [rows36, setRows36] = useState(1);
  const [stamped36, setStamped36] = useState([]);
  const [tries36, setTries36] = useState(0);
  const [revealed36, setRevealed36] = useState(false);

  /* Étape 2 — la question du miroir */
  const [mirrorDone, setMirrorDone] = useState(false);

  /* Étape 3 — les 4 paires de 24 */
  const [rows24, setRows24] = useState(1);
  const [stamped24, setStamped24] = useState([]);
  const [tries24, setTries24] = useState(0);
  const [revealed24, setRevealed24] = useState(false);

  /* Étape 4 — premier ou pas */
  const [verdicts, setVerdicts] = useState({});
  const [vIndex, setVIndex] = useState(0);
  const [vRows, setVRows] = useState(1);

  const done1 = stamped36.length === PAIRS_36.length || revealed36;
  const done3 = stamped24.length === PAIRS_24.length || revealed24;
  const done4 = VERDICT_NUMBERS.every((v) => verdicts[v] !== undefined);

  const stamp = (setter, list, pair, react) => {
    if (hasPair(list, pair)) return;
    const next = [...list, normalizePair(pair)].sort((a, b) => a[0] - b[0]);
    setter(next);
    react?.(true);
    return next;
  };

  const bumpTry = (setter, list, rows, n) => {
    const p = n % rows === 0 ? normalizePair([rows, n / rows]) : null;
    if (!p || hasPair(list, p)) setter((t) => t + 1);
  };

  const current = VERDICT_NUMBERS[vIndex] ?? VERDICT_NUMBERS[VERDICT_NUMBERS.length - 1];
  const currentIsPrime = isPrime(current);

  const answerVerdict = (saysStickOnly, react) => {
    const ok = saysStickOnly === currentIsPrime;
    react?.(ok);
    setVerdicts((v) => ({ ...v, [current]: saysStickOnly }));
    setVRows(1);
    if (vIndex < VERDICT_NUMBERS.length - 1) setVIndex(vIndex + 1);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Le Rectangle-Détecteur"
      moduleSubtitle="Tous les diviseurs, par paires — et le nombre qui ne fait qu’un bâton."
      estimatedTime="11 min"
      brief={{
        tag: '🔍 Mission 04',
        title: 'Un nombre a-t-il beaucoup de rectangles, ou un seul ?',
        body: (
          <p>
            Les boîtes-cadeaux de la fête doivent être rangées en rectangles parfaits. Trouve TOUTES
            les façons de le faire — et arrête-toi quand tu vois que ça tourne en rond.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Les 5 paires de 36',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                36 boîtes à ranger en rectangle. Garde <strong>chaque</strong> paire qui tombe juste.
                Arrête-toi quand tu es sûr d’avoir tout trouvé.
              </p>
              <RectangleArray
                n={N1}
                rows={rows36}
                onRowsChange={(r) => {
                  setRows36(r);
                  bumpTry(setTries36, stamped36, r, N1);
                }}
                stamped={stamped36}
                onStamp={(p) => {
                  if (revealed36) return;
                  const next = stamp(setStamped36, stamped36, p, kit.react);
                  if (next && next.length === PAIRS_36.length) setTries36(0);
                }}
                revealAll={revealed36}
                disabled={revealed36}
                ariaLabel="Rectangle-Détecteur pour 36 boîtes"
              />

              {!done1 && (
                <Feedback tone="info">
                  Tu as gardé <strong>{stamped36.length}</strong> paire{stamped36.length > 1 ? 's' : ''} sur{' '}
                  <strong>{PAIRS_36.length}</strong>. Il t’en manque{' '}
                  <strong>{PAIRS_36.length - stamped36.length}</strong> — essaie d’autres nombres de rangées.
                </Feedback>
              )}

              {!done1 && tries36 >= 6 && (
                <button
                  type="button"
                  onClick={() => {
                    setRevealed36(true);
                    kit.react(false);
                  }}
                  className="w-full min-h-[48px] rounded-xl border-2 border-sky-300 bg-sky-50 text-sky-800 font-bold hover:border-sky-500"
                >
                  Je ne trouve pas — montre-moi les paires restantes
                </button>
              )}

              {done1 && (
                <Feedback tone={revealed36 ? 'info' : 'ok'}>
                  {revealed36 ? 'Pas grave, on te les montre : ' : ''}
                  36 a exactement <strong>{PAIRS_36.length} paires</strong> —{' '}
                  {PAIRS_36.map(([a, b]) => `${a} × ${b}`).join(', ')} — donc{' '}
                  <strong>{divisors(N1).length} diviseurs</strong> :{' '}
                  <span className="font-mono">{divisors(N1).join(' · ')}</span>. Une liste qui{' '}
                  <strong>s’arrête</strong>, contrairement à celle des multiples.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Où les paires se remettent-elles à tourner ?',
          done: mirrorDone,
          content: (
            <TapQuestion
              prompt="À partir de combien de rangées retombe-t-on sur des paires déjà trouvées, pour 36 ?"
              options={['À partir de 4 rangées', 'À partir de 6 rangées', 'À partir de 9 rangées', 'Jamais : il y en a toujours de nouvelles']}
              correct={1}
              cols={2}
              solved={mirrorDone}
              onAnswered={() => setMirrorDone(true)}
              explain={
                <>
                  6 × 6 = 36 : c’est le carré. Après 6 rangées, 9 × 4 est le même rectangle que 4 × 9,
                  et 12 × 3 le même que 3 × 12 — juste tourné. Chercher jusqu’à{' '}
                  <strong className="font-mono">{MIRROR_36}</strong> suffit toujours.
                </>
              }
            />
          ),
        },
        {
          num: 3,
          title: 'À toi : les paires de 24',
          done: done3,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                24 gobelets, cette fois. Même geste — mais tu sais maintenant où t’arrêter de chercher.
              </p>
              <RectangleArray
                n={N2}
                rows={rows24}
                onRowsChange={(r) => {
                  setRows24(r);
                  bumpTry(setTries24, stamped24, r, N2);
                }}
                stamped={stamped24}
                onStamp={(p) => {
                  if (revealed24) return;
                  const next = stamp(setStamped24, stamped24, p, kit.react);
                  if (next && next.length === PAIRS_24.length) setTries24(0);
                }}
                revealAll={revealed24}
                disabled={revealed24}
                ariaLabel="Rectangle-Détecteur pour 24 gobelets"
              />

              {!done3 && (
                <Feedback tone="info">
                  <strong>{stamped24.length}</strong> / <strong>{PAIRS_24.length}</strong> paires.
                  Au-delà de <strong className="font-mono">{mirrorThreshold(N2)}</strong> rangées, tu ne
                  trouveras plus rien de neuf.
                </Feedback>
              )}

              {!done3 && tries24 >= 6 && (
                <button
                  type="button"
                  onClick={() => {
                    setRevealed24(true);
                    kit.react(false);
                  }}
                  className="w-full min-h-[48px] rounded-xl border-2 border-sky-300 bg-sky-50 text-sky-800 font-bold hover:border-sky-500"
                >
                  Je ne trouve pas — montre-moi les paires restantes
                </button>
              )}

              {done3 && (
                <Feedback tone={revealed24 ? 'info' : 'ok'}>
                  24 = {PAIRS_24.map(([a, b]) => `${a} × ${b}`).join(' = ')}. Ses diviseurs :{' '}
                  <span className="font-mono">{divisors(N2).join(' · ')}</span> — 8 diviseurs, 4 paires.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Bâton seulement, ou autre rectangle ?',
          done: done4,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Trois nombres de boîtes. Essaie des rangées, puis tranche : ce nombre fait-il{' '}
                <strong>un autre rectangle</strong> que le bâton 1 × n, ou pas ?
              </p>

              <div className="flex gap-1.5 flex-wrap" aria-hidden="true">
                {VERDICT_NUMBERS.map((v, i) => (
                  <span
                    key={v}
                    className={`font-mono text-xs font-bold px-3 py-1.5 rounded-lg border-2 ${
                      verdicts[v] !== undefined
                        ? verdicts[v] === isPrime(v)
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-700'
                          : 'bg-rose-100 border-rose-400 text-rose-700'
                        : i === vIndex
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    {v}
                  </span>
                ))}
              </div>

              {!done4 && (
                <>
                  <RectangleArray
                    n={current}
                    rows={vRows}
                    onRowsChange={setVRows}
                    stamped={[]}
                    showCard={false}
                    maxChip={10}
                    ariaLabel={`Rectangle-Détecteur pour ${current}`}
                    label={`Le nombre à juger : ${current}`}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => answerVerdict(true, kit.react)}
                      className="min-h-[48px] rounded-xl border-2 border-violet-300 bg-white text-violet-800 font-bold hover:border-violet-500"
                    >
                      Bâton seulement (1 × {current})
                    </button>
                    <button
                      type="button"
                      onClick={() => answerVerdict(false, kit.react)}
                      className="min-h-[48px] rounded-xl border-2 border-slate-300 bg-white text-slate-700 font-bold hover:border-slate-500"
                    >
                      Il fait un autre rectangle
                    </button>
                  </div>
                </>
              )}

              {Object.keys(verdicts).length > 0 && (
                <div className="space-y-2">
                  {VERDICT_NUMBERS.filter((v) => verdicts[v] !== undefined).map((v) => {
                    const ok = verdicts[v] === isPrime(v);
                    const pairs = divisorPairs(v);
                    return (
                      <Feedback key={v} tone={ok ? 'ok' : 'ko'}>
                        <strong className="font-mono">{v}</strong> :{' '}
                        {isPrime(v) ? (
                          <>
                            bâton seulement — 1 × {v} est son unique rectangle, donc {v} n’a que{' '}
                            <strong>deux diviseurs</strong> (1 et {v}).
                          </>
                        ) : (
                          <>
                            il fait aussi{' '}
                            <strong className="font-mono">
                              {pairs.filter(([a]) => a > 1).map(([a, b]) => `${a} × ${b}`).join(', ')}
                            </strong>{' '}
                            — donc {v} a {divisors(v).length} diviseurs.
                          </>
                        )}
                        {!ok && ' Ta réponse disait le contraire.'}
                      </Feedback>
                    );
                  })}
                </div>
              )}

              {done4 && (
                <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 space-y-1.5">
                  <p className="text-xs font-mono uppercase tracking-wide text-violet-600">
                    Le mot pour ça
                  </p>
                  <p className="text-sm text-violet-900">
                    Un nombre dont le seul rectangle est le bâton s’appelle un{' '}
                    <strong>nombre premier</strong> : il a <strong>exactement deux diviseurs</strong>, 1
                    et lui-même. 13 et 23 sont premiers ; 21 = 3 × 7 ne l’est pas.
                  </p>
                  <p className="text-sm text-violet-900">
                    Attention : <strong className="font-mono">1</strong> n’est pas premier — son seul
                    rectangle est 1 × 1, et il n’a donc qu’<strong>un</strong> diviseur, pas deux.
                  </p>
                </div>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Tu sais maintenant lister les diviseurs d’un nombre sans en oublier : par paires, et sans
          chercher au-delà du carré. Au module suivant, on va repérer les nombres premiers d’un coup,
          jusqu’à 50.
        </Feedback>
      }
    />
  );
}
