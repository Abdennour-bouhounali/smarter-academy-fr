import { forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MotionConfig, useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { useMadarScope } from '../../../features/madar/madarScope';
import { createAudio } from '../../../features/madar/engine/audio';
import { playBlocker } from '../../../features/madar/madarModel';
import GameCanvas from '../../../features/madar/components/GameCanvas';
import DefenseCanvas from '../../../features/madar/components/DefenseCanvas';
import ExplorerCanvas from '../../../features/madar/components/ExplorerCanvas';
import SniperCanvas from '../../../features/madar/components/SniperCanvas';
import SniperHud from '../../../features/madar/components/SniperHud';
import OddBoard from '../../../features/madar/components/OddBoard';
import MentalBoard from '../../../features/madar/components/MentalBoard';
import { MATH_GAMES } from '../../../features/madar/madarModel';
import ExplorerHud from '../../../features/madar/components/ExplorerHud';
import ExplorerResults from '../../../features/madar/components/ExplorerResults';
import TouchControls from '../../../features/madar/components/TouchControls';
import Hud from '../../../features/madar/components/Hud';
import DefenseHud from '../../../features/madar/components/DefenseHud';
import BuildMenu from '../../../features/madar/components/BuildMenu';
import Lobby from '../../../features/madar/components/Lobby';
import CrashSheet from '../../../features/madar/components/CrashSheet';
import PauseSheet from '../../../features/madar/components/PauseSheet';
import Results from '../../../features/madar/components/Results';
import RefuelStation from '../../../features/madar/components/RefuelStation';
import { Coach, Countdown, hasBeenCoached, markCoached } from '../../../features/madar/components/Countdown';

/** La graine du monde qui tourne seul derrière l'accueil. */
const ATTRACT_SEED = 20261022;
/** « قنّاص القيم » derrière l'accueil : le niveau 33 (les racines), sous-niveau أ. */
const ATTRACT_POSITION = 96;

/**
 * « مدار » — la page du jeu, PLEIN ÉCRAN, hors de la coquille de l'espace
 * élève (docs/architecture/MADAR_GAME.md). Téléphone et ordinateur.
 *
 *   lobby ─► countdown ─► playing ⇄ paused
 *                            │ crash
 *                            ▼
 *                         crashed ─► revive (−❤️) ─► countdown
 *                            │      └► refuel (revive) ─► revive
 *                            ▼
 *                         results ─► again / refuel (base) / lobby
 *
 * Le serveur tient les cœurs, la partie (début, fin, borne du score), la
 * question d'approvisionnement et le classement ; cette page ne fait que les
 * montrer et jouer.
 *
 * Quatre jeux, la même machine : « قفزة المدار » (GameCanvas), « دفاع الكوكب »
 * (DefenseCanvas + menu de construction), « المستكشف » (ExplorerCanvas,
 * niveaux, commandes tactiles) et « قنّاص القيم » (SniperCanvas — le jeu de
 * mathématiques, gratuit, sans reprise : la fin des boucliers mène au bilan). Le jeu vient de l'URL (/espace/jeux/:game) ;
 * pendant une partie, c'est le jeu de la partie (`run.game`). La salle
 * elle-même (le choix du jeu) est GamesHub.
 */
const GAMES = ['orbit', 'defense', 'explorer', ...MATH_GAMES];
const MATH = MATH_GAMES;
/** Les jeux de mathématiques dessinés en DOM (plateau + affichage intégrés). */
const BOARDS = { odd: OddBoard, mental: MentalBoard };

/** Le plateau DOM d'un jeu de mathématiques (« الدخيل », « الحساب الذهني »). */
const BoardFor = forwardRef(function BoardFor({ game, ...props }, ref) {
  const Board = BOARDS[game];
  return <Board ref={ref} {...props} />;
});

export default function MadarPage() {
  const { t } = useTranslation('madar');
  useDocumentMeta(t('pageTitle'));
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  // L'élève, ou l'enseignant qui joue dans une de ses classes (« نافس أستاذك »).
  const scope = useMadarScope();
  const { fetchMadar, startRun, reviveRun, finishRun, chooseShip } = scope.api;
  const reduced = Boolean(useReducedMotion());

  const [state, setState] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [phase, setPhase] = useState('lobby');
  const [refuelContext, setRefuelContext] = useState('base');
  const [run, setRun] = useState(null);
  const [local, setLocal] = useState(null);
  const [finish, setFinish] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [coach, setCoach] = useState(false);
  // Les cœurs donnés / retirés par l'enseignant : le serveur ne les sert qu'une
  // fois ; la page les garde jusqu'à ce que l'élève les range.
  const [notices, setNotices] = useState([]);
  const { game: routeGame } = useParams();
  const lobbyGame = GAMES.includes(routeGame) ? routeGame : null;
  const [selected, setSelected] = useState(null);
  // Les commandes tactiles de « المستكشف » : sur un écran tactile seulement.
  const touch = useMemo(() => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(pointer: coarse)').matches), []);

  const audio = useMemo(() => createAudio(), []);
  const [muted, setMuted] = useState(audio.muted);
  useEffect(() => () => audio.dispose(), [audio]);

  const canvasRef = useRef(null);
  const statsRef = useRef(null);

  const reasonText = useCallback((err) => (err?.reason ? t(`reasons.${err.reason}`, { defaultValue: err.message }) : err?.message), [t]);

  const load = useCallback(async () => {
    try {
      const data = await fetchMadar(token);
      setState(data);
      if (data.adjustments?.length) setNotices((cur) => [...cur, ...data.adjustments]);
      setLoadError(null);
    } catch (err) {
      setLoadError(err.message);
    }
  }, [token, fetchMadar]);

  useEffect(() => { if (token) load(); }, [token, load]);

  // Onglet caché pendant une partie : pause (jamais une mort injuste).
  useEffect(() => {
    const onVis = () => { if (document.hidden) setPhase((p) => (p === 'playing' ? 'paused' : p)); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const toggleMute = () => {
    audio.setMuted(!muted);
    setMuted(!muted);
  };

  const play = async (level) => {
    audio.unlock();
    setBusy(true);
    setError(null);
    try {
      const data = await startRun(token, lobbyGame, (lobbyGame === 'explorer' || MATH.includes(lobbyGame)) && typeof level === 'number' ? level : null);
      setRun(data.run);
      setLocal(null);
      setFinish(null);
      setSelected(null);
      statsRef.current = null;
      setState((s) => ({ ...s, hearts: data.hearts, runsToday: data.runsToday }));
      setCoach(!hasBeenCoached(lobbyGame));
      setPhase('countdown');
      audio.go();
    } catch (err) {
      setError(reasonText(err));
      if (err.reason) load();
      setPhase('lobby');
    } finally {
      setBusy(false);
    }
  };

  const onCountdownDone = useCallback(() => setPhase('playing'), []);
  // « قنّاص القيم » : plus de boucliers → le bilan directement (pas de reprise, le jeu est gratuit).
  const onSniperOver = useCallback((result) => {
    setLocal(result);
    setPhase('won');
  }, []);
  const onSniperTap = useCallback(() => {
    setCoach((c) => {
      if (c) markCoached('sniper');
      return false;
    });
  }, []);
  const onBoardTap = useCallback(() => {
    setCoach((c) => {
      if (c && run?.game) markCoached(run.game);
      return false;
    });
  }, [run]);
  const onFlip = useCallback(() => {
    setCoach((c) => {
      if (c) markCoached('orbit');
      return false;
    });
  }, []);
  const onCrash = useCallback((stats) => {
    setLocal(stats);
    setError(null);
    setSelected(null);
    setPhase('crashed');
  }, []);

  // « دفاع الكوكب » : un emplacement touché ouvre le menu (le temps ralentit).
  const onSelectSlot = useCallback((slotId) => setSelected(slotId), []);
  const buildTurret = (type) => {
    if (canvasRef.current?.build(selected, type)) {
      setSelected(null);
      if (coach) { markCoached('defense'); setCoach(false); }
    }
  };

  const revive = async () => {
    setBusy(true);
    setError(null);
    try {
      const data = await reviveRun(token, run.id);
      setRun((r) => ({ ...r, revives: data.revives }));
      setState((s) => ({ ...s, hearts: data.hearts }));
      canvasRef.current?.revive();
      setPhase('countdown');
    } catch (err) {
      setError(reasonText(err));
      setPhase('crashed');
    } finally {
      setBusy(false);
    }
  };

  const end = async () => {
    const isDefense = run?.game === 'defense';
    const isExplorer = run?.game === 'explorer';
    const isSniper = MATH.includes(run?.game);
    const result = canvasRef.current?.result() ?? local ?? { score: 0, stars: 0, nearMisses: 0, bestCombo: 0, sector: 0, kills: 0, wave: 0, hits: 0, round: 0 };
    setLocal(result);
    setSelected(null);
    setPhase('results');
    setSaving(true);
    setError(null);
    try {
      const data = isExplorer
        ? await finishRun(token, run.id, result.score, result.crystals, result.level, result.completed)
        : isSniper
          ? await finishRun(token, run.id, result.score, result.hits, result.round, null, { position: result.position, peak: result.peak })
          : isDefense
          ? await finishRun(token, run.id, result.score, result.kills, result.wave)
          : await finishRun(token, run.id, result.score, result.stars);
      setFinish(data);
      setState((s) => (isDefense || isExplorer || isSniper
        ? { ...s, hearts: data.hearts, runsToday: data.runsToday }
        : { ...s, hearts: data.hearts, runsToday: data.runsToday, best: data.best, weekBest: data.weekBest }));
      if (data.newBest) audio.record();
      load();
    } catch (err) {
      setError(reasonText(err) ?? t('results.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const openRefuel = (context) => {
    setRefuelContext(context);
    setError(null);
    setPhase('refuel');
  };

  const closeRefuel = () => {
    if (refuelContext === 'revive') {
      end();
      return;
    }
    setPhase('lobby');
    setRun(null);
    load();
  };

  const onHearts = useCallback(({ hearts, refuel }) => {
    setState((s) => (s ? { ...s, hearts, refuel: refuel ?? s.refuel } : s));
  }, []);

  const selectShip = async (id) => {
    setBusy(true);
    try {
      const data = await chooseShip(token, id);
      setState((s) => ({ ...s, ship: data.ship, ships: data.ships }));
    } catch (err) {
      setError(reasonText(err));
    } finally {
      setBusy(false);
    }
  };

  const toLobby = () => {
    setPhase('lobby');
    setRun(null);
    setLocal(null);
    setFinish(null);
  };

  // « المستكشف » : le niveau gagné → la fin de partie directement (pas de reprise à proposer).
  const onWin = useCallback((result) => {
    setLocal(result);
    setPhase('won');
  }, []);
  useEffect(() => { if (phase === 'won') end(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [phase]);

  // Le coach de « المستكشف » et de « قنّاص القيم » disparaît après quelques secondes de jeu.
  useEffect(() => {
    if (!(coach && phase === 'playing' && ['explorer', ...MATH].includes(run?.game))) return undefined;
    const id = setTimeout(() => { markCoached(run.game); setCoach(false); }, run.game === 'sniper' ? 9000 : 6000);
    return () => clearTimeout(id);
  }, [coach, phase, run]);

  if (!lobbyGame) return <Navigate to={scope.hub} replace />;

  if (!state) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-[#060414] text-white" data-madar-page="loading">
        {loadError ? (
          <div className="space-y-3 text-center">
            <p role="alert" className="font-inter text-sm text-rose-200">{loadError}</p>
            <button type="button" onClick={load} className="rounded-2xl bg-white/10 px-5 py-3 font-inter text-sm font-bold ring-1 ring-white/20">{t('retry')}</button>
            <button type="button" onClick={() => navigate(scope.exit)} className="block w-full font-inter text-sm text-white/60 underline">{t('back')}</button>
          </div>
        ) : (
          <p className="flex items-center gap-2 font-inter text-white/70" role="status"><Loader2 size={18} className="animate-spin" aria-hidden="true" /> {t('loading')}</p>
        )}
      </div>
    );
  }

  const inRun = Boolean(run) && (['countdown', 'playing', 'paused', 'crashed', 'won', 'results'].includes(phase) || (phase === 'refuel' && refuelContext === 'revive'));
  const game = inRun ? run.game ?? 'orbit' : lobbyGame;
  const canPlay = playBlocker(state, game) === null;
  const unlockedTurrets = (state.defense?.turrets ?? []).filter((x) => x.unlocked).map((x) => x.id);
  const attractLevel = state.explorer?.levels?.find((l) => l.unlocked && !l.completed)?.n ?? 1;

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 overflow-hidden bg-[#060414] text-white" data-madar-page={phase}>
        {BOARDS[game] ? (
          <BoardFor
            game={game}
            ref={canvasRef}
            mode={inRun ? 'play' : 'attract'}
            seed={inRun ? run.seed : ATTRACT_SEED}
            start={inRun ? run.position ?? 0 : ATTRACT_POSITION}
            paused={inRun && phase !== 'playing'}
            reduced={reduced}
            audio={audio}
            muted={muted}
            onToggleMute={toggleMute}
            onPause={() => setPhase('paused')}
            onOver={onSniperOver}
            onTap={onBoardTap}
          />
        ) : game === 'sniper' ? (
          <SniperCanvas
            ref={canvasRef}
            mode={inRun ? 'play' : 'attract'}
            seed={inRun ? run.seed : ATTRACT_SEED}
            start={inRun ? run.position ?? 0 : ATTRACT_POSITION}
            paused={inRun && phase !== 'playing'}
            reduced={reduced}
            audio={audio}
            statsRef={statsRef}
            onOver={onSniperOver}
            onTap={onSniperTap}
          />
        ) : game === 'explorer' ? (
          <ExplorerCanvas
            ref={canvasRef}
            mode={inRun ? 'play' : 'attract'}
            level={inRun ? run.level ?? run.seed : attractLevel}
            paused={inRun && phase !== 'playing'}
            reduced={reduced}
            touch={touch && inRun}
            audio={audio}
            statsRef={statsRef}
            onDeath={onCrash}
            onWin={onWin}
          />
        ) : game === 'defense' ? (
          <DefenseCanvas
            ref={canvasRef}
            mode={inRun ? 'play' : 'attract'}
            seed={inRun ? run.seed : ATTRACT_SEED}
            unlocked={unlockedTurrets}
            paused={inRun && phase !== 'playing'}
            reduced={reduced}
            selected={phase === 'playing' ? selected : null}
            audio={audio}
            statsRef={statsRef}
            onFall={onCrash}
            onSelect={onSelectSlot}
          />
        ) : (
          <GameCanvas
            ref={canvasRef}
            mode={inRun ? 'play' : 'attract'}
            seed={inRun ? run.seed : ATTRACT_SEED}
            shipId={state.ship}
            paused={inRun && phase !== 'playing'}
            reduced={reduced}
            audio={audio}
            statsRef={statsRef}
            onCrash={onCrash}
            onFlip={onFlip}
          />
        )}

        {phase === 'lobby' && (
          <Lobby
            state={{ ...state, adjustments: notices }}
            game={lobbyGame}
            busy={busy}
            error={error}
            muted={muted}
            onToggleMute={toggleMute}
            onPlay={play}
            onRefuel={() => openRefuel('base')}
            onSelectShip={selectShip}
            onDismissNotices={() => setNotices([])}
            hubPath={scope.hub}
          />
        )}

        {inRun && !BOARDS[game] && ['countdown', 'playing', 'paused'].includes(phase) && (game === 'sniper'
          ? <SniperHud statsRef={statsRef} muted={muted} onToggleMute={toggleMute} onPause={() => setPhase('paused')} />
          : game === 'explorer'
          ? <ExplorerHud statsRef={statsRef} hearts={state.hearts} maxHearts={state.maxHearts} muted={muted} onToggleMute={toggleMute} onPause={() => setPhase('paused')} />
          : game === 'defense'
          ? <DefenseHud statsRef={statsRef} hearts={state.hearts} maxHearts={state.maxHearts} muted={muted} onToggleMute={toggleMute} onPause={() => { setSelected(null); setPhase('paused'); }} />
          : <Hud statsRef={statsRef} hearts={state.hearts} maxHearts={state.maxHearts} muted={muted} onToggleMute={toggleMute} onPause={() => setPhase('paused')} />)}
        {phase === 'countdown' && <Countdown onDone={onCountdownDone} />}
        {game === 'explorer' && touch && inRun && ['countdown', 'playing'].includes(phase) && (
          <TouchControls onPress={(part, down) => canvasRef.current?.setTouch(part, down)} />
        )}
        {coach && ['countdown', 'playing'].includes(phase) && !selected && <Coach game={game} />}
        {game === 'defense' && phase === 'playing' && selected && (
          <BuildMenu
            slotId={selected}
            getGame={() => canvasRef.current?.game()}
            turretsView={state.defense?.turrets}
            onBuild={buildTurret}
            onUpgrade={() => canvasRef.current?.upgrade(selected)}
            onSell={() => { canvasRef.current?.sell(selected); setSelected(null); }}
            onClose={() => setSelected(null)}
          />
        )}
        {phase === 'paused' && <PauseSheet onResume={() => setPhase('countdown')} onQuit={end} />}
        {phase === 'crashed' && local && (
          <CrashSheet
            game={game}
            wave={local.wave ?? 0}
            level={local.level ?? 1}
            score={local.score}
            hearts={state.hearts}
            revives={run?.revives ?? 0}
            maxRevives={state.maxRevives}
            busy={busy}
            error={error}
            onRevive={revive}
            onRefuel={() => openRefuel('revive')}
            onEnd={end}
          />
        )}
        {phase === 'results' && local && game === 'explorer' && (
          <ExplorerResults
            local={local}
            result={finish}
            saving={saving}
            error={error}
            hearts={state.hearts}
            maxHearts={state.maxHearts}
            canPlay={canPlay}
            onNext={(n) => play(n)}
            onRetry={() => play(run?.level ?? local.level)}
            onRefuel={() => { setRun(null); openRefuel('base'); }}
            onMap={toLobby}
          />
        )}
        {phase === 'results' && local && game !== 'explorer' && (
          <Results
            game={game}
            local={local}
            result={finish}
            saving={saving}
            error={error}
            hearts={state.hearts}
            maxHearts={state.maxHearts}
            canPlay={canPlay}
            free={MATH.includes(game)}
            onAgain={play}
            onRefuel={() => { setRun(null); openRefuel('base'); }}
            onHome={toLobby}
            onFlyShip={(id) => { selectShip(id); }}
          />
        )}
        {phase === 'refuel' && (
          <RefuelStation
            context={refuelContext}
            hearts={state.hearts}
            maxHearts={state.maxHearts}
            audio={audio}
            canPlay={canPlay}
            onHearts={onHearts}
            onClose={closeRefuel}
            onContinue={revive}
            onPlay={play}
          />
        )}
      </div>
    </MotionConfig>
  );
}
