// The Algerian platform's locale/direction foundation — one small module,
// not a country-abstraction framework (ALGERIA_PLATFORM_MASTER_SPEC.md §1
// forbids building multi-country architecture). This repo serves exactly
// one product (Algeria, ar-DZ, RTL) and these are fixed values, not a
// runtime switch — a future additional locale would extend this file, not
// turn it into a country-selector.
//
// Consumers needing the current locale/direction as data (not just CSS)
// import LOCALE/DIRECTION from here rather than hardcoding 'ar'/'rtl'
// inline, so there is exactly one place to look when either ever changes.
export const LOCALE = 'ar-DZ';
export const DIRECTION = 'rtl';
export const IS_RTL = DIRECTION === 'rtl';
