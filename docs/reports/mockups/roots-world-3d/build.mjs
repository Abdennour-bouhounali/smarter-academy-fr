/**
 * Puts the 3D view into the three mock-up pages, so each stays ONE standalone file (three.js is bundled in: no network).
 * Run from the repository root:  node docs/reports/mockups/roots-world-3d/build.mjs
 * It can be run again: what it wrote before is replaced.
 */
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const VIEW = `<!-- 3D:view -->
  <div style="margin:0 0 14px">
    <canvas id="c3d" style="width:100%;height:470px;display:block;border-radius:14px;background:#bfe3ff"></canvas>
    <div class="row" style="margin-top:8px">
      <button id="zin">+ تقريب</button><button id="zout">− إبعاد</button>
      <span style="font-size:1.1rem">اسحب بالفأرة لتدير المشهد. المشهد يتبع ما تحرّكه في الأسفل.</span>
    </div>
  </div>
  <!-- 3D:view-end -->
  `;
// each page keeps its own script; this adds the 3D after it and tells it what the page's state is
const PAGES = {
  'A-courts': `const d0 = draw; window.draw = function () { d0(); const d = st.exact ? 0 : st.s * st.s - st.a * 1e6;
    scene3d.update({ a: st.a, s: st.exact ? Math.sqrt(st.a) : st.s / 1000, verdict: d === 0 ? 'ride' : d < 0 ? 'band' : 'jam',
      side: st.exact ? '√' + st.a : fmt(st.s) }); }; draw();`,
  'B-lantern': `const d0 = draw; window.draw = function () { d0();
    scene3d.update({ a: st.a, k: st.exact ? Math.sqrt(st.a) : st.k / 1000, side: st.exact ? '√' + st.a : fmt(st.k) }); }; draw();`,
  'C-ropes': `const d0 = draw; window.draw = function () { d0(); scene3d.update({ p: st.p, q: st.q }); }; draw();`,
};

for (const [page, hook] of Object.entries(PAGES)) {
  const out = await build({
    entryPoints: [join(here, page[0].toLowerCase() + '.js')],
    bundle: true,
    format: 'iife',
    minify: true,
    write: false,
    logLevel: 'warning',
  });
  const js = out.outputFiles[0].text.replace(/<\/script/g, '<\\/script');
  const file = join(here, '..', `roots-world-${page}.html`);
  let html = readFileSync(file, 'utf8')
    .replace(/<!-- 3D:view -->[\s\S]*?<!-- 3D:view-end -->\s*/, '')
    .replace(/<!-- 3D:js -->[\s\S]*?<!-- 3D:js-end -->\s*/, '');
  html = html.replace('<div class="play">', () => VIEW + '<div class="play">');
  html = html.replace('</body>', () => `<!-- 3D:js -->\n<script>${js}</script>\n<script>${hook}</script>\n<!-- 3D:js-end -->\n</body>`);
  writeFileSync(file, html);
  console.log(page, Math.round(html.length / 1024) + ' KB');
}
