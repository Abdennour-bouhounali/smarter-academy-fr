import React, { useState } from 'react';
import { Move } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FigureGlissanteLab from '../components/FigureGlissanteLab';
import { DRAPEAU, glisser, GLISSEMENT_DEFAUT } from '../components/paral4e';

/**
 * Module 4 — MANIPULATION : une figure entière, et le critère qui décide.
 *
 * Activity              emmener un drapeau entier, puis dérégler UN sommet.
 * Mathematical objective dans un glissement, tous les points font le même
 *                       trajet ; chaque paire de points et leurs images
 *                       forment donc un parallélogramme.
 * Student action        tirer la poignée d'arrivée ; basculer le mode
 *                       « déréglé ».
 * Controlled variable   le glissement, puis la position d'une seule image.
 * Mathematical state    la figure et le glissement ; images, trajets, aire
 *                       et verdict CALCULÉS par `invariants` et
 *                       `unSeulGlissement`.
 * Visual consequence    les cinq traits restent parallèles — sauf un, quand
 *                       on dérègle, et le verdict bascule aussitôt.
 * Expected observation  « il suffit d'UN point mal placé ».
 * Misconception targeted croire qu'un glissement peut tourner la figure, ou
 *                       qu'un « à peu près » suffit.
 * Formalization         la règle « un seul trajet pour tous » est posée ici,
 *                       et avec elle le fait qu'une figure qui glisse
 *                       fabrique autant de parallélogrammes qu'on veut.
 *
 * PAS DE CONTINUITÉ ici : ce module a besoin d'une figure à CINQ sommets
 * (le drapeau), pas du quadrilatère des modules 1 à 3. Le déclarer dans la
 * chaîne aurait été artificiel.
 */
export default function Module04LeMemeDeplacementPartout() {
  const [arrivee, setArrivee] = useState(glisser(DRAPEAU[0], GLISSEMENT_DEFAUT));
  const [derange, setDerange] = useState(false);
  const [vus, setVus] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const noter = (etat) => setVus((v) => (v.includes(etat) ? v : [...v, etat]));

  const basculer = (valeur) => {
    setDerange(valeur);
    noter(valeur ? 'derange' : 'intact');
  };

  const done1 = vus.includes('derange') && vus.includes('intact');

  const steps = [
    {
      num: 1,
      title: 'Emmène la figure, puis dérègle un sommet',
      subtitle: 'Tire la poignée : tout le drapeau suit. Puis appuie sur le bouton, et regarde le verdict.',
      done: done1,
      content: (
        <div className="space-y-3">
          <FigureGlissanteLab
            arrivee={arrivee}
            onArrivee={(p) => { setArrivee(p); noter(derange ? 'derange' : 'intact'); }}
            derange={derange}
            onDerange={basculer}
          />
          {!done1 && (
            <Feedback tone="info">
              Il te reste à voir {vus.includes('intact') ? '' : 'la figure intacte'}
              {!vus.includes('intact') && !vus.includes('derange') ? ' et ' : ''}
              {vus.includes('derange') ? '' : 'un sommet déréglé'}.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Un seul sommet déplacé, et le verdict bascule. Le critère n’est pas décoratif :
              il tranche.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le critère qui décide',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Comment reconnaître, sur un dessin, qu’une figure a bien GLISSÉ ?"
            options={[
              'Les traits qui relient chaque point à son image sont tous parallèles et de même longueur',
              'La figure a la même aire qu’avant',
              'La figure a changé de place',
              'Les deux figures se ressemblent',
            ]}
            correct={0}
            cols={1}
            requires={['translation', 'invariants-translation']}
            explain="L’aire conservée et le changement de place ne suffisent pas : un demi-tour les donne aussi. Ce qui caractérise le glissement, ce sont les TRAJETS — tous identiques."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="un-seul-trajet-pour-tous"
              variant="new"
              lead="Tu viens de le tester dans les deux sens : voilà le critère."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Combien de parallélogrammes ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Sur la figure, M et N sont deux sommets du drapeau, M’ et N’ leurs images. Le
            quadrilatère M M’ N’ N est violet : c’est un parallélogramme.
          </p>
          <TapQuestion
            prompt="Le drapeau a cinq sommets, tous glissés. Combien de parallélogrammes peut-on former en prenant deux sommets et leurs deux images ?"
            options={[
              'Dix, un pour chaque paire de sommets',
              'Un seul, celui qui est dessiné',
              'Cinq, un par sommet',
              'Aucun autre : c’est une exception',
            ]}
            correct={0}
            cols={1}
            requires={['un-seul-trajet-pour-tous', 'translation-parallelogramme']}
            explain="Chaque PAIRE de sommets en donne un, puisque leurs deux trajets sont le même glissement. Avec cinq sommets, il y a dix paires — donc dix parallélogrammes, tous garantis par la même raison."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="ok">
              Ce n’est donc pas une propriété de CETTE figure : c’est une propriété du
              glissement. C’est ce qui va permettre de justifier, au module suivant.
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
      moduleTitle="Le même déplacement partout"
      moduleSubtitle="Cinq points, cinq trajets — et un seul déplacement"
      estimatedTime="8 min"
      brief={{
        tag: '🎬 Mission 04',
        title: 'Le drapeau qu’on emmène',
        tone: 'indigo',
        body: (
          <>
            Cette fois, ce n’est plus un point qui glisse mais une figure entière.{' '}
            <strong>Que faudrait-il pour que ça n’en soit plus un ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5">
          <Move className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="text-sm text-emerald-900">
            Le drapeau est volontairement de travers : s’il se mettait à tourner, tu le verrais
            immédiatement. Surveille les cinq traits en pointillé.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
