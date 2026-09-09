import React, { useState } from 'react';
import { MoveRight, Eye } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GlissementLab from '../components/GlissementLab';
import { ORIGINE_FLECHE } from '../components/GlissementLab';
import {
  DRAPEAU, CENTRE_DEMI_TOUR, glissement, nomDuSens,
} from '../components/translation4e';

/**
 * Module 1 — LE LABORATOIRE D'OUVERTURE (§6bis).
 *
 * Activity              tirer la flèche du glissement ; la copie du drapeau
 *                       suit en direct, et les cinq traits [M M'] avec elle.
 * Mathematical objective une translation est un glissement du plan : TOUS les
 *                       points font exactement le même trajet.
 * Student action        glisser la pointe de la flèche (souris, doigt,
 *                       clavier). Un seul objet manipulé, trois caractères
 *                       qui bougent ensemble.
 * Controlled variable   la pointe de la flèche.
 * Mathematical state    (origine, pointe) ; le glissement, la copie et les
 *                       cinq trajets en sont DÉRIVÉS.
 * Visual consequence    la copie se déplace, et les cinq traits restent
 *                       parallèles et de même longueur, quoi qu'on fasse.
 * Expected observation  « les traits ne se croisent jamais » — puis, au
 *                       basculement sur le demi-tour de 5e, « là, ils se
 *                       croisent tous au même endroit ».
 * Misconception targeted croire que la copie a tourné ; croire que la
 *                       longueur seule décrit le déplacement.
 * Formalization         le mot « translation » est posé à l'étape 3, APRÈS
 *                       que l'élève a fait glisser la figure et vu les
 *                       traits. Les trois caractères arrivent à l'étape 4,
 *                       une fois qu'on s'est servi d'eux pour décrire.
 *
 * CE QUE CE MODULE LAISSE AUX SUIVANTS : placer soi-même une image (M2),
 * construire une figure entière (M3), mesurer les invariants (M4), le
 * parallélogramme (M5), trancher entre les gestes (M6).
 */

/** Trois réglages « clairement distincts » suffisent à valider l'étape 1 :
 *  un glissement continu ne doit pas la valider instantanément. */
const ECART_MIN = 100;

export default function Module01LeTapisRoulant() {
  const [pointe, setPointe] = useState({ x: ORIGINE_FLECHE.x + 240, y: ORIGINE_FLECHE.y + 80 });
  const [vus, setVus] = useState([]);
  const [geste, setGeste] = useState('glissement');
  const [aVuDemiTour, setAVuDemiTour] = useState(false);
  const [pred, setPred] = useState(null);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const noter = (p) => {
    setPointe(p);
    setVus((v) => (
      v.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < ECART_MIN) ? v : [...v, p]
    ));
  };

  const done1 = vus.length >= 3;
  const done2 = aVuDemiTour && geste === 'glissement';

  const g = glissement({ dx: pointe.x - ORIGINE_FLECHE.x, dy: pointe.y - ORIGINE_FLECHE.y });

  const lab = (
    <GlissementLab
      figure={DRAPEAU}
      pointe={pointe}
      onPointe={noter}
      geste={geste}
      centreDemiTour={CENTRE_DEMI_TOUR}
      ariaLabel="Le tapis roulant"
    />
  );

  const bascule = (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setGeste('glissement')}
        aria-pressed={geste === 'glissement'}
        className={`min-h-[44px] rounded-xl border-2 px-4 text-sm font-bold ${
          geste === 'glissement'
            ? 'border-indigo-700 bg-indigo-600 text-white'
            : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400'
        }`}
      >
        Le tapis roulant
      </button>
      <button
        type="button"
        onClick={() => { setGeste('demi-tour'); setAVuDemiTour(true); }}
        aria-pressed={geste === 'demi-tour'}
        className={`min-h-[44px] rounded-xl border-2 px-4 text-sm font-bold ${
          geste === 'demi-tour'
            ? 'border-rose-700 bg-rose-600 text-white'
            : 'border-slate-300 bg-white text-slate-700 hover:border-rose-400'
        }`}
      >
        Et le demi-tour de 5e ?
      </button>
    </div>
  );

  const steps = [
    {
      num: 1,
      title: 'Tire la flèche',
      subtitle: 'La caisse grise est sur le tapis. Tire la pointe de la flèche bleue : la copie violette suit.',
      done: done1,
      content: (
        <div className="space-y-3">
          {lab}
          <PredictionChips
            prompt="Les cinq traits orange relient chaque sommet à sa copie. À ton avis, que vont-ils faire quand tu déplaceras la flèche ?"
            options={[
              { id: 'croiser', label: 'Ils vont se croiser' },
              { id: 'paralleles', label: 'Ils vont rester parallèles' },
              { id: 'nimporte', label: 'Ils vont partir dans tous les sens' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {!done1 && (
            <Feedback tone="info">
              Essaie {3 - vus.length === 1 ? 'encore un' : `encore ${3 - vus.length}`} réglage
              {3 - vus.length > 1 ? 's' : ''} bien différent{3 - vus.length > 1 ? 's' : ''} :
              vers la gauche, vers le bas, tout près, très loin.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Où que tu emmènes la copie, les cinq traits restent parallèles et de même longueur.
              Chaque sommet a fait <strong>exactement le même trajet</strong>.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Et si on faisait plutôt un demi-tour ?',
      subtitle: 'Le geste de 5e, sur la même caisse. Regarde ce que deviennent les traits.',
      done: done2,
      content: (
        <div className="space-y-3">
          {bascule}
          {lab}
          {!aVuDemiTour && (
            <Feedback tone="info">
              Appuie sur « Et le demi-tour de 5e ? » pour comparer les deux gestes sur la même
              figure.
            </Feedback>
          )}
          {aVuDemiTour && geste === 'demi-tour' && (
            <Feedback tone="info">
              Les traits ne sont plus parallèles : ils se coupent <strong>tous au point rouge</strong>.
              Reviens au tapis roulant pour continuer.
            </Feedback>
          )}
          {done2 && (
            <Feedback tone="ok">
              Deux gestes, deux dessins de traits. C’est à eux qu’on les reconnaît, bien avant de
              mesurer quoi que ce soit.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le geste du tapis porte un nom',
      done: q3,
      content: (
        <div className="space-y-3">
          {/* LA BRIQUE VIENT AVANT LA QUESTION, et ce n'est pas un détail de
              mise en page : le mot n'a encore JAMAIS été écrit à l'élève. Le
              poser dans les options d'un QCM le lui ferait rencontrer sous la
              forme d'une demande, ce que l'audit des dépendances de
              connaissance refuse — et à raison : on ne devine pas un nom. Le
              geste, lui, a été fait cinquante fois : la brique ne fait que le
              nommer. */}
          <KnowledgeBrick
            id="translation"
            variant="new"
            lead="Le geste que tu viens de faire cinquante fois porte un nom."
          />
          <TapQuestion
            prompt="Un dessin montre une figure et sa copie. Les traits qui relient chaque sommet à sa copie se coupent tous en un même point. De quel geste s’agit-il ?"
            options={[
              'D’un demi-tour, pas d’une translation',
              'D’une translation, comme le tapis roulant',
              'D’une translation, parce que la figure a bougé',
            ]}
            correct={0}
            cols={1}
            requires={['translation', 'symetrie-centrale']}
            explain="Des traits qui se croisent tous au même point, c’est la signature du demi-tour de 5e. Dans une translation, ils restent parallèles et ne se coupent jamais."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Décrire un glissement',
      subtitle: 'Règle la flèche comme tu veux, puis lis les trois cases sous la figure.',
      done: q4,
      content: (
        <div className="space-y-3">
          {lab}
          <TapQuestion
            prompt="Un camarade doit refaire ton glissement sans voir ton écran. Que faut-il absolument lui dire ?"
            options={[
              'La direction, le sens et la longueur',
              'La longueur seulement',
              'La direction et la longueur, le sens se devine',
              'Les noms des sommets de la figure',
            ]}
            correct={0}
            cols={1}
            requires={['translation']}
            explain={`Les trois à la fois. Sans le sens, « ${g.sens ?? 'vers la droite'} » deviendrait ambigu : le trajet opposé a exactement la même direction et la même longueur, et il emmène la copie ailleurs.`}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <KnowledgeBrick
              id="trois-caracteres"
              variant="new"
              lead="Les trois cases sous la figure ne bougeaient jamais l’une sans les autres."
            />
          )}
          {q4 && (
            <Feedback tone="info">
              Une question reste ouverte : si on te donne un point et un glissement, où faut-il
              poser sa copie ? C’est le module suivant.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le tapis roulant"
      moduleSubtitle="Faire glisser une figure, et regarder les traits"
      estimatedTime="12 min"
      brief={{
        tag: '🎬 Mission 01',
        title: 'Une caisse sur un tapis',
        tone: 'indigo',
        body: (
          <>
            Sur un tapis roulant, une caisse avance sans jamais pivoter. Tu peux régler ce
            déplacement en tirant une flèche. <strong>Que font les traits qui relient chaque
            coin de la caisse à sa copie ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5">
          <MoveRight className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
          <p className="text-sm text-indigo-900">
            Attrape la <strong>pointe de la flèche bleue</strong> et emmène-la où tu veux.{' '}
            <Eye className="inline h-4 w-4" aria-hidden="true" /> Surveille les traits orange :
            ce sont eux qui racontent le geste.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
