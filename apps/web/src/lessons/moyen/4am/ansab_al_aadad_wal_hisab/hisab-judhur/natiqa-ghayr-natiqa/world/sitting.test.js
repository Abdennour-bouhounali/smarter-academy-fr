// « الامتحان الأبيض » of natiqa-ghayr-natiqa: the REAL bank (content/practice/4am/natiqa-ghayr-natiqa), served as it is —
// every level draws real sheets, every step of every sheet is markable to full points by its own answer key, « دج » only.
import { describeSitting } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { lesson } from './index';
import { LEVELS, sittings } from './sitting';

describeSitting({ id: 'natiqa-ghayr-natiqa', lesson, sittings, levels: LEVELS });
