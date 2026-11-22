<?php

namespace App\Http\Controllers\School;

use App\Domain\Classroom\ClassroomException;
use App\Domain\School\SchoolAccess;
use App\Domain\School\SchoolException;
use App\Http\Controllers\Controller;
use App\Models\School;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Le socle des contrôleurs /school (SCHOOL_ADMIN_SPACE.md §2) : la deuxième
 * couche d'autorisation — la nomination active, d'où vient l'établissement —
 * et la traduction des refus du domaine.
 *
 *     no_school                     → 403
 *     report_not_found              → 404
 *     tout autre motif d'établissement ou de classe → 422 {reason}
 */
abstract class SchoolController extends Controller
{
    /** @param Closure(School): mixed $action */
    protected function withSchool(Request $request, Closure $action): JsonResponse
    {
        try {
            $school = SchoolAccess::schoolOf($request->user());

            $result = $action($school);

            return $result instanceof JsonResponse ? $result : response()->json(['success' => true, ...$result]);
        } catch (SchoolException $e) {
            return response()->json([
                'success' => false,
                'reason' => $e->reason,
                'message' => $e->getMessage(),
            ], match ($e->reason) {
                SchoolException::NO_SCHOOL => 403,
                // Un rapport d'un AUTRE établissement : comme un inconnu.
                SchoolException::REPORT_NOT_FOUND => 404,
                default => 422,
            });
        } catch (ClassroomException $e) {
            return response()->json(['success' => false, 'reason' => $e->reason, 'message' => $e->getMessage()], 422);
        }
    }
}
