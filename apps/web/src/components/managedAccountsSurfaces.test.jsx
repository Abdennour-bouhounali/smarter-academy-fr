import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import { AuthContext } from '../context/AuthContext';
import { loadManagedAccountsStatus } from '../hooks/useManagedAccounts';
import MembersTab from '../features/teacher/members/MembersTab';
import SchoolStudents, { StudentsTable } from '../pages/school/SchoolStudents';

// The class's students come from the test.
const resource = vi.hoisted(() => ({ data: null }));
vi.mock('../hooks/useAdminResource', () => ({
  useAdminResource: () => ({ data: resource.data, loading: false, error: null, reload: () => {}, setData: () => {} }),
}));
// The dialogs that issue passwords say whether they are MOUNTED (closed, they would draw nothing either way).
vi.mock('../features/teacher/members/CredentialsDialog', () => ({
  default: () => <i data-mounted="credentials-dialog" />,
}));
vi.mock('../features/school/RosterImportDialog', () => ({ default: () => <i data-mounted="roster-dialog" /> }));

const tt = i18n.getFixedT(null, 'teacher');
const ti = i18n.getFixedT(null, 'idara');
// `idara` arrives with the school's frame in the app; here it is loaded before any render, so nothing suspends.
beforeAll(() => i18n.loadNamespaces('idara'));

const original = globalThis.fetch;
/** The server's answer to GET /managed-accounts/status for this account, read once into the store. */
async function switchFor(token, open) {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ success: true, open }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  await loadManagedAccountsStatus(token);
  globalThis.fetch = original;
}

function render(ui, token) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <AuthContext.Provider value={{ token, user: { role: 'teacher', first_name: 'A', last_name: 'B' } }}>
        {ui}
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

const STUDENTS = [
  {
    id: 1,
    firstName: 'Léa',
    lastName: 'Martin',
    lastActivityAt: null,
    progressPercent: null,
    lessonsCompleted: 0,
    successRate: null,
  },
  {
    id: 2,
    firstName: 'Hugo',
    lastName: 'Petit',
    lastActivityAt: null,
    progressPercent: null,
    lessonsCompleted: 0,
    successRate: null,
  },
];
const teacherTab = (props = {}) => (
  <MembersTab classGroup={{ id: 1, status: 'active' }} entitlements={null} onInvite={() => {}} {...props} />
);

describe('the teacher’s class — the login cards follow the administrator’s switch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    resource.data = null;
  });

  it('closed: no « print the logins » button, no dialog; one sentence and the invitation to the class code or link', async () => {
    await switchFor('teacher-closed', false);
    resource.data = STUDENTS;
    const out = render(teacherTab(), 'teacher-closed');
    expect(out).not.toContain('data-credentials-open');
    expect(out).not.toContain(tt('students.credentials.open'));
    expect(out).not.toContain('data-mounted="credentials-dialog"');
    expect(out).toContain('data-credentials-closed');
    expect(out).toContain(tt('students.credentials.closed'));
    expect(out).toContain('data-students-invite');
    expect(out).toContain(tt('classes.invite'));
    // The parents' cards issue no password: they stay.
    expect(out).toContain('data-parent-cards-open');
  });

  it('open: the button and its dialog, and no sentence', async () => {
    await switchFor('teacher-open', true);
    resource.data = STUDENTS;
    const out = render(teacherTab(), 'teacher-open');
    expect(out).toContain('data-credentials-open');
    expect(out).toContain(tt('students.credentials.open'));
    expect(out).toContain('data-mounted="credentials-dialog"');
    expect(out).not.toContain('data-credentials-closed');
  });

  it('not known yet: neither the button nor the sentence', () => {
    resource.data = STUDENTS;
    const out = render(teacherTab(), 'teacher-unread');
    expect(out).not.toContain('data-credentials-open');
    expect(out).not.toContain('data-mounted="credentials-dialog"');
    expect(out).not.toContain('data-credentials-closed');
  });

  it('an archived class shows no sentence; an empty class keeps its invitation either way', async () => {
    await switchFor('teacher-closed-2', false);
    resource.data = STUDENTS;
    expect(render(teacherTab({ classGroup: { id: 1, status: 'archived' } }), 'teacher-closed-2')).not.toContain(
      'data-credentials-closed',
    );
    resource.data = [];
    const empty = render(teacherTab(), 'teacher-closed-2');
    expect(empty).toContain('data-students-invite');
    expect(empty).not.toContain('data-credentials-closed');
  });
});

describe('the school’s « Élèves » — the import and the login cards follow the administrator’s switch', () => {
  it('closed: no import, no cards button, no import dialog; one sentence pointing to the class code or link', async () => {
    await switchFor('school-closed', false);
    const out = render(<SchoolStudents />, 'school-closed');
    expect(out).not.toContain('data-roster-open');
    expect(out).not.toContain(ti('students.import'));
    expect(out).not.toContain('data-cards-open');
    expect(out).not.toContain('data-mounted="roster-dialog"');
    expect(out).toContain('data-managed-closed');
    expect(out).toContain(ti('students.closed'));
  });

  it('open: the import and the cards buttons, the import dialog, no sentence', async () => {
    await switchFor('school-open', true);
    const out = render(<SchoolStudents />, 'school-open');
    expect(out).toContain('data-roster-open');
    expect(out).toContain(ti('students.import'));
    expect(out).toContain('data-cards-open');
    expect(out).toContain('data-mounted="roster-dialog"');
    expect(out).not.toContain('data-managed-closed');
  });

  it('not known yet: neither the buttons nor the sentence', () => {
    const out = render(<SchoolStudents />, 'school-unread');
    expect(out).not.toContain('data-roster-open');
    expect(out).not.toContain('data-cards-open');
    expect(out).not.toContain('data-managed-closed');
  });

  it('the table: a selection box before a school-created account only when selectable; the login stays readable', () => {
    const students = [
      {
        id: 1,
        firstName: 'Léa',
        lastName: 'Martin',
        login: 's1.abcdef@eleves.example',
        enrolledBySchool: true,
        classroom: { id: 9, name: '3e A' },
      },
      {
        id: 2,
        firstName: 'Hugo',
        lastName: 'Petit',
        login: null,
        enrolledBySchool: false,
        classroom: { id: 9, name: '3e A' },
      },
    ];
    const table = (selectable) =>
      render(
        <StudentsTable
          t={ti}
          students={students}
          classrooms={[{ id: 9, name: '3e A' }]}
          selectable={selectable}
          selected={new Set()}
          onToggle={() => {}}
          busy={false}
          onTransfer={() => {}}
        />,
        'any',
      );
    const closed = table(false);
    expect(closed).not.toContain('type="checkbox"');
    expect(closed).toContain('s1.abcdef@eleves.example');
    expect(closed).toContain(ti('students.transfer'));
    const open = table(true);
    expect(open.match(/type="checkbox"/g)).toHaveLength(1);
  });
});
