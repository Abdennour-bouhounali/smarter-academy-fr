import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LessonProblemCard from '../problems/LessonProblemCard';
import { StudentFocusProvider } from '../components/StudentFocus';
import { useMission } from './useMission';
import { pendingCheckpoint, shouldWelcome, stationLabel, sceneFill } from './missionModel';
import MissionScene from './MissionScene';
import MathLabel from '../components/MathLabel';
import { mathToPlain } from '../../../utils/mathPlain';
import MissionBar from './MissionBar';
import MissionMap from './MissionMap';
import MissionDialog from './MissionDialog';
import MissionCheckpoint from './MissionCheckpoint';

const WELCOME_MS = 2000;

/**
 * La mission DANS un module (ModuleLayout la pose sous le fil d'Ariane) : la barre, la carte et l'énoncé à la
 * demande, et — en arrivant — le point d'étape du module précédent s'il attend. Rien hors du regard élève.
 */
export default function MissionLayer({ config, moduleNumber, basePath }) {
  const { t } = useTranslation('lesson');
  const { on, mission, state, update, tools, stations, completedModules, stars } = useMission(config);
  const [open, setOpen] = useState(null); // 'map' | 'text' | null
  // Le point d'étape est décidé à l'ARRIVÉE : terminer ce module-ci n'en fait pas surgir un autre sous les yeux.
  const [checkpoint] = useState(() => (on ? pendingCheckpoint(mission, completedModules, state.answered, moduleNumber) : null));
  const [checkpointOpen, setCheckpointOpen] = useState(Boolean(checkpoint));
  // L'ACCUEIL de la station (première arrivée, sans point d'étape) : la carte « أنت هنا », 2 s, un geste la ferme.
  // « أستعدّ » a SA fenêtre d'arrivée (TimedNotice, 5 s) : jamais deux fenêtres l'une sur l'autre (propriétaire, 2026-11-07).
  // `config` peut être null (configuration pas encore chargée, rechargement à chaud) : useMission le tolère, ici aussi (2026-11-11)
  const ownArrival = config?.modules?.find((m) => Number(m.number) === Number(moduleNumber))?.stage === 'prerequisite_check';
  const [welcome, setWelcome] = useState(() => on && !ownArrival && shouldWelcome(state.seen, moduleNumber, checkpoint));
  useEffect(() => {
    if (!welcome) return undefined;
    update({ seen: { [String(moduleNumber)]: true } });
    const timer = setTimeout(() => setWelcome(false), WELCOME_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [welcome]);
  if (!on) return null;
  const here = stations.find((s) => s.number === Number(moduleNumber));
  const fill = sceneFill(mission, tools);
  return (
    <>
      <MissionBar mission={mission} tools={tools} stations={stations} stars={stars} onOpenMap={() => setOpen('map')} onOpenMission={() => setOpen('text')} />
      {open === 'map' && (
        <MissionDialog label={t('mission.mapTitle')} onClose={() => setOpen(null)}>
          <h2 className="mb-5 text-xl font-black text-slate-900">{t('mission.mapTitle')}</h2>
          <MissionMap lessonId={config.id} stations={stations} basePath={basePath} here={moduleNumber} onNavigate={() => setOpen(null)} />
        </MissionDialog>
      )}
      {open === 'text' && (
        <MissionDialog label={t('mission.readMission')} onClose={() => setOpen(null)}>
          {/* L'élève a DEMANDÉ l'énoncé : il le lit en entier ici, sans second pli. */}
          {config.lessonProblem ? (
            <StudentFocusProvider>
              <div className="pt-8"><LessonProblemCard problem={config.lessonProblem} /></div>
            </StudentFocusProvider>
          ) : (
            // une leçon SANS « مسألة الدرس » (synthèse) : la mission est sa question d'ouverture, avec sa scène — jamais une fenêtre vide
            <div className="grid items-center gap-5 pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]" data-mission-text>
              <div className="min-w-0 space-y-3 text-start">
                <h2 className="text-2xl font-black text-slate-900">{mission.title}</h2>
                <p className="text-xl font-extrabold leading-relaxed text-slate-900"><MathLabel>{mission.opening?.text}</MathLabel></p>
              </div>
              <MissionScene scene={mission.scene} fill={fill} className="w-full" label={mathToPlain(mission.opening?.text ?? mission.title)} />
            </div>
          )}
        </MissionDialog>
      )}
      {welcome && here && (
        <MissionDialog label={t('mission.mapTitle')} onClose={() => setWelcome(false)}>
          <button type="button" className="block w-full text-start" onClick={() => setWelcome(false)} data-mission-welcome={moduleNumber}>
            <p className="text-xs font-black uppercase tracking-wide text-indigo-500">{t('mission.here')}</p>
            <p className="mb-5 mt-1 text-2xl font-black text-slate-900">{here.label ?? stationLabel(here.title)}</p>
            <MissionMap lessonId={config.id} stations={stations} basePath={basePath} here={moduleNumber} />
          </button>
        </MissionDialog>
      )}
      {checkpoint && checkpointOpen && (
        <MissionDialog label={t('mission.checkpointTag')} closable={false}>
          <MissionCheckpoint checkpoint={checkpoint} fill={fill} scene={mission.scene} onDone={(answer) => {
            // la station est accueillie par son point d'étape : pas de carte « أنت هنا » en plus au retour
            update({ answered: { [checkpoint.id]: answer }, seen: { [String(moduleNumber)]: true } });
            setCheckpointOpen(false);
          }} />
        </MissionDialog>
      )}
    </>
  );
}
