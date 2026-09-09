import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TangentBuilder from '../components/TangentBuilder';
import { CARRE, CUBE, fr } from '../components/derivUtils';

/**
 * Module 4 — ATELIER : poser la droite soi-même.
 *
 * Étape 1  sur x², viser la tangente en a = 1 : une seule pente épouse la
 *          courbe, et c'est f′(1) = 2. La droite proposée passe déjà par le
 *          point de contact — on n'ajuste donc QU'UNE variable (§8).
 * Étape 2  changer de point : la pente juste change avec lui.
 * Étape 3  sur g, viser en a = 1 : la tangente est HORIZONTALE et recoupe la
 *          courbe en −2, DANS le cadre. La conception erronée « une tangente
 *          ne touche qu'en un point » est confrontée par le dessin.
 *
 * CONNAISSANCES AVANT LA DEMANDE : les étapes 1 et 2 n'exigent que ce que les
 * modules 2 et 3 ont posé ; l'étape 3 pose la brique `tangente-peut-recouper`
 * APRÈS le geste qui la rend visible, et AVANT la question qui l'exige.
 *
 * MANIPULATION JAMAIS GELÉE : les trois ateliers restent pilotables une fois
 * la cible atteinte — c'est précisément le moment où l'on veut réessayer.
 */
export default function Module04TracerLaTangente() {
  const [a1, setA1] = useState(1);
  const [m1, setM1] = useState(0);
  const [touche1, setTouche1] = useState(false);

  const [a2, setA2] = useState(2);
  const [m2, setM2] = useState(0);
  const [touche2, setTouche2] = useState(false);

  const [a3, setA3] = useState(1);
  const [m3, setM3] = useState(0);
  const [touche3, setTouche3] = useState(false);
  const [q3, setQ3] = useState(false);

  const viser = (fn, a, m, deja, setTouche, react) => {
    if (!deja && Math.abs(m - fn.fPrime(a)) < 1e-9) {
      setTouche(true);
      react?.(true);
    }
  };

  const done1 = touche1;
  const done2 = touche2;
  const done3 = touche3 && q3;

  const steps = [
    {
      num: 1,
      title: 'Vise la tangente',
      subtitle:
        'Le point de contact est en a = 1. Règle la pente de ta droite jusqu’à ce qu’elle épouse la courbe au lieu de la traverser.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <TangentBuilder
            fn={CARRE}
            a={a1}
            onChangeA={setA1}
            m={m1}
            onChangeM={(v) => {
              setM1(v);
              viser(CARRE, a1, v, touche1, setTouche1, kit.react);
            }}
            pasM={CARRE.pasPente}
            showVraie={done1}
          />
          {done1 ? (
            <Feedback tone="ok">
              Une seule pente épouse la courbe en ce point : <strong>2</strong>, et c’est
              exactement f′(1). Trop petite, la droite passe sous la courbe ; trop grande, elle
              la traverse. Continue à régler pour le voir.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Ta droite passe déjà par le point de contact : il ne reste qu’à trouver la bonne
              <strong> pente</strong>. Regarde de quel côté elle traverse la courbe.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Un autre point, une autre pente',
      subtitle: 'Cette fois le contact est en a = 2. Trouve la pente qui convient.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <TangentBuilder
            fn={CARRE}
            a={a2}
            onChangeA={setA2}
            m={m2}
            onChangeM={(v) => {
              setM2(v);
              viser(CARRE, a2, v, touche2, setTouche2, kit.react);
            }}
            pasM={CARRE.pasPente}
            showVraie={done2}
            disabled={!done1}
          />
          {done2 ? (
            <Feedback tone="ok">
              En a = 2 il faut une pente de <strong>4</strong>, contre 2 en a = 1 : la tangente
              n’est pas une droite unique attachée à la courbe, il y en a une par point. Déplace
              le point de contact et cherche la pente qui va avec.
            </Feedback>
          ) : (
            <Feedback tone="info">La pente de 2 ne convient plus ici. f′(2) = 2 × 2.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Une tangente qui recoupe la courbe',
      subtitle:
        'Nouvelle courbe, contact en a = 1. Trouve la pente — puis regarde ce que fait la droite plus à gauche.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <TangentBuilder
            fn={CUBE}
            a={a3}
            onChangeA={setA3}
            m={m3}
            onChangeM={(v) => {
              setM3(v);
              viser(CUBE, a3, v, touche3, setTouche3, kit.react);
            }}
            pasM={CUBE.pasPente}
            showVraie={touche3}
            disabled={!done2}
          />
          {touche3 ? (
            <>
              <Feedback tone="ok">
                g′(1) = 3 × 1² − 3 = <strong>0</strong> : la tangente est <strong>horizontale</strong>,
                d’équation y = −2. Elle touche la courbe en x = 1… et la <strong>recoupe en
                x = −2</strong>, bien visible à gauche du repère.
              </Feedback>
              <KnowledgeBrick
                id="tangente-peut-recouper"
                variant="new"
                lead={<>Ce que tu viens de voir contredit une idée très répandue.</>}
              />
              <TapQuestion
                prompt="« Une tangente ne touche la courbe qu’en un seul point. » Cette phrase est…"
                options={[
                  'fausse : elle est tangente EN un point, mais rien ne l’empêche de recouper la courbe ailleurs',
                  'vraie : c’est la définition d’une tangente',
                  'vraie seulement pour les paraboles',
                  'impossible à trancher',
                ]}
                correct={0}
                cols={1}
                requires={['tangente-position-limite', 'tangente-peut-recouper']}
                explain="« Tangente » décrit ce qui se passe AU point de contact : la droite y épouse la courbe. Ailleurs, elle fait ce qu’elle veut — ici, la droite y = −2 recoupe la courbe en x = −2."
                explainWrong="Regarde ton dessin : la droite horizontale y = −2 touche la courbe en x = 1 et la recoupe en x = −2. Une tangente est définie par son comportement au point de contact, pas sur tout le repère."
                solved={q3}
                onAnswered={() => setQ3(true)}
              />
            </>
          ) : (
            <Feedback tone="info">
              Sur cette courbe, en a = 1, la pente est plus petite que tu ne le penses peut-être :
              g′(x) = 3x² − 3.
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
      moduleTitle="Tracer la tangente"
      moduleSubtitle="Le bon point, la bonne pente"
      estimatedTime="12 min"
      brief={{
        tag: 'Atelier',
        title: 'À toi de poser la droite',
        tone: 'indigo',
        body: (
          <p>
            Tu sais lire une tangente déjà tracée. Pose-la maintenant toi-même : le point de
            contact est donné, la pente est à trouver.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Il manque encore une chose.</strong> Tu sais placer la tangente sur un dessin.
          Module suivant : l’écrire, avec une équation.
        </KnowledgeSnapshot>
      }
    />
  );
}
