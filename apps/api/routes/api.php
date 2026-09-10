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

        Route::get('/students/me/learning-profile', [LearningProfileController::class, 'show']);
        Route::get('/students/me/lesson-progress', [LessonProgressController::class, 'index']);
    });

    // Protected routes — admin only
    Route::middleware(['auth:sanctum', 'account.active', 'can:admin'])->group(function () {
        Route::get('/contact', [ContactController::class, 'index']);
    });
});
