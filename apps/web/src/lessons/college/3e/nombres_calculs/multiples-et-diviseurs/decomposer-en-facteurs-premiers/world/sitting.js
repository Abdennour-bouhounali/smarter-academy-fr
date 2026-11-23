/**
 * « Brevet blanc » of lesson `decomposer-en-facteurs-premiers` — its EXERCISE BANK, served AS IT IS:
 * `content/practice/3e/decomposer-en-facteurs-premiers`, five levels of ten exam sheets, read through the practice
 * space's loader. The frame, the marking (the practice evaluator, `factorization` answers included), the evidence (the
 * practice engine, re-computed by the server) are the kit's: `gameworld/kit/bankSitting.js`. Nothing of the bank is
 * written here.
 */
import { BANK_LEVELS, createBankSittings } from '../../../../../../common/gameworld/kit/bankSitting';

export const LEVELS = BANK_LEVELS;
export const sittings = createBankSittings({ lesson: 'decomposer-en-facteurs-premiers', levels: LEVELS });
