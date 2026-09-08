import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PointImageLab from '../components/PointImageLab';
import { dist, midpoint, symCentral } from '../../../../../common/geo5e/geo5e';

/**
 * Module 2 — DÉCOUVERTE : où atterrit un point ?
 *
 * Le module 1 a montré que la punaise décide seule de l'arrivée. Il n'a PAS
 * dit où. Ce module réduit la scène à un seul point pour que la règle
 * devienne trouvable : l'élève place M' lui-même, se trompe, lit deux nombres
 * mesurés (OM, OM') et un verdict d'alignement, et corrige. La règle
 * « O est le milieu de [M M'] » n'est nommée qu'APRÈS avoir été atteinte.
 *
 * §6bis — l'étape 1 rend le laboratoire, pas une définition.
 *
 * Expected observation : « M' est de l'autre côté de O, sur la même droite, et
 * à la même distance ».
 * Misconception targeted : reporter la longueur DU MÊME CÔTÉ de O (on retombe
 * sur M), ou placer M' « en face » sans respecter la distance.
 */
export default function Module02OuAtterritUnPoint() {
  const [M, setM] = useState({ x: 210, y: 330 });
  const [O, setO] = useState({ x: 400, y: 235 });
  const [Mp, setMp] = useState({ x: 560, y: 170 });
  const [trouve, setTrouve] = useState(false);
  const [essais, setEssais] = useState(0);
  const [aide, setAide] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const attendu = symCentral(M, O);
  const ecart = dist(Mp, attendu);
  const juste = ecart <= 14;

  /* Le DIAGNOSTIC du placement raté, calculé sur la figure réelle : on ne
     répète pas la consigne, on dit à l'élève ce que SON point fait
     (§23 — jamais « Incorrect. »). */
  const diagnostic = () => {
    const dOM = dist(O, M);
    const dOMp = dist(O, Mp);
    const ecartMilieu = dist(midpoint(M, Mp), O);
    const memeCote = dist(Mp, M) < dOM;
    if (memeCote) {
      return 'Ton point est du MÊME côté de O que M. En reportant la longueur de ce côté-là, on revient vers M : la figure n’aurait pas tourné du tout. Passe de l’autre côté de la punaise.';
    }
    if (ecartMilieu > 12 && Math.abs(dOM - dOMp) <= 12) {
      return 'La distance est la bonne, mais M’ n’est pas dans le prolongement : M, O et M’ ne sont pas alignés. Fais glisser M’ jusqu’à ce que les deux traits n’en forment plus qu’un seul.';
    }
    if (dOMp > dOM) {
      return 'M’ est trop loin de O. Un point qui tourne autour de la punaise ne s’en éloigne jamais : il reste à la même distance qu’au départ.';
    }
    return 'M’ est trop près de O. En tournant autour de la punaise, le point garde exactement sa distance de départ — ni plus, ni moins.';
  };

  const poser = (p, react) => {
    setMp(p);
    if (dist(p, symCentral(M, O)) <= 14) {
      if (!trouve) { setTrouve(true); react?.(true); }
    } else if (!trouve) {
      setEssais((n) => n + 1);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Place l’image du point M',
      subtitle: 'La punaise O est là. Traîne la pastille violette à l’endroit où M arrive après le demi-tour.',
      done: trouve,
      content: (kit) => (
        <div className="space-y-3">
          <PointImageLab
            M={M} onM={setM}
            O={O} onO={setO}
            Mprime={Mp} onMprime={(p) => poser(p, kit.react)}
            cible={{ tol: 14 }}
            montrerSolution={aide}
            ariaLabel="Un point M, un centre O, et l’image M prime à placer"
          />
          {trouve ? (
            <Feedback tone="ok">
              Regarde les trois indicateurs : <strong>OM = OM’</strong>, et{' '}
              <strong>O est le milieu</strong> de [M M’]. Tu peux continuer à traîner M, O et M’ —
              ces deux faits ne se démentiront jamais.
            </Feedback>
          ) : (
            <>
              <Feedback tone={essais > 0 ? 'ko' : 'info'}>
                {essais > 0 ? diagnostic() : (
                  <>
                    Souviens-toi du calque : en tournant d’un demi-tour, le point M passe{' '}
                    <strong>de l’autre côté</strong> de la punaise, sans jamais s’en éloigner ni
                    s’en rapprocher. Les trois mesures du bas t’aident à viser.
                  </>
                )}
              </Feedback>
              {essais >= 3 && !aide && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setAide(true)}
                    className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 hover:border-emerald-300 transition"
                  >
                    Montre-moi la zone à viser
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Déplace M, puis O',
      subtitle: 'Reprends le laboratoire ci-dessus : les deux faits résistent-ils ?',
      done: trouve,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-3.5 text-sm text-slate-700">
            Traîne le point <strong>M</strong>, puis la punaise <strong>O</strong>. À chaque fois,
            replace <strong>M’</strong> correctement. Tu vas retrouver les deux mêmes indicateurs
            au vert — quelle que soit la position de départ.
          </div>
          <Feedback tone="ok">
            Deux faits, et deux seulement, suffisent à placer l’image de n’importe quel point :{' '}
            <strong>même distance à O</strong>, et <strong>de l’autre côté, en ligne droite</strong>.
            C’est exactement ce que dit une phrase que tu connais déjà.
          </Feedback>
        </div>
      ),
    },
    {
      num: 3,
      title: 'Cette phrase, tu la connais',
      done: q3,
      content: (
        <div className="space-y-3">
          {/* La brique nomme ce que la manipulation a établi trois fois. */}
          <KnowledgeBrick
            id="centre-milieu"
            variant="new"
            lead={<>Même distance de part et d’autre, et en ligne droite : c’est exactement la définition du <strong>milieu</strong>, vue en 6e.</>}
          />
          <TapQuestion
            prompt="Le point O est le centre de la symétrie, et A’ est l’image de A. Que peut-on affirmer à coup sûr ?"
            options={[
              'O est le milieu de [A A’]',
              'A est le milieu de [O A’]',
              'A’ est le milieu de [O A]',
            ]}
            correct={0}
            cols={3}
            requires={['centre-milieu', 'milieu-segment']}
            explain="Le demi-tour envoie A de l’autre côté de O, à la même distance : O se retrouve donc pile au milieu du segment [A A’]."
            explainWrong="Attention à l’ordre des trois points : c’est le CENTRE qui est au milieu, encadré par le point et son image. A et A’ sont les deux extrémités, jamais le milieu."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Le point qui ne bouge jamais',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Dans un demi-tour de centre O, y a-t-il un point qui reste exactement à sa place ?"
            options={[
              'Oui : le centre O lui-même',
              'Non, tous les points bougent',
              'Oui : tous les points de la figure',
            ]}
            correct={0}
            cols={3}
            requires={['centre-milieu']}
            explain="O est son propre milieu : son image est donc O. C’est le seul point du plan qui ne bouge pas — la punaise reste plantée au même endroit."
            explainWrong="Reprends la règle : l’image d’un point est de l’autre côté de O, à la même distance. Pour O, cette distance vaut 0 — il ne peut donc arriver qu’à sa propre place."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Tu sais maintenant placer l’image d’<strong>un</strong> point. Une figure n’est rien
              d’autre qu’une poignée de points bien reliés : le module suivant en construit une
              entière, sans calque.
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
      moduleTitle="Où atterrit un point ?"
      moduleSubtitle="La règle de placement, trouvée et non donnée"
      estimatedTime="12 min"
      brief={{
        tag: 'Découverte',
        title: 'Un seul point, et une place unique',
        tone: 'indigo',
        body: (
          <p>
            La punaise décide de tout — mais <em>où</em> exactement ? Ici, un seul point et un seul
            centre. À toi de placer l’image, de te tromper, et de lire ce que la figure te répond.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
