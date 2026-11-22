// A walk on the shared dev server while other agents write in the tree (defects.md C6): every edit they save makes Vite
// send « full-reload » and the walk's page reloads under it (2026-11-19: the world vanished after a reload; the launch
// kit's capsule timed out on a navigation nobody made). The page's HMR websocket is answered by a SILENT mock (Playwright
// `routeWebSocket`, no connection to the server): Vite's client sees an open socket and never hears of an edit, so the
// page keeps the modules it loaded. Modules it loads LATER (a lazy screen) still come from the tree as it is then — a
// frozen copy (SKILL.md §4) remains the clean measure.
//
// `deafAll()` makes EVERY browser context deaf from its first page, including those the shared libraries open themselves
// (lib/walk.mjs, lib/launchKitTwoTools.mjs, lib/sittingWalk.mjs all open their pages through `chromium.launch` and
// `browser.newContext`): the runner calls it once; nothing else changes in those libraries.
import { chromium } from 'playwright';

const VITE_HMR = /^wss?:\/\/[^/]+\/(\?.*)?$/;

/** Before any page of `context` loads. */
export const deafContext = (context) => context.routeWebSocket(VITE_HMR, () => {});

let patched = false;
export function deafAll() {
  if (patched || process.env.E2E_HMR === '1') return;
  patched = true;
  const launch = chromium.launch.bind(chromium);
  chromium.launch = async (...args) => {
    const browser = await launch(...args);
    const newContext = browser.newContext.bind(browser);
    browser.newContext = async (...opts) => {
      const context = await newContext(...opts);
      await deafContext(context);
      return context;
    };
    return browser;
  };
}
