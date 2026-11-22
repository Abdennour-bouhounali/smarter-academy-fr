/**
 * « ورقة رقيّة » — la DERNIÈRE étape du module 7 « وضعية الوحدة » (la synthèse de l'unité 2 dans le lecteur de mission, 2026-11-12 ; recette de
 * la synthèse, point 5). La camarade est inventée (KidFigure, en tenue islamique) ; son prénom n'est porté par AUCUNE autre « ورقة زميل » de la
 * plateforme (content/mission.test.js).
 * Ce n'est PAS une solution : c'est un PLAN, en mots, SANS aucun nombre. Son erreur est une erreur de JUSTIFICATION — « la longueur est le double
 * de la largeur, donc il suffit de doubler la largeur ARRONDIE » : doubler une valeur arrondie double aussi l'erreur d'arrondi, et le dernier chiffre
 * de la longueur peut changer ; on calcule les deux valeurs exactes, puis on arrondit chacune à la fin. Les autres lignes sont justes.
 */
export const PEER_KID = { name: 'رقيّة', figure: { hairStyle: 'hijab', scarf: 'sky', outfit: 'teal' } };

export const PEER_SHEET = {
  id: 'm7-ruqayya',
  task: 'خطّة رقيّة لإيجاد بُعدي الزربية مدوّرين إلى السنتيمتر:',
  lines: [
    'أسمّي عرض الزربية ℓ، فطولها ضعف ℓ، ومساحتها جداء الطول في العرض.',
    'أكتب المعادلة وأحلّها، وأحتفظ بالحلّ الموجب وحده لأنّ العرض طول.',
    'أدوّر العرض إلى السنتيمتر، ثم أضاعف هذه القيمة المدوّرة لأجد الطول، لأنّ الطول ضعف العرض.',
    'أكتب البعدين بالسنتيمتر.',
  ],
  errorLine: 2,
  fixes: [
    { text: 'أحسب القيمة المضبوطة للطول، ضعفَ القيمة المضبوطة للعرض، ثم أدوّر كل بُعد منهما في النهاية فقط.', ok: true },
    { text: 'أدوّر الطول أوّلًا، ثم أقسمه على اثنين لأجد العرض.', why: 'هي الفكرة نفسها مقلوبة: قسمة قيمة مدوّرة تنقل خطأ التدوير إلى العرض.' },
    { text: 'لا أدوّر أبدًا: أكتب البعدين بالقيمة المضبوطة فقط.', why: 'الوضعية تطلب البعدين مدوّرين إلى السنتيمتر: نحسب القيم المضبوطة ثم ندوّر في النهاية.' },
  ],
  why: 'الطول ضعف العرض بالقيم المضبوطة، لا بالقيم المدوّرة: مضاعفة قيمة مدوّرة تضاعف خطأ التدوير، وقد يتغيّر الرقم الأخير من الطول. نحسب القيمتين المضبوطتين، ثم ندوّر كلًّا منهما في النهاية.',
};
