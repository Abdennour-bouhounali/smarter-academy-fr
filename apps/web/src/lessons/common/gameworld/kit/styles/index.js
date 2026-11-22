/**
 * The style sheets of a game world, one per screen. Classes keep the prefix `di-`.
 *
 * THE ORDER IS THE CASCADE: a later sheet overrides an earlier one (`fit.css` removes every scroll, `phone.css` re-lays
 * each screen for a phone held sideways). A new sheet is added at its place in this list, never imported from a screen.
 */
import './world.css'; // the HUD, the glass panels, the dash, the overlays, the title screen, the prompts in the world
import './practice.css'; // a run of the practice game, its map, the guidance card, the result of a run
import './knowledge.css'; // « خريطة المعارف »: the full page
import './cases.css'; // the screen of a real-world case
import './trainer.css'; // « تدرّب » on a card: the game look and the exam look
import './paper.css'; // « وضع الورقة »: the paper mode
import './steps.css'; // « حيلة », what is known at this step, the earlier steps read again
import './knowledgeJourney.css'; // « خريطة المعارف »: the discovery journey
import './fit.css'; // no scrolling anywhere: every panel fits its content (Fit.jsx)
import './spaces.css'; // the two practice spaces, the ladder of the exam, the promotion, « تقدّمي »
import './phone.css'; // a phone held sideways — always last
