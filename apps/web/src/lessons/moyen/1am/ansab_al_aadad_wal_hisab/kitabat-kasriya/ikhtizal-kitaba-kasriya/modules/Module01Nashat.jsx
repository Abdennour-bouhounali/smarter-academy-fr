import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY, GUIDE } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE : le plateau de la grand-mère puis le نشاط 4 du manuel (p. 54) (rétrofit 2026-10-15 : le labo en tête SANS carte
 * ni titre, la brique APRÈS la réponse, la question du grand-père demande POURQUOI — le labo a déjà fait prédire). LABORATOIRE À DEUX NIVEAUX, un seul type
 * `fraction-knife` (la main tient le COUTEAU : d, le nombre de morceaux égaux du tout ; la part ne bouge jamais) :
 *   مبتدئ  — le plateau de قلب اللوز de grand-mère (plateforme, monde `sweets-tray`) : la part des voisins 3/5, d de 1 à 20,
 *            la proposition d'Amine « 4/6 » jugée par le plateau.
 *   متقدم  — le MANUEL : les trois rectangles (3/5, 6/10, 12/20), puis le cadeau du grand-père 27/45, prédit puis réduit.
 * Les ÉTAPES sont les questions ② et ③ du manuel, puis le grand-père (③ ب). LP : P1 (et P3, au niveau متقدم).
 * Déploiement du prototype (2026-10-28) : « même part, k pour le numérateur ET le dénominateur » est posée PAR-DESSUS le labo
 * (`FractionKnife › chainsOf`) ; l'étape 1 en garde la TRACE (`checkpoint-done` de `stage-0`). Le grand-père (متقدم) reste une question d'étape.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const { share, targets, gift } = ACTIVITY.numbers;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const record = (e) => setTrials((list) => [...list, e]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : la première part (la صينية, ou les rectangles du manuel)
  const q1 = trials.some((e) => e.tk === 'checkpoint-done' && e.id === 'stage-0');
  const writings = [...new Set(trials.filter((e) => e.kind === 'cut' && e.readable && e.writing).map((e) => e.writing))];

  return (
    <ContentModule
      objectives={['نفس الحصّة: كم كتابة كسرية لها؟', 'ماذا يحدث للبسط والمقام معًا؟', 'هديّة الجدّ: أيّ الكسرين أكبر؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط 4 — نفس الحصّة"
      moduleSubtitle="نقطع أكثر أو أقل، والحصّة لا تتحرّك"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => (
              <Manipulation type="fraction-knife" level="beginner" world="tray" share={share} start={share[1]} max={20} claim={[4, 6]} onTrial={record} />
            ),
            advanced: () => (
              <Manipulation type="fraction-knife" level="advanced" world="paper" share={share} start={share[1]} max={20} targets={targets}
                then={{ share: gift, start: gift[1], max: gift[1], predict: true }}
                onTrial={record} />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'قارن بين السطوح الملوّنة', subtitle: 'نفس الحصّة، كتابات كثيرة', done: q1,
          content: (
            <div className="space-y-3">
              <p className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={writings.length ? 'true' : 'false'}>
                {writings.length
                  ? <span className="font-bold text-slate-800">كتاباتك: <bdi dir="ltr">{writings.join(' = ')}</bdi></span>
                  : <span className="text-slate-500">لم تكتب أيّ كسر بعد في الصينية أو في المستطيلات.</span>}
              </p>
              <p data-evidence="stage-0" data-tried={q1 ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${q1 ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {q1
                  ? <MathText>{'أجبتَ في المختبر: نفس الحصّة، قطع أكثر وأصغر — البسط والمقام ضُربا في نفس العدد: $\\frac{3}{5}=\\frac{6}{10}=\\frac{12}{20}$.'}</MathText>
                  : 'اقطع الصينية (أو المستطيلات) حتى تكتب الحصّة بعدّة كسور، وأجب عن الأسئلة التي تظهر فوق المختبر.'}
              </p>
              {q1 && <KnowledgeBrick id="kitabat-mutasawiya" lead="قطعنا كل قطعة إلى قطعتين، ثم إلى أربع: ماذا حدث للبسط وللمقام؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'أُنقل وأتمم', subtitle: 'نفس العدد للبسط وللمقام', done: q2,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">أُنقل وأتمم بالعدد المناسب:</p>}
                rows={[
                  { id: 'a', label: M('$\\frac{3}{5}=\\frac{3\\times\\ldots}{5\\times\\ldots}=\\frac{6}{10}$'), options: ['2', '3', '5'], correct: 0, correction: M('$3\\times 2=6$ و $5\\times 2=10$') },
                  { id: 'b', label: M('$\\frac{12}{20}=\\frac{12\\div\\ldots}{20\\div\\ldots}=\\frac{3}{5}$'), options: ['4', '9', '15'], correct: 0, correction: M('$12\\div 4=3$ و $20\\div 4=5$') },
                ]}
                requires={['kitabat-mutasawiya']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{allRight ? 'نفس العدد للبسط وللمقام.' : GUIDE.addSame.right}</MathText></Feedback>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'هديّة الجدّ: لماذا لا فرق بين الكسرين؟', subtitle: '27/45 أم 3/5؟', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>في هديّة الجدّ قطعتَ <bdi dir="ltr">27/45</bdi> حتى صارت <bdi dir="ltr">3/5</bdi>. لماذا تبقى الحصّة نفسها؟</span>}
                options={[M('جمعنا كل 9 قطع في قطعة أكبر، فبقي السطح الملوّن كما هو'), M('لأنّ البسط صار أصغر'), M('لأنّ المقام صار أكبر')]}
                correct={0} cols={1} requires={['kitabat-mutasawiya']}
                explain={<MathText>{'نجمع كل 9 قطع في قطعة: 27 قطعة من 45 تصبح 3 قطع من 5. نفس الحصّة، دون حساب المبلغ.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <TextbookBox kind="exercise" text={ACTIVITY.grandfather} source={ACTIVITY.source} compact />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
