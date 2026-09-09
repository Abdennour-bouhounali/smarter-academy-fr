import React, { useState } from 'react';
import { CornerUpLeft } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MilieuxLab from '../components/MilieuxLab';
import { TRIANGLES_MILIEUX, reciproqueMilieux, arrondi, fr } from '../components/triangles4e';

/**
 * Module 4 — MANIPULATION : la réciproque, cherchée avant d'être énoncée.
 *
 * Activity              faire glisser K le long de [AC] jusqu'à ce que (IK)
 *                       devienne parallèle à (BC).
 * Mathematical objective la réciproque de la droite des milieux : si une droite
 *                       passe par le milieu d'un côté et est parallèle à un
 *                       autre côté, elle coupe le troisième en son milieu.
 * Student action        chercher LA position où l'angle affiché tombe à 0°.
 * Controlled variable   le paramètre de K sur [AC], et lui seul.
 * Mathematical state    les trois sommets, I calculé comme milieu de [AB], K
 *                       paramétré. Le parallélisme est MESURÉ.
 * Visual consequence    le segment passe au vert en un seul endroit, et le
 *                       rapport AK ÷ AC y affiche 0,50.
 * Expected observation  « ça ne marche qu’au milieu — nulle part ailleurs ».
 * Misconception targeted croire qu'un segment partant d'un milieu est parallèle
 *                       au troisième côté quelle que soit son autre extrémité.
 *                       Le lab le réfute à chaque position essayée.
 *
 * POURQUOI [AC] N'EST PAS MARQUÉ D'AVANCE. Dans le lab, en mode réciproque, les
 * petits traits de milieu ne sont dessinés QUE sur [AB]. Les mettre sur [AC]
 * donnerait la réponse : c'est justement la position du milieu qu'il s'agit de
 * découvrir. C'est codé dans `MilieuxLab`, et commenté là-bas.
 *
 * LA CIBLE EST ATTEIGNABLE, ET C'EST TESTÉ. Le pas clavier vaut 0,02 et le pas
 * de pointeur est continu ; `parcours.test.js` vérifie qu'une position à
 * moins de 0,02 du milieu suffit à déclarer le parallélisme, et qu'un t voisin
 * (0,42) donne un écart d'angle VISIBLE — sans quoi la manipulation mentirait.
 */
const T = TRIANGLES_MILIEUX[1];

export default function Module04EtDansLautreSens() {
  const [t, setT] = useState(0.24);
  const [essais, setEssais] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const r = reciproqueMilieux(T.A, T.B, T.C, t);

  const essayer = () => {
    const cle = arrondi(t, 2);
    if (essais.some((e) => e.cle === cle)) return;
    setEssais((e) => [...e, { cle, angle: arrondi(r.angleAvecBC, 1), parallele: r.parallele }]);
  };

  const trouve = essais.some((e) => e.parallele);
  const assezDEssais = essais.length >= 3 && trouve;

  const lab = <MilieuxLab mode="reciproque" A={T.A} B={T.B} C={T.C} t={t} onT={setT} />;

  const steps = [
    {
      num: 1,
      title: 'Trouve où le trait devient parallèle',
      subtitle: 'I est le milieu de [AB]. K glisse le long de [AC] — à toi de trouver sa place.',
      done: assezDEssais,
      content: (
        <div className="space-y-3">
          {lab}
          <button
            type="button"
            onClick={essayer}
            className="min-h-[44px] w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700"
          >
            Noter cette position
          </button>
          {essais.length > 0 && (
            <div className="overflow-x-auto rounded-xl border-2 border-slate-200 bg-white p-3">
              <table className="w-full text-sm tabular-nums">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-1 text-left">AK ÷ AC</th>
                    <th className="pb-1 text-right">angle (IK)–(BC)</th>
                    <th className="pb-1 text-right">parallèle ?</th>
                  </tr>
                </thead>
                <tbody>
                  {[...essais].sort((a, b) => a.cle - b.cle).map((e) => (
                    <tr key={e.cle} className="border-t border-slate-100">
                      <td className="py-1 font-mono text-slate-700">{fr(e.cle, 2)}</td>
                      <td className="py-1 text-right font-mono text-slate-700">{fr(e.angle, 1)}°</td>
                      <td className={`py-1 text-right font-bold ${e.parallele ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {e.parallele ? 'oui' : 'non'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!trouve && (
            <Feedback tone="info">
              Angle actuel : <strong>{fr(arrondi(r.angleAvecBC, 1), 1)}°</strong>. Tant qu’il
              n’est pas nul, ce n’est pas parallèle. Note au moins trois positions, dont la bonne.
            </Feedback>
          )}
          {trouve && !assezDEssais && (
            <Feedback tone="info">
              Tu l’as trouvée. Note encore quelques positions VOISINES pour vérifier qu’elles ne
              marchent pas.
            </Feedback>
          )}
          {assezDEssais && (
            <Feedback tone="ok">
              Une seule position sur tout le côté donne un angle nul — et elle affiche 0,50, donc
              c’est le milieu de [AC]. Nulle part ailleurs.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce qu’on te donne, ce que tu conclus',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="space-y-1.5 rounded-2xl border-2 border-emerald-200 bg-white p-3 text-sm">
            <div className="text-slate-700">
              <strong>Module 3</strong> — on donne deux milieux, on obtient le parallélisme.
            </div>
            <div className="text-slate-700">
              <strong>Module 4</strong> — on donne un milieu et le parallélisme, on obtient…
            </div>
          </div>
          <TapQuestion
            prompt="I est le milieu de [AB], et (IK) est parallèle à (BC). Que peut-on affirmer sur K ?"
            options={[
              'K est le milieu de [AC]',
              'K est n’importe où sur [AC]',
              'K est le milieu de [BC]',
              'On ne peut rien affirmer sans mesurer',
            ]}
            correct={0}
            cols={1}
            requires={['droite-des-milieux', 'droites-paralleles']}
            explain="Tu viens de le chercher à la main : sur tout le côté [AC], une SEULE position rend (IK) parallèle à (BC), et c’est le milieu. Le parallélisme suffit donc à conclure."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="reciproque-milieux"
              variant="new"
              lead="Le même dessin, lu dans l’autre sens — et cela porte un nom."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le piège du presque-milieu',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Un élève place K à 0,45 du côté et écrit : « c’est presque parallèle, donc K est
            presque le milieu, donc IK vaut la moitié de BC ».
          </p>
          <TapQuestion
            prompt="Que penser de ce raisonnement ?"
            options={[
              'Il est faux : « presque parallèle » n’est pas une hypothèse, la propriété exige un vrai parallélisme',
              'Il est juste, à l’erreur de mesure près',
              'Il est juste, car 0,45 est assez proche de 0,5',
              'Il faudrait mesurer les angles du triangle pour trancher',
            ]}
            correct={0}
            cols={1}
            requires={['reciproque-milieux']}
            explain="Une propriété s’applique quand son hypothèse est VRAIE, pas approximativement vraie. À 0,45, l’angle affiché n’est pas nul : la propriété ne s’applique pas, et rien ne peut en être déduit."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="ok">
              C’est la discipline du détective : une propriété ne se déclenche que si son
              hypothèse est vérifiée. « Ça ressemble à » n’est pas une donnée.
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
      moduleTitle="Et dans l’autre sens ?"
      moduleSubtitle="Le parallélisme donné, le milieu à trouver"
      estimatedTime="10 min"
      brief={{
        tag: '🎬 Mission 04',
        title: 'On te donne le parallélisme',
        tone: 'indigo',
        body: (
          <>
            Cette fois, un seul milieu est marqué. Le point K glisse librement sur l’autre côté.{' '}
            <strong>Y a-t-il des positions où le trait devient parallèle à [BC] ?</strong> Une
            seule, plusieurs, aucune ?
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5">
          <CornerUpLeft className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="text-sm text-emerald-900">
            Le côté [AC] ne porte aucune marque : sa moitié n’est pas indiquée. C’est exactement
            ce que tu dois découvrir, et te le montrer d’avance reviendrait à te donner la
            réponse.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
