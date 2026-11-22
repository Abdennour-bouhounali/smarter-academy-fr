<?php

namespace App\Http\Controllers\Teacher;

use App\Domain\Practice\AnswerImageStore;
use App\Domain\Practice\AnswerReviewService;
use App\Http\Controllers\AnswerImageController;
use App\Http\Controllers\Controller;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * « تصحيح الإجابات » — la file de correction de l'enseignant (2026-10-06).
 * Périmètre et décision : AnswerReviewService. Tout ce qui sort de ses classes
 * actives est 404, comme le reste du dossier élève.
 */
class TeacherAnswerReviewController extends Controller
{
    public function __construct(private AnswerReviewService $reviews, private AnswerImageStore $images) {}

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate(['classroom' => 'nullable|integer']);
        $classroomId = isset($validated['classroom']) ? (int) $validated['classroom'] : null;
        // Filtrer par la classe d'un autre : 403, comme toute route par classe.
        if ($classroomId !== null) {
            TeacherClassroomController::ownedClassroom($request, $classroomId);
        }

        return response()->json(['success' => true] + $this->reviews->queue($request->user(), $classroomId));
    }

    public function count(Request $request): JsonResponse
    {
        return response()->json(['success' => true, 'pending' => $this->reviews->pendingCount($request->user())]);
    }

    public function decide(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'verdict' => 'required|string|in:correct,incorrect',
            'comment' => 'nullable|string|max:'.AnswerReviewService::COMMENT_MAX,
        ]);

        try {
            $review = $this->reviews->decide($request->user(), $id, $validated['verdict'], $validated['comment'] ?? null);
        } catch (DomainException $e) {
            if ($e->getMessage() === AnswerReviewService::ALREADY_REVIEWED) {
                return response()->json(['success' => false, 'code' => AnswerReviewService::ALREADY_REVIEWED], 409);
            }
            abort(404);
        }

        return response()->json(['success' => true, 'review' => $review->toClient()]);
    }

    public function image(Request $request, string $uuid): BinaryFileResponse|JsonResponse
    {
        try {
            $image = $this->reviews->imageForTeacher($request->user(), $uuid);
        } catch (DomainException) {
            $image = null;
        }

        return AnswerImageController::respond($this->images, $image, $request->boolean('annotated'));
    }

    /** La copie annotée au stylo rouge : une image À PART, l'original reste intact. */
    public function annotate(Request $request, string $uuid): JsonResponse
    {
        try {
            $image = $this->reviews->imageForTeacher($request->user(), $uuid);
        } catch (DomainException) {
            abort(404);
        }
        $request->validate(['image' => 'required|file']);

        try {
            $image = $this->images->annotate($request->user(), $image, $request->file('image'));
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'code' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'image' => $image->toClient()]);
    }
}
