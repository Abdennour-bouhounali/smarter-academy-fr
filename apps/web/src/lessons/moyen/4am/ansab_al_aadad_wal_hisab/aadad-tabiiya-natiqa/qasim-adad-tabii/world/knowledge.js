/**
 * What « خريطة المعارف » shows for lesson `qasim-adad-tabii`: the lesson's own mind map and memo sheets (imported, never
 * retyped), and where each of its thirteen cards sits on the full map.
 */
import { KNOWLEDGE_GRAPH, LESSON_KNOWLEDGE } from '../knowledge';

/** Where each node sits on the MAP (percent of the map box, drawn left-to-right; the lesson's « start » lane is on the RIGHT). */
const POSITIONS = {
  qasim: [50, 7],
  baqi: [76, 20],
  jidaa: [24, 20],
  tadhakkar: [82, 37],
  ex120: [17, 37],
  ex143: [74, 53],
  'khata-amil': [17, 54],
  tahaqqaq: [84, 66],
  siyagh: [48, 50],
  'khata-ittijah': [63, 80],
  wahid: [34, 73],
  intabih: [16, 87],
  khulasa: [48, 92],
};

export const KNOWLEDGE = { graph: KNOWLEDGE_GRAPH, modules: LESSON_KNOWLEDGE.modules, positions: POSITIONS };
