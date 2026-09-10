<?php

namespace App\Http\Controllers;

use App\Domain\Access\ContentAccess;
use App\Domain\Progress\LessonProgressService;
use App\Domain\Progress\StudentActivity;
use App\Models\Lesson;
use App\Models\StudentLessonProgress;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LessonProgressController extends Controller
{
    public function __construct(private LessonProgressService $service) {}

    /**
     * All lesson-progress rows for the token's user, keyed by lesson code —
     * hydrates the dashboard and the resume-lesson computation on login.
     */
    public function index(Request $request)
    {
        return response()->json([
            'progress' => $this->service->forUser($request->user()),
        ]);
    }

    /**
     * Idempotent progress upsert. The response is the merged row and the
     * client adopts it as truth (the server's union/latest-wins merge may
     * know more than the submitting device does).
     */
    public function upsert(Request $request, string $lessonCode)
    {
        $lesson = Lesson::where('code', $lessonCode)->first();
        if ($lesson === null) {
            abort(404);
        }

        $validated = $request->validate([
            'completedModules' => 'present|array|max:32',
            'completedModules.*' => 'string|max:64',
            'currentModule' => 'nullable|integer|min:0|max:99',
            'status' => ['required', Rule::in([
                StudentLessonProgress::STATUS_IN_PROGRESS,
                StudentLessonProgress::STATUS_COMPLETED,
            ])],
            'lastActivityAt' => 'required|date',
            'completionMode' => ['nullable', Rule::in([
                StudentLessonProgress::COMPLETION_MODE_PATH,
                StudentLessonProgress::COMPLETION_MODE_MASTERY,
            ])],
        ]);

        // La progression d'une leçon retirée ne s'écrit plus — mais elle se
        // LIT toujours (voir index) : ce que l'élève a déjà fait lui
        // appartient, et le lui masquer serait lui mentir sur son parcours.
        try {
            ContentAccess::assertLessonAvailable($lessonCode);

            // Seuls les modules NOUVELLEMENT déclarés terminés sont
            // contrôlés, pas toute la liste.
            //
            // `completedModules` est une union monotone : le client renvoie à
            // chaque sauvegarde TOUT ce que l'élève a déjà terminé. Contrôler
            // la liste entière ferait qu'un module masqué aujourd'hui
            // empêcherait l'élève d'enregistrer quoi que ce soit demain — y
            // compris la progression de modules parfaitement ouverts. On
            // refuse donc d'AJOUTER un module fermé, sans jamais renier ce
            // qui était déjà acquis.
            $already = StudentLessonProgress::where('user_id', $request->user()->id)
                ->where('lesson_id', $lesson->id)
                ->value('completed_modules') ?? [];

            foreach (array_diff($validated['completedModules'], $already) as $moduleRef) {
                ContentAccess::assertModuleAvailable($lessonCode, $moduleRef);
            }
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        StudentActivity::touch($request->user());

        $row = $this->service->upsert($request->user(), $lesson, [
            'completedModules' => $validated['completedModules'],
            'currentModule' => $validated['currentModule'] ?? null,
            'status' => $validated['status'],
            'lastActivityAt' => $validated['lastActivityAt'],
            'completionMode' => $validated['completionMode'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'progress' => LessonProgressService::serialize($row),
        ]);
    }
}
