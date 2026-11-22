<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Admin\ClassroomAdminService;
use App\Http\Controllers\Controller;
use App\Models\Classroom;
use DomainException;
use Illuminate\Http\Request;

/** Les classes, côté administration — en lecture. */
class AdminClassroomController extends Controller
{
    public function __construct(private ClassroomAdminService $classrooms) {}

    public function index(Request $request)
    {
        $rows = $this->classrooms->list($request->query());

        return response()->json([
            'success' => true,
            'classrooms' => $rows->through(fn (Classroom $c) => ClassroomAdminService::serialize($c)),
            'counts' => [
                'all' => Classroom::count(),
                'active' => Classroom::where('status', Classroom::STATUS_ACTIVE)->count(),
                'archived' => Classroom::where('status', Classroom::STATUS_ARCHIVED)->count(),
            ],
        ]);
    }

    public function show(int $id)
    {
        try {
            $classroom = $this->classrooms->find($id);
        } catch (DomainException) {
            abort(404);
        }

        return response()->json(['success' => true, ...$this->classrooms->detail($classroom)]);
    }
}
