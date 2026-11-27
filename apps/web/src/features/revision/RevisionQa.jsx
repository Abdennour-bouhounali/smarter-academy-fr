/** DEV ONLY (`/__qa/revision/:lessonId`): the student's revision page with no account, to look at it and to walk it. */
import { useParams } from 'react-router-dom';
import { usePackPart } from '../../lessons/lessonPack';
import RevisionArcade from './RevisionArcade';

export default function RevisionQa() {
  const { lessonId } = useParams();
  const data = usePackPart(lessonId, 'revision');
  return data ? <RevisionArcade key={lessonId} lessonId={lessonId} data={data} /> : null;
}
