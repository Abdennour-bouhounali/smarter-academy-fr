/**
 * audit-svg-collisions.mjs — L'INVARIANT DE SÉPARATION VISUELLE, mesuré.
 *
 * Une étiquette posée sur un trait ne dégrade pas seulement l'esthétique :
 * elle change la lecture mathématique. « O » collé au « −1 » d'un axe, et
 * l'élève ne sait plus lequel des deux nomme le point.
 *
 * On ne juge pas le JSX — les collisions n'existent qu'une fois le texte
 * RENDU, à une largeur donnée. On ouvre donc les visuels dans un navigateur,
 * on mesure les boîtes réelles (getBBox, en unités de viewBox) et on croise
 * les <text> avec les éléments porteurs de sens.
 *
 * Ce qui est ignoré : les fonds et le quadrillage (décor), et tout <text>
 * muni d'un halo `paint-order:stroke` — c'est la « plaque » de la §5, une
 * superposition VOULUE et lisible.
 *
 * Usage :  node scripts/audit-svg-collisions.mjs [--width 1280] [--json]
 */
import { chromium } from 'playwright';


/* ── Les règles de classement, isolées et testables ───────────────────────
   Elles décident CE QUI COMPTE comme collision. Extraites de la fonction
   injectée dans la page pour pouvoir être vérifiées sans navigateur : c'est
   là que vivent les faux positifs, et un audit qui crie au loup est un audit
   qu'on finit par ignorer.                                                  */

/** Deux boîtes se chevauchent-elles ? */
export const overlaps = (a, b, pad = 0) =>
  a.x < b.x + b.width + pad && a.x + a.width + pad > b.x &&
  a.y < b.y + b.height + pad && a.y + a.height + pad > b.y;

/** `inner` tient-il ENTIÈREMENT dans `outer` ? (étiquette de donnée) */
export const contains = (outer, inner) =>
  inner.x >= outer.x - 0.5 && inner.y >= outer.y - 0.5 &&
  inner.x + inner.width <= outer.x + outer.width + 0.5 &&
  inner.y + inner.height <= outer.y + outer.height + 0.5;

/** Un texte à halo assume sa superposition : c'est la plaque de la §5. */
export const hasHalo = ({ paintOrder = '', strokeWidth = 0 }) =>
  String(paintOrder).includes('stroke') && Number(strokeWidth) > 0;

/** Quadrillage et fonds ne portent pas de sens : on ne les protège pas. */
export const isDecor = ({ role, stroke = '', strokeOpacity = 1 }) =>
  role === 'decor' || role === 'grid' ||
  /^#(e2e8f0|f1f5f9|e5e7eb|f8fafc)$/i.test(stroke) ||
  Number(strokeOpacity) < 0.25;

const BASE = process.env.KIT_BASE || 'http://localhost:5301';
const WIDTHS = (process.env.KIT_WIDTHS || '375,1280').split(',').map(Number);

const DETECT = () => {
  // Ce que l'on protège : le sens. Pas le décor.
  const DECOR = (el) => {
    const r = el.getAttribute('data-visual-role');
    if (r === 'decor' || r === 'grid') return true;
    const s = getComputedStyle(el);
    const stroke = el.getAttribute('stroke') || '';
    // Quadrillage : trait très clair et très fin.
    if (/^#(e2e8f0|f1f5f9|e5e7eb|f8fafc)$/i.test(stroke)) return true;
    if (parseFloat(s.strokeOpacity || '1') < 0.25) return true;
    return false;
  };
  const inter = (a, b, pad = 0) =>
    a.x < b.x + b.width + pad && a.x + a.width + pad > b.x &&
    a.y < b.y + b.height + pad && a.y + a.height + pad > b.y;

  const out = [];
  for (const svg of document.querySelectorAll('svg')) {
    const texts = [...svg.querySelectorAll('text')];
    if (!texts.length) continue;
    const shapes = [...svg.querySelectorAll('line,path,rect,circle,polygon,polyline,ellipse')]
      .filter((el) => !DECOR(el));
    const box = (el) => { try { return el.getBBox(); } catch { return null; } };

    const halo = (t) => {
      const po = t.getAttribute('paint-order') || getComputedStyle(t).paintOrder || '';
      const sw = parseFloat(t.getAttribute('stroke-width') || '0');
      return po.includes('stroke') && sw > 0;
    };

    for (let i = 0; i < texts.length; i++) {
      const t = texts[i], tb = box(t);
      if (!tb || !tb.width) continue;
      const label = (t.textContent || '').trim().slice(0, 24);

      // texte ↔ texte : jamais acceptable, halo ou pas.
      for (let j = i + 1; j < texts.length; j++) {
        const ob = box(texts[j]);
        if (ob && ob.width && inter(tb, ob)) {
          out.push({ kind: 'text-text', label, other: (texts[j].textContent || '').trim().slice(0, 24) });
        }
      }
      // texte ↔ forme : le halo vaut plaque, donc superposition voulue.
      if (halo(t)) continue;
      // Une étiquette POSÉE DANS une région pleine (case d'une barre de
      // fraction, secteur d'un disque, cellule d'un tableau) est une étiquette
      // de donnée : c'est le dessin voulu, pas une collision. Ce qui nuit,
      // c'est le texte qui CHEVAUCHE un bord — donc on ne signale que les
      // formes dont le texte franchit le contour.
      const contains = (o, i2) =>
        i2.x >= o.x - 0.5 && i2.y >= o.y - 0.5 &&
        i2.x + i2.width <= o.x + o.width + 0.5 &&
        i2.y + i2.height <= o.y + o.height + 0.5;
      // Le cadre d'une COURBE couvre tout le graphique : une diagonale a la
      // boîte du repère entier. Croiser les boîtes signalerait alors chaque
      // graduation. Pour un tracé non rempli on teste donc le TRAIT lui-même,
      // point par point le long du chemin.
      const hitsStroke = (sh, r) => {
        const L = sh.getTotalLength ? sh.getTotalLength() : 0;
        if (!L) return false;
        const step = Math.max(1, L / 220);
        for (let d = 0; d <= L; d += step) {
          const pt = sh.getPointAtLength(d);
          if (pt.x >= r.x && pt.x <= r.x + r.width &&
              pt.y >= r.y && pt.y <= r.y + r.height) return true;
        }
        return false;
      };
      for (const sh of shapes) {
        const sb = box(sh);
        if (!sb) continue;
        const filled = (sh.getAttribute('fill') || '') !== 'none';
        if (filled && contains(sb, tb)) continue;      // étiquette de donnée
        if (!filled && (sh.tagName === 'path' || sh.tagName === 'polyline')) {
          if (hitsStroke(sh, tb)) {
            out.push({ kind: `text-${sh.tagName}`, label,
                       role: sh.getAttribute('data-visual-role') || undefined });
            break;
          }
          continue;
        }
        // Un point/marqueur doit rester identifiable : on exige un vrai écart.
        const pad = sh.tagName === 'circle' ? 1 : 0;
        if (inter(tb, sb, pad)) {
          out.push({ kind: `text-${sh.tagName}`, label,
                     role: sh.getAttribute('data-visual-role') || undefined });
          break;      // une forme suffit à signaler l'étiquette
        }
      }
    }
  }
  return out;
};

/* Le corps ne s'exécute QUE si le script est lancé directement : les règles
   ci-dessus doivent pouvoir être importées par les tests sans ouvrir un
   navigateur ni appeler process.exit. */
if (import.meta.url === `file://${process.argv[1]}`) {
  const routes = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const asJson = process.argv.includes('--json');
  const browser = await chromium.launch();
  const report = [];

  for (const route of routes.length ? routes : ['/__vizcheck']) {
    for (const width of WIDTHS) {
      const ctx = await browser.newContext({ viewport: { width, height: 1400 } });
      const page = await ctx.newPage();
      // Les modules sont verrouillés tant que le précédent n'est pas fait : on
      // ouvre la leçon comme un élève qui l'a parcourue, sinon on n'auditerait
      // qu'un écran « Module verrouillé ».
      const id = route.split('/').filter(Boolean).slice(-2, -1)[0];
      await page.addInitScript((lesson) => {
        try {
          localStorage.setItem(`u_anon_smarter_lesson_${lesson}`, JSON.stringify({
            completedModules: ['0','1','2','3','4','5','6','7','8','9','10'],
            completedExercises: [],
          }));
        } catch { /* stockage indisponible : on auditera ce qui s'affiche */ }
      }, id);
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded' }).catch(() => {});
      await page.waitForTimeout(2200);
      const hits = await page.evaluate(DETECT);
      for (const h of hits) report.push({ route, width, ...h });
      if (process.env.KIT_VERBOSE) console.error(`  ${route} @${width} → ${hits.length}`);
      await ctx.close();
    }
  }
  await browser.close();

  if (asJson) console.log(JSON.stringify(report, null, 2));
  else {
    const by = {};
    for (const r of report) (by[`${r.kind}`] ??= []).push(r);
    console.log(`\n${report.length} collision(s)\n`);
    for (const [k, v] of Object.entries(by)) {
      console.log(`  ${k.padEnd(14)} ${String(v.length).padStart(3)}  ex: ${v.slice(0, 4).map((x) => `«${x.label}»@${x.width}px`).join(', ')}`);
    }
  }
  process.exit(report.length ? 1 : 0);
}
