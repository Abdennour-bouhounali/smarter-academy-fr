import React from 'react';
import LessonIndex from '../../../../common/components/LessonIndex';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

/**
 * Page d'accueil de la leçon : Puissances (3ème)
 *
 * Toute la logique d'affichage est déléguée au composant générique LessonIndex.
 * Pour modifier la structure, éditez lesson.config.js.
 */
export default function Puissances3e() {
  return (
    <LessonIndex
      config={LESSON_CONFIG}
      basePath={LESSON_BASE_PATH}
    />
  );
}
