import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(SRC, p), 'utf8');

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
    expect(source).toContain('Conditions Générales d’Utilisation');
    expect(source).toContain('Politique de confidentialité');
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
    expect(source).toContain('registerRequest({ email, password, acceptLegal })');
  });

  it('conduit vers la vérification, et non vers l’espace élève', () => {
    expect(source).toContain("navigate('/verification-email')");
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
    expect(source).toContain('googleRedirectUrl()');
  });
});

describe('Le service d’authentification', () => {
  const source = read('services/authService.js');

  it('n’envoie qu’un booléen de consentement — jamais une version', () => {
    expect(source).toContain('accept_legal: acceptLegal');
    expect(source).not.toMatch(/terms_accepted_version\s*:/);
    expect(source).not.toMatch(/privacy_policy_accepted_version\s*:/);
  });

  it('lit les versions depuis le serveur, en lecture seule', () => {
    expect(source).toContain('/legal/versions');
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
  const pages = {
    CGU: read('pages/legal/CGU.jsx'),
    Confidentialité: read('pages/legal/Confidentialite.jsx'),
    'Mentions légales': read('pages/legal/MentionsLegales.jsx'),
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

  it('n’annoncent ni offre mensuelle, ni période d’essai, ni quota', () => {
    for (const [nom, source] of Object.entries(pages)) {
      expect(source, nom).not.toMatch(/5\s*€\s*\/\s*mois/i);
      expect(source, nom).not.toMatch(/essai gratuit de \d+ jours/i);
      expect(source, nom).not.toMatch(/chatbot/i);
    }
  });

  it('n’affirment pas conserver l’adresse IP — le code ne la stocke pas', () => {
    expect(pages['Confidentialité']).not.toMatch(/adresse IP[^.]{0,40}(conserv|collect|stock)/i);
  });

  it('annoncent le tarif réel : 35 € par an', () => {
    expect(pages.CGU).toMatch(/35\s*(&nbsp;| | | )?€/);
    expect(pages.CGU).toMatch(/an(nuel)?/i);
  });

  it('portent la version qui correspond à celle du serveur', () => {
    expect(pages.CGU).toContain('12 septembre 2026');
    expect(pages['Confidentialité']).toContain('12 septembre 2026');
  });

  it('nomment l’éditeur et son immatriculation', () => {
    expect(pages['Mentions légales']).toContain('937795003');
    expect(pages['Mentions légales']).toMatch(/Toulouse/);
    expect(pages['Mentions légales']).toContain('contact@smarter-academy.fr');
  });

  /**
   * LA POLITIQUE SUR LES MINEURS — sa moitié la plus facile à perdre.
   *
   * Le principe produit est qu'un élève mineur reçoit EXACTEMENT le même
   * enseignement qu'un majeur : la distinction est juridique, jamais
   * pédagogique. Une reformulation maladroite des documents pourrait
   * laisser croire l'inverse, sans casser aucun test de rendu.
   */
  it('affirment que l’enseignement est identique quel que soit l’âge', () => {
    expect(pages.CGU).toMatch(/même service pédagogique|même enseignement/i);
    expect(pages.CGU).toMatch(/Aucune restriction pédagogique n’est liée à l’âge/i);
  });

  it('ne promettent AUCUN outillage de vérification d’âge ou de consentement parental', () => {
    // Ces dispositifs n'existent pas : les documents doivent le DIRE.
    // Le texte a le droit de NOMMER un tableau de bord parental — il le fait
    // précisément pour annoncer son absence (« ni tableau de bord
    // parental ») — donc on vérifie la négation, pas le simple mot.
    const plat = (t) => t.replace(/<\/?strong>/g, '').replace(/\s+/g, ' ');
    expect(plat(pages.CGU)).toMatch(/aucun dispositif technique de vérification de l’âge/i);
    expect(plat(pages['Confidentialité'])).toMatch(/aucun formulaire de consentement parental/i);
    expect(plat(pages.CGU)).toMatch(/ni tableau de bord parental/i);
    expect(plat(pages.CGU)).toMatch(/aucun recueil automatisé du consentement parental/i);
  });

  it('n’interdisent pas le Premium aux mineurs — ils exigent une autorisation', () => {
    expect(pages.CGU).toMatch(/autorisé par son représentant légal/i);
    expect(pages.CGU).toMatch(/Il ne s’agit en aucun cas d’interdire le Premium aux mineurs/i);
  });

  it('donnent au représentant légal une voie de recours par e-mail', () => {
    // Le JSX coupe les phrases en fin de ligne : on normalise les blancs
    // avant de chercher, sinon on testerait la mise en forme du fichier.
    const plat = (t) => t.replace(/\s+/g, ' ');
    for (const nom of ['CGU', 'Confidentialité']) {
      expect(plat(pages[nom]), nom).toMatch(/sans son (autorisation|accord)/i);
      expect(plat(pages[nom]), nom).toMatch(/contact@smarter-academy\.fr|<Mail \/>/);
    }
  });

  it('ne demandent pas de date de naissance', () => {
    expect(pages['Confidentialité']).toMatch(/Aucune date de naissance n’est demandée/i);
  });

  /**
   * La rétractation : le texte a été ADOUCI sur décision de l'éditeur —
   * le délai de quatorze jours s'applique, et aucun renoncement n'est
   * opposé puisque rien ne le recueille dans l'interface.
   */
  it('n’opposent pas un renoncement à la rétractation qui n’est pas recueilli', () => {
    expect(pages.CGU).toMatch(/n’est pas opposée/i);
    expect(pages.CGU).toMatch(/quatorze jours/i);
  });

  it('ne prétendent pas qu’un médiateur est déjà désigné', () => {
    expect(pages.CGU).toMatch(/dès leur désignation/i);
  });

  it('ne prétendent à aucune purge automatique', () => {
    expect(pages['Confidentialité']).toMatch(/aucun mécanisme de purge automatique/i);
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
    expect(source).toMatch(/Renvoyer l’e-mail/);
    expect(source).toMatch(/Se déconnecter/);
  });

  it('ne propose PAS un changement d’adresse que le serveur ne sait pas faire', () => {
    // Dans le CODE : l'en-tête du fichier explique pourquoi ce bouton est
    // absent, et cette explication ne doit pas passer pour sa présence.
    expect(code).not.toMatch(/Modifier mon adresse/);
  });

  it('distingue les trois retours possibles du lien', () => {
    for (const statut of ['succes', 'deja-verifie', 'invalide']) {
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
    for (const raison of ['already_linked', 'email_not_verified', 'provider_failure', 'annule']) {
      expect(source).toContain(raison);
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
