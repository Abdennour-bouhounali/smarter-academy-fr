/**
 * « ورقة هاجر » — la DERNIÈRE étape du module 7 « وضعية الوحدة » (la synthèse de l'unité 9 dans le lecteur de mission, 2026-11-10 ; conseil C,
 * décision 5). La camarade est inventée (KidFigure, en tenue islamique) ; son nom n'est nulle part ailleurs dans l'unité.
 * Ce n'est PAS une solution : c'est un PLAN, en lettres, SANS aucun nombre (rien à balayer). Son erreur est une erreur de JUSTIFICATION — la
 * seule que rien d'autre ne vérifie dans la leçon : Thalès appliqué sans dire pourquoi (TC) ∥ (SK) ; deux alignements ne suffisent pas.
 * Les lignes qui suivent restent justes une fois la ligne fautive corrigée (pas de `fixedLines`).
 */
export const PEER_KID = { name: 'هاجر', figure: { hairStyle: 'hijab', scarf: 'lavender', outfit: 'violet' } };

export const PEER_SHEET = {
  id: 'm7-hajar',
  task: 'خطّة هاجر لحساب حجم الأسطوانة المرسومة داخل المخروط حين يتساوى طولها h ونصف قطرها r :',
  lines: [
    'أرسم نصف المقطع المحوري: المثلث $OSK$ للمخروط، وفيه المستطيل $SDCT$ للأسطوانة.',
    'النقط $O$ و $T$ و $S$ على استقامة، والنقط $O$ و $C$ و $K$ على استقامة؛ إذن المثلثان $OTC$ و $OSK$ في وضعية طالس.',
    'أكتب $\\dfrac{TC}{SK} = \\dfrac{OT}{OS}$ مع $OT = OS - h$ .',
    'أعوّض h بـ r ، ثم أحلّ المعادلة التي أحصل عليها.',
    'أحسب $V = \\pi r^2 h$ ، وأتحقّق أنّ r أصغر من نصف قطر قاعدة المخروط.',
  ],
  errorLine: 1,
  fixes: [
    { text: 'ينقص سبب: $(TC)$ و $(SK)$ عموديان كلاهما على المحور $(SO)$ ، فهما متوازيان.', ok: true },
    { text: 'نكتب $\\dfrac{TC}{SK} = \\dfrac{ST}{SO}$ في السطر التالي.', why: 'ليست المشكلة في النسبة، و ST ليس ضلعًا رأسه O . السطر الذي قبلها هو الناقص: لماذا المثلثان في وضعية طالس؟' },
    { text: 'نستعمل خاصية فيثاغورس في المثلث $OSK$ بدل خاصية طالس.', why: 'فيثاغورس يعطي طول المولّد OK ولا يذكر r . خاصية طالس هي الصحيحة، لكن بشرطها.' },
  ],
  why: 'وضعية طالس تحتاج مستقيمين متوازيين يقطعان مستقيمين متقاطعين في O . استقامة النقط وحدها لا تكفي: التوازي هنا يأتي من أنّ $(TC)$ و $(SK)$ عموديان على المحور نفسه.',
};
