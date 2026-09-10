/**
 * Le lecteur de réponses de la leçon.
 *
 * POURQUOI CE FICHIER. La leçon AFFICHE partout le vrai signe moins
 * typographique U+2212 (« −0,5 », « −√2/2 »), parce que c'est l'écriture
 * mathématique juste — et l'élève RECOPIE ce qu'il voit. Or `parseDec` du
 * noyau refuse U+2212 et rend NaN : une réponse juste serait déclarée fausse.
 * (Piège payé par trois agents du lot 1 ; il n'est pas repayé ici.)
 *
 * `parseReel` est donc le SEUL lecteur employé par les modules : il normalise
 * les trois tirets longs avant de déléguer à `parseDec`. Son contrat est
 * verrouillé par `trigEqUtils.test.js` — y compris le contrat CROISÉ « tout ce
 * que la leçon écrit, `parseReel` sait le relire ».
 */
import { parseDec } from '@smarter-academy/core';
import { parseSigned } from './trigEqUtils';

export const parseReel = parseSigned(parseDec);
export default parseReel;
