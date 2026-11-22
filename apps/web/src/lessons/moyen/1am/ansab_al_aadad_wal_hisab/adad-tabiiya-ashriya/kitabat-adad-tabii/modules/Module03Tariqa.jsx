import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { MethodSteps, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, LAB } from '../content/textbook';

/**
 * Module 3 — طريقة de la plateforme (déclarée) « رقم المرتبة وعدد وحداتها », sur l'exercice 2 du manuel (p. 17) : 1345 DA
 * échangés en billets de 100 DA. UNE SEULE PISTE (LESSON_DEVELOPMENT_GUIDE §4quater) : le MÊME instrument que le module 1,
 * monde `money`, posé seul (levels={false}) EN HAUT — il porte le contexte et la question ; puis « combien de billets ? »
 * sur ce que l'élève a ouvert, la solution ligne à ligne, et la méthode (brique gardée par « أتوقّع القاعدة »). LP : P2.
 * Déploiement du prototype (2026-10-28) : « combien de billets ? » et « d'où viennent les dix autres ? » sont posées PAR-DESSUS le labo
 * (`RankExchange › CHAINS.unpack`) ; l'étape 1 en garde la TRACE (événement `checkpoint-done`).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [read, setRead] = useState(false);
  const [trials, setTrials] = useState([]);
  const record = (e) => setTrials((list) => [...list, e]);
  const q1 = trials.some((e) => e.tk === 'checkpoint-done' && e.id === 'unpack');
  const [q2, setQ2] = useState(false);
  return (
    <ContentModule
      objectives={['كم ورقة من 100 دج في 1345 دج؟', 'كيف نقرأ عدد المئات مباشرة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — رقم المرتبة وعدد وحداتها"
      moduleSubtitle="حصّالة يونس"
      estimatedTime="8 دقائق"
      intro={<Manipulation type="rank-exchange" world="money" tasks={['unpack']} n={LAB.money.n} rank={LAB.money.rank} levels={false} onTrial={record} />}
      steps={[
        { num: 1, title: 'من أين جاءت الأوراق العشر الأخرى؟', subtitle: 'بعد أن فتحتَ الأوراق', done: q1,
          content: (
            <div className="space-y-3">
              <p data-evidence="unpack" data-tried={q1 ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${q1 ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {q1
                  ? <span>أجبتَ في المختبر: فتحتَ ورقة الألف فصارت 10 أوراق من 100 دج، فأخذتَ <bdi dir="ltr">{LAB.money.notes}</bdi> ورقة مع أنّ رقم المئات 3 — <MathText>{'$1345 = 13 \\times 100 + 45$'}</MathText> .</span>
                  : 'افتح الأوراق في المختبر حتى تصير كلّها من 100 دج أو أقل، وأجب عن الأسئلة التي تظهر فوقه.'}
              </p>
            </div>
          ) },
        { num: 2, title: 'هل نستطيع أن نقرأ 13 دون أن نفتح شيئًا؟', subtitle: 'عدد المئات', done: q2,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD} onAllRevealed={() => setRead(true)} />
              <SourceTag source={METHOD.source} />
              {read && <KnowledgeBrick id="raqm-adad" lead="13 ، و 1345: ماذا حذفنا من الكتابة لنقرأ 13؟" />}
              <TapQuestion
                prompt={<span>عدد المئات في العدد <bdi dir="ltr">2017</bdi> هو:</span>}
                options={[M('20'), M('0'), M('2')]}
                correct={0} cols={3} requires={['raqm-adad']}
                explain={<MathText>{'نحذف الرقمين 1 و 7 اللذين على يمين المئات: 20. $2017 = 20 \\times 100 + 17$.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
