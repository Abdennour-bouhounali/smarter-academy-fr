import { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Eye, Gamepad2, Heart, Lock, MonitorPlay, Swords, Fuel, Settings2 } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import {
  adjustStudentHearts, fetchClassMadarItems, fetchClassMadarResults, fetchClassMadarSettings, setClassMadarItemLimit, setStudentMadarGames, updateClassMadarSettings,
} from '../../../services/teacher/madarService';
import { Loading, ErrorBox, btnPrimary, btnSecondary, input, Fold } from '../../../pages/teacher/teacherUi';
import Modal from '../../../components/admin/ui/Modal';
import { Toggle } from '../dailyChallenge/ClassChallengeSettings';
import ShipIcon from '../../madar/components/ShipIcon';
import { formatScore } from '../../madar/madarModel';
import { SUB_LETTERS } from '../../madar/components/SniperHud';
import MathLabel from '../../../lessons/common/components/MathLabel';
import RichText from '../../practice/RichText';

const GAMES = ['orbit', 'defense', 'explorer', 'sniper', 'odd', 'mental'];
const percent = (x) => (x == null ? '—' : `${Math.round(x * 100)}%`);
const fullName = (s) => [s.firstName, s.lastName].filter(Boolean).join(' ');

function Settings({ classGroupId, initial, options, onSaved }) {
  const { t } = useTranslation('madar');
  const { token } = useContext(AuthContext);
  const [s, setS] = useState(initial);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const set = (key) => (v) => { setSaved(false); setS((cur) => ({ ...cur, [key]: v })); };
  const toggleLesson = (code) => set('lessonCodes')(s.lessonCodes.includes(code) ? s.lessonCodes.filter((c) => c !== code) : [...s.lessonCodes, code]);
  const setLimit = (d, v) => set('timeLimits')({ ...s.timeLimits, [d]: v });

  const save = async (event) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const data = await updateClassMadarSettings(token, classGroupId, {
        enabled: s.enabled,
        competitionEnabled: s.competitionEnabled,
        dailyFreeHearts: Number(s.dailyFreeHearts),
        dailyRunCap: Number(s.dailyRunCap),
        lessonCodes: s.lessonCodes,
        disabledGames: s.disabledGames ?? [],
        timeLimits: Object.fromEntries(Object.entries(s.timeLimits).map(([d, v]) => [d, Number(v)])),
      });
      setS(data.settings);
      setSaved(true);
      onSaved?.();
    } catch (e) {
      setError(t(`teacher.settings.errors.${e?.reason ?? 'generic'}`, { defaultValue: t('teacher.settings.errors.generic') }));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-3xl" data-madar-settings>
      <div className="mt-2 divide-y divide-slate-100">
        <Toggle name="enabled" checked={s.enabled} onChange={set('enabled')} label={t('teacher.settings.enabled')} />
        <Toggle name="competitionEnabled" checked={s.competitionEnabled} onChange={set('competitionEnabled')} label={t('teacher.settings.competition')} disabled={!s.enabled} />
        <fieldset className="py-3" data-setting="games">
          <legend className="font-inter text-sm font-semibold text-slate-900">{t('teacher.games.enabled')}</legend>
          <div className="mt-1 flex flex-wrap gap-3">
            {(options.games ?? GAMES).map((g) => {
              const on = !(s.disabledGames ?? []).includes(g);
              return (
                <label key={g} className="flex items-center gap-2 font-inter text-sm text-slate-700">
                  <input type="checkbox" checked={on} disabled={!s.enabled}
                    onChange={() => set('disabledGames')(on ? [...(s.disabledGames ?? []), g] : (s.disabledGames ?? []).filter((x) => x !== g))} />
                  {t(`teacher.games.${g}`)}
                </label>
              );
            })}
          </div>
        </fieldset>
        <label className="block py-3">
          <span className="font-inter text-sm font-semibold text-slate-900">{t('teacher.settings.dailyHearts')}</span>
          <span className="mt-0.5 block font-inter text-xs text-slate-500">{t('teacher.settings.dailyHeartsHelp')}</span>
          <input type="number" min={0} max={options.maxHearts} value={s.dailyFreeHearts} onChange={(e) => set('dailyFreeHearts')(e.target.value)} className={`${input} mt-2 w-28`} dir="ltr" data-setting="dailyFreeHearts" />
        </label>
        <label className="block py-3">
          <span className="font-inter text-sm font-semibold text-slate-900">{t('teacher.settings.runCap')}</span>
          <input type="number" min={options.runCapRange[0]} max={options.runCapRange[1]} value={s.dailyRunCap} onChange={(e) => set('dailyRunCap')(e.target.value)} className={`${input} mt-2 w-28`} dir="ltr" data-setting="dailyRunCap" />
        </label>
        <fieldset className="py-3" data-setting="timeLimits">
          <legend className="font-inter text-sm font-semibold text-slate-900">{t('teacher.settings.timeLimits')}</legend>
          <p className="mt-0.5 font-inter text-xs text-slate-500">{t('teacher.settings.timeLimitsHelp')}</p>
          <div className="mt-2 grid max-w-md grid-cols-5 gap-1.5">
            {Object.keys(s.timeLimits).map((d) => (
              <label key={d} className="text-center">
                <span className="block font-inter text-[11px] text-slate-500">{t('teacher.settings.difficulty', { n: d })}</span>
                <input type="number" min={options.timeLimitRange[0]} max={options.timeLimitRange[1]} value={s.timeLimits[d]}
                  onChange={(e) => setLimit(d, e.target.value)} className={`${input} mt-1 w-full text-center`} style={{ paddingInline: 4 }} dir="ltr" />
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="py-3">
          <legend className="font-inter text-sm font-semibold text-slate-900">{t('teacher.settings.lessons')}</legend>
          <p className="mt-0.5 font-inter text-xs text-slate-500">{t('teacher.settings.lessonsHelp')}</p>
          <div className="mt-2 max-h-56 space-y-1 overflow-y-auto pe-1">
            <label className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
              <input type="checkbox" checked={s.lessonCodes.length === 0} onChange={() => set('lessonCodes')([])} />
              <span className="font-inter text-sm font-semibold text-slate-700">{t('teacher.settings.allLessons')}</span>
            </label>
            {options.lessons.map((l) => (
              <label key={l.code} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                <input type="checkbox" checked={s.lessonCodes.includes(l.code)} onChange={() => toggleLesson(l.code)} />
                <span className="font-inter text-sm text-slate-700"><MathLabel>{l.title}</MathLabel></span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      {error && <p role="alert" className="mt-2 rounded-xl bg-rose-50 p-2 text-sm text-rose-800">{error}</p>}
      <div className="mt-3 flex items-center gap-3">
        <button type="submit" className={btnPrimary} disabled={pending}>{t('teacher.settings.save')}</button>
        {saved && <span role="status" className="font-inter text-sm text-nav-accent">{t('teacher.settings.saved')}</span>}
      </div>
    </form>
  );
}

/**
 * Donner ou retirer des cœurs : un effort montré en classe (ou hors de la
 * plateforme), une triche constatée. Le motif est obligatoire, le mot à
 * l'élève facultatif ; l'élève les lit à sa prochaine visite.
 */
function HeartsDialog({ classGroupId, student, maxHearts, maxDelta, onClose, onDone }) {
  const { t } = useTranslation('madar');
  const { token } = useContext(AuthContext);
  const [direction, setDirection] = useState('give');
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState('effort');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const pickDirection = (d) => {
    setDirection(d);
    setReason(d === 'give' ? 'effort' : 'cheating');
  };

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await adjustStudentHearts(token, classGroupId, {
        studentId: student.student.id, delta: direction === 'give' ? amount : -amount, reason, note: note.trim() || null,
      });
      onDone();
    } catch (e) {
      setError(t(`teacher.hearts.errors.${e?.reason ?? 'generic'}`, { defaultValue: t('teacher.hearts.errors.generic') }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={() => (busy ? null : onClose())} title={t('teacher.hearts.title', { name: fullName(student.student) })}>
      <div className="space-y-4" data-hearts-dialog>
        <p className="font-inter text-sm text-slate-600">{t('teacher.hearts.current', { n: student.hearts, max: maxHearts })}</p>
        <div className="grid grid-cols-2 gap-2" role="radiogroup">
          {['give', 'take'].map((d) => (
            <button key={d} type="button" role="radio" aria-checked={direction === d} onClick={() => pickDirection(d)}
              className={`min-h-[44px] rounded-xl font-inter text-sm font-bold ring-1 ${direction === d ? (d === 'give' ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-rose-600 text-white ring-rose-600') : 'bg-white text-slate-700 ring-slate-200'}`}>
              {t(`teacher.hearts.${d}`)}
            </button>
          ))}
        </div>
        <label className="block">
          <span className="font-inter text-sm font-semibold text-slate-800">{t('teacher.hearts.amount')}</span>
          <input type="number" min={1} max={maxDelta} value={amount} onChange={(e) => setAmount(Math.max(1, Math.min(maxDelta, Number(e.target.value) || 1)))} className={`${input} mt-1 w-24`} dir="ltr" />
        </label>
        <fieldset>
          <legend className="font-inter text-sm font-semibold text-slate-800">{t('teacher.hearts.reason')}</legend>
          <div className="mt-1 space-y-1">
            {['effort', 'cheating', 'other'].map((r) => (
              <label key={r} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                <input type="radio" name="madar-heart-reason" checked={reason === r} onChange={() => setReason(r)} />
                <span className="font-inter text-sm text-slate-700">{t(`teacher.hearts.reasons.${r}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block">
          <span className="font-inter text-sm font-semibold text-slate-800">{t('teacher.hearts.note')}</span>
          <input type="text" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('teacher.hearts.notePlaceholder')} className={`${input} mt-1 w-full`} />
        </label>
        {error && <p role="alert" className="rounded-xl bg-rose-50 p-2 text-sm text-rose-800">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className={btnSecondary} onClick={onClose} disabled={busy}>{t('teacher.hearts.cancel')}</button>
          <button type="button" className={btnPrimary} onClick={confirm} disabled={busy} data-action="confirm-hearts">{t('teacher.hearts.confirm')}</button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Les jeux d'UN élève : l'enseignant en ferme un (ou plusieurs) pour lui seul.
 * Un jeu fermé pour toute la classe reste fermé ici (case grisée) : ce
 * réglage-ci s'y ajoute, il ne le remplace pas.
 */
function StudentGamesDialog({ classGroupId, student, options, classDisabled, onClose, onDone }) {
  const { t } = useTranslation('madar');
  const { token } = useContext(AuthContext);
  const [closed, setClosed] = useState(student.disabledGames ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const games = options.games ?? GAMES;
  const categories = options.gameCategories ?? {};

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await setStudentMadarGames(token, classGroupId, student.student.id, closed);
      onDone();
    } catch (e) {
      setError(t(`teacher.studentGames.errors.${e?.reason ?? 'generic'}`, { defaultValue: t('teacher.studentGames.errors.generic') }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={() => (busy ? null : onClose())} title={t('teacher.studentGames.title', { name: fullName(student.student) })}>
      <div className="space-y-4" data-student-games-dialog>
        <p className="font-inter text-sm text-slate-600">{t('teacher.studentGames.help')}</p>
        {['math', 'fun'].map((cat) => {
          const list = games.filter((g) => (categories[g] ?? 'fun') === cat);
          if (!list.length) return null;
          return (
            <fieldset key={cat}>
              <legend className="font-inter text-sm font-semibold text-slate-800">{t(`hub.categories.${cat}.title`)}</legend>
              <div className="mt-1 space-y-1">
                {list.map((g) => {
                  const byClass = classDisabled.includes(g);
                  const open = !byClass && !closed.includes(g);
                  return (
                    <label key={g} className={`flex items-center justify-between gap-2 rounded-lg px-2 py-2 ${byClass ? 'opacity-60' : 'hover:bg-slate-50'}`} data-student-game={g}>
                      <span className="flex items-center gap-2 font-inter text-sm text-slate-700">
                        <input type="checkbox" checked={open} disabled={byClass || busy}
                          onChange={() => setClosed((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]))} />
                        {t(`teacher.games.${g}`)}
                      </span>
                      <span className="font-inter text-xs text-slate-500">
                        {byClass ? t('teacher.studentGames.closedForClass') : open ? t('teacher.studentGames.open') : t('teacher.studentGames.closed')}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
        {error && <p role="alert" className="rounded-xl bg-rose-50 p-2 text-sm text-rose-800">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className={btnSecondary} onClick={onClose} disabled={busy}>{t('teacher.hearts.cancel')}</button>
          <button type="button" className={btnPrimary} onClick={save} disabled={busy} data-action="save-student-games">{t('teacher.studentGames.save')}</button>
        </div>
      </div>
    </Modal>
  );
}

/** Les questions servies à la classe : énoncé, statistiques, et le délai de CHACUNE. */
function Items({ classGroupId, range }) {
  const { t } = useTranslation('madar');
  const { token } = useContext(AuthContext);
  const [items, setItems] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setItems((await fetchClassMadarItems(token, classGroupId)).items);
    } catch (e) {
      setError(e.message);
    }
  }, [token, classGroupId]);
  useEffect(() => { load(); }, [load]);

  const save = async (itemKey, seconds) => {
    setError(null);
    try {
      await setClassMadarItemLimit(token, classGroupId, itemKey, seconds);
      setSaved(itemKey);
      setDrafts((d) => ({ ...d, [itemKey]: undefined }));
      load();
    } catch (e) {
      setError(t(`teacher.items.errors.${e?.reason ?? 'generic'}`, { defaultValue: t('teacher.items.errors.generic') }));
    }
  };

  return (
    <section data-madar-items>
      <p className="mt-0.5 font-inter text-xs text-slate-500">{t('teacher.items.subtitle')}</p>
      {error && <p role="alert" className="mt-2 rounded-xl bg-rose-50 p-2 text-sm text-rose-800">{error}</p>}
      {items === null && <Loading />}
      {items?.length === 0 && <p className="mt-4 text-center font-inter text-sm text-slate-500">{t('teacher.items.empty')}</p>}
      <ul className="mt-3 divide-y divide-slate-100">
        {items?.map((it) => {
          const draft = drafts[it.itemKey];
          return (
            <li key={it.itemKey} className="flex flex-wrap items-start gap-3 py-3" data-item={it.itemKey}>
              <div className="min-w-0 flex-1 basis-72">
                {it.learningPoint && <p className="font-inter text-[11px] font-semibold text-nav-accent"><MathLabel>{it.learningPoint}</MathLabel></p>}
                {it.statement && <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-800"><RichText>{it.statement}</RichText></p>}
                <p className="mt-1 font-inter text-xs text-slate-500">
                  <span className="me-2 rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-600">{t('teacher.items.difficulty', { n: it.difficulty ?? '—' })}</span>
                  {t('teacher.items.stats', { served: it.served, correct: it.correct, answered: it.answered, timeouts: it.timeouts })}
                  {it.avgSeconds != null && <> · {t('teacher.items.avg', { s: it.avgSeconds })}</>}
                </p>
              </div>
              <div className="flex items-end gap-2">
                <label className="text-center">
                  <span className="block font-inter text-[11px] text-slate-500">{t('teacher.items.limit')}{it.customized && <span className="ms-1 rounded bg-nav-page px-1 text-nav-accent">{t('teacher.items.custom')}</span>}</span>
                  <input type="number" min={range[0]} max={range[1]} value={draft ?? it.timeLimit} dir="ltr"
                    onChange={(e) => setDrafts((d) => ({ ...d, [it.itemKey]: e.target.value }))} className={`${input} mt-1 w-20 text-center`} />
                </label>
                <button type="button" className={btnSecondary} disabled={draft === undefined} onClick={() => save(it.itemKey, Number(draft))}>{t('teacher.items.save')}</button>
                {it.customized && <button type="button" className="font-inter text-xs text-slate-500 underline" onClick={() => save(it.itemKey, null)}>{t('teacher.items.reset', { s: it.difficultyLimit })}</button>}
                {saved === it.itemKey && <span role="status" className="font-inter text-xs text-nav-accent">{t('teacher.items.saved')}</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * L'onglet « Espace jeux » d'une classe : la semaine de la classe (qui joue, qui
 * fait le plein, avec quelle justesse, ce qui « mérite un regard »), les
 * cœurs donnés / retirés, les questions et leur délai, les réglages, et
 * l'écran du tableau. Chargé à la demande avec le catalogue `madar`.
 */
export default function MadarTab({ classGroup }) {
  const { t } = useTranslation('madar');
  const { token } = useContext(AuthContext);
  const [week, setWeek] = useState(null);
  const [game, setGame] = useState('orbit');
  const [results, setResults] = useState(null);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);
  const [adjusting, setAdjusting] = useState(null);
  const [gamesFor, setGamesFor] = useState(null);
  const [everyStudent, setEveryStudent] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [r, s] = await Promise.all([
        fetchClassMadarResults(token, classGroup.id, week, game),
        fetchClassMadarSettings(token, classGroup.id),
      ]);
      setResults(r);
      setSettings(s);
    } catch (e) {
      setError(e.message);
    }
  }, [token, classGroup.id, week, game]);
  useEffect(() => { if (token) load(); }, [token, load]);

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!results || !settings) return <Loading />;

  const isDefense = results.game === 'defense';
  const isExplorer = results.game === 'explorer';
  // Les jeux de mathématiques montrent la manche et le niveau de chaque élève.
  const isSniper = ['sniper', 'odd', 'mental'].includes(results.game);
  const { summary, students, adjustments } = results;
  // Who PLAYED this week first; a class where nobody played shows one line, not a table of zeros.
  const players = students.filter((row) => row.runs > 0 || row.weekBest != null || row.alerts.length > 0);
  const shownStudents = everyStudent ? students : players;
  const tiles = [
    ['players', `${summary.players}\u00A0/\u00A0${results.members}`],
    ['runs', summary.runs],
    ['refuel', summary.refuelAnswered],
    ['accuracy', percent(summary.refuelAccuracy)],
  ];

  return (
    <div className="space-y-5" data-madar-tab>
      <div className="flex flex-wrap items-center gap-3" title={t('teacher.intro')}>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <div className="flex max-w-full overflow-x-auto rounded-xl border border-nav-line bg-white p-0.5 [scrollbar-width:none]" role="tablist" aria-label={t('teacher.games.label')}>
            {(settings.options.games ?? GAMES).map((g) => (
              <button key={g} type="button" role="tab" aria-selected={game === g} onClick={() => setGame(g)} data-teacher-game={g}
                className={`min-h-[40px] shrink-0 rounded-lg px-3 font-inter text-sm font-bold ${game === g ? 'bg-nav-accent-soft text-nav-accent' : 'text-nav-muted hover:text-nav-ink'}`}>
                {t(`teacher.games.${g}`)}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 font-inter text-sm text-slate-600">
            {t('teacher.week')}
            <select value={results.week} onChange={(e) => setWeek(e.target.value)} className={`${input} w-auto`} dir="ltr" data-week-select>
              {results.weeks.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </label>
          <Link to={`/enseignant/classes/${classGroup.id}/jeux/affichage?week=${results.week}&game=${results.game}`} className={btnSecondary} data-action="display">
            <MonitorPlay size={16} aria-hidden="true" /> {t('teacher.display')}
          </Link>
        </div>
      </div>

      {/* « Défie ton professeur » : l'enseignant joue avec CETTE classe ; sa place dans le classement de la semaine. */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-nav-line bg-white p-4" data-teacher-play-card>
        <Swords size={20} className="text-nav-accent" aria-hidden="true" />
        <p className="min-w-0 flex-1 font-inter text-sm font-semibold text-slate-800" data-teacher-standing>
          {results.teacher
            ? t('teacherPlay.standing', { rank: results.teacher.rank, best: formatScore(results.teacher.best) })
            : t('teacherPlay.notYet')}
        </p>
        <Link to={`/enseignant/classes/${classGroup.id}/jeux`} className={btnSecondary} data-action="teacher-play">
          <Gamepad2 size={16} aria-hidden="true" /> {t('teacherPlay.cta')}
        </Link>
      </div>

      {/* Les réglages passent SOUS le tableau jusqu'à 1536 px : à 1366 px, une colonne latérale
          repoussait « À regarder » et « les cœurs » hors de l'écran. */}
      <div className="space-y-4">
        <div className="min-w-0 space-y-4">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-2xl border border-nav-line bg-white p-4 sm:grid-cols-4">
            {tiles.map(([key, value]) => (
              <div key={key}>
                <dt className="font-inter text-xs font-bold text-nav-muted">{t(`teacher.summary.${key}`)}</dt>
                <dd className="font-space text-2xl font-bold text-nav-ink" dir="ltr">{value}</dd>
              </div>
            ))}
          </dl>

          {summary.alerts > 0 && (
            <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 font-inter text-sm text-amber-900" role="status" data-alerts-summary>
              <Eye size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span><strong>{t('teacher.alerts.count', { n: summary.alerts })}</strong> · {t('teacher.alerts.help')}</span>
            </p>
          )}

          <div className="rounded-2xl border border-nav-line bg-white overflow-x-auto p-0">
            {summary.players === 0 && <p className="p-6 text-center font-inter text-sm font-semibold text-nav-muted">{t('teacher.empty')}</p>}
            {shownStudents.length > 0 && (
              <table className="w-full min-w-[820px] text-start font-inter text-sm" data-madar-students>
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-3 py-3 text-start font-semibold">{t('teacher.table.rank')}</th>
                    <th className="px-3 py-3 text-start font-semibold">{t('teacher.table.student')}</th>
                    <th className="px-3 py-3 text-start font-semibold">{t('teacher.table.weekBest')}</th>
                    {isDefense && <th className="px-3 py-3 text-start font-semibold">{t('teacher.table.weekWave')}</th>}
                    {isSniper && <th className="px-3 py-3 text-start font-semibold">{t('teacher.table.weekRound')}</th>}
                    {isSniper && <th className="px-3 py-3 text-start font-semibold">{t('teacher.table.mathLevel')}</th>}
                    {isExplorer && <th className="px-3 py-3 text-start font-semibold">{t('teacher.table.levelStars')}</th>}
                    {isExplorer && <th className="px-3 py-3 text-start font-semibold">{t('teacher.table.levelsCompleted')}</th>}
                    <th className="px-3 py-3 text-start font-semibold">{t('teacher.table.runs')}</th>
                    <th className="px-3 py-3 text-start font-semibold">{t('teacher.table.refuel')}</th>
                    <th className="px-3 py-3 text-start font-semibold">{t('teacher.table.alerts')}</th>
                    <th className="px-3 py-3 text-start font-semibold">{t('teacher.table.hearts')}</th>
                    <th className="px-3 py-3 text-start font-semibold">{t('teacher.table.games')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shownStudents.map((row) => (
                    <tr key={row.student.id} className={row.alerts.length ? 'bg-amber-50/40' : ''} data-student-row={row.student.id}>
                      <td className="px-3 py-3 font-space font-bold" dir="ltr">{row.rank ?? t('teacher.table.none')}</td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-2 font-semibold text-slate-800">
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900"><ShipIcon id={row.ship} size={26} /></span>
                          <bdi>{fullName(row.student)}</bdi>
                        </span>
                      </td>
                      <td className="px-3 py-3 font-space font-bold" dir="ltr">{row.weekBest != null ? formatScore(row.weekBest) : t('teacher.table.none')}</td>
                      {isDefense && <td className="px-3 py-3 font-space font-bold" dir="ltr">{row.weekWave ?? t('teacher.table.none')}</td>}
                      {isSniper && <td className="px-3 py-3 font-space font-bold" dir="ltr">{row.weekWave ?? t('teacher.table.none')}</td>}
                      {isSniper && (
                        <td className="px-3 py-3" data-math-level>
                          {row.mathLevel ? (
                            <span className="font-inter text-sm">
                              <b className="font-space">{t('sniper.hud.level', { n: row.mathLevel.level, sub: SUB_LETTERS[row.mathLevel.sub - 1] })}</b>
                              <span className="ms-1 text-xs text-slate-500">{t('teacher.table.mathBest', { n: row.mathLevel.bestLevel })}</span>
                            </span>
                          ) : t('teacher.table.none')}
                        </td>
                      )}
                      {isExplorer && <td className="px-3 py-3 font-space font-bold" dir="ltr">★ {row.levelStars ?? 0}</td>}
                      {isExplorer && <td className="px-3 py-3" dir="ltr">{row.levelsCompleted ?? 0} / 12</td>}
                      <td className="px-3 py-3" dir="ltr">{row.runs}</td>
                      <td className="px-3 py-3" dir="ltr">{row.refuelCorrect}{'\u00A0/\u00A0'}{row.refuelAnswered}</td>
                      <td className="px-3 py-3">
                        <span className="flex flex-wrap gap-1">
                          {row.alerts.map((a) => (
                            <span key={a} title={t(`teacher.alerts.${a}`)} className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900" data-alert={a}>
                              <AlertTriangle size={11} aria-hidden="true" /> {t(`teacher.alerts.short.${a}`)}
                              <span className="sr-only">: {t(`teacher.alerts.${a}`)}</span>
                            </span>
                          ))}
                          {row.alerts.length === 0 && <span className="text-slate-300">—</span>}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <button type="button" onClick={() => setAdjusting(row)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-rose-50" data-action="adjust-hearts">
                          <Heart size={14} className="text-rose-500" aria-hidden="true" /> <span dir="ltr">{row.hearts}</span> ±
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <button type="button" onClick={() => setGamesFor(row)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-50" data-action="student-games">
                          {(row.disabledGames ?? []).length > 0
                            ? <><Lock size={14} className="text-amber-600" aria-hidden="true" /> {t('teacher.studentGames.closedCount', { count: row.disabledGames.length })}</>
                            : <><Gamepad2 size={14} className="text-nav-accent" aria-hidden="true" /> {t('teacher.studentGames.allOpen')}</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {players.length < students.length && (
            <button type="button" onClick={() => setEveryStudent((value) => !value)} className="min-h-[40px] font-inter text-sm font-bold text-nav-accent hover:underline" data-madar-every-student>
              {everyStudent ? t('teacher.table.playersOnly') : t('teacher.table.everyStudent', { count: students.length })}
            </button>
          )}

          {/* The hearts history shows only when there IS one: an empty box said nothing. */}
          {adjustments.length > 0 && (
          <section className="rounded-2xl border border-nav-line bg-white p-5" data-madar-adjustments>
            <h3 className="font-space text-base font-bold text-slate-900">{t('teacher.hearts.history')}</h3>
            {(
              <ul className="mt-2 divide-y divide-slate-100">
                {adjustments.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center gap-2 py-2 font-inter text-sm">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-black ${a.applied > 0 ? 'bg-emerald-50 text-emerald-700' : a.applied < 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`} dir="ltr">
                      {a.applied > 0 ? `+${a.applied}` : a.applied} ❤
                    </span>
                    <bdi className="font-semibold text-slate-800">{fullName(a.student)}</bdi>
                    <span className="text-slate-500">· {t(`teacher.hearts.reasons.${a.reason}`)}</span>
                    {a.note && <span className="text-slate-500">« <bdi>{a.note}</bdi> »</span>}
                    <span className="ms-auto text-xs text-slate-400">{a.seen ? t('teacher.hearts.seen') : t('teacher.hearts.unseen')}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          )}

          <Fold name="madar-items" icon={Fuel} title={t('teacher.items.title')}>
            <Items classGroupId={classGroup.id} range={settings.options.timeLimitRange} />
          </Fold>
          <Fold name="madar-settings" icon={Settings2} title={t('teacher.settings.title')}>
            <Settings classGroupId={classGroup.id} initial={settings.settings} options={settings.options} onSaved={load} />
          </Fold>
        </div>
      </div>

      {gamesFor && (
        <StudentGamesDialog
          classGroupId={classGroup.id}
          student={gamesFor}
          options={settings.options}
          classDisabled={settings.settings.disabledGames ?? []}
          onClose={() => setGamesFor(null)}
          onDone={() => { setGamesFor(null); load(); }}
        />
      )}
      {adjusting && (
        <HeartsDialog
          classGroupId={classGroup.id}
          student={adjusting}
          maxHearts={settings.options.maxHearts}
          maxDelta={settings.options.maxAdjustment}
          onClose={() => setAdjusting(null)}
          onDone={() => { setAdjusting(null); load(); }}
        />
      )}
    </div>
  );
}
