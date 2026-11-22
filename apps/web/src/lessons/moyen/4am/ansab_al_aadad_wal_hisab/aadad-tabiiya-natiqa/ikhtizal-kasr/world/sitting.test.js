import { describeSitting } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { lesson } from './index';
import { sittings, LEVELS } from './sitting';

// « الامتحان الأبيض » of ikhtizal-kasr: the REAL bank (content/practice/4am/ikhtizal-kasr), served as it is.
describeSitting({ id: 'ikhtizal-kasr', lesson, sittings, levels: LEVELS });
