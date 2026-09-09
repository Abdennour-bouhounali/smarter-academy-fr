import React, { useState } from 'react';
import { Target } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ConstructeurLab from '../components/ConstructeurLab';
import { DEFIS, quatriemeSommet, dist, TOL_DEFI } from '../components/paral4e';

/**
 * Module 3 — MANIPULATION : le défi, où la charge s'inverse.
 *
 * Activity              replacer soi-même le sommet C, sur trois
 *                       configurations différentes.
 * Mathematical objective construire le quatrième sommet d'un parallélogramme
 *                       en reportant le trajet — le geste du programme (P2).
 * Student action        poser C, puis le déplacer jusqu'à la bonne place.
 * Controlled variable   la position de C, et elle seule : les trois autres
 *                       sommets sont fixes, c'est le problème posé.
 * Mathematical state    le point proposé ; sa distance à la position juste
 *                       est MESURÉE, jamais aimantée.
 * Visual consequence    le point devient vert et le trajet attendu apparaît
 *                       quand la place est la bonne.
 * Expected observation  « je ne place pas au jugé : je reporte le trajet ».
 * Misconception targeted placer C « là où ça a l'air bien ». Le retour donne
 *                       la DISTANCE restante, pas un verdict binaire — et il
 *                       rappelle le geste juste, sans donner la réponse.
 *
 * POURQUOI AUCUNE AIMANTATION SUR LA CIBLE. Un aimant qui rattraperait C
 * ferait réussir l'élève qui place au jugé : la manipulation enseignerait
 * exactement ce qu'elle veut corriger. Le point s'aimante sur la GRILLE
 * (le pas de 20, qui est un repère de dessin) et sur elle seule ; la
 * position juste tombe exactement sur un nœud — un test le vérifie pour les
 * trois configurations, sinon le défi serait infaisable.
 *
 * PAS DE CONTINUITÉ ici : le défi a besoin de configurations CHOISIES, dont
 * la solution tombe sur la grille. Reprendre le quadrilatère de l'élève
 * donnerait une cible entre deux nœuds, donc impossible à atteindre.
 */
export default function Module03PlaceLePointManquant() {
  const [i, setI] = useState(0);
  const [propose, setPropose] = useState(null);
  const [reussis, setReussis] = useState([]);
  const [q2, setQ2] = useState(false);

  const defi = DEFIS[i];
  const Cjuste = quatriemeSommet(defi.A, defi.B, defi.D);
  const gagne = propose != null && dist(propose, Cjuste) <= TOL_DEFI;

  // On enregistre la réussite pendant le rendu serait un effet de bord :
  // on le fait au geste, dans le gestionnaire de dépôt.
  const poser = (p) => {
    setPropose(p);
    if (dist(p, Cjuste) <= TOL_DEFI) {
      setReussis((r) => (r.includes(defi.id) ? r : [...r, defi.id]));
    }
  };

  const suivant = () => {
    setI((k) => (k + 1) % DEFIS.length);
    setPropose(null);
  };

  const done1 = reussis.length >= 2;

  const steps = [
    {
      num: 1,
      title: 'Replace le sommet C — deux fois au moins',
      subtitle: 'Trois sommets sont donnés. Le quatrième, c’est toi qui le poses.',
      done: done1,
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-slate-900 px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              défi {i + 1} sur {DEFIS.length}
            </span>
            <span className="font-mono text-sm font-black text-white">
              {reussis.length} réussi{reussis.length > 1 ? 's' : ''}
            </span>
          </div>
          <ConstructeurLab
            A={defi.A} B={defi.B} D={defi.D}
            mode="defi"
            Cpropose={propose}
            onCpropose={poser}
            aimanter
            montrerTemoins={false}
          />
          <button
            type="button"
            onClick={suivant}
            className="min-h-[44px] w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:border-sky-400"
          >
            {gagne ? '→ Défi suivant' : '↻ Essayer une autre configuration'}
          </button>
          {gagne && !done1 && (
            <Feedback tone="ok">
              Bien vu. Passe au défi suivant : il en faut au moins deux pour être sûr que ce
              n’était pas de la chance.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Deux défis réussis. Tu n’as pas cherché « où ça a l’air bien » : tu as reporté le
              trajet, et c’est exactement le geste attendu.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le geste, en une phrase',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Pour placer C tel que ABCD soit un parallélogramme, quel est le geste juste ?"
            options={[
              'Repartir de B et refaire le trajet qui mène A en D',
              'Placer C à égale distance de B et de D',
              'Placer C symétrique de A par rapport à B',
              'Ajuster C jusqu’à ce que la figure ait l’air bonne',
            ]}
            correct={0}
            cols={1}
            requires={['construire-le-quatrieme', 'deux-trajets-un-glissement']}
            explain="C est l’image de B par le glissement qui mène A en D. On reporte le trajet : même longueur, même direction, même sens. Rien à ajuster à l’œil."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <Feedback tone="info">
              En 5e, on obtenait ce même point par le milieu commun des diagonales. C’est le
              même point — mais le report du trajet, lui, permettra de JUSTIFIER, et c’est ce
              qu’on va faire ensuite.
            </Feedback>
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
      moduleTitle="Place le point qui manque"
      moduleSubtitle="Cette fois, personne ne le pose à ta place"
      estimatedTime="9 min"
      brief={{
        tag: '🎬 Mission 03',
        title: 'Le sommet caché',
        tone: 'indigo',
        body: (
          <>
            Trois sommets, et un quatrième absent. <strong>Rien ne t’aimante</strong> : si tu
            places au jugé, tu le sauras.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5">
          <Target className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
          <p className="text-sm text-sky-900">
            Pose le point, puis fais-le glisser. Le message sous la figure te dit à quelle
            distance tu es de la bonne place — jamais dans quelle direction.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
