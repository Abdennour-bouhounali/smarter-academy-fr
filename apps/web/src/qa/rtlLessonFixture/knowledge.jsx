import MathText from '../../lessons/common/components/MathText';

/**
 * Les connaissances de la SURFACE DE QA — même forme qu'un knowledge.jsx de
 * leçon, pour que la carte des connaissances soit exercée telle qu'elle est.
 *
 * Le contenu est technique et générique : il sert à vérifier que l'arabe, les
 * mathématiques latines et les catégories de la carte se rendent correctement
 * de droite à gauche. Ce n'est PAS du contenu pédagogique, et rien ici ne
 * prétend enseigner quoi que ce soit — voir fixture.config.js.
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'qa-inline-math',
        type: 'vocabulaire',
        title: 'تعبير رياضي داخل النص',
        summary: 'التعبير يُقرأ من اليسار إلى اليمين داخل جملة عربية.',
        body: (
          <div className="space-y-3">
            <p>
              الجملة العربية تُقرأ من اليمين إلى اليسار، بينما التعبير
              <MathText>{' $3x + 5 = 17$'}</MathText> يبقى من اليسار إلى اليمين.
            </p>
            <p className="text-xs text-slate-500">
              هذا ما يجب التحقق منه بصريًا: موضع التعبير داخل الجملة، واتجاهه.
            </p>
          </div>
        ),
      },
      {
        id: 'qa-block-math',
        type: 'formule',
        title: 'تعبير كتلي',
        summary: 'التعبير الكتلي يُعرض في سطر مستقل، بمحاذاة مركزية.',
        body: (
          <div className="space-y-3">
            <MathText>{'$$\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$$'}</MathText>
            <p className="text-xs text-slate-500">
              الكسر، الجذر <MathText>{'$\\sqrt{2}$'}</MathText> والأس
              <MathText>{' $x^2$'}</MathText> داخل فقرة عربية.
            </p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'qa-figures',
        type: 'methode',
        title: 'الرسوم والمحاور',
        summary: 'المعلم والجداول تبقى بالاتجاه الطبيعي للرياضيات.',
        body: (
          <div className="space-y-3">
            <p>
              محور الفواصل يتزايد نحو اليمين، ولا يُعكس مع اتجاه الصفحة.
            </p>
            <p className="text-xs text-slate-500">
              التحقق: تسميات المحاور، تموضع الأرقام، وعدم تداخل العناصر.
            </p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'qa-progress',
        type: 'regle',
        title: 'التقدّم والتنقّل',
        summary: 'شريط التقدّم وأزرار التنقّل تتبع اتجاه القراءة.',
        body: (
          <p>
            زرّ «التالي» يشير إلى جهة القراءة التالية، أي إلى اليسار في صفحة
            عربية.
          </p>
        ),
      },
    ],
  },
};
