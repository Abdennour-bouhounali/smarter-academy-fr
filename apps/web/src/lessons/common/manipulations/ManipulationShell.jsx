import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Maximize2, Minimize2 } from 'lucide-react';
import { MANIPULATION_TYPES } from '@smarter-academy/core/curriculum/manipulationTypes.js';
import { useFullscreen } from '../classroom/useFullscreen';
import { useScrollLock } from '../classroom/useScrollLock';
import { useClassroomMode } from '../classroom/ClassroomContext';
import { ManipulationImmersiveContext } from './immersive';
import ManipulationProgress from './ManipulationProgress';
import ManipulationControls from './ManipulationControls';
import ManipulationTeacherMode from './ManipulationTeacherMode';
import ManipulationHint from './ManipulationHint';
import ManipulationExplanation from './ManipulationExplanation';
import ManipulationFreeLab from './ManipulationFreeLab';
import ManipulationLevelSelector from './ManipulationLevelSelector';
import { MANIPULATION_LEVEL_IDS } from './levels';
import { EffectsToggle } from '../components/LessonUI';
import { useEffectsPreference } from '../hooks/useEffectsPreference';
import { useFitRefit, useInMissionPlayer, useMissionArea } from '../mission/missionPlayerContext';

/**
 * L'ENVELOPPE commune de toute manipulation (§7 du brief). De haut en bas :
 *
 *   ┌ en-tête : titre, badge « مناولة », sélecteur مبتدئ / متقدم (seule)
 *   ├ MISSION  — une consigne arabe courte et grande (« مهمتك : … »)
 *   ├ progression (جرّب › اكتشف › صِغ · الخطوة n من N) — ABSENTE quand `guided`
 *   ├ contrôles élève (إعادة · تلميح · تحقّق · الشرح)
 *   ├ indices demandés
 *   ├ AIRE DE MANIPULATION (`children`, le centre visuel)
 *   ├ REPRÉSENTATION VIVANTE (`representation`) — la notation qui SUIT le geste
 *   ├ découverte / règle (rendue par le type via ManipulationDiscovery)
 *   ├ explication (à la demande)
 *   └ مختبر حر
 *
 * L'enveloppe ne connaît aucune mathématique : le type lui donne un `state`
 * (useManipulation), un `controller` (le geste canonique pour le mode
 * classe, et `controller.autoComplete` pour le bouton élève « compléter
 * automatiquement » quand le registre l'accorde — §6bis du contrat) et ses
 * textes. RTL comme la page ; les blocs numériques se
 * déclarent LTR eux-mêmes.
 *
 * MODE. Dans les modules, la manipulation est TOUJOURS en « وضع التلميذ » :
 * `allowModeSwitch` vaut false par défaut, et la bascule « وضع القسم » n'est
 * donc jamais affichée à l'élève (décision du propriétaire, réaffirmée le
 * 2026-09-19). Le mode classe RESTE implémenté (ManipulationTeacherMode :
 * pas à pas, rejouer, masquer la conclusion, montrer la solution, changer
 * les nombres) pour une future surface enseignant, qui passera
 * explicitement `allowModeSwitch`. On ne supprime pas le code du mode
 * classe : il est testé, et la leçon n'y perd rien tant qu'il n'est pas
 * montré.
 *
 * NIVEAUX. Seule dans un module, la manipulation pose le sélecteur
 * مبتدئ / متقدم dans son en-tête (levels.js). Dans un ManipulationWorkspace,
 * elle n'en pose aucun : le workspace porte le seul sélecteur. Le titre et
 * le lead écrits par la leçon décrivent SES nombres ; sur l'autre niveau, ils
 * cèdent la place à un titre neutre (« تدرّب: المستوى المتقدم ») — sinon
 * « مثال الكتاب: 28 و 42 » coifferait 65 et 78.
 *
 * ONBOARDING (2026-10-14, §8quater du contrat) : la prop `coach` reçoit `{ toggle, overlay }` de `useLabCoach` (appelé PAR le type,
 * qui connaît son prochain geste). L'enveloppe est `relative` : la couche du guide couvre tout le cadre, donc un
 * `target` peut être un contrôle de l'en-tête, de la scène ou du bas. L'interrupteur se pose sous la consigne.
 *
 * ÉCRAN DE JEU (`immersive`, 2026-10-27, propriétaire : « le labo couvre exactement tout l'écran du laptop, l'élève se sent dans un
 * jeu ») : DEPUIS LE 2026-10-28 ACTIVÉ PAR DÉFAUT pour TOUS les labos (propriétaire : « toutes les manipulations ont le bouton plein
 * écran et sa sortie » ; `immersive={false}` pour s'en passer) — un bouton « العب بملء الشاشة » dans l'en-tête. Le labo passe alors en VRAI plein écran du
 * navigateur (`useFullscreen` du mode classe — jamais un second plein écran), le défilement de la page est verrouillé
 * (`useScrollLock`), l'en-tête se réduit à UNE barre (sortie · guide · جرّب › اكتشف › صِغ · إعادة / تلميح) et le type lit
 * `useManipulationImmersive()` pour poser sa scène à la hauteur de l'écran. Échap (le navigateur) ou « خروج » rendent la page.
 * Sans API plein écran (ou refus), une couche fixe couvre la fenêtre avec la même barre. Jamais en mode classe (déjà plein écran).
 *
 * CONTRAT DOM (e2e) :
 *   [data-manipulation=<type>] [data-level=beginner|advanced] [data-manipulation-mode=<mode>] [data-phase]
 *   [data-manipulation-stage] [data-manipulation-discovery] [data-manipulation-formal]
 *   [data-immersive=on|off] [data-manipulation-immersive-enter] [data-manipulation-immersive-exit] [data-manipulation-immersive-bar]
 */
export default function ManipulationShell({
  type, title, mission, lead, state, controller, hints = [], numberFields = [], validate, controlsOverride,
  onCheck, checkDisabled, allowModeSwitch = false, representation, explanation, discovery, children, footer, allowFreeLab = true, freeLabAlwaysOpen = false, freeLabLead,
  headerAction, titleHidden = false, coach = null, immersive = true, guided = false, hideRepresentation = false, onIntroChange, sidePanel = null,
}) {
  const { t } = useTranslation('lesson');
  const rootRef = useRef(null);
  // le SON de tout labo (2026-10-28) : la préférence « الصوت » de l'appareil, partagée avec la page et le défi ; coupable ici à tout moment
  const effects = useEffectsPreference();
  const soundToggle = <span data-manipulation-sound><EffectsToggle enabled={effects.enabled} onToggle={effects.toggle} /></span>;
  const classroom = useClassroomMode();
  // Dans le lecteur de mission, le labo est DÉJÀ en fenêtre pleine : pas de second plein écran par-dessus.
  const inPlayer = useInMissionPlayer();
  const missionArea = useMissionArea();
  const canImmerse = immersive && !classroom.isClassroomMode && !inPlayer;
  const fullscreen = useFullscreen(rootRef);
  const [pinned, setPinned] = useState(false); // la couche fixe, quand le navigateur refuse le plein écran
  const immersed = canImmerse && (fullscreen.isFullscreen || pinned);
  // la COLONNE MINCE du lecteur (conseil + propriétaire, 2026-11-07) : une ligne de but, l'action en grand, le reste ailleurs
  const gameColumn = inPlayer && !immersed;
  useScrollLock(immersed);
  const enter = async () => { if (!(await fullscreen.request())) setPinned(true); };
  const leave = () => { setPinned(false); fullscreen.exit(); };
  // la découverte s'ouvre sous la scène : à l'écran de jeu, on la fait venir
  useEffect(() => {
    if (!immersed || state.phase === 'act') return;
    rootRef.current?.querySelector('[data-manipulation-discovery]')?.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
  }, [immersed, state.phase]);
  const spec = MANIPULATION_TYPES[type];
  const controls = { ...(spec?.controls ?? {}), ...(controlsOverride ?? {}) };
  const constraints = controls.changeNumbers || null;
  const shownTitle = state.isAuthoredLevel ? title : t('manipulation.level.practiceTitle', { level: t(`manipulation.level.${state.level}`) });
  const shownLead = state.isAuthoredLevel ? lead : null;

  // LE RÉSULTAT VIT EN HAUT, ET NE CLIGNOTE PAS (2026-10-09, toutes les
  // manipulations). Il est posé entre les contrôles et l'aire de manipulation,
  // et c'est UN seul emplacement : tant qu'aucun essai n'a eu lieu il montre
  // une ligne d'attente de même hauteur, ensuite il est MIS À JOUR sur place.
  // Quand un type retire sa ligne le temps d'un geste (`settled && …`), on
  // garde la dernière jusqu'à la suivante — sauf si la conclusion est cachée
  // (mode classe), ou si la scène repart (إعادة, autre niveau, autres nombres).
  const hasRepresentation = representation !== undefined;
  const held = useRef({ key: null, node: null });
  const heldKey = `${state.epoch}:${state.resetCount}:${state.level}`;
  if (held.current.key !== heldKey) held.current = { key: heldKey, node: null };
  if (representation) held.current.node = representation;
  // `hideRepresentation` (lecteur, pilote 2026-11-07) : pendant une question sur CE résultat, ni lui ni l'ancien affiché ne se
  // montrent — la colonne de questions laisse la colonne du labo visible, le résultat écrit y donnerait la réponse
  const shownRepresentation = hideRepresentation ? null : representation || (state.answerHidden ? null : held.current.node);
  const stale = !representation && !!shownRepresentation;

  // `guided` (2026-10-28, propriétaire) : un labo qui pose ses QUESTIONS PENDANT LE LABO (LabCheckpoint) montre seulement SES étapes
  // (LabStepper) — ni « جرّب › اكتشف › صِغ القاعدة », ni « تلميح » : les questions guident déjà.
  const progress = guided ? null : <ManipulationProgress state={state} />;
  const shownHints = guided ? [] : hints;
  const studentControls = <ManipulationControls state={state} controls={controls} hints={shownHints} onCheck={onCheck} checkDisabled={checkDisabled} autoComplete={controller?.autoComplete} game={gameColumn} />;
  const pill = 'inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-black outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none';

  // Les pièces du labo, posées soit l'une sous l'autre (page), soit en deux colonnes (mise en page de jeu du lecteur).
  // LA MISSION EN GRAND (lecteur de mission, propriétaire 2026-11-04 : « la mission du labo doit apparaître en grand quand il
  // entre dans le labo »). À l'ENTRÉE dans le labo (il devient visible), une carte couvre le labo : le contexte et « مهمتك »
  // en gros caractères, puis « هيا نبدأ » — jamais un minuteur. Rejouée quand le niveau change (la mission change avec lui).
  const introKey = `${state.level}`;
  const [introOpen, setIntroOpen] = useState(false);
  const introSeen = useRef(new Set());
  useEffect(() => {
    const el = rootRef.current;
    if (!inPlayer || immersed || !(mission || shownLead) || !el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !introSeen.current.has(introKey)) {
        introSeen.current.add(introKey);
        setIntroOpen(true);
      }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [inPlayer, immersed, introKey, mission, shownLead]);
  // le terrain n'est jamais bloqué : un 1er toucher pendant la mission en grand la fait clignoter, le 2e la rend compacte
  const [introFlash, setIntroFlash] = useState(false);
  const sceneTouches = useRef(0);
  useEffect(() => { if (introOpen) sceneTouches.current = 0; }, [introOpen]);
  // le labo sait si la mission est encore en grand (team-builder attend avant de poser sa prédiction : une chose à lire à la fois)
  useEffect(() => { onIntroChange?.(introOpen); }, [introOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  // la mission passe de GRAND à compact : la mise en page du labo change vraiment — l'écran du lecteur se ré-ajuste une fois
  // (sinon il garde la petite taille prise pendant la mission en grand, avec de grandes bandes vides)
  const refit = useFitRefit();
  const wasIntro = useRef(false);
  useEffect(() => {
    if (wasIntro.current && !introOpen) setTimeout(() => refit?.(), 80);
    wasIntro.current = introOpen;
  }, [introOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  const onSceneTouch = () => {
    if (!introOpen) return;
    sceneTouches.current += 1;
    if (sceneTouches.current === 1) { setIntroFlash(true); setTimeout(() => setIntroFlash(false), 1300); }
    else setIntroOpen(false);
  };

  const headerEl = (
    <header className={immersed ? 'sr-only' : 'space-y-2'}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        {/* `titleHidden` (MANIPULATION_DNA §17.9) : un labo s'ouvre sur son contexte et sa question, sans titre visible — le titre reste pour les lecteurs d'écran */}
        {/* lecteur (colonne mince, conseil 2026-11-07) : le titre répète la mission — gardé pour les lecteurs d'écran seulement */}
        <h3 className={titleHidden || gameColumn ? 'sr-only' : 'font-bold text-slate-900 text-lg'}>{shownTitle}</h3>
        <div className="flex items-center gap-2">
          {headerAction}
          {/* lecteur : « الصوت » est dans la barre du haut (même préférence) — pas de doublon dans la colonne */}
          {!gameColumn && soundToggle}
          {canImmerse && !immersed && (
            <button type="button" onClick={enter} data-manipulation-immersive-enter
              className={`${pill} border-2 border-indigo-600 bg-indigo-600 text-white shadow-[0_3px_0_0_#3730A3] hover:bg-indigo-700`}>
              <Maximize2 className="h-4 w-4" aria-hidden="true" /> {t('manipulation.immersive.enter')}
            </button>
          )}
          {!gameColumn && <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider text-indigo-500">{t('manipulation.badge')}</span>}
        </div>
      </div>
      {freeLabAlwaysOpen && (
        <ManipulationFreeLab state={state} numberFields={numberFields} constraints={constraints} validate={validate} allowFreeLab={allowFreeLab} alwaysOpen lead={freeLabLead} />
      )}
      {state.levels && (
        <ManipulationLevelSelector levels={MANIPULATION_LEVEL_IDS} value={state.level} onChange={state.setLevel} />
      )}
      {!state.isAuthoredLevel && state.levelPreset?.source === 'platform' && (
        <p className="text-[11px] font-bold text-slate-500">{t('textbook.platformAddition')}</p>
      )}
      {introOpen ? (
        // LA MISSION EN GRAND, à SA place (conseil + propriétaire, 2026-11-07 : plus de voile sombre sur le labo) — le terrain reste
        // clair et vivant à côté ; un premier toucher sur la scène la fait clignoter, le second (ou « هيا نبدأ ») la rend compacte.
        <div className={`space-y-4 rounded-3xl bg-white p-5 shadow-lg ring-4 transition-shadow ${introFlash ? 'ring-amber-400 animate-pulse' : 'ring-indigo-200'}`} data-manipulation-mission-intro>
          {shownLead && <p className="text-lg leading-relaxed text-slate-700">{shownLead}</p>}
          {mission && (
            <p className="text-2xl font-black leading-snug text-indigo-950" data-manipulation-mission>
              <span className="text-indigo-500">{t('manipulation.mission')}</span> {mission}
            </p>
          )}
          <button type="button" onClick={() => setIntroOpen(false)} data-manipulation-mission-go
            className="inline-flex min-h-[52px] items-center gap-2 rounded-2xl bg-indigo-600 px-8 text-lg font-black text-white shadow-[0_4px_0_0_#3730A3] hover:bg-indigo-700 active:translate-y-0.5">
            {t('manipulation.missionGo')} <span aria-hidden="true">←</span>
          </button>
        </div>
      ) : gameColumn ? (
        // LA LIGNE DU BUT (lecteur, conseil + propriétaire, 2026-11-07) : UNE ligne — le contexte de la manche, qui porte son but —
        // à la place du titre + mission + contexte qui disaient trois fois la même chose ; un toucher rouvre la mission en grand.
        // le bouton du GUIDE (« 💡 المرشد ») sur sa propre ligne, sous le but : la colonne garde toute sa largeur pour le but (2026-11-09)
        <div className="flex flex-col items-start gap-2">
          <button type="button" onClick={() => setIntroOpen(true)} data-manipulation-mission data-manipulation-goal title={t('manipulation.missionReopen')}
            className="w-full min-w-0 rounded-2xl bg-white/90 px-4 py-3 text-start text-lg font-black leading-relaxed text-indigo-950 shadow-sm hover:bg-white">
            {shownLead || mission} <span className="text-sm text-indigo-400" aria-hidden="true">↺</span>
          </button>
          {coach && coach.toggleIcon}
        </div>
      ) : (
        <>
          {mission && (
            <p className="rounded-2xl bg-white/80 px-4 py-3 font-extrabold leading-relaxed text-indigo-950 text-lg" data-manipulation-mission>
              <span className="text-indigo-500">{t('manipulation.mission')}</span> {mission}
            </p>
          )}
          {shownLead && <p className="text-sm text-slate-700">{shownLead}</p>}
        </>
      )}
      {/* L'ONBOARDING (LabCoach, MANIPULATION_CONTRACT §8quater) : l'interrupteur sous la consigne, avant la scène */}
      {coach && !immersed && !gameColumn && <div className="flex" data-lab-coach-slot>{coach.toggle}</div>}
      {spec?.shows && state.showExplanation && (
        <p className="text-xs text-indigo-700"><strong>{t('manipulation.shows')}:</strong> {spec.shows}</p>
      )}
    </header>
  );
  const controlsEl = (
    <>
      {!immersed && progress}

      <ManipulationTeacherMode
        state={state} controller={controller} controls={controls} numberFields={numberFields} constraints={constraints} validate={validate} allowModeSwitch={allowModeSwitch}
      />
      {!immersed && studentControls}
      {!immersed && <ManipulationHint hints={shownHints} open={state.hintsOpen} />}

      {hasRepresentation && !hideRepresentation && (
        shownRepresentation ? (
          <div className="space-y-2" data-manipulation-representation data-representation-top data-representation-stale={stale ? 'true' : undefined} aria-live="polite">
            {shownRepresentation}
          </div>
        ) : gameColumn ? null : (
          // (lecteur : pas de case vide « ستظهر هنا… » — le résultat apparaît à sa place à la première tentative)
          <p className="flex min-h-[3.75rem] items-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 px-4 py-2 text-sm font-bold text-slate-500" data-representation-slot="idle">
            {t('manipulation.resultIdle')}
          </p>
        )
      )}
    </>
  );
  const restEl = (
    <>
      {discovery}

      <ManipulationExplanation show={state.showExplanation}>{explanation}</ManipulationExplanation>

      {!freeLabAlwaysOpen && <ManipulationFreeLab state={state} numberFields={numberFields} constraints={constraints} validate={validate} allowFreeLab={allowFreeLab} lead={freeLabLead} />}
      {footer}
    </>
  );
  // Le lecteur de mission EST un écran de jeu : deux colonnes dès qu'il y a la place (≥ 900 px de zone).
  const gameLayout = inPlayer && !immersed && (missionArea?.width ?? 0) >= 900;


  return (
    // Le lecteur de mission EST un écran de jeu : le labo y pose sa mise en page de jeu, sans couche fixe à lui.
    <ManipulationImmersiveContext.Provider value={immersed || inPlayer}>
    <section
      ref={rootRef}
      data-manipulation={type}
      data-manipulation-mode={state.mode}
      data-phase={state.phase}
      data-level={state.level}
      data-immersive={canImmerse ? (immersed ? 'on' : 'off') : undefined}
      className={immersed
        ? 'fixed inset-0 z-[80] h-[100dvh] w-screen space-y-2 overflow-y-auto overscroll-contain bg-gradient-to-b from-indigo-50 via-white to-sky-50 p-3 lg:px-6'
        : 'relative space-y-3 rounded-3xl border-indigo-200 bg-indigo-50/40 border-2 p-5'}
      aria-label={shownTitle}
    >
      {/* la couche fixe (sans plein écran) vit sous le contexte d'empilement de la page : la barre latérale de l'espace s'efface le temps du jeu */}
      {immersed && <style>{'.sa-workspace-sidebar{display:none!important}'}</style>}
      {immersed && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2" data-manipulation-immersive-bar>
          <button type="button" onClick={leave} data-manipulation-immersive-exit
            className={`${pill} border-2 border-indigo-200 bg-white text-indigo-900 hover:bg-indigo-50`}>
            <Minimize2 className="h-4 w-4" aria-hidden="true" /> {t('manipulation.immersive.exit')}
          </button>
          {coach && coach.toggle}
          {soundToggle}
          <div className="min-w-0 flex-1">{progress}</div>
          {studentControls}
        </div>
      )}
      {immersed && <ManipulationHint hints={shownHints} open={state.hintsOpen} />}
      {gameLayout ? (
        // LA MISE EN PAGE DE JEU (lecteur de mission, 2026-11-04, propriétaire : « le labo doit utiliser tout l'espace ») :
        // la consigne, les commandes et le résultat dans une colonne ; la SCÈNE prend tout le reste de la largeur.
        // `sidePanel` (2026-11-07) : une question / une prédiction du labo PREND la colonne (plus large) le temps d'y répondre — la
        // scène garde toute sa largeur (terrains + banc sur une rangée), l'écran reste à DEUX colonnes ; les commandes reviennent après.
        <div className={`grid ${sidePanel ? 'grid-cols-[minmax(18rem,min(34rem,40%))_minmax(0,1fr)]' : 'grid-cols-[minmax(16rem,min(26rem,30%))_minmax(0,1fr)]'} items-start gap-5`} data-manipulation-game-layout>
          <div className="min-w-0 space-y-3" data-manipulation-side data-side-panel={sidePanel ? 'open' : undefined}>
            {sidePanel ? (
              <>
                {/* le bouton du GUIDE reste visible même quand une question / une prédiction prend la colonne (propriétaire, 2026-11-09) */}
                {(headerAction || coach) && <div className="flex items-center justify-end gap-2" data-side-panel-bar>{coach && coach.toggleIcon}{headerAction}</div>}
                {sidePanel}
              </>
            ) : (
              <>
                {headerEl}
                {controlsEl}
                {restEl}
              </>
            )}
          </div>
          <div className="min-w-0" data-manipulation-scene onPointerDownCapture={onSceneTouch}>{children}</div>
        </div>
      ) : (
        <>
          {headerEl}
          {controlsEl}
          <div onPointerDownCapture={onSceneTouch}>{children}</div>
          {restEl}
        </>
      )}
      {/* la bulle du guide attend que la mission en grand soit lue */}
      {coach && !introOpen && coach.overlay}
    </section>
    </ManipulationImmersiveContext.Provider>
  );
}
