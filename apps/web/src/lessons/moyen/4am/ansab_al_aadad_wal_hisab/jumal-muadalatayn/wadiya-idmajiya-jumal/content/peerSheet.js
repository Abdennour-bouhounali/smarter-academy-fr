/**
 * « ورقة عائشة » — la DERNIÈRE étape du module 7 « وضعية الوحدة » (la synthèse de l'unité 5 dans le lecteur de mission, 2026-11-12 ; recette de
 * la synthèse, point 5). La camarade est inventée (KidFigure, en tenue islamique) ; son prénom n'est porté par AUCUNE autre « ورقة زميل » de la
 * plateforme (content/mission.test.js) ni par la distribution de l'unité (verdict X1).
 * Le fichier ne s'appelle PAS `peerSheet.js` : `_unit/missionStrings.test.js` n'admet dans l'unité que les trois feuilles des leçons (une
 * ligne à ajouter par l'intégrateur pour la synthèse — rapport du constructeur).
 * Ce n'est PAS une solution : c'est un PLAN, en mots, SANS aucun nombre. Son erreur est une erreur de JUSTIFICATION — la vérification faite sur
 * la seule équation simplifiée (« مجموع السعرين ») : des couples sans nombre la vérifient (le leurre (35 ; 40) du défi en est un). Les lignes
 * d'avant restent justes ; la ligne fautive est la dernière (pas de `fixedLines`).
 */
export const PEER_KID = { name: 'عائشة', figure: { hairStyle: 'hijab', scarf: 'sand', outfit: 'teal' } };

export const PEER_SHEET = {
  id: 'm7-aisha',
  task: 'خطّة عائشة لإيجاد سعر علبة العصير وسعر قطعة الحلوى في وضعية الحفل:',
  lines: [
    'أسمّي $x$ سعر علبة العصير و $y$ سعر قطعة الحلوى، بالدينار.',
    'أترجم كل معلومة عن مبلغ بمعادلة: عدد كل شيء في سعره، والمجموع يساوي المبلغ.',
    'في المعلومة الأولى العددان متساويان: أقسم طرفيها على هذا العدد فأجد مجموع السعرين.',
    'أعبّر عن $y$ بدلالة $x$ وأعوّضه في المعادلة الثانية، فأجد $x$ ثم $y$ .',
    'أتحقّق: الثنائية تحقّق المعادلة المبسّطة (مجموع السعرين)، إذن هي حلّ الجملة، وأكتب الجواب بجملة.',
  ],
  errorLine: 4,
  fixes: [
    { text: 'أتحقّق في نص الوضعية: الثنائية تحقّق المعلومتين معًا، الأولى والثانية، ثم أكتب الجواب.', ok: true },
    { text: 'أتحقّق في المعادلة الثانية وحدها.', why: 'معادلة واحدة لا تكفي: ثنائيات كثيرة تحقّقها. حلّ الجملة يحقّق المعادلتين في آن واحد.' },
    { text: 'لا حاجة إلى التحقّق إذا كان الحساب صحيحًا.', why: 'التحقّق في النص هو الذي يكشف خطأ الترجمة أو الحساب: لا نكتب الجواب قبله.' },
  ],
  why: 'المعادلة المبسّطة تقول فقط إنّ مجموع السعرين معروف: ثنائيات كثيرة تحقّقها، والسعران فيها قد يكونان خاطئين. حلّ الجملة يحقّق المعلومتين معًا، فنتحقّق في نص الوضعية من الاثنتين قبل أن نكتب الجواب.',
};
