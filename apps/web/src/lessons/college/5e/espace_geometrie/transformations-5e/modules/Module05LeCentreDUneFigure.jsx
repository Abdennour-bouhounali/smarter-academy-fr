import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CentreFigureLab from '../components/CentreFigureLab';
import { FIGURES_CENTRE, centreDe, estCentreDeSymetrie } from '../components/transformations';

/**
 * Module 5 — MANIPULATION : une figure qui revient sur elle-même.
 *
 * Jusqu'ici le demi-tour envoyait la figure AILLEURS. Ce module retourne la
 * question : existe-t-il un point autour duquel la figure retombe exactement
 * sur elle-même ? L'élève cherche ce point à la main, sur quatre figures — dont
 * deux qui n'en ont pas.
 *
 * LE CAS DÉCISIF est le triangle équilatéral : très symétrique (trois axes),
 * et pourtant sans centre. L'élève cherche, ne trouve pas, et comprend que
 * « avoir des axes » et « avoir un centre » sont deux propriétés distinctes —
 * une confusion qu'aucune définition lue ne dissipe aussi bien.
 *
 * Expected observation : « certaines figures reviennent sur elles-mêmes, et le
 * point qui marche est unique ; d'autres n'en ont aucun, même très
 * symétriques ».
 */
const AU_CENTRE = { x: 350, y: 220 };
const place = (f) => f.pts.map((p) => ({ x: p.x + AU_CENTRE.x, y: p.y + AU_CENTRE.y }));

export default function Module05LeCentreDUneFigure() {
  const [iFig, setIFig] = useState(0);
  const [P, setP] = useState({ x: 230, y: 150 });
  const [trouves, setTrouves] = useState({});
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const fig = FIGURES_CENTRE[iFig];
  const pts = place(fig);
  const coincide = estCentreDeSymetrie(pts, P, 6);

  // Une figure est « traitée » soit quand on a trouvé son centre, soit quand
  // on a compris qu'elle n'en a pas (les deux comptent également).
  const marquer = (react) => {
    if (!trouves[fig.id]) {
      setTrouves((t) => ({ ...t, [fig.id]: true }));
      react?.(true);
    }
  };

  const nbTraitees = Object.keys(trouves).length;
  const done1 = nbTraitees >= 4;

  const steps = [
    {
      num: 1,
      title: 'Trouve le point qui ramène la figure sur elle-même',
      subtitle: 'Traîne le point P. Quand l’image orange disparaît sous la figure, tu y es.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 justify-center">
            {FIGURES_CENTRE.map((f, i) => (
              <button
                key={f.id}
                type="button"
                onClick={() => { setIFig(i); setP({ x: 230, y: 150 }); }}
                className={`rounded-xl border-2 px-3 py-1.5 text-sm font-bold transition ${
                  i === iFig
                    ? 'border-purple-500 bg-purple-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-purple-300'
                }`}
              >
                {trouves[f.id] ? '✓ ' : ''}{f.nom}
              </button>
            ))}
          </div>

          <CentreFigureLab
            figure={pts}
            candidat={P}
            onCandidat={setP}
            ariaLabel={`Chercher le centre de symétrie : ${fig.nom}`}
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-slate-600">
              Figures traitées : <strong className="text-purple-700">{nbTraitees}</strong> sur 4
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => coincide && marquer(kit.react)}
                className={`rounded-xl px-3.5 py-1.5 text-sm font-bold transition ${
                  coincide ? 'bg-purple-600 text-white hover:bg-purple-700' : 'border-2 border-slate-200 bg-white text-slate-400'
                }`}
              >
                J’ai trouvé le centre
              </button>
              <button
                type="button"
                onClick={() => marquer(kit.react)}
                className="rounded-xl border-2 border-orange-200 bg-white px-3.5 py-1.5 text-sm font-bold text-orange-700 hover:border-orange-300 transition"
              >
                Cette figure n’en a pas
              </button>
            </div>
          </div>

          {done1 ? (
            <Feedback tone="ok">
              Deux figures sur quatre ont un centre : le <strong>parallélogramme</strong> et le{' '}
              <strong>rectangle</strong>. Le triangle équilatéral et le trapèze isocèle n’en ont
              aucun — et pourtant, tous deux ont des axes de symétrie.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {fig.aCentre
                ? <>Cette figure a bien un centre. Cherche-le : il est au croisement des diagonales.</>
                : <>Essaie plusieurs endroits sur cette figure. Si <strong>aucun</strong> point ne fait disparaître l’orange, dis-le avec le second bouton.</>}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le piège du triangle équilatéral',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Le triangle équilatéral a TROIS axes de symétrie. Pourquoi n’a-t-il pourtant aucun centre de symétrie ?"
            options={[
              'Parce qu’un demi-tour le retourne « pointe en bas » : il ne se superpose pas',
              'Parce qu’il n’a que trois côtés',
              'Parce que ses angles ne mesurent pas 90°',
            ]}
            correct={0}
            cols={1}
            requires={['symetrie-centrale', 'axe-symetrie']}
            explain="Un demi-tour envoie la pointe du haut vers le bas. Le triangle obtenu pointe dans l’autre sens : il ne recouvre jamais celui de départ. Avoir des AXES et avoir un CENTRE sont deux propriétés indépendantes."
            explainWrong="Le nombre de côtés n’y est pour rien : le parallélogramme en a quatre et possède un centre, le trapèze isocèle en a quatre aussi et n’en a pas. Ce qui décide, c’est si le demi-tour ramène la figure sur elle-même."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="centre-de-symetrie"
              variant="new"
              lead={<>Tu viens de chercher ce point sur quatre figures, et d’en trouver deux qui n’en ont pas. Voilà ce que cette recherche définit.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Reconnaître au premier coup d’œil',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Parmi ces figures, laquelle n’a AUCUN centre de symétrie ?"
            options={['Le triangle isocèle', 'Le losange', 'Le carré', 'Le cercle']}
            correct={0}
            cols={4}
            requires={['centre-de-symetrie']}
            explain="Losange, carré et cercle reviennent tous sur eux-mêmes après un demi-tour. Le triangle isocèle, non : comme l’équilatéral, il se retrouve pointe inversée."
            explainWrong="Teste mentalement le demi-tour sur chacune : le losange et le carré retombent pile sur eux-mêmes (leur centre est le croisement des diagonales), et le cercle aussi (son centre). Un triangle, jamais."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="info">
              Un moyen sûr : cherche le <strong>croisement des diagonales</strong>. S’il existe et
              que la figure y retombe, c’est le centre — et il est toujours unique.
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
      moduleTitle="Une figure qui se retrouve sur elle-même"
      moduleSubtitle="Chercher le centre — et parfois ne pas le trouver"
      estimatedTime="10 min"
      brief={{
        tag: 'Manipulation',
        title: 'Et si la figure revenait à sa place ?',
        tone: 'purple',
        body: (
          <p>
            Jusqu’ici, le demi-tour envoyait la figure ailleurs. Mais pour certaines figures, il la
            ramène <strong>exactement là où elle était</strong>. À toi de trouver le point qui fait
            cela — quand il existe.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
