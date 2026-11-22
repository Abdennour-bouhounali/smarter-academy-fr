import { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import InfoSorter from '../../../../../../common/components/InfoSorter';
import { TextbookBox, MethodSteps, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION, REMARKS, OPENER_STORY } from '../content/textbook';

/**
 * Module 7 — تحليل الوضعية (l'`integration` du manuel REDESSINÉE : la poursuite de Tipaza, 40 / 36 km/h, 2 km d'écart). Placé APRÈS les six وضعيات d'entraînement et juste avant le test.
 * Contrairement aux synthèses précédentes cette situation est analysée ET résolue (le plan : le manuel lui-même résout son intégration) ; le module 8 évalue une AUTRE situation (les deux
 * camions). Parcours : tri des données (trois utiles, deux inutiles), les cinq temps de l'analyse révélés un à un (inconnue, traduction, équation, vérification, conclusion), puis QUATRE
 * décisions qui reprennent les autres leçons de l'unité — la ligne d'arrivée (comparer 20 et 15), un arrondi à la minute (19,5 → 20), la distance (13 < 15) et la borne de l'écart par
 * une inégalité (10d ≤ 15). La « حكاية » (l'ouverture historique, réécrite) n'est montrée qu'après la dernière réponse. LP : P1, P2. Aucun labo (une synthèse n'en a pas).
 */
const analysisAsMethod = { exercise: SITUATION.text, source: SITUATION.source, solution: SITUATION.analysis.map((s) => `${s.label} : ${s.text}`) };
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module07TahlilWadiya() {
  const [sorted, setSorted] = useState(false);
  const [read, setRead] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  return (
    <ContentModule
      objectives={['أحلّل وضعية لحاق دراجتين: أختار المجهول وأترجم المعطيات بمعادلة وأحلّها وأتحقّق.', 'هل يلحق الدرّاج بمنافسه قبل خطّ الوصول؟', 'كيف أدوّر المدّة إلى الدقيقة وأحدّ الفارق بمتباينة؟']}
      ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="تحليل الوضعية" moduleSubtitle="ملاحقة في سباق تيبازة: متى يلحق رضا بياسين؟" estimatedTime="16 دقيقة"
      brief={{ tag: 'أدمج تعلّماتي — تحليل وضعية', headline: 'من يلحق بمن؟', emoji: '🚴', title: SITUATION.title, tone: 'amber', body: <p><MathText>{SITUATION.text}</MathText></p>, footer: <SourceTag source={SITUATION.source} /> }}
      steps={[
        { num: 1, title: 'ما المعطيات المفيدة؟', done: sorted,
          content: <div className="space-y-3"><p className="text-sm text-slate-700">اسحب كل معطى إلى «مفيد» أو «غير مفيد» لمعرفة متى يلحق رضا بياسين.</p><InfoSorter items={SITUATION.data} formative onSolved={() => setSorted(true)} /></div> },
        { num: 2, title: 'تحليل الوضعية وحلّها في خمسة أوقات', done: read,
          content: <MethodSteps method={analysisAsMethod} onAllRevealed={() => setRead(true)} /> },
        { num: 3, title: 'قبل خطّ الوصول؟', done: q1,
          content: (
            <TapQuestion
              prompt={<span>خطّ الوصول على بعد <MathText>{'$15\\ \\mathrm{km}$'}</MathText> من نقطة انطلاق رضا. هل يلحق رضا بياسين قبل الخطّ؟</span>}
              options={['لا: يلحق به بعد $20\\ \\mathrm{km}$ ، وهذا أكبر من $15\\ \\mathrm{km}$', 'نعم: لأنّ رضا أسرع من ياسين', 'نعم: لأنّ $\\frac{1}{2} < 15$', 'لا نستطيع الحكم'].map(M)}
              correct={0} cols={1} requires={['mutabayinat-amaliyat-3am', 'muadalat-darajat-ula-3am']}
              explain={<MathText>{REMARKS.finish}</MathText>}
              onAnswered={() => setQ1(true)} />
          ) },
        { num: 4, title: 'لو كان الفارق مختلفًا: التدوير', done: q2,
          content: (
            <TapQuestion
              prompt={<span>لو كان ياسين يسبق رضا بـ <MathText>{'$1{,}3\\ \\mathrm{km}$'}</MathText> فقط. ما مدّة اللحاق مدوّرة إلى الدقيقة؟</span>}
              options={['$4t = 1{,}3$ ، فـ $t = 0{,}325\\ \\mathrm{h} = 19{,}5\\ \\mathrm{min}$ ، أي $20\\ \\mathrm{min}$ بعد التدوير', '$4t = 1{,}3$ ، فـ $t = 0{,}325\\ \\mathrm{h} = 19{,}5\\ \\mathrm{min}$ ، أي $19\\ \\mathrm{min}$ بحذف ما بعد الفاصلة', '$t = 0{,}325\\ \\mathrm{min}$ ، أي أقلّ من دقيقة', '$76t = 1{,}3$ ، فـ $t \\approx 0{,}017\\ \\mathrm{h}$'].map(M)}
              correct={0} cols={1} requires={['hasr-adad-ushri-3am', 'muadalat-darajat-ula-3am']}
              explain={<MathText>{REMARKS.gapRound}</MathText>}
              onAnswered={() => setQ2(true)} />
          ) },
        { num: 5, title: 'والمسافة؟', done: q3,
          content: (
            <TapQuestion
              prompt={<MathText>{'في هذه الحالة (فارق $1{,}3\\ \\mathrm{km}$ ومدّة $0{,}325$ ساعة)، هل يلحق رضا بياسين قبل خطّ الوصول على $15\\ \\mathrm{km}$ ؟'}</MathText>}
              options={['نعم: يقطع $40 \\times 0{,}325 = 13\\ \\mathrm{km}$ وهو أقلّ من $15\\ \\mathrm{km}$', 'لا: لأنّ $0{,}325 < 15$', 'لا: لأنّ $13 > 1{,}3$', 'لا نستطيع الحكم'].map(M)}
              correct={0} cols={1} requires={['mutabayinat-amaliyat-3am']}
              explain={<MathText>{REMARKS.gapDistance}</MathText>}
              onAnswered={() => setQ3(true)} />
          ) },
        { num: 6, title: 'أكبر فارق يسمح باللحاق قبل الخطّ', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>ما أكبر فارق <MathText>{'$d$'}</MathText> (بالكيلومتر) يسمح لرضا باللحاق بياسين قبل خطّ الوصول على <MathText>{'$15\\ \\mathrm{km}$'}</MathText> ؟</span>}
                options={['$d \\le 1{,}5$ ، لأنّ المسافة المقطوعة $40 \\times \\frac{d}{4} = 10d$ يجب ألّا تتجاوز $15$', '$d \\ge 1{,}5$', '$d \\le 15$ ، لأنّ المسافة تساوي الفارق', '$d \\le 0{,}6$'].map(M)}
                correct={0} cols={1} requires={['mutabayinat-amaliyat-3am']}
                explain={<MathText>{REMARKS.gapBound}</MathText>}
                onAnswered={() => setQ4(true)} />
              {q4 && <TextbookBox kind="remark" title="حكاية" text={OPENER_STORY.text} compact />}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={7} variant="memo" />} />
  );
}
