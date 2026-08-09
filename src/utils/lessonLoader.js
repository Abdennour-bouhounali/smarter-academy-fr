/**
 * Lesson & Content Metadata Loader Utility
 * ----------------------------------------
 * This module will automatically scan and load dynamic lesson/resource metadata
 * from the static public directory (`/public/lessons/` & `/public/resources/`).
 *
 * Metadata Schema Specification:
 * {
 *   "title": string,       // e.g. "Les Équations du Second Degré"
 *   "slug": string,        // e.g. "equations-second-degre"
 *   "level": string,       // e.g. "college" | "lycee" | "brevet" | "bac"
 *   "chapter": string,     // e.g. "Algèbre & Fonctions"
 *   "duration": string,    // e.g. "45 min"
 *   "description": string, // Detailed course overview
 *   "keywords": string[]   // e.g. ["delta", "racines", "polynôme"]
 * }
 */

/**
 * Fetch lesson metadata by category and slug
 * @param {string} levelCategory - 'college' | 'lycee' | 'brevet' | 'bac'
 * @param {string} slug - Lesson identifier
 * @returns {Promise<Object|null>} Metadata JSON object or null if not found
 */
export async function loadLessonMetadata(levelCategory, slug) {
  // FUTURE IMPLEMENTATION:
  // Dynamically fetch `/lessons/${levelCategory}/${slug}/metadata.json`
  try {
    const response = await fetch(`/lessons/${levelCategory}/${slug}/metadata.json`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn(`[lessonLoader] Could not load lesson metadata for ${levelCategory}/${slug}:`, error);
    return null;
  }
}

/**
 * Fetch all available lesson indices for a given category
 * @param {string} levelCategory - 'college' | 'lycee' | 'brevet' | 'bac'
 * @returns {Promise<Array>} Array of lesson metadata objects
 */
export async function fetchLessonsIndex(levelCategory) {
  // FUTURE IMPLEMENTATION:
  // Fetch dynamic index manifest or iterate generated lesson manifests
  return [];
}

/**
 * Fetch resource metadata by type and slug
 * @param {string} resourceType - 'fiches' | 'exercices' | 'annales' | 'conseils'
 * @param {string} slug - Resource identifier
 * @returns {Promise<Object|null>} Metadata JSON object or null if not found
 */
export async function loadResourceMetadata(resourceType, slug) {
  try {
    const response = await fetch(`/resources/${resourceType}/${slug}/metadata.json`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn(`[lessonLoader] Could not load resource metadata for ${resourceType}/${slug}:`, error);
    return null;
  }
}
