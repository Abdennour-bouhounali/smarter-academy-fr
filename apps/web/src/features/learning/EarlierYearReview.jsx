import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import { getLessonPath } from '@smarter-academy/core';
import MathLabel from '../../lessons/common/components/MathLabel';

/**
 * « راجع: <درس> (<السنة>) » — le renvoi COMPACT vers une année antérieure, sous le
 * verdict d'une réponse FAUSSE (décision D7 du propriétaire : les liens vers les
 * années antérieures vont aussi dans les exercices, pas seulement dans « أستعدّ »).
 * Un seul composant pour la pratique (PracticeSession) et l'évaluation de leçon
 * (BossFinal) — docs/architecture/EXERCISE_CONTRACT.md § « Earlier-year review link ».
 *
 * Rien n'est écrit dans les exercices : le lien se DÉRIVE du réseau des الكفاءات —
 * الكفاءة principale de la question → sa leçon → `reviewLinksForLesson`, réduit aux
 * années antérieures (`earlierYearReviewFor`). Leçon publiée : un lien. Leçon pas
 * encore écrite : le texte officiel de la كفاءة, sans lien (il s'allume le jour de
 * la publication). Rien à montrer : rien n'est rendu.
 *
 * Le résolveur porte ~430 KB de JSON (programme, réseau, catalogues) : il est
 * chargé À LA DEMANDE, à la première erreur — jamais dans le lot d'entrée ni
 * dans le lot de la page (BUNDLE_BOUNDARIES.md).
 */
let netPromise = null;
const loadNet = () => {
  netPromise ??= import('@smarter-academy/core/curriculum/dz/net/learningNet.js');
  return netPromise;
};

const MAX_LINKS = 3;

export default function EarlierYearReview({ learningPointCode = null, lessonCode = null }) {
  const { t } = useTranslation('lesson');
  const [state, setState] = useState(null);

  useEffect(() => {
    let alive = true;
    loadNet().then((net) => {
      if (!alive) return;
      const labels = new Map(net.GRADES.map((g) => [g.id, g.labelAr]));
      setState({ groups: net.earlierYearReviewFor({ learningPointCode, lessonCode }), labels });
    }).catch(() => { /* hors ligne : pas de renvoi, jamais d'erreur sous un verdict */ });
    return () => { alive = false; };
  }, [learningPointCode, lessonCode]);

  if (!state || state.groups.length === 0) return null;
  // Du plus RÉCENT au plus ancien : la marche juste en dessous d'abord.
  const groups = [...state.groups].reverse().slice(0, MAX_LINKS);

  return (
    <ul className="mt-2 space-y-1 text-sm" aria-label={t('review.earlierYearLabel')} data-earlier-year-review>
      {groups.map((group) => {
        const grade = state.labels.get(group.items[0].grade);
        const path = group.lesson?.status === 'available' ? getLessonPath(group.lesson.code) : null;
        const key = group.lesson?.code ?? group.items[0].id;
        return (
          <li key={key} className="flex items-start gap-1.5 text-slate-700" data-earlier-year-lesson={group.lesson?.code ?? ''} data-earlier-year-linked={path ? 'true' : 'false'}>
            <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
            <span>
              <span className="font-bold">{t('review.earlierYear')}</span>{' '}
              {path ? (
                <Link to={path} className="font-bold text-teal-700 underline underline-offset-4 hover:text-teal-900"><MathLabel>{group.lesson.titleAr}</MathLabel></Link>
              ) : (
                <MathLabel>{group.items[0].textAr}</MathLabel>
              )}{' '}
              <span className="text-slate-500">({grade})</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
