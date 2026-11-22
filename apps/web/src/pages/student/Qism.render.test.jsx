import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import '../../i18n';
import { AuthContext } from '../../context/AuthContext';
import { StudyContextContext } from '../../context/StudyContextContext';
import { ContentAvailabilityContext } from '../../context/ContentAvailabilityContext';
import Qism from './Qism';

const noop = async () => {};

function render(studyContext, url = '/espace/qism') {
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
  it('le formulaire montre le texte de partage et « أوافق وأنضمّ »', () => {
    const html = render(INDEPENDENT);
    expect(html).toContain('data-qism-sharing');
    expect(html).toContain('أوافق وأنضمّ');
    expect(html).toContain('بريدك الإلكتروني');
  });

  it('une adhésion à confirmer reçoit sa carte, les autres non', () => {
    const html = render({
      mode: 'classroom',
      primary: null,
      hiddenLessonCodes: [],
      classrooms: [
        { id: 1, name: 'قسم أ', grade: '4am', consentRequired: true },
        { id: 2, name: 'قسم ب', grade: '4am', consentRequired: false },
      ],
    });
    expect(html).toContain('data-qism-consent-required="1"');
    expect(html).not.toContain('data-qism-consent-required="2"');
  });

  it('sans suggestion, la section « اقتراحات أستاذك » est absente', () => {
    expect(render(INDEPENDENT)).not.toContain('data-qism-recommendations');
  });

  it('l’ancien ?token= d’invitation n’a plus d’effet : aucune carte, aucune adhésion', () => {
    const html = render(INDEPENDENT, '/espace/qism?token=abc');
    expect(html).not.toContain('data-qism-invitation');
    expect(html).not.toContain('data-qism-joined');
  });

  it('arrivé depuis le lien de classe : la confirmation nomme le قسم rejoint', () => {
    const html = render(INDEPENDENT, { pathname: '/espace/qism', state: { joinedClassroom: 'رياضيات 4م2', alreadyMember: false } });
    expect(html).toContain('data-qism-joined');
    expect(html).toContain('رياضيات 4م2');
  });

  it('déjà membre : « أنت في هذا القسم بالفعل » plutôt qu’une nouvelle adhésion', () => {
    const html = render(INDEPENDENT, { pathname: '/espace/qism', state: { joinedClassroom: 'رياضيات 4م2', alreadyMember: true } });
    expect(html).toContain('أنت في هذا القسم بالفعل');
  });

  it('déjà dans un قسم : pas de formulaire du code, et la règle « قسم واحد » est dite', () => {
    const html = render({
      mode: 'classroom',
      primary: { id: 1, name: 'قسم أ', grade: '4am' },
      hiddenLessonCodes: [],
      classrooms: [{ id: 1, name: 'قسم أ', grade: '4am', consentRequired: false }],
    });
    expect(html).not.toContain('data-qism-join');
    expect(html).not.toContain('id="join-code"');
    expect(html).toContain('data-qism-one-class');
  });

  it('sans قسم : le formulaire du code est là', () => {
    const html = render(INDEPENDENT);
    expect(html).toContain('data-qism-join');
    expect(html).toContain('id="join-code"');
  });
});
