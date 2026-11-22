import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD_EXPAND } from '../content/textbook';

/**
 * Module 3 — طريقة « أنشر وأبسّط » (P1, P2, P4). UNE SEULE PISTE (guide §4quater) : le MÊME labo que le module 1, posé SEUL en haut
 * (`levels={false}`, monde `arrows`) — l'expression est écrite sur le tableau, la main trace les flèches rouges du facteur vers chaque terme
 * de l'autre parenthèse et décide le SIGNE de chaque produit (la valeur du produit refuse un mauvais signe), puis réunit les termes
 * semblables. Puis l'élève répond sur ce qu'il a fait, lit la méthode ligne à ligne, puis la brique (gardée par « أتوقّع القاعدة »), puis un
 * transfert. Les tâches du labo sont celles de `logic/areaSplit.js › ARROW_TASKS` (5(x + 2), −3(x − 4), (2x + 1)(x − 3), 3(2 − x) − 4(x − 1)) ;
 * la méthode revue est 3(2 − 5x) − 4(x − 1) + x(7 − 2x), et le transfert (2x + 3)(5 − x).
 * Déploiement du prototype (2026-10-28) : les questions sur ce que l'élève a FAIT sont posées PAR-DESSUS le labo après chaque tâche
 * (`AreaSplit › chainOf`, la règle clôt la dernière) ; les étapes en gardent la TRACE (`checkpoint-done`) puis posent les noms.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [trials, setTrials] = useState([]);
  const [read, setRead] = useState(false);
  const [q3, setQ3] = useState(false);
  const record = (e) => setTrials((list) => [...list, e]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de sa tâche l'est
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['كيف أعرف إشارة كل جداء؟', 'كم سهمًا أرسم؟', 'ما خطوات النشر والتبسيط؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أنشر وأبسّط"
      moduleSubtitle="أسهم حمراء وإشارات"
      estimatedTime="14 دقيقة"
      intro={<Manipulation type="area-split" levels={false} world="arrows" onTrial={record} />}
      steps={[
        {
          num: 1, title: 'لماذا خرج الجداء موجبًا؟', subtitle: 'إشارة كل جداء', done: answered('a2'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="neg" ok={answered('a2')}
                done={<MathText>{'أجبتَ في المختبر: السهم من $-3$ إلى $-4$ أعطى $+12$ ، لأنّ جداء عددين سالبين موجب: $-3(x-4)=-3x+12$ .'}</MathText>}
                todo="في العبارة الثانية ارسم الأسهم وقرّر إشارة كل جداء، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('a2') && <KnowledgeBrick id="ishara-jidaa" lead="كل سهم له جداء: كيف عرفتَ إشارته؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'كم سهمًا رسمتَ ولماذا؟', subtitle: 'كل حدّ مع كل حدّ', done: answered('a3'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="arrows" ok={answered('a3')}
                done={<MathText>{'أجبتَ في المختبر: أربعة أسهم في $(2x+1)(x-3)$ ، حدّان في حدّين، ثم $2x^2-5x-3$ .'}</MathText>}
                todo="في العبارة الثالثة ارسم الأسهم الأربعة، وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 3, title: 'الطريقة سطرًا سطرًا', subtitle: 'ثم مثال جديد', done: q3,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD_EXPAND} onAllRevealed={() => setRead(true)} />
              {read && <KnowledgeBrick id="tariqat-nashr" lead="النشر ثم الجمع ثم الترتيب: ما الترتيب الذي اتّبعتَه؟" />}
              <TapQuestion
                prompt={<MathText>{String.raw`انشر وبسّط العبارة $B=(2x+3)(5-x)$.`}</MathText>}
                options={[M('$-2x^2+7x+15$'), M('$-2x^2+13x+15$'), M('$2x^2+7x+15$')]}
                correct={0} cols={3} requires={['tariqat-nashr']}
                explain={<MathText>{'$10x-2x^2+15-3x=-2x^2+7x+15$. ونراقب عند $x=1$ : $(2+3)(5-1)=20$ و $-2+7+15=20$.'}</MathText>}
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
