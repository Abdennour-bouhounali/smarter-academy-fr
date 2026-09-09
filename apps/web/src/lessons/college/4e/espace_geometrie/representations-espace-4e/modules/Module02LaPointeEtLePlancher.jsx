import React, { useState } from 'react';
import { Ruler } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { useLabState } from '../../../../../common/hooks/useLabState';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import LongueursLab from '../components/LongueursLab';
import { longueursDe, arrondi, fr } from '../components/espace4e';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 2 — DÉCOUVERTE : trois longueurs se disputent le nom de « hauteur ».
 *
 * Activity              déplacer la pointe de la pyramide au-dessus de son
 *                       plancher, et lire les TROIS longueurs qui changent.
 * Mathematical objective la hauteur d'une pyramide est le segment qui joint le
 *                       sommet au plan de la base en formant avec lui un angle
 *                       droit — ni l'arête latérale, ni l'apothème.
 * Student action        régler le côté de la base et la hauteur ; le labo
 *                       recalcule les trois longueurs à chaque geste.
 * Controlled variable   le côté de la base et la hauteur ; les deux autres
 *                       longueurs en DÉCOULENT, elles ne se règlent pas.
 * Mathematical state    { cote, hauteur } — repris du module 1 par la chaîne
 *                       de continuité ; les trois longueurs viennent de
 *                       `longueursDe`.
 * Visual consequence    la hauteur reste verticale et se pose sur le
 *                       plancher ; les deux autres partent en biais et sont
 *                       toujours plus longues.
 * Expected observation  « il y en a trois, elles sont dans le même ordre à
 *                       chaque fois, et une seule tombe droit ».
 * Misconception targeted prendre l'arête latérale — celle qu'on VOIT sur la
 *                       perspective — pour la hauteur.
 * Formalization         deux briques : la base et la hauteur (concept), puis
 *                       la distinction d'avec l'arête (vocabulaire).
 *
 * CONTINUITÉ : `useLabState(…, 'solide', …)` reprend les dimensions réglées au
 * module 1. C'est la MÊME pyramide, regardée de plus près — la chaîne est
 * déclarée dans `lesson.config.js` (`continuity: { key: 'solide', chain: [1, 2] }`).
 */
export default function Module02LaPointeEtLePlancher() {
  const memo = useLabState(LESSON_CONFIG.id, 'solide', { cote: 8, hauteur: 9 });
  const [cote, setCote] = useState(memo.value.cote ?? 8);
  const [hauteur, setHauteur] = useState(memo.value.hauteur ?? 9);
  const [vues, setVues] = useState([]);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const L = longueursDe(cote, hauteur);

  const regler = (champ) => (v) => {
    const suivant = { cote, hauteur, [champ]: v };
    if (champ === 'cote') setCote(v); else setHauteur(v);
    memo.save(suivant);
    setVues((liste) => {
      const cle = `${suivant.cote}-${suivant.hauteur}`;
      return liste.includes(cle) ? liste : [...liste, cle];
    });
  };

  // Trois réglages différents suffisent pour voir que l'ORDRE ne change pas.
  const done1 = vues.length >= 3;

  const lab = (
    <LongueursLab cote={cote} hauteur={hauteur} onCote={regler('cote')} onHauteur={regler('hauteur')} />
  );

  const steps = [
    {
      num: 1,
      title: 'Déplace la pointe, regarde les trois longueurs',
      subtitle:
        'La pyramide du module précédent, mesurée. Change le côté de la base et la hauteur, au moins trois fois.',
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Sur ce dessin, laquelle de ces trois longueurs est la plus courte ?"
            options={[
              { id: 'verticale', label: 'Celle qui tombe droit' },
              { id: 'biais', label: 'Celle qui va vers un coin' },
              { id: 'egales', label: 'Elles sont égales' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          {done1 && (
            <Feedback tone="ok">
              À chaque réglage, l’ordre est le même : celle qui tombe droit est toujours la plus
              courte. Ce n’est pas un hasard — c’est le plus court chemin jusqu’au plancher.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Laquelle mérite le nom de hauteur ?',
      done: q2,
      content: (
        <div className="space-y-3">
          {lab}
          <TapQuestion
            prompt="Le volume ne dépend que de la base et d’UNE longueur. Laquelle ?"
            options={[
              'Celle qui va du sommet au plancher en formant un angle droit avec lui',
              'Celle qui va du sommet à un coin de la base',
              'Celle qui va du sommet au milieu d’un côté de la base',
              'La plus longue des trois',
            ]}
            correct={0}
            cols={1}
            requires={['droites-perpendiculaires', 'angle-droit', 'tiers-pyramide']}
            explain={`C’est la seule qui mesure « à quelle altitude » se trouve la pointe. Ici elle vaut ${fr(L.hauteur, 2)} cm, alors que les deux autres valent ${fr(arrondi(L.apotheme, 2), 2)} cm et ${fr(arrondi(L.arete, 2), 2)} cm.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="base-et-hauteur"
              variant="new"
              lead="Les deux grandeurs que tu viens d’isoler portent un nom."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Celle qu’on voit n’est pas celle qu’on calcule',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Sur un dessin en perspective, la hauteur passe à l’INTÉRIEUR du solide : elle se
            dessine en pointillé, ou pas du tout. Ce qu’on voit en premier, ce sont les segments
            qui joignent le sommet aux coins de la base — les arêtes latérales.
          </p>
          <TapQuestion
            prompt={`Un élève lit « ${fr(arrondi(L.arete, 2), 2)} cm » sur cette pyramide et l’utilise comme hauteur. Que se passe-t-il ?`}
            options={[
              'Il trouve un volume trop grand : cette longueur dépasse la vraie hauteur',
              'Il trouve un volume trop petit',
              'Cela ne change rien au résultat',
              'Le calcul devient impossible',
            ]}
            correct={0}
            cols={1}
            requires={['base-et-hauteur', 'arete']}
            explain={`L’arête latérale est toujours plus longue que la hauteur — ici ${fr(arrondi(L.arete, 2), 2)} cm contre ${fr(L.hauteur, 2)} cm. Elle part en biais : au lieu de tomber au centre du plancher, elle doit rejoindre un coin, qui est plus loin.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="hauteur-nest-pas-arete"
              variant="new"
              lead="Cette confusion est si fréquente qu’elle mérite sa fiche."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'La base ne bouge pas quand la pointe monte',
      done: q4,
      content: (
        <div className="space-y-3">
          {lab}
          <TapQuestion
            prompt="On garde le même carré de base et on fait monter la pointe. Qu’est-ce qui change ?"
            options={[
              'La hauteur augmente, l’aire de la base reste la même',
              'La hauteur et l’aire de la base augmentent toutes les deux',
              'Seule l’aire de la base augmente',
              'Rien ne change',
            ]}
            correct={0}
            cols={1}
            requires={['base-et-hauteur', 'aire']}
            explain="La base est posée au sol : monter la pointe ne la déforme pas. C’est pour cela que les deux grandeurs se règlent séparément — et que le volume dépend des deux."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Reste une longueur dont on n’a encore rien fait : celle qui vise le MILIEU d’un côté
              de la base. Elle ne sert pas au volume — mais sans elle, impossible de déplier la
              pyramide. C’est le module suivant.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="La pointe et le plancher"
      moduleSubtitle="Trois longueurs, une seule hauteur"
      estimatedTime="10 min"
      brief={{
        tag: '🎬 Mission 02',
        title: 'Trois longueurs se disputent le même nom',
        tone: 'indigo',
        body: (
          <>
            Entre le sommet et la base, on peut tracer plusieurs segments.{' '}
            <strong>Un seul s’appelle la hauteur</strong> — et ce n’est pas celui qu’on voit le
            mieux.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5">
          <Ruler className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden="true" />
          <p className="text-sm text-violet-900">
            Les trois longueurs sont recalculées à chaque geste. Regarde leur ORDRE : c’est lui
            qui ne change jamais.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
