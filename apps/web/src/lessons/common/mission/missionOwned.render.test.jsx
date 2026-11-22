import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import '../../../i18n';
import { missionTools, missionStations, resumeStation } from './missionModel';

/**
 * LA SYNTHÈSE dans le lecteur — l'accueil et la barre quand les clés de l'unité sont POSSÉDÉES (`mission.toolsOwned`, 2026-11-10, provisoire).
 * Rendu serveur (pas de DOM dans ce dépôt) : `useMission` est remplacé par ce que le modèle PUR calcule pour la config donnée ; la scène,
 * « راجع قبل أن تنطلق » et les contextes de la leçon sont neutralisés — on lit seulement ce que l'accueil et la barre écrivent.
 */
const held = vi.hoisted(() => ({ value: null }));
vi.mock('./useMission', () => ({ useMission: () => held.value }));
vi.mock('./MissionScene', () => ({ default: ({ fill }) => <div data-test-scene-fill={fill} /> }));
vi.mock('./ReviseFirst', () => ({ default: () => null }));
vi.mock('../components/PrerequisiteLessonChips', () => ({ default: () => null }));
vi.mock('../knowledge/KnowledgeProvider', () => ({ useLessonKnowledge: () => ({ openMap: () => {}, lessonId: null }) }));
vi.mock('../../../features/practice/notebook/NotebookProvider', () => ({ useNotebook: () => null }));

const { default: MissionHome } = await import('./MissionHome');
const { default: MissionBar } = await import('./MissionBar');

const MODULES = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ number: n, slug: `m${n}`, title: `محور ${n} — عنوان ${n}` }));
const SYNTHESIS = {
  id: 'test-synthesis', title: 'درس', estimatedDurationMin: 31, modules: MODULES,
  mission: {
    title: 'مهمّة الوحدة', opening: { text: 'هل تعرف متى تستعمل كلّ مفتاح؟', cta: 'أجرّب' }, scene: 'x',
    toolsOwned: true, climaxModule: 8, checkpoints: [], trainings: [1, 2, 3, 4, 5, 6], hideStars: true, durationMin: 70, sittings: 2,
    stationLabels: { 7: 'وضعية الوحدة', 8: 'التحدّي' },
    tools: [
      { id: 'k-length', emoji: '📏', label: 'حساب طول', usedIn: [1, 2] },
      { id: 'k-converse', emoji: '🪜', label: 'إثبات التوازي', usedIn: [5] },
      { id: 'k-split', emoji: '✂️', label: 'تقسيم قطعة', usedIn: [3] },
    ],
  },
};
const CLASSIC = {
  id: 'test-classic', title: 'درس', estimatedDurationMin: 31, modules: MODULES.slice(0, 5),
  mission: {
    title: 'مهمّة', opening: { text: 'كم رفًّا؟', cta: 'لا أعرف بعد' }, climaxModule: 3, checkpoints: [],
    tools: [{ id: 'a', icon: '🔑', label: 'أداة أ' }, { id: 'b', icon: '🧲', label: 'أداة ب' }],
  },
};

/** Ce que `useMission` rendrait, calculé par le modèle pur : `completed` modules faits, `learned` connaissances établies. */
function mount(config, { completed = [], learned = [], opened = true, stars = 0 } = {}) {
  const isDone = (n) => completed.includes(n);
  const stations = missionStations(config, (m) => (isDone(Number(m.number)) ? 'mastered' : 'available'));
  held.value = {
    on: true, mission: config.mission, state: { opened, answered: {}, seen: {} }, update: () => {},
    tools: missionTools(config.mission, learned, completed), stations, resume: resumeStation(stations), completedModules: completed, stars,
  };
  return held.value;
}
const home = (config, opts) => { mount(config, opts); return renderToString(<MemoryRouter><MissionHome config={config} basePath="/l" /></MemoryRouter>); };
const bar = (config, opts) => { const m = mount(config, opts); return renderToString(<MissionBar mission={m.mission} tools={m.tools} stations={m.stations} stars={m.stars} />); };
/** le fragment HTML d'un outil : de son `data-mission-tool` au suivant */
const toolHtml = (html, id) => html.split('data-mission-tool="').find((chunk) => chunk.startsWith(`${id}"`)) ?? '';

describe('MissionHome — owned keys (toolsOwned)', () => {
  it('the opening says « مفاتيحك معك: », shows a FULL scene, the honest duration and the two sittings', () => {
    const html = home(SYNTHESIS, { opened: false });
    expect(html).toContain('مفاتيحك معك:');
    expect(html).not.toContain('ستجمع في الطريق');
    expect(html).toContain('data-test-scene-fill="1"');
    expect(html).toContain('نحو 70 دقيقة');
    expect(html).not.toContain('نحو 31 دقيقة');
    expect(html).toMatch(/data-mission-sittings[^>]*>في جلستين</);
    expect(html).toContain('أجرّب');
    expect(html).not.toContain('🔒');
  });

  it('no key is ever locked; a used key and an owned one differ by a ✓ and by their accessible name, not by colour alone', () => {
    const html = home(SYNTHESIS, { completed: [0, 1] });
    expect(html).not.toContain('🔒');
    const used = toolHtml(html, 'k-length');
    const owned = toolHtml(html, 'k-converse');
    expect(used).toContain('data-used="true"');
    expect(used).toContain('✓');
    expect(used).toContain('استعملته');
    expect(owned).toContain('data-used="false"');
    expect(owned).not.toContain('✓');
    expect(owned).toContain('معك، لم تستعمله بعد');
    // la clé pas encore utilisée garde son icône et son nom, lisibles (jamais grisée)
    expect(owned).toContain('🪜');
    expect(owned).toContain('إثبات التوازي');
    expect(owned).not.toMatch(/text-slate-400|grayscale|opacity-/);
  });

  it('the ring counts the keys USED, the scene stays full, the trainings read « n / 6 »', () => {
    const html = home(SYNTHESIS, { completed: [0, 1, 2] });
    expect(html).toContain('data-mission-ring="1/3"');
    expect(html).toContain('data-test-scene-fill="1"');
    expect(html).toContain('data-mission-trainings="2/6"');
    expect(html).toContain('وضعيات تدريبية:');
    expect(html).toContain('مفاتيحي');
  });

  it('the ⭐ counter is hidden while it would read 0 and comes back with the first lab star', () => {
    expect(home(SYNTHESIS, { completed: [0] })).not.toContain('data-mission-stars');
    expect(home(SYNTHESIS, { completed: [0], stars: 2 })).toContain('data-mission-stars="2"');
  });

  it('« واصل » and the map name a station by mission.stationLabels', () => {
    const html = home(SYNTHESIS, { completed: [0, 1, 2, 3, 4, 5, 6] });
    expect(html).toContain('واصل: وضعية الوحدة');
    expect(html).toContain('التحدّي');
    expect(html).toMatch(/data-mission-station="8"[^>]*data-station-kind="climax"/);
    expect(html).not.toContain('data-station-kind="bonus"');
  });
});

describe('MissionBar — owned keys (toolsOwned)', () => {
  it('names each key « used » or « owned, not used yet », never « locked », with a ✓ on the used one', () => {
    const html = bar(SYNTHESIS, { completed: [0, 3] });
    expect(html).not.toContain('🔒');
    expect(html).not.toContain('لم تحصل عليها بعد');
    expect(html).toContain('aria-label="تقسيم قطعة — استعملته"');
    expect(html).toContain('aria-label="حساب طول — معك، لم تستعمله بعد"');
    expect(toolHtml(html, 'k-split')).toContain('✓');
    expect(toolHtml(html, 'k-length')).not.toContain('✓');
    expect(toolHtml(html, 'k-length')).not.toMatch(/grayscale|opacity-60/);
    // les glyphes décoratifs sont cachés aux lecteurs d'écran : le nom vient de aria-label
    expect(toolHtml(html, 'k-split')).toMatch(/<span aria-hidden="true">✂️<\/span>/);
  });
  it('hides « ⭐ 0 » with hideStars, shows the counter from the first star', () => {
    expect(bar(SYNTHESIS)).not.toContain('data-mission-stars');
    expect(bar(SYNTHESIS, { stars: 3 })).toContain('data-mission-stars="3"');
  });
});

describe('a lesson that sets none of the new fields is unchanged', () => {
  it('home: « ستجمع في الطريق », an empty scene, the catalogue duration, 🔒 on the tool not earned, « ⭐ 0 » shown', () => {
    const opening = home(CLASSIC, { opened: false });
    expect(opening).toContain('ستجمع في الطريق:');
    expect(opening).not.toContain('مفاتيحك معك');
    expect(opening).toContain('data-test-scene-fill="0"');
    expect(opening).toContain('نحو 31 دقيقة');
    expect(opening).not.toContain('data-mission-sittings');
    const html = home(CLASSIC, { learned: ['a'] });
    expect(toolHtml(html, 'a')).toContain('data-earned="true"');
    expect(toolHtml(html, 'b')).toContain('🔒');
    expect(html).not.toContain('data-used');
    expect(html).toContain('data-mission-ring="1/2"');
    expect(html).toContain('data-test-scene-fill="0.5"');
    expect(html).toContain('data-mission-stars="0"');
    expect(html).not.toContain('data-mission-trainings');
    expect(html).toContain('أدواتي');
  });
  it('bar: earned / locked titles and the star counter as before', () => {
    const html = bar(CLASSIC, { learned: ['a'] });
    expect(html).toContain('aria-label="أداة أ — حصلت عليها"');
    expect(html).toContain('aria-label="أداة ب — لم تحصل عليها بعد"');
    expect(html).toContain('data-mission-stars="0"');
    expect(html).not.toContain('data-used');
  });
});
