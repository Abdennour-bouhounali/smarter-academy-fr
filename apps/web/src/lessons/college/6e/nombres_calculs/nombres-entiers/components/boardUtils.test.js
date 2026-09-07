import { describe, it, expect } from 'vitest';
import {
  PIECES, EMPTY_BOARD, boardValue, pieceCount, place, removeOne,
  canExchangeUp, exchangeUp, canBreakDown, breakDown,
  isTidy, tidyBoard, pendingExchanges, tidyUp,
} from './boardUtils';

describe('boardValue — le nombre dérive du plateau', () => {
  it('compte chaque objet à sa valeur', () => {
    expect(boardValue({ UM: 1, C: 2, D: 0, U: 5 })).toBe(1205);
    expect(boardValue(EMPTY_BOARD)).toBe(0);
  });

  it('ne dépend pas du rangement : 50 unités valent 5 dizaines', () => {
    expect(boardValue({ U: 50 })).toBe(boardValue({ D: 5 }));
  });
});

describe("l'échange est un THÉORÈME, pas une phrase du cours", () => {
  it('échanger ne change JAMAIS la valeur du plateau', () => {
    // Balayage : toutes les colonnes, de 10 à 40 objets, plus un fond
    // aléatoire fixe — l'invariant doit tenir partout.
    for (const p of PIECES) {
      if (!PIECES.some((q) => q.upFrom === p.key)) continue;
      for (let n = 10; n <= 40; n += 1) {
        const b = { ...EMPTY_BOARD, UM: 1, C: 3, D: 2, U: 4, [p.key]: n };
        expect(boardValue(exchangeUp(b, p.key))).toBe(boardValue(b));
      }
    }
  });

  it("échanger fait maigrir le plateau de 9 objets", () => {
    const b = { ...EMPTY_BOARD, U: 12 };
    expect(pieceCount(exchangeUp(b, 'U'))).toBe(pieceCount(b) - 9);
  });

  it('casser ne change pas non plus la valeur, et grossit le plateau', () => {
    const b = { ...EMPTY_BOARD, D: 5 };
    const after = breakDown(b, 'D');
    expect(boardValue(after)).toBe(boardValue(b));
    expect(pieceCount(after)).toBe(pieceCount(b) + 9);
  });

  it('refuse un échange impossible et ne casse rien au-dessus du millier', () => {
    expect(canExchangeUp({ ...EMPTY_BOARD, U: 9 }, 'U')).toBe(false);
    expect(exchangeUp({ ...EMPTY_BOARD, U: 9 }, 'U')).toEqual({ ...EMPTY_BOARD, U: 9 });
    expect(canExchangeUp({ ...EMPTY_BOARD, UM: 20 }, 'UM')).toBe(false);
    expect(canBreakDown({ ...EMPTY_BOARD, U: 3 }, 'U')).toBe(false);
  });
});

describe('ranger au plus court', () => {
  it('tidyUp donne exactement le plateau canonique, à valeur égale', () => {
    for (const n of [0, 7, 50, 99, 347, 1205, 2450, 9999]) {
      const messy = { UM: 0, C: 0, D: 0, U: n };
      const tidied = tidyUp(messy);
      expect(boardValue(tidied)).toBe(n);
      expect(tidied).toEqual(tidyBoard(n));
      expect(isTidy(tidied)).toBe(true);
    }
  });

  it('signale les colonnes échangeables de la plus petite à la plus grande', () => {
    expect(pendingExchanges({ UM: 0, C: 0, D: 12, U: 14 })).toEqual(['U', 'D']);
    expect(pendingExchanges({ UM: 0, C: 0, D: 2, U: 4 })).toEqual([]);
  });
});

describe('poser et retirer', () => {
  it('poser un objet ajoute exactement sa valeur', () => {
    expect(boardValue(place(EMPTY_BOARD, 'C'))).toBe(100);
    expect(boardValue(place(place(EMPTY_BOARD, 'D'), 'D'))).toBe(20);
  });

  it('retirer ne descend jamais sous zéro', () => {
    expect(removeOne(EMPTY_BOARD, 'U')).toEqual(EMPTY_BOARD);
  });
});
