import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../../../i18n';
import StoryModeller from '../../../../../common/manipulations/systems/StoryModeller';
import { LAB } from './content/textbook';

/**
 * LE RENDU GELÉ du laboratoire de la synthèse (unité 5, commit 0 du 2026-11-11 — conseil du 2026-11-11, verdict X7 / §5.8). `story-modeller`
 * reçoit, pour la leçon `mushkilat-jumla`, une VERSION LECTEUR (`systems/StoryModellerPlayer.jsx`) choisie par le fichier du labo ; la page de la
 * synthèse (module 7, ses deux ressources) ne doit pas changer d'un octet. Ce test fige son rendu serveur : un changement qui le modifie échoue ici.
 * Si un changement de la PAGE est voulu (jamais pendant la conversion de l'unité 5), mettre à jour l'instantané en le disant dans le commit.
 */
const render = (level) => renderToString(<StoryModeller level={level} {...LAB[level]} />);

it('the synthesis lab, resource « beginner » (« رحلة القسم »), renders exactly as frozen', () => {
  expect(render('beginner')).toMatchSnapshot();
});

it('the synthesis lab, resource « advanced » (« الحفل »), renders exactly as frozen', () => {
  expect(render('advanced')).toMatchSnapshot();
});

it('the render is stable (two renders are identical: the snapshot holds no random part)', () => {
  expect(render('beginner')).toBe(render('beginner'));
  expect(render('advanced')).toBe(render('advanced'));
});
