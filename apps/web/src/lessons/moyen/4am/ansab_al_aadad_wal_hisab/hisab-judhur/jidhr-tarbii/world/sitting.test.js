// « الامتحان الأبيض » of jidhr-tarbii: the REAL bank (content/practice/4am/jidhr-tarbii), served as it is — every level draws
// real sheets, every step of every sheet is markable to full points by its own answer key, nothing generated, « دج » only.
import { describeSitting } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { lesson } from './index';
import { LEVELS, sittings } from './sitting';

describeSitting({ id: 'jidhr-tarbii', lesson, sittings, levels: LEVELS });
