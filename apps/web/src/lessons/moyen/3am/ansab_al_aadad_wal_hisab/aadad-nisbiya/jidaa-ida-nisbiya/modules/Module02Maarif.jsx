import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation } from '../../../../../../common/manipulations';
import { getLessonPath } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE, RECALL_LESSON1, GUIDE } from '../content/textbook';

/**
 * Module 2 — معارف : s'ouvre sur le MÊME labo `robot-track`, monde `square` (posé seul, `levels={false}`) : une carte `a` posée DEUX FOIS — l'élève
 * cherche un nombre qui arrête le robot du côté négatif et n'en trouve aucun. Une seule piste (§4quater) : l'action, ce qu'elle a montré (`a = 3` et
 * `a = −3` donnent 9), puis le nom (le carré, `(−a)² = a²`), puis les trois rôles du signe « − » (classement par touches) et `−a` quand `a < 0`.
 * La leçon précédente de l'unité (publiée) est RAPPELÉE en tête (« تذكّر », avec son lien), jamais reconstruite. LP : P1, P3.
 * Déploiement du prototype (2026-10-28) : « où s'arrête le robot ? » et « un carré négatif ? » sont posées PAR-DESSUS le labo (`RobotTrack ›
 * CHAINS.q1`) ; les étapes 1 et 2 en gardent la TRACE (`checkpoint-done`) puis posent les noms.
 */
const ROLES = [
  { tex: '15 - 6', answer: 0, why: 'الإشارة بين عددين هنا علامة الطرح: $15 - 6 = 9$ .' },
  { tex: '-6', answer: 1, why: 'الإشارة أمام العدد $6$ وحده تدلّ على أنه سالب.' },
  { tex: '-a', answer: 2, why: 'الإشارة أمام الرمز $a$ تعني معاكس $a$ : نأخذ المعاكس مهما كان $a$ .' },
];
const ROLE_OPTIONS = ['علامة طرح', 'إشارة عدد سالب', 'معاكس عدد'];

export default function Module02Maarif() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const [, setRoles] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const record = (e) => setTrials((list) => [...list, e]);
  const tried = (a) => trials.some((t) => t.kind === 'square' && t.a === a);
  const both = tried(3) && tried(-3);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : « où s'arrête-t-il ? » et « un carré négatif ? » sont posées après la mission 1
  const asked = (...ids) => trials.some((e) => e.tk === 'checkpoint-done' && ids.includes(e.id));
  const recallPath = getLessonPath(RECALL_LESSON1.lesson);

  return (
    <ContentModule
      objectives={['هل يوجد عدد مربّعه سالب؟', 'ما $(-a)^2$ ؟', 'ما معاني الإشارة $-$ ؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — المربّع وأدوار الإشارة"
      moduleSubtitle="بطاقة تُوضع مرّتين، ثم ثلاثة أدوار"
      estimatedTime="12 دقيقة"
      brief={{
        tag: 'معارف', title: 'نسمّي ما وجدتَه', tone: 'violet',
        body: (
          <div className="space-y-3">
            <p>جرّب أوّلًا في المختبر أدناه، ثم أجب؛ كل خلاصة تظهر بعد السؤال.</p>
            <TextbookBox kind="remark" title={RECALL_LESSON1.title} text={RECALL_LESSON1.text} source={RECALL_LESSON1.source} compact>
              {recallPath && <Link to={recallPath} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>درس « جداء عددين نسبيين » — السنة الثالثة متوسط</Link>}
            </TextbookBox>
          </div>
        ),
      }}
      intro={<Manipulation type="robot-track" world={LAB.square.world} tasks={LAB.square.tasks} levels={false} onTrial={record} />}
      steps={[
        {
          num: 1, title: 'بطاقة تُوضع مرّتين', subtitle: 'a = 3 و a = −3', done: asked('q1'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <p data-evidence="sq" data-tried={asked('q1') ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${asked('q1') ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {asked('q1') ? <MathText>{'أجبتَ في المختبر: $1 \\times (-3) \\times (-3) = 9$ — البطاقة السالبة مرّتين أعادت الروبوت إلى الجهة الموجبة، ولا عدد نسبي مربّعه سالب.'}</MathText> : (both ? 'جرّبتَ العدد 3 والعدد −3: أكمل المهمة الأولى في المختبر أعلاه، وأجب عن الأسئلة التي تظهر فوقه.' : 'جرّب في المختبر أعلاه العدد 3 ثم العدد −3، ثم أكمل المهمة وأجب عن الأسئلة التي تظهر فوقه.')}
              </p>
              {asked('q1') && <KnowledgeBrick id="murabba" lead="البطاقة نفسها مرّتين: هل وجدتَ عددًا يوقف الروبوت في الجهة السالبة؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'هل يوجد عدد نسبي مربّعه سالب؟', subtitle: 'كل ما جرّبته', done: asked('q1'),
          content: (
            <div className="space-y-3">
              {asked('q1') && <TextbookBox kind="property" compact text={KNOWLEDGE.square.text} source={KNOWLEDGE.square.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'ماذا تعني الإشارة −؟', subtitle: 'ثلاثة أدوار', done: !!q.c,
          content: (
            <div className="space-y-3">
              {ROLES.map((r, i) => (
                <TapQuestion
                  key={r.tex}
                  prompt={<MathText>{`ما دور الإشارة $-$ في $${r.tex}$ ؟`}</MathText>}
                  options={ROLE_OPTIONS} correct={r.answer} cols={3} requires={['murabba']}
                  explain={<MathText>{r.why}</MathText>}
                  onAnswered={() => setRoles((s) => { const n = { ...s, [i]: true }; if (n[0] && n[1] && n[2]) setQ((x) => ({ ...x, c: true })); return n; })}
                />
              ))}
              {q.c && <KnowledgeBrick id="adwar" lead="الإشارة − تأتي بثلاثة معان: كيف نميّزها؟" />}
              {q.c && <TextbookBox kind="remark" compact text={KNOWLEDGE.roles.text} source={KNOWLEDGE.roles.source} />}
            </div>
          ),
        },
        {
          num: 4, title: 'ما قيمة $-a$ ؟', subtitle: 'حين يكون a سالبًا', done: !!q.d,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'إذا كان $a = -6$ فما قيمة $-a$ ؟'}</MathText>}
                expected={6} requires={['adwar']}
                explain={<MathText>{GUIDE.minusA.why}</MathText>}
                onAnswered={answered('d')}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
