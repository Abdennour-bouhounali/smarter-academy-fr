/**
 * « ورقة بلال » — la dernière étape du module 2 (rollout 2026-11-11, unité 3 leçon 3 ; conseil du 2026-11-11, verdict X4 et L3.4) — contenu PROPRE
 * à la plateforme : le camarade est inventé (KidFigure, en sweat). L'idée fausse visée est le piège de la fiche-mémoire « نسيان الواحد » : un terme
 * divisé par lui-même donnerait 0, et le « 1 » disparaît du crochet. Distincte du leurre de la construction du labo (le dernier terme NON divisé)
 * et de la correction de la مسألة (le facteur incomplet de أمين). Ses nombres ne sont pas ceux de la مسألة ; ils sont CALCULÉS.
 */
import { evaluate, commonMonomial, divideByMonomial, termTex, termsTex } from '@smarter-academy/core/arithmetic/polynomials.js';

const A = [{ c: 8, p: 2 }, { c: 4, p: 1 }];          // A = 8x² + 4x
const K = commonMonomial(A);                          // 4x
const RIGHT = divideByMonomial(A, K);                 // 2x + 1
const WRONG = [RIGHT[0], { c: 0, p: 0 }];             // 2x + 0 : le « 1 » perdu
const X = 1;
const value = (common, inner) => evaluate([common], X) * evaluate(inner, X);
export const NUMS = { A, K, RIGHT, X, at: evaluate(A, X), right: value(K, RIGHT), wrong: value(K, WRONG) };

const k = termTex(K);
const a = termsTex(A);

export const PEER_KID = { name: 'بلال', figure: { outfit: 'green' } };

export const PEER_SHEET = {
  id: 'm2-bilal',
  task: `حلّل بلال العبارة $A = ${a}$ ، ثم تحقّق من أجل $x = ${X}$ : العبارة تعطي ${NUMS.at} لكنّ تحليله يعطي ${NUMS.wrong}!`,
  lines: [
    `العامل المشترك بين $${termTex(A[0])}$ و $${termTex(A[1])}$ هو $${k}$ .`,
    `$${termTex(A[0])} = ${k} \\times ${termTex(RIGHT[0])}$ و $${termTex(A[1])} = ${k} \\times 0$`,
    `إذن $A = ${k}(${termTex(RIGHT[0])} + 0) = ${k} \\times ${termTex(RIGHT[0])}$`,
  ],
  errorLine: 1,
  fixes: [
    { text: `قسمة حدّ على نفسه تعطي 1 لا 0 : $${termTex(A[1])} = ${k} \\times 1$`, ok: true },
    { text: `$${termTex(A[1])} = ${k} \\times 4$`, why: `$${k} \\times 4 = ${termTex({ c: K.c * 4, p: K.p })}$ ، لا $${termTex(A[1])}$ .` },
    { text: `$${termTex(A[0])} = ${k} \\times ${k}$`, why: `$${k} \\times ${k} = ${termTex({ c: K.c * K.c, p: 2 * K.p })}$ ، والحدّ الثاني يبقى خاطئًا.` },
  ],
  fixedLines: { 2: `$A = ${k}(${termsTex(RIGHT)})$ ، ومن أجل $x = ${X}$ : $${evaluate([K], X)} \\times ${evaluate(RIGHT, X)} = ${NUMS.right}$` },
  why: `$${termTex(A[1])} \\div ${k} = 1$ : الحدّ الذي يساوي العامل المشترك يترك 1 داخل القوسين، لا 0. ومن أجل $x = ${X}$ نجد ${NUMS.right} كما تعطيه العبارة.`,
};
