import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import './../i18n';
import { AuthContext } from '../context/AuthContext';
import JoinClassLink from './JoinClassLink';

/**
 * La page du lien de classe. Son comportement dynamique (aperçu, adhésion,
 * redirections) est couvert de bout en bout par e2e/class-join-link.mjs ;
 * ici, les garanties qui se lisent dans la source et au premier rendu.
 */
const src = readFileSync(new URL('./JoinClassLink.jsx', import.meta.url), 'utf8');

function render(url, auth = { user: null, token: null, loading: false }) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[url]}>
      <AuthContext.Provider value={auth}>
        <Routes>
          <Route path="/rejoindre/classe/:token" element={<JoinClassLink />} />
          <Route path="/rejoindre/:token" element={<JoinClassLink />} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('JoinClassLink — ouvrir un lien ne vaut pas consentement', () => {
  it('aucun effet ne rejoint, sauf par autoJoinRequest (le geste gardé POUR CE LIEN)', () => {
    const effects = src.split('useEffect(').slice(1).map((chunk) => chunk.split('}, [')[0]);
    for (const body of effects) {
      expect(body).not.toMatch(/joinClassGroup/);
      if (/\bjoin\(/.test(body)) expect(body).toMatch(/autoJoinRequest\(/);
    }
  });

  it('chaque bouton de consentement du visiteur garde l’intention avant de partir', () => {
    expect(src).toMatch(/consentThen\('\/register'\)/);
    expect(src).toMatch(/consentThen\('\/login'\)/);
    expect(src).toMatch(/const consentThen = \(path\) => \{\s*savePendingClassJoin\(/);
  });

  it('le texte de partage partagé avec قسمي est affiché avant les boutons', () => {
    expect(src).toMatch(/import SharingDisclosure from '..\/components\/student\/SharingDisclosure'/);
    // Une classe d'établissement nomme aussi l'établissement dans le MÊME texte.
    const disclosure = src.indexOf('<SharingDisclosure schoolName={preview.schoolName} />');
    expect(disclosure).toBeGreaterThan(-1);
    expect(disclosure).toBeLessThan(src.indexOf("consentThen('/register')"));
  });

  it('après l’adhésion, le compte, le قسم et l’accès sont relus AVANT d’aller à « قسمي » (pas de rechargement)', () => {
    const goToClass = src.slice(src.indexOf('const goToClass'), src.indexOf("navigate('/espace/qism'"));
    expect(goToClass).toMatch(/refreshUser/);
    expect(goToClass).toMatch(/refreshStudyContext\(\)/);
    expect(goToClass).toMatch(/refreshAvailability\(\)/);
    // …y compris pour « déjà membre » : aucune condition ne les saute.
    expect(goToClass).not.toMatch(/if \(!alreadyMember\)/);
  });

  it('déjà dans un AUTRE قسم : l’avis passe avant le bouton de consentement, et rien ne rejoint seul', () => {
    const other = src.indexOf('verifiedStudent && preview.currentClassroomName');
    expect(other).toBeGreaterThan(-1);
    expect(other).toBeLessThan(src.indexOf("join({ link: linkToken, consent: true })"));
    const autoEffect = src.slice(src.indexOf('const request = autoJoinRequest('), src.indexOf('/** Le geste du visiteur'));
    expect(autoEffect.indexOf('preview.currentClassroomName')).toBeLessThan(autoEffect.indexOf('join(request)'));
  });

  it('aucune URL de redirection n’est lue dans la requête (pas de ?next=)', () => {
    expect(src).not.toMatch(/searchParams|useSearchParams|\bnext=/);
  });
});

describe('JoinClassLink — premier rendu', () => {
  it('un jeton mal formé (ancienne invitation, lien tronqué) → « رابط غير صالح » sans appel', () => {
    const html = render('/rejoindre/abc');
    expect(html).toContain('data-join-link-invalid');
    expect(html).toContain('رابط غير صالح');
    expect(html).toContain('href="/"');
  });

  it('un jeton bien formé attend l’aperçu du serveur', () => {
    const html = render(`/rejoindre/classe/${'a'.repeat(32)}`);
    expect(html).toContain('جاري فتح رابط الانضمام');
    expect(html).not.toContain('data-join-link-invalid');
  });
});
