import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseDec } from '@smarter-academy/core';
import RevolutionLab from '../components/RevolutionLab';
import { coneParRevolution, volumeCylindre, aireDisque, arrondi, fr, vol } from '../components/espace4e';

/**
 * Module 4 — MANIPULATION : le cône naît d'un triangle qui tourne.
 *
 * Activity              faire tourner un triangle rectangle autour d'un des
 *                       côtés de son angle droit, jusqu'au tour complet.
 * Mathematical objective un cône de révolution est engendré par cette
 *                       rotation ; sa base est un disque, sa hauteur est
 *                       l'axe, et son volume est encore le TIERS de celui du
 *                       cylindre de même base et même hauteur.
 * Student action        régler l'angle de rotation, puis le rayon et la
 *                       hauteur.
 * Controlled variable   `tour` d'abord (la naissance du solide), puis `rayon`
 *                       et `hauteur` (le rapport qui ne bouge pas).
 * Mathematical state    `coneParRevolution` : rayon, hauteur, génératrice et
 *                       volume viennent du noyau.
 * Visual consequence    le disque de base se remplit ; à 360° le solide est
 *                       fermé, et le rapport affiché reste à 3.
 * Expected observation  « la base est ronde, mais tout le reste se lit comme
 *                       sur la pyramide ».
 * Misconception targeted prendre la génératrice — le bord visible — pour la
 *                       hauteur du cône. C'est le même piège qu'au module 2,
 *                       transposé à la base ronde.
 * Formalization         la brique `cone-de-revolution`, une fois le solide
 *                       fabriqué.
 *
 * DIMENSIONS PROPRES AU MODULE : un cône lisible demande un rayon plutôt
 * petit devant sa hauteur ; la chaîne de continuité s'arrête au module 2
 * (cf. `lesson.config.js`).
 */
const R0 = 3;
const H0 = 8;

export default function Module04LeConeTourneDunTriangle() {
  const [rayon, setRayon] = useState(R0);
  const [hauteur, setHauteur] = useState(H0);
  const [tour, setTour] = useState(0);
  const [ferme, setFerme] = useState(false);
  const [essais, setEssais] = useState([]);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const c = coneParRevolution(rayon, hauteur);
  const vCyl = volumeCylindre(rayon, hauteur);

  const tourner = (v) => {
    setTour(v);
    if (v >= 360) setFerme(true);
  };
  const noter = (champ) => (v) => {
    const suivant = { rayon, hauteur, [champ]: v };
    if (champ === 'rayon') setRayon(v); else setHauteur(v);
    if (tour >= 360) {
      setEssais((liste) => {
        const cle = `${suivant.rayon}-${suivant.hauteur}`;
        return liste.includes(cle) ? liste : [...liste, cle];
      });
    }
  };

  const done1 = ferme;
  // Deux jeux de dimensions différents, tour complet : le rapport ne bouge pas.
  const done2 = essais.length >= 2;

  const lab = (
    <RevolutionLab
      rayon={rayon} hauteur={hauteur} tour={tour}
      onRayon={noter('rayon')} onHauteur={noter('hauteur')} onTour={tourner}
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Fais faire un tour complet au triangle',
      subtitle: 'Le triangle a un angle droit. Il tourne autour du côté vertical de cet angle.',
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Quelle forme le triangle va-t-il balayer en faisant un tour complet ?"
            options={[
              { id: 'boite', label: 'Une boîte' },
              { id: 'pointu', label: 'Un solide pointu à base ronde' },
              { id: 'plat', label: 'Un disque plat' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          {done1 && (
            <Feedback tone="ok">
              Le tour est bouclé. Le côté vertical n’a pas bougé : c’est l’axe. Le côté
              horizontal a balayé un disque entier. Et le côté en biais a fabriqué la surface
              arrondie.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce que la rotation a fabriqué',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Dans ce solide, quelle longueur joue le rôle de la hauteur ?"
            options={[
              'L’axe de rotation : du sommet au centre du disque de base',
              'Le côté en biais, celui qui a balayé la surface arrondie',
              'Le rayon du disque de base',
              'Le tour du disque de base',
            ]}
            correct={0}
            cols={1}
            requires={['base-et-hauteur', 'droites-perpendiculaires']}
            explain={`Comme pour la pyramide : du sommet au plan de la base, à angle droit. Ici l’axe vaut ${fr(hauteur, 0)} cm, alors que le côté en biais vaut ${fr(arrondi(c.generatrice, 2), 2)} cm — c’est lui qu’on voit, et lui qu’on confond.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="cone-de-revolution"
              variant="new"
              lead="Le solide que tu viens de fabriquer porte un nom, et sa définition est ce geste."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le même tiers, sur une base ronde',
      subtitle: 'Change le rayon puis la hauteur, tour complet, et regarde le rapport affiché en bas.',
      done: done2 || q3,
      content: (
        <div className="space-y-3">
          {lab}
          {done2 && (
            <Feedback tone="ok">
              Le rapport reste le même à chaque réglage. Ce n’était donc pas une propriété du
              carré : c’est une propriété de la POINTE.
            </Feedback>
          )}
          <TapQuestion
            prompt="Le cylindre de même base et même hauteur contient combien de fois le cône ?"
            options={['3 fois', '2 fois', '4 fois', 'Cela dépend du rayon']}
            correct={0}
            cols={4}
            requires={['tiers-pyramide', 'cone-de-revolution']}
            explain={`Ici ${vol(vCyl, 'cm', 1)} contre ${vol(c.volume, 'cm', 1)} : le cylindre en contient exactement 3. Le tiers ne dépend ni des dimensions, ni de la forme de la base.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Un premier volume de cône',
      done: q4,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Un cône a un rayon de <strong>3 cm</strong> et une hauteur de <strong>8 cm</strong>.
            L’aire de son disque de base vaut π × 3 × 3, soit environ{' '}
            <strong>{fr(arrondi(aireDisque(3), 1), 1)} cm²</strong>.
          </p>
          <NumericQuestion
            prompt="Quel est son volume, arrondi au cm³ ?"
            expected={Math.round(coneParRevolution(3, 8).volume)}
            parse={parseDec}
            suffix="cm³"
            requires={['tiers-pyramide', 'cone-de-revolution', 'aire', 'arrondi']}
            explain={`On multiplie l’aire de la base par la hauteur, puis on divise par 3 : ${fr(arrondi(aireDisque(3), 1), 1)} × 8 ÷ 3 ≈ ${Math.round(coneParRevolution(3, 8).volume)} cm³.`}
            explainFor={(n) => {
              if (n === Math.round(volumeCylindre(3, 8))) {
                return `${Math.round(volumeCylindre(3, 8))} cm³ est le volume du CYLINDRE de même base et même hauteur. Le cône n’en contient que le tiers.`;
              }
              if (n === 24) return 'Tu as multiplié 3 × 8. Il faut d’abord l’AIRE de la base, π × 3 × 3, pas le rayon.';
              if (n === 8) return 'C’est la hauteur, pas le volume : il reste à la multiplier par l’aire de la base, puis à diviser par 3.';
              return null;
            }}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Tu viens d’appliquer deux fois le même calcul, sur deux solides différents. Le
              module suivant l’écrit une bonne fois — en deux lignes.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Le cône, tourné d’un triangle"
      moduleSubtitle="Une base ronde, et le tiers qui revient"
      estimatedTime="11 min"
      brief={{
        tag: '🎬 Mission 04',
        title: 'Un triangle qui tourne',
        tone: 'indigo',
        body: (
          <>
            Prends un triangle rectangle, fais-le tourner autour d’un côté de son angle droit.{' '}
            <strong>Que balaie-t-il ?</strong> Et ce solide obéit-il à la même règle que la
            pyramide ?
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5">
          <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="text-sm text-emerald-900">
            Commence par la rotation seule. Le solide n’existe pas encore : c’est le geste qui le
            fabrique.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
