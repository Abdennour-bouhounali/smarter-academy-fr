import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox, TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { BIG, OPENER } from '../content/textbook';
import { EX } from '../content/exercises';

/**
 * Module 5 — أتعمّق (p. 20) : المليون et المليار (deep-2), les distances des planètes à lire par classes (le manuel les
 * imprime avec des espaces irréguliers : on les regroupe d'abord), le plus petit / le plus grand nombre avec des chiffres
 * donnés (deep-1, deep-3 ①②), puis le système ROMAIN (deep-5) face à l'ouverture de l'unité (p. 7) : des symboles qui
 * valent la même chose partout — le contraste qui fait voir la numération de POSITION. LP : P1, P2.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module05AadadKabira() {
  const [done, setDone] = useState({});
  const [q1, setQ1] = useState(false);
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const nearest = [...BIG.planets].sort((a, b) => a.d - b.d);
  return (
    <ContentModule
      objectives={['كم صفرًا في المليون؟ وفي المليار؟', 'أقرأ مسافات الكواكب', 'لماذا تختلف الأرقام الرومانية عن أرقامنا؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="أعداد كبيرة"
      moduleSubtitle="من الألف إلى المليار"
      estimatedTime="8 دقائق"
      brief={{ tag: 'أتعمّق — الكتاب ص 20', title: 'أعداد كبيرة', tone: 'rose', body: <p>أعداد أكبر من كل ما كتبناه: مسافات الكواكب، ونظام عدّ آخر. أجب أوّلًا، ثم اقرأ التصحيح.</p> }}
      steps={[
        { num: 1, title: 'المليون والمليار', done: !!done['deep-2'],
          content: <div className="space-y-3"><TextbookExercise exercise={EX['deep-2']} requires={['fiaat']} onAnswered={mark('deep-2')} /><KnowledgeBrick id="malyun-milyar" /></div> },
        { num: 2, title: 'بُعد الكواكب عن الشمس', done: !!done['deep-2-planets'] && q1,
          content: (
            <div className="space-y-3">
              <TextbookExercise exercise={EX['deep-2-planets']} requires={['malyun-milyar']} onAnswered={mark('deep-2-planets')} />
              <TapQuestion
                prompt={<span>ب) رتّبنا الكواكب حسب بُعدها عن الشمس تصاعديًا. أيّها الأقرب بعد الأرض؟</span>}
                options={[M('المريخ'), M('المشتري'), M('الزّهرة')]}
                correct={0} cols={3} requires={['malyun-milyar']}
                explain={<MathText>{`الترتيب: ${nearest.map((p) => p.name).join(' ، ')}. بعد الأرض ($149\\,600\\,000$) يأتي المريخ ($227\\,900\\,000$).`}</MathText>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ) },
        { num: 3, title: 'أصغر عدد وأكبر عدد', done: !!done['deep-1'] && !!done['deep-3'],
          content: (
            <div className="space-y-3">
              <TextbookExercise exercise={EX['deep-1']} requires={['jadwal-maratib']} onAnswered={mark('deep-1')} />
              <TextbookExercise exercise={EX['deep-3']} requires={['jadwal-maratib']} onAnswered={mark('deep-3')} />
            </div>
          ) },
        { num: 4, title: 'نظام العدّ الروماني', done: !!done['deep-5'],
          content: (
            <div className="space-y-3">
              <TextbookBox kind="remark" text={OPENER.text} source={OPENER.source} compact />
              <TextbookExercise exercise={EX['deep-5']} requires={['qima-mawdi']} onAnswered={mark('deep-5')} />
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={5} variant="memo" />}
    />
  );
}
