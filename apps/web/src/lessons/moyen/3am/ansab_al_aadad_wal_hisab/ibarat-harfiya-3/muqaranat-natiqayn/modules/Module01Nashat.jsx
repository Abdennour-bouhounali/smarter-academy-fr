import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : le galvanomètre du labo de physique. UNE SEULE PISTE (§4quater) : le labo `difference-meter` en haut,
 * sans carte au-dessus — il porte son contexte et SA question ; la main branche la sonde rouge et la noire sur deux perles et lit une aiguille. La règle n'est jamais dite : elle se lit sur l'aiguille.
 *   مبتدئ — d1 5/4 et 3/4, d2 −3/2 et −1/2 (l'échange), d3 9/11 et 13/16 (0,85 px) ;  متقدم — volet d'écriture (d4, d5), rideau (d6 : a − b = −0,3).
 * Les ÉTAPES interrogent ce que l'élève a FAIT, avec SES essais : le côté de l'aiguille (P1), l'échange des sondes (P1), deux perles qui se recouvrent (P2), l'ordre lu sur la différence seule (P1, P2).
 * Les noms (briques) viennent APRÈS la réponse. Le نشاط 5 du manuel est posé en application au module 4.
 * Déploiement du prototype (2026-10-28) : ces questions sont posées PAR-DESSUS le labo après chaque tâche (`DifferenceMeter › chainOf`, la règle
 * clôt d3 et d6) ; les étapes en gardent la TRACE (`checkpoint-done`) puis posent les noms.
 */
export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
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
      objectives={['أكتشف أنّ إشارة الفرق a − b تحدّد ترتيب العددين a و b']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — مقياس الفرق"
      moduleSubtitle="أصل المجسّين وأقرأ الإبرة"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="difference-meter" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="difference-meter" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'متى مالت الإبرة إلى اليمين؟', subtitle: 'جهة الإبرة', done: answered('d1'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="d1" ok={answered('d1')}
                done={<MathText>{'أجبتَ في المختبر: المجسّ الأحمر على $\\frac54$ والأسود على $\\frac34$ ، فقرأت الإبرة $\\frac12$ إلى اليمين، و $\\frac54>\\frac34$ .'}</MathText>}
                todo="صِل المجسّين في الزوج الأوّل على السكّة، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('d1') && <KnowledgeBrick id="ishara-farq" lead="الإبرة مالت يمينًا: ماذا كان تحت المجسّ الأحمر؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ماذا حدث حين بدّلتَ المجسّين؟', subtitle: 'الجهة والترتيب', done: answered('d2'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="d2" ok={answered('d2')}
                done={<MathText>{'أجبتَ في المختبر: بدّلتَ المجسّين فصارت القراءة $1$ بعد $-1$ ، والحبّتان في مكانهما: $-\\frac32<-\\frac12$ في الحالتين.'}</MathText>}
                todo="في الزوج الثاني بدّل المجسّين، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('d2') && <KnowledgeBrick id="ibdal-mujassayn" lead="الإبرة عبرت الصفر والحبّتان ثابتتان: ماذا تغيّر وماذا لم يتغيّر؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'حبّتان لا تفصلهما العين', subtitle: 'الإبرة تحسم', done: answered('d3'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="d3" ok={answered('d3')}
                done={<MathText>{'أجبتَ في المختبر: الحبّتان $\\frac9{11}$ و $\\frac{13}{16}$ متراكبتان، والإبرة قرأت $\\frac1{176}$ موجبًا، إذن $\\frac9{11}>\\frac{13}{16}$ .'}</MathText>}
                todo="أنهِ الزوج الثالث (الحبّتان المتراكبتان)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('d3') && <KnowledgeBrick id="farq-wahdahu" lead="الحبّتان متراكبتان ومع ذلك حسمتِ الإبرة: ما الذي كفى؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'بلا حبّتين: الفرق وحده', subtitle: 'الستارة', done: answered('d6'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="d6" ok={answered('d6')}
                done={<MathText>{'أجبتَ في المختبر: خلف الستارة رأيتَ فقط $a-b=-0{,}3$ ، فحكمتَ $a<b$ دون أن ترى الحبّتين.'}</MathText>}
                todo="في المستوى المتقدّم أنهِ المهمة السادسة (الستارة)، وأجب عن أسئلتها فوق المختبر." />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
