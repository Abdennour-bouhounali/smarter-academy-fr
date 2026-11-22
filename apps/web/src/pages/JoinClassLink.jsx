import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle2, Lock, UserPlus, LogIn, Users, MailCheck } from 'lucide-react';
import { getAllGrades } from '@smarter-academy/core';
import { AuthContext } from '../context/AuthContext';
import { useStudyContext } from '../context/StudyContextContext';
import { useContentAvailability } from '../context/ContentAvailabilityContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { joinClassGroup, previewJoinLink } from '../services/studyContextService';
import AuthShell, { AUTH_TONES } from '../components/auth/AuthShell';
import SharingDisclosure from '../components/student/SharingDisclosure';
import {
  autoJoinRequest,
  clearPendingClassJoin,
  isJoinLinkToken,
  readPendingClassJoin,
  savePendingClassJoin,
} from '../features/classJoin/pendingClassJoin';

/**
 * « /rejoindre/classe/:token » — le LIEN DE CLASSE, ouvert depuis WhatsApp,
 * un SMS ou le tableau, avec ou sans compte.
 *
 * La page ne décide de rien : elle montre ce que le serveur révèle (nom de la
 * classe, professeur, niveau — jamais un identifiant) et conduit
 * l'élève. Chaque cas :
 *
 *   lien invalide / renouvelé         → message clair, retour à l'accueil
 *   adhésions fermées                 → « Inscriptions fermées » (sauf pour un membre)
 *   visiteur                          → texte de partage, puis « J’accepte, je
 *                                       crée mon compte… » / « J’accepte, je me
 *                                       connecte… » : le geste est gardé
 *                                       (pendingClassJoin) et l'adhésion se fait
 *                                       seule au retour, sans code
 *   élève non vérifié                 → d'abord l'adresse ; l'attente survit
 *   élève déjà membre                 → directement « Ma classe » (idempotent)
 *   élève revenu après son geste      → rejoint sans second clic → « Ma classe »
 *   élève connecté, sans geste        → texte de partage + « J’accepte et je rejoins la classe »
 *   professeur / admin                → « réservé aux élèves »
 *
 * ── Ouvrir un lien ne vaut jamais consentement ───────────────────────────
 * Aucune adhésion ne part d'un effet SAUF `autoJoinRequest`, qui n'existe
 * que si l'élève a appuyé sur un bouton de consentement POUR CE LIEN
 * (TEACHER_CLASSROOM_ARCHITECTURE.md § « Consent »). Le serveur l'exige de
 * toute façon (`consent: true`, sinon 422).
 *
 * `/rejoindre/:token` (les anciennes invitations par courriel) aboutit ici
 * aussi : ces jetons n'ont pas le format d'un lien de classe → « lien
 * invalide ».
 */
export default function JoinClassLink() {
  const { t } = useTranslation('student');
  const { token: linkToken } = useParams();
  const { user, token: authToken, loading, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { refresh: refreshStudyContext } = useStudyContext();
  const { refresh: refreshAvailability } = useContentAvailability();
  useDocumentMeta(t('qism.joinLink.metaTitle'), t('qism.joinLink.metaDescription'));

  const [status, setStatus] = useState('loading'); // loading | ready | invalid | error
  const [preview, setPreview] = useState(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);
  const autoTried = useRef(false);

  const isStudent = user?.role === 'student';
  const verifiedStudent = isStudent && user.emailVerified !== false;
  const studentToken = isStudent ? authToken : null;

  const messageFor = (err) => {
    if (err?.type === 'RATE_LIMITED') return t('qism.errors.rate_limited');
    return t(`qism.errors.${err?.reason ?? 'generic'}`, { defaultValue: t('qism.errors.generic') });
  };

  // L'aperçu attend la session : avec le jeton d'un élève, le serveur dit
  // aussi s'il est déjà membre.
  useEffect(() => {
    if (loading || !isJoinLinkToken(linkToken)) return undefined;
    let cancelled = false;
    setStatus('loading');
    previewJoinLink(linkToken, studentToken)
      .then((data) => { if (!cancelled) { setPreview(data); setStatus('ready'); } })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err?.reason === 'invalid' ? 'invalid' : 'error');
        if (err?.reason === 'invalid') clearPendingClassJoin();
      });
    return () => { cancelled = true; };
  }, [loading, linkToken, studentToken]);

  const goToClass = useCallback(async (alreadyMember) => {
    clearPendingClassJoin();
    // Tout ce que l'adhésion vient de changer, relu AVANT d'arriver sur
    // « Ma classe », sans rechargement de la page :
    //   — le compte : un compte neuf reçoit le niveau de la classe, et la
    //     garde « choisis ton niveau » de l'espace élève l'arrêterait sinon ;
    //   — le contexte d'étude : la classe, son professeur, le bandeau d'accueil ;
    //   — l'accès : la couverture par la formule du professeur (« Accès complet »).
    // Aussi quand l'élève était « déjà membre » : la vérification d'adresse a
    // pu rejoindre côté serveur après que ces lectures ont été faites.
    await Promise.all([
      refreshUser?.(),
      refreshStudyContext().catch(() => {}),
      refreshAvailability().catch(() => {}),
    ]);
    navigate('/espace/qism', { replace: true, state: { joinedClassroom: preview?.classroomName ?? '', alreadyMember: Boolean(alreadyMember) } });
  }, [navigate, preview, refreshUser, refreshStudyContext, refreshAvailability]);

  const join = useCallback(async (request) => {
    if (!request) return;
    setJoining(true);
    setError(null);
    try {
      const result = await joinClassGroup(authToken, request);
      await goToClass(result?.alreadyMember);
    } catch (err) {
      // L'attente est levée : un échec (classe complète, fermée…) ne doit
      // pas se rejouer à chaque visite. Le bouton reste là pour réessayer.
      clearPendingClassJoin();
      setError(messageFor(err));
    } finally {
      setJoining(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, goToClass]);

  // Membre → sa classe. Revenu après son geste de consentement POUR CE
  // LIEN (connexion, inscription, Google, adresse vérifiée) → il rejoint sans
  // second clic. Rien d'autre ne rejoint depuis un effet.
  useEffect(() => {
    if (status !== 'ready' || !preview || !verifiedStudent || autoTried.current) return;
    const request = autoJoinRequest(readPendingClassJoin(), linkToken);
    if (preview.alreadyMember) {
      autoTried.current = true;
      // Membre parce que le serveur a rejoint à la vérification de l'adresse
      // (inscription depuis ce lien) : pour l'élève, c'est l'adhésion qu'il
      // vient de demander, pas un « déjà membre ».
      goToClass(!request);
      return;
    }
    if (request && preview.currentClassroomName) {
      // Déjà dans une autre classe : rien ne rejoint, l'attente est levée et la
      // page explique qu'il faut d'abord quitter sa classe.
      autoTried.current = true;
      clearPendingClassJoin();
    } else if (request && preview.joiningOpen) {
      autoTried.current = true;
      join(request);
    } else if (request) {
      // Inscriptions fermées : l'attente est levée, sinon l'accueil
      // (ChooseGrade) renverrait ici sans fin au lieu de proposer l'année.
      autoTried.current = true;
      clearPendingClassJoin();
    }
  }, [status, preview, verifiedStudent, linkToken, goToClass, join]);

  /** Le geste du visiteur : consentir, puis s'authentifier. */
  const consentThen = (path) => {
    savePendingClassJoin({ token: linkToken, classroomName: preview?.classroomName ?? '' });
    navigate(path);
  };

  const gradeName = (code) => getAllGrades().find((g) => g.id === code)?.name ?? code;

  // Un jeton qui n'a pas la forme d'un lien de classe (ancienne invitation,
  // lien tronqué par une messagerie) est invalide sans même interroger l'API.
  if (!isJoinLinkToken(linkToken) || status === 'invalid' || status === 'error') {
    const invalid = status !== 'error';
    return (
      <AuthShell plain title={invalid ? t('qism.joinLink.invalidTitle') : t('qism.errors.generic')}>
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4" data-join-link-invalid>
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-rose-800">{invalid ? t('qism.joinLink.invalidBody') : t('qism.errors.generic')}</p>
        </div>
        <div className="mt-6 grid gap-2 sm:flex">
          {!invalid && (
            <button type="button" onClick={() => window.location.reload()} className="flex h-12 items-center justify-center rounded-xl px-5 text-sm font-semibold text-white" style={{ background: AUTH_TONES.student.gradient }}>{t('qism.joinLink.retry')}</button>
          )}
          <Link to="/" className="flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50">{t('qism.joinLink.home')}</Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell plain title={t('qism.joinLink.heading')} subtitle={t('qism.joinLink.subtitle')}>
      {status === 'loading' || !preview ? (
        <p role="status" className="text-sm text-slate-500">{t('qism.joinLink.loading')}</p>
      ) : (
        <div className="space-y-5" data-join-link-page>
          <ClassSummary preview={preview} gradeName={gradeName} />

          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-rose-800">{error}</p>
            </div>
          )}

          {(() => {
            if (verifiedStudent && preview.alreadyMember) {
              return <Notice icon={CheckCircle2} tone="emerald">{t('qism.joinLink.alreadyMember')}</Notice>;
            }
            if (verifiedStudent && preview.currentClassroomName) {
              return (
                <div data-join-link-other-class>
                  <Notice icon={AlertCircle} tone="amber" title={t('qism.joinLink.otherClassTitle')}>{t('qism.joinLink.otherClassBody', { name: preview.currentClassroomName })}</Notice>
                  <Link to="/espace/qism" className="mt-4 flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50">{t('qism.joinLink.openClass')}</Link>
                </div>
              );
            }
            if (!preview.joiningOpen) {
              return (
                <div data-join-link-closed>
                  <Notice icon={Lock} tone="amber" title={t('qism.joinLink.closedTitle')}>{t('qism.joinLink.closedBody', { name: preview.classroomName })}</Notice>
                  <Link to="/" className="mt-4 flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50">{t('qism.joinLink.home')}</Link>
                </div>
              );
            }
            if (user && !isStudent) {
              return <Notice icon={AlertCircle} tone="amber">{t('qism.joinLink.notAStudent')}</Notice>;
            }
            if (isStudent && !verifiedStudent) {
              return (
                <>
                  <SharingDisclosure schoolName={preview.schoolName} />
                  <Notice icon={MailCheck} tone="sky">{t('qism.joinLink.verifyFirst')}</Notice>
                  <PrimaryButton onClick={() => consentThen('/verification-email')} icon={MailCheck} dataAttr="data-join-link-verify">{t('qism.joinLink.verifyAction')}</PrimaryButton>
                </>
              );
            }
            if (verifiedStudent) {
              return (
                <>
                  <SharingDisclosure schoolName={preview.schoolName} />
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <PrimaryButton onClick={() => join({ link: linkToken, consent: true })} disabled={joining} icon={Users} dataAttr="data-join-link-consent">
                      {joining ? t('qism.joinLink.joining') : t('qism.consentJoin')}
                    </PrimaryButton>
                    <Link to="/espace" className="flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50">{t('qism.joinLink.decline')}</Link>
                  </div>
                </>
              );
            }
            // Visiteur : le texte, puis les deux portes. Le bouton EST le consentement.
            return (
              <>
                <SharingDisclosure schoolName={preview.schoolName} />
                <p className="text-sm text-slate-600">{t('qism.joinLink.afterAuth')}</p>
                {/* Deux lignes pleine largeur, pas deux colonnes : chaque libellé
                    tient sur UNE ligne, même sur téléphone. */}
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500">{t('qism.joinLink.newStudent')}</p>
                    <PrimaryButton onClick={() => consentThen('/register')} icon={UserPlus} dataAttr="data-join-link-register">{t('qism.joinLink.createAndJoin')}</PrimaryButton>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500">{t('qism.joinLink.existingStudent')}</p>
                    <button type="button" onClick={() => consentThen('/login')} data-join-link-login
                      className="flex min-h-[3.5rem] w-full items-center justify-center gap-2.5 rounded-xl border border-slate-300 bg-white px-6 py-3 text-[15px] font-semibold leading-snug text-slate-800 hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-nav-accent/30">
                      <LogIn size={17} aria-hidden="true" /> {t('qism.joinLink.loginAndJoin')}
                    </button>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </AuthShell>
  );
}

/** Ce qui rassure l'élève qu'il rejoint la BONNE classe. */
function ClassSummary({ preview, gradeName }) {
  const { t } = useTranslation('student');
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5" data-join-link-class>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-nav-accent"><Users size={22} aria-hidden="true" /></div>
      <div className="min-w-0">
        <p className="break-words font-display text-xl font-bold text-slate-900" data-join-link-name>{preview.classroomName}</p>
        {preview.teacherName && <p className="mt-1 text-sm text-slate-600">{t('qism.joinLink.teacher', { teacher: preview.teacherName })}</p>}
        {preview.grade && <p className="text-sm text-slate-600">{t('qism.joinLink.grade', { grade: gradeName(preview.grade) })}</p>}
      </div>
    </div>
  );
}

const NOTICE_TONES = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  amber: 'border-amber-200 bg-amber-50 text-amber-900',
  sky: 'border-sky-200 bg-sky-50 text-sky-900',
};

function Notice({ icon: Icon, tone, title, children }) {
  return (
    <div role="status" className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${NOTICE_TONES[tone]}`}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <p>{children}</p>
      </div>
    </div>
  );
}

function PrimaryButton({ onClick, disabled, icon: Icon, dataAttr, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      {...{ [dataAttr]: '' }}
      className="flex min-h-[3.5rem] w-full items-center justify-center gap-2.5 rounded-xl px-6 py-3 text-[15px] font-semibold leading-snug text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-nav-accent/30 disabled:translate-y-0 disabled:opacity-70"
      style={{ background: AUTH_TONES.student.gradient }}
    >
      {Icon && <Icon size={17} aria-hidden="true" />}
      {children}
    </button>
  );
}
