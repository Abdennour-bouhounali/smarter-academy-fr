import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import { AuthContext } from '../context/AuthContext';
import { ContentAvailabilityContext, paidSets } from '../context/ContentAvailabilityContext';
import { PaymentsProvider } from '../context/PaymentsContext';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { featureState } from '../features/access/featureAccess';
import { visibleLinks } from '../data/doors';
import { teacherAccountLinks } from '../data/teacherNavigation';
import QuotaMeter from './access/QuotaMeter';
import FeatureLockedPanel from './access/FeatureLockedPanel';
import FAQSection from './faq/FAQSection';
import ContactSection from './contact/ContactSection';
import Home from '../pages/Home';
import Profil from '../pages/student/Profil';
import TeacherHome from '../pages/teacher/TeacherHome';
import MembersTab from '../features/teacher/members/MembersTab';
import LessonsTab from '../features/teacher/classGroupLessons/LessonsTab';

// The pages that load their data through useAdminResource get it from the test.
const resource = vi.hoisted(() => ({ data: null }));
vi.mock('../hooks/useAdminResource', () => ({
  useAdminResource: () => ({ data: resource.data, loading: false, error: null, reload: () => {}, setData: () => {} }),
}));

const ts = i18n.getFixedT(null, 'student');
const tm = i18n.getFixedT(null, 'marketing');
const tt = i18n.getFixedT(null, 'teacher');
const ta = i18n.getFixedT(null, 'access');

const STUDENT = { role: 'student', grade: '3e', first_name: 'A', last_name: 'B', email: 'a@b.c' };
const TEACHER = { role: 'teacher', first_name: 'A', last_name: 'B' };

const NOTHING_CLOSED = {
  loaded: true,
  refresh: async () => ({}),
  isLessonClosed: () => false,
  isModuleClosed: () => false,
  isLessonLocked: () => false,
  isLessonPremium: () => false,
  isLessonHiddenByClass: () => false,
  hiddenByClassCount: 0,
  lessonStatus: () => 'published',
  moduleStatus: () => 'published',
};

function render(ui, { paymentsOpen, user = STUDENT, access = null, url = '/' }) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[url]}>
      <AuthContext.Provider value={{ token: 't', user, updateGrade: async () => {}, logout: async () => {} }}>
        <PaymentsProvider value={{ paymentsOpen }}>
          <ContentAvailabilityContext.Provider value={{ ...NOTHING_CLOSED, access }}>
            {ui}
          </ContentAvailabilityContext.Provider>
        </PaymentsProvider>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

function PremiumProbe() {
  const { isPremium, canSeeUpgrade } = usePremiumStatus();
  return <i data-premium={String(isPremium)} data-upgrade={String(canSeeUpgrade)} />;
}

const ENT_FULL = {
  students: { current: 30, maximum: 30, overLimit: false },
  classes: { current: 1, maximum: 3, overLimit: false, canCreate: true },
  request: { planName: 'Formule X' },
};

/**
 * Every surface that sells or locks: [name, how to draw it, what shows it]. Absent while payments are closed, present
 * — exactly as before — while they are open.
 */
const SURFACES = [
  ['the account menu’s « full access » state (student)', () => <PremiumProbe />, 'data-premium="true"', { access: { premiumAccess: true } }],
  ['the account menu’s invitation to enter a code (student)', () => <PremiumProbe />, 'data-upgrade="true"', { access: { premiumAccess: false } }],
  ['the quota counter of a feature limit', () => <QuotaMeter quota={{ usageType: 'documents', remaining: 2, limit: 10, period: 'month' }} />, 'data-quota-meter="documents"'],
  [
    'the « activate full access » button on a refusal',
    () => <FeatureLockedPanel reason="quota_exceeded" quota={{ used: 10, limit: 10, remaining: 0 }} resource="documents" />,
    'href="/espace/activation"',
  ],
  ['the « raise this limit » sentence on a refusal', () => <FeatureLockedPanel reason="quota_exceeded" quota={{ used: 10, limit: 10, remaining: 0 }} />, ta('feature.quota_exceeded.bodyPremium')],
  ['the FAQ about the activation code', () => <FAQSection />, tm('faq.items.activation.q')],
  ['the FAQ about the locked lessons', () => <FAQSection />, tm('faq.items.premiumVisible.q')],
  ['the FAQ about paying cash', () => <FAQSection />, tm('faq.items.noCard.q')],
  ['the contact form’s « prices » subject', () => <ContactSection />, tm('contact.subjects.pricing')],
  ['the home page’s free / paid teaser', () => <Home />, tm('freePremium.body'), { user: null }],
  ['the profile’s plan card and its code link', () => <Profil />, 'href="/espace/activation"', { url: '/espace/profil' }],
  ['the profile’s « free account » plan', () => <Profil />, ts('profile.planFree'), { url: '/espace/profil' }],
  [
    'the teacher home’s « seats full, see your plan » line',
    () => {
      resource.data = { entitlements: ENT_FULL, classrooms: [] };
      return <TeacherHome />;
    },
    'data-seats-full',
    { user: TEACHER },
  ],
  [
    'the teacher home’s pending plan request',
    () => {
      resource.data = { entitlements: ENT_FULL, classrooms: [] };
      return <TeacherHome />;
    },
    'Formule X',
    { user: TEACHER },
  ],
  [
    'the class’s « seats full » hint and its plan link',
    () => {
      resource.data = [];
      // Its login-cards dialog reads the address bar.
      vi.stubGlobal('window', { location: { host: 'localhost' } });
      return <MembersTab classGroup={{ id: 1, status: 'active' }} entitlements={ENT_FULL} />;
    },
    'data-seats-hint',
    { user: TEACHER },
  ],
  [
    'the class lessons’ « paid » tag',
    () => {
      resource.data = {
        chapters: [{ code: 'c', title: 'Chapitre', lessons: [{ id: 'l1', title: 'Leçon', tier: 'premium', publicationStatus: 'published', classStatus: 'visible', effectiveForStudents: true }] }],
      };
      return <LessonsTab classGroup={{ id: 1, status: 'active' }} entitlements={{ features: {} }} />;
    },
    `<span>${tt('lessons.premium')}</span>`,
    { user: TEACHER },
  ],
];

describe('payments closed: nothing sells, nothing locks — open: everything as before', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each(SURFACES)('%s', (_, draw, marker, options = {}) => {
    expect(render(draw(), { ...options, paymentsOpen: true })).toContain(marker);
    expect(render(draw(), { ...options, paymentsOpen: false })).not.toContain(marker);
  });

  it('closed, the profile says the platform is free for now — never « premium », never a subscription', () => {
    const closed = render(<Profil />, { paymentsOpen: false, access: { premiumAccess: true, reason: 'payments_closed', paymentsOpen: false } });
    expect(closed).toContain(ts('profile.planFreeForNow'));
    expect(closed).not.toContain(ts('profile.planGranted'));
    expect(closed).not.toContain(ts('profile.planSubscriptionActive'));
    expect(render(<Profil />, { paymentsOpen: true })).not.toContain(ts('profile.planFreeForNow'));
  });

  it('closed, the FAQ says the platform is free for now instead of « one free lesson »', () => {
    expect(render(<FAQSection />, { paymentsOpen: false })).toContain(tm('faq.items.freeNow.q'));
    expect(render(<FAQSection />, { paymentsOpen: false })).not.toContain(tm('faq.items.free.q'));
    expect(render(<FAQSection />, { paymentsOpen: true })).not.toContain(tm('faq.items.freeNow.q'));
  });

  it('no padlock and no « premium » mark on a lesson: the cards, rows, lesson index and lesson gate read these sets', () => {
    const closed = { locked: ['a'], premium: ['a', 'b'] };
    expect(paidSets(closed, false)).toEqual({ locked: new Set(), premium: new Set() });
    expect(paidSets(closed, true)).toEqual({ locked: new Set(['a']), premium: new Set(['a', 'b']) });
  });

  it('no padlock on a math-lab tool or the notebook while the summary says payments are closed', () => {
    const feature = { enabled: true, allowed: false, reason: 'premium_required' };
    expect(featureState({ paymentsOpen: false, features: { k: feature } }, 'k')).toMatchObject({ allowed: true, reason: 'ok', canCreate: true });
    expect(featureState({ paymentsOpen: true, features: { k: feature } }, 'k')).toMatchObject({ allowed: false, reason: 'premium_required' });
    // A feature the admin switched off stays off, open or closed.
    const off = { enabled: false, allowed: false, reason: 'feature_disabled' };
    expect(featureState({ paymentsOpen: false, features: { k: off } }, 'k')).toMatchObject({ enabled: false, allowed: false });
  });

  it('closed, a refusal that would say « premium » says « not available » — never « activate full access »', () => {
    const closed = render(<FeatureLockedPanel reason="premium_required" />, { paymentsOpen: false });
    expect(closed).toContain(ta('feature.not_available.title'));
    expect(closed).not.toContain(ta('feature.premium_required.title'));
    expect(render(<FeatureLockedPanel reason="premium_required" />, { paymentsOpen: true })).toContain(ta('feature.premium_required.title'));
  });

  it('the teacher’s « my plan » menu entry exists only while open', () => {
    expect(visibleLinks(teacherAccountLinks, { paymentsOpen: false }).map((l) => l.path)).not.toContain('/enseignant/offre');
    expect(visibleLinks(teacherAccountLinks, { paymentsOpen: true }).map((l) => l.path)).toContain('/enseignant/offre');
  });

  // Two pages draw these only with data the test cannot give without a DOM (a built lesson, a fetched overview):
  // their guard is read in the source.
  it('the school’s « seats bought » licence card waits for payments to open', () => {
    const page = readFileSync(new URL('../pages/school/SchoolHome.jsx', import.meta.url), 'utf8');
    expect(page).toMatch(/\{paymentsOpen && <section[^>]*data-school-licence/);
  });

  it('the catalogue’s « paid » legend and « the rest opens with a code » wait for payments to open', () => {
    const page = readFileSync(new URL('../pages/Courses.jsx', import.meta.url), 'utf8');
    expect(page).toMatch(/\{paymentsOpen && \(\s*<p[^>]*>\s*\{t\('catalogueSubtitle'\)\}/);
    expect(page).toMatch(/\{paymentsOpen && \(\s*<>[\s\S]*?\{t\('legendPremium'\)\}[\s\S]*?<\/>\s*\)\}/);
  });
});
