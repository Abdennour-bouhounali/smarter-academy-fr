import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import '../../i18n';
import { AuthContext } from '../../context/AuthContext';
import { StudyContextContext } from '../../context/StudyContextContext';
import { ContentAvailabilityContext } from '../../context/ContentAvailabilityContext';
import Qism from './Qism';

const noop = async () => {};

function render(studyContext, url = '/espace/classe') {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[url]}>
      <AuthContext.Provider value={{ token: 'tk', user: { role: 'student' } }}>
        <StudyContextContext.Provider value={{ studyContext, refresh: noop }}>
          <ContentAvailabilityContext.Provider value={{ refresh: noop, hiddenByClassCount: 0 }}>
            <Qism />
          </ContentAvailabilityContext.Provider>
        </StudyContextContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

const INDEPENDENT = { mode: 'independent', classrooms: [], primary: null, hiddenLessonCodes: [] };

describe('Qism — rejoindre, c’est consentir', () => {
  it('le formulaire montre le texte de partage et « J’accepte et je rejoins la classe »', () => {
    const html = render(INDEPENDENT);
    expect(html).toContain('data-qism-sharing');
    expect(html).toContain('J’accepte et je rejoins la classe');
    expect(html).toContain('ton adresse e-mail');
  });

  it('une adhésion à confirmer reçoit sa carte, les autres non', () => {
    const html = render({
      mode: 'classroom',
      primary: null,
      hiddenLessonCodes: [],
      classrooms: [
        { id: 1, name: 'Classe A', grade: '4am', consentRequired: true },
        { id: 2, name: 'Classe B', grade: '4am', consentRequired: false },
      ],
    });
    expect(html).toContain('data-qism-consent-required="1"');
    expect(html).not.toContain('data-qism-consent-required="2"');
  });

  it('sans suggestion, la section « Les conseils de ton professeur » est absente', () => {
    expect(render(INDEPENDENT)).not.toContain('data-qism-recommendations');
  });

  it('l’ancien ?token= d’invitation n’a plus d’effet : aucune carte, aucune adhésion', () => {
    const html = render(INDEPENDENT, '/espace/classe?token=abc');
    expect(html).not.toContain('data-qism-invitation');
    expect(html).not.toContain('data-qism-joined');
  });

  it('arrivé depuis le lien de classe : la confirmation nomme la classe rejointe', () => {
    const html = render(INDEPENDENT, { pathname: '/espace/classe', state: { joinedClassroom: 'Maths 3e B', alreadyMember: false } });
    expect(html).toContain('data-qism-joined');
    expect(html).toContain('Maths 3e B');
  });

  it('déjà membre : « Tu es déjà dans cette classe » plutôt qu’une nouvelle adhésion', () => {
    const html = render(INDEPENDENT, { pathname: '/espace/classe', state: { joinedClassroom: 'Maths 3e B', alreadyMember: true } });
    expect(html).toContain('Tu es déjà dans cette classe');
  });

  it('déjà dans une classe : pas de formulaire du code, et la règle « une seule classe » est dite', () => {
    const html = render({
      mode: 'classroom',
      primary: { id: 1, name: 'Classe A', grade: '4am' },
      hiddenLessonCodes: [],
      classrooms: [{ id: 1, name: 'Classe A', grade: '4am', consentRequired: false }],
    });
    expect(html).not.toContain('data-qism-join');
    expect(html).not.toContain('id="join-code"');
    expect(html).toContain('data-qism-one-class');
  });

  it('sans classe : le formulaire du code est là', () => {
    const html = render(INDEPENDENT);
    expect(html).toContain('data-qism-join');
    expect(html).toContain('id="join-code"');
  });
});
