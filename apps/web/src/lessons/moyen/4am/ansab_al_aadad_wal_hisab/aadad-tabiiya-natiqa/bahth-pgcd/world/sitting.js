/**
 * « الامتحان الأبيض » of lesson `bahth-pgcd` — its EXERCISE BANK, served AS IT IS (owner, 2026-11-18): `content/practice/4am/
 * bahth-pgcd`, five levels of ten exam sheets, read through the practice space's loader. The frame, the marking (the
 * practice evaluator), the evidence (the practice engine, re-computed by the server) are the kit's:
 * `gameworld/kit/bankSitting.js`. Nothing of the bank is written here.
 */
import { BANK_LEVELS, createBankSittings } from '../../../../../../common/gameworld/kit/bankSitting';

export const LEVELS = BANK_LEVELS;
export const sittings = createBankSittings({ lesson: 'bahth-pgcd', levels: LEVELS });
