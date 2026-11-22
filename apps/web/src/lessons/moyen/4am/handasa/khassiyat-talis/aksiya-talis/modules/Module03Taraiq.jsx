import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { MethodSteps, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, METHOD_PRACTICE } from '../content/textbook';
import { FIG_METHOD } from '../content/figures';

/**
 * Module 3 — طرائق (p. 109) « إثبات توازي (أو عدم توازي) مستقيمين ». L'exercice résolu du manuel, en DEUX sens :
 *   1. (CF)//(AB) : l'élève choisit d'abord les deux rapports à comparer (en D), puis lit la solution ligne à ligne
 *      (MethodSteps) — brique tariqa-tawazi ;
 *   2. (BD) et (EF) : l'élève fait d'abord le calcul (AF = 5, produits en croix 16 et 16,1) et conclut, puis lit la
 *      solution par l'absurde — brique tariqa-adam-tawazi ;
 *   3. un exercice de la PLATEFORME (déclaré) : la même figure, une longueur changée, les deux sens.
 * LP : P1 (les trois étapes), P2 (l'ordre, première ligne de chaque solution).
 * « أتوقّع القاعدة » : chaque MethodSteps porte la marche à suivre (`rule`) juste AVANT sa brique ; il est donc
 * enveloppé dans <PredictRule id="tariqa-tawazi"> / <PredictRule id="tariqa-adam-tawazi"> — l'élève écrit la
 * méthode (predictPrompt de knowledge.jsx) avant de lire la solution du manuel ; la brique suit sans redemander.
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
      moduleTitle="طرائق — إثبات التوازي أو عدمه"
      moduleSubtitle="الترتيب، النسبتان، ثم الخلاصة"
      objectives={['أيّ نسبتين نقارن لنثبت التوازي؟', 'كيف نبرهن أنّ مستقيمين غير متوازيين؟', 'ما خطوات البرهان وبأيّ ترتيب نكتبها؟']}
      estimatedTime="9 دقائق"
      brief={{
        tag: 'طرائق', title: METHOD.title, tone: 'emerald',
        body: <p>تمرين محلول في سؤالين: قرّر أنت أولا، ثم اكشف الحل سطرا سطرا.</p>,
      }}
      steps={[
        {
          num: 1, title: 'إثبات التوازي', subtitle: '(CF) و (AB)', done: q1,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_METHOD} />
              <TapQuestion
                prompt="1) على المستقيمين (CB) و (FA) المتقاطعين في D: أي نسبتين نقارن لنثبت أن (CF)//(AB)؟"
                // DA/AF : قطعتان من جهتين ; AB/AE : تخصّ السؤال 2 (الرأس A)
                options={["$\\dfrac{DA}{DF}$ و $\\dfrac{DB}{DC}$", "$\\dfrac{DA}{AF}$ و $\\dfrac{DB}{BC}$", "$\\dfrac{AB}{AE}$ و $\\dfrac{AD}{AF}$"].map(M)}
                correct={0}
                cols={1}
                requires={['khassiya-aksiya']}
                explain={<MathText>{'النقطة المشتركة هي D: نقسم طولين من D على المستقيم (FA) ثم طولين من D على المستقيم (CB)، بالترتيب نفسه (A مع B، و F مع C).'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && (
                <>
                  <PredictRule id="tariqa-tawazi"><MethodSteps method={{ source: METHOD.source, exercise: METHOD.exercise, solution: METHOD.part1, rule: METHOD.ruleParallel }} /></PredictRule>
                  <KnowledgeBrick id="tariqa-tawazi" lead="الطريقة في ثلاث خطوات:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'إثبات عدم التوازي', subtitle: '(BD) و (EF)', done: q2,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_METHOD} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">2) هل (BD) و (EF) متوازيان؟ احسب قبل أن تكشف الحل (الرأس A):</p>}
                rows={[
                  // 2 = DF + ... ; 3,5 = AD وحده
                  { id: 'af', label: 'AF', options: ['$5$', '$2$', '$3{,}5$'].map(M), correct: 0, correction: <MathText>{'$AF = AD + DF = 3{,}5 + 1{,}5 = 5$'}</MathText> },
                  { id: 'x', label: <MathText>{'الجداءان $3{,}2 \\times 5$ و $4{,}6 \\times 3{,}5$'}</MathText>, options: ['$16$ و $16$', '$16$ و $16{,}1$'].map(M), correct: 1, correction: <MathText>{'$3{,}2 \\times 5 = 16$ و $4{,}6 \\times 3{,}5 = 16{,}1$'}</MathText> },
                  { id: 'c', label: 'الخلاصة', options: ['(BD) و (EF) غير متوازيين', '$(BD) \\parallel (EF)$'].map(M), correct: 0, correction: 'النسبتان مختلفتان: لو كانا متوازيين لتساوت النسبتان حسب خاصية طالس.' },
                ]}
                requires={['nisbatan-mukhtalifatan', 'tasawi-kasrayn']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: قارن بالحل المحلول سطرا سطرا.' : 'راجع التصحيح، ثم اقرأ الحل سطرا سطرا.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && (
                <>
                  <PredictRule id="tariqa-adam-tawazi"><MethodSteps method={{ source: METHOD.source, exercise: METHOD.exercise, solution: METHOD.part2, rule: METHOD.ruleNotParallel }} /></PredictRule>
                  <KnowledgeBrick id="tariqa-adam-tawazi" lead="والاتجاه الآخر:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'أطبّق الطريقة', subtitle: 'تمرين من المنصّة', done: q3,
          content: (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800"><MathText>{METHOD_PRACTICE.text}</MathText> <SourceTag source={METHOD_PRACTICE.source} /></p>
              <BatchChoiceQuestion
                intro={<p className="text-sm text-slate-700">هل (EF) يوازي (GH)؟ ثم: <MathText>{METHOD_PRACTICE.second}</MathText></p>}
                rows={[
                  { id: 'a1', label: <MathText>{'الجداءان $2{,}4 \\times 3$ و $3{,}6 \\times 2$'}</MathText>, options: ['$7{,}2$ و $7{,}2$', '$7{,}2$ و $6{,}4$'].map(M), correct: 0, correction: <MathText>{'$\\dfrac{OE}{OG} = \\dfrac{OF}{OH} = \\dfrac{2}{3}$'}</MathText> },
                  { id: 'a2', label: 'الخلاصة', options: ['$(EF) \\parallel (GH)$ ، حسب الخاصية العكسية', '(EF) لا يوازي (GH)'].map(M), correct: 0, correction: 'O بين E و G و O بين F و H (نفس الترتيب) والنسبتان متساويتان.' },
                  { id: 'b1', label: <MathText>{'مع $OH = 3{,}2$ : الجداءان $2{,}4 \\times 3{,}2$ و $3{,}6 \\times 2$'}</MathText>, options: ['$7{,}2$ و $7{,}2$', '$7{,}68$ و $7{,}2$'].map(M), correct: 1, correction: <MathText>{'$2{,}4 \\times 3{,}2 = 7{,}68$ و $3{,}6 \\times 2 = 7{,}2$'}</MathText> },
                  { id: 'b2', label: 'الخلاصة', options: ['$(EF) \\parallel (GH)$', '(EF) لا يوازي (GH): لو كانا متوازيين لتساوت النسبتان'].map(M), correct: 1, correction: 'نسبتان مختلفتان تكفيان.' },
                ]}
                requires={['tariqa-tawazi', 'tariqa-adam-tawazi']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: الطريقة نفسها في الاتجاهين.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
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
