import { isFeatureOn } from '../config/features';

/**
 * Which door is lit, and which line of pages shows, for an address. Pure: the menus and their tests share it.
 * A door owns its `path`, its `pages` and its `match` prefixes; the LONGEST prefix wins, so `/espace/cours` is never
 * taken by `/espace`.
 */
const under = (pathname, prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`);

function reach(door, pathname) {
  const prefixes = [...door.pages.map((page) => page.path), ...(door.match ?? [])];
  if (!door.end) prefixes.push(door.path);
  const hits = prefixes.filter((prefix) => under(pathname, prefix)).map((prefix) => prefix.length);
  if (door.end && pathname === door.path) hits.push(door.path.length);
  return hits.length ? Math.max(...hits) : 0;
}

/** The id of the door an address belongs to, or `null` (account pages belong to no door). */
export function activeDoorId(doors, pathname, accountLinks = []) {
  let best = null;
  let bestReach = 0;
  for (const door of doors) {
    const r = reach(door, pathname);
    if (r > bestReach) {
      best = door;
      bestReach = r;
    }
  }
  if (best) return best.id;
  if (accountLinks.some((link) => under(pathname, link.path))) return null;
  return doors.find((door) => door.rest)?.id ?? null;
}

/** The pages to show in one line under the header: only ON one of the door's own pages, and only if it has several. */
export function doorPagesFor(doors, pathname) {
  const door = doors.find((d) => d.pages.length > 1 && d.pages.some((page) => page.path === pathname));
  return door ? door.pages : [];
}

/** A menu item is drawn when its feature is on (`config/features.js`) and, if it sells, while payments are open. */
const shown = (item, paymentsOpen) => (!item.feature || isFeatureOn(item.feature)) && (!item.paid || paymentsOpen);

/** The links of an account menu that are drawn now. */
export function visibleLinks(links, { paymentsOpen = false } = {}) {
  return links.filter((link) => shown(link, paymentsOpen));
}

/**
 * The doors as the menus draw them: the hidden pages left out, and a door whose own address was hidden opens on its
 * first page left. A door with nothing left behind it is dropped.
 */
export function visibleDoors(doors, { paymentsOpen = false } = {}) {
  return doors
    .filter((door) => shown(door, paymentsOpen))
    .map((door) => {
      if (!door.pages.length) return door;
      const pages = door.pages.filter((page) => shown(page, paymentsOpen));
      if (pages.length === door.pages.length) return door;
      if (!pages.length) return null;
      const path = pages.some((page) => page.path === door.path) ? door.path : pages[0].path;
      return { ...door, path, pages };
    })
    .filter(Boolean);
}
