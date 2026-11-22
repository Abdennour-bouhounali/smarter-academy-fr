/**
 * What this product does not show YET, because its French content does not exist (docs/FRANCE_REBUILD_PLAN.md §7
 * decision 3, §8bis). Not a country switch and not a runtime setting: the list of what is not ready, read at build
 * time. A feature that is off has no door, no menu entry, no home section, no link and no card; its routes go back to
 * the space's home and nothing calls its API. Its code stays, ready to be switched back on.
 *
 * Each line is DELETED (with the checks that name it) the day its feature has French content.
 */
export const features = Object.freeze({
  // The printed-books store — on when the French books exist (owner, 2026-11-22).
  books: false,
  // The thinking lab — on when the thinking-lab challenge bank holds French challenges.
  thinkingLab: false,
  // The daily challenge — on when the French question bank it draws from exists.
  dailyChallenge: false,
  // The year compass — on when the French school calendar and progression are written (plan Stage 2D).
  compass: false,
  // The 6e diagnostic — on when the 6e lessons it recommends exist.
  diagnostic: false,
});

/** Is this feature shown? An unknown name is off: only what is listed here and true is ready. */
export function isFeatureOn(name) {
  return features[name] === true;
}
