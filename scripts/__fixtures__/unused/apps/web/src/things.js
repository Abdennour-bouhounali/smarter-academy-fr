export const used = () => 1;
export const usedByAlias = () => 2;
export const deadExport = () => 3;
export const onlyInside = () => 4;
export const testedAndUsedInside = () => onlyInside();
export const testedOnly = () => 5;
const helper = () => testedAndUsedInside();
export default helper;
