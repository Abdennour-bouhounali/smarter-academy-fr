/**
 * Les réglages de l’atelier qui ne sont pas des instruments.
 *
 * LE CÔTÉ LYCÉE — caché en France (décision du propriétaire, 2026-11-23) : la
 * plateforme enseigne le collège (6e, 5e, 4e, 3e). Les instruments du lycée
 * (vecteurs, suites, coniques, analyse) et les capacités `secondaire` des
 * instruments partagés restent dans le code, intacts, mais tant que ce
 * drapeau vaut `false` aucun menu, aucune route, aucun filtre ni aucune
 * recherche ne les atteint : le registre (`toolRegistry.js`) ne publie que
 * l’atelier du collège, et `?lab=secondaire` est ignoré (labScope.js).
 * Voir MATH_LAB.md §2.1.
 */
export const LYCEE_LAB_ENABLED = false;
