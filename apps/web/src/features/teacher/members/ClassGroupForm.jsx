import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllGrades } from '@smarter-academy/core';
import { AuthContext } from '../../../context/AuthContext';
import { createClassGroup } from '../../../services/teacher/classGroupService';
import { btnPrimary, btnSecondary, input } from '../../../pages/teacher/teacherUi';

/**
 * Le formulaire de création d'un قسم — un nom, une classe scolaire du
 * catalogue actif, et c'est tout.
 *
 * Il ne décide pas de ce qui arrive après : `onCreated(classroom)` le dit
 * au parent. Le même composant sert donc à la boîte de dialogue ouverte
 * depuis « أقسامي » (qui reste sur la page et recharge la liste) et à la
 * page `/enseignant/classes/nouveau` (qui navigue vers le nouveau قسم).
 */
export default function ClassGroupForm({ onCreated, onCancel, autoFocus = false }) {
  const { t } = useTranslation('teacher');
  const { token } = useContext(AuthContext);
  const grades = getAllGrades();

  const [name, setName] = useState('');
  // Par défaut, la première classe qui a des leçons PUBLIÉES (1AM–3AM n'ont encore
  // que des cartes « قيد الإعداد », 2026-10-14) ; toutes restent sélectionnables.
  const [grade, setGrade] = useState((grades.find((g) => g.lessonCount > 0) ?? grades[0])?.id ?? '');
  const [description, setDescription] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      const result = await createClassGroup(token, {
        name: name.trim(),
        grade,
        description: description.trim() || undefined,
        academicYear: academicYear.trim() || undefined,
      });
      onCreated?.(result.classroom);
    } catch (err) {
      setError(t(`classes.errors.${err?.reason ?? 'generic'}`, { defaultValue: err.message || t('classes.errors.generic') }));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" data-class-form>
      <label className="block">
        <span className="mb-1 block font-inter text-sm font-semibold text-slate-800">{t('classes.nameLabel')}</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} autoFocus={autoFocus} placeholder={t('classes.namePlaceholder')} className={input} name="name" />
      </label>
      <label className="block">
        <span className="mb-1 block font-inter text-sm font-semibold text-slate-800">{t('classes.gradeLabel')}</span>
        <select value={grade} onChange={(e) => setGrade(e.target.value)} className={input} name="grade">
          {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block font-inter text-sm font-semibold text-slate-800">{t('classes.descriptionLabel')}</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={500} className={input} name="description" />
      </label>
      <label className="block">
        <span className="mb-1 block font-inter text-sm font-semibold text-slate-800">{t('classes.academicYearLabel')}</span>
        <input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} dir="ltr" placeholder={t('classes.academicYearPlaceholder')} pattern="\d{4}-\d{4}" className={input} name="academicYear" />
      </label>
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={pending} className={btnPrimary}>{pending ? t('classes.creating') : t('classes.create')}</button>
        <button type="button" onClick={onCancel} className={btnSecondary}>{t('common.cancel')}</button>
      </div>
    </form>
  );
}
