import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useDragInteraction from '../useDragInteraction';
import DropZone from '../primitives/DropZone';
import NumberTile from '../primitives/NumberTile';
import DragGhost from '../primitives/DragGhost';
import ObjectField from '../primitives/ObjectField';
import EquationBuilder from '../primitives/EquationBuilder';
import DivisionDisplay from '../primitives/DivisionDisplay';
import EquationDisplay from '../primitives/EquationDisplay';
import { useLabCoach } from '../primitives/LabCoach';
import * as L from '../logic/divisorExplorer';

/**
 * divisor-explorer — LE LABORATOIRE DE LA DIVISION EUCLIDIENNE.
 *
 * A. Ce que l'élève MANIPULE : une taille de rayon (une tuile numérotée)
 *    qu'il porte sur la bibliothèque de 420 livres.
 * B. Idée : ranger a objets par paquets de b, c'est a = b × q + r.
 * C. Ce qui change : les livres se rangent en q rayons pleins et r livres
 *    restent au sol, en ambre — la quantité, pas un texte.
 * D. Représentation qui ÉMERGE : la division posée, puis l'égalité
 *    a = b × q + r qui se remplit case par case, puis, si r = 0, a = b × q.
 * E. À découvrir avant la règle : « diviseur » = « il ne reste rien ».
 *
 * ONBOARDING (prop `coach`, défaut true — `LabCoach`, §8quater) : `logic/divisorExplorer.js › coachOf` montre la prochaine carte à
 * porter à la bibliothèque (jamais « la bonne » : l'ordre du rail) ; la ligne « اسحب بإصبعك… » se tait tant que le guide est visible.
 * La question de découverte qui suit est une carte-réponse que rien ne cache : hors guide.
 */
export default function DivisorExplorer({
  a: a0, b: b0 = null, candidates: authoredCandidates, title, lead, mission, initialMode = 'student', allowModeSwitch = false, onVerdict, onFinished, coach: coachOn = true,
}) {
  const { t } = useTranslation('lesson');
  const state = useManipulation({ type: 'divisor-explorer', initialNumbers: { a: a0, b: b0 ?? 0 }, initialMode, hintCount: 3 });
  const { a } = state.numbers;
  // Les tailles proposées suivent le NIVEAU : celles de la leçon sur ses
  // nombres, celles de levels.js sur l'autre niveau (1512 n'a pas les
  // candidats de 24).
  const candidates = state.isAuthoredLevel ? authoredCandidates : state.levelPreset?.candidates;
  const [lab, setLab] = useState(() => L.initWithDefault({ a: a0, b: b0, candidates }));
  const [reject, setReject] = useState(null);

  // Une nouvelle série de nombres (niveau, laboratoire libre, « إعادة ») remet le champ à zéro.
  useEffect(() => { setLab(L.initWithDefault({ a, b: null, candidates })); setReject(null); }, [a, state.epoch, candidates]);

  const rail = useMemo(() => L.railOf({ a, candidates }), [candidates, a]);
  const k = useCallback((key, o) => t(`manipulation.divisorExplorer.${key}`, o), [t]);
  const coachStep = coachOn ? L.coachOf(lab, rail) : null;
  const coach = useLabCoach({
    lab: 'divisor-explorer', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`, { n: coachStep.rank }) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });

  // Miroir synchrone de `lab` : « جرّب كل الإمكانيات » enchaîne des pas plus vite qu'un rendu.
  const labRef = useRef(lab);
  labRef.current = lab;
  // Un essai validé (même chemin que le dépôt d'une tuile) ; le rangement par défaut n'en est pas un.
  const tryAuto = useCallback((b) => {
    const next = L.place(labRef.current, b);
    labRef.current = next;
    setLab(next);
    setReject(null);
    state.report(onVerdict, { a: next.a, b: next.b, divides: next.divides });
    if (L.discoveryReady(next)) state.discover();
  }, [state, onVerdict]);

  const drag = useDragInteraction({
    onDrop: (sourceId) => {
      const b = Number(sourceId.replace('size:', ''));
      setReject(null);
      setLab((s) => {
        const next = L.place(s, b);
        state.report(onVerdict, { a: next.a, b: next.b, divides: next.divides });
        if (L.discoveryReady(next)) state.discover();
        return next;
      });
    },
    accepts: (sourceId) => L.canPlace(lab, Number(sourceId.replace('size:', ''))),
    onReject: (_s, _z, reason) => setReject(reason),
  });

  const heldValue = drag.held ? Number(drag.held.replace('size:', '')) : null;
  const placed = lab.b !== null;

  useEffect(() => { if (state.isFormal) state.report(onFinished, lab); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  const equationParts = placed
    ? [
        { text: String(a) }, { text: '=' }, { text: String(lab.b) }, { text: '×' },
        { slot: 'q', value: lab.q, tileTone: 'quotient' }, { text: '+' }, { slot: 'r', value: lab.r, tileTone: 'remainder' },
      ]
    : null;

  return (
    <ManipulationShell
      type="divisor-explorer"
      title={title ?? t('manipulation.divisorExplorer.title')}
      mission={mission ?? t('manipulation.divisorExplorer.mission', { a })}
      lead={lead}
      state={state}
      coach={coachOn ? coach : null}
      numberFields={[{ key: 'a', label: 'a' }]}
      validate={() => ''}
      allowModeSwitch={allowModeSwitch}
      hints={[t('manipulation.divisorExplorer.hint1'), t('manipulation.divisorExplorer.hint2'), t('manipulation.divisorExplorer.hint3')]}
      controller={{
        autoStep: () => {
          // Mode classe : poser la prochaine taille non essayée du rail.
          const next = rail.find((c) => lab.tried[c] === undefined);
          if (next === undefined) return false;
          setLab((s) => { const n = L.place(s, next); if (L.discoveryReady(n)) state.discover(); return n; });
          return true;
        },
        canAutoStep: () => rail.some((c) => lab.tried[c] === undefined),
        autoComplete: {
          label: t('manipulation.autoComplete.tryAll'),
          ready: true,
          remaining: L.untried(lab, rail).length,
          intervalMs: 480,
          maxTicks: 80,
          step: () => { const next = L.untried(labRef.current, rail)[0]; if (next !== undefined) tryAuto(next); },
          finish: () => { L.untried(labRef.current, rail).forEach((c) => tryAuto(c)); },
        },
        showSolution: () => { setLab((s) => rail.reduce((acc, c) => L.place(acc, c), s)); state.discover(); state.formalize(); },
      }}
      representation={placed && (
        <div className="grid items-start gap-3 grid-cols-2">
          <div className="flex justify-center"><DivisionDisplay dividend={a} divisor={lab.b} quotient={lab.q} remainder={lab.r} /></div>
          <div className="space-y-2">
            <EquationBuilder parts={equationParts} drag={drag} slotLabel={(s) => (s === 'q' ? t('manipulation.quotient') : t('manipulation.remainder'))} />
            {lab.divides && <EquationDisplay tex={`${a} = ${lab.b} \\times ${lab.q}`} tone="ok" note={t('manipulation.divisorExplorer.none')} />}
          </div>
        </div>
      )}
      discovery={(
        <ManipulationDiscovery
          state={state}
          prompt={t('manipulation.divisorExplorer.discoverPrompt')}
          options={[
            { text: t('manipulation.divisorExplorer.opt1'), correct: true },
            { text: t('manipulation.divisorExplorer.opt2'), why: t('manipulation.divisorExplorer.why2') },
            { text: t('manipulation.divisorExplorer.opt3'), why: t('manipulation.divisorExplorer.why3') },
          ]}
          formal={(
            <div className="space-y-2">
              {lab.divides && (
                <>
                  <p className="text-sm font-bold text-emerald-900">{t('manipulation.isDivisor', { a, b: lab.b })}</p>
                  <ul className="grid gap-1 text-xs text-emerald-900 grid-cols-2">
                    <li>• {t('manipulation.phrasings.divisorOf', { a, b: lab.b })}</li>
                    <li>• {t('manipulation.phrasings.divides', { a, b: lab.b })}</li>
                    <li>• {t('manipulation.phrasings.divisibleBy', { a, b: lab.b })}</li>
                    <li>• {t('manipulation.phrasings.multipleOf', { a, b: lab.b })}</li>
                  </ul>
                </>
              )}
              <EquationDisplay tex={`r = 0 \\iff a = b \\times q`} tone="result" note={t('manipulation.divisorExplorer.explanation')} />
            </div>
          )}
        />
      )}
      explanation={t('manipulation.divisorExplorer.explanation')}
    >
      <ManipulationStage dragging={drag.dragging}>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-bold text-slate-800">{t('manipulation.divisorExplorer.shelfSize')}</span>
              <span className="text-[11px] text-slate-500">{t('manipulation.divisorExplorer.tried', { count: Object.keys(lab.tried).length })}{coach.visible ? '' : ` · ${t('manipulation.dragHint')}`}</span>
            </div>
            <div dir="ltr" className="flex flex-wrap gap-1.5" role="group" aria-label={t('manipulation.divisorExplorer.candidates')}>
              {rail.map((c) => {
                const verdict = lab.tried[c];
                return (
                  <NumberTile
                    key={c} value={c} drag={drag} id={`size:${c}`} label={`${t('manipulation.divisorExplorer.shelfSize')} ${c}`}
                    tone={verdict === undefined ? 'neutral' : verdict ? 'common' : 'ko'} size="sm"
                    badge={verdict === true ? '✓' : undefined}
                  />
                );
              })}
            </div>
          </div>

          <DropZone drag={drag} id="library" label={t('manipulation.divisorExplorer.shelfZone')} hint={!placed ? t('manipulation.divisorExplorer.dropSize') : undefined} minHeight="min-h-[120px]" className="p-3">
            {placed && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                  <span className="text-slate-700">{t('manipulation.divisorExplorer.sizeUsed', { b: lab.b })}</span>
                  <span className="text-indigo-700" dir="auto">{lab.q} {t('manipulation.divisorExplorer.shelves')}</span>
                  <span className={lab.r === 0 ? 'text-emerald-700' : 'text-amber-800'} dir="auto">
                    {lab.r === 0 ? t('manipulation.divisorExplorer.none') : `${lab.r} ${t('manipulation.divisorExplorer.left')}`}
                  </span>
                </div>
                <ObjectField
                  count={a} groupSize={lab.b} unitPx={8} maxGroups={20}
                  ariaLabel={`${a} — ${lab.q} × ${lab.b} + ${lab.r}`}
                  groupLabel={t('manipulation.divisorExplorer.shelves')}
                  remainderLabel={lab.r > 0 ? `${lab.r} ${t('manipulation.divisorExplorer.left')}` : undefined}
                  moreLabel={(n) => `+${n}`}
                />
              </div>
            )}
          </DropZone>

          {reject && <p role="status" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{t(`manipulation.divisorExplorer.reject.${reject}`)}</p>}
        </div>
      </ManipulationStage>
      <DragGhost ghost={drag.ghost}>{heldValue !== null && <NumberTile value={heldValue} tone="divisor" />}</DragGhost>
    </ManipulationShell>
  );
}
