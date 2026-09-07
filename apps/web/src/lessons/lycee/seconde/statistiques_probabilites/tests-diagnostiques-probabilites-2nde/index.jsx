import React from 'react';
import LessonIndex from '../../../../common/components/LessonIndex';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

// La carte des connaissances (tiroir « Ma carte ») est montée par
// LessonKnowledgeProvider dans routes.jsx, pour cette page comme pour chaque
// module — pas de montage local.
export default function TestsDiagnostiques2ndeIndex() {
  return <LessonIndex config={LESSON_CONFIG} basePath={LESSON_BASE_PATH} />;
}
