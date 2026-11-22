import { useTranslation } from 'react-i18next';

/**
 * « أهلًا … 👋 » — l'en-tête PERSONNEL de l'accueil, volontairement plus
 * léger que le héros : un prénom, la classe (donnée du catalogue, jamais
 * écrite en dur) et une phrase. Il situe l'élève ; il ne lui demande rien.
 *
 * La classe est annoncée ici parce que « واصل درسك » peut proposer une leçon
 * d'une autre classe (getResumeLesson n'est pas cadré — ARCHITECTURE.md §10) :
 * le cadre courant doit rester lisible d'un coup d'œil.
 */
export default function HomeGreeting({ name, gradeName }) {
  const { t } = useTranslation('student');
  return (
    <header data-home-greeting>
      <p className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-2">
        {t('home.cycle')}
      </p>
      <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900 text-balance xl:whitespace-nowrap">
        {t('home.greeting', { name })}
      </h1>
      {gradeName ? (
        <>
          <p className="font-inter text-slate-600 text-sm sm:text-base mt-1.5">
            <span className="font-semibold text-slate-800">{gradeName}</span>
            <span className="text-slate-300 mx-2" aria-hidden="true">·</span>
            {t('home.subject')}
          </p>
          <p className="font-inter text-slate-400 text-sm mt-0.5">{t('home.tagline')}</p>
        </>
      ) : (
        <p className="font-inter text-slate-500 text-sm mt-1.5">{t('home.noGradeYet')}</p>
      )}
    </header>
  );
}
