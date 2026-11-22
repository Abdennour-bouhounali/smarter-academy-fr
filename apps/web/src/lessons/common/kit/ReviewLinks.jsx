import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import { getLessonPath } from '@smarter-academy/core';
import { GRADES, reviewLinksForLesson } from '@smarter-academy/core/curriculum/dz/net/learningNet.js';
import MathText from '../components/MathText';
import { MoreToggle } from '../components/StudentFocus';

const gradeLabel = new Map(GRADES.map((g) => [g.id, g.labelAr]));

/**
 * « راجع قبل أن تنطلق » — les الكفاءات du programme officiel sur lesquelles la
 * leçon s'appuie, lues dans le RÉSEAU DES الكفاءات (docs/architecture/LEARNING_NET.md).
 *
 * Un groupe = la leçon d'accueil d'une ou plusieurs de ces الكفاءات, d'UN pas en
 * arrière dans le réseau. La leçon est un LIEN quand elle est publiée ; une
 * leçon PRÉVUE (années 1–3 pas encore écrites) affiche quand même la كفاءة et
 * son année — l'élève sait quoi réviser — avec « قريبًا ». Le jour où la leçon
 * paraît, le lien s'allume sans toucher à cette leçon-ci.
 *
 * Jamais bloquant, aucune évidence serveur : même contrat que le diagnostic.
 */
export default function ReviewLinks({ lessonId }) {
  const { t } = useTranslation('lesson');
  const groups = reviewLinksForLesson(lessonId);
  if (groups.length === 0) return null;

  return (
    <section aria-labelledby="review-links-title" className="rounded-2xl border-2 border-slate-200 bg-white space-y-3 p-5" data-testid="review-links">
      <div className="space-y-1">
        <h3 id="review-links-title" className="font-space font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-600 shrink-0" aria-hidden="true" />
          {t('diagnostic.reviewTitle')}
        </h3>
        <p className="text-sm text-slate-600">{t('diagnostic.reviewHint')}</p>
      </div>
      <ul className="space-y-2">
        {groups.map((group) => {
          const path = group.lesson?.status === 'available' ? getLessonPath(group.lesson.code) : null;
          const key = group.lesson?.code ?? group.items[0].id;
          return (
            <li key={key} className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 rounded-full px-2.5 py-0.5">
                  {gradeLabel.get(group.items[0].grade)}
                </span>
                {group.lesson && (
                  path ? (
                    <Link to={path} className="font-bold text-teal-700 hover:text-teal-900 underline underline-offset-4 min-h-[44px] inline-flex items-center">
                      {group.lesson.titleAr}
                    </Link>
                  ) : (
                    <>
                      <span className="font-bold text-slate-700">{group.lesson.titleAr}</span>
                      <span className="text-xs text-slate-500 bg-white border border-slate-200 rounded-full px-2 py-0.5">
                        {t('diagnostic.reviewSoon')}
                      </span>
                    </>
                  )
                )}
              </div>
              {/* Regard « focus » : le lien d'abord ; les textes du programme à un geste. */}
              <MoreToggle>
                <ul className="space-y-1 text-sm text-slate-700 list-disc ps-5">
                  {group.items.map((item) => (
                    <li key={item.id}><MathText>{item.textAr}</MathText></li>
                  ))}
                </ul>
              </MoreToggle>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
