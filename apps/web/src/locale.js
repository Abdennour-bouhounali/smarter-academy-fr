// The locale and direction of this product — one small module, not a country-abstraction framework. This
// repository serves France and nothing else: French (fr-FR), left to right, the Paris time zone. These are fixed
// values, not a runtime switch; there is no second locale (docs/architecture/FRENCH_LANGUAGE_CONTRACT.md).
//
// Consumers needing the locale, the direction or the time zone as data (an `Intl` call, a `toLocale*` call, a date
// computed for the school day) import them from here rather than writing 'fr-FR', 'ltr' or 'Europe/Paris' inline,
// so there is exactly one place to look.
export const LOCALE = 'fr-FR';
export const DIRECTION = 'ltr';
export const TIME_ZONE = 'Europe/Paris';
