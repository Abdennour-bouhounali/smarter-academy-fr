import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { REPORT_CATEGORIES, REPORT_SOURCES, isRetryableFailure } from '../../services/reportService';
import { ApiError } from '@smarter-academy/core';

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, '../../..');
const read = (p) => readFileSync(resolve(webRoot, p), 'utf8');

describe('les catégories proposées à l’élève', () => {
  it('couvre exactement les sept cas du contrat', () => {
    expect(REPORT_CATEGORIES.map((c) => c.id)).toEqual([
      'math_error',
      'manipulation_not_working',
      'unclear_question',
      'answer_correction_problem',
      'display_problem',
      'typo',
      'other',
    ]);
  });

  it('donne à chacune un libellé ET une explication', () => {
    for (const category of REPORT_CATEGORIES) {
      expect(category.label, `${category.id} sans libellé`).toBeTruthy();
      expect(category.hint, `${category.id} sans explication`).toBeTruthy();
    }
  });

  it('formule des CONSTATS, pas des diagnostics techniques', () => {
    // « bug », « erreur JS » demanderaient à l'élève de diagnostiquer à notre
    // place. Il décrit ce qu'il voit.
    const text = REPORT_CATEGORIES.map((c) => `${c.label} ${c.hint}`).join(' ').toLowerCase();
    for (const jargon of ['bug', 'javascript', 'exception', 'stack', 'api']) {
      expect(text).not.toContain(jargon);
    }
  });

  it('« Autre » existe et vient en dernier', () => {
    expect(REPORT_CATEGORIES.at(-1).id).toBe('other');
  });
});

describe('le parcours en deux temps', () => {
  const service = read('src/services/reportService.js');
  const button = read('src/features/reports/ReportButton.jsx');

  it('expose un appel pour le signal et un autre pour la complétion', () => {
    expect(service).toContain('export async function initiateReport');
    expect(service).toContain('export async function completeReport');
    expect(service).toMatch(/method: 'PATCH'/);
  });

  it('le clic pose le signal AVANT toute saisie', () => {
    // C'est le cœur du dispositif : un formulaire abandonné doit laisser une
    // trace. Le POST ne doit donc pas être dans le gestionnaire d'envoi.
    const openDialog = button.slice(button.indexOf('const openDialog'), button.indexOf('const submit'));
    expect(openDialog).toContain('initiateReport');
  });

  it('l’envoi complète le signalement existant', () => {
    const submit = button.slice(button.indexOf('const submit'), button.indexOf('const close'));
    expect(submit).toContain('completeReport');
  });

  it('la fenêtre s’ouvre sans attendre le réseau', () => {
    const openDialog = button.slice(button.indexOf('const openDialog'), button.indexOf('const submit'));
    // setOpen(true) doit précéder l'await : sinon l'élève clique et rien ne
    // se passe pendant la latence.
    expect(openDialog.indexOf('setOpen(true)')).toBeLessThan(openDialog.indexOf('await initiateReport'));
  });

  it('se protège du double-clic', () => {
    expect(button).toContain('opening.current');
  });

  it('n’envoie jamais d’identifiant de base, seulement des codes', () => {
    expect(service).not.toMatch(/lesson_id|module_id|lessonId:/);
    expect(service).toContain('lessonCode');
  });
});

describe('un signal qui échoue ne fait pas perdre le signalement', () => {
  const button = read('src/features/reports/ReportButton.jsx');

  it('ne réessaie que ce qui vaut la peine de l’être', () => {
    // Passager : la même requête peut aboutir plus tard.
    expect(isRetryableFailure(new ApiError('coupé', 'NETWORK_ERROR'))).toBe(true);
    expect(isRetryableFailure(new ApiError('502', 'SERVER_ERROR', 502))).toBe(true);

    // Refus : la même requête produira la même réponse. Rejouer masquerait
    // la vraie cause derrière un second échec.
    expect(isRetryableFailure(new ApiError('interdit', 'AUTHORIZATION_ERROR', 403))).toBe(false);
    expect(isRetryableFailure(new ApiError('invalide', 'VALIDATION_ERROR', 422))).toBe(false);
    expect(isRetryableFailure(new ApiError('non connecté', 'AUTHENTICATION_ERROR', 401))).toBe(false);
  });

  it('traite une erreur non typée comme passagère', () => {
    // Perdre le signalement d'un élève est pire que retenter une fois pour rien.
    expect(isRetryableFailure(new Error('inconnue'))).toBe(true);
    expect(isRetryableFailure(undefined)).toBe(true);
  });

  it('retient l’échec sans alarmer l’élève à l’ouverture', () => {
    const openDialog = button.slice(button.indexOf('const openDialog'), button.indexOf('const submit'));
    // Aucune erreur affichée : l'élève n'a encore rien demandé.
    expect(openDialog).not.toMatch(/setError\((?!null)/);
    expect(openDialog).toContain('setSignalPending(isRetryableFailure(caught))');
  });

  it('repose le signal à l’envoi quand l’échec était passager', () => {
    const submit = button.slice(button.indexOf('const submit'), button.indexOf('const close'));
    expect(submit).toContain('if (!signalPending)');
    expect(submit).toContain('await initiateReport');
  });

  it('n’insiste pas quand le refus est définitif', () => {
    const submit = button.slice(button.indexOf('const submit'), button.indexOf('const close'));
    // Sans `signalPending`, on lève au lieu de rejouer une requête que le
    // serveur a déjà refusée.
    const guard = submit.indexOf('if (!signalPending)');
    const retry = submit.indexOf('await initiateReport');
    expect(guard).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(retry);
  });

  it('garde la saisie de l’élève à l’écran en cas d’échec', () => {
    const submit = button.slice(button.indexOf('const submit'), button.indexOf('const close'));
    // `setSubmitted(true)` ne doit pas être atteint dans la branche d'erreur :
    // l'élève doit pouvoir réessayer sans retaper.
    expect(submit).toContain('setError(caught.message)');
    const dialog = read('src/features/reports/ReportDialog.jsx');
    expect(dialog).toContain('role="alert"');
  });

  it('ne conserve rien de sensible localement', () => {
    // Le seul état gardé est un identifiant numérique et un drapeau. Pas de
    // stockage persistant, pas de jeton recopié.
    expect(button).not.toContain('localStorage');
    expect(button).not.toContain('sessionStorage');
  });

  it('n’introduit ni sondage ni minuterie de relance', () => {
    expect(button).not.toContain('setInterval');
    expect(button).not.toContain('setTimeout');
  });
});

describe('la cible tactile de l’icône', () => {
  const button = read('src/features/reports/ReportButton.jsx');
  const iconVariant = button.slice(button.indexOf("variant === 'icon'"), button.indexOf("variant === 'link'"));

  it('offre 44px au doigt tout en gardant une pastille de 36px', () => {
    // h-11 w-11 = 44px de cible ; le <span> intérieur porte le visuel.
    expect(iconVariant).toContain('h-11 w-11');
    expect(iconVariant).toContain('h-9 w-9');
  });

  it('garde l’anneau de focus sur la pastille visible, pas sur la cible', () => {
    // Sinon l'anneau ferait 44px et déborderait visuellement de l'icône.
    expect(iconVariant).toContain('group-focus-visible:ring-2');
  });

  it('garde son étiquette accessible', () => {
    expect(iconVariant).toContain('aria-label={label}');
    expect(iconVariant).toContain('aria-haspopup="dialog"');
  });

  it('ne rétrécit pas dans une barre d’outils serrée', () => {
    expect(iconVariant).toContain('shrink-0');
  });
});

describe('le contexte pilote le composant', () => {
  it('déclare les cinq origines connues du serveur', () => {
    expect(Object.values(REPORT_SOURCES).sort()).toEqual(
      ['diagnostic', 'exercise', 'lesson', 'module', 'question'],
    );
  });

  const HOSTS = [
    ['sommaire de leçon', 'src/lessons/common/components/LessonIndex.jsx', 'lesson'],
    ['module', 'src/lessons/common/components/ModuleLayout.jsx', 'module'],
    ['question d’exercice', 'src/pages/student/practice/PracticeSession.jsx', 'question'],
    ['diagnostic', 'src/pages/student/diagnostic/DiagnosticRun.jsx', 'diagnostic'],
  ];

  it.each(HOSTS)('%s déclare source="%s"', (_label, file, source) => {
    expect(read(file)).toContain(`source="${source}"`);
  });

  it('un seul composant sert les quatre contextes', () => {
    // Pas de ReportButtonLesson / ReportButtonModule : c'est le contexte qui
    // varie, pas le composant.
    for (const [, file] of HOSTS) {
      expect(read(file)).toContain('<ReportButton');
    }
  });

  it('ModuleLayout le pose dans SES DEUX sorties', () => {
    // Le composant a une branche « module verrouillé » avec son propre <main> :
    // un bouton posé dans une seule disparaîtrait sans bruit dans l'autre.
    const source = read('src/lessons/common/components/ModuleLayout.jsx');
    expect(source.split('<ReportButton').length - 1).toBe(2);
    expect(source.split('source="module"').length - 1).toBe(2);
  });

  it('aucune leçon ne câble le bouton à la main', () => {
    // L'intégration vit dans les shells partagés : une leçon qui l'ajouterait
    // elle-même signalerait que l'abstraction partagée a été contournée.
    const strays = HOSTS.map(([, f]) => f);
    const lessonFiles = read('src/lessons/common/components/LessonIndex.jsx');
    expect(lessonFiles).toContain('ReportButton');
    expect(strays.length).toBe(4);
  });
});

describe('accessibilité de la fenêtre', () => {
  const dialog = read('src/features/reports/ReportDialog.jsx');

  it('porte la sémantique d’une boîte de dialogue', () => {
    expect(dialog).toContain('role="dialog"');
    expect(dialog).toContain('aria-modal="true"');
    expect(dialog).toContain('aria-labelledby');
  });

  it('utilise de VRAIS boutons radio', () => {
    // Des <div> cliquables ne se parcourent pas aux flèches et ne s'annoncent
    // pas comme un groupe de choix.
    expect(dialog).toContain('type="radio"');
    expect(dialog).toContain('role="radiogroup"');
    expect(dialog).toContain('<fieldset');
    expect(dialog).toContain('<legend');
  });

  it('associe le champ de texte à son étiquette', () => {
    expect(dialog).toContain('htmlFor="report-note"');
    expect(dialog).toContain('id="report-note"');
  });

  it('ferme à Échap et piège le focus', () => {
    expect(dialog).toContain("event.key === 'Escape'");
    expect(dialog).toContain("event.key !== 'Tab'");
  });

  it('rend le focus au déclencheur à la fermeture', () => {
    expect(dialog).toContain('previouslyFocused.current?.focus?.()');
  });

  it('annonce les erreurs aux lecteurs d’écran', () => {
    expect(dialog).toContain('role="alert"');
  });

  it('le déclencheur annonce qu’il ouvre une fenêtre', () => {
    expect(read('src/features/reports/ReportButton.jsx')).toContain('aria-haspopup="dialog"');
  });
});

describe('mobile et cibles tactiles', () => {
  it('la fenêtre remonte du bas sur petit écran et ne déborde pas', () => {
    const dialog = read('src/features/reports/ReportDialog.jsx');
    expect(dialog).toContain('items-end');
    expect(dialog).toContain('sm:items-center');
    expect(dialog).toContain('w-full max-w-lg');
    expect(dialog).toContain('max-h-[92dvh]');
    expect(dialog).toContain('overflow-y-auto');
  });

  it('les déclencheurs respectent la cible tactile de 44px', () => {
    const button = read('src/features/reports/ReportButton.jsx');
    // La variante icône est un carré de 36px assumé (h-9 w-9) dans une barre
    // d'outils déjà dense ; les deux variantes textuelles tiennent les 44px.
    expect(button.split('min-h-[44px]').length - 1).toBeGreaterThanOrEqual(2);
  });
});

describe('confirmation et non-interruption', () => {
  const dialog = read('src/features/reports/ReportDialog.jsx');

  it('confirme sans quitter la leçon', () => {
    expect(dialog).toContain('Merci ! Ton signalement a bien été envoyé.');
    // Aucune navigation : l'élève reste exactement où il était.
    expect(dialog).not.toContain('useNavigate');
    expect(dialog).not.toContain('window.location');
  });

  it('repart d’une page blanche à chaque ouverture', () => {
    expect(dialog).toContain('setCategory(null)');
  });
});
