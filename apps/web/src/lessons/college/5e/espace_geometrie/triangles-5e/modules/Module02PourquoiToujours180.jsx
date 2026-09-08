import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DecoupageLab from '../components/DecoupageLab';
import TriangleLab from '../components/TriangleLab';

/**
 * Module 2 — DÉCOUVERTE : pourquoi toujours 180 ?
 *
 * Le module 1 a installé la conviction ; celui-ci fournit la RAISON. C'est
 * l'une des deux démonstrations exigées par le programme, et elle est ici
 * jouée plutôt que racontée : l'élève tire un curseur, les trois coins se
 * détachent du triangle et viennent se ranger contre une droite. Ils la
 * remplissent exactement.
 *
 * §6bis — l'étape 1 rend le laboratoire, pas un énoncé.
 *
 * LA PREUVE NE PEUT PAS TRICHER : les secteurs recollés ont la mesure exacte
 * des angles du triangle affiché (recollageAngles, testé). Sur un triangle
 * différent — l'élève peut en changer à l'étape 2 — le résultat tient encore,
 * ce qui écarte l'idée d'un cas particulier bien choisi.
 *
 * Expected observation : « les trois coins mis bout à bout font un angle plat,
 * donc 180° ».
 * Misconception targeted : croire que 180 est un nombre arbitraire à retenir,
 * ou que la démonstration ne vaut que pour le triangle dessiné.
 */
const DEPART = [{ x: 300, y: 120 }, { x: 150, y: 360 }, { x: 570, y: 330 }];
const AUTRE = [{ x: 480, y: 110 }, { x: 170, y: 300 }, { x: 620, y: 370 }];

export default function Module02PourquoiToujours180() {
  const [avancement, setAvancement] = useState(0);
  const [tri, setTri] = useState(DEPART);
  const [vuRecollage, setVuRecollage] = useState(false);
  const [triChange, setTriChange] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Découpe les trois coins, et recolle-les',
      subtitle: 'Tire le curseur : les trois coins quittent le triangle et se rangent contre la droite.',
      done: vuRecollage,
      content: (kit) => (
        <div className="space-y-3">
          <DecoupageLab
            tri={tri}
            avancement={avancement}
            ariaLabel="Les trois coins du triangle se détachent et se recollent bout à bout le long d’une droite"
          />
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-600 shrink-0">Découper :</span>
            <input
              type="range"
              min={0} max={1} step={0.01}
              value={avancement}
              onChange={(e) => {
                const v = Number(e.target.value);
                setAvancement(v);
                if (v >= 0.98 && !vuRecollage) { setVuRecollage(true); kit.react?.(true); }
              }}
              className="w-full accent-indigo-600"
              aria-label="Détacher les coins et les recoller"
            />
          </div>
          {vuRecollage ? (
            <Feedback tone="ok">
              Les trois coins se rangent <strong>bout à bout</strong>, sans trou et sans
              chevauchement, et ils remplissent <strong>exactement</strong> le demi-tour au-dessus
              de la droite. Or ce demi-tour est un <strong>angle plat</strong> : il mesure 180°.
              Voilà d’où vient le nombre.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Tire le curseur jusqu’au bout. Regarde bien : les coins ne sont ni agrandis ni
              rétrécis en route — chacun garde sa mesure, affichée dessus.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Et sur un autre triangle ?',
      subtitle: 'Une démonstration qui ne marcherait que sur un dessin ne prouverait rien.',
      done: triChange,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-3.5 text-sm text-slate-700">
            Change de triangle, puis refais le découpage ci-dessus. Si le recollage marche encore,
            c’est que la preuve ne dépendait pas de la figure choisie.
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setTri((t) => (t === DEPART ? AUTRE : DEPART));
                setAvancement(0);
                if (!triChange) { setTriChange(true); kit.react?.(true); }
              }}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition"
            >
              🔄 Changer de triangle
            </button>
          </div>
          {triChange ? (
            <Feedback tone="ok">
              Le découpage ne s’appuie sur <strong>aucune particularité</strong> du triangle : on
              découpe trois coins, on les met côte à côte, ils font un angle plat. Comme cela marche
              pour n’importe quel triangle, la propriété est vraie pour tous.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Appuie sur le bouton, puis remonte tirer le curseur du découpage.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'La démonstration, et ce qu’elle permet',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="preuve-somme-angles"
            variant="new"
            lead={<>Tu viens de faire la démonstration toi-même : les trois coins remplissent l’angle plat.</>}
          />
          <KnowledgeBrick
            id="calculer-angle-manquant"
            variant="new"
            lead={<>Cette égalité n’est pas qu’une curiosité : elle permet de trouver un angle qu’on n’a pas mesuré.</>}
          />
          <KnowledgeBrick id="mem-somme-angles" variant="new" compact />
          <NumericQuestion
            prompt={<>Dans un triangle, deux angles mesurent <strong>47°</strong> et <strong>68°</strong>. Combien mesure le troisième ?</>}
            expected={65}
            suffix="°"
            requires={['calculer-angle-manquant', 'somme-angles-triangle']}
            explain="47 + 68 = 115, puis 180 − 115 = 65°."
            explainFor={(n) => (n === 115
              ? '115°, c’est la somme des DEUX angles connus. Il reste à la retirer de 180 : 180 − 115 = 65°.'
              : n === 295
                ? 'Tu as additionné 180 et 115 au lieu de soustraire. Les trois angles totalisent 180° au total, donc le troisième vaut 180 − 115.'
                : null)}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Le cas particulier utile',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Dans un triangle rectangle, un angle mesure déjà 90°. Que peut-on dire des deux autres ?"
            options={[
              'Leur somme vaut 90°',
              'Ils mesurent 45° chacun',
              'Leur somme vaut 180°',
            ]}
            correct={0}
            cols={3}
            requires={['calculer-angle-manquant', 'somme-angles-triangle']}
            explain="Les trois totalisent 180°, et l’un vaut déjà 90° : il reste 180 − 90 = 90° à se partager entre les deux autres. (Ils font 45° chacun seulement si le triangle est aussi isocèle.)"
            explainWrong="Attention : 45° chacun n’est vrai que dans le cas particulier du triangle rectangle isocèle. En général, on sait seulement que les deux autres angles totalisent 90°."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Les <strong>angles</strong> d’un triangle sont donc sous contrainte. Le module suivant
              montre que ses <strong>côtés</strong> le sont aussi — et qu’on ne peut pas choisir
              trois longueurs au hasard.
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
      moduleTitle="Pourquoi toujours 180 ?"
      moduleSubtitle="La démonstration, faite aux ciseaux"
      estimatedTime="12 min"
      brief={{
        tag: 'Découverte',
        title: 'D’où sort ce nombre ?',
        tone: 'indigo',
        body: (
          <p>
            Tu sais que la somme fait 180°. Mais <strong>pourquoi 180</strong>, et pas 200 ? La
            réponse tient en un geste : découper les trois coins du triangle, et les poser côte à
            côte.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
