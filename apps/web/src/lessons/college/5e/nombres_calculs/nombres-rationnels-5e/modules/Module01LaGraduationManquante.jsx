import React, { useState } from 'react';
import { Ruler, Move } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FractionLineLab from '../components/FractionLineLab';
import { frac, memeNombre, texte, PAIRE_SIGNATURE } from '../components/rationnels';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : la graduation manquante
 * (components/FractionLineLab.jsx).
 *
 * Activity              fabriquer la graduation d'une règle qui ne connaît que
 *                       les entiers, puis y placer un nombre.
 * Mathematical objective une fraction est UN NOMBRE : une position sur la
 *                       droite, aussi légitime que celle d'un entier.
 * Student action        choisir en combien de parts couper l'unité, puis
 *                       glisser le curseur de graduation en graduation.
 * Controlled variables  le découpage (dénominateur) et la position (numérateur)
 *                       — et rien d'autre.
 * Visual consequence    la droite se re-gradue à l'instant ; le curseur garde
 *                       sa LONGUEUR et change d'écriture ; le segment parcouru
 *                       depuis zéro se redessine.
 * Expected observation  « il y a bien un endroit précis pour 3/4 » puis, le
 *                       choc : « en coupant en huit, le curseur n'a pas bougé
 *                       d'un pixel, mais il s'appelle maintenant 6/8 ».
 * Misconception targeted lire une fraction comme DEUX nombres, ou comme un
 *                       dessin de parts sans place sur la droite.
 * Formalization         le mot « nombre » n'est posé qu'à l'étape 4, après
 *                       trois manipulations, porté par une KnowledgeBrick.
 *                       L'égalité de fractions n'est ici que CONSTATÉE : la
 *                       règle du ×k appartient au module 2, qui garde ainsi sa
 *                       découverte.
 * Transfer              module 2 : pourquoi la position n'a-t-elle pas bougé ?
 *
 * §6bis / règle M1 : l'étape 1 REND la manipulation ; la prédiction vit à
 * l'intérieur de l'étape comme une invitation, jamais comme un péage. La
 * manipulation reste REJOUABLE après validation — aucun `disabled` lié à `done`.
 */
const TROIS_QUARTS = PAIRE_SIGNATURE.a;   // 3/4

export default function Module01LaGraduationManquante() {
  // Étape 1 — fabriquer la graduation en quarts et atteindre 3/4.
  const [den1, setDen1] = useState(2);
  const [num1, setNum1] = useState(0);
  const [place1, setPlace1] = useState(false);
  const [pred1, setPred1] = useState(null);
  const done1 = place1;

  // Étape 2 — la même position, une autre graduation.
  const [den2, setDen2] = useState(4);
  const [num2, setNum2] = useState(3);
  const [ecritures, setEcritures] = useState(() => new Set(['3/4']));
  const done2 = ecritures.size >= 2;

  // Étape 3 — un nombre plus grand que 1.
  const [den3, setDen3] = useState(3);
  const [num3, setNum3] = useState(0);
  const [place3, setPlace3] = useState(false);
  const done3 = place3;

  const [q4, setQ4] = useState(false);

  // `d` est le dénominateur qui accompagne `n` — fourni par le laboratoire, et
  // non lu dans l'état, qui n'est pas encore à jour quand on vient de changer
  // le découpage (les deux setState sont groupés dans le même rendu).
  const bouger1 = (n, d, react) => {
    setNum1(n);
    if (!place1 && memeNombre(frac(n, d), TROIS_QUARTS)) { setPlace1(true); react?.(true); }
  };

  const bouger2 = (n, d, react) => {
    setNum2(n);
    if (memeNombre(frac(n, d), TROIS_QUARTS)) {
      const e = texte(frac(n, d));
      const next = new Set(ecritures);
      next.add(e);
      setEcritures(next);
      if (next.size >= 2 && ecritures.size < 2) react?.(true);
    }
  };

  const bouger3 = (n, d, react) => {
    setNum3(n);
    if (!place3 && memeNombre(frac(n, d), frac(5, 3))) { setPlace3(true); react?.(true); }
  };

  const steps = [
    {
      num: 1,
      title: 'Place 3/4 sur la règle',
      subtitle: 'La règle ne connaît que 0 et 1. Choisis d’abord en combien de parts couper l’unité, puis glisse le point.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <FractionLineLab
            den={den1}
            onDen={setDen1}
            num={num1}
            onNum={(n, d) => bouger1(n, d, kit.react)}
            maxUnits={1}
            densChoices={[2, 3, 4, 6, 8]}
            cible={done1 ? null : TROIS_QUARTS}
            ariaLabel="Règle graduée — place trois quarts"
          />
          <PredictionChips
            prompt="entre 0 et 1, penses-tu qu’il existe un endroit précis pour 3/4 ?"
            options={[
              { id: 'oui', label: 'Oui, un seul endroit précis' },
              { id: 'plusieurs', label: 'Plusieurs endroits possibles' },
              { id: 'non', label: 'Non, il n’y a rien entre 0 et 1' },
            ]}
            value={pred1}
            onChange={setPred1}
          />
          {done1 ? (
            <Feedback tone="ok">
              {pred1 === 'oui' ? 'Ta prédiction était la bonne' : 'Tu viens de le voir'} :{' '}
              <strong>3/4 a une place, et une seule</strong>. Il a fallu couper l’unité en{' '}
              <strong>4</strong> — c’est le nombre du bas qui le disait — puis compter{' '}
              <strong>3</strong> graduations depuis zéro : c’est le nombre du haut. Entre 0 et 1,
              il y a donc bien des nombres.
            </Feedback>
          ) : (
            <Feedback tone="info">
              L’anneau ambre est la cible. Commence par choisir le bon découpage : lequel des
              boutons du haut fait apparaître une marque exactement là ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Change le découpage, sans bouger le point',
      subtitle: 'Le curseur est sur 3/4. Coupe maintenant l’unité en 8, et regarde bien : est-ce que le point se déplace ?',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <FractionLineLab
            den={den2}
            onDen={setDen2}
            num={num2}
            onNum={(n, d) => bouger2(n, d, kit.react)}
            maxUnits={1}
            densChoices={[4, 8, 12]}
            ariaLabel="Règle graduée — change le découpage"
          />
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-500">Écritures trouvées pour ce point</span>
            {[...ecritures].map((e) => (
              <span
                key={e}
                className="px-3 py-1.5 rounded-lg bg-violet-50 border-2 border-violet-200 font-mono font-bold text-violet-800"
              >
                {e}
              </span>
            ))}
          </div>
          {done2 ? (
            <Feedback tone="ok">
              Le point <strong>n’a pas bougé d’un pixel</strong>. Et pourtant il ne s’appelle plus
              pareil : <strong className="font-mono">3/4</strong> et{' '}
              <strong className="font-mono">6/8</strong> sont deux écritures{' '}
              <strong>du même nombre</strong>. Il y a deux fois plus de parts, mais elles sont deux
              fois plus fines — la longueur depuis zéro est identique.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Choisis le découpage en 8, puis amène le curseur exactement au même endroit qu’avant.
              Quelle écriture s’affiche alors ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Et au-delà de 1 ?',
      subtitle: 'La règle va maintenant jusqu’à 2. Place le nombre 5/3.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <FractionLineLab
            den={den3}
            onDen={setDen3}
            num={num3}
            onNum={(n, d) => bouger3(n, d, kit.react)}
            maxUnits={2}
            densChoices={[2, 3, 4, 6]}
            cible={done3 ? null : frac(5, 3)}
            ariaLabel="Règle graduée jusqu’à 2 — place cinq tiers"
          />
          {done3 ? (
            <Feedback tone="ok">
              <strong className="font-mono">5/3</strong> est situé{' '}
              <strong>entre 1 et 2</strong> : cinq tiers, c’est trois tiers (soit 1) plus deux
              tiers. Une fraction n’est donc pas forcément plus petite que 1 — elle occupe
              simplement sa place sur la droite, comme n’importe quel nombre.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Coupe chaque unité en 3, puis compte 5 graduations depuis zéro. Tu vas dépasser le 1 —
              c’est normal.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Ce que tu viens de placer',
      done: q4,
      content: (
        <div className="space-y-3">
          {/* Trois manipulations viennent de montrer qu'une fraction occupe une
              position unique, qu'elle peut dépasser 1, et que deux écritures
              peuvent tomber au même endroit. Le mot arrive maintenant, avant la
              question qui l'exige. La RÈGLE du ×k, elle, est laissée au M2. */}
          <KnowledgeBrick
            id="fraction-nombre"
            variant="new"
            lead={<>Tu as fabriqué la graduation, placé <strong>3/4</strong>, puis <strong>5/3</strong> au-delà de 1. Ce que tu as placé porte un nom très simple.</>}
          />
          <TapQuestion
            prompt="Qu’est-ce que 3/4, exactement ?"
            options={[
              'Un nombre, situé entre 0 et 1 sur la droite graduée',
              'Deux nombres écrits l’un au-dessus de l’autre',
              'Une division qu’il reste à effectuer',
              'Un dessin de parts, qui n’a pas de place sur la droite',
            ]}
            correct={0}
            cols={1}
            requires={['fraction-nombre']}
            explain="3/4 occupe UNE position précise sur la droite graduée, entre 0 et 1 : c’est donc un nombre à part entière, au même titre que 2 ou que 7."
            explainWrong="Souviens-toi de ce que tu viens de faire : tu as amené un curseur à un endroit unique, et il y est resté. Ce n’est pas un dessin ni un calcul en attente — c’est un point sur la droite, donc un nombre."
            solved={q4}
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
      moduleTitle="La graduation manquante"
      moduleSubtitle="Où se place une fraction sur une règle ?"
      estimatedTime="12 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Une règle trop pauvre',
        tone: 'indigo',
        body: (
          <p>
            On te demande de placer <strong className="font-mono">3/4</strong> sur une règle où
            seuls <strong>0</strong> et <strong>1</strong> sont marqués. Entre les deux : rien. Il
            va donc falloir <strong>fabriquer les marques toi-même</strong> — et décider combien il
            en faut.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Ruler, t: 'Le découpage', d: 'Le nombre du BAS : en combien de parts tu coupes l’unité.', c: 'text-slate-700' },
            { icon: Move, t: 'Le curseur', d: 'Le nombre du HAUT : combien de parts tu parcours depuis zéro.', c: 'text-indigo-600' },
          ].map(({ icon: Icon, t, d, c }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className={`w-5 h-5 mb-1 ${c}`} aria-hidden="true" />
              <p className="font-semibold text-slate-800 text-sm">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
