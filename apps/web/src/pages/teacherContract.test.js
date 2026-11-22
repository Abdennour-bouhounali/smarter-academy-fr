import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

/**
 * Les contrats de l'espace enseignant et du modèle commercial — vérifiés
 * sur la SOURCE, comme checkoutContract.test.js.
 *
 *   - AUCUN paiement en ligne : ni le service de facturation dormant, ni un
 *     mot de « checkout » / « Stripe » n'entre dans l'espace enseignant,
 *     l'espace élève ou les écrans commerciaux de l'administration ;
 *   - aucun libellé FRANÇAIS par défaut ne fuit dans un écran arabe : les
 *     défauts français du kit d'administration sont surchargés.
 */
const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '..');

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(jsx?|mjs)$/.test(name) && !/\.test\./.test(name)) out.push(full);
  }
  return out;
}

const NO_PAYMENT_DIRS = ['pages/teacher', 'features/teacher', 'pages/student', 'services/teacher', 'pages/admin/plans', 'pages/admin/requests', 'pages/admin/teachers', 'components/admin/commercial', 'context'];
const FORBIDDEN = [/billingService/, /\/billing\//, /checkout/i, /stripe/i, /card-?number/i, /pay\s?now/i];

describe('aucun paiement en ligne sur le produit algérien', () => {
  for (const rel of NO_PAYMENT_DIRS) {
    it(`${rel} n’importe ni facturation, ni tunnel de paiement`, () => {
      for (const file of walk(resolve(src, rel))) {
        const code = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        for (const pattern of FORBIDDEN) {
          expect(code, `${file} contient ${pattern}`).not.toMatch(pattern);
        }
      }
    });
  }
});

describe('l’espace enseignant est arabe, sans défaut français', () => {
  const FRENCH = [/Réessayer/, /Chargement…/, /Annuler/, /Précédent/, /Suivant/, /Aucun résultat/, /Confirmer/, /Sélectionner /];
  // Les surfaces PARTAGÉES par l'élève et l'enseignant en font partie : le
  // même moteur de leçon, le même cahier, le même مختبر (§8b du contrat).
  for (const rel of ['pages/teacher', 'features/teacher', 'features/learning', 'components/teacher', 'pages/student/Qism.jsx', 'pages/JoinClassLink.jsx', 'features/mathlab', 'features/practice/notebook']) {
    it(`${rel} ne rend aucun libellé français`, () => {
      const target = resolve(src, rel);
      const files = statSync(target).isDirectory() ? walk(target) : [target];
      for (const file of files) {
        const code = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        for (const pattern of FRENCH) {
          expect(code, `${file} rend ${pattern}`).not.toMatch(pattern);
        }
      }
    });
  }

  it('le kit d’administration laisse surcharger ses libellés', () => {
    expect(readFileSync(resolve(src, 'components/admin/ui/DataTable.jsx'), 'utf8')).toMatch(/labels = \{\}/);
    expect(readFileSync(resolve(src, 'components/admin/ui/states.jsx'), 'utf8')).toMatch(/retryLabel/);
    expect(readFileSync(resolve(src, 'components/admin/ui/Modal.jsx'), 'utf8')).toMatch(/cancelLabel/);
    expect(readFileSync(resolve(src, 'components/admin/ui/FilterBar.jsx'), 'utf8')).toMatch(/labels = \{\}/);
  });

  it('l’enseignant apprend dans son espace : leçons, مختبر et cahier montés sous /enseignant', () => {
    const app = readFileSync(resolve(src, 'App.jsx'), 'utf8');
    for (const path of ['path="cours" element={<Explorer />}', 'path="atelier" element={<MathLabHome />}', 'path="cahier" element={<Notebook />}']) {
      expect(app, `App.jsx monte ${path} pour l’enseignant`).toContain(path);
    }
    const nav = readFileSync(resolve(src, 'data/teacherNavigation.js'), 'utf8');
    for (const p of ['/enseignant/cours', '/enseignant/atelier', '/enseignant/cahier']) {
      expect(nav, `la navigation enseignant expose ${p}`).toContain(p);
    }
  });

  it('le LECTEUR décide, jamais un rôle écrit en dur dans le moteur de leçon', () => {
    // L'écriture de progression passe par learningViewer : aucun composant de leçon ne teste `role === 'teacher'`.
    for (const rel of ['lessons/common/components/LessonIndex.jsx', 'lessons/common/hooks/useProgress.js']) {
      const code = readFileSync(resolve(src, rel), 'utf8');
      expect(code, `${rel} ne teste pas un rôle`).not.toMatch(/role === ['"](teacher|student)['"]/);
      expect(code).toMatch(/useLearningViewer|tracksProgress/);
    }
  });

  it('l’espace enseignant est monté derrière le rôle enseignant, et le mode classe le reconnaît', () => {
    const app = readFileSync(resolve(src, 'App.jsx'), 'utf8');
    expect(app).toMatch(/<Route path="\/enseignant" element=\{<ProtectedRoute allowedRoles=\{\['teacher'\]\} \/>\}>/);
    expect(app).toMatch(/path="offres\/demandes"/);
    const auth = readFileSync(resolve(src, '../../../packages/core/auth.js'), 'utf8');
    expect(auth).toMatch(/CLASSROOM_PRESENTER_ROLES = Object\.freeze\(\[[^\]]*'teacher'/);
  });
});

describe('la carte de leçon lit le troisième axe', () => {
  it('une leçon masquée par l’enseignant a son propre état, distinct du verrou et de la fermeture', () => {
    // L'état est lu une fois (useLessonTileState) pour la carte ET la ligne.
    const state = readFileSync(resolve(src, 'components/student/useLessonTileState.js'), 'utf8');
    expect(state).toContain('isLessonHiddenByClass');
    for (const tile of ['LessonCard.jsx', 'LessonRow.jsx']) {
      const source = readFileSync(resolve(src, 'components/student', tile), 'utf8');
      expect(source).toContain('useLessonTileState(lesson)');
      expect(source).toContain('hiddenByTeacherBadge');
    }
    const ctx = readFileSync(resolve(src, 'context/ContentAvailabilityContext.jsx'), 'utf8');
    expect(ctx).toMatch(/hiddenByClass: result\.hiddenByClass \?\? \[\]/);
  });
});

/**
 * Le COURRIEL d'un élève n'entre dans aucun écran enseignant. Le serveur ne
 * l'envoie plus (TeacherPrivacyContractTest) ; ce test empêche qu'un écran
 * le réclame à nouveau — par exemple en repli d'un nom vide (`|| s.email`).
 * Seule exception : son propre profil. (L'invitation par courriel, qui
 * faisait taper une adresse à l'enseignant, a été retirée le 2026-10-01 : les
 * élèves entrent par le lien ou le code de la classe.)
 */
describe('aucun écran enseignant ne lit le courriel d’un élève', () => {
  // CredentialsDialog : « بطاقات الدخول » (propriétaire, 2026-10-22) — la
  // carte imprimée porte le courriel, rendu UNE fois par le geste qui émet un
  // nouveau mot de passe (StudentCredentials), jamais par une lecture.
  const ALLOWED = [/TeacherProfile\.jsx$/, /members\/CredentialsDialog\.jsx$/];
  it('l’invitation par courriel n’existe plus dans l’espace enseignant', () => {
    for (const rel of ['pages/teacher', 'features/teacher', 'services/teacher']) {
      for (const file of walk(resolve(src, rel))) {
        const code = readFileSync(file, 'utf8');
        expect(code, `${file} invite par courriel`).not.toMatch(/\/invitations|InvitationsPanel|sendClassInvitation/);
      }
    }
  });

  it('la page d’une classe montre le LIEN au-dessus du CODE', () => {
    const card = readFileSync(resolve(src, 'features/teacher/members/JoinAccessCard.jsx'), 'utf8');
    const linkAt = card.indexOf('<JoinLinkBlock');
    const codeAt = card.indexOf('data-join-code-card');
    expect(linkAt).toBeGreaterThan(-1);
    expect(codeAt).toBeGreaterThan(linkAt);
    const page = readFileSync(resolve(src, 'pages/teacher/ClassGroupDetail.jsx'), 'utf8');
    // The card is shown on demand (« دعوة التلاميذ »), by itself while the class is empty, and in « الإعدادات » — always above the tabs.
    expect(page).toMatch(/<JoinAccessCard\s/);
    expect(page.indexOf('<JoinAccessCard')).toBeLessThan(page.indexOf('role="tablist"'));
  });

  for (const rel of ['pages/teacher', 'features/teacher']) {
    it(`${rel} ne lit pas .email d’un élève`, () => {
      for (const file of walk(resolve(src, rel))) {
        if (ALLOWED.some((re) => re.test(file))) continue;
        const code = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        expect(code, `${file} lit un courriel`).not.toMatch(/\.email\b/);
      }
    });
  }
});
