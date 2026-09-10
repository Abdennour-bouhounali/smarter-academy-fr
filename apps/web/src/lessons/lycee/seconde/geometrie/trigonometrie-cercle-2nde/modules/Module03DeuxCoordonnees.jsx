import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CircleLab from '../components/CircleLab';
import { pointOf, fr } from '../components/trigoUtils';

/**
 * Module 3 — cos et sin sont deux COORDONNÉES.
 *
 * Le pas conceptuel de la leçon : en 3e, cos était un rapport de longueurs et
 * n'existait que pour un angle aigu. Ici l'élève promène le point dans les
 * quatre quarts de tour et VOIT l'abscisse devenir négative — ce qu'un rapport
 * de longueurs ne peut jamais faire.
 */
export default function Module03DeuxCoordonnees() {
  const [t1, setT1] = useState(0.6);
  const [visited, setVisited] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const quadrantOf = (t) => Math.floor(t / (Math.PI / 2)) % 4;
  const done1 = visited.length >= 4;

  const move = (v, react) => {
    setT1(v);
    const q = quadrantOf(v);
    if (!visited.includes(q)) {
      const next = [...visited, q];
      setVisited(next);
      if (next.length === 4) react?.(true);
    }
  };

  const p = pointOf(t1);

  const steps = [
    {
      num: 1,
      title: 'Passe dans les quatre quarts de tour',
      subtitle: 'Regarde les deux nombres pendant que tu tournes : que se passe-t-il quand le point passe à gauche ? en dessous ?',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <CircleLab t={t1} onChange={(v) => move(v, kit.react)} label="Les deux coordonnées" />
          {done1 ? (
            <>
              <Feedback tone="ok">
                À gauche de l’axe vertical, <strong>cos t devient négatif</strong> ; en dessous de l’axe
                horizontal, <strong>sin t devient négatif</strong>. Un rapport de longueurs, lui, ne peut
                jamais être négatif : ce ne sont donc plus des rapports, ce sont des
                <strong> coordonnées</strong> — l’abscisse et l’ordonnée du point.
              </Feedback>
              <KnowledgeBrick
                id="cos-sin-coordonnees"
                variant="new"
                lead={<>Voilà ce que tu viens de lire sur les deux axes, et qui prolonge la trigonométrie du triangle rectangle à tous les réels.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Quarts de tour visités : {visited.length} sur 4. Fais un tour complet en observant les deux nombres.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Qui est qui ?',
      done: q2,
      content: () => (
        <TapQuestion
          prompt={<span>Sur le cercle, le point associé au réel t a pour coordonnées…</span>}
          options={[
            <MathText key="a">{'$(\\cos t\\ ;\\ \\sin t)$'}</MathText>,
            <MathText key="b">{'$(\\sin t\\ ;\\ \\cos t)$'}</MathText>,
            <MathText key="c">{'$(t\\ ;\\ \\cos t)$'}</MathText>,
            <MathText key="d">{'$(\\cos t\\ ;\\ t)$'}</MathText>,
          ]}
          correctionLabel="(cos t ; sin t)"
          correct={0} cols={2}
          requires={['cos-sin-coordonnees']}
          explain="Le cosinus se lit à l’HORIZONTALE (abscisse), le sinus à la VERTICALE (ordonnée) : le point est (cos t ; sin t). Le réel t, lui, est la longueur d’arc — il n’apparaît pas dans les coordonnées."
          explainWrong="Attention à l’ordre : l’abscisse d’abord, et c’est le COSINUS. Échanger les deux est l’erreur la plus fréquente du chapitre."
          solved={q2} onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Les signes, quart par quart',
      done: q3,
      content: () => (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={<p className="text-sm text-slate-600">Pour un point dans chacun de ces quarts, quels sont les signes de (cos t ; sin t) ?</p>}
            rows={[
              { id: 'r1', label: 'En haut à droite', options: ['(+ ; +)', '(− ; +)', '(+ ; −)'], correct: 0, correction: 'Abscisse positive, ordonnée positive.' },
              { id: 'r2', label: 'En haut à gauche', options: ['(− ; +)', '(+ ; +)', '(− ; −)'], correct: 0, correction: 'À gauche : abscisse négative. En haut : ordonnée positive.' },
              { id: 'r3', label: 'En bas à gauche', options: ['(− ; −)', '(+ ; −)', '(− ; +)'], correct: 0, correction: 'Les deux négatifs.' },
              { id: 'r4', label: 'En bas à droite', options: ['(+ ; −)', '(− ; −)', '(+ ; +)'], correct: 0, correction: 'À droite : abscisse positive. En bas : ordonnée négative.' },
            ]}
            requires={['cos-sin-coordonnees', 'abscisse', 'ordonnee']}
            feedback={({ allRight, nCorrect, total }) => (
              <Feedback tone={allRight ? 'ok' : 'ko'}>
                {allRight ? 'Les quatre.' : `${nCorrect} sur ${total}.`} Aucun signe n’est à retenir par cœur :
                le signe du cosinus se lit à gauche ou à droite de l’axe vertical, celui du sinus au-dessus
                ou en dessous de l’axe horizontal.
              </Feedback>
            )}
            solved={q3} onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="regle-signes-quadrants"
              variant="new"
              lead={<>Ce que tu viens de remplir se lit directement sur la figure, sans mémorisation.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Jusqu’où peuvent-ils aller ?',
      done: q4,
      content: () => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="regle-borne-un"
            variant="new"
            lead={<>Une conséquence immédiate du fait que le point reste sur un cercle de rayon 1.</>}
          />
          <TapQuestion
            prompt={<span>Existe-t-il un réel t tel que <MathText>{'$\\cos t = 1{,}4$'}</MathText> ?</span>}
            options={[
              'Non : le point ne quitte jamais le cercle, son abscisse reste entre −1 et 1',
              'Oui, si t dépasse un tour complet',
              'Oui, si t est négatif',
              'Oui, en changeant le rayon du cercle',
            ]}
            correct={0} cols={1}
            requires={['regle-borne-un', 'cos-sin-coordonnees']}
            explain="Le cercle a pour rayon 1 : l’abscisse d’un de ses points est comprise entre −1 et 1, bornes atteintes en (1 ; 0) et (−1 ; 0). Faire plusieurs tours ne change rien, on repasse aux mêmes endroits."
            explainWrong="Le cercle trigonométrique a TOUJOURS pour rayon 1, et le point y reste quel que soit t. Son abscisse ne peut donc pas dépasser 1."
            solved={q4} onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <KnowledgeBrick
              id="mem-cos-abscisse"
              variant="new"
              lead={<>Le réflexe à garder, et la confusion à ne jamais faire.</>}
            />
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
      moduleTitle="Deux coordonnées"
      moduleSubtitle="Le cosinus est une abscisse, le sinus une ordonnée"
      estimatedTime="16 min"
      brief={{
        tag: '🎯 Mission 03',
        title: 'En 3e, cos d’un angle obtus n’existait pas. Ici, si.',
        tone: 'indigo',
        body: <p>Un rapport de longueurs est toujours positif. Une coordonnée, non — et c’est précisément ce qui permet d’étendre la trigonométrie à tous les réels.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          Tu lis les deux coordonnées pour n’importe quel t. Pour certains angles, on peut même les
          donner exactement, sans calculatrice : c’est le module suivant.
        </KnowledgeSnapshot>
      )}
    />
  );
}
