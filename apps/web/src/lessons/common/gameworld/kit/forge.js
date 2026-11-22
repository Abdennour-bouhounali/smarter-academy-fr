/**
 * « مصهر القاعدة » — the FRAME of a rule forge (PURE; it names no lesson and no world). The screen is RuleForge.jsx.
 *
 * A rule is not told, and it is not written in an empty box either: the student DEFENDS it.
 *   predict  cases he has not seen: « what will happen? » — three right in a row and the rule is in his head;
 *   build    he composes his rule from tiles, one per slot (many rules can be written, ONE holds);
 *   test     the rule is run on HIS OWN evidence, case by case; the first that contradicts it stops it;
 *   attack   a new case chosen to BREAK his rule (the counterexample), or, when the rule is the right one, hard cases;
 *   seal     a rule that survives becomes his key; he may say it in his own words;
 *   use      one case the world does not show: the rule must decide.
 * The verdict is never the platform's opinion: it is what the world did in front of him. The help never gives the rule.
 *
 * A forge is DATA and pure functions — the lesson gives it, built on its world's cases:
 *   key                the key of the lesson this forge makes
 *   slots              [{ id, label, options: [{ id, label }] }] — a rule is { [slot id]: option id }
 *   chip?(slot, option) how a chosen tile is written inside the rule (default: the option's label)
 *   says(rule, c)      what the student's rule says of a case: true (« yes ») or false (« no »)
 *   isTheRule(rule)    is it the rule that holds?
 *   ruleText(rule)     the rule as one sentence
 *   explain(rule, c)   the rule applied to one case, in words
 *   caseId(c)          the identity of a case: two lines of evidence about the same case are one
 *   evidence(rows)     the lines of evidence — from the world's log and from the cases the mirror showed (`mirror: true`)
 *   tests?(rule, rows) the cases the rule is run on (default: the evidence itself)
 *   predictCases(rows, rand), attacks(rule, rows), nudge(n, rows)
 *                      `predictCases` returning [] skips the prediction step: a forge without an `inquiry` then opens
 *                      on its tiles (its evidence came from the world, which held the predictions)
 *   use                { make(rand) → case, lines(case) → lines of tokens, verdict?: true, check(case, values, verdict) }
 *                      a token is a string or `slot(name, label, w)`; `check` returns 'ok' or a key of `text.use`
 *   logs?              true when a case the mirror shows joins the world's own log (`game.logMirror`)
 *   text               the wording of this forge (the screen lists the keys it reads)
 * A case always carries `held`: what the world really does with it.
 */
export const PREDICT_NEED = 3;
/** The lines of evidence the screen shows at once. */
export const EVIDENCE_MAX = 8;

/** A box to fill in the last step: its name in the answer, its label for a screen reader, its width in digits. */
export const slot = (name, label, w = 3) => ({ slot: name, label, w });

export const emptyRule = (forge) => Object.fromEntries(forge.slots.map((s) => [s.id, null]));
/** Has every slot one of its own tiles? */
export const complete = (forge, rule) =>
  Boolean(rule) && forge.slots.every((s) => s.options.some((o) => o.id === rule[s.id]));
export const optionOf = (forge, slotId, id) =>
  forge.slots.find((s) => s.id === slotId)?.options.find((o) => o.id === id) ?? null;
/** The rule as a short key, slot by slot: « r:zero ». */
export const ruleKey = (forge, rule) => forge.slots.map((s) => rule?.[s.id] ?? '').join(':');
/** The rule run on cases, in order: each agrees or not; `bad` = the first case that contradicts it (or −1). */
export function runOn(forge, rule, cases) {
  const marks = cases.map((c) => {
    const says = forge.says(rule, c);
    return { ...c, says, agrees: says === c.held };
  });
  return { marks, bad: marks.findIndex((m) => !m.agrees) };
}
/** The cases a rule is tested on: the forge's own choice, or the evidence itself. */
export const testsOf = (forge, rule, rows) => (forge.tests ? forge.tests(rule, rows) : rows);

/** How many right predictions end the list: three in a row and the rule is in his head. */
export const streak = (results) => {
  let n = 0;
  for (let i = results.length - 1; i >= 0 && results[i]; i -= 1) n += 1;
  return n;
};

/** How the rule was found — what a teacher wants to know: alone, with a nudge of the robot, or guided to a choice of two. */
export const discoveryLevel = (nudges) => (nudges === 0 ? 'alone' : nudges < 3 ? 'nudged' : 'guided');

/** What is kept of a forge when the rule is sealed (`WorldRuntime › rules[key]`). */
export const sealRecord = (forge, { rule, words, tries, nudges, results }) => ({
  rule,
  text: forge.ruleText(rule),
  words: words.trim(),
  tries,
  nudges,
  level: discoveryLevel(nudges),
  predictions: { asked: results.length, right: results.filter(Boolean).length },
  at: Date.now(),
});
