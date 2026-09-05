import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import NumberLine from '../../../../../common/components/NumberLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SquareStaircase from '../components/SquareStaircase';
import {
  isqrt, bracket, approxRoot, formatDec, formatSqrt, isPerfectSquare,
} from '../components/rootUtils';

/**
 * Module 2 — DÉCOUVERTE : « L'escalier des carrés parfaits ».
 *
 * Activity: taper les 12 marches de l'escalier 1² … 12² pour constituer le
 *   répertoire des carrés parfaits, puis placer √20 sur la droite graduée.
 * Mathematical objective: reconnaître un carré parfait, lire une racine
 *   exacte, et associer n ↔ n² ↔ √(n²) dans les deux sens.
 * Student action: taper des marches (SVG ou puces), puis répondre.
 * Controlled variable: l'ensemble des marches tapées.
 * Mathematical state: `tapped` (Set). Les aires et les libellés sont dérivés.
 * Visual consequence: chaque marche tapée affiche son aire n² ; la bande de
 *   puces bascule du côté n au côté n².
 * Expected observation: les écarts entre carrés consécutifs grandissent
 *   (3, 5, 7, 9…) — entre 49 et 64, aucun carré parfait.
 * Misconception targeted: « 20 est un carré parfait car 20 est pair » et
 *   « √20 = 10 » (racine confondue avec la moitié).
 * Feedback: chaque erreur cite le carré réel du nombre proposé.
 * Formalization: carré parfait = aire d'un carré de côté entier ; √(n²) = n.
 * Scaffolding: les 12 marches restent visibles et retapables.
 * Transfer: le répertoire sert à encadrer √20 puis à simplifier (module 5).
 */
const ALL = Array.from({ length: 12 }, (_, i) => i + 1);
const TARGET = 20;

export default function Module02CarresParfaits() {
  const [tapped, setTapped] = useState(() => new Set());
  const [placed, setPlaced] = useState(null);
  const [placeChecked, setPlaceChecked] = useState(false);
  const [sortDone, setSortDone] = useState(false);
  const [tripleDone, setTripleDone] = useState(false);

  // Objectif MATHÉMATIQUE : l'escalier complet, les 12 carrés parfaits.
  const stairDone = ALL.every((n) => tapped.has(n));
  const missing = ALL.filter((n) => !tapped.has(n));

  const [lo, hi] = bracket(TARGET);

  const toggle = (n, kitReact) => {
    setTapped((s) => {
      const next = new Set(s);
      if (next.has(n)) next.delete(n); else next.add(n);
      return next;
    });
    kitReact?.(true);
  };

  const checkPlace = (kitReact) => {
    const ok = placed !== null && placed >= lo && placed <= hi;
    setPlaceChecked(true);
    kitReact?.(ok);
  };

  const placeOk = placeChecked && placed !== null && placed >= lo && placed <= hi;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="L’escalier des carrés parfaits"
      moduleSubtitle="Douze marches, douze aires qui tombent juste."
      estimatedTime="9 min"
      brief={{
        tag: '🪜 Mission 02',
        title: 'Quelles aires tombent juste ?',
        body: (
          <p>
            Certains carrés ont un côté entier : leur aire est un <strong>carré parfait</strong>. Monte
            l’escalier de 1 à 12 pour les découvrir toutes — puis regarde les trous entre les marches.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Monte les douze marches',
          subtitle: 'Tape chaque marche : elle affiche son aire.',
          done: stairDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Chaque marche est un carré de côté entier. Tape-la pour lire son aire — c’est un carré
                parfait.
              </p>

              <SquareStaircase tapped={tapped} onTap={(n) => toggle(n, kit.react)} />

              {!stairDone && (
                <Feedback tone="info">
                  {tapped.size} marche{tapped.size > 1 ? 's' : ''} sur 12.
                  {' Il en reste '}
                  <strong>{missing.length}</strong> : {missing.slice(0, 6).map((n) => formatDec(n)).join(', ')}
                  {missing.length > 6 ? '…' : ''}.
                </Feedback>
              )}

              {stairDone && (
                <Feedback tone="ok">
                  <p>
                    Voilà le répertoire :{' '}
                    <MathText>{'$1,\\;4,\\;9,\\;16,\\;25,\\;36,\\;49,\\;64,\\;81,\\;100,\\;121,\\;144$'}</MathText>.
                  </p>
                  <p className="mt-1">
                    Regarde les écarts : 3, puis 5, puis 7, puis 9… Ils <strong>grandissent</strong>. Entre
                    49 et 64, il n’y a <strong>aucun</strong> carré parfait : ni 50, ni 55, ni 60.
                  </p>
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Carré parfait, ou pas ?',
          done: sortDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  Pour chaque nombre : est-ce l’aire d’un carré de côté <strong>entier</strong> ?
                </p>
              }
              rows={[
                { id: 'n81', label: <MathText>{'$81$'}</MathText>, options: ['oui', 'non'], correct: 0, correction: '81 = 9²' },
                { id: 'n20', label: <MathText>{'$20$'}</MathText>, options: ['oui', 'non'], correct: 1, correction: '16 < 20 < 25' },
                { id: 'n100', label: <MathText>{'$100$'}</MathText>, options: ['oui', 'non'], correct: 0, correction: '100 = 10²' },
                { id: 'n50', label: <MathText>{'$50$'}</MathText>, options: ['oui', 'non'], correct: 1, correction: '49 < 50 < 64' },
                { id: 'n144', label: <MathText>{'$144$'}</MathText>, options: ['oui', 'non'], correct: 0, correction: '144 = 12²' },
              ]}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {allRight ? (
                    <>
                      {total} / {total}. Un carré parfait, c’est exactement une marche de l’escalier :
                      81 = 9², 100 = 10², 144 = 12². 20 et 50 tombent <em>entre</em> deux marches — pas de
                      côté entier pour eux.
                    </>
                  ) : (
                    <>
                      {nCorrect} / {total}. Le test n’est pas « le nombre est-il rond » : c’est « est-il
                      dans la liste 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144 ». 20 est pair, mais
                      16 &lt; 20 &lt; 25 : aucun entier ne convient. Idem pour 50, coincé entre 49 et 64.
                    </>
                  )}
                </Feedback>
              )}
              solved={sortDone}
              onAnswered={() => setSortDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Place √20 sur la droite',
          subtitle: 'Les deux marches voisines te donnent le couloir.',
          done: placeOk || placeChecked,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                20 n’est pas un carré parfait. Mais <MathText>{`$${formatSqrt(TARGET)}$`}</MathText>{' '}
                existe : c’est le côté d’un carré d’aire 20. Fais glisser le curseur pour le placer entre
                ses deux voisins entiers.
              </p>

              <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
                <NumberLine
                  min={0}
                  max={12}
                  step={1}
                  snap={0.1}
                  mode="place"
                  value={placed ?? 0}
                  onChange={(v) => { setPlaced(v); setPlaceChecked(false); }}
                  format={formatDec}
                  height={160}
                  revealValue={placeChecked}
                  ghost={placeChecked ? { value: approxRoot(TARGET, 2), label: '√20' } : null}
                  markers={[
                    { value: 16 / 4, label: '4', color: '#f59e0b' },
                    { value: 5, label: '5', color: '#f59e0b' },
                  ]}
                  ariaLabel="Placer la racine de 20 sur la droite graduée"
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {[3, 4, 4.5, 5, 10].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { setPlaced(v); setPlaceChecked(false); }}
                    aria-label={`Placer sur ${formatDec(v)}`}
                    aria-pressed={placed === v}
                    className={`min-w-[52px] min-h-[44px] rounded-xl border-2 font-mono text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      placed === v
                        ? 'bg-slate-800 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                    }`}
                  >
                    {formatDec(v)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => checkPlace(kit.react)}
                  disabled={placed === null}
                  className="min-h-[44px] px-4 rounded-xl border-2 border-emerald-600 bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  Vérifier
                </button>
              </div>

              {placeChecked && (
                <Feedback tone={placeOk ? 'ok' : 'ko'}>
                  {placeOk ? (
                    <>
                      Bien vu : <MathText>{'$4^{2} = 16$'}</MathText> et{' '}
                      <MathText>{'$5^{2} = 25$'}</MathText>, donc{' '}
                      <MathText>{'$4 < \\sqrt{20} < 5$'}</MathText>. Sa valeur approchée est{' '}
                      <strong className="font-mono">{formatDec(approxRoot(TARGET, 2))}</strong>.
                    </>
                  ) : (
                    <>
                      Ta position : <strong className="font-mono">{formatDec(placed)}</strong>. Or{' '}
                      {placed === 10
                        ? <>10 serait la <em>moitié</em> de 20, pas sa racine : 10² = 100, bien loin de 20. </>
                        : <>{formatDec(placed)}² = {formatDec(Math.round(placed * placed * 100) / 100)}, ce n’est pas 20. </>}
                      Les deux marches voisines sont <MathText>{'$4^{2} = 16$'}</MathText> et{' '}
                      <MathText>{'$5^{2} = 25$'}</MathText> : <MathText>{'$4 < \\sqrt{20} < 5$'}</MathText>{' '}
                      (≈ {formatDec(approxRoot(TARGET, 2))}).
                    </>
                  )}
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Le triplet : n, son carré, sa racine',
          done: tripleDone,
          content: (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 space-y-2">
                <p className="text-sm text-indigo-900">
                  Chaque marche relie trois écritures du même nombre :
                </p>
                <p className="text-center">
                  <MathText className="text-lg text-slate-800">
                    {'$8 \\;\\longrightarrow\\; 8^{2} = 64 \\;\\longrightarrow\\; \\sqrt{64} = 8$'}
                  </MathText>
                </p>
                <p className="text-sm text-indigo-900">
                  Élever au carré puis prendre la racine ramène au point de départ :{' '}
                  <MathText>{'$\\sqrt{n^{2}} = n$'}</MathText> (pour n positif).
                </p>
              </div>

              <TapQuestion
                prompt={
                  <>
                    Que vaut <MathText>{'$\\sqrt{121}$'}</MathText> ?
                  </>
                }
                options={['$11$', '$60{,}5$', '$12$']}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['11', '60,5', '12'][i]}
                correctionLabel="11"
                cols={3}
                correct={0}
                explain={
                  <>
                    <MathText>{'$11^{2} = 121$'}</MathText> : c’est la onzième marche de l’escalier. Donc{' '}
                    <MathText>{'$\\sqrt{121} = 11$'}</MathText>.
                  </>
                }
                explainWrong={
                  <>
                    60,5 c’est 121 ÷ 2 : la moitié, pas la racine. 12 donnerait{' '}
                    <MathText>{'$12^{2} = 144$'}</MathText>, la marche d’après. La bonne marche est la
                    onzième : <MathText>{'$11^{2} = 121$'}</MathText>.
                  </>
                }
                solved={tripleDone}
                onAnswered={() => setTripleDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Douze marches apprises par cœur, c’est douze racines exactes gratuites — et surtout de quoi{' '}
          <strong>encadrer</strong> toutes les autres. {isPerfectSquare(TARGET) ? '' : (
            <>
              Ainsi <MathText>{`$${formatSqrt(TARGET)}$`}</MathText> vit entre {isqrt(TARGET)} et{' '}
              {isqrt(TARGET) + 1}.
            </>
          )}
        </Feedback>
      }
    />
  );
}
