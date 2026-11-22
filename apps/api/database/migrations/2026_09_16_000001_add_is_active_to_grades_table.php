<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Dormant-grade isolation, server side (docs/ALGERIA_MIGRATION_AUDIT.md §15).
//
// The single authority for "which grades are active" is
// packages/core/curriculum/activeGrades.js (ACTIVE_GRADE_IDS). It reaches the
// database through the same handshake as the rest of the catalogue:
// exportCurriculum.mjs writes `active` per grade, `php artisan
// smarter:import-curriculum` mirrors it here. ContentAccess reads THIS flag,
// so the API and the frontend can never disagree unless the import is stale
// — and `smarter:registry-health` reports exactly that drift.
//
// Default FALSE: an unknown or freshly-created grade is closed until the
// import says otherwise. Closing is the safe failure mode for isolation.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            $table->boolean('is_active')->default(false)->after('order');
        });
    }

    public function down(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });
    }
};
