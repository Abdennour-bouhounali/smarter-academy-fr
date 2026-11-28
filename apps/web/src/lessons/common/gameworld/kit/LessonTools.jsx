/**
 * THE LESSON'S TOOLS WITH NO WORLD (owner, 2026-11-26: « when the student enter one of this tools the world must not be
 * loaded »): « Espace d'entraînement » and « Fiche de connaissances », opened from the student's home of the lesson. The SAME
 * screens as in the world (`PracticeHub`, `KnowledgePage`, `ExamSitting`, « Ma progression »…) on the SAME state, flows and
 * save (`ToolsRuntime`, `lessonFlows.js`, `runtimeWiring.js`) — and no canvas, no three.js.
 *
 * What needs the world sends him there: a game level (straight on that run), the story. Closing the tool goes back to the
 * home (`exitTo`).
 */
import { Suspense, lazy, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../../context/AuthContext';
import { scopedStorage as storage } from '../../../../utils/storage';
import { levelPath, worldPath } from '../../../lessonEntry';
import { LessonProvider, useLesson } from './LessonContext';
import { KT } from './text';
import { readSave } from './saveSync';
import { runtimeCallbacks, useRuntimeFlush } from './runtimeWiring';
import { ToolsRuntime } from './ToolsRuntime';
import KnowledgePage from './KnowledgePage';
import ExamSitting from './ExamSitting';
import { Promotion, ProgressPage } from './Spaces';
import { ExitTo } from './parts';
import { Tablet } from './Tablet';
import PracticeHub from './PracticeHub';
import { lessonPackFlags } from '../../../registry';
import './examSitting.css';
import './styles';

const LessonLab = lazy(() => import('../../lessonlab/LessonLab'));

function Screens({ game, config, mastery }) {
  const { sittings } = useLesson();
  const s = useSyncExternalStore(game.subscribe, game.getState);
  const o = s.overlay;
  return (
    <>
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
      {o?.type === 'rule' && <Tablet id={o.key} onClose={() => game.closeRule()} closeLabel={KT.map.close} />}
    </>
  );
}

/** `tool`: 'entrainement' | 'fiche' (lessonEntry.js › TOOLS). */
export default function LessonTools({ tool, lesson, config, basePath, exitTo, onModule, completedModules, mastery }) {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const tokenRef = useRef(null);
  tokenRef.current = auth?.token ?? null;
  const previewRef = useRef(false);
  const onModuleRef = useRef(onModule);
  onModuleRef.current = onModule;
  const go = useRef(null);
  go.current = { navigate, exitTo, basePath };
  const [game, setGame] = useState(null);
  useRuntimeFlush(tokenRef, config.id);

  useEffect(() => {
    const { storyEnd, ...plugs } = runtimeCallbacks({ config, lesson, tokenRef, previewRef, onModuleRef });
    void storyEnd;
    const g = new ToolsRuntime({
      lesson,
      save: readSave(config.id),
      sound: storage.getItem('smarter_world_sound') !== '0',
      unlockedKeys: lesson.keysFromModules?.(completedModules) ?? [],
      ...plugs,
      onClose: () => go.current.navigate(go.current.exitTo),
      onWorld: (run) =>
        go.current.navigate(run ? levelPath(go.current.basePath, run.node, run.level) : worldPath(go.current.basePath)),
    });
    if (tool === 'fiche') g.openKnow();
    else g.openMap();
    if (import.meta.env.DEV) window.__tools = g;
    setGame(g);
    return () => {
      g.dispose();
      setGame(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one runtime per lesson and tool
  }, [config.id, tool]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return createPortal(
    <div className="di-root di-root--tools" data-lesson-tools={tool} data-gameworld={lessonPackFlags(config.id).world}>
      {game && (
        <LessonProvider lesson={lesson}>
          <ExitTo.Provider value={{ to: exitTo, label: KT.hud.exit }}>
            <Screens game={game} config={config} mastery={mastery} />
          </ExitTo.Provider>
        </LessonProvider>
      )}
    </div>,
    document.body,
  );
}
