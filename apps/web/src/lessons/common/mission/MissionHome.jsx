import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import MathLabel from '../components/MathLabel';
import { mathToPlain } from '../../../utils/mathPlain';
import { useMission } from './useMission';
import { stationLabel, toolLit, toolProgress, sceneFill, trainingsDone, showStars, openingMinutes } from './missionModel';
import MissionScene from './MissionScene';
import MissionMap from './MissionMap';
import MissionDialog from './MissionDialog';
import ReviseFirst from './ReviseFirst';
import PrerequisiteLessonChips from '../components/PrerequisiteLessonChips';
import { isPracticeActive, practiceHubPath } from '../../../features/practice/practiceCapability';

/**
 * L'ACCUEIL de la leçon en mode mission (LessonIndex le rend pour l'élève). La première fois : la scène d'ouverture —
 * la bibliothèque, UNE phrase, et l'aveu honnête « لا أعرف بعد » (on ne sait pas encore la résoudre). Ensuite : la
 * bibliothèque qui se remplit avec les outils, la carte, et UN bouton « واصل ». L'élève n'a JAMAIS accès à l'ancienne page du
 * درس (propriétaire, 2026-11-04) : ses détails s'ouvrent ici (« تفاصيل الدرس »), ses تمارين sont ici aussi.
 */
export default function MissionHome({ config, basePath, onLab = null }) {
  const { t } = useTranslation('lesson');
  const navigate = useNavigate();
  const { mission, state, update, tools, stations, resume, stars, completedModules } = useMission(config);
  const [replay, setReplay] = useState(false);
  // « شاهد البداية » : la hauteur NATURELLE de l'accueil (sans le zoom du lecteur), prise au clic — l'accroche prend exactement cette hauteur,
  // sa scène se réduit pour tenir sous la bulle : le lecteur ne change donc pas de zoom (même largeur, bouton au même pixel ; 2026-11-11).
  const homeRef = useRef(null);
  const [homeHeight, setHomeHeight] = useState(null);
  const openReplay = () => {
    const el = homeRef.current;
    const zoom = parseFloat(el?.closest('[data-fit-zoom]')?.dataset.fitZoom) || 1;
    setHomeHeight(el ? el.getBoundingClientRect().height / zoom : null);
    setReplay(true);
  };
  const [details, setDetails] = useState(false);
  // « شاهد البداية » (propriétaire, 2026-11-11) : l'accroche est construite SUR la carte de l'accueil (même grille, même en-tête,
  // mêmes pastilles) et n'est pas plus haute que l'accueil ; elle garde donc la taille posée de l'accueil — même largeur — et
  // « لا أعرف بعد » est exactement à la place de « ابدأ : … » / « واصل : … ». (FitToArea › keepInPlace ne la réduit que si elle ne tient pas.)
  // SYNTHÈSE (`mission.toolsOwned`) : les clés de l'unité sont possédées d'emblée — la scène est pleine, l'anneau compte les clés UTILISÉES
  const owned = mission.toolsOwned === true;
  const { lit } = toolProgress(tools);
  const fill = sceneFill(mission, tools);
  const trainings = trainingsDone(mission, completedModules);
  const target = resume ?? stations[0];
  const go = () => target && navigate(`${basePath}/${target.slug}`);

  // ── LA PREMIÈRE VUE : l'accroche (propriétaire, 2026-11-09 : plus claire, plus attirante, plus motivante) ──
  if (!state.opened || replay) {
    const minutes = openingMinutes(config);
    const capped = replay && homeHeight > 0;
    const start = () => { update({ opened: true }); setReplay(false); go(); };
    return (
      <section className={capped ? 'flex flex-col gap-4' : 'space-y-4'} style={capped ? { height: homeHeight } : undefined} data-mission-opening>
        {/* la MÊME carte que l'accueil (classes, grille, en-tête, pastilles) : seul le contenu de la colonne de la scène change */}
        <div className={`grid items-start gap-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] ${capped ? 'min-h-0 flex-1' : ''}`} data-mission-hero>
          <div className="min-w-0 space-y-4">
            <HomeHeader tag={`🎯 ${t('mission.tag')}`} title={mission.title}
              ring={<ProgressRing value={lit} total={tools.length} label={t(owned ? 'mission.keys' : 'mission.tools')} />} />
            <ToolChips tools={tools} owned={owned} />
            <button type="button" data-mission-start onClick={start}
              className="min-h-[64px] w-full rounded-2xl bg-indigo-600 px-6 text-xl font-black text-white shadow-[0_5px_0_0_#3730A3] hover:bg-indigo-700 active:translate-y-0.5">
              {mission.opening.cta} <span aria-hidden="true">←</span>
            </button>
            {/* là où l'accueil a « التمارين » : la durée et la mission */}
            <div className="flex flex-wrap gap-2 text-sm font-bold" data-mission-facts>
              {minutes && <span className="rounded-full bg-slate-50 px-3 py-1 text-slate-700 ring-1 ring-slate-200">⏱ {t('mission.duration', { count: minutes })}</span>}
              {Number(mission.sittings) === 2 && <span className="rounded-full bg-slate-50 px-3 py-1 text-slate-700 ring-1 ring-slate-200" data-mission-sittings>{t('mission.twoSittings')}</span>}
              <span className="rounded-full bg-slate-50 px-3 py-1 text-slate-700 ring-1 ring-slate-200" data-mission-preview>🧰 {t(owned ? 'mission.youHave' : 'mission.willCollect')} {t('mission.toolsCount', { count: tools.length })}</span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">🏆 {t('mission.climax')}</span>
            </div>
          </div>
          {/* la QUESTION est la bulle du personnage, posée au-dessus de la scène */}
          <div className={`min-w-0 ${capped ? 'flex h-full min-h-0 flex-col gap-4 self-stretch' : 'space-y-4'}`}>
            <div className="relative shrink-0 rounded-3xl border-2 border-amber-200 bg-amber-50/40 p-4 shadow-sm" data-mission-bubble>
              <p className="text-lg font-extrabold leading-relaxed text-slate-900"><Highlighted text={mission.opening.text} /></p>
              <span aria-hidden="true" className="absolute -bottom-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-amber-200 bg-[#fffdf5]" />
            </div>
            <div className={capped ? 'min-h-0 flex-1' : ''} data-mission-opening-scene>
              <MissionScene scene={mission.scene} fill={owned ? 1 : 0} className={`w-full drop-shadow-sm ${capped ? 'h-full' : ''}`} label={mathToPlain(mission.opening.text)} />
            </div>
          </div>
        </div>
        <ReviseFirst lessonId={config.id} title={config.title} basePath={basePath} variant="slim" />
      </section>
    );
  }

  // ── LE RETOUR (propriétaire, 2026-11-09, v2) : un accueil COURT pour que le lecteur (FitToArea) l'AGRANDISSE au lieu de le réduire —
  // l'élève ne doit jamais zoomer. Une seule grande carte (la scène, le titre, les outils, UN « واصل » + l'accès aux تمارين), le parcours,
  // et « راجع » en une ligne. (La carte « التالي » séparée a été retirée : le bouton dit déjà où l'on va.)
  const doneCount = stations.filter((x) => x.status === 'mastered').length;
  const started = stations.some((x) => x.status === 'mastered');
  const practiceOn = isPracticeActive(config.id);
  return (
    <section ref={homeRef} className="space-y-4" data-mission-home>
      <div className="grid items-center gap-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]" data-mission-hero>
        {/* le texte et « واصل » à DROITE, la scène à gauche (propriétaire, 2026-11-09 : le bouton au même endroit que celui de la page de l'unité) */}
        <div className="min-w-0 space-y-4">
          <HomeHeader
            tag={<>📚 {t('mission.tag')}
              {showStars(mission, stars) && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-base text-amber-800" data-mission-stars={stars}>⭐ <span dir="ltr">{stars}</span></span>}
              {trainings && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-base normal-case tracking-normal text-emerald-800" data-mission-trainings={`${trainings.done}/${trainings.total}`}>
                  {t('mission.trainings')} <span dir="ltr">{trainings.done}{'\u00A0/\u00A0'}{trainings.total}</span>
                </span>
              )}
            </>}
            title={mission.title}
            ring={<ProgressRing value={lit} total={tools.length} label={t(owned ? 'mission.keys' : 'mission.tools')} />} />
          <ToolChips tools={tools} owned={owned} />
          {resume ? (
            <button type="button" onClick={go} data-mission-continue
              className="min-h-[64px] w-full rounded-2xl bg-indigo-600 px-6 text-xl font-black text-white shadow-[0_5px_0_0_#3730A3] hover:bg-indigo-700 active:translate-y-0.5">
              {t(started ? 'mission.continue' : 'mission.start', { title: mathToPlain(resume.label ?? stationLabel(resume.title)) })} <span aria-hidden="true">←</span>
            </button>
          ) : (
            <p className="text-2xl font-black text-emerald-700">🏆 {t('mission.allDone')}</p>
          )}
          {/* les تمارين de la leçon, toujours ouvertes (l'élève n'a plus l'ancienne page du درس) */}
          {practiceOn && (
            <button type="button" onClick={() => navigate(practiceHubPath(config.id))} data-mission-practice
              className="min-h-[52px] w-full rounded-2xl border-2 border-violet-200 bg-violet-50 px-6 text-lg font-black text-violet-800 hover:border-violet-400">
              📝 {t('mission.practiceStation')} <span aria-hidden="true">←</span>
            </button>
          )}
        </div>
        <MissionScene scene={mission.scene} fill={fill} className="w-full" label={mission.title} />
      </div>
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm" data-mission-path-card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-black text-slate-900">{t('mission.mapTitle')}</h2>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-base font-black text-emerald-700" data-mission-done-count>✓ {t('mission.progress', { done: doneCount, total: stations.length })}</span>
        </div>
        <MissionMap lessonId={config.id} stations={stations} basePath={basePath} here={resume?.number} />
      </div>
      {/* « راجع » et les deux liens discrets sur UNE ligne : l'accueil reste court, le lecteur l'agrandit */}
      <div className="flex flex-wrap items-center gap-4 text-sm font-bold" data-mission-home-foot>
        <ReviseFirst lessonId={config.id} title={config.title} basePath={basePath} variant="slim" className="min-w-0 flex-1" />
        {/* « مختبري » : les instruments de la leçon et ceux des leçons précédentes (lessons/common/lessonlab) */}
        {onLab && (
          <button type="button" onClick={onLab} className="min-h-[44px] rounded-full border-2 border-emerald-300 bg-emerald-50 px-4 text-base font-black text-emerald-800 hover:border-emerald-500" data-mission-lab>
            🧪 {t('mission.lab')}
          </button>
        )}
        <button type="button" onClick={openReplay} className="min-h-[44px] rounded-lg px-2 text-indigo-600 hover:bg-indigo-50" data-mission-replay>
          {t('mission.replay')}
        </button>
        <button type="button" onClick={() => setDetails(true)} className="min-h-[44px] rounded-lg px-2 text-indigo-600 hover:bg-indigo-50" data-mission-details>
          {t('mission.details')}
        </button>
      </div>
      {details && (
        // Ce que l'ancienne page du درس montrait (fold, never delete) : la description, les كفاءات, les prérequis.
        <MissionDialog label={t('mission.details')} onClose={() => setDetails(false)}>
          <div className="space-y-4 pt-6" data-mission-details-dialog>
            <h2 className="text-xl font-black text-slate-900"><MathLabel>{config.title}</MathLabel></h2>
            {config.description && <p className="leading-relaxed text-slate-700"><MathLabel>{config.description}</MathLabel></p>}
            {config.skills?.length > 0 && (
              <ul className="space-y-1.5">
                {config.skills.map((skill) => (
                  <li key={skill} className="flex items-start gap-2 text-slate-700"><span className="mt-0.5 text-indigo-400" aria-hidden="true">▸</span><MathLabel>{skill}</MathLabel></li>
                ))}
              </ul>
            )}
            <ul className="flex flex-wrap gap-1.5"><PrerequisiteLessonChips lessonId={config.id} /></ul>
          </div>
        </MissionDialog>
      )}
    </section>
  );
}

/** L'en-tête de la carte de l'accueil (étiquette, titre, anneau) — partagé avec l'accroche alignée pour que les deux se superposent. */
function HomeHeader({ tag, title, ring }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        {/* hauteur fixe : avec ou sans la pastille ⭐ (≈ 33 px avec l'émoji), le titre et ce qui suit ne bougent pas */}
        <p className="flex min-h-[36px] items-center gap-3 text-sm font-black uppercase tracking-wide text-indigo-500">{tag}</p>
        <h1 className="font-space text-4xl font-extrabold text-slate-900">{title}</h1>
      </div>
      {ring}
    </div>
  );
}

/** Les pastilles des outils (ou des clés d'une synthèse) de l'accueil — partagées avec l'accroche alignée. */
function ToolChips({ tools, owned }) {
  const { t } = useTranslation('lesson');
  return (
    <div className="flex flex-wrap items-center gap-2" data-mission-tools>
      {tools.map((tool) => (owned ? (
        // clé POSSÉDÉE : jamais 🔒 — utilisée = pleine + ✓ et le mot dit ; pas encore = simple anneau (l'état ne tient pas à la couleur)
        <span key={tool.id} data-mission-tool={tool.id} data-earned="true" data-used={tool.used ? 'true' : 'false'}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-base font-bold ${toolLit(tool) ? 'bg-amber-100 text-amber-900' : 'bg-white text-slate-700 ring-2 ring-inset ring-slate-300'}`}>
          <span aria-hidden="true">{tool.icon}</span>{tool.label}
          {tool.used && <span aria-hidden="true" className="font-black text-emerald-700">✓</span>}
          <span className="sr-only"> — {t(tool.used ? 'mission.toolUsed' : 'mission.toolOwned')}</span>
        </span>
      ) : (
        <span key={tool.id} data-mission-tool={tool.id} data-earned={tool.earned ? 'true' : 'false'}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-base font-bold ${tool.earned ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-400'}`}>
          <span aria-hidden="true">{tool.earned ? tool.icon : '🔒'}</span>{tool.label}
        </span>
      )))}
    </div>
  );
}

/** Les nombres de la question SAUTENT aux yeux (pastilles ambre) ; un texte avec des formules garde MathLabel. */
function Highlighted({ text }) {
  const s = String(text ?? '');
  if (s.includes('$')) return <MathLabel>{s}</MathLabel>;
  return s.split(/(\d+(?:[.,]\d+)?)/).map((part, i) => (/^\d/.test(part)
    ? <span key={i} dir="ltr" className="mx-0.5 rounded-lg bg-amber-100 px-1.5 text-amber-900" data-mission-number>{part}</span>
    : <React.Fragment key={i}>{part}</React.Fragment>));
}

/** L'anneau des outils gagnés (`value` sur `total`). */
function ProgressRing({ value, total, label }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const f = total ? Math.min(1, value / total) : 0;
  return (
    <div className="relative h-16 w-16 shrink-0" data-mission-ring={`${value}/${total}`}>
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#E0E7FF" strokeWidth="7" />
        <circle cx="32" cy="32" r={r} fill="none" stroke="#F59E0B" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - f)} />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-base font-black text-slate-900" dir="ltr">{value}/{total}</span>
        <span className="mt-0.5 text-[10px] font-bold text-slate-500">{label}</span>
      </span>
    </div>
  );
}
