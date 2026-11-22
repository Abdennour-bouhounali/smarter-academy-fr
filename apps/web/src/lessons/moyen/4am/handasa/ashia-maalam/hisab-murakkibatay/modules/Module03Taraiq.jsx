import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox, MethodSteps, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD_EQUAL, METHOD_UNKNOWN, NOW2, MISTAKES, LAB } from '../content/textbook';
import { FIG_METHOD_EQUAL } from '../content/figures';

/**
 * Rétrofit 2026-10-15 (§4quater) : le labo OUVRE le module (sans carte ni titre ; `lead` = le contexte), niveau متقدم par défaut — E se calcule,
 * ne s'essaie pas (c'est le passage de l'essai au calcul que formalise la méthode) ; la solution rédigée du livre (figure + MethodSteps) et
 * la brique tahaqquq-tasawi viennent APRÈS la réponse de l'étape 1. La « طريقة نقطة مجهولة » reste écrite par l'élève d'abord (PredictRule).
 *
 * Module 3 — طرائق (p. 143) : « حساب مركبتا شعاع، علمت إحداثيات مبدئه ونهايته » (la conclusion CORRIGÉE AB = DC, une
 * ligne), la brique tahaqquq-tasawi ; puis « حساب إحداثيتي نقطة مجهولة » (méthode de la plateforme, déclarée) AVEC le
 * lab مبتدئ ouvert par défaut — la porte D aux deux coordonnées inconnues, AB = DC, le piège CD = AB qui croise ABCD — et
 * la brique nuqta-majhula ; enfin دوري الآن 2. AUCUNE étape n'attend `onFinished`. LP : P2 (1), P3 (2), P1 (3).
 * « أتوقّع القاعدة » : la طريقة « نقطة مجهولة » s'écrit ligne à ligne dans MethodSteps, juste avant sa brique : elle est
 * enveloppée dans <PredictRule id="nuqta-majhula"> (l'élève écrit la méthode d'abord) ; le brief ne dit plus la طريقة du
 * livre (« نحسب مركبتي شعاعين ونقارنهما »), prédite à l'étape 1 (tahaqquq-tasawi).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Taraiq() {
  const [q1, setQ1] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طرائق — التحقق من التساوي ونقطة مجهولة"
      moduleSubtitle="كيف نقارن شعاعين؟ وكيف نجد نقطة مجهولة؟"
      objectives={['كيف نتحقق من تساوي شعاعين في معلم؟', 'كيف نعيّن نقطة مجهولة لنكوّن متوازي أضلاع؟', 'أطبّق الطريقتين بنفسي']} estimatedTime="10 دقائق"
      intro={
        <ManipulationWorkspace
          defaultLevel="advanced"
          levels={{
            beginner: () => (
              <Manipulation type="component-calc" level="beginner" {...LAB.beginner.numbers} theme="game-map" />
            ),
            advanced: () => (
              <Manipulation type="component-calc" level="advanced" {...LAB.advanced.numbers} theme="game-map"
                lead="نعود إلى بوابات الكتاب: الشعاع DE معروف المركبتين والنقطة E مجهولة — تُحسب ولا تُجرَّب." />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'التحقق من تساوي شعاعين', subtitle: 'طريقة الكتاب', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'للشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{DC}$ نفس المركبتين $\\begin{pmatrix} -1 \\\\ 3 \\end{pmatrix}$ . ماذا نستنتج؟'}</MathText>}
                options={[
                  '$\\overrightarrow{AB} = \\overrightarrow{DC}$ ، فالرباعي ABCD متوازي أضلاع',
                  '$\\overrightarrow{AB} = \\overrightarrow{CD}$', // CD(1 ; −3) est l'opposé (la coquille du manuel)
                  'ABCD مستطيل', // AC² = 16 ≠ BD² = 40 : rien ne donne d'angle droit
                ].map(M)}
                correct={0}
                cols={1}
                requires={['farq-ihdathiyat']}
                explain={<MathText>{`${METHOD_EQUAL.solution[4]} و A، B، C ليست على استقامة واحدة: ABCD متوازي أضلاع. أما $\\overrightarrow{CD}\\begin{pmatrix} 1 \\\\ -3 \\end{pmatrix}$ فهو المعاكس.`}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && (
                <>
                  <GeoFigure {...FIG_METHOD_EQUAL} />
                  <MethodSteps method={METHOD_EQUAL} />
                  <p className="text-xs text-slate-500" data-misprint-note><MathText>{METHOD_EQUAL.correction}</MathText></p>
                  <KnowledgeBrick id="tahaqquq-tasawi" lead="القاعدة التي يكتبها الكتاب بعد الحل:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'نقطة مجهولة', subtitle: 'البوابة D بالحساب', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'بوابات المستوى الأول: $A(1\\,;\\,2)$ ، $B(4\\,;\\,3)$ ، $C(5\\,;\\,5)$ . أيّ معادلتين تعطيان D حيث ABCD متوازي أضلاع؟'}</MathText>}
                options={[
                  '$5 - x_D = 3$ و $5 - y_D = 1$',
                  '$x_D - 5 = 3$ و $y_D - 5 = 1$', // CD = AB : ABCD croisé (MISC-MAALAM-TARTIB-NUQAT)
                  '$5 - x_D = 4$ و $5 - y_D = 3$', // les coordonnées de B prises pour les composantes de AB (MISC-MAALAM-IHDATHIYAT-MURAKKIBAT)
                ].map(M)}
                correct={0}
                cols={1}
                requires={['tasawi-murakkibat']}
                explain={<MathText>{`$\\overrightarrow{AB}\\begin{pmatrix} 3 \\\\ 1 \\end{pmatrix}$ و $\\overrightarrow{DC}\\begin{pmatrix} 5 - x_D \\\\ 5 - y_D \\end{pmatrix}$ : $x_D = 2$ و $y_D = 4$ . ${MISTAKES.order.note}`}</MathText>}
                onAnswered={() => setQ2a(true)}
              />
              {q2a && (
                <>
                {/* « أتوقّع القاعدة » : la طريقة écrit la méthode ligne à ligne — l'élève l'écrit d'abord (predictPrompt de nuqta-majhula). */}
                <PredictRule id="nuqta-majhula">
                  <MethodSteps method={METHOD_UNKNOWN} />
                </PredictRule>
                </>
              )}
              {q2a && <KnowledgeBrick id="nuqta-majhula" lead="الطريقة التي طبّقتها على البوابة D:" />}
              {q2a && (
                <TapQuestion
                  prompt={<span><MathText>{'$P(-2\\,;\\,1)$ ، $Q(3\\,;\\,-1)$ ، $R(4\\,;\\,2)$ . النقطة S حيث PQRS متوازي أضلاع هي:'}</MathText> <SourceTag source={METHOD_UNKNOWN.source} /></span>}
                  options={[
                    '$S(-1\\,;\\,4)$',
                    '$S(9\\,;\\,0)$', // RS = PQ : PQRS croisé (MISC-MAALAM-TARTIB-NUQAT)
                    '$S(-3\\,;\\,-2)$', // P + Q − R : le sommet opposé à R, PQSR
                  ].map(M)}
                  correct={0}
                  cols={3}
                  requires={['nuqta-majhula']}
                  explain={<MathText>{'$\\overrightarrow{PQ}\\begin{pmatrix} 5 \\\\ -2 \\end{pmatrix}$ و $\\overrightarrow{SR}\\begin{pmatrix} 4 - x_S \\\\ 2 - y_S \\end{pmatrix}$ : $4 - x_S = 5$ و $2 - y_S = -2$ ، إذن $S(-1\\,;\\,4)$ .'}</MathText>}
                  onAnswered={() => setQ2(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'دوري الآن', subtitle: 'ثلاثة أشعة', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={NOW2.text} source={NOW2.source} compact />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر مركبتي كل شعاع:</p>}
                rows={[
                  // AB : (−6 ; 2) ; (6 ; −2) à l'envers ; (−4 ; 5) coordonnées de B
                  { id: 'ab', label: <MathText>{'$\\overrightarrow{AB}$'}</MathText>, options: ['$\\begin{pmatrix} -6 \\\\ 2 \\end{pmatrix}$', '$\\begin{pmatrix} 6 \\\\ -2 \\end{pmatrix}$', '$\\begin{pmatrix} -4 \\\\ 5 \\end{pmatrix}$'].map(M), correct: 0, correction: <MathText>{'$-4 - 2 = -6$ و $5 - 3 = 2$ .'}</MathText> },
                  // BC : (5 ; −5) ; (−3 ; 5) somme ; (−5 ; 5) à l'envers
                  { id: 'bc', label: <MathText>{'$\\overrightarrow{BC}$'}</MathText>, options: ['$\\begin{pmatrix} 5 \\\\ -5 \\end{pmatrix}$', '$\\begin{pmatrix} -3 \\\\ 5 \\end{pmatrix}$', '$\\begin{pmatrix} -5 \\\\ 5 \\end{pmatrix}$'].map(M), correct: 0, correction: <MathText>{'$1 - (-4) = 5$ و $0 - 5 = -5$ .'}</MathText> },
                  // DA : (3 ; 2) ; (−3 ; −2) AD ; (1 ; 4) somme
                  { id: 'da', label: <MathText>{'$\\overrightarrow{DA}$'}</MathText>, options: ['$\\begin{pmatrix} 3 \\\\ 2 \\end{pmatrix}$', '$\\begin{pmatrix} -3 \\\\ -2 \\end{pmatrix}$', '$\\begin{pmatrix} 1 \\\\ 4 \\end{pmatrix}$'].map(M), correct: 0, correction: <MathText>{'المبدأ D والنهاية A: $2 - (-1) = 3$ و $3 - 1 = 2$ .'}</MathText> },
                ]}
                requires={['qanun-murakkibatayn']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: النهاية ناقص المبدأ في كل مركبة.' : 'راجع التصحيح تحت كل سطر: المبدأ هو الحرف الأول.'}</Feedback>}
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
