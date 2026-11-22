import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Manipulation } from '../../../../../../common/manipulations';
import { TextbookBox, MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD_DRAW, NOW_143, LAB } from '../content/textbook';
import { FIG_METHOD } from '../content/figures';

/**
 * Module 3 — طرائق (p. 143) « تمثيل شعاع علمت مركبتاه ».
 * TOUCH THE MATH : 1) la solution du manuel révélée ligne à ligne (A(−2 ; 1) → A₁ par 3 vers la droite → B par 4 vers
 * le bas), la règle (les deux translations, renommées u₁ et u₂ — une ligne le dit), une question sur A₁ ; 2) le second
 * représentant EF (EABF متوازي أضلاع) sur la figure redessinée (E choisi autrement que le dessin du manuel, la bande
 * haute) ; 3) دوري الآن 1 FAIT dans le lab posé SEUL (`levels={false}`, `story: 'draw'`) : u depuis R puis depuis O,
 * v depuis S — puis une question qui ne réutilise pas ces nombres. LP : P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Taraiq() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طرائق — تمثيل شعاع علمت مركبتاه"
      moduleSubtitle="الكود معطى: أين تضع الوجهة؟"
      objectives={['أين نضع الوجهة إذا عُرف الكود؟', 'كيف نمثّل الشعاع نفسه انطلاقًا من نقطة أخرى؟']} estimatedTime="9 دقائق"
      intro={(
        <Manipulation
          type="component-steps"
          levels={false}
          {...LAB.draw.numbers}
          theme="delivery"
          lead={NOW_143.lead}
        />
      )}
      steps={[
        {
          num: 1, title: 'ممثّل أول للشعاع u', subtitle: 'الطريقة، السؤال 1', done: q1,
          content: (
            <div className="space-y-3">
              {/* « أتوقّع القاعدة » AVANT la solution du manuel : ses lignes appliquent déjà la طريقة (un exemple résolu). */}
              <PredictRule id="tamthil-shuaa">
                <MethodSteps method={{ ...METHOD_DRAW, solution: METHOD_DRAW.solution.slice(0, 4) }} />
              </PredictRule>
              <p className="text-xs text-slate-500"><MathText>{METHOD_DRAW.rename}</MathText></p>
              <TapQuestion
                prompt={<MathText>{'من $A(-2\\,;\\,1)$ ، بالانسحاب الأفقي ثم الانسحاب العمودي للشعاع $\\vec{u}\\begin{pmatrix} 3 \\\\ -4 \\end{pmatrix}$ نجد:'}</MathText>}
                options={[
                  '$A_1(1\\,;\\,1)$ ثم $B(1\\,;\\,-3)$',
                  '$A_1(1\\,;\\,1)$ ثم $B(1\\,;\\,5)$', // le signe de −4 oublié (MISC-MAALAM-ISHARA)
                  '$A_1(-6\\,;\\,1)$ ثم $B(-6\\,;\\,4)$', // les deux nombres échangés : −4 en largeur, 3 en hauteur (MISC-MAALAM-TABDIL-X-Y)
                  '$B(3\\,;\\,-4)$', // le point de coordonnées 3 et −4 (MISC-MAALAM-IHDATHIYAT-MURAKKIBAT)
                ].map(M)}
                correct={0}
                cols={1}
                explain={<MathText>{'3 وحدات نحو اليمين: $A_1(1\\,;\\,1)$ ، ثم 4 وحدات نحو الأسفل: $B(1\\,;\\,-3)$ . النقطة $(3\\,;\\,-4)$ هي نهاية الممثّل الذي مبدؤه O فقط.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="tamthil-shuaa" lead="ما فعله الطيار الآلي في التطبيق، بكلمات الطريقة:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ممثّل آخر EF', subtitle: 'الطريقة، السؤال 2', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="solution" lines={METHOD_DRAW.solution.slice(4)} source={METHOD_DRAW.source} compact />
              <GeoFigure {...FIG_METHOD} />
              <p className="text-xs text-slate-500"><MathText>{METHOD_DRAW.efLine}</MathText></p>
              <TapQuestion
                prompt={<MathText>{'لإنشاء F حيث $\\overrightarrow{EF} = \\overrightarrow{AB}$ ، أيّ رباعي يكون متوازي أضلاع؟'}</MathText>}
                options={[
                  'EABF',
                  'EAFB', // quadrilatère croisé : l'ordre des sommets
                  'EBAF', // croisé aussi
                ]}
                correct={0}
                cols={3}
                requires={['tamthil-shuaa']}
                explain={<MathText>{'$\\overrightarrow{EF} = \\overrightarrow{AB}$ : [AF] و [BE] لهما نفس المنتصف، والرباعي EABF (E ثم A ثم B ثم F) متوازي أضلاع؛ الترتيبان الآخران يعطيان رباعيا متقاطعا.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <TextbookBox kind="method" lines={[METHOD_DRAW.rule]} source={METHOD_DRAW.source} compact />}
            </div>
          ),
        },
        {
          num: 3, title: 'وجهة شعاع من نقطة غير O', subtitle: 'دوري الآن — تمثيل u و v', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={NOW_143.text} source={NOW_143.source} compact />
              <TapQuestion
                prompt={<MathText>{'ممثّل الشعاع $\\vec{w}\\begin{pmatrix} -4 \\\\ -1 \\end{pmatrix}$ الذي مبدؤه $K(2\\,;\\,3)$ ينتهي عند:'}</MathText>}
                options={[
                  '$(-2\\,;\\,2)$',
                  '$(-4\\,;\\,-1)$', // les coordonnées : l'origine n'est pas O
                  '$(6\\,;\\,4)$', // le trajet à l'envers
                  '$(1\\,;\\,-1)$', // échangé : −1 horizontal, −4 vertical
                ].map(M)}
                correct={0}
                cols={2}
                requires={['tamthil-shuaa']}
                explain={<MathText>{'من K: 4 وحدات نحو اليسار ثم وحدة نحو الأسفل: $(2 - 4\\,;\\,3 - 1) = (-2\\,;\\,2)$ .'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
