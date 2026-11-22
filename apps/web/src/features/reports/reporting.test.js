import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { REPORT_CATEGORIES, REPORT_SOURCES } from '../../services/reportService';

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

describe('un envoi unique — le clic n’envoie rien (2026-10-05)', () => {
  const service = read('src/services/reportService.js');
  const button = read('src/features/reports/ReportButton.jsx');
  const openDialog = button.slice(button.indexOf('const openDialog'), button.indexOf('const submit'));
  const submit = button.slice(button.indexOf('const submit'), button.indexOf('const close'));

  it('le service n’expose plus le signal posé au clic ni la complétion', () => {
    expect(service).toContain('export async function submitReport');
    expect(service).not.toContain('initiateReport');
    expect(service).not.toContain('completeReport');
    expect(service).not.toMatch(/method: 'PATCH'/);
  });

  it('ouvrir la fenêtre ne fait AUCUN appel réseau', () => {
    expect(openDialog).toContain('setOpen(true)');
    expect(openDialog).not.toMatch(/submitReport|apiRequest|fetch\(|await /);
  });

  it('seul l’envoi appelle le serveur, capture comprise', () => {
    expect(submit).toContain('await submitReport(token, { source, context, category, note, screenshot })');
  });

  it('n’envoie jamais d’identifiant de base, seulement des codes', () => {
    expect(service).not.toMatch(/lesson_id|module_id|lessonId:/);
    expect(button).toContain('context');
  });

  it('envoie en multipart sans fixer Content-Type (le navigateur pose la frontière)', () => {
    const fn = service.slice(service.indexOf('export async function submitReport'));
    expect(fn).toContain('new FormData()');
    expect(fn).not.toContain("'Content-Type'");
  });
});

describe('réservé aux relecteurs (admin, سفير)', () => {
  const button = read('src/features/reports/ReportButton.jsx');

  it('ne rend rien sans `user.canReviewContent`', () => {
    expect(button).toContain('if (!token || !user?.canReviewContent) return null;');
  });

  it('garde la saisie à l’écran en cas d’échec', () => {
    const submit = button.slice(button.indexOf('const submit'), button.indexOf('const close'));
    expect(submit).toContain('setError(caught.message)');
    expect(read('src/features/reports/ReportDialog.jsx')).toContain('role="alert"');
  });

  it('ne conserve rien de sensible localement', () => {
    expect(button).not.toContain('localStorage');
    expect(button).not.toContain('sessionStorage');
  });

  it('n’introduit ni sondage ni minuterie de relance', () => {
    expect(button).not.toContain('setInterval');
    expect(button).not.toContain('setTimeout');
  });
});

describe('la capture d’écran dans la fenêtre', () => {
  const dialog = read('src/features/reports/ReportDialog.jsx');
  const screenshot = read('src/features/reports/screenshot.js');

  it('propose de capturer la page ET de choisir une image', () => {
    expect(dialog).toContain("t('report.screenshot.capture')");
    expect(dialog).toContain("t('report.screenshot.upload')");
    expect(dialog).toContain('accept="image/png,image/jpeg,image/webp"');
  });

  it('se RETIRE pendant la capture, comme l’outil d’un système d’exploitation', () => {
    // La fenêtre laisse la place à l'outil de sélection, puis revient avec la région.
    expect(dialog).toContain('if (snipping)');
    expect(dialog).toContain('<ScreenSnipper');
    expect(dialog).toContain('captureRegion(rect)');
    // Le défilement n'est plus bloqué pendant la sélection.
    expect(dialog).toContain('const active = open && !snipping;');
    expect(dialog).toContain('if (!active) return undefined;');
  });

  it('garde la saisie (catégorie, note) pendant la capture', () => {
    // La remise à zéro n'a lieu qu'à l'OUVERTURE, jamais en revenant de l'outil.
    const reset = dialog.slice(dialog.indexOf('if (open) {'), dialog.indexOf('}, [open]);'));
    expect(reset).toContain('setCategory(null)');
    expect(dialog).not.toMatch(/setSnipping\(false\);\s*setCategory/);
  });

  it('exclut la fenêtre elle-même de la capture', () => {
    expect(dialog).toContain('[IGNORE_ATTRIBUTE]');
    expect(screenshot).toContain('hasAttribute(IGNORE_ATTRIBUTE)');
  });

  it('charge html-to-image À LA DEMANDE (hors bundle d’entrée)', () => {
    expect(screenshot).toContain("await import('html-to-image')");
    expect(screenshot).not.toMatch(/^import .*html-to-image/m);
  });

  it('brûle les cadres dans l’image envoyée', () => {
    expect(dialog).toContain('exportAnnotated(shot, marks)');
  });

  it('une capture ratée propose l’alternative au lieu de bloquer', () => {
    expect(dialog).toContain("t('report.screenshot.captureFailed')");
  });

  it('repart sans capture à chaque ouverture', () => {
    expect(dialog).toContain('setShot(null)');
    expect(dialog).toContain('setMarks([])');
  });
});

describe('la cible tactile de l’icône', () => {
  const button = read('src/features/reports/ReportButton.jsx');
  const iconVariant = button.slice(button.indexOf("variant === 'icon'"), button.indexOf("variant === 'link'"));

  it('offre 44px de hauteur au doigt, la pastille visible en faisant 36', () => {
    // h-11 = 44px de cible. La LARGEUR est libre : la pastille porte
    // maintenant le mot « Signaler » à partir de `sm`, et mesure 118px au
    // navigateur — bien au-delà des 44 requis. Contraindre `w-11` ici
    // rendrait le test faux dès qu'on ajoute une étiquette.
    expect(iconVariant).toContain('h-11');
    expect(iconVariant).toContain('h-9');
  });

  it('reste lisible : une pastille bordée, pas une icône nue', () => {
    // Une icône seule au milieu du bandeau se lit comme un ornement. La
    // bordure et le fond la rangent avec les autres repères du module.
    expect(iconVariant).toContain('border');
    // Le mot est rendu par i18n (locales/ar/common.json → report.triggerShort),
    // pas écrit en dur : c'est sa PRÉSENCE qu'on vérifie, pas sa langue.
    expect(iconVariant).toContain("t('report.triggerShort')");
  });

  it('masque le mot sur téléphone, où la barre du haut n’a pas la place', () => {
    expect(iconVariant).toContain('hidden sm:inline');
    // L'étiquette accessible porte alors seule le sens.
    expect(iconVariant).toContain('aria-label={label}');
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
    expect(dialog).toContain('w-full max-w-3xl');
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
    expect(dialog).toContain("t('report.successTitle')");
    // Aucune navigation : l'élève reste exactement où il était.
    expect(dialog).not.toContain('useNavigate');
    expect(dialog).not.toContain('window.location');
  });

  it('repart d’une page blanche à chaque ouverture', () => {
    expect(dialog).toContain('setCategory(null)');
  });
});

describe('le message d’abord (2026-10-08)', () => {
  const dialog = read('src/features/reports/ReportDialog.jsx');

  it('rend le message obligatoire et la catégorie facultative', () => {
    expect(dialog).toContain('required');
    expect(dialog).toContain('disabled={!noteReady || busy}');
    expect(dialog).not.toContain('disabled={!category || busy}');
    // Sans choix, le serveur reçoit « other ».
    expect(dialog).toContain("category: category ?? 'other'");
  });

  it('place le message et la capture AVANT les types de problème', () => {
    const note = dialog.indexOf('id="report-note"');
    const shot = dialog.indexOf('id="report-screenshot-title"');
    const categories = dialog.indexOf('role="radiogroup"');
    expect(note).toBeLessThan(shot);
    expect(shot).toBeLessThan(categories);
  });

  it('accepte une image collée ou déposée', () => {
    expect(dialog).toContain('onPaste={pasteImage}');
    expect(dialog).toContain('onDrop={dropImage}');
  });
});
