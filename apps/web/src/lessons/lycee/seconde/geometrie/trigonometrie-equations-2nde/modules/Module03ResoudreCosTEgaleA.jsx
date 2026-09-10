import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CircleLab from '../components/CircleLab';
import { solveCos, pointOf, fr } from '../components/trigoUtils';

/**
 * Module 3 — résoudre cos t = a.
 *
 * Le point clé : DEUX solutions par tour, parce qu'une droite verticale coupe
 * le cercle en deux points symétriques par rapport à l'axe horizontal. L'élève
 * le constate en promenant le point sur les deux positions d'abscisse 1/2 avant
 * qu'aucune formule ne soit donnée.
 */
export default function Module03ResoudreCosTEgaleA() {
  const [t, setT] = useState(0);
  const [hits, setHits] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const [s1, s2] = solveCos(0.5);
  const done1 = hits.length === 2;
  const p = pointOf(t);

  const move = (v, react) => {
    setT(v);
    for (const [i, target] of [s1, s2].entries()) {
      if (Math.abs(v - target) < 0.08 && !hits.includes(i)) {
        const next = [...hits, i];
        setHits(next);
        if (next.length === 2) react?.(true);
      }
    }
  };

  const marks = [
    { t: s1, label: 'π/3', color: '#059669' },
    { t: s2, label: '5π/3', color: '#059669' },
  ];

  const steps = [
    {
      num: 1,
      title: 'Deux points, une seule abscisse',
      subtitle: 'Trouve les DEUX positions où l’abscisse du point vaut 0,50. Les pastilles vertes te les indiquent.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <CircleLab t={t} onChange={(v) => move(v, kit.react)} marks={marks} label="cos t = 0,5" />
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2 text-center font-mono text-sm text-emerald-900">
            abscisse actuelle : <strong>{fr(p.x)}</strong> — cible : 0,50
          </div>
          {done1 ? (
            <>
              <Feedback tone="ok">
                Deux positions, une seule abscisse : <MathText>{'$\\dfrac{\\pi}{3}$'}</MathText> et
                <MathText>{'$\\dfrac{5\\pi}{3}$'}</MathText>. Elles sont <strong>symétriques par rapport
                à l’axe horizontal</strong> — logique, puisqu’une droite verticale coupe le cercle en deux
                points. Une équation trigonométrique a donc DEUX solutions par tour, pas une.
              </Feedback>
              <KnowledgeBrick
                id="equation-deux-solutions"
                variant="new"
                lead={<>Ce que tu viens de constater vaut pour toute équation de cette forme.</>}
              />
            </>
          ) : (
            <Feedback tone="info">Positions trouvées : {hits.length} sur 2.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La méthode',
      done: q2,
      content: () => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="methode-resoudre-cos"
            variant="new"
            lead={<>La seconde solution se déduit de la première, sans chercher à nouveau.</>}
          />
          <TapQuestion
            prompt={<span>Résous <MathText>{'$\\cos t = \\dfrac{\\sqrt{2}}{2}$'}</MathText> sur <MathText>{'$[0\\ ;\\ 2\\pi[$'}</MathText>.</span>}
            options={[
              <MathText key="a">{'$t = \\dfrac{\\pi}{4} \\ \\text{ou} \\ t = \\dfrac{7\\pi}{4}$'}</MathText>,
              <MathText key="b">{'$t = \\dfrac{\\pi}{4}$'}</MathText>,
              <MathText key="c">{'$t = \\dfrac{\\pi}{4} \\ \\text{ou} \\ t = \\dfrac{3\\pi}{4}$'}</MathText>,
              <MathText key="d">{'$t = \\dfrac{\\pi}{2}$'}</MathText>,
            ]}
            correctionLabel="π/4 ou 7π/4"
            correct={0} cols={2}
            requires={['methode-resoudre-cos', 'equation-deux-solutions', 'valeurs-remarquables']}
            explain="√2/2 est le cosinus de π/4. La seconde solution est 2π − π/4 = 7π/4 : le point symétrique par rapport à l’axe horizontal. Donner π/4 seul, c’est oublier la moitié des solutions."
            explainWrong="3π/4 serait la symétrie par rapport à l’axe VERTICAL — celle du sinus. Pour le cosinus, la seconde solution vaut 2π − t₀."
            solved={q2} onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Quand il n’y a pas de solution',
      done: q3,
      content: () => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="regle-hors-bornes"
            variant="new"
            lead={<>Un cas particulier à connaître avant de compter les solutions.</>}
          />
          <BatchChoiceQuestion
            intro={<p className="text-sm text-slate-600">Combien de solutions sur [0 ; 2π[ ?</p>}
            rows={[
              { id: 'r1', label: 'cos t = 0,3', options: ['2', '1', '0'], correct: 0, correction: '0,3 est dans [−1 ; 1] : deux points.' },
              { id: 'r2', label: 'cos t = 1', options: ['1', '2', '0'], correct: 0, correction: 'Un seul point d’abscisse 1 : t = 0. La droite est TANGENTE au cercle.' },
              { id: 'r3', label: 'cos t = 1,5', options: ['0', '1', '2'], correct: 0, correction: 'La droite verticale ne rencontre plus le cercle.' },
              { id: 'r4', label: 'cos t = −1', options: ['1', '2', '0'], correct: 0, correction: 'Un seul point, t = π, l’autre extrémité du diamètre.' },
            ]}
            requires={['methode-resoudre-cos', 'regle-hors-bornes']}
            feedback={({ allRight, nCorrect, total }) => (
              <Feedback tone={allRight ? 'ok' : 'ko'}>
                {allRight ? 'Les quatre.' : `${nCorrect} sur ${total}.`} Tout se lit sur la droite verticale :
                elle coupe le cercle en <strong>deux</strong> points, le touche en <strong>un</strong> seul
                aux extrémités (a = 1 ou −1), ou le rate complètement au-delà.
              </Feedback>
            )}
            solved={q3} onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Résoudre cos t = a"
      moduleSubtitle="Une droite verticale, deux points"
      estimatedTime="12 min"
      brief={{
        tag: '🎯 Mission 03',
        title: 'Une équation trigonométrique n’a presque jamais une seule solution.',
        tone: 'indigo',
        body: <p>Chercher les t tels que cos t = a, c’est chercher les points du cercle d’abscisse a. Une droite verticale en coupe deux.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          Deux solutions, symétriques par rapport à l’axe horizontal. Pour le sinus, ce sera l’autre
          symétrie — et c’est là que se joue la confusion.
        </KnowledgeSnapshot>
      )}
    />
  );
}
