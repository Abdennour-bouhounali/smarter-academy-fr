import React, { useState } from 'react';
import { Shapes } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PlacementLab from '../components/PlacementLab';
import {
  REPERE_PARALLELOGRAMME, PARALLELOGRAMME, quatriemeSommet, estParallelogramme,
  placer, memePoint, couple,
} from '../components/reperage4e';

/**
 * Module 5 — MANIPULATION : les coordonnées ferment la figure.
 *
 * Activity              placer le quatrième sommet pour que ABCD soit un
 *                       parallélogramme, en surveillant les milieux des deux
 *                       diagonales.
 * Mathematical objective un quadrilatère est un parallélogramme exactement
 *                       quand ses diagonales ont le même milieu — et cela se
 *                       CALCULE sur les coordonnées.
 * Student action        glisser D jusqu'à ce que les deux milieux coïncident.
 * Controlled variable   la position de D.
 * Mathematical state    les quatre sommets ; les deux milieux et leur écart
 *                       viennent de `estParallelogramme`.
 * Visual consequence    les deux marqueurs de milieu se rejoignent, et la
 *                       figure se referme.
 * Expected observation  « je n'ai pas besoin de la règle : deux couples égaux
 *                       suffisent à prouver ».
 * Misconception targeted juger « à l'œil » qu'une figure est un
 *                       parallélogramme, alors qu'un quadrilatère très
 *                       ressemblant peut ne pas l'être.
 *
 * POURQUOI LES DIAGONALES, ET PAS LES CÔTÉS. Le critère des côtés parallèles
 * demanderait des vecteurs (2nde) ou des coefficients directeurs (3e). Le
 * critère des diagonales se calcule avec deux moyennes, donc entièrement dans
 * le programme de 4e. La contrainte de programme choisit ici l'outil le plus
 * simple, pas le plus pauvre.
 *
 * CE QUE CE MODULE NE FAIT PAS. Il ne pose jamais « la formule du milieu »
 * comme objet d'étude — c'est un objet de 3e. Le milieu est ici un OUTIL de
 * lecture (le point à mi-chemin, dont les coordonnées sont les moyennes), pas
 * une formule à retenir.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement.
 */
const { A, B, C } = PARALLELOGRAMME;
const D_ATTENDU = quatriemeSommet(A, B, C);
const DEPART = { x: 2, y: 2.5, nom: 'D' };

export default function Module05LeQuatriemeSommet() {
  const [D, setD] = useState(DEPART);
  const [trouve, setTrouve] = useState(false);
  const [q2, setQ2] = useState(false);

  const pose = placer(D, REPERE_PARALLELOGRAMME);
  const bilan = estParallelogramme(A, B, C, pose);
  const juste = memePoint(pose, D_ATTENDU, 1e-9);

  const bouger = (p) => {
    const q = placer(p, REPERE_PARALLELOGRAMME);
    setD({ ...p, ...q });
    if (memePoint(q, D_ATTENDU, 1e-9)) setTrouve(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Ferme la figure',
      subtitle: 'A, B et C sont posés. Place D pour que ABCD soit un parallélogramme.',
      done: trouve,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Sous la figure, les milieux des deux diagonales [AC] et [BD] sont calculés en
            direct. Cherche la position de D qui les rend <strong>égaux</strong>.
          </p>

          <PlacementLab
            repere={REPERE_PARALLELOGRAMME}
            point={D}
            onPoint={bouger}
            fixes={[
              { id: 'A', x: A.x, y: A.y, name: 'A' },
              { id: 'B', x: B.x, y: B.y, name: 'B' },
              { id: 'C', x: C.x, y: C.y, name: 'C' },
            ]}
            segments={[
              { id: 'AB', from: A, to: B, color: '#7e22ce' },
              { id: 'BC', from: B, to: C, color: '#7e22ce' },
              { id: 'CD', from: C, to: pose, color: '#7e22ce', dashed: !juste },
              { id: 'DA', from: pose, to: A, color: '#7e22ce', dashed: !juste },
              { id: 'diagAC', from: A, to: C, color: '#0891b2', dashed: true },
              { id: 'diagBD', from: B, to: pose, color: '#e11d48', dashed: true },
            ]}
            ariaLabel="Placer le quatrième sommet du parallélogramme"
          />

          {/* Les deux milieux, dans le DOM — c'est leur comparaison qui prouve. */}
          <div className="grid grid-cols-2 gap-2" aria-live="polite">
            <div className="rounded-2xl border-2 border-cyan-200 bg-cyan-50 p-3 text-center">
              <div className="text-xs font-semibold uppercase tracking-wide text-cyan-600">
                milieu de [AC]
              </div>
              <div className="font-mono text-lg font-black tabular-nums text-cyan-900">
                {couple(bilan.milieuAC, 2)}
              </div>
            </div>
            <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-3 text-center">
              <div className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                milieu de [BD]
              </div>
              <div className="font-mono text-lg font-black tabular-nums text-rose-900">
                {couple(bilan.milieuBD, 2)}
              </div>
            </div>
          </div>

          <p className={`rounded-xl px-3 py-2 text-center text-sm font-semibold ${
            bilan.parallelogramme
              ? 'bg-emerald-100 text-emerald-900'
              : 'bg-slate-100 text-slate-600'
          }`}>
            {bilan.parallelogramme
              ? 'Les deux milieux coïncident : ABCD est un parallélogramme.'
              : 'Les deux milieux diffèrent encore : ce n’est pas un parallélogramme.'}
          </p>

          {trouve && (
            <Feedback tone="ok">
              D est en {couple(D_ATTENDU, 1)}. Tu ne l’as pas trouvé en mesurant, mais en rendant
              deux couples de nombres égaux.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce que la figure prouve',
      done: q2,
      content: (
        <div className="space-y-3">
          {/* Le mot « quadrilatère » est POSÉ ici, avant la question qui s'en
              sert : une figure à quatre côtés, ce que ABCD est devenu dès que
              D a été placé. Sans cette phrase, sa première apparition serait
              dans la correction — donc après la demande. */}
          <p className="text-sm text-slate-700">
            ABCD est une figure à quatre côtés — un <strong>quadrilatère</strong>. Tous les
            quadrilatères ne sont pas des parallélogrammes : c’est la position de D qui vient de
            faire la différence.
          </p>
          <TapQuestion
            prompt="Pourquoi l’égalité des deux milieux suffit-elle à affirmer que ABCD est un parallélogramme ?"
            options={[
              'Parce que dans un parallélogramme, les diagonales se coupent en leur milieu',
              'Parce que les quatre côtés ont alors la même longueur',
              'Parce que la figure a l’air correcte à l’écran',
              'Parce que les points placés ont des coordonnées entières',
            ]}
            correct={0}
            cols={1}
            requires={['coordonnee-decimale', 'placer-pas-non-unitaire']}
            explain="Les diagonales d’un parallélogramme se coupent en leur milieu, et réciproquement : si les deux diagonales d’un quadrilatère ont le même milieu, il est un parallélogramme. Un dessin ressemblant, lui, ne prouve rien."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="parallelogramme-milieux"
              variant="new"
              lead="Deux moyennes suffisent à prouver ce qu’aucun dessin ne pourrait garantir."
            />
          )}
          {q2 && (
            <Feedback tone="info">
              Les coordonnées ne servent plus seulement à repérer : elles servent à DÉCIDER. Au
              module suivant, elles trancheront une question de distance.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Le quatrième sommet"
      moduleSubtitle="Fermer une figure par le calcul"
      estimatedTime="7 min"
      brief={{
        tag: '🎬 Mission 05',
        title: 'Trois sommets, un à trouver',
        tone: 'indigo',
        body: (
          <>
            A, B et C sont placés. Il existe une seule position de D qui fasse d’ABCD un
            parallélogramme. <strong>Sauras-tu la trouver sans règle ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-purple-100 bg-purple-50/60 p-3.5">
          <Shapes className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" aria-hidden="true" />
          <p className="text-sm text-purple-900">
            Les deux diagonales sont tracées en pointillé. Surveille leurs milieux : c’est leur
            égalité, et rien d’autre, qui décide.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
