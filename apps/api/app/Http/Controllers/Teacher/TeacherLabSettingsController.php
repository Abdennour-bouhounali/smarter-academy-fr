<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\TeacherLabSetting;
use Illuminate\Http\Request;

/**
 * Les questions PENDANT les labos, pour le compte de l'ENSEIGNANT seulement (LabCheckpoint, 2026-10-28). Les élèves les ont TOUJOURS.
 *  GET   /teacher/labs/{lessonCode}    → { checkpointsOff: ["<module>:<type>", …] }
 *  PATCH /teacher/labs/{lessonCode}    { lab: "<module>:<type>", checkpoints: bool } → { checkpointsOff }
 */
class TeacherLabSettingsController extends Controller
{
    public const LAB_KEY = '/^[a-z0-9-]{1,60}:[a-z0-9-]{1,60}$/';

    public function show(Request $request, string $lessonCode)
    {
        $lesson = Lesson::where('code', $lessonCode)->firstOrFail();
        $row = TeacherLabSetting::where('user_id', $request->user()->id)->where('lesson_id', $lesson->id)->first();

        return response()->json(['success' => true, 'checkpointsOff' => array_values($row?->checkpoints_off ?? [])]);
    }

    public function update(Request $request, string $lessonCode)
    {
        $lesson = Lesson::where('code', $lessonCode)->firstOrFail();
        $validated = $request->validate([
            'lab' => ['required', 'string', 'max:121', 'regex:'.self::LAB_KEY],
            'checkpoints' => ['required', 'boolean'],
        ]);

        $row = TeacherLabSetting::firstOrNew(['user_id' => $request->user()->id, 'lesson_id' => $lesson->id]);
        $off = array_values(array_diff($row->checkpoints_off ?? [], [$validated['lab']]));
        if (! $validated['checkpoints']) {
            $off[] = $validated['lab'];
        }
        sort($off);
        $row->checkpoints_off = $off;
        $row->save();

        return response()->json(['success' => true, 'checkpointsOff' => $off]);
    }
}
