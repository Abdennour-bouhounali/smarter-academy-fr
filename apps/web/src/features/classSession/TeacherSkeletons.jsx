/**
 * The loading states of the teacher's class material (BUNDLE_BOUNDARIES.md rule 12: « a page's loading state is a
 * skeleton of its final shape »): never an empty gap while a lesson's board script, its class or its lab arrives.
 *
 *   TeacherPanelSkeleton   the card « للأستاذ » of a lesson page (the fallback of its lazy boundary): same outer box;
 *   ClassSessionSkeleton   the page « حصّة القسم » while the lesson's pack parts load (needs `classSession.css`, which
 *                          the page imports): header, then the set-up screen;
 *   ClassWorkSkeleton      the set-up screen alone, while the class's four requests are pending (inside the real header);
 *   LabOpeningSkeleton     the lesson's lab layer, between the click on « مختبر الدرس » and its chunk.
 *
 * Calm: grey bars of the final shape, a soft pulse cut under prefers-reduced-motion. Each is ONE `role="status"`
 * announced once; the bars inside are `aria-hidden`.
 */

const LABEL = 'جارٍ التحضير…';
const bar = 'block rounded-lg bg-nav-line animate-pulse motion-reduce:animate-none';

/**
 * The board's fit (designed 1280 × 720 for a wide screen, 1000 × 740 for a 4:3 one, zoomed to the window): shared by the
 * page and its skeleton, so the skeleton has the size of the screen that replaces it.
 */
export function boardFit(w, h) {
  const narrow = w / h < 1.55;
  const zoom = Math.max(0.6, Math.min(1.9, narrow ? Math.min(w / 1000, h / 740) : Math.min(w / 1280, h / 720)));
  return { narrow, zoom };
}

const Bar = ({ className = '' }) => <span className={`${bar} ${className}`} aria-hidden="true" />;

/** A door of the card: icon, title, one line. */
const DoorSkeleton = () => (
  <div className="flex w-full items-center gap-3 rounded-2xl border border-nav-line bg-white p-3" aria-hidden="true">
    <span className="h-11 w-11 shrink-0 rounded-xl bg-nav-accent-soft animate-pulse motion-reduce:animate-none" />
    <span className="min-w-0 flex-1 space-y-2">
      <Bar className="h-4 w-1/3" />
      <Bar className="h-3 w-4/5" />
    </span>
  </div>
);

const BlockSkeleton = ({ doors }) => (
  <div className="space-y-2" aria-hidden="true">
    <Bar className="h-3 w-16" />
    {Array.from({ length: doors }, (_, i) => (
      <DoorSkeleton key={i} />
    ))}
  </div>
);

/**
 * « للأستاذ » while its chunk loads. `board`: the lesson has its class board — the strong panel « حصّة القسم » and its
 * four moments come first (the same shape as TeacherLessonPanel).
 */
export function TeacherPanelSkeleton({ board = true }) {
  return (
    <section
      className="w-full space-y-5 text-start"
      dir="rtl"
      role="status"
      aria-label={LABEL}
      aria-busy="true"
      data-teacher-panel-skeleton
    >
      {board && (
        <div className="rounded-3xl border border-nav-line bg-nav-page p-5" aria-hidden="true">
          <div className="flex flex-wrap items-center gap-4">
            <span className="h-14 w-14 shrink-0 rounded-2xl bg-nav-accent-soft animate-pulse motion-reduce:animate-none" />
            <div className="min-w-0 flex-1 space-y-2">
              <Bar className="h-3 w-24" />
              <Bar className="h-7 w-40" />
              <Bar className="h-4 w-3/4" />
            </div>
            <Bar className="h-[52px] w-48 shrink-0 rounded-2xl" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {[0, 1, 2, 3].map((k) => (
              <div key={k} className="flex flex-col gap-2 rounded-2xl border border-nav-line bg-white p-3">
                <span className="flex items-center gap-2">
                  <span className="h-7 w-7 shrink-0 rounded-full bg-nav-accent-soft" />
                  <Bar className="h-4 w-2/3" />
                </span>
                <Bar className="h-3 w-full" />
                <Bar className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <BlockSkeleton doors={board ? 3 : 2} />
        <BlockSkeleton doors={2} />
      </div>
      <BlockSkeleton doors={1} />
      <div className="space-y-2" aria-hidden="true">
        <Bar className="h-3 w-20" />
        <div className="grid gap-3 lg:grid-cols-3">
          {[0, 1, 2].map((k) => (
            <div key={k} className="space-y-2.5 rounded-2xl border border-nav-line bg-white p-3.5">
              <Bar className="h-4 w-1/2" />
              <Bar className="h-3 w-full" />
              <Bar className="h-3 w-5/6" />
              <Bar className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** The set-up screen: the pane (tabs, the seating bar, the room's desks) and the column of the hour. */
export function ClassWorkSkeleton() {
  return (
    <div className="cs-work" role="status" aria-label={LABEL} aria-busy="true" data-cs-work-skeleton>
      <section className="cs-pane" aria-hidden="true">
        <div className="flex gap-4 border-b-2 border-nav-line pb-2">
          <Bar className="h-6 w-32" />
          <Bar className="h-6 w-24" />
        </div>
        <div className="flex gap-4">
          <Bar className="h-8 w-40" />
          <Bar className="h-8 w-56" />
        </div>
        <div
          className="grid min-h-0 flex-1 grid-cols-6 gap-2 rounded-2xl bg-nav-page p-3"
          style={{ gridAutoRows: '1fr' }}
        >
          {Array.from({ length: 24 }, (_, i) => (
            <span key={i} className="rounded-xl bg-nav-line/70 animate-pulse motion-reduce:animate-none" />
          ))}
        </div>
      </section>
      <aside className="cs-launch" aria-hidden="true">
        <Bar className="h-6 w-1/2" />
        {[0, 1, 2, 3].map((k) => (
          <div key={k} className="space-y-1.5 rounded-2xl border-2 border-nav-accent-soft bg-nav-page px-4 py-3">
            <Bar className="h-5 w-2/3" />
            <Bar className="h-3 w-1/3" />
          </div>
        ))}
        <Bar className="h-4 w-3/4" />
        <Bar className="h-4 w-2/3" />
        <Bar className="mt-auto h-4 w-1/3" />
      </aside>
    </div>
  );
}

/** « حصّة القسم » before its lesson's pack parts arrive: the page's frame, header and set-up screen, at its fit. */
export function ClassSessionSkeleton() {
  const { narrow, zoom } =
    typeof window === 'undefined' ? boardFit(1280, 720) : boardFit(window.innerWidth, window.innerHeight);
  return (
    <div className={`cs-root ${narrow ? 'cs-root--narrow' : ''}`} dir="rtl" data-class-session-skeleton>
      <div className="cs-fit" style={{ zoom }}>
        <div className="cs-setup">
          <header className="cs-head" aria-hidden="true">
            <div className="cs-brand">
              <span className="h-10 w-10 rounded-xl bg-nav-accent-soft animate-pulse motion-reduce:animate-none" />
              <div className="space-y-2">
                <Bar className="h-6 w-36" />
                <Bar className="h-4 w-56" />
              </div>
            </div>
            <Bar className="h-10 w-10 rounded-full" />
          </header>
          <ClassWorkSkeleton />
        </div>
      </div>
    </div>
  );
}

/** The lab is a full-screen dark layer: the same layer, at once, saying it is opening. */
export function LabOpeningSkeleton() {
  return (
    <div
      className="fixed inset-0 z-[1300] grid place-items-center bg-nav-ink"
      dir="rtl"
      role="status"
      aria-label={LABEL}
      aria-busy="true"
      data-lab-opening
    >
      <span className="flex items-center gap-3 text-base font-extrabold text-white/80">
        <span
          className="h-3 w-3 rounded-full bg-nav-accent animate-pulse motion-reduce:animate-none"
          aria-hidden="true"
        />
        {LABEL}
      </span>
    </div>
  );
}
