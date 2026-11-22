/**
 * « ورقة زميل » du module 2 (rollout 2026-11-10, unité 2 leçon 5 ; conseil du 2026-11-10) — contenu PROPRE à la plateforme : le camarade est
 * inventé (KidFigure). L'idée fausse visée est celle de la leçon : S'ARRÊTER à une écriture k√b qui n'est pas la plus simple, parce que b n'est
 * pas un carré — « 24 n'est pas un carré, donc 2√24 est la plus simple ». Ses nombres ne sont pas ceux de la مسألة (200, 10√2, 100, 50, 2√50,
 * 5√8, 120, 12, 10) ni ceux des manches du labo (75, 32, 80, 72) ; 96 n'est qu'une aire de l'atelier libre. Les nombres sont CALCULÉS.
 */
const N = 96;
const K1 = 2;                    // le premier carré trouvé : 4 = 2²
const B1 = N / (K1 * K1);        // 24 — pas un carré, mais divisible par 4
const KM = 4;                    // le plus grand : 16 = 4²
const M = N / (KM * KM);         // 6
const HALF = (N / 2);            // 48 — la fausse correction « 2√24 = √48 »
export const NUMS = { N, K1, B1, KM, M, HALF };

export const PEER_KID = { name: 'رياض', figure: { outfit: 'blue' } };

export const PEER_SHEET = {
  id: 'm2-riyad',
  task: `كتب رياض $\\sqrt{${N}}$ على الشكل $a\\sqrt{b}$ حيث $b$ أصغر ما يمكن.`,
  lines: [
    `$${N} = ${K1 * K1} \\times ${B1}$ و $${K1 * K1} = ${K1}^2$ .`,
    `إذن $\\sqrt{${N}} = ${K1}\\sqrt{${B1}}$ .`,
    `العدد ${B1} ليس مربّعًا، إذن $${K1}\\sqrt{${B1}}$ هي أبسط كتابة.`,
  ],
  errorLine: 2,
  fixes: [
    { text: `${B1} ليس مربّعًا لكنّه يقبل القسمة على مربّع: $${B1} = ${K1}^2 \\times ${M}$ ، إذن $\\sqrt{${N}} = ${K1} \\times ${K1}\\sqrt{${M}} = ${KM}\\sqrt{${M}}$ .`, ok: true },
    { text: `أبسط كتابة هي $\\sqrt{${HALF}}$ .`, why: `$${K1}\\sqrt{${B1}} = \\sqrt{${K1}^2 \\times ${B1}} = \\sqrt{${N}}$ ، لا $\\sqrt{${HALF}}$ .` },
    { text: `أبسط كتابة هي $\\sqrt{${N}}$ نفسه.`, why: `$\\sqrt{${N}}$ ليس على الشكل المطلوب: أكبر مربّع يقسم ${N} هو $${KM * KM} = ${KM}^2$ .` },
  ],
  why: 'لا يكفي أن يكون b غير مربّع: أبسط كتابة حين لا يقبل b القسمة على أيّ مربّع غير 1 — نبحث عن أكبر مربّع يقسم العدد.',
};
