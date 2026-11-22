import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const SITE = 'https://smarter-academy.com';

const escapeAttr = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Remplace le `content` d'une balise <meta name|property="key"> — même quand la balise tient sur deux lignes. */
function setMeta(html, key, value) {
  const re = new RegExp(`(<meta\\s+(?:name|property)="${key}"\\s+content=")[^"]*(")`);
  return html.replace(re, (_m, open, close) => `${open}${escapeAttr(value)}${close}`);
}

/**
 * Une page de PARTAGE : l'index.html du build dont les balises <title>, description,
 * Open Graph et Twitter parlent de CETTE page. Les robots de partage (WhatsApp,
 * Facebook, Telegram) lisent le HTML sans exécuter React : sans cela, tout lien
 * `/books/<slug>` s'afficherait avec la carte de l'accueil. L'application, elle,
 * démarre à l'identique (même script, même routeur).
 */
export function renderSharePage(html, card) {
  const url = `${SITE}${card.path}`;
  const image = `${SITE}${card.image}`;
  let out = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(card.title)}</title>`);
  out = setMeta(out, 'description', card.description);
  out = setMeta(out, 'og:url', url);
  out = setMeta(out, 'og:title', card.title);
  out = setMeta(out, 'og:description', card.description);
  out = setMeta(out, 'og:image', image);
  out = setMeta(out, 'og:image:alt', card.title);
  out = setMeta(out, 'twitter:title', card.title);
  out = setMeta(out, 'twitter:description', card.description);
  out = setMeta(out, 'twitter:image', image);
  return out.replace('</head>', `  <link rel="canonical" href="${url}" />\n</head>`);
}

const escapeHtml = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Le slug d'une carte de LIVRE (`/books/<slug>`), sinon null. */
export const bookSlugOf = (card) => card.path.match(/^\/books\/([^/]+)$/)?.[1] ?? null;

/**
 * LE PREMIER ÉCRAN DE LA FICHE, EN HTML (2026-10-17).
 *
 * La page d'achat ne doit jamais montrer « جارٍ تحميل Smarter Academy » : elle
 * attendait le lot d'entrée (≈ 324 Ko gzip), puis le lot de la page, puis l'API.
 * Le build écrit donc dans son HTML le composant RÉEL du premier écran
 * (src/features/books/BookHero.jsx, rendu par react-dom/server — aucune copie à
 * tenir à jour) ; la feuille de style, bloquante, l'habille dès le premier octet.
 * C'est un calque posé AU-DESSUS de #root : React se monte dessous, et
 * BookDetailPage le retire une fois la vraie fiche affichée
 * (bookCache.removeStaticBookShell) — jamais d'écran blanc entre les deux.
 */
export function renderBookShell(heroHtml) {
  return `<div id="sa-static-shell" dir="rtl" style="position:absolute;inset:0 0 auto 0;z-index:60;min-height:100vh;background:#fafafa">
  <div class="fixed top-0 left-0 right-0 z-50 bg-white/90 border-b border-gray-100"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex flex-nowrap items-center justify-between h-16 gap-3">
    <a href="/" class="flex items-center gap-2.5"><img src="/brand/mark-color.svg" width="200" height="200" alt="Smarter Academy" class="h-10 w-10" /><span class="hidden sm:flex font-space font-bold text-slate-900 text-sm leading-none whitespace-nowrap">Smarter Academy</span></a>
  </div></div></div>
  <div class="pt-16">${heroHtml}</div>
</div>`;
}

/** BookHero.jsx → du HTML statique (esbuild le compile, react-dom/server le rend). */
async function loadHeroRenderer(projectRoot) {
  const { build } = await import('esbuild');
  const out = resolve(projectRoot, 'node_modules/.cache/sa-share-pages/BookHero.mjs');
  mkdirSync(dirname(out), { recursive: true });
  await build({
    entryPoints: [resolve(projectRoot, 'src/features/books/BookHero.jsx')],
    bundle: true, format: 'esm', platform: 'node', jsx: 'automatic', packages: 'external', outfile: out, logLevel: 'silent',
  });
  const [{ default: BookHero }, { createElement }, { renderToStaticMarkup }] = await Promise.all([
    import(`${pathToFileURL(out).href}?t=${Date.now()}`), import('react'), import('react-dom/server'),
  ]);
  return (book) => renderToStaticMarkup(createElement(BookHero, { book }));
}

/** Remplace l'élément <div id="root">…</div> entier (balises <div> équilibrées). */
export function replaceRoot(html, replacement) {
  const start = html.indexOf('<div id="root">');
  if (start < 0) return html;
  const tag = /<\/?div\b[^>]*>/g;
  tag.lastIndex = start;
  let depth = 0;
  for (let m = tag.exec(html); m; m = tag.exec(html)) {
    depth += m[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return html.slice(0, start) + replacement + html.slice(m.index + m[0].length);
  }
  return html;
}

/**
 * La page de partage d'un livre, augmentée : le premier écran en HTML (ci-dessus),
 * l'instantané des données pour React (`window.__SA_BOOK_SNAPSHOT__`, lu par
 * bookCache.js), le préchargement de l'image et du lot de la page.
 */
export function renderBookPage(html, { card, book, heroHtml, preloadChunks = [] }) {
  const c = book.content ?? {};
  const image = c.heroImage || book.coverImage;
  const json = JSON.stringify({ path: `/books/${encodeURIComponent(book.slug)}`, data: { success: true, book } }).replace(/</g, '\\u003c');
  const head = [
    image ? `<link rel="preload" as="image" href="${escapeHtml(image)}" fetchpriority="high" />` : '',
    ...preloadChunks.map((file) => `<link rel="modulepreload" crossorigin href="/${escapeHtml(file)}" />`),
    `<script>window.__SA_BOOK_SNAPSHOT__=${json};</script>`,
  ].filter(Boolean).join('\n  ');
  let out = renderSharePage(html, card).replace('</head>', `  ${head}\n</head>`);
  // L'écran d'attente de l'application (spinner + « جارٍ تحميل ») n'a rien à faire ici.
  return replaceRoot(out, `<div id="root"></div>\n  ${renderBookShell(heroHtml)}`);
}

async function fetchBook(apiUrl, slug) {
  if (!apiUrl) return null;
  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, '')}/books/${encodeURIComponent(slug)}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return (await res.json())?.book ?? null;
  } catch {
    return null;
  }
}

/** Où le build écrit la page de partage d'un chemin public (`/books/x` → `share/books/x.html`). */
export const shareFileOf = (path) => `share${path}.html`;

/**
 * Les règles de réécriture des pages de partage, posées à la place du marqueur
 * `# @share-pages` de dist/.htaccess : une règle EXPLICITE par page, avec ou sans
 * « / » final (les anciens liens copiés après l'ancien 301 en portent un).
 */
export function shareRewriteRules(cards) {
  return cards.map((card) => {
    const pattern = card.path.replace(/^\//, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return `  RewriteRule ^${pattern}/?$ ${shareFileOf(card.path)} [L]`;
  }).join('\n');
}

/**
 * Écrit dist/share/<path>.html pour chaque carte de partage, et ses règles dans
 * dist/.htaccess. Ni dossier ni fichier ne porte le chemin public : avant le
 * 2026-10-17, `dist/books/smart-protocol/index.html` faisait répondre le serveur
 * par un 301 vers `/books/smart-protocol/` (un aller-retour de plus avant tout
 * affichage), et LiteSpeed redirige tout dossier existant avant les règles.
 * Une carte de LIVRE reçoit en plus son premier écran (renderBookPage) si l'API
 * (VITE_API_URL) répond pendant le build ; sinon la page reste une simple page de
 * partage. Un nouveau livre = une entrée dans src/features/books/shareCards.json
 * (+ sa carte dans public/og/, voir scripts/og-card.py) — docs/architecture/BOOKS_STORE.md §6bis.
 */
export default function sharePages({ cards }) {
  let outDir = 'dist';
  let projectRoot = process.cwd();
  let publicDir = null;
  let apiUrl = null;
  let bookChunks = [];
  let baseHtml = null;
  return {
    name: 'sa-share-pages',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
      projectRoot = config.root;
      publicDir = config.publicDir;
      apiUrl = config.env?.VITE_API_URL || process.env.VITE_API_URL || null;
    },
    // index.html et le modèle .htaccess ne sont JAMAIS relus dans dist/ : un dist/ laissé par un autre build
    // (deux builds lancés en même temps dans le même arbre, constaté le 2026-10-29) n'a plus le marqueur
    // « # @share-pages » ou n'a plus d'index.html — le build échouait sur un état qui n'est pas le sien.
    writeBundle(_options, bundle) {
      const html = bundle['index.html'];
      if (html?.type === 'asset') baseHtml = String(html.source);
    },
    generateBundle(_options, bundle) {
      // Le lot de BookDetailPage et ses imports statiques : préchargés par la page du livre.
      const entry = Object.values(bundle).find((c) => c.type === 'chunk' && c.facadeModuleId?.endsWith('features/books/BookDetailPage.jsx'));
      if (!entry) return;
      const seen = new Set();
      const walk = (file) => {
        if (seen.has(file)) return;
        const chunk = bundle[file];
        if (!chunk || chunk.type !== 'chunk' || chunk.isEntry) return;
        seen.add(file);
        chunk.imports.forEach(walk);
      };
      walk(entry.fileName);
      bookChunks = [...seen];
    },
    async closeBundle() {
      // resolve, pas join : l'outDir peut être absolu (scripts/analyze-entry-bundle.mjs construit dans /tmp).
      const root = resolve(projectRoot, outDir);
      const base = baseHtml ?? readFileSync(join(root, 'index.html'), 'utf8');
      let renderHero = null;
      for (const card of cards) {
        const file = join(root, shareFileOf(card.path));
        mkdirSync(dirname(file), { recursive: true });
        const slug = bookSlugOf(card);
        const book = slug ? await fetchBook(apiUrl, slug) : null;
        if (slug && !book) this.warn(`page de ${card.path} : API injoignable (${apiUrl ?? 'VITE_API_URL absent'}) — page de partage sans premier écran.`);
        if (book && !renderHero) renderHero = await loadHeroRenderer(projectRoot);
        writeFileSync(file, book ? renderBookPage(base, { card, book, heroHtml: renderHero(book), preloadChunks: bookChunks }) : renderSharePage(base, card));
      }
      const htaccess = join(root, '.htaccess');
      const rules = readFileSync(publicDir ? join(publicDir, '.htaccess') : htaccess, 'utf8');
      if (!rules.includes('# @share-pages')) throw new Error('public/.htaccess sans le marqueur « # @share-pages » : les pages de partage ne seraient pas servies.');
      writeFileSync(htaccess, rules.replace('  # @share-pages', shareRewriteRules(cards)));
    },
  };
}
