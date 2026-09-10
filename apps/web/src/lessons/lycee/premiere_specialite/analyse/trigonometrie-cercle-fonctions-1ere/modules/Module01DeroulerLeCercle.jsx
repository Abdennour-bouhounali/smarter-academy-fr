import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DerouleurLab from '../components/DerouleurLab';
import { SIN, COS, aRefaitUnTour, aTourneEnNegatif, labelPi, fr } from '../components/trigFnUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : « dérouler le cercle »
 * (components/DerouleurLab.jsx).
 *
 * Étape 1  le geste nu : enrouler, et voir la hauteur du point se reporter sur
 *          l'axe de droite. La courbe SE DESSINE — elle n'est pas affichée
 *          d'avance. Objectif : atteindre le premier tour.
 * Étape 2  DÉPASSER 2π. La trace repasse EXACTEMENT sur elle-même. C'est un
 *          constat, et le module demande seulement de le décrire.
 * Étape 3  enrouler à l'ENVERS, sur le sinus puis sur le cosinus : trace
 *          miroir d'un côté, trace identique de l'autre. Deux comportements
 *          DIFFÉRENTS pour deux fonctions — c'est ce contraste qui rend la
 *          question du module 3 nécessaire.
 * Étape 4  la question qui referme : ces deux phénomènes ont chacun un nom.
 *          Lequel décrit lequel ? Le module ne le dit pas ; il DEMANDE.
 *
 * LE MODULE NE PRONONCE NI « PÉRIODIQUE » NI « PAIRE / IMPAIRE ». Ces mots
 * n'apparaissent nulle part — ni dans un titre, ni dans une option, ni dans un
 * `explain`. Il constate, et il demande comment on nomme ce qu'il a constaté :
 * c'est le module 3 qui nommera (§6bis.1). Aucune brique n'est donc posée ici,
 * et la carte des connaissances commence au module 2.
 *
 * MANIPULATION JAMAIS GELÉE. Le dérouloir reste pilotable une fois l'étape
 * validée : `disabled` ne porte que le verrou d'ANTÉRIORITÉ d'une étape sur la
 * précédente. Seuls les `PredictionChips` se figent — une prédiction
 * s'enregistre une fois, avant la révélation.
 */
export default function Module01DeroulerLeCercle() {
  // Étape 1 — le geste nu, sur le sinus.
  const [cran1, setCran1] = useState(0);
  const [vus1, setVus1] = useState([0]);

  // Étape 2 — dépasser un tour. On repart du même dérouloir, plus loin.
  const [pred2, setPred2] = useState(null);
  const [cran2, setCran2] = useState(18);
  const [vus2, setVus2] = useState([18]);

  // Étape 3 — tourner à l'envers, sur les DEUX fonctions.
  const [cranS, setCranS] = useState(0);
  const [vusS, setVusS] = useState([0]);
  const [cranC, setCranC] = useState(0);
  const [vusC, setVusC] = useState([0]);

  const [q4, setQ4] = useState(false);

  // Un tour entier reporté : 24 crans visités au moins, de 0 à 2π.
  const done1 = vus1.filter((n) => n >= 0 && n <= 24).length >= 20;
  const done2 = aRefaitUnTour(vus2);
  const done3 = aTourneEnNegatif(vusS) && aTourneEnNegatif(vusC);
  const done4 = q4;

  /** Le cran visité s'ajoute à l'historique : c'est la TRACE qui fait la découverte. */
  const visiter = (v, vus, setVus, setCran, atteint, deja, react) => {
    setCran(v);
    if (vus.includes(v)) return;
    const suivant = [...vus, v];
    setVus(suivant);
    if (!deja && atteint(suivant)) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Enroule, et regarde à droite',
      subtitle:
        'À gauche le cercle, à droite un axe VIDE. ATTRAPE le point et fais-le tourner : sa hauteur se reporte à droite, à la même hauteur. Va jusqu’à un tour complet.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <DerouleurLab
            fn={SIN}
            cran={cran1}
            visites={vus1}
            onChangeCran={(v) =>
              visiter(v, vus1, setVus1, setCran1, (s) => s.filter((n) => n >= 0 && n <= 24).length >= 20, done1, kit.react)
            }
          />
          {done1 ? (
            <Feedback tone="ok">
              L’axe de droite n’est plus vide : une courbe s’y est dessinée, et tu ne l’as jamais
              tracée — elle est SORTIE du cercle. Chaque hauteur du point tournant est devenue un
              point de cette courbe. Continue d’enrouler pour la voir se prolonger.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Positions reportées entre 0 et 2π : {vus1.filter((n) => n >= 0 && n <= 24).length} sur 25.
              Attrape le point sur le cercle et fais-le tourner — le trait orange glisse vers la
              droite à mesure que tu tournes.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Et si on continue au-delà d’un tour ?',
      subtitle:
        'Le point a fait un tour complet. Continue de le faire tourner sans lâcher : que va faire la trace sur l’axe de droite ?',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="au deuxième tour, la trace de droite va…"
            options={[
              { id: 'monter', label: 'Monter de plus en plus haut' },
              { id: 'meme', label: 'Refaire exactement la même forme' },
              { id: 'plate', label: 'S’aplatir sur l’axe' },
            ]}
            value={pred2}
            onChange={setPred2}
            disabled={done2}
          />
          <DerouleurLab
            fn={SIN}
            cran={cran2}
            visites={vus2}
            onChangeCran={(v) => visiter(v, vus2, setVus2, setCran2, aRefaitUnTour, done2, kit.react)}
            disabled={!done1}
          />
          {done2 ? (
            <Feedback tone="ok">
              {pred2 === 'meme' ? 'Ta prédiction tenait' : pred2 ? 'Ta prédiction ne tenait pas' : 'Regarde la trace'} :
              la forme du deuxième tour est <strong>exactement</strong> celle du premier. Et c’est
              normal — après un tour complet, le point est REVENU au même endroit du cercle, donc
              il a la même hauteur. En {labelPi(Math.PI / 6)} comme en 13π/6, sin vaut{' '}
              <strong>{fr(SIN.exact(Math.PI / 6))}</strong>.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Positions reportées au-delà de 2π : {vus2.filter((n) => n > 24).length} sur 6.
              Continue de tourner dans le même sens : le point repasse sur le cercle, mais la
              trace, elle, continue d’avancer vers la droite.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Et si on tourne dans l’autre sens ?',
      subtitle:
        'Repars de 0 et fais tourner le point dans l’AUTRE sens. Fais-le sur les DEUX dérouloirs : celui du sinus, puis celui du cosinus. Compare ce qui apparaît à gauche de 0.',
      done: done3,
      content: (kit) => (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-emerald-800">Le dérouloir du sinus — on reporte la HAUTEUR du point</div>
            <DerouleurLab
              fn={SIN}
              cran={cranS}
              visites={vusS}
              onChangeCran={(v) => visiter(v, vusS, setVusS, setCranS, (s) => aTourneEnNegatif(s) && aTourneEnNegatif(vusC), done3, kit.react)}
              disabled={!done2}
              label="Dérouler le cercle — la hauteur du point"
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-indigo-800">Le dérouloir du cosinus — on reporte la POSITION HORIZONTALE du point</div>
            <DerouleurLab
              fn={COS}
              cran={cranC}
              visites={vusC}
              onChangeCran={(v) => visiter(v, vusC, setVusC, setCranC, (s) => aTourneEnNegatif(vusS) && aTourneEnNegatif(s), done3, kit.react)}
              disabled={!done2}
              label="Dérouler le cercle — la position horizontale du point"
            />
          </div>
          {done3 ? (
            <Feedback tone="ok">
              Les deux ne se comportent PAS pareil. À gauche de 0, la trace du sinus est
              <strong> retournée</strong> : ce qui montait descend. Celle du cosinus, elle, est
              <strong> identique</strong> à ce qu’il y a à droite — comme repliée sur l’axe
              vertical. En −π/6 : sin vaut {fr(SIN.exact(-Math.PI / 6))} contre{' '}
              {fr(SIN.exact(Math.PI / 6))} en π/6, tandis que cos vaut{' '}
              {fr(COS.exact(-Math.PI / 6))} des deux côtés. Refais le geste sur les deux, et
              vérifie.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Reportées à gauche de 0 — sinus : {vusS.filter((n) => n < 0).length} sur 6 ·
              cosinus : {vusC.filter((n) => n < 0).length} sur 6. Il faut faire les deux.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Deux constats, deux noms à trouver',
      done: done4,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-sm text-slate-700 space-y-2">
            <p className="font-semibold text-indigo-900">Ce que tu viens de constater, sans le nommer :</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Au deuxième tour, la trace refait <strong>exactement</strong> la même forme.</li>
              <li>À l’envers, la trace du sinus est <strong>retournée</strong>, celle du cosinus est <strong>inchangée</strong>.</li>
            </ol>
          </div>
          <TapQuestion
            prompt="Ces deux constats portent sur deux choses différentes. Laquelle de ces descriptions est juste ?"
            options={[
              'Le premier dit ce qui se passe quand on AJOUTE un tour ; le second dit ce qui se passe quand on CHANGE DE SENS',
              'Les deux disent la même chose, une fois vers la droite et une fois vers la gauche',
              'Le premier concerne le sinus et le second concerne le cosinus',
              'Le premier concerne le cercle et le second concerne la courbe',
            ]}
            correct={0}
            cols={1}
            requires={['enroulement', 'cos-sin-coordonnees']}
            explain="Ce sont bien deux questions distinctes. « Que devient la valeur si j’ajoute un tour ? » : elle ne change pas, pour les deux fonctions. « Que devient la valeur si je change le signe du réel ? » : le sinus se retourne, le cosinus ne bouge pas. Chacune de ces deux propriétés porte un nom — le module 3 les donnera."
            explainWrong="Regarde tes deux dérouloirs. Le premier constat vaut pour le sinus COMME pour le cosinus : les deux refont la même forme au tour suivant. Le second, lui, les SÉPARE : seul le sinus se retourne. Les deux constats ne peuvent donc pas dire la même chose, ni se répartir un par fonction."
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
      moduleTitle="Dérouler le cercle"
      moduleSubtitle="Le point tourne à gauche, une courbe se dessine à droite"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur',
        title: 'La courbe est le cercle déroulé',
        tone: 'indigo',
        body: (
          <p>
            En Seconde, tu plaçais un point sur le cercle. Ici, tu vas <strong>dérouler son
            mouvement</strong> le long d’un axe : à chaque position, on reporte sa hauteur vers la
            droite. Une courbe va apparaître — et tu ne l’auras jamais tracée.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Deux mots manquent.</strong> Tu as vu la trace se répéter d’un tour à l’autre, et
          se retourner (ou pas) selon le sens. Ces deux propriétés ont chacune un nom précis —
          mais avant de les nommer, il faut savoir situer n’importe quel réel sur le cercle, même
          au-delà d’un tour et même négatif. C’est le module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
