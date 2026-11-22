/**
 * « الدخيل » — une énigme (pure) : 4 ou 5 cartes, toutes ÉGALES entre elles
 * sauf UNE, « الدخيل ». Elle vient du paquet de « قنّاص القيم » (sniper/cards.js) :
 * les cartes égales à la cible de la manche, plus UN piège — l'erreur typique
 * qui ressemble aux autres sans valoir la même chose. La vérité est donc celle
 * du paquet (valeurs exactes, relues par cards.test.js).
 *
 * Pas de cible affichée : c'est à l'élève de VOIR ce que les cartes partagent.
 */
import { createRng } from '../engine/rng';
import { makeRound } from '../sniper/cards';

export function makePuzzle(seed, i, { level = 1, sub = 1 } = {}) {
  const round = makeRound(seed, i, { level, sub });
  const equal = round.cards.filter((c) => c.equal);
  const odd = round.cards.find((c) => !c.equal);
  const rng = createRng((seed ^ Math.imul(i + 7, 0x27d4eb2d)) >>> 0);
  const cards = [...equal, odd].map((c) => ({ ...c, odd: c === odd }));
  for (let j = cards.length - 1; j > 0; j -= 1) {
    const k = Math.floor(rng.next() * (j + 1));
    [cards[j], cards[k]] = [cards[k], cards[j]];
  }
  return {
    i,
    level: round.level,
    sub: round.sub,
    levelId: round.levelId,
    domain: round.domain,
    mode: round.mode,
    at: round.at,
    // Ce que les cartes égales partagent : la valeur (ou la solution) de la manche.
    common: round.target,
    cards: cards.map((c, j) => ({ id: `${i}:${j}`, tokens: c.tokens, value: c.value, odd: c.odd, text: c.text })),
    oddIndex: cards.findIndex((c) => c.odd),
  };
}
