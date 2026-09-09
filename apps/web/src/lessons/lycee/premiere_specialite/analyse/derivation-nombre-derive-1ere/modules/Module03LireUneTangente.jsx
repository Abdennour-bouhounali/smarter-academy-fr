import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TangentReader from '../components/TangentReader';
import { CARRE, CUBE, fr } from '../components/derivUtils';

/**
 * Module 3 — MANIPULATION : où le nombre dérivé se VOIT.
 *
 * Étape 1  la droite limite a un nom : tangente. On la lit sur x², où la pente
 *          est simple, et l'on découvre l'escalier.
 * Étape 2  les deux nombres du même point : f(a) l'ordonnée, f′(a) la pente.
 *          En a = 1 sur x² : 1 et 2. Ils ne se confondent plus.
 * Étape 3  le signe : sur g(x) = x³ − 3x, en a = 1,5 la courbe est SOUS l'axe
 *          et la tangente MONTE. Le signe de f′ n'est pas la position de la
 *          courbe — la conception erronée est confrontée par le geste.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 geste → briques
 * `tangente-position-limite` puis `derive-coefficient-directeur` ; étape 2 la
 * demande, légitime ; étape 3 geste → brique `mem-derive-est-la-pente`.
 *
 * MANIPULATION JAMAIS GELÉE : les deux lecteurs restent pilotables après
 * validation. Seul le verrou d'ANTÉRIORITÉ de l'étape 3 sur l'étape 1 demeure.
 */
export default function Module03LireUneTangente() {
  const [a1, setA1] = useState(1);
  const [vus1, setVus1] = useState([1]);
  const [q2, setQ2] = useState(false);
  const [a3, setA3] = useState(-1);
  const [vus3, setVus3] = useState([-1]);
  const [q3, setQ3] = useState(false);

  const done1 = vus1.length >= 3;
  const done2 = q2;
  // L'objectif du 3 : avoir vu une tangente qui monte ET une qui descend.
  const monte = vus3.some((v) => CUBE.fPrime(v) > 0.01);
  const descend = vus3.some((v) => CUBE.fPrime(v) < -0.01);
  const done3 = q3 && monte && descend;

  const visiter = (v, liste, setListe, setA, objectif, react, dejaFait) => {
    setA(v);
    if (liste.includes(v)) return;
    const suivant = [...liste, v];
    setListe(suivant);
    if (!dejaFait && objectif(suivant)) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'La droite limite s’appelle une tangente',
      subtitle:
        'Elle est tracée. Déplace le point de contact et lis sa pente sur l’escalier vert : avance, puis monte. Visite au moins trois positions.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <TangentReader
            fn={CARRE}
            a={a1}
            onChangeA={(v) => visiter(v, vus1, setVus1, setA1, (l) => l.length >= 3, kit.react, done1)}
          />
          {done1 ? (
            <>
              <Feedback tone="ok">
                L’escalier donne la pente directement : en a = 1 il monte de 2 pour une avancée de
                1, et f′(1) = 2. En a = 2, il monte de 4, et f′(2) = 4. <strong>La pente lue sur
                le dessin est exactement le nombre calculé au module 2.</strong>
              </Feedback>
              <KnowledgeBrick
                id="tangente-position-limite"
                variant="new"
                lead={<>D’abord le nom de la droite sur laquelle la sécante s’était couchée.</>}
              />
              <KnowledgeBrick
                id="derive-coefficient-directeur"
                variant="new"
                lead={<>Et voici ce que ton escalier vient de mesurer. Redéplace le point en le lisant.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Positions visitées : {vus1.length} sur 3. À chaque position, compare la marche verte
              et le nombre affiché à droite.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux nombres, un seul point',
      done: done2,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={
              <>
                Sur f(x) = x², au point d’abscisse <strong>1</strong> : l’ordonnée du point vaut 1.
                Combien vaut la <strong>pente de la tangente</strong> en ce point ?
              </>
            }
            expected={2}
            parse={parseDec}
            display="2"
            requires={['nombre-derive', 'derive-coefficient-directeur']}
            explain="f′(1) = 2 × 1 = 2. L’ordonnée f(1) vaut 1 : au même point, deux nombres différents, qui répondent à deux questions différentes — « où est le point ? » et « comment la courbe penche-t-elle ? »."
            explainFor={(n) =>
              n === 1
                ? 'C’est f(1), l’ORDONNÉE du point. La pente de la tangente est f′(1) = 2 × 1 = 2.'
                : null
            }
            solved={done2}
            onAnswered={() => setQ2(true)}
          />
          {done2 && (
            <Feedback tone="ok">
              f(a) répond à « où ? », f′(a) répond à « comment ça penche ? ». Les confondre est
              l’erreur la plus fréquente du chapitre.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le signe de la pente',
      subtitle:
        'Nouvelle courbe : g(x) = x³ − 3x. Déplace le point de contact jusqu’à trouver une position où la tangente MONTE, et une autre où elle DESCEND.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <TangentReader
            fn={CUBE}
            a={a3}
            onChangeA={(v) =>
              visiter(
                v,
                vus3,
                setVus3,
                setA3,
                (l) => l.some((x) => CUBE.fPrime(x) > 0.01) && l.some((x) => CUBE.fPrime(x) < -0.01),
                kit.react,
                monte && descend
              )
            }
            disabled={!done1}
          />
          {monte && descend ? (
            <>
              <Feedback tone="ok">
                Tangente qui monte : pente positive. Qui descend : pente négative. Maintenant
                compare deux points où la courbe est <strong>sous l’axe</strong> : en{' '}
                <strong>a = 0,5</strong> (g = −1,375) la tangente <strong>descend</strong>, mais en{' '}
                <strong>a = 1,5</strong> (g = −1,125) elle <strong>monte</strong>. Être sous l’axe
                n’impose donc aucun signe à la pente : position et pente sont indépendantes.
              </Feedback>
              <KnowledgeBrick
                id="mem-derive-est-la-pente"
                variant="new"
                lead={<>Une seule chose à retenir de ce module.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Trouvé : {monte ? 'une tangente qui monte ✓' : 'aucune tangente qui monte'} ·{' '}
              {descend ? 'une tangente qui descend ✓' : 'aucune tangente qui descend'}.
            </Feedback>
          )}
          {monte && descend && (
            <TapQuestion
              prompt="Sur cette courbe, en un point où la courbe est SOUS l’axe des abscisses, la pente de la tangente est…"
              options={[
                'parfois positive, parfois négative : la position de la courbe ne décide pas du signe de la pente',
                'toujours négative, puisque la courbe est en dessous',
                'toujours positive',
                'toujours nulle',
              ]}
              correct={0}
              cols={1}
              requires={['derive-coefficient-directeur', 'mem-derive-est-la-pente']}
              explain="En a = 0,5 la courbe est sous l’axe et la tangente descend ; en a = 1,5 elle est encore sous l’axe (g = −1,125) et pourtant la tangente monte (g′ = 3,75). « Être en dessous » et « descendre » sont deux propriétés différentes."
              explainWrong="Compare deux points : en a = 0,5 la courbe est sous l’axe et la pente vaut −2,25 ; en a = 1,5 elle est encore sous l’axe et la pente vaut +3,75. Donc être sous l’axe n’impose aucun signe à la pente."
              solved={q3}
              onAnswered={() => setQ3(true)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Lire une tangente"
      moduleSubtitle="Le nombre dérivé se lit sur le dessin"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Où se voit f′(a) ?',
        tone: 'indigo',
        body: (
          <p>
            On sait calculer f′(a). Reste à savoir où ce nombre se lit sur la courbe. Réponse :
            sur la pente d’une droite bien précise.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Et maintenant ?</strong> Tu sais lire une tangente déjà tracée. Module suivant :
          la tracer toi-même — et découvrir qu’elle peut recouper la courbe.
        </KnowledgeSnapshot>
      }
    />
  );
}
