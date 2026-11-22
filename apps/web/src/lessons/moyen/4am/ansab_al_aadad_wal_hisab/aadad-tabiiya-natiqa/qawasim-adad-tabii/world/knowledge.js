/**
 * What « خريطة المعارف » shows for lesson `qawasim-adad-tabii`: the lesson's own mind map and memo sheets (imported, never
 * retyped), and where each of its eleven cards sits on the full map.
 */
import { KNOWLEDGE_GRAPH, LESSON_KNOWLEDGE } from '../knowledge';

/** Where each node sits on the MAP (percent of the map box, drawn left-to-right; the lesson's « start » lane is on the RIGHT). */
const POSITIONS = {
  qawasim: [50, 7],
  jidaa: [50, 23],
  rappel: [82, 30],
  ex60: [20, 34],
  'khata-nisyan': [17, 54],
  tariqa: [50, 47],
  ex105: [82, 55],
  'khata-nisf': [80, 76],
  qawaid: [28, 70],
  'khata-9': [18, 88],
  khulasa: [52, 92],
};

export const KNOWLEDGE = { graph: KNOWLEDGE_GRAPH, modules: LESSON_KNOWLEDGE.modules, positions: POSITIONS };
