<?php

namespace App\Http\Controllers\School;

use App\Domain\School\SchoolAccess;
use App\Domain\School\SchoolException;
use App\Domain\School\SchoolOverviewService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * « لوحة المؤسسة » — l'accueil du directeur (SCHOOL_ADMIN_SPACE.md §6).
 *
 * Le rôle est vérifié sur le groupe (can:school) ; ici la deuxième couche :
 * la nomination active dans un établissement actif, sinon 403 `no_school`.
 */
class SchoolHomeController extends Controller
{
    public function __construct(private SchoolOverviewService $overview) {}

    public function overview(Request $request)
    {
        try {
            $school = SchoolAccess::schoolOf($request->user());
        } catch (SchoolException $e) {
            return self::forbidden($e);
        }

        return response()->json(['success' => true, ...$this->overview->overview($school)]);
    }

    /** Pas (ou plus) d'établissement : 403, avec le motif clos. */
    public static function forbidden(SchoolException $e)
    {
        return response()->json([
            'success' => false,
            'reason' => $e->reason,
            'message' => $e->getMessage(),
        ], 403);
    }
}
