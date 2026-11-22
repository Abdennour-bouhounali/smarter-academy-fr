import { used, usedByAlias as alias } from './things.js';
import * as icons from './icons.js';
import * as shapes from './shapes.js';
import { T } from './strings.js';
import { fromBarrel } from './barrel.js';
import { coreUsed } from '@smarter-academy/core';

const lazyPage = () => import('./lazyPage.jsx');
const pages = import.meta.glob('./pages/*.jsx');
// A name used after a spread IS used: every export of `icons` is.
const allIcons = { ...icons };
// Only `square` is read from `shapes`.
const kind = 'warm';
const t = (key) => key;

export default function App() {
  return [
    used(),
    alias(),
    allIcons,
    shapes.square,
    T.title,
    { ...T.group },
    T.byKind[kind],
    fromBarrel,
    coreUsed,
    lazyPage,
    pages,
    t('home.title'),
    t(`status.${kind}`),
    t('count', { count: 2 }),
  ];
}
