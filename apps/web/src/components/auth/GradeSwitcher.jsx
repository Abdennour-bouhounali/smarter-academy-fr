import React, { useContext, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { getAllGrades } from '@smarter-academy/core';
import { AuthContext } from '../../context/AuthContext';

const ALL_GRADES = getAllGrades();

/**
 * "Ma classe : 6e ▾" — lets a logged-in student change their current grade
 * (their default learning context) without restricting access to other
 * grades elsewhere in the app. Renders nothing for admins or logged-out
 * visitors.
 */
export default function GradeSwitcher() {
  const { user, updateGrade } = useContext(AuthContext);
  const [saving, setSaving] = useState(false);

  if (!user || user.role !== 'student') return null;

  const currentGrade = ALL_GRADES.find((g) => g.id === user.grade);

  const handleChange = async (e) => {
    const newGrade = e.target.value;
    if (!newGrade || newGrade === user.grade) return;
    setSaving(true);
    try {
      await updateGrade(newGrade);
    } catch (error) {
      console.error('Error updating grade:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <label htmlFor="grade-switcher" className="sr-only">Ma classe</label>
      <select
        id="grade-switcher"
        value={user.grade || ''}
        onChange={handleChange}
        disabled={saving}
        className="appearance-none cursor-pointer rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-1.5 font-inter text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition-colors"
      >
        {!currentGrade && <option value="" disabled>Ma classe</option>}
        {ALL_GRADES.map((g) => (
          <option key={g.id} value={g.id}>
            Ma classe : {g.name}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 text-slate-400" />
    </div>
  );
}
