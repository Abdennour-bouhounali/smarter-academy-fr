import { useCallback, useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { useClassroomMode } from './ClassroomContext';
import { pageBudget, planPages, planOnePerPage, clampPage, SMALL_BLOCK } from './classroomPages';

/** Une LISTE d'éléments : un conteneur dont au moins deux enfants dépassent cette hauteur (6 questions, 4 cartes…). */
const ITEM_MIN = 110;
import { PagingContext } from './PagingContext';

/**
 * Le DÉCOUPAGE EN PAGES d'une unité présentée (étape, khulasa).
 *
 *   <ClassroomPaged active={estLUniteCourante} page={n} onPages={(count) => …}>
 *     {contenu de leçon inchangé}
 *   </ClassroomPaged>
 *
 * Quand le contenu d'une unité réclame plus de hauteur que la zone offerte
 * (il faudrait le réduire de plus de 10 %), ses BLOCS — les enfants directs
 * du contenu (une carte de connaissance, une question…) — sont répartis en
 * pages (classroomPages.js). La page courante est montrée, les autres portent
 * `data-classroom-page-hidden` (display: none). L'en-tête de l'étape reste :
 * il est hors de ce wrapper.
 *
 * RIEN N'EST RETIRÉ DE L'ARBRE : les blocs cachés restent montés, avec leur
 * état (réponse donnée, rayon posé). Ce composant ne touche qu'à un attribut
 * du DOM, jamais au rendu React du contenu. Hors présentation il rend un
 * simple <div> et n'observe rien.
 *
 * Le plan est recalculé quand la zone ou l'échelle choisie changent, ou quand
 * l'unité devient courante — jamais quand l'ajustement automatique bouge
 * (les hauteurs sont ramenées à l'échelle 1, voir classroomPages.js). Un bloc
 * qui apparaît ensuite (un résultat) rejoint la page courante : il ne se
 * cache pas derrière un « التالي ».
 */
const HIDDEN = 'data-classroom-page-hidden';
const REPLAN_AFTER_MS = 250;

/**
 * Les blocs : les enfants du contenu, en descendant dans un unique <div> d'emballage.
 * `deep` (lecteur de mission, PagingContext) : on traverse TOUTES les enveloppes à enfant unique jusqu'au premier
 * niveau qui a plusieurs enfants — un test (أستعدّ, le défi final) range ses questions trois <div> plus bas.
 */
/** Un décor : caché aux lecteurs d'écran ou posé en absolu/fixe par-dessus son parent — jamais un bloc à lui seul. */
export function isDecor(el) {
  if (el.getAttribute?.('aria-hidden') === 'true') return true;
  const pos = typeof window !== 'undefined' && window.getComputedStyle ? window.getComputedStyle(el).position : '';
  return pos === 'absolute' || pos === 'fixed';
}

/**
 * Un élément INSÉCABLE : on ne l'ouvre jamais en ses enfants. Un dessin (<svg>, une <figure>) ouvert pièce par pièce se
 * répartissait sur plusieurs écrans — la figure de Thalès de l'unité 9 montrait le seul segment [AM] sur « صفحة 1 من 3 »
 * (propriétaire, 2026-11-11) ; un écran gardé entier (`data-paging-keep`) non plus.
 */
export function isAtomic(el) {
  if (el.hasAttribute?.('data-paging-keep')) return true;
  if (el.namespaceURI && el.namespaceURI !== 'http://www.w3.org/1999/xhtml') return true;   // svg et tout son contenu, MathML
  return /^(FIGURE|SVG|IMG|CANVAS|TABLE)$/i.test(el.tagName ?? '');
}

const FIGURE_SEL = '[data-geo-figure], figure, svg[role="img"]';
const ANSWER_SEL = 'button, input, textarea, select, [role="radio"], [role="button"]';
const LAB_SEL = '[data-manipulation], [data-lab-rounds]';
/** Le texte d'un bloc HORS de ses figures. */
const textOf = (el) => {
  const clone = el.cloneNode(true);
  clone.querySelectorAll(FIGURE_SEL).forEach((f) => f.remove());
  return (clone.textContent ?? '').trim();
};
const isEl = (el) => Boolean(el && el.nodeType === 1);
/** Un bloc qui MONTRE une ou plusieurs figures (seules, ou dans un énoncé) et ne demande rien. */
function holdsFigure(el) {
  if (!isEl(el)) return false;
  if (!el.matches?.(FIGURE_SEL) && !el.querySelector?.(FIGURE_SEL)) return false;
  return !el.querySelector?.(ANSWER_SEL) && !el.querySelector?.(LAB_SEL);
}
/** Un bloc qui n'est QU'UNE figure (une figure, ou une enveloppe autour d'elle avec au plus une courte légende). */
export function isFigureOnly(el) {
  if (!holdsFigure(el)) return false;
  return Boolean(el.matches?.(FIGURE_SEL)) || textOf(el).length <= 60;
}
/** Un bloc qui DEMANDE quelque chose (une question, ses options, sa case), sans figure à lui, et qui n'est pas un labo. */
export function isQuestionBlock(el) {
  return isEl(el) && Boolean(el.querySelector?.(ANSWER_SEL)) && !el.matches?.(FIGURE_SEL) && !el.querySelector?.(FIGURE_SEL) && !el.querySelector?.(LAB_SEL);
}
/** Une courte ligne ENTRE la figure et la question (une consigne, « اقرأ الشكل… ») : ni figure, ni question. */
const isBridge = (el) => isEl(el) && !el.querySelector?.(ANSWER_SEL) && !el.matches?.(FIGURE_SEL) && !el.querySelector?.(FIGURE_SEL) && textOf(el).length <= 300;
/**
 * La FIGURE et la QUESTION qui la suit restent sur le même écran, côte à côte (propriétaire, 2026-11-11 : « l'élève voit le schéma sur un
 * écran, puis doit passer au suivant pour la question, et revenir pour revoir le schéma »). Lecteur seulement (« un élément par écran ») :
 * un bloc qui montre une figure (seule, plusieurs, ou dans un énoncé), au plus deux courtes lignes, puis une question → UN groupe.
 * Rend { groups, paired } : `paired`, les indices des groupes ainsi formés (ClassroomPaged pose `data-paging-pair`, mission.css les range).
 */
export function pairFigures(blocks) {
  const groups = [];
  const paired = new Set();
  for (let i = 0; i < blocks.length; i += 1) {
    const g = blocks[i];
    if (g.length === 1 && holdsFigure(g[0])) {
      let j = i + 1;
      const between = [];
      while (j < blocks.length && between.length < 2 && blocks[j].length === 1 && isBridge(blocks[j][0])) { between.push(blocks[j][0]); j += 1; }
      if (j < blocks.length && isQuestionBlock(blocks[j][0])) {
        paired.add(groups.length);
        groups.push([g[0], ...between, ...blocks[j]]);
        i = j;
        continue;
      }
    }
    groups.push(g);
  }
  return { groups, paired };
}

function resolveBlocks(root, deep = false) {
  let host = root;
  for (let depth = 0; depth < (deep ? 6 : 2); depth += 1) {
    const kids = host.children;
    // on ne descend jamais DANS un écran gardé entier (`data-paging-keep`) : il reste UN bloc
    if (kids.length === 1 && kids[0].tagName === 'DIV' && !kids[0].hasAttribute('data-paging-keep') && (deep || kids[0].children.length > 1)) host = kids[0];
    else break;
  }
  return { host, blocks: Array.from(host.children) };
}

export default function ClassroomPaged({ active = true, page = 0, onPages, onRestructure, className = '', children }) {
  const classroom = useClassroomMode();
  // Le lecteur de mission fournit sa géométrie sans activer le mode classe (PagingContext.js).
  const paging = useContext(PagingContext);
  const { isClassroomMode, scale, userScale, area } = paging ?? classroom;
  const deepRef = useRef(false);
  deepRef.current = Boolean(paging?.deepBlocks);
  const onePerPageRef = useRef(false);
  onePerPageRef.current = Boolean(paging?.onePerPage);
  const onRestructureRef = useRef(onRestructure);
  onRestructureRef.current = onRestructure;
  const running = isClassroomMode && active;
  const ref = useRef(null);
  const state = useRef({ host: null, blocks: [], pages: [[]], page: 0 });
  const onPagesRef = useRef(onPages);
  onPagesRef.current = onPages;
  const pageRef = useRef(page);
  pageRef.current = page;
  const geometry = useRef({ scale, userScale, areaHeight: area.height });
  geometry.current = { scale, userScale, areaHeight: area.height };

  // Un bloc est un GROUPE d'éléments montrés ou cachés ensemble (un seul élément, sauf un en-tête collé à sa suite).
  const apply = useCallback((pageIndex) => {
    const s = state.current;
    const shown = new Set(s.pages[clampPage(pageIndex, s.pages.length)] ?? []);
    s.blocks.forEach((group, i) => group.forEach((el) => {
      if (shown.has(i)) el.removeAttribute(HIDDEN);
      else el.setAttribute(HIDDEN, '');
      el.setAttribute('data-classroom-page-of', String(s.pages.findIndex((p) => p.includes(i)) + 1));
    }));
  }, []);

  const clear = useCallback(() => {
    state.current.blocks.flat().forEach((el) => { el.removeAttribute(HIDDEN); el.removeAttribute('data-classroom-page-of'); el.removeAttribute('data-paging-pair'); });
    (state.current.paired ?? []).forEach((el) => el.removeAttribute('data-paging-pair'));
    state.current.paired = [];
  }, []);

  const plan = useCallback(() => {
    const root = ref.current;
    if (!root) return;
    const resolved = resolveBlocks(root, deepRef.current);
    const { host } = resolved;
    let blocks = resolved.blocks.map((el) => [el]);
    const s = state.current;
    // Les blocs d'un plan précédent (structure changée) ne doivent rien garder caché.
    clear();
    s.host = host;
    const { scale: sc, userScale: us, areaHeight } = geometry.current;
    const budget = pageBudget({ areaHeight, userScale: us });
    // `deep` (lecteur de mission) : un bloc plus haut qu'une page est OUVERT en ses enfants (jusqu’à 5 niveaux) — les
    // cinq exercices d'un test rangés dans un seul conteneur deviennent cinq blocs. Le PREMIER enfant (un en-tête, le
    // plus souvent) reste COLLÉ au suivant : jamais un titre seul sur sa page.
    const groupHeight = (group) => group.reduce((sum, el) => sum + el.getBoundingClientRect().height, 0) / sc;
    let flattened = false;
    if (deepRef.current && Number.isFinite(budget) && sc > 0) {
      for (let pass = 0; pass < 5; pass += 1) {
        const out = [];
        let changed = false;
        // Un DÉCOR (fond dégradé `aria-hidden`, calque en position absolue) n'est jamais un élément : ouvert seul, il ferait
        // un écran VIDE — la carte d'ouverture d'un module s'ouvrait sur son seul fond (propriétaire, 2026-11-04, « l'ancienne
        // vue »). Il reste visible avec son parent.
        // `data-paging-keep` : un écran CONÇU pour tenir en un (la revue compacte de « أستعدّ ») ne s'ouvre jamais en ses enfants
        // un dessin (svg, figure) n'est jamais ouvert : ses traits ne sont pas des éléments (isAtomic)
        const items = (el) => (isAtomic(el) ? [] : Array.from(el.children).filter((k) => !isDecor(k)));
        const splittable = (el) => { let e = el; while (items(e).length === 1) [e] = items(e); return items(e).length > 1 ? e : null; };
        // `onePerPage` : une LISTE (≥ 2 enfants substantiels) s'ouvre même si elle tient — chaque élément aura sa page
        // une LISTE : ≥ 2 enfants substantiels — ou UN seul enfant substantiel qui en est une (le corps d'une carte « للتذكّر »
        // à côté de son bandeau), jusqu'à 3 niveaux
        const isList = (el, depth = 0) => {
          // un <li> EST un élément (une carte, une sous-étape) : on ne l'ouvre pas pour « un élément par écran »
          if (el.tagName === 'LI') return false;
          const e = splittable(el);
          if (!e) return false;
          const big = items(e).filter((k) => groupHeight([k]) >= ITEM_MIN);
          if (big.length >= 2) return true;
          return big.length === 1 && depth < 3 && isList(big[0], depth + 1);
        };
        blocks.forEach((group) => {
          const tooTall = groupHeight(group) > budget;
          if (!tooTall && !(onePerPageRef.current && group.some(isList))) { out.push(group); return; }
          // on ouvre le PLUS HAUT des éléments du groupe qui a des enfants (à travers ses enveloppes à enfant unique) —
          // en mode « un élément par page », d'abord une liste
          let idx = -1;
          group.forEach((el, i) => {
            const ok = tooTall ? splittable(el) : isList(el);
            if (ok && (idx < 0 || groupHeight([el]) > groupHeight([group[idx]]))) idx = i;
          });
          if (idx < 0) { out.push(group); return; }
          const kids = items(splittable(group[idx]));
          const head = [...group.slice(0, idx), kids[0]];
          const rest = kids.slice(1).map((k) => [k]);
          // l'en-tête reste avec ce qui le suit quand les deux tiennent ensemble — sauf « un élément par écran », où chaque élément
          // de la liste garde SA page (seul le premier accompagne ce qui le précède)
          if (!onePerPageRef.current && rest.length && groupHeight([...head, ...rest[0]]) <= budget) out.push([...head, ...rest[0]], ...rest.slice(1));
          else out.push(head, ...rest);
          out.push(...group.slice(idx + 1).map((el) => [el]));
          changed = true;
        });
        blocks = out;
        if (!changed) break;
        flattened = true;
      }
    }
    // lecteur : une figure et la question qui la suit, un seul écran, côte à côte
    if (onePerPageRef.current) {
      const { groups, paired } = pairFigures(blocks);
      blocks = groups;
      paired.forEach((gi) => {
        const group = blocks[gi];
        const fig = group[0];
        // ce qui se range À CÔTÉ est un FRÈRE de la figure : la question ouverte plus bas dans l'arbre (la carte d'un تمرين) y monte
        // jusqu'à son ancêtre frère de la figure — sinon la figure flotte dans un conteneur et la question dans un autre
        const beside = [];
        group.slice(1).forEach((el) => {
          let e = el;
          while (e && e.parentElement !== fig.parentElement) e = e.parentElement;
          const at = e ?? el;
          if (!beside.includes(at)) beside.push(at);
        });
        // une figure seule se pose étroite à côté ; un énoncé qui porte sa figure prend la moitié
        fig.setAttribute('data-paging-pair', isFigureOnly(fig) ? 'figure' : 'statement');
        beside.forEach((el, k) => el.setAttribute('data-paging-pair', k === beside.length - 1 ? 'question' : 'side'));
        s.paired = [...(s.paired ?? []), fig, ...beside];
      });
    }
    s.blocks = blocks;
    const frame = root.closest('[data-classroom-frame]') || root;
    const hostBox = host.getBoundingClientRect();
    if (!hostBox.height || sc <= 0) {
      s.pages = [blocks.map((_, i) => i)];
    } else {
      // Tout visible (clear), mesuré, puis on masque : même tâche, aucune image peinte entre.
      const heights = blocks.map(groupHeight);
      const sum = heights.reduce((a, h) => a + h, 0);
      // Des blocs pris à plusieurs niveaux n'ont pas d'écart commun mesurable : un écart moyen de 16 px.
      const gap = flattened ? 16 : (blocks.length > 1 ? Math.max(0, (hostBox.height / sc - sum) / (blocks.length - 1)) : 0);
      const overhead = Math.max(0, (frame.getBoundingClientRect().height - hostBox.height) / sc);
      // un groupe qui commence par un EN-TÊTE (<header>, h1–h4) reste avec le bloc suivant : jamais un bandeau seul à l'écran
      const glue = blocks.map((g) => /^(HEADER|H[1-4])$/.test(g[0]?.tagName ?? '') && g.length === 1);
      s.pages = onePerPageRef.current ? planOnePerPage(heights, SMALL_BLOCK, glue) : planPages({ heights, budget, overhead, gap });
      // les blocs PETITS au moment du plan (une enveloppe vide, une ligne) : surveillés — s'ils grandissent, ils prennent leur écran
      s.small = new Set(heights.map((h, i) => (h < SMALL_BLOCK ? i : -1)).filter((i) => i >= 0));
    }
    apply(pageRef.current);
    onPagesRef.current?.(s.pages.length);
  }, [apply, clear]);

  // Planifier : l'unité devient courante, ou la zone / l'échelle choisie changent.
  useLayoutEffect(() => {
    if (!running) return undefined;
    plan();
    // Une seconde fois, la mise en page posée (polices, KaTeX, ajustement).
    const t = setTimeout(plan, REPLAN_AFTER_MS);
    return () => clearTimeout(t);
  }, [running, area.width, area.height, userScale, plan]);

  // Changer de page : un attribut, rien d'autre.
  useLayoutEffect(() => {
    if (!running) return;
    const s = state.current;
    const clamped = clampPage(page, s.pages.length);
    apply(clamped);
    if (clamped !== page) onPagesRef.current?.(s.pages.length);
  }, [running, page, apply]);

  // Un bloc nouveau (résultat, indice) rejoint la page courante.
  useEffect(() => {
    if (!running || !ref.current || typeof MutationObserver === 'undefined') return undefined;
    const mo = new MutationObserver((records) => {
      const s = state.current;
      // Le contenu a été REMPLACÉ (un test envoyé : ses questions cèdent la place au résultat) : on redécoupe, page 1.
      if (deepRef.current && s.blocks.flat().some((el) => !el.isConnected)) {
        plan();
        onRestructureRef.current?.();
        return;
      }
      const known = new Set(s.blocks.flat());
      // un nouvel élément peut arriver dans le CONTENEUR d'un bloc ouvert (pas seulement à la racine) : les cartes d'une étape qui
      // s'affichent après la réponse sont ajoutées là où vivaient la question et son retour — elles restaient alors visibles sur
      // l'écran courant, qui débordait et rétrécissait tout (propriétaire, 2026-11-07, « la pire vue »)
      const containers = new Set(s.blocks.flat().map((el) => el.parentElement).filter(Boolean));
      const added = [];
      for (const r of records) {
        // …ou dans un ANCÊTRE du conteneur (le plan était descendu à travers des enveloppes à enfant unique ; les cartes arrivent
        // un étage plus haut, à côté de l'enveloppe)
        const aboveHost = r.target !== s.host && r.target.contains?.(s.host) && ref.current?.contains(r.target);
        if (r.target !== s.host && !containers.has(r.target) && !aboveHost) continue;
        r.addedNodes.forEach((n) => { if (n.nodeType === 1 && !known.has(n)) added.push(n); });
      }
      const current = clampPage(pageRef.current, s.pages.length);
      const sc = geometry.current.scale || 1;
      let insertAt = current + 1;
      let addedPages = false;
      // Un bloc arrivé PETIT (une enveloppe encore vide) a rejoint l'écran courant ; s'il GRANDIT ensuite (les cartes d'une étape
      // s'y ajoutent un instant plus tard), il prend SON écran juste après — sinon l'écran courant déborde et tout rétrécit.
      if (onePerPageRef.current && s.small?.size) {
        for (const idx of [...s.small]) {
          const el = s.blocks[idx]?.[0];
          const page = s.pages[current] ?? [];
          if (!el || !el.isConnected) { s.small.delete(idx); continue; }
          if (page.includes(idx) && page.length > 1 && el.getBoundingClientRect().height / sc >= SMALL_BLOCK) {
            s.pages[current] = page.filter((x) => x !== idx);
            s.pages.splice(insertAt, 0, [idx]);
            el.setAttribute(HIDDEN, ''); el.setAttribute('data-classroom-page-of', String(insertAt + 1));
            insertAt += 1; addedPages = true; s.small.delete(idx);
          }
        }
      }
      if (!added.length) { if (addedPages) onPagesRef.current?.(s.pages.length); return; }
      for (const el of added) {
        s.blocks.push([el]);
        const idx = s.blocks.length - 1;
        // « Un élément par écran » : un NOUVEL élément substantiel (la sous-étape suivante d'une مسألة, débloquée par la
        // réponse) prend SON écran juste après celui-ci — il ne s'entasse pas sur l'écran courant, qui rétrécirait tout
        // (propriétaire, 2026-11-04). Un petit ajout (un indice, une ligne) rejoint l'écran courant.
        if (onePerPageRef.current && el.getBoundingClientRect().height / sc >= SMALL_BLOCK) {
          s.pages.splice(insertAt, 0, [idx]);
          el.setAttribute(HIDDEN, '');
          el.setAttribute('data-classroom-page-of', String(insertAt + 1));
          insertAt += 1;
          addedPages = true;
        } else {
          (s.pages[current] ??= []).push(idx);
          el.removeAttribute(HIDDEN);
          el.setAttribute('data-classroom-page-of', String(current + 1));
          // petit à l'arrivée : surveillé, il prendra son écran s'il grandit
          (s.small ??= new Set()).add(idx);
        }
      }
      if (addedPages) onPagesRef.current?.(s.pages.length);
    });
    mo.observe(ref.current, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [running]);

  // Sortie de présentation (ou unité qui n'est plus courante) : tout redevient visible.
  useEffect(() => {
    if (running) return undefined;
    clear();
    state.current = { host: null, blocks: [], pages: [[]], page: 0 };
    return undefined;
  }, [running, clear]);

  return (
    <div ref={ref} className={className} data-classroom-paged={running ? '' : undefined}>
      {children}
    </div>
  );
}
