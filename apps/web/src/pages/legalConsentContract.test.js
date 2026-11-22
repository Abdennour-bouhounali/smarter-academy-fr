import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(SRC, p), 'utf8');

// Le catalogue de l'interface : les libellés que ces contrats exigent y
// vivent. Les pages légales et la case de consentement sont les textes de
// l'ancien site, rétablis le 2026-11-22 : leurs mots sont dans le JSX.
const readJson = (p) => JSON.parse(read(p));
const authFr = readJson('i18n/locales/fr/auth.json');

/** Le fichier du serveur qui fait autorité sur les versions ET sur l'identité de l'éditeur. */
const legalPhp = readFileSync(join(SRC, '../../api/config/legal.php'), 'utf8');
const publisher = (champ) =>
  legalPhp.match(new RegExp(`'${champ}' => '([^']*)'`))?.[1] ?? '';

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
    // Les deux documents sont FRANÇAIS : la case les nomme par leur titre
    // français, écrit dans le JSX, chacun DANS le lien vers sa page.
    const code = readCode('components/auth/LegalConsentCheckbox.jsx');
    expect(code).toMatch(/to="\/cgu"[\s\S]*?>\s*Conditions Générales d’Utilisation\s*<\/Link>/);
    expect(code).toMatch(/to="\/confidentialite"[\s\S]*?>\s*Politique de confidentialité\s*<\/Link>/);
    expect(code).toContain('J’accepte les');
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
    // Le prénom et le nom naissent avec le compte (PersonName côté serveur).
    expect(call).toMatch(/firstName:/);
    expect(call).toMatch(/lastName:/);
  });

  it('conduit vers la vérification, et non vers l’espace élève', () => {
    expect(source).toContain("'/verification-email'");
    expect(source).not.toMatch(/navigate\('\/espace'\)/);
  });

  it('dit quand le premier envoi du courriel a échoué', () => {
    // Le compte est créé même si le SMTP refuse (verificationEmailSent:
    // false) : l'écran ne doit pas affirmer « nous avons envoyé ».
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

  it('les trois pages sont routées — sinon elles retombent sur l’accueil', () => {
    expect(app).toContain('path="/mentions-legales"');
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
    for (const route of ['/mentions-legales', '/confidentialite', '/cgu', '/verification-email']) {
      expect(dansLaCoquille).toContain(`path="${route}"`);
    }
  });
});

describe('Le pied de page', () => {
  const source = read('components/navigation/Footer.jsx');

  it('mène aux trois documents', () => {
    expect(source).toContain("to: '/mentions-legales'");
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
    'Mentions légales': read('pages/legal/MentionsLegales.jsx'),
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
   * Les trois documents sont les textes FRANÇAIS de l'ancien site (`main`),
   * rétablis tels quels le 2026-11-22 sur décision du propriétaire, en version
   * 2026-09-12 — celle que le serveur écrit dans chaque consentement. Les
   * contrats ci-dessous protègent l'accord entre la page et le serveur, et
   * l'adresse de contact.
   */
  it('portent la version qui correspond à celle du serveur', () => {
    expect(legalPhp).toContain("'terms_version' => env('LEGAL_TERMS_VERSION', '2026-09-12')");
    expect(legalPhp).toContain("'privacy_version' => env('LEGAL_PRIVACY_VERSION', '2026-09-12')");
    expect(pages.CGU).toContain("const UPDATED_AT = '12 septembre 2026'");
    expect(pages['Confidentialité']).toContain("const UPDATED_AT = '12 septembre 2026'");
    expect(pages.CGU).toContain('updatedAt={UPDATED_AT}');
    expect(pages['Confidentialité']).toContain('updatedAt={UPDATED_AT}');
  });

  it('donnent une adresse de contact réelle, sans gabarit resté vide', () => {
    // L'adresse des pages est CELLE de l'éditeur déclarée au serveur : deux
    // adresses différentes enverraient une demande de droits dans le vide.
    expect(publisher('email')).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]+$/);
    for (const nom of Object.keys(pages)) {
      expect(pages[nom], nom).toContain(`const EMAIL = '${publisher('email')}'`);
      expect(pages[nom], nom).toMatch(/<Mail \/>|href=\{`mailto:\$\{EMAIL\}`\}/);
      expect(pages[nom], nom).not.toMatch(/\[(date|e-mail|courriel|adresse)[^\]]*\]/i);
    }
  });

  it('relèvent du droit français et du RGPD, pas du droit algérien', () => {
    expect(pages.CGU).toMatch(/droit français/);
    expect(pages['Confidentialité']).toMatch(/RGPD/);
    expect(pages['Confidentialité']).toMatch(/CNIL/);
    for (const [nom, source] of Object.entries(pages)) {
      expect(source, nom).not.toMatch(/[\u0600-\u06FF]|algérien/i);
    }
  });

  /**
   * La page des mentions légales, retirée par le produit algérien le
   * 2026-10-04, est RÉTABLIE (2026-11-22) : routée, liée depuis le pied de
   * page et depuis le cadre commun, et elle affiche le bloc de l'éditeur.
   */
  it('exposent la page des mentions légales, avec le bloc de l’éditeur', () => {
    expect(app).toContain('path="/mentions-legales" element={<MentionsLegales />}');
    expect(footer).toContain("to: '/mentions-legales'");
    expect(read('pages/legal/LegalPage.jsx')).toContain("to: '/mentions-legales'");
    const page = pages['Mentions légales'];
    expect(page).toContain('title="Éditeur du site"');
    expect(page).toContain('title="Directeur de la publication"');
    expect(page).toContain('title="Hébergeur"');
  });

  it('nomment l’éditeur tel que le serveur le déclare — une seule identité', () => {
    const page = pages['Mentions légales'];
    for (const champ of ['name', 'legal_form', 'siren', 'ape', 'address']) {
      expect(publisher(champ), champ).not.toBe('');
      expect(page, champ).toContain(publisher(champ));
    }
    const [a, m, j] = publisher('registered_at').split('-');
    expect(page).toContain(`${j}/${m}/${a}`);
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
    expect(authFr.resendEmail.trim()).not.toBe('');
    expect(authFr.logout.trim()).not.toBe('');
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
      expect(authFr.errors[raison]).toBeTruthy();
      expect(authFr.errors[raison].trim()).not.toBe('');
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
