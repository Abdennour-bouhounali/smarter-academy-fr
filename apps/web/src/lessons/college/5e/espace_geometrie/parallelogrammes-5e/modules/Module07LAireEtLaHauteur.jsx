import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AireLab from '../components/AireLab';

/**
 * Module 7 — TRANSFERT : l'aire, et le piège de la hauteur.
 *
 * ACTION → CHANGE → OBSERVATION → SENS
 *   action      : faire glisser le sommet D le long d'une parallèle à la base
 *   change      : le côté [AD] s'allonge à vue d'œil ; la base, la hauteur et
 *                 l'aire ne bougent pas d'un chiffre
 *   observation : « le côté grandit, l'aire ne bouge pas »
 *   sens        : le côté oblique ne peut pas être dans la formule. Ce qui y
 *                 est, c'est la HAUTEUR — la distance entre les deux droites
 *                 parallèles.
 *
 * Expected observation : « j'ai allongé un côté de plusieurs centimètres et
 * l'aire est restée exactement la même ».
 * Misconception targeted : « aire = base × côté », l'erreur la plus tenace de
 * la 5e. Elle n'est pas combattue par une phrase mais par un geste qui la
 * rend impossible : si le côté comptait, l'aire changerait.
 *
 * La prédiction (§9) est ici essentielle : la plupart des élèves prédisent
 * que l'aire va grandir. C'est le moment le plus mémorable du module.
 *
 * Les deux nombres — l'aire du polygone et le produit base × hauteur — sont
 * calculés SÉPARÉMENT dans paral.js et affichés ensemble : ils ne peuvent
 * pas se contredire, et paral.test.js le prouve sur tout le glissement.
 */
export default function Module07LAireEtLaHauteur() {
  const [dx, setDx] = useState(0);
  const [amplitude, setAmplitude] = useState(0);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const assezGlisse = amplitude >= 150;

  /* L'effet de bord vit dans le gestionnaire, pas dans l'updater (voir M3). */
  const glisser = (v, react) => {
    setDx(v);
    const n = Math.max(amplitude, Math.abs(v));
    setAmplitude(n);
    if (n >= 150 && amplitude < 150) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Fais glisser le sommet',
      subtitle: 'D ne peut aller que sur son rail — la parallèle à la base. Regarde les quatre nombres.',
      done: assezGlisse,
      content: (kit) => (
        <div className="space-y-3">
          {!assezGlisse && (
            <PredictionChips
              prompt="avant de glisser : le côté [AD] va s’allonger. D’après toi, l’aire du parallélogramme va…"
              options={[
                { id: 'grandir', label: 'grandir aussi' },
                { id: 'rien', label: 'ne pas bouger' },
                { id: 'baisser', label: 'diminuer' },
              ]}
              value={pred}
              onChange={setPred}
            />
          )}
          <AireLab dx={dx} onDx={(v) => glisser(v, kit.react)} montrerHauteur montrerCote />
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setDx(0)}
              className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:border-slate-300 transition min-h-[44px]"
            >
              ↺ Revenir au départ
            </button>
          </div>
          {assezGlisse ? (
            <Feedback tone="ok">
              {pred === 'grandir'
                ? 'Ta prédiction était « l’aire va grandir ». La figure te contredit : '
                : pred === 'rien'
                  ? 'Ta prédiction était la bonne : '
                  : 'Regarde ce que tu viens d’obtenir : '}
              le côté <strong>[AD] s’est allongé de plusieurs centimètres</strong>, et l’aire n’a
              pas bougé d’un seul cm². Le côté oblique ne peut donc pas entrer dans le calcul de
              l’aire.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Traîne la pastille violette vers la droite ou vers la gauche. Surveille les quatre
              cases : trois disent « ne bouge pas », une seule dit « change ».
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La formule, et ce qu’elle contient',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="aire-parallelogramme"
            variant="new"
            lead={<>Le côté ne compte pas — tu viens de l’allonger sans rien changer. Ce qui compte, c’est la distance entre les deux droites parallèles.</>}
          />
          <NumericQuestion
            prompt={<>Un parallélogramme a une base de 9 cm et une hauteur de 4 cm. Quelle est son aire, en cm² ?</>}
            expected={36}
            suffix="cm²"
            requires={['aire-parallelogramme']}
            explain="Aire = base × hauteur = 9 × 4 = 36 cm²."
            explainFor={(n) => (n === 13
              ? 'On multiplie, on n’additionne pas : l’aire est 9 × 4 = 36 cm². (9 + 4 = 13 donnerait un demi-périmètre, pas une aire.)'
              : n === 26
                ? '26 cm serait le périmètre si les côtés mesuraient 9 et 4. L’aire, elle, est le PRODUIT : 9 × 4 = 36 cm².'
                : undefined)}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le piège, une dernière fois',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-3.5 text-sm text-slate-700">
            Attention : dans un énoncé, on te donne parfois <strong>trois</strong> nombres — la
            base, la hauteur, et le côté oblique. Un seul de ces trois n’a rien à faire dans le
            calcul.
          </div>
          <TapQuestion
            prompt="Un parallélogramme a une base de 10 cm, un côté oblique de 6 cm, et une hauteur de 5 cm. Quelle est son aire ?"
            options={['50 cm²', '60 cm²', '30 cm²', '21 cm²']}
            cols={4}
            correct={0}
            requires={['aire-parallelogramme']}
            explain="Aire = base × hauteur = 10 × 5 = 50 cm². Les 6 cm du côté oblique ne servent à rien ici : tu as vu qu’on peut l’allonger sans que l’aire change."
            explainWrong="60 cm² vient de multiplier la base par le CÔTÉ (10 × 6) — c’est exactement le piège. Le côté oblique peut s’allonger autant qu’on veut sans que l’aire bouge : il n’entre pas dans la formule. Aire = 10 × 5 = 50 cm²."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {/* Le labo reste ouvert : après avoir compris, on peut revérifier
              (jamais geler une manipulation validée). */}
          <details className="rounded-xl border-2 border-slate-200 bg-white p-3">
            <summary className="cursor-pointer text-sm font-bold text-slate-700">
              Revoir le glissement
            </summary>
            <div className="mt-3">
              <AireLab dx={dx} onDx={setDx} montrerHauteur montrerCote />
            </div>
          </details>
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="L’aire, et le piège de la hauteur"
      moduleSubtitle="Un côté qui s’allonge sans rien changer"
      estimatedTime="8 min"
      brief={{
        tag: 'Transfert',
        title: 'Si j’allonge un côté, l’aire grandit-elle ?',
        tone: 'indigo',
        body: (
          <p>
            Ce parallélogramme a un sommet posé sur un rail. Tu peux le faire glisser, mais pas le
            monter ni le descendre. <strong>Le côté va s’allonger</strong> — la question est de
            savoir ce que fera l’aire.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={7} />}
    />
  );
}
