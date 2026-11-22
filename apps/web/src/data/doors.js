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
