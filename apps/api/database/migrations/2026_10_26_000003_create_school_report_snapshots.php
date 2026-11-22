<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * « التقارير » — un rapport de l'établissement est FIGÉ au moment où le
 * directeur le génère (SCHOOL_ADMIN_SPACE.md, phase 5) : ce qu'on imprime ou
 * projette en conseil est ce qui était vrai ce jour-là, et ne bouge plus.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_report_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            // student | class | grade | school_term | teachers
            $table->string('type', 24);
            // L'élève, la classe (id) ou le niveau (code) visé, selon le type.
            $table->string('scope', 32)->nullable();
            $table->foreignId('term_id')->nullable()->constrained('school_terms')->nullOnDelete();
            $table->string('title');
            $table->json('payload');
            $table->unsignedSmallInteger('schema_version')->default(1);
            $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('generated_at');
            $table->timestamps();

            $table->index(['school_id', 'generated_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_report_snapshots');
    }
};
