/**
 * « Brevet blanc » of lesson `thales-configuration-papillon` — its EXERCISE BANK, served AS IT IS:
 * `content/practice/3e/thales-configuration-papillon`, five levels of ten exam sheets, read through the practice space's
 * loader; the sheets' figures are drawn by the kit (`statement.figure`). The frame, the marking, the evidence (re-computed
 * by the server) are the kit's: `gameworld/kit/bankSitting.js`. Nothing of the bank is written here.
 */
import { BANK_LEVELS, createBankSittings } from '../../../../../../common/gameworld/kit/bankSitting';

export const LEVELS = BANK_LEVELS;
export const sittings = createBankSittings({ lesson: 'thales-configuration-papillon', levels: LEVELS });
