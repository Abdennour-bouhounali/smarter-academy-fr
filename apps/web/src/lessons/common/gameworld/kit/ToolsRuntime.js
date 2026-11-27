/**
 * THE RUNTIME OF A LESSON'S TOOLS, WITH NO WORLD (owner, 2026-11-26: « when the student enter one of this tools the world
 * must not be loaded »). « Espace d'entraînement » and « Fiche de connaissances », opened from the student's home of the
 * lesson, run on THIS: the same state React reads, the same flows (`lessonFlows.js` — the hub, the sheets, the sittings,
 * the evidence), the same save — and no three.js, no scene, no loop.
 *
 * The save is the world's: what the tools change (the practice, the sheets, the exam ladder, the tally) is written INTO
 * the save the world left, whose other keys — the story, the world's own part — pass through untouched. A student who
 * never played gets the save « Recommencer » would write: stage 0, nothing of a story.
 *
 * What needs the world asks for it through `onWorld`: a game level (`startPractice`) and the story (`start`).
 * `onClose` is the way out: the tool was closed.
 */
import { GameAudio } from '../engine/audio';
import { emptyExam } from './journey';
import { LESSON_FLOWS } from './lessonFlows';

export class ToolsRuntime {
  constructor({
    lesson,
    save = null,
    onSave = () => {},
    onEvidence = () => {},
    onSitting = () => {},
    onClose = () => {},
    onWorld = () => {},
    sound = true,
    unlockedKeys = [],
  }) {
    this.lesson = lesson;
    this.onSave = onSave;
    this.onEvidence = onEvidence;
    this.onSitting = onSitting;
    this.onClose = onClose;
    this.onWorld = onWorld;
    this.listeners = new Set();
    const sv = save && save.v === 1 ? save : null;
    this.kept = sv ?? { v: 1, stage: 0 };
    this.practice = { ...(sv?.practice ?? {}) };
    this.keysEver = new Set([...(sv?.keysEver ?? []), ...(sv?.keys ?? []), ...unlockedKeys]);
    this.exam = { ...emptyExam(), ...(sv?.exam ?? {}) };
    this.tally = { ...(sv?.tally ?? {}) };
    this.rules = { ...(sv?.rules ?? {}) };
    this.know = {
      read: [...(sv?.know?.read ?? [])],
      sealed: [...(sv?.know?.sealed ?? [])],
      trained: { ...(sv?.know?.trained ?? {}) },
      found: [...(sv?.know?.found ?? [])],
    };
    // the hub of the tools is never « in the world »: it behaves as the hub opened from the title screen
    this.mapFrom = 'title';
    this.state = {
      phase: 'title',
      stage: sv?.stage ?? 0,
      prompt: null,
      overlay: null,
      gems: sv?.gems?.length ?? 0,
      keys: [...(sv?.keys ?? [])],
      falls: sv?.falls ?? 0,
      say: null,
      toast: null,
      sound,
      finished: Boolean(sv?.finished),
      practice: this.practice,
      openKeys: [...this.keysEver],
      know: this.know,
      paper: false,
      exam: this.exam,
      tally: this.tally,
      rules: this.rules,
      stars: {},
      hasSave: Boolean(sv),
    };
    this.audio = new GameAudio();
    this.audio.enabled = sound;
    this.subscribe = (fn) => {
      this.listeners.add(fn);
      return () => this.listeners.delete(fn);
    };
    this.getState = () => this.state;
  }

  busy() {
    return false;
  }

  /** The world's save, with what the tools changed written into it; every other key passes through. */
  save() {
    this.kept = {
      ...this.kept,
      practice: this.practice,
      keysEver: [...this.keysEver],
      know: this.know,
      exam: this.exam,
      tally: this.tally,
      rules: this.rules,
    };
    this.onSave(this.kept);
  }

  /** Closing a tool leaves it: back where the student came from. */
  closeMap() {
    this.set({ overlay: null });
    this.onClose();
  }

  /** The rule of a node, read from the practice map: closing it comes back to the map, on the same node. */
  showRule(key, from) {
    if (!key) return;
    this.audio.play('ui');
    this.set({
      overlay: { type: 'rule', key, back: { type: 'map', sel: from?.sel ?? null, space: from?.space ?? 'game' } },
    });
  }
  closeRule() {
    this.set({ overlay: this.state.overlay?.back ?? null });
  }

  /** A game level is played IN the world: it is asked for, and the world loads then — never before. */
  startPractice(node, level) {
    if (!this.lesson.ladder.levelOpen(node, level, [...this.keysEver], this.practice)) return false;
    this.onWorld({ node, level });
    return true;
  }
  /** « Ensuite : continue l'aventure »: the story is the world. */
  start() {
    this.onWorld(null);
  }

  setSound(on) {
    this.audio.setEnabled(on);
    this.set({ sound: on });
  }

  dispose() {
    this.listeners.clear();
    this.audio.setMusic?.(false);
  }
}

Object.assign(ToolsRuntime.prototype, LESSON_FLOWS);
