<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// The curriculum export has always emitted grades[].order; the table simply
// never had the column, so display order was silently dropped on import.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            $table->unsignedSmallInteger('order')->default(0)->after('level');
        });
    }

    public function down(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            $table->dropColumn('order');
        });
    }
};
