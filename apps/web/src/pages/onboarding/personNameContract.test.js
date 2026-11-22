import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * « الاسم و اللقب » — the gates that make every student and teacher account
 * carry a name (docs/architecture/TEACHER_CLASSROOM_ARCHITECTURE.md § Identity).
 */
const here = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(resolve(here, '..', '..', p), 'utf8');

describe('person name onboarding contract', () => {
  it('StudentLayout asks for the name BEFORE the grade', () => {
    const src = read('components/layout/StudentLayout.jsx');
    const nameGate = src.indexOf('needsName(user)');
    const gradeGate = src.indexOf('!user.grade');
    expect(nameGate).toBeGreaterThan(-1);
    expect(nameGate).toBeLessThan(gradeGate);
    expect(src).toContain('/espace/bienvenue/nom');
  });

  it('ChooseGrade sends a nameless account to the name step', () => {
    expect(read('pages/student/ChooseGrade.jsx')).toMatch(/needsName\(user\)[\s\S]{0,120}\/espace\/bienvenue\/nom/);
  });

  it('TeacherLayout gates on the name too', () => {
    expect(read('components/layout/TeacherLayout.jsx')).toMatch(/needsName\(user\)[\s\S]{0,120}\/enseignant\/bienvenue/);
  });

  it('both onboarding routes exist, outside the space shells', () => {
    const app = read('App.jsx');
    expect(app).toContain('<Route path="bienvenue/nom" element={<CompleteName />} />');
    expect(app).toContain('<Route path="bienvenue" element={<CompleteName />} />');
  });

  it('Google sign-up confirms the name it pre-fills', () => {
    const src = read('pages/AuthGoogle.jsx');
    expect(src).toContain("suggested('prenom')");
    expect(src).toMatch(/completeGoogleSignup\(\{[\s\S]*?firstName:[\s\S]*?lastName:/);
  });
});
