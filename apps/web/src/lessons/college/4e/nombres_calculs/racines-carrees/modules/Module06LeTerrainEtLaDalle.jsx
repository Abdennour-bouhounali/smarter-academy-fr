import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { diagnostiquerRacine, encadrement } from '../components/racines4e';

/**
 * Module 6 — LABORATOIRE DE PRATIQUE : deux problèmes concrets.
 *
 * Chaque problème demande d'abord de RECONNAÎTRE qu'il s'agit d'une racine
 * carrée, ensuite seulement de calculer : identifier l'opération est la vraie
 * difficulté, et elle s'évalue séparément.
 *
 * Le second problème ne tombe pas juste — c'est délibéré. Il oblige à
 * mobiliser l'encadrement du module 4 dans un contexte réel, et à comprendre
 * qu'une réponse « entre 12 et 13 mètres » est parfois la bonne réponse.
 *
 * TRANSFERT : aucun contexte ni aucune valeur des modules 1 à 5 n'est repris.
 */
export default function Module06LeTerrainEtLaDalle() {
  const [op1, setOp1] = useState(false);
  const [cal1, setCal1] = useState(false);
  const [cal2, setCal2] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Le terrain',
      subtitle: 'Reconnais d’abord l’opération, calcule ensuite.',
      done: op1 && cal1,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="racine-dans-un-probleme"
            variant="new"
            lead={<>Un énoncé ne dit jamais « prends la racine carrée ». Il donne une aire et demande une longueur — c’est le signal.</>}
          />

          <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/40 p-3 text-sm text-slate-700">
            Un terrain <strong>carré</strong> a une aire de <strong>169 m²</strong>. On veut
            l’entourer d’une clôture.
            <br />
            Quelle est la longueur d’un côté ?
          </div>

          <TapQuestion
            prompt="Quel calcul donne la longueur d’un côté ?"
            options={[
              <span key="a">169 ÷ 4</span>,
              <span key="b"><MathText>{'$\\sqrt{169}$'}</MathText></span>,
              <span key="c">169 ÷ 2</span>,
              <span key="d">169 × 169</span>,
            ]}
            correct={1}
            cols={4}
            optionLabel={(i) => ['169 ÷ 4', '√169', '169 ÷ 2', '169 × 169'][i]}
            requires={['racine-dans-un-probleme']}
            explain="On connaît l’AIRE et on cherche le CÔTÉ : c’est exactement la racine carrée. (169 ÷ 4 donnerait un quart de l’aire, pas une longueur.)"
            explainWrong="Attention à ne pas confondre avec le périmètre : diviser par 4 servirait si on connaissait le PÉRIMÈTRE. Ici on part de l’aire, donc on remonte par la racine carrée."
            solved={op1}
            onAnswered={() => setOp1(true)}
          />

          {op1 && (
            <NumericQuestion
              prompt="Quelle est la longueur d’un côté, en mètres ?"
              expected={13}
              suffix="m"
              requires={['racine-carree', 'carres-parfaits-4e']}
              explain="√169 = 13, car 13 × 13 = 169. Le côté mesure 13 m. Vérification : 13 × 13 = 169 ✓"
              explainFor={(n) => {
                const code = diagnostiquerRacine(169, n);
                if (code === 'a-pris-la-moitie') {
                  return "Tu as pris la moitié : 84,5 × 84,5 dépasserait très largement 169. Cherche le nombre qui, multiplié par lui-même, donne 169.";
                }
                if (code === 'trop-grand' || code === 'trop-petit') {
                  return `${n} × ${n} = ${n * n}, ce n’est pas 169. Essaie autour de 13 — souviens-toi que 12² = 144 et 14² = 196.`;
                }
                return "169 est un carré parfait : c’est 13². Le côté mesure donc 13 m.";
              }}
              solved={cal1}
              onAnswered={() => setCal1(true)}
            />
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La dalle qui ne tombe pas juste',
      subtitle: 'Cette fois, l’aire n’est pas un carré parfait. Que peut-on quand même affirmer ?',
      done: cal2,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/40 p-3 text-sm text-slate-700">
            Une dalle <strong>carrée</strong> a une aire de <strong>160 m²</strong>. Un tuyau de{' '}
            <strong>13 m</strong> doit traverser un côté de part en part.
            <br />
            Est-il assez long ?
          </div>

          <TapQuestion
            prompt="Que peut-on dire du côté de la dalle ?"
            options={[
              'Il mesure exactement 12,5 m',
              'Il est compris entre 12 m et 13 m : le tuyau de 13 m suffit',
              'Il est compris entre 12 m et 13 m : le tuyau est donc trop court',
              'On ne peut rien dire sans calculatrice',
            ]}
            correct={1}
            cols={1}
            requires={['encadrer-une-racine', 'racine-dans-un-probleme']}
            explain="144 < 160 < 169, donc 12 < √160 < 13. Le côté mesure entre 12 et 13 m : un tuyau de 13 m est donc bien assez long. On a répondu à la question SANS jamais calculer √160."
            explainWrong="On n’a pas besoin de la valeur exacte : l’encadrement suffit à décider. 160 est entre 144 (12²) et 169 (13²), donc le côté est entre 12 et 13 m — forcément moins que 13."
            solved={cal2}
            onAnswered={() => setCal2(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Le terrain et la dalle"
      moduleSubtitle="Remonter d’une aire à une longueur"
      estimatedTime="8 min"
      brief={{
        tag: 'Entraînement',
        title: 'Reconnaître le signal',
        tone: 'amber',
        body: (
          <p>
            Dans un problème, personne n’écrira le symbole <MathText>{'$\\sqrt{\\ }$'}</MathText>.
            Le signal est ailleurs : on te donne une <strong>aire</strong> et on te demande une{' '}
            <strong>longueur</strong>.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
