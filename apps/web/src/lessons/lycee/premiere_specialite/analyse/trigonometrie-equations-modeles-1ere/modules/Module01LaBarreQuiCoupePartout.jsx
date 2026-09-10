import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BarreLab from '../components/BarreLab';
import {
  COS, ecritureK, solutionsDansFenetre, geometrieFenetre, FENETRES, K_LIMITE,
} from '../components/trigEqUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : « la barre qui coupe
 * partout » (components/BarreLab.jsx).
 *
 * Étape 1  le geste nu : attraper la barre, la faire glisser, et VOIR les
 *          points s'allumer sur la courbe. Objectif : passer par plusieurs
 *          hauteurs et constater que les points ne sont jamais isolés.
 * Étape 2  MONTER la barre au-dessus de 1. Tout s'éteint : il n'y a plus
 *          aucune solution. C'est un constat, et le module le fait faire.
 * Étape 3  redescendre sur une hauteur remarquable et COMPTER : à gauche,
 *          deux points sur le cercle ; à droite, bien plus. Le contraste est
 *          la question du module.
 * Étape 4  la question qui referme : deux points sur le cercle, une infinité
 *          sur la courbe — comment écrire une réponse qui les contienne tous ?
 *          Le module ne le dit pas ; il DEMANDE.
 *
 * LE MODULE NE PRONONCE NI « FAMILLE », NI « + 2kπ », NI « INFINITÉ » DANS UNE
 * POSITION D'ENSEIGNEMENT. Il constate, il compte, et il demande comment on
 * écrit ce qu'il a constaté — c'est le module 2 qui l'écrira (§6bis.1). Aucune
 * brique n'est donc posée ici, et la carte commence au module 2.
 *
 * MANIPULATION JAMAIS GELÉE. Le laboratoire reste pilotable une fois l'étape
 * validée : `disabled` ne porte que le verrou d'ANTÉRIORITÉ d'une étape sur la
 * précédente. Seuls les `PredictionChips` se figent — une prédiction
 * s'enregistre une fois, avant la révélation.
 */

/** La fenêtre la plus étroite : ce que TOUT écran montre, garanti par le test. */
const VUE_MIN = geometrieFenetre(FENETRES[FENETRES.length - 1]);

/** Le nombre de points visibles à k = 1/2 dans la plus petite fenêtre. */
const POINTS_MIN = solutionsDansFenetre(COS, 0.5, VUE_MIN.tMin, VUE_MIN.tMax).length;

export default function Module01LaBarreQuiCoupePartout() {
  // Étape 1 — le geste nu. On garde les hauteurs VISITÉES : c'est le parcours
  // qui fait la découverte, pas une position d'arrivée.
  const [k1, setK1] = useState(0);
  const [vus1, setVus1] = useState([0]);

  // Étape 2 — monter au-dessus de 1.
  const [pred2, setPred2] = useState(null);
  const [k2, setK2] = useState(0.5);
  const [vus2, setVus2] = useState([0.5]);

  // Étape 3 — compter, sur une hauteur remarquable.
  const [k3, setK3] = useState(0);
  const [q3, setQ3] = useState(false);

  const [q4, setQ4] = useState(false);

  // Quatre hauteurs distinctes visitées, dont au moins deux non nulles : le
  // geste a été fait, pas seulement effleuré.
  const done1 = vus1.filter((k) => Math.abs(k) <= 1).length >= 4;
  const done2 = vus2.some((k) => Math.abs(k) > K_LIMITE);
  const done3 = q3;
  const done4 = q4;

  /** La hauteur visitée s'ajoute à l'historique. */
  const visiter = (v, vus, setVus, setK, atteint, deja, react) => {
    setK(v);
    if (vus.includes(v)) return;
    const suivant = [...vus, v];
    setVus(suivant);
    if (!deja && atteint(suivant)) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Attrape la barre et fais-la glisser',
      subtitle:
        'À gauche le cercle, à droite sa courbe déroulée. Une barre horizontale les traverse tous les deux. SAISIS-LA et fais-la monter puis descendre : regarde où elle coupe la courbe.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <BarreLab
            fn={COS}
            k={k1}
            onChangeK={(v) =>
              visiter(v, vus1, setVus1, setK1, (s) => s.filter((x) => Math.abs(x) <= 1).length >= 4, done1, kit.react)
            }
          />
          {done1 ? (
            <Feedback tone="ok">
              Regarde bien la droite : à chaque hauteur, les points allumés ne sont pas
              deux, ni trois — il y en a autant que le cadre peut en montrer, et ils
              continuent au-delà des deux bords. Regarde aussi qu’ils sont{' '}
              <strong>régulièrement espacés</strong>. Continue à faire glisser la barre :
              cet espacement, lui, ne change jamais.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Hauteurs essayées : {vus1.filter((k) => Math.abs(k) <= 1).length} sur 4. Attrape la
              barre — n’importe où sur le trait — et fais-la glisser de haut en bas.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Et si on la monte très haut ?',
      subtitle:
        'La barre est à mi-hauteur. Continue de la MONTER, au-delà du sommet de la courbe. Que va-t-il arriver aux points allumés ?',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="au-dessus du sommet de la courbe, les points allumés vont…"
            options={[
              { id: 'plus', label: 'Devenir plus nombreux' },
              { id: 'aucun', label: 'Disparaître complètement' },
              { id: 'deux', label: 'Se réduire à deux' },
            ]}
            value={pred2}
            onChange={setPred2}
            disabled={done2}
          />
          <BarreLab
            fn={COS}
            k={k2}
            onChangeK={(v) =>
              visiter(v, vus2, setVus2, setK2, (s) => s.some((x) => Math.abs(x) > K_LIMITE), done2, kit.react)
            }
            disabled={!done1}
          />
          {done2 ? (
            <Feedback tone="ok">
              {pred2 === 'aucun' ? 'Ta prédiction tenait' : pred2 ? 'Ta prédiction ne tenait pas' : 'Regarde la figure'} :
              au-dessus de 1, <strong>plus rien ne s’allume</strong>. Et le cercle le dit
              aussi bien : la barre passe complètement à côté de lui. C’est ce que tu
              savais déjà — le point ne quitte jamais le cercle de rayon 1, donc son
              abscisse ne dépasse jamais 1. Redescends la barre et vois les points
              réapparaître d’un coup.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Monte la barre au-dessus de 1 : les crans 1,15 et 1,3 sont là pour ça.
              Hauteur actuelle : k = {ecritureK(k2)}.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Compte à gauche, compte à droite',
      subtitle:
        'Redescends la barre sur une hauteur où des points s’allument, et compare les deux cadres : combien de points rouges sur le CERCLE, combien sur la COURBE ?',
      done: done3,
      content: (
        <div className="space-y-3">
          <BarreLab fn={COS} k={k3} onChangeK={setK3} disabled={!done2} />
          <TapQuestion
            prompt="Ce que tu vois dans les deux cadres, c’est…"
            options={[
              'Deux points sur le cercle, et beaucoup plus sur la courbe — alors qu’il s’agit du MÊME problème',
              'Le même nombre de points des deux côtés',
              'Deux points sur la courbe, et beaucoup plus sur le cercle',
              'Aucun rapport entre les deux cadres',
            ]}
            correct={0}
            cols={1}
            requires={['cercle-trigonometrique', 'cos-sin-coordonnees', 'courbe-sinusoide']}
            explain={`Le cercle n'a que deux points à montrer : il ne connaît qu'un tour, et repasse toujours dessus. La courbe, elle, déroule les tours l'un après l'autre — chaque tour y remet un point. Dans la plus petite fenêtre, la barre en allume déjà ${POINTS_MIN} ; sur un écran plus large, davantage. Et hors du cadre, cela continue.`}
            explainWrong="Compte les points ROUGES. À gauche, sur le cercle, il y en a exactement deux (sauf tout en haut ou tout en bas, où les deux se confondent). À droite, sur la courbe, il y en a bien plus — et il en sortirait encore d’autres si le dessin était plus large."
            solved={done3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Alors, quelle réponse écrire ?',
      done: done4,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-sm text-slate-700 space-y-2">
            <p className="font-semibold text-indigo-900">Ce que tu viens de constater :</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Sur la courbe, les points allumés <strong>ne s’arrêtent jamais</strong> — le cadre les coupe, pas la réalité.</li>
              <li>Ils sont <strong>régulièrement espacés</strong>, du même écart à chaque fois.</li>
              <li>Sur le cercle, il n’y en a pourtant que <strong>deux</strong>.</li>
            </ol>
          </div>
          <TapQuestion
            prompt="Un exercice te demande : « résoudre cos x = 1/2 ». Quelle réponse rendrait compte de ce que tu vois ?"
            options={[
              'Une réponse qui décrit TOUS ces points d’un coup, en disant à la fois où sont les deux du cercle et de combien on avance pour passer d’un point au suivant',
              'Le premier point rouge que tu vois à droite de zéro',
              'Les deux points du cercle, et rien d’autre',
              'La liste des points visibles dans le cadre',
            ]}
            correct={0}
            cols={1}
            requires={['equation-solution', 'equation-deux-solutions', 'periodicite']}
            explain="Donner un seul nombre, ou même deux, laisse de côté tous les autres — et il y en a une infinité. Donner la liste du cadre serait pire encore : elle changerait avec la taille de l’écran. Il faut une écriture qui les contienne TOUS, et elle tient en deux renseignements : où sont les deux points d’un tour, et de combien on avance d’un tour au suivant. Le module qui vient donne cette écriture."
            explainWrong="Repense à ce que fait la barre. Un seul nombre ? Il y en a d’autres, tu les vois. Deux nombres ? Le cercle n’en montre que deux, mais la courbe en montre bien plus, et l’écran en coupe encore d’autres. La liste du cadre ? Elle dépendrait de la largeur de ton écran — une réponse mathématique ne peut pas dépendre de ça."
            solved={done4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La barre qui coupe partout"
      moduleSubtitle="Une hauteur, et des points qui n’en finissent pas"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Deux points sur le cercle, combien sur la courbe ?',
        tone: 'indigo',
        body: (
          <p>
            En Seconde, tu résolvais cos x = k <strong>sur un tour</strong> : deux points, deux
            réponses. Ici, la même barre traverse aussi la <strong>courbe déroulée</strong> — et
            là, le compte n’est plus du tout le même.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Une écriture manque.</strong> Tu as vu des points sans fin, régulièrement
          espacés, et deux points seulement sur le cercle. Il existe une façon d’écrire tout
          cela en une ligne — c’est le module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
