import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { courseLevels, getAllGrades } from '@smarter-academy/core';
import { AuthContext } from '../../context/AuthContext';
import { getResumeLesson } from '../../lessons/common/utils/progress/getResumeLesson';
import { getDisplayName } from '../../utils/userDisplay';

/**
 * The homepage's grade-aware entry point for a logged-in student — their
 * current grade becomes the default learning context here, per the
 * Student Grade & Personalized Learning Context phase. Renders nothing for
 * admins or logged-out visitors, so the rest of the marketing homepage is
 * untouched for them.
 */
export default function StudentHomeBanner() {
  const { user } = useContext(AuthContext);

  const continueCourse = useMemo(() => {
    if (user?.role !== 'student') return null;
    return getResumeLesson(courseLevels);
  }, [user]);

  if (user?.role !== 'student') return null;

  const grade = getAllGrades().find((g) => g.id === user.grade);
  const level = grade && courseLevels.find((l) => l.id === grade.levelId);
  const gradeCatalogueLink = grade
    ? `/courses?level=${grade.levelId}&grade=${grade.id}`
    : '/espace/bienvenue';

  return (
    <section className="pt-6 pb-2 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <p className="font-inter text-sm text-slate-500">
              Bonjour {getDisplayName(user)} — {grade ? `${level?.title} ${grade.name}` : 'choisissez votre classe'}
            </p>
            <h2 className="font-space font-bold text-lg sm:text-xl text-slate-900 mt-0.5">
              {continueCourse
                ? `Reprendre : ${continueCourse.course.title}`
                : `Découvrez vos cours de ${grade ? grade.name : 'mathématiques'}`}
            </h2>
          </div>

          <Link
            to={continueCourse ? continueCourse.resumePath : gradeCatalogueLink}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-space font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
          >
            {continueCourse ? <Play size={16} /> : null}
            {continueCourse ? 'Continuer' : grade ? 'Voir mes cours' : 'Choisir ma classe'}
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
