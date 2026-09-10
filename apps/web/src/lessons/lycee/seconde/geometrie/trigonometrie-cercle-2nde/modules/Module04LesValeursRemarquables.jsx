import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CircleLab from '../components/CircleLab';
import { REMARKABLE, pointOf, fr } from '../components/trigoUtils';

/**
 * Module 4 — les valeurs remarquables.
 *
 * Elles ne se récitent pas : l'élève amène le point sur π/6, π/4 et π/3, LIT
 * les coordonnées approchées sur le laboratoire, et constate que π/4 est le
 * seul des trois où les deux nombres coïncident — c'est ce repère-là qui
 * empêche ensuite de confondre π/6 et π/3, dont les coordonnées sont échangées.
 */
const TARGETS = [
  { t: Math.PI / 6, key: 'pi6', label: 'π/6' },
  { t: Math.PI / 4, key: 'pi4', label: 'π/4' },
  { t: Math.PI / 3, key: 'pi3', label: 'π/3' },
];

export default function Module04LesValeursRemarquables() {
  const [t1, setT1] = useState(0);
  const [hit, setHit] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = hit.length === 3;

  const move = (v, react) => {
    setT1(v);
    const target = TARGETS.find((x) => Math.abs(x.t - v) < 0.07);
    if (target && !hit.includes(target.key)) {
      const next = [...hit, target.key];
      setHit(next);
      if (next.length === 3) react?.(true);
    }
  };

  const marks = TARGETS.map((x) => ({ t: x.t, label: x.label, color: '#f59e0b' }));

  const steps = [
    {
      num: 1,
      title: 'Trois points repérés en orange',
      subtitle: 'Amène le point sur chacun des trois repères : π/6 (≈ 0,52), π/4 (≈ 0,79) et π/3 (≈ 1,05). Note les deux coordonnées à chaque fois.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <CircleLab t={t1} onChange={(v) => move(v, kit.react)} marks={marks} label="Les trois angles remarquables" />
          {done1 ? (
            <>
              <Feedback tone="ok">
                En <MathText>{'$\\pi/4$'}</MathText> les deux nombres sont <strong>égaux</strong> (0,71 et 0,71) :
                le point est sur la bissectrice. En <MathText>{'$\\pi/6$'}</MathText> l’abscisse est grande
                (0,87) et l’ordonnée petite (0,50) ; en <MathText>{'$\\pi/3$'}</MathText> c’est
                l’inverse — les mêmes deux nombres, <strong>échangés</strong>. C’est là que se joue la
                confusion la plus fréquente du chapitre.
              </Feedback>
              <KnowledgeBrick
                id="valeurs-remarquables"
                variant="new"
                lead={<>Ces trois positions ont des coordonnées EXACTES, qu’aucune calculatrice n’est nécessaire pour donner.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Repères atteints : {hit.length} sur 3. Vise les pastilles orange.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le repère qui empêche de confondre',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={<span>Pour quel angle du premier quart de tour a-t-on <MathText>{'$\\cos t = \\sin t$'}</MathText> ?</span>}
            options={[
              <MathText key="a">{'$\\dfrac{\\pi}{4}$'}</MathText>,
              <MathText key="b">{'$\\dfrac{\\pi}{6}$'}</MathText>,
              <MathText key="c">{'$\\dfrac{\\pi}{3}$'}</MathText>,
              <MathText key="d">{'$\\dfrac{\\pi}{2}$'}</MathText>,
            ]}
            optionLabel={(i) => ['π/4', 'π/6', 'π/3', 'π/2'][i]}
            correct={0} cols={2}
            requires={['valeurs-remarquables']}
            explain="π/4 est la moitié du quart de tour : le point est sur la bissectrice, donc son abscisse égale son ordonnée — toutes deux valent √2/2 ≈ 0,71."
            explainWrong="En π/6 et π/3 les deux coordonnées sont différentes (0,87 et 0,50, dans un ordre ou dans l’autre). En π/2 le point est en haut : (0 ; 1)."
            solved={q2} onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="regle-pi-quatre-egalite"
              variant="new"
              lead={<>Ce repère est le meilleur garde-fou du chapitre : à gauche de π/4 l’abscisse domine, à droite c’est l’ordonnée.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'La table exacte',
      done: q3,
      content: (
        <BatchChoiceQuestion
          intro={(
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Les valeurs que tu viens de lire, en écriture exacte :</p>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-2 text-center text-sm text-amber-900">
                <MathText>{'$\\dfrac{1}{2} = 0{,}5 \\qquad \\dfrac{\\sqrt{2}}{2} \\approx 0{,}71 \\qquad \\dfrac{\\sqrt{3}}{2} \\approx 0{,}87$'}</MathText>
              </div>
            </div>
          )}
          rows={[
            { id: 'r1', label: 'cos(π/6)', options: ['√3/2', '1/2', '√2/2'], correct: 0, correction: 'Tu as lu 0,87 : c’est √3/2.' },
            { id: 'r2', label: 'sin(π/6)', options: ['1/2', '√3/2', '√2/2'], correct: 0, correction: 'Tu as lu 0,50 : c’est 1/2.' },
            { id: 'r3', label: 'cos(π/3)', options: ['1/2', '√3/2', '√2/2'], correct: 0, correction: 'Échangé par rapport à π/6 : 0,50, soit 1/2.' },
            { id: 'r4', label: 'sin(π/4)', options: ['√2/2', '1/2', '√3/2'], correct: 0, correction: 'Sur la bissectrice : 0,71, soit √2/2.' },
          ]}
          requires={['valeurs-remarquables', 'regle-pi-quatre-egalite']}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Les quatre.' : `${nCorrect} sur ${total}.`} Une seule chose à retenir vraiment :
              plus l’angle est PETIT, plus l’abscisse est grande et l’ordonnée petite. π/6 et π/3 portent
              les mêmes deux nombres, dans l’ordre inverse.
            </Feedback>
          )}
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Placer un angle de mémoire',
      done: q4,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="methode-placer-remarquable"
            variant="new"
            lead={<>La méthode, en trois temps, pour n’importe quel angle remarquable — y compris au-delà du premier quart.</>}
          />
          <TapQuestion
            prompt={<span>Quelles sont les coordonnées du point associé à <MathText>{'$\\dfrac{2\\pi}{3}$'}</MathText> ?</span>}
            options={[
              <MathText key="a">{'$\\left(-\\dfrac{1}{2}\\ ;\\ \\dfrac{\\sqrt{3}}{2}\\right)$'}</MathText>,
              <MathText key="b">{'$\\left(\\dfrac{1}{2}\\ ;\\ \\dfrac{\\sqrt{3}}{2}\\right)$'}</MathText>,
              <MathText key="c">{'$\\left(-\\dfrac{\\sqrt{3}}{2}\\ ;\\ \\dfrac{1}{2}\\right)$'}</MathText>,
              <MathText key="d">{'$\\left(-\\dfrac{1}{2}\\ ;\\ -\\dfrac{\\sqrt{3}}{2}\\right)$'}</MathText>,
            ]}
            optionLabel={(i) => ['(−1/2 ; √3/2)', '(1/2 ; √3/2)', '(−√3/2 ; 1/2)', '(−1/2 ; −√3/2)'][i]}
            correct={0} cols={2}
            requires={['methode-placer-remarquable', 'valeurs-remarquables', 'regle-signes-quadrants']}
            explain="2π/3 dépasse π/2 : le point est en haut à GAUCHE, donc abscisse négative et ordonnée positive. Il est le symétrique de π/3 par rapport à l’axe vertical, d’où (−1/2 ; √3/2)."
            explainWrong="Trois choses à décider dans l’ordre : le quart de tour (ici en haut à gauche), donc les signes (− ; +), puis les valeurs, celles de π/3."
            solved={q4} onAnswered={() => setQ4(true)}
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
      moduleTitle="Les valeurs remarquables"
      moduleSubtitle="Huit points qu’on n’a pas besoin de calculer"
      estimatedTime="16 min"
      brief={{
        tag: '⭐ Mission 04',
        title: 'Trois angles suffisent à en connaître huit.',
        tone: 'amber',
        body: <p>π/6, π/4, π/3 : lis leurs coordonnées sur le cercle, repère ce qui les distingue, et les symétries donnent tout le reste du tour.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          Tu places un point et tu lis ses deux coordonnées exactes. La mission finale reprend
          l’enroulement, le radian, les signes et la table.
        </KnowledgeSnapshot>
      )}
    />
  );
}
