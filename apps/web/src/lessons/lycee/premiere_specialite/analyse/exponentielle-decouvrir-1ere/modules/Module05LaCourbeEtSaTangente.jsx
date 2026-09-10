import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import LaboExponentielle from '../components/LaboExponentielle';
import { EXP, tangenteEnZero, eq, parseSigned, fr, affiche } from '../components/expoUtils';

/**
 * Module 5 — ATELIER : tracer la courbe, poser sa tangente en 0, lire les deux
 * bouts.
 *
 * Étape 1  LA TANGENTE EN 0. L'élève amène le point de contact EXACTEMENT sur 0
 *          — cible atteignable, vérifiée par test — et lit les deux nombres :
 *          ils valent 1 tous les deux, et pour la même raison. D'où y = x + 1.
 * Étape 2  l'équation, écrite puis VÉRIFIÉE en remettant x = 0. Le piège
 *          classique « y = x » est confronté par le calcul.
 * Étape 3  LES DEUX BOUTS. L'élève emmène le point très à gauche puis très à
 *          droite, et lit ce que devient la pente.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 geste → brique `tangente-en-zero` ;
 * étape 2 la demande, légitime ; étape 3 geste → brique
 * `exp-comportement-aux-bornes`.
 *
 * MANIPULATION JAMAIS GELÉE : les trois laboratoires restent pilotables après
 * validation. Seul demeure le verrou d'ANTÉRIORITÉ de l'étape 3 sur l'étape 1.
 */
export default function Module05LaCourbeEtSaTangente() {
  const [a1, setA1] = useState(1);
  const [vuZero, setVuZero] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q4, setQ4] = useState(false);
  const [a3, setA3] = useState(0);
  const [vus3, setVus3] = useState([0]);

  const t0 = tangenteEnZero();

  const done1 = vuZero;
  const done2 = q2;
  // L'objectif du 3 : être allé aux DEUX extrémités du cadre.
  const loinGauche = vus3.some((v) => v <= -2);
  const loinDroite = vus3.some((v) => v >= 1.75);
  const done3 = loinGauche && loinDroite;

  const visiterZero = (v, react) => {
    setA1(v);
    if (!vuZero && Math.abs(v) < 1e-9) {
      setVuZero(true);
      react?.(true);
    }
  };

  const visiterBords = (v, react) => {
    setA3(v);
    if (vus3.includes(v)) return;
    const suivant = [...vus3, v];
    setVus3(suivant);
    const ok = suivant.some((x) => x <= -2) && suivant.some((x) => x >= 1.75);
    if (!done3 && ok) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Amène le point exactement sur 0',
      subtitle:
        'Fais glisser le point de contact jusqu’à l’abscisse 0, et lis les deux nombres. Ils sont égaux — comme partout — mais ici leur valeur commune est remarquable.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <LaboExponentielle a={a1} onChangeA={(v) => visiterZero(v, kit.react)} />
          {done1 ? (
            <>
              <Feedback tone="ok">
                En 0, l’ordonnée vaut <strong>1</strong> — c’est la seconde exigence de la
                définition — et la pente vaut <strong>1</strong> aussi, puisqu’elle est égale à
                l’ordonnée. Les deux nombres nécessaires à l’équation de la tangente sont donc
                connus sans le moindre calcul.
              </Feedback>
              <KnowledgeBrick
                id="tangente-en-zero"
                variant="new"
                lead={<>L’équation qui découle de ces deux 1. Redéplace le point pour la voir se placer.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Abscisse actuelle : <strong>{fr(a1)}</strong>. Continue de glisser jusqu’à 0 — le
              point s’aimante sur les crans, donc 0 est atteignable exactement.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Vérifie l’équation',
      done: done2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-rose-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <p>
              On applique la formule connue : y = f′(0)(x − 0) + f(0), avec f′(0) = 1 et f(0) = 1.
              On obtient <strong>{eq(t0)}</strong>.
            </p>
            <p>
              Le réflexe de vérification : remettre x = 0 dans l’équation et retrouver l’ordonnée
              du point de contact.
            </p>
          </div>
          <NumericQuestion
            prompt={<>Que donne l’équation <strong>{eq(t0)}</strong> lorsque l’on remplace x par <strong>0</strong> ?</>}
            expected={1}
            parse={(raw) => parseSigned(raw, parseDec)}
            display="1"
            requires={['tangente-en-zero', 'formule-equation-tangente']}
            explain="0 + 1 = 1, qui est bien l’ordonnée du point de contact. L’équation passe donc par (0 ; 1) : la vérification est concluante."
            explainFor={(n) =>
              n === 0
                ? 'C’est ce que donnerait y = x, l’erreur classique : cette droite passe par (0 ; 0) et rate donc le point de contact, qui est (0 ; 1). Il manque le « + 1 ».'
                : null
            }
            solved={done2}
            onAnswered={() => setQ2(true)}
          />
          {done2 && (
            <Feedback tone="ok">
              Écrire <em>y = x</em> est l’erreur la plus fréquente : la pente serait juste, mais la
              droite passerait par l’origine, à une unité en dessous du vrai point de contact.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Les deux bouts de la courbe',
      subtitle:
        'Emmène le point tout à gauche du cadre, puis tout à droite. Lis la pente à chaque fois, et regarde ce que fait la courbe.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <LaboExponentielle
            a={a3}
            onChangeA={(v) => visiterBords(v, kit.react)}
            montrerTangenteZero
            verrouille={!done1}
          />
          {done3 ? (
            <>
              <Feedback tone="ok">
                À droite, la pente s’emballe : en x = 2 elle vaut déjà{' '}
                <strong>{fr(affiche(EXP.fPrime(2)))}</strong>. À gauche, elle s’écrase : en
                x = −2,5 elle ne vaut plus que <strong>{fr(affiche(EXP.fPrime(-2.5)))}</strong>.
                Les deux comportements viennent de la même règle — la pente est la hauteur.
              </Feedback>
              <Feedback tone="info">
                Et la courbe se colle à l’axe sans jamais l’atteindre : c’est le module 3 qui l’a
                démontré, et le tracé le confirme. Remarque aussi que la tangente en 0, en
                pointillés, passe <strong>en dessous</strong> de la courbe partout ailleurs.
              </Feedback>
              <KnowledgeBrick
                id="exp-comportement-aux-bornes"
                variant="new"
                lead={<>Ce que tu viens de lire aux deux extrémités, dit en deux phrases.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              {loinGauche ? 'Tout à gauche ✓' : 'Va tout à gauche du cadre'} ·{' '}
              {loinDroite ? 'tout à droite ✓' : 'puis tout à droite'}.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Ce que le tracé ne montre pas',
      done: q4,
      content: (
        <TapQuestion
          prompt="Très à gauche, la courbe paraît se confondre avec l’axe des abscisses. Que se passe-t-il vraiment ?"
          options={[
            'Elle s’en rapproche autant qu’on veut, mais reste strictement au-dessus : elle ne l’atteint jamais',
            'Elle finit par le toucher, puis passe en dessous',
            'Elle le touche en un point précis, puis remonte',
            'Elle devient constante et égale à 0',
          ]}
          correct={0}
          cols={1}
          requires={['exp-comportement-aux-bornes', 'mem-exp-jamais-nulle']}
          explain="exp(−10) vaut environ 0,0000454 : c’est minuscule, mais strictement positif. Le tracé ne peut pas distinguer une telle valeur de zéro, alors que le raisonnement du module 3, lui, tranche : la fonction ne s’annule nulle part."
          explainWrong="Un dessin ne prouve rien à cette échelle. Reviens au raisonnement : si la fonction valait 0 en un point, elle y serait plate, donc nulle partout — ce qui contredit exp(0) = 1."
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="La courbe et sa tangente en 0"
      moduleSubtitle="Un tracé, une droite remarquable, et deux bouts"
      estimatedTime="11 min"
      brief={{
        tag: 'Atelier',
        title: 'Le portrait complet',
        tone: 'indigo',
        body: (
          <p>
            Tu sais tout d’elle : définie partout, strictement positive, strictement croissante.
            Reste à la tracer, à poser la droite qui la touche en son point le plus simple, et à
            regarder ce qu’elle devient très loin.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Dernier outil.</strong> Tu sais dériver l’exponentielle : c’est elle-même. Mais
          e^{'{2x}'} ? Module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
