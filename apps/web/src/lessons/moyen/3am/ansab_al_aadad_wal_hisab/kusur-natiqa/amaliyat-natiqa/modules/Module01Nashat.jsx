import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : la لوحة الدمج. UNE SEULE PISTE (§4quater) : le labo `merge-board` en haut, sans carte au-dessus — il porte
 * son contexte et SA question ; la main PRÉDIT le signe de chaque fusion, RETOURNE le diviseur d'une division et choisit l'ORDRE (aimants, bulles). Les ÉTAPES interrogent ce que l'élève a FAIT, avec SES
 * chaînes : quel ruban est resté quand −5/4 et 11/6 se sont rencontrés, pourquoi −9/8 ÷ (−3/4) est positif et quel est le مقلوب de −3/4, pourquoi 7/3 et 8/15 n'ont pas pu fusionner d'abord. Les noms
 * (briques) viennent APRÈS la réponse. Le نشاط 6 du manuel (produits, sommes, quotients à imiter) est posé en applications (أتمرّن). LP : P1, P2, P3, P4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const texOf = (w) => { const [a, b] = String(w).split('/'); return b === undefined ? a.replace(',', '{,}') : `${a.startsWith('-') ? '-' : ''}\\frac{${a.replace('-', '').replace(',', '{,}')}}{${b}}`; };

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const record = (e) => setTrials((list) => [...list, e]);
  const solved = (id) => trials.find((e) => e.kind === 'solved' && !e.free && e.taskId === id);
  const flipped = trials.some((e) => e.kind === 'flip' && e.ok && !e.free && e.taskId === 'c3');
  const c1 = solved('c1');
  const c3 = solved('c3');
  const c4 = solved('c4');

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['كيف أعرف إشارة الناتج قبل أن أحسب؟', 'كيف أقسم على عدد سالب؟', 'بأيّ ترتيب أدمج سلسلة حسابات؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — لوحة الدمج"
      moduleSubtitle="توقّع الإشارة ثم ادمج البلاطتين"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="merge-board" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="merge-board" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'الشريط الذي يبقى', subtitle: '−5/4 + 11/6', done: !!q.a && !!q.a2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="c1" ok={!!c1}
                done={<span>في السلسلة 1 دمجتَ <MathText>{'$-\\frac{5}{4}$'}</MathText> و <MathText>{'$\\frac{11}{6}$'}</MathText> فبقيت بلاطة <MathText>{`$${texOf(c1?.result ?? '0')}$`}</MathText> .</span>}
                todo="أنجز السلسلة 1: توقّع الإشارة وادمج، ثم عُد إلى هذا السؤال." />
              {c1 && (
                <>
                  <TapQuestion
                    prompt={<MathText>{'قبل دمج $-\\frac{5}{4}$ و $\\frac{11}{6}$ ، أيّ الشريطين بقي حين تقابلا؟ ولماذا؟'}</MathText>}
                    options={[M('الأزرق: $\\frac{11}{6}=\\frac{22}{12}$ أبعد عن الصفر من $\\frac{5}{4}=\\frac{15}{12}$'), M('الأحمر: لأنّه الشريط الأوّل'), M('لا يبقى شيء لأنّ الإشارتين مختلفتان')]}
                    correct={0} cols={1} requires={['jidaa-adadayn-nisbiyayn-3am']}
                    explain={<MathText>{'حين يتقابل لونان مختلفان يبقى الأطول، أي العدد الأبعد عن الصفر: بالمقام $12$ ، $22>15$ .'}</MathText>}
                    onAnswered={answered('a')}
                  />
                  {q.a && (
                    <TapQuestion
                      prompt={<MathText>{'ما ناتج $-\\frac{5}{4}+\\frac{11}{6}$ ؟'}</MathText>}
                      options={[M('$\\frac{7}{12}$'), M('$-\\frac{7}{12}$'), M('$\\frac{37}{12}$')]}
                      correct={0} cols={3} requires={['jam-tarh-kasrayn-3am']}
                      explain={<MathText>{'$-\\frac{15}{12}+\\frac{22}{12}=\\frac{7}{12}$ ، وهو موجب لأنّ الباقي هو الشريط الأزرق. ($\\frac{37}{12}$ جمع المسافتين، و $-\\frac{7}{12}$ أخذ إشارة الحدّ الأوّل.)'}</MathText>}
                      onAnswered={answered('a2')}
                    />
                  )}
                  {q.a2 && <KnowledgeBrick id="jam-natiqa" lead="كيف نجمع عددين ناطقين مختلفي الإشارة؟" />}
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'القسمة على عدد سالب', subtitle: '−9/8 ÷ (−3/4)', done: !!q.b && !!q.b2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="c3" ok={!!c3 && flipped}
                done={<span>في السلسلة 3 قلبتَ <MathText>{'$-\\frac{3}{4}$'}</MathText> ثم ضربتَ فبقيت بلاطة <MathText>{`$${texOf(c3?.result ?? '0')}$`}</MathText> .</span>}
                todo="أنجز السلسلة 3: اقلب البلاطة التي نقسم عليها وتوقّع الإشارة، ثم عُد إلى هذا السؤال." />
              {c3 && flipped && (
                <>
                  <TapQuestion
                    prompt={<MathText>{'لماذا كان ناتج $-\\frac{9}{8}\\div\\left(-\\frac{3}{4}\\right)$ موجبًا؟'}</MathText>}
                    options={[M('لأنّ العددين سالبان: لهما الإشارة نفسها'), M('لأنّنا قلبنا القاسم فصار موجبًا'), M('لأنّ القسمة تعطي دائمًا عددًا موجبًا')]}
                    correct={0} cols={1} requires={['jidaa-adadayn-nisbiyayn-3am']}
                    explain={<MathText>{'للعددين الإشارة نفسها فالناتج موجب؛ والقلب لم يغيّر الإشارة: بقيت بلاطة المقلوب حمراء.'}</MathText>}
                    onAnswered={answered('b')}
                  />
                  {q.b && (
                    <TapQuestion
                      prompt={<MathText>{'ما مقلوب $-\\frac{3}{4}$ ؟'}</MathText>}
                      options={[M('$-\\frac{4}{3}$'), M('$\\frac{4}{3}$'), M('$-\\frac{3}{4}$')]}
                      correct={0} cols={3} requires={['maqlub-qismat-kasrayn-3am']}
                      explain={<MathText>{'$\\left(-\\frac{3}{4}\\right)\\times\\left(-\\frac{4}{3}\\right)=1$ ، أمّا $\\left(-\\frac{3}{4}\\right)\\times\\frac{4}{3}=-1$ فليس $1$ . مقلوب العدد السالب سالب.'}</MathText>}
                      onAnswered={answered('b2')}
                    />
                  )}
                  {q.b && <KnowledgeBrick id="jida-natiqa" lead="كيف نضرب عددين ناطقين؟" />}
                  {q.b2 && <KnowledgeBrick id="qisma-natiqa" lead="كيف نقسم عددًا ناطقًا على عدد ناطق؟" />}
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'المغناطيس', subtitle: '7/3 − 8/15 ÷ 11/20', done: !!q.c && !!q.c2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="c4" ok={!!c4}
                done={<span>في السلسلة 4 فرض المغناطيس القسمة أوّلًا، وبقيت بلاطة <MathText>{`$${texOf(c4?.result ?? '0')}$`}</MathText> .</span>}
                todo="أنجز السلسلة 4، ثم عُد إلى هذا السؤال." />
              {c4 && (
                <>
                  <TapQuestion
                    prompt={<MathText>{'لماذا لم تستطع دمج $\\frac{7}{3}$ و $\\frac{8}{15}$ أوّلًا؟'}</MathText>}
                    options={[M('لأنّ القسمة تُنجز قبل الطرح'), M('لأنّ المقامين مختلفان'), M('لأنّ $\\frac{7}{3}$ أكبر من $\\frac{8}{15}$')]}
                    correct={0} cols={1} requires={['jam-tarh-kasrayn-3am']}
                    explain={<MathText>{'المغناطيس يشدّ $\\frac{8}{15}$ إلى القسمة على $\\frac{11}{20}$ : الضرب والقسمة يسبقان الجمع والطرح.'}</MathText>}
                    onAnswered={answered('c')}
                  />
                  {q.c && (
                    <TapQuestion
                      prompt={<MathText>{'ما ناتج $\\frac{7}{3}-\\frac{8}{15}\\div\\frac{11}{20}$ ؟'}</MathText>}
                      options={[M('$\\frac{15}{11}$'), M('$\\frac{36}{11}$'), M('$\\frac{5}{9}$')]}
                      correct={0} cols={3} requires={['maqlub-qismat-kasrayn-3am']}
                      explain={<MathText>{'$\\frac{8}{15}\\div\\frac{11}{20}=\\frac{8}{15}\\times\\frac{20}{11}=\\frac{32}{33}$ ثمّ $\\frac{77}{33}-\\frac{32}{33}=\\frac{45}{33}=\\frac{15}{11}$ .'}</MathText>}
                      onAnswered={answered('c2')}
                    />
                  )}
                  {q.c2 && <KnowledgeBrick id="awlawiya" lead="بأيّ ترتيب ندمج عمليات سلسلة؟" />}
                </>
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
