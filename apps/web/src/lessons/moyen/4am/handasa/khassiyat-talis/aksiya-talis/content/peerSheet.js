/**
 * « ورقة رياض » — la dernière étape du module 2 (rollout 2026-11-10, unité 9 leçon 2 ; conseil du 2026-11-10, verdict « Cross-lesson » et « L2 ») —
 * contenu PROPRE à la plateforme : le camarade est inventé (KidFigure). L'idée fausse visée est celle de la leçon : comparer une partie à
 * l'AUTRE PARTIE (AM/MB) au lieu de la partie au TOUT (AM/AB), et conclure à tort « pas parallèles ». Ses nombres ne sont pas ceux de la مسألة
 * (80, 100, 24, 30, 36, 44–46, 3/10, 9/20, 23/50) ni ceux des manches du labo ; ils sont CALCULÉS.
 */
const AM = 6;
const AB = 15;
const AN = 4;
const AC = 10;
const MB = AB - AM;               // 9 — la partie qui reste
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const red = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
const [wn, wd] = red(AM, MB);     // 2/3 — le mauvais rapport (partie sur partie)
const [rn, rd] = red(AM, AB);     // 2/5 — la bonne (partie sur tout)
const [cn, cd] = red(AN, AC);     // 2/5
export const NUMS = { AM, AB, AN, AC, MB, wrong: [wn, wd], right: [rn, rd], other: [cn, cd] };

const f = (n, d) => `\\dfrac{${n}}{${d}}`;

export const PEER_KID = { name: 'رياض', figure: { outfit: 'green' } };

export const PEER_SHEET = {
  id: 'm2-riyad',
  task: `يريد رياض أن يعرف هل $(MN) \\parallel (BC)$ ، علمًا أن $AM = ${AM}$ و $AB = ${AB}$ و $AN = ${AN}$ و $AC = ${AC}$ .`,
  lines: [
    'النقط A ، M ، B والنقط A ، N ، C مرتبة بالترتيب نفسه.',
    `$MB = ${AB} - ${AM} = ${MB}$ ، إذن $${f('AM', 'MB')} = ${f(AM, MB)} = ${f(wn, wd)}$ .`,
    `$${f('AN', 'AC')} = ${f(AN, AC)} = ${f(cn, cd)}$ .`,
    `$${f(wn, wd)} \\neq ${f(cn, cd)}$ ، إذن (MN) لا يوازي (BC).`,
  ],
  errorLine: 1,
  fixes: [
    { text: `نقسم الجزء AM على الطول كله AB: $${f('AM', 'AB')} = ${f(AM, AB)} = ${f(rn, rd)}$ .`, ok: true },
    { text: `نقلب النسبة الثانية: $${f('AC', 'AN')} = ${f(AC, AN)}$ .`, why: 'قلب النسبة الثانية لا يصلح شيئًا: الخطأ في النسبة الأولى، حيث قُسم الجزء AM على الجزء الآخر MB.' },
    { text: 'الخطأ في الترتيب: النقط ليست مرتبة بالترتيب نفسه.', why: 'M بين A و B و N بين A و C: الترتيب نفسه. الخطأ في النسبة الأولى.' },
  ],
  fixedLines: { 3: `$${f(rn, rd)} = ${f(cn, cd)}$ والنقط مرتبة بالترتيب نفسه، إذن (MN) يوازي (BC).` },
  why: 'نقارن في المستقيمين النوع نفسه من النسب: الجزء من A على الطول كله، AM على AB و AN على AC — لا الجزء على الجزء الآخر.',
};
