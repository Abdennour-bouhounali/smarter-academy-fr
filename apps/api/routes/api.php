<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DiagnosticController;
use App\Http\Controllers\LearningEvidenceController;
use App\Http\Controllers\LearningProfileController;
use App\Http\Controllers\LessonFinalTestAttemptController;
use App\Http\Controllers\LessonProgressController;
use App\Http\Controllers\PracticeAnswerController;
use App\Http\Controllers\PracticeNotebookController;
use App\Http\Controllers\PracticeSessionController;
use App\Http\Controllers\StudentReportController;
use App\Http\Controllers\Admin\AdminAccountController;
use App\Http\Controllers\Admin\AdminActivityLogController;
use App\Http\Controllers\Admin\AdminContentController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminReportController;
use App\Http\Controllers\Admin\AdminStudentController;
use App\Http\Controllers\Admin\AdminSubscriptionController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('/contact', [ContactController::class, 'store']);

    Route::middleware('throttle:6,1')->group(function () {
        Route::post('/auth/register', [AuthController::class, 'register']);
        Route::post('/auth/login', [AuthController::class, 'login']);
    });

    // Protected routes — any authenticated user (admin or student).
    // `account.active` fait respecter users.account_status côté serveur :
    // un compte suspendu ou désactivé n'appelle plus rien, même avec un
    // jeton encore en main (voir EnsureAccountIsActive).
    Route::middleware(['auth:sanctum', 'account.active'])->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::patch('/auth/grade', [AuthController::class, 'updateGrade']);

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
        Route::post('/reports', [StudentReportController::class, 'store'])
            ->middleware('throttle:20,1');

        Route::get('/students/me/learning-profile', [LearningProfileController::class, 'show']);
        Route::get('/students/me/lesson-progress', [LessonProgressController::class, 'index']);
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
            // Un seul point d'entrée pour les trois niveaux de contenu :
            // {type} vaut lesson | module | exercise.
            Route::patch('/content/{type}/{id}/status', [AdminContentController::class, 'changeStatus'])
                ->whereIn('type', ['lesson', 'module', 'exercise'])
                ->whereNumber('id');

            Route::get('/reports', [AdminReportController::class, 'index']);
            Route::get('/reports/clusters', [AdminReportController::class, 'clusters']);
            Route::get('/reports/{id}', [AdminReportController::class, 'show'])->whereNumber('id');
            Route::patch('/reports/{id}', [AdminReportController::class, 'update'])->whereNumber('id');
            Route::post('/reports/{id}/notes', [AdminReportController::class, 'addNote'])->whereNumber('id');

            Route::get('/students', [AdminStudentController::class, 'index']);
            Route::get('/students/{id}', [AdminStudentController::class, 'show'])->whereNumber('id');
            Route::patch('/students/{id}/status', [AdminStudentController::class, 'changeStatus'])->whereNumber('id');

            Route::get('/subscriptions', [AdminSubscriptionController::class, 'index']);
            Route::get('/payments', [AdminSubscriptionController::class, 'payments']);

            Route::get('/account', [AdminAccountController::class, 'show']);
            Route::patch('/account/profile', [AdminAccountController::class, 'updateProfile']);
            Route::patch('/account/email', [AdminAccountController::class, 'updateEmail']);
            Route::patch('/account/password', [AdminAccountController::class, 'updatePassword']);

            Route::get('/activity-log', [AdminActivityLogController::class, 'index']);
        });
    });
});
