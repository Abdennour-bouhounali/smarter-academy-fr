/**
 * THE STORY of the lesson in the world « أرخبيل القواسم » — what the world's mechanic plays (`divisorIsles/Game.js`):
 * the islands and the gaps, the guardians' fact, the waves of the gate dash, and what happens on the way.
 * The hooks receive the game and use its own commands (`say`, `openForge`, `openStone`, `onModule`…); they hold no
 * mechanic. The words are the world's for now (`divisorIsles/strings.js`), read through `game.T`.
 */
import { DASH_WAVES, ISLANDS, SEGMENTS, STATUES } from '../../../../../../common/gameworld/divisorIsles/logic';

const missing = (game, key) => !game.state.keys.includes(key);

export const STORY = {
  islands: ISLANDS,
  segments: SEGMENTS,
  statues: STATUES,
  dashWaves: DASH_WAVES,

  /** What the story does on arriving at island k. No rule is told: each one is forged in the mirror of an island. */
  onArrive(game, k) {
    const { say } = game.T;
    if (k === 1) game.say(say.carry3, 7);
    if (k === 2) game.say(say.c42, 8);
    if (k === 3) game.openForge('qasim-baqi');
    if (k === 4) game.openForge('qasim-jidaa');
    if (k === 5) game.say(say.f, 9);
    if (k === 6) {
      game.onModule('3');
      game.say(say.g7, 7);
    }
    if (k === 7) {
      game.say(say.h, 6);
      // on the GAME's clock, not the wall's: the world may be paused behind a page, or fast-forwarded by a walk
      game.wait(1.5).then(() => !game.dead && game.state.phase === 'play' && game.openStone());
    }
  },
  /** What the story does once the tablet of a key is closed. */
  afterKey: {
    'qasim-baqi': (game) => {
      game.onModule('1');
      game.say(game.T.say.d48, 7);
    },
    'qasim-jidaa': (game) => game.say(game.T.say.e120, 7),
    'siyagh-mutakafia': (game) => {
      game.refreshObjective();
      game.say(game.T.say.boardReady, 7);
      game.save();
    },
    'wahid-wa-nafsuh': (game) => {
      game.flags.key4 = true;
      game.onModule('2');
      game.refreshObjective();
      game.say(game.T.say.boss, 9);
      game.save();
    },
  },
  /** The forge the story is waiting for, when the page was closed in front of its mirror (the last one waits at its stone). */
  pendingForge(game) {
    if (game.state.stage === 3 && missing(game, 'qasim-baqi')) return 'qasim-baqi';
    if (game.state.stage === 4 && missing(game, 'qasim-jidaa')) return 'qasim-jidaa';
    if (game.flags.statues && missing(game, 'siyagh-mutakafia')) return 'siyagh-mutakafia';
    return null;
  },
  /** A bridge held: the story's own sentence for it (true), or nothing — the world then says how many planks it took. */
  onHold(game, seg) {
    if (seg.id === 's15') game.say(game.T.say.first);
    else if (seg.id === 's48') game.say(game.T.say.stormOk, 7);
    else return false;
    return true;
  },
  /** The objective of a gap the story words itself (null: the world's). */
  objective(game, seg) {
    if (seg.complete || seg.kind !== 'bridge') return null;
    if (seg.id === 's48' && game.flags.storm) return game.T.objective.storm;
    return seg.id === 's7' ? game.T.objective.stubborn : null;
  },
  /** The four sentences are right: the guardians' mirror now asks him WHY — which number comes first, in each phrasing. */
  onStatues: (game) => game.openForge('siyagh-mutakafia'),
  /** What the stone of the last harbour shows: its question about the gap of 7, then the mirror of the last key. */
  onStone: (game) => (game.flags.seven ? { forge: 'wahid-wa-nafsuh' } : { quiz: 'seven' }),
  onQuiz(game, id) {
    if (id !== 'seven') return;
    game.flags.seven = true;
    game.save();
    game.openForge('wahid-wa-nafsuh');
  },
  onBossPaid: (game) => game.onModule('4'),
};
