/** DEV ONLY (`/__qa/accueil/:lessonId`): the student's home of a lesson with no account, to look at it and to walk it. */
import { useParams } from 'react-router-dom';
import { getLessonPath } from '@smarter-academy/core';
import { useLessonConfig } from '../../lessons/useLessonConfig';
import LessonHome from './LessonHome';

export default function LessonHomeQa() {
  const { lessonId } = useParams();
  const config = useLessonConfig(lessonId);
  return config ? <LessonHome config={config} basePath={getLessonPath(lessonId)} /> : null;
}
