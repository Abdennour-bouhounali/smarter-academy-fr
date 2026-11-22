import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Map as MapIcon } from 'lucide-react';
import { useLessonKnowledge } from '../knowledge/KnowledgeProvider';
import { useNotebook } from '../../../features/practice/notebook/NotebookProvider';
import { toolLit, showStars } from './missionModel';

/**
 * La BARRE DE MISSION, en tête de chaque module : la mission (un geste ouvre son énoncé), les outils — gagnés ou
 * encore fermés —, l'avancement, et la carte. Une seule ligne : elle rappelle le but sans le relire.
 */
export default function MissionBar({ mission, tools, stations, stars = 0, onOpenMap, onOpenMission }) {
  const { t } = useTranslation('lesson');
  const { t: ts } = useTranslation('student');
  // « 🧠 بطاقتي » et « 📓 كرّاسي » (propriétaire, 2026-11-08) : les boutons flottants de la leçon sont SOUS le lecteur ; la barre,
  // toujours visible, les remet à portée (règle « réduire, jamais supprimer »). La carte (z-40) et le cahier (z-71) s'ouvrent
  // par-dessus le lecteur (z-35) ; le cahier garde la position publiée par LessonNotebookAnchor.
  const { openMap, lessonId } = useLessonKnowledge();
  const notebook = useNotebook();
  const { token } = useContext(AuthContext) ?? {};
  const reduced = useReducedMotion();
  // UN OUTIL GAGNÉ SOUS LES YEUX de l'élève vole jusqu'à sa place (les outils déjà là au montage ne volent pas).
  const known = useRef(null);
  const [flight, setFlight] = useState(null); // { id, icon, from, to }
  const [glow, setGlow] = useState(null);
  useEffect(() => {
    // « allumé » = gagné — ou, pour des clés possédées d'emblée (`mission.toolsOwned`), UTILISÉ : la clé vole quand elle vient de servir
    const earned = tools.filter(toolLit).map((x) => x.id);
    if (known.current === null) { known.current = new Set(earned); return; }
    const fresh = tools.find((x) => toolLit(x) && !known.current.has(x.id));
    earned.forEach((id) => known.current.add(id));
    if (!fresh) return;
    setGlow(fresh.id);
    const slot = document.querySelector(`[data-mission-bar] [data-mission-tool="${fresh.id}"]`)?.getBoundingClientRect();
    if (!reduced && slot) {
      setFlight({ id: fresh.id, icon: fresh.icon, from: { x: window.innerWidth / 2 - 24, y: window.innerHeight / 2 - 24 }, to: { x: slot.left + slot.width / 2 - 24, y: slot.top + slot.height / 2 - 24 } });
    }
  }, [tools, reduced]);
  const done = stations.filter((s) => s.status === 'mastered').length;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl xl:gap-3 bg-gradient-to-l from-indigo-950 to-violet-900 px-4 py-2.5 text-white shadow-sm" data-mission-bar>
      <button type="button" onClick={onOpenMission}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-2 font-extrabold hover:bg-white/10" data-mission-open-text>
        <span aria-hidden="true">📚</span>
        <span className="text-xs font-bold text-indigo-200">{t('mission.tag')}</span>
        <span>{mission.title}</span>
      </button>
      <div className="flex items-center gap-1 xl:gap-1.5" role="list" aria-label={t('mission.tools')} data-mission-tools>
        {tools.map((tool) => ('used' in tool ? (
          // clé POSSÉDÉE (synthèse) : jamais 🔒 ni grisée — utilisée = pastille pleine + ✓ ; pas encore = simple anneau, l'icône intacte
          <span key={tool.id} role="listitem" data-mission-tool={tool.id} data-earned="true" data-used={tool.used ? 'true' : 'false'}
            title={`${tool.label} — ${t(tool.used ? 'mission.toolUsed' : 'mission.toolOwned')}`}
            aria-label={`${tool.label} — ${t(tool.used ? 'mission.toolUsed' : 'mission.toolOwned')}`}
            className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full text-lg ring-2 xl:h-10 xl:w-10 transition-colors motion-reduce:transition-none ${tool.used ? 'bg-amber-300 ring-amber-200' : 'bg-transparent ring-white/70'} ${glow === tool.id ? 'sa-mission-earned' : ''}`}>
            <span aria-hidden="true">{tool.icon}</span>
            {tool.used && <span aria-hidden="true" className="absolute -bottom-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-black text-white ring-1 ring-white">✓</span>}
          </span>
        ) : (
          <span key={tool.id} role="listitem" data-mission-tool={tool.id} data-earned={tool.earned ? 'true' : 'false'}
            title={`${tool.label} — ${t(tool.earned ? 'mission.toolEarned' : 'mission.toolLocked')}`}
            aria-label={`${tool.label} — ${t(tool.earned ? 'mission.toolEarned' : 'mission.toolLocked')}`}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-lg ring-2 xl:h-10 xl:w-10 transition-colors motion-reduce:transition-none ${tool.earned ? 'bg-amber-300 ring-amber-200' : 'bg-white/10 ring-white/20 grayscale opacity-60'} ${glow === tool.id ? 'sa-mission-earned' : ''}`}>
            {tool.icon}
          </span>
        )))}
      </div>
      {/* sous 1280 px la barre doit tenir sur UNE ligne malgré « بطاقتي / كرّاسي » : boutons en icône, « n من 8 » replié (il
          reste lisible dans « الخريطة », le chemin de la mission) */}
      <div className="flex items-center gap-2 xl:gap-3">
        {/* les étoiles gagnées dans les manches des labos (LabRounds) */}
        {showStars(mission, stars) && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-300/20 px-3 py-1 text-sm font-black text-amber-200" data-mission-stars={stars} aria-label={t('mission.stars', { count: stars })}>
          <span aria-hidden="true">⭐</span><span dir="ltr">{stars}</span>
        </span>
        )}
        <span className="hidden text-sm font-bold text-indigo-200 xl:inline" dir="rtl">{t('mission.progress', { done, total: stations.length })}</span>
        {lessonId && (
          <button type="button" onClick={() => openMap({ expanded: true })} data-mission-open-knowledge title={t('map.myMapShort')} aria-label={t('map.myMapShort')}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-white/10 px-3 text-sm font-black text-white ring-1 ring-white/25 hover:bg-white/20">
            <span aria-hidden="true">🧠</span> <span className="hidden xl:inline">{t('map.myMapShort')}</span>
          </button>
        )}
        {token && notebook?.openNotebook && (
          <button type="button" onClick={() => notebook.openNotebook()} data-mission-open-notebook title={ts('notebook.window.myNotebookShort')} aria-label={ts('notebook.window.myNotebookShort')}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-white/10 px-3 text-sm font-black text-white ring-1 ring-white/25 hover:bg-white/20">
            <span aria-hidden="true">📓</span> <span className="hidden xl:inline">{ts('notebook.window.myNotebookShort')}</span>
          </button>
        )}
        <button type="button" onClick={onOpenMap} data-mission-open-map
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white px-3 text-sm font-black text-indigo-950 hover:bg-indigo-50">
          <MapIcon className="h-4 w-4" aria-hidden="true" /> {t('mission.map')}
        </button>
      </div>
      {flight && createPortal(
        <motion.span aria-hidden="true" data-mission-flight={flight.id}
          className="pointer-events-none fixed left-0 top-0 z-[320] flex h-12 w-12 items-center justify-center rounded-full bg-amber-300 text-2xl shadow-xl ring-4 ring-amber-200"
          initial={{ x: flight.from.x, y: flight.from.y, scale: 2.2, opacity: 0 }}
          animate={{ x: [flight.from.x, flight.from.x, flight.to.x], y: [flight.from.y, flight.from.y - 30, flight.to.y], scale: [2.2, 2.4, 1], opacity: [0, 1, 1] }}
          transition={{ duration: 1.1, times: [0, 0.35, 1], ease: 'easeInOut' }}
          onAnimationComplete={() => setFlight(null)}>
          {flight.icon}
        </motion.span>,
        document.body,
      )}
    </div>
  );
}
