<?php

/**
 * ONE-OFF — put EVERY student account into the class whose join code is given.
 *
 *     php scripts/assign-students-to-class.php AL5XBD            # dry run (default)
 *     php scripts/assign-students-to-class.php AL5XBD --apply    # write
 *
 * Run from apps/api. A student already in ANOTHER active class is moved: that
 * membership becomes `left` (history kept). Seat capacity is NOT checked.
 * Consent is left empty: each student confirms it in-app on next open.
 * Delete this file once used.
 */

use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$code = strtoupper(trim($argv[1] ?? ''));
$apply = in_array('--apply', $argv, true);
if ($code === '') {
    fwrite(STDERR, "Usage: php scripts/assign-students-to-class.php <JOIN_CODE> [--apply]\n");
    exit(1);
}

$classroom = Classroom::where('join_code', $code)->first();
if ($classroom === null) {
    fwrite(STDERR, "No class with join code {$code}.\n");
    exit(1);
}
echo ($apply ? '[APPLY]' : '[DRY RUN]')." class #{$classroom->id} \"{$classroom->name}\" (status: {$classroom->status})\n";
if (! $classroom->isActive()) {
    fwrite(STDERR, "The class is not active — aborting.\n");
    exit(1);
}

$already = $moved = $added = 0;

DB::transaction(function () use ($classroom, $apply, &$already, &$moved, &$added) {
    User::where('role', User::ROLE_STUDENT)->orderBy('id')->each(function (User $s) use ($classroom, $apply, &$already, &$moved, &$added) {
        $existing = ClassroomMembership::where('classroom_id', $classroom->id)->where('student_id', $s->id)->first();
        if ($existing !== null && $existing->isActive()) {
            $already++;

            return;
        }

        $others = ClassroomMembership::where('student_id', $s->id)->active()
            ->where('classroom_id', '!=', $classroom->id)->get();
        foreach ($others as $m) {
            echo "  #{$s->id} {$s->email}: leaves class #{$m->classroom_id}\n";
            $moved++;
            if ($apply) {
                $m->forceFill(['status' => ClassroomMembership::STATUS_LEFT, 'left_at' => Carbon::now()])->save();
            }
        }

        echo "  #{$s->id} {$s->email}: joins\n";
        $added++;
        if ($apply) {
            $m = $existing ?? new ClassroomMembership;
            $m->classroom_id = $classroom->id;
            $m->student_id = $s->id;
            $m->forceFill([
                'status' => ClassroomMembership::STATUS_ACTIVE,
                'joined_at' => Carbon::now(),
                'left_at' => null,
                'joined_via' => ClassroomMembership::VIA_JOIN_CODE,
                'removed_by' => null,
            ])->save();
        }
    });
});

echo "Done: {$added} added, {$moved} old memberships closed, {$already} already in the class.\n";
if (! $apply) {
    echo "Dry run only — re-run with --apply to write.\n";
}
