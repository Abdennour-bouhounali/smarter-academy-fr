import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * GARDE STATIQUE — un composant qui appelle `t(...)` doit avoir le hook.
 *
 * Ce test existe à cause d'un vrai plantage : `StepCard` (LessonUI.jsx)
 * utilisait `t('step.finishPreviousStep')` sans `useTranslation`, et cassait
 * l'écran — mais SEULEMENT quand une étape était VERROUILLÉE, c'est-à-dire
 * sur la branche que ni le build (Rollup ne résout pas les identifiants au
 * runtime), ni l'audit de chaînes françaises (il n'y avait plus de français),
 * ni la suite de tests (qui teste la géométrie, pas le DOM) ne traversaient.
 * L'erreur n'apparaissait qu'en ouvrant la leçon dans un navigateur :
 * « ReferenceError: t is not defined ».
 *
 * La bascule du moteur vers i18n (namespace `lesson`) a créé cette classe de
 * défaut : on remplace un littéral par `t('clé')` dans le JSX d'un composant,
 * et on oublie que c'en est un AUTRE que celui qui porte le hook. Le contrôle
 * est donc statique : il lit le fichier, découpe les composants, et vérifie
 * la portée. Il ne dépend d'aucun rendu.
 */

const HERE = dirname(fileURLToPath(import.meta.url));

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith('.jsx')) out.push(full);
  }
  return out;
}

/** Les composants d'un fichier, avec leur corps — déclarations `function` ET flèches. */
function components(src) {
  const decls = [];
  const re = /^(?:export\s+)?(?:default\s+)?(?:function\s+([A-Z][A-Za-z0-9_]*)\s*\(|const\s+([A-Z][A-Za-z0-9_]*)\s*=)/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    decls.push({ name: m[1] || m[2], start: m.index });
  }
  return decls.map((d, i) => ({
    ...d,
    body: src.slice(d.start, i + 1 < decls.length ? decls[i + 1].start : src.length),
  }));
}

// `t(` non précédé d'un identifiant ou d'un point : exclut `format(`, `obj.t(`…
const USES_T = /(?<![A-Za-z0-9_.$])t\(/;

describe('portée du hook i18n dans le moteur de leçon', () => {
  it('aucun composant n’appelle t() sans déclarer useTranslation', () => {
    const offenders = [];

    for (const file of walk(HERE)) {
      const src = readFileSync(file, 'utf8');
      if (!USES_T.test(src)) continue;

      for (const c of components(src)) {
        if (USES_T.test(c.body) && !c.body.includes('useTranslation(')) {
          offenders.push(`${relative(HERE, file)} → <${c.name}>`);
        }
      }
    }

    expect(offenders, `Composant(s) utilisant t() hors de portée du hook :\n  ${offenders.join('\n  ')}`)
      .toEqual([]);
  });

  it('se détecterait elle-même : la garde reconnaît un composant fautif', () => {
    // Sans ceci, une régression de la REGEX rendrait le test vert pour de
    // mauvaises raisons, silencieusement.
    const faulty = `
export function Bad({ x }) {
  return <p>{t('a.b')}</p>;
}
export function Good() {
  const { t } = useTranslation('lesson');
  return <p>{t('a.b')}</p>;
}
`;
    const bad = components(faulty).filter(
      (c) => USES_T.test(c.body) && !c.body.includes('useTranslation(')
    );
    expect(bad.map((c) => c.name)).toEqual(['Bad']);
  });
});
