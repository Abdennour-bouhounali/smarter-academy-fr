import { testedAndUsedInside, testedOnly } from '../things.js';

export const run = () => [testedAndUsedInside(), testedOnly()];
