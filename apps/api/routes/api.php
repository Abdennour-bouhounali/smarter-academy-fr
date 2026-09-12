<?php

use App\Http\Controllers\AccessController;
use App\Http\Controllers\Admin\AdminAccountController;
use App\Http\Controllers\Admin\AdminActivityLogController;
use App\Http\Controllers\Admin\AdminContentController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminEntitlementController;
use App\Http\Controllers\Admin\AdminHealthController;
use App\Http\Controllers\Admin\AdminProviderEventController;
use App\Http\Controllers\Admin\AdminReportController;
use App\Http\Controllers\Admin\AdminStudentController;
use App\Http\Controllers\Admin\AdminSubscriptionController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BillingCheckoutController;
use App\Http\Controllers\BillingSubscriptionController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ContentAvailabilityController;
use App\Http\Controllers\DiagnosticController;
use App\Http\Controllers\EmailVerificationController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\LearningEvidenceController;
use App\Http\Controllers\LearningProfileController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\LessonFinalTestAttemptController;
use App\Http\Controllers\LessonProgressController;
use App\Http\Controllers\PracticeAnswerController;
use App\Http\Controllers\PracticeNotebookController;
use App\Http\Controllers\PracticeSessionController;
use App\Http\Controllers\ProviderWebhookController;
use App\Http\Controllers\StudentReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('/contact', [ContactController::class, 'store']);

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
            \Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
        ])
        ->middleware('throttle:120,1')
        ->where('provider', '[a-z_]+');

    // Les versions des documents légaux. Publiques : la page d'inscription
    // les affiche avant toute authentification. Lecture seule — le serveur
    // fait autorité sur les versions, le client ne fait que les montrer.
    Route::get('/legal/versions', [LegalController::class, 'versions']);

    Route::middleware('throttle:6,1')->group(function () {
        Route::post('/auth/register', [AuthController::class, 'register']);
        Route::post('/auth/login', [AuthController::class, 'login']);
    });

    // ── Vérification d'adresse ───────────────────────────────────────────
    // PAS de jeton ici, volontairement : on clique ce lien depuis sa boîte
    // mail, souvent dans un autre navigateur que celui de l'inscription.
    // Ce qui protège la route n'est donc pas une session mais la SIGNATURE
    // de l'URL (`signed`), qui prouve que le lien vient de nous et n'a pas
    // été modifié — l'identifiant compris. Elle expire (voir
    // EmailVerificationLink). La limite de débit couvre le tâtonnement.
    Route::get('/auth/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware(['signed', 'throttle:12,1'])
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

            Route::post('/lessons/{lessonCode}/evidence', [LearningEvidenceController::class, 'store']);
            Route::put('/lessons/{lessonCode}/progress', [LessonProgressController::class, 'upsert']);
            Route::get('/lessons/{lessonCode}/final-test-attempt', [LessonFinalTestAttemptController::class, 'show']);
            Route::put('/lessons/{lessonCode}/final-test-attempt', [LessonFinalTestAttemptController::class, 'store']);
            Route::delete('/lessons/{lessonCode}/final-test-attempt', [LessonFinalTestAttemptController::class, 'destroy']);
            // Moteur d'exercices. Activé leçon par leçon
            // (content/practice/active.json) : PracticeCapability refuse en 422
            // une leçon sans contenu, sur les deux seuls points d'entrée qui
            // créent quelque chose — le reste exige une séance, donc en hérite.
            Route::get('/lessons/{lessonCode}/practice/overview', [PracticeSessionController::class, 'overview']);
            Route::post('/lessons/{lessonCode}/practice/sessions', [PracticeSessionController::class, 'store']);
            Route::get('/practice/sessions/{sessionId}', [PracticeSessionController::class, 'show']);
            Route::post('/practice/sessions/{sessionId}/questions', [PracticeAnswerController::class, 'openQuestion']);
            Route::post('/practice/sessions/{sessionId}/answers', [PracticeAnswerController::class, 'store']);
            Route::post('/practice/sessions/{sessionId}/exercise-completions', [PracticeAnswerController::class, 'completeExercise']);
            Route::post('/practice/sessions/{sessionId}/complete', [PracticeSessionController::class, 'complete']);
            Route::post('/practice/question-attempts/{attemptUuid}/hints', [PracticeAnswerController::class, 'storeHint']);
            Route::get('/practice/notes', [PracticeNotebookController::class, 'index']);
            Route::post('/practice/notes', [PracticeNotebookController::class, 'store']);
            Route::patch('/practice/notes/{id}', [PracticeNotebookController::class, 'update']);
            Route::delete('/practice/notes/{id}', [PracticeNotebookController::class, 'destroy']);

            // « Signaler un problème ». Limité en débit : un signalement est un
            // geste rare, et cette limite empêche qu'un script en produise mille.
            // Deux temps : le clic pose le signal, l'envoi le complète. La
            // limite couvre les deux — un signalement est un geste rare.
            Route::post('/reports', [StudentReportController::class, 'store'])
                ->middleware('throttle:30,1');
            Route::patch('/reports/{id}', [StudentReportController::class, 'update'])
                ->whereNumber('id')
                ->middleware('throttle:30,1');

            // L'autorité de publication, servie au frontend : le catalogue vit
            // dans le bundle, donc sans ces deux appels l'élève continuerait
            // d'afficher une leçon masquée jusqu'à buter dessus.
            Route::get('/content/availability', [ContentAvailabilityController::class, 'index']);
            Route::get('/lessons/{lessonCode}/exercises', [ContentAvailabilityController::class, 'exercises']);

            // « À quoi ai-je droit ? » — lecture seule. Aucun point d'entrée ne
            // permet à un élève de modifier ses droits d'accès.
            Route::get('/me/access', [AccessController::class, 'show']);

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
            Route::get('/students/me/lesson-progress', [LessonProgressController::class, 'index']);
        });
    });

    // Protected routes — admin only
    Route::middleware(['auth:sanctum', 'account.active', 'can:admin'])->group(function () {
        Route::get('/contact', [ContactController::class, 'index']);

        Route::prefix('admin')->group(function () {
            Route::get('/dashboard', [AdminDashboardController::class, 'index']);

            Route::get('/analytics/platform', [AdminDashboardController::class, 'platform']);
            Route::get('/analytics/learning', [AdminDashboardController::class, 'learning']);
            Route::get('/analytics/content', [AdminDashboardController::class, 'content']);
            Route::get('/analytics/learning-points', [AdminDashboardController::class, 'learningPoints']);

            Route::get('/content/lessons', [AdminContentController::class, 'lessons']);
            Route::get('/content/lessons/{code}', [AdminContentController::class, 'lesson']);
            // Vues transversales : la vue par leçon oblige à savoir OÙ
            // chercher, ce que « tous les modules masqués » n'a pas.
            Route::get('/content/modules', [AdminContentController::class, 'modules']);
            Route::get('/content/exercises', [AdminContentController::class, 'exercises']);
            // Un seul point d'entrée pour les trois niveaux de contenu :
            // {type} vaut lesson | module | exercise.
            Route::patch('/content/{type}/{id}/status', [AdminContentController::class, 'changeStatus'])
                ->whereIn('type', ['lesson', 'module', 'exercise'])
                ->whereNumber('id');
            // Le PALIER commercial, sur une route distincte de la
            // publication : deux dimensions indépendantes. Pas de module —
            // un module suit le palier de sa leçon.
            Route::patch('/content/{type}/{id}/tier', [AdminContentController::class, 'changeTier'])
                ->whereIn('type', ['lesson', 'exercise'])
                ->whereNumber('id');

            Route::get('/reports', [AdminReportController::class, 'index']);
            Route::get('/reports/clusters', [AdminReportController::class, 'clusters']);
            Route::get('/reports/{id}', [AdminReportController::class, 'show'])->whereNumber('id');
            Route::patch('/reports/{id}', [AdminReportController::class, 'update'])->whereNumber('id');
            Route::post('/reports/{id}/notes', [AdminReportController::class, 'addNote'])->whereNumber('id');

            Route::get('/students', [AdminStudentController::class, 'index']);
            Route::get('/students/{id}', [AdminStudentController::class, 'show'])->whereNumber('id');
            Route::patch('/students/{id}/status', [AdminStudentController::class, 'changeStatus'])->whereNumber('id');

            // Droits d'accès : consulter, accorder une dérogation, la retirer.
            // Strictement admin_override — un abonnement ne se crée pas à la
            // main (voir EntitlementAdminService).
            Route::get('/students/{id}/entitlements', [AdminEntitlementController::class, 'show'])->whereNumber('id');
            Route::post('/students/{id}/entitlements/override', [AdminEntitlementController::class, 'grant'])->whereNumber('id');
            Route::delete('/students/{id}/entitlements/override', [AdminEntitlementController::class, 'revoke'])->whereNumber('id');
            // Réconcilier abonnements → droits. Ni encaissement, ni création
            // d'abonnement : sans abonnement, cette route ne produit rien.
            Route::post('/students/{id}/entitlements/sync', [AdminEntitlementController::class, 'syncSubscriptions'])->whereNumber('id');

            Route::get('/subscriptions', [AdminSubscriptionController::class, 'index']);
            Route::get('/payments', [AdminSubscriptionController::class, 'payments']);

            // Les évènements de fournisseur : le journal qui répond à
            // « l'élève dit avoir payé, que s'est-il passé ? ».
            // En lecture, plus un seul geste — rejouer, qui repasse par la
            // chaîne normale et ne fabrique aucun abonnement.
            Route::get('/provider-events', [AdminProviderEventController::class, 'index']);
            Route::get('/provider-events/{id}', [AdminProviderEventController::class, 'show'])->whereNumber('id');
            Route::post('/provider-events/{id}/replay', [AdminProviderEventController::class, 'replay'])->whereNumber('id');

            Route::get('/account', [AdminAccountController::class, 'show']);
            Route::patch('/account/profile', [AdminAccountController::class, 'updateProfile']);
            Route::patch('/account/email', [AdminAccountController::class, 'updateEmail']);
            Route::patch('/account/password', [AdminAccountController::class, 'updatePassword']);

            Route::get('/activity-log', [AdminActivityLogController::class, 'index']);

            // Diagnostic de cohérence source ↔ registre. Admin uniquement.
            Route::get('/health', [AdminHealthController::class, 'index']);
        });
    });
});
