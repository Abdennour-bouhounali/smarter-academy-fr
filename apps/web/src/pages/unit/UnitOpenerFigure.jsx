import { Suspense, lazy } from 'react';

/**
 * Les figures de l'OUVERTURE d'unité (تحدّ, encadré historique). Leur texte dit « الشكل المقابل »,
 * « البيان المقابل », « نظم العمل في جدول » : sans dessin, la phrase renvoie au vide. On réutilise
 * le dessin que la leçon a déjà fait de la même figure du manuel (jamais une seconde copie), chargé
 * à la demande pour que la page d'unité n'embarque pas les leçons des autres unités.
 *
 * Clé : `${unit.id}:${slot}` (= le code de l’unité), slot ∈ challenge | aside. Une unité sans entrée n'affiche rien.
 */
// RÈGLE (2026-10-13) : le تحدّ de la page d'unité EST la situation de la synthèse « أدمج تعلّماتي » (module 7 « تحليل الوضعية
// النهائية للاختبار »). Les entrées ci-dessous reprennent donc le dessin que cette synthèse fait de sa situation (ou, pour les
// unités 3, 9, 14, le dessin du تحدّ que le module 7 reprend). Sans dessin : la situation n'en réclame pas (unités 5, 7, 13).
const FIGURES = {
  // p. 31 — ABC, AB = x + 1, AC = x + 2, BC = x + 3 ; l'angle en A n'est PAS marqué droit (c'est la question).
  'hisab-harfi:challenge': () => Promise.resolve({ default: TriangleABC }),
  // p. 31 — le tableau 3 × 3 de Descartes pour (2x + 1)².
  'hisab-harfi:aside': () => Promise.all([
    import('../../lessons/moyen/4am/ansab_al_aadad_wal_hisab/hisab-harfi/mutatabiqat-shahira/components/DescartesTable.jsx'),
    import('../../lessons/moyen/4am/ansab_al_aadad_wal_hisab/hisab-harfi/mutatabiqat-shahira/content/textbook.js'),
  ]).then(([{ default: DescartesTable }, { DESCARTES }]) => ({
    default: () => <DescartesTable head={DESCARTES.head} cells={DESCARTES.cells} />,
  })),
  // p. 103 — « رسم الشكل المقابل » : la minaret, le rayon de soleil, le bâton de 1 m, 10 m et 11,6 m au sol — dessinée par
  // la synthèse qui reprend le تحدّ (doublon déclaré) ; la hauteur n'y est ni écrite ni graduée (c'est la question).
  'khassiyat-talis:challenge': () => import('../../lessons/moyen/4am/handasa/khassiyat-talis/wadiya-idmajiya-talis/components/MinaretFigure.jsx'),
  // p. 163 — « يُمثّل الشكل المقابل دلوًا فيه ماء » : le seau en tronc de cône, son eau et les cotes du manuel (40 / 30 / 7 / 28)
  // — dessiné par la synthèse (wadiya-idmajiya-fada) qui porte le تحدّ ; ni le rayon de la surface, ni le sommet, ni le volume
  // (c'est la question).
  'handasa-fada:challenge': () => import('../../lessons/moyen/4am/handasa/handasa-fada/wadiya-idmajiya-fada/components/BucketFigure.jsx'),
  'muadalat-mutarajihat:challenge': () => import('../../lessons/moyen/4am/ansab_al_aadad_wal_hisab/muadalat-mutarajihat/wadiya-idmajiya-muadalat/components/OpenerFigure.jsx'),
  'hisab-judhur:challenge': () => import('../../lessons/moyen/4am/ansab_al_aadad_wal_hisab/hisab-judhur/wadiya-idmajiya-judhur/components/OpenerFigure.jsx'),
  'ashia-insihab:challenge': () => import('../../lessons/moyen/4am/handasa/ashia-insihab/wadiya-idmajiya-ashia/components/OpenerFigure.jsx'),
  'hisab-muthallathat:challenge': () => import('../../lessons/moyen/4am/handasa/hisab-muthallathat/wadiya-idmajiya-muthallathat/components/OpenerFigure.jsx'),
  'tanasubiya-dala-khattiya:challenge': () => import('../../lessons/moyen/4am/tanasubiya_duwal/tanasubiya-dala-khattiya/wadiya-idmajiya-khattiya/components/CableCarFigure.jsx').then(({ CableCarFigure }) => ({ default: () => <CableCarFigure /> })),
  'ihsa:challenge': () => import('../../lessons/moyen/4am/tanasubiya_duwal/ihsa/wadiya-idmajiya-ihsa/components/OpenerFigure.jsx'),
  'ashia-maalam:challenge': () => import('../../lessons/moyen/4am/handasa/ashia-maalam/wadiya-idmajiya-maalam/components/OpenerFigure.jsx'),
};

const lazyCache = {};
function figureFor(key) {
  if (!FIGURES[key]) return null;
  lazyCache[key] ??= lazy(FIGURES[key]);
  return lazyCache[key];
}

export default function UnitOpenerFigure({ code, slot }) {
  const Figure = figureFor(`${code}:${slot}`);
  if (!Figure) return null;
  return (
    <div className="mt-3" data-unit-figure={`${code}:${slot}`}>
      <Suspense fallback={<div className="mx-auto h-40 w-full max-w-sm animate-pulse rounded-xl bg-white/70" />}>
        <Figure />
      </Suspense>
    </div>
  );
}

/** Le triangle du تحدّ de l'unité 3 : quelconque à l'œil, côtés écrits en notation latine (LTR). */
function TriangleABC() {
  const A = [60, 40]; const B = [60, 170]; const C = [250, 170];
  const p = ([x, y]) => `${x},${y}`;
  const t = (x, y, s, o = {}) => <text x={x} y={y} fontSize="14" fill="#0F172A" fontFamily="ui-monospace, monospace" {...o}>{s}</text>;
  return (
    <figure className="mx-auto w-full max-w-xs rounded-xl border-2 border-slate-200 bg-white p-2" data-figure="triangle-abc">
      <svg viewBox="0 0 300 200" className="h-auto w-full" dir="ltr" style={{ direction: 'ltr' }} role="img" aria-label="مثلث ABC حيث AB = x + 1 و AC = x + 2 و BC = x + 3">
        <polygon points={[A, B, C].map(p).join(' ')} fill="#FEF3C7" stroke="#B45309" strokeWidth="2" strokeLinejoin="round" />
        {t(A[0] - 8, A[1] - 8, 'A', { fontWeight: 'bold', textAnchor: 'middle' })}
        {t(B[0] - 12, B[1] + 16, 'B', { fontWeight: 'bold', textAnchor: 'middle' })}
        {t(C[0] + 12, C[1] + 16, 'C', { fontWeight: 'bold', textAnchor: 'middle' })}
        {t(A[0] - 8, (A[1] + B[1]) / 2 + 4, 'x + 1', { textAnchor: 'end' })}
        {t((A[0] + C[0]) / 2 + 14, (A[1] + C[1]) / 2 - 14, 'x + 2')}
        {t((B[0] + C[0]) / 2, B[1] + 20, 'x + 3', { textAnchor: 'middle' })}
      </svg>
    </figure>
  );
}
