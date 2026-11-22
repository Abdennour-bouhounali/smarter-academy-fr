import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(SRC, p), 'utf8');

// Les catalogues arabes : l'interface élève/visiteur est arabe, donc les
// libellés que ces contrats exigent vivent ici et non dans le JSX.
const readJson = (p) => JSON.parse(read(p));
const marketingAr = readJson('i18n/locales/ar/marketing.json');
const authAr = readJson('i18n/locales/ar/auth.json');

/**
 * La source PRIVÉE DE SES COMMENTAIRES.
 *
 * Ces fichiers expliquent longuement pourquoi ils n'emploient PAS telle
 * pratique — « pas de <label> englobant », « aucune variable VITE_GOOGLE_* ».
 * Une recherche naïve retrouverait ces phrases et conclurait exactement
 * l'inverse de ce qu'elles disent. On interroge donc le code, pas la prose.
 */
const readCode = (p) =>
  read(p)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

/**
 * LE CONTRAT DE L'INSCRIPTION ET DES PAGES LÉGALES.
 *
 * Ces tests lisent la SOURCE, comme les autres suites de contrat de ce dépôt
 * (abonnementContract, checkoutContract) : le projet ne rend pas de DOM en
 * test — ni jsdom, ni testing-library — et en ajouter pour ces écrans seuls
 * introduirait une dépendance et une façon de tester que personne d'autre
 * n'emploie ici.
 *
 * Ce qu'ils protègent : des régressions qui ne casseraient aucun rendu mais
 * videraient la mesure de sa substance — une case rendue facultative, un lien
 * qui cesse de pointer vers le bon document, une inscription qui repart vers
 * l'espace élève en sautant la vérification.
 */

describe('La case de consentement', () => {
  const source = read('components/auth/LegalConsentCheckbox.jsx');
  const code = readCode('components/auth/LegalConsentCheckbox.jsx');

  it('pointe vers les deux documents, aux routes internes', () => {
    expect(source).toContain('to="/cgu"');
    expect(source).toContain('to="/confidentialite"');
  });

  it('n’emploie AUCUNE adresse externe — surtout pas celles d’un autre site', () => {
    expect(source).not.toMatch(/metmat/i);
    expect(source).not.toMatch(/https?:\/\/(?!fonts\.)/);
  });

  it('porte les deux intitulés exigés', () => {
    // L'interface est ARABE : les deux intitulés ne sont plus écrits dans le
    // JSX mais rendus depuis le catalogue de traduction. Le contrat tient
    // toujours — la case doit nommer les deux documents — mais il se vérifie
    // désormais en deux temps : la clé est posée ici, le texte existe là-bas.
    expect(source).toContain("t('consent.terms')");
    expect(source).toContain("t('consent.privacy')");
    expect(marketingAr.consent.terms.trim()).not.toBe('');
    expect(marketingAr.consent.privacy.trim()).not.toBe('');
  });

  it('relie la case à son libellé par id/htmlFor, sans imbrication interactive', () => {
    expect(source).toContain('htmlFor={id}');
    expect(source).toContain('id={id}');
    // Un <label> qui ENVELOPPE la case produirait des commandes imbriquées.
    // C'est le CODE qu'on interroge : le commentaire d'en-tête décrit
    // justement cette structure pour dire qu'on l'évite.
    expect(code).not.toMatch(/<label[^>]*>[\s\S]*?<input/);
  });

  it('ouvre les documents sans soumettre ni cocher le formulaire', () => {
    expect(source).toContain('stopPropagation');
    expect(source).toContain('rel="noopener noreferrer"');
  });

  it('annonce son erreur aux lecteurs d’écran', () => {
    expect(source).toContain("role=\"alert\"");
    expect(source).toContain('aria-describedby');
    expect(source).toContain('aria-invalid');
  });
});

describe('La page d’inscription', () => {
  const source = read('pages/Register.jsx');

  it('affiche la case et le bouton Google', () => {
    expect(source).toContain('LegalConsentCheckbox');
    expect(source).toContain('GoogleButton');
  });

  it('bloque l’envoi tant que la case n’est pas cochée', () => {
    expect(source).toMatch(/if \(!acceptLegal\)/);
    expect(source).toMatch(/setConsentError\(/);
    // Et le retour anticipé : sans lui, le contrôle n'arrêterait rien.
    expect(source).toMatch(/if \(!acceptLegal\)[\s\S]{0,300}?return;/);
  });

  it('transmet le consentement au serveur', () => {
    // `accountType` (élève ou enseignant) part avec le consentement ; la liste
    // blanche est tenue par le serveur.
    const call = source.match(/registerRequest\(\{[\s\S]*?\}\)/)?.[0] ?? '';
    expect(call).toMatch(/\bacceptLegal\b/);
    expect(call).toMatch(/\baccountType\b/);
    // « الاسم و اللقب » naissent avec le compte (PersonName côté serveur).
    expect(call).toMatch(/firstName:/);
    expect(call).toMatch(/lastName:/);
  });

  it('conduit vers la vérification, et non vers l’espace élève', () => {
    expect(source).toContain("'/verification-email'");
    expect(source).not.toMatch(/navigate\('\/espace'\)/);
  });

  it('dit quand le premier envoi du courriel a échoué', () => {
    // Le compte est créé même si le SMTP refuse (verificationEmailSent:
    // false) : l'écran ne doit pas affirmer « أرسلنا ».
    expect(source).toContain('verificationEmailSent === false');
    expect(source).toContain('/verification-email?statut=envoi-echoue');
  });
});

describe('La page de connexion', () => {
  const source = read('pages/Login.jsx');

  it('propose Google sans retirer le mot de passe', () => {
    expect(source).toContain('GoogleButton');
    expect(source).toContain('loginRequest(email, password)');
  });

  it('oriente un élève non vérifié vers l’écran de vérification', () => {
    expect(source).toContain("emailVerified === false ? '/verification-email' : '/espace'");
  });

  it('n’altère pas la destination des administrateurs', () => {
    expect(source).toContain("if (user.role === 'admin') return '/admin';");
  });
});

describe('Le bouton Google', () => {
  const source = read('components/auth/GoogleButton.jsx');
  const code = readCode('components/auth/GoogleButton.jsx');

  it('ne contient AUCUN secret ni identifiant client', () => {
    expect(code).not.toMatch(/VITE_GOOGLE/);
    expect(code).not.toMatch(/client_secret/i);
    expect(code).not.toMatch(/GOCSPX/);
    expect(code).not.toMatch(/apps\.googleusercontent\.com/);
  });

  it('part par une navigation vers notre propre API', () => {
    // Le type de compte choisi part avec la navigation vers NOTRE API — jamais
    // vers Google directement, et sans aucun secret côté navigateur.
    expect(source).toContain('googleRedirectUrl(accountType)');
  });
});

describe('Le service d’authentification', () => {
  const source = read('services/authService.js');

  it('n’envoie qu’un booléen de consentement — jamais une version', () => {
    expect(source).toContain('accept_legal: acceptLegal');
    expect(source).not.toMatch(/terms_accepted_version\s*:/);
    expect(source).not.toMatch(/privacy_policy_accepted_version\s*:/);
  });

  it('ne transmet jamais l’adresse au renvoi — le serveur la connaît', () => {
    const bloc = source.slice(source.indexOf('export async function resendVerificationEmail'));
    expect(bloc.slice(0, 600)).not.toMatch(/body:/);
  });
});

describe('Les routes légales', () => {
  const app = read('App.jsx');

  it('les deux pages sont routées — sinon elles retombent sur l’accueil', () => {
    expect(app).toContain('path="/confidentialite"');
    expect(app).toContain('path="/cgu"');
  });

  it('les écrans d’authentification sont routés eux aussi', () => {
    expect(app).toContain('path="/verification-email"');
    expect(app).toContain('path="/auth/google"');
  });

  it('elles vivent sous la coquille visiteur, donc avec le pied de page', () => {
    const bloc = app.slice(app.indexOf('<Route element={<MainLayout />}>'));
    const fin = bloc.indexOf('</Route>');
    const dansLaCoquille = bloc.slice(0, fin);
    for (const route of ['/confidentialite', '/cgu', '/verification-email']) {
      expect(dansLaCoquille).toContain(`path="${route}"`);
    }
  });
});

describe('Le pied de page', () => {
  const source = read('components/navigation/Footer.jsx');

  it('mène aux deux documents', () => {
    expect(source).toContain("to: '/confidentialite'");
    expect(source).toContain("to: '/cgu'");
  });

  it('n’emploie aucune adresse externe pour ces documents', () => {
    expect(source).not.toMatch(/metmat/i);
  });
});

describe('Les pages légales elles-mêmes', () => {
  const app = read('App.jsx');
  const footer = read('components/navigation/Footer.jsx');
  const pages = {
    CGU: read('pages/legal/CGU.jsx'),
    Confidentialité: read('pages/legal/Confidentialite.jsx'),
  };

  /**
   * LE test d'exactitude. Ces documents ont été écrits à partir d'un modèle
   * venu d'une AUTRE plateforme ; ce sont ces affirmations-là qui, recopiées
   * sans examen, transformeraient une page légale en fausse déclaration.
   */
  it('ne mentionnent aucun prestataire que la plateforme n’emploie pas', () => {
    const absents = [
      /supabase/i, /vercel/i, /posthog/i, /upstash/i, /sentry/i,
      /metmat/i, /session replay/i, /amazon web services/i,
    ];
    for (const [nom, source] of Object.entries(pages)) {
      for (const interdit of absents) {
        expect(source, `${nom} mentionne ${interdit}`).not.toMatch(interdit);
      }
    }
  });

  /**
   * CGU et politique de confidentialité : depuis le 2026-10-04, texte arabe
   * fourni par le propriétaire (droit algérien), repris tel quel. Les
   * contrats ci-dessous protègent ce qui a été RAJOUTÉ au modèle — la date,
   * l'adresse de contact — et ce qui ne doit pas y revenir.
   */
  it('portent la version qui correspond à celle du serveur', () => {
    const legal = readFileSync(join(SRC, '../../api/config/legal.php'), 'utf8');
    expect(legal).toContain("'terms_version' => env('LEGAL_TERMS_VERSION', '2026-10-04')");
    expect(legal).toContain("'privacy_version' => env('LEGAL_PRIVACY_VERSION', '2026-10-04')");
    expect(pages.CGU).toContain('4 أكتوبر 2026');
    expect(pages['Confidentialité']).toContain('4 أكتوبر 2026');
  });

  it('donnent une adresse de contact réelle, sans gabarit resté vide', () => {
    for (const nom of ['CGU', 'Confidentialité']) {
      expect(pages[nom], nom).toContain("const EMAIL = 'contact@smarter-academy.com'");
      expect(pages[nom], nom).toContain('<Mail />');
      expect(pages[nom], nom).not.toMatch(/\[(التاريخ|البريد الإلكتروني|العنوان القانوني)\]/);
      expect(pages[nom], nom).not.toMatch(/smarter-academy\.fr/);
    }
  });

  it('relèvent du droit algérien, pas du RGPD', () => {
    expect(pages.CGU).toMatch(/الجمهورية الجزائرية/);
    expect(pages['Confidentialité']).toMatch(/في الجزائر/);
    for (const nom of ['CGU', 'Confidentialité']) {
      expect(pages[nom], nom).not.toMatch(/RGPD|CNIL/);
    }
  });

  /**
   * La page « معلومات قانونية » (mentions légales, éditeur français) a été
   * retirée le 2026-10-04 sur décision du propriétaire : ni route, ni lien.
   */
  it('n’exposent plus la page des mentions légales', () => {
    expect(app).not.toContain('/mentions-legales');
    expect(footer).not.toContain('/mentions-legales');
    expect(read('pages/legal/LegalPage.jsx')).not.toContain('/mentions-legales');
  });

  it('ne nomment aucun tribunal précis', () => {
    expect(pages.CGU).not.toMatch(/tribunal (de|judiciaire) (de )?(Toulon|Toulouse|Paris)/i);
  });

  it('ouvrent sur un h1 et structurent en h2', () => {
    for (const [nom, source] of Object.entries(pages)) {
      expect(source, nom).toMatch(/<h1|as="h1"|title=/);
    }
  });
});

describe('L’écran de vérification', () => {
  const source = read('pages/VerificationEmail.jsx');
  const code = readCode('pages/VerificationEmail.jsx');

  it('propose le renvoi et la déconnexion', () => {
    expect(source).toContain('resendVerificationEmail');
    // Mêmes deux gestes, libellés en arabe via le catalogue.
    expect(source).toContain("t('resendEmail')");
    expect(source).toContain("t('logout')");
    expect(authAr.resendEmail.trim()).not.toBe('');
    expect(authAr.logout.trim()).not.toBe('');
  });

  it('ne propose PAS un changement d’adresse que le serveur ne sait pas faire', () => {
    // Dans le CODE : l'en-tête du fichier explique pourquoi ce bouton est
    // absent, et cette explication ne doit pas passer pour sa présence.
    expect(code).not.toMatch(/Modifier mon adresse/);
  });

  it('distingue les retours possibles du lien et l’échec du premier envoi', () => {
    for (const statut of ['succes', 'deja-verifie', 'invalide', 'envoi-echoue']) {
      expect(source).toContain(statut);
    }
  });

  it('signale ses états à l’assistance technique', () => {
    expect(source).toContain('role="alert"');
    expect(source).toContain('role="status"');
  });
});

describe('Le retour de Google', () => {
  const source = read('pages/AuthGoogle.jsx');

  it('exige le consentement avant de créer le compte', () => {
    expect(source).toContain('LegalConsentCheckbox');
    expect(source).toMatch(/if \(!acceptLegal\)[\s\S]{0,300}?return;/);
    expect(source).toContain('completeGoogleSignup');
  });

  it('ne consomme le jeton qu’une seule fois', () => {
    expect(source).toContain('consumed.current');
  });

  it('nettoie l’URL au lieu de laisser traîner le jeton', () => {
    expect(source).toContain("replace: true");
  });

  it('traduit chaque refus du serveur en message lisible', () => {
    // Le code d'erreur reste un IDENTIFIANT technique venu du serveur ; c'est
    // sa traduction arabe qui doit exister. La page les résout dynamiquement
    // (`errors.${erreur}`), donc on interroge le catalogue, pas le JSX.
    expect(source).toContain('errors.${erreur}');
    for (const raison of ['already_linked', 'email_not_verified', 'provider_failure', 'annule']) {
      expect(authAr.errors[raison]).toBeTruthy();
      expect(authAr.errors[raison].trim()).not.toBe('');
    }
  });
});


describe('La largeur des pages légales', () => {
  const layout = read('pages/legal/LegalPage.jsx');

  /**
   * La plainte d'origine était que les pages étaient TROP ÉTROITES
   * (max-w-3xl, soit 768px, avec 16px de gouttière). Ce test empêche un
   * retour silencieux à cette valeur.
   */
  it('la page fait 1200px et le texte ~1050px', () => {
    expect(layout).toContain('max-w-[1200px]');
    expect(layout).toContain('max-w-[1050px]');
  });

  it('l’ancienne largeur étroite a bien disparu', () => {
    expect(layout).not.toContain('max-w-3xl');
  });

  it('les gouttières viennent du cadre PARTAGÉ, pas d’une neuvième largeur', () => {
    // `.sa-page` porte déjà 60/40/20px — les redéfinir ici les ferait
    // diverger du reste de la plateforme au premier ajustement.
    expect(layout).toContain('sa-page');
  });
});
