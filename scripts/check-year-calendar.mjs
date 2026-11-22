#!/usr/bin/env node
/**
 * check-year-calendar — le calendrier scolaire et les progressions de « بوصلتي ».
 *
 *   node scripts/check-year-calendar.mjs                      # vérifie (CI, dans check:lessons)
 *   node scripts/check-year-calendar.mjs --today 2027-09-01   # simule une date
 *
 * Échoue si :
 *  - un calendrier ou une progression est mal formé (dates, semaines, examens) ;
 *  - une leçon placée n'existe pas dans le catalogue du niveau, est placée deux
 *    fois, ou une leçon du catalogue n'est ni placée ni déclarée `unscheduled`
 *    avec une raison ;
 *  - l'année scolaire en cours n'a PAS de calendrier (règle du propriétaire,
 *    2026-11-09 : renouvelé chaque année). Du 1er juin au 14 août, l'absence de
 *    l'année suivante n'est qu'un avertissement.
 *
 * Contrat : docs/architecture/YEAR_COMPASS.md §3.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SCHOOL_YEARS, GRADES, validateSchoolYear, yearlyRenewal,
} from '../packages/core/curriculum/dz/calendar/schoolCalendar.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const todayArg = args.includes('--today') ? args[args.indexOf('--today') + 1] : null;
const today = todayArg ?? new Date().toISOString().slice(0, 10);

function catalogueCodes(grade, schoolYear) {
  const file = join(ROOT, `packages/core/curriculum/dz/lessons_${grade}_${schoolYear.replace('/', '_')}.json`);
  return JSON.parse(readFileSync(file, 'utf8')).lessons.map((l) => l.code);
}

let errors = 0;
for (const [year, { calendar, progressions }] of Object.entries(SCHOOL_YEARS)) {
  const catalogues = Object.fromEntries(GRADES.map((g) => [g, catalogueCodes(g, year)]));
  const r = validateSchoolYear({ calendar, progressions, catalogues });
  for (const w of r.warnings) console.log(`  ⚠ ${year} ${w}`);
  for (const e of r.errors) console.error(`  ✗ ${year} ${e}`);
  errors += r.errors.length;
  const placed = GRADES
    .map((g) => `${g} ${progressions[g].weeks.reduce((n, w) => n + w.lessons.length, 0)}`)
    .join(' · ');
  console.log(`${r.errors.length ? '✗' : '✓'} ${year}: ${calendar.weeks.length} semaines, ${calendar.events.length} évènements — leçons placées ${placed}`);
}

const renewal = yearlyRenewal(Object.keys(SCHOOL_YEARS), today);
for (const w of renewal.warnings) console.log(`  ⚠ ${w}`);
for (const e of renewal.errors) console.error(`  ✗ ${e}`);
errors += renewal.errors.length;
console.log(`${renewal.errors.length ? '✗' : '✓'} année en cours (${today}) : ${renewal.current}`);

if (errors) {
  console.error(`\ncheck-year-calendar : ${errors} erreur(s). Contrat : docs/architecture/YEAR_COMPASS.md §3.`);
  process.exit(1);
}
