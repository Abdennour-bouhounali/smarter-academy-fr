<?php

use App\Http\Controllers\AccessController;
use App\Http\Controllers\ActivationCodeController;
use App\Http\Controllers\Admin\AdminAccessPolicyController;
use App\Http\Controllers\Admin\AdminAccountController;
use App\Http\Controllers\Admin\AdminActivationCodeController;
use App\Http\Controllers\Admin\AdminActivityLogController;
use App\Http\Controllers\Admin\AdminBookController;
use App\Http\Controllers\Admin\AdminBookManagerController;
use App\Http\Controllers\Admin\AdminBookMessageController;
use App\Http\Controllers\Admin\AdminBookOrderController;
use App\Http\Controllers\Admin\AdminClassroomController;
use App\Http\Controllers\Admin\AdminContentController;
use App\Http\Controllers\Admin\AdminDailyChallengeController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminEntitlementController;
use App\Http\Controllers\Admin\AdminHealthController;
use App\Http\Controllers\Admin\AdminManualSubscriptionController;
use App\Http\Controllers\Admin\AdminMasteryReplayController;
use App\Http\Controllers\Admin\AdminPlanController;
use App\Http\Controllers\Admin\AdminProviderEventController;
use App\Http\Controllers\Admin\AdminPushController;
use App\Http\Controllers\Admin\AdminRegistrationController;
use App\Http\Controllers\Admin\AdminReportController;
use App\Http\Controllers\Admin\AdminSchoolController;
use App\Http\Controllers\Admin\AdminStudentController;
use App\Http\Controllers\Admin\AdminSubscriptionController;
use App\Http\Controllers\Admin\AdminTeacherController;
use App\Http\Controllers\Admin\AdminUserDeletionController;
use App\Http\Controllers\AnswerImageController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BillingCheckoutController;
use App\Http\Controllers\BillingSubscriptionController;
use App\Http\Controllers\BookStoreController;
use App\Http\Controllers\ClassJoinLinkController;
use App\Http\Controllers\CompassController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ContentAvailabilityController;
use App\Http\Controllers\CurriculumController;
use App\Http\Controllers\DailyChallengeController;
use App\Http\Controllers\DiagnosticController;
use App\Http\Controllers\EmailVerificationController;
use App\Http\Controllers\Family\ParentController;
use App\Http\Controllers\Family\ParentLinkController;
use App\Http\Controllers\Family\StudentFamilyController;
use App\Http\Controllers\FeatureAccessController;
use App\Http\Controllers\GameEvidenceController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\LearningEvidenceController;
use App\Http\Controllers\LearningPointExplanationController;
use App\Http\Controllers\LearningProfileController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\LessonFinalTestAttemptController;
use App\Http\Controllers\LessonProgressController;
use App\Http\Controllers\MadarController;
use App\Http\Controllers\MathLabDocumentController;
use App\Http\Controllers\MathLabFileController;
use App\Http\Controllers\MeSubscriptionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PageTourController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\PracticeAnswerController;
use App\Http\Controllers\PracticeNotebookController;
use App\Http\Controllers\PracticeSessionController;
use App\Http\Controllers\ProviderWebhookController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\School\SchoolHomeController;
use App\Http\Controllers\School\SchoolProgressController;
use App\Http\Controllers\School\SchoolReportController;
use App\Http\Controllers\School\SchoolStructureController;
use App\Http\Controllers\School\SchoolStudentController;
use App\Http\Controllers\StudentClassroomController;
use App\Http\Controllers\StudentLessonAnswersController;
use App\Http\Controllers\StudentReportController;
use App\Http\Controllers\StudentSettingsController;
use App\Http\Controllers\Teacher\TeacherAnswerReviewController;
use App\Http\Controllers\Teacher\TeacherClassroomController;
use App\Http\Controllers\Teacher\TeacherClassroomDailyChallengeController;
use App\Http\Controllers\Teacher\TeacherClassroomInsightController;
use App\Http\Controllers\Teacher\TeacherClassroomInterventionController;
use App\Http\Controllers\Teacher\TeacherClassroomLearningPointController;
use App\Http\Controllers\Teacher\TeacherClassroomLessonController;
use App\Http\Controllers\Teacher\TeacherClassroomMadarController;
use App\Http\Controllers\Teacher\TeacherClassroomNotebookController;
use App\Http\Controllers\Teacher\TeacherClassroomStudentController;
use App\Http\Controllers\Teacher\TeacherClassSessionController;
use App\Http\Controllers\Teacher\TeacherDashboardController;
use App\Http\Controllers\Teacher\TeacherLabSettingsController;
use App\Http\Controllers\Teacher\TeacherMadarPlayController;
use App\Http\Controllers\Teacher\TeacherPracticeResponseController;
use App\Http\Controllers\Teacher\TeacherSchoolController;
use App\Http\Controllers\Teacher\TeacherStudentSettingsController;
use App\Http\Controllers\Teacher\TeacherThinkingLabController;
use App\Http\Controllers\ThinkingLabController;
use App\Http\Controllers\WaitlistController;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Middleware\AuthenticateSession;

Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('/contact', [ContactController::class, 'store']);

    // Les inscriptions sont-elles ouvertes ? Et, fermées, la liste d'attente (config/registration.php).
    Route::get('/registration', [WaitlistController::class, 'status'])->middleware('throttle:60,1');
    Route::post('/waitlist', [WaitlistController::class, 'store'])->middleware('throttle:6,1');

    // ── La LIBRAIRIE : vitrine publique (livres papier, commande sans paiement
    // en ligne). Voir docs/architecture/BOOKS_STORE.md.
    Route::prefix('books')->group(function () {
        Route::get('/', [BookStoreController::class, 'index']);
        Route::get('/wilayas', [BookStoreController::class, 'wilayas']);
        Route::post('/messages', [BookStoreController::class, 'message'])->middleware('throttle:book-messages');
        Route::get('/{slug}', [BookStoreController::class, 'show']);
        Route::post('/{slug}/orders', [BookStoreController::class, 'order'])->middleware('throttle:book-orders');
    });

    // ── Webhooks de fournisseur de paiement ─────────────────────────────
    // La SEULE route publique en écriture, et la seule authentifiée
    // autrement que par un jeton : un fournisseur de paiement n'a ni
    // session, ni compte, ni jeton CSRF. Sa signature est son identité.
    //
    // Les intergiciels de session sont retirés EXPLICITEMENT : `statefulApi()`
    // (bootstrap/app.php) les applique à tout /api, et une livraison serait
    // sinon rejetée avant d'atteindre la vérification de signature.
    //
    // La limite de débit protège la table d'évènements d'un flot de corps
    // non signés — qui ne laissent aucune trace, mais coûtent un calcul de
    // signature chacun.
    Route::post('/webhooks/{provider}', [ProviderWebhookController::class, 'handle'])
        ->withoutMiddleware([
            AuthenticateSession::class,
            EncryptCookies::class,
            StartSession::class,
            ValidateCsrfToken::class,
        ])
        ->middleware('throttle:120,1')
        ->where('provider', '[a-z_]+');

    // Les versions des documents légaux. Publiques : la page d'inscription
    // les affiche avant toute authentification. Lecture seule — le serveur
    // fait autorité sur les versions, le client ne fait que les montrer.
    Route::get('/legal/versions', [LegalController::class, 'versions']);

    // Ce qu'un LIEN DE CLASSE révèle avant tout compte (nom du قسم, classe
    // scolaire, enseignant, adhésions ouvertes) : publique, limitée en débit,
    // sans aucun secret ni identifiant en retour. Le jeton fait 32 symboles ;
    // tout autre format répond `invalid` sans toucher la base.
    Route::get('/join-links/{token}', [ClassJoinLinkController::class, 'show'])
        ->middleware('throttle:30,1')
        ->where('token', '[A-Za-z0-9]{1,64}');

    // ── L'inventaire d'accès d'un VISITEUR ───────────────────────────────
    // Les leçons sont lisibles sans compte, et le catalogue embarqué ne porte
    // aucun palier (lessons.tier est la seule source de vérité). Sans cette
    // lecture, un visiteur ne saurait pas qu'une leçon est premium. Même
    // calcul que /content/availability, pour un utilisateur null : aucune
    // donnée personnelle, et aucune écriture n'en dépend (ContentAccess).
    // « رابط الوليّ » — le lien PRIVÉ du parent, sans compte (PARENT_SPACE.md §2).
    // Public par nature : le jeton (32 caractères) est la porte ; débit borné,
    // et le code à 4 chiffres du parent a son propre verrou (5 essais / 15 min).
    Route::prefix('parent-link/{token}')->where(['token' => '[A-Za-z0-9]{32}'])->middleware('throttle:parent-link')->group(function () {
        Route::get('/', [ParentLinkController::class, 'show']);
        Route::get('/report', [ParentLinkController::class, 'report']);
        Route::get('/progress', [ParentLinkController::class, 'progress']);
        Route::post('/pin', [ParentLinkController::class, 'setPin'])->middleware('throttle:parent-link-pin');
        Route::post('/unlock', [ParentLinkController::class, 'unlock'])->middleware('throttle:parent-link-pin');
    });

    Route::get('/content/availability/public', [ContentAvailabilityController::class, 'guest'])
        ->middleware('throttle:60,1');

    Route::middleware('throttle:6,1')->group(function () {
        Route::post('/auth/register', [AuthController::class, 'register']);
        Route::post('/auth/login', [AuthController::class, 'login']);
    });

    // ── Mot de passe oublié ──────────────────────────────────────────────
    // Publiques par nature. `forgot` répond toujours pareil (voir
    // PasswordResetController) et est limité fortement : il provoque l'envoi
    // d'un courriel à une adresse nommée dans la requête.
    Route::post('/auth/password/forgot', [PasswordResetController::class, 'forgot'])
        ->middleware('throttle:5,10');
    Route::post('/auth/password/reset', [PasswordResetController::class, 'reset'])
        ->middleware('throttle:10,10');

    // ── Vérification d'adresse ───────────────────────────────────────────
    // PAS de jeton ici, volontairement : on clique ce lien depuis sa boîte
    // mail, souvent dans un autre navigateur que celui de l'inscription.
    // Ce qui protège la route n'est donc pas une session mais la SIGNATURE
    // de l'URL, qui prouve que le lien vient de nous et n'a pas été modifié
    // — l'identifiant compris. Elle expire (voir EmailVerificationLink).
    // Elle est contrôlée dans le contrôleur et non par `signed`, pour qu'un
    // lien refusé renvoie vers le frontend au lieu d'afficher un 403 JSON.
    // La limite de débit couvre le tâtonnement.
    Route::get('/auth/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware('throttle:12,1')
        ->whereNumber('id')
        ->name('verification.verify');

    // ── Google ───────────────────────────────────────────────────────────
    // Publiques par nature : personne n'est encore authentifié quand la
    // connexion commence. Le secret client reste sur le serveur — aucune de
    // ces routes ne l'expose, ni ne l'accepte.
    Route::middleware('throttle:20,1')->group(function () {
        Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect']);
        Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);
        // Création du compte APRÈS consentement (§22). Le seul point d'entrée
        // qui crée un compte Google, et il exige la case cochée.
        Route::post('/auth/google/complete', [GoogleAuthController::class, 'complete']);
    });

    // Protected routes — any authenticated user (admin or student).
    // `account.active` fait respecter users.account_status côté serveur :
    // un compte suspendu ou désactivé n'appelle plus rien, même avec un
    // jeton encore en main (voir EnsureAccountIsActive).
    Route::middleware(['auth:sanctum', 'account.active'])->group(function () {
        // ── Accessible SANS adresse vérifiée ─────────────────────────────
        // Le strict nécessaire pour sortir de cet état : savoir qui l'on est,
        // redemander le courriel, s'en aller. Tout le reste du groupe porte
        // `email.verified` (voir plus bas).
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        // Limité en débit : c'est le seul point d'entrée élève qui provoque
        // l'envoi d'un courriel. Sans cette limite, un script en enverrait
        // mille à la même adresse — et ce serait NOTRE serveur qui la
        // harcèlerait. L'adresse vient du compte authentifié, jamais de la
        // requête : on ne peut donc pas s'en servir pour arroser un tiers.
        Route::post('/auth/email/resend', [EmailVerificationController::class, 'resend'])
            ->middleware('throttle:5,10');

        Route::patch('/auth/grade', [AuthController::class, 'updateGrade'])
            ->middleware('email.verified');
        // « الاسم و اللقب » : le profil et l'étape d'accueil. Même garde que
        // la classe scolaire — l'adresse doit être prouvée avant.
        Route::patch('/auth/profile', [AuthController::class, 'updateProfile'])
            ->middleware(['email.verified', 'throttle:20,1']);

        // ── L'ESPACE D'APPRENTISSAGE — adresse vérifiée exigée ───────────
        //
        //     authentifié  ET  compte actif  ET  adresse vérifiée
        //
        // Le middleware est posé sur le GROUPE, et non route par route :
        // c'est ce qui garantit qu'une route ajoutée demain hérite de la
        // règle au lieu de l'oublier. Les seules routes authentifiées qui
        // restent en dehors sont celles qui permettent de sortir de l'état
        // « non vérifié » (/auth/me, /auth/logout, /auth/email/resend).
        //
        // Les administrateurs en sont exemptés par le middleware lui-même :
        // leur compte est créé par `make:admin`, sans aucun courriel.
        Route::middleware('email.verified')->group(function () {
            Route::post('/diagnostic/sessions', [DiagnosticController::class, 'start']);
            Route::get('/diagnostic/sessions/current', [DiagnosticController::class, 'current']);
            Route::post('/diagnostic/sessions/{sessionId}/responses', [DiagnosticController::class, 'respond']);

            // Le TRAJET D'APPRENTISSAGE — progression, preuves, test final —
            // est celui d'un ÉLÈVE (`learner`). Un enseignant lit la même
            // leçon, tous les modules ouverts, sans jamais y écrire une ligne.
            Route::middleware('learner')->group(function () {
                Route::post('/lessons/{lessonCode}/evidence', [LearningEvidenceController::class, 'store']);
                // le monde de jeu d'une leçon : le serveur RECALCULE le verdict (GameEvidenceController, 2026-11-15)
                Route::post('/lessons/{lessonCode}/game-evidence', [GameEvidenceController::class, 'store']);
                Route::put('/lessons/{lessonCode}/progress', [LessonProgressController::class, 'upsert']);
                // les réponses de l'élève pendant la leçon : à LUI seul (StudentLessonAnswersController, pilote 2026-11-07)
                Route::get('/lessons/{lessonCode}/answers', [StudentLessonAnswersController::class, 'show']);
                Route::put('/lessons/{lessonCode}/answers', [StudentLessonAnswersController::class, 'upsert']);
                Route::put('/lessons/{lessonCode}/final-test-attempt', [LessonFinalTestAttemptController::class, 'store']);
                Route::delete('/lessons/{lessonCode}/final-test-attempt', [LessonFinalTestAttemptController::class, 'destroy']);

                // « التحدّي اليومي » — le défi quotidien (DAILY_CHALLENGE.md).
                // Élève seulement : ses réponses sont des preuves d'apprentissage.
                Route::get('/daily-challenge', [DailyChallengeController::class, 'today']);
                Route::post('/daily-challenge/start', [DailyChallengeController::class, 'start'])->middleware('throttle:30,1');
                Route::get('/daily-challenge/history', [DailyChallengeController::class, 'history']);
                Route::get('/daily-challenge/attempts/{uuid}', [DailyChallengeController::class, 'show'])->whereUuid('uuid');
                Route::post('/daily-challenge/attempts/{uuid}/next', [DailyChallengeController::class, 'next'])->whereUuid('uuid')->middleware('throttle:60,1');
                Route::post('/daily-challenge/attempts/{uuid}/answers', [DailyChallengeController::class, 'answer'])->whereUuid('uuid')->middleware('throttle:60,1');
                Route::post('/daily-challenge/attempts/{uuid}/complete', [DailyChallengeController::class, 'complete'])->whereUuid('uuid');
                Route::get('/daily-challenge/attempts/{uuid}/review', [DailyChallengeController::class, 'review'])->whereUuid('uuid');

                // « بوصلتي » — la jauge de départ et sa خطّة (YEAR_COMPASS.md). Élève seulement :
                // le serveur sert les questions SANS clé, corrige, et recalcule les bandes ;
                // jamais une preuve de maîtrise.
                Route::get('/compass', [CompassController::class, 'show']);
                Route::put('/compass/pointer', [CompassController::class, 'pointer'])->middleware('throttle:30,1');
                Route::post('/compass/sessions', [CompassController::class, 'start'])->middleware('throttle:10,1');
                Route::post('/compass/sessions/{uuid}/questions', [CompassController::class, 'question'])->whereUuid('uuid')->middleware('throttle:60,1');
                Route::post('/compass/sessions/{uuid}/answers', [CompassController::class, 'answer'])->whereUuid('uuid')->middleware('throttle:60,1');
                Route::post('/compass/sessions/{uuid}/finish', [CompassController::class, 'finish'])->whereUuid('uuid')->middleware('throttle:10,1');

                // « مختبر التفكير » — l'échelle des défis (THINKING_LAB.md). Élève seulement :
                // le serveur juge, compte et ouvre la porte ; rien de la réponse avant elle.
                Route::get('/thinking-lab', [ThinkingLabController::class, 'home']);
                Route::get('/thinking-lab/n/{number}', [ThinkingLabController::class, 'byNumber'])->whereNumber('number');
                Route::get('/thinking-lab/challenges/{id}', [ThinkingLabController::class, 'show'])->where('id', '[a-z0-9-]+');
                Route::post('/thinking-lab/challenges/{id}/attempts', [ThinkingLabController::class, 'attempt'])->where('id', '[a-z0-9-]+')->middleware('throttle:30,1');
                Route::post('/thinking-lab/challenges/{id}/keys/{k}', [ThinkingLabController::class, 'openKey'])->where('id', '[a-z0-9-]+')->whereNumber('k');
                Route::post('/thinking-lab/challenges/{id}/postpone', [ThinkingLabController::class, 'postpone'])->where('id', '[a-z0-9-]+');
                Route::get('/thinking-lab/challenges/{id}/replay', [ThinkingLabController::class, 'replay'])->where('id', '[a-z0-9-]+');
                Route::post('/thinking-lab/challenges/{id}/extra', [ThinkingLabController::class, 'extra'])->where('id', '[a-z0-9-]+')->middleware('throttle:60,1');

                // « مدار » — le jeu (MADAR_GAME.md). Élève seulement : les
                // réponses de la « محطة التزوّد » sont des preuves d'apprentissage.
                Route::get('/madar', [MadarController::class, 'show']);
                Route::post('/madar/runs', [MadarController::class, 'start'])->middleware('throttle:60,1');
                Route::post('/madar/runs/{uuid}/revive', [MadarController::class, 'revive'])->whereUuid('uuid')->middleware('throttle:60,1');
                Route::post('/madar/runs/{uuid}/finish', [MadarController::class, 'finish'])->whereUuid('uuid')->middleware('throttle:60,1');
                Route::patch('/madar/ship', [MadarController::class, 'ship'])->middleware('throttle:30,1');
                Route::post('/madar/refuel', [MadarController::class, 'refuel'])->middleware('throttle:60,1');
                Route::post('/madar/refuel/{uuid}/answer', [MadarController::class, 'answer'])->whereUuid('uuid')->middleware('throttle:60,1');
                Route::post('/madar/refuel/{uuid}/left', [MadarController::class, 'left'])->whereUuid('uuid')->middleware('throttle:120,1');
            });
            Route::get('/lessons/{lessonCode}/final-test-attempt', [LessonFinalTestAttemptController::class, 'show']);
            // Moteur d'exercices. Activé leçon par leçon
            // (content/practice/active.json) : PracticeCapability refuse en 422
            // une leçon sans contenu, sur les deux seuls points d'entrée qui
            // créent quelque chose — le reste exige une séance, donc en hérite.
            Route::get('/lessons/{lessonCode}/practice/overview', [PracticeSessionController::class, 'overview']);
            // La « خزانة الميداليات » (prototype BEM, 2026-10-06) : déduite des réponses enregistrées.
            Route::get('/lessons/{lessonCode}/practice/medals', [PracticeSessionController::class, 'medals']);
            Route::get('/practice/sessions/{sessionId}', [PracticeSessionController::class, 'show']);
            // Le prochain exercice conseillé — le sélecteur lit la maîtrise, ne l'écrit jamais.
            Route::get('/practice/sessions/{sessionId}/next', [PracticeSessionController::class, 'next']);
            Route::get('/practice/sessions/{sessionId}/answers', [PracticeSessionController::class, 'answers']);
            // Les ÉCRITURES de la pratique (séances, tentatives, indices,
            // maîtrise) : élève seulement (2026-10-05). L'enseignant parcourt
            // le بنك التمارين sans suivi — tout est évalué dans son navigateur,
            // rien n'est écrit (TEACHER_CLASSROOM_ARCHITECTURE.md §8b).
            Route::middleware('learner')->group(function () {
                Route::post('/lessons/{lessonCode}/practice/sessions', [PracticeSessionController::class, 'store']);
                Route::post('/practice/sessions/{sessionId}/questions', [PracticeAnswerController::class, 'openQuestion']);
                Route::post('/practice/sessions/{sessionId}/answers', [PracticeAnswerController::class, 'store']);
                Route::post('/practice/sessions/{sessionId}/exercise-completions', [PracticeAnswerController::class, 'completeExercise']);
                Route::post('/practice/sessions/{sessionId}/complete', [PracticeSessionController::class, 'complete']);
                Route::post('/practice/question-attempts/{attemptUuid}/hints', [PracticeAnswerController::class, 'storeHint']);
                // Photos de copie (prototype BEM, 2026-10-06) : 3 par étape, avant
                // la réponse ; ensuite verrouillées avec elle (AnswerImageStore).
                Route::post('/practice/question-attempts/{attemptUuid}/images', [AnswerImageController::class, 'store'])
                    ->middleware('throttle:30,1');
                Route::delete('/practice/answer-images/{uuid}', [AnswerImageController::class, 'destroy'])->whereUuid('uuid');
            });
            // Relire SES photos, et une correction de son enseignant (ouverte depuis la cloche).
            Route::get('/practice/answer-images/{uuid}', [AnswerImageController::class, 'content'])->whereUuid('uuid');
            Route::get('/practice/reviews/{id}', [AnswerImageController::class, 'review'])->whereNumber('id');
            // La cloche : notifications dans l'application seulement (aucun courriel).
            Route::get('/me/notifications', [NotificationController::class, 'index']);
            Route::post('/me/notifications/read-all', [NotificationController::class, 'readAll']);
            Route::post('/me/notifications/{id}/read', [NotificationController::class, 'read'])->whereUuid('id');
            Route::get('/practice/notes', [PracticeNotebookController::class, 'index']);
            Route::post('/practice/notes', [PracticeNotebookController::class, 'store']);
            // « Mon cahier » : actions groupées AVANT `{id}` pour que « bulk »
            // ne soit pas lu comme un identifiant.
            Route::post('/practice/notes/bulk', [PracticeNotebookController::class, 'bulk']);
            Route::get('/practice/notes/{id}', [PracticeNotebookController::class, 'show']);
            Route::patch('/practice/notes/{id}', [PracticeNotebookController::class, 'update']);
            Route::post('/practice/notes/{id}/review', [PracticeNotebookController::class, 'review']);
            Route::delete('/practice/notes/{id}', [PracticeNotebookController::class, 'destroy']);

            // ── Le مختبر الرياضيات (Math Lab) ────────────────────────────
            // Le travail LIBRE de l'élève, hors de toute leçon : une table pour
            // tous les instruments, `tool` dit lequel, `data` reste opaque
            // (docs/architecture/MATH_LAB.md). Le propriétaire est l'élève
            // authentifié — aucun identifiant d'utilisateur n'est lu dans la
            // requête. La création est limitée en débit : la sauvegarde
            // automatique modifie (PATCH) un document existant, elle n'en
            // crée pas, donc cette limite ne la touche pas.
            // « الوصول والحدود » : ce que CE compte peut utiliser (instruments,
            // cahier, travaux) et ce qu'il lui reste. Lecture seule ; chaque
            // geste protégé est revérifié par FeatureAccessService.
            Route::get('/me/feature-access', [FeatureAccessController::class, 'show']);
            // « الإعدادات » de l'élève : ses réglages (niveaux ouverts…) ; il ne
            // les change que s'il n'est dans aucune classe (sinon : l'enseignant).
            Route::get('/me/settings', [StudentSettingsController::class, 'show']);
            Route::patch('/me/settings', [StudentSettingsController::class, 'update']);
            // « جولة تعريفية » : les visites guidées closes par CE compte (élève
            // ou enseignant), et la clôture d'une visite — terminée ou passée.
            Route::get('/me/tours', [PageTourController::class, 'index']);
            Route::post('/me/tours/{tour}', [PageTourController::class, 'store'])->middleware('throttle:60,1');
            Route::get('/math-lab/documents', [MathLabDocumentController::class, 'index']);
            Route::post('/math-lab/documents', [MathLabDocumentController::class, 'store'])
                ->middleware('throttle:30,1');
            // Les gestes GROUPÉS de « أعمالي » — avant `{id}`, qui ne prend que des nombres.
            Route::post('/math-lab/documents/bulk', [MathLabDocumentController::class, 'bulk']);
            Route::get('/math-lab/documents/{id}', [MathLabDocumentController::class, 'show'])->whereNumber('id');
            Route::post('/math-lab/documents/{id}/duplicate', [MathLabDocumentController::class, 'duplicate'])->whereNumber('id');
            Route::patch('/math-lab/documents/{id}', [MathLabDocumentController::class, 'update'])->whereNumber('id');
            Route::delete('/math-lab/documents/{id}', [MathLabDocumentController::class, 'destroy'])->whereNumber('id');
            // Les FICHIERS d'une سبّورة (images, SVG, PDF) : une ligne par
            // fichier, les octets sur le disque privé, et des quotas tenus sous
            // verrou (MathLabFileService — 1 Mo, 3 par document, 50 par élève).
            // Le contenu ne se sert qu'au propriétaire, en pièce jointe.
            Route::get('/math-lab/quota', [MathLabFileController::class, 'quota']);
            Route::get('/math-lab/documents/{id}/files', [MathLabFileController::class, 'index'])->whereNumber('id');
            Route::post('/math-lab/documents/{id}/files', [MathLabFileController::class, 'store'])
                ->whereNumber('id')
                ->middleware('throttle:60,1');
            Route::get('/math-lab/files/{id}/content', [MathLabFileController::class, 'content'])->whereNumber('id');
            Route::delete('/math-lab/files/{id}', [MathLabFileController::class, 'destroy'])->whereNumber('id');

            // « Signaler un problème » — administrateur et AMBASSADEURS
            // seulement (2026-10-05). UN envoi (multipart, capture d'écran
            // facultative) : plus de signal posé au clic. Limité en débit :
            // un signalement est un geste rare.
            Route::post('/reports', [StudentReportController::class, 'store'])
                ->middleware(['reviewer', 'throttle:30,1']);

            // L'autorité de publication, servie au frontend : le catalogue vit
            // dans le bundle, donc sans ces deux appels l'élève continuerait
            // d'afficher une leçon masquée jusqu'à buter dessus.
            Route::get('/content/availability', [ContentAvailabilityController::class, 'index']);
            Route::get('/lessons/{lessonCode}/exercises', [ContentAvailabilityController::class, 'exercises']);

            // Le curriculum en lecture (phase 8) : classe → ميادين → وحدات →
            // دروس → نقاط التعلّم, prérequis et ressources déclarées. Codes et
            // structure ; le client garde son catalogue arabe.
            Route::get('/curriculum/grades/{gradeCode}', [CurriculumController::class, 'grade']);
            Route::get('/lessons/{lessonCode}/structure', [CurriculumController::class, 'lesson']);

            // « À quoi ai-je droit ? » — lecture seule. Aucun point d'entrée ne
            // permet à un élève de modifier ses droits d'accès… à une exception
            // près, juste en dessous, et qui exige un titre acheté.
            Route::get('/me/access', [AccessController::class, 'show']);

            // ── Le code d'activation (ALGERIA_PLATFORM_MASTER_SPEC.md §17) ──
            // Le modèle commercial algérien : l'élève paie en espèces, reçoit
            // une carte, saisit son code ici. C'est le SEUL geste par lequel
            // un élève ouvre ses propres droits — et il n'ouvre rien qu'un
            // administrateur n'ait préalablement produit.
            //
            // Limite de débit NOMMÉE, à la différence de tout le reste de ce
            // fichier : il faut deux compteurs (par compte ET par IP), et deux
            // `throttle:` successifs partageraient la même clé de cache, donc
            // le second n'en serait pas un. Voir AppServiceProvider.
            Route::post('/activation-codes/redeem', [ActivationCodeController::class, 'redeem'])
                ->middleware('throttle:activation-redeem');

            // ── Entrée en paiement ───────────────────────────────────────────
            // N'accorde AUCUN accès : rend une URL vers la page de paiement du
            // fournisseur. L'accès s'ouvrira au webhook signé, pas ici.
            //
            // Le client n'envoie qu'une clé d'offre ; le tarif, le montant, la
            // devise et l'identité de l'élève viennent tous du serveur.
            Route::get('/billing/plans', [BillingCheckoutController::class, 'plans']);
            // Limité en débit : ouvrir une session appelle le fournisseur, donc
            // c'est le seul point d'entrée élève qui coûte un appel sortant.
            Route::post('/billing/checkout', [BillingCheckoutController::class, 'start'])
                ->middleware('throttle:10,1');

            // ── Gestion de l'abonnement (phase 7) ────────────────────────────
            // Aucun de ces points d'entrée ne lit d'identifiant dans la requête :
            // l'abonnement est retrouvé depuis l'élève AUTHENTIFIÉ. Il n'y a donc
            // aucun contrôle d'appartenance à oublier — rien à faire correspondre.
            //
            // Aucun n'accorde ni ne retire un accès : résilier exprime une
            // intention chez le fournisseur, et seul le webhook signé fait foi.
            Route::get('/billing/subscription', [BillingSubscriptionController::class, 'show']);
            // Les trois mutations appellent le fournisseur : limitées en débit,
            // comme l'ouverture d'une session de paiement.
            Route::post('/billing/portal', [BillingSubscriptionController::class, 'portal'])
                ->middleware('throttle:10,1');
            Route::post('/billing/subscription/cancel', [BillingSubscriptionController::class, 'cancel'])
                ->middleware('throttle:10,1');
            Route::post('/billing/subscription/resume', [BillingSubscriptionController::class, 'resume'])
                ->middleware('throttle:10,1');

            Route::get('/students/me/learning-profile', [LearningProfileController::class, 'show']);
            // « Pourquoi ce statut ? » — l'explication d'un point, pour soi (Mastery V2).
            Route::get('/students/me/learning-points/{code}/explanation', [LearningPointExplanationController::class, 'show']);
            // Que faire ensuite dans une leçon — dérivé de l'état canonique, jamais bloquant.
            Route::get('/students/me/lessons/{lessonCode}/recommendations', [RecommendationController::class, 'show']);
            Route::get('/students/me/lesson-progress', [LessonProgressController::class, 'index']);

            // ── L'élève et sa CLASSE (« قسمي ») ─────────────────────────
            // « Où j'étudie », rejoindre par code ou par lien de classe, quitter.
            // L'élève est toujours l'utilisateur authentifié ; rejoindre ne
            // prend qu'un code ou le jeton du lien, jamais un identifiant de classe.
            // Limite NOMMÉE à deux compteurs, comme la saisie d'un code
            // d'activation : un code de classe est court.
            Route::get('/student/study-context', [StudentClassroomController::class, 'context']);
            Route::post('/student/classrooms/join', [StudentClassroomController::class, 'join'])
                ->middleware('throttle:classroom-join');
            Route::post('/student/classrooms/{id}/leave', [StudentClassroomController::class, 'leave'])->whereNumber('id');
            Route::post('/student/classrooms/{id}/consent', [StudentClassroomController::class, 'consent'])->whereNumber('id');
            Route::post('/student/classrooms/{id}/school-consent', [StudentClassroomController::class, 'schoolConsent'])->whereNumber('id');
            // Les suggestions de l'enseignant (interventions visibles) — jamais un verrou.
            Route::get('/student/teacher-recommendations', [StudentClassroomController::class, 'recommendations']);

            // ── « فضاء الوليّ », côté ÉLÈVE (PARENT_SPACE.md) ──────────────
            // Le temps d'étude, le code de liaison (après consentement), ses
            // أولياء et « ما يراه وليّك ». Élève seulement (`learner`).
            Route::middleware('learner')->group(function () {
                Route::post('/student/study-time', [StudentFamilyController::class, 'heartbeat'])->middleware('throttle:30,1');
                Route::get('/student/parents', [StudentFamilyController::class, 'index']);
                Route::post('/student/parents/code', [StudentFamilyController::class, 'issueCode'])->middleware('throttle:10,1');
                Route::delete('/student/parents/code', [StudentFamilyController::class, 'cancelCode']);
                Route::delete('/student/parents/{linkId}', [StudentFamilyController::class, 'revoke'])->whereNumber('linkId');
                Route::get('/student/parents/report', [StudentFamilyController::class, 'report']);
                Route::get('/student/parents/progress', [StudentFamilyController::class, 'progress']);
                Route::get('/student/parent-link', [StudentFamilyController::class, 'accessLink']);
                Route::post('/student/parent-link', [StudentFamilyController::class, 'createAccessLink'])->middleware('throttle:10,1');
                Route::delete('/student/parent-link', [StudentFamilyController::class, 'revokeAccessLink']);
            });

            // ── « Mon offre » — élève comme enseignant ───────────────────
            // AUCUN paiement en ligne : ces routes montrent les offres (prix
            // informatif), enregistrent une DEMANDE et rendent l'état. Elles
            // n'activent rien ; l'activation vient de l'administration.
            Route::get('/me/plans', [MeSubscriptionController::class, 'plans']);
            Route::get('/me/plans/{planId}/quote', [MeSubscriptionController::class, 'quote'])->whereNumber('planId');
            Route::get('/me/subscription', [MeSubscriptionController::class, 'show']);
            Route::get('/me/subscription-requests', [MeSubscriptionController::class, 'requests']);
            Route::post('/me/subscription-requests', [MeSubscriptionController::class, 'storeRequest'])
                ->middleware('throttle:10,1');
            Route::post('/me/subscription-requests/{requestId}/cancel', [MeSubscriptionController::class, 'cancelRequest'])
                ->whereNumber('requestId');
        });
    });

    // ── « فضاء الوليّ » — L'ESPACE PARENT ───────────────────────────────
    //
    //     authentifié  ET  compte actif  ET  adresse vérifiée  ET  rôle parent
    //
    // Chaque lecture d'un enfant passe par un LIEN ACTIF (ParentLinkService::
    // activeLink, 404 sinon). Voir docs/architecture/PARENT_SPACE.md.
    Route::middleware(['auth:sanctum', 'account.active', 'email.verified', 'can:parent'])
        ->prefix('parent')
        ->group(function () {
            Route::get('/children', [ParentController::class, 'children']);
            Route::post('/children/link', [ParentController::class, 'link'])->middleware('throttle:10,1');
            Route::get('/children/{studentId}/report', [ParentController::class, 'report'])->whereNumber('studentId');
            Route::get('/children/{studentId}/progress', [ParentController::class, 'progress'])->whereNumber('studentId');
            Route::patch('/children/{studentId}', [ParentController::class, 'update'])->whereNumber('studentId');
            Route::delete('/children/{studentId}', [ParentController::class, 'unlink'])->whereNumber('studentId');
        });

    // ── L'ESPACE ENSEIGNANT ──────────────────────────────────────────────
    //
    //     authentifié  ET  compte actif  ET  adresse vérifiée  ET  rôle enseignant
    //
    // La première couche d'autorisation (le rôle) est ici, sur le groupe.
    // La deuxième (la propriété d'une classe) est ClassroomPolicy, appelée
    // par chaque contrôleur. La troisième (l'offre) vit dans les services.
    // Un administrateur n'y entre pas : il a ses propres routes de consultation.
    Route::middleware(['auth:sanctum', 'account.active', 'email.verified', 'can:teacher'])
        ->prefix('teacher')
        ->group(function () {
            Route::get('/dashboard', [TeacherDashboardController::class, 'index']);
            Route::get('/entitlements', [TeacherDashboardController::class, 'entitlements']);

            // « مختبر التفكير » en PRÉVISUALISATION (THINKING_LAB.md §8bis) : tout est ouvert, la réponse
            // et la relecture se lisent, une réponse se TESTE — rien n'est écrit (ni progression, ni tentative).
            Route::get('/thinking-lab/challenges', [TeacherThinkingLabController::class, 'index']);
            Route::get('/thinking-lab/challenges/{id}', [TeacherThinkingLabController::class, 'show'])->where('id', '[a-z0-9-]+');
            Route::post('/thinking-lab/challenges/{id}/check', [TeacherThinkingLabController::class, 'check'])->where('id', '[a-z0-9-]+')->middleware('throttle:60,1');

            // « Mon offre », vue de l'enseignant : mêmes points d'entrée que /me.
            Route::get('/plans', [MeSubscriptionController::class, 'plans']);
            Route::get('/plans/{planId}/quote', [MeSubscriptionController::class, 'quote'])->whereNumber('planId');
            Route::get('/capacity', [TeacherDashboardController::class, 'capacity']);
            Route::get('/subscription', [MeSubscriptionController::class, 'show']);
            Route::get('/subscription-requests', [MeSubscriptionController::class, 'requests']);
            Route::post('/subscription-requests', [MeSubscriptionController::class, 'storeRequest'])
                ->middleware('throttle:10,1');
            Route::post('/subscription-requests/{requestId}/cancel', [MeSubscriptionController::class, 'cancelRequest'])
                ->whereNumber('requestId');

            Route::get('/classrooms', [TeacherClassroomController::class, 'index']);
            Route::post('/classrooms', [TeacherClassroomController::class, 'store']);
            Route::get('/classrooms/{id}', [TeacherClassroomController::class, 'show'])->whereNumber('id');
            Route::patch('/classrooms/{id}', [TeacherClassroomController::class, 'update'])->whereNumber('id');
            Route::post('/classrooms/{id}/archive', [TeacherClassroomController::class, 'archive'])->whereNumber('id');
            Route::post('/classrooms/{id}/restore', [TeacherClassroomController::class, 'restore'])->whereNumber('id');
            Route::post('/classrooms/{id}/join-code/rotate', [TeacherClassroomController::class, 'rotateJoinCode'])->whereNumber('id');
            // Renouveler le LIEN de classe : l'ancien n'ouvre plus rien.
            Route::post('/classrooms/{id}/join-link/rotate', [TeacherClassroomController::class, 'rotateJoinLink'])->whereNumber('id');

            // « مؤسستي » : rejoindre un établissement par son lien, lire ce
            // qu'il voit de moi, partir, rattacher mes classes (SCHOOL_ADMIN_SPACE.md).
            Route::get('/school', [TeacherSchoolController::class, 'show']);
            Route::get('/school-links/{token}', [TeacherSchoolController::class, 'preview'])->middleware('throttle:30,1');
            Route::post('/school/join', [TeacherSchoolController::class, 'join'])->middleware('throttle:10,1');
            Route::post('/school/leave', [TeacherSchoolController::class, 'leave']);
            Route::put('/classrooms/{id}/school', [TeacherSchoolController::class, 'attach'])->whereNumber('id');

            // « بنك التمارين » : qui, parmi MES élèves, a fait cet exercice — et
            // ce qu'il a répondu. Lecture seule (TeacherPracticeResponses).
            Route::get('/practice/{lessonCode}/exercises/{exerciseId}/students', [TeacherPracticeResponseController::class, 'index']);
            Route::get('/practice/{lessonCode}/exercises/{exerciseId}/students/{studentId}', [TeacherPracticeResponseController::class, 'show'])->whereNumber('studentId');
            // « تصحيح الإجابات » : les copies de MES élèves en « تصحيح الأستاذ »
            // (AnswerReviewService) — file, compteur du menu, décision, photos.
            Route::get('/reviews', [TeacherAnswerReviewController::class, 'index']);
            Route::get('/reviews/count', [TeacherAnswerReviewController::class, 'count']);
            Route::post('/reviews/{id}', [TeacherAnswerReviewController::class, 'decide'])->whereNumber('id')->middleware('throttle:120,1');
            Route::get('/answer-images/{uuid}', [TeacherAnswerReviewController::class, 'image'])->whereUuid('uuid');
            Route::post('/answer-images/{uuid}/annotation', [TeacherAnswerReviewController::class, 'annotate'])->whereUuid('uuid')->middleware('throttle:60,1');
            Route::get('/classrooms/{id}/students', [TeacherClassroomStudentController::class, 'index'])->whereNumber('id');
            // « بطاقات الدخول » : émet un nouveau mot de passe et le rend UNE fois, pour l'imprimer.
            Route::post('/classrooms/{id}/students/credentials', [TeacherClassroomStudentController::class, 'credentials'])
                ->whereNumber('id')->middleware('throttle:10,1');
            Route::post('/classrooms/{id}/students/parent-cards', [TeacherClassroomStudentController::class, 'parentCards'])
                ->whereNumber('id')->middleware('throttle:10,1');
            Route::get('/classrooms/{id}/students/{studentId}/progress', [TeacherClassroomStudentController::class, 'progress'])
                ->whereNumber('id')->whereNumber('studentId');
            Route::delete('/classrooms/{id}/students/{studentId}', [TeacherClassroomStudentController::class, 'destroy'])
                ->whereNumber('id')->whereNumber('studentId');
            // Les réglages d'UN élève (niveaux de l'espace d'exercices ouverts…), décidés par l'enseignant.
            Route::get('/classrooms/{id}/students/{studentId}/settings', [TeacherStudentSettingsController::class, 'show'])
                ->whereNumber('id')->whereNumber('studentId');
            Route::patch('/classrooms/{id}/students/{studentId}/settings', [TeacherStudentSettingsController::class, 'update'])
                ->whereNumber('id')->whereNumber('studentId');

            // Le cahier d'un élève, EN LECTURE SEULE, borné aux leçons de la
            // classe. Aucune route d'écriture ici : un enseignant lit, il
            // n'annote pas (TeacherClassroomNotebookController).
            Route::get('/classrooms/{id}/students/{studentId}/notebook', [TeacherClassroomNotebookController::class, 'index'])
                ->whereNumber('id')->whereNumber('studentId');
            Route::get('/classrooms/{id}/students/{studentId}/notebook/{noteId}', [TeacherClassroomNotebookController::class, 'show'])
                ->whereNumber('id')->whereNumber('studentId')->whereNumber('noteId');

            // Le lot AVANT `{lessonId}`, pour que « bulk » ne soit pas lu comme un identifiant.
            Route::get('/classrooms/{id}/lessons', [TeacherClassroomLessonController::class, 'index'])->whereNumber('id');
            Route::post('/classrooms/{id}/lessons/bulk', [TeacherClassroomLessonController::class, 'bulk'])->whereNumber('id');
            Route::patch('/classrooms/{id}/lessons/{lessonId}', [TeacherClassroomLessonController::class, 'update'])
                ->whereNumber('id')->whereNumber('lessonId');
            // Les questions PENDANT les labos, pour le compte de l'enseignant SEULEMENT (LabCheckpoint, 2026-10-28) : obligatoires pour tout élève.
            Route::get('/labs/{lessonCode}', [TeacherLabSettingsController::class, 'show']);
            Route::patch('/labs/{lessonCode}', [TeacherLabSettingsController::class, 'update']);

            // Classe × learning point (Mastery V2, phase 7) — agrégation de
            // l'état canonique, en lecture seule, cadrée sur les leçons
            // effectives de la classe. `?lesson=` est obligatoire sur l'index.
            Route::get('/classrooms/{id}/learning-points', [TeacherClassroomLearningPointController::class, 'index'])->whereNumber('id');
            // « متابعة القسم » d'une leçon : état de chaque élève sur chaque كفاءة + ses exercices (lecture seule)
            Route::get('/classrooms/{id}/lesson-tracking/{lessonCode}', [TeacherClassroomLearningPointController::class, 'lessonTracking'])->whereNumber('id');
            Route::get('/classrooms/{id}/learning-points/{code}', [TeacherClassroomLearningPointController::class, 'show'])->whereNumber('id');
            Route::get('/classrooms/{id}/students/{studentId}/learning-points/{code}/explanation', [TeacherClassroomLearningPointController::class, 'explanation'])
                ->whereNumber('id')->whereNumber('studentId');

            // DÉTECTER : « تستحقّ نظرة » et « ما الذي تغيّر؟ » — calculés à la
            // lecture depuis l'état canonique, jamais stockés.
            Route::get('/classrooms/{id}/attention', [TeacherClassroomInsightController::class, 'attention'])->whereNumber('id');

            // INTERVENIR puis MESURER — le geste de l'enseignant et ce qui a suivi.
            Route::get('/classrooms/{id}/interventions', [TeacherClassroomInterventionController::class, 'index'])->whereNumber('id');
            Route::post('/classrooms/{id}/interventions', [TeacherClassroomInterventionController::class, 'store'])
                ->whereNumber('id')->middleware('throttle:60,1');
            Route::get('/classrooms/{id}/interventions/{interventionId}', [TeacherClassroomInterventionController::class, 'show'])
                ->whereNumber('id')->whereNumber('interventionId');
            Route::patch('/classrooms/{id}/interventions/{interventionId}', [TeacherClassroomInterventionController::class, 'update'])
                ->whereNumber('id')->whereNumber('interventionId');

            // « التحدّي اليومي » de la classe : réglages, résultats, affichage.
            Route::get('/classrooms/{id}/daily-challenge/settings', [TeacherClassroomDailyChallengeController::class, 'settings'])->whereNumber('id');
            Route::patch('/classrooms/{id}/daily-challenge/settings', [TeacherClassroomDailyChallengeController::class, 'updateSettings'])->whereNumber('id');
            Route::get('/classrooms/{id}/daily-challenge/results', [TeacherClassroomDailyChallengeController::class, 'results'])->whereNumber('id');
            Route::get('/classrooms/{id}/daily-challenge/display', [TeacherClassroomDailyChallengeController::class, 'display'])->whereNumber('id');

            // « مدار » de la classe : réglages, semaine, affichage.
            Route::get('/classrooms/{id}/madar/settings', [TeacherClassroomMadarController::class, 'settings'])->whereNumber('id');
            Route::patch('/classrooms/{id}/madar/settings', [TeacherClassroomMadarController::class, 'updateSettings'])->whereNumber('id');
            Route::get('/classrooms/{id}/madar/results', [TeacherClassroomMadarController::class, 'results'])->whereNumber('id');
            Route::get('/classrooms/{id}/madar/display', [TeacherClassroomMadarController::class, 'display'])->whereNumber('id');
            Route::get('/classrooms/{id}/madar/items', [TeacherClassroomMadarController::class, 'items'])->whereNumber('id');
            Route::put('/classrooms/{id}/madar/time-limits', [TeacherClassroomMadarController::class, 'timeLimit'])->whereNumber('id');
            Route::post('/classrooms/{id}/madar/hearts', [TeacherClassroomMadarController::class, 'hearts'])->whereNumber('id')->middleware('throttle:60,1');
            Route::put('/classrooms/{id}/madar/students/{studentId}/games', [TeacherClassroomMadarController::class, 'studentGames'])->whereNumber('id')->whereNumber('studentId')->middleware('throttle:60,1');
            // « نافس أستاذك » : l'enseignant joue dans une de ses classes.
            Route::get('/classrooms/{id}/madar/play', [TeacherMadarPlayController::class, 'show'])->whereNumber('id');
            Route::post('/classrooms/{id}/madar/play/runs', [TeacherMadarPlayController::class, 'start'])->whereNumber('id')->middleware('throttle:60,1');
            Route::post('/classrooms/{id}/madar/play/runs/{uuid}/revive', [TeacherMadarPlayController::class, 'revive'])->whereNumber('id')->whereUuid('uuid')->middleware('throttle:60,1');
            Route::post('/classrooms/{id}/madar/play/runs/{uuid}/finish', [TeacherMadarPlayController::class, 'finish'])->whereNumber('id')->whereUuid('uuid')->middleware('throttle:60,1');
            Route::patch('/classrooms/{id}/madar/play/ship', [TeacherMadarPlayController::class, 'ship'])->whereNumber('id')->middleware('throttle:30,1');

            // « حصّة القسم » : le plan de la classe, le test d'une leçon (défaut + copie), les séances terminées (CLASS_SESSION.md).
            Route::get('/classrooms/{id}/seating', [TeacherClassSessionController::class, 'seating'])->whereNumber('id');
            Route::put('/classrooms/{id}/seating', [TeacherClassSessionController::class, 'updateSeating'])->whereNumber('id')->middleware('throttle:60,1');
            Route::get('/classrooms/{id}/class-sessions', [TeacherClassSessionController::class, 'sessions'])->whereNumber('id');
            Route::post('/classrooms/{id}/class-sessions', [TeacherClassSessionController::class, 'storeSession'])->whereNumber('id')->middleware('throttle:60,1');
            Route::get('/class-tests/{lessonCode}', [TeacherClassSessionController::class, 'test']);
            Route::put('/class-tests/{lessonCode}', [TeacherClassSessionController::class, 'updateTest'])->middleware('throttle:60,1');
            Route::delete('/class-tests/{lessonCode}', [TeacherClassSessionController::class, 'resetTest'])->middleware('throttle:30,1');
            // « ملفّ الدرس » : la leçon → le document de la سبّورة (مختبر) de l'enseignant — un seul, à lui
            Route::get('/lesson-files/{lessonCode}', [TeacherClassSessionController::class, 'lessonFile']);
            Route::put('/lesson-files/{lessonCode}', [TeacherClassSessionController::class, 'saveLessonFile'])->middleware('throttle:120,1');
        });

    // « فضاء الإدارة » — le directeur d'un établissement (SCHOOL_ADMIN_SPACE.md).
    // Le rôle ici ; la nomination active (SchoolAccess::schoolOf) dans chaque
    // contrôleur. L'établissement n'est jamais lu dans la requête.
    // Toute nouvelle lecture s'ajoute à SchoolPrivacyContractTest::schoolReads().
    Route::middleware(['auth:sanctum', 'account.active', 'email.verified', 'can:school'])
        ->prefix('school')
        ->group(function () {
            Route::get('/overview', [SchoolHomeController::class, 'overview']);

            // Phase 3 — la structure : trimestres, enseignants, classes, élèves.
            Route::get('/terms', [SchoolStructureController::class, 'terms']);
            Route::put('/terms', [SchoolStructureController::class, 'updateTerms']);
            Route::get('/teachers', [SchoolStructureController::class, 'teachers']);
            Route::post('/teachers/join-link/rotate', [SchoolStructureController::class, 'rotateTeacherLink']);
            Route::delete('/teachers/{teacherId}', [SchoolStructureController::class, 'detachTeacher'])->whereNumber('teacherId');
            Route::get('/classrooms', [SchoolStructureController::class, 'classrooms']);
            Route::post('/classrooms', [SchoolStructureController::class, 'createClassroom']);
            Route::patch('/classrooms/{id}/teacher', [SchoolStructureController::class, 'reassign'])->whereNumber('id');
            Route::get('/students', [SchoolStudentController::class, 'index']);
            Route::post('/roster/preview', [SchoolStudentController::class, 'preview'])->middleware('throttle:30,1');
            Route::post('/roster', [SchoolStudentController::class, 'commit'])->middleware('throttle:10,1');
            Route::patch('/students/{studentId}/classroom', [SchoolStudentController::class, 'transfer'])->whereNumber('studentId');
            Route::post('/students/credentials', [SchoolStudentController::class, 'credentials'])->middleware('throttle:10,1');

            // Phase 4 — le suivi : la carte des الكفاءات, le dossier d'un élève.
            Route::get('/learning-map', [SchoolProgressController::class, 'learningMap']);
            Route::get('/students/{studentId}/progress', [SchoolProgressController::class, 'studentFile'])->whereNumber('studentId');

            // Phase 5 — les rapports figés.
            Route::get('/reports', [SchoolReportController::class, 'index']);
            Route::post('/reports', [SchoolReportController::class, 'store'])->middleware('throttle:30,1');
            Route::get('/reports/{id}', [SchoolReportController::class, 'show'])->whereNumber('id');
            Route::delete('/reports/{id}', [SchoolReportController::class, 'destroy'])->whereNumber('id');
        });

    // La LIBRAIRIE : l'administrateur ET le gestionnaire « مسيّر المكتبة »
    // (porte `books`, BOOKS_STORE.md §6ter). Le gestionnaire n'atteint RIEN
    // d'autre sous /admin (AdminAuthorizationTest balaie toutes les routes).
    Route::middleware(['auth:sanctum', 'account.active', 'can:books'])->prefix('admin')->group(function () {
        // La librairie : fiches livres, commandes (états, livraison,
        // paiements en lignes), messages reçus.
        Route::get('/books', [AdminBookController::class, 'index']);
        Route::post('/books', [AdminBookController::class, 'store']);
        Route::get('/books/{id}', [AdminBookController::class, 'show'])->whereNumber('id');
        Route::put('/books/{id}', [AdminBookController::class, 'update'])->whereNumber('id');
        Route::get('/book-orders', [AdminBookOrderController::class, 'index']);
        Route::get('/book-orders/stats', [AdminBookOrderController::class, 'stats']);
        // Notifications du tableau de bord sur l'appareil du compte connecté (BOOKS_STORE.md
        // §6quater) : l'administrateur choisit parmi tous les sujets, le gestionnaire parmi ceux
        // de la librairie (AdminPush::TOPICS).
        Route::get('/push', [AdminPushController::class, 'show']);
        Route::post('/push/subscriptions', [AdminPushController::class, 'subscribe']);
        Route::patch('/push/subscriptions', [AdminPushController::class, 'updateTopics']);
        Route::delete('/push/subscriptions', [AdminPushController::class, 'unsubscribe']);
        Route::post('/push/test', [AdminPushController::class, 'test']);
        Route::get('/book-orders/{id}', [AdminBookOrderController::class, 'show'])->whereNumber('id');
        Route::patch('/book-orders/{id}', [AdminBookOrderController::class, 'update'])->whereNumber('id');
        Route::patch('/book-orders/{id}/status', [AdminBookOrderController::class, 'updateStatus'])->whereNumber('id');
        Route::post('/book-orders/{id}/payments', [AdminBookOrderController::class, 'addPayment'])->whereNumber('id');
        Route::delete('/book-orders/{id}', [AdminBookOrderController::class, 'destroy'])->whereNumber('id');
        Route::delete('/book-order-payments/{id}', [AdminBookOrderController::class, 'removePayment'])->whereNumber('id');
        Route::get('/book-messages', [AdminBookMessageController::class, 'index']);
        Route::patch('/book-messages/{id}', [AdminBookMessageController::class, 'update'])->whereNumber('id');

        // « حسابي » : son propre profil, son adresse, son mot de passe.
        Route::get('/account', [AdminAccountController::class, 'show']);
        Route::patch('/account/profile', [AdminAccountController::class, 'updateProfile']);
        Route::patch('/account/email', [AdminAccountController::class, 'updateEmail']);
        Route::patch('/account/password', [AdminAccountController::class, 'updatePassword']);
    });

    // Protected routes — admin only
    Route::middleware(['auth:sanctum', 'account.active', 'can:admin'])->group(function () {
        Route::get('/contact', [ContactController::class, 'index']);

        Route::prefix('admin')->group(function () {
            Route::get('/dashboard', [AdminDashboardController::class, 'index']);

            // Les gestionnaires de la librairie (« مسيّرو المكتبة ») : créés,
            // suspendus et réinitialisés par l'administrateur SEUL.
            Route::get('/book-managers', [AdminBookManagerController::class, 'index']);
            Route::post('/book-managers', [AdminBookManagerController::class, 'store']);
            Route::patch('/book-managers/{id}/status', [AdminBookManagerController::class, 'updateStatus'])->whereNumber('id');
            Route::post('/book-managers/{id}/password', [AdminBookManagerController::class, 'resetPassword'])->whereNumber('id');

            Route::get('/analytics/platform', [AdminDashboardController::class, 'platform']);
            Route::get('/analytics/learning', [AdminDashboardController::class, 'learning']);
            Route::get('/analytics/content', [AdminDashboardController::class, 'content']);
            Route::get('/analytics/learning-points', [AdminDashboardController::class, 'learningPoints']);

            // Rejeux de maîtrise (Mastery V2) : reconstruire l'état depuis la
            // preuve immuable, dans une version donnée — dry-run par défaut.
            Route::get('/mastery/replays', [AdminMasteryReplayController::class, 'index']);
            Route::post('/mastery/replays', [AdminMasteryReplayController::class, 'store']);
            Route::get('/mastery/replays/{id}', [AdminMasteryReplayController::class, 'show'])->whereNumber('id');

            Route::get('/content/lessons', [AdminContentController::class, 'lessons']);
            Route::get('/content/lessons/{code}', [AdminContentController::class, 'lesson']);
            // Vues transversales : la vue par leçon oblige à savoir OÙ
            // chercher, ce que « tous les modules masqués » n'a pas.
            Route::get('/content/exercises', [AdminContentController::class, 'exercises']);
            // Un seul point d'entrée : {type} vaut lesson | exercise. Pas de
            // module — il n'a pas d'état propre, il suit sa leçon (2026-11-11).
            Route::patch('/content/{type}/{id}/status', [AdminContentController::class, 'changeStatus'])
                ->whereIn('type', ['lesson', 'exercise'])
                ->whereNumber('id');
            // Le PALIER commercial, sur une route distincte de la
            // publication : deux dimensions indépendantes. Pas de module —
            // un module suit le palier de sa leçon.
            Route::patch('/content/{type}/{id}/tier', [AdminContentController::class, 'changeTier'])
                ->whereIn('type', ['lesson', 'exercise'])
                ->whereNumber('id');

            // Les MÊMES deux gestes, sur une liste. Les contraintes de type
            // sont recopiées à l'identique : ce qui est interdit à l'unité
            // (le palier d'un module) reste interdit en lot.
            Route::post('/content/{type}/bulk-status', [AdminContentController::class, 'bulkChangeStatus'])
                ->whereIn('type', ['lesson', 'exercise']);
            Route::post('/content/{type}/bulk-tier', [AdminContentController::class, 'bulkChangeTier'])
                ->whereIn('type', ['lesson', 'exercise']);
            // La banque d'exercices d'UNE leçon, d'un seul geste ; chaque
            // exercice reste ensuite modifiable seul.
            Route::patch('/content/lesson/{id}/exercises-status', [AdminContentController::class, 'changeLessonExercisesStatus'])
                ->whereNumber('id');

            Route::get('/reports', [AdminReportController::class, 'index']);
            Route::get('/reports/clusters', [AdminReportController::class, 'clusters']);
            Route::get('/reports/{id}', [AdminReportController::class, 'show'])->whereNumber('id');
            Route::patch('/reports/{id}', [AdminReportController::class, 'update'])->whereNumber('id');
            Route::post('/reports/{id}/notes', [AdminReportController::class, 'addNote'])->whereNumber('id');
            Route::get('/reports/{id}/screenshot', [AdminReportController::class, 'screenshot'])->whereNumber('id');

            // « التسجيل » : ouvrir / fermer les inscriptions (RegistrationGate, platform_settings).
            Route::get('/registration', [AdminRegistrationController::class, 'show']);
            Route::patch('/registration', [AdminRegistrationController::class, 'update']);

            Route::get('/students', [AdminStudentController::class, 'index']);
            // Un compte élève créé par l'administrateur ; le mot de passe rendu une fois.
            Route::post('/students', [AdminStudentController::class, 'store']);
            Route::get('/students/{id}', [AdminStudentController::class, 'show'])->whereNumber('id');
            Route::patch('/students/{id}/status', [AdminStudentController::class, 'changeStatus'])->whereNumber('id');

            // Suppression DÉFINITIVE d'un compte élève ou enseignant : un
            // aperçu de ce qui sera perdu, puis le geste (e-mail retapé).
            Route::get('/users/{id}/deletion-preview', [AdminUserDeletionController::class, 'preview'])->whereNumber('id');
            Route::delete('/users/{id}', [AdminUserDeletionController::class, 'destroy'])->whereNumber('id');

            // Droits d'accès : consulter, accorder une dérogation, la retirer.
            // Strictement admin_override — un abonnement ne se crée pas à la
            // main (voir EntitlementAdminService).
            Route::get('/students/{id}/entitlements', [AdminEntitlementController::class, 'show'])->whereNumber('id');
            Route::post('/students/{id}/entitlements/override', [AdminEntitlementController::class, 'grant'])->whereNumber('id');
            Route::delete('/students/{id}/entitlements/override', [AdminEntitlementController::class, 'revoke'])->whereNumber('id');
            // Réconcilier abonnements → droits. Ni encaissement, ni création
            // d'abonnement : sans abonnement, cette route ne produit rien.
            Route::post('/students/{id}/entitlements/sync', [AdminEntitlementController::class, 'syncSubscriptions'])->whereNumber('id');

            // ── Les codes d'activation ───────────────────────────────────
            // L'ordre des routes est LOAD-BEARING : `/batches` et `/export`
            // sont déclarées AVANT `/{id}`, sinon le paramètre numérique les
            // avalerait. `whereNumber` protège déjà, mais l'ordre dit
            // l'intention sans dépendre de lui.
            Route::get('/activation-codes', [AdminActivationCodeController::class, 'index']);
            Route::get('/activation-codes/export', [AdminActivationCodeController::class, 'export']);
            Route::get('/activation-codes/batches', [AdminActivationCodeController::class, 'batches']);
            // Le SEUL point d'entrée qui rend des codes en clair, et
            // seulement ceux qu'il vient de créer.
            Route::post('/activation-codes/batches', [AdminActivationCodeController::class, 'generate']);
            Route::post('/activation-codes/batches/{id}/revoke', [AdminActivationCodeController::class, 'revokeBatch'])
                ->whereNumber('id');
            Route::get('/activation-codes/{id}', [AdminActivationCodeController::class, 'show'])
                ->whereNumber('id');
            Route::post('/activation-codes/{id}/revoke', [AdminActivationCodeController::class, 'revoke'])
                ->whereNumber('id');

            Route::get('/subscriptions', [AdminSubscriptionController::class, 'index']);
            Route::get('/payments', [AdminSubscriptionController::class, 'payments']);

            // Les évènements de fournisseur : le journal qui répond à
            // « l'élève dit avoir payé, que s'est-il passé ? ».
            // En lecture, plus un seul geste — rejouer, qui repasse par la
            // chaîne normale et ne fabrique aucun abonnement.
            Route::get('/provider-events', [AdminProviderEventController::class, 'index']);
            Route::get('/provider-events/{id}', [AdminProviderEventController::class, 'show'])->whereNumber('id');
            Route::post('/provider-events/{id}/replay', [AdminProviderEventController::class, 'replay'])->whereNumber('id');

            // ── Les ENSEIGNANTS et leurs CLASSES ─────────────────────────
            Route::get('/teachers', [AdminTeacherController::class, 'index']);
            Route::get('/teachers/{id}', [AdminTeacherController::class, 'show'])->whereNumber('id');
            Route::patch('/teachers/{id}/status', [AdminTeacherController::class, 'changeStatus'])->whereNumber('id');
            // Ambassadeur (« سفير ») : voit tout le contenu, signale les problèmes.
            Route::patch('/teachers/{id}/ambassador', [AdminTeacherController::class, 'setAmbassador'])->whereNumber('id');
            Route::get('/teachers/{id}/entitlements', [AdminTeacherController::class, 'entitlements'])->whereNumber('id');
            Route::post('/teachers/{id}/entitlements/overrides', [AdminTeacherController::class, 'grantOverride'])->whereNumber('id');
            Route::delete('/teachers/{id}/entitlements/overrides/{overrideId}', [AdminTeacherController::class, 'revokeOverride'])
                ->whereNumber('id')->whereNumber('overrideId');

            Route::get('/classrooms', [AdminClassroomController::class, 'index']);
            Route::get('/classrooms/{id}', [AdminClassroomController::class, 'show'])->whereNumber('id');

            // « Établissements » : créer, régler, nommer le directeur (SCHOOL_ADMIN_SPACE.md §5).
            Route::get('/schools', [AdminSchoolController::class, 'index']);
            Route::post('/schools', [AdminSchoolController::class, 'store']);
            Route::get('/schools/{id}', [AdminSchoolController::class, 'show'])->whereNumber('id');
            Route::patch('/schools/{id}', [AdminSchoolController::class, 'update'])->whereNumber('id');
            Route::patch('/schools/{id}/status', [AdminSchoolController::class, 'status'])->whereNumber('id');
            Route::post('/schools/{id}/director', [AdminSchoolController::class, 'appointDirector'])->whereNumber('id')->middleware('throttle:10,1');
            Route::delete('/schools/{id}/director', [AdminSchoolController::class, 'revokeDirector'])->whereNumber('id');
            // La licence d'établissement (D1) : activation manuelle, cycle de vie.
            Route::post('/schools/{id}/licence', [AdminSchoolController::class, 'grantLicence'])->whereNumber('id');
            Route::patch('/schools/{id}/licence/status', [AdminSchoolController::class, 'licenceStatus'])->whereNumber('id');

            // ── L'ACTIVATION MANUELLE — élèves et enseignants ────────────
            // Aucun paiement en ligne : l'argent est reçu hors plateforme,
            // puis l'administrateur active l'offre sur le compte, ou lui
            // envoie UN code unique lié à l'offre. Les demandes ne sont
            // qu'une file d'attente ; elles n'activent jamais rien.
            Route::get('/{role}/{id}/subscription', [AdminManualSubscriptionController::class, 'show'])
                ->whereIn('role', ['teachers', 'students'])->whereNumber('id');
            Route::post('/{role}/{id}/subscriptions', [AdminManualSubscriptionController::class, 'activate'])
                ->whereIn('role', ['teachers', 'students'])->whereNumber('id');
            Route::post('/{role}/{id}/activation-codes', [AdminManualSubscriptionController::class, 'issueCode'])
                ->whereIn('role', ['teachers', 'students'])->whereNumber('id');

            Route::get('/subscription-requests', [AdminManualSubscriptionController::class, 'requests']);
            Route::post('/subscription-requests/{requestId}/reject', [AdminManualSubscriptionController::class, 'rejectRequest'])
                ->whereNumber('requestId');
            Route::post('/subscriptions/{subscriptionId}/suspend', [AdminManualSubscriptionController::class, 'suspend'])->whereNumber('subscriptionId');
            Route::post('/subscriptions/{subscriptionId}/resume', [AdminManualSubscriptionController::class, 'resume'])->whereNumber('subscriptionId');
            Route::post('/subscriptions/{subscriptionId}/cancel', [AdminManualSubscriptionController::class, 'cancel'])->whereNumber('subscriptionId');
            Route::post('/subscriptions/{subscriptionId}/extend', [AdminManualSubscriptionController::class, 'extend'])->whereNumber('subscriptionId');
            Route::post('/subscriptions/{subscriptionId}/change-plan', [AdminManualSubscriptionController::class, 'changePlan'])->whereNumber('subscriptionId');

            // ── Les OFFRES : le modèle commercial, sans déploiement ──────
            // `/keys` et `/plan-versions` AVANT `/plans/{id}`, par clarté.
            Route::get('/entitlements/keys', [AdminPlanController::class, 'keys']);
            Route::get('/plans', [AdminPlanController::class, 'index']);
            Route::post('/plans', [AdminPlanController::class, 'store']);
            Route::get('/plans/{id}', [AdminPlanController::class, 'show'])->whereNumber('id');
            Route::patch('/plans/{id}', [AdminPlanController::class, 'update'])->whereNumber('id');
            Route::patch('/plans/{id}/status', [AdminPlanController::class, 'changeStatus'])->whereNumber('id');
            Route::post('/plans/{id}/duplicate', [AdminPlanController::class, 'duplicate'])->whereNumber('id');
            Route::post('/plans/{id}/versions', [AdminPlanController::class, 'storeVersion'])->whereNumber('id');
            Route::get('/plans/{id}/subscriptions', [AdminPlanController::class, 'subscriptions'])->whereNumber('id');
            Route::patch('/plan-versions/{id}', [AdminPlanController::class, 'updateVersion'])->whereNumber('id');
            Route::post('/plan-versions/{id}/publish', [AdminPlanController::class, 'publishVersion'])->whereNumber('id');
            // La grille de prix par élève (sièges) : lecture, remplacement (brouillon), aperçu.
            Route::get('/plan-versions/{id}/pricing', [AdminPlanController::class, 'pricing'])->whereNumber('id');
            Route::put('/plan-versions/{id}/pricing', [AdminPlanController::class, 'replacePricing'])->whereNumber('id');
            Route::get('/plan-versions/{id}/pricing/quote', [AdminPlanController::class, 'quote'])->whereNumber('id');

            // ── « الوصول والحدود » : paliers × fonctionnalités, sans déploiement ──
            Route::get('/access-policies', [AdminAccessPolicyController::class, 'index']);
            Route::put('/access-policies/{key}', [AdminAccessPolicyController::class, 'update'])
                ->where('key', '[a-zA-Z0-9_.]+');
            Route::get('/access-usage', [AdminAccessPolicyController::class, 'usage']);
            Route::get('/users/{id}/feature-usage', [AdminAccessPolicyController::class, 'userUsage'])->whereNumber('id');

            // ── « التحدّي اليومي » : barème et défauts globaux ──
            Route::get('/daily-challenge/config', [AdminDailyChallengeController::class, 'show']);
            Route::put('/daily-challenge/config', [AdminDailyChallengeController::class, 'update']);

            Route::get('/activity-log', [AdminActivityLogController::class, 'index']);

            // Diagnostic de cohérence source ↔ registre. Admin uniquement.
            Route::get('/health', [AdminHealthController::class, 'index']);
        });
    });
});
