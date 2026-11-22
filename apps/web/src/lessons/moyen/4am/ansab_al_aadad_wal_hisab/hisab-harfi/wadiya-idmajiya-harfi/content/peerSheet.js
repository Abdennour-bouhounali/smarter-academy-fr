/**
 * « ورقة مالك » — la DERNIÈRE étape du module 7 « وضعية الوحدة » (la synthèse de l'unité 3 dans le lecteur de mission, 2026-11-12 ; recette de la
 * synthèse, point 5). Le camarade est inventé (KidFigure) ; son prénom n'est porté par AUCUNE autre « ورقة زميل » de la plateforme
 * (content/mission.test.js, _unit/missionStrings.test.js).
 * Ce n'est PAS une solution : c'est un PLAN, en mots, SANS aucun nombre. Son erreur est une erreur de JUSTIFICATION — « le ruban fait le tour du
 * bassin, donc son aire est le périmètre du bassin multiplié par la largeur » : ce produit ne compte que les quatre bandes et OUBLIE les quatre
 * coins ; l'aire du ruban est celle du grand carré moins celle du bassin. Les autres lignes sont justes.
 */
export const PEER_KID = { name: 'مالك', figure: { outfit: 'sky' } };

export const PEER_SHEET = {
  id: 'm7-malik',
  task: 'خطّة مالك لإيجاد عرض الشريط حول الحوض:',
  lines: [
    'أسمّي عرض الشريط x، وأقرأ من الشكل أنّ الشريط يحيط بالحوض من كل الجهات.',
    'الشريط يدور حول الحوض، إذن مساحته هي محيط الحوض مضروبًا في عرض الشريط.',
    'أكتب المساواة «مساحة الشريط تساوي المساحة المعطاة» وأبسّطها.',
    'أستعمل الشكل المحلّل المعطى، وأحتفظ بالقيمة الموجبة لأنّ العرض طول، ثم أتحقّق منها.',
  ],
  errorLine: 1,
  fixes: [
    { text: 'مساحة الشريط هي مساحة المربّع الكبير ناقص مساحة الحوض: هكذا تُحسب الأشرطة الأربعة والأركان الأربعة معًا.', ok: true },
    { text: 'مساحة الشريط هي مساحة المربّع الكبير، لأنّ الشريط يحيط بالحوض.', why: 'المربّع الكبير يضمّ الحوض أيضًا: يجب أن نطرح مساحة الحوض.' },
    { text: 'مساحة الشريط هي محيط الحوض مضروبًا في ضعف العرض، لأنّ الشريط على جهتين.', why: 'الجهتان تخصّان ضلع المربّع الكبير، لا المساحة: المحيط في العرض يعطي الأشرطة الأربعة، وتبقى الأركان منسيّة.' },
  ],
  why: 'محيط الحوض في عرض الشريط يعطي الأشرطة الأربعة التي على أضلاع الحوض فقط، وتنقص الأركان الأربعة المربّعة. نحسب مساحة الشريط كمساحة المربّع الكبير ناقص مساحة الحوض.',
};
