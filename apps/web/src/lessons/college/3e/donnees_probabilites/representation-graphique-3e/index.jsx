import React from 'react';
import LessonIndex from '../../../../common/components/LessonIndex';
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

export default function RepresentationGraphiqueHome() {
  return <LessonIndex config={LESSON_CONFIG} basePath={LESSON_BASE_PATH} />;
}
