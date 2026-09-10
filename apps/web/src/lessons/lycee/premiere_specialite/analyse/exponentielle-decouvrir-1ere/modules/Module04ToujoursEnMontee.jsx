import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import LaboExponentielle from '../components/LaboExponentielle';
import { EXP, fr, affiche } from '../components/expoUtils';

/**
 * Module 4 — MANIPULATION : le sens de marche, tranché sans un seul calcul.
 *
 * Étape 1  LE GESTE. L'élève fait courir le point de contact le long de la
 *          courbe et lit, côte à côte, l'ordonnée et la pente : elles portent
 *          TOUJOURS le même nombre. C'est f′ = f, relu sur le dessin.
 * Étape 2  LE SIGNE, PUIS LE SENS. Ce nombre commun n'est jamais nul ni négatif
 *          (module 3) : la dérivée est donc strictement positive partout, et le
 *          théorème du sens de marche conclut.
 * Étape 3  la conséquence qui surprend : le tableau n'a qu'UNE flèche, donc pas
 *          de plus grande ni de plus petite valeur atteinte.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 geste → constat ; étape 2 la
 * demande, puis la brique `exp-strictement-croissante` qui l'énonce ; étape 3
 * la conséquence, qui n'exige que ce qui précède.
 *
 * MANIPULATION JAMAIS GELÉE : `verrouille` ne porte QUE le verrou d'ANTÉRIORITÉ
 * de l'étape 2 sur l'étape 1 — jamais la réussite de l'étape courante.
 */
export default function Module04ToujoursEnMontee() {
  const [a1, setA1] = useState(0);
  const [vus1, setVus1] = useState([0]);
  const [a2, setA2] = useState(-1.5);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  // L'objectif : avoir visité un point à GAUCHE de 0, un à DROITE, et 0 —
  // c'est ce qui interdit de croire que le constat ne vaut qu'à droite.
  const gauche = vus1.some((v) => v < -0.01);
  const droite = vus1.some((v) => v > 0.01);
  const done1 = gauche && droite && vus1.length >= 4;
  const done2 = q2;
  const done3 = q3;

  const visiter = (v, react) => {
    setA1(v);
    if (vus1.includes(v)) return;
    const suivant = [...vus1, v];
    setVus1(suivant);
    const ok = suivant.some((x) => x < -0.01) && suivant.some((x) => x > 0.01) && suivant.length >= 4;
    if (!done1 && ok) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Deux nombres qui ne se quittent jamais',
      subtitle:
        'Attrape le point et fais-le courir le long de la courbe. Compare à chaque position l’ordonnée et la pente. Visite des points à gauche ET à droite de 0.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <LaboExponentielle a={a1} onChangeA={(v) => visiter(v, kit.react)} />
          {done1 ? (
            <>
              <Feedback tone="ok">
                Les deux cases affichent toujours le même nombre — et c’est normal, c’est
                exactement la propriété qui définit cette fonction : sa dérivée est elle-même.
                En x = 1 : ordonnée <strong>{fr(affiche(EXP.f(1)))}</strong>, pente{' '}
                <strong>{fr(affiche(EXP.fPrime(1)))}</strong>. En x = −2 : ordonnée{' '}
                <strong>{fr(affiche(EXP.f(-2)))}</strong>, pente{' '}
                <strong>{fr(affiche(EXP.fPrime(-2)))}</strong>.
              </Feedback>
              <Feedback tone="info">
                Regarde surtout ce que la pente ne fait <em>jamais</em> : elle ne devient ni nulle,
                ni négative. Même très à gauche, où la courbe paraît plate, la pente reste
                strictement positive — juste très petite.
              </Feedback>
            </>
          ) : (
            <Feedback tone="info">
              Positions visitées : {vus1.length}. {gauche ? 'À gauche de 0 ✓' : 'Va aussi à gauche de 0'} ·{' '}
              {droite ? 'à droite de 0 ✓' : 'et à droite de 0'}.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Trois pas, et le sens est tranché',
      subtitle: 'Tu peux continuer à déplacer le point pendant que tu réponds.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <LaboExponentielle a={a2} onChangeA={setA2} verrouille={!done1} />
          <div className="rounded-xl border border-emerald-100 bg-white p-4 text-sm text-slate-700 space-y-1">
            <p><strong>1.</strong> La dérivée de cette fonction est la fonction elle-même.</p>
            <p><strong>2.</strong> Cette fonction est strictement positive partout (module précédent).</p>
            <p><strong>3.</strong> Donc sa dérivée est strictement positive partout.</p>
          </div>
          <TapQuestion
            prompt="Que conclut le théorème du sens de marche ?"
            options={[
              'La fonction est strictement croissante sur ℝ tout entier',
              'La fonction est strictement croissante seulement pour x positif',
              'La fonction est croissante puis décroissante',
              'On ne peut pas conclure sans résoudre une équation',
            ]}
            correct={0}
            cols={1}
            requires={['signe-derivee-donne-sens', 'exp-strictement-positive', 'variations', 'ensemble-reels']}
            explain="Une dérivée strictement positive sur un intervalle donne une fonction strictement croissante sur cet intervalle. Ici la dérivée est strictement positive sur ℝ entier : la fonction est donc strictement croissante sur ℝ. Aucune équation à résoudre, aucun tableau de signes à remplir — le signe est acquis d’avance."
            explainWrong="Le raisonnement ne dépend pas du signe de x : la dérivée est strictement positive PARTOUT, à gauche comme à droite. Fais courir le point très à gauche et lis la pente : elle est minuscule, mais toujours strictement positive."
            solved={done2}
            onAnswered={() => setQ2(true)}
          />
          {done2 && (
            <>
              <Feedback tone="ok">
                C’est le cas le plus simple que le théorème puisse rencontrer : d’ordinaire il faut
                résoudre f′(x) = 0 pour découper l’ensemble d’étude. Ici, il n’y a rien à découper.
              </Feedback>
              <KnowledgeBrick
                id="exp-strictement-croissante"
                variant="new"
                lead={<>L’enchaînement complet, et le tableau qu’il produit. Redéplace le point en le lisant.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Un tableau sans retournement',
      done: done3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Puisque la dérivée ne change jamais de signe, que peut-on dire de la plus grande valeur atteinte par cette fonction sur ℝ ?"
            options={[
              'Il n’y en a pas : la fonction monte sans jamais s’arrêter de monter',
              'C’est 1, atteinte en 0',
              'C’est e, atteinte en 1',
              'C’est 0, puisqu’elle s’en approche à gauche',
            ]}
            correct={0}
            cols={1}
            requires={['exp-strictement-croissante', 'variations']}
            explain="La plus grande valeur atteinte se produirait là où la fonction cesse de monter pour redescendre — c’est-à-dire là où sa dérivée changerait de signe. Ici cela n’arrive jamais : le tableau ne comporte qu’une seule flèche, et il n’y a donc ni plus grande ni plus petite valeur atteinte."
            explainWrong="1 et e sont des valeurs prises par la fonction, mais rien n’empêche de les dépasser : la fonction est strictement croissante, donc au-delà de 1 elle vaut plus que e. Quant à 0, c’est justement la valeur qu’elle ne prend jamais."
            solved={done3}
            onAnswered={() => setQ3(true)}
          />
          {done3 && (
            <Feedback tone="ok">
              Une seule flèche montante, du début à la fin. Une conséquence utile : deux abscisses
              rangées dans un sens donnent deux images rangées dans le même sens — l’exponentielle
              conserve l’ordre.
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
      moduleTitle="Toujours en montée"
      moduleSubtitle="Le sens de marche, tranché sans un seul calcul"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Le théorème n’a jamais eu de cas aussi simple',
        tone: 'indigo',
        body: (
          <p>
            D’habitude, pour connaître le sens de marche d’une fonction, on résout f′(x) = 0 et
            l’on découpe. Ici, la dérivée est la fonction elle-même — et l’on sait déjà tout de son
            signe.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Et maintenant ?</strong> Définie partout, strictement positive, strictement
          croissante : il ne manque plus qu’à la tracer proprement. Module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
