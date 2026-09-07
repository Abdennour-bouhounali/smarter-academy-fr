#!/usr/bin/env node
/**
 * check-non-blocking — INVARIANT DUR : une mauvaise réponse ne bloque JAMAIS
 * la progression (docs/architecture/LESSON_CONTRACT.md § Progression non
 * bloquante).
 *
 * CE QUE CE SCRIPT DÉTECTE
 * ------------------------
 * Le kit de leçon appelle `onAnswered(isCorrect)` de façon INCONDITIONNELLE,
 * et révèle la bonne réponse en cas d'erreur sans boucle « Réessayer »
 * (lessons/common/kit/questions.jsx). Une étape est donc censée être `done`
 * dès que l'élève a RÉPONDU — pas dès qu'il a répondu JUSTE.
 *
 * Un module qui écrit :
 *
 *     onAnswered={(ok) => { if (ok) setQ2(true); }}
 *
 * rompt ce contrat : l'étape ne se valide jamais après une erreur, le module
 * ne se termine pas, `nextLink` reste `undefined` (ContentModule) et le
 * module suivant reste verrouillé (packages/core/lessonAccess.js). Comme le
 * QCM a déjà révélé la réponse et ne se laisse pas re-répondre, l'élève est
 * enfermé sans issue : il doit recharger la page. C'est le défaut que cet
 * audit rend impossible à réintroduire.
 *
 * CE QUI RESTE AUTORISÉ, et pourquoi
 * ----------------------------------
 * Une manipulation REJOUABLE (glisser un point, relancer un robot, cliquer
 * une barre) peut n'avancer que sur un geste juste : l'élève recommence
 * autant qu'il veut, rien ne se referme. De même, un composant à essais
 * bornés qui FINIT par révéler la solution et appeler `onDone(false)`
 * (BuildCheck, ProofOrder) est conforme : le chemin de sortie existe.
 *
 * L'audit ne signale donc QUE les questions du kit — TapQuestion,
 * NumericQuestion, BatchChoiceQuestion — dont la complétion est conditionnée
 * à la justesse, parce que ce sont précisément celles qui ne peuvent pas
 * être re-répondues.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const LESSONS = join(ROOT, 'apps/web/src/lessons');

/** Tous les .jsx sous lessons/. */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith('.jsx')) out.push(p);
  }
  return out;
}

/**
 * `onAnswered` est le point d'entrée des questions du kit, et lui seul.
 *
 * On isole le CORPS du handler, puis on ne signale que le cas où TOUT le
 * corps est sous condition de justesse. Un `if (ok)` qui ne pilote qu'un
 * effet cosmétique (confettis, ondulation) alors que l'avancement est appelé
 * en dehors — le motif de `contenances/Module01Mission` — est conforme et ne
 * doit pas être signalé : ce qui compte est que l'avancement, lui, soit
 * inconditionnel.
 */
const HANDLER = /onAnswered=\{\s*(\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*/g;

/** Extrait le corps du handler à partir de la fin de la flèche. */
function handlerBody(src, from) {
  if (src[from] !== '{') {
    // Forme concise : `onAnswered={(ok) => expr}` — le corps s'arrête au `}` du JSX.
    let d = 1;
    for (let i = from; i < src.length; i += 1) {
      if (src[i] === '{') d += 1;
      else if (src[i] === '}') { d -= 1; if (d === 0) return src.slice(from, i); }
    }
    return src.slice(from);
  }
  let d = 0;
  for (let i = from; i < src.length; i += 1) {
    if (src[i] === '{') d += 1;
    else if (src[i] === '}') { d -= 1; if (d === 0) return src.slice(from + 1, i); }
  }
  return src.slice(from);
}

/** Le corps fait-il AVANCER l'élève hors de toute condition de justesse ? */
function advancesUnconditionally(body) {
  // On retire tout ce qui est gardé par `if (ok)` / `ok &&` / `if (!ok) return`.
  const guarded = body
    .replace(/if\s*\(\s*!\s*ok\s*\)\s*return[^;]*;/g, '')
    .replace(/if\s*\(\s*ok\s*\)\s*\{[^}]*\}/g, '')
    .replace(/if\s*\(\s*ok\s*\)[^;\n]*;?/g, '')
    .replace(/\bok\s*&&[^;\n]*;?/g, '');
  // Reste-t-il un appel (avancement, marquage, callback) en dehors ?
  return /[A-Za-z_$][\w$.?]*\s*\(/.test(guarded);
}

const findings = [];
for (const file of walk(LESSONS)) {
  const src = readFileSync(file, 'utf8');
  if (!src.includes('onAnswered')) continue;
  HANDLER.lastIndex = 0;
  let m;
  while ((m = HANDLER.exec(src)) !== null) {
    const start = HANDLER.lastIndex;
    const body = handlerBody(src, start);
    // Le handler ignore la justesse : conforme par construction.
    if (!/\bok\b/.test(body)) continue;
    // Il la lit, mais avance quand même en dehors de la garde : conforme.
    if (advancesUnconditionally(body)) continue;
    findings.push({ file: relative(ROOT, file), line: src.slice(0, m.index).split('\n').length });
  }
}

if (findings.length === 0) {
  console.log('✅ Progression non bloquante : aucune question du kit ne conditionne son avancement à la justesse.');
  process.exit(0);
}

console.error(`❌ ${findings.length} question(s) bloquent la progression après une mauvaise réponse :\n`);
for (const f of findings) {
  console.error(`   ${f.file}:${f.line}`);
}
console.error(`
   INVARIANT : une mauvaise réponse est une PREUVE pédagogique, jamais un
   verrou (docs/architecture/LESSON_CONTRACT.md § Progression non bloquante).

   Le kit appelle déjà onAnswered(isCorrect) inconditionnellement et affiche
   la correction. L'étape doit donc se valider dès que l'élève a RÉPONDU :

     - onAnswered={(ok) => { if (ok) setQ2(true); }}
     + onAnswered={() => setQ2(true)}

   Si l'exercice mérite un vrai réessai, utiliser un composant à essais
   bornés qui révèle la solution et appelle onDone(false) (voir BuildCheck).`);
process.exit(1);
