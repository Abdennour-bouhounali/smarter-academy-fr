/**
 * « séance en classe » — what the teacher prepares before the hour (CLASS_SESSION.md): the SEATING MAP of the class (who sits
 * where, the teams) and the TEST of the lesson (the platform's default, his own copy, his own questions).
 * An adult's screen: calm, nothing to learn before using it, every action undoable.
 */
import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2, Pencil, Users, Minus, Check } from 'lucide-react';
import MathText from '../../lessons/common/components/MathText';
import {
  teamsOf,
  teamOfStudent,
  moveSeat,
  reflow,
  customTeams,
  lineTeams,
  nextTeam,
  nextGender,
  renameTeam,
  rowCount,
  callName,
} from './session';

export const L = {
  board: 'Le tableau',
  seatHint:
    'Cliquez sur un élève, puis sur la place où il va. Au test, le tour suit les places en partant du tableau. Chaque rangée (du tableau au fond de la salle) forme une équipe.',
  perRow: 'Nombre de rangées',
  teams: 'Les équipes',
  byRows: 'Une équipe par rangée',
  own: 'Mes équipes',
  teamCount: 'Nombre d’équipes',
  gender: { m: 'G', f: 'F', none: '?' },
  genderHint:
    'G / F (garçon / fille) : pour accorder la phrase (« déçu » ou « déçue ») et pour le personnage du podium. Rien n’est deviné à partir du prénom.',
  teamHint: 'Cliquez sur la couleur de l’équipe pour faire passer l’élève dans l’équipe suivante.',
  start: 'Test de début',
  end: 'Test de fin',
  fromPlatform: 'La plateforme',
  mine: 'Question du professeur',
  add: 'Ajouter une question prête',
  write: 'Écrire ma question',
  save: 'Enregistrer mon test',
  reset: 'Revenir au test d’origine',
  resetAsk: 'Revenir au test d’origine de la plateforme ? Votre version sera supprimée.',
  yes: 'Oui',
  no: 'Annuler',
  saved: 'Enregistré',
  edited: 'Modifications non enregistrées',
  usingMine: 'C’est votre version',
  usingDefault: 'C’est le test de la plateforme',
  noPool: 'Toutes les questions prêtes sont déjà utilisées.',
  kind: { choice: 'Choix', truefalse: 'Vrai / faux', number: 'Nombre' },
  text: 'Texte de la question',
  option: 'Choix',
  right: 'La bonne réponse',
  true: 'Vrai',
  false: 'Faux',
  responsibility:
    'Vous êtes responsable de l’exactitude de cette question : la plateforme ne vérifie pas les questions que vous écrivez.',
  ok: 'Ajouter la question',
  update: 'Modifier la question',
  cancel: 'Annuler',
  empty: 'Aucune question pour l’instant. Ajoutez une question prête ou écrivez la vôtre.',
  mathTip: 'Pour écrire des mathématiques, placez l’expression entre deux signes $ — exemple : $48 = 6 \\times 8$',
};

const shortName = (s) => `${callName(s)}${s.lastName ? ` ${String(s.lastName).trim()[0]}.` : ''}`;

/** The classroom drawn from above: the board on top, desks in rows. Tap a student, then the desk he moves to. */
export function SeatingMap({ students, seating, onChange }) {
  const [held, setHeld] = useState(null);
  const byId = Object.fromEntries(students.map((s) => [s.id, s]));
  const teams = teamsOf(seating, students);
  const own = Array.isArray(seating.teams) && seating.teams.length > 0;
  const rows = rowCount(seating);
  const at = (r, c) => seating.seats.find((s) => s.r === r && s.c === c && byId[s.student]);
  const tap = (r, c) => {
    const seat = at(r, c);
    if (held == null) {
      if (seat) setHeld(seat.student);
      return;
    }
    onChange(moveSeat(seating, held, r, c));
    setHeld(null);
  };
  return (
    <div className="cs-seating" data-cs-seating>
      <div className="cs-seating__bar">
        <label>
          {L.perRow}
          <span className="cs-stepper">
            <button
              type="button"
              onClick={() => onChange(reflow(seating, students, Math.max(2, seating.cols - 1)))}
              aria-label="−1"
              data-cs-cols-minus
            >
              <Minus size={16} />
            </button>
            <b dir="ltr" data-cs-cols={seating.cols}>
              {seating.cols}
            </b>
            <button
              type="button"
              onClick={() => onChange(reflow(seating, students, Math.min(10, seating.cols + 1)))}
              aria-label="+1"
              data-cs-cols-plus
            >
              <Plus size={16} />
            </button>
          </span>
        </label>
        <div className="cs-seg" role="group" aria-label={L.teams}>
          <button
            type="button"
            className={own ? '' : 'is-on'}
            onClick={() => onChange(lineTeams(seating))}
            data-cs-teams="lines"
          >
            {L.byRows}
          </button>
          <button
            type="button"
            className={own ? 'is-on' : ''}
            onClick={() => {
              if (!own) onChange(customTeams(seating, students, Math.max(3, teams.length)));
            }}
            data-cs-teams="own"
          >
            {L.own}
          </button>
        </div>
        {own && (
          <label>
            {L.teamCount}
            <span className="cs-stepper">
              <button
                type="button"
                onClick={() => onChange(customTeams(seating, students, seating.teams.length - 1))}
                aria-label="−1"
                data-cs-teamcount-minus
              >
                <Minus size={16} />
              </button>
              <b dir="ltr" data-cs-teamcount={seating.teams.length}>
                {seating.teams.length}
              </b>
              <button
                type="button"
                onClick={() => onChange(customTeams(seating, students, seating.teams.length + 1))}
                aria-label="+1"
                data-cs-teamcount-plus
              >
                <Plus size={16} />
              </button>
            </span>
          </label>
        )}
      </div>
      <div className="cs-room">
        <div className="cs-board">{L.board}</div>
        <div className="cs-desks" style={{ gridTemplateColumns: `repeat(${seating.cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: rows * seating.cols }, (_, k) => {
            const r = Math.floor(k / seating.cols);
            const c = k % seating.cols;
            const seat = at(r, c);
            const st = seat ? byId[seat.student] : null;
            const team = st ? teamOfStudent(teams, st.id) : null;
            const g = st ? (seating.genders?.[st.id] ?? null) : null;
            return (
              <div
                key={k}
                className={`cs-desk ${st ? 'is-taken' : ''} ${st && held === st.id ? 'is-held' : ''} ${held != null && !(st && held === st.id) ? 'is-target' : ''}`}
                style={team ? { '--team': team.color } : undefined}
                data-cs-desk={`${r}:${c}`}
                data-cs-student={st?.id ?? ''}
              >
                <button
                  type="button"
                  className="cs-desk__main"
                  onClick={() => tap(r, c)}
                  aria-pressed={st ? held === st.id : undefined}
                >
                  {st ? shortName(st) : ''}
                </button>
                {st && (
                  <span className="cs-desk__tools">
                    <button
                      type="button"
                      className="cs-dot"
                      onClick={() => own && onChange(nextTeam(seating, st.id))}
                      title={team?.name}
                      aria-label={team?.name}
                      disabled={!own}
                      data-cs-teamdot={team?.id ?? ''}
                    />
                    <button
                      type="button"
                      className={`cs-gender is-${g ?? 'none'}`}
                      onClick={() => onChange(nextGender(seating, st.id))}
                      data-cs-gender={g ?? ''}
                    >
                      {L.gender[g ?? 'none']}
                    </button>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="cs-teamsrow" data-cs-teamlist>
        <Users size={17} />
        {teams.map((t) => (
          <label key={t.id} className="cs-team" style={{ '--team': t.color }} data-cs-team={t.id}>
            <i />
            <input
              value={t.name}
              maxLength={24}
              onChange={(e) => onChange(renameTeam(seating, t.id, e.target.value))}
              aria-label={L.teams}
            />
            <small dir="ltr">{t.members.length}</small>
          </label>
        ))}
      </div>
      <p className="cs-hint">
        {L.seatHint} {own ? L.teamHint : ''} {L.genderHint}
      </p>
    </div>
  );
}

const blank = () => ({ kind: 'choice', text: '', options: ['', '', ''], answer: 0 });
const validDraft = (d) =>
  d.text.trim() !== '' &&
  (d.kind === 'choice'
    ? d.options.filter((o) => o.trim() !== '').length >= 2 && d.options[d.answer]?.trim()
    : d.kind === 'truefalse'
      ? typeof d.answer === 'boolean'
      : d.answer !== '' && Number.isFinite(Number(d.answer)));

/** The form of a teacher's own question. He is told plainly that the platform does not check it. */
function QuestionForm({ initial, onDone, onCancel }) {
  const [d, setD] = useState(initial ?? blank());
  const setKind = (kind) =>
    setD({
      ...d,
      kind,
      answer: kind === 'choice' ? 0 : kind === 'truefalse' ? true : '',
      options: d.options ?? ['', '', ''],
    });
  const done = () => {
    const base = {
      id: initial?.id ?? `t-${Date.now().toString(36)}`,
      kind: d.kind,
      text: d.text.trim(),
      source: 'teacher',
    };
    if (d.kind === 'choice') {
      const kept = d.options.map((o, i) => ({ o: o.trim(), i })).filter((x) => x.o !== '');
      onDone({ ...base, options: kept.map((x) => x.o), answer: kept.findIndex((x) => x.i === d.answer) });
    } else onDone({ ...base, answer: d.kind === 'number' ? Number(d.answer) : d.answer });
  };
  return (
    <div className="cs-form" data-cs-form>
      <div className="cs-seg">
        {['choice', 'truefalse', 'number'].map((k) => (
          <button
            key={k}
            type="button"
            className={d.kind === k ? 'is-on' : ''}
            onClick={() => setKind(k)}
            data-cs-kind={k}
          >
            {L.kind[k]}
          </button>
        ))}
      </div>
      <label className="cs-field">
        <span>{L.text}</span>
        <textarea
          rows={2}
          value={d.text}
          maxLength={500}
          onChange={(e) => setD({ ...d, text: e.target.value })}
          data-cs-qtext
        />
      </label>
      {d.kind === 'choice' && (
        <div className="cs-opts">
          {d.options.map((o, i) => (
            <label key={i} className={d.answer === i ? 'is-right' : ''}>
              <input
                type="radio"
                name="cs-right"
                checked={d.answer === i}
                onChange={() => setD({ ...d, answer: i })}
                aria-label={L.right}
              />
              <input
                value={o}
                maxLength={160}
                placeholder={`${L.option} ${i + 1}`}
                onChange={(e) => setD({ ...d, options: d.options.map((x, k) => (k === i ? e.target.value : x)) })}
                data-cs-opt={i}
              />
            </label>
          ))}
          {d.options.length < 4 && (
            <button type="button" className="cs-link" onClick={() => setD({ ...d, options: [...d.options, ''] })}>
              <Plus size={15} /> {L.option}
            </button>
          )}
        </div>
      )}
      {d.kind === 'truefalse' && (
        <div className="cs-seg">
          <button
            type="button"
            className={d.answer === true ? 'is-on' : ''}
            onClick={() => setD({ ...d, answer: true })}
            data-cs-tf="true"
          >
            {L.true}
          </button>
          <button
            type="button"
            className={d.answer === false ? 'is-on' : ''}
            onClick={() => setD({ ...d, answer: false })}
            data-cs-tf="false"
          >
            {L.false}
          </button>
        </div>
      )}
      {d.kind === 'number' && (
        <label className="cs-field cs-field--num">
          <span>{L.right}</span>
          <input
            inputMode="decimal"
            dir="ltr"
            value={d.answer}
            onChange={(e) => setD({ ...d, answer: e.target.value.replace(/[^0-9.,-]/g, '').replace(',', '.') })}
            data-cs-num
          />
        </label>
      )}
      <p className="cs-warn" data-cs-responsibility>
        {L.responsibility}
      </p>
      <p className="cs-hint">{L.mathTip}</p>
      <div className="cs-form__foot">
        <button type="button" className="cs-btn" onClick={onCancel}>
          {L.cancel}
        </button>
        <button type="button" className="cs-btn cs-btn--main" onClick={done} disabled={!validDraft(d)} data-cs-form-ok>
          <Check size={17} /> {initial ? L.update : L.ok}
        </button>
      </div>
    </div>
  );
}

/** The test of the lesson: its two moments, question by question. The default stays on the server: « Revenir au test d’origine » brings it back. */
export function TestEditor({ payload, working, dirty, onChange, onSave, onReset, itemLabel, saving }) {
  const [moment, setMoment] = useState('start');
  const [adding, setAdding] = useState(null);
  const [editing, setEditing] = useState(null);
  const [asking, setAsking] = useState(false);
  const list = working[moment];
  const set = (next) => onChange({ ...working, [moment]: next });
  const used = new Set([...working.start, ...working.end].map((q) => q.id));
  const d = payload.default;
  const pool = d
    ? [...d[moment], ...d.pool, ...d[moment === 'start' ? 'end' : 'start']].filter(
        (q, i, all) => !used.has(q.id) && all.findIndex((x) => x.id === q.id) === i,
      )
    : [];
  const move = (i, step) => {
    const j = i + step;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    set(next);
  };
  return (
    <div className="cs-test" data-cs-test={moment}>
      <div className="cs-test__bar">
        <div className="cs-seg">
          <button
            type="button"
            className={moment === 'start' ? 'is-on' : ''}
            onClick={() => {
              setMoment('start');
              setAdding(null);
              setEditing(null);
            }}
            data-cs-moment="start"
          >
            {L.start} <small dir="ltr">{working.start.length}</small>
          </button>
          <button
            type="button"
            className={moment === 'end' ? 'is-on' : ''}
            onClick={() => {
              setMoment('end');
              setAdding(null);
              setEditing(null);
            }}
            data-cs-moment="end"
          >
            {L.end} <small dir="ltr">{working.end.length}</small>
          </button>
        </div>
        <span
          className={`cs-state ${dirty ? 'is-dirty' : ''}`}
          data-cs-teststate={dirty ? 'dirty' : payload.mine ? 'mine' : 'default'}
        >
          {dirty ? L.edited : payload.mine ? L.usingMine : L.usingDefault}
        </span>
        <span className="cs-test__actions">
          <button
            type="button"
            className="cs-btn"
            onClick={() => {
              setAdding(adding === 'pool' ? null : 'pool');
              setEditing(null);
            }}
            data-cs-add-pool
          >
            <Plus size={16} /> {L.add}
          </button>
          <button
            type="button"
            className="cs-btn"
            onClick={() => {
              setAdding(adding === 'write' ? null : 'write');
              setEditing(null);
            }}
            data-cs-add-own
          >
            <Pencil size={16} /> {L.write}
          </button>
          <button
            type="button"
            className="cs-btn cs-btn--main"
            onClick={onSave}
            disabled={!dirty || saving || (working.start.length === 0 && working.end.length === 0)}
            data-cs-save
          >
            {L.save}
          </button>
          {payload.mine &&
            (asking ? (
              <span className="cs-ask">
                {L.resetAsk}{' '}
                <button
                  type="button"
                  className="cs-btn cs-btn--main"
                  onClick={() => {
                    setAsking(false);
                    onReset();
                  }}
                  data-cs-reset-yes
                >
                  {L.yes}
                </button>
                <button type="button" className="cs-btn" onClick={() => setAsking(false)}>
                  {L.no}
                </button>
              </span>
            ) : (
              <button type="button" className="cs-btn" onClick={() => setAsking(true)} data-cs-reset>
                <RotateCcw size={16} /> {L.reset}
              </button>
            ))}
        </span>
      </div>
      {adding === 'write' && (
        <QuestionForm
          onCancel={() => setAdding(null)}
          onDone={(q) => {
            set([...list, q]);
            setAdding(null);
          }}
        />
      )}
      {editing && (
        <QuestionForm
          initial={{ ...editing, options: editing.options ?? ['', '', ''], answer: editing.answer }}
          onCancel={() => setEditing(null)}
          onDone={(q) => {
            set(list.map((x) => (x.id === q.id ? q : x)));
            setEditing(null);
          }}
        />
      )}
      {adding === 'pool' && (
        <ul className="cs-pool" data-cs-pool>
          {pool.length === 0 ? (
            <li className="cs-hint">{L.noPool}</li>
          ) : (
            pool.map((q) => (
              <li key={q.id}>
                <span>
                  <MathText>{q.text}</MathText>
                </span>
                <small>{itemLabel(q.item)}</small>
                <button type="button" className="cs-btn" onClick={() => set([...list, q])} data-cs-pool-add={q.id}>
                  <Plus size={16} />
                </button>
              </li>
            ))
          )}
        </ul>
      )}
      {!adding && !editing && (
        <ol className="cs-qlist" data-cs-qlist>
          {list.length === 0 && <li className="cs-hint">{L.empty}</li>}
          {list.map((q, i) => (
            <li key={q.id} data-cs-q={q.id} data-cs-source={q.source === 'teacher' ? 'teacher' : 'platform'}>
              <b dir="ltr">{i + 1}</b>
              <div>
                <p>
                  <MathText>{q.text}</MathText>
                </p>
                <small>
                  <em className={q.source === 'teacher' ? 'is-mine' : ''}>
                    {q.source === 'teacher' ? L.mine : L.fromPlatform}
                  </em>{' '}
                  · {L.kind[q.kind]}
                  {q.item ? ` · ${itemLabel(q.item)}` : ''}
                </small>
              </div>
              <span className="cs-qtools">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="▲">
                  <ArrowUp size={16} />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label="▼">
                  <ArrowDown size={16} />
                </button>
                {q.source === 'teacher' && (
                  <button type="button" onClick={() => setEditing(q)} aria-label={L.update} data-cs-edit={q.id}>
                    <Pencil size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => set(list.filter((x) => x.id !== q.id))}
                  aria-label="×"
                  data-cs-remove={q.id}
                >
                  <Trash2 size={16} />
                </button>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
