import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookBox, SourceTag, PairQuestion } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOW3B, KNOW_EQUAL, MISTAKES, PLATFORM_SOURCE } from '../content/textbook';
import { FIG_KNOW_EQUAL } from '../content/figures';

/**
 * Module 2 — معارف 3 ب (p. 142) et جـ (p. 144). Rétrofit 2026-10-15 (§4quater) : module sans labo → la première question d'abord ;
 * les rappels (qanun-murakkibatayn, tasawi-murakkibat) et les exemples du livre viennent APRÈS la réponse (`{qN && …}`) ; la carte du haut dit
 * seulement ce qu'est le module, sans énoncer la règle.
 *   1. UNDERSTAND : un calcul avec des négatifs, PUIS la propriété (brique qanun-murakkibatayn) et son exemple décimal ;
 *   2. TOUCH THE MATH : la soustraction à l'envers (MISTAKES.reversed) et « composantes ≠ coordonnées de B » ;
 *   3. FORMALIZE : l'égalité par les composantes (brique tasawi-murakkibat), l'exemple 2 DESSINÉ par la plateforme ;
 *   4. l'égalité qui ne dépend pas de la position : un vecteur égal construit depuis un autre point.
 * LP : P1 (1–2), P2 (3–4).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — حساب المركبتين وتساوي شعاعين"
      moduleSubtitle="ما فعلته بالبوابات، يكتبه الكتاب خاصيتين"
      objectives={['كيف يكتب الكتاب ما وجدته على الخريطة؟', 'أين يقع الخطأ الشائع عند طرح الإحداثيات؟', 'هل تتعلّق المساواة بموضع الشعاع؟']} estimatedTime="8 دقائق"
      brief={{
        tag: 'معارف — الكتاب ص 142 و 144', title: KNOW3B.title, tone: 'violet',
        body: <p>أربعة أسئلة على ما فعلته بالبوابات، وبعد كل جواب تقرأ ما يكتبه الكتاب في خانة «معارف».</p>,
      }}
      steps={[
        {
          num: 1, title: 'معارف 3 ب', subtitle: 'حساب مركبتي شعاع', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span><MathText>{'$K(-1\\,;\\,2)$ و $L(3\\,;\\,-4)$ . مركبتا $\\overrightarrow{KL}$ :'}</MathText> <SourceTag source={PLATFORM_SOURCE} /></span>}
                options={[
                  '$\\begin{pmatrix} 4 \\\\ -6 \\end{pmatrix}$',
                  '$\\begin{pmatrix} -4 \\\\ 6 \\end{pmatrix}$', // K − L : à l'envers (MISC-MAALAM-TARH-MAQLUB)
                  '$\\begin{pmatrix} 2 \\\\ -2 \\end{pmatrix}$', // x_L + x_K : addition au lieu de soustraction
                  '$\\begin{pmatrix} 3 \\\\ -4 \\end{pmatrix}$', // les coordonnées de L (MISC-MAALAM-IHDATHIYAT-MURAKKIBAT)
                ].map(M)}
                correct={0}
                cols={4}
                requires={['farq-ihdathiyat']}
                explain={<MathText>{'$x_L - x_K = 3 - (-1) = 4$ و $y_L - y_K = -4 - 2 = -6$ .'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : la règle a été écrite puis posée au module 1 (farq-ihdathiyat) ; ici le livre la NOMME, après la réponse. */}
              {q1 && (
                <>
                  <p className="text-sm text-slate-600"><MathText>{KNOW3B.intro}</MathText></p>
                  <KnowledgeBrick id="qanun-murakkibatayn" variant="rappel" lead="معارف 3 ب، كما في الكتاب:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'خطأ شائع', subtitle: 'المبدأ ناقص النهاية', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{`كتب تلميذ: «${MISTAKES.reversed.wrong}». ما رأيك؟`}</MathText>}
                options={[
                  MISTAKES.reversed.why,
                  'صحيح: الطرح في أي اتجاه يعطي نفس الشعاع', // l'ordre change les signes
                  'صحيح إذا كانت كل الإحداثيات موجبة', // le sens dépend de l'ordre, pas des signes
                ].map(M)}
                correct={0}
                cols={1}
                requires={['farq-ihdathiyat']}
                explain={<MathText>{MISTAKES.reversed.right}</MathText>}
                onAnswered={() => setQ2a(true)}
              />
              {q2a && (
                <TapQuestion
                  prompt={<span><MathText>{'$R(2\\,;\\,7)$ و $S(5\\,;\\,9)$ . أيّ عبارة صحيحة؟'}</MathText> <SourceTag source={PLATFORM_SOURCE} /></span>}
                  options={[
                    '$\\overrightarrow{RS}\\begin{pmatrix} 3 \\\\ 2 \\end{pmatrix}$ ، أما $\\begin{pmatrix} 5 \\\\ 9 \\end{pmatrix}$ فهما إحداثيتا S',
                    '$\\overrightarrow{RS}\\begin{pmatrix} 5 \\\\ 9 \\end{pmatrix}$ لأن S هي النهاية', // MISC-MAALAM-IHDATHIYAT-MURAKKIBAT
                    '$\\overrightarrow{OS}\\begin{pmatrix} 3 \\\\ 2 \\end{pmatrix}$', // OS a pour composantes les coordonnées de S
                  ].map(M)}
                  correct={0}
                  cols={1}
                  requires={['qanun-murakkibatayn']}
                  explain={<MathText>{`$5 - 2 = 3$ و $9 - 7 = 2$ . ${MISTAKES.coords}`}</MathText>}
                  onAnswered={() => setQ2(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'معارف جـ', subtitle: 'الشعاعان المتساويان', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span><MathText>{'$E(-2\\,;\\,1)$ ، $F(1\\,;\\,5)$ ، $G(0\\,;\\,-3)$ ، $H(3\\,;\\,1)$ . الشعاعان $\\overrightarrow{EF}$ و $\\overrightarrow{GH}$ :'}</MathText> <SourceTag source={PLATFORM_SOURCE} /></span>}
                options={[
                  'متساويان: لكل منهما المركبتان 3 و 4',
                  'غير متساويين لأن E و G مختلفتان', // l'égalité ne dépend pas de l'origine
                  'غير متساويين لأن $y_F \\neq y_H$', // on compare les composantes, pas les coordonnées
                ].map(M)}
                correct={0}
                cols={1}
                requires={['farq-ihdathiyat']}
                explain={<MathText>{'$\\overrightarrow{EF}\\begin{pmatrix} 1 + 2 \\\\ 5 - 1 \\end{pmatrix}$ و $\\overrightarrow{GH}\\begin{pmatrix} 3 - 0 \\\\ 1 + 3 \\end{pmatrix}$ : نفس المركبتين $\\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$ ، إذن $\\overrightarrow{EF} = \\overrightarrow{GH}$ .'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <>
                  {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : « نفس المركبتين ⇔ متساويان » est posé au module 1 (farq-ihdathiyat, DE = CF). */}
                  <KnowledgeBrick id="tasawi-murakkibat" variant="rappel" lead="معارف جـ، كما في الكتاب:" />
                  <p className="text-sm"><MathText>{KNOW_EQUAL.example1}</MathText> <span className="text-slate-500">{KNOW_EQUAL.example1Note}</span></p>
                  <TextbookBox kind="example" text={KNOW_EQUAL.example2} source={KNOW_EQUAL.source} compact />
                  <GeoFigure {...FIG_KNOW_EQUAL} />
                </>
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'شعاع مساو من نقطة أخرى', subtitle: 'المساواة لا تتعلّق بالموضع', done: q4,
          content: (
            <div className="space-y-3">
              <PairQuestion
                prompt={<span><MathText>{'$\\vec{u}\\begin{pmatrix} -2 \\\\ 5 \\end{pmatrix}$ و $M(4\\,;\\,-1)$ . إحداثيتا النقطة N حيث $\\overrightarrow{MN} = \\vec{u}$ :'}</MathText> <SourceTag source={PLATFORM_SOURCE} /></span>}
                expected={{ x: '2', y: '4' }}
                explain={'$x_N - 4 = -2$ و $y_N - (-1) = 5$ ، أي $x_N = 2$ و $y_N = 4$ .'}
                requires={['tasawi-murakkibat']}
                onAnswered={() => setQ4(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
