/**
 * A LESSON'S GAME WORLD, on screen — the shell every world shares (student view).
 * A full-window portal: the three.js canvas of the world (a class that extends `WorldRuntime`) and, above it, the HUD and the
 * overlays, all read from the game's state. The shell never computes maths: it shows what the game publishes and sends the
 * student's choices back.
 *
 * props: world (what the world gives, below), lesson (its pack), config (LESSON_CONFIG), basePath, exitTo (catalogue),
 *        onModule(n) (marks a module done — and EVERY module of `config` once the story is finished, storyEnd.js),
 *        completedModules (the lesson's synced progress:
 *        it opens the practice nodes on a device that never played the story), mastery, preview.
 *
 * A WORLD gives the shell:
 *   id, Game            its name in the page (`data-gameworld`) and its class
 *   stages, maxStars    the pips of the top bar and the stars it can give
 *   text                { title, subtitle, turn, end: { title, text, stay } } — its own sentences on the kit's screens
 *   Hud                 what it shows in the middle while the student plays (its objective, its equation, its verdict)
 *   Under, Over         its own layers under and over the kit's overlays (the HUD of a run, of a real-world case)
 *   overlay(o, s, game) its own overlays, by `o.type`; guide(o, s, game) the ones that explain a mistake
 *   playing(s), busy(s), quiet(s), paperOn(s), held(s)   when the student is in the world, in the middle of something, when
 *                       the robot keeps silent, when written work is on screen, what he carries
 *   devHandles          what it exposes on `window` for the walks, in development
 * The kit's own overlays: the rule tablet, the practice hub, « خريطة المعارف », the exam sitting and its promotion,
 * « تقدّمي », « مختبري », « عُدّة الانطلاق », the result of a level, the end.
 */
import { Suspense, lazy, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, Maximize2, Minimize2, ArrowUp, Star, Gem, BookOpen } from 'lucide-react';
import { useLesson } from './LessonContext';
import { KT } from './text';
import { scopedStorage as storage } from '../../../../utils/storage';
import { readSave, writeSave, schedulePush, flushPush } from './saveSync';
import { storyEndMarker } from './storyEnd';
import { AuthContext } from '../../../../context/AuthContext';
import { sendGameEvidence, flushGameEvidence, newAttemptId } from './evidenceSend';
import { sendSitting, flushSittings, uuid } from './bankEvidence';
import { usePhoneScreen } from '../engine/phoneScreen';
import TurnPhone from '../../../../components/common/TurnPhone';
import { launchDone } from '../../launchkit/store';
import KnowledgePage from './KnowledgePage';
import ExamSitting from './ExamSitting';
import { Promotion, ProgressPage } from './Spaces';
import { PaperChip } from './Paper';
import { LessonProvider } from './LessonContext';
import { Toast, Say, Stick, ExitTo, SoundToggle } from './parts';
import { Tablet, RulesSheet } from './Tablet';
import Title from './Title';
import WorldLoading from '../WorldLoading';
import PracticeHub from './PracticeHub';
import Result from './Result';
import End from './End';
import './examSitting.css';
import './styles';

const hasWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};

// « مختبري »: the lab of the lesson, the same for every lesson (lessons/common/lessonlab) — loaded when opened
const LessonLab = lazy(() => import('../../lessonlab/LessonLab'));

const LaunchKit = lazy(() => import('../../launchkit/LaunchKit'));

export default function LessonWorld({
  world,
  lesson,
  config,
  basePath,
  exitTo,
  onModule,
  completedModules,
  mastery = null,
  preview = false,
}) {
  const previewRef = useRef(preview);
  previewRef.current = preview; // a teacher looking at what the student sees: nothing is sent
  const canvas = useRef(null);
  const root = useRef(null);
  const [game, setGame] = useState(null);
  const [run, setRun] = useState(0);
  const [failed, setFailed] = useState(() => !hasWebGL());
  // the loading screen covers the canvas while the scene is built, then fades over the title (WorldLoading.jsx)
  const [veil, setVeil] = useState(true);
  useEffect(() => {
    if (!game) {
      setVeil(true);
      return undefined;
    }
    const id = setTimeout(() => setVeil(false), 450);
    return () => clearTimeout(id);
  }, [game]);
  const onModuleRef = useRef(onModule);
  onModuleRef.current = onModule;
  // الكفاءات: the answers that count are sent to the server, which re-computes their verdict (GameEvidenceController)
  const auth = useContext(AuthContext);
  const tokenRef = useRef(null);
  tokenRef.current = auth?.token ?? null;
  useEffect(() => {
    const flush = () => {
      flushGameEvidence(tokenRef.current);
      flushSittings(tokenRef.current);
    };
    flush();
    window.addEventListener('online', flush);
    return () => window.removeEventListener('online', flush);
  }, []);
  // what is waiting to be saved on the server goes when the page is hidden (a phone put down) and when the world closes
  useEffect(() => {
    const push = () => document.visibilityState === 'hidden' && flushPush(tokenRef.current, config.id);
    document.addEventListener('visibilitychange', push);
    return () => {
      document.removeEventListener('visibilitychange', push);
      flushPush(tokenRef.current, config.id);
    };
  }, [config.id]);

  useEffect(() => {
    if (failed || !canvas.current) return undefined;
    let g;
    // the end of the story completes the lesson: every module of the config is marked (storyEnd.js, LESSON_V2.md §1ter);
    // a save already finished repairs the progress of a student who ended the story before that rule
    const storyEnd = storyEndMarker(config, (n) => {
      if (!previewRef.current) onModuleRef.current?.(n);
    });
    try {
      const sound = storage.getItem('smarter_world_sound') !== '0';
      const save = readSave(config.id);
      if (!previewRef.current) storyEnd(save);
      g = new world.Game(canvas.current, {
        lesson,
        save,
        sound,
        unlockedKeys: lesson.keysFromModules?.(completedModules) ?? [],
        onSave: (data) => {
          writeSave(config.id, data);
          storyEnd(data);
          // his journey follows him to his other devices (saveSync.js) — never from a teacher's preview
          if (!previewRef.current) schedulePush(tokenRef.current, config.id);
        },
        onModule: (n) => onModuleRef.current?.(n),
        onEvidence: (context, ev) => {
          if (previewRef.current) return;
          const payload = lesson.evidence.payloadOf(config.id, context, ev, newAttemptId());
          if (import.meta.env.DEV) (window.__evidence ??= []).push(payload);
          sendGameEvidence(tokenRef.current, config.id, payload);
        },
        // a handed-in sitting (bank sheets): to the practice engine, which re-computes every verdict on the server
        onSitting: (subject, answers) => {
          if (previewRef.current) return;
          const sheet = lesson.sittings.sheetOf(subject, answers, uuid);
          if (import.meta.env.DEV) (window.__sittingSheets ??= []).push(sheet);
          sendSitting(tokenRef.current, sheet);
        },
      });
    } catch (e) {
      console.error('[gameworld]', e);
      setFailed(true);
      return undefined;
    }
    if (import.meta.env.DEV) {
      window.__world = g;
      Object.assign(window, world.devHandles ?? {});
    }
    setGame(g);
    return () => {
      g.dispose();
      setGame(null);
    };
  }, [config.id, run, failed]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // « من البداية » restarts the STORY only: what the practice earned (levels, keys ever owned) stays
  const restart = () => {
    const old = readSave(config.id);
    writeSave(config.id, {
      v: 1,
      stage: 0,
      practice: old?.practice ?? {},
      keysEver: [...new Set([...(old?.keysEver ?? []), ...(old?.keys ?? [])])],
    });
    if (!previewRef.current) schedulePush(tokenRef.current, config.id);
    setRun((n) => n + 1);
  };

  if (failed) {
    return (
      <div className="di-fallback" dir="rtl">
        <p>{KT.noWebgl}</p>
        <Link to={exitTo} className="di-btn di-btn--primary">
          {KT.hud.exit}
        </Link>
      </div>
    );
  }

  return createPortal(
    <div className="di-root" dir="rtl" ref={root} data-gameworld={world.id}>
      {preview && (
        <div className="di-preview" data-di-preview>
          <span>معاينة الأستاذ: ما يراه التلميذ. لا شيء يُسجَّل.</span>
          <a href={exitTo}>خروج من المعاينة</a>
        </div>
      )}
      <canvas ref={canvas} className="di-canvas" />
      {veil && <WorldLoading lessonId={config.id} title={config.title} stage={4} leaving={Boolean(game)} over />}
      {game && (
        <LessonProvider lesson={lesson}>
          <ExitTo.Provider value={{ to: exitTo, label: KT.hud.exit }}>
            <Shell
              world={world}
              game={game}
              rootRef={root}
              exitTo={exitTo}
              basePath={basePath}
              config={config}
              onRestart={restart}
              mastery={mastery}
            />
          </ExitTo.Provider>
        </LessonProvider>
      )}
    </div>,
    document.body,
  );
}

function Shell({ world, game, rootRef, exitTo, basePath, config, onRestart, mastery }) {
  const { keys, rules, sittings } = useLesson();
  const s = useSyncExternalStore(game.subscribe, game.getState);
  const [full, setFull] = useState(false);
  const coarse = useMemo(() => window.matchMedia?.('(pointer: coarse)').matches, []);
  const { upright } = usePhoneScreen();
  useEffect(() => {
    const on = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);
  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else rootRef.current?.requestFullscreen?.().catch(() => {});
  };
  const stars = Object.values(s.stars).reduce((a, b) => a + b, 0);
  const o = s.overlay;
  // PAPER MODE: a world says when the student is doing written work on the screen — the music stops for it
  const paperOn = Boolean(world.paperOn?.(s));
  useEffect(() => {
    game.paperMode('shell', paperOn);
    return () => game.paperMode('shell', false);
  }, [game, paperOn]);
  const playing = world.playing ? world.playing(s) : s.phase === 'play' || s.phase === 'dialog';
  const busy = Boolean(world.busy?.(s));

  return (
    <>
      {upright && <TurnPhone title={KT.turn} body={world.text.turn} data-di-turn />}
      {/* top bar */}
      <header className="di-top">
        <div className="di-top__side">
          <Link to={exitTo} className="di-icon" aria-label={KT.hud.exit} title={KT.hud.exit}>
            <X size={20} />
          </Link>
          {s.phase !== 'title' && (
            <span className="di-pill di-pill--name">
              {s.islandName}
              <span className="di-steps" aria-hidden="true">
                {Array.from({ length: world.stages }, (_, i) => (
                  <i key={i} className={i < s.stage ? 'is-done' : i === s.stage ? 'is-now' : ''} />
                ))}
              </span>
            </span>
          )}
        </div>
        <div className="di-top__side di-top__side--end">
          {s.phase !== 'title' && (
            <>
              <span className="di-pill" title={KT.hud.stars}>
                <Star size={16} className="di-ic-star" />{' '}
                <b dir="ltr">
                  {stars}
                  <small>/{world.maxStars}</small>
                </b>
              </span>
              <span className="di-pill" title={KT.hud.gems}>
                <Gem size={16} className="di-ic-gem" /> <b dir="ltr">{s.gems}</b>
              </span>
              <button
                type="button"
                className="di-pill di-keys"
                onClick={() => game.openBag()}
                title={KT.hud.bag}
                aria-label={KT.hud.bag}
                data-di-open-map
              >
                {keys
                  .map((id) => [id, rules[id]])
                  .map(([id, v]) => (
                    <span key={id} className={s.keys.includes(id) ? 'is-on' : ''}>
                      {v.icon}
                    </span>
                  ))}
              </button>
            </>
          )}
          {/* « قواعدي »: every rule he owns, from anywhere — a tablet he closes flies here (`Tablet › flyToRules`) */}
          {(s.keys.length > 0 || o?.type === 'tablet') && (
            <button
              type="button"
              className="di-pill di-rules"
              onClick={() => game.openRules()}
              title={KT.tablets.all}
              data-di-rules
            >
              <BookOpen size={16} aria-hidden="true" /> {KT.tablets.all}
            </button>
          )}
          <SoundToggle game={game} />
          <button type="button" className="di-icon" onClick={toggleFull} aria-label={KT.hud.full} title={KT.hud.full}>
            {full ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </header>

      {/* objective + equation */}
      {playing && (
        <div className="di-center">
          {world.Hud && <world.Hud s={s} game={game} />}
          {s.toast && <Toast key={s.toast.id} toast={s.toast} />}
        </div>
      )}

      {world.Under && <world.Under s={s} game={game} />}

      {s.say && s.phase !== 'title' && !world.quiet?.(s) && <Say key={s.say.id} say={s.say} />}

      {/* the prompt floats IN the world, above the thing to use (Game.placePrompt moves it); the bottom button stays for thumbs */}
      {s.phase === 'play' && s.prompt && (
        <button
          type="button"
          className="di-wprompt"
          ref={(el) => {
            game.promptEl = el;
          }}
          style={{ visibility: 'hidden' }}
          onPointerDown={(e) => {
            e.preventDefault();
            game.input.press('act');
          }}
          data-di-wprompt
        >
          <span className="di-wprompt__in">
            {coarse ? (
              <em>{KT.prompt.tap}</em>
            ) : (
              <>
                <em>{KT.prompt.press}</em>
                <kbd>E</kbd>
              </>
            )}
            <strong>{s.prompt}</strong>
          </span>
        </button>
      )}

      {/* controls */}
      {s.phase === 'play' && (
        <div className="di-controls">
          {coarse && <Stick game={game} />}
          <div className="di-actions">
            {world.held?.(s) && <span className="di-held">{world.held(s)}</span>}
            {s.prompt && (
              <button
                type="button"
                className="di-act"
                onPointerDown={(e) => {
                  e.preventDefault();
                  game.input.press('act');
                }}
                data-di-act
              >
                <span>{s.prompt}</span>
                {!coarse && <kbd>E</kbd>}
              </button>
            )}
            <button
              type="button"
              className="di-jump"
              aria-label={KT.controls.jump}
              onPointerDown={(e) => {
                e.preventDefault();
                game.input.press('jump');
              }}
            >
              <ArrowUp size={22} />
              {!coarse && <kbd>{KT.controls.space}</kbd>}
            </button>
          </div>
        </div>
      )}

      {s.phase === 'title' && !o && !busy && (
        <Title
          s={s}
          game={game}
          world={world}
          lessonTitle={config.title}
          onBegin={() => (launchDone(config.id) ? game.start() : game.openLaunch(true))}
          onRestart={onRestart}
          coarse={coarse}
        />
      )}
      {o && world.overlay?.(o, s, game)}
      {o?.type === 'tablet' && <Tablet id={o.key} mine={s.rules?.[o.key]} onClose={() => game.closeTablet()} fresh />}
      {o?.type === 'rules' && <RulesSheet keys={s.keys} sel={o.key} mine={s.rules} onClose={() => game.closeRules()} />}
      {s.paper && o?.type !== 'know' && o?.type !== 'sitting' && <PaperChip className="di-pchip--float" />}
      {world.Over && <world.Over s={s} game={game} />}
      {o?.type === 'map' && (
        <PracticeHub key={`map-${o.sel ?? ''}-${o.space ?? ''}`} s={s} game={game} sel={o.sel} space0={o.space} />
      )}
      {o?.type === 'know' && <KnowledgePage s={s} game={game} sel={o.sel} />}
      {o?.type === 'sitting' && (
        <ExamSitting
          key={`sit-${o.level}-${o.n}`}
          game={game}
          level={o.level}
          weak={o.weak}
          onFinish={(subject, answers) =>
            game.finishSitting(
              o.level,
              sittings.totalMark(subject, answers),
              subject.total,
              sittings.weakKinds(subject, answers),
            )
          }
          onQuit={() => game.quitSitting()}
          onHandIn={(subject, answers) => game.handInSitting(subject, answers)}
        />
      )}
      {o?.type === 'promotion' && <Promotion o={o} game={game} />}
      {o?.type === 'progress' && (
        <ProgressPage s={s} game={game} mastery={mastery} lessonId={config.id} lessonTitle={config.title} />
      )}
      {o?.type === 'lab' && (
        <Suspense fallback={null}>
          <LessonLab inline lessonCode={config.id} lessonTitle={config.title} onClose={() => game.closeMap()} />
        </Suspense>
      )}
      {o?.type === 'launch' && (
        <Suspense fallback={null}>
          <LaunchKit
            inline
            lessonCode={config.id}
            lessonTitle={config.title}
            onClose={() => game.closeMap()}
            onDone={() => game.launched(o.then)}
          />
        </Suspense>
      )}
      {o && world.guide?.(o, s, game)}
      {o?.type === 'rule' && (
        <Tablet
          id={o.key}
          onClose={() => game.closeRule()}
          closeLabel={o.back === 'run' ? KT.practice.back : KT.map.close}
        />
      )}
      {o?.type === 'result' && <Result o={o} s={s} game={game} />}
      {o?.type === 'end' && (
        <End
          s={s}
          o={o}
          stars={stars}
          game={game}
          world={world}
          basePath={basePath}
          config={config}
          onRestart={onRestart}
        />
      )}
    </>
  );
}
