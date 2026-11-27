/**
 * THE FLOWS OF A LESSON THAT TOUCH NO 3D — the state React reads (`set`), the hub (the practice map, « Ma progression »,
 * « Mon labo », the launch), « fiche de connaissances », « brevet blanc », the paper mode and the evidence.
 *
 * ONE copy, mixed into two runtimes (owner, 2026-11-26: « when the student enter one of this tools the world must not be
 * loaded »): the world's (`WorldRuntime`, which adds the three.js scene) and the tools' (`ToolsRuntime`, no scene at all).
 * Each method reads `this`: what a runtime must have is listed in `ToolsRuntime.js`, the smaller of the two.
 * This file imports NOTHING of three.js, and must not.
 */
import { examLevelOpen } from './journey';

export const LESSON_FLOWS = {
  set(patch) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((fn) => fn());
  },

  /** The map opens from the title screen or from the world; it remembers where to return. */
  openMap(sel = null, space = null) {
    this.openHub({ type: 'map', sel, space });
  },

  /** « Ma progression »: the student's progress in this lesson. « Mon labo »: the lab of the lesson. */
  openProgress() {
    this.openHub({ type: 'progress' });
  },

  openLab() {
    this.openHub({ type: 'lab' });
  },

  /** « L’échauffement »: the launch of the lesson (`lessons/common/launchkit`). `then: 'start'` enters the world when it ends. */
  openLaunch(thenStart = false) {
    this.openHub({ type: 'launch', then: thenStart ? 'start' : null });
  },

  launched(then) {
    this.closeMap();
    if (then === 'start') this.start();
  },

  /** « fiche de connaissances »: the full page of every rule, example and common mistake of the lesson. */
  openKnow(sel = null) {
    this.openHub({ type: 'know', sel });
  },

  /** « brevet blanc »: the exam sitting (ExamSitting.jsx) — open once the four keys are owned. */
  openSitting(level = 1) {
    if (!this.lesson.journey.examOpen([...this.keysEver], this.practice) || !examLevelOpen(this.exam, level)) return;
    this.openHub({ type: 'sitting', level, weak: this.exam.weak?.[level] ?? [], n: (this.exam.sittings ?? 0) + 1 });
  },

  /** « Quitter » from a sitting, confirmed: nothing was marked or sent, the ladder has not moved — back to it. */
  quitSitting() {
    if (this.state.overlay?.type === 'sitting') this.openMap(null, 'exam');
  },

  /** A sitting was handed in and its copy read: the ladder moves, and the GAME comes back for the moment between two levels. */
  finishSitting(level, mark, total, weak) {
    const { exam, result } = this.lesson.journey.applySitting(this.exam, level, mark, total, weak);
    this.exam = exam;
    this.save();
    if (result.passed) {
      this.audio.play('finale');
      for (let k = 0; k < result.stars; k += 1) setTimeout(() => this.audio.play('star', k + 1), 500 + k * 260);
    } else this.audio.play('ui');
    this.set({ exam, overlay: { type: 'promotion', result } });
  },

  openHub(overlay) {
    if (this.busy()) return;
    const ph = this.state.phase;
    if (!this.mapFrom) this.mapFrom = ph === 'title' ? 'title' : 'play';
    this.audio.play('ui');
    this.set({ overlay, phase: this.mapFrom === 'title' ? 'title' : 'dialog', prompt: null });
  },

  /**
   * « mode papier »: a screen that asks for written work (`source`) turns it on — the music stops, as in an exam — and off when
   * it leaves. Several screens may ask at once; the music comes back when none does.
   */
  paperMode(source, on) {
    if (!this.paperSources) this.paperSources = new Set();
    const was = this.paperSources.size > 0;
    if (on) this.paperSources.add(source);
    else this.paperSources.delete(source);
    const now = this.paperSources.size > 0;
    if (was === now) return;
    this.audio.setMusic(!now);
    if (now) this.audio.play('paper');
    this.set({ paper: now });
  },

  /** An answer that counts toward savoir-faire (evidence.js decides which): handed to the shell, which sends it to the server. */
  evidence(context, ev) {
    if (!ev) return;
    const t = this.tally[ev.key] ?? { ok: 0, n: 0 };
    this.tally = {
      ...this.tally,
      [ev.key]: { ok: t.ok + (this.lesson.evidence.verify(ev.claim) ? 1 : 0), n: t.n + 1 },
    };
    this.set({ tally: this.tally });
    this.save();
    this.onEvidence(context, ev);
  },

  /**
   * A copy of « brevet blanc » was handed in: each answered step that counts adds to the tally of its key (« Ma progression »), and the
   * copy goes to the shell, which sends it to the practice engine — the SERVER re-computes every verdict (kit/bankEvidence.js).
   */
  handInSitting(subject, answers) {
    const rows = this.lesson.sittings.tallyOf(subject, answers);
    for (const r of rows) {
      const t = this.tally[r.key] ?? { ok: 0, n: 0 };
      this.tally = { ...this.tally, [r.key]: { ok: t.ok + (r.ok ? 1 : 0), n: t.n + 1 } };
    }
    if (rows.length) {
      this.set({ tally: this.tally });
      this.save();
    }
    this.onSitting(subject, answers);
  },

  /** A card of the knowledge page was opened / a rule passed its memory test. */
  markRead(id) {
    if (this.know.read.includes(id)) return;
    this.know = { ...this.know, read: [...this.know.read, id] };
    this.set({ know: this.know });
    this.save();
  },

  /** DISCOVERY MODE of the knowledge page: these cards are now revealed (a card reveals the ones that follow it). */
  discover(ids) {
    const add = ids.filter((id) => !this.know.found.includes(id));
    if (!add.length) return;
    this.know = { ...this.know, found: [...this.know.found, ...add] };
    this.audio.play('crystal');
    this.set({ know: this.know });
    this.save();
  },

  resetDiscovery(rootId) {
    this.know = { ...this.know, found: [rootId] };
    this.set({ know: this.know });
    this.save();
  },

  /** A training session on a card of the knowledge page ended with `stars` (the best is kept). */
  trained(id, stars) {
    if ((this.know.trained[id] ?? 0) >= stars) return;
    this.know = { ...this.know, trained: { ...this.know.trained, [id]: stars } };
    if (stars) this.audio.play('success');
    this.set({ know: this.know });
    this.save();
  },

  seal(id) {
    if (this.know.sealed.includes(id)) return;
    this.know = { ...this.know, sealed: [...this.know.sealed, id] };
    this.audio.play('key');
    this.set({ know: this.know });
    this.save();
  },
};
