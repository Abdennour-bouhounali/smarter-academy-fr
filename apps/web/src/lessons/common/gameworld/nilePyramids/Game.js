/**
 * The pyramids world — THE WORLD OF A UNIT ABOUT THALÈS'S PROPERTY, played with a lesson's story (it names no lesson).
 * Design: `docs/reports/PYRAMIDS_WORLD_PLAN.md` (§1 the world, §2.2 this class, §3.3–§3.7 the stages).
 *
 *   The Nile runs away from the camera; five DOCKS stand on its east bank in the order of play, the Great Pyramid on the
 *   horizon from the first second. A stage is ONE list of steps (DATA, `stageData`) played with ONE gesture and ONE
 *   order:
 *     1 field                six rope measures, two predictions of a canal's length (as typed · longer · shorter)
 *     2 workshop             the rope up the edge on the built steps; two courses ordered (fits · gap · overhang); then
 *                            the row already cut: HE types its mark, the masons build up to it and lay it there
 *     3 river                the bank AS, then SE, then inland ER until, in Zero's eye, the stake S hides the post F
 *                            (`data-np-sight`); the ferry rope cut before crossing (ties · short · slack)
 *     4 summit               up the ramp to the summit, framed close; « every length × [k] » to the stone-cutter: the
 *                            capstone sits · is too small · too big (a block too big is the quarry's written order)
 *     5 plateau              the stick IN THE SUN, the shadows (DRAWN meshes from `shadowTip`, never the shadow map),
 *                            the stick's drawn triangle slid along the axis until the tips meet (B5); the mission card;
 *                            Zero rises to his h (apex · below · above); noon, and Ibn al-Haytham's box
 *   Each of stages 1–4 ends at the masons' table, where the lesson's forge opens (`story.forges[stageId]`).
 *   Between two docks he sails on the kit's rail (`story.legs[i]`, to the route's next dock) — without a leg the felucca simply sails.
 *   A level of the practice ladder (`lesson.ladder`, the practice space) is sailed on the same river (`startPractice`,
 *   `practice.js`): the level's waves as buoys, its pace, crocodiles, three hearts; its stars are the hearts left.
 *
 * THE ONE GESTURE is `gestures.js › slide`, THE ONE ORDER `orders.js › order`; the law is `logic.js`; the look
 * `scenery.js`; every word `strings.js`. One unit is one metre; Zero is drawn about 1,2 m tall (`ZERO`).
 *
 * THE STORY is the lesson's (`lesson.story`, every field optional):
 *   text                its sentences over the world's (`strings.js`)
 *   stages              the docks this story plays, by id (`logic.js › STAGE_IDS`; none given: the five). The felucca
 *                       sails them downstream; a dock off the route keeps its scenery, without jetty, step or table
 *   legs[i]             the content of the kit's rail from dock i (its place in the world, 0–4) to the route's next
 *   forges              { field?, workshop?, river?, summit? }: the key of the lesson's forge played at that stage's
 *                       table (`lesson.forges[key]`); a stage without one ends at its last order
 *   mission             { title, lead: [..], figure?, lines(), check(vals) → 'ok' | fact, height(vals) → h }
 *   box                 { title, lead: [..], figure?, lines(), check(vals) → 'ok' | fact }  (noon, the camera obscura)
 *   recall(game, id), onArrive(game, id), afterKey[key](game), complete (false: the story is not the whole lesson)
 */
import * as THREE from 'three';
import { WorldRuntime } from '../kit/WorldRuntime';
import { GateRun, railSpeed } from '../kit/GateRun';
import { riverRun } from './riverMeshes';
import { practiceRun, practiceEnd, practiceSpeed } from './practice';
import {
  FIELD,
  FACE,
  RIVER,
  PLATEAU,
  CAPSTONE,
  canalReading,
  fieldPoints,
  courseAt,
  riverWidth,
  riverFigure,
  pyramidHeight,
  shadowTip,
  sunVector,
  topRate,
  frameDistance,
  typedLength,
  approx,
  write,
  TURN,
  STAGE_IDS,
  stageRoute,
} from './logic';
import { order, holds } from './orders';
import { slide, slideStep, slideTap, knotsOf, slidePoint, tied } from './gestures';
import { thalesCase } from './ruleForge';
import { times } from '../kit/exact';
import { texNum } from './inquiryParts';
import {
  BANK_X,
  RIVER_W,
  WATER_Y,
  makePhysicalSky,
  makeGround,
  makePalm,
  makeDock,
  makeFelucca,
  makeField,
  makeStake,
  makeKnottedRope,
  makeTape,
  makeLabel,
  makeStepPyramid,
  makeSlab,
  makeRing,
  makeRay,
  makeGreyPost,
  makeGroundShadow,
  makeStick,
  makeForgeTable,
  makeRamp,
  makeCapstone,
  makeRightAngle,
  makeCameraBox,
  makeFlightBeam,
  makeGhostStick,
} from './scenery';
import { WORLD_TEXT, withStory } from './strings';
import { topFrame, declutter, TOP_FOV } from './topView';

const SKY = [0xa9c4dd, 0xe6cfa2, 0xfff0d6, 4.4, 0.35, 0];
const DOCK_Z = [0, -160, -330, -560, -760];
const PLAY = { x0: BANK_X, x1: 700, z0: -1150, z1: 60 };
const JETTY = { x0: -12.3, half: 1.8 };
const RAIL = { x: -300, y: WATER_Y + 0.05, z: -380 };
const GREAT = { x: 300, z: -800 };
const WORKSHOP = { x: 70, z: -225, courses: 54 }; // 54 courses of the 90 m edge: the marks 10, 20, 40 are course tops
const SUMMIT = { x: 70, z: -615, courses: 72, upTo: 70 }; // 70 of 72 courses: the top platform is 99 × 2/72 = 2,75
const SUN_DAY = sunVector('4/5', 2.5);
const SUN_PLATEAU = sunVector(PLATEAU.tan, Math.PI / 2); // from the east, square to the west face
const SUN_NOON = sunVector('8', Math.PI / 2);
/** The summit's top platform: the pyramid's base × the capstone's k (99 × 1/36 = 2,75) — given on the summit's record. */
const SUMMIT_TOP = write(times(FACE.base, CAPSTONE.k));
const ZERO = 0.55; // the kit's robot is about 2,2 units tall: drawn about 1,2 m, as planned (§1.2)
const AMBER = 0xf59e0b;
const VIOLET = 0x8b5cf6;
const v3 = (p) => new THREE.Vector3(p.x, p.y ?? 0, p.z);

export class NilePyramidsGame extends WorldRuntime {
  // ───────────────────────────── the world's hooks ─────────────────────────────
  initWorld(sv) {
    this.story = this.lesson.story ?? {};
    this.T = withStory(WORLD_TEXT, this.story.text);
    this.S = this.T.stage;
    this.done = { ...(sv?.done ?? {}) }; // step id → what it gave (the knots of a measure, the number of an order)
    this.log = [...(sv?.log ?? [])]; // every order and its fact: { stage, kind, typed, fact }
    this.mirrorLog = { ...(sv?.mirrorLog ?? {}) }; // stage id → the cases a forge's mirror showed
    this.hold = null; // the rope in his hand: { step, s (the slide), sign, cam }
    this.cine = null;
    this.layout();
    this.atStart = this.dockOf(sv?.dock);
  }

  /** Where everything stands, in metres, from the law's numbers (`logic.js`). */
  layout() {
    // stage 1: B and C on a line parallel to the bank (the river side of the field), A inland
    const B = { x: 14, z: -6 };
    const C = { x: 14, z: -6 - approx(FIELD.BC) };
    const [ab, ac, bc] = [approx(FIELD.AB), approx(FIELD.AC), approx(FIELD.BC)];
    const t = (ab * ab - ac * ac + bc * bc) / (2 * bc);
    const A = { x: B.x + Math.sqrt(ab * ab - t * t), z: B.z - t };
    const fp = fieldPoints(FIELD);
    const eu = { x: (B.x - A.x) / ab, z: (B.z - A.z) / ab };
    const cos = approx(FIELD.cosA);
    const sin = Math.sqrt(1 - cos * cos);
    const ev = { x: (C.x - A.x - ac * cos * eu.x) / (ac * sin), z: (C.z - A.z - ac * cos * eu.z) / (ac * sin) };
    const field = {};
    for (const [k, p] of Object.entries(fp))
      field[k] = { x: A.x + p.u * eu.x + p.v * ev.x, y: 0, z: A.z + p.u * eu.z + p.v * ev.z };
    field.table = { x: A.x + 5, y: 0, z: A.z + 7 };
    // stage 2: the unfinished pyramid; its face SBC looks at the river (west)
    const half = approx(FACE.base) / 2;
    const h = pyramidHeight(FACE.base, FACE.edge);
    const ws = {
      B: { x: WORKSHOP.x - half, y: 0, z: WORKSHOP.z + half },
      C: { x: WORKSHOP.x - half, y: 0, z: WORKSHOP.z - half },
      S: { x: WORKSHOP.x, y: h, z: WORKSHOP.z },
      table: { x: WORKSHOP.x - half - 10, y: 0, z: WORKSHOP.z + half + 8 },
      h,
    };
    // stage 3: the ferry — A on this bank opposite the far post F, S along the bank, E further, R inland
    const A3 = { x: BANK_X + 1.5, y: 0, z: DOCK_Z[2] - 8 };
    const river = {
      A: A3,
      S: { x: A3.x, y: 0, z: A3.z - approx(RIVER.AS) },
      E: { x: A3.x, y: 0, z: A3.z - approx(RIVER.AS) - approx(RIVER.SE) },
      R: { x: A3.x + approx(RIVER.ER), y: 0, z: A3.z - approx(RIVER.AS) - approx(RIVER.SE) },
      F: { x: A3.x - approx(riverWidth(RIVER)), y: 0, z: A3.z },
      table: { x: A3.x + 14, y: 0, z: A3.z - 6 },
    };
    // stage 4: the twin pyramid of the workshop, finished up to its capstone; its ramp from the south
    const sh = pyramidHeight(FACE.base, FACE.edge);
    const top = (sh * SUMMIT.upTo) / SUMMIT.courses;
    const summit = {
      ramp: { x: SUMMIT.x - 10, y: 0, z: SUMMIT.z + half + 40 },
      top: { x: SUMMIT.x, y: top, z: SUMMIT.z },
      table: { x: SUMMIT.x - 22, y: 0, z: SUMMIT.z + half + 44 },
      h: sh,
      topY: top,
    };
    // stage 5: the Great Pyramid, its shadow's tip A, the stick in the sun beside it, the box at 177 m (§3.7)
    const tip = shadowTip({ tan: PLATEAU.tan, azimuth: Math.PI / 2, height: PLATEAU.h, foot: GREAT });
    const gh = approx(PLATEAU.base) / 2;
    const foot = { x: tip.x + 14, z: GREAT.z + 45 };
    const plateau = {
      A: { x: tip.x, y: 0, z: tip.z },
      H: { x: GREAT.x - gh, y: 0, z: GREAT.z },
      D: { x: GREAT.x - gh, y: 0, z: GREAT.z + gh },
      G: { x: GREAT.x - gh, y: 0, z: GREAT.z - gh },
      Mst: { x: foot.x, y: 0, z: foot.z },
      Mw: { x: foot.x - 10, y: 0, z: foot.z },
      Gh: { x: tip.x + approx(PLATEAU.stick) * 1.5 + 45, y: 0, z: GREAT.z },
      box: { x: GREAT.x - gh - 177, y: 0, z: GREAT.z + 6 },
      tip,
    };
    this.pts = { field, ws, river, summit, plateau };
    this.P = [field, ws, river, summit, plateau];
    this.stages = this.stageData().map((st, i) => (this.route.includes(i) ? st : { ...st, steps: [] }));
  }

  /** The five stages as DATA: their steps, in order. A step is a slide, a prediction, an order, a climb, a card or a forge. */
  stageData() {
    const [fresh, old] = FIELD.canals;
    const canalSteps = (c, longOf) => {
      const [m, n] = c.ends;
      return [
        // the two sides from the vertex are written in the register as he measures them (`seg`): the canal's
        // prediction is made from them
        {
          id: `A${m}`,
          kind: 'slide',
          from: 'A',
          toward: 'B',
          stake: m,
          seg: `A${m}`,
          line: '[AB]',
          target: c.AM,
          max: FIELD.AB,
        },
        {
          id: `A${n}`,
          kind: 'slide',
          from: 'A',
          toward: 'C',
          stake: n,
          seg: `A${n}`,
          line: '[AC]',
          target: c.AN,
          max: FIELD.AC,
        },
        { id: `${m}${n}?`, kind: 'predict', seg: `${m}${n}`, at: m },
        {
          id: `${m}${n}`,
          kind: 'slide',
          canal: true,
          from: m,
          toward: n,
          stake: n,
          seg: `${m}${n}`,
          target: longOf,
          max: String(Number(longOf) + 4),
          predicted: `${m}${n}?`,
        },
      ];
    };
    const forge = (stage) => {
      const key = this.story.forges?.[stage];
      return key && this.lesson.forges?.[key] ? [{ id: `forge:${key}`, kind: 'forge', key, at: 'table' }] : [];
    };
    const [c1, c2] = FACE.courses;
    const edge = { kind: 'slide', edge: true, from: 'B', toward: 'S', stake: 'M', seg: 'BM', view: { x: -1, z: 0.35 } };
    return [
      {
        id: STAGE_IDS[0],
        longest: FIELD.AC,
        steps: [
          ...canalSteps(fresh, canalReading(FIELD, fresh)),
          ...canalSteps(old, canalReading(FIELD, old)),
          ...forge('field'),
        ],
      },
      {
        id: STAGE_IDS[1],
        longest: c2,
        steps: [
          // the rope walks only on what is BUILT: up to the last course laid (`max`)
          { ...edge, id: 'BM', target: c1, max: c1 },
          { id: 'course', kind: 'order', order: 'course', seg: 'MN', at: 'B', truth: courseAt(FACE, c1).MN, bm: c1 },
          { ...edge, id: 'BM2', target: c2, max: c2 },
          { id: 'course2', kind: 'order', order: 'course', seg: 'MN', at: 'B', truth: courseAt(FACE, c2).MN, bm: c2 },
          { id: 'mark', kind: 'order', order: 'mark', seg: 'BM', at: 'B', truth: { face: FACE, row: FACE.row } },
          ...forge('workshop'),
        ],
      },
      {
        id: STAGE_IDS[2],
        longest: '72',
        steps: [
          {
            id: 'AS',
            kind: 'slide',
            from: 'A',
            toward: 'S',
            stake: 'S',
            seg: 'AS',
            target: RIVER.AS,
            max: '90',
            bank: true,
          },
          {
            id: 'SE',
            kind: 'slide',
            from: 'S',
            toward: 'E',
            stake: 'E',
            seg: 'SE',
            line: '[SE]',
            target: RIVER.SE,
            max: '20',
          },
          {
            id: 'ER',
            kind: 'slide',
            sight: true,
            from: 'E',
            toward: 'R',
            stake: null,
            seg: 'ER',
            target: RIVER.ER,
            max: '70',
          },
          { id: 'ferry', kind: 'order', order: 'ferry', seg: 'AF', at: 'A', truth: riverWidth(RIVER) },
          ...forge('river'),
        ],
      },
      {
        id: STAGE_IDS[3],
        steps: [
          { id: 'climb', kind: 'climb', at: 'ramp' },
          {
            id: 'capstone',
            kind: 'order',
            order: 'capstone',
            seg: 'k',
            at: 'top',
            truth: { k: CAPSTONE.k, base: FACE.base },
          },
          ...forge('summit'),
        ],
      },
      {
        id: STAGE_IDS[4],
        longest: PLATEAU.base,
        steps: [
          {
            // a step's id is unique in the WHOLE story (`done` is one map): the field already has its « AM »
            id: 'shadowAM',
            kind: 'slide',
            from: 'Mst',
            toward: 'Mw',
            stake: null,
            seg: 'AM',
            target: '3',
            max: '8',
            stick: true,
          },
          {
            id: 'HA',
            kind: 'slide',
            from: 'H',
            toward: 'A',
            stake: 'A',
            seg: 'HA',
            target: '104',
            max: '140',
            shadow: true,
          },
          {
            id: 'DG',
            kind: 'slide',
            from: 'D',
            toward: 'G',
            stake: 'G',
            seg: 'DG',
            target: PLATEAU.base,
            max: '236',
            base: true,
          },
          {
            id: 'ghost',
            kind: 'slide',
            ghost: true,
            from: 'Gh',
            toward: 'A',
            stake: null,
            seg: null,
            target: '45',
            max: '60',
          },
          ...(this.story.mission ? [{ id: 'mission', kind: 'mission', at: 'A' }] : []),
          ...(this.story.box ? [{ id: 'box', kind: 'box', at: 'box' }] : []),
        ],
      },
    ];
  }

  /** The docks this story plays, downstream (`logic.js › stageRoute`) — read from the lesson: the state needs it first. */
  get route() {
    this.routeMemo ??= stageRoute(this.lesson.story?.stages);
    return this.routeMemo;
  }
  /** The dock after dock i on the route, or null at its last one. */
  nextDock(i) {
    return this.route[this.route.indexOf(i) + 1] ?? null;
  }
  /** A saved dock, if this story still plays it; else the route's first. */
  dockOf(saved) {
    return this.route.includes(saved) ? saved : this.route[0];
  }

  worldState(sv) {
    const at = this.dockOf(sv?.dock);
    return {
      at,
      objective: '',
      recall: [],
      rope: null,
      register: null,
      verdict: null,
      look: null,
      sight: false,
      run: null,
      stars: { ...(sv?.stars ?? {}) },
      hasSave: Boolean(sv && (sv.dock > 0 || Object.keys(sv.done ?? {}).length)),
      islandName: WORLD_TEXT.docks[at],
    };
  }
  /** `dock`: where he stands — never `at`, which the kit's save keeps for its own date (defects D19). */
  worldSave() {
    return { dock: this.state.at, done: this.done, log: this.log, mirrorLog: this.mirrorLog, stars: this.state.stars };
  }
  worldCentre() {
    return { x: 200, z: -500 };
  }
  skyTarget() {
    return SKY;
  }
  spawnPoint() {
    return this.dockSpot(this.atStart);
  }
  respawnPoint() {
    return this.dockSpot(this.state.at);
  }
  dockSpot(i) {
    return new THREE.Vector3(BANK_X + 3, 0, DOCK_Z[i]);
  }
  heading() {
    return Math.PI; // down the river, into the screen
  }
  freeLook() {
    return true;
  }
  /**
   * His keys are referred to HIM (owner, 2026-11-24 — « right went left »; « one click turns him by 5° »): ← → turn him
   * by `TURN.step` degrees a press, ↑ ↓ walk along his facing, the lens behind him turns with him — every stage alike
   * (`kit/steer.js › turnStep`).
   */
  turnKeys() {
    return TURN;
  }
  /** While he holds the rope, ← → are the knots of his slide; on the summit he stands still; the top view pauses him. */
  steers() {
    return !this.hold && !this.onTop && !this.topView;
  }
  fov() {
    const ph = this.state.phase;
    if (this.topView && (ph === 'play' || ph === 'dialog')) return TOP_FOV;
    return ph === 'run' ? 60 : ph === 'look' || ph === 'fly' ? 50 : 55;
  }
  /**
   * The top view's lens (TOP_FOV) stands kilometres up: its near plane follows it (the ropes lie a hand over the sand
   * and would flicker in a depth buffer from 0,1 m to 9 km), and the labels — sprites of a fixed size, drawn in the units
   * of the lens — keep their size on screen while the lens narrows (`scenery.js › makeLabel › zoom`).
   */
  updateCamera(dt) {
    super.updateCamera(dt);
    const near = this.topView ? Math.max(0.1, this.camera.position.y * 0.25) : 0.1;
    if (Math.abs(this.camera.near - near) > 0.05) {
      this.camera.near = near;
      this.camera.updateProjectionMatrix();
    }
    const r = Math.tan((this.camera.fov * Math.PI) / 360) / Math.tan((55 * Math.PI) / 360);
    if (Math.abs((this.labelR ?? 1) - r) > 1e-3) {
      this.labelR = r;
      this.scene.traverse((o) => o.isSprite && o.userData.zoom?.(r));
    }
  }
  stepPhase(ph) {
    return ph === 'run' || ph === 'build' || ph === 'look' || ph === 'sail' || ph === 'fly' || ph === 'climb';
  }
  lanesLive(ph) {
    return ph === 'run';
  }
  busy() {
    const ph = this.state.phase;
    return ph === 'run' || ph === 'build' || ph === 'sail' || ph === 'fly' || ph === 'climb' || ph === 'forge';
  }
  robotPose(ph) {
    if (ph === 'run') return this.gateRun.pose() ?? { lift: 0, speed: null, sad: false };
    if (ph === 'sail') return { lift: 0.3, speed: 0, sad: false };
    if (ph === 'climb') return { lift: 0, speed: 3, sad: false };
    if (this.hold) return { lift: 0, speed: Math.abs(this.hold.s.way) * 3, sad: false };
    return { lift: 0, speed: null, sad: false };
  }
  cameraShot(ph) {
    if (ph === 'run') return this.gateRun.camera();
    if (this.topView && (ph === 'play' || ph === 'dialog')) return this.topView;
    if ((ph === 'look' || ph === 'build' || ph === 'fly' || ph === 'climb') && this.cine)
      return { pos: this.cine.pos, look: this.cine.look, k: 1.8 };
    if (ph === 'sail' && this.sailing) {
      const b = this.felucca.position;
      return { pos: new THREE.Vector3(b.x + 22, 13, b.z + 26), look: new THREE.Vector3(b.x, 1, b.z - 20), k: 3 };
    }
    if (this.hold && (ph === 'play' || ph === 'dialog')) {
      if (this.hold.step.sight) return this.sightShot();
      return { pos: this.hold.cam.pos, look: this.hold.cam.look, k: 3 };
    }
    // what was built is SEEN: the camera stays over it until he walks again
    if (this.cine && this.stickyCine && (ph === 'play' || ph === 'dialog'))
      return { pos: this.cine.pos, look: this.cine.look, k: 2 };
    if (this.onTop && (ph === 'play' || ph === 'dialog')) return this.topShot();
    if (ph !== 'play' && ph !== 'dialog') return null;
    // the runtime's follow, brought closer for a Zero of 1,2 m
    const h = this.hero.pos;
    const d = this.camDir;
    const f = this.followCam ?? (this.followCam = { pos: new THREE.Vector3(), look: new THREE.Vector3() });
    f.pos.set(h.x - d.x * 6.8, Math.max(0, h.y) + 4.4, h.z - d.y * 6.8);
    f.look.set(h.x + d.x * 2, Math.max(-2, h.y) + 0.8, h.z + d.y * 2);
    return { pos: f.pos, look: f.look, k: 4.5 };
  }
  /** Zero's eye, from the knot he stands on, along the line to the far post (stage 3, `cameraShot('sight')`). */
  sightShot() {
    const p = slidePoint(this.hold.s);
    const F = this.pts.river.F;
    const s = this.sightCam ?? (this.sightCam = { pos: new THREE.Vector3(), look: new THREE.Vector3() });
    s.pos.set(p.x, 1.25, p.z);
    s.look.set(F.x, 2.5, F.z);
    return { pos: s.pos, look: s.look, k: 8 };
  }
  /** On the summit: the top eight metres framed close — the capstone about 150 px wide (§1.5). */
  topShot() {
    const t = this.pts.summit.top;
    return {
      pos: new THREE.Vector3(t.x - 8.5, t.y + 4.5, t.z + 8.5),
      look: new THREE.Vector3(t.x, t.y + 0.6, t.z),
      k: 3,
    };
  }
  /** The ground: the east bank and the jetties; the bounds of the play. The water itself pushes him back (`onGround`). */
  walkable(x, z) {
    return x >= JETTY.x0 - 1 && x <= PLAY.x1 && z >= PLAY.z0 && z <= PLAY.z1;
  }
  /** On the bank, or on a jetty? (never in the water) */
  onLand(x, z) {
    if (x >= BANK_X + 0.4) return true;
    return x >= JETTY.x0 && DOCK_Z.some((dz) => Math.abs(z - dz) <= JETTY.half);
  }
  onGround() {
    const p = this.hero.pos;
    if (this.onLand(p.x, p.z)) {
      (this.safe ??= new THREE.Vector3()).copy(p);
      return;
    }
    // the water's edge pushes him back: no fall, no heart (hearts are lost only on the felucca, §1.2)
    if (this.safe) p.set(this.safe.x, p.y, this.safe.z);
    else p.x = BANK_X + 0.5;
    this.hero.vel.set(0, this.hero.vel.y, 0);
    if (this.time - (this.saidWater ?? -99) > 6) {
      this.saidWater = this.time;
      this.say(this.T.say.water, 3);
    }
  }

  // ───────────────────────────── K-f: the sun, its shadow box, the fog ─────────────────────────────
  sunDir() {
    const v = this.state.at === 4 ? (this.flags.noon ? SUN_NOON : SUN_PLATEAU) : SUN_DAY;
    return (this.sunVec ??= new THREE.Vector3()).set(v.x, v.y, v.z);
  }
  shadowBox() {
    const at = this.state.at;
    if (at === 4) return { half: 270, near: 10, far: 2000, distance: 900, at: { x: 200, z: GREAT.z } };
    if (at === 3) return { half: 70, near: 1, far: 800, distance: 360, at: SUMMIT };
    if (at === 1) return { half: 75, near: 1, far: 700, distance: 320, at: WORKSHOP };
    if (at === 0) return { half: 60, near: 1, far: 460, distance: 220, at: { x: 34, z: -44 } };
    return { half: 60, near: 1, far: 420, distance: 200, at: null };
  }
  fogRange() {
    // the top view looks from far above: the fog begins beyond the ground it frames
    if (this.topView) return [this.topView.height + 600, this.topView.height + 8000];
    return [700, 4500]; // the Great Pyramid stays in view from the first dock
  }

  // ───────────────────────────── build ─────────────────────────────
  buildWorld() {
    const sc = this.scene;
    // the physical sky of the mock-up replaces the kit's painted one; no sea of clouds over a desert
    this.sky.visible = false;
    for (const c of this.clouds) c.visible = false;
    this.renderer.toneMappingExposure = 0.5;
    this.physSky = makePhysicalSky();
    sc.add(this.physSky.sky);
    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    this.sunStage = null;
    this.stakes = {};
    this.tables = {};

    sc.add(makeGround(PLAY));
    this.buildPalms();
    this.docks = this.route.map((i) => {
      const z = DOCK_Z[i];
      const d = makeDock(this.T.docks[i]);
      d.userData.stage = i;
      d.position.set(BANK_X, 0, z);
      sc.add(d);
      return d;
    });
    this.felucca = makeFelucca();
    this.mooring(this.atStart);
    sc.add(this.felucca);
    this.buildField();
    this.buildWorkshop();
    this.buildRiver();
    this.buildSummit();
    this.buildPlateau();
    this.buildTables();

    this.rope = makeKnottedRope();
    sc.add(this.rope);
    this.laid = new THREE.Group();
    sc.add(this.laid);

    // where a step begins (a stake, the masons' table, the ramp…): E there acts — one interact per place
    this.P.forEach((pts, i) => {
      const keys = new Set(this.stages[i].steps.flatMap((s) => [s.from, s.at]).filter(Boolean));
      for (const k of keys)
        this.addInteract(
          pts[k].x,
          pts[k].z,
          () => this.stepPrompt(i, k),
          () => this.stepAct(i, k),
          k === 'top' ? 4 : 2.6,
          (pts[k].y ?? 0) + 3.1,
        );
    });
    // the dock of the stage he stands on: board the felucca once the stage is over
    this.route.forEach((i) =>
      this.addInteract(
        BANK_X + 2,
        DOCK_Z[i],
        () => this.dockPrompt(i),
        () => this.dockAct(i),
        3.2,
      ),
    );
    // the rope in his hand: E lets it go wherever he is (defects D26) — read here, not as a bubble over the knot
    this.onDropKey = (e) => {
      if (e.code === 'KeyE' && !e.repeat && this.hold && this.state.phase === 'play') this.drop();
    };
    window.addEventListener('keydown', this.onDropKey);
    this.labelsAt = -1;
    this.buildGivenLabels();
    // the felucca's legs sail on the kit's run in the river's skin, crocodiles in the lanes (K-b, `riverMeshes.js`)
    // a practice level sails at its own pace (`levels[l].speed`), a leg at the rail's
    this.gateRun = new GateRun(this, {
      ...RAIL,
      ...riverRun(),
      speedOf: (level, score) => (this.drill ? practiceSpeed(this.drill, score) : railSpeed(level, score)),
      onOver: (r) => this.runOver(r),
    });
    this.gateRun.build();
  }

  /**
   * The lengths he was GIVEN (the records of the field and the workshop, the summit's platform and base, the stick),
   * written on their segments for the TOP VIEW only (`toggleTop`); what he measures is written by the rope he lays.
   */
  buildGivenLabels() {
    this.givenLabels = [];
    const at = (a, b, text, y = 2.2) => {
      const l = makeLabel(text, { bg: 'rgba(120,72,12,0.9)', px: 18 });
      l.position.set((a.x + b.x) / 2, ((a.y ?? 0) + (b.y ?? 0)) / 2 + y, (a.z + b.z) / 2);
      l.userData.topOnly = true;
      l.visible = false;
      this.scene.add(l);
      this.givenLabels.push(l);
    };
    const f = this.pts.field;
    at(f.A, f.B, FIELD.AB);
    at(f.A, f.C, FIELD.AC);
    at(f.B, f.C, FIELD.BC);
    const w = this.pts.ws;
    at(w.S, w.B, FACE.edge);
    at(w.S, w.C, FACE.edge);
    at(w.B, w.C, FACE.base);
    const t = this.pts.summit.top;
    at({ x: t.x, z: t.z - 4 }, { x: t.x, z: t.z - 4 }, SUMMIT_TOP, t.y + 1.5);
    const half = approx(FACE.base) / 2;
    at({ x: SUMMIT.x - half, z: SUMMIT.z + half }, { x: SUMMIT.x - half, z: SUMMIT.z - half }, FACE.base);
    const p = this.pts.plateau;
    at(p.Mst, p.Mst, PLATEAU.stick, 4.5);
  }

  /**
   * THE TOP VIEW (owner, 2026-11-24 — « to see all the distances and the shape »): the camera rises over the stage he
   * stands on and looks straight down, framing the whole figure of the stage, its letters and every length he was given
   * or has measured written on its segment, none over another (`topView.js › declutter`). Zero stays where he is and his
   * keys walk nothing while it is open (`steers`); the rope in his hand still answers ← →. Hidden on the river run and
   * inside a forge; any other phase than play or a card closes it.
   */
  toggleTop(on = !this.topView) {
    if (on && (this.state.phase !== 'play' || this.state.run || this.state.overlay)) return;
    this.topView = on
      ? topFrame({
          points: [...Object.values(this.P[this.state.at]), ...this.topExtra(this.state.at)],
          dir: { x: this.camDir.x, z: this.camDir.y },
          aspect: this.camera.aspect || 16 / 9,
        })
      : null;
    if (!on) this.restoreLabels();
    this.ghostTall(Boolean(on));
    this.stickyCine = false;
    this.audio.play('ui');
    this.labelsAt = -1;
    this.set({ top: Boolean(on) });
  }
  /** What a stage's top view frames beyond its stakes: the summit's whole pyramid, the far bank. */
  topExtra(i) {
    const half = approx(FACE.base) / 2;
    if (i === 1 || i === 3) {
      const c = i === 1 ? WORKSHOP : SUMMIT;
      return [
        { x: c.x - half, y: 0, z: c.z - half },
        { x: c.x + half, y: 0, z: c.z + half },
      ];
    }
    return [];
  }
  /**
   * What stands tall (the pyramids, the palms — `userData.tall`) would cover a segment or a label seen from above: in the
   * top view a pyramid is a ghost (its stones at a quarter, its footprint still read) and a palm is not drawn.
   */
  ghostTall(on) {
    this.scene.traverse((o) => {
      if (o.userData.tall === 'palm') o.visible = !on;
      else if (o.userData.tall === 'pyramid' && o.material) {
        o.material.transparent = on;
        o.material.opacity = on ? 0.25 : 1;
        o.material.depthWrite = !on;
        o.castShadow = !on;
        o.material.needsUpdate = true;
      }
    });
  }
  /** The screen rectangles (centres, canvas px) of what the page draws over the world: no top-view label goes under. */
  hudRects() {
    const box = this.renderer.domElement.getBoundingClientRect();
    return [...document.querySelectorAll('.di-say, .np-register, .di-recall, .di-instruction, .np-top')]
      .map((e) => e.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.height > 0)
      .map((r) => ({ x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2, w: r.width, h: r.height }));
  }
  restoreLabels() {
    for (const o of this.moved ?? []) if (o.userData.home) o.position.copy(o.userData.home);
    this.moved = [];
  }
  /** The labels on screen as rectangles (for the walks: none over another in the top view). */
  labelRects() {
    const W = this.renderer.domElement.clientWidth;
    const H = this.renderer.domElement.clientHeight;
    const out = [];
    const p = new THREE.Vector3();
    const k = H / 2 / Math.tan(((this.camera.fov / 2) * Math.PI) / 180);
    this.scene.traverse((o) => {
      if (!o.isSprite || !o.userData.set || !o.visible) return;
      o.getWorldPosition(p);
      p.project(this.camera);
      if (p.z > 1 || Math.abs(p.x) > 1 || Math.abs(p.y) > 1) return;
      out.push({ x: ((p.x + 1) / 2) * W, y: ((1 - p.y) / 2) * H, w: o.scale.x * k, h: o.scale.y * k });
    });
    return out;
  }

  buildPalms() {
    let seed = 3;
    const plant = (x, z) => {
      const p = makePalm(seed, 8 + ((seed * 37) % 50) / 10);
      p.userData.tall = 'palm';
      p.position.set(x, 0, z);
      p.rotation.y = seed * 1.7;
      this.scene.add(p);
      seed += 1;
    };
    // the east bank between the stages (never on a dock, a field or a stage's ground)
    for (const [z0, z1] of [
      [50, 12],
      [-100, -140],
      [-265, -320],
      [-440, -500],
      [-665, -740],
    ])
      for (let z = z0; z > z1; z -= 16) plant(BANK_X + 5 + ((seed * 13) % 7), z);
    // the west bank: a line of palms over the crops
    for (let z = 40; z > -1100; z -= 70) plant(BANK_X - RIVER_W - 12 - ((seed * 11) % 20), z);
  }

  /** A stake of a stage, its letter over it; its lamp lights when the next step begins there. */
  addStake(stageIndex, k, at, letter = k) {
    const s = makeStake(letter);
    s.position.set(at.x, 0, at.z);
    this.scene.add(s);
    this.stakes[`${STAGE_IDS[stageIndex]}:${k}`] = s;
    this.colliders.push({ x: at.x, z: at.z, r: 0.18 });
    return s;
  }

  buildField() {
    const f = this.pts.field;
    const [fresh, old] = FIELD.canals;
    this.scene.add(
      makeField(
        [f.A, f.B, f.C],
        [fresh, old].map((c) => [f[c.ends[0]], f[c.ends[1]]]),
      ),
    );
    for (const k of ['A', 'B', 'C', ...fresh.ends, ...old.ends]) this.addStake(0, k, f[k]);
  }

  buildWorkshop() {
    const { B, C, S } = this.pts.ws;
    this.wsCourse = this.pts.ws.h / WORKSHOP.courses;
    this.setBuilt(this.builtMark(), false);
    this.colliders.push({ x: WORKSHOP.x, z: WORKSHOP.z, r: approx(FACE.base) / 2 });
    // the four edges, faint, up to the apex not built yet — the rope never walks on them
    const half = approx(FACE.base) / 2;
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ])
      this.scene.add(makeRay({ x: WORKSHOP.x + sx * half, y: 0, z: WORKSHOP.z + sz * half }, S, 0.08, 0xfff3d6));
    this.addStake(1, 'B', { x: B.x - 0.6, z: B.z + 0.6 });
    const cLabel = makeLabel('C', { bg: 'rgba(29,78,216,0.92)' });
    cLabel.position.set(C.x - 0.6, 2.6, C.z - 0.6);
    const sLabel = makeLabel('S', { bg: 'rgba(29,78,216,0.92)' });
    sLabel.position.set(S.x, S.y + 4, S.z);
    this.scene.add(cLabel, sLabel);
    this.course = null;
  }

  /** The mark the masons have built up to: 10, then 20 once course 1 fits, then his mark of the row. */
  builtMark() {
    const lastMark = [...this.log].reverse().find((l) => l.kind === 'mark');
    if (lastMark) return lastMark.typed;
    return this.done.course != null ? FACE.courses[1] : FACE.courses[0];
  }
  /** The height of a mark BM up the edge (the level of the course there). */
  levelOf(bm) {
    return (this.pts.ws.h * approx(bm)) / approx(FACE.edge);
  }
  /** The workshop's pyramid built up to the mark `bm`: whole courses under it. */
  setBuilt(bm, animate) {
    if (this.wsMesh) {
      this.scene.remove(this.wsMesh);
      this.wsMesh.geometry.dispose();
    }
    const n = WORKSHOP.courses;
    const upTo = Math.max(1, Math.min(n - 1, Math.floor((approx(bm) / approx(FACE.edge)) * n + 1e-6)));
    this.wsMesh = makeStepPyramid({ base: approx(FACE.base), h: this.pts.ws.h, courses: n, upTo });
    this.wsMesh.position.set(WORKSHOP.x, 0, WORKSHOP.z);
    this.scene.add(this.wsMesh);
    this.wsBuilt = bm;
    if (animate) {
      this.wsMesh.scale.y = 0.85;
      this.tween(1.2, (t) => {
        this.wsMesh.scale.y = 0.85 + 0.15 * t;
      });
    }
  }
  /** A point of the edge SB at BM metres from the corner B (for drawing). */
  edgePoint(bm) {
    const { B, S } = this.pts.ws;
    const k = approx(bm) / approx(FACE.edge);
    return { x: B.x + (S.x - B.x) * k, y: S.y * k, z: B.z + (S.z - B.z) * k };
  }

  buildRiver() {
    const r = this.pts.river;
    for (const k of ['A', 'S', 'E']) this.addStake(2, k, r[k]);
    this.riverR = makeStake('R');
    this.riverR.position.set(r.R.x, 0, r.R.z);
    this.riverR.visible = false;
    this.scene.add(this.riverR);
    const far = makeGreyPost('F', 6);
    far.position.set(r.F.x, 0, r.F.z);
    this.scene.add(far);
    // the rope-stretchers' right angles: AF ⟂ the bank at A, the walk inland ⟂ the bank at E (3-4-5)
    this.scene.add(makeRightAngle(r.A, { x: 0, z: -1 }, { x: -1, z: 0 }));
    this.scene.add(makeRightAngle(r.E, { x: 0, z: 1 }, { x: 1, z: 0 }));
    this.ferryRope = new THREE.Group();
    this.scene.add(this.ferryRope);
  }

  buildSummit() {
    const { h, topY, ramp, top } = this.pts.summit;
    const pyr = makeStepPyramid({ base: approx(FACE.base), h, courses: SUMMIT.courses, upTo: SUMMIT.upTo });
    pyr.position.set(SUMMIT.x, 0, SUMMIT.z);
    this.scene.add(pyr);
    this.colliders.push({ x: SUMMIT.x, z: SUMMIT.z, r: approx(FACE.base) / 2 });
    this.scene.add(makeRamp({ x: ramp.x, y: 0.4, z: ramp.z }, { x: top.x - 1, y: topY - 0.5, z: top.z + 1.6 }, 3.6));
    this.capstone = null;
    const rl = makeLabel('↑', { bg: 'rgba(12,72,110,0.92)' });
    rl.position.set(ramp.x, 3.2, ramp.z);
    this.scene.add(rl);
  }

  buildPlateau() {
    const H = approx(PLATEAU.h);
    const base = approx(PLATEAU.base);
    const p = this.pts.plateau;
    const great = makeStepPyramid({ base, h: H, courses: 64 });
    great.position.set(GREAT.x, 0, GREAT.z);
    this.scene.add(great);
    this.colliders.push({ x: GREAT.x, z: GREAT.z, r: base / 2 });
    for (const [x, z, b, h, n] of [
      [640, -1180, 215, 136, 50],
      [930, -1480, 104, 65, 26],
    ]) {
      const m = makeStepPyramid({ base: b, h, courses: n });
      m.position.set(x, 0, z);
      this.scene.add(m);
    }
    // THE SHADOWS THAT CARRY MATHEMATICS ARE DRAWN (B2, B5): the apex's shadow tip A from `shadowTip`, the triangle of
    // the shadow beyond the west base edge, the stick IN THE SUN beside it, its shadow and its ray
    const half = base / 2;
    this.morning = new THREE.Group();
    this.morning.add(
      makeGroundShadow([
        { x: GREAT.x - half, z: GREAT.z - half },
        { x: GREAT.x - half, z: GREAT.z + half },
        { x: p.tip.x, z: p.tip.z },
      ]),
      makeRay({ x: GREAT.x, y: H, z: GREAT.z }, { x: p.tip.x, y: 0, z: p.tip.z }, 0.35, 0xffb21e),
    );
    this.scene.add(this.morning);
    for (const [k, at, bg] of [
      ['A', p.A, 'rgba(200,85,61,0.94)'],
      ['H', p.H, 'rgba(29,78,216,0.92)'],
      ['D', p.D, 'rgba(29,78,216,0.92)'],
      ['G', p.G, 'rgba(29,78,216,0.92)'],
    ]) {
      const l = makeLabel(k, { bg });
      l.position.set(at.x, 4, at.z);
      this.scene.add(l);
    }
    const stickH = approx(PLATEAU.stick);
    const stick = makeStick(stickH);
    stick.position.set(p.Mst.x, 0, p.Mst.z);
    this.scene.add(stick);
    const st = shadowTip({ tan: PLATEAU.tan, azimuth: Math.PI / 2, height: PLATEAU.stick, foot: p.Mst });
    this.morning.add(
      makeGroundShadow(
        [
          { x: p.Mst.x, z: p.Mst.z - 0.07 },
          { x: p.Mst.x, z: p.Mst.z + 0.07 },
          { x: st.x, z: st.z + 0.03 },
          { x: st.x, z: st.z - 0.03 },
        ],
        0.65,
      ),
      makeRay({ x: p.Mst.x, y: stickH, z: p.Mst.z }, { x: st.x, y: 0, z: st.z }, 0.03, 0xffb21e),
    );
    const ml = makeLabel('M', { bg: 'rgba(29,78,216,0.92)' });
    ml.position.set(p.Mst.x, 3.4, p.Mst.z);
    this.scene.add(ml);
    // the stick's drawn triangle he slides along the axis (B5), and the column of his flight
    this.ghost = makeGhostStick(stickH, approx(PLATEAU.stick) * 1.5);
    this.ghost.position.set(p.Gh.x, 0, p.Gh.z);
    this.scene.add(this.ghost);
    this.beam = makeFlightBeam();
    this.beam.position.set(GREAT.x, 0, GREAT.z);
    this.scene.add(this.beam);
    this.box = makeCameraBox();
    this.box.position.set(p.box.x, 0, p.box.z);
    this.box.visible = false;
    this.scene.add(this.box);
  }

  /** The masons' table of each stage whose forge the lesson plays. */
  buildTables() {
    this.stages.forEach((st, i) => {
      if (!st.steps.some((s) => s.kind === 'forge')) return;
      const t = makeForgeTable();
      const at = this.P[i].table;
      t.position.set(at.x, 0, at.z);
      this.scene.add(t);
      this.tables[STAGE_IDS[i]] = t;
      this.colliders.push({ x: at.x, z: at.z, r: 1.1 });
    });
  }

  /** The felucca waits at the end of a dock's jetty. */
  mooring(i) {
    this.felucca.position.set(BANK_X - 9, WATER_Y + 0.15, DOCK_Z[i] + 3.6);
    this.felucca.rotation.y = 0;
  }

  restore() {
    this.robot.group.scale.setScalar(ZERO);
    for (const st of this.stages)
      for (const step of st.steps)
        if (step.kind === 'slide' && !step.ghost && this.done[step.id] != null) this.layRope(st, step);
    const lastCourse = [...this.log].reverse().find((l) => l.kind === 'course' || l.kind === 'mark');
    if (lastCourse && !(lastCourse.kind === 'course' && holds(lastCourse.fact))) this.layCourse(lastCourse, false);
    const ferry = [...this.log].reverse().find((l) => l.kind === 'ferry');
    if (ferry) this.throwRope(ferry, false);
    const cap = [...this.log].reverse().find((l) => l.kind === 'capstone');
    if (cap) this.setCapstone(cap, false);
    if (this.done.ER != null) this.riverR.visible = true;
    if (this.done.ghost != null) this.ghost.position.set(this.pts.plateau.Gh.x - 45, 0, GREAT.z);
    if (this.flags.noon) this.toNoon(false);
    this.hero.island = this.state.at;
    this.set({ recall: this.story.recall?.(this, STAGE_IDS[this.state.at]) ?? [], register: this.registerOf() });
    this.refreshObjective();
  }

  /** The story resumes: a forge he left unfinished (its flag, `openForge`) opens again — no key is skipped. */
  onStart() {
    const step = this.stepNow();
    if (step?.kind === 'forge' && this.flags[`forge:${step.key}`])
      this.wait(0.9).then(
        () => !this.dead && this.state.phase === 'play' && !this.state.overlay && this.openForge(step.key),
      );
  }

  // ───────────────────────────── where he is in the stage ─────────────────────────────
  stageNow() {
    return this.stages[this.state.at];
  }
  /** A forge step is done when its key is owned; any other when the world holds what it gave. */
  stepDone(step) {
    if (step.kind === 'forge') return this.state.keys.includes(step.key);
    return this.done[step.id] != null;
  }
  stepNow() {
    return this.stageNow().steps.find((s) => !this.stepDone(s)) ?? null;
  }
  stageDone(i = this.state.at) {
    return this.stages[i].steps.every((s) => this.stepDone(s));
  }
  /** A point of a stage, by its key (3D: the edge's points carry their height). */
  point(stageIndex, k) {
    return this.P[stageIndex][k];
  }

  /** The instruction of a step: whole, and it stays on screen (§3.2). */
  objectiveOf(step) {
    const T = this.T.objective;
    const O = this.S.objective;
    if (step.kind === 'slide') {
      if (step.edge) return T.edge(step.from, step.stake);
      if (step.canal) return T.canal(step.from, step.stake);
      if (step.bank) return O.bankStart;
      if (step.sight) return O.sight;
      if (step.stick) return O.stick;
      if (step.shadow) return O.shadow;
      if (step.base) return O.base;
      if (step.ghost) return O.slideStick;
      return T.slide(step.from, step.line, step.stake);
    }
    if (step.kind === 'predict') return T.predict(step.seg);
    if (step.kind === 'order')
      return step.order === 'course'
        ? T.course(step.seg)
        : step.order === 'mark'
          ? O.mark(FACE.row)
          : step.order === 'ferry'
            ? O.ferry
            : O.capstone;
    if (step.kind === 'climb') return O.climb;
    if (step.kind === 'mission') return O.mission;
    if (step.kind === 'box') return O.noon;
    if (step.kind === 'forge') return O.forge;
    return T.look;
  }

  refreshObjective() {
    const ph = this.state.phase;
    if (ph === 'run' || ph === 'sail' || ph === 'build' || ph === 'fly' || ph === 'climb') return;
    const T = this.T.objective;
    const i = this.state.at;
    const step = this.stepNow();
    let o;
    if (step) o = this.objectiveOf(step);
    else if (this.nextDock(i) == null) o = this.S.objective.end;
    else o = T.board(this.T.docks[this.nextDock(i)]);
    if (o !== this.state.objective) this.set({ objective: o });
    this.lightUp();
  }

  /** THE NEXT PLACE IS LIT (`play.md` §1): the stake where the next step begins, the table, or the dock. */
  lightUp() {
    const step = this.stepNow();
    const i = this.state.at;
    const key = step && (step.from ?? step.at) ? `${STAGE_IDS[i]}:${step.from ?? step.at}` : null;
    for (const [k, s] of Object.entries(this.stakes)) s.userData.lamp.visible = !this.hold && k === key;
    for (const [id, t] of Object.entries(this.tables))
      t.userData.board.visible = step?.kind === 'forge' && id === STAGE_IDS[i];
    for (const d of this.docks) d.userData.lamp.visible = d.userData.stage === i && !step && this.nextDock(i) != null;
  }

  /** The field register: the record he was given, then what HE measured and typed, in the order he did it. */
  registerOf() {
    const i = this.state.at;
    const st = this.stages[i];
    const rows = [];
    const T = this.T.hud;
    if (i === 0) for (const k of ['AB', 'AC', 'BC']) rows.push({ id: k, tex: `${k} = ${FIELD[k]}`, kind: 'record' });
    if (i === 1)
      rows.push(
        { id: 'SB', tex: `SB = SC = ${FACE.edge}`, kind: 'record' },
        { id: 'BC', tex: `BC = ${FACE.base}`, kind: 'record' },
      );
    // the summit: what the stone-cutter's order is made from — the pyramid's base and the platform left at its top
    if (i === 3)
      rows.push(
        { id: 'BC', tex: `BC = ${FACE.base}`, kind: 'record' },
        { id: 'top', tex: `MN = ${texNum(SUMMIT_TOP)}`, kind: 'record' },
      );
    if (i === 4) rows.push({ id: 'stick', tex: `MN = ${PLATEAU.stick}`, kind: 'record' });
    for (const step of st.steps) {
      const v = this.done[step.id];
      if (step.kind === 'predict') {
        if (v != null)
          rows.push({ id: step.id, tex: `${step.seg} = ${v.replace(',', '{,}')}`, kind: 'typed', by: T.typed });
      } else if (step.kind === 'order') {
        const last = [...this.log].reverse().find((l) => l.stage === st.id && l.step === step.id);
        if (step.order === 'mark' && (last || this.stepNow() === step))
          rows.push({ id: 'row', tex: `MN = ${FACE.row}`, kind: 'record' });
        if (last)
          rows.push({
            id: step.id,
            tex: `${step.seg} = ${texNum(String(last.typed))}`,
            noUnit: step.order === 'capstone',
            kind: 'typed',
            by: T.typed,
            fact: last.fact,
          });
      } else if (step.kind === 'slide' && step.seg && v != null)
        rows.push({ id: step.id, tex: `${step.seg} = ${v}`, kind: 'measured', by: step.canal ? T.reads : null });
    }
    if (!rows.length) return null;
    // nine rows at most: the record he was given always stays, his oldest measures leave first
    const kept = rows.filter((r) => r.kind === 'record');
    const his = rows.filter((r) => r.kind !== 'record').slice(-(9 - kept.length));
    return { title: i === 0 ? T.register : T.plan, rows: [...kept, ...his] };
  }

  // ───────────────────────────── the places of a stage ─────────────────────────────
  stepPrompt(i, k) {
    // the top view is for looking: no place acts while it is open
    if (this.state.at !== i || this.hold || this.topView || this.state.phase !== 'play') return null;
    const step = this.stepNow();
    if (!step || (step.from ?? step.at) !== k) return null;
    const P = this.S.prompt;
    if (step.kind === 'slide')
      return step.ghost ? P.stick : step.from.length > 1 ? P.rope : this.T.prompt.take(step.from);
    if (step.kind === 'predict') return this.T.prompt.predict;
    if (step.kind === 'order')
      return step.order === 'course' ? this.T.prompt.order : (P[step.order] ?? this.T.prompt.order);
    return P[step.kind] ?? null;
  }
  stepAct(i, k) {
    if (!this.stepPrompt(i, k)) return;
    const step = this.stepNow();
    if (step.kind === 'slide') this.take(step);
    else if (step.kind === 'predict' || step.kind === 'order') this.openOrder(step);
    else if (step.kind === 'climb') this.climb();
    else if (step.kind === 'mission' || step.kind === 'box') this.openCard(step.kind);
    else if (step.kind === 'forge') this.openForge(step.key);
  }
  dockPrompt(i) {
    if (this.state.at !== i || this.hold || this.onTop || this.topView) return null;
    if (!this.stepNow() && this.nextDock(i) != null) return this.T.prompt.board(this.T.docks[this.nextDock(i)]);
    return null;
  }
  dockAct(i) {
    if (!this.stepNow() && this.nextDock(i) != null) this.board(i);
  }

  // ───────────────────────────── THE ONE GESTURE: the rope ─────────────────────────────
  /** E at the stake: the rope's end in his hand, along the step's line; the camera frames the whole line. */
  take(step) {
    const i = this.state.at;
    const from = step.edge ? this.pts.ws.B : this.point(i, step.from);
    const to = this.point(i, step.toward);
    const dir = { x: to.x - from.x, y: (to.y ?? 0) - (from.y ?? 0), z: to.z - from.z };
    const max = approx(step.max);
    const s = slide({
      id: step.id,
      from,
      dir,
      max,
      target: approx(step.target),
      top: topRate(this.stageNow().longest ?? step.max),
    });
    // the camera stands beside the line, on the dock's side (or where the step says); the key whose arrow points the
    // way the rope grows on the screen lengthens it
    const hl = Math.hypot(s.dir.x, s.dir.z) || 1;
    const hx = s.dir.x / hl;
    const hz = s.dir.z / hl;
    let n = step.view ?? (Math.abs(hx) > 0.15 ? (hx > 0 ? { x: -hz, z: hx } : { x: hz, z: -hx }) : { x: -1, z: 0 });
    if (!step.view && n.z < 0) n = { x: -n.x, z: -n.z };
    const nl = Math.hypot(n.x, n.z);
    n = { x: n.x / nl, z: n.z / nl };
    const right = { x: n.z, z: -n.x };
    const sign = hx * right.x + hz * right.z >= 0 ? 1 : -1;
    const mid = slidePoint(s, max / 2);
    const D = Math.max(9, frameDistance(max * 1.25, max * 0.7, 55));
    const cam = {
      pos: new THREE.Vector3(mid.x + n.x * D * 0.82, mid.y + D * 0.55 + 1.5, mid.z + n.z * D * 0.82),
      look: new THREE.Vector3(mid.x, mid.y + 0.5, mid.z),
    };
    // the sight line: the eye looks along it, so the keys follow the walk inland (→ inland)
    this.hold = { step, s, sign: step.sight ? 1 : sign, cam };
    this.audio.play('ui');
    this.input.take('left');
    this.input.take('right');
    this.stickyCine = false;
    this.set({
      rope: { knots: 0, id: step.id, seg: step.seg ?? step.id, ghost: Boolean(step.ghost) },
      verdict: null,
      sight: Boolean(step.sight),
    });
    this.lightUp();
  }

  /** He lets the rope go: it is rolled back to its stake. */
  drop() {
    const h = this.hold;
    if (!h) return;
    this.hold = null;
    this.rope.visible = false;
    if (h.step.edge) this.standAtFoot(h.step);
    if (h.step.ghost) this.ghost.position.set(this.pts.plateau.Gh.x, 0, GREAT.z);
    this.set({ rope: null, sight: false });
    this.refreshObjective();
  }

  /** Back on the ground beside the stake the slide started from (after a slide up an edge). */
  standAtFoot() {
    const p = this.pts.ws.B;
    this.hero.pos.set(p.x - 1.4, 0, p.z + 1.4);
    this.hero.vel.set(0, 0, 0);
    this.hero.grounded = true;
  }

  /** The keys let go on the stake's knot: the rope ties there and its reading goes into the register. */
  tie() {
    const { step } = this.hold;
    const st = this.stageNow();
    this.hold = null;
    this.rope.visible = false;
    this.done[step.id] = step.target;
    this.audio.play('success');
    if (!step.ghost) this.layRope(st, step);
    if (step.edge) this.standAtFoot(step);
    if (step.sight) this.riverR.visible = true;
    let verdict = null;
    if (step.canal) {
      // the rope reads the canal AFTER he typed it: as typed · longer · shorter (no difference written — gate P1)
      const typed = this.done[step.predicted];
      const out = order('canal', typed, step.target);
      this.log.push({ stage: st.id, step: step.id, kind: 'canal', seg: step.seg, typed, fact: out.fact });
      verdict = { kind: 'canal', fact: out.fact, typed, reading: step.target, seg: step.seg };
      if (holds(out.fact) && step.id === `${FIELD.canals[0].ends.join('')}`) this.addStar(st.id);
    } else if (step.ghost) {
      verdict = { kind: 'meet', fact: 'meet' };
      this.audio.play('key');
      // the nested figure is SEEN: the stick's triangle on A, the pyramid's ray above it
      const A = this.pts.plateau.A;
      this.cine = { pos: new THREE.Vector3(A.x - 20, 70, A.z + 150), look: new THREE.Vector3(A.x + 90, 30, A.z) };
      this.stickyCine = true;
    } else if (step.seg) this.say(this.T.say.tied(step.seg, step.target), 4);
    this.set({ rope: null, verdict, sight: false, register: this.registerOf() });
    this.save();
    this.refreshObjective();
    // what comes next is asked at once: the canal's length, the course's order, the mission's card
    const next = this.stepNow();
    if (next && (next.kind === 'predict' || next.kind === 'order'))
      setTimeout(() => !this.dead && this.state.phase === 'play' && this.openOrder(next), 650);
  }

  /** A measured rope stays laid on the ground (or the edge), its knots read over it. */
  layRope(st, step) {
    const i = this.stages.indexOf(st);
    const from = step.edge ? this.pts.ws.B : this.point(i, step.from);
    const to = this.point(i, step.toward);
    const L = Math.hypot(to.x - from.x, (to.y ?? 0) - (from.y ?? 0), to.z - from.z);
    const k = approx(step.target) / L;
    const end = {
      x: from.x + (to.x - from.x) * k,
      y: (from.y ?? 0) + ((to.y ?? 0) - (from.y ?? 0)) * k,
      z: from.z + (to.z - from.z) * k,
    };
    const lift = (p) => ({ x: p.x, y: (p.y ?? 0) + 0.1, z: p.z });
    this.laid.add(makeTape(lift(from), lift(end), 0.08, 0.08));
    const label = makeLabel(step.target, { bg: 'rgba(120,72,12,0.9)', px: 18 });
    label.position.set((from.x + end.x) / 2, ((from.y ?? 0) + end.y) / 2 + 1.6, (from.z + end.z) / 2);
    this.laid.add(label);
  }

  addStar(stageId) {
    const stars = { ...this.state.stars, [stageId]: Math.min(3, (this.state.stars[stageId] ?? 0) + 1) };
    this.audio.play('star', 1);
    this.say(this.T.say.star, 3);
    this.set({ stars });
  }

  // ───────────────────────────── THE ONE ORDER ─────────────────────────────
  openOrder(step) {
    if (this.state.phase !== 'play' && this.state.phase !== 'dialog') return;
    const kind = step.kind === 'predict' ? 'canal' : step.order;
    this.set({
      overlay: { type: 'order', kind, seg: step.seg, id: step.id, refused: null, row: FACE.row },
      phase: 'dialog',
      prompt: null,
    });
  }
  /** « later »: the card closes; the place where it is asked opens it again. */
  closeOrder() {
    this.closeOverlay();
    this.refreshObjective();
  }
  /** His number: a prediction is kept for the rope to answer; any other order is carried out — the world builds it. */
  sendOrder(text) {
    const o = this.state.overlay;
    const st = this.stageNow();
    const step = st.steps.find((s) => s.id === o?.id);
    if (!step) return;
    if (step.kind === 'predict') {
      const typed = typedLength(text);
      if (typed == null) {
        this.set({ overlay: { ...o, refused: 'empty' } });
        return;
      }
      this.done[step.id] = typed;
      this.closeOverlay();
      this.set({ register: this.registerOf() });
      this.save();
      this.refreshObjective();
      return;
    }
    const out = order(step.order, text, step.truth);
    if (out.refused) {
      this.set({ overlay: { ...o, refused: out.refused } });
      return;
    }
    const entry = {
      stage: st.id,
      step: step.id,
      kind: step.order,
      seg: step.seg,
      typed: out.typed,
      fact: out.fact,
      built: out.built,
    };
    const first = !this.log.some((l) => l.step === step.id);
    this.log.push(entry);
    this.closeOverlay();
    this.set({ verdict: null, register: this.registerOf() });
    const build =
      step.order === 'ferry'
        ? this.throwRope(entry, true)
        : step.order === 'capstone'
          ? this.setCapstone(entry, true)
          : this.layCourse(entry, true, step);
    build.then(() => {
      if (this.dead) return;
      if (holds(out.fact)) {
        this.done[step.id] = out.typed;
        if (first) this.addStar(st.id);
      }
      const verdict = { kind: step.order, fact: out.fact, typed: out.typed, seg: step.seg };
      if (out.built?.quarry) verdict.quarry = out.built.base;
      this.set({ phase: 'play', verdict, register: this.registerOf() });
      this.save();
      this.refreshObjective();
      // course 1 fits: the masons build on, up to the next mark the rope will measure
      if (step.id === 'course' && holds(out.fact)) this.setBuilt(FACE.courses[1], true);
      // the capstone sits: Zero comes down the ramp to the masons' table
      if (step.order === 'capstone' && holds(out.fact)) setTimeout(() => !this.dead && this.descend(), 1800);
    });
  }

  /**
   * The quarry cuts his course (or the row already cut) and the masons lower it onto its level — for a `mark`, they first
   * build up to his mark. A gap is drawn amber, an overhang violet; neither is measured in the world (gate P1).
   */
  layCourse(entry, animate) {
    if (this.course) {
      this.scene.remove(this.course);
      this.course.traverse((o) => o.geometry?.dispose());
    }
    const mark = entry.kind === 'mark';
    const bm = mark
      ? entry.typed
      : entry.kind === 'course' && entry.step === 'course2'
        ? FACE.courses[1]
        : FACE.courses[0];
    if (mark) this.setBuilt(bm, animate);
    const side = approx(mark ? FACE.row : entry.typed);
    const need = approx(courseAt(FACE, bm).MN);
    const g = new THREE.Group();
    g.add(makeSlab(side, this.wsCourse));
    if (side < need) {
      const ring = makeRing(side, need, 0.12, AMBER);
      ring.position.y = -this.wsCourse / 2 + 0.06;
      g.add(ring);
    } else if (side > need) {
      const ring = makeRing(need, side, 0.12, VIOLET);
      ring.position.y = -this.wsCourse / 2 - 0.02;
      g.add(ring);
    }
    const y = this.levelOf(bm) + this.wsCourse / 2;
    g.position.set(WORKSHOP.x, animate ? y + 16 : y, WORKSHOP.z);
    this.scene.add(g);
    this.course = g;
    if (!animate) return Promise.resolve();
    const top = this.levelOf(bm);
    this.cine = {
      pos: new THREE.Vector3(WORKSHOP.x - 85, top + 52, WORKSHOP.z + 66),
      look: new THREE.Vector3(WORKSHOP.x, top, WORKSHOP.z),
    };
    this.stickyCine = true;
    this.set({ phase: 'build', prompt: null });
    this.say(mark ? this.S.say.built : this.T.say.built, 3);
    this.audio.play('ui');
    return this.tween(2.4, (t) => {
      g.position.y = y + 16 * (1 - t);
    }).then(() => {
      this.shake = 0.25;
      this.audio.play(holds(entry.fact) ? 'success' : 'hit');
    });
  }

  /** The ferry rope of his number, thrown from A towards the far post F: it ties, falls short in the water, or lies slack. */
  throwRope(entry, animate) {
    this.ferryRope.clear();
    const { A, F } = this.pts.river;
    const W = approx(riverWidth(RIVER));
    const L = approx(entry.typed);
    const reach = Math.min(L, W);
    const end = { x: A.x - reach, y: L >= W ? 1.6 : WATER_Y + 0.05, z: A.z };
    const tape = makeTape({ x: A.x, y: 1, z: A.z }, end, 0.35, 0.35);
    this.ferryRope.add(tape);
    if (L > W) {
      // what is left over lies slack on the water along the far bank
      const over = Math.min(60, (L - W) / 2);
      this.ferryRope.add(
        makeTape(
          { x: F.x + 2, y: WATER_Y + 0.05, z: F.z },
          { x: F.x + 2, y: WATER_Y + 0.05, z: F.z - over },
          0.35,
          0.35,
        ),
      );
    }
    if (!animate) return Promise.resolve();
    this.cine = { pos: new THREE.Vector3(160, 120, -250), look: new THREE.Vector3(-170, 0, -420) };
    this.stickyCine = true;
    this.set({ phase: 'build', prompt: null });
    this.say(this.S.say.thrown, 3);
    this.audio.play('sweep');
    tape.scale.z = 0.01;
    return this.tween(2.6, (t) => {
      tape.userData.set({ x: A.x, y: 1, z: A.z }, { x: A.x - reach * t, y: end.y, z: A.z });
    }).then(() => this.audio.play(holds(entry.fact) ? 'success' : 'hit'));
  }

  /** The stone-cutter's capstone, every length × his k: lifted to the top — it sits, leaves a step, or overhangs. */
  setCapstone(entry, animate) {
    if (this.capstone) this.scene.remove(this.capstone);
    this.capstone = null;
    if (entry.built?.quarry) return Promise.resolve(); // too big for the yard: the quarry's order is written, nothing lifted
    const k = approx(entry.typed);
    const t = this.pts.summit.top;
    const cap = makeCapstone(approx(FACE.base) * k, this.pts.summit.h * k);
    const y = t.y;
    cap.position.set(t.x, animate ? y + 10 : y, t.z);
    this.scene.add(cap);
    this.capstone = cap;
    if (!animate) return Promise.resolve();
    this.set({ phase: 'build', prompt: null });
    this.cine = this.topShot();
    this.say(this.S.say.carved, 3);
    return this.tween(2, (p) => {
      cap.position.y = y + 10 * (1 - p);
    }).then(() => this.audio.play(holds(entry.fact) ? 'success' : 'hit'));
  }

  // ───────────────────────────── stage 4: up the ramp, and down ─────────────────────────────
  climb() {
    const { ramp, top } = this.pts.summit;
    this.set({ phase: 'climb', prompt: null });
    this.cine = {
      pos: new THREE.Vector3(ramp.x - 70, 60, ramp.z + 40),
      look: new THREE.Vector3(SUMMIT.x, 25, SUMMIT.z + 20),
    };
    const from = this.hero.pos.clone();
    const to = new THREE.Vector3(top.x - 0.9, top.y, top.z + 0.9);
    this.tween(3, (t) => {
      this.hero.pos.lerpVectors(from, to, t);
      this.hero.grounded = true;
    }).then(() => {
      if (this.dead) return;
      this.onTop = true;
      this.cine = null;
      this.done.climb = '1';
      this.say(this.S.say.climbed, 3);
      this.set({ phase: 'play' });
      this.save();
      this.refreshObjective();
      setTimeout(() => !this.dead && this.openOrder(this.stepNow()), 700);
    });
  }
  descend() {
    const { ramp } = this.pts.summit;
    this.set({ phase: 'climb', prompt: null });
    const from = this.hero.pos.clone();
    const to = new THREE.Vector3(ramp.x + 1.5, 0, ramp.z + 1.5);
    this.cine = this.topShot();
    this.tween(3, (t) => {
      this.hero.pos.lerpVectors(from, to, t);
    }).then(() => {
      if (this.dead) return;
      this.onTop = false;
      this.cine = null;
      this.stickyCine = false;
      this.hero.grounded = true;
      this.set({ phase: 'play' });
      this.refreshObjective();
    });
  }

  // ───────────────────────────── stage 5: the mission card, the flight, noon and the box ─────────────────────────────
  openCard(kind) {
    if (this.busy()) return;
    this.audio.play('ui');
    this.set({ phase: 'dialog', overlay: { type: kind }, prompt: null });
  }
  closeCard() {
    this.closeOverlay();
    this.refreshObjective();
  }
  /**
   * « check » on the mission card: Zero RISES along the axis to the h he wrote — whatever it is (the world carries out a
   * misreading, defects D16) — and ends at the apex, below or above it. Then the card's own fact, or noon.
   */
  checkMission(vals) {
    const m = this.story.mission;
    const h = m.height?.(vals);
    const out = m.check(vals);
    const fly = typedLength(h) ? order('flight', h, PLATEAU.h) : null;
    this.closeOverlay();
    const after = () => {
      if (this.dead) return;
      if (out === 'ok') {
        this.done.mission = h ?? '1';
        this.save();
        this.toNoon(true);
      } else if (out) this.say(out, 7);
      this.refreshObjective();
    };
    if (!fly) {
      after();
      return;
    }
    this.log.push({ stage: STAGE_IDS[4], step: 'mission', kind: 'flight', typed: fly.typed, fact: fly.fact });
    this.fly(fly).then(after);
  }
  fly(out) {
    const h = approx(out.typed);
    const H = approx(PLATEAU.h);
    this.set({ phase: 'fly', prompt: null, verdict: null });
    this.say(this.S.say.rise, 3);
    this.beam.visible = true;
    const start = this.hero.pos.clone();
    this.cine = {
      pos: new THREE.Vector3(GREAT.x - 230, H * 0.75, GREAT.z + 210),
      look: new THREE.Vector3(GREAT.x, Math.min(h, H * 1.6) * 0.8, GREAT.z),
    };
    return this.tween(3.2, (t) => {
      const y = h * t;
      this.beam.userData.set(y);
      this.hero.pos.set(GREAT.x, y, GREAT.z);
    })
      .then(() => {
        this.audio.play(holds(out.fact) ? 'success' : 'hit');
        this.set({ verdict: { kind: 'flight', fact: out.fact, typed: out.typed, seg: 'h' } });
        return this.wait(2.6);
      })
      .then(() => {
        this.beam.visible = false;
        this.hero.pos.copy(start);
        this.hero.grounded = true;
        this.cine = null;
        this.set({ phase: 'play' });
      });
  }
  /** Noon: the sun so high that no shadow leaves the base (§3.7, gate N5); the box of Ibn al-Haytham appears. */
  toNoon(say) {
    this.flags.noon = true;
    this.morning.visible = false;
    this.box.visible = true;
    this.sunStage = null; // the sky follows
    if (say) this.say(this.S.say.noon, 4);
    this.save();
  }
  checkBox(vals) {
    const out = this.story.box.check(vals);
    if (out === 'ok') {
      this.done.box = '1';
      this.closeOverlay();
      this.save();
      this.refreshObjective();
      this.finale();
      return null;
    }
    return out;
  }
  async finale() {
    const again = this.state.finished;
    const whole = this.story.complete !== false;
    this.set({ phase: 'end', prompt: null, finished: whole || again });
    this.save();
    await this.wait(1.2);
    if (this.dead) return;
    this.audio.play('finale');
    this.robot.cheer();
    await this.wait(again ? 0.5 : 3);
    if (this.dead) return;
    this.set({ overlay: { type: 'end', elapsed: Date.now() - this.startedAt } });
  }

  // ───────────────────────────── the forges (the lesson's; the kit's frame) ─────────────────────────────
  /** The world's own evidence of a stage, as cases of `ruleForge.js` (Thalès figures), and what its mirror showed. */
  forgeLog(stageId) {
    const rows = [];
    const named = (m, n) => ({ V: 'A', M: m, B: 'B', N: n, C: 'C' });
    if (stageId === 'field')
      for (const c of FIELD.canals) {
        const [m, n] = c.ends;
        if (this.done[`${m}${n}`] == null) continue;
        const typed = this.done[`${m}${n}?`];
        rows.push(
          thalesCase({
            id: `canal:${c.id}`,
            names: named(m, n),
            len: { VM: c.AM, VB: FIELD.AB, VN: c.AN, VC: FIELD.AC, MN: canalReading(FIELD, c), BC: FIELD.BC },
            canal: c.id,
            typed,
          }),
        );
      }
    if (stageId === 'workshop')
      for (const l of this.log.filter((x) => x.stage === 'workshop' && x.kind === 'course')) {
        const bm = l.step === 'course2' ? FACE.courses[1] : FACE.courses[0];
        const sm = courseAt(FACE, bm).SM;
        rows.push(
          thalesCase({
            names: { V: 'S', M: 'M', B: 'B', N: 'N', C: 'C' },
            len: { VM: sm, VB: FACE.edge, VN: sm, VC: FACE.edge, MN: l.typed, BC: FACE.base },
            held: holds(l.fact),
            fact: l.fact,
          }),
        );
      }
    if (stageId === 'river' && this.done.ER != null) {
      const ferry = [...this.log].reverse().find((l) => l.kind === 'ferry');
      // the river whole (`logic.js › riverFigure`: SR = √2785, SF = 8√2785, AF = 416): what he typed for the ferry
      // and the rope's fact ride along; `held` is the world's — the three ratios are equal (both lines square to the bank)
      rows.push(thalesCase({ ...riverFigure(RIVER), typed: ferry?.typed ?? null, ferry: ferry?.fact ?? null }));
    }
    if (stageId === 'summit')
      for (const l of this.log.filter((x) => x.kind === 'capstone')) {
        const side = (x) => write(times(x, l.typed));
        rows.push(
          thalesCase({
            names: { V: 'S', M: 'M', B: 'B', N: 'N', C: 'C' },
            len: {
              VM: side(FACE.edge),
              VB: FACE.edge,
              VN: side(FACE.edge),
              VC: FACE.edge,
              MN: side(FACE.base),
              BC: FACE.base,
            },
            held: holds(l.fact),
            k: l.typed,
          }),
        );
      }
    return [...rows, ...(this.mirrorLog[stageId] ?? [])];
  }
  openForge(key) {
    if (this.busy()) return;
    this.audio.play('crystal');
    this.flags[`forge:${key}`] = true; // a forge left unfinished opens again
    this.save();
    this.set({
      phase: 'dialog',
      overlay: { type: 'forge', key, log: this.forgeLog(this.stageNow().id) },
      prompt: null,
    });
  }
  /** A case the mirror of a forge showed him: evidence too. */
  logMirror(c) {
    const id = this.stageNow().id;
    this.mirrorLog = { ...this.mirrorLog, [id]: [...(this.mirrorLog[id] ?? []), { ...c, mirror: true }].slice(-24) };
    this.save();
  }
  sealRule(key, record) {
    this.rules = { ...this.rules, [key]: record };
    this.audio.play('key');
    this.set({ rules: this.rules, overlay: { type: 'tablet', key } });
    this.queue.push(() => this.story.afterKey?.[key]?.(this));
    this.save();
  }
  closeTablet() {
    const key = this.state.overlay?.key;
    const keys = key && !this.state.keys.includes(key) ? [...this.state.keys, key] : this.state.keys;
    if (key) this.keysEver.add(key);
    this.set({ overlay: null, phase: 'play', keys, openKeys: [...this.keysEver] });
    this.input.clear();
    this.queue.shift()?.();
    this.refreshObjective();
    this.save();
  }
  /** A door of the kit whose part the lesson has not got yet (`lesson.notYet`) does not open; the launch then starts. */
  openHub(overlay) {
    if (this.lesson.notYet?.includes(overlay.type)) {
      if (overlay.type === 'launch' && overlay.then === 'start') this.start();
      return;
    }
    super.openHub(overlay);
  }
  closeMap() {
    const from = this.mapFrom ?? 'play';
    this.mapFrom = null;
    this.set({ overlay: null, phase: from === 'title' ? 'title' : 'play' });
    this.input.clear();
  }

  // ───────────────────────────── between two docks: the felucca, on the kit's rail ─────────────────────────────
  board(i) {
    if (this.busy() || !this.stageDone(i)) return; // the game holds the order (§3.2)
    this.fromDock = i;
    this.drill = null;
    const leg = this.story.legs?.[i];
    this.stickyCine = false;
    this.cine = null;
    if (leg) {
      this.runContent = leg;
      this.runWon = false;
      this.set({ objective: '', verdict: null });
      this.gateRun.open(leg);
    } else this.sail(i);
  }
  startRun() {
    if (this.drill) return this.startPractice(this.drill.node, this.drill.level, true);
    this.gateRun.start();
    return true;
  }
  runLane(d) {
    this.gateRun.lane(d);
  }
  pauseRun(on) {
    this.gateRun.pause(on);
  }
  runOver(result) {
    if (this.drill) {
      setTimeout(() => !this.dead && this.endPractice(result), 0); // after the rail has published its own end
      return {};
    }
    this.runWon = result.won;
    return {};
  }
  leaveRun() {
    if (this.drill) return this.quitPractice();
    this.gateRun.hide();
    this.set({ run: null });
    if (this.runWon) this.arrive(this.nextDock(this.fromDock));
    else {
      this.hero.pos.copy(this.dockSpot(this.state.at));
      this.hero.vel.set(0, 0, 0);
      this.hero.grounded = true;
      this.set({ phase: 'play' });
      this.lookTo(Math.PI);
      this.refreshObjective();
    }
  }

  // ───────────────────────────── the practice space: a level of the practice ladder, sailed on the river ─────────────────────────────
  /**
   * A level of the lesson's ladder (`lesson.ladder`, the kit's) is a trip of the felucca on the kit's run in the river's
   * skin (plan §1.3 « the same rail is the practice ladder », §3.9): its waves are the buoys, crocodiles in the lanes,
   * three hearts. `again` replays it from the run's own end card. A level that is a real-world case (`isCase`) is not
   * played here (this world has none).
   */
  startPractice(node, level, again = false) {
    const ladder = this.lesson.ladder;
    if (!ladder || ladder.isCase(node, level)) return false;
    if (again ? !this.drill : this.busy() || this.state.run) return false;
    if (!ladder.levelOpen(node, level, [...this.keysEver], this.practice)) return false;
    this.audio.unlock();
    if (!this.mapFrom) this.mapFrom = this.state.phase === 'title' ? 'title' : 'play';
    if (!this.drill) this.runFrom = this.hero.pos.clone();
    this.drop();
    this.sailing = null;
    const names = this.lesson.text?.levels?.[ladder.nodes[node].id] ?? [];
    const { drill, content } = practiceRun({ ladder, node, level, random: Math.random, names, text: this.T.practice });
    this.drill = drill;
    this.runContent = content;
    this.set({ objective: '', verdict: null });
    this.gateRun.open(content);
    this.gateRun.start();
    return true;
  }
  /** The level is over: its stars are his hearts left (a level lost gives none), kept as the kit keeps them. */
  endPractice(result) {
    const d = this.drill;
    if (!d) return;
    const end = practiceEnd({
      ladder: this.lesson.ladder,
      drill: d,
      result,
      practice: this.practice,
      keys: [...this.keysEver],
    });
    this.practice = end.practice;
    if (end.win) this.audio.play(end.stars === 3 ? 'finale' : 'success');
    else this.audio.play('fail');
    this.drill = null;
    this.leaveRail();
    this.set({
      phase: this.mapFrom === 'title' ? 'title' : 'dialog',
      run: null,
      practice: this.practice,
      overlay: end.overlay,
    });
    this.save();
  }
  /** « quit » or « back to the map » during a level: nothing is kept, back to the hub on that node. */
  quitPractice() {
    const d = this.drill;
    if (!d) return;
    this.drill = null;
    this.leaveRail();
    this.set({ run: null, phase: this.mapFrom === 'title' ? 'title' : 'dialog' });
    this.openMap(d.node);
  }
  /** The river goes away and Zero stands again where the story left him (on the summit, `stepWorld` holds him there). */
  leaveRail() {
    this.gateRun.hide();
    this.hero.pos.copy(this.runFrom ?? this.dockSpot(this.state.at));
    this.runFrom = null;
    this.hero.vel.set(0, 0, 0);
    this.hero.grounded = true;
    this.lookTo(Math.PI);
  }
  /** « remind me of the rule » from the hub or a result: the tablet of a rule; closing it comes back where he was. */
  showRule(key, from) {
    if (!key) return;
    this.audio.play('ui');
    const o = this.state.overlay;
    this.set({ overlay: { type: 'rule', key, back: from && o ? { ...o, ...from } : o } });
  }
  closeRule() {
    const back = this.state.overlay?.back;
    if (back) this.set({ overlay: back });
    else this.closeMap();
  }

  /** Without a course of gates the felucca simply sails, Zero aboard. */
  sail(i) {
    this.sailing = { from: i, to: this.nextDock(i), t: 0 };
    this.say(this.T.say.sail, 3);
    this.set({ phase: 'sail', prompt: null, objective: '', verdict: null });
  }
  arrive(i) {
    if (this.topView) this.toggleTop(false);
    this.sailing = null;
    this.onTop = false;
    this.stickyCine = false;
    this.cine = null;
    this.mooring(i);
    this.hero.pos.copy(this.dockSpot(i));
    this.hero.vel.set(0, 0, 0);
    this.hero.grounded = true;
    this.safe = null;
    this.lookTo(Math.PI);
    const id = STAGE_IDS[i];
    this.set({
      at: i,
      stage: Math.max(this.state.stage, this.route.indexOf(i)), // the shell's dots count the docks PLAYED
      phase: 'play',
      islandName: this.T.docks[i],
      recall: this.story.recall?.(this, id) ?? [],
      register: null,
      verdict: null,
    });
    this.set({ register: this.registerOf() });
    this.story.onArrive?.(this, id);
    this.save(); // after the story's hook: a flag it sets survives a reload (defects D20)
    this.refreshObjective();
  }

  /**
   * A label keeps its size on screen, so a far one would clutter the horizon: in play only the labels near the camera
   * show; a framing of a stage shows that stage's; the rail shows none (its numbers are the page's).
   */
  showLabels(ph) {
    if (this.time - this.labelsAt < 0.25) return;
    this.labelsAt = this.time;
    const cam = this.camera.position;
    const p = this.tmpL ?? (this.tmpL = new THREE.Vector3());
    const top = Boolean(this.topView);
    const wide = top || (this.cine && (ph === 'look' || ph === 'build' || ph === 'fly' || this.stickyCine));
    // at the river's whole framing the letter of E stands higher: S and E, 9 m apart, would print on one another
    const eLabel = this.stakes['river:E']?.userData.label;
    if (eLabel && !top) eLabel.position.y = wide && this.state.at === 2 ? 14 : 2.6;
    const shown = [];
    this.scene.traverse((o) => {
      if (!o.isSprite || !o.userData.set) return;
      o.getWorldPosition(p);
      if (o.userData.topOnly) o.visible = top && this.stageOf(p.z) === this.state.at;
      else if (ph === 'run') o.visible = false;
      else if (wide || (this.hold && this.hold.step.sight))
        o.visible = !o.userData.dock && this.stageOf(p.z) === this.state.at && (top || p.distanceTo(cam) < 900);
      else o.visible = p.distanceTo(cam) < (o.userData.dock ? 120 : 170);
      if (top && o.visible) shown.push(o);
    });
    // in the top view no label prints over another: each is moved up the screen, from where it belongs, as needed
    if (top)
      this.moved = declutter(shown, this.topView, {
        viewH: this.renderer.domElement.clientHeight || 768,
        aspect: this.camera.aspect || 16 / 9,
        labelK: (this.renderer.domElement.clientHeight || 768) / 2 / Math.tan((this.camera.fov * Math.PI) / 360),
        keepOut: this.hudRects(),
      });
  }
  /** The stage a point of the world belongs to, by its place along the river. */
  stageOf(z) {
    // the plateau's centre stands nearer the summit than its pyramid (−800): its corner D (z −685) was the summit's
    const mid = [-45, -225, -400, -600, -750];
    return mid.reduce((best, m, i) => (Math.abs(z - m) < Math.abs(z - mid[best]) ? i : best), 0);
  }

  dispose() {
    window.removeEventListener('keydown', this.onDropKey);
    this.gateRun?.dispose();
    this.envRT?.dispose();
    this.pmrem?.dispose();
    super.dispose();
  }

  // ───────────────────────────── each step ─────────────────────────────
  stepWorld(dt, ph) {
    if (ph === 'run') this.gateRun.step(dt);
    if (this.topView && ph !== 'play' && ph !== 'dialog') this.toggleTop(false);
    // the sky's sun follows the stage (K-f): its environment is rebuilt only when the stage (or noon) changes
    const sunKey = `${this.state.at}:${Boolean(this.flags.noon)}`;
    if (this.sunStage !== sunKey) {
      this.sunStage = sunKey;
      this.physSky.setSun(this.sunDir());
      this.envRT?.dispose();
      this.envRT = this.pmrem.fromScene(this.physSky.envScene, 0.04);
      this.scene.environment = this.envRT.texture;
      this.scene.environmentIntensity = 0.2;
    }
    this.physSky.sky.position.copy(this.camera.position);
    // the drawn morning shadows belong to the plateau's morning sun only
    this.morning.visible = this.state.at === 4 && !this.flags.noon;
    this.felucca.position.y = WATER_Y + 0.15 + Math.sin(this.time * 1.6) * 0.08;
    if (ph === 'sail' && this.sailing) this.stepSail(dt);
    for (const s of Object.values(this.stakes))
      if (s.userData.lamp.visible) s.userData.lamp.scale.setScalar(1 + Math.sin(this.time * 4) * 0.15);
    for (const d of this.docks)
      if (d.userData.lamp.visible) d.userData.lamp.material.emissiveIntensity = 1.1 + Math.sin(this.time * 3) * 0.4;
    for (const t of Object.values(this.tables))
      if (t.userData.board.visible) t.userData.board.material.emissiveIntensity = 0.9 + Math.sin(this.time * 3) * 0.4;
    this.showLabels(ph);
    if (this.stickyCine && ph === 'play') {
      const ax = this.input.axis();
      if (Math.hypot(ax.x, ax.y) > 0.3 || this.hold) {
        this.stickyCine = false;
        this.cine = null;
      }
    }
    if (this.onTop && ph === 'play') {
      const t = this.pts.summit.top;
      this.hero.pos.set(t.x - 0.9, t.y, t.z + 0.9);
      this.hero.vel.set(0, 0, 0);
    }
    const h = this.hold;
    if (!h || ph !== 'play') return;
    // HIS SLIDE IS THE LENGTH: a tap is a knot, a key held goes faster and faster
    let s = h.s;
    if (this.input.take('left')) s = slideTap(s, -h.sign);
    if (this.input.take('right')) s = slideTap(s, h.sign);
    const ax = this.input.axis().x;
    s = slideStep(s, Math.abs(ax) > 0.5 ? Math.sign(ax) * h.sign : 0, dt);
    h.s = s;
    const p = slidePoint(s);
    const hero = this.hero;
    hero.pos.set(p.x, p.y, p.z);
    if (h.step.edge) hero.pos.x -= 0.5;
    if (h.step.ghost) {
      this.ghost.position.set(p.x, 0, p.z);
      hero.pos.z += 2;
    }
    hero.vel.set(0, 0, 0);
    hero.grounded = true;
    hero.yaw = Math.atan2(s.dir.x, s.dir.z) * (s.way < 0 ? -1 : 1);
    this.view = Math.atan2(s.dir.x, s.dir.z);
    const knots = knotsOf(s);
    if (!h.step.ghost) {
      this.rope.visible = true;
      this.rope.userData.set(s.from, p, s.pos);
      this.rope.userData.label.userData.set(String(knots));
    }
    if (knots !== this.state.rope?.knots) this.set({ rope: { ...this.state.rope, knots } });
    if (tied(s)) this.tie();
  }

  stepSail(dt) {
    const sl = this.sailing;
    sl.t = Math.min(1, sl.t + dt / 6);
    const e = sl.t < 0.5 ? 2 * sl.t * sl.t : 1 - (-2 * sl.t + 2) ** 2 / 2;
    const z = DOCK_Z[sl.from] + (DOCK_Z[sl.to] - DOCK_Z[sl.from]) * e;
    this.felucca.position.set(BANK_X - 24 - Math.sin(e * Math.PI) * 30, this.felucca.position.y, z + 3.6);
    this.felucca.rotation.y = 0;
    const b = this.felucca.position;
    this.hero.pos.set(b.x, b.y + 0.2, b.z + 1.2);
    this.hero.yaw = Math.PI;
    if (sl.t >= 1) this.arrive(sl.to);
  }
}

/** For the walks (`window.__np`, in development only): Zero placed at a dock, the step read — never an answer. */
export const devHandles = {
  __np: {
    toDock: (i) => window.__world?.arrive(i),
    stepNow: () => window.__world?.stepNow()?.id ?? null,
    points: () => window.__world?.pts,
    labelRects: () => window.__world?.labelRects() ?? [],
    v3,
  },
};
