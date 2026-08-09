import React from 'react';
import LessonIndex from '../../../common/components/LessonIndex';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

/**
 * Page d'accueil de la leçon : Nombres rationnels (3ème)
 */
export default function NombresRationnels() {
  return (
    <LessonIndex
      config={LESSON_CONFIG}
      basePath={LESSON_BASE_PATH}
    />
  );
}
