import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import SpaceFigure from '../../../../../../common/components/SpaceFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { SourceTag, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOW1, MISTAKES } from '../content/textbook';
import { FIG_KNOW1_MPQ, FIG_KNOW1_DIAMETERS, FIG_KNOW1_CIRCLES } from '../content/figures';

/**
 * Module 2 — معارف 1 (p. 166) « الكُرة و الجلّة ».
 * FORMALIZE : 1) les deux تعاريف (briques tarif-kura, tarif-julla) et l'exemple (δ) / (β) avec M, P, Q (figure REDESSINÉE : le
 * manuel dessine un « œuf ») ; 2) les أقطار [NS], [N′S′], [N₁S₁] de même milieu O, longueur 2R (brique aqtar) ; 3) la دائرة qui
 * tourne autour d'un قطر (brique tawlid) ; 4) les دوائر كبرى / صغرى (brique dawair ; figure 2 redessinée). LP : P1, P2.
 * Rétrofit 2026-10-15 (§4quater) : module sans labo, donc la carte du haut dit seulement ce qu'est le module (aucun fait) ; dans chaque
 * étape la QUESTION vient d'abord (la figure et la sonde du module 1 suffisent), la brique qui NOMME vient après la réponse
 * (`{qN && <KnowledgeBrick/>}`) ; l'étape 4 demande d'abord comment se compare le rayon d'un cercle de centre O₁, avant d'en donner les noms.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const BELONGS = ['إلى $(\\delta)$ و إلى $(\\beta)$', 'إلى $(\\beta)$ فقط', 'لا إلى $(\\delta)$ ولا إلى $(\\beta)$'];

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q4a, setQ4a] = useState(false);

  return (
    <ContentModule
      objectives={["كيف نعرّف الكرة والجلة بالمسافة إلى المركز؟", "ماذا نسمّي القطع التي تمرّ بالمركز؟", "ما الدائرة الكبرى وما الدائرة الصغرى؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleTitle="معارف — الكرة والجلة"
      moduleNumber={2}
      moduleSubtitle="ما وجدته بالمسبار، بكلمات الكتاب"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف — الكتاب ص 166', title: KNOW1.title, tone: 'violet',
        body: <p>أربع فقرات من الكتاب تضع كلمات على ما فعلته في المسبار: تعريفان، ثم أسماء لعناصر الكرة. أجب أولا بما رأيته، ثم اقرأ الاسم.</p>,
        footer: <SourceTag source={KNOW1.source} />,
      }}
      steps={[
        {
          num: 1, title: 'تعريفا الكرة والجلة', subtitle: 'ومثال الكتاب', done: q1,
          content: (
            <div className="space-y-3">
              <SpaceFigure {...FIG_KNOW1_MPQ} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'على الشكل، $(\\delta)$ الكرة و $(\\beta)$ الجلة اللتان مركزهما O ونصف قطرهما R. تنتمي النقطة:'}</MathText></p>}
                rows={[
                  // M sur la كرة : elle est AUSSI dans la جلة (OM ≤ R)
                  { id: 'm', label: <MathText>{'M حيث $OM = R$'}</MathText>, options: BELONGS.map(M), correct: 0, correction: <MathText>{'$OM = R$ : M من الكرة، و $OM \\le R$ فهي من الجلة أيضا.'}</MathText> },
                  // P à l'intérieur (MISC-KURA-JULLA)
                  { id: 'p', label: <MathText>{'P حيث $OP < R$'}</MathText>, options: BELONGS.map(M), correct: 1, correction: <MathText>{MISTAKES.julla.right}</MathText> },
                  { id: 'q', label: <MathText>{'Q حيث $OQ > R$'}</MathText>, options: BELONGS.map(M), correct: 2, correction: <MathText>{'$OQ > R$ : Q ليست من الكرة ولا من الجلة.'}</MathText> },
                ]}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: كل نقطة من الكرة هي نقطة من الجلة، والعكس غير صحيح.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="tarif-kura" lead="الكرة: السطح الأجوف وحده." />}
              {q1 && <KnowledgeBrick id="tarif-julla" lead="الجلة: السطح وكل ما بداخلها." />}
              {q1 && <TextbookBox kind="example" text={KNOW1.example} source={KNOW1.source} compact />}
            </div>
          ),
        },
        {
          num: 2, title: 'أقطار الكرة', subtitle: 'لها نفس المنتصف O', done: q2,
          content: (
            <div className="space-y-3">
              <SpaceFigure {...FIG_KNOW1_DIAMETERS} />
              <TapQuestion
                prompt={<MathText>{'كرة السلّة في ملعب الحي نصف قطرها $12\\,\\mathrm{cm}$ . طول قطرها هو:'}</MathText>}
                options={[
                  '$24\\,\\mathrm{cm}$',
                  // le rayon pris pour le diamètre (MISC-KURA-QUTR)
                  '$12\\,\\mathrm{cm}$',
                  // la moitié au lieu du double
                  '$6\\,\\mathrm{cm}$',
                ].map(M)}
                correct={0}
                cols={3}
                explain={<MathText>{'القطر قطعة منتصفها المركز O وطرفاها على الكرة: طوله $2R = 2 \\times 12 = 24\\,\\mathrm{cm}$ .'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="aqtar" lead="ثلاثة أقطار، ومنتصف واحد:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'دائرة تدور حول قطرها', subtitle: 'ملاحظة', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'في مدينة الألعاب، لافتة دائرية مركزها O ونصف قطرها $80\\,\\mathrm{cm}$ تدور بسرعة حول أحد أقطارها. الشكل الذي «نراه» هو:'}</MathText>}
                options={[
                  'كرة مركزها O ونصف قطرها $80\\,\\mathrm{cm}$',
                  // le diamètre pris pour le rayon (MISC-KURA-QUTR)
                  'كرة مركزها O ونصف قطرها $160\\,\\mathrm{cm}$',
                  // une rotation qui « garde » le disque
                  'دائرة مركزها O ونصف قطرها $80\\,\\mathrm{cm}$ لا غير',
                ].map(M)}
                correct={0}
                cols={1}
                explain={<MathText>{KNOW1.noteRotation}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="tawlid" lead="كيف «تولد» الكرة:" />}
            </div>
          ),
        },
        {
          num: 4, title: 'الدوائر الكبرى والصغرى', subtitle: 'ملاحظات', done: q4,
          content: (
            <div className="space-y-3">
              <SpaceFigure {...FIG_KNOW1_CIRCLES} />
              <TapQuestion
                prompt={<MathText>{'على الشكل دائرة مرسومة على الكرة، مركزها $O_1$ يختلف عن $O$ . كيف يقارن نصف قطرها بنصف قطر الكرة $R$ ؟'}</MathText>}
                options={[
                  'أصغر من $R$ : مستوي الدائرة لا يمرّ بالمركز $O$',
                  // la corde prise pour le rayon (MISC-KURA-DAIRA-KUBRA)
                  'يساوي $R$ دائما، مهما كان مركز الدائرة',
                  'أكبر من $R$ : الدائرة محيطة بالكرة',
                ].map(M)}
                correct={0}
                cols={1}
                explain={<MathText>{'دائرة على الكرة مركزها $O_1$ غير $O$ تقطعها بمستوٍ لا يمرّ بمركزها: نصف قطرها أصغر من $R$ .'}</MathText>}
                onAnswered={() => setQ4a(true)}
              />
              {q4a && <KnowledgeBrick id="dawair" lead="دوائر على الكرة، ونوعان:" />}
              {q4a && <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">على الشكل، الكرة مركزها O ونصف قطرها R:</p>}
                rows={[
                  { id: 'eq', label: 'الدائرة الأفقية التي مركزها O', options: ['دائرة كبرى', 'دائرة صغرى'], correct: 0, correction: 'مركزها O ونصف قطرها R: دائرة كبرى.' },
                  // un méridien : son plan contient O (MISC-KURA-DAIRA-KUBRA)
                  { id: 'mer', label: 'الدائرة التي تمر بـ N و S', options: ['دائرة كبرى', 'دائرة صغرى'], correct: 0, correction: 'مستويها يشمل [NS] فيشمل O: مركزها O، دائرة كبرى.' },
                  { id: 'small', label: <MathText>{'الدائرة التي مركزها $O_1$'}</MathText>, options: ['دائرة كبرى', 'دائرة صغرى'], correct: 1, correction: <MathText>{MISTAKES.great.right}</MathText> },
                ]}
                requires={['dawair']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: المركز يقرّر — O للكبرى، نقطة أخرى للصغرى.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ4(true)}
              />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
