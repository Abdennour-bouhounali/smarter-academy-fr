import { describe, it, expect } from 'vitest';
import { describeLearningViewer, WORKSPACE_BASE } from './learningViewer';

describe('describeLearningViewer — qui regarde la leçon', () => {
  it('l’élève suit la progression et son trajet s’enregistre', () => {
    const v = describeLearningViewer({ role: 'student' });
    expect(v).toMatchObject({ role: 'student', freeNavigation: false, tracksProgress: true, workspaceBase: '/espace', usesWorkspaceShell: true, isTeacher: false });
  });

  it('l’enseignant navigue librement et n’écrit RIEN', () => {
    const v = describeLearningViewer({ role: 'teacher' });
    expect(v).toMatchObject({ role: 'teacher', freeNavigation: true, tracksProgress: false, workspaceBase: '/enseignant', usesWorkspaceShell: true, isTeacher: true });
  });

  it('l’administrateur relit librement, sans espace de travail', () => {
    const v = describeLearningViewer({ role: 'admin' });
    expect(v).toMatchObject({ role: 'admin', freeNavigation: true, tracksProgress: false, workspaceBase: null, usesWorkspaceShell: false });
  });

  it('le visiteur garde le comportement historique : verrou et brouillon local', () => {
    expect(describeLearningViewer(null)).toMatchObject({ role: 'visitor', freeNavigation: false, tracksProgress: true, workspaceBase: null, usesWorkspaceShell: false });
    expect(describeLearningViewer({ role: 'martian' }).role).toBe('visitor');
  });

  it('les racines sont figées', () => {
    expect(Object.isFrozen(WORKSPACE_BASE)).toBe(true);
    expect(Object.isFrozen(describeLearningViewer({ role: 'teacher' }))).toBe(true);
  });
});
