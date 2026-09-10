import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CircleLab from '../components/CircleLab';
import { solveSin, pointOf, fr } from '../components/trigoUtils';

/**
 * Module 4 — résoudre sin t = b, et surtout ne pas le confondre avec le cosinus.
 *
 * L'élève place les deux solutions de sin t = 1/2 et CONSTATE qu'elles ne sont
 * pas symétriques de la même façon que celles du module 3 : l'axe de symétrie
 * a basculé. C'est le seul moyen d'installer la distinction durablement.
 */
export default function Module04ResoudreSinTEgaleB() {
  const [t, setT] = useState(0);
  const [hits, setHits] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const [s1, s2] = solveSin(0.5);
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
    { t: s1, label: 'π/6', color: '#d97706' },
    { t: s2, label: '5π/6', color: '#d97706' },
  ];

  const steps = [
    {
      num: 1,
      title: 'Deux points, une seule ordonnée',
      subtitle: 'Trouve les deux positions où l’ORDONNÉE vaut 0,50. Compare ensuite avec le module précédent.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <CircleLab t={t} onChange={(v) => move(v, kit.react)} marks={marks} label="sin t = 0,5" />
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-center font-mono text-sm text-amber-900">
            ordonnée actuelle : <strong>{fr(p.y)}</strong> — cible : 0,50
          </div>
          {done1 ? (
            <>
              <Feedback tone="ok">
                <MathText>{'$\\dfrac{\\pi}{6}$'}</MathText> et <MathText>{'$\\dfrac{5\\pi}{6}$'}</MathText> :
                les deux points sont symétriques par rapport à l’axe <strong>VERTICAL</strong>, alors que
                pour cos t = a ils l’étaient par rapport à l’axe horizontal. Une droite HORIZONTALE coupe
                le cercle ici — c’est ce changement d’axe qui change la formule.
              </Feedback>
              <KnowledgeBrick
                id="methode-resoudre-sin"
                variant="new"
                lead={<>La seconde solution se déduit de la première, mais pas par la même opération qu’au module 3.</>}
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
      title: 'Ne pas confondre les deux',
      done: q2,
      content: () => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="regle-deux-symetries"
            variant="new"
            lead={<>Une seule chose distingue vraiment les deux résolutions : l’axe de symétrie.</>}
          />
          <BatchChoiceQuestion
            intro={<p className="text-sm text-slate-600">Pour chaque équation, la seconde solution sachant que la première est t₀ :</p>}
            rows={[
              { id: 'r1', label: 'cos t = a', options: ['2π − t₀', 'π − t₀', 'π + t₀'], correct: 0, correction: 'Symétrie par rapport à l’axe horizontal.' },
              { id: 'r2', label: 'sin t = b', options: ['π − t₀', '2π − t₀', 'π + t₀'], correct: 0, correction: 'Symétrie par rapport à l’axe vertical.' },
              { id: 'r3', label: 'sin t = 1/2, t₀ = π/6', options: ['5π/6', '11π/6', '7π/6'], correct: 0, correction: 'π − π/6 = 5π/6.' },
              { id: 'r4', label: 'cos t = 1/2, t₀ = π/3', options: ['5π/3', '2π/3', '4π/3'], correct: 0, correction: '2π − π/3 = 5π/3.' },
            ]}
            requires={['methode-resoudre-sin', 'methode-resoudre-cos', 'regle-deux-symetries']}
            feedback={({ allRight, nCorrect, total }) => (
              <Feedback tone={allRight ? 'ok' : 'ko'}>
                {allRight ? 'Les quatre.' : `${nCorrect} sur ${total}.`} Inutile de retenir deux formules :
                dessine la droite (verticale pour un cosinus, horizontale pour un sinus) et lis les deux
                points. L’axe de symétrie se voit.
              </Feedback>
            )}
            solved={q2} onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Sur un intervalle imposé',
      done: q3,
      content: () => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="mem-lire-sur-le-cercle"
            variant="new"
            lead={<>Le réflexe qui évite toutes les erreurs de ce module.</>}
          />
          <TapQuestion
            prompt={<span>Résous <MathText>{'$\\sin t = \\dfrac{1}{2}$'}</MathText> sur <MathText>{'$[0\\ ;\\ \\pi]$'}</MathText> — attention à l’intervalle.</span>}
            options={[
              <MathText key="a">{'$t = \\dfrac{\\pi}{6} \\ \\text{ou} \\ t = \\dfrac{5\\pi}{6}$'}</MathText>,
              <MathText key="b">{'$t = \\dfrac{\\pi}{6}$'}</MathText>,
              <MathText key="c">{'$t = \\dfrac{\\pi}{6} \\ \\text{ou} \\ t = \\dfrac{11\\pi}{6}$'}</MathText>,
              <MathText key="d">{'$t = \\dfrac{\\pi}{3} \\ \\text{ou} \\ t = \\dfrac{2\\pi}{3}$'}</MathText>,
            ]}
            correctionLabel="π/6 ou 5π/6"
            correct={0} cols={2}
            requires={['methode-resoudre-sin', 'mem-lire-sur-le-cercle']}
            explain="Les deux solutions du tour sont π/6 et 5π/6, et TOUTES DEUX appartiennent à [0 ; π] : on les garde. L’intervalle ne sert pas à en éliminer une par principe, il faut vérifier."
            explainWrong="11π/6 serait la symétrie du cosinus, et de toute façon hors de [0 ; π]. Quant à ne garder que π/6, c’est oublier que 5π/6 ≈ 2,6 est bien dans l’intervalle demandé."
            solved={q3} onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Résoudre sin t = b"
      moduleSubtitle="La même méthode, mais l’autre symétrie"
      estimatedTime="12 min"
      brief={{
        tag: '🧭 Mission 04',
        title: 'Même figure, autre droite — et l’axe de symétrie bascule.',
        tone: 'amber',
        body: <p>Pour un sinus, la droite est horizontale. Les deux solutions ne se déduisent donc plus de la même façon : c’est là que se joue la confusion la plus fréquente.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          Tu résous les deux familles d’équations et tu sais les distinguer. La mission finale reprend
          l’identité, l’addition et les deux résolutions.
        </KnowledgeSnapshot>
      )}
    />
  );
}
