import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE } from '../content/textbook';
import { FIGURES } from '../content/figures';

/**
 * Module 2 — معارف : chaque encadré NOMME ce que l'élève vient de trouver dans la machine (question → encadré → brique), avec les mots de la
 * plateforme (guide §4ter-bis) : le وتر en face de l'angle droit, l'égalité pour un triangle nommé, l'égalité réservée aux triangles
 * rectangles (deux triangles dans une figure), la « نتيجة » (non rectangle). Figures : content/figures.js. LP : P1, P4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  return (
    <ContentModule
      objectives={['ما الضلع المقابل للزاوية القائمة؟', 'كيف نكتب المساواة لمثلث مسمّى؟', 'متى لا نكتبها؟', 'ماذا نستنتج حين لا تتحقّق؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — خاصية فيثاغورس"
      moduleSubtitle="الوتر · المساواة · مثلث غير قائم"
      estimatedTime="10 دقائق"
      steps={[
        {
          num: 1, title: 'أيّ ضلع يقابل الزاوية القائمة؟', subtitle: 'المثلث DEF', done: q1,
          content: (
            <div className="space-y-3">
              <div className="flex justify-center" data-module-figures="maarif-1"><GeoFigure {...FIGURES['maarif-1']} maxWidth={240} /></div>
              <TapQuestion
                prompt={<span>المثلث DEF قائم في E. أيّ أضلاعه أطولها، وهو المقابل للزاوية القائمة؟</span>}
                options={[M('$[DF]$'), M('$[DE]$'), M('$[EF]$')]}
                correct={0} cols={3} requires={['fitaghuras']}
                explain={<MathText>{'الضلع المقابل للرأس E هو $[DF]$، وهو أطول الأضلاع.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <TextbookBox kind="definition" compact text={KNOWLEDGE.hypotenuse.text} source={KNOWLEDGE.hypotenuse.source} />}
              {q1 && <KnowledgeBrick id="watar" compact />}
            </div>
          ),
        },
        {
          num: 2, title: 'ما المساواة في المثلث RST القائم في S؟', subtitle: 'اكتبها', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>RST مثلث قائم في S. ما المساواة التي تعبّر عن خاصية فيثاغورس فيه؟</span>}
                options={[M('$RT^2=RS^2+ST^2$'), M('$RS^2=RT^2+ST^2$'), M('$ST^2=RS^2+RT^2$')]}
                correct={0} cols={1} requires={['watar']}
                explain={<MathText>{'الزاوية القائمة في S، فالوتر $[RT]$ : مربعه في طرف، ومجموع مربعي الضلعين الآخرين في الطرف الآخر.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <TextbookBox kind="property" compact text={KNOWLEDGE.property.text} source={KNOWLEDGE.property.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'في أيّ مثلث نكتب المساواة؟', subtitle: 'مثلثان في شكل واحد', done: q3,
          content: (
            <div className="space-y-3">
              <div className="flex justify-center" data-module-figures="maarif-3"><GeoFigure {...FIGURES['maarif-3']} maxWidth={260} /></div>
              <TapQuestion
                prompt={<span>في الشكل: ABC قائم في B، و ACD قائم في C. أيّ مساواة صحيحة؟</span>}
                options={[M('$AD^2=AC^2+CD^2$'), M('$AD^2=AB^2+BC^2$'), M('$CD^2=AD^2+AC^2$')]}
                correct={0} cols={1} requires={['watar']}
                explain={<MathText>{'في المثلث ACD القائم في C الوتر $[AD]$. أمّا $AB$ و $BC$ فضلعا المثلث الآخر: نكتب المساواة في مثلث قائم واحد، أضلاعه الثلاثة منه.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <TextbookBox kind="remark" compact text={KNOWLEDGE.onlyRight.text} source={KNOWLEDGE.onlyRight.source} />}
            </div>
          ),
        },
        {
          num: 4, title: 'مثلث أطواله 6 و 7 و 9: هل يمكن أن يكون قائما؟', subtitle: 'المساواة لا تتحقّق', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'مثلث أطوال أضلاعه $6\\,\\mathrm{cm}$ و $7\\,\\mathrm{cm}$ و $9\\,\\mathrm{cm}$. علمًا أنّ $9^2=81$ و $6^2+7^2=85$ ، ماذا تستنتج؟'}</MathText>}
                options={[M('المثلث غير قائم'), M('المثلث قائم وتره 9'), M('المثلث قائم لأنّ 81 قريب من 85')]}
                correct={0} cols={1} requires={['ghayr-qaim']}
                explain={<MathText>{'لو كان قائما لكان وتره أطول أضلاعه 9، ولكان $9^2=6^2+7^2$. لكن $81\\neq85$ ، فهو غير قائم.'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <TextbookBox kind="property" compact text={KNOWLEDGE.notRight.text} source={KNOWLEDGE.notRight.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
