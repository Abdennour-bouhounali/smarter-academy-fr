import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// « L’archipel des diviseurs » reads left to right (the French screen, 2026-11-22): no element, SVG text or style of the
// world is laid out right to left any more, and no Arabic letter is left in it — comments and tests included.
const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCES = readdirSync(HERE).filter((f) => /\.(jsx?|css)$/.test(f) && !/\.test\.jsx?$/.test(f));
const ALL = readdirSync(HERE).filter((f) => /\.(jsx?|css)$/.test(f));

describe('the direction of the world', () => {
  it('has no right-to-left island: no dir="rtl", no SVG direction="rtl", no CSS direction: rtl', () => {
    for (const f of SOURCES) {
      const src = readFileSync(join(HERE, f), 'utf8');
      expect(src, f).not.toMatch(/dir=["']rtl["']|dir=\{[^}]*'rtl'|direction=["']rtl["']|direction:\s*rtl/);
    }
  });

  it('holds no Arabic letter in any file', () => {
    for (const f of ALL) expect(readFileSync(join(HERE, f), 'utf8'), f).not.toMatch(/[\u0600-\u06ff]/);
  });
});
