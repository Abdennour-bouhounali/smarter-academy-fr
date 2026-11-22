import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation } from '../../../../../../common/manipulations';
import { getLessonPath } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE, RECALL_LESSONS, GUIDE } from '../content/textbook';

/**
 * Module 2 — معارف : s'ouvre sur le MÊME labo `code-lockers`, monde `fraction` (posé seul, `levels={false}`) : une خزانة « (−6) × ? = 4 » qu'aucun code décimal n'ouvre
 * (les molettes disent −0,66 → 3,96 et −0,67 → 4,02) ; le bouton « وضع الكسر » apparaît après deux essais et l'élève ouvre le casier avec DEUX écritures différentes du même code.
 * Une seule piste (§4quater) : l'action, ce qu'elle a montré (quelles écritures ouvrent), puis le nom (le quotient écrit en fraction, les trois écritures, b ≠ 0). Les deux leçons
 * précédentes de l'unité (publiées) sont RAPPELÉES en tête (« تذكّر », avec leur lien), jamais reconstruites. LP : P3.
 * Déploiement du prototype (2026-10-28) : « pourquoi aucun code décimal ? » et « quelle autre écriture ouvre ? » sont posées PAR-DESSUS le labo
 * (`CodeLockers › CHAINS.f1`) ; l'étape 1 en garde la TRACE (`checkpoint-done`) puis pose les noms.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

export default function Module02Maarif() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const record = (e) => setTrials((list) => [...list, e]);
  const writings = [...new Set(trials.filter((e) => e.kind === 'pull' && !e.free && e.taskId === 'f1' && e.ok).map((e) => e.writing))];
  const f1 = writings.length >= 2;
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : l'étape 1 est faite quand la suite de questions du casier f1 l'est
  const asked = (...ids) => trials.some((e) => e.tk === 'checkpoint-done' && ids.includes(e.id));

  return (
    <ContentModule
      objectives={['كيف أكتب حاصل قسمة غير عشري؟', 'ما كتابات الكسر التي تفتح القفل نفسه؟', 'لماذا لا نقسم على الصفر؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — حين لا يكون الحاصل عشريًا"
      moduleSubtitle="كتابات الكسر، ولا قسمة على الصفر"
      estimatedTime="12 دقيقة"
      brief={{
        tag: 'معارف', title: 'نسمّي ما وجدتَه', tone: 'violet',
        body: (
          <div className="space-y-3">
            <p>جرّب أوّلًا في المختبر أدناه، ثم أجب؛ كل خلاصة تظهر بعد السؤال.</p>
            {RECALL_LESSONS.map((r) => {
              const path = getLessonPath(r.lesson);
              return (
                <TextbookBox key={r.lesson} kind="remark" title={r.title} text={r.text} source={r.source} compact>
                  {path && <Link to={path} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link={r.lesson}>{r.linkText}</Link>}
                </TextbookBox>
              );
            })}
          </div>
        ),
      }}
      intro={<Manipulation type="code-lockers" world={LAB.fraction.world} tasks={LAB.fraction.tasks} levels={false} onTrial={record} />}
      steps={[
        {
          num: 1, title: 'ما الكتابات التي فتحت الخزانة؟', subtitle: 'أكثر من كتابة لقفل واحد', done: asked('f1'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <p data-evidence="fraction" data-tried={asked('f1') ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${asked('f1') ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {asked('f1') && f1
                  ? <span>أجبتَ في المختبر: لا رمز عشري يفتح الخزانة الأولى، وفتحتها الكتابتان <Ltr>{writings[0]}</Ltr> و <Ltr>{writings[1]}</Ltr> — كتابتان للعدد نفسه.</span>
                  : 'افتح الخزانة الأولى في المختبر أعلاه بكتابتين مختلفتين، وأجب عن الأسئلة التي تظهر فوقه.'}
              </p>
              {asked('f1') && <KnowledgeBrick id="kasr-qisma" lead="حين لا يوجد رمز عشري كتبنا حاصل القسمة على شكل كسر: كيف نكتبه، وأين نضع إشارة السالب؟" />}
              {asked('f1') && <TextbookBox kind="property" compact lines={KNOWLEDGE.fraction.lines} source={KNOWLEDGE.fraction.source} />}
              {asked('f1') && <TextbookBox kind="example" compact text={KNOWLEDGE.fraction.examples} source={KNOWLEDGE.fraction.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'كسر بإشارتين سالبتين', subtitle: 'الإشارة والقيمة', done: !!(q.b1 && q.b2),
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'الكسر $\\frac{-15}{-4}$ :'}</MathText>}
                options={['موجب', 'سالب']} correct={0} cols={2} requires={['kasr-qisma']}
                explain={<MathText>{'البسط والمقام سالبان: لهما الإشارة نفسها فالكسر موجب، و $\\frac{-15}{-4} = \\frac{15}{4}$ .'}</MathText>}
                onAnswered={answered('b1')}
              />
              <NumericQuestion
                prompt={<MathText>{'اكتب $\\frac{-15}{-4} = \\frac{15}{4}$ كتابةً عشريةً.'}</MathText>}
                expected={3.75} display="3,75" requires={['kasr-qisma']}
                explain={<MathText>{'$15 \\div 4 = 3{,}75$ . (نتحقّق: $4 \\times 3{,}75 = 15$ .)'}</MathText>}
                onAnswered={answered('b2')}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'لماذا لا توجد خزانة $0 \\times ? = 5$ ؟', subtitle: 'القسمة على الصفر', done: !!q.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'لا توجد خزانة قفلها $0 \\times ? = 5$ يمكن فتحه. لماذا؟'}</MathText>}
                options={[<MathText key="a">{'لأنّ $0 \\times q = 0$ مهما كان $q$'}</MathText>, 'لأنّ الرمز يكون سالبًا', 'لأنّ 5 عدد فردي']}
                correct={0} cols={1} requires={['kasr-qisma']}
                explain={<MathText>{GUIDE.zero + ' ' + '(في المختبر: القفل $0 \\times ? = 0$ تفتحه كل الرموز، والقفل $0 \\times ? = 5$ لا يفتحه أيّ رمز.)'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <KnowledgeBrick id="qisma-sifr" lead="ما معنى حاصل قسمة $5$ على $0$ ؟" />}
              {q.c && <TextbookBox kind="remark" compact text={KNOWLEDGE.zero.text} source={KNOWLEDGE.zero.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
